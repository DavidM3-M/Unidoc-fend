import { z } from "zod";

// Espejan los FormRequest del backend
// (RequestAdmin/RequestCatalogoProduccionAcademica y RequestAdmin/RequestTipoExperiencia).
//
// La unicidad del nombre no se valida aquí: solo la base de datos sabe qué hay registrado, así
// que ese error llega como 422 y se muestra con el mensaje que devuelve el backend.

export const productoAcademicoSchema = z.object({
  nombre_producto_academico: z
    .string()
    .trim()
    .min(1, { message: "El nombre es obligatorio" })
    .max(255, { message: "Máximo 255 caracteres" }),

  activo: z.boolean(),
});

export type ProductoAcademicoFormInputs = z.infer<typeof productoAcademicoSchema>;

// `producto_academico_id` no está en el formulario: sale del producto seleccionado en la tabla
// maestro y se agrega al enviar.
export const ambitoDivulgacionSchema = z.object({
  nombre_ambito_divulgacion: z
    .string()
    .trim()
    .min(1, { message: "El nombre es obligatorio" })
    .max(255, { message: "Máximo 255 caracteres" }),

  activo: z.boolean(),
});

export type AmbitoDivulgacionFormInputs = z.infer<typeof ambitoDivulgacionSchema>;

export const tipoExperienciaSchema = z.object({
  // 100 y no 255: es el largo de `tipo_experiencias.nombre_tipo_experiencia`.
  nombre_tipo_experiencia: z
    .string()
    .trim()
    .min(1, { message: "El nombre es obligatorio" })
    .max(100, { message: "Máximo 100 caracteres" }),

  activo: z.boolean(),
});

export type TipoExperienciaFormInputs = z.infer<typeof tipoExperienciaSchema>;

// Texto libre a propósito en ambos campos: sin lista fija SNIES ni cruce entre
// nivel_academico y nivel_formacion (decisión del Administrador).
export const nivelFormacionAcademicaSchema = z.object({
  nivel_academico: z
    .string()
    .trim()
    .min(1, { message: "El nivel académico es obligatorio" })
    .max(100, { message: "Máximo 100 caracteres" }),

  nivel_formacion: z
    .string()
    .trim()
    .min(1, { message: "El nivel de formación es obligatorio" })
    .max(100, { message: "Máximo 100 caracteres" }),

  // Jerarquía del escalafón. Vacío = el nivel no participa (formación complementaria).
  orden: z
    .string()
    .trim()
    .optional()
    .refine((val) => !val || /^\d+$/.test(val), { message: "Debe ser un número entero" })
    .refine((val) => !val || Number(val) <= 999, { message: "Máximo 999" }),

  activo: z.boolean(),
});

export type NivelFormacionAcademicaFormInputs = z.infer<typeof nivelFormacionAcademicaSchema>;

export const programaFormacionEducativaSchema = z.object({
  nombre_programa: z
    .string()
    .trim()
    .min(1, { message: "El nombre del programa es obligatorio" })
    .max(255, { message: "Máximo 255 caracteres" }),

  titulo_otorgado: z.string().trim().max(255, { message: "Máximo 255 caracteres" }).optional(),

  institucion_nombre: z
    .string()
    .trim()
    .min(1, { message: "La institución es obligatoria" })
    .max(255, { message: "Máximo 255 caracteres" }),

  nivel_formacion_academica_id: z.coerce
    .number({ message: "Selecciona un nivel de formación" })
    .int()
    .positive({ message: "Selecciona un nivel de formación" }),

  activo: z.boolean(),
});

export type ProgramaFormacionEducativaFormInputs = z.infer<typeof programaFormacionEducativaSchema>;

export const idiomaSchema = z.object({
  nombre_idioma: z
    .string()
    .trim()
    .min(1, { message: "El nombre es obligatorio" })
    .max(100, { message: "Máximo 100 caracteres" }),

  activo: z.boolean(),
});

export type IdiomaFormInputs = z.infer<typeof idiomaSchema>;

// `idioma_catalogo_id` no está en el formulario: sale del idioma seleccionado en la tabla
// maestro y se agrega al enviar. `vigencia_meses` queda como texto y se convierte a número
// (o null si viene vacío) justo antes de enviarlo.
export const examenIdiomaSchema = z.object({
  nombre_examen: z
    .string()
    .trim()
    .min(1, { message: "El nombre es obligatorio" })
    .max(150, { message: "Máximo 150 caracteres" }),

  vigencia_meses: z
    .string()
    .trim()
    .optional()
    .refine((val) => !val || /^\d+$/.test(val), {
      message: "Debe ser un número entero de meses",
    })
    .refine((val) => !val || (Number(val) >= 1 && Number(val) <= 240), {
      message: "Entre 1 y 240 meses",
    }),

  activo: z.boolean(),
});

