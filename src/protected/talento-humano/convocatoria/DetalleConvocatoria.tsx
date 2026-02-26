import { FileText, Calendar, Users, CheckCircle, XCircle } from "lucide-react";

interface Convocatoria {
  id_convocatoria: number;
  nombre_convocatoria: string;
  descripcion?: string;
  fecha_inicio: string;
  fecha_fin: string;
  estado_convocatoria: string;
  numero_postulantes?: number;
}

interface DetalleConvocatoriaProps {
  convocatoria: Convocatoria;
}

const DetalleConvocatoria = ({ convocatoria }: DetalleConvocatoriaProps) => {
  const isActive = convocatoria.estado_convocatoria === 'activa' || convocatoria.estado_convocatoria === 'abierta';

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Contenido del Modal */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="space-y-6">
          {/* Información General */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Información General
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Nombre de la Convocatoria</label>
                <p className="mt-1 text-sm text-gray-900">{convocatoria.nombre_convocatoria}</p>
              </div>
              {convocatoria.descripcion && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Descripción</label>
                  <p className="mt-1 text-sm text-gray-900">{convocatoria.descripcion}</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700">Estado</label>
                <p className="mt-1 text-sm text-gray-900 flex items-center gap-2">
                  {isActive ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-600" />
                  )}
                  {convocatoria.estado_convocatoria}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Número de Postulantes</label>
                <p className="mt-1 text-sm text-gray-900 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  {convocatoria.numero_postulantes || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Fechas */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Fechas Importantes
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Fecha de Inicio</label>
                <p className="mt-1 text-sm text-gray-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {new Date(convocatoria.fecha_inicio).toLocaleDateString()}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Fecha de Fin</label>
                <p className="mt-1 text-sm text-gray-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {new Date(convocatoria.fecha_fin).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetalleConvocatoria;