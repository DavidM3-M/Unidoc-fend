import React from "react";

type Props = {
  /** Nombre del criterio: "Puntaje del escalafón", "Evaluación docente". */
  etiqueta: string;
  /** Valor que tiene hoy el docente. */
  actual: number;
  /**
   * Valor que exige la siguiente categoría. Nulo cuando el criterio ya está cumplido —el motor
   * del escalafón solo devuelve los faltantes— o cuando no hay categoría superior a la que subir.
   */
  requerido?: number | null;
  /** Texto tras el número: "puntos", "/ 5.0". Nunca la unidad sola sin contexto. */
  sufijo?: string;
  /** Tooltip de trazabilidad que cuelga de la etiqueta. */
  detalle?: React.ReactNode;
};

/**
 * Criterio del escalafón como barra de progreso.
 *
 * Antes el puntaje y la evaluación eran dos píldoras con un número suelto: "Puntaje: 24" no
 * dice si eso es mucho o poco. La barra los sitúa contra lo que exige la siguiente categoría,
 * que es la pregunta real del docente.
 *
 * Sin `requerido` no se dibuja barra. Es deliberado: inventar un máximo (100, por ejemplo)
 * daría una sensación de progreso que no corresponde a ninguna regla del escalafón.
 */
export const BarraProgreso = ({
  etiqueta,
  actual,
  requerido = null,
  sufijo = "",
  detalle,
}: Props) => {
  const hayMeta = typeof requerido === "number" && requerido > 0;
  const porcentaje = hayMeta
    ? Math.min(100, Math.max(0, (actual / requerido) * 100))
    : 100;
  const cumplido = !hayMeta || actual >= requerido;

  return (
    <div className="flex flex-col gap-2 min-w-0">
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#6b7a8d]">
          {etiqueta}
          {detalle}
        </span>

        <span className="text-sm font-bold text-[#1e3a5f] tabular-nums whitespace-nowrap">
          {actual}
          {hayMeta && (
            <span className="font-semibold text-[#6b7a8d]"> / {requerido}</span>
          )}
          {sufijo && (
            <span className="ml-1 font-medium text-[#6b7a8d]">{sufijo}</span>
          )}
        </span>
      </div>

      <div
        className="h-2 w-full overflow-hidden rounded-full bg-[#e8edf3]"
        role="progressbar"
        aria-label={etiqueta}
        aria-valuenow={actual}
        aria-valuemin={0}
        {...(hayMeta ? { "aria-valuemax": requerido } : {})}
      >
        <div
          className={`h-full rounded-full transition-[width] duration-500 ease-out ${
            cumplido
              ? "bg-gradient-to-r from-[#2f7d54] to-[#3f9a6b]"
              : "bg-gradient-to-r from-[#1e3a5f] to-[#3a5a8f]"
          }`}
          style={{ width: `${porcentaje}%` }}
        />
      </div>
    </div>
  );
};

export default BarraProgreso;
