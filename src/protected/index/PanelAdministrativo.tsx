import { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosConfig';
import { Briefcase, Calendar, DollarSign, Building2, Tag, AlertCircle } from 'lucide-react';

interface Contratacion {
  id_contratacion: number;
  tipo_contrato: string;
  tipo_proceso: string;
  tipo_vinculacion: string;
  area: string;
  fecha_inicio: string;
  fecha_fin: string;
  valor_contrato: number;
  observaciones?: string;
}

const mapProceso: Record<string, string> = {
  Contratacion: 'Primera contratación',
  Ascenso: 'Ascenso',
  CambioCargo: 'Cambio de cargo',
};

const formatFecha = (fecha: string) =>
  new Date(fecha).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

const PanelAdministrativo = () => {
  const [contratos, setContratos] = useState<Contratacion[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);

  useEffect(() => {
    axiosInstance
      .get('/administrativo/ver-contratacion')
      .then((res) => setContratos(res.data.contrataciones ?? []))
      .catch(() => setError('No se pudo cargar la información del contrato.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600" />
        <p className="text-gray-600">Cargando información del cargo...</p>
      </div>
    );
  }

  if (error || contratos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-gray-500">
        <AlertCircle size={48} className="text-gray-300" />
        <p className="text-lg font-medium">{error ?? 'No se encontraron contratos asociados.'}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-3xl mx-auto">
      {/* Badge de cargo */}
      <div className="flex items-center gap-4 bg-gradient-to-r from-slate-700 to-slate-900 text-white rounded-2xl px-6 py-5 shadow-lg">
        <div className="p-3 bg-white/10 rounded-xl">
          <Briefcase size={32} className="text-white" />
        </div>
        <div>
          <p className="text-sm text-slate-300 font-medium uppercase tracking-widest">Tipo de vinculación</p>
          <h2 className="text-2xl font-bold">Cargo Administrativo</h2>
        </div>
      </div>

      {/* Lista de contratos */}
      {contratos.map((c) => (
        <div
          key={c.id_contratacion}
          className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
        >
          {/* Encabezado del contrato */}
          <div className="flex flex-wrap items-center gap-2 bg-gray-50 px-6 py-4 border-b border-gray-200">
            <span className="text-lg font-bold text-gray-800">
              Contrato #{c.id_contratacion}
            </span>
            <span className="ml-auto inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300">
              <Tag size={12} />
              {mapProceso[c.tipo_proceso] ?? c.tipo_proceso}
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-300">
              <Briefcase size={12} />
              {c.tipo_contrato}
            </span>
          </div>

          {/* Cuerpo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 px-6 py-5">
            {/* Área */}
            <div className="flex items-start gap-3">
              <Building2 size={20} className="text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Área</p>
                <p className="text-sm font-semibold text-gray-800">{c.area}</p>
              </div>
            </div>

            {/* Valor */}
            <div className="flex items-start gap-3">
              <DollarSign size={20} className="text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Valor del contrato</p>
                <p className="text-sm font-bold text-green-700">
                  ${Number(c.valor_contrato).toLocaleString('es-CO')}
                </p>
              </div>
            </div>

            {/* Fecha inicio */}
            <div className="flex items-start gap-3">
              <Calendar size={20} className="text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Inicio</p>
                <p className="text-sm font-semibold text-gray-800">{formatFecha(c.fecha_inicio)}</p>
              </div>
            </div>

            {/* Fecha fin */}
            <div className="flex items-start gap-3">
              <Calendar size={20} className="text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Finalización</p>
                <p className="text-sm font-semibold text-gray-800">{formatFecha(c.fecha_fin)}</p>
              </div>
            </div>

            {/* Observaciones */}
            {c.observaciones && (
              <div className="col-span-full bg-gray-50 rounded-xl p-4 border border-gray-100">
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Observaciones</p>
                <p className="text-sm text-gray-700">{c.observaciones}</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PanelAdministrativo;
