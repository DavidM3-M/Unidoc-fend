import { z } from "zod";

// Mapeo de estados de convocatoria
export const mappeoEstadoConvocatoria = [
  { value: "Abierta", label: "Abierta" },
  { value: "Cerrada", label: "Cerrada" },
  { value: "Finalizada", label: "Finalizada" },
];

// Schema base sin los refinements (para reutilizar)
const convocatoriaBaseSchema = z.object({
  // Campos originales
  nombre_convocatoria: z
    .string()
    .min(1, "El nombre de la convocatoria es obligatorio")
    .max(255, "El nombre no debe exceder 255 caracteres"),
  
  tipo: z
    .string()
    .min(1, "El tipo es obligatorio")
    .max(255, "El tipo no debe exceder 255 caracteres"),
  
  fecha_publicacion: z
    .string()
    .min(1, "La fecha de publicación es obligatoria"),
  
  fecha_cierre: z
    .string()
    .min(1, "La fecha de cierre es obligatoria"),
  
  descripcion: z
    .string()
    .min(1, "La descripción es obligatoria"),
  
  estado_convocatoria: z.enum(["Abierta", "Cerrada", "Finalizada"], {
    errorMap: () => ({ message: "Selecciona un estado válido" }),
  }),

  // Nuevos campos obligatorios
  numero_convocatoria: z
    .string()
    .min(1, "El número de convocatoria es obligatorio")
    .max(255, "El número no debe exceder 255 caracteres"),
  
  periodo_academico: z
    .string()
    .min(1, "El período académico es obligatorio")
    .max(255, "El período no debe exceder 255 caracteres"),
  
  cargo_solicitado: z
    .string()
    .min(1, "El cargo solicitado es obligatorio")
    .max(255, "El cargo no debe exceder 255 caracteres"),
  
  facultad: z
    .string()
    .min(1, "La facultad es obligatoria")
    .max(255, "La facultad no debe exceder 255 caracteres"),
  
  cursos: z
    .string()
    .min(1, "Los cursos son obligatorios"),
  
  tipo_vinculacion: z
    .string()
    .min(1, "El tipo de vinculación es obligatorio")
    .max(255, "El tipo de vinculación no debe exceder 255 caracteres"),
  
  personas_requeridas: z
    .number({
      required_error: "El número de personas requeridas es obligatorio",
      invalid_type_error: "Debe ser un número válido",
    })
    .int("Debe ser un número entero")
    .min(1, "Debe requerir al menos 1 persona"),
  
  fecha_inicio_contrato: z
    .string()
    .min(1, "La fecha de inicio de contrato es obligatoria"),
  
  perfil_profesional: z
    .string()
    .min(1, "El perfil profesional es obligatorio"),
  
  experiencia_requerida: z
    .string()
    .min(1, "La experiencia requerida es obligatoria"),
  
  solicitante: z
    .string()
    .min(1, "El solicitante es obligatorio")
    .max(255, "El solicitante no debe exceder 255 caracteres"),
  
  aprobaciones: z
    .string()
    .min(1, "Las aprobaciones son obligatorias"),

  // Archivo opcional
  archivo: z
    .instanceof(FileList)
    .optional()
    .refine(
      (files) => {
        if (!files || files.length === 0) return true;
        return files[0].size <= 10 * 1024 * 1024; // 10MB
      },
      { message: "El archivo no debe superar los 10MB" }
    )
    .refine(
      (files) => {
        if (!files || files.length === 0) return true;
        const validTypes = [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ];
        return validTypes.includes(files[0].type);
      },
      { message: "El archivo debe ser PDF, DOC o DOCX" }
    ),
});

// Schema para crear con validaciones de fechas
export const convocatoriaSchema = convocatoriaBaseSchema
  .refine(
    (data) => {
      // Validar que fecha_cierre sea posterior a fecha_publicacion
      if (data.fecha_publicacion && data.fecha_cierre) {
        return new Date(data.fecha_cierre) > new Date(data.fecha_publicacion);
      }
      return true;
    },
    {
      message: "La fecha de cierre debe ser posterior a la fecha de publicación",
      path: ["fecha_cierre"],
    }
  )
  .refine(
    (data) => {
      // Validar que fecha_inicio_contrato sea posterior a fecha_cierre
      if (data.fecha_cierre && data.fecha_inicio_contrato) {
        return new Date(data.fecha_inicio_contrato) > new Date(data.fecha_cierre);
      }
      return true;
    },
    {
      message: "La fecha de inicio de contrato debe ser posterior a la fecha de cierre",
      path: ["fecha_inicio_contrato"],
    }
  );

// Schema para actualizar (mismo que crear)
export const convocatoriaSchemaUpdate = convocatoriaBaseSchema
  .refine(
    (data) => {
      if (data.fecha_publicacion && data.fecha_cierre) {
        return new Date(data.fecha_cierre) > new Date(data.fecha_publicacion);
      }
      return true;
    },
    {
      message: "La fecha de cierre debe ser posterior a la fecha de publicación",
      path: ["fecha_cierre"],
    }
  )
  .refine(
    (data) => {
      if (data.fecha_cierre && data.fecha_inicio_contrato) {
        return new Date(data.fecha_inicio_contrato) > new Date(data.fecha_cierre);
      }
      return true;
    },
    {
      message: "La fecha de inicio de contrato debe ser posterior a la fecha de cierre",
      path: ["fecha_inicio_contrato"],
    }
  );