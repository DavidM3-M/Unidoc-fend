/**
 * Vocabulario del escalafón docente v2.
 *
 * Cuatro reglas del reglamento nuevo explican casi todos estos campos, y conviene tenerlas a
 * mano porque la interfaz anterior asumía lo contrario:
 *
 * 1. La antigüedad es **por escalón**, no acumulada en la Universidad. Al ascender vuelve a cero.
 * 2. La producción académica solo puntúa si se divulgó y se subió **dentro de la categoría
 *    actual**. Al ascender el puntaje también arranca en cero.
 * 3. Todo se congela en la `fecha_cierre` del periodo de ascenso. Lo que se sube después cuenta
 *    para el periodo siguiente; los docentes no se postulan ni hay ventana de carga.
 * 4. Ascender es un acto de Apoyo Profesoral. El sistema dice quién es *elegible*; cumplir los
 *    requisitos no cambia la categoría por sí solo. Nada en la UI debe sugerir lo contrario.
 */

/** Criterio del escalafón que el docente todavía no cumple. Array plano: solo hay un objetivo. */
export type FaltanteEscalafon = {
  /**
   * `formacion` · `idioma` · `puntaje` · `antiguedad` · `evaluacion` · `produccion_academica`.
   * Se deja como `string` porque el backend puede añadir criterios sin romper el front.
   */
  campo: string;
  /** Ya redactado en español por el backend: se muestra tal cual, no se traduce. */
  mensaje: string;
  requerido?: string | number | null;
  /** `null` a propósito en `formacion` y `produccion_academica`: no hay número que enseñar. */
  actual?: string | number | null;
};

/**
 * Semáforo de antigüedad. Es el orden de trabajo de la bandeja, no un bloqueo: cualquier
 * documento se puede revisar en cualquier momento.
 */
export type EstadoAntiguedad =
  | "sin_experiencia_suficiente"
  | "por_verificar_experiencia"
  | "antiguedad_cumplida"
  | "elegible";

/** Cómo llega el docente a ser elegible. */
export type ViaAscenso = "requisitos" | "excepcion" | null;

/** Periodo de ascenso: solo nombre y fecha de cierre — no hay fecha de apertura, a propósito. */
export type PeriodoAscenso = {
  id_periodo_ascenso: number;
  nombre: string;
  fecha_cierre: string;
  /** Resuelto por el backend: contempla tanto la fecha vencida como el cierre anticipado. */
  cerrado?: boolean;
};

/**
 * Evaluación del expediente de un docente contra su escalón objetivo.
 *
 * Es el mismo bloque que devuelven `GET /docente/evaluar-puntaje`, cada fila de la bandeja de
 * ascensos y el detalle del docente. Informa; ya no otorga nada.
 */
export type EvaluacionEscalafon = {
  /** `null` = todavía no está en el escalafón. No es un error: `razon` lo explica. */
  escalon_vigente: string | null;
  escalon_vigente_desde: string | null;
  /** `null` = ya está en el escalón más alto. */
  escalon_objetivo: string | null;
  elegible: boolean;
  via: ViaAscenso;
  razon: string | null;
  faltantes: FaltanteEscalafon[];
  /** Meses respaldados por un documento aprobado. */
  meses_en_escalon: number;
  /** Incluye lo declarado que todavía no tiene aprobación. Nunca menor que `meses_en_escalon`. */
  meses_en_escalon_declarados: number;
  /** `null` cuando el escalón objetivo no exige antigüedad. */
  meses_requeridos: number | null;
  estado_antiguedad: EstadoAntiguedad;
  /** Solo la ventana del escalón actual: lo anterior al ingreso no cuenta. */
  puntaje_total: number;
  periodo_ascenso: Pick<PeriodoAscenso, "id_periodo_ascenso" | "nombre"> | null;
  /** Fecha a la que se congelaron los requisitos. */
  fecha_corte: string | null;
};

/** Fila de la bandeja de ascensos: identidad del docente más su evaluación completa. */
export type DocenteEscalafonFila = EvaluacionEscalafon & {
  id: number;
  nombre_completo: string;
  email: string | null;
  numero_identificacion: string | null;
};

/**
 * Tramo del historial de escalón.
 *
 * Los tramos revertidos siguen en la lista y **tienen que verse**: un ascenso que se otorgó y se
 * deshizo es parte del expediente. Se atenúan, no se filtran.
 */
export type HistorialEscalon = {
  id_historial_escalon: number;
  escalon: string;
  desde: string;
  /** `null` = tramo vigente. */
  hasta: string | null;
  via: string | null;
  motivo: string | null;
  otorgado_por: string | null;
  revertido_en: string | null;
  revertido_por: string | null;
  motivo_reversion: string | null;
};

/** Respuesta de `GET /apoyoProfesoral/escalafon/docentes/{userId}`. */
export type DetalleEscalafonDocente = {
  id: number;
  nombre_completo: string;
  email?: string | null;
  numero_identificacion?: string | null;
  evaluacion: EvaluacionEscalafon;
  historial: HistorialEscalon[];
};

/** Etiqueta y explicación de cada estado del semáforo, en el mismo orden en que se trabaja. */
export const ESTADOS_ANTIGUEDAD: Record<
  EstadoAntiguedad,
  { etiqueta: string; significa: string; accion: string }
> = {
  elegible: {
    etiqueta: "Elegible",
    significa: "Cumple todos los requisitos, o entra por excepción",
    accion: "Ejecutar el ascenso",
  },
  antiguedad_cumplida: {
    etiqueta: "Antigüedad cumplida",
    significa: "Los meses respaldados ya alcanzan",
    accion: "Revisar estudio, idioma, producción y evaluación",
  },
  por_verificar_experiencia: {
    etiqueta: "Por verificar experiencia",
    significa: "Con lo declarado alcanza, faltan certificados por aprobar",
    accion: "Revisar la experiencia primero",
  },
  sin_experiencia_suficiente: {
    etiqueta: "Sin experiencia suficiente",
    significa: "Ni contando lo pendiente llega a los meses exigidos",
    accion: "Nada todavía",
  },
};
