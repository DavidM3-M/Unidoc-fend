// Umbral mínimo de evaluación docente exigido para ascender de categoría.
// Lo configura el Administrador; no se edita ni se borra: registrar uno nuevo
// cierra el anterior con `vigencia_hasta` y conserva el histórico.

export type CreadorUmbral = {
  id: number;
  primer_nombre?: string | null;
  primer_apellido?: string | null;
};

export type UmbralEvaluacion = {
  // Ausente en la respuesta "por defecto", cuando todavía no hay ningún registro.
  id_umbral_evaluacion?: number;
  valor_minimo: number;
  vigencia_desde?: string | null;
  // null = registro vigente.
  vigencia_hasta?: string | null;
  /**
   * El backend tiene la columna FK `creado_por` y la relación `creadoPor`, que Laravel
   * serializa con el mismo nombre; la relación pisa al atributo. Por eso aquí llega un
   * objeto cuando lo registró un administrador, y null cuando lo sembró el seeder
   * (valor de sistema). Se acepta también un número por si algún endpoint no carga
   * la relación.
   */
  creado_por?: CreadorUmbral | number | null;
  observaciones?: string | null;
  // true cuando no hay ningún umbral registrado y se aplica el valor por defecto (4.0).
  por_defecto?: boolean;
};

/** Nombre del administrador que registró el umbral; null si es un valor de sistema. */
export const nombreCreador = (
  creador?: CreadorUmbral | number | null
): string | null => {
  if (!creador || typeof creador === "number") return null;

  const nombre = [creador.primer_nombre, creador.primer_apellido]
    .filter(Boolean)
    .join(" ")
    .trim();

  return nombre || null;
};
