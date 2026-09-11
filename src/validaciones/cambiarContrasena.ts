import { z } from "zod";
import { confirmacionContrasenaSchema, contrasenaSchema } from "./contrasena";

export const cambiarContrasenaSchema = z
  .object({
    // La actual no se valida contra la política: fue válida cuando se creó, y quien la escribe mal
    // debe leer «contraseña incorrecta» del servidor, no un reproche sobre su forma.
    password: z.string().min(1, { message: "Escribe tu contraseña actual" }),

    // Mismas reglas que registro y recuperación. Antes prohibían los símbolos y no exigían
    // mayúscula ni número, así que esta pantalla rechazaba contraseñas que el servidor aceptaba.
    new_password: contrasenaSchema,
    new_password_confirmation: confirmacionContrasenaSchema,
  })
  .refine((data) => data.new_password === data.new_password_confirmation, {
    message: "Las contraseñas no coinciden",
    path: ["new_password_confirmation"],
  });
