// Catálogos que el Administrador puede editar desde la aplicación.
// Antes se sembraban una sola vez (CSV / constantes PHP) y ampliarlos exigía tocar el backend.
//
// Los tres comparten la bandera `activo`: marcarlo en false retira el registro de los
// desplegables del aspirante y del docente sin borrarlo, de modo que lo ya registrado con él
// conserve su referencia. Por eso los listados del Administrador devuelven activos e inactivos,
// mientras que los endpoints públicos filtran por activo.

/** Tipo de producto académico; agrupa a sus ámbitos de divulgación. */
export type ProductoAcademico = {
  id_producto_academico: number;
  nombre_producto_academico: string;
  activo: boolean;
  /**
   * Conteo de ámbitos que cuelgan de él (`withCount` del backend). Es lo que determina si se
   * puede eliminar: con ámbitos asociados el DELETE responde 409.
   */
  ambito_divulgacions_producto_academico_count?: number;
};

/**
 * Ámbito de divulgación: lo que el aspirante escoge realmente al registrar una producción
 * académica (`produccion_academicas.ambito_divulgacion_id`).
 */
export type AmbitoDivulgacion = {
  id_ambito_divulgacion: number;
  nombre_ambito_divulgacion: string;
  producto_academico_id: number;
  activo: boolean;
  /** Puntos que otorga al escalafón docente por cada producción aprobada. Se edita desde
   *  Escalafón docente → Puntajes; aquí solo se muestra. */
  puntaje: number;
  /** Producciones académicas que lo referencian; con al menos una el DELETE responde 409. */
  produccion_academicas_ambito_divulgacion_count?: number;
  /** Relación cargada por el backend en el listado y en crear/actualizar. */
  producto_academico_ambito_divulgacion?: Pick<
    ProductoAcademico,
    "id_producto_academico" | "nombre_producto_academico"
  >;
};

/**
 * Tipo de experiencia profesional.
 *
 * Ojo: `experiencias.tipo_experiencia` y `convocatorias.tipo_experiencia_requerida` guardan el
 * **nombre** como string, no un ID. Por eso renombrar propaga el cambio a esas tablas y el
 * backend informa cuántos registros tocó.
 */
export type TipoExperiencia = {
  id_tipo_experiencia: number;
  nombre_tipo_experiencia: string;
  activo: boolean;
  /** Experiencias que usan este tipo; con al menos una el DELETE responde 409. */
  experiencias_count?: number;
};

/** Registros históricos que el backend renombró al actualizar un tipo de experiencia. */
export type RegistrosRenombrados = {
  experiencias: number;
  convocatorias: number;
};

/**
 * Nivel de formación académica.
 *
 * `nivel_academico` y `nivel_formacion` son texto libre a propósito (decisión del Administrador):
 * no hay lista fija SNIES ni validación cruzada entre ambos. Lo referencian los estudios del
 * docente y los programas de Formación educativa.
 */
export type NivelFormacionAcademica = {
  id_nivel_formacion_academica: number;
  nivel_academico: string;
  nivel_formacion: string;
  /**
   * Jerarquía del escalafón: mayor número, nivel más alto. Un escalón que exige "Maestría" (50)
   * lo cumple también quien tiene "Doctorado" (60). Null = el nivel no participa del escalafón
   * (formación complementaria: diplomado, certificación, curso).
   */
  orden: number | null;
  activo: boolean;
};

/** Institución de educación superior (importada del SNIES o creada a mano). */
export type InstitucionSnies = {
  id_institucion: number;
  codigo_institucion: string | null;
  nombre_institucion: string;
  estado_institucion: string | null;
  caracter_academico: string | null;
  sector: string | null;
};

/**
 * Programa académico ("Formación educativa", Fase 2). Viene de la importación masiva del SNIES
 * (`codigo_snies_programa` presente) o de un alta manual (`codigo_snies_programa` null).
 */
