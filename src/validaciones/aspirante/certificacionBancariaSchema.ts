import { z } from "zod";

// Regex que no permite emojis
const regexSinEmojis = /^[\p{L}\p{N}\s-]+$/u;

const tipo_cuenta = ["Cuenta de Ahorros", "Cuenta Corriente"] as const;
export type TipoCuenta = (typeof tipo_cuenta)[number];

export const mappeoTipoCuenta: { [key in TipoCuenta]: string } = {
  "Cuenta de Ahorros": "Cuenta de Ahorros",
  "Cuenta Corriente": "Cuenta Corriente",
};

/* =============================
        CREATE
============================= */
export const bancoSchema = z.object({
  nombre_banco: z
    .string()
    .min(3, { message: "Mínimo 3 caracteres" })
    .max(100, { message: "Máximo 100 caracteres" })
    .regex(regexSinEmojis, {
      message: "No se permiten emojis ni caracteres especiales",
    }),

  tipo_cuenta: z.enum(tipo_cuenta, {
    errorMap: () => ({ message: "Selecciona una opción" }),
  }),

  numero_cuenta: z
    .string()
    .min(5, { message: "Mínimo 5 dígitos" })
    .max(20, { message: "Máximo 20 dígitos" })
    .regex(/^\d+$/, {
      message: "El número de cuenta solo debe contener números",
    }),

  fecha_emision: z
    .string()
    .optional()
    .refine(
      (val) => val === undefined || val === "" || !isNaN(Date.parse(val)),
      {
        message: "Formato de fecha incorrecto",
      },
    ),

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
export const bancoSchemaUpdate = z.object({
  nombre_banco: z
    .string()
    .min(3, { message: "Mínimo 3 caracteres" })
    .max(100, { message: "Máximo 100 caracteres" })
    .regex(regexSinEmojis, {
      message: "No se permiten emojis ni caracteres especiales",
    }),

  tipo_cuenta: z.string().min(1, {
    message: "Selecciona una opción",
  }),

  numero_cuenta: z
    .string()
    .min(5, { message: "Mínimo 5 dígitos" })
    .max(20, { message: "Máximo 20 dígitos" })
    .regex(/^\d+$/, {
      message: "El número de cuenta solo debe contener números",
    }),

  fecha_emision: z
    .string()
    .optional()
    .refine(
      (val) => val === undefined || val === "" || !isNaN(Date.parse(val)),
      {
        message: "Formato de fecha incorrecto",
      },
    ),

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
