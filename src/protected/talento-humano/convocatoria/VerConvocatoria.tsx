import { useEffect, useMemo, useState } from "react";
import axiosInstance from "../../../utils/axiosConfig";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "../../../componentes/tablas/DataTable";
import { ButtonTable } from "../../../componentes/formularios/ButtonTabla";
import { toast } from "react-toastify";
import axios from "axios";
import EliminarBoton from "../../../componentes/EliminarBoton";
import { Link } from "react-router";
import { PencilIcon } from "../../../assets/icons/Iconos";
import InputSearch from "../../../componentes/formularios/InputSearch";
import { ButtonRegresar } from "../../../componentes/formularios/ButtonRegresar";
import { FileSpreadsheet, Eye } from "lucide-react";
import DetalleConvocatoriaModal from "../../../componentes/modales/DetalleConvocatoriaModal";

interface Convocatoria {
  id_convocatoria: number;
  numero_convocatoria: string;
  nombre_convocatoria: string;
  tipo: string;
  periodo_academico: string;
  cargo_solicitado: string;
  facultad: string;
  estado_convocatoria: string;
  fecha_publicacion: string;
  fecha_cierre: string;
  personas_requeridas: number;
}

const VerConvocatoria = () => {
  const [convocatorias, setConvocatorias] = useState<Convocatoria[]>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [exportando, setExportando] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const fetchDatos = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(
        "/talentoHumano/obtener-convocatorias"
      );
      console.log("Convocatorias recibidas:", response.data.convocatorias);
      setConvocatorias(response.data.convocatorias);
    } catch (error) {
      console.error("Error al obtener convocatorias:", error);
      toast.error("Error al cargar las convocatorias");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatos();
  }, []);

  const handleEliminar = async (id: number) => {
    try {
      await axiosInstance.delete(`/talentoHumano/eliminar-convocatoria/${id}`);
      setConvocatorias((prev) =>
        prev.filter((item) => item.id_convocatoria !== id)
      );
      toast.success("Convocatoria eliminada correctamente");
    } catch (error) {
      console.error("Error al eliminar:", error);
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Error al eliminar");
      } else {
        toast.error("Error inesperado al eliminar");
      }
    }
  };

  const handleExportarExcel = async () => {
    try {
      setExportando(true);
      
      const response = await axiosInstance.get(
        "/talentoHumano/exportar-convocatorias-excel",
        {
          responseType: "blob",
        }
      );

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      
      const fecha = new Date().toISOString().split("T")[0];
      link.download = `Convocatorias_${fecha}.xlsx`;
      
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success("Excel exportado correctamente");
    } catch (error) {
      console.error("Error al exportar Excel:", error);
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Error al exportar Excel");
      } else {
        toast.error("Error inesperado al exportar");
      }
    } finally {
      setExportando(false);
    }
  };

  const handleVerDetalle = (id: number) => {
    setSelectedId(id);
    setModalOpen(true);
  };

  const getEstadoBadge = (estado: string) => {
    const estadoLower = estado.toLowerCase();
    if (estadoLower === "abierta") {
      return (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
          {estado}
        </span>
      );
    }
    if (estadoLower === "cerrada") {
      return (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
          {estado}
        </span>
      );
    }
    return (
      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
        {estado}
      </span>
    );
  };

  const columns = useMemo<ColumnDef<Convocatoria>[]>(
    () => [
      {
        header: "N° Convocatoria",
        accessorKey: "numero_convocatoria",
        cell: ({ getValue }) => (
          <span className="font-mono text-sm">{getValue() as string}</span>
        ),
      },
      {
        header: "Nombre",
        accessorKey: "nombre_convocatoria",
      },
      {
        header: "Cargo",
        accessorKey: "cargo_solicitado",
      },
      {
        header: "Facultad",
        accessorKey: "facultad",
      },
      {
        header: "Período",
        accessorKey: "periodo_academico",
      },
      {
        header: "Estado",
        accessorKey: "estado_convocatoria",
        cell: ({ getValue }) => getEstadoBadge(getValue() as string),
      },
      {
        header: "Plazas",
        accessorKey: "personas_requeridas",
        cell: ({ getValue }) => (
          <span className="font-semibold">{getValue() as number}</span>
        ),
      },
      {
        header: "Publicación",
        accessorKey: "fecha_publicacion",
        cell: ({ getValue }) => {
          const value = getValue() as string;
          return new Date(value).toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          });
        },
      },
      {
        header: "Cierre",
        accessorKey: "fecha_cierre",
        cell: ({ getValue }) => {
          const value = getValue() as string;
          return new Date(value).toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          });
        },
      },
      {
        header: "Detalles",
        cell: ({ row }) => (
          <button
            onClick={() => handleVerDetalle(row.original.id_convocatoria)}
            className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <Eye size={16} />
            <span>Ver</span>
          </button>
        ),
      },
      {
        header: "Acciones",
        cell: ({ row }) => (
          <div className="flex space-x-2">
            <Link to={`convocatoria/${row.original.id_convocatoria}`}>
              <PencilIcon />
            </Link>
            <EliminarBoton
              id={row.original.id_convocatoria}
              onConfirmDelete={handleEliminar}
            />
          </div>
        ),
      },
    ],
    []
  );

  return (
    <div className="flex flex-col gap-4 h-full bg-white rounded-3xl p-8 min-h-screen">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="flex gap-1">
            <Link to={"/talento-humano"}>
              <ButtonRegresar />
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Gestión de Convocatorias
          </h1>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 w-full">
        <InputSearch
          type="text"
          placeholder="Buscar convocatoria..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
        />
        
        <div className="flex gap-2">
          <button
            onClick={handleExportarExcel}
            disabled={exportando || convocatorias.length === 0}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
              ${exportando || convocatorias.length === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700 hover:shadow-lg'
              }
            `}
          >
            <FileSpreadsheet size={20} />
            <span>{exportando ? 'Exportando...' : 'Exportar Excel'}</span>
          </button>

          <Link to="convocatoria">
            <ButtonTable value="Agregar Convocatoria" />
          </Link>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <p className="text-sm text-blue-600 font-medium">Total</p>
          <p className="text-2xl font-bold text-blue-900">{convocatorias.length}</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <p className="text-sm text-green-600 font-medium">Abiertas</p>
          <p className="text-2xl font-bold text-green-900">
            {convocatorias.filter(c => c.estado_convocatoria === "Abierta").length}
          </p>
        </div>
        <div className="bg-red-50 rounded-lg p-4 border border-red-200">
          <p className="text-sm text-red-600 font-medium">Cerradas</p>
          <p className="text-2xl font-bold text-red-900">
            {convocatorias.filter(c => c.estado_convocatoria === "Cerrada").length}
          </p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <p className="text-sm text-purple-600 font-medium">Plazas Totales</p>
          <p className="text-2xl font-bold text-purple-900">
            {convocatorias.reduce((sum, c) => sum + (c.personas_requeridas || 0), 0)}
          </p>
        </div>
      </div>

      <DataTable
        data={convocatorias}
        columns={columns}
        globalFilter={globalFilter}
        loading={loading}
      />

      {selectedId && (
        <DetalleConvocatoriaModal
          idConvocatoria={selectedId}
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setSelectedId(null);
          }}
        />
      )}
    </div>
  );
};

export default VerConvocatoria;