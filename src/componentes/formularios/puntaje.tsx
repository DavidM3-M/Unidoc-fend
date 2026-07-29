import { useRef, useState } from "react";
import { createPortal } from "react-dom";

type Faltante = {
  campo: string;
  mensaje: string;
  requerido?: string | number | null;
  actual?: string | number | null;
};

type FaltantesPorCategoria = Record<string, Faltante[]>;

type Props = {
  value?: string;
  razon?: string | null;
  faltantes?: FaltantesPorCategoria | null;
  onVerCategorias?: () => void;
  className?: string;
}

const TOOLTIP_ANCHO = 288; // w-72, ampliado para caber el detalle por campo
const TOOLTIP_MARGEN = 8;

// Mismo patrón de tooltip-vía-portal que TooltipMotivoRechazo (Estado.tsx):
// el widget de puntaje puede vivir dentro de contenedores con overflow
// recortado, así que se dibuja hacia <body>.
const TooltipRazonPuntaje = ({
  razon,
  faltantes,
  onVerCategorias,
}: {
  razon?: string | null;
  faltantes?: FaltantesPorCategoria | null;
  onVerCategorias?: () => void;
}) => {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  const mostrar = () => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const centro = rect.left + rect.width / 2;
    const left = Math.min(
      Math.max(centro, TOOLTIP_ANCHO / 2 + TOOLTIP_MARGEN),
      window.innerWidth - TOOLTIP_ANCHO / 2 - TOOLTIP_MARGEN
    );

    setPos({ top: rect.top, left });
  };

  const ocultar = () => setPos(null);

  const categorias = Object.entries(faltantes ?? {});

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={(e) => e.stopPropagation()}
        onMouseEnter={mostrar}
        onMouseLeave={ocultar}
        onFocus={mostrar}
        onBlur={ocultar}
        className="flex items-center justify-center w-4 h-4 rounded-full bg-white/90 text-[#1e3a5f] text-[10px] font-bold leading-none cursor-help"
        aria-label="Ver por qué no tiene más puntaje"
      >
        i
      </button>

      {pos &&
        createPortal(
          <div
            role="tooltip"
            style={{ top: pos.top - 8, left: pos.left, width: TOOLTIP_ANCHO }}
            // pointer-events-auto (a diferencia de TooltipMotivoRechazo) porque
            // este tooltip incluye un link clicable; se mantiene abierto mientras
            // el mouse esté sobre el ícono O sobre el propio tooltip.
            className="fixed z-[1000] -translate-x-1/2 -translate-y-full rounded-lg bg-[#1e3a5f] px-3 py-2 text-xs font-normal leading-snug text-white shadow-lg pointer-events-auto"
            onMouseEnter={mostrar}
            onMouseLeave={ocultar}
          >
            {categorias.length > 0 ? (
              categorias.map(([categoria, items]) => (
                <div key={categoria} className="mb-1.5 last:mb-0">
                  <p className="font-semibold">Para llegar a {categoria}:</p>
                  <ul className="mt-0.5 list-disc pl-3.5 space-y-0.5">
                    {items.map((item) => (
                      <li key={item.campo}>
                        {item.mensaje}
                        {(item.requerido ?? null) !== null && (
                          <span className="opacity-80">
                            {" "}
                            (requiere {item.requerido}
                            {item.actual !== undefined && item.actual !== null
                              ? `, actual ${item.actual}`
                              : ""}
                            )
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            ) : (
              razon
            )}

            {onVerCategorias && (
              <button
                type="button"
                onClick={() => {
                  ocultar();
                  onVerCategorias();
                }}
                className="mt-1.5 block underline decoration-white/50 hover:decoration-white text-[#f3d675] hover:text-white cursor-pointer"
              >
                Ver todas las categorías →
              </button>
            )}

            <span className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-[#1e3a5f]" />
          </div>,
          document.body
        )}
    </>
  );
};

export const Puntaje = ({className=" ", value, razon, faltantes, onVerCategorias, ...props}: Props) => {
  const tieneDetalle =
    !!razon || (faltantes && Object.keys(faltantes).length > 0) || !!onVerCategorias;

  return (
    <p
      {...props}
      className={`${className} flex items-center gap-1.5 text-base font-semibold rounded-xl text-white bg-[#1e3a5f] w-fit px-6 py-1`}
    >
      Puntaje: {value}
      {tieneDetalle && (
        <TooltipRazonPuntaje
          razon={razon}
          faltantes={faltantes}
          onVerCategorias={onVerCategorias}
        />
      )}
    </p>
  )
}