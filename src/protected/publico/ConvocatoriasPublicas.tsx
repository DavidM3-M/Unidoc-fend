import {
  DocumentTextIcon,
  EyeIcon,
  ArrowPathIcon,
  ArrowRightIcon,
  CalendarIcon,
  BriefcaseIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  InformationCircleIcon,
  UserPlusIcon,
  ClipboardDocumentCheckIcon,
  CheckBadgeIcon,
  BellAlertIcon,
  AcademicCapIcon,
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
  const [flujoAbierto, setFlujoAbierto] = useState(false);
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

      <div className="min-h-screen relative z-10 flex flex-col">
        {/* ── Navbar estática ─────────────────────────────────── */}
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-white/40 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img className="h-10 w-10 rounded-full object-cover shadow" src={logoClaro} alt="UniDoc" />
              <span className="font-bold text-gray-800 text-lg hidden sm:block">UniDoc</span>
            </div>
            <Link
              to="/inicio-sesion"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-all shadow-md hover:shadow-lg"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Iniciar Sesión
            </Link>
          </div>
        </header>

        <div className="flex-1 py-8 px-3">
          {/* ── Hero / título ─────────────────────────────────── */}
          <div className="max-w-6xl mx-auto mb-6">
            <div className="bg-white/90 backdrop-blur-md px-6 py-8 rounded-2xl shadow-xl border border-white/30 text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Convocatorias Disponibles
              </h1>
              <p className="text-gray-600 text-lg">
                Explora las oportunidades laborales y académicas de nuestra institución
              </p>
            </div>
          </div>

          {/* ── Sección informativa estática ─────────────────── */}
          <div className="max-w-6xl mx-auto mb-6">
            <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-white/30 p-6">
              <div className="flex items-center gap-2 mb-4">
                <InformationCircleIcon className="h-6 w-6 text-blue-600 flex-shrink-0" />
                <h2 className="text-xl font-bold text-gray-800">¿Qué son las convocatorias?</h2>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                Las convocatorias son procesos formales mediante los cuales la institución publica
                vacantes docentes y académicas. Cualquier aspirante o docente puede consultar las
                convocatorias activas, revisar sus requisitos y postularse a través de la plataforma
                una vez registrado.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-start gap-3 bg-blue-50 rounded-xl p-4">
                  <AcademicCapIcon className="h-8 w-8 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">Cargos docentes</p>
                    <p className="text-gray-500 text-xs mt-1">
                      Docentes de cátedra, tiempo completo, medio tiempo y otras vinculaciones académicas.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-green-50 rounded-xl p-4">
                  <ClipboardDocumentCheckIcon className="h-8 w-8 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">Documentos requeridos</p>
                    <p className="text-gray-500 text-xs mt-1">
                      Hoja de vida, títulos académicos, certificaciones de experiencia y demás soportes solicitados.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-purple-50 rounded-xl p-4">
                  <BellAlertIcon className="h-8 w-8 text-purple-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">Notificaciones</p>
                    <p className="text-gray-500 text-xs mt-1">
                      Recibirás notificaciones por correo sobre el estado de tu postulación en cada etapa.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Acordeón: flujo del usuario ──────────────────── */}
          <div className="max-w-6xl mx-auto mb-8">
            <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-white/30 overflow-hidden">
              <button
                onClick={() => setFlujoAbierto((prev) => !prev)}
                className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50/70 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <ArrowRightIcon className="h-5 w-5 text-blue-600" />
                  <span className="font-bold text-gray-800 text-base">
                    ¿Cómo es el proceso para postularse?
                  </span>
                </div>
                {flujoAbierto ? (
                  <ChevronUpIcon className="h-5 w-5 text-gray-500 flex-shrink-0" />
                ) : (
                  <ChevronDownIcon className="h-5 w-5 text-gray-500 flex-shrink-0" />
                )}
              </button>

              <div
                className={`transition-all duration-300 ease-in-out overflow-hidden ${
                  flujoAbierto ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="px-6 pb-6 pt-2">
                  <ol className="relative border-l-2 border-blue-200 ml-3 space-y-6">
                    {[
                      {
                        icon: <UserPlusIcon className="h-5 w-5 text-white" />,
                        color: "bg-blue-500",
                        title: "Crea tu cuenta o inicia sesión",
                        desc: "Regístrate en la plataforma como Aspirante o Docente. Solo necesitas tu correo institucional o personal y unos minutos.",
                      },
                      {
                        icon: <DocumentTextIcon className="h-5 w-5 text-white" />,
                        color: "bg-indigo-500",
                        title: "Consulta las convocatorias activas",
                        desc: "Revisa las convocatorias disponibles, sus requisitos, fechas de cierre y el cargo solicitado antes de postularte.",
                      },
                      {
                        icon: <ClipboardDocumentCheckIcon className="h-5 w-5 text-white" />,
                        color: "bg-violet-500",
                        title: "Prepara y carga tus documentos",
                        desc: "Completa tu perfil con los documentos necesarios: hoja de vida, títulos, certificados de experiencia y demás soportes.",
                      },
                      {
                        icon: <ArrowRightIcon className="h-5 w-5 text-white" />,
                        color: "bg-green-500",
                        title: "Envía tu postulación",
                        desc: "Selecciona la convocatoria a la que deseas aplicar y confirma tu postulación. El sistema registrará tu solicitud.",
                      },
                      {
                        icon: <CheckBadgeIcon className="h-5 w-5 text-white" />,
                        color: "bg-yellow-500",
                        title: "Evaluación y revisión",
                        desc: "El equipo de Talento Humano y los evaluadores asignados revisarán tu postulación y la documentación presentada.",
                      },
                      {
                        icon: <BellAlertIcon className="h-5 w-5 text-white" />,
                        color: "bg-orange-500",
                        title: "Recibe la notificación del resultado",
                        desc: "Serás notificado por correo y en la plataforma sobre el resultado de tu postulación en cada etapa del proceso.",
                      },
                    ].map((step, idx) => (
                      <li key={idx} className="ml-6">
                        <span className={`absolute -left-[17px] flex h-8 w-8 items-center justify-center rounded-full ${step.color} shadow`}>
                          {step.icon}
                        </span>
                        <p className="font-semibold text-gray-800 text-sm">{step.title}</p>
                        <p className="text-gray-500 text-xs mt-0.5 leading-relaxed">{step.desc}</p>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
          </div>

          {/* ── Convocatorias ─────────────────────────────────── */}
          <div className="max-w-6xl mx-auto">
            {convocatorias.length === 0 ? (
              <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-white/30 p-12">
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
                    className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-white/30 overflow-hidden hover:shadow-2xl transition-all hover:scale-[1.02]"
                  >
                    {/* Header de la tarjeta */}
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-5">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h2 className="text-lg font-bold text-white mb-1 line-clamp-2">
                            {convocatoria.nombre_convocatoria}
                          </h2>
                          <p className="text-blue-100 text-sm">{convocatoria.tipo}</p>
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
                          <span className="line-clamp-1">{convocatoria.cargo_solicitado}</span>
                        </div>
                      )}
                      {convocatoria.facultad && (
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <DocumentTextIcon className="h-5 w-5 text-blue-500 flex-shrink-0" />
                          <span className="line-clamp-1">{convocatoria.facultad}</span>
                        </div>
                      )}

                      {/* Fechas */}
                      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-200">
                        <div className="text-center">
                          <p className="text-xs text-gray-500 mb-1 font-medium">Publicación</p>
                          <div className="flex items-center justify-center gap-1 text-sm font-semibold text-gray-800">
                            <CalendarIcon className="h-4 w-4 text-blue-500" />
                            {formatearFecha(convocatoria.fecha_publicacion)}
                          </div>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-500 mb-1 font-medium">Cierre</p>
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
                          onClick={() => handleVerDetalle(convocatoria.id_convocatoria)}
                          className="w-full flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm"
                        >
                          <EyeIcon className="h-5 w-5" />
                          Ver Detalles
                        </button>

                        <button
                          onClick={() => handlePostularse(convocatoria.id_convocatoria)}
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