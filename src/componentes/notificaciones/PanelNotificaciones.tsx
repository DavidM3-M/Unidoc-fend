import { Link } from "react-router-dom";
import { BellOff, CheckCheck, RotateCcw } from "lucide-react";
import ItemNotificacion from "./ItemNotificacion";
import type { Notificacion } from "../../types/notificaciones";

/**
 * El desplegable de la campana: las últimas ocho, sin paginar.
 *
 * Deliberadamente no es la lista completa. El panel sirve para enterarse y saltar a la pantalla
 * donde hay que hacer algo; revisar el historial es otra tarea y vive en «Ver todas».
 */

type Props = {
  notificaciones: Notificacion[];
  noLeidas: number;
  cargando: boolean;
  error: boolean;
  rutaVerTodas: string;
  onLeer: (id: string) => void;
  onLeerTodas: () => void;
  onRecargar: () => void;
  onCerrar: () => void;
};

const PanelNotificaciones = ({
  notificaciones,
  noLeidas,
  cargando,
  error,
  rutaVerTodas,
  onLeer,
  onLeerTodas,
  onRecargar,
  onCerrar,
}: Props) => (
  <div
    role="dialog"
    aria-label="Notificaciones"
    /*
     * En móvil se ancla a los bordes de la pantalla con `fixed`: el encabezado mide 412 px de ancho
     * y un desplegable de 360 px colgado del icono se sale por la derecha.
     */
    className="fixed left-2 right-2 top-16 z-50 rounded-xl border border-[rgba(30,58,95,0.1)] bg-white shadow-lg
               sm:absolute sm:left-auto sm:right-0 sm:top-[calc(100%-4px)] sm:w-[360px]"
  >
    <div className="flex items-center justify-between gap-2 border-b border-[rgba(30,58,95,0.1)] px-4 py-3">
      <h2 className="text-sm font-semibold text-[#1e3a5f]">
        Notificaciones
        {noLeidas > 0 && (
          <span className="ml-2 rounded-full bg-[rgba(30,58,95,0.08)] px-2 py-0.5 text-[11px] font-medium text-[#1e3a5f]">
            {noLeidas} sin leer
          </span>
        )}
      </h2>

      {noLeidas > 0 && (
        <button
          type="button"
          onClick={onLeerTodas}
          className="flex items-center gap-1 text-xs font-medium text-[#6b7a8d] transition-colors hover:text-[#1e3a5f]"
        >
          <CheckCheck size={14} />
          Marcar todas
        </button>
      )}
    </div>

    <div className="max-h-[60vh] divide-y divide-[rgba(30,58,95,0.06)] overflow-y-auto sm:max-h-[420px]">
      {cargando && notificaciones.length === 0 && (
        <p className="px-4 py-8 text-center text-sm text-[#6b7a8d]">Cargando…</p>
      )}

      {/* El error se muestra aquí y no en un toast: la campana es accesoria y no debe interrumpir. */}
      {!cargando && error && notificaciones.length === 0 && (
        <div className="px-4 py-8 text-center">
          <p className="text-sm text-[#6b7a8d]">No se pudieron cargar las notificaciones.</p>
          <button
            type="button"
            onClick={onRecargar}
            className="mx-auto mt-3 flex items-center gap-1 text-xs font-medium text-[#1e3a5f] hover:underline"
          >
            <RotateCcw size={14} />
            Reintentar
          </button>
        </div>
      )}

      {!cargando && !error && notificaciones.length === 0 && (
        <div className="px-4 py-10 text-center">
          <BellOff size={28} className="mx-auto text-[#c3ccd6]" aria-hidden="true" />
          <p className="mt-2 text-sm text-[#6b7a8d]">No tienes notificaciones.</p>
        </div>
      )}

      {notificaciones.map((n) => (
        <ItemNotificacion key={n.id} notificacion={n} onLeer={onLeer} onNavegar={onCerrar} />
      ))}
    </div>

    <div className="border-t border-[rgba(30,58,95,0.1)] px-4 py-2.5 text-center">
      <Link
        to={rutaVerTodas}
        onClick={onCerrar}
        className="text-xs font-medium text-[#1e3a5f] hover:underline"
      >
        Ver todas
      </Link>
    </div>
  </div>
);

export default PanelNotificaciones;
