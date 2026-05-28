import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { ColumnDef } from "@tanstack/react-table";
import axiosInstance from "../../../utils/axiosConfig";
import { CreditCard, Eye, Mail, User } from "lucide-react";
import VerEstudios from "../trayectoria-docente/VerEstudiosDocente";
import { DataTable2 } from "../../../componentes/tablas/DataTable2";
import CustomDialog from "../../../componentes/CustomDialogForm";
import VerExperiencia from "../trayectoria-docente/VerExperienciaDocente";
import VerProduccionAcademica from "../trayectoria-docente/VerProduccionAcademicaDocente";
import VerIdiomaDocente from "../trayectoria-docente/VerIdiomaDocente";

interface Docente {
  id: number;
  nombre_completo: string;
  numero_identificacion: string;
  email: string;
}

const ListarDocentes = () => {
  const [docentes, setDocentes] = useState<Docente[]>([]);
  const [loading, setLoading] = useState(true);
  const [docenteSeleccionado, setDocenteSeleccionado] = useState<Docente | null>(null);
  const [vistaActiva, setVistaActiva] = useState<'estudios' | 'idiomas' | 'experiencias' | 'produccion'>('estudios');
  const [openDetalle, setOpenDetalle] = useState(false);

  const fetchDatos = async () => {
    try {
      setLoading(true);

      const cached = sessionStorage.getItem("docentes");
      if (cached) {
        setDocentes(JSON.parse(cached));
      }

      const response = await axiosInstance.get(
        "/apoyoProfesoral/listar-docentes"
      );

      if (response.data?.data) {
        setDocentes(response.data.data);
        sessionStorage.setItem("docentes", JSON.stringify(response.data.data));
      }
    } catch (error) {
      console.error("Error al obtener docentes:", error);
      toast.error("Error al cargar los docentes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatos();
  }, []);

  const handleVerDocente = (docente: Docente) => {
    setDocenteSeleccionado(docente);
    setVistaActiva('estudios');
    setOpenDetalle(true);
  };

  const handleCerrarDetalle = () => {
    setOpenDetalle(false);
    setDocenteSeleccionado(null);
  };

  const ContenidoModal = () => {
    if (!docenteSeleccionado) return null;

    return (
      <div className="flex flex-col h-full overflow-hidden">
        <div className="border-b border-gray-200 px-4 sm:px-6 bg-white">
          <nav className="flex gap-1 sm:gap-2 overflow-x-auto">
            <button
              onClick={() => setVistaActiva('estudios')}
              className={`py-3 sm:py-4 px-3 sm:px-4 font-medium text-sm sm:text-base border-b-2 transition-colors whitespace-nowrap ${
                vistaActiva === 'estudios'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Estudios
            </button>
            <button
              onClick={() => setVistaActiva('idiomas')}
              className={`py-3 sm:py-4 px-3 sm:px-4 font-medium text-sm sm:text-base border-b-2 transition-colors whitespace-nowrap ${
                vistaActiva === 'idiomas'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Idiomas
            </button>
            <button
              onClick={() => setVistaActiva('experiencias')}
              className={`py-3 sm:py-4 px-3 sm:px-4 font-medium text-sm sm:text-base border-b-2 transition-colors whitespace-nowrap ${
                vistaActiva === 'experiencias'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Experiencias
            </button>
            <button
              onClick={() => setVistaActiva('produccion')}
              className={`py-3 sm:py-4 px-3 sm:px-4 font-medium text-sm sm:text-base border-b-2 transition-colors whitespace-nowrap ${
                vistaActiva === 'produccion'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Producción Académica
            </button>
          </nav>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {vistaActiva === 'estudios' && (
            <VerEstudios idDocente={docenteSeleccionado.id.toString()} />
          )}
          {vistaActiva === 'idiomas' && (
            <VerIdiomaDocente idDocente={docenteSeleccionado.id.toString()} />
          )}
          {vistaActiva === 'experiencias' && (
            <VerExperiencia idDocente={docenteSeleccionado.id.toString()} />
          )}
          {vistaActiva === 'produccion' && (
            <VerProduccionAcademica idDocente={docenteSeleccionado.id.toString()} />
          )}
        </div>
      </div>
    );
  };

  const columns = useMemo<ColumnDef<Docente>[]>(
    () => [
      {
        accessorKey: "nombre_completo",
        header: () => (
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span>Nombre completo</span>
          </div>
        ),
        cell: ({ row }) => {
          const nombre = row.getValue("nombre_completo") as string;
          return (
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-blue-600" />
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
        accessorKey: "numero_identificacion",
        header: () => (
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            <span>Identificación</span>
          </div>
        ),
        cell: ({ row }) => {
          const identificacion = row.getValue("numero_identificacion") as string;
          return (
            <div>
              <p className="font-medium text-gray-900">
                {identificacion || "No especificado"}
              </p>
            </div>
          );
        },
      },
      {
        accessorKey: "email",
        header: () => (
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            <span>Correo electrónico</span>
          </div>
        ),
        cell: ({ row }) => (
          <div>
            <p className="font-medium">
              {row.getValue("email") || "No especificado"}
            </p>
          </div>
        ),
      },
      {
        id: "acciones",
        header: "Acciones",
        cell: ({ row }) => (
          <div>
            <button
              onClick={() => handleVerDocente(row.original)}
              className="flex items-center justify-center gap-2 bg-green-50 hover:bg-green-100 text-green-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors border border-green-200"
            >
              <Eye className="w-4 h-4" />
              Ver detalle
            </button>
          </div>
        ),
      },
    ],
    []
  );

  return (
    <div className="flex flex-col gap-4 h-full w-full bg-white rounded-3xl p-4 sm:p-6 lg:p-8 min-h-screen">
      <div className="overflow-x-auto">
        <DataTable2
          data={docentes}
          columns={columns}
          loading={loading}
        />
      </div>

      <CustomDialog
        title={`Detalles del Docente${docenteSeleccionado ? `: ${docenteSeleccionado.nombre_completo}` : ''} `}
        open={openDetalle}
        onClose={handleCerrarDetalle}
        width="1500px"
      >
        <ContenidoModal />
      </CustomDialog>
    </div>
  );
};

export default ListarDocentes;
