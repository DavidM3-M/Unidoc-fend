import { TooltipPortal } from "../TooltipPortal";
import { formatearFecha } from "../../utils/fechas";
import {
  nombreAsignador,
  type EvaluacionAsignada,
} from "../../types/evaluacionDocente";

type Props = {
  /** Evaluación asignada por Apoyo Profesoral; null si aún no le han asignado ninguna. */
  evaluacion?: EvaluacionAsignada | null;
  className?: string;
};

/**
 * Badge de solo lectura con la evaluación del docente.
 *
 * El docente no puede modificarla: la asigna Apoyo Profesoral. El tooltip muestra
 * la trazabilidad (estado, quién la asignó y cuándo) según lo que devuelva la API;
 * la línea "Asignada por" solo aparece si el backend incluyó esa relación.
 */
/**
 * Trazabilidad de la evaluacion: estado, quien la asigno y cuando.
 *
 * Se exporta aparte del badge porque la tarjeta de Hoja de vida muestra la evaluacion como
 * barra de progreso y necesita el mismo detalle colgando de otro disparador. Devuelve null
 * cuando la API no incluyo ninguno de los tres datos, para no dejar un icono que no abre nada.
 */
export const TooltipEvaluacion = ({ evaluacion }: Props) => {
  const asignador = nombreAsignador(evaluacion?.asignada_por);
  const fecha = formatearFecha(evaluacion?.fecha_asignacion);
  const estado = evaluacion?.estado_evaluacion_docente;

  if (!estado && !asignador && !fecha) return null;

  return (
    <TooltipPortal
      ariaLabel="Ver detalle de la evaluacion"
      triggerClassName="bg-[#1e3a5f]/10 text-[#1e3a5f]"
    >
      {estado && (
        <p>
          <span className="font-semibold">Estado:</span> {estado}
        </p>
      )}
      {asignador && (
        <p>
          <span className="font-semibold">Asignada por:</span> {asignador}
        </p>
      )}
      {fecha && (
        <p>
          <span className="font-semibold">Fecha:</span> {fecha}
        </p>
      )}
    </TooltipPortal>
  );
};

export const Evaluacion = ({ className = " ", evaluacion }: Props) => {
  const asignador = nombreAsignador(evaluacion?.asignada_por);
  const fecha = formatearFecha(evaluacion?.fecha_asignacion);
  const estado = evaluacion?.estado_evaluacion_docente;
  const tieneDetalle = !!(estado || asignador || fecha);

  return (
    <p
      className={`${className} flex items-center gap-1.5 text-base font-semibold rounded-xl text-white bg-[#1e3a5f] w-fit px-6 py-1`}
    >
      Evaluación: {evaluacion ? evaluacion.promedio_evaluacion_docente : "Sin asignar"}
      {tieneDetalle && (
        <TooltipPortal
          ariaLabel="Ver detalle de la evaluación"
          triggerClassName="bg-white/90 text-[#1e3a5f]"
        >
          {estado && (
            <p>
              <span className="font-semibold">Estado:</span> {estado}
            </p>
          )}
          {asignador && (
            <p>
              <span className="font-semibold">Asignada por:</span> {asignador}
            </p>
          )}
          {fecha && (
            <p>
              <span className="font-semibold">Fecha:</span> {fecha}
            </p>
          )}
        </TooltipPortal>
      )}
    </p>
  );
};
