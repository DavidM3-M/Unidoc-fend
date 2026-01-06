import { X, Calendar, FileText, Tag, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosConfig";
import { toast } from "react-toastify";

interface Documento {
  id: number;
  archivo: string;
  archivo_url: string;
  nombre_documento?: string;
}

interface Convocatoria {
  id_convocatoria: number;
  nombre_convocatoria: string;
  tipo: string;
  estado_convocatoria: string;
  fecha_publicacion: string;
  fecha_cierre: string;
  descripcion?: string;
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

  useEffect(() => {
    if (isOpen && idConvocatoria) {
      fetchDetalle();
    }
  }, [isOpen, idConvocatoria]);

  const fetchDetalle = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(
  `/talentoHumano/obtener-convocatoria/${idConvocatoria}`
);
      setConvocatoria(response.data.convocatoria);
    } catch (error) {
      console.error("Error al obtener detalle:", error);
      toast.error("Error al cargar los detalles de la convocatoria");
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
        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex justify-between items-center shadow-md">
          <div className="flex items-center gap-3">
            <FileText size={28} />
            <h2 className="text-2xl font-bold">Detalle de Convocatoria</h2>
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
              {/* Nombre y Estado */}
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">
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

              {/* Fechas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-xl border border-green-200 shadow-sm">
                  <div className="flex items-center gap-2 text-green-700 mb-2">
                    <Calendar size={20} />
                    <p className="font-semibold">Fecha de Publicación</p>
                  </div>
                  <p className="text-xl font-bold text-green-900">
                    {formatearFecha(convocatoria.fecha_publicacion)}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-red-50 to-red-100 p-5 rounded-xl border border-red-200 shadow-sm">
                  <div className="flex items-center gap-2 text-red-700 mb-2">
                    <Calendar size={20} />
                    <p className="font-semibold">Fecha de Cierre</p>
                  </div>
                  <p className="text-xl font-bold text-red-900">
                    {formatearFecha(convocatoria.fecha_cierre)}
                  </p>
                </div>
              </div>

              {/* Descripción */}
              {convocatoria.descripcion && (
                <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                  <h4 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <FileText size={20} />
                    Descripción
                  </h4>
                  <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                    {convocatoria.descripcion}
                  </p>
                </div>
              )}

              {/* Documentos Adjuntos */}
              {convocatoria.documentosConvocatoria &&
                convocatoria.documentosConvocatoria.length > 0 && (
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