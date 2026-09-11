import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { CheckCircle2, Clock, Info, Megaphone, XCircle } from "lucide-react";
import type { Notificacion, TipoNotificacion } from "../../types/notificaciones";

/**
 * Una fila del panel de la campana.
 *
 * El icono y el color salen de `tipo`, no del texto: así el usuario distingue de un vistazo un
 * rechazo de un plazo sin tener que leer los ocho avisos. Las notificaciones viejas llegan sin
 * `tipo` y caen en «general», que es neutro a propósito.
 */

const ESTILOS: Record<
  TipoNotificacion,
  { Icono: typeof Info; color: string; fondo: string; etiqueta: string }
> = {
  general: { Icono: Info,         color: "text-[#6b7a8d]",   fondo: "bg-[rgba(30,58,95,0.06)]", etiqueta: "Aviso" },
  exito:   { Icono: CheckCircle2, color: "text-emerald-600", fondo: "bg-emerald-50",            etiqueta: "Aprobado" },
  rechazo: { Icono: XCircle,      color: "text-red-600",     fondo: "bg-red-50",                etiqueta: "Devuelto" },
  plazo:   { Icono: Clock,        color: "text-amber-600",   fondo: "bg-amber-50",              etiqueta: "Plazo" },
  accion:  { Icono: Megaphone,    color: "text-[#1e3a5f]",   fondo: "bg-[rgba(30,58,95,0.06)]", etiqueta: "Novedad" },
};

/** Fechas inválidas o ausentes no deben tumbar el panel entero. */
const haceCuanto = (iso: string): string => {
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return "";
  return formatDistanceToNow(fecha, { addSuffix: true, locale: es });
};

type Props = {
  notificacion: Notificacion;
  onLeer: (id: string) => void;
  /** Se cierra el panel al navegar; en la pantalla completa no hay nada que cerrar. */
  onNavegar?: () => void;
};

const ItemNotificacion = ({ notificacion, onLeer, onNavegar }: Props) => {
  const navigate = useNavigate();
  const { Icono, color, fondo, etiqueta } = ESTILOS[notificacion.tipo ?? "general"] ?? ESTILOS.general;

  const abrir = () => {
    onLeer(notificacion.id);
    if (notificacion.enlace) {
      onNavegar?.();
      navigate(notificacion.enlace);
    }
  };

  // Sin enlace sigue siendo pulsable: el clic es lo que la marca como leída.
  return (
    <button
      type="button"
      onClick={abrir}
      className={`w-full text-left flex gap-3 px-4 py-3 transition-colors hover:bg-[rgba(30,58,95,0.04)] ${
        notificacion.leida ? "" : "bg-[rgba(30,58,95,0.03)]"
      }`}
    >
      <span className={`shrink-0 size-8 rounded-full flex items-center justify-center ${fondo}`}>
        <Icono size={16} className={color} aria-hidden="true" />
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex items-start gap-2">
          <span
            className={`flex-1 text-sm leading-snug ${
              notificacion.leida ? "text-[#2c3e50]" : "font-semibold text-[#1e3a5f]"
            }`}
          >
            {notificacion.titulo ?? etiqueta}
          </span>

          {!notificacion.leida && (
            <span
              className="mt-1.5 shrink-0 size-2 rounded-full bg-[#1e3a5f]"
              aria-label="Sin leer"
            />
          )}
        </span>

        {notificacion.mensaje && (
          <span className="mt-0.5 block text-xs leading-relaxed text-[#6b7a8d] line-clamp-2">
            {notificacion.mensaje}
          </span>
        )}

        <span className="mt-1 block text-[11px] text-[#9aa7b5]">
          {haceCuanto(notificacion.created_at)}
        </span>
      </span>
    </button>
  );
};

export default ItemNotificacion;
