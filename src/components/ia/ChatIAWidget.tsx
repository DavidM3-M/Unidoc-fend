import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, Loader2, Bot, User } from 'lucide-react';
import axiosInstance from '../../utils/axiosConfig';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatIAWidgetProps {
  /** ID de la convocatoria para contexto de todos sus aspirantes */
  convocatoriaId?: number | null;
  /** ID del aspirante para consultas individuales */
  aspiranteId?: number | null;
  /** Nombre del aspirante (para mostrar en el header) */
  aspiranteNombre?: string | null;
  /** Controla el estado abierto desde el padre */
  open?: boolean;
  /** Callback cuando el widget se cierra */
  onClose?: () => void;
}

const ACCIONES_CONVOCATORIA = [
  { emoji: '🏆', label: '¿Quiénes son los mejores aspirantes?' },
  { emoji: '📋', label: 'Resume el perfil de los postulados' },
  { emoji: '🎓', label: '¿Cuántos tienen doctorado o maestría?' },
  { emoji: '🌍', label: '¿Quiénes tienen mejor nivel de idiomas?' },
];

const ACCIONES_ASPIRANTE = [
  { emoji: '👤', label: 'Descríbeme el perfil de este aspirante' },
  { emoji: '💪', label: '¿Cuáles son sus fortalezas?' },
  { emoji: '📈', label: '¿Cuáles son sus áreas de mejora?' },
  { emoji: '⭐', label: '¿Es un buen candidato para docente?' },
];

const ChatIAWidget: React.FC<ChatIAWidgetProps> = ({
  convocatoriaId,
  aspiranteId,
  aspiranteNombre,
  open,
  onClose,
}) => {
  const [isOpen, setIsOpen]     = useState(open ?? false);

  /* Sincronizar con prop open controlado */
  useEffect(() => {
    if (open !== undefined) {
      setIsOpen(open);
      if (open) setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput]       = useState('');
  const [loading, setLoading]   = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef       = useRef<HTMLInputElement>(null);

  const contextLabel = aspiranteNombre
    ? `Aspirante: ${aspiranteNombre}`
    : convocatoriaId
    ? `Convocatoria #${convocatoriaId}`
    : 'Sin contexto';

  const acciones = aspiranteId ? ACCIONES_ASPIRANTE : ACCIONES_CONVOCATORIA;

  /* Mensaje de bienvenida al abrir */
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcome = aspiranteNombre
        ? `Hola! Puedo analizar el perfil de **${aspiranteNombre}**, evaluar sus estudios, experiencia e idiomas, y responder cualquier pregunta. ¿En qué te ayudo?`
        : convocatoriaId
        ? `Hola! Tengo acceso a los aspirantes de la convocatoria #${convocatoriaId}. Puedo comparar perfiles, identificar los mejores candidatos y responder preguntas sobre el grupo. ¿Por dónde empezamos?`
        : `Hola! Soy el asistente IA de UniDoc. Selecciona una convocatoria o abre el perfil de un aspirante para comenzar el análisis.`;

      setMessages([{ id: '0', role: 'assistant', content: welcome }]);
    }
  }, [isOpen]);

  /* Scroll al último mensaje */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  /* Reiniciar mensajes cuando cambia el contexto */
  useEffect(() => {
    setMessages([]);
  }, [aspiranteId, convocatoriaId]);

  const handleOpen = () => {
    setIsOpen(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const enviarMensaje = async (pregunta: string) => {
    if (!pregunta.trim() || loading) return;

    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: pregunta }]);
    setInput('');
    setLoading(true);

    try {
      const payload: Record<string, unknown> = { pregunta };
      if (aspiranteId)    payload.user_id         = aspiranteId;
      else if (convocatoriaId) payload.convocatoria_id = convocatoriaId;

      const res = await axiosInstance.post('/ia/aspirante/consultar', payload);
      setMessages(prev => [...prev, {
        id: Date.now().toString() + 'a',
        role: 'assistant',
        content: res.data.respuesta ?? 'Sin respuesta.',
      }]);
    } catch {
      setMessages(prev => [...prev, {
        id: Date.now().toString() + 'e',
        role: 'assistant',
        content: '⚠ Error al conectar con la IA. Verifica que GROK_API_KEY esté configurada en el servidor.',
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Botón flotante */}
      {!isOpen && (
        <button
          onClick={handleOpen}
          className="fixed bottom-6 right-6 z-[80] w-14 h-14 bg-gradient-to-br from-violet-600 to-indigo-600 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all flex items-center justify-center"
          title="Asistente IA UniDoc"
        >
          <Sparkles size={22} />
        </button>
      )}

      {/* Panel de chat */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-[80] w-[390px] max-w-[calc(100vw-24px)] h-[570px] max-h-[calc(100vh-48px)] bg-white rounded-2xl shadow-2xl flex flex-col border border-gray-200 overflow-hidden">

          {/* Header */}
          <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                <Sparkles size={17} className="text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-white font-semibold text-sm leading-tight">Asistente IA UniDoc</p>
                <p className="text-violet-200 text-xs truncate">{contextLabel}</p>
              </div>
            </div>
            <button
              onClick={() => { setIsOpen(false); onClose?.(); }}
              className="text-white hover:bg-white/20 p-1.5 rounded-lg shrink-0"
            >
              <X size={17} />
            </button>
          </div>

          {/* Mensajes */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center shrink-0 mt-1">
                    <Bot size={13} className="text-violet-600" />
                  </div>
                )}
                <div
                  className={`max-w-[82%] rounded-xl px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap break-words ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-none'
                      : 'bg-white text-gray-700 shadow-sm border border-gray-100 rounded-bl-none'
                  }`}
                >
                  {msg.content}
                </div>
                {msg.role === 'user' && (
                  <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 mt-1">
                    <User size={13} className="text-indigo-600" />
                  </div>
                )}
              </div>
            ))}

            {/* Indicador de escritura */}
            {loading && (
              <div className="flex gap-2 justify-start">
                <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center">
                  <Loader2 size={13} className="text-violet-600 animate-spin" />
                </div>
                <div className="bg-white rounded-xl px-3 py-2 shadow-sm border border-gray-100 rounded-bl-none">
                  <div className="flex gap-1 items-center h-4">
                    <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Acciones rápidas — solo se muestran al inicio */}
          {messages.length <= 1 && !loading && (
            <div className="px-3 pb-2 flex flex-wrap gap-1.5 shrink-0">
              {acciones.map(a => (
                <button
                  key={a.label}
                  onClick={() => enviarMensaje(a.label)}
                  className="text-xs bg-violet-50 hover:bg-violet-100 text-violet-700 px-2.5 py-1.5 rounded-full border border-violet-200 transition-colors"
                >
                  {a.emoji} {a.label}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-3 border-t border-gray-100 bg-white flex gap-2 shrink-0">
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void enviarMensaje(input); } }}
              placeholder="Pregunta sobre los aspirantes..."
              className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-300 disabled:bg-gray-50"
              disabled={loading}
            />
            <button
              onClick={() => void enviarMensaje(input)}
              disabled={!input.trim() || loading}
              className="w-9 h-9 bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-white rounded-xl flex items-center justify-center transition-colors shrink-0"
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatIAWidget;
