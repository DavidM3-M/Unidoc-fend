import {
  DocumentTextIcon,
  EyeIcon,
  ArrowPathIcon,
  ArrowRightIcon,
  CalendarIcon,
  BriefcaseIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import DetalleConvocatoriaPublica from "../../componentes/modales/DetalleConvocatoriaPublica";

interface Convocatoria {
  id_convocatoria: number;
  nombre_convocatoria: string;
  tipo: string;
  fecha_publicacion: string;
  fecha_cierre: string;
  descripcion?: string;
  estado_convocatoria: string;
  cargo_solicitado?: string;
  facultad?: string;
}

const ConvocatoriasPublicas = () => {
  const [convocatorias, setConvocatorias] = useState<Convocatoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false); 
  const navigate = useNavigate();

  const fetchConvocatorias = async () => {
    try {
      setLoading(true);
      setError(null);

      const endpoint = `${import.meta.env.VITE_API_URL}/publico/convocatorias`;
      const response = await axios.get(endpoint);

      if (!response.data?.convocatorias) {
        throw new Error('No se encontraron convocatorias');
      }

      setConvocatorias(response.data.convocatorias);
    } catch (err) {
      console.error("Error al obtener convocatorias:", err);
      setError("Error al cargar las convocatorias");
    } finally {
      setLoading(false);
    }
  };

  const handlePostularse = (idConvocatoria: number) => {
    localStorage.setItem('postular_convocatoria', idConvocatoria.toString());
    toast.info("Debes iniciar sesión para postularte");
    navigate('/inicio-sesion');
  };

  
  const handleVerDetalle = (id: number) => {
    setSelectedId(id);
    setModalOpen(true);
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getEstadoBadge = (estado: string) => {
    const estadoLower = estado.toLowerCase();
    if (estadoLower === "abierta" || estadoLower === "activa") {
      return "bg-green-100 text-green-800 border-green-300";
    }
    if (estadoLower === "cerrada" || estadoLower === "finalizada") {
      return "bg-red-100 text-red-800 border-red-300";
    }
    return "bg-yellow-100 text-yellow-800 border-yellow-300";
  };

  useEffect(() => {
    fetchConvocatorias();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center justify-center bg-white rounded-lg shadow-sm p-6">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-blue-600 font-medium">Cargando convocatorias...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center">
          <DocumentTextIcon className="h-12 w-12 text-red-500 mb-4" />
          <p className="text-red-500 text-center mb-4">{error}</p>
          <button
            onClick={fetchConvocatorias}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            <ArrowPathIcon className="h-5 w-5" />
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Convocatorias Disponibles
              </h1>
              <p className="text-gray-600 mt-1">
                Explora las oportunidades laborales y académicas
              </p>
            </div>
            <Link
              to="/inicio-sesion"
              className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-md"
            >
              Iniciar sesión para postularse
            </Link>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {convocatorias.length === 0 ? (
          <div className="flex flex-col items-center justify-center bg-white rounded-lg shadow-sm p-12 text-center">
            <DocumentTextIcon className="h-16 w-16 text-gray-400 mb-4" />
            <p className="text-gray-600 font-medium text-lg">
              No hay convocatorias disponibles actualmente
            </p>
            <p className="text-gray-500 text-sm mt-2">
              Por favor, vuelve más tarde
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {convocatorias.map((convocatoria) => (
              <div
                key={convocatoria.id_convocatoria}
                className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow"
              >
                {/* Header de la tarjeta */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h2 className="text-lg font-bold text-white mb-1">
                        {convocatoria.nombre_convocatoria}
                      </h2>
                      <p className="text-blue-100 text-sm">{convocatoria.tipo}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold border ${getEstadoBadge(
                        convocatoria.estado_convocatoria
                      )}`}
                    >
                      {convocatoria.estado_convocatoria}
                    </span>
                  </div>
                </div>

                {/* Contenido */}
                <div className="p-5 space-y-4">
                  {convocatoria.cargo_solicitado && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <BriefcaseIcon className="h-5 w-5 text-blue-500" />
                      <span>{convocatoria.cargo_solicitado}</span>
                    </div>
                  )}

                  {convocatoria.facultad && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <DocumentTextIcon className="h-5 w-5 text-blue-500" />
                      <span>{convocatoria.facultad}</span>
                    </div>
                  )}

                  {/* Fechas */}
                  <div className="grid grid-cols-2 gap-3 pt-3 border-t">
                    <div className="text-center">
                      <p className="text-xs text-gray-500 mb-1">Publicación</p>
                      <div className="flex items-center justify-center gap-1 text-sm font-medium text-gray-700">
                        <CalendarIcon className="h-4 w-4" />
                        {formatearFecha(convocatoria.fecha_publicacion)}
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500 mb-1">Cierre</p>
                      <div className="flex items-center justify-center gap-1 text-sm font-medium text-red-600">
                        <CalendarIcon className="h-4 w-4" />
                        {formatearFecha(convocatoria.fecha_cierre)}
                      </div>
                    </div>
                  </div>

                  {/* Descripción */}
                  {convocatoria.descripcion && (
                    <div className="pt-3 border-t">
                      <p className="text-sm text-gray-600 line-clamp-3">
                        {convocatoria.descripcion}
                      </p>
                    </div>
                  )}

                  {/* Botones de acción */}
                  <div className="space-y-2 pt-4">
                    
                    <button
                      onClick={() => handleVerDetalle(convocatoria.id_convocatoria)}
                      className="w-full flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
                    >
                      <EyeIcon className="h-5 w-5" />
                      Ver Detalles
                    </button>

                    <button
                      onClick={() => handlePostularse(convocatoria.id_convocatoria)}
                      disabled={convocatoria.estado_convocatoria === "Cerrada"}
                      className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-300"
                    >
                      <ArrowRightIcon className="h-5 w-5" />
                      Iniciar sesión para postularse
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    
      {selectedId && (
        <DetalleConvocatoriaPublica
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

export default ConvocatoriasPublicas;