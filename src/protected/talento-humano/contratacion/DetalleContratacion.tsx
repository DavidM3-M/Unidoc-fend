import { User, Briefcase, DollarSign, Calendar, FileText } from "lucide-react";

interface Contratacion {
  id_contratacion: number;
  user_id: number;
  tipo_contrato: string;
  area: string;
  fecha_inicio: string;
  fecha_fin: string;
  valor_contrato: number;
  usuario_contratado?: {
    primer_nombre: string;
    primer_apellido: string;
    numero_identificacion: string;
    email?: string;
  };
}

interface DetalleContratacionProps {
  contratacion: Contratacion;
}

const DetalleContratacion = ({ contratacion }: DetalleContratacionProps) => {
  const usuario = contratacion.usuario_contratado;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Contenido del Modal */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="space-y-6">
          {/* Información del Contratado */}
          {usuario && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Información del Contratado
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
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="mt-1 text-sm text-gray-900">{usuario.email || 'No especificado'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Información del Contrato */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Información del Contrato
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Tipo de Contrato</label>
                <p className="mt-1 text-sm text-gray-900 flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  {contratacion.tipo_contrato}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Área</label>
                <p className="mt-1 text-sm text-gray-900">{contratacion.area}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Valor del Contrato</label>
                <p className="mt-1 text-sm text-gray-900 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  ${contratacion.valor_contrato.toLocaleString()}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Fecha de Inicio</label>
                <p className="mt-1 text-sm text-gray-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {new Date(contratacion.fecha_inicio).toLocaleDateString()}
                </p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Fecha de Fin</label>
                <p className="mt-1 text-sm text-gray-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {new Date(contratacion.fecha_fin).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetalleContratacion;