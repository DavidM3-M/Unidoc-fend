import { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosConfig";
import type { EscalonDocente } from "../types/catalogos";

const ENDPOINT = "/constantes/escalones-docente";

/**
 * Puntaje de producción que exige un escalón, leído del catálogo y no de la evaluación.
 *
 * El motor solo manda el requisito dentro de `faltantes`, y `faltantes` únicamente trae lo que el
 * docente **no** cumple. Es la fuente correcta para redactar qué falta, pero es una fuente pésima
 * para dibujar una barra: en cuanto el criterio se cumple el número desaparece, la barra se queda
 * sin denominador y `BarraProgreso` la pinta llena —sin `/ N` y sin tramo rayado— justo cuando el
 * docente tiene producción esperando aval. El catálogo, en cambio, siempre tiene el número.
 *
 * Devuelve `null` cuando no hay escalón objetivo (el docente ya está en la categoría más alta) o
 * cuando ese escalón no exige puntaje: ahí la barra sin meta sí es lo correcto.
 */

/**
 * El catálogo es la misma tabla para toda la sesión y hay dos pantallas que lo piden. Se cachea la
 * promesa —no el resultado— para que dos componentes montados a la vez compartan una sola
 * petición en vuelo. Si falla se limpia, así el siguiente montaje reintenta en lugar de quedarse
 * con una lista vacía para siempre.
 */
let enVuelo: Promise<EscalonDocente[]> | null = null;

const obtenerEscalones = (): Promise<EscalonDocente[]> => {
  if (!enVuelo) {
    enVuelo = axiosInstance
      .get(ENDPOINT)
      .then((respuesta) => respuesta.data?.escalones_docente ?? [])
      .catch((error) => {
        console.error("Error al obtener los escalones del escalafón:", error);
        enVuelo = null;
        return [];
      });
  }

  return enVuelo;
};

export const usePuntajeMinimoEscalon = (
  escalonObjetivo?: string | null
): number | null => {
  const [minimo, setMinimo] = useState<number | null>(null);

  useEffect(() => {
    if (!escalonObjetivo) {
      setMinimo(null);
      return;
    }

    // El componente puede desmontarse —o cambiar de objetivo tras un ascenso— antes de que
    // responda el catálogo: sin esta bandera se escribiría la meta del escalón anterior.
    let vigente = true;

    obtenerEscalones().then((escalones) => {
      if (!vigente) return;
      const escalon = escalones.find((item) => item.nombre === escalonObjetivo);
      setMinimo(escalon?.puntaje_minimo ?? null);
    });

    return () => {
      vigente = false;
    };
  }, [escalonObjetivo]);

  return minimo;
};
