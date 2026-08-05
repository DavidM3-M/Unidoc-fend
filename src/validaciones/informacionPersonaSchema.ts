import { z } from "zod";
const regexSinEmojis = /^[\p{L}\p{N}\s-]+$/u;
export const informacionContacto = z.object({
  categoria_libreta_militar: z.string().min(1, { message: "Es requerido" }),
  pais: z.number({ invalid_type_error: "El pais es requerido" }),

  departamento: z.number({ invalid_type_error: "El departamento es requerido" }),

  municipio_id: z.number({ invalid_type_error: "El municipio es requerido" }),

  numero_libreta_militar: z.string().optional(),

  numero_distrito_militar: z.string().optional(),

  direccion_residencia: z.string().max(100).optional(),

  barrio: z.string().max(100).optional(),

  correo_alterno: z
    .string()
    .email({ message: "Correo no valido" })
    .max(100, { message: "El correo no puede tener más de 100 caracteres" })
    .optional()
    .or(z.literal("")),
  telefono_movil: z
    .string()
    .min(7, { message: "Mínimo 7 caracteres" })
    .max(20, { message: "Máximo 20 caracteres" })
    .regex(/^[0-9+\-\s()]+$/, "Formato inválido para celular alternativo"),

  celular_alternativo: z
    .string()
    .min(7, { message: "Mínimo 7 caracteres" })
    .max(100, { message: "Máximo 100 caracteres" })
    .regex(regexSinEmojis, {
      message: "No se permiten emojis ni caracteres especiales",
    })
    .optional()
    .or(z.literal("")),

  archivo: z
    .instanceof(FileList, {
      message: "Debes subir un archivo si quieres reemplazar el existente",
    })
    .optional()
    // 1) tamaño máximo 2MB, solo si hay fichero
    .refine(
      (files) =>
        (files?.length ?? 0) === 0 || files![0].size <= 2 * 1024 * 1024,
      { message: "Archivo demasiado grande (máx 2MB)" }
    )
    // 2) solo PDF, solo si hay fichero
    .refine(
      (files) =>
        (files?.length ?? 0) === 0 || files![0].type === "application/pdf",
      { message: "Formato de archivo inválido (solo PDF permitido)" }
    ),
});

export const informacionContactoUpdate = z.object({
  categoria_libreta_militar: z.string().min(1, { message: "Es requerido" }),
  pais: z.number({ invalid_type_error: "El pais es requerido" }),

  departamento: z.number({ invalid_type_error: "El departamento es requerido" }),
  
  municipio_id: z.number({ invalid_type_error: "El municipio es requerido" }),

  numero_libreta_militar: z.string().optional(),

  numero_distrito_militar: z.string().optional(),

  direccion_residencia: z.string().max(100).optional(),

  barrio: z.string().max(100)
  .regex(regexSinEmojis, {
    message: "No se permiten emojis ni caracteres especiales",
  })
  .optional(),

  correo_alterno: z
    .string()
    .email({ message: "Correo no valido" })
    .max(100, { message: "El correo no puede tener más de 100 caracteres" })
    .optional()
    .or(z.literal("")),
  telefono_movil: z
    .string()
    .min(7, { message: "Mínimo 7 caracteres" })
    .max(20, { message: "Máximo 20 caracteres" })
    .regex(/^[0-9+\-\s()]+$/, "Formato inválido para celular alternativo"),

  celular_alternativo: z
    .string()
    .min(7, { message: "Mínimo 7 caracteres" })
    .max(100, { message: "Máximo 100 caracteres" })
    .regex(regexSinEmojis, {
      message: "No se permiten emojis ni caracteres especiales",
    })
    .optional()
    .or(z.literal("")),

  archivo: z
    .instanceof(FileList, {
      message: "Debes subir un archivo si quieres reemplazar el existente",
    })
    .optional()
    // 1) tamaño máximo 2MB, solo si hay fichero
    .refine(
      (files) =>
        (files?.length ?? 0) === 0 || files![0].size <= 2 * 1024 * 1024,
      { message: "Archivo demasiado grande (máx 2MB)" }
    )
    // 2) solo PDF, solo si hay fichero
    .refine(
      (files) =>
        (files?.length ?? 0) === 0 || files![0].type === "application/pdf",
      { message: "Formato de archivo inválido (solo PDF permitido)" }
    ),
});
