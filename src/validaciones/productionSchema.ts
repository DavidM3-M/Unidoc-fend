import { z } from "zod";
import { TEXTO_LIBRE, MENSAJE_TEXTO_LIBRE } from "./textoLibre";

// Identificadores con los que el Evaluador de Producción verifica la publicación sin pedirle
// documentos adicionales al docente. Los tres son opcionales: un libro o una ponencia
// institucional no tienen DOI, y las producciones ya registradas no tienen forma de rellenarlos.
//
// Se declaran una vez y se reparten a los dos esquemas (crear y actualizar): tenerlos escritos
// dos veces garantiza que tarde o temprano se desincronicen, que es lo que ya pasó con
// `medio_divulgacion`.
//
// `.or(z.literal(""))` en los tres: el input vacío entrega `""`, no `undefined`, así que sin esa
// alternativa un formulario donde el docente no llena el campo fallaría la validación de formato.
const identificadoresProduccion = {
  doi: z
    .string()
    // El backend acepta también la URL completa de doi.org y le recorta el resolvedor, así que
    // acá se admiten las dos formas en vez de obligar al docente a editar lo que pegó.
    .regex(/^(https?:\/\/(dx\.)?doi\.org\/|doi:\s*)?10\.\d{4,9}\/\S+$/i, {
      message: "El DOI debe tener la forma 10.xxxx/identificador",
    })
    .max(255, { message: "Máximo 255 caracteres" })
    .or(z.literal(""))
    .optional(),

  issn_isbn: z
    .string()
    .regex(/^[0-9]{4}-?[0-9]{3}[0-9Xx]$|^(97[89]-?)?[0-9]{1,5}-?[0-9]+-?[0-9]+-?[0-9Xx]$/, {
      message: "El ISSN lleva 8 caracteres (2145-9088) y el ISBN 10 o 13 dígitos",
    })
    .max(32, { message: "Máximo 32 caracteres" })
    .or(z.literal(""))
    .optional(),

  url_publicacion: z
    .string()
    .url({ message: "El enlace debe empezar por http:// o https://" })
    .max(500, { message: "Máximo 500 caracteres" })
    // `url()` de zod acepta javascript: y data:, que la ficha del evaluador renderizaría como un
    // enlace pulsable. El backend aplica la misma restricción con `url:http,https`.
    //
    // El `.refine()` va al final de la cadena a propósito: devuelve un ZodEffects, y sobre un
    // ZodEffects ya no existen `.max()` ni los demás métodos de ZodString.
    .refine((valor) => /^https?:\/\//i.test(valor), {
      message: "El enlace debe empezar por http:// o https://",
    })
    .or(z.literal(""))
    .optional(),
};

export const productionSchema = z.object({
  ...identificadoresProduccion,

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
  ...identificadoresProduccion,

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
