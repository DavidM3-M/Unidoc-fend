import { z } from "zod";

const regexSinEmojis = /^[\p{L}\p{N}\s-]+$/u;

export const registerSchema = z
  .object({
    numero_identificacion: z
      .string()
      .min(7, { message: "El número de identificación debe tener al menos 7 caracteres" })
      .max(50, {
        message:
          "El número de identificación no puede tener más de 50 caracteres",
      }),

    primer_nombre: z
      .string()
      .min(1, { message: "Campo vacio" })
      .max(100, { message: "El nombre no puede tener más de 100 caracteres" })
      .regex(regexSinEmojis, {
        message: "No se permiten emojis ni caracteres especiales",
      }),

    primer_apellido: z
      .string()
      .min(1, { message: "Campo vacio" })
      .max(100, { message: "El apellido no puede tener más de 100 caracteres" })
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

    pais: z.number({ invalid_type_error: "El país es requerido" }),

    departamento: z.number({
      invalid_type_error: "El departamento es requerido",
    }),

    municipio_id: z.number({ invalid_type_error: "El municipio es requerido" }),

    email: z
      .string()
      .email({ message: "Correo no valido" })
      .max(100, { message: "El correo no puede tener más de 100 caracteres" }),

    password: z
      .string()
      .min(8, { message: "La contraseña debe tener al menos 8 caracteres" })
      .regex(/[a-z]/, {
        message: "La contraseña debe contener al menos una minúscula",
      })
      .regex(/[A-Z]/, {
        message: "La contraseña debe contener al menos una mayúscula",
      })
      .regex(/[0-9]/, {
        message: "La contraseña debe contener al menos un número",
      }),

    password_confirmation: z
      .string()
      .regex(regexSinEmojis, {
        message: "No se permiten emojis ni caracteres especiales",
      })
      .min(1, { message: "La confirmación de contraseña es requerida" }),

    fecha_nacimiento: z
      .string({
        invalid_type_error: "Esa no es una fecha",
      })
      .refine((val) => !isNaN(Date.parse(val)), {
        message: "Formato de fecha incorrecto",
      })
      .refine(
        (val) => {
          // Comparación por fecha calendario (YYYY-MM-DD) en vez de objetos
          // Date: new Date("YYYY-MM-DD") se interpreta como medianoche UTC,
          // así que compararlo contra la medianoche LOCAL de "hoy" desalinea
          // el resultado en husos detrás de UTC (ej. Colombia) y deja pasar
          // la fecha de hoy como si fuera pasado.
          const hoy = new Date();
          const hoyStr = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}-${String(hoy.getDate()).padStart(2, "0")}`;
          return val < hoyStr;
        },
        {
          message:
            "La fecha de nacimiento no puede ser hoy ni una fecha futura",
        }
      ),

    genero: z.enum(["Masculino", "Femenino", "Otro"], {
      errorMap: () => ({ message: "Seleccione un genero" }),
    }),

    tipo_identificacion: z
      .string()
      .min(1, { message: "Seleccione un tipo de identificación" }),

    estado_civil: z.string().min(1, { message: "Seleccione un estado civil" }),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Las contraseñas no coinciden",
    path: ["password_confirmation"],
  });
