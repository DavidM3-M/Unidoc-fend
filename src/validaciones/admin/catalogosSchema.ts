import { z } from "zod";

// Espejan los FormRequest del backend
// (RequestAdmin/RequestCatalogoProduccionAcademica y RequestAdmin/RequestTipoExperiencia).
//
// La unicidad del nombre no se valida aquí: solo la base de datos sabe qué hay registrado, así
// que ese error llega como 422 y se muestra con el mensaje que devuelve el backend.

export const productoAcademicoSchema = z.object({
  nombre_producto_academico: z
    .string()
    .trim()
    .min(1, { message: "El nombre es obligatorio" })
    .max(255, { message: "Máximo 255 caracteres" }),

  activo: z.boolean(),
});

export type ProductoAcademicoFormInputs = z.infer<typeof productoAcademicoSchema>;

// `producto_academico_id` no está en el formulario: sale del producto seleccionado en la tabla
// maestro y se agrega al enviar.
export const ambitoDivulgacionSchema = z.object({
  nombre_ambito_divulgacion: z
    .string()
    .trim()
    .min(1, { message: "El nombre es obligatorio" })
    .max(255, { message: "Máximo 255 caracteres" }),

  activo: z.boolean(),
});

export type AmbitoDivulgacionFormInputs = z.infer<typeof ambitoDivulgacionSchema>;

export const tipoExperienciaSchema = z.object({
  // 100 y no 255: es el largo de `tipo_experiencias.nombre_tipo_experiencia`.
  nombre_tipo_experiencia: z
    .string()
    .trim()
    .min(1, { message: "El nombre es obligatorio" })
    .max(100, { message: "Máximo 100 caracteres" }),

  activo: z.boolean(),
});

export type TipoExperienciaFormInputs = z.infer<typeof tipoExperienciaSchema>;
