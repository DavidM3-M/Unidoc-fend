import { z } from "zod";

export const certificadosSchema = z
  .object({
    institucion: z
      .string()
      .min(7, { message: "Minimo 7 caracteres" })
      .max(50, { message: "Máximo 50 caracteres" }),
    titulo_estudio: z
      .string()
      .min(7, { message: "Minimo 7 caracteres" })
      .max(50, { message: "Máximo 50 caracteres" }),

    fecha_inicio: z
      .string({
        invalid_type_error: "Esa no es una fecha",
      })
      .refine((val) => !isNaN(Date.parse(val)), {
        message: "Formato de fecha incorrecto",
      })
      .refine(
        (val) => {
          const fecha = new Date(val);
          const hoy = new Date();
          // Nos aseguramos de comparar solo año, mes y día (sin hora)
          hoy.setHours(0, 0, 0, 0);
          return fecha < hoy;
        },
        {
          message: "La fecha no puede ser hoy ni una fecha futura",
        }
      ),
    fecha_fin: z
      .string({
        invalid_type_error: "Esa no es una fecha",
      })
      .refine((val) => val === "" || !isNaN(Date.parse(val)), {
        message: "Formato de fecha incorrecto",
      })
      .optional(),
    docentes: z
      .array(
        z
          .number({ invalid_type_error: "Debe seleccionar docentes válidos" })
          .int("El número de docentes debe ser entero")
          .positive("El número de docentes debe ser positivo")
      )
      .min(1, "Debes seleccionar al menos un docente"),
  })
  .refine(
    (data) => {
      if (data.fecha_fin) {
        const fechaInicio = new Date(data.fecha_inicio);
        const fechaFin = new Date(data.fecha_fin);
        return fechaFin > fechaInicio;
      }
      return true; // Si no hay fecha de fin, la validación pasa
    },
    {
      message: "La fecha de fin debe ser posterior a la fecha de inicio",
    }
  );
