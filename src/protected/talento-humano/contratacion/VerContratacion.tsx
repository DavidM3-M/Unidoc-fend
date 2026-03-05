import { useEffect, useMemo, useState } from "react";
import axiosInstance from "../../../utils/axiosConfig";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "react-toastify";
import axios from "axios";
import EliminarBoton from "../../../componentes/EliminarBoton";
import { Link } from "react-router-dom";
import { ButtonRegresar } from "../../../componentes/formularios/ButtonRegresar";
import { DataTable2 } from "../../../componentes/tablas/DataTable2";
import {
  User,
  Briefcase,
  DollarSign,
  Calendar,
  ShieldCheck,
  ArrowRight,
  Eye,
  Pencil,
} from "lucide-react";
import AgregarContratacionModal from "../../../componentes/modales/contrataciones/AgregarContratacionModal";
import DetalleContratacionModal from "../../../componentes/modales/contrataciones/DetalleContratacionModal";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface UsuarioContratacion {
  primer_nombre: string;
  primer_apellido: string;
  numero_identificacion: string;
}

interface Contratacion {
  id_contratacion: number;
  user_id: number;
  tipo_contrato: string;
  area: string;
  fecha_inicio: string;
  fecha_fin: string;
  valor_contrato: number;
  observaciones?: string;
  usuario_contratacion?: UsuarioContratacion;
}

// ─── Componente ───────────────────────────────────────────────────────────────

const VerContrataciones = () => {
  const [contrataciones, setContrataciones] = useState<Contratacion[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados modales
  const [modalDetalle, setModalDetalle] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [contratacionSeleccionada, setContratacionSeleccionada] = useState<Contratacion | null>(null);

  const fetchDatos = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/talentoHumano/obtener-contrataciones");
      const datosLimpios = response.data.contrataciones.map((item: any) => ({
        ...item,
        usuario: item.usuario || {
          nombre: "No especificado",
          apellido: "",
          numero_identificacion: "N/A",
        },
      }));
      setContrataciones(datosLimpios);
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

  const handleEliminar = async (id: number) => {
    try {
      await axiosInstance.delete(`/talentoHumano/eliminar-contratacion/${id}`);
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
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="h-4 w-4 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-gray-900 whitespace-nowrap">{nombre}</span>
            </div>
          );
        },
      },
      {
        id: "identificacion",
        header: "Identificación",
        accessorFn: (row) => row.usuario_contratacion?.numero_identificacion || "N/A",
        cell: ({ row }) => (
          <span className="text-sm text-gray-700">
            {row.original.usuario_contratacion?.numero_identificacion || "N/A"}
          </span>
        ),
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
          <span className="inline-flex items-center px-2 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 whitespace-nowrap">
            {row.original.tipo_contrato}
          </span>
        ),
      },
      {
        header: "Área",
        accessorKey: "area",
        cell: ({ row }) => (
          <p className="text-sm text-gray-700 max-w-[160px] truncate" title={row.original.area}>
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
          <span className="text-sm font-medium text-gray-900 whitespace-nowrap">
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
          <span className="text-sm text-gray-700 whitespace-nowrap">
            {new Date(row.original.fecha_inicio).toLocaleDateString()}
          </span>
        ),
      },
      {
        header: "Fin",
        accessorKey: "fecha_fin",
        cell: ({ row }) => (
          <span className="text-sm text-gray-700 whitespace-nowrap">
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
              className="inline-flex items-center gap-1 bg-blue-50 hover:bg-blue-100 text-blue-700 px-2 py-1.5 rounded-md text-sm font-medium transition-colors border border-blue-200"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleEditar(row.original)}
              className="inline-flex items-center gap-1 bg-amber-50 hover:bg-amber-100 text-amber-700 px-2 py-1.5 rounded-md text-sm font-medium transition-colors border border-amber-200"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <EliminarBoton
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
    <div className="flex flex-col gap-4 h-full w-full bg-white rounded-3xl p-4 sm:p-6 lg:p-8 min-h-screen">

      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link to="/talento-humano">
            <ButtonRegresar />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
              Contrataciones
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Gestión de contratos del personal docente
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Botón compacto Aspirantes Aprobados */}
          <Link to="/talento-humano/aspirantes-aprobados">
            <div className="group flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md">
              <ShieldCheck className="w-4 h-4" />
              <span>Aspirantes Aprobados</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform duration-200" />
            </div>
          </Link>

          {/* Contador */}
          <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-xl px-4 py-2">
            <Briefcase className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-semibold text-blue-700">
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
        <DetalleContratacionModal
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
    </div>
  );
};

export default VerContrataciones;