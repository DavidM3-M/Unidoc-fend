import { useState } from "react";
import { User, FileText, CheckCircle, XCircle, Mail, Calendar } from "lucide-react";

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

interface DetallePostulacionProps {
  postulacion: Postulacion;
}

const DetallePostulacion = ({ postulacion }: DetallePostulacionProps) => {
  const [vistaActiva, setVistaActiva] = useState<'informacion' | 'documentos'>('informacion');

  const usuario = postulacion.usuario_postulacion;
  const convocatoria = postulacion.convocatoria_postulacion;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Tabs */}
      <div className="border-b border-gray-200 px-4 sm:px-6 bg-white">
        <nav className="flex gap-1 sm:gap-2 overflow-x-auto">
          <button
            onClick={() => setVistaActiva('informacion')}
            className={`py-3 sm:py-4 px-3 sm:px-4 font-medium text-sm sm:text-base border-b-2 transition-colors whitespace-nowrap ${
              vistaActiva === 'informacion'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Información General
          </button>
          <button
            onClick={() => setVistaActiva('documentos')}
            className={`py-3 sm:py-4 px-3 sm:px-4 font-medium text-sm sm:text-base border-b-2 transition-colors whitespace-nowrap ${
              vistaActiva === 'documentos'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Documentos
          </button>
        </nav>
      </div>

      {/* Contenido del Modal */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        {vistaActiva === 'informacion' && (
          <div className="space-y-6">
            {/* Información del Postulante */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Información del Postulante
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nombre Completo</label>
                  <p className="mt-1 text-sm text-gray-900">{usuario.primer_nombre} {usuario.primer_apellido}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Identificación</label>
                  <p className="mt-1 text-sm text-gray-900">{usuario.numero_identificacion}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="mt-1 text-sm text-gray-900 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {usuario.email || 'No especificado'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Estado de Postulación</label>
                  <p className="mt-1 text-sm text-gray-900 flex items-center gap-2">
                    {postulacion.aval_talento_humano ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600" />
                    )}
                    {postulacion.aval_talento_humano ? 'Aprobado' : 'Pendiente'}
                  </p>
                </div>
              </div>
            </div>

            {/* Información de la Convocatoria */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Información de la Convocatoria
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nombre de Convocatoria</label>
                  <p className="mt-1 text-sm text-gray-900">{convocatoria.nombre_convocatoria}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Estado de Convocatoria</label>
                  <p className="mt-1 text-sm text-gray-900">{convocatoria.estado_convocatoria}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Fecha de Postulación</label>
                  <p className="mt-1 text-sm text-gray-900 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {new Date(postulacion.fecha_postulacion).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {vistaActiva === 'documentos' && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Documentos Adjuntos
              </h3>
              <p className="text-sm text-gray-600">
                Los documentos específicos del postulante estarán disponibles aquí una vez que se implemente la carga de archivos.
              </p>
              {/* Aquí se pueden agregar listas de documentos cuando estén disponibles */}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DetallePostulacion;