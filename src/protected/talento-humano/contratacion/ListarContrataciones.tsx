import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { ColumnDef } from "@tanstack/react-table";
import axiosInstance from "../../../utils/axiosConfig";
import { Eye, User, Calendar, DollarSign, Briefcase } from "lucide-react";
import { DataTable2 } from "../../../componentes/tablas/DataTable2";
import CustomDialog from "../../../componentes/CustomDialogForm";
import DetalleContratacion from "./DetalleContratacion";

interface Contratacion {
  id_contratacion: number;
  user_id: number;
  tipo_contrato: string;
  area: string;
  fecha_inicio: string;
  fecha_fin: string;
  valor_contrato: number;
  usuario_contratado?: {
    primer_nombre: string;
    primer_apellido: string;
    numero_identificacion: string;
    email?: string;
  };
}

const ListarContrataciones = () => {
  const [contrataciones, setContrataciones] = useState<Contratacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [contratacionSeleccionada, setContratacionSeleccionada] = useState<Contratacion | null>(null);
  const [openDetalle, setOpenDetalle] = useState(false);

  // Función para cargar datos
  const fetchDatos = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/talentoHumano/listar-contrataciones");
      if (response.data?.data) {
        setContrataciones(response.data.data);
        sessionStorage.setItem("contrataciones", JSON.stringify(response.data.data));
      }
    } catch (error) {
      console.error("Error al obtener contrataciones:", error);
      toast.error("Error al cargar las contrataciones");
      const cached = sessionStorage.getItem("contrataciones");
      if (cached) {
        setContrataciones(JSON.parse(cached));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerContratacion = (contratacion: Contratacion) => {
    setContratacionSeleccionada(contratacion);
    setOpenDetalle(true);
  };

  const handleCerrarDetalle = () => {
    setOpenDetalle(false);
    setContratacionSeleccionada(null);
  };

  const columns = useMemo<ColumnDef<Contratacion>[]>(() => [
    {
      accessorKey: "usuario_contratado.primer_nombre",
      header: () => (
        <div className="flex items-center gap-2">
          <User className="w-4 h-4" />
          <span>Nombre</span>
        </div>
      ),
      cell: ({ row }) => {
        const usuario = row.original.usuario_contratado;
        const nombreCompleto = usuario ? `${usuario.primer_nombre} ${usuario.primer_apellido}` : 'No especificado';
        return (
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">
                {nombreCompleto}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "tipo_contrato",
      header: () => (
        <div className="flex items-center gap-2">
          <Briefcase className="w-4 h-4" />
          <span>Tipo de Contrato</span>
        </div>
      ),
      cell: ({ row }) => {
        const tipo = row.getValue("tipo_contrato") as string;
        return (
          <div>
            <p className="font-medium text-gray-900">
              {tipo}
            </p>
          </div>
        );
      },
    },
    {
      accessorKey: "area",
      header: "Área",
      cell: ({ row }) => {
        const area = row.getValue("area") as string;
        return (
          <div>
            <p className="font-medium text-gray-900">
              {area}
            </p>
          </div>
        );
      },
    },
    {
      accessorKey: "valor_contrato",
      header: () => (
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4" />
          <span>Valor</span>
        </div>
      ),
      cell: ({ row }) => {
        const valor = row.getValue("valor_contrato") as number;
        return (
          <div>
            <p className="font-medium text-gray-900">
              ${valor.toLocaleString()}
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
            onClick={() => handleVerContratacion(row.original)}
            className="flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors border border-blue-200"
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
          data={contrataciones}
          columns={columns}
          loading={loading}
        />
      </div>

      <CustomDialog
        title={`Detalles de Contratación${contratacionSeleccionada ? `: ${contratacionSeleccionada.usuario_contratado?.primer_nombre} ${contratacionSeleccionada.usuario_contratado?.primer_apellido}` : ''}`}
        open={openDetalle}
        onClose={handleCerrarDetalle}
        width="1000px"
      >
        {contratacionSeleccionada && (
          <DetalleContratacion contratacion={contratacionSeleccionada} />
        )}
      </CustomDialog>
    </div>
  );
};

export default ListarContrataciones;