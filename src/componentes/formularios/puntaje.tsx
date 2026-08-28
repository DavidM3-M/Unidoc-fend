import { Sparkles } from "lucide-react";
import { TooltipPortal } from "../TooltipPortal";
import type { FaltanteEscalafon, ViaAscenso } from "../../types/escalafon";

type DetalleProps = {
  /** Texto ya redactado por el motor: se muestra tal cual. */
  razon?: string | null;
  /**
   * Criterios pendientes. Array plano, no agrupado por categoría: con el reglamento nuevo solo
   * hay un escalón objetivo a la vez.
   */
  faltantes?: FaltanteEscalafon[] | null;
  /** Nombre del escalón al que se aspira, para encabezar la lista. */
  escalonObjetivo?: string | null;
  /** `"excepcion"` salta todos los requisitos, antigüedad incluida — vale la pena distinguirlo. */
  via?: ViaAscenso;
  onVerCategorias?: () => void;
};

const TOOLTIP_ANCHO = 288; // w-72, ampliado para caber el detalle por campo

/**
 * Detalle de por qué el expediente todavía no alcanza el siguiente escalón.
 *
 * Se exporta porque la tarjeta de Hoja de vida no lo muestra dentro de una píldora sino junto a
 * una barra de progreso: el disparador cambia de sitio, pero el contenido es el mismo.
 */
export const TooltipRazonPuntaje = ({
  razon,
  faltantes,
  escalonObjetivo,
  via,
  onVerCategorias,
}: DetalleProps) => {
  const pendientes = faltantes ?? [];

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
          {/* Por excepción `faltantes` viene vacío y la antigüedad puede ser 0: sin decirlo, la
              lista vacía parecería un error de carga. */}
          {via === "excepcion" && (
            <div className="mb-2 flex items-start gap-1.5 rounded-md bg-white/10 p-2">
              <Sparkles className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[#f3d675]" />
              <p>
                <span className="font-semibold">Elegible por excepción.</span>{" "}
                {razon ?? "No se le exigen los requisitos del escalón siguiente."}
              </p>
            </div>
          )}

          {pendientes.length > 0 ? (
            <div>
              <p className="font-semibold">
                {escalonObjetivo ? `Para llegar a ${escalonObjetivo}:` : "Requisitos pendientes:"}
              </p>
              <ul className="mt-0.5 list-disc pl-3.5 space-y-0.5">
                {pendientes.map((item) => (
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
          ) : (
            // Por excepción la razón ya se mostró arriba.
            via !== "excepcion" && razon
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
