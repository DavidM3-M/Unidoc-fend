import { z } from "zod";
import { hoyISO } from "../../utils/fechas";

// Espeja CrearUmbralEvaluacionRequest del backend.
export const umbralEvaluacionSchema = z.object({
  // Mismo rango y precisión que evaluacion_docentes.promedio_evaluacion_docente,
  // que es el campo contra el que se compara este umbral.
  valor_minimo: z
    .number({
      required_error: "El umbral es obligatorio",
      invalid_type_error: "El umbral es obligatorio",
    })
    .min(0, { message: "El umbral no puede ser menor a 0" })
    .max(5, { message: "El umbral no puede ser mayor a 5.0" })
    .refine((value) => Number(value.toFixed(1)) === value, {
      message: "Solo se permite un decimal",
    }),

  // No se permite retrodatar: alteraría categorías ya otorgadas. Se comparan cadenas
  // YYYY-MM-DD contra la fecha local de hoy para no rechazar el propio día por UTC.
  vigencia_desde: z
    .string()
    .min(1, { message: "La fecha de vigencia es obligatoria" })
    .refine((valor) => valor >= hoyISO(), {
      message: "La vigencia no puede iniciar en una fecha pasada",
    }),

  observaciones: z
    .string()
    .max(500, { message: "Máximo 500 caracteres" })
    .optional(),
});

export type UmbralFormInputs = z.infer<typeof umbralEvaluacionSchema>;
