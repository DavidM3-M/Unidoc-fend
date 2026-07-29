import { useState, useEffect } from "react";
import { X, XCircle, Loader2 } from "lucide-react";

type Props = {
  open: boolean;
  title?: string;
  description?: string;
  loading?: boolean;
  onClose: () => void;
  onConfirm: (motivo: string) => void;
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
            <XCircle className="text-[#f44336]" size={20} />
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
            Confirmar rechazo
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalMotivoRechazo;
