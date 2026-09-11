import React from "react";

type Props = {
  /** Nombre del criterio: "Puntaje del escalafón", "Evaluación docente". */
  etiqueta: string;
  /** Valor que tiene hoy el docente, respaldado por documentos aprobados. */
  actual: number;
  /**
   * Valor que exige el escalón objetivo. Nulo cuando el criterio ya está cumplido —el motor del
   * escalafón solo devuelve los faltantes— o cuando no hay escalón superior al que subir.
   */
  requerido?: number | null;
  /**
   * Valor declarado por el docente pero todavía sin aprobar, cuando supera a `actual`.
   *
   * Se dibuja como un tramo rayado más allá de la barra sólida: le dice al docente que su
   * certificado está en revisión, no perdido. Sin esto, un docente con 96 meses declarados y 84
   * aprobados ve una barra corta y concluye que el sistema le borró la experiencia.
   */
  pendiente?: number | null;
  /** Texto de la nota bajo la barra cuando hay tramo pendiente. */
  notaPendiente?: string;
  /** Texto tras el número: "puntos", "/ 5.0". Nunca la unidad sola sin contexto. */
  sufijo?: string;
  /** Tooltip de trazabilidad que cuelga de la etiqueta. */
  detalle?: React.ReactNode;
};

/**
 * Criterio del escalafón como barra de progreso.
 *
 * Antes el puntaje y la evaluación eran dos píldoras con un número suelto: "Puntaje: 24" no
 * dice si eso es mucho o poco. La barra los sitúa contra lo que exige el escalón objetivo,
 * que es la pregunta real del docente.
 *
 * Sin `requerido` no se dibuja barra. Es deliberado: inventar un máximo (100, por ejemplo)
 * daría una sensación de progreso que no corresponde a ninguna regla del escalafón.
 */
export const BarraProgreso = ({
  etiqueta,
  actual,
  requerido = null,
  pendiente = null,
  notaPendiente,
  sufijo = "",
  detalle,
}: Props) => {
  const hayMeta = typeof requerido === "number" && requerido > 0;
  const porcentaje = hayMeta
    ? Math.min(100, Math.max(0, (actual / requerido) * 100))
    : 100;
  const cumplido = !hayMeta || actual >= requerido;

  // Sin meta la barra se pinta llena y no hay contra qué dibujar un tramo: se exige `hayMeta`
  // aquí y no solo al calcular el ancho para que la nota no quede huérfana bajo una barra sin
  // raya. Pasa de verdad —el motor deja de mandar `requerido` en cuanto el criterio se cumple—.
  const hayPendiente =
    hayMeta && typeof pendiente === "number" && pendiente > actual;
  const porcentajePendiente = hayPendiente
    ? Math.min(100, Math.max(0, (pendiente / requerido) * 100))
    : 0;

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
        className="relative h-2 w-full overflow-hidden rounded-full bg-[#e8edf3]"
        role="progressbar"
        aria-label={etiqueta}
        aria-valuenow={actual}
        aria-valuemin={0}
        {...(hayMeta ? { "aria-valuemax": requerido } : {})}
      >
        {/* Tramo declarado sin aprobar: va debajo, rayado, para que no se confunda con lo
            que ya cuenta. */}
        {hayPendiente && (
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-[repeating-linear-gradient(45deg,#b9c6d8_0,#b9c6d8_3px,#dbe3ec_3px,#dbe3ec_6px)] transition-[width] duration-500 ease-out"
            style={{ width: `${porcentajePendiente}%` }}
          />
        )}

        <div
          className={`absolute inset-y-0 left-0 rounded-full transition-[width] duration-500 ease-out ${
            cumplido
              ? "bg-gradient-to-r from-[#2f7d54] to-[#3f9a6b]"
              : "bg-gradient-to-r from-[#1e3a5f] to-[#3a5a8f]"
          }`}
          style={{ width: `${porcentaje}%` }}
        />
      </div>

      {hayPendiente && notaPendiente && (
        <p className="flex items-center gap-1.5 text-[11px] text-[#6b7a8d]">
          <span className="h-2 w-3 flex-shrink-0 rounded-sm bg-[repeating-linear-gradient(45deg,#b9c6d8_0,#b9c6d8_3px,#dbe3ec_3px,#dbe3ec_6px)]" />
          {notaPendiente}
        </p>
      )}
    </div>
  );
};

export default BarraProgreso;
