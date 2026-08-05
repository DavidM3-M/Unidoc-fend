import { z } from 'zod';

/**
 * Esquema para validar documentos
 * @schema documentoSchema
 * @property {number} id_documento - ID único del documento
 * @property {string} archivo_url - URL válida del archivo
 * @property {string} estado - Estado del documento (default: 'Activo')
 * @property {string} nombre_archivo - Nombre del archivo
 */
export const documentoSchema = z.object({
  id_documento: z.number().positive('El ID debe ser un número positivo'),
  archivo_url: z.string().url('La URL del documento no es válida'),
  estado: z.string().default('Activo'),
  nombre_archivo: z.string().min(1, 'El nombre del archivo es requerido'),
});

/**
 * Esquema para validar normativas
 * @schema normativaSchema
 * @property {number} id_normativa - ID único de la normativa
 * @property {string} nombre - Nombre de la normativa (min 3 caracteres)
 * @property {string} descripcion - Descripción (opcional)
 * @property {string} tipo - Tipo/clasificación
 * @property {Documento[]} documentosNormativa - Array de documentos validados
 */
export const normativaSchema = z.object({
  id_normativa: z.number().positive('El ID debe ser un número positivo'),
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  descripcion: z.string().optional(),
  tipo: z.string().min(1, 'El tipo es requerido'),
  documentosNormativa: z.array(documentoSchema),
});

// Tipos TypeScript inferidos de los esquemas
export type Documento = z.infer<typeof documentoSchema>;
export type Normativa = z.infer<typeof normativaSchema>;

/**
 * Valida la estructura de la respuesta de la API
 * @function validarNormativasResponse
 * @param {unknown} data - Datos crudos de la API
 * @returns {Normativa[]} - Array de normativas validadas
 * @throws {z.ZodError} - Si la validación falla
 */
export function validarNormativasResponse(data: unknown): Normativa[] {
  const responseSchema = z.object({
    success: z.boolean().optional(),
    normativas: z.array(normativaSchema),
  });

  const parsed = responseSchema.parse(data);
  return parsed.normativas;
}

/**
 * Valida los datos para crear una nueva normativa
 * @schema crearNormativaSchema
 */
export const crearNormativaSchema = normativaSchema.omit({ 
  id_normativa: true,
  documentosNormativa: true 
}).extend({
  documentos: z.array(z.instanceof(File)).optional(),
});