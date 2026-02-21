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
import AnimatedWavesBackground from "../../componentes/AnimatedWavesBackground";
import logoClaro from "../../assets/images/logoClaro.jpg";

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
        throw new Error("No se encontraron convocatorias");
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
    localStorage.setItem("postular_convocatoria", idConvocatoria.toString());
    toast.info("Debes iniciar sesión para postularte");
    navigate("/inicio-sesion");
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

  const estaVencida = (fechaCierre: string) => {
    const hoy = new Date();
    const cierre = new Date(fechaCierre);
    return hoy > cierre;
  };

  const getEstadoBadge = (estado: string, fechaCierre: string) => {
    const estadoLower = estado.toLowerCase();
    const vencida = estaVencida(fechaCierre);

    if (vencida || estadoLower === "cerrada" || estadoLower === "finalizada") {
      return "bg-red-100 text-red-800 border-red-300";
    }
    if (estadoLower === "abierta" || estadoLower === "activa") {
      return "bg-green-100 text-green-800 border-green-300";
    }
    return "bg-yellow-100 text-yellow-800 border-yellow-300";
  };

  useEffect(() => {
    fetchConvocatorias();
  }, []);

  if (loading) {
    return (
      <>
        <AnimatedWavesBackground />
        <div className="min-h-screen flex items-center justify-center relative z-10 p-3">
          <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border border-white/30 p-12">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mb-4"></div>
              <p className="text-blue-600 font-semibold text-lg">
                Cargando convocatorias...
              </p>
              <p className="text-gray-600 text-sm mt-2">
                Por favor espere un momento
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <AnimatedWavesBackground />
        <div className="min-h-screen flex items-center justify-center relative z-10 p-4">
          <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border border-white/30 p-8">
            <div className="flex flex-col items-center">
              <DocumentTextIcon className="h-16 w-16 text-red-500 mb-4" />
              <p className="text-red-500 text-center font-semibold mb-4">
                {error}
              </p>
              <button
                onClick={fetchConvocatorias}
                className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-lg"
              >
                <ArrowPathIcon className="h-5 w-5" />
                Reintentar
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <AnimatedWavesBackground />

      {/* Botón de Iniciar Sesión en la esquina */}
      <Link
        to="/inicio-sesion"
        className="fixed top-4 right-4 z-50 inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-lg hover:shadow-xl"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
        Iniciar Sesión
      </Link>

      <div className="min-h-screen relative z-10 py-8 px-3">
        {/* Header con logo y título */}
        <div className="max-w-6xl mx-auto mb-8">
          <div className="bg-white/90 backdrop-blur-md px-6 py-8 rounded-2xl shadow-2xl border border-white/30">
            <div className="flex flex-col items-center text-center">
              <div className="bg-white rounded-full p-5 shadow-lg border border-gray-100 mb-4">
                <img className="size-20" src={logoClaro} alt="Logo UniDoc" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Convocatorias Disponibles
              </h1>
              <p className="text-gray-600 text-lg">
                Explora las oportunidades laborales y académicas
              </p>
            </div>
          </div>
        </div>

        {/* Contenido de convocatorias */}
        <div className="max-w-6xl mx-auto">
          {convocatorias.length === 0 ? (
            <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border border-white/30 p-12">
              <div className="flex flex-col items-center text-center">
                <DocumentTextIcon className="h-20 w-20 text-gray-400 mb-4" />
                <p className="text-gray-700 font-semibold text-xl mb-2">
                  No hay convocatorias disponibles actualmente
                </p>
                <p className="text-gray-500">Por favor, vuelve más tarde</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {convocatorias.map((convocatoria) => (
                <div
                  key={convocatoria.id_convocatoria}
                  className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border border-white/30 overflow-hidden hover:shadow-3xl transition-all hover:scale-[1.02]"
                >
                  {/* Header de la tarjeta */}
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h2 className="text-lg font-bold text-white mb-1 line-clamp-2">
                          {convocatoria.nombre_convocatoria}
                        </h2>
                        <p className="text-blue-100 text-sm">
                          {convocatoria.tipo}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold border ${getEstadoBadge(
                          convocatoria.estado_convocatoria,
                          convocatoria.fecha_cierre
                        )}`}
                      >
                        {estaVencida(convocatoria.fecha_cierre)
                          ? "Cerrada"
                          : convocatoria.estado_convocatoria}
                      </span>
                    </div>
                  </div>

                  {/* Contenido */}
                  <div className="p-5 space-y-4">
                    {convocatoria.cargo_solicitado && (
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <BriefcaseIcon className="h-5 w-5 text-blue-500 flex-shrink-0" />
                        <span className="line-clamp-1">
                          {convocatoria.cargo_solicitado}
                        </span>
                      </div>
                    )}

                    {convocatoria.facultad && (
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <DocumentTextIcon className="h-5 w-5 text-blue-500 flex-shrink-0" />
                        <span className="line-clamp-1">
                          {convocatoria.facultad}
                        </span>
                      </div>
                    )}

                    {/* Fechas */}
                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-200">
                      <div className="text-center">
                        <p className="text-xs text-gray-500 mb-1 font-medium">
                          Publicación
                        </p>
                        <div className="flex items-center justify-center gap-1 text-sm font-semibold text-gray-800">
                          <CalendarIcon className="h-4 w-4 text-blue-500" />
                          {formatearFecha(convocatoria.fecha_publicacion)}
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500 mb-1 font-medium">
                          Cierre
                        </p>
                        <div className="flex items-center justify-center gap-1 text-sm font-semibold text-red-600">
                          <CalendarIcon className="h-4 w-4" />
                          {formatearFecha(convocatoria.fecha_cierre)}
                        </div>
                      </div>
                    </div>

                    {/* Descripción */}
                    {convocatoria.descripcion && (
                      <div className="pt-3 border-t border-gray-200">
                        <p className="text-sm text-gray-600 line-clamp-3">
                          {convocatoria.descripcion}
                        </p>
                      </div>
                    )}

                    {/* Botones de acción */}
                    <div className="space-y-2 pt-4">
                      <button
                        onClick={() =>
                          handleVerDetalle(convocatoria.id_convocatoria)
                        }
                        className="w-full flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm"
                      >
                        <EyeIcon className="h-5 w-5" />
                        Ver Detalles
                      </button>

                      <button
                        onClick={() =>
                          handlePostularse(convocatoria.id_convocatoria)
                        }
                        disabled={
                          convocatoria.estado_convocatoria === "Cerrada" ||
                          estaVencida(convocatoria.fecha_cierre)
                        }
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-3 rounded-lg text-sm font-bold transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:from-gray-400 disabled:to-gray-400"
                      >
                        <ArrowRightIcon className="h-5 w-5" />
                        {convocatoria.estado_convocatoria === "Cerrada" ||
                        estaVencida(convocatoria.fecha_cierre)
                          ? "Convocatoria cerrada"
                          : "Iniciar sesión para postularse"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de detalles */}
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
    </>
  );
};

export default ConvocatoriasPublicas;