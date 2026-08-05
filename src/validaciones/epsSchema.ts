import { z } from "zod";

// Regex que no permite emojis
const regexSinEmojis = /^[\p{L}\p{N}\s-]+$/u;

export const epsSchema = z
  .object({
    nombre_eps: z
      .string()
      .min(7, { message: "Mínimo 7 caracteres" })
      .max(100, { message: "Máximo 100 caracteres" })
      .regex(regexSinEmojis, {
        message: "No se permiten emojis ni caracteres especiales",
      }),

    tipo_afiliacion: z.string().min(1, { message: "Selecciona una opción" }),
    estado_afiliacion: z.string().min(1, { message: "Selecciona una opción" }),
    tipo_afiliado: z.string().min(1, { message: "Selecciona una opción" }),

    numero_afiliado: z
      .string()
      .max(100, { message: "Máximo 100 caracteres" })
      .regex(regexSinEmojis, {
        message: "No se permiten emojis ni caracteres especiales",
      })
      .optional()
      .or(z.literal("")),

    fecha_afiliacion_efectiva: z
      .string({ invalid_type_error: "Esa no es una fecha" })
      .refine((val) => !isNaN(Date.parse(val)), {
        message: "Formato de fecha incorrecto",
      }),

    fecha_finalizacion_afiliacion: z
      .string()
      .optional()
      .refine(
        (val) => val === undefined || val === "" || !isNaN(Date.parse(val)),
        {
          message: "Formato de fecha incorrecto",
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
        (files) =>
          files.length === 0 ? true : files[0].size <= 2 * 1024 * 1024,
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
  .refine(
    (data) => {
      const fechaInicio = new Date(data.fecha_afiliacion_efectiva);
      const fechaFinalizacion = new Date(
        data.fecha_finalizacion_afiliacion ?? ""
      );
      if (fechaFinalizacion < fechaInicio) {
        return false;
      }
      return true;
    },
    {
      message:
        "La fecha de finalización no puede ser menor que la fecha de inicio",
      path: ["fecha_finalizacion_afiliacion"], // Esto asegura que el error se asocie con fecha_finalizacion
    }
  );

export const epsSchemaUpdate = z
  .object({
    nombre_eps: z
      .string()
      .min(7, { message: "Mínimo 7 caracteres" })
      .max(100, { message: "Máximo 100 caracteres" })
      .regex(regexSinEmojis, {
        message: "No se permiten emojis ni caracteres especiales",
      }),

    tipo_afiliacion: z.string().min(1, { message: "Selecciona una opción" }),
    estado_afiliacion: z.string().min(1, { message: "Selecciona una opción" }),
    tipo_afiliado: z.string().min(1, { message: "Selecciona una opción" }),

    numero_afiliado: z
      .string()
      .max(100, { message: "Máximo 100 caracteres" })
      .regex(regexSinEmojis, {
        message: "No se permiten emojis ni caracteres especiales",
      })
      .optional()
      .or(z.literal("")),

    fecha_afiliacion_efectiva: z
      .string({ invalid_type_error: "Esa no es una fecha" })
      .refine((val) => !isNaN(Date.parse(val)), {
        message: "Formato de fecha incorrecto",
      }),

    fecha_finalizacion_afiliacion: z
      .string()
      .optional()
      .refine(
        (val) => val === undefined || val === "" || !isNaN(Date.parse(val)),
        {
          message: "Formato de fecha incorrecto",
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
  })
  .refine(
    (data) => {
      const fechaInicio = new Date(data.fecha_afiliacion_efectiva);
      const fechaFinalizacion = new Date(
        data.fecha_finalizacion_afiliacion ?? ""
      );
      if (fechaFinalizacion < fechaInicio) {
        return false;
      }
      return true;
    },
    {
      message:
        "La fecha de finalización no puede ser menor que la fecha de inicio",
      path: ["fecha_finalizacion_afiliacion"], // Esto asegura que el error se asocie con fecha_finalizacion
    }
  );
