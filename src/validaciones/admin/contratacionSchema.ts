import { z } from "zod";

export {
  mappeoAreaContratacion,
  mappeoTipoContratacion,
  mappeoTipoProceso,
  mappeoTipoVinculacion,
  contratacionSchemaUpdate,
} from "../talento-humano.ts/contratacionSchema";
export type {
  AreaContratacion,
  TipoContratacion,
  TipoProceso,
  TipoVinculacion,
} from "../talento-humano.ts/contratacionSchema";

const areas_contratacion = [
  "Facultad de Ciencias Administrativas, Contables y Economicas",
  "Facultad de Ciencias Ambientales y Desarrollo Sostenible",
  "Facultad de Derecho, Ciencias Sociales y Politicas",
  "Facultad de Educacion",
  "Facultad de Ingenieria",
] as const;
const tipoContratacion = ["Planta", "Ocasional", "Cátedra"] as const;
const tipoProceso = ["Contratacion", "Ascenso", "CambioCargo"] as const;
const tipoVinculacion = ["Docente", "Administrativo"] as const;

// Esquema de creación por Administrador: igual al de Talento Humano, pero
// con "motivo" siempre obligatorio, ya que el backend omite la validación de
// avales de convocatoria en este flujo y exige trazabilidad legal en la bitácora.
export const contratacionSchemaAdmin = z
  .object({
    tipo_proceso: z
      .enum(tipoProceso, {
        errorMap: () => ({ message: "Seleccione un tipo de proceso válido" }),
      })
      .default("Contratacion"),

    tipo_vinculacion: z
      .enum(tipoVinculacion, {
        errorMap: () => ({ message: "Seleccione el tipo de vinculación" }),
      })
      .default("Docente"),

    tipo_contrato: z.enum(tipoContratacion, {
      errorMap: () => ({ message: "Seleccione un tipo de contrato válido" }),
    }),

    area: z.enum(areas_contratacion, {
      errorMap: () => ({ message: "Seleccione un área válida" }),
    }),

    fecha_inicio: z
      .string({
        invalid_type_error: "Esa no es una fecha",
      })
      .refine((val) => !isNaN(Date.parse(val)), {
        message: "Formato de fecha incorrecto",
      }),

    fecha_fin: z
      .string({
        invalid_type_error: "Esa no es una fecha",
      })
      .refine((val) => !isNaN(Date.parse(val)), {
        message: "Formato de fecha incorrecto",
      }),

    valor_contrato: z
      .number({ invalid_type_error: "Debe ser un número" })
      .int({ message: "Debe ser un número entero" })
      .positive({ message: "Debe ser un número positivo" }),

    observaciones: z
      .string()
      .min(1, { message: "Campo vacío" })
      .max(1000, { message: "Máximo 1000 caracteres" }),

    motivo: z
      .string({ required_error: "El motivo es requerido" })
      .min(5, { message: "El motivo debe tener al menos 5 caracteres" })
      .max(500, { message: "El motivo no puede superar los 500 caracteres" }),
  })
  .refine(
    (data) => {
      const fechaInicio = new Date(data.fecha_inicio);
      const fechaFin = new Date(data.fecha_fin);
      return fechaFin >= fechaInicio;
    },
    {
      message:
        "La fecha de finalización no puede ser menor que la fecha de inicio",
      path: ["fecha_fin"],
    }
  );
