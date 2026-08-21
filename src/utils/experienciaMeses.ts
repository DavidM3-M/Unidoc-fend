/**
 * Meses de una experiencia laboral.
 *
 * El servidor sigue derivando los meses de las fechas
 * (`MotorEscalafonDocenteService::calcularMesesUniautonoma`), pero el docente ahora declara
 * `meses_trabajados` porque el certificado puede decir otra cosa: contratos por horas, semestres
 * sueltos o vinculaciones con interrupciones hacen que "2020–2026" no sean 68 meses efectivos.
 *
 * Aquí vive el cálculo por fechas, que el formulario usa para prellenar el campo y para avisar
 * cuando el número declarado no coincide.
 */

const aFechaLocal = (fecha: string): Date | null => {
  const soloFecha = /^(\d{4})-(\d{2})-(\d{2})$/.exec((fecha ?? "").slice(0, 10));
  if (!soloFecha) return null;

  const [, anio, mes, dia] = soloFecha;
  return new Date(Number(anio), Number(mes) - 1, Number(dia));
};

/**
 * Meses completos entre dos fechas. Sin fecha final se cuenta hasta hoy (trabajo actual).
 * Devuelve null si la fecha de inicio falta o no se entiende, para distinguir "todavía no se
 * puede calcular" de "cero meses".
 */
export const mesesEntreFechas = (
  fechaInicio?: string | null,
  fechaFin?: string | null
): number | null => {
  const inicio = aFechaLocal(fechaInicio ?? "");
  if (!inicio) return null;

  const fin = fechaFin ? aFechaLocal(fechaFin) : new Date();
  if (!fin) return null;

  let meses = (fin.getFullYear() - inicio.getFullYear()) * 12 + (fin.getMonth() - inicio.getMonth());

  // Si todavía no se cumple el día del mes, ese mes no está completo.
  if (fin.getDate() < inicio.getDate()) meses -= 1;

  return Math.max(0, meses);
};

/**
 * Meses que muestra la tarjeta: el valor declarado si existe, y si no —registros anteriores al
 * campo— el cálculo por fechas, para no dejar el dato en blanco.
 */
export const mesesDeExperiencia = (experiencia: {
  meses_trabajados?: number | null;
  fecha_inicio?: string | null;
  fecha_finalizacion?: string | null;
}): number | null => {
  if (typeof experiencia.meses_trabajados === "number" && experiencia.meses_trabajados > 0) {
    return experiencia.meses_trabajados;
  }

  return mesesEntreFechas(experiencia.fecha_inicio, experiencia.fecha_finalizacion);
};

/** "68 meses" / "1 mes". */
export const textoMeses = (meses: number): string =>
  `${meses} ${meses === 1 ? "mes" : "meses"}`;

/**
 * Un mes de diferencia contra el cálculo por fechas es redondeo, no discrepancia: no vale la
 * pena avisar por eso.
 */
export const hayDiscrepanciaDeMeses = (
  declarados: number | null | undefined,
  calculados: number | null
): boolean => {
  if (typeof declarados !== "number" || calculados === null) return false;

  return Math.abs(declarados - calculados) > 1;
};
