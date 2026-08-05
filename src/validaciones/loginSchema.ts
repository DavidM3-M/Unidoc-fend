import z from 'zod'

export const loginSchema = z.object({
  email: z.string().email({ message: "Correo no valido" }),
  password: z.string().min(8, { message: "Contraseña muy corta" } )
})