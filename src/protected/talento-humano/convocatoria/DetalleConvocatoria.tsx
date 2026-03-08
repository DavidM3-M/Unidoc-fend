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
  const isActive = convocatoria.estado_convocatoria === "activa" || convocatoria.estado_convocatoria === "abierta";

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="space-y-4">

          {/* Información General */}
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5">
            <h3 className="text-base font-semibold text-emerald-800 mb-4 flex items-center gap-2">
              <div className="p-1.5 bg-emerald-100 rounded-lg">
                <FileText className="w-4 h-4 text-emerald-600" />
              </div>
              Información General
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                  Nombre de la Convocatoria
                </label>
                <p className="text-sm font-medium text-gray-900">{convocatoria.nombre_convocatoria}</p>
              </div>
              {convocatoria.descripcion && (
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                    Descripción
                  </label>
                  <p className="text-sm text-gray-700 leading-relaxed">{convocatoria.descripcion}</p>
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Estado</label>
                <div className="flex items-center gap-2 mt-1">
                  {isActive ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                      <CheckCircle className="w-3.5 h-3.5" />
                      {convocatoria.estado_convocatoria}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                      <XCircle className="w-3.5 h-3.5" />
                      {convocatoria.estado_convocatoria}
                    </span>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                  Postulantes
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <div className="p-1.5 bg-emerald-100 rounded-lg">
                    <Users className="w-4 h-4 text-emerald-600" />
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {convocatoria.numero_postulantes || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Fechas */}
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-5">
            <h3 className="text-base font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <div className="p-1.5 bg-gray-200 rounded-lg">
                <Calendar className="w-4 h-4 text-gray-600" />
              </div>
              Fechas Importantes
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Fecha de Inicio
                </label>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm font-medium text-gray-900">
                    {new Date(convocatoria.fecha_inicio).toLocaleDateString("es-ES", {
                      day: "2-digit", month: "long", year: "numeric",
                    })}
                  </span>
                </div>
              </div>
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Fecha de Fin
                </label>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-red-400" />
                  <span className="text-sm font-medium text-gray-900">
                    {new Date(convocatoria.fecha_fin).toLocaleDateString("es-ES", {
                      day: "2-digit", month: "long", year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DetalleConvocatoria;