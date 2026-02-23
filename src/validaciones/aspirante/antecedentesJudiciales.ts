import { z } from "zod";


const regexSinEmojis = /^[\p{L}\p{N}\s-]+$/u;

const antecedentes_judiciales_estado = ["Sin Antecedentes", "Con Antecedentes"] as const;
export type EstadoAntecedentes = (typeof antecedentes_judiciales_estado)[number];

export const mappeoEstadoAntecedentes: { [key in EstadoAntecedentes]: string } = {
  "Sin Antecedentes": "Sin Antecedentes",
  "Con Antecedentes": "Con Antecedentes",
};

export const antecedentesSchema = z.object({
  fecha_validacion: z
    .string()
    .min(1, { message: "La fecha es requerida" })
    .refine((value) => !isNaN(Date.parse(value)), {
      message: "Debe ser una fecha válida",
    }),

  estado_antecedentes: z.enum(["Sin Antecedentes", "Con Antecedentes"], {
    errorMap: () => ({ message: "Seleccione un estado válido" }),
  }),

  archivo: z
    .any()
    .refine((files) => files?.length === 1, {
      message: "El archivo es requerido",
    })
    .refine((files) => files?.[0]?.type === "application/pdf", {
      message: "El archivo debe ser un PDF",
    })
    .refine((files) => files?.[0]?.size <= 2 * 1024 * 1024, {
      message: "El archivo no debe superar los 2MB",
    }),
});

export const antecedentesSchemaUpdate = z.object({
  fecha_validacion: z
    .string()
    .min(1, { message: "La fecha es requerida" })
    .refine((value) => !isNaN(Date.parse(value)), {
      message: "Debe ser una fecha válida",
    }),

  estado_antecedentes: z.enum(["Sin Antecedentes", "Con Antecedentes"], {
    errorMap: () => ({ message: "Seleccione un estado válido" }),
  }),

  archivo: z
    .any()
    .optional()
    .refine(
      (files) =>
        !files || files.length === 0 || files?.[0]?.type === "application/pdf",
      {
        message: "El archivo debe ser un PDF",
      },
    )
    .refine(
      (files) =>
        !files || files.length === 0 || files?.[0]?.size <= 2 * 1024 * 1024,
      {
        message: "El archivo no debe superar los 2MB",
      },
    ),
});
