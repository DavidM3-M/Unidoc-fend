import { z } from "zod";
const regexSinEmojis = /^[\p{L}\p{N}\s-]+$/u;

export const rutSchema = z
  .object({
    numero_rut: z
      .string()
      .min(7, { message: "Mínimo 7 caracteres" })
      .max(100, { message: "Máximo 100 caracteres" })
      .regex(regexSinEmojis, { message: "No se permiten emojis ni caracteres especiales" }),

    // Solo aplica a personas jurídicas; se valida condicionalmente más abajo.
    razon_social: z
      .string()
      .max(100, { message: "Máximo 100 caracteres" })
      .regex(regexSinEmojis, { message: "No se permiten emojis ni caracteres especiales" })
      .optional()
      .or(z.literal("")),

    tipo_persona: z
      .string()
      .min(1, { message: "Selecciona una opción" }),

    codigo_ciiu: z
      .string()
      .min(1, { message: "Selecciona una opción" }),

    responsabilidades_tributarias: z
      .array(z.number())
      .min(1, { message: "Selecciona al menos una responsabilidad tributaria" }),

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
  })
  .superRefine((data, ctx) => {
    if (data.tipo_persona === "Juridica" && (!data.razon_social || data.razon_social.trim().length < 7)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["razon_social"],
        message: "Mínimo 7 caracteres",
      });
    }
  });

export const rutSchemaUpdate = z
  .object({
    numero_rut: z
      .string()
      .min(7, { message: "Mínimo 7 caracteres" })
      .max(100, { message: "Máximo 100 caracteres" })
      .regex(regexSinEmojis, { message: "No se permiten emojis ni caracteres especiales" }),

    // Solo aplica a personas jurídicas; se valida condicionalmente más abajo.
    razon_social: z
      .string()
      .max(100, { message: "Máximo 100 caracteres" })
      .regex(regexSinEmojis, { message: "No se permiten emojis ni caracteres especiales" })
      .optional()
      .or(z.literal("")),

    tipo_persona: z
      .string()
      .min(1, { message: "Selecciona una opción" }),

    codigo_ciiu: z
      .string()
      .min(1, { message: "Selecciona una opción" }),

    responsabilidades_tributarias: z
      .array(z.number())
      .min(1, { message: "Selecciona al menos una responsabilidad tributaria" }),

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
  })
  .superRefine((data, ctx) => {
    if (data.tipo_persona === "Juridica" && (!data.razon_social || data.razon_social.trim().length < 7)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["razon_social"],
        message: "Mínimo 7 caracteres",
      });
    }
  });
