import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import axiosInstance from "../utils/axiosConfig";
import type { Notificacion, RespuestaNotificaciones } from "../types/notificaciones";

/**
 * Estado de la campana, compartido por todas las campanas de la pestaña.
 *
 * Cada encabezado pinta la campana dos veces —una junto al botón del menú móvil y otra dentro de
 * la barra de escritorio— porque `md:hidden` esconde con CSS pero monta ambas. Si el hook guardara
 * su estado en cada componente, cada pestaña abriría dos sondeos al minuto y los dos globos rojos
 * podrían mostrar números distintos durante un instante.
 *
 * Por eso el estado vive en el módulo y los componentes se suscriben: una sola petición, un solo
 * número, y marcar una como leída se refleja en las dos campanas a la vez.
 */

/*
 * Cada cuánto se pregunta al servidor mientras la pestaña está a la vista.
 *
 * Eran 60 segundos, y con eso un docente podía tener el rechazo de su documento delante sin verlo
 * durante casi un minuto. No hay conexión push —ni websockets ni SSE—, así que lo que queda es
 * preguntar más seguido y, sobre todo, preguntar en los momentos en los que el usuario vuelve a
 * mirar: al recuperar el foco, al volver de otra pestaña y al cambiar de pantalla.
 *
 * Esos tres disparos son los que hacen que se sienta instantáneo. El intervalo solo cubre el caso
 * de alguien que se queda quieto mirando la misma pantalla, y por eso se dejó tan corto: con la
 * pestaña a la vista, la campana nunca va más de tres segundos por detrás del servidor.
 *
 * Sale caro a propósito: son veinte peticiones por minuto y por pestaña abierta. Se sostiene porque
 * el sondeo se detiene cuando la pestaña deja de verse, y porque la consulta es un `SELECT` con
 * índice sobre las ocho últimas filas del usuario.
 */
const INTERVALO_SONDEO_MS = 3_000;

/**
 * Dos peticiones más juntas que esto se consideran la misma; evita ráfagas al alternar ventanas.
 *
 * Tiene que quedar por debajo del intervalo. Cuando ambos valían 3 000 ms competían entre sí: el
 * temporizador disparaba justo en el límite del antirrebote y algunos sondeos se descartaban solos,
 * de forma intermitente y sin dejar rastro.
 */
const MINIMO_ENTRE_PETICIONES_MS = 1_000;
/** Cuántas caben en el panel desplegable sin volverlo una pantalla completa. */
const LIMITE_PANEL = 8;

type EstadoCampana = {
  notificaciones: Notificacion[];
  noLeidas: number;
  cargando: boolean;
  error: boolean;
};

let estado: EstadoCampana = {
  notificaciones: [],
  noLeidas: 0,
  cargando: true,
  error: false,
};

const suscriptores = new Set<(e: EstadoCampana) => void>();
let temporizador: ReturnType<typeof setInterval> | null = null;
/** Evita que dos campanas montadas a la vez disparen la misma petición. */
let peticionEnCurso: Promise<void> | null = null;
let ultimaPeticion = 0;

const publicar = (parcial: Partial<EstadoCampana>) => {
  estado = { ...estado, ...parcial };
  suscriptores.forEach((s) => s(estado));
};

/**
 * `forzar` salta el antirrebote. Lo usa el clic en la campana: ahí el usuario está esperando ver
 * el resultado, y hacerle esperar tres segundos por una ráfaga que no provocó sería peor.
 */
const cargar = (forzar = false): Promise<void> => {
  if (peticionEnCurso) return peticionEnCurso;

  if (!forzar && Date.now() - ultimaPeticion < MINIMO_ENTRE_PETICIONES_MS) {
    return Promise.resolve();
  }

  ultimaPeticion = Date.now();

  peticionEnCurso = axiosInstance
    .get<RespuestaNotificaciones>("/notificaciones", { params: { limite: LIMITE_PANEL } })
    .then(({ data }) => {
      publicar({
        notificaciones: data.notificaciones ?? [],
        noLeidas: data.no_leidas ?? 0,
        cargando: false,
        error: false,
      });
    })
    .catch(() => {
      // Silencioso a propósito: la campana es accesoria y un fallo de red no debe sacar un toast
      // encima de la pantalla en la que el usuario está trabajando. El panel muestra el error.
      publicar({ cargando: false, error: true });
    })
    .finally(() => {
      peticionEnCurso = null;
    });

  return peticionEnCurso;
};

/** Arranca el intervalo si no hay uno vivo. */
const arrancarSondeo = () => {
  if (temporizador) return;
  temporizador = setInterval(cargar, INTERVALO_SONDEO_MS);
};

const detenerSondeo = () => {
  if (!temporizador) return;
  clearInterval(temporizador);
  temporizador = null;
};

/**
 * Sondear cada tres segundos solo tiene sentido con la pestaña delante.
 *
 * Sin esto, una pestaña olvidada en segundo plano seguiría pidiendo veinte veces por minuto de
 * forma indefinida. Al ocultarse se para el intervalo; al volver se pide una vez de inmediato
 * —que es cuando el usuario mira— y se reanuda.
 */
const alCambiarVisibilidad = () => {
  if (document.visibilityState === "visible") {
    cargar(true);
    arrancarSondeo();
  } else {
    detenerSondeo();
  }
};

/** Recuperar el foco no siempre dispara `visibilitychange`; cubre volver desde otra ventana. */
const alRecuperarFoco = () => {
  if (document.visibilityState === "visible") {
    cargar();
    arrancarSondeo();
  }
};

export const useNotificaciones = () => {
  const [local, setLocal] = useState<EstadoCampana>(estado);
  const montado = useRef(true);

  useEffect(() => {
    montado.current = true;
    const escuchar = (e: EstadoCampana) => {
      if (montado.current) setLocal(e);
    };
    suscriptores.add(escuchar);

    // La primera campana que se monta arranca el sondeo; las demás se enganchan al que ya corre.
    if (suscriptores.size === 1) {
      cargar(true);
      arrancarSondeo();

      document.addEventListener("visibilitychange", alCambiarVisibilidad);
      window.addEventListener("focus", alRecuperarFoco);
    }

    return () => {
      montado.current = false;
      suscriptores.delete(escuchar);
      if (suscriptores.size === 0) {
        detenerSondeo();
        document.removeEventListener("visibilitychange", alCambiarVisibilidad);
        window.removeEventListener("focus", alRecuperarFoco);
      }
    };
  }, []);

  // Cambiar de pantalla es la señal más fiable de que el usuario está activo. Cubre el caso real:
  // Apoyo Profesoral rechaza un documento, el docente navega, y lo ve sin esperar al intervalo.
  const { pathname } = useLocation();
  useEffect(() => {
    cargar();
  }, [pathname]);

  const marcarLeida = useCallback(async (id: string) => {
    const objetivo = estado.notificaciones.find((n) => n.id === id);
    if (!objetivo || objetivo.leida) return;

    // Optimista: el usuario acaba de hacer clic y esperar la respuesta para apagar el punto azul
    // se siente como que el clic no registró.
    publicar({
      notificaciones: estado.notificaciones.map((n) => (n.id === id ? { ...n, leida: true } : n)),
      noLeidas: Math.max(0, estado.noLeidas - 1),
    });

    try {
      await axiosInstance.put(`/notificaciones/${id}/leer`);
    } catch {
      cargar();
    }
  }, []);

  const marcarTodasLeidas = useCallback(async () => {
    if (estado.noLeidas === 0) return;

    publicar({
      notificaciones: estado.notificaciones.map((n) => ({ ...n, leida: true })),
      noLeidas: 0,
    });

    try {
      await axiosInstance.put("/notificaciones/leer-todas");
    } catch {
      cargar();
    }
  }, []);

  return {
    notificaciones: local.notificaciones,
    noLeidas: local.noLeidas,
    cargando: local.cargando,
    error: local.error,
    recargar: () => cargar(true),
    marcarLeida,
    marcarTodasLeidas,
  };
};
