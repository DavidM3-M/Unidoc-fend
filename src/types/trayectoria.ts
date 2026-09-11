/** Registros de trayectoria que devuelve la API del aspirante/docente. */
export type DocumentoTrayectoria = { id_documento: number; archivo: string; archivo_url?: string; estado: string; motivo_rechazo?: string | null };
export type AptitudRegistro = { id_aptitud: number; nombre_aptitud: string; descripcion_aptitud: string };
export type EstudioRegistro = {
  id_estudio: number; tipo_estudio: string; titulo_estudio: string; institucion: string;
  graduado: string; titulo_convalidado?: string; fecha_inicio: string;
  fecha_fin?: string | null; fecha_graduacion?: string | null; posible_fecha_graduacion?: string | null;
  fecha_convalidacion?: string | null; resolucion_convalidacion?: string | null; es_certificado?: boolean;
  nivel_formacion_academica_id?: number; programa_formacion_educativa_id?: number;
  documentos_estudio?: DocumentoTrayectoria[];
};
export type ExperienciaRegistro = {
  id_experiencia?: number; tipo_experiencia: string; institucion_experiencia: string; cargo: string;
  fecha_inicio: string; fecha_finalizacion?: string | null; fecha_expedicion_certificado?: string | null;
  intensidad_horaria: number; meses_trabajados?: number | null; trabajo_actual?: string;
  experiencia_universidad?: string; es_uniautonoma?: boolean;
  documentos_experiencia?: DocumentoTrayectoria[];
};
export type IdiomaRegistro = {
  id_idioma: number; idioma: string; institucion_idioma: string; nivel: string; fecha_certificado: string;
  idioma_catalogo_id?: number; examen_idioma_id?: number; puntaje_obtenido?: number;
  nivel_calculado?: boolean; fecha_vencimiento?: string | null; vigencia_meses?: number;
  examen_idioma?: { vigencia_meses?: number | null };
  documentos_idioma?: DocumentoTrayectoria[];
};
export type ProduccionRegistro = {
  id_produccion_academica: number; titulo: string; medio_divulgacion: string; fecha_divulgacion: string;
  numero_autores: number; ambito_divulgacion_id: number; created_at?: string;
  nombre_producto_academico?: string; nombre_ambito_divulgacion?: string;
  doi?: string; issn_isbn?: string; url_publicacion?: string;
  documentos_produccion_academica?: DocumentoTrayectoria[];
  ambito_divulgacion_produccion_academica?: {
    id_ambito_divulgacion?: number; nombre_ambito_divulgacion: string; puntaje: number;
    producto_academico_ambito_divulgacion?: { nombre_producto_academico: string };
    producto_academico_id: number; producto_academico?: { id_producto_academico: number; nombre_producto_academico: string };
  };
};