export type ExamenIdiomaFormInputs = z.infer<typeof examenIdiomaSchema>;

const NIVELES_MCER = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;

// `examen_idioma_id` no está en el formulario: sale del examen seleccionado.
export const rangoExamenIdiomaSchema = z
  .object({
    puntaje_min: z.coerce
      .number({ message: "Ingresa un puntaje" })
      .min(0, { message: "No puede ser negativo" })
      .max(9999.99, { message: "Puntaje demasiado alto" }),

    puntaje_max: z.coerce
      .number({ message: "Ingresa un puntaje" })
      .min(0, { message: "No puede ser negativo" })
      .max(9999.99, { message: "Puntaje demasiado alto" }),

    nivel_mcer: z.enum(NIVELES_MCER, { message: "Selecciona un nivel MCER" }),
  })
  .refine((data) => data.puntaje_max >= data.puntaje_min, {
    message: "El puntaje máximo debe ser mayor o igual al mínimo",
    path: ["puntaje_max"],
  });

export type RangoExamenIdiomaFormInputs = z.infer<typeof rangoExamenIdiomaSchema>;

// Espeja RequestEscalonDocente del backend. Todos los requisitos son opcionales en el
// formulario: dejarlos vacíos significa que ese escalón no exige ese requisito.
// idioma_catalogo_id y nivel_mcer_minimo van siempre juntos (el nivel es ambiguo sin decir de
// qué idioma), por eso el .refine() al final.
export const escalonDocenteSchema = z
  .object({
    nombre: z
      .string()
      .trim()
      .min(1, { message: "El nombre es obligatorio" })
      .max(50, { message: "Máximo 50 caracteres" }),

    orden: z.coerce.number({ message: "Ingresa el orden" }).int().min(1).max(100),

    formacion_minima: z.string().trim().max(100, { message: "Máximo 100 caracteres" }).optional(),

    idioma_catalogo_id: z
      .string()
      .trim()
      .optional()
      .refine((val) => !val || /^\d+$/.test(val), { message: "Selecciona un idioma" }),

    nivel_mcer_minimo: z.enum(NIVELES_MCER).optional().or(z.literal("")),

    puntaje_minimo: z
      .string()
      .trim()
      .optional()
      .refine((val) => !val || /^\d+$/.test(val), { message: "Debe ser un número entero" }),

    meses_minimos: z
      .string()
      .trim()
      .optional()
      .refine((val) => !val || /^\d+$/.test(val), { message: "Debe ser un número entero de meses" }),

    // Evaluación docente mínima (mismo campo real que asigna Apoyo Profesoral) exigida por
    // este escalón. Reemplaza el umbral único y global eliminado.
    evaluacion_minima: z
      .string()
      .trim()
      .optional()
      .refine((val) => !val || /^\d+(\.\d{1,2})?$/.test(val), { message: "Debe ser un número, ej. 4.0" })
      .refine((val) => !val || (Number(val) >= 0 && Number(val) <= 5), { message: "Debe estar entre 0 y 5" }),

    activo: z.boolean(),
  })
  .refine((data) => Boolean(data.idioma_catalogo_id) === Boolean(data.nivel_mcer_minimo), {
    message: "Selecciona el idioma y el nivel MCER juntos, o deja ambos vacíos",
    path: ["nivel_mcer_minimo"],
  });

export type EscalonDocenteFormInputs = z.infer<typeof escalonDocenteSchema>;

export const reglaExcepcionEscalonSchema = z.object({
  tipo_condicion: z.literal("formacion"),

  valor_condicion: z
    .string()
    .trim()
    .min(1, { message: "Indica el valor de la condición (ej. Doctorado)" })
    .max(100, { message: "Máximo 100 caracteres" }),

  escalon_otorgado_id: z.coerce
    .number({ message: "Selecciona un escalón" })
    .int()
    .positive({ message: "Selecciona un escalón" }),

  activo: z.boolean(),
});

export type ReglaExcepcionEscalonFormInputs = z.infer<typeof reglaExcepcionEscalonSchema>;
