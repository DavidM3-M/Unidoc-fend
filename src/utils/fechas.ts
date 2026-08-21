/**
 * Formato de fechas para las tarjetas y detalles de la hoja de vida.
 *
 * Las tarjetas imprimían la fecha tal como llega del servidor (`2026-08-16`), mientras que los
 * modales de detalle sí la formateaban. Esto unifica ambos.
 */

/**
 * Las fechas del backend llegan como `YYYY-MM-DD` (columnas `date`, sin hora). `new Date()` las
 * interpreta como UTC medianoche, así que en Colombia (UTC-5) se muestran un día antes. Se
 * construye la fecha con los componentes sueltos para que quede en hora local.
 */
const aFechaLocal = (fecha: string): Date | null => {
  if (!fecha || fecha === "null") return null;

  const soloFecha = /^(\d{4})-(\d{2})-(\d{2})$/.exec(fecha.slice(0, 10));

  if (soloFecha) {
    const [, anio, mes, dia] = soloFecha;
    return new Date(Number(anio), Number(mes) - 1, Number(dia));
  }

  const parseada = new Date(fecha);
  return Number.isNaN(parseada.getTime()) ? null : parseada;
};

/** "16 ago 2026". Formato corto para las tarjetas, donde el espacio es escaso. */
export const fechaCorta = (fecha?: string | null): string => {
  const valor = aFechaLocal(fecha ?? "");
  if (!valor) return "Sin fecha";

  return valor.toLocaleDateString("es-CO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

/** "16 de agosto de 2026". Formato largo para los modales de detalle. */
export const fechaLarga = (fecha?: string | null): string => {
  const valor = aFechaLocal(fecha ?? "");
  if (!valor) return "Sin fecha";

  return valor.toLocaleDateString("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

/** Solo el año, para los rangos de experiencia ("2020 – Actual"). */
export const anio = (fecha?: string | null): string => {
  const valor = aFechaLocal(fecha ?? "");
  return valor ? String(valor.getFullYear()) : "—";
};

/**
 * "20/03/2025", o null cuando no hay fecha o no se entiende.
 *
 * Devuelve null (y no un texto de reserva) a propósito: quien la usa decide si oculta la línea
 * entera. La usan el badge de evaluación y la tabla de evaluaciones de Apoyo Profesoral, que
 * esconden el detalle cuando no hay ninguna fecha que mostrar.
 */
export const formatearFecha = (fecha?: string | null): string | null => {
  if (!fecha) return null;

  const valor = new Date(fecha);

  return Number.isNaN(valor.getTime())
    ? null
    : valor.toLocaleDateString("es-CO", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
};
