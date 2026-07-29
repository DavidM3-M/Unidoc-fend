/* eslint-disable @typescript-eslint/no-explicit-any */
import { X, Calendar, FileText, Tag, Clock, Briefcase, Users, BookOpen, Building2, GraduationCap, AlertCircle } from "lucide-react";
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

// --- FÓRMULA APLICADA SOLO A LOS COLORES ---
// Mantenemos verde para abierta y neutralizamos los demás para un look más serio.
const COLORES_POR_ESTADO: Record<string, string> = {
  abierta: "bg-green-50 text-green-700 border-green-200",
  activa: "bg-green-50 text-green-700 border-green-200",
  cerrada: "bg-gray-100 text-gray-700 border-gray-300",
  finalizada: "bg-gray-100 text-gray-700 border-gray-300",
  default: "bg-gray-50 text-gray-600 border-gray-200",
};

const getEstadoColor = (estado: string): string => {
  const estadoLower = estado.toLowerCase();

  if (COLORES_POR_ESTADO[estadoLower]) {
    return COLORES_POR_ESTADO[estadoLower];
  }
  
  if (estadoLower.includes("proceso")) {
    return "bg-gray-100 text-gray-700 border-gray-300";
  }
  
  return COLORES_POR_ESTADO.default;
};
// -------------------------------------------

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
    // fetchDetalle se define dentro del componente pero no cambia entre renders; se omite de deps intencionalmente
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, idConvocatoria]);

  const fetchDetalle = async () => {
    try {
      setLoading(true);
      const rol = getRol();

      const ENDPOINTS: Record<RolesValidos, string> = {
        "Aspirante": `/aspirante/convocatoria/${idConvocatoria}`,
        "Docente": `/docente/convocatoria/${idConvocatoria}`,
        "Administrativo": `/docente/convocatoria/${idConvocatoria}`,
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

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div
      className="modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="modal-content bg-gray-50 rounded-2xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-[#1e3a5f] text-white px-6 py-4 flex justify-between items-center shadow-md z-10">
          <div className="flex items-center gap-3">
            <FileText size={28} />
            <div>
              <h2 className="text-2xl font-bold">Detalle de Convocatoria</h2>
              {convocatoria && (
                <p className="text-gray-300 text-sm">{convocatoria.numero_convocatoria}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 overflow-y-auto flex-1">
          {loading ? (
            <div className="flex flex-col justify-center items-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#1e3a5f]"></div>
              <p className="mt-4 text-gray-600 font-medium">Cargando detalles...</p>
            </div>
          ) : convocatoria ? (
            <div className="space-y-6">
              {/* Título y Estado */}
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-3xl font-bold text-gray-900 mb-3">
                  {convocatoria.nombre_convocatoria}
                </h3>
                <div className="flex flex-wrap gap-2">
                  <span className="flex items-center gap-1 px-4 py-2 bg-gray-50 text-gray-700 rounded-full text-sm font-semibold border border-gray-200">
                    <Tag size={16} className="text-[#1e3a5f]" />
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
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Building2 size={24} className="text-[#1e3a5f]" />
                  Información General
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <Briefcase size={20} className="text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Cargo Solicitado</p>
                      <p className="text-base font-semibold text-gray-800">{convocatoria.cargo_solicitado}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Building2 size={20} className="text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Facultad</p>
                      <p className="text-base font-semibold text-gray-800">{convocatoria.facultad}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <BookOpen size={20} className="text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Cursos</p>
                      <p className="text-base font-semibold text-gray-800">{convocatoria.cursos}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fechas Importantes */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-2 text-[#1e3a5f] mb-2">
                    <Calendar size={20} />
                    <p className="font-semibold text-sm text-gray-600">Publicación</p>
                  </div>
                  <p className="text-lg font-bold text-gray-900">
                    {formatearFecha(convocatoria.fecha_publicacion)}
                  </p>
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-2 text-[#1e3a5f] mb-2">
                    <Calendar size={20} />
                    <p className="font-semibold text-sm text-gray-600">Cierre</p>
                  </div>
                  <p className="text-lg font-bold text-gray-900">
                    {formatearFecha(convocatoria.fecha_cierre)}
                  </p>
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-2 text-[#1e3a5f] mb-2">
                    <Calendar size={20} />
                    <p className="font-semibold text-sm text-gray-600">Inicio Contrato</p>
                  </div>
                  <p className="text-lg font-bold text-gray-900">
                    {convocatoria.fecha_inicio_contrato ? formatearFecha(convocatoria.fecha_inicio_contrato) : 'Por definir'}
                  </p>
                </div>
              </div>

              {/* Descripción */}
              {convocatoria.descripcion && (
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                  <h4 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <FileText size={20} className="text-[#1e3a5f]" />
                    Descripción General
                  </h4>
                  <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                    {convocatoria.descripcion}
                  </p>
                </div>
              )}

              {/* Perfil Profesional */}
              {convocatoria.perfil_profesional && convocatoria.perfil_profesional !== 'Por definir' && (
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                  <h4 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <GraduationCap size={20} className="text-[#1e3a5f]" />
                    Perfil Profesional
                  </h4>
                  <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                    {convocatoria.perfil_profesional}
                  </p>
                </div>
              )}

              {/* Experiencia Requerida */}
              {convocatoria.experiencia_requerida && convocatoria.experiencia_requerida !== 'Por definir' && (
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                  <h4 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <Briefcase size={20} className="text-[#1e3a5f]" />
                    Experiencia Requerida
                  </h4>
                  <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                    {convocatoria.experiencia_requerida}
                  </p>
                </div>
              )}

              {/* Información para el Postulante */}
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <AlertCircle size={20} className="text-[#1e3a5f]" />
                  Información Importante para el Postulante
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3 bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <Tag size={20} className="text-[#1e3a5f] mt-1 shrink-0" />
                    <div>
                      <p className="text-sm text-gray-500">Tipo de Vinculación</p>
                      <p className="text-base font-semibold text-gray-800">{convocatoria.tipo_vinculacion}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <Users size={20} className="text-[#1e3a5f] mt-1 shrink-0" />
                    <div>
                      <p className="text-sm text-gray-500">Plazas Disponibles</p>
                      <p className="text-base font-semibold text-gray-800">
                        {convocatoria.personas_requeridas} {convocatoria.personas_requeridas === 1 ? "vacante" : "vacantes"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <GraduationCap size={20} className="text-[#1e3a5f] mt-1 shrink-0" />
                    <div>
                      <p className="text-sm text-gray-500">Período Académico</p>
                      <p className="text-base font-semibold text-gray-800">{convocatoria.periodo_academico}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <Calendar size={20} className="text-red-600 mt-1 shrink-0" />
                    <div>
                      <p className="text-sm text-gray-500">Días Restantes para Postularse</p>
                      <p className="text-base font-semibold text-red-600">
                        {(() => {
                          const hoy = new Date();
                          hoy.setHours(0, 0, 0, 0);
                          const cierre = new Date(convocatoria.fecha_cierre);
                          cierre.setHours(0, 0, 0, 0);
                          const diff = Math.ceil((cierre.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
                          if (diff <= 0) return "Plazo cerrado";
                          if (diff === 1) return "Último día";
                          return `${diff} días`;
                        })()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Documentos Adjuntos */}
              {convocatoria.documentosConvocatoria && convocatoria.documentosConvocatoria.length > 0 && (
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                  <h4 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <FileText size={20} className="text-[#1e3a5f]" />
                    Documentos Adjuntos ({convocatoria.documentosConvocatoria.length})
                  </h4>
                  <div className="space-y-2">
                    {convocatoria.documentosConvocatoria.map((doc) => (
                      <a
                        key={doc.id}
                        href={doc.archivo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200 group"
                      >
                        <FileText size={20} className="text-[#1e3a5f]" />
                        <span className="flex-1 text-gray-800 font-medium group-hover:text-gray-900">
                          {doc.nombre_documento || doc.archivo.split("/").pop()}
                        </span>
                        <span className="text-sm text-[#1e3a5f] font-semibold opacity-80 group-hover:opacity-100">
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
              <FileText size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No se pudo cargar la información</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white px-6 py-4 border-t border-gray-200 flex justify-end shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gray-100 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetalleConvocatoriaModal;