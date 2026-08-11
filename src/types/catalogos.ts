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
