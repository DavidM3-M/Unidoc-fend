import { z } from "zod";
import { confirmacionContrasenaSchema, contrasenaSchema } from "./contrasena";

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

    // Estas reglas eran correctas —coincidian con el backend— pero estaban escritas solo aqui, y
    // recuperacion y cambio de contraseña acabaron con otras distintas. Ahora las tres leen de
    // `contrasena.ts` para que no puedan volver a separarse.
    //
    // La confirmacion no repite la politica a proposito: llevaba la misma lista blanca que los
    // nombres —solo letras, numeros, espacios y guiones— mientras que `password` no la tenia, asi
    // que una contraseña con simbolos pasaba en el primer campo y era rechazada en el segundo, y
    // resultaba imposible registrar la que genera un gestor de contraseñas.
    password: contrasenaSchema,
    password_confirmation: confirmacionContrasenaSchema,

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
