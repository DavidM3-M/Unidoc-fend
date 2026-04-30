import React, { useState } from 'react';
import { Sparkles, CheckCircle, XCircle, AlertCircle, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import axiosInstance from '../../utils/axiosConfig';

export interface DocumentoParaValidar {
  /** URL pública del PDF */
  url: string;
  /** Tipo esperado, ej: "certificado bancario del Banco de Colombia" */
  tipo: string;
  /** Etiqueta para mostrar en el resumen, ej: "Certificación Bancaria" */
  etiqueta: string;
  /** Nombre del archivo (opcional) */
  nombreArchivo?: string;
}

interface ResultadoItem {
  doc: DocumentoParaValidar;
  valido: boolean | null;
  confianza: 'alta' | 'media' | 'baja';
  mensaje: string;
  advertencias: string[];
  error?: boolean;
}

interface ValidarTodosIAProps {
  documentos: DocumentoParaValidar[];
}

const CONFIANZA_LABEL: Record<string, string> = {
  alta: 'alta',
  media: 'media',
  baja: 'baja',
};

const ValidarTodosIA: React.FC<ValidarTodosIAProps> = ({ documentos }) => {
  const [loading, setLoading]       = useState(false);
  const [resultados, setResultados] = useState<ResultadoItem[] | null>(null);
  const [expandido, setExpandido]   = useState(true);

  const docs = documentos.filter(d => d.url);

  if (docs.length === 0) return null;

  const validarTodo = async () => {
    setLoading(true);
    setResultados(null);

    const resultados: ResultadoItem[] = await Promise.all(
      docs.map(async (doc) => {
        try {
          const res = await axiosInstance.post('/ia/documento/validar', {
            documento_url:  doc.url,
            tipo_esperado:  doc.tipo,
            nombre_archivo: doc.nombreArchivo,
          });
          return {
            doc,
            valido:       res.data.valido ?? null,
            confianza:    res.data.confianza ?? 'baja',
            mensaje:      res.data.mensaje ?? '',
            advertencias: res.data.advertencias ?? [],
          };
        } catch {
          return {
            doc,
            valido:       null,
            confianza:    'baja' as const,
            mensaje:      'Error al conectar con la IA.',
            advertencias: [],
            error:        true,
          };
        }
      })
    );

    setResultados(resultados);
    setLoading(false);
  };

  const reset = () => { setResultados(null); setExpandido(true); };

  // Contadores resumen
  const totalOk      = resultados?.filter(r => r.valido === true).length  ?? 0;
  const totalMal     = resultados?.filter(r => r.valido === false).length ?? 0;
  const totalIncierto = resultados?.filter(r => r.valido === null).length ?? 0;

  if (resultados) {
    return (
      <div className="mt-4 border border-violet-200 rounded-xl overflow-hidden">
        {/* Header resumen */}
        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white text-sm font-semibold">
            <Sparkles size={15} />
            <span>Resultado de validación IA — {docs.length} documento{docs.length !== 1 ? 's' : ''}</span>
          </div>
          <button onClick={() => setExpandido(v => !v)} className="text-white hover:bg-white/20 p-1 rounded">
            {expandido ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>

        {/* Chips de resumen */}
        <div className="bg-violet-50 px-4 py-2 flex flex-wrap gap-2 text-xs font-medium border-b border-violet-100">
          {totalOk > 0 && (
            <span className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
              <CheckCircle size={11} /> {totalOk} válido{totalOk !== 1 ? 's' : ''}
            </span>
          )}
          {totalMal > 0 && (
            <span className="flex items-center gap-1 bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
              <XCircle size={11} /> {totalMal} con inconsistencia{totalMal !== 1 ? 's' : ''}
            </span>
          )}
          {totalIncierto > 0 && (
            <span className="flex items-center gap-1 bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
              <AlertCircle size={11} /> {totalIncierto} incierto{totalIncierto !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Lista detallada */}
        {expandido && (
          <div className="divide-y divide-gray-100">
            {resultados.map((r, i) => {
              const bgClass =
                r.valido === true  ? 'bg-green-50'  :
                r.valido === false ? 'bg-red-50'    :
                                     'bg-yellow-50';
              const icon =
                r.valido === true  ? <CheckCircle size={14} className="text-green-500 shrink-0 mt-0.5" /> :
                r.valido === false ? <XCircle     size={14} className="text-red-500 shrink-0 mt-0.5" />   :
                                     <AlertCircle size={14} className="text-yellow-500 shrink-0 mt-0.5" />;
              const textClass =
                r.valido === true  ? 'text-green-800' :
                r.valido === false ? 'text-red-800'   :
                                     'text-yellow-800';

              return (
                <div key={i} className={`px-4 py-3 text-xs ${bgClass}`}>
                  <div className="flex items-start gap-2">
                    {icon}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className={`font-semibold ${textClass}`}>{r.doc.etiqueta}</span>
                        <span className="text-gray-400">confianza {CONFIANZA_LABEL[r.confianza]}</span>
                      </div>
                      <p className={`mt-0.5 leading-snug ${textClass} opacity-90`}>{r.mensaje}</p>
                      {r.advertencias.map((adv, j) => (
                        <p key={j} className="mt-0.5 text-yellow-700">⚠ {adv}</p>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Acciones */}
        <div className="bg-gray-50 px-4 py-2 flex gap-3 text-xs border-t border-gray-100">
          <button onClick={validarTodo} className="text-violet-600 hover:text-violet-800 underline">
            Volver a validar
          </button>
          <button onClick={reset} className="text-gray-400 hover:text-gray-600 underline">
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={validarTodo}
      disabled={loading}
      className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
    >
      {loading
        ? <><Loader2 size={15} className="animate-spin" /> Validando {docs.length} documentos con IA...</>
        : <><Sparkles size={15} /> Validar todos los documentos con IA ({docs.length})</>
      }
    </button>
  );
};

export default ValidarTodosIA;
