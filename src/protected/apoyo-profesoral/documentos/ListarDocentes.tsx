import { Link } from "react-router";
import { ButtonRegresar } from "../../../componentes/formularios/ButtonRegresar";
import InputSearch from "../../../componentes/formularios/InputSearch";
import { DataTable } from "../../../componentes/tablas/DataTable";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { ColumnDef } from "@tanstack/react-table";
import axiosInstance from "../../../utils/axiosConfig";
import { Eye, X } from "lucide-react";
import VerEstudios from "../trayectoria-docente/VerEstudios";
import VerIdiomas from "../trayectoria-docente/VerIdiomas";
import VerExperiencia from "../trayectoria-docente/VerProducciones";

interface Docente {
  id: number;
  nombre_completo: string;
  numero_identificacion: string;
  email: string;
}

const ListarDocentes = () => {
  const [docentes, setDocentes] = useState<Docente[]>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [docenteSeleccionado, setDocenteSeleccionado] = useState<Docente | null>(null);
  const [vistaActiva, setVistaActiva] = useState<'estudios' | 'idiomas' | 'experiencias'>('estudios');

  const fetchDatos = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(
        "/apoyoProfesoral/listar-docentes"
      );
      console.log(response.data);
      setDocentes(response.data.data);
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
  };

  const cerrarModal = () => {
    setDocenteSeleccionado(null);
  };

  const columns = useMemo<ColumnDef<Docente>[]>(
    () => [
      {
        accessorKey: "nombre_completo",
        header: "Nombre completo",
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "numero_identificacion",
        header: "Número de identificación",
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "email",
        header: "Correo electrónico",
        cell: (info) => info.getValue(),
      },
      {
        id: "acciones",
        header: "Acciones",
        cell: ({ row }) => (
          <button
            onClick={() => handleVerDocente(row.original)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Eye size={16} />
            Ver Detalles
          </button>
        ),
      },
    ],
    []
  );

  return (
    <div className="flex flex-col gap-4 h-full w-full bg-white rounded-3xl p-4 sm:p-6 lg:p-8 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="flex gap-1">
            <Link to={"/apoyo-profesoral"}>
              <ButtonRegresar />
            </Link>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">
            Docentes
          </h1>
        </div>
      </div>

      <div className="flex justify-between items-center w-full">
        <InputSearch
          type="text"
          placeholder="Buscar..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto">
        <DataTable
          data={docentes}
          columns={columns}
          globalFilter={globalFilter}
          loading={loading}
        />
      </div>

      {/* Modal de Detalles del Docente */}
      {docenteSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header del Modal */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 sm:p-6 flex justify-between items-start">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold mb-1">
                  {docenteSeleccionado.nombre_completo}
                </h2>
                <p className="text-blue-100 text-sm">
                  ID: {docenteSeleccionado.numero_identificacion}
                </p>
                <p className="text-blue-100 text-sm">
                  {docenteSeleccionado.email}
                </p>
              </div>
              <button
                onClick={cerrarModal}
                className="bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 px-4 sm:px-6">
              <nav className="flex gap-2 sm:gap-4 overflow-x-auto">
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
              </nav>
            </div>

            {/* Contenido del Modal */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {vistaActiva === 'estudios' && (
                <VerEstudios idDocente={docenteSeleccionado.id.toString()} />
              )}
              {vistaActiva === 'idiomas' && (
                <VerIdiomas idDocente={docenteSeleccionado.id.toString()} />
              )}
              {vistaActiva === 'experiencias' && (
                <VerExperiencia idDocente={docenteSeleccionado.id.toString()} />
              )}
            </div>

            {/* Footer del Modal */}
            <div className="border-t border-gray-200 p-4 sm:p-6 bg-gray-50 flex justify-end gap-2 sm:gap-3">
              <button
                onClick={cerrarModal}
                className="px-4 sm:px-6 py-2 sm:py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm sm:text-base"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListarDocentes;