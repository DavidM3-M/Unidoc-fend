import { z } from "zod";

/** Hoy a medianoche local, para comparar contra fechas `YYYY-MM-DD` sin arrastrar la hora. */
const hoy = (): Date => {
  const ahora = new Date();
  return new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
};

/** Convierte `YYYY-MM-DD` a fecha local. `new Date("2026-12-31")` la leería como UTC y restaría un día. */
export const aFechaLocal = (fecha: string): Date | null => {
  const partes = /^(\d{4})-(\d{2})-(\d{2})$/.exec((fecha ?? "").slice(0, 10));
  if (!partes) return null;

  const [, anio, mes, dia] = partes;
  return new Date(Number(anio), Number(mes) - 1, Number(dia));
};

/**
 * Periodo de ascenso: nombre y fecha de cierre, nada más.
 *
 * Deliberadamente **no hay fecha de apertura**: los docentes suben documentos cuando quieran, no
 * hay ventana de carga que abrir. La fecha de cierre es el corte con el que se congelan los
 * requisitos de todos los expedientes.
 *
 * @param fechaCierreUltimo Cierre del último periodo existente, cuando lo hay. El backend exige
 *   que el nuevo sea posterior; validarlo aquí ahorra un 422 que el funcionario ya podía evitar.
 */
export const periodoAscensoSchema = (fechaCierreUltimo?: string | null) =>
  z.object({
    nombre: z
      .string()
      .trim()
      .min(1, { message: "El nombre es obligatorio" })
      .max(100, { message: "Máximo 100 caracteres" }),

    fecha_cierre: z
      .string()
      .trim()
      .min(1, { message: "La fecha de cierre es obligatoria" })
      .refine((val) => aFechaLocal(val) !== null, { message: "Fecha inválida" })
      .refine((val) => (aFechaLocal(val) ?? hoy()) > hoy(), {
        message: "La fecha de cierre debe ser futura",
      })
      .refine(
        (val) => {
          const ultimo = fechaCierreUltimo ? aFechaLocal(fechaCierreUltimo) : null;
          const elegida = aFechaLocal(val);
          return !ultimo || !elegida || elegida > ultimo;
        },
        { message: "Debe ser posterior al cierre del último periodo" }
      ),
  });

export type PeriodoAscensoFormInputs = z.infer<ReturnType<typeof periodoAscensoSchema>>;

/** Ascenso: se ejecuta contra un periodo ya **cerrado**, nunca contra uno abierto. */
export const ascensoEscalafonSchema = z.object({
  periodo_ascenso_id: z
    .string()
    .trim()
    .min(1, { message: "Selecciona el periodo cerrado contra el que asciende" })
    .refine((val) => /^\d+$/.test(val), { message: "Selecciona el periodo" }),

  motivo: z.string().trim().max(255, { message: "Máximo 255 caracteres" }).optional(),
});

export type AscensoEscalafonFormInputs = z.infer<typeof ascensoEscalafonSchema>;
