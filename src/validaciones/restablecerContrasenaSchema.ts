import { z } from "zod";
import { confirmacionContrasenaSchema, contrasenaSchema } from "./contrasena";

export const restablecerContrasenaSchema = z.object({
  email: z.string().email({ message: "Correo no valido" }),
});

export const restablecerContrasenaSchema2 = z
  .object({
    email: z.string().email({ message: "Correo no valido" }),
    // Las reglas viven en `contrasena.ts`, que es lo que aplica también el registro. Antes esta
    // pantalla tenía las suyas: prohibía los símbolos y no exigía mayúscula ni número, así que
    // discrepaba del servidor en las dos direcciones a la vez.
    password: contrasenaSchema,
    password_confirmation: confirmacionContrasenaSchema,
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Las contraseñas no coinciden",
    path: ["password_confirmation"],
  });
