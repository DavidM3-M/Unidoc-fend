import { useEffect, useRef, useState } from "react";
import { Columns3, Check, RotateCcw } from "lucide-react";

export type ColumnaSeleccionable = {
  id: string;
  etiqueta: string;
  visible: boolean;
  /** Prioridad 1: identifica la fila o es la acción. No se puede apagar. */
  fija: boolean;
  /** La ocultó la franja, no la persona. Se anota para que no parezca que desapareció sola. */
  ocultaPorAncho: boolean;
};

type Props = {
  columnas: ColumnaSeleccionable[];
  onAlternar: (id: string) => void;
  onRestablecer: () => void;
  /** `true` cuando hay columnas ocultas: el contador se pinta en el naranja de acento. */
  hayOcultas: boolean;
};

/**
 * Desplegable de columnas visibles.
 *
 * `columnVisibility` ya estaba cableado al estado de `DataTable2` desde el principio, pero no
 * existía ninguna interfaz que lo tocara: media solución escrita y nadie podía usarla.
 *
 * Aparte de su utilidad directa, es lo que hace aceptable ocultar columnas automáticamente en
 * pantallas medianas: el dato no queda inaccesible, se vuelve a encender desde acá. Sin este
 * control, esconder columnas por ancho sería esconder información.
 */
const SelectorColumnas = ({ columnas, onAlternar, onRestablecer, hayOcultas }: Props) => {
  const [abierto, setAbierto] = useState(false);
  const contenedor = useRef<HTMLDivElement>(null);

  // Cierre al hacer clic fuera y con Escape: el desplegable se abre sobre una tabla con la que se
  // sigue interactuando, así que quedarse abierto estorba.
  useEffect(() => {
    if (!abierto) return;

    const fuera = (e: MouseEvent) => {
      if (!contenedor.current?.contains(e.target as Node)) setAbierto(false);
    };
    const escape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAbierto(false);
    };

    document.addEventListener("mousedown", fuera);
    document.addEventListener("keydown", escape);

    return () => {
      document.removeEventListener("mousedown", fuera);
      document.removeEventListener("keydown", escape);
    };
  }, [abierto]);

  const visibles = columnas.filter((c) => c.visible).length;

  return (
    <div className="relative" ref={contenedor}>
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        aria-expanded={abierto}
        aria-haspopup="true"
        className="inline-flex items-center gap-2 text-xs font-semibold text-[#1e3a5f] border border-[rgba(30,58,95,0.14)] rounded-lg px-2.5 py-1.5 bg-white hover:border-[#1e3a5f] focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 transition-colors"
      >
        <Columns3 size={13} />
        Columnas
        <span
          className={`font-normal tabular-nums ${
            hayOcultas ? "text-[#e8740e] font-semibold" : "text-[#6b7a8d]"
          }`}
        >
          {visibles} de {columnas.length}
        </span>
      </button>

      {abierto && (
        <div className="absolute right-0 top-full mt-2 z-30 w-60 bg-white border border-[rgba(30,58,95,0.14)] rounded-xl shadow-xl overflow-hidden">
          <div className="px-3 py-2 border-b border-[rgba(30,58,95,0.09)] flex items-center justify-between gap-2">
            <span className="text-[10.5px] uppercase tracking-wider text-[#6b7a8d] font-semibold">
              Mostrar columnas
            </span>
            {hayOcultas && (
              <button
                type="button"
                onClick={onRestablecer}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#1e3a5f] hover:text-[#e8740e] transition-colors"
              >
                <RotateCcw size={11} /> Todas
              </button>
            )}
          </div>

          <ul className="max-h-72 overflow-y-auto py-1">
            {columnas.map((columna) => (
              <li key={columna.id}>
                <button
                  type="button"
                  disabled={columna.fija}
                  onClick={() => onAlternar(columna.id)}
                  title={
                    columna.fija
                      ? "Esta columna identifica la fila o es su acción: no se puede ocultar."
                      : undefined
                  }
                  className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-left text-xs transition-colors ${
                    columna.fija
                      ? "text-[#b0b8c2] cursor-not-allowed"
                      : "text-[#2c3e50] hover:bg-[rgba(30,58,95,0.04)]"
                  }`}
                >
                  <span
                    className={`w-3.5 h-3.5 rounded border grid place-items-center shrink-0 ${
                      columna.visible
                        ? "bg-[#e8740e] border-[#e8740e]"
                        : "bg-white border-[rgba(30,58,95,0.25)]"
                    }`}
                  >
                    {columna.visible && <Check size={10} className="text-white" strokeWidth={3.5} />}
                  </span>
                  <span className="flex-1 truncate">{columna.etiqueta}</span>
                  {/* Se distingue lo que apagó la persona de lo que apagó el ancho de pantalla. */}
                  {columna.ocultaPorAncho && !columna.visible && (
                    <span className="text-[9.5px] text-[#6b7a8d] shrink-0">por ancho</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SelectorColumnas;
