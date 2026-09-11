import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { useNotificaciones } from "../../hooks/useNotificaciones";
import PanelNotificaciones from "./PanelNotificaciones";

/**
 * La campana del encabezado.
 *
 * La usan cuatro roles —Aspirante, Docente, Apoyo Profesoral y Evaluador de Producción— desde tres
 * encabezados distintos, así que lo único que cambia entre ellos es a dónde lleva «Ver todas»:
 * cada rol tiene su propio árbol de rutas protegidas y `/notificaciones` a secas solo existe para
 * los tres primeros.
 */

type Props = {
  rutaVerTodas: string;
  /** El encabezado móvil no tiene el mismo espacio que la barra de escritorio. */
  className?: string;
};

const CampanaNotificaciones = ({ rutaVerTodas, className = "" }: Props) => {
  const { notificaciones, noLeidas, cargando, error, recargar, marcarLeida, marcarTodasLeidas } =
    useNotificaciones();

  const [abierto, setAbierto] = useState(false);
  const contenedor = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!abierto) return;

    const fueraDelPanel = (e: MouseEvent) => {
      if (contenedor.current && !contenedor.current.contains(e.target as Node)) setAbierto(false);
    };
    const escape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAbierto(false);
    };

    document.addEventListener("mousedown", fueraDelPanel);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("mousedown", fueraDelPanel);
      document.removeEventListener("keydown", escape);
    };
  }, [abierto]);

  const abrir = () => {
    // Se refresca al abrir, no solo cada minuto: si el usuario acaba de hacer algo en otra pestaña
    // esperar hasta el siguiente sondeo haría ver la campana desactualizada justo cuando la mira.
    if (!abierto) recargar();
    setAbierto((a) => !a);
  };

  return (
    <div className={`relative flex items-center ${className}`} ref={contenedor}>
      <button
        type="button"
        onClick={abrir}
        aria-label={noLeidas > 0 ? `Notificaciones, ${noLeidas} sin leer` : "Notificaciones"}
        aria-expanded={abierto}
        className="relative rounded-full p-2 text-[#6b7a8d] transition-colors hover:bg-[rgba(30,58,95,0.06)] hover:text-[#1e3a5f] focus:outline-none"
      >
        <Bell size={20} />

        {noLeidas > 0 && (
          // Por encima de 9 el globo dejaría de caber sobre el icono sin deformarlo.
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold leading-none text-white">
            {noLeidas > 9 ? "9+" : noLeidas}
          </span>
        )}
      </button>

      {abierto && (
        <PanelNotificaciones
          notificaciones={notificaciones}
          noLeidas={noLeidas}
          cargando={cargando}
          error={error}
          rutaVerTodas={rutaVerTodas}
          onLeer={marcarLeida}
          onLeerTodas={marcarTodasLeidas}
          onRecargar={recargar}
          onCerrar={() => setAbierto(false)}
        />
      )}
    </div>
  );
};

export default CampanaNotificaciones;
