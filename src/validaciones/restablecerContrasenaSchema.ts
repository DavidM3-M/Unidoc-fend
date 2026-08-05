import { z } from "zod";

const regexSinEmojis = /^[\p{L}\p{N}\s-]+$/u;

export const restablecerContrasenaSchema = z.object({
  email: z.string().email({ message: "Correo no valido" }),
});

export const restablecerContrasenaSchema2 = z
  .object({
    email: z.string().email({ message: "Correo no valido" }),
    password: z
      .string()
      .regex(regexSinEmojis, {
        message: "No se permiten emojis ni caracteres especiales",
      })
      .min(8, { message: "La contraseña debe tener al menos 8 caracteres" }),

    password_confirmation: z
      .string()
      .regex(regexSinEmojis, {
        message: "No se permiten emojis ni caracteres especiales",
      })
      .min(1, { message: "La confirmación de contraseña es requerida" }),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Las contraseñas no coinciden",
    path: ["password_confirmation"],
  });
