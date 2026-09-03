import { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosConfig";
import Cookies from "js-cookie";
import {
  EllipsisVerticalIcon,
  PlusIcon,
  EnvelopeIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import AptitudesCarga from "../../componentes/formularios/AptitudesCarga";
import { TooltipRazonPuntaje } from "../../componentes/formularios/puntaje";
import { TooltipEvaluacion } from "../../componentes/formularios/evaluacion";
import { BarraProgreso } from "../../componentes/formularios/BarraProgreso";
import CategoriasEscalafon from "../../componentes/formularios/CategoriasEscalafon";
import { RolesValidos } from "../../types/roles";
import { EvaluacionAsignada } from "../../types/evaluacionDocente";
import type { EvaluacionEscalafon, PeriodoAscenso } from "../../types/escalafon";
import { fechaLarga } from "../../utils/fechas";
import { useTrayectoriaActualizada } from "../../hooks/useTrayectoriaActualizada";
import { usePuntajeMinimoEscalon } from "../../hooks/usePuntajeMinimoEscalon";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import AgregarAptitudes from "../agregar/AgregarAptitudes";
import EditarAptitud from "../editar/aptitud/pre-aptitud";
import CustomDialog from "../../componentes/CustomDialogForm";

const InformacionPersonalDocente = () => {

  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);

  const token = Cookies.get("token");
  if (!token) throw new Error("No authentication token found");
  const decoded = jwtDecode<{ rol: RolesValidos }>(token);
  const rol = decoded.rol;

  const [openAdd, setOpenAdd] = useState(false); // modal para agregar aptitudes
  const [openEdit, setOpenEdit] = useState(false); // modal para editar aptitudes
  const [openCategorias, setOpenCategorias] = useState(false); // modal con las categorías del escalafón

  const [datos, setDatos] = useState<any>();
  const [municipio, setMunicipio] = useState<any>([]);
  const [aptitudes, setAptitudes] = useState<any[]>([]);
  const [evaluacion, setEvaluacion] = useState<EvaluacionAsignada | null>(null); // Evaluación asignada por Apoyo Profesoral

  /**
   * Evaluación del expediente contra el escalón objetivo.
   *
   * El endpoint ya no otorga categorías: solo informa si el docente es elegible. Quien asciende
   * es Apoyo Profesoral, así que nada de esta sección debe sugerir que el ascenso ocurre solo.
   */
  const [escalafon, setEscalafon] = useState<EvaluacionEscalafon | null>(null);

  /** Periodo anunciado. Puede venir `null` entre un periodo y el siguiente: es normal. */
  const [periodoVigente, setPeriodoVigente] = useState<PeriodoAscenso | null>(null);

  /**
   * Tipo de contrato del docente ("Planta" | "Ocasional" | "Cátedra").
   *
   * El escalafón docente solo aplica a Planta: a Ocasional y Cátedra no se les mide antigüedad
   * por escalón, así que la sección ni siquiera debería insinuar que tienen una.
   */
  const [tipoContrato, setTipoContrato] = useState<string | null>(null);

  /** Escalón vigente del docente. Vacío mientras Apoyo Profesoral no lo registre en el escalafón. */
  const categoria = escalafon?.escalon_vigente ?? "";

  /**
   * Meta de un criterio, tal como la devuelve el motor.
   *
   * `faltantes` solo trae lo que NO se cumple, así que un criterio ausente ya está cumplido y su
   * barra se dibuja sin meta, en vez de inventarse un máximo que no corresponde a ninguna regla.
   */
  const metaDe = (campo: string): number | null => {
    const item = escalafon?.faltantes?.find((f) => f?.campo === campo);
    const requerido = Number(item?.requerido);
    // Se exige `> 0` y no solo finito: hay criterios que llegan con `requerido: null`
    // —`produccion_academica` y `formacion`, a propósito— y `Number(null)` es 0, que colaba
    // como meta válida y dejaba la barra sin dibujar ningún tramo.
    return Number.isFinite(requerido) && requerido > 0 ? requerido : null;
  };

  const handleApitudAgregada = () => {
    fetchAptitudes();
    setOpenAdd(false); // cierra el modal
  };
  // Obtener imagen de perfil
  const fetchProfileImage = async () => {
    try {
      const ENDPOINTS = {
        Aspirante: import.meta.env.VITE_ENDPOINT_OBTENER_FOTO_PERFIL_ASPIRANTE,
        Docente: import.meta.env.VITE_ENDPOINT_OBTENER_FOTO_PERFIL_DOCENTE,
        Administrativo: import.meta.env.VITE_ENDPOINT_OBTENER_FOTO_PERFIL_DOCENTE,
      };
      const endpoint = ENDPOINTS[rol];
      const response = await axiosInstance.get(endpoint);

      const documentos = response.data.fotoPerfil?.documentos_foto_perfil;

      if (documentos && documentos.length > 0) {
        const imageUrl = documentos[0].archivo_url;
        setProfileImageUrl(imageUrl);
      }
    } catch (error) {
      console.error("Error al obtener la imagen de perfil:", error);
    }
  };

  // Evaluación del escalafón: informa elegibilidad, no otorga categoría
  const fetchPuntaje = async () => {
    try {
      // 1. Verificar autenticación y rol
      const token = Cookies.get("token");
      if (!token) {
        return;
      }

      const decoded = jwtDecode<{ rol: string }>(token);
      if (decoded.rol !== "Docente") {
        console.log(
          `Usuario con rol ${decoded.rol} no requiere puntaje, omitiendo petición`
        );
        return;
      }

      // 2. Hacer la petición
      const response = await axiosInstance.get(
        import.meta.env.VITE_ENDPOINT_EVALUAR_PUNTAJE
      );

      // 3. Procesar respuesta. `escalon_vigente: null` no es un error: significa que Apoyo
      //    Profesoral todavía no registró la categoría inicial, y `razon` ya lo explica.
      setEscalafon(response.data?.resultado ?? null);
    } catch (error) {
      // 4. Manejo de errores específico
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 403) {
          console.log("Acceso no autorizado para obtener puntaje");
        } else {
          console.error("Error al obtener el puntaje:", error.message);
        }
      } else {
        console.error("Error desconocido al obtener puntaje:", error);
      }

      setEscalafon(null);
    }
  };

  /**
   * Periodo de ascenso anunciado.
   *
   * Devuelve `null` entre un periodo y el siguiente. Es normal, no un fallo: el docente sigue
   * subiendo documentos igual, solo que aún no hay una fecha de corte publicada.
   */
  const fetchPeriodoVigente = async () => {
    try {
      const token = Cookies.get("token");
      if (!token) return;

      const decoded = jwtDecode<{ rol: string }>(token);
      if (decoded.rol !== "Docente") return;

      const response = await axiosInstance.get(
        import.meta.env.VITE_ENDPOINT_PERIODO_ASCENSO_VIGENTE
      );

      setPeriodoVigente(response.data?.periodo_ascenso ?? null);
    } catch (error) {
      console.error("Error al obtener el periodo de ascenso vigente:", error);
      setPeriodoVigente(null);
    }
  };

  // Tipo de contrato: gatea la sección de escalafón, que solo aplica a Planta.
  const fetchContratacion = async () => {
    try {
      const token = Cookies.get("token");
      if (!token) return;

      const decoded = jwtDecode<{ rol: string }>(token);
      if (decoded.rol !== "Docente") return;

      const response = await axiosInstance.get("/docente/ver-contratacion");
      setTipoContrato(response.data?.contrataciones?.[0]?.tipo_contrato ?? null);
    } catch (error) {
      // 404 = todavía no tiene una contratación registrada; no es un fallo que valga reportar.
      const status = axios.isAxiosError(error) ? error.response?.status : undefined;
      if (status !== 404) {
        console.error("Error al obtener el tipo de contrato:", error);
      }
      setTipoContrato(null);
    }
  };

  // Obtener datos del usuario
  const fetchDatos = async () => {
    try {
      const response = await axiosInstance.get(
        "/auth/obtener-usuario-autenticado"
      );

      const user = response.data.user;
      setDatos(user);

      if (user.municipio_id) {
        try {
          const responseMunicipio = await axiosInstance.get(
            `/ubicaciones/municipio/${user.municipio_id}`
          );
          setMunicipio(responseMunicipio.data);
        } catch (municipioError) {
          console.error("Error al obtener el municipio:");
        }
      }
    } catch (error) {
      console.error("Error al obtener los datos del docente:", error);
    } finally {
    }
  };

  // Obtener aptitudes
  const fetchAptitudes = async () => {
    try {
      // 1. Cargar desde caché
      const cached = sessionStorage.getItem("aptitudes");
      if (cached) {
        setAptitudes(JSON.parse(cached));
      }

      // 2. Endpoints según rol
      const ENDPOINTS = {
        Aspirante: import.meta.env.VITE_ENDPOINT_OBTENER_APTITUDES_ASPIRANTE,
        Docente: import.meta.env.VITE_ENDPOINT_OBTENER_APTITUDES_DOCENTE,
        Administrativo: import.meta.env.VITE_ENDPOINT_OBTENER_APTITUDES_DOCENTE,
      };

      const endpoint = ENDPOINTS[rol];

      // 3. Llamada a la API
      const response = await axiosInstance.get(endpoint);

      // 4. Guardar en estado + caché si hay datos
      if (response.data?.aptitudes) {
        setAptitudes(response.data.aptitudes);
        sessionStorage.setItem(
          "aptitudes",
          JSON.stringify(response.data.aptitudes)
        );
      }
    } catch (error) {
      console.error("Error al obtener aptitudes:", error);

      // 5. Si falla la API, usar el caché (si existe)
      const cached = sessionStorage.getItem("aptitudes");
      if (cached) {
        setAptitudes(JSON.parse(cached));
      }
    }
  };

  // Obtener la evaluación asignada (solo lectura: la asigna Apoyo Profesoral)
  const fetchEvaluacion = async () => {
    try {
      // Verificar si el usuario es docente antes de hacer la petición
      const token = Cookies.get("token");
      if (!token) throw new Error("No autenticado");

      const decoded = jwtDecode<{ rol: string }>(token);
      if (decoded.rol !== "Docente") {
        return; // No hacer la petición si no es docente
      }

      const endpoint = import.meta.env.VITE_ENDPOINT_OBTENER_EVALUACIONES_DOCENTE;
      const response = await axiosInstance.get(endpoint);

      setEvaluacion(response.data.data ?? null);
    } catch (error) {
      // 404 = todavía no le han asignado evaluación; 403 = el rol no la consulta.
      // Ninguno de los dos es un fallo que valga la pena reportar.
      const status = axios.isAxiosError(error) ? error.response?.status : undefined;
      if (status === 404 || status === 403) {
        setEvaluacion(null);
        return;
      }

      console.error("Error al obtener la evaluación:", error);
    }
  };

  // Cargar datos al iniciar el componente
  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([
          fetchAptitudes(),
          fetchProfileImage(),
          fetchDatos(),
          fetchEvaluacion(),
          fetchPuntaje(),
          fetchPeriodoVigente(),
          fetchContratacion(),
        ]);
      } catch (error) {
        console.error("Error al cargar los datos:", error);
      }
    };

    fetchData();
  }, []);

  /**
   * Las tarjetas de Formación viven en la misma página, así que agregar una experiencia o una
   * producción cambia el expediente sin desmontar esta tarjeta: el `useEffect` de arriba nunca
   * se vuelve a ejecutar. Sin esta suscripcion la barra de antigüedad y la de puntaje se
   * quedaban con el valor de la carga inicial hasta recargar la página.
   *
   * Se vuelve a pedir la evaluación junto con el escalafón porque su barra sale del mismo
   * bloque y ambas deben contar la misma historia.
   */
  useTrayectoriaActualizada(() => {
    fetchPuntaje();
    fetchEvaluacion();
  });

  /**
   * Meta de puntaje del escalón objetivo.
   *
   * Se prefiere la del motor —es la que se está evaluando— y se cae al catálogo cuando ya no
   * viene, que es siempre que el criterio está cumplido. Sin este respaldo la barra se queda sin
   * denominador y deja de dibujar tramos: ni el sólido ni el rayado de lo que espera aval.
   */
  const puntajeMinimoObjetivo = usePuntajeMinimoEscalon(escalafon?.escalon_objetivo);
  const metaPuntaje = metaDe("puntaje") ?? puntajeMinimoObjetivo;


  if (!datos) {
    return (
      <div className="flex flex-col items-center justify-center h-64 w-full bg-white rounded-lg shadow-sm p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1e3a5f] mb-4"></div>
        <p className="text-[#1e3a5f] font-medium">
          Cargando datos personales...
        </p>
        <p className="text-[#6b7a8d] text-sm mt-2">
          Por favor espere un momento
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col w-full rounded-md lg:w-[800px] xl:w-[1000px] 2xl:w-[1200px] m-auto relative">
        {/* ============================================================
            Split de identidad: quién eres a la izquierda, qué haces a la
            derecha. En pantallas estrechas el panel se apila encima.
            ============================================================ */}
        <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] bg-white rounded-xl overflow-hidden shadow-sm">

          {/* ---------------- Panel de identidad ---------------- */}
          <aside className="bg-gradient-to-b from-[#1e3a5f] to-[#152a45] p-5 sm:p-8 flex flex-col items-start gap-1">
            <div className="size-20 rounded-full overflow-hidden border-[3px] border-[#c89b14] shadow-lg mb-4">
              <img
                className="w-full h-full object-cover"
                src={
                  profileImageUrl ||
                  "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
                }
                alt="Foto de perfil"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";
                }}
              />
            </div>

            {/* line-clamp: los nombres completos con dos apellidos desbordaban la columna. */}
            <h3 className="text-white font-bold text-lg leading-snug break-words line-clamp-3">
              {`${datos.primer_nombre} ${datos?.segundo_nombre || ""} ${
                datos.primer_apellido
              } ${datos?.segundo_apellido || ""}`.replace(/\s+/g, " ").trim()}
            </h3>

            <p className="text-white/60 text-sm font-medium">
              {rol === "Docente" && categoria ? `Docente · ${categoria}` : rol}
            </p>

            <hr className="w-full border-white/15 my-5" />

            <div className="flex flex-col gap-4 w-full min-w-0">
              <div className="flex items-start gap-2.5 min-w-0">
                <EnvelopeIcon className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#c89b14]" />
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-white/45">
                    Correo electrónico
                  </p>
                  <p className="text-sm text-white/90 break-all">{datos.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 min-w-0">
                <MapPinIcon className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#c89b14]" />
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-white/45">
                    Ubicación
                  </p>
                  <p className="text-sm text-white/90">
                    {[municipio.municipio_nombre, municipio.departamento_nombre]
                      .filter(Boolean)
                      .join(", ") || "Sin registrar"}
                  </p>
                </div>
              </div>
            </div>
          </aside>

          {/* ---------------- Panel accionable ---------------- */}
          <div className="p-5 sm:p-8 flex flex-col gap-8 min-w-0">

            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="font-bold text-2xl sm:text-3xl text-[#1e3a5f]">
                Hoja de vida
              </h2>

              {/* Secundario, no primario: antes competía en peso con "Agregar aptitudes". */}
              <button
                type="button"
                onClick={() => setOpenEdit(true)}
                aria-label="Editar aptitudes"
                className="flex-shrink-0 grid place-items-center size-10 rounded-lg border-2 border-[#1e3a5f]/20 text-[#1e3a5f] cursor-pointer transition-colors duration-200 hover:bg-[#f2f5f9] hover:border-[#1e3a5f]/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e8740e]"
              >
                <EllipsisVerticalIcon className="w-5 h-5" />
              </button>
            </div>

            {/* ---- Aptitudes ---- */}
            <section className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#6b7a8d]">
                  Aptitudes
                </h3>

                <button
                  type="button"
                  onClick={() => setOpenAdd(true)}
                  className="flex items-center gap-2 font-semibold text-sm bg-[#1e3a5f] border-2 border-[#1e3a5f] rounded-md px-3 py-1.5 text-white cursor-pointer transition-colors duration-200 hover:bg-[#152a45] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e8740e]"
                >
                  Agregar aptitudes
                  <PlusIcon className="w-4 h-4 stroke-[3]" />
                </button>
              </div>

              {aptitudes.length > 0 ? (
                <ul className="flex flex-wrap gap-2">
                  {aptitudes.map((item, index) => (
                    <li key={index}>
                      <AptitudesCarga value={item.nombre_aptitud} />
                    </li>
                  ))}
                </ul>
              ) : (
                /* Sin esto la sección quedaba como un hueco mudo bajo su propio título. */
                <p className="rounded-lg border border-dashed border-[rgba(30,58,95,0.2)] bg-[#f7f8fa] px-4 py-3 text-sm text-[#9aa7b5]">
                  Todavía no has registrado aptitudes.
                </p>
              )}
            </section>

            {/* ---- Progreso en el escalafón ---- */}
            {/* Solo Planta asciende por escalafón: a Ocasional y Cátedra no se les mide
                antigüedad por escalón, así que ni se les muestra la sección. */}
            {rol === "Docente" && tipoContrato === "Planta" && (
              <section className="flex flex-col gap-4 pt-6 border-t border-[rgba(30,58,95,0.09)]">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#6b7a8d]">
                    Escalafón docente
                  </h3>
                  <button
                    type="button"
                    onClick={() => setOpenCategorias(true)}
                    className="text-xs font-semibold text-[#1e3a5f] underline decoration-[rgba(30,58,95,0.3)] hover:decoration-[#e8740e] cursor-pointer"
                  >
                    Ver todas las categorías
                  </button>
                </div>

                {/* Todavía fuera del escalafón: no es un error ni un expediente vacío, es que
                    Apoyo Profesoral no ha registrado la categoría inicial. */}
                {!escalafon?.escalon_vigente ? (
                  <div className="rounded-lg border border-dashed border-[rgba(30,58,95,0.2)] bg-[#f7f8fa] px-4 py-3">
                    <p className="text-sm text-[#2c3e50]">
                      {escalafon?.razon ??
                        "Apoyo Profesoral todavía no ha registrado tu categoría en el escalafón."}
                    </p>
                    <p className="mt-1.5 text-xs text-[#9aa7b5]">
                      Puedes seguir subiendo tus documentos: se tendrán en cuenta desde la fecha
                      en que se registre tu ingreso al escalafón.
                    </p>
                  </div>
                ) : (
                  <>
                    {escalafon.escalon_vigente_desde && (
                      <p className="-mt-2 text-xs text-[#9aa7b5]">
                        {escalafon.escalon_vigente} desde el{" "}
                        {fechaLarga(escalafon.escalon_vigente_desde)}.
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 -mt-1">
                      <p className="text-sm text-[#6b7a8d]">
                        {escalafon.escalon_objetivo ? (
                          <>
                            Siguiente categoría:{" "}
                            <span className="font-semibold text-[#1e3a5f]">
                              {escalafon.escalon_objetivo}
                            </span>
                          </>
                        ) : (
                          <>Ya estás en la categoría más alta del escalafón.</>
                        )}
                      </p>

                      {/* Elegible ≠ ascendido: el ascenso lo ejecuta Apoyo Profesoral. */}
                      {escalafon.elegible && escalafon.escalon_objetivo && (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#bfe0cd] bg-[#eaf6ef] px-2.5 py-0.5 text-xs font-semibold text-[#2f7d54]">
                          Cumples los requisitos
                          {escalafon.via === "excepcion" && " (por excepción)"}
                        </span>
                      )}
                    </div>

                    {escalafon.elegible && escalafon.escalon_objetivo && (
                      <p className="-mt-2 text-xs text-[#9aa7b5]">
                        El ascenso lo ejecuta Apoyo Profesoral al cerrar el periodo; cumplir los
                        requisitos no cambia la categoría por sí solo.
                      </p>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
                      {/* El tramo rayado es la respuesta a "subí la producción y la barra no se
                          movió": los puntos existen, les falta el aval, no se perdieron. */}
                      <BarraProgreso
                        etiqueta="Puntaje"
                        actual={escalafon.puntaje_total ?? 0}
                        requerido={metaPuntaje}
                        pendiente={escalafon.puntaje_declarado}
                        sufijo={metaPuntaje === null ? "puntos" : ""}
                        notaPendiente={`${
                          (escalafon.puntaje_declarado ?? 0) - (escalafon.puntaje_total ?? 0)
                        } puntos pendientes de aprobación`}
                        detalle={
                          <TooltipRazonPuntaje
                            razon={escalafon.razon}
                            faltantes={escalafon.faltantes}
                            escalonObjetivo={escalafon.escalon_objetivo}
                            via={escalafon.via}
                            onVerCategorias={() => setOpenCategorias(true)}
                          />
                        }
                      />

                      {/* Antigüedad en la categoría actual, no en la Universidad: al ascender
                          este contador vuelve a cero. */}
                      <BarraProgreso
                        etiqueta={`Antigüedad como ${escalafon.escalon_vigente}`}
                        actual={escalafon.meses_en_escalon ?? 0}
                        requerido={escalafon.meses_requeridos}
                        pendiente={escalafon.meses_en_escalon_declarados}
                        sufijo={escalafon.meses_requeridos === null ? "meses" : ""}
                        notaPendiente={`${
                          (escalafon.meses_en_escalon_declarados ?? 0) -
                          (escalafon.meses_en_escalon ?? 0)
                        } meses pendientes de aprobación`}
                      />

                      <BarraProgreso
                        etiqueta="Evaluación docente"
                        actual={
                          Number(evaluacion?.promedio_evaluacion_docente) || 0
                        }
                        requerido={metaDe("evaluacion") ?? 5}
                        detalle={<TooltipEvaluacion evaluacion={evaluacion} />}
                      />
                    </div>
                  </>
                )}

                {/* La fecha de corte explica por qué el documento subido ayer todavía no
                    aparece: los requisitos se congelan ahí. */}
                <p className="text-xs text-[#9aa7b5]">
                  {escalafon?.fecha_corte ? (
                    <>
                      Evaluado al {fechaLarga(escalafon.fecha_corte)}
                      {escalafon.periodo_ascenso?.nombre &&
                        ` · ${escalafon.periodo_ascenso.nombre}`}
                      . Lo que subas después cuenta para el periodo siguiente.
                    </>
                  ) : periodoVigente ? (
                    <>
                      {periodoVigente.nombre}: los requisitos se congelan el{" "}
                      {fechaLarga(periodoVigente.fecha_cierre)}.
                    </>
                  ) : (
                    <>
                      Todavía no hay una fecha de corte anunciada. Puedes seguir subiendo
                      documentos cuando quieras.
                    </>
                  )}
                </p>
              </section>
            )}
          </div>
        </div>

        {/* MODAL AGREGAR */}
        <CustomDialog
          title="Agregar Aptitudes"
          open={openAdd}
          onClose={() => setOpenAdd(false)}
        >
          <AgregarAptitudes onSuccess={handleApitudAgregada} />
        </CustomDialog>

        {/* MODAL EDITAR */}
        <CustomDialog
          title="Editar Aptitudes"
          open={openEdit}
          onClose={() => setOpenEdit(false)}
        >
          <EditarAptitud onSuccess={fetchAptitudes} />
        </CustomDialog>

        {/* MODAL CATEGORÍAS DEL ESCALAFÓN */}
        <CustomDialog
          title="Categorías del escalafón docente"
          open={openCategorias}
          onClose={() => setOpenCategorias(false)}
          width="700px"
        >
          <CategoriasEscalafon categoriaActual={categoria} />
        </CustomDialog>
      </div>
    </>
  );
};

export default InformacionPersonalDocente;