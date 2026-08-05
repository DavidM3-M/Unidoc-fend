import { z } from "zod";

const regexSinEmojis = /^[\p{L}\p{N}\s-]+$/u;

//definimos los tipos que vamos a usar

//validacion de los datos
export const studySchema = z
  .object({
    tipo_estudio: z.string().min(1, { message: "Campo vacio" }),

    graduado: z.enum(["Si", "No"], {
      errorMap: () => ({ message: "Seleccione una opcion" }),
    }),

    institucion: z
      .string()
      .min(7, { message: "Minimo 7 caracteres" })
      .max(100, { message: "Campo demasiado largo" })
      .regex(regexSinEmojis, {
        message: "No se permiten emojis ni caracteres especiales",
      }),

    titulo_estudio: z
      .string()
      .min(7, { message: "Minimo 7 caracteres" })
      .max(100, { message: "Campo demasiado largo" })
      .regex(regexSinEmojis, {
        message: "No se permiten emojis ni caracteres especiales",
      }),

    titulo_convalidado: z.enum(["Si", "No"], {
      errorMap: () => ({ message: "Seleccione una opcion" }),
    }),

    fecha_graduacion: z
      .string({
        invalid_type_error: "Esa no es una fecha",
      })
      .refine((val) => val === "" || !isNaN(Date.parse(val)), {
        message: "Formato de fecha incorrecto",
      })
      .optional(),

    resolucion_convalidacion: z
      .string()
      .optional()
      .refine(
        (val) =>
          val === null || val === undefined || val === "" || val.length >= 7,
        {
          message: "Debe tener mínimo 7 caracter.",
        }
      )
      .refine(
        (val) =>
          val === null || val === undefined || val === "" || val.length <= 100,
        {
          message: "Debe tener máximo 100 caracteres.",
        }
      )
      .refine(
        (val) =>
          val === null ||
          val === undefined ||
          val === "" ||
          regexSinEmojis.test(val),
        {
          message: "No se permiten emojis ni caracteres especiales.",
        }
      ),
    posible_fecha_graduacion: z
      .string({
        invalid_type_error: "Esa no es una fecha",
      })
      .refine((val) => val === "" || !isNaN(Date.parse(val)), {
        message: "Formato de fecha incorrecto",
      })
      .optional(),

    fecha_convalidacion: z
      .string({
        invalid_type_error: "Esa no es una fecha",
      })
      .refine((val) => val === "" || !isNaN(Date.parse(val)), {
        message: "Formato de fecha incorrecto",
      })
      .optional(),

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
          message: "La fecha no puede ser hoy ni una fecha futura",
        }
      ),

    fecha_fin: z
      .string({
        invalid_type_error: "Esa no es una fecha",
      })
      .refine((val) => val === "" || !isNaN(Date.parse(val)), {
        message: "Formato de fecha incorrecto",
      })
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
      const fechaFinalizacion = new Date(data.fecha_fin ?? "");

      // Solo validar si existe fecha_fin
      return data.fecha_fin ? fechaFinalizacion >= fechaInicio : true;
    },
    {
      message:
        "La fecha de finalización no puede ser menor que la fecha de inicio",
      path: ["fecha_fin"],
    }
  )
  .refine(
    (data) => {
      const fechaInicio = new Date(data.fecha_inicio);
      const fechaGraduacion = new Date(data.fecha_graduacion ?? "");

      // Solo validar si existe fecha_graduacion
      return data.fecha_graduacion ? fechaGraduacion >= fechaInicio : true;
    },
    {
      message:
        "La fecha de graduación no puede ser menor que la fecha de inicio",
      path: ["fecha_grado"],
    }
  )
  .refine(
    (data) => {
      const fechaFinalizacion = new Date(data.fecha_fin ?? "");
      const fechaGraduacion = new Date(data.fecha_graduacion ?? "");

      // Solo validar si existen ambas fechas
      return data.fecha_fin && data.fecha_graduacion
        ? fechaGraduacion >= fechaFinalizacion
        : true;
    },
    {
      message:
        "La fecha de graduación no puede ser menor que la fecha de finalización",
      path: ["fecha_grado"],
    }
  );

