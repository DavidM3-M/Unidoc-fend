import { ShieldCheck } from "lucide-react";
import { TooltipPortal } from "../TooltipPortal";

type Faltante = {
  campo: string;
  mensaje: string;
  requerido?: string | number | null;
  actual?: string | number | null;
};

type FaltantesPorCategoria = Record<string, Faltante[]>;

type DetalleProps = {
  razon?: string | null;
  faltantes?: FaltantesPorCategoria | null;
  onVerCategorias?: () => void;
  /** La categoría se conservó por no retroactividad pese a que subió la evaluación mínima exigida. */
  categoriaProtegida?: boolean;
};

type Props = DetalleProps & {
  value?: string;
  className?: string;
}

const TOOLTIP_ANCHO = 288; // w-72, ampliado para caber el detalle por campo

const TooltipRazonPuntaje = ({
  razon,
  faltantes,
  onVerCategorias,
  categoriaProtegida,
}: DetalleProps) => {
  const categorias = Object.entries(faltantes ?? {});

  return (
    // interactivo: el tooltip incluye un link clicable, así que debe seguir
    // abierto mientras el cursor viaja del ícono hacia él.
    <TooltipPortal
      ancho={TOOLTIP_ANCHO}
      interactivo
      ariaLabel="Ver por qué no tiene más puntaje"
      triggerClassName="bg-white/90 text-[#1e3a5f]"
    >
      {(cerrar) => (
        <>
          {/* Cuando la categoría está protegida, `razon` trae el mensaje de la no
              retroactividad; va primero y aparte porque abajo se muestran los
              faltantes de hoy, que son los que motivaron la protección. */}
          {categoriaProtegida && razon && (
            <div className="mb-2 flex items-start gap-1.5 rounded-md bg-white/10 p-2">
              <ShieldCheck className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[#f3d675]" />
              <p>
                <span className="font-semibold">Categoría protegida.</span> {razon}
              </p>
            </div>
          )}

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
            // Si está protegida, `razon` ya se mostró arriba.
            !categoriaProtegida && razon
          )}

          {onVerCategorias && (
            <button
              type="button"
              onClick={() => {
                cerrar();
                onVerCategorias();
              }}
              className="mt-1.5 block underline decoration-white/50 hover:decoration-white text-[#f3d675] hover:text-white cursor-pointer"
            >
              Ver todas las categorías →
            </button>
          )}
        </>
      )}
    </TooltipPortal>
  );
};

export const Puntaje = ({
  className = " ",
  value,
  razon,
  faltantes,
  onVerCategorias,
  categoriaProtegida,
  ...props
}: Props) => {
  const tieneDetalle =
    !!razon ||
    (faltantes && Object.keys(faltantes).length > 0) ||
    !!onVerCategorias ||
    !!categoriaProtegida;

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
          categoriaProtegida={categoriaProtegida}
        />
      )}
    </p>
  )
}
