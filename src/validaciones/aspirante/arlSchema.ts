import { z } from "zod";
const regexSinEmojis = /^[\p{L}\p{N}\s-]+$/u;

const estado_afiliacion = ["Activo", "Inactivo"] as const;
const clase_riesgo = [1, 2, 3, 4, 5] as const;

export type ClaseRiesgo = (typeof clase_riesgo)[number];
export type EstadoAfiliacion = (typeof estado_afiliacion)[number];

export const mappeoClaseRiesgo: { [key in ClaseRiesgo]: number } = {
  1: 1,
  2: 2,
  3: 3,
  4: 4,
  5: 5,
};
export const mappeoEstadoAfiliacion: { [key in EstadoAfiliacion]: string } = {
  Activo: "Activo",
  Inactivo: "Inactivo",
};

export const arlSchema = z
  .object({
    nombre_arl: z
      .string()
      .min(3, { message: "Mínimo 3 caracteres" })
      .max(100, { message: "Máximo 100 caracteres" })
      .regex(regexSinEmojis, {
        message: "No se permiten emojis ni caracteres especiales",
      }),
    fecha_afiliacion: z
      .string()
      .min(1, { message: "La fecha de afiliación es requerida" })
      .refine((value) => !isNaN(Date.parse(value)), {
        message: "Debe ser una fecha válida",
      }),
    fecha_retiro: z
      .string()
      .optional()
      .refine((value) => !value || !isNaN(Date.parse(value)), {
        message: "Debe ser una fecha válida",
      }),
    clase_riesgo: z.coerce
      .number({
        required_error: "La clase de riesgo es requerida",
        invalid_type_error: "Debe ser un número",
      })
      .int()
      .min(1, { message: "Mínimo 1" })
      .max(5, { message: "Máximo 5" }),

    estado_afiliacion: z.enum(estado_afiliacion, {
      errorMap: () => ({
        message: "Seleccione un estado de afiliación válido",
      }),
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
        (files) =>
          files.length === 0 ? true : files[0].size <= 2 * 1024 * 1024,
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
  })
  .refine(
    (data) =>
      !data.fecha_retiro ||
      new Date(data.fecha_retiro) >= new Date(data.fecha_afiliacion),
    {
      message:
        "La fecha de retiro no puede ser menor que la fecha de afiliación",
      path: ["fecha_retiro"],
    },
  );

export const arlSchemaUpdate = z
  .object({
    nombre_arl: z
      .string()
      .min(3, { message: "Mínimo 3 caracteres" })
      .max(100, { message: "Máximo 100 caracteres" })
      .regex(regexSinEmojis, {
        message: "No se permiten emojis ni caracteres especiales",
      }),
    fecha_afiliacion: z
      .string()
      .min(1, { message: "La fecha de afiliación es requerida" })
      .refine((value) => !isNaN(Date.parse(value)), {
        message: "Debe ser una fecha válida",
      }),
    fecha_retiro: z
      .string()
      .optional()
      .refine((value) => !value || !isNaN(Date.parse(value)), {
        message: "Debe ser una fecha válida",
      }),
    clase_riesgo: z.coerce
      .number({
        required_error: "La clase de riesgo es requerida",
        invalid_type_error: "Debe ser un número",
      })
      .int()
      .min(1, { message: "Mínimo 1" })
      .max(5, { message: "Máximo 5" }),

    estado_afiliacion: z.enum(estado_afiliacion, {
      errorMap: () => ({
        message: "Seleccione un estado de afiliación válido",
      }),
    }),
    archivo: z
      // 1) forzamos FileList
      .instanceof(FileList, { message: "Debes subir un archivo" })
      .optional()
      // 2) si se proporciona, al menos un archivo
      .refine((files) => !files || files.length === 0 || files.length > 0, {
        message: "Debes subir un archivo",
      })
      // 3) tamaño máximo 2MB
      .refine(
        (files) =>
          !files || files.length === 0 || files[0].size <= 2 * 1024 * 1024,
        {
          message: "Archivo demasiado grande (máx 2MB)",
        },
      )
      // 4) solo PDF
      .refine(
        (files) =>
          !files || files.length === 0 || files[0].type === "application/pdf",
        {
          message: "Formato de archivo inválido (solo PDF permitido)",
        },
      ),
  })
  .refine(
    (data) =>
      !data.fecha_retiro ||
      new Date(data.fecha_retiro) >= new Date(data.fecha_afiliacion),
    {
      message:
        "La fecha de retiro no puede ser menor que la fecha de afiliación",
      path: ["fecha_retiro"],
    },
  );
