import { z } from "zod";
import { TEXTO_LIBRE, MENSAJE_TEXTO_LIBRE } from "./textoLibre";

/**
 * El nivel MCER puede llegar de dos formas y el mensaje de error tiene que distinguirlas:
 *
 * - Examen con rangos: el formulario deriva el nivel del puntaje. Si quedó vacío habiendo
 *   puntaje, el problema real es el puntaje (no cae en ningún rango), no el nivel.
 * - Examen sin rangos o escrito a mano: el nivel es un select que el docente debe llenar.
 *
 * El backend hace la validación definitiva contra los rangos reales (`ValidaPuntajeYNivel`);
 * esto es solo para dar el aviso correcto antes de enviar.
 */
const exigirNivelOPuntaje = (
  data: { nivel?: string; puntaje_obtenido?: string },
  ctx: z.RefinementCtx
) => {
  if (data.nivel) return;

  if (data.puntaje_obtenido) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["puntaje_obtenido"],
      message: "Ese puntaje no corresponde a ningún rango del examen",
    });
    return;
  }

  ctx.addIssue({
    code: z.ZodIssueCode.custom,
    path: ["nivel"],
    message: "Seleccione un nivel",
  });
};

export const languageSchema = z.object({
  idioma: z
    .string()
    .min(1, { message: "Campo vacio" })
    .max(100, { message: "Máximo 100 caracteres" })
    .regex(TEXTO_LIBRE, {
      message: MENSAJE_TEXTO_LIBRE,
    }),
  // Id del catálogo, opcional: se llena solo al elegir del select — el usuario no lo llena directamente.
  idioma_catalogo_id: z.string().optional(),

  // Guarda el nombre del examen o entidad certificadora, no una institución larga. El mínimo
  // de 7 caracteres que tenía antes rechazaba IELTS (5), TOEFL (5), DELF (4) y DELE (4)
  // — incluso eligiéndolos del catálogo, porque el formulario copia aquí el nombre del examen.
  // El backend nunca impuso un mínimo y acepta hasta 255.
  institucion_idioma: z
    .string()
    .min(2, { message: "Mínimo 2 caracteres" })
    .max(150, { message: "Máximo 150 caracteres" }),
  examen_idioma_id: z.string().optional(),

  // Puntaje bruto del certificado. Solo aplica cuando el examen elegido tiene rangos
  // configurados; de ahí sale el nivel (ver `utils/idiomaCertificado`).
  puntaje_obtenido: z.string().optional(),

  // Ya no es obligatorio de entrada: cuando el examen tiene rangos, el formulario lo llena solo
  // a partir del puntaje. Qué exigir en cada caso lo decide el superRefine de abajo.
  nivel: z.string().optional(),

  fecha_certificado: z
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
}).superRefine(exigirNivelOPuntaje);

export const languageSchemaUpdate = z.object({
  idioma: z
    .string()
    .min(1, { message: "Campo vacio" })
    .max(100, { message: "Máximo 100 caracteres" })
    .regex(TEXTO_LIBRE, {
      message: MENSAJE_TEXTO_LIBRE,
    }),
  // Id del catálogo, opcional: se llena solo al elegir del select — el usuario no lo llena directamente.
  idioma_catalogo_id: z.string().optional(),

  // Guarda el nombre del examen o entidad certificadora, no una institución larga. El mínimo
  // de 7 caracteres que tenía antes rechazaba IELTS (5), TOEFL (5), DELF (4) y DELE (4)
  // — incluso eligiéndolos del catálogo, porque el formulario copia aquí el nombre del examen.
  // El backend nunca impuso un mínimo y acepta hasta 255.
  institucion_idioma: z
    .string()
    .min(2, { message: "Mínimo 2 caracteres" })
    .max(150, { message: "Máximo 150 caracteres" }),
  examen_idioma_id: z.string().optional(),

  // Puntaje bruto del certificado. Solo aplica cuando el examen elegido tiene rangos
  // configurados; de ahí sale el nivel (ver `utils/idiomaCertificado`).
  puntaje_obtenido: z.string().optional(),

  // Ya no es obligatorio de entrada: cuando el examen tiene rangos, el formulario lo llena solo
  // a partir del puntaje. Qué exigir en cada caso lo decide el superRefine de abajo.
  nivel: z.string().optional(),

  fecha_certificado: z
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
}).superRefine(exigirNivelOPuntaje);