export type ProgramaFormacionEducativa = {
  id_programa: number;
  codigo_snies_programa: string | null;
  nombre_programa: string;
  titulo_otorgado: string | null;
  estado_programa: string;
  modalidad: string | null;
  institucion: InstitucionSnies;
  nivel_formacion_academica: NivelFormacionAcademica;
};

/** Metadatos de paginación del servidor (ver FormacionEducativaController::listar). */
export type PaginacionMeta = {
  total: number;
  pagina_actual: number;
  ultima_pagina: number;
  por_pagina: number;
};

/**
 * Idioma del catálogo administrable (ej. Inglés, Francés).
 *
 * No confundir con el idioma que certifica un aspirante/docente (`idiomas.idioma`, texto libre):
 * todavía no están conectados, esa conexión es una fase posterior.
 */
export type Idioma = {
  id_idioma_catalogo: number;
  nombre_idioma: string;
  activo: boolean;
  /** Exámenes que cuelgan de él; con al menos uno el DELETE responde 409. */
  examenes_count?: number;
};

/**
 * Examen de certificación de idioma con puntaje numérico (IELTS, TOEFL iBT, Cambridge FCE...).
 *
 * `vigencia_meses` en null significa que el certificado no vence (ej. Cambridge).
 */
export type ExamenIdioma = {
  id_examen_idioma: number;
  idioma_catalogo_id: number;
  nombre_examen: string;
  vigencia_meses: number | null;
  activo: boolean;
  rangos_count?: number;
  rangos?: RangoExamenIdioma[];
};

/** Rango de puntaje de un examen y su nivel MCER equivalente (ej. IELTS 5.5–6.5 = B2). */
export type RangoExamenIdioma = {
  id_rango_examen_idioma: number;
  examen_idioma_id: number;
  puntaje_min: number;
  puntaje_max: number;
  nivel_mcer: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
};

/** Nivel MCER usado tanto en Idiomas como en los requisitos del escalafón docente. */
export type NivelMcer = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

/**
 * Escalón del escalafón docente (Auxiliar, Asistente, Asociado, Titular...) con sus requisitos
 * de ascenso. Un campo en `null` significa que ese escalón no exige ese requisito — así se
 * modela el escalón base (ej. Auxiliar), sin ningún requisito propio.
 */
export type EscalonDocente = {
  id_escalon: number;
  nombre: string;
  orden: number;
  formacion_minima: string | null;
  /** Va siempre junto a `nivel_mcer_minimo`: el nivel es ambiguo sin decir de qué idioma. */
  idioma_catalogo_id: number | null;
  nivel_mcer_minimo: NivelMcer | null;
  puntaje_minimo: number | null;
  meses_minimos: number | null;
  /** Evaluación docente mínima (mismo campo que asigna Apoyo Profesoral) que exige este escalón. */
  evaluacion_minima: number | null;
  activo: boolean;
  /** Relación cargada por el backend en listar/crear/actualizar. */
  idioma?: Pick<Idioma, "id_idioma_catalogo" | "nombre_idioma"> | null;
  /** Excepciones que otorgan este escalón como piso; con al menos una el DELETE responde 409. */
  excepciones_count?: number;
};

/**
 * Regla de excepción del escalafón: si el docente cumple la condición, queda como mínimo en
 * `escalon_otorgado_id`, sin importar si cumple el resto de requisitos de ese escalón.
 */
export type ReglaExcepcionEscalon = {
  id_regla_excepcion: number;
  tipo_condicion: "formacion";
  valor_condicion: string;
  escalon_otorgado_id: number;
  activo: boolean;
  escalon_otorgado?: Pick<EscalonDocente, "id_escalon" | "nombre" | "orden">;
};

/** Progreso/resultado de una corrida del importador de programas SNIES. */
export type SniesImportacion = {
  id_importacion: number;
  nombre_archivo: string;
  estado: "pendiente" | "procesando" | "completado" | "fallido";
  total_filas: number | null;
  filas_procesadas: number;
  programas_creados: number;
  programas_actualizados: number;
  niveles_creados: number;
  mensaje_error: string | null;
  iniciado_en: string | null;
  finalizado_en: string | null;
};
