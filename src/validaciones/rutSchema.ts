import { z } from "zod";
const regexSinEmojis = /^[\p{L}\p{N}\s-]+$/u;

export const rutSchema = z.object({

  numero_rut: z
    .string()
    .min(7, { message: "Mínimo 7 caracteres" })
    .max(100, { message: "Máximo 100 caracteres" })
    .regex(regexSinEmojis, { message: "No se permiten emojis ni caracteres especiales" }),

  razon_social: z
    .string()
    .min(7, { message: "Mínimo 7 caracteres" })
    .max(100, { message: "Máximo 100 caracteres" })
    .regex(regexSinEmojis, { message: "No se permiten emojis ni caracteres especiales" }),

  tipo_persona: z
    .string()
    .min(1, { message: "Selecciona una opción" }),

  codigo_ciiu: z
    .string()
    .min(1, { message: "Selecciona una opción" }),

  responsabilidades_tributarias: z
    .string()
    .min(7, { message: "Mínimo 7 caracteres" })
    .max(100, { message: "Máximo 100 caracteres" })
    .regex(regexSinEmojis, { message: "No se permiten emojis ni caracteres especiales" }),
  
  archivo: z
    // 1) forzamos que venga un FileList
    .instanceof(FileList, { message: "Debes subir un archivo" })

    // 2) al menos un fichero
    .refine((files) => files.length > 0, {
      message: "Debes subir un archivo",
    })

    // 3) tamaño máximo 2MB, pero sólo si hay fichero
    .refine(
      (files) => (files.length === 0 ? true : files[0].size <= 2 * 1024 * 1024),
      {
        message: "Archivo demasiado grande (máx 2MB)",
      }
    )

    // 4) solo PDF, pero sólo si hay fichero
    .refine(
      (files) =>
        files.length === 0 ? true : files[0].type === "application/pdf",
      {
        message: "Formato de archivo inválido (solo PDF permitido)",
      }
    ),
});

export const rutSchemaUpdate = z.object({

  numero_rut: z
    .string()
    .min(7, { message: "Mínimo 7 caracteres" })
    .max(100, { message: "Máximo 100 caracteres" })
    .regex(regexSinEmojis, { message: "No se permiten emojis ni caracteres especiales" }),

  razon_social: z
    .string()
    .min(7, { message: "Mínimo 7 caracteres" })
    .max(100, { message: "Máximo 100 caracteres" })
    .regex(regexSinEmojis, { message: "No se permiten emojis ni caracteres especiales" }),

  tipo_persona: z
    .string()
    .min(1, { message: "Selecciona una opción" }),

  codigo_ciiu: z
    .string()
    .min(1, { message: "Selecciona una opción" }),

  responsabilidades_tributarias: z
    .string()
    .min(7, { message: "Mínimo 7 caracteres" })
    .max(100, { message: "Máximo 100 caracteres" })
    .regex(regexSinEmojis, { message: "No se permiten emojis ni caracteres especiales" }),
  
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
