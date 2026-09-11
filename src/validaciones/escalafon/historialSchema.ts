import { z } from "zod";
import { aFechaLocal } from "./escalafonSchema";

/**
 * Las dos intervenciones manuales del Administrador sobre el historial de escalafón.
 *
 * Solo él las tiene: Apoyo Profesoral aplica las reglas del escalafón, no arregla los datos. Las
 * reglas de aquí son las que se pueden juzgar mirando el formulario; todo lo que depende del
 * resto del expediente —si el periodo se solapa con otro tramo, si reabrirlo dejaría dos
 * vigentes, si el docente acredita contratación de planta— lo decide el backend y vuelve como un
 * 409 con el motivo redactado.
 */

/** Hoy a medianoche local, para comparar contra fechas `YYYY-MM-DD` sin arrastrar la hora. */
const hoy = (): Date => {
  const ahora = new Date();
  return new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
};

const motivo = z
  .string()
  .trim()
  .min(1, { message: "El motivo es obligatorio" })
  .max(1000, { message: "Máximo 1000 caracteres" });

/**
 * Ingreso manual: entrar al escalafón en el escalón y la fecha que decide el Administrador.
 *
 * El ingreso ordinario no pasa por aquí — lo dispara la contratación de planta y siempre entra
 * por el primer escalón—. Esto cubre lo que aquel no sabe hacer: el docente que llega con una
 * categoría ya reconocida, el reingreso tras una reversión y la carga de expedientes anteriores
 * al sistema.
 *
 * La fecha no puede ser futura: un ingreso siempre ocurrió ya. Es la diferencia con la
 * corrección, donde un periodo cerrado por adelantado sí puede dejar fechas por venir.
 */
export const ingresoManualSchema = z.object({
  escalon_id: z
    .string()
    .trim()
    .min(1, { message: "Selecciona el escalón de entrada" })
    .refine((val) => /^\d+$/.test(val), { message: "Selecciona el escalón" }),

  desde: z
    .string()
    .trim()
    .min(1, { message: "La fecha de ingreso es obligatoria" })
    .refine((val) => aFechaLocal(val) !== null, { message: "Fecha inválida" })
    .refine((val) => (aFechaLocal(val) ?? hoy()) <= hoy(), {
      message: "La fecha de ingreso no puede ser futura",
    }),

  motivo,
});

export type IngresoManualFormInputs = z.infer<typeof ingresoManualSchema>;

/**
 * Corrección de un tramo: escalón y/o fechas.
 *
 * Los tres campos son opcionales por separado pero hace falta al menos uno: una corrección que no
 * corrige nada escribiría una fila de bitácora con el mismo retrato antes y después, y avisaría
 * al docente de un cambio que no ocurrió.
 *
 * `hasta` vacío significa **reabrir** el tramo (dejarlo vigente), no "no tocarlo". Es una
 * distinción real y por eso el formulario la hace explícita con una casilla en vez de dejarla al
 * criterio de quien mira un campo de fecha en blanco.
 *
 * No se valida `desde <= hasta` contra el valor guardado cuando solo viaja uno de los dos: eso lo
 * comprueba el backend, que sí tiene el tramo delante.
 */
export const corregirTramoSchema = z
  .object({
    escalon_id: z
      .string()
      .trim()
      .refine((val) => val === "" || /^\d+$/.test(val), { message: "Selecciona el escalón" }),

    desde: z
      .string()
      .trim()
      .refine((val) => val === "" || aFechaLocal(val) !== null, { message: "Fecha inválida" }),

    hasta: z
      .string()
      .trim()
      .refine((val) => val === "" || aFechaLocal(val) !== null, { message: "Fecha inválida" }),

    /** Marcada, el tramo queda vigente y `hasta` se envía como `null`. */
    reabrir: z.boolean(),

    motivo,
  })
  .refine(
    (datos) => {
      const inicio = datos.desde ? aFechaLocal(datos.desde) : null;
      const fin = !datos.reabrir && datos.hasta ? aFechaLocal(datos.hasta) : null;
      return !inicio || !fin || inicio <= fin;
    },
    { path: ["hasta"], message: "La fecha de fin no puede ser anterior a la de inicio" }
  );

export type CorregirTramoFormInputs = z.infer<typeof corregirTramoSchema>;
