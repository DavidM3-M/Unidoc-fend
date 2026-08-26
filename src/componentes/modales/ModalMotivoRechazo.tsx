import { useState, useEffect, ReactNode } from "react";
import { X, XCircle, Loader2 } from "lucide-react";

type Props = {
  open: boolean;
  title?: string;
  description?: string;
  loading?: boolean;
  onClose: () => void;
  onConfirm: (motivo: string) => void;
  /**
   * Aviso que se pinta sobre el campo de motivo.
   *
   * Lo usa el Evaluador de Producción para decir el alcance de la decisión antes de confirmarla
   * —"se rechazarán los 2 documentos", "el puntaje baja de 19 a 9"—. Ese dato no cabe en
   * `description`, que es una sola línea de texto plano, y duplicar el modal para añadirlo habría
   * dejado dos versiones del mismo diálogo que se desincronizan.
   */
  children?: ReactNode;
  /** Texto del botón de confirmar. «Revertir aval» no es lo mismo que «Confirmar rechazo». */
  confirmLabel?: string;
  /** Icono del encabezado. Ámbar para la reversión de un aval, rojo para un rechazo. */
  tone?: "rechazo" | "reversion";
};

// Mismo patrón visual usado para rechazar avales en VerAspirantes.tsx /
// AvalesRectoria.tsx / AvalesVicerrectoria.tsx / VerPostulaciones.tsx.
const ModalMotivoRechazo = ({
  open,
  title = "Rechazar documento",
  description = "Indique el motivo por el cual se rechaza este documento.",
  loading = false,
  onClose,
  onConfirm,
  children,
  confirmLabel = "Confirmar rechazo",
  tone = "rechazo",
}: Props) => {
  const [motivo, setMotivo] = useState("");

  useEffect(() => {
    if (open) setMotivo("");
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70] p-4">
      <div className="bg-[#ffffff] rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-[rgba(30,58,95,0.09)]">
          <h3 className="text-lg font-bold text-[#1e3a5f] flex items-center gap-2">
            <XCircle
              className={tone === "reversion" ? "text-[#d97706]" : "text-[#f44336]"}
              size={20}
            />
            {title}
          </h3>
          <button
            onClick={onClose}
            className="text-[#6b7a8d] hover:text-[#1e3a5f] p-1 rounded"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-4">
          <p className="text-sm text-[#6b7a8d] mb-3">{description}</p>
          {children && <div className="mb-3">{children}</div>}
          <textarea
            className="w-full border border-[rgba(30,58,95,0.2)] rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] text-[#1e3a5f]"
            rows={4}
            placeholder="Escriba el motivo de rechazo..."
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            maxLength={1000}
          />
          <p className="text-xs text-[#6b7a8d] text-right mt-1">
            {motivo.length}/1000
          </p>
        </div>
        <div className="flex justify-end gap-2 p-4 border-t border-[rgba(30,58,95,0.09)] bg-[#f3ede1] rounded-b-xl">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#ffffff] text-[#1e3a5f] hover:bg-[#f0e8dd] text-sm border border-[rgba(30,58,95,0.09)]"
          >
            Cancelar
          </button>
          <button
            onClick={() => onConfirm(motivo.trim())}
            disabled={loading || !motivo.trim()}
            className="px-4 py-2 rounded-lg bg-[#f44336] text-white hover:bg-[#da190b] text-sm flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <XCircle size={14} />
            )}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalMotivoRechazo;
