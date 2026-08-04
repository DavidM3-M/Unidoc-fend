import { useEffect, useMemo, useState } from "react";
import axiosInstance from "../../../utils/axiosConfig";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "react-toastify";
import axios from "axios";
import EliminarContratacionAdminModal from "../../../componentes/modales/contrataciones-admin/EliminarContratacionAdminModal";
import { Link } from "react-router-dom";
import { ButtonRegresar } from "../../../componentes/formularios/ButtonRegresar";
import { DataTable2 } from "../../../componentes/tablas/DataTable2";
import {
  User,
  Briefcase,
  DollarSign,
  Calendar,
  Eye,
  Pencil,
} from "lucide-react";
import AgregarContratacionAdminModal from "../../../componentes/modales/contrataciones-admin/AgregarContratacionAdminModal";
import DetalleContratacionAdminModal from "../../../componentes/modales/contrataciones-admin/DetalleContratacionAdminModal";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface UsuarioContratacion {
  primer_nombre: string;
  primer_apellido: string;
  numero_identificacion: string;
}

interface Contratacion {
  id_contratacion: number;
  user_id: number;
  tipo_proceso?: string;
  tipo_vinculacion?: string;
  tipo_contrato: string;
  area: string;
  fecha_inicio: string;
  fecha_fin: string;
  valor_contrato: number;
  observaciones?: string;
  usuario_contratacion?: UsuarioContratacion;
}

// ─── Componente ───────────────────────────────────────────────────────────────

const VerContratacionesAdmin = () => {
  const [contrataciones, setContrataciones] = useState<Contratacion[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados modales
  const [modalDetalle, setModalDetalle] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [contratacionSeleccionada, setContratacionSeleccionada] = useState<Contratacion | null>(null);

  const fetchDatos = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/admin/obtener-contrataciones");
      setContrataciones(response.data.contrataciones);
    } catch (error) {
      console.error("Error al obtener contrataciones:", error);
      toast.error("Error al cargar las contrataciones");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatos();
  }, []);

  const handleEliminar = async (id: number, motivo: string) => {
    try {
      await axiosInstance.delete(
        `/admin/eliminar-contratacion/${id}?motivo=${encodeURIComponent(motivo)}`
      );
      setContrataciones((prev) =>
        prev.filter((item) => item.id_contratacion !== id)
      );
      toast.success("Contratación eliminada correctamente");
    } catch (error) {
      console.error("Error al eliminar contratación:", error);
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Error al eliminar contratación");
      } else {
        toast.error("Error inesperado al eliminar");
      }
    }
  };

  const handleVerDetalle = (contratacion: Contratacion) => {
    setContratacionSeleccionada(contratacion);
    setModalDetalle(true);
  };

  const handleEditar = (contratacion: Contratacion) => {
    setContratacionSeleccionada(contratacion);
    setModalEditar(true);
  };

  const columns = useMemo<ColumnDef<Contratacion>[]>(
    () => [
      {
        id: "nombre",
        header: () => (
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span>Nombre</span>
          </div>
        ),
        accessorFn: (row) =>
          `${row.usuario_contratacion?.primer_nombre ?? ""} ${row.usuario_contratacion?.primer_apellido ?? ""}`.trim(),
        cell: ({ row }) => {
          const u = row.original.usuario_contratacion;
          const nombre = u ? `${u.primer_nombre} ${u.primer_apellido}` : "No especificado";
          return (
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-[#1e3a5f]/20 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="h-4 w-4 text-[#1e3a5f]" />
              </div>
              <span className="text-sm font-medium text-[#2c3e50] whitespace-nowrap">{nombre}</span>
            </div>
          );
        },
      },
      {
        id: "identificacion",
        header: "Identificación",
        accessorFn: (row) => row.usuario_contratacion?.numero_identificacion || "N/A",
        cell: ({ row }) => (
          <span className="text-sm text-[#2c3e50]">
            {row.original.usuario_contratacion?.numero_identificacion || "N/A"}
          </span>
        ),
      },
      {
        header: () => (
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            <span>Proceso</span>
          </div>
        ),
        accessorKey: "tipo_proceso",
        cell: ({ row }) => {
          const proceso = row.original.tipo_proceso;
          const colorMap: Record<string, string> = {
            Contratacion: 'bg-[#1e3a5f]/20 text-[#1e3a5f]',
            Ascenso: 'bg-[#c89b14]/20 text-[#c89b14]',
            CambioCargo: 'bg-[#e8740e]/20 text-[#e8740e]',
          };
          const labelMap: Record<string, string> = {
            Contratacion: 'Contratación',
            Ascenso: 'Ascenso',
            CambioCargo: 'Cambio cargo',
          };
          return proceso ? (
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${colorMap[proceso] ?? 'bg-[#f3ede1]/50 text-[#2c3e50]'}`}>
              {labelMap[proceso] ?? proceso}
            </span>
          ) : null;
        },
      },
      {
        header: () => (
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            <span>Tipo</span>
          </div>
        ),
        accessorKey: "tipo_contrato",
        cell: ({ row }) => (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-sm font-medium bg-[#1e3a5f]/20 text-[#1e3a5f] whitespace-nowrap">
            {row.original.tipo_contrato}
          </span>
        ),
      },
      {
        header: "Área",
        accessorKey: "area",
        cell: ({ row }) => (
          <p className="text-sm text-[#2c3e50] max-w-[160px] truncate" title={row.original.area}>
            {row.original.area}
          </p>
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
        header: "Acciones",
        id: "acciones",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleVerDetalle(row.original)}
              className="inline-flex items-center gap-1 bg-[#f3ede1]/50 hover:bg-[#ede6d8] text-[#1e3a5f] px-2 py-1.5 rounded-md text-sm font-medium transition-colors border border-[rgba(30,58,95,0.09)]"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleEditar(row.original)}
              className="inline-flex items-center gap-1 bg-[#e8740e]/10 hover:bg-[#e8740e]/20 text-[#e8740e] px-2 py-1.5 rounded-md text-sm font-medium transition-colors border border-[#e8740e]/20"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <EliminarContratacionAdminModal
              id={row.original.id_contratacion}
              onConfirmDelete={handleEliminar}
            />
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
          <Link to="/dashboard">
            <ButtonRegresar />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#2c3e50]">
              Contrataciones
            </h1>
            <p className="text-sm text-[#6b7a8d] mt-1">
              Gestión de contratos del personal docente
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Contador */}
          <div className="flex items-center gap-2 bg-[#f3ede1]/50 border border-[rgba(30,58,95,0.09)] rounded-xl px-4 py-2">
            <Briefcase className="w-5 h-5 text-[#1e3a5f]" />
            <span className="text-sm font-semibold text-[#1e3a5f]">
              {contrataciones.length} contrato(s)
            </span>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <DataTable2
        data={contrataciones}
        columns={columns}
        loading={loading}
      />

      {/* Modal Ver Detalle */}
      {contratacionSeleccionada && (
        <DetalleContratacionAdminModal
          idContratacion={contratacionSeleccionada.id_contratacion}
          isOpen={modalDetalle}
          onClose={() => {
            setModalDetalle(false);
            setContratacionSeleccionada(null);
          }}
        />
      )}

      {/* Modal Editar */}
      {contratacionSeleccionada && (
        <AgregarContratacionAdminModal
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
    </div>
  );
};

export default VerContratacionesAdmin;
