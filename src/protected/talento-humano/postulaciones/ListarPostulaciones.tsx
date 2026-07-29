import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { ColumnDef } from "@tanstack/react-table";
import axiosInstance from "../../../utils/axiosConfig";
import { CreditCard, Eye, User, Calendar, FileText, CheckCircle, XCircle } from "lucide-react";
import { DataTable2 } from "../../../componentes/tablas/DataTable2";
import CustomDialog from "../../../componentes/CustomDialogForm";
import DetallePostulacion from "./DetallePostulacion";

interface Postulacion {
  id_postulacion: number;
  convocatoria_id: number;
  user_id: number;
  nombre_postulante: string;
  estado_postulacion: string;
  aval_talento_humano?: boolean;
  fecha_postulacion: string;
  usuario_postulacion: {
    primer_nombre: string;
    primer_apellido: string;
    numero_identificacion: string;
    email?: string;
  };
  convocatoria_postulacion: {
    nombre_convocatoria: string;
    estado_convocatoria: string;
  };
}

const ListarPostulaciones = () => {
  const [postulaciones, setPostulaciones] = useState<Postulacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [postulacionSeleccionada, setPostulacionSeleccionada] = useState<Postulacion | null>(null);
  const [openDetalle, setOpenDetalle] = useState(false);

  // Función para cargar datos
  const fetchDatos = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/talentoHumano/obtener-postulaciones");
      if (response.data?.data) {
        setPostulaciones(response.data.data);
        sessionStorage.setItem("postulaciones", JSON.stringify(response.data.data));
      }
    } catch (error) {
      console.error("Error al obtener postulaciones:", error);
      toast.error("Error al cargar las postulaciones");
      const cached = sessionStorage.getItem("postulaciones");
      if (cached) {
        setPostulaciones(JSON.parse(cached));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerPostulacion = (postulacion: Postulacion) => {
    setPostulacionSeleccionada(postulacion);
    setOpenDetalle(true);
  };

  const handleCerrarDetalle = () => {
    setOpenDetalle(false);
    setPostulacionSeleccionada(null);
  };

  const columns = useMemo<ColumnDef<Postulacion>[]>(() => [
    {
      accessorKey: "usuario_postulacion.primer_nombre",
      header: () => (
        <div className="flex items-center gap-2">
          <User className="w-4 h-4" />
          <span>Nombre</span>
        </div>
      ),
      cell: ({ row }) => {
        const usuario = row.original.usuario_postulacion;
        const nombreCompleto = `${usuario.primer_nombre} ${usuario.primer_apellido}`;
        return (
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-[#e8740e]/20 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-[#e8740e]" />
            </div>
            <div>
              <div className="text-sm font-medium text-[#2c3e50]">
                {nombreCompleto}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "usuario_postulacion.numero_identificacion",
      header: () => (
        <div className="flex items-center gap-2">
          <CreditCard className="w-4 h-4" />
          <span>Identificación</span>
        </div>
      ),
      cell: ({ row }) => {
        const identificacion = row.getValue("usuario_postulacion.numero_identificacion") as string;
        return (
          <div>
            <p className="font-medium text-[#2c3e50]">
              {identificacion || "No especificado"}
            </p>
          </div>
        );
      },
    },
    {
      accessorKey: "convocatoria_postulacion.nombre_convocatoria",
      header: () => (
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4" />
          <span>Convocatoria</span>
        </div>
      ),
      cell: ({ row }) => {
        const convocatoria = row.original.convocatoria_postulacion.nombre_convocatoria;
        return (
          <div>
            <p className="font-medium text-[#2c3e50]">
              {convocatoria}
            </p>
          </div>
        );
      },
    },
    {
      accessorKey: "estado_postulacion",
      header: "Estado",
      cell: ({ row }) => {
        const estado = row.original.estado_postulacion;
        const aval = row.original.aval_talento_humano;
        const estaRechazada = estado === 'Rechazada';
        const etiqueta = estaRechazada ? 'Rechazada' : aval ? 'Aprobado' : 'Pendiente';

        return (
          <div className="flex items-center gap-2">
            {estaRechazada ? (
              <XCircle className="w-4 h-4 text-red-600" />
            ) : aval ? (
              <CheckCircle className="w-4 h-4 text-[#e8740e]" />
            ) : (
              <XCircle className="w-4 h-4 text-red-600" />
            )}
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              estaRechazada || !aval
                ? 'bg-red-100 text-red-800'
                : 'bg-[#e8740e]/20 text-[#e8740e]'
            }`}>
              {etiqueta}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "fecha_postulacion",
      header: () => (
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          <span>Fecha</span>
        </div>
      ),
      cell: ({ row }) => {
        const fecha = row.getValue("fecha_postulacion") as string;
        return (
          <div>
            <p className="font-medium text-[#2c3e50]">
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
            onClick={() => handleVerPostulacion(row.original)}
            className="flex items-center justify-center gap-2 bg-[#f3ede1]/50 hover:bg-[#ede6d8] text-[#1e3a5f] px-3 py-2 rounded-lg text-sm font-medium transition-colors border border-[rgba(30,58,95,0.09)]"
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
    <div className="flex flex-col gap-4 h-full w-full bg-white rounded-3xl p-4 sm:p-6 lg:p-8 min-h-screen border border-[rgba(30,58,95,0.09)]">
      <div className="overflow-x-auto">
        <DataTable2
          data={postulaciones}
          columns={columns}
          loading={loading}
        />
      </div>

      <CustomDialog
        title={`Detalles de Postulación${postulacionSeleccionada ? `: ${postulacionSeleccionada.usuario_postulacion.primer_nombre} ${postulacionSeleccionada.usuario_postulacion.primer_apellido}` : ''}`}
        open={openDetalle}
        onClose={handleCerrarDetalle}
        width="1200px"
      >
        {postulacionSeleccionada && (
          <DetallePostulacion postulacion={postulacionSeleccionada} />
        )}
      </CustomDialog>
    </div>
  );
};

export default ListarPostulaciones;