import { useRef, useState } from "react";
import { createPortal } from "react-dom";

interface Documento {
  estado?: "pendiente" | "aprobado" | "rechazado";
  motivo_rechazo?: string | null;
}

interface Props {
  documentos: Documento[];
}

const capitalizar = (texto: string) =>
  texto.charAt(0).toUpperCase() + texto.slice(1);

// Mismos colores que ya usan las pantallas de verificación de
// Apoyo Profesoral (VerEstudiosDocente.tsx y hermanos) para el pill de estado.
const ESTILOS_ESTADO: Record<string, string> = {
  aprobado: "bg-green-50 text-green-700 border-green-200",
  rechazado: "bg-red-50 text-red-700 border-red-200",
  pendiente: "bg-amber-50 text-amber-700 border-amber-200",
};

const TOOLTIP_ANCHO = 240; // w-60
const TOOLTIP_MARGEN = 8;

// Se dibuja con un portal hacia <body> porque las tarjetas donde vive este
// componente tienen overflow-hidden (para la animación de la línea inferior):
// un tooltip posicionado dentro de la tarjeta quedaba recortado por ese borde.
const TooltipMotivoRechazo = ({ motivo }: { motivo: string }) => {
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
        className="flex items-center justify-center w-4 h-4 rounded-full bg-red-700 text-white text-[10px] font-bold leading-none cursor-help"
        aria-label="Ver motivo del rechazo"
      >
        i
      </button>

      {pos &&
        createPortal(
          <div
            role="tooltip"
            style={{ top: pos.top - 8, left: pos.left, width: TOOLTIP_ANCHO }}
            className="fixed z-[1000] -translate-x-1/2 -translate-y-full rounded-lg bg-[#1e3a5f] px-3 py-2 text-xs font-normal leading-snug text-white shadow-lg pointer-events-none"
          >
            {motivo}
            <span className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-[#1e3a5f]" />
          </div>,
          document.body
        )}
    </>
  );
};

const EstadoDocumento = ({ documentos }: Props) => {
  // Asegúrate de que el array no esté vacío
  if (!documentos || documentos.length === 0) return null;

  const { estado, motivo_rechazo } = documentos[0];
  if (!estado) return null;

  return (
    <div>
      <p className="flex items-center gap-1.5 flex-wrap">
        <span>Estado:</span>
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
            ESTILOS_ESTADO[estado] ?? "bg-gray-100 text-gray-700 border-gray-200"
          }`}
        >
          {capitalizar(estado)}
        </span>

        {estado === "rechazado" && motivo_rechazo && (
          <TooltipMotivoRechazo motivo={motivo_rechazo} />
        )}
      </p>

      {/* El tooltip depende de hover y en móvil no hay hover: el motivo del rechazo, que es la
          información más accionable de la tarjeta, quedaba sin forma de leerse. Se imprime
          también aquí, recortado a dos líneas; el tooltip sigue dando el texto completo. */}
      {estado === "rechazado" && motivo_rechazo && (
        <p className="mt-1.5 text-xs text-[#b3413a] leading-snug line-clamp-2">
          {motivo_rechazo}
        </p>
      )}
    </div>
  );
};

export default EstadoDocumento;
