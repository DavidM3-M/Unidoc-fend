import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axiosInstance from "../../../utils/axiosConfig";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable2 } from "../../../componentes/tablas/DataTable2";
import { toast } from "react-toastify";
import { ButtonRegresar } from "../../../componentes/formularios/ButtonRegresar";
import {
  Briefcase,
  Calendar,
  DollarSign,
  FileText,
  ClipboardList,
  Hash,
  User,
  Pencil,
  Trash2,
  Loader2,
  X,
  AlertTriangle,
} from "lucide-react";
import AgregarContratacionModal from "../../../componentes/modales/contrataciones/AgregarContratacionModal";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Contratacion {
  id_contratacion: number;
  user_id: number;
  tipo_contrato: string;
  area: string;
  fecha_inicio: string;
  fecha_fin: string;
  valor_contrato: number;
  observaciones?: string;
}

// ─── Componente ───────────────────────────────────────────────────────────────

const VerContratacionesPorUsuario = () => {
  const { user_id } = useParams<{ user_id: string }>();
  const [contrataciones, setContrataciones] = useState<Contratacion[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal editar
  const [modalEditar, setModalEditar] = useState(false);
  const [contratacionSeleccionada, setContratacionSeleccionada] = useState<Contratacion | null>(null);

  // Confirmación de eliminación (con motivo)
  const [confirmEliminar, setConfirmEliminar] = useState(false);
  const [idEliminar, setIdEliminar] = useState<number | null>(null);
  const [motivoEliminacion, setMotivoEliminacion] = useState("");
  const [loadingEliminar, setLoadingEliminar] = useState(false);

  // Confirmación de edición
  const [confirmEditar, setConfirmEditar] = useState(false);

  const fetchDatos = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/talentoHumano/obtener-contrataciones");
      const todasContrataciones = response.data.contrataciones;
      const filtradas = todasContrataciones.filter(
        (contrato: Contratacion) => contrato.user_id === Number(user_id)
      );
      setContrataciones(filtradas);
    } catch (error) {
      console.error("Error al obtener contrataciones:", error);
      toast.error("Error al cargar las contrataciones");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatos();
  }, [user_id]);

  // Abre la ventana de confirmación de eliminación
  const solicitarEliminar = (id: number) => {
    setIdEliminar(id);
    setMotivoEliminacion("");
    setConfirmEliminar(true);
  };

  // Ejecuta la eliminación enviando el motivo al backend
  const confirmarEliminar = async () => {
    if (idEliminar == null) return;
    if (motivoEliminacion.trim().length < 5) {
      toast.error("El motivo debe tener al menos 5 caracteres");
      return;
    }
    setLoadingEliminar(true);
    try {
      await axiosInstance.delete(`/talentoHumano/eliminar-contratacion/${idEliminar}`, {
        data: { motivo: motivoEliminacion.trim() },
      });
      setContrataciones((prev) =>
        prev.filter((item) => item.id_contratacion !== idEliminar)
      );
      toast.success("Contratación eliminada correctamente");
      setConfirmEliminar(false);
      setIdEliminar(null);
      setMotivoEliminacion("");
    } catch (error: any) {
      console.error("Error al eliminar contratación:", error);
      toast.error(error?.response?.data?.message || "Error al eliminar contratación");
    } finally {
      setLoadingEliminar(false);
    }
  };

  // Abre la ventana de confirmación de edición
  const handleEditar = (contratacion: Contratacion) => {
    setContratacionSeleccionada(contratacion);
    setConfirmEditar(true);
  };

  // Confirma la edición y abre el modal de edición
  const confirmarEditar = () => {
    setConfirmEditar(false);
    setModalEditar(true);
  };

  const columns = useMemo<ColumnDef<Contratacion>[]>(
    () => [
      {
        header: () => (
          <div className="flex items-center gap-2">
            <Hash className="w-4 h-4" />
            <span>ID Contratación</span>
          </div>
        ),
        accessorKey: "id_contratacion",
        cell: ({ row }) => (
          <span className="text-sm font-medium text-[#2c3e50]">
            {row.original.id_contratacion}
          </span>
        ),
      },
      {
        header: () => (
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span>ID Usuario</span>
          </div>
        ),
        accessorKey: "user_id",
        cell: ({ row }) => (
          <span className="text-sm text-[#2c3e50]">{row.original.user_id}</span>
        ),
      },
      {
        header: () => (
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            <span>Tipo de Contrato</span>
          </div>
        ),
        accessorKey: "tipo_contrato",
        cell: ({ row }) => (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-sm font-medium bg-[#e8740e]/20 text-[#e8740e] whitespace-nowrap">
            {row.original.tipo_contrato}
          </span>
        ),
      },
      {
        header: () => (
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span>Área</span>
          </div>
        ),
        accessorKey: "area",
        cell: ({ row }) => (
          <p
            className="text-sm text-[#2c3e50] max-w-[180px] truncate"
            title={row.original.area}
          >
            {row.original.area}
          </p>
        ),
      },
      {
        header: () => (
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>Inicio</span>
          </div>
        ),
        accessorKey: "fecha_inicio",
        cell: ({ row }) => (
          <span className="text-sm text-[#2c3e50] whitespace-nowrap">
            {new Date(row.original.fecha_inicio).toLocaleDateString()}
          </span>
        ),
      },
      {
        header: "Fin",
        accessorKey: "fecha_fin",
        cell: ({ row }) => (
          <span className="text-sm text-[#2c3e50] whitespace-nowrap">
            {new Date(row.original.fecha_fin).toLocaleDateString()}
          </span>
        ),
      },
      {
        header: () => (
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            <span>Valor</span>
          </div>
        ),
        accessorKey: "valor_contrato",
        cell: ({ row }) => (
          <span className="text-sm font-medium text-[#2c3e50] whitespace-nowrap">
            ${row.original.valor_contrato.toLocaleString()}
          </span>
        ),
      },
      {
        header: "Acciones",
        id: "acciones",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleEditar(row.original)}
              className="inline-flex items-center gap-1 bg-[#f3ede1]/50 hover:bg-[#ede6d8] text-[#1e3a5f] px-2 py-1.5 rounded-md text-sm font-medium transition-colors border border-[rgba(30,58,95,0.09)]"
              title="Editar contratación"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={() => solicitarEliminar(row.original.id_contratacion)}
              className="inline-flex items-center gap-1 bg-red-50 hover:bg-red-100 text-red-600 px-2 py-1.5 rounded-md text-sm font-medium transition-colors border border-red-200"
              title="Eliminar contratación"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ),
      },
    ],
    []
  );

  return (
    <div className="flex flex-col gap-4 h-full w-full bg-white rounded-3xl p-4 sm:p-6 lg:p-8 min-h-screen border border-[rgba(30,58,95,0.09)]">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link to="/talento-humano/aspirantes-aprobados">
            <ButtonRegresar />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1e3a5f]">
              Contrato del Docente
            </h1>
            <p className="text-sm text-[#6b7a8d] mt-1">
              Contratos registrados para este usuario
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-[#f3ede1]/50 border border-[rgba(30,58,95,0.09)] rounded-xl px-4 py-2">
          <ClipboardList className="w-5 h-5 text-[#1e3a5f]" />
          <span className="text-sm font-semibold text-[#1e3a5f]">
            {contrataciones.length} contrato(s)
          </span>
        </div>
      </div>

      {/* Tabla */}
      <DataTable2
        data={contrataciones}
        columns={columns}
        loading={loading}
      />

      {/* Mensaje si no hay contratos */}
      {!loading && contrataciones.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-[#6b7a8d]">
          <ClipboardList className="w-12 h-12 mb-3 opacity-40" />
          <p className="text-base font-medium">
            No se encontraron contrataciones para este usuario.
          </p>
        </div>
      )}

      {/* Modal Editar */}
      {contratacionSeleccionada && (
        <AgregarContratacionModal
          isOpen={modalEditar}
          onClose={() => {
            setModalEditar(false);
            setContratacionSeleccionada(null);
          }}
          editId={contratacionSeleccionada.id_contratacion}
          initialDatos={{
            tipo_contrato: contratacionSeleccionada.tipo_contrato,
            area: contratacionSeleccionada.area,
            fecha_inicio: contratacionSeleccionada.fecha_inicio,
            fecha_fin: contratacionSeleccionada.fecha_fin,
            valor_contrato: contratacionSeleccionada.valor_contrato,
            observaciones: contratacionSeleccionada.observaciones,
          }}
          onContratacionActualizada={() => {
            fetchDatos();
            setModalEditar(false);
            setContratacionSeleccionada(null);
          }}
        />
      )}

      {/* Modal de confirmación de eliminación (con motivo) */}
      {confirmEliminar && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70] p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-bold text-[#2c3e50] flex items-center gap-2">
                <AlertTriangle className="text-red-600" size={20} />
                Eliminar contratación
              </h3>
              <button
                onClick={() => setConfirmEliminar(false)}
                className="text-[#6b7a8d] hover:text-[#2c3e50] p-1 rounded"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4">
              <p className="text-sm text-[#2c3e50] mb-3">
                ¿Está seguro de que desea eliminar esta contratación? Esta acción no se puede
                deshacer. Indique el motivo de la eliminación.
              </p>
              <textarea
                className="w-full border border-[rgba(30,58,95,0.09)] rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-500/30"
                rows={4}
                placeholder="Escriba el motivo de la eliminación..."
                value={motivoEliminacion}
                onChange={(e) => setMotivoEliminacion(e.target.value)}
                maxLength={1000}
              />
              <p className={`text-xs text-right mt-1 ${motivoEliminacion.trim().length > 0 && motivoEliminacion.trim().length < 5 ? 'text-red-500' : 'text-[#6b7a8d]'}`}>
                {motivoEliminacion.trim().length < 5 ? 'Mínimo 5 caracteres · ' : ''}{motivoEliminacion.length}/1000
              </p>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t bg-[#f3ede1]/50 rounded-b-xl">
              <button
                onClick={() => setConfirmEliminar(false)}
                className="px-4 py-2 rounded-lg bg-[#f3ede1] text-[#2c3e50] hover:bg-[#ede6d8] text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={() => void confirmarEliminar()}
                disabled={loadingEliminar || motivoEliminacion.trim().length < 5}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 text-sm flex items-center gap-2 disabled:opacity-50"
              >
                {loadingEliminar ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación de edición */}
      {confirmEditar && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70] p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-bold text-[#2c3e50] flex items-center gap-2">
                <Pencil className="text-[#e8740e]" size={18} />
                Editar contratación
              </h3>
              <button
                onClick={() => {
                  setConfirmEditar(false);
                  setContratacionSeleccionada(null);
                }}
                className="text-[#6b7a8d] hover:text-[#2c3e50] p-1 rounded"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4">
              <p className="text-sm text-[#2c3e50]">
                ¿Está seguro de que desea editar esta contratación?
              </p>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t bg-[#f3ede1]/50 rounded-b-xl">
              <button
                onClick={() => {
                  setConfirmEditar(false);
                  setContratacionSeleccionada(null);
                }}
                className="px-4 py-2 rounded-lg bg-[#f3ede1] text-[#2c3e50] hover:bg-[#ede6d8] text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarEditar}
                className="px-4 py-2 rounded-lg bg-[#e8740e] text-white hover:bg-[#c65a00] text-sm flex items-center gap-2"
              >
                <Pencil size={14} />
                Editar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerContratacionesPorUsuario;