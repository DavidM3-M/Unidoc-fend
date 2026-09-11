import { ReactNode, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const MARGEN = 8;

type Props = {
  /** Contenido del tooltip. Como función recibe `cerrar` para ocultarlo desde adentro. */
  children: ReactNode | ((cerrar: () => void) => ReactNode);
  /** Ancho fijo en px; también se usa para que el tooltip no se salga de la ventana. */
  ancho?: number;
  ariaLabel: string;
  /** Clases de color del ícono disparador (la forma y el tamaño ya vienen fijos). */
  triggerClassName?: string;
  /**
   * Mantiene abierto el tooltip mientras el cursor esté sobre él. Necesario cuando
   * el contenido tiene links o botones: se añade un pequeño retraso al cerrar para
   * que dé tiempo de moverse desde el ícono hasta el tooltip.
   */
  interactivo?: boolean;
};

/**
 * Ícono "i" con tooltip dibujado hacia <body> vía portal.
 *
 * El portal existe porque estos badges viven dentro de contenedores con overflow
 * recortado (celdas de tabla, tarjetas), donde un tooltip posicionado en el flujo
 * normal quedaría cortado.
 */
export const TooltipPortal = ({
  children,
  ancho = 240,
  ariaLabel,
  triggerClassName = "bg-[#1e3a5f] text-white",
  interactivo = false,
}: Props) => {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, []);

  const mostrar = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }

    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const centro = rect.left + rect.width / 2;
    const left = Math.min(
      Math.max(centro, ancho / 2 + MARGEN),
      window.innerWidth - ancho / 2 - MARGEN
    );

    setPos({ top: rect.top, left });
  };

  const ocultar = () => {
    if (!interactivo) {
      setPos(null);
      return;
    }

    hideTimeoutRef.current = setTimeout(() => setPos(null), 200);
  };

  const cerrar = () => {
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    setPos(null);
  };

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
        className={`flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold leading-none cursor-help ${triggerClassName}`}
        aria-label={ariaLabel}
      >
        i
      </button>

      {pos &&
        createPortal(
          <div
            role="tooltip"
            style={{ top: pos.top - 8, left: pos.left, width: ancho }}
            className={`fixed z-[1000] -translate-x-1/2 -translate-y-full rounded-lg bg-[#1e3a5f] px-3 py-2 text-xs font-normal leading-snug text-white shadow-lg ${
              interactivo ? "pointer-events-auto" : "pointer-events-none"
            }`}
            onMouseEnter={interactivo ? mostrar : undefined}
            onMouseLeave={interactivo ? ocultar : undefined}
          >
            {typeof children === "function" ? children(cerrar) : children}
            <span className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-[#1e3a5f]" />
          </div>,
          document.body
        )}
    </>
  );
};

export default TooltipPortal;
