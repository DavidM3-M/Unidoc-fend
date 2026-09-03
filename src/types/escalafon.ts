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
  /**
   * Mismo cálculo que `puntaje_total` contando además la producción cuyo documento sigue en
   * revisión. Nunca menor que él, y cuando no hay nada pendiente llega el mismo número —no
   * `null`—, así que la resta entre ambos es directamente "lo que falta por avalar".
   *
   * Un documento rechazado no cuenta aquí tampoco: pendiente es pendiente, no descartado.
   */
  puntaje_declarado: number;
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
  /**
   * El Administrador editó este tramo a mano.
   *
   * Importa aunque el rol que mira no pueda corregir: un tramo corregido ya no es exactamente lo
   * que produjo el acto original, y quien evalúa el expediente tiene derecho a saberlo. El
   * detalle de qué cambió está en la bitácora.
   */
  corregido?: boolean;
};

/** Lo que la bitácora retrata de un tramo: solo lo que el Administrador puede haber cambiado. */
export type RetratoTramo = {
  escalon_id?: number | null;
  escalon?: string | null;
  desde?: string | null;
  hasta?: string | null;
  via?: string | null;
  periodo_ascenso_id?: number | null;
};

/**
 * Una intervención manual del Administrador sobre el historial.
 *
 * Vive en una tabla aparte y no en el propio tramo porque un tramo puede corregirse varias veces
 * y solo sobreviviría la última. Los ascensos y las reversiones **no** salen aquí: van firmados
 * en el propio tramo y los devuelve el detalle del docente.
 */
export type BitacoraEscalafon = {
  id_bitacora: number;
  /** `null` si el tramo se borró después; el retrato sigue diciendo qué había. */
  historial_escalon_id: number | null;
  tipo_modificacion: "creacion" | "actualizacion";
  /** `null` en la creación: no hay estado anterior que retratar. */
  datos_anteriores: RetratoTramo | null;
  datos_nuevos: RetratoTramo | null;
  motivo: string;
  modificado_por: string | null;
  fecha: string | null;
};

/** Un valor antes y después de una corrección. */
export type Delta<T> = { antes: T; despues: T };

/**
 * Lo que movió una corrección.
 *
 * Se muestra siempre, no solo cuando sorprende: las consecuencias de mover una fecha no son
 * evidentes desde el formulario. Adelantar `desde` descarta producción académica que hasta ese
 * momento puntuaba, y retrasarlo puede no dar ni un mes de antigüedad, porque el motor
 * **intersecta** los tramos del historial con la experiencia uniautónoma documentada en vez de
 * quedarse con el historial.
 */
export type RespuestaCorreccion = {
  tramo: HistorialEscalon;
  escalon_vigente: string | null;
  impacto: {
    escalon_vigente: Delta<string | null>;
    meses_en_escalon: Delta<number>;
    puntaje_total: Delta<number>;
    /**
     * Corte contra el que están medidas las tres cifras: el mismo que usa el resto de la pantalla
     * —el periodo vigente, o el último que cerró—, no «ahora mismo». Sin decirlo, un «3 meses»
     * medido a hoy contradiría al «4 meses» de la barra de arriba medido al cierre, y los dos
     * números serían correctos.
     */
    fecha_corte: string | null;
  };
  historial: HistorialEscalon[];
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
