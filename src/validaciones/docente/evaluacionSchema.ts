import { z } from "zod";

export const evaluacionSchema = z.object({
  promedio_evaluacion_docente: z
    .number()
    .positive("El promedio debe ser un número positivo")
    .max(5.0, "El promedio no puede ser mayor a 5.0")
    .refine((value) => Number(value.toFixed(2)) === value, {
      message: "Solo se permiten hasta dos decimales",
    }),
});
