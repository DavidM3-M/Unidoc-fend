import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { ColumnDef } from "@tanstack/react-table";
import axiosInstance from "../../../utils/axiosConfig";
import { Eye, FileText, Calendar, Users, CheckCircle, XCircle } from "lucide-react";
import { DataTable2 } from "../../../componentes/tablas/DataTable2";
import CustomDialog from "../../../componentes/CustomDialogForm";
import DetalleConvocatoria from "./DetalleConvocatoria";

interface Convocatoria {
  id_convocatoria: number;
  nombre_convocatoria: string;
  descripcion?: string;
  fecha_inicio: string;
  fecha_fin: string;
  estado_convocatoria: string;
  numero_postulantes?: number;
}

const ListarConvocatorias = () => {
  const [convocatorias, setConvocatorias] = useState<Convocatoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [convocatoriaSeleccionada, setConvocatoriaSeleccionada] = useState<Convocatoria | null>(null);
  const [openDetalle, setOpenDetalle] = useState(false);

  // Función para cargar datos
  const fetchDatos = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/talentoHumano/listar-convocatorias");
      if (response.data?.data) {
        setConvocatorias(response.data.data);
        sessionStorage.setItem("convocatorias", JSON.stringify(response.data.data));
      }
    } catch (error) {
      console.error("Error al obtener convocatorias:", error);
      toast.error("Error al cargar las convocatorias");
      const cached = sessionStorage.getItem("convocatorias");
      if (cached) {
        setConvocatorias(JSON.parse(cached));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerConvocatoria = (convocatoria: Convocatoria) => {
    setConvocatoriaSeleccionada(convocatoria);
    setOpenDetalle(true);
  };

  const handleCerrarDetalle = () => {
    setOpenDetalle(false);
    setConvocatoriaSeleccionada(null);
  };

  const columns = useMemo<ColumnDef<Convocatoria>[]>(() => [
    {
      accessorKey: "nombre_convocatoria",
      header: () => (
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4" />
          <span>Nombre</span>
        </div>
      ),
      cell: ({ row }) => {
        const nombre = row.getValue("nombre_convocatoria") as string;
        return (
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
              <FileText className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">
                {nombre}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "estado_convocatoria",
      header: "Estado",
      cell: ({ row }) => {
        const estado = row.getValue("estado_convocatoria") as string;
        const isActive = estado === 'activa' || estado === 'abierta';
        return (
          <div className="flex items-center gap-2">
            {isActive ? (
              <CheckCircle className="w-4 h-4 text-green-600" />
            ) : (
              <XCircle className="w-4 h-4 text-red-600" />
            )}
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {estado}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "numero_postulantes",
      header: () => (
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4" />
          <span>Postulantes</span>
        </div>
      ),
      cell: ({ row }) => {
        const numero = row.getValue("numero_postulantes") as number;
        return (
          <div>
            <p className="font-medium text-gray-900">
              {numero || 0}
            </p>
          </div>
        );
      },
    },
    {
      accessorKey: "fecha_inicio",
      header: () => (
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          <span>Fecha Inicio</span>
        </div>
      ),
      cell: ({ row }) => {
        const fecha = row.getValue("fecha_inicio") as string;
        return (
          <div>
            <p className="font-medium text-gray-900">
              {new Date(fecha).toLocaleDateString()}
            </p>
          </div>
        );
      },
    },
    {
      accessorKey: "fecha_fin",
      header: "Fecha Fin",
      cell: ({ row }) => {
        const fecha = row.getValue("fecha_fin") as string;
        return (
          <div>
            <p className="font-medium text-gray-900">
              {new Date(fecha).toLocaleDateString()}
            </p>
          </div>
        );
      },
    },
    {
      id: "acciones",
      header: "Acciones",
      cell: ({ row }) => (
        <div>
          <button
            onClick={() => handleVerConvocatoria(row.original)}
            className="flex items-center justify-center gap-2 bg-purple-50 hover:bg-purple-100 text-purple-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors border border-purple-200"
          >
            <Eye className="w-4 h-4" />
            Ver detalle
          </button>
        </div>
      ),
    },
  ], []);

  useEffect(() => {
    fetchDatos();
  }, []);

  return (
    <div className="flex flex-col gap-4 h-full w-full bg-white rounded-3xl p-4 sm:p-6 lg:p-8 min-h-screen">
      <div className="overflow-x-auto">
        <DataTable2
          data={convocatorias}
          columns={columns}
          loading={loading}
        />
      </div>

      <CustomDialog
        title={`Detalles de Convocatoria${convocatoriaSeleccionada ? `: ${convocatoriaSeleccionada.nombre_convocatoria}` : ''}`}
        open={openDetalle}
        onClose={handleCerrarDetalle}
        width="1000px"
      >
        {convocatoriaSeleccionada && (
          <DetalleConvocatoria convocatoria={convocatoriaSeleccionada} />
        )}
      </CustomDialog>
    </div>
  );
};

export default ListarConvocatorias;