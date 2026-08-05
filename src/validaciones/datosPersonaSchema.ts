import { z } from "zod";

const regexSinEmojis = /^[\p{L}\p{N}\s-]+$/u;

export const userSchema = z.object({
  tipo_identificacion: z
    .string()
    .min(1, { message: "Seleccione un tipo de identificación" }),

  numero_identificacion: z
    .string()
    .min(1, { message: "Campo vacio" })
    .max(50, {
      message:
        "El número de identificación no puede tener más de 50 caracteres",
    })
    .regex(regexSinEmojis, {
      message: "No se permiten emojis ni caracteres especiales",
    }),

  estado_civil: z.string().min(1, { message: "Seleccione un estado civil" }),

  primer_nombre: z
    .string()
    .min(1, { message: "Campo vacio" })
    .max(100, { message: "El nombre no puede tener más de 100 caracteres" })
    .regex(regexSinEmojis, {
      message: "No se permiten emojis ni caracteres especiales",
    }),

  segundo_nombre: z
    .string()
    .nullable()
    .optional()
    .refine(
      (val) =>
        val === null || val === undefined || val === "" || val.length >= 1,
      {
        message: "Debe tener mínimo 1 caracter.",
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

  primer_apellido: z
    .string()
    .min(1, { message: "Campo vacio" })
    .max(100, { message: "El apellido no puede tener más de 100 caracteres" })
    .regex(regexSinEmojis, {
      message: "No se permiten emojis ni caracteres especiales",
    }),

  segundo_apellido: z
    .string()
    .nullable()
    .optional()
    .refine(
      (val) =>
        val === null || val === undefined || val === "" || val.length >= 1,
      {
        message: "Debe tener mínimo 1 caracter.",
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

  fecha_nacimiento: z
    .string({
      invalid_type_error: "Esa no es una fecha",
    })
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Formato de fecha incorrecto",
    })
    .refine((val) => {
      const fecha = new Date(val);
      const hoy = new Date();
      // Nos aseguramos de comparar solo año, mes y día (sin hora)
      hoy.setHours(0, 0, 0, 0);
      return fecha < hoy;
    }, {
      message: "La fecha de nacimiento no puede ser hoy ni una fecha futura",
    }),

  municipio_id: z.number({ invalid_type_error: "El municipio es requerido" }),

  genero: z.enum(["Masculino", "Femenino", "Otro"], {
    errorMap: () => ({ message: "El genero no es valido" }),
  }),

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
export const userSchemaUpdate = z.object({

  pais: z.number({ invalid_type_error: "El municipio es requerido" }),

  departamento: z.number({ invalid_type_error: "El municipio es requerido" }),

  tipo_identificacion: z
    .string()
    .min(1, { message: "Seleccione un tipo de identificación" }),

  numero_identificacion: z
    .string()
    .min(1, { message: "Campo vacio" })
    .max(50, {
      message:
        "El número de identificación no puede tener más de 50 caracteres",
    })
    .regex(regexSinEmojis, {
      message: "No se permiten emojis ni caracteres especiales",
    }),

  estado_civil: z.string().min(1, { message: "Seleccione un estado civil" }),

  primer_nombre: z
    .string()
    .min(1, { message: "Campo vacio" })
    .max(100, { message: "El nombre no puede tener más de 100 caracteres" })
    .regex(regexSinEmojis, {
      message: "No se permiten emojis ni caracteres especiales",
    }),

  segundo_nombre: z
    .string()
    .optional()
    .refine(
      (val) =>
        val === null || val === undefined || val === "" || val.length >= 1,
      {
        message: "Debe tener mínimo 1 caracter.",
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

  primer_apellido: z
    .string()
    .min(1, { message: "Campo vacio" })
    .max(100, { message: "El apellido no puede tener más de 100 caracteres" })
    .regex(regexSinEmojis, {
      message: "No se permiten emojis ni caracteres especiales",
    }),

  segundo_apellido: z
    .string()
    .optional()
    .refine(
      (val) =>
        val === null || val === undefined || val === "" || val.length >= 1,
      {
        message: "Debe tener mínimo 1 caracter.",
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

  fecha_nacimiento: z
    .string({
      invalid_type_error: "Esa no es una fecha",
    })
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Formato de fecha incorrecto",
    })
    .refine((val) => {
      const fecha = new Date(val);
      const hoy = new Date();
      // Nos aseguramos de comparar solo año, mes y día (sin hora)
      hoy.setHours(0, 0, 0, 0);
      return fecha < hoy;
    }, {
      message: "La fecha de nacimiento no puede ser hoy ni una fecha futura",
    }),

  municipio_id: z.number({ invalid_type_error: "El municipio es requerido" }),

  genero: z.enum(["Masculino", "Femenino", "Otro"], {
    errorMap: () => ({ message: "El genero no es valido" }),
  }),

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