export const studySchemaUpdate = z
  .object({
    tipo_estudio: z.string().min(1, { message: "Campo vacio" }),

    graduado: z.enum(["Si", "No"], {
      errorMap: () => ({ message: "Seleccione una opcion" }),
    }),

    institucion: z
      .string()
      .min(7, { message: "Minimo 7 caracteres" })
      .max(100, { message: "Campo demasiado largo" })
      .regex(regexSinEmojis, {
        message: "No se permiten emojis ni caracteres especiales",
      }),

    titulo_estudio: z
      .string()
      .min(7, { message: "Minimo 7 caracteres" })
      .max(100, { message: "Campo demasiado largo" })
      .regex(regexSinEmojis, {
        message: "No se permiten emojis ni caracteres especiales",
      }),
    resolucion_convalidacion: z
      .string()
      .optional()
      .refine(
        (val) =>
          val === null || val === undefined || val === "" || val.length >= 7,
        {
          message: "Debe tener mínimo 7 caracter.",
        }
      )
      .refine(
        (val) =>
          val === null || val === undefined || val === "" || val.length <= 100,
        {
          message: "Debe tener máximo 100 caracteres.",
        }
      )
      .refine(
        (val) =>
          val === null ||
          val === undefined ||
          val === "" ||
          regexSinEmojis.test(val),
        {
          message: "No se permiten emojis ni caracteres especiales.",
        }
      ),

    titulo_convalidado: z.enum(["Si", "No"], {
      errorMap: () => ({ message: "Seleccione una opcion" }),
    }),

    fecha_graduacion: z
      .string({
        invalid_type_error: "Esa no es una fecha",
      })
      .refine((val) => val === "" || !isNaN(Date.parse(val)), {
        message: "Formato de fecha incorrecto",
      })
      .optional(),

    posible_fecha_graduacion: z
      .string({
        invalid_type_error: "Esa no es una fecha",
      })
      .refine((val) => val === "" || !isNaN(Date.parse(val)), {
        message: "Formato de fecha incorrecto",
      })
      .optional(),

    fecha_convalidacion: z
      .string({
        invalid_type_error: "Esa no es una fecha",
      })
      .refine((val) => val === "" || !isNaN(Date.parse(val)), {
        message: "Formato de fecha incorrecto",
      })
      .optional(),

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
          message: "La fecha no puede ser hoy ni una fecha futura",
        }
      ),

    fecha_fin: z
      .string({
        invalid_type_error: "Esa no es una fecha",
      })
      .refine((val) => val === "" || !isNaN(Date.parse(val)), {
        message: "Formato de fecha incorrecto",
      })
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
      const fechaFinalizacion = new Date(data.fecha_fin ?? "");

      // Solo validar si existe fecha_fin
      return data.fecha_fin ? fechaFinalizacion >= fechaInicio : true;
    },
    {
      message:
        "La fecha de finalización no puede ser menor que la fecha de inicio",
      path: ["fecha_fin"],
    }
  )
  .refine(
    (data) => {
      const fechaInicio = new Date(data.fecha_inicio);
      const fechaGraduacion = new Date(data.fecha_graduacion ?? "");

      // Solo validar si existe fecha_graduacion
      return data.fecha_graduacion ? fechaGraduacion >= fechaInicio : true;
    },
    {
      message:
        "La fecha de graduación no puede ser menor que la fecha de inicio",
      path: ["fecha_grado"],
    }
  )
  .refine(
    (data) => {
      const fechaFinalizacion = new Date(data.fecha_fin ?? "");
      const fechaGraduacion = new Date(data.fecha_graduacion ?? "");

      // Solo validar si existen ambas fechas
      return data.fecha_fin && data.fecha_graduacion
        ? fechaGraduacion >= fechaFinalizacion
        : true;
    },
    {
      message:
        "La fecha de graduación no puede ser menor que la fecha de finalización",
      path: ["fecha_grado"],
    }
  );
