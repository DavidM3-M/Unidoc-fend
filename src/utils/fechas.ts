/**
 * Formatea una fecha ISO del backend a dd/mm/aaaa.
 *
 * Devuelve null cuando no hay fecha o no se puede interpretar, para que quien la
 * use decida qué mostrar en su lugar (normalmente "—").
 */
export const formatearFecha = (fecha?: string | null): string | null => {
  if (!fecha) return null;

  const parsed = new Date(fecha);
  if (isNaN(parsed.getTime())) return null;

  return parsed.toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

/** Fecha de hoy en formato YYYY-MM-DD según la zona horaria local (para inputs type="date"). */
export const hoyISO = (): string => {
  const ahora = new Date();
  // No se usa toISOString(): convierte a UTC y en zonas negativas como Colombia
  // devuelve el día anterior durante buena parte de la tarde.
  const mes = `${ahora.getMonth() + 1}`.padStart(2, "0");
  const dia = `${ahora.getDate()}`.padStart(2, "0");

  return `${ahora.getFullYear()}-${mes}-${dia}`;
};
