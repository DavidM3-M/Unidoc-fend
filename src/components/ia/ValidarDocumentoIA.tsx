import React, { useState } from 'react';
import { Sparkles, CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import axiosInstance from '../../utils/axiosConfig';

interface ValidationResult {
  valido: boolean | null;
  confianza: 'alta' | 'media' | 'baja';
  mensaje: string;
  advertencias: string[];
}

interface ValidarDocumentoIAProps {
  /** URL pública del documento a validar */
  documentoUrl: string;
  /** Descripción del tipo esperado, ej: "certificado de estudio de Maestría" */
  tipoEsperado: string;
  /** Nombre del archivo (opcional, mejora la validación) */
  nombreArchivo?: string;
}

const CONFIANZA_COLOR: Record<string, string> = {
  alta:  'text-gray-400',
  media: 'text-yellow-500',
  baja:  'text-red-400',
};

const ValidarDocumentoIA: React.FC<ValidarDocumentoIAProps> = ({
  documentoUrl,
  tipoEsperado,
  nombreArchivo,
}) => {
  const [loading,   setLoading]   = useState(false);
  const [resultado, setResultado] = useState<ValidationResult | null>(null);

  const validar = async () => {
    setLoading(true);
    setResultado(null);
    try {
      const res = await axiosInstance.post('/ia/documento/validar', {
        documento_url:  documentoUrl,
        tipo_esperado:  tipoEsperado,
        nombre_archivo: nombreArchivo,
      });
      setResultado(res.data as ValidationResult);
    } catch {
      setResultado({
        valido:       null,
        confianza:    'baja',
        mensaje:      'No se pudo validar el documento. Verifica la configuración de la IA.',
        advertencias: [],
      });
    } finally {
      setLoading(false);
    }
  };

  if (resultado) {
    const icon =
      resultado.valido === true  ? <CheckCircle size={13} className="text-green-500 shrink-0" /> :
      resultado.valido === false ? <XCircle     size={13} className="text-red-500 shrink-0" />   :
                                   <AlertCircle size={13} className="text-yellow-500 shrink-0" />;

    const bgClass =
      resultado.valido === true  ? 'bg-green-50 border-green-200 text-green-800' :
      resultado.valido === false ? 'bg-red-50 border-red-200 text-red-800'       :
                                   'bg-yellow-50 border-yellow-200 text-yellow-800';

    return (
      <div className={`mt-2 p-2 rounded-lg border text-xs ${bgClass}`}>
        <div className="flex items-start gap-1.5">
          {icon}
          <div className="min-w-0">
            <span className="font-semibold">
              {resultado.valido === true  ? 'Documento válido' :
               resultado.valido === false ? 'Posible inconsistencia' :
                                           'Resultado incierto'}
            </span>
            <span className={`ml-2 ${CONFIANZA_COLOR[resultado.confianza]}`}>
              (confianza {resultado.confianza})
            </span>
            <p className="mt-0.5 leading-snug opacity-90">{resultado.mensaje}</p>
            {resultado.advertencias?.map((adv, i) => (
              <p key={i} className="mt-0.5 text-yellow-700">⚠ {adv}</p>
            ))}
          </div>
        </div>
        <button
          onClick={() => setResultado(null)}
          className="mt-1.5 text-xs underline opacity-60 hover:opacity-100"
        >
          Volver a validar
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={validar}
      disabled={loading}
      className="mt-1.5 flex items-center gap-1 text-xs text-violet-600 hover:text-violet-800 disabled:opacity-50 transition-colors"
    >
      {loading
        ? <Loader2 size={11} className="animate-spin" />
        : <Sparkles size={11} />
      }
      <span>{loading ? 'Validando con IA...' : 'Validar con IA'}</span>
    </button>
  );
};

export default ValidarDocumentoIA;
