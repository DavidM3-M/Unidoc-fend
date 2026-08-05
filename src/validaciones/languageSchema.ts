import { z } from "zod";
const regexSinEmojis = /^[\p{L}\p{N}\s-]+$/u;

export const languageSchema = z.object({
  idioma: z
    .string()
    .min(1, { message: "Campo vacio" })
    .max(50, { message: "Máximo 50 caracteres" })
    .regex(regexSinEmojis, {
      message: "No se permiten emojis ni caracteres especiales",
    }),

  institucion_idioma: z
    .string()
    .min(7, { message: "Minimo 7 caracteres" })
    .max(50, { message: "Máximo 50 caracteres" })
    .regex(regexSinEmojis, {
      message: "No se permiten emojis ni caracteres especiales",
    }),

  nivel: z.string().min(1, { message: "Seleccione un nivel" }),

  fecha_certificado: z
    .string({
      invalid_type_error: "Esa no es una fecha",
    })
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Formato de fecha incorrecto",
    })
    .refine(
      (val) => {
        const fecha = new Date(val);
        const hoy = new Date();
        // Nos aseguramos de comparar solo año, mes y día (sin hora)
        hoy.setHours(0, 0, 0, 0);
        return fecha < hoy;
      },
      {
        message: "La fecha no puede ser hoy ni una fecha futura",
      }
    ),

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

export const languageSchemaUpdate = z.object({
  idioma: z
    .string()
    .min(1, { message: "Campo vacio" })
    .max(50, { message: "Máximo 50 caracteres" })
    .regex(regexSinEmojis, {
      message: "No se permiten emojis ni caracteres especiales",
    }),

  institucion_idioma: z
    .string()
    .min(7, { message: "Minimo 7 caracteres" })
    .max(50, { message: "Máximo 50 caracteres" })
    .regex(regexSinEmojis, {
      message: "No se permiten emojis ni caracteres especiales",
    }),

  nivel: z.string().min(1, { message: "Seleccione un nivel" }),

  fecha_certificado: z
    .string({
      invalid_type_error: "Esa no es una fecha",
    })
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Formato de fecha incorrecto",
    })
    .refine(
      (val) => {
        const fecha = new Date(val);
        const hoy = new Date();
        // Nos aseguramos de comparar solo año, mes y día (sin hora)
        hoy.setHours(0, 0, 0, 0);
        return fecha < hoy;
      },
      {
        message: "La fecha no puede ser hoy ni una fecha futura",
      }
    ),

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
