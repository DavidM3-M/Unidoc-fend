import { X, Calendar, FileText, Tag, Clock, Briefcase, Users, BookOpen, Building2, GraduationCap, UserCheck, CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosConfig";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { RolesValidos } from "../../types/roles";

interface Documento {
  id: number;
  archivo: string;
  archivo_url: string;
  nombre_documento?: string;
}

interface Convocatoria {
  id_convocatoria: number;
  numero_convocatoria: string;
  nombre_convocatoria: string;
  tipo: string;
  periodo_academico: string;
  cargo_solicitado: string;
  facultad: string;
  cursos: string;
  tipo_vinculacion: string;
  personas_requeridas: number;
  estado_convocatoria: string;
  fecha_publicacion: string;
  fecha_cierre: string;
  fecha_inicio_contrato: string;
  descripcion?: string;
  perfil_profesional?: string;
  experiencia_requerida?: string;
  solicitante?: string;
  aprobaciones?: string;
  documentosConvocatoria?: Documento[];
}

interface Props {
  idConvocatoria: number;
  isOpen: boolean;
  onClose: () => void;
}

const DetalleConvocatoriaModal = ({ idConvocatoria, isOpen, onClose }: Props) => {
  const [convocatoria, setConvocatoria] = useState<Convocatoria | null>(null);
  const [loading, setLoading] = useState(false);

  const getRol = (): RolesValidos => {
    try {
      const token = Cookies.get("token");
      if (!token) return "Aspirante";
      const decoded = jwtDecode<{ rol: RolesValidos }>(token);
      return decoded.rol;
    } catch (error) {
      console.error("Error al decodificar token:", error);
      return "Aspirante";
    }
  };

  useEffect(() => {
    if (isOpen && idConvocatoria) {
      fetchDetalle();
    }
  }, [isOpen, idConvocatoria]);

  const fetchDetalle = async () => {
    try {
      setLoading(true);
      const rol = getRol();

      const ENDPOINTS: Record<RolesValidos, string> = {
        
        "Aspirante": `/aspirante/convocatoria/${idConvocatoria}`,
        "Docente": `/docente/convocatoria/${idConvocatoria}`,
      };

      const endpoint = ENDPOINTS[rol] || `/aspirante/convocatoria/${idConvocatoria}`;
      const response = await axiosInstance.get(endpoint);
      setConvocatoria(response.data.convocatoria);
    } catch (error: any) {
      console.error("Error al cargar convocatoria:", error);
      const errorMsg = error.response?.data?.mensaje || 
                       error.response?.data?.error || 
                       "Error al cargar los detalles de la convocatoria";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const getEstadoColor = (estado: string) => {
    const estadoLower = estado.toLowerCase();
    if (estadoLower === "abierta" || estadoLower === "activa") {
      return "bg-green-100 text-green-800 border-green-300";
    }
    if (estadoLower === "cerrada" || estadoLower === "finalizada") {
      return "bg-red-100 text-red-800 border-red-300";
    }
    if (estadoLower.includes("proceso")) {
      return "bg-yellow-100 text-yellow-800 border-yellow-300";
    }
    return "bg-gray-100 text-gray-800 border-gray-300";
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex justify-between items-center shadow-md z-10">
          <div className="flex items-center gap-3">
            <FileText size={28} />
            <div>
              <h2 className="text-2xl font-bold">Detalle de Convocatoria</h2>
              {convocatoria && (
                <p className="text-blue-100 text-sm">{convocatoria.numero_convocatoria}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 overflow-y-auto flex-1">
          {loading ? (
            <div className="flex flex-col justify-center items-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
              <p className="mt-4 text-gray-600 font-medium">Cargando detalles...</p>
            </div>
          ) : convocatoria ? (
            <div className="space-y-6">
              {/* Título y Estado */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                <h3 className="text-3xl font-bold text-gray-800 mb-3">
                  {convocatoria.nombre_convocatoria}
                </h3>
                <div className="flex flex-wrap gap-2">
                  <span className="flex items-center gap-1 px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold border border-blue-300">
                    <Tag size={16} />
                    {convocatoria.tipo}
                  </span>
                  <span
                    className={`flex items-center gap-1 px-4 py-2 rounded-full text-sm font-semibold border ${getEstadoColor(
                      convocatoria.estado_convocatoria
                    )}`}
                  >
                    <Clock size={16} />
                    {convocatoria.estado_convocatoria}
                  </span>
                </div>
              </div>

              {/* Información General */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Building2 size={24} className="text-blue-600" />
                  Información General
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <GraduationCap size={20} className="text-gray-500 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Período Académico</p>
                      <p className="text-base font-semibold text-gray-800">{convocatoria.periodo_academico}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Briefcase size={20} className="text-gray-500 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Cargo Solicitado</p>
                      <p className="text-base font-semibold text-gray-800">{convocatoria.cargo_solicitado}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Building2 size={20} className="text-gray-500 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Facultad</p>
                      <p className="text-base font-semibold text-gray-800">{convocatoria.facultad}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <BookOpen size={20} className="text-gray-500 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Cursos</p>
                      <p className="text-base font-semibold text-gray-800">{convocatoria.cursos}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Tag size={20} className="text-gray-500 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Tipo de Vinculación</p>
                      <p className="text-base font-semibold text-gray-800">{convocatoria.tipo_vinculacion}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Users size={20} className="text-gray-500 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Plazas Disponibles</p>
                      <p className="text-base font-semibold text-gray-800">{convocatoria.personas_requeridas}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fechas Importantes */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-xl border border-green-200 shadow-sm">
                  <div className="flex items-center gap-2 text-green-700 mb-2">
                    <Calendar size={20} />
                    <p className="font-semibold text-sm">Publicación</p>
                  </div>
                  <p className="text-lg font-bold text-green-900">
                    {formatearFecha(convocatoria.fecha_publicacion)}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-red-50 to-red-100 p-5 rounded-xl border border-red-200 shadow-sm">
                  <div className="flex items-center gap-2 text-red-700 mb-2">
                    <Calendar size={20} />
                    <p className="font-semibold text-sm">Cierre</p>
                  </div>
                  <p className="text-lg font-bold text-red-900">
                    {formatearFecha(convocatoria.fecha_cierre)}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-xl border border-blue-200 shadow-sm">
                  <div className="flex items-center gap-2 text-blue-700 mb-2">
                    <Calendar size={20} />
                    <p className="font-semibold text-sm">Inicio Contrato</p>
                  </div>
                  <p className="text-lg font-bold text-blue-900">
                    {convocatoria.fecha_inicio_contrato ? formatearFecha(convocatoria.fecha_inicio_contrato) : 'Por definir'}
                  </p>
                </div>
              </div>

              {/* Descripción */}
              {convocatoria.descripcion && (
                <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                  <h4 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <FileText size={20} />
                    Descripción General
                  </h4>
                  <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                    {convocatoria.descripcion}
                  </p>
                </div>
              )}

              {/* Perfil Profesional */}
              {convocatoria.perfil_profesional && convocatoria.perfil_profesional !== 'Por definir' && (
                <div className="bg-purple-50 p-5 rounded-xl border border-purple-200">
                  <h4 className="text-lg font-bold text-purple-900 mb-3 flex items-center gap-2">
                    <GraduationCap size={20} />
                    Perfil Profesional
                  </h4>
                  <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                    {convocatoria.perfil_profesional}
                  </p>
                </div>
              )}

              {/* Experiencia Requerida */}
              {convocatoria.experiencia_requerida && convocatoria.experiencia_requerida !== 'Por definir' && (
                <div className="bg-amber-50 p-5 rounded-xl border border-amber-200">
                  <h4 className="text-lg font-bold text-amber-900 mb-3 flex items-center gap-2">
                    <Briefcase size={20} />
                    Experiencia Requerida
                  </h4>
                  <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                    {convocatoria.experiencia_requerida}
                  </p>
                </div>
              )}

              {/* Información Administrativa */}
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                <h4 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <UserCheck size={20} />
                  Información Administrativa
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {convocatoria.solicitante && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Solicitante</p>
                      <p className="text-base font-semibold text-gray-800">{convocatoria.solicitante}</p>
                    </div>
                  )}
                  {convocatoria.aprobaciones && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Estado de Aprobaciones</p>
                      <p className="text-base font-semibold text-gray-800">{convocatoria.aprobaciones}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Documentos Adjuntos */}
              {convocatoria.documentosConvocatoria && convocatoria.documentosConvocatoria.length > 0 && (
                <div className="bg-blue-50 p-5 rounded-xl border border-blue-200">
                  <h4 className="text-lg font-bold text-blue-900 mb-3 flex items-center gap-2">
                    <FileText size={20} />
                    Documentos Adjuntos ({convocatoria.documentosConvocatoria.length})
                  </h4>
                  <div className="space-y-2">
                    {convocatoria.documentosConvocatoria.map((doc) => (
                      <a
                        key={doc.id}
                        href={doc.archivo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 bg-white rounded-lg hover:bg-blue-100 transition-colors border border-blue-200 group"
                      >
                        <FileText size={20} className="text-blue-600" />
                        <span className="flex-1 text-gray-800 font-medium group-hover:text-blue-700">
                          {doc.nombre_documento || doc.archivo.split("/").pop()}
                        </span>
                        <span className="text-sm text-blue-600 font-semibold">
                          Ver documento →
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-12">
              <FileText size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium">No se pudo cargar la información</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t flex justify-end shadow-inner">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold shadow-md hover:shadow-lg"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetalleConvocatoriaModal;