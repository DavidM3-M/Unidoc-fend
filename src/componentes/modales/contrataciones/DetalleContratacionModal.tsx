import { X, Calendar, FileText, DollarSign, Briefcase, User, Mail, Building2, Tag, History, ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useState } from "react";
import axiosInstance from "../../../utils/axiosConfig";
import { toast } from "react-toastify";

interface Contratacion {
  id_contratacion: number;
  user_id: number;
  tipo_contrato: string;
  tipo_proceso?: string;
  tipo_vinculacion?: string;
  area: string;
  fecha_inicio: string;
  fecha_fin: string;
  valor_contrato: number;
  observaciones?: string;
  usuario_contratado?: {
    primer_nombre: string;
    segundo_nombre?: string;
    primer_apellido: string;
    segundo_apellido?: string;
    numero_identificacion: string;
    email?: string;
  };
}

interface BitacoraEntry {
  id_bitacora: number;
  tipo_modificacion: string;
  motivo?: string;
  created_at: string;
  usuario_que_modifico?: {
    primer_nombre: string;
    primer_apellido: string;
    email: string;
  };
  datos_anteriores?: Record<string, unknown> | null;
  datos_nuevos?: Record<string, unknown> | null;
}

const mapTipoModif: Record<string, string> = {
  creacion: 'Creación',
  actualizacion: 'Actualización',
  eliminacion: 'Eliminación',
};

const mapProceso: Record<string, string> = {
  Contratacion: 'Primera contratación',
  Ascenso: 'Ascenso',
  CambioCargo: 'Cambio de cargo',
};

const formatBadgeModif = (tipo: string) => {
  const colorMap: Record<string, string> = {
    creacion: 'bg-green-100 text-green-800 border-green-300',
    actualizacion: 'bg-blue-100 text-blue-800 border-blue-300',
    eliminacion: 'bg-red-100 text-red-800 border-red-300',
  };
  return colorMap[tipo] ?? 'bg-gray-100 text-gray-800 border-gray-300';
};

interface Props {
  idContratacion: number;
  isOpen: boolean;
  onClose: () => void;
}

const DetalleContratacionModal = ({ idContratacion, isOpen, onClose }: Props) => {
  const [contratacion, setContratacion] = useState<Contratacion | null>(null);
  const [bitacora, setBitacora]         = useState<BitacoraEntry[]>([]);
  const [loading, setLoading]           = useState(false);
  const [expandedRow, setExpandedRow]   = useState<number | null>(null);

  useEffect(() => {
    if (isOpen && idContratacion) {
      fetchDetalle();
    }
  }, [isOpen, idContratacion]);

  const fetchDetalle = async () => {
    try {
      setLoading(true);
      const [contratoRes, bitacoraRes] = await Promise.all([
        axiosInstance.get(`/talentoHumano/obtener-contratacion/${idContratacion}`),
        axiosInstance.get(`/talentoHumano/obtener-contratacion/${idContratacion}/bitacora`),
      ]);
      setContratacion(contratoRes.data.contratacion);
      setBitacora(bitacoraRes.data.bitacora ?? []);
    } catch (error) {
      console.error("Error al cargar contratación:", error);
      toast.error("Error al cargar los detalles de la contratación");
    } finally {
      setLoading(false);
    }
  };

  const formatearFecha = (fecha: string) =>
    new Date(fecha).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

  if (!isOpen) return null;

  const usuario = contratacion?.usuario_contratado;
  const nombreCompleto = usuario
    ? `${usuario.primer_nombre} ${usuario.segundo_nombre ?? ""} ${usuario.primer_apellido} ${usuario.segundo_apellido ?? ""}`.trim()
    : null;

  return (
    <div
      className="modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="modal-content bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header azul igual que DetalleConvocatoriaModal */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex justify-between items-center shadow-md z-10">
          <div className="flex items-center gap-3">
            <FileText size={28} />
            <div>
              <h2 className="text-2xl font-bold">Detalle de Contratación</h2>
              {contratacion && (
                <p className="text-blue-100 text-sm">
                  ID #{contratacion.id_contratacion}
                </p>
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

        {/* Contenido */}
        <div className="px-6 py-4 overflow-y-auto flex-1">
          {loading ? (
            <div className="flex flex-col justify-center items-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600" />
              <p className="mt-4 text-gray-600 font-medium">Cargando detalles...</p>
            </div>
          ) : contratacion ? (
            <div className="space-y-6">

              {/* Tipo de proceso / vinculación badges */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                <h3 className="text-2xl font-bold text-gray-800 mb-3">
                  Contratación #{contratacion.id_contratacion}
                </h3>
                <div className="flex flex-wrap gap-2">
                  <span className="flex items-center gap-1 px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold border border-blue-300">
                    <Tag size={16} />
                    {contratacion.tipo_contrato}
                  </span>
                  {contratacion.tipo_proceso && (
                    <span className="flex items-center gap-1 px-4 py-2 bg-indigo-100 text-indigo-800 rounded-full text-sm font-semibold border border-indigo-300">
                      <History size={16} />
                      {mapProceso[contratacion.tipo_proceso] ?? contratacion.tipo_proceso}
                    </span>
                  )}
                  <span className="flex items-center gap-1 px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-semibold border border-green-300">
                    <Building2 size={16} />
                    {contratacion.area}
                  </span>
                </div>
              </div>

              {/* Información del Contratado */}
              {usuario && (
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <User size={24} className="text-blue-600" />
                    Información del Contratado
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <User size={20} className="text-gray-500 mt-1" />
                      <div>
                        <p className="text-sm text-gray-500">Nombre Completo</p>
                        <p className="text-base font-semibold text-gray-800">{nombreCompleto}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Tag size={20} className="text-gray-500 mt-1" />
                      <div>
                        <p className="text-sm text-gray-500">Identificación</p>
                        <p className="text-base font-semibold text-gray-800">{usuario.numero_identificacion}</p>
                      </div>
                    </div>
                    {usuario.email && (
                      <div className="flex items-start gap-3 md:col-span-2">
                        <Mail size={20} className="text-gray-500 mt-1" />
                        <div>
                          <p className="text-sm text-gray-500">Email</p>
                          <p className="text-base font-semibold text-gray-800">{usuario.email}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Información del Contrato */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Briefcase size={24} className="text-blue-600" />
                  Información del Contrato
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <Briefcase size={20} className="text-gray-500 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Tipo de Contrato</p>
                      <p className="text-base font-semibold text-gray-800">{contratacion.tipo_contrato}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Building2 size={20} className="text-gray-500 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Área</p>
                      <p className="text-base font-semibold text-gray-800">{contratacion.area}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 md:col-span-2">
                    <DollarSign size={20} className="text-gray-500 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Valor del Contrato</p>
                      <p className="text-xl font-bold text-green-700">
                        ${contratacion.valor_contrato.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fechas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-xl border border-green-200 shadow-sm">
                  <div className="flex items-center gap-2 text-green-700 mb-2">
                    <Calendar size={20} />
                    <p className="font-semibold text-sm">Fecha de Inicio</p>
                  </div>
                  <p className="text-lg font-bold text-green-900">
                    {formatearFecha(contratacion.fecha_inicio)}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-red-50 to-red-100 p-5 rounded-xl border border-red-200 shadow-sm">
                  <div className="flex items-center gap-2 text-red-700 mb-2">
                    <Calendar size={20} />
                    <p className="font-semibold text-sm">Fecha de Fin</p>
                  </div>
                  <p className="text-lg font-bold text-red-900">
                    {formatearFecha(contratacion.fecha_fin)}
                  </p>
                </div>
              </div>

              {/* Observaciones */}
              {contratacion.observaciones && (
                <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                  <h4 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <FileText size={20} />
                    Observaciones
                  </h4>
                  <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                    {contratacion.observaciones}
                  </p>
                </div>
              )}

              {/* Bitácora legal de cambios */}
              {bitacora.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <History size={22} className="text-blue-600" />
                    Bitácora de Cambios
                  </h4>
                  <div className="space-y-3">
                    {bitacora.map((entry) => (
                      <div key={entry.id_bitacora} className="border border-gray-100 rounded-lg overflow-hidden">
                        {/* Fila principal */}
                        <div
                          className="flex flex-wrap items-center gap-3 px-4 py-3 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() =>
                            setExpandedRow(
                              expandedRow === entry.id_bitacora ? null : entry.id_bitacora
                            )
                          }
                        >
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                              formatBadgeModif(entry.tipo_modificacion)
                            }`}
                          >
                            {mapTipoModif[entry.tipo_modificacion] ?? entry.tipo_modificacion}
                          </span>
                          <span className="text-sm text-gray-600">
                            {new Date(entry.created_at).toLocaleString('es-ES')}
                          </span>
                          {entry.usuario_que_modifico && (
                            <span className="text-sm text-gray-500">
                              por{' '}
                              <span className="font-medium text-gray-700">
                                {entry.usuario_que_modifico.primer_nombre}{' '}
                                {entry.usuario_que_modifico.primer_apellido}
                              </span>
                            </span>
                          )}
                          {entry.motivo && (
                            <span className="text-sm text-gray-600 italic truncate max-w-xs">
                              — {entry.motivo}
                            </span>
                          )}
                          <span className="ml-auto text-gray-400">
                            {expandedRow === entry.id_bitacora ? (
                              <ChevronUp size={16} />
                            ) : (
                              <ChevronDown size={16} />
                            )}
                          </span>
                        </div>

                        {/* Detalle expandible (diff JSON) */}
                        {expandedRow === entry.id_bitacora && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-white text-xs">
                            <div>
                              <p className="font-semibold text-gray-500 uppercase mb-1">Datos anteriores</p>
                              <pre className="bg-gray-50 border border-gray-200 rounded p-3 overflow-auto max-h-48 text-gray-700 whitespace-pre-wrap">
                                {entry.datos_anteriores
                                  ? JSON.stringify(entry.datos_anteriores, null, 2)
                                  : '— (ninguno)'}
                              </pre>
                            </div>
                            <div>
                              <p className="font-semibold text-gray-500 uppercase mb-1">Datos nuevos</p>
                              <pre className="bg-gray-50 border border-gray-200 rounded p-3 overflow-auto max-h-48 text-gray-700 whitespace-pre-wrap">
                                {entry.datos_nuevos
                                  ? JSON.stringify(entry.datos_nuevos, null, 2)
                                  : '— (ninguno)'}
                              </pre>
                            </div>
                          </div>
                        )}
                      </div>
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
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold shadow-md"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetalleContratacionModal;