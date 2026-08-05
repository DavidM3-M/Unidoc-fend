import { z } from "zod";

const regexSinEmojis = /^[\p{L}\p{N}\s-]+$/u;

export const experienciaSchema = z
  .object({
    tipo_experiencia: z
      .string()
      .min(1, { message: "Seleccione un tipo de experiencia" }),

    institucion_experiencia: z
      .string()
      .min(7, { message: "Minimo 7 caracteres" })
      .max(100, { message: "Máximo 100 caracteres" })
      .regex(regexSinEmojis, {
        message: "No se permiten emojis ni caracteres especiales",
      }),

    cargo: z
      .string()
      .min(7, { message: "Minimo 7 caracteres" })
      .max(100, { message: "Máximo 100 caracteres" })
      .regex(regexSinEmojis, {
        message: "No se permiten emojis ni caracteres especiales",
      }),

    trabajo_actual: z.enum(["Si", "No"], {
      errorMap: () => ({ message: "Seleccione una opción" }),
    }),
    intensidad_horaria: z
      .number({ invalid_type_error: "Debe ser un número" })
      .int({ message: "Debe ser un número entero" })
      .max(127, {
        message: "Máximo 127 horas",
      })
      .positive({ message: "Debe ser un número positivo" }),

    experiencia_universidad: z.enum(["Si", "No"], {
      errorMap: () => ({ message: "Seleccione una opción" }),
    }),
    fecha_inicio: z
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
          message:
            "La fecha no puede ser hoy ni una fecha futura",
        }
      ),

    fecha_finalizacion: z
      .string({
        invalid_type_error: "Esa no es una fecha",
      })
      .refine((val) => val === "" || !isNaN(Date.parse(val)), {
        message: "Formato de fecha incorrecto",
      })
      .optional(),

    fecha_expedicion_certificado: z
      .string({
        invalid_type_error: "Esa no es una fecha",
      })
      .refine((val) => val === "" || !isNaN(Date.parse(val)), {
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
          message:
            "La fecha no puede ser hoy ni una fecha futura",
        }
      )
      .optional(),

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
      const fechaInicio = new Date(data.fecha_inicio);
      const fechaFinalizacion = new Date(data.fecha_finalizacion ?? "");
      if (fechaFinalizacion < fechaInicio) {
        return false;
      }
      return true;
    },
    {
      message:
        "La fecha de finalización no puede ser menor que la fecha de inicio",
      path: ["fecha_finalizacion"],
    }
  );

export const experienciaSchemaUpdate = z
  .object({
    tipo_experiencia: z
      .string()
      .min(1, { message: "Seleccione un tipo de experiencia" }),

    experiencia_universidad: z.enum(["Si", "No"], {
      errorMap: () => ({ message: "Seleccione una opción" }),
    }),

    institucion_experiencia: z
      .string()
      .min(7, { message: "Minimo 7 caracteres" })
      .max(100, { message: "Máximo 100 caracteres" })
      .regex(regexSinEmojis, {
        message: "No se permiten emojis ni caracteres especiales",
      }),

    cargo: z
      .string()
      .min(7, { message: "Minimo 7 caracteres" })
      .max(100, { message: "Máximo 100 caracteres" })
      .regex(regexSinEmojis, {
        message: "No se permiten emojis ni caracteres especiales",
      }),

    trabajo_actual: z.enum(["Si", "No"], {
      errorMap: () => ({ message: "Seleccione una opción" }),
    }),

    intensidad_horaria: z
      .number({ invalid_type_error: "Debe ser un número" })
      .int({ message: "Debe ser un número entero" })
      .max(127, {
        message: "Máximo 127 horas",
      })
      .positive({ message: "Debe ser un número positivo" }),

    fecha_inicio: z
      .string({
        invalid_type_error: "Esa no es una fecha válida",
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
          message:
            "La fecha no puede ser hoy ni una fecha futura",
        }
      ),
    fecha_finalizacion: z
      .string({
        invalid_type_error: "Esa no es una fecha",
      })
      .refine((val) => val === "" || !isNaN(Date.parse(val)), {
        message: "Formato de fecha incorrecto",
      })
      .optional(),

    fecha_expedicion_certificado: z
      .string({
        invalid_type_error: "Esa no es una fecha",
      })
      .refine((val) => val === "" || !isNaN(Date.parse(val)), {
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
          message:
            "La fecha no puede ser hoy ni una fecha futura",
        }
      )
      .optional(),

    archivo: z
      .instanceof(FileList, {
        message: "Debes subir un archivo si quieres reemplazar el existente",
      })
      .optional()
      .refine(
        (files) =>
          (files?.length ?? 0) === 0 || files![0].size <= 2 * 1024 * 1024,
        { message: "Archivo demasiado grande (máx 2MB)" }
      )
      .refine(
        (files) =>
          (files?.length ?? 0) === 0 || files![0].type === "application/pdf",
        { message: "Formato de archivo inválido (solo PDF permitido)" }
      ),
  })
  .refine(
    (data) => {
      const fechaInicio = new Date(data.fecha_inicio);
      const fechaFinalizacion = new Date(data.fecha_finalizacion ?? "");
      if (fechaFinalizacion < fechaInicio) {
        return false;
      }
      return true;
    },
    {
      message:
        "La fecha de finalización no puede ser menor que la fecha de inicio",
      path: ["fecha_finalizacion"],
    }
  );
