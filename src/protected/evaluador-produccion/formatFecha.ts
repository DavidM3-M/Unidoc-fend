/** Fecha corta en español, tolerante a nulos y a fechas inválidas. */
export const formatFecha = (fecha: string | null | undefined): string => {
  if (!fecha) return "—";
  const d = new Date(fecha);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("es-CO", { year: "numeric", month: "short", day: "2-digit" });
};
