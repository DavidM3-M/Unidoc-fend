import { TrashIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import Modal from "../../Modal";

type Props = {
  id: number;
  onConfirmDelete: (id: number, motivo: string) => void;
};

// A diferencia de EliminarBoton (genérico, sin motivo), el backend exige un
// motivo (mínimo 5 caracteres) para eliminar una contratación, tanto en
// /admin/eliminar-contratacion como en /talentoHumano/eliminar-contratacion.
// Este componente es exclusivo de Contrataciones-Admin y no reemplaza a
// EliminarBoton en otros módulos.
const EliminarContratacionAdminModal = ({ id, onConfirmDelete }: Props) => {
  const [open, setOpen] = useState(false);
  const [motivo, setMotivo] = useState("");

  const motivoValido = motivo.trim().length >= 5;

  const handleClose = () => {
    setOpen(false);
    setMotivo("");
  };

  return (
    <>
      <button
        className="flex items-center justify-center w-10 h-10 bg-[#F0F2F5] rounded-lg text-[#121417] hover:bg-[#E0E4E8] transition duration-300 ease-in-out"
        onClick={() => setOpen(true)}
      >
        <TrashIcon className="size-10 p-2 rounded-lg bg-red-500 text-white" />
      </button>

      <Modal open={open} onClose={handleClose}>
        <div className="text-center w-72">
          <TrashIcon className="mx-auto text-red-500 size-12" />
          <div className="mx-auto my-4 w-full">
            <h3 className="text-lg font-black text-gray-800">
              Eliminar contratación
            </h3>
            <p className="text-sm text-gray-500 mb-3">
              Esta acción no se puede deshacer. Indique el motivo (mínimo 5
              caracteres) para dejar trazabilidad legal en la bitácora.
            </p>
            <textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              rows={3}
              placeholder="Motivo de la eliminación..."
              className="w-full border border-[rgba(30,58,95,0.09)] rounded-lg px-3 py-2 text-sm text-[#2c3e50] focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 focus:border-[#1e3a5f] resize-none bg-white text-left"
            />
            {!motivoValido && motivo.length > 0 && (
              <p className="text-xs text-red-500 mt-1 text-left">
                El motivo debe tener al menos 5 caracteres.
              </p>
            )}
          </div>
          <div className="flex gap-4">
            <button
              className="bg-red-500 text-white rounded-lg px-4 py-2 hover:bg-red-600 transition duration-300 ease-in-out w-full disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!motivoValido}
              onClick={() => {
                onConfirmDelete(id, motivo.trim());
                handleClose();
              }}
            >
              Eliminar
            </button>
            <button className="btn btn-light w-full" onClick={handleClose}>
              Cancelar
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default EliminarContratacionAdminModal;
