import { z } from "zod";
import { TEXTO_LIBRE, MENSAJE_TEXTO_LIBRE } from "./textoLibre";


export const productionSchema = z.object({
  productos_academicos_id: z
    .number({ invalid_type_error: "El producto académico es requerido" })
    .int("El producto académico es requerido")
    .positive("El producto académico es requerido"),

  titulo: z
    .string()
    .min(7, { message: "Mínimo 7 caracteres" })
    .max(255, { message: "Máximo 255 caracteres" })
    .regex(TEXTO_LIBRE, {
      message: MENSAJE_TEXTO_LIBRE,
    }),

  ambito_divulgacion_id: z
    .number({ invalid_type_error: "El ambito de divulgación es requerido" })
    .int(" debe ser un entero")
    .positive("Selecciona una opcion válido"),

  numero_autores: z
    .number({ invalid_type_error: "Debe ser un número" })
    .int({ message: "Debe ser un número entero" })
    .max(127, {
      message: "Máximo 127 autores",
    })
    .positive({ message: "Debe ser un número positivo" }),

  // Guarda el nombre de la revista, editorial o evento. El mínimo de 7 caracteres rechazaba
  // nombres reales y cortos —"Google", "Nature", "IEEE"— e impedía volver a guardar registros
  // que ya existen con esos valores. El backend solo limita el máximo (255).
  medio_divulgacion: z
    .string()
    .min(2, { message: "Mínimo 2 caracteres" })
    .max(255, { message: "Máximo 255 caracteres" })
    .regex(TEXTO_LIBRE, {
      message: MENSAJE_TEXTO_LIBRE,
    }),

  fecha_divulgacion: z
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

  archivo: z
    // 1) forzamos que venga un FileList
    .instanceof(FileList, { message: "Debes subir un archivo" })

    // 2) al menos un fichero
    .refine((files) => files.length > 0, {
      message: "Debes subir un archivo",
    })

    // 3) tamaño máximo 2MB, pero sólo si hay fichero
    .refine(
      (files) => (files.length === 0 ? true : files[0].size <= 2 * 1024 * 1024),
      {
        message: "Archivo demasiado grande (máx 2MB)",
      }
    )

    // 4) solo PDF, pero sólo si hay fichero
    .refine(
      (files) =>
        files.length === 0 ? true : files[0].type === "application/pdf",
      {
        message: "Formato de archivo inválido (solo PDF permitido)",
      }
    ),
});

export const productionSchemaUpdate = z.object({
  titulo: z
    .string()
    .min(7, { message: "Mínimo 7 caracteres" })
    .max(255, { message: "Máximo 255 caracteres" })
    .regex(TEXTO_LIBRE, {
      message: MENSAJE_TEXTO_LIBRE,
    }),

  ambito_divulgacion_id: z
    .number({ invalid_type_error: "El ambito de divulgación es requerido" })
    .int("El ambito de divulgación es requerido")
    .positive("El ambito de divulgación es requerido"),
  numero_autores: z
    .number({ invalid_type_error: "Debe ser un número" })
    .int({ message: "Debe ser un número entero" })
    .max(127, {
      message: "Máximo 127 autores",
    })
    .positive({ message: "Debe ser un número positivo" }),

  // Guarda el nombre de la revista, editorial o evento. El mínimo de 7 caracteres rechazaba
  // nombres reales y cortos —"Google", "Nature", "IEEE"— e impedía volver a guardar registros
  // que ya existen con esos valores. El backend solo limita el máximo (255).
  medio_divulgacion: z
    .string()
    .min(2, { message: "Mínimo 2 caracteres" })
    .max(255, { message: "Máximo 255 caracteres" })
    .regex(TEXTO_LIBRE, {
      message: MENSAJE_TEXTO_LIBRE,
    }),

  fecha_divulgacion: z
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

  archivo: z
    .instanceof(FileList, {
      message: "Debes subir un archivo si quieres reemplazar el existente",
    })
    .optional()
    // 1) tamaño máximo 2MB, solo si hay fichero
    .refine(
      (files) =>
        (files?.length ?? 0) === 0 || files![0].size <= 2 * 1024 * 1024,
      { message: "Archivo demasiado grande (máx 2MB)" }
    )
    // 2) solo PDF, solo si hay fichero
    .refine(
      (files) =>
        (files?.length ?? 0) === 0 || files![0].type === "application/pdf",
      { message: "Formato de archivo inválido (solo PDF permitido)" }
    ),
});
