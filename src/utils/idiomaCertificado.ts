/**
 * Utilidades del certificado de idioma, compartidas por Agregar y Editar idioma.
 *
 * El nivel MCER dejó de ser algo que el docente declara: sale del puntaje del examen según los
 * rangos que el Administrador configuró en Catálogos → Idiomas. Aquí solo se calcula la **vista
 * previa** mientras el usuario escribe; el valor que se guarda siempre lo recalcula el servidor
 * (ver `Aspirante\IdiomaController::resolverCatalogos()`), así que esto nunca es la autoridad.
 */

export type RangoExamen = {
  puntaje_min: number;
  puntaje_max: number;
  nivel_mcer: string;
};

export type ExamenOpcion = {
  id: number;
  nombre: string;
  vigencia_meses: number | null;
  rangos: RangoExamen[];
};

/** Nivel MCER que corresponde a un puntaje, o null si no cae en ningún rango. */
export const nivelSegunPuntaje = (rangos: RangoExamen[], puntaje: string): string | null => {
  if (!puntaje.trim()) return null;

  const valor = Number(puntaje);
  if (Number.isNaN(valor)) return null;

  const rango = rangos.find((r) => valor >= r.puntaje_min && valor <= r.puntaje_max);

  return rango?.nivel_mcer ?? null;
};

/** Texto del rango total aceptado por el examen, ej. "4 – 9". */
export const rangoTotal = (rangos: RangoExamen[]): string | null => {
  if (rangos.length === 0) return null;

  const minimo = Math.min(...rangos.map((r) => r.puntaje_min));
  const maximo = Math.max(...rangos.map((r) => r.puntaje_max));

  return `${minimo} – ${maximo}`;
};

export type Vigencia = {
  venceEl: Date;
  vencido: boolean;
};

/**
 * Cuándo vence el certificado, a partir de la fecha de expedición y los meses de vigencia del
 * examen. `vigenciaMeses` nulo significa que no vence (ej. Cambridge), y devuelve null.
 */
export const calcularVigencia = (
  fechaCertificado: string,
  vigenciaMeses: number | null | undefined
): Vigencia | null => {
  if (!fechaCertificado || !vigenciaMeses) return null;

  const emitido = new Date(fechaCertificado);
  if (Number.isNaN(emitido.getTime())) return null;

  const venceEl = new Date(emitido);
  venceEl.setMonth(venceEl.getMonth() + vigenciaMeses);

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  return { venceEl, vencido: venceEl < hoy };
};

export const formatearFecha = (fecha: Date): string =>
  fecha.toLocaleDateString("es-CO", { day: "2-digit", month: "2-digit", year: "numeric" });
