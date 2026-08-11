// Contrato de la evaluación docente tal como la devuelve el backend.
// La evaluación ya no es una autoevaluación: la asigna el rol "Apoyo Profesoral"
// y el docente solo puede consultarla.

export type EstadoEvaluacion = "Pendiente" | "Aprobado" | "Rechazado";

// Identidad mínima del funcionario que asignó la evaluación (auditoría).
export type AsignadaPor = {
  id: number;
  primer_nombre?: string | null;
  segundo_nombre?: string | null;
  primer_apellido?: string | null;
  segundo_apellido?: string | null;
};

export type EvaluacionAsignada = {
  id_evaluacion_docente: number;
  user_id: number;
  // La columna es decimal(3,1), así que Laravel la serializa como string ("4.5").
  promedio_evaluacion_docente: string | number;
  estado_evaluacion_docente: EstadoEvaluacion;
  asignado_por: number | null;
  fecha_asignacion: string | null;
  // Solo llega si el endpoint hace eager-load de la relación `asignadaPor`.
  asignada_por?: AsignadaPor | null;
};

/** Arma el nombre del asignador; devuelve null si no vino la relación. */
export const nombreAsignador = (asignador?: AsignadaPor | null): string | null => {
  if (!asignador) return null;

  const nombre = [
    asignador.primer_nombre,
    asignador.segundo_nombre,
    asignador.primer_apellido,
    asignador.segundo_apellido,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  return nombre || null;
};
