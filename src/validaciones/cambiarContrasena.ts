import { z } from "zod";

const regexSinEmojis = /^[\p{L}\p{N}\s-]+$/u;

export const cambiarContrasenaSchema = z
  .object({
    password: z
      .string()
      .min(8, { message: "La contraseña actual debe coincidir con tu contraseña actual" }),

    new_password: z
      .string()
      .min(8, { message: "La nueva contraseña debe tener al menos 8 caracteres" })
      .regex(regexSinEmojis, {
        message: "La nueva contraseña no debe contener emojis ni caracteres especiales",
      }),

    new_password_confirmation: z
      .string()
      .min(8, { message: "La confirmación debe tener al menos 8 caracteres" })
      .regex(regexSinEmojis, {
        message: "La confirmación no debe contener emojis ni caracteres especiales",
      }),
  })
  .refine((data) => data.new_password === data.new_password_confirmation, {
    message: "Las contraseñas no coinciden",
    path: ["new_password_confirmation"],
  });
