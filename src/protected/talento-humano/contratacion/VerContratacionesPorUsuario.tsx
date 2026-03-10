import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axiosInstance from "../../../utils/axiosConfig";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable2 } from "../../../componentes/tablas/DataTable2";
import { toast } from "react-toastify";
import { ButtonRegresar } from "../../../componentes/formularios/ButtonRegresar";
import EliminarBoton from "../../../componentes/EliminarBoton";
import {
  Briefcase,
  Calendar,
  DollarSign,
  FileText,
  ClipboardList,
  Hash,
  User,
  Pencil,
  AlertTriangle,
  Layers,
  Plus,
} from "lucide-react";
import AgregarContratacionModal from "../../../componentes/modales/contrataciones/AgregarContratacionModal";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Contratacion {
  id_contratacion: number;
  user_id: number;
  id_convocatoria?: number;
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
  const [contratacionSeleccionada, setContratacionSeleccionada] =
    useState<Contratacion | null>(null);

  // NUEVO: Modal agregar nuevo contrato para doble contratación
  const [modalAgregar, setModalAgregar] = useState(false);

  const fetchDatos = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(
        "/talentoHumano/obtener-contrataciones"
      );
      const todasContrataciones: Contratacion[] =
        response.data.contrataciones;
      const filtradas = todasContrataciones.filter(
        (contrato) => contrato.user_id === Number(user_id)
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

  const handleEliminar = async (id: number) => {
    try {
      await axiosInstance.delete(`/talentoHumano/eliminar-contratacion/${id}`);
      setContrataciones((prev) =>
        prev.filter((item) => item.id_contratacion !== id)
      );
      toast.success("Contratación eliminada correctamente");
    } catch (error) {
      console.error("Error al eliminar contratación:", error);
      toast.error("Error al eliminar contratación");
    }
  };

  const handleEditar = (contratacion: Contratacion) => {
    setContratacionSeleccionada(contratacion);
    setModalEditar(true);
  };

  // Valor total de todos los contratos del docente
  const valorTotal = useMemo(
    () => contrataciones.reduce((sum, c) => sum + (c.valor_contrato ?? 0), 0),
    [contrataciones]
  );

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
          <span className="text-sm font-medium text-gray-900">
            #{row.original.id_contratacion}
          </span>
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
          <span className="inline-flex items-center px-2 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 whitespace-nowrap">
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
            className="text-sm text-gray-700 max-w-[180px] truncate"
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
        header: "Acciones",
        id: "acciones",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleEditar(row.original)}
              className="inline-flex items-center gap-1 bg-amber-50 hover:bg-amber-100 text-amber-700 px-2 py-1.5 rounded-md text-sm font-medium transition-colors border border-amber-200"
              title="Editar contrato"
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

  const esDobleContratacion = contrataciones.length > 1;

  return (
    <div className="flex flex-col gap-4 h-full w-full bg-white rounded-3xl p-4 sm:p-6 lg:p-8 min-h-screen">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link to="/talento-humano/aspirantes-aprobados">
            <ButtonRegresar />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
              Contratos del Docente
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Usuario ID: {user_id} — todos los contratos registrados
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Contador de contratos */}
          <div
            className={`flex items-center gap-2 border rounded-xl px-4 py-2 ${
              esDobleContratacion
                ? "bg-amber-50 border-amber-200"
                : "bg-blue-50 border-blue-200"
            }`}
          >
            {esDobleContratacion ? (
              <Layers className="w-5 h-5 text-amber-600" />
            ) : (
              <ClipboardList className="w-5 h-5 text-blue-600" />
            )}
            <span
              className={`text-sm font-semibold ${
                esDobleContratacion ? "text-amber-700" : "text-blue-700"
              }`}
            >
              {contrataciones.length} contrato(s)
            </span>
          </div>

          {/* Valor total si hay más de uno */}
          {esDobleContratacion && (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2">
              <DollarSign className="w-5 h-5 text-emerald-600" />
              <span className="text-sm font-semibold text-emerald-700">
                Total: ${valorTotal.toLocaleString()}
              </span>
            </div>
          )}

          {/* NUEVO: Botón para agregar nuevo contrato (doble contratación) */}
          <button
            onClick={() => setModalAgregar(true)}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Agregar Contrato
          </button>
        </div>
      </div>

      {/* NUEVO: Banner de doble contratación */}
      {esDobleContratacion && (
        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          <span>
            Este docente tiene{" "}
            <span className="font-bold">{contrataciones.length} contratos</span>{" "}
            activos simultáneamente (doble contratación). Cada contrato
            corresponde a una convocatoria diferente. Puedes editar o eliminar
            contratos individualmente.
          </span>
        </div>
      )}

      {/* Tabla */}
      <DataTable2
        data={contrataciones}
        columns={columns}
        loading={loading}
      />

      {/* Mensaje si no hay contratos */}
      {!loading && contrataciones.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <ClipboardList className="w-12 h-12 mb-3 opacity-40" />
          <p className="text-base font-medium">
            No se encontraron contrataciones para este usuario.
          </p>
          <button
            onClick={() => setModalAgregar(true)}
            className="mt-4 inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Agregar primer contrato
          </button>
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

      {/* NUEVO: Modal Agregar nuevo contrato */}
      <AgregarContratacionModal
        isOpen={modalAgregar}
        onClose={() => setModalAgregar(false)}
        userId={Number(user_id)}
        onContratacionAgregada={() => {
          fetchDatos();
          setModalAgregar(false);
        }}
      />
    </div>
  );
};

export default VerContratacionesPorUsuario;