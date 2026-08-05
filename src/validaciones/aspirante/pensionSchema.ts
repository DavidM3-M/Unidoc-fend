import { z } from "zod";

const regexSinEmojis = /^[\p{L}\p{N}\s-]+$/u;

const regimen_pensional = [
  "Régimen de Prima Media (RPM)",
  "Régimen de Ahorro Individual con Solidaridad (RAIS)",
] as const;
export type RegimenPensional = (typeof regimen_pensional)[number];

export const mappeoRegimenPensional: { [key in RegimenPensional]: string } = {
  "Régimen de Prima Media (RPM)": "Régimen de Prima Media (RPM)",
  "Régimen de Ahorro Individual con Solidaridad (RAIS)":
    "Régimen de Ahorro Individual con Solidaridad (RAIS)",
};

export const pensionSchema = z.object({
  regimen_pensional: z.enum(regimen_pensional, {
    errorMap: () => ({ message: "Selecciona un régimen pensional" }),
  }),

  entidad_pensional: z
    .string()
    .min(5, { message: "Mínimo 5 caracteres" })
    .max(50, { message: "Máximo 50 caracteres" })
    .regex(regexSinEmojis, {
      message: "No se permiten emojis ni caracteres especiales",
    }),

  nit_entidad: z
    .string()
    .min(5, { message: "Mínimo 5 caracteres" })
    .max(20, { message: "Máximo 20 caracteres" })
    .regex(/^\d+$/, {
      message: "El NIT solo debe contener números",
    }),

  archivo: z
    // 1) forzamos FileList
    .instanceof(FileList, { message: "Debes subir un archivo" })

    // 2) al menos un archivo
    .refine((files) => files.length > 0, {
      message: "Debes subir un archivo",
    })

    // 3) tamaño máximo 2MB
    .refine(
      (files) => (files.length === 0 ? true : files[0].size <= 2 * 1024 * 1024),
      {
        message: "Archivo demasiado grande (máx 2MB)",
      },
    )

    // 4) solo PDF
    .refine(
      (files) =>
        files.length === 0 ? true : files[0].type === "application/pdf",
      {
        message: "Formato de archivo inválido (solo PDF permitido)",
      },
    ),
});

export const pensionSchemaUpdate = z.object({
  regimen_pensional: z.string().min(1, {
    message: "Selecciona un régimen pensional",
  }),

  entidad_pensional: z
    .string()
    .min(5, { message: "Mínimo 5 caracteres" })
    .max(50, { message: "Máximo 50 caracteres" })
    .regex(regexSinEmojis, {
      message: "No se permiten emojis ni caracteres especiales",
    }),

  nit_entidad: z.string().min(5).max(20).regex(/^\d+$/, {
    message: "El NIT solo debe contener números",
  }),

  archivo: z
    .instanceof(FileList, {
      message: "Debes subir un archivo si quieres reemplazar el existente",
    })
    .optional()

    // tamaño máximo 2MB (solo si hay archivo)
    .refine(
      (files) =>
        (files?.length ?? 0) === 0 || files![0].size <= 2 * 1024 * 1024,
      {
        message: "Archivo demasiado grande (máx 2MB)",
      },
    )

    // solo PDF (solo si hay archivo)
    .refine(
      (files) =>
        (files?.length ?? 0) === 0 || files![0].type === "application/pdf",
      {
        message: "Formato de archivo inválido (solo PDF permitido)",
      },
    ),
});
