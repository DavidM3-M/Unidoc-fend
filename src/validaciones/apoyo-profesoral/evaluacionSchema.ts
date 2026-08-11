import { z } from "zod";

// Refleja App\Constants\ConstDocente\EstadoEvaluacionDocente del backend.
export const ESTADOS_EVALUACION = ["Pendiente", "Aprobado", "Rechazado"] as const;

// Mismas reglas que AsignarEvaluacionDocenteRequest: numeric|min:0|max:5|decimal:0,1.
export const evaluacionSchema = z.object({
  promedio_evaluacion_docente: z
    .number({
      required_error: "El promedio es obligatorio",
      invalid_type_error: "El promedio es obligatorio",
    })
    .min(0, { message: "El promedio no puede ser menor a 0" })
    .max(5, { message: "El promedio no puede ser mayor a 5.0" })
    .refine((value) => Number(value.toFixed(1)) === value, {
      message: "Solo se permite un decimal",
    }),
  estado_evaluacion_docente: z.enum(ESTADOS_EVALUACION, {
    required_error: "El estado es obligatorio",
    invalid_type_error: "Seleccione un estado válido",
  }),
});

export type EvaluacionFormInputs = z.infer<typeof evaluacionSchema>;
