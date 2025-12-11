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
import { FileSpreadsheet } from "lucide-react";

interface Convocatoria {
  id_convocatoria: number;
  nombre_convocatoria: string;
  tipo: string;
  estado_convocatoria: string;
  fecha_publicacion: string;
  fecha_cierre: string;
}

const VerConvocatoria = () => {
  const [convocatorias, setConvocatorias] = useState<Convocatoria[]>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [exportando, setExportando] = useState(false);

  const fetchDatos = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(
        "/talentoHumano/obtener-convocatorias"
      );
      setConvocatorias(response.data.convocatorias);
    } catch (error) {
      console.error("Error al obtener convocatorias:", error);
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

  // NUEVA FUNCIÓN: Exportar a Excel
  const handleExportarExcel = async () => {
    try {
      setExportando(true);
      
      const response = await axiosInstance.get(
        "/talentoHumano/exportar-convocatorias-excel",
        {
          responseType: "blob",
        }
      );

      // Crear un blob del archivo
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      // Crear un link temporal para descargar
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      
      // Nombre del archivo con fecha actual
      const fecha = new Date().toISOString().split("T")[0];
      link.download = `Convocatorias_${fecha}.xlsx`;
      
      document.body.appendChild(link);
      link.click();
      
      // Limpiar
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

  const columns = useMemo<ColumnDef<Convocatoria>[]>(
    () => [
      {
        header: "Nombre",
        accessorKey: "nombre_convocatoria",
      },
      {
        header: "Tipo",
        accessorKey: "tipo",
      },
      {
        header: "Estado",
        accessorKey: "estado_convocatoria",
      },
      {
        header: "Publicación",
        accessorKey: "fecha_publicacion",
        cell: ({ getValue }) => {
          const value = getValue() as string;
          return new Date(value).toLocaleDateString();
        },
      },
      {
        header: "Cierre",
        accessorKey: "fecha_cierre",
        cell: ({ getValue }) => {
          const value = getValue() as string;
          return new Date(value).toLocaleDateString();
        },
      },
      {
        header: "Acciones",
        cell: ({ row }) => (
          <div className="flex space-x-2">
            <Link
              to={`convocatoria/${row.original.id_convocatoria}`}
            >
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
    <div className="flex flex-col gap-4 h-full min-w-5xl max-w-6xl bg-white rounded-3xl p-8 min-h-screen">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="flex gap-1">
            <Link to={"/talento-humano"}>
              <ButtonRegresar />
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Convocatorias</h1>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 w-full">
        <InputSearch
          type="text"
          placeholder="Buscar..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
        />
        
        <div className="flex gap-2">
          {/* NUEVO BOTÓN: Exportar Excel */}
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

      <DataTable
        data={convocatorias}
        columns={columns}
        globalFilter={globalFilter}
        loading={loading}
      />
    </div>
  );
};

export default VerConvocatoria;