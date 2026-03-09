import { useState, useEffect } from "react";
import { X, Calendar, FileText, DollarSign, Plus, Edit, CheckCircle } from "lucide-react";
import axiosInstance from "../../../utils/axiosConfig";
import { toast } from "react-toastify";

interface ContratacionData {
  tipo_contrato: string;
  area: string;
  fecha_inicio: string;
  fecha_fin: string;
  valor_contrato: number | string;
  observaciones: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  userId?: number | string;
  editId?: number | string;
  initialDatos?: Partial<ContratacionData>;
  onContratacionAgregada?: () => void;
  onContratacionActualizada?: () => void;
}

const TIPOS_CONTRATO = ["Planta", "Ocasional", "Cátedra"];
const AREAS = [
  "Facultad de Ciencias Administrativas, Contables y Economicas",
  "Facultad de Ciencias Ambientales y Desarrollo Sostenible",
  "Facultad de Derecho, Ciencias Sociales y Politicas",
  "Facultad de Educacion",
  "Facultad de Ingenieria",
];

// Retorna la fecha de hoy en formato YYYY-MM-DD
const hoy = (): string => new Date().toISOString().split("T")[0];

const AgregarContratacionModal = ({
  isOpen,
  onClose,
  userId,
  editId,
  initialDatos,
  onContratacionAgregada,
  onContratacionActualizada,
}: Props) => {
  const isEdit = Boolean(editId);
  const [guardando, setGuardando] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, boolean>>({});

  const [datos, setDatos] = useState<ContratacionData>({
    tipo_contrato: "",
    area: "",
    fecha_inicio: "",
    fecha_fin: "",
    valor_contrato: "",
    observaciones: "",
  });

  useEffect(() => {
    if (!initialDatos) return;
    setDatos({
      tipo_contrato: initialDatos.tipo_contrato || "",
      area: initialDatos.area || "",
      fecha_inicio: initialDatos.fecha_inicio
        ? initialDatos.fecha_inicio.split("T")[0]
        : "",
      fecha_fin: initialDatos.fecha_fin
        ? initialDatos.fecha_fin.split("T")[0]
        : "",
      valor_contrato: initialDatos.valor_contrato || "",
      observaciones: initialDatos.observaciones || "",
    });
  }, [initialDatos]);

  const fieldCls = (field: string) =>
    `w-full px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none transition-colors ${
      validationErrors[field]
        ? "border-red-500 ring-2 ring-red-100 focus:ring-red-400"
        : "border-gray-300 focus:ring-green-500 focus:border-green-500"
    }`;

  const handleChange = (campo: keyof ContratacionData, valor: string | number) => {
    setDatos((prev) => ({ ...prev, [campo]: valor }));
    if (validationErrors[campo]) {
      setValidationErrors((prev) => ({ ...prev, [campo]: false }));
    }
  };

  const handleGuardar = async () => {
    const errors: Record<string, boolean> = {};
    const missing: string[] = [];

    if (!datos.tipo_contrato) { errors.tipo_contrato = true; missing.push("Tipo de Contrato"); }
    if (!datos.area) { errors.area = true; missing.push("Área"); }
    if (!datos.fecha_inicio) { errors.fecha_inicio = true; missing.push("Fecha de Inicio"); }
    if (!datos.fecha_fin) { errors.fecha_fin = true; missing.push("Fecha de Fin"); }
    if (!datos.valor_contrato) { errors.valor_contrato = true; missing.push("Valor del Contrato"); }

    if (missing.length > 0) {
      setValidationErrors(errors);
      toast.error("Faltan campos obligatorios: " + missing.join(", "));
      return;
    }

    // Validación: fecha inicio debe ser >= hoy
    if (datos.fecha_inicio) {
      if (datos.fecha_inicio < hoy()) {
        setValidationErrors({ ...errors, fecha_inicio: true });
        toast.error("La fecha de inicio no puede ser anterior a la fecha actual");
        return;
      }
    }

    // Validación: fecha fin debe ser mayor a fecha inicio
    if (datos.fecha_inicio && datos.fecha_fin) {
      if (new Date(datos.fecha_fin) <= new Date(datos.fecha_inicio)) {
        setValidationErrors({ ...errors, fecha_fin: true });
        toast.error("La fecha de fin debe ser mayor a la fecha de inicio");
        return;
      }
    }

    setValidationErrors({});
    setGuardando(true);

    try {
      const payload = {
        tipo_contrato: datos.tipo_contrato,
        area: datos.area,
        fecha_inicio: datos.fecha_inicio,
        fecha_fin: datos.fecha_fin,
        valor_contrato: Number(datos.valor_contrato),
        observaciones: datos.observaciones || null,
      };

      if (isEdit) {
        await axiosInstance.put(`/talentoHumano/actualizar-contratacion/${editId}`, payload);
        toast.success("Contratación actualizada correctamente");
        if (onContratacionActualizada) onContratacionActualizada();
      } else {
        await axiosInstance.post(`/talentoHumano/crear-contratacion/${userId}`, payload);
        toast.success("Contratación creada correctamente");
        if (onContratacionAgregada) onContratacionAgregada();
      }
      onClose();
    } catch (error: unknown) {
      console.error("Error al guardar contratación:", error);
      const err = error as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } };
      if (err?.response?.data?.errors) {
        Object.entries(err.response.data.errors).forEach(([campo, msgs]) => {
          toast.error(`${campo}: ${Array.isArray(msgs) ? msgs[0] : msgs}`);
        });
      } else {
        toast.error(err?.response?.data?.message || "Error al guardar la contratación");
      }
    } finally {
      setGuardando(false);
    }
  };

  const handleClose = () => {
    if (!guardando) onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        className="modal-content bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[95vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className={`sticky top-0 bg-gradient-to-r ${
            isEdit ? "from-orange-600 to-orange-700" : "from-green-600 to-green-700"
          } text-white px-6 py-4 flex justify-between items-center shadow-md z-10`}
        >
          <div className="flex items-center gap-3">
            {isEdit ? <Edit size={28} /> : <Plus size={28} />}
            <div>
              <h2 className="text-2xl font-bold">
                {isEdit ? "Editar Contratación" : "Agregar Nueva Contratación"}
              </h2>
              <p className={`text-sm ${isEdit ? "text-orange-100" : "text-green-100"}`}>
                {isEdit ? "Actualice los campos necesarios" : "Complete todos los campos requeridos"}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={guardando}
            className="p-2 hover:bg-white/20 rounded-full transition-colors disabled:opacity-50"
          >
            <X size={24} />
          </button>
        </div>

        {/* Contenido */}
        <div className="px-6 py-4 overflow-y-auto flex-1">
          <div className="space-y-6">

            {/* Sección: Información del Contrato */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
              <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FileText size={24} className="text-green-600" />
                Información del Contrato
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Contrato *
                  </label>
                  <select
                    value={datos.tipo_contrato}
                    onChange={(e) => handleChange("tipo_contrato", e.target.value)}
                    className={fieldCls("tipo_contrato")}
                  >
                    <option value="">Seleccione tipo de contrato</option>
                    {TIPOS_CONTRATO.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Área de Contratación *
                  </label>
                  <select
                    value={datos.area}
                    onChange={(e) => handleChange("area", e.target.value)}
                    className={fieldCls("area")}
                  >
                    <option value="">Seleccione un área</option>
                    {AREAS.map((a) => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Sección: Fechas */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Calendar size={24} className="text-purple-600" />
                Fechas del Contrato
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de Inicio *
                  </label>
                  <input
                    type="date"
                    value={datos.fecha_inicio}
                    min={hoy()}
                    onChange={(e) => handleChange("fecha_inicio", e.target.value)}
                    className={fieldCls("fecha_inicio")}
                  />
                  {validationErrors.fecha_inicio && (
                    <p className="text-red-500 text-xs mt-1">
                      La fecha de inicio no puede ser anterior a hoy
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de Fin *
                  </label>
                  <input
                    type="date"
                    value={datos.fecha_fin}
                    min={datos.fecha_inicio || hoy()}
                    onChange={(e) => handleChange("fecha_fin", e.target.value)}
                    className={fieldCls("fecha_fin")}
                  />
                  {validationErrors.fecha_fin && (
                    <p className="text-red-500 text-xs mt-1">
                      La fecha de fin debe ser mayor a la fecha de inicio
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Sección: Valor y Observaciones */}
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-6 rounded-xl border border-orange-200">
              <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <DollarSign size={24} className="text-orange-600" />
                Valor y Observaciones
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Valor del Contrato *
                  </label>
                  <input
                    type="number"
                    value={datos.valor_contrato}
                    onChange={(e) => handleChange("valor_contrato", e.target.value)}
                    className={fieldCls("valor_contrato")}
                    placeholder="Ej: 2500000"
                    step="0.01"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Observaciones
                  </label>
                  <input
                    type="text"
                    value={datos.observaciones}
                    onChange={(e) => handleChange("observaciones", e.target.value)}
                    className={fieldCls("observaciones")}
                    placeholder="Observaciones (opcional)"
                  />
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={handleClose}
            disabled={guardando}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleGuardar}
            disabled={guardando}
            className={`px-6 py-2 ${
              isEdit ? "bg-orange-600 hover:bg-orange-700" : "bg-green-600 hover:bg-green-700"
            } text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50`}
          >
            {guardando ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <CheckCircle size={16} />
            )}
            {guardando
              ? isEdit ? "Guardando..." : "Creando..."
              : isEdit ? "Guardar cambios" : "Crear Contratación"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AgregarContratacionModal;