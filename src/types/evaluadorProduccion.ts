// Tipos del rol Evaluador de Producción.
//
// Reflejan exactamente lo que devuelve `EvaluadorProduccionController`. Si el backend cambia la
// forma de una respuesta, este archivo es el único sitio que hay que tocar en el frontend.

/** Estado del aval de una producción entendida como unidad, no de cada archivo suelto. */
export type EstadoProduccion = "pendiente" | "aprobado" | "rechazado" | "sin_documento";

/**
 * Un enlace donde consultar la producción.
 *
 * `tipo` separa lo que el docente afirmó de lo que dedujo el sistema, y la interfaz **no debe
 * mezclarlos**: un enlace `directo` resuelve la publicación exacta; uno `derivado` es una
 * búsqueda que puede no acertar. Presentarlos juntos haría que un resultado de Google Scholar
 * pase por una verificación.
 */
export type EnlaceConsulta = {
  fuente: string;
  tipo: "directo" | "derivado";
  url: string | null;
  /** Si es `false`, falta el identificador que lo construye y `motivo` dice cuál. */
  disponible: boolean;
  /** Con qué se armó el enlace: "por DOI", "por ISSN 2145-9088", "por título exacto". */
  criterio: string | null;
  /** Por qué no se pudo construir: "Sin DOI registrado". */
  motivo: string | null;
};

export type DocenteResumen = {
  id: number;
  nombre_completo: string;
  numero_identificacion: string | null;
  email: string | null;
};

/** Una producción tal como la pintan la bandeja y el expediente. */
export type ProduccionFila = {
  id_produccion_academica: number;
  titulo: string;
  medio_divulgacion: string | null;
  fecha_divulgacion: string | null;
  numero_autores: number | null;
  registrada_en: string | null;

  doi: string | null;
  issn_isbn: string | null;
  url_publicacion: string | null;
  /** Hay DOI o URL: la producción se puede verificar sin buscar a ciegas por título. */
  tiene_enlace_directo: boolean;

  producto_academico: string | null;
  ambito_divulgacion: string | null;
  /** Puntaje de escalafón que otorga el ámbito si la producción se avala. */
  puntaje: number;

  estado: EstadoProduccion;
  /**
   * Estado ya decidido pero sin revisor: lo aprobó Apoyo Profesoral antes del traslado del aval.
   * Se muestra como «aval anterior al cambio», ni verde ni ámbar, porque no es decisión de este rol.
   */
  es_decision_historica: boolean;
  motivo_rechazo: string | null;
  revisado_en: string | null;
  revisado_por: { id: number; nombre: string } | null;

  docente: DocenteResumen | null;
};

export type DocumentoProduccion = {
  id_documento: number;
  archivo: string;
  archivo_url: string | null;
  estado: string;
  motivo_rechazo: string | null;
  cargado_en: string | null;
  revisado_en: string | null;
};

/**
 * Qué le pasa al escalafón del docente con esta decisión.
 *
 * Es el dato del aviso que encabeza la ficha, y la razón por la que el evaluador puede decidir
 * con criterio: hasta ahora quien aprobaba no tenía forma de saber cuántos puntos concedía.
 */
export type ImpactoEscalafon = {
  puntaje_actual: number;
  otorga: number;
  puntaje_si_avala: number;
  puntaje_si_revierte: number;
};

/** La ficha completa: `GET /evaluadorProduccion/producciones/{id}`. */
export type ProduccionFicha = ProduccionFila & {
  documentos: DocumentoProduccion[];
  enlaces_consulta: EnlaceConsulta[];
  impacto_escalafon: ImpactoEscalafon;
};

/** Contadores de la cabecera de la bandeja: `GET /evaluadorProduccion/resumen`. */
export type ResumenBandeja = {
  pendientes: number;
  avaladas_mes: number;
  rechazadas_mes: number;
  sin_enlace: number;
  total: number;
};

/** `GET /evaluadorProduccion/docentes/{userId}/producciones`. */
export type ExpedienteDocente = {
  docente: DocenteResumen;
  producciones: ProduccionFila[];
  resumen: {
    /** Lo que suma hoy en el escalafón: solo las avaladas. */
    puntaje_avalado: number;
    /** Lo que sumaría si todo lo registrado estuviera avalado. */
    puntaje_declarado: number;
    avaladas: number;
    pendientes: number;
    rechazadas: number;
  };
  /** Aviso, nunca bloqueo: títulos casi iguales del mismo año y el mismo docente. */
  posibles_duplicados: { titulos: string[]; anio: string }[];
};

/** Filtros de la bandeja, tal como viajan en la query string. */
export type FiltrosBandeja = {
  estado?: "pendiente" | "aprobado" | "rechazado" | "";
  producto?: number | "";
  ambito?: number | "";
  docente?: number | "";
  desde?: string;
  hasta?: string;
  sin_enlace?: boolean;
  q?: string;
};
