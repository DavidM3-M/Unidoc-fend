import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, Loader2, Bot, User, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import axiosInstance from '../../utils/axiosConfig';

/**
 * Renders inline markdown: **bold**, *italic*, and [label](url) document links.
 */
function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
  // Split on bold, italic and markdown links
  const tokens = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\(https?:\/\/[^)]+\))/g);
  return tokens.map((token, i) => {
    const key = `${keyPrefix}-${i}`;
    // Bold
    const bold = token.match(/^\*\*([^*]+)\*\*$/);
    if (bold) return <strong key={key} className="font-semibold">{bold[1]}</strong>;
    // Italic
    const italic = token.match(/^\*([^*]+)\*$/);
    if (italic) return <em key={key}>{italic[1]}</em>;
    // Document link
    const link = token.match(/^\[([^\]]+)\]\((https?:\/\/[^)]+)\)$/);
    if (link) {
      return (
        <a
          key={key}
          href={link[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-violet-700 font-medium underline underline-offset-2 hover:text-violet-900 break-all transition-colors"
          title={`Abrir: ${link[2]}`}
        >
          <FileText size={12} className="shrink-0 text-violet-500" />
          {link[1]}
        </a>
      );
    }
    return <span key={key}>{token}</span>;
  });
}

/**
 * Full markdown renderer: headings, ordered/unordered lists, horizontal rules,
 * blank lines and inline formatting (**bold**, *italic*, links).
 */
function renderContent(content: string): React.ReactNode {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let listItems: React.ReactNode[] = [];
  let listType: 'ul' | 'ol' | null = null;
  let listKey = 0;

  const flushList = () => {
    if (listItems.length === 0) return;
    if (listType === 'ol') {
      elements.push(<ol key={`list-${listKey++}`} className="list-decimal list-inside space-y-0.5 my-1 pl-1">{listItems}</ol>);
    } else {
      elements.push(<ul key={`list-${listKey++}`} className="list-none space-y-0.5 my-1">{listItems}</ul>);
    }
    listItems = [];
    listType = null;
  };

  lines.forEach((line, i) => {
    const key = `line-${i}`;

    // Horizontal rule
    if (/^---+$/.test(line.trim())) {
      flushList();
      elements.push(<hr key={key} className="border-gray-200 my-2" />);
      return;
    }

    // Heading 1-3
    const h = line.match(/^(#{1,3})\s+(.+)/);
    if (h) {
      flushList();
      const level = h[1].length;
      const cls = level === 1
        ? 'text-base font-bold text-gray-800 mt-2 mb-0.5'
        : level === 2
        ? 'text-sm font-bold text-gray-700 mt-1.5 mb-0.5'
        : 'text-sm font-semibold text-gray-600 mt-1 mb-0.5';
      elements.push(<p key={key} className={cls}>{renderInline(h[2], key)}</p>);
      return;
    }

    // Unordered list item: lines starting with - · • * (with optional indent)
    const ul = line.match(/^(\s*)[-·•\*]\s+(.+)/);
    if (ul) {
      const indent = ul[1].length > 0;
      if (listType !== 'ul') { flushList(); listType = 'ul'; }
      listItems.push(
        <li key={key} className={`flex gap-1.5 items-start ${indent ? 'pl-4' : ''}`}>
          <span className="text-violet-400 mt-0.5 shrink-0">•</span>
          <span>{renderInline(ul[2], key)}</span>
        </li>
      );
      return;
    }

    // Ordered list item: 1. 2. etc.
    const ol = line.match(/^(\s*)\d+\.\s+(.+)/);
    if (ol) {
      const indent = ol[1].length > 0;
      if (listType !== 'ol') { flushList(); listType = 'ol'; }
      listItems.push(
        <li key={key} className={`flex gap-1.5 items-start ${indent ? 'pl-4' : ''}`}>
          <span>{renderInline(ol[2], key)}</span>
        </li>
      );
      return;
    }

    // Empty line
    if (line.trim() === '') {
      flushList();
      elements.push(<div key={key} className="h-1" />);
      return;
    }

    // Normal paragraph
    flushList();
    elements.push(<p key={key} className="leading-relaxed">{renderInline(line, key)}</p>);
  });

  flushList();
  return <div className="space-y-0.5">{elements}</div>;
}

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
  { emoji: '�', label: 'Muéstrame sus documentos' },
  { emoji: '💪', label: '¿Cuáles son sus fortalezas?' },
  { emoji: '⭐', label: '¿Es un buen candidato para docente?' },
];

const ACCIONES_GENERAL = [
  { emoji: '🔍', label: 'Busca un aspirante por nombre o cédula' },
  { emoji: '📄', label: '¿Qué documentos tiene un usuario?' },
  { emoji: '🎓', label: '¿Qué estudios tiene un aspirante?' },
  { emoji: '💼', label: '¿Cuál es la experiencia de un usuario?' },
];

const ChatIAWidget: React.FC<ChatIAWidgetProps> = ({
  convocatoriaId,
  aspiranteId,
  aspiranteNombre,
  open,
  onClose,
}) => {
  const [isOpen, setIsOpen] = useState(open ?? false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /* Sync with controlled prop */
  useEffect(() => {
    if (open !== undefined) {
      setIsOpen(open);
      if (open) setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [open]);

  const contextLabel = aspiranteNombre
    ? `Aspirante: ${aspiranteNombre}`
    : convocatoriaId
    ? `Convocatoria #${convocatoriaId}`
    : 'Búsqueda general en BD';

  const modoGeneral = !aspiranteId && !convocatoriaId;
  const acciones = aspiranteId
    ? ACCIONES_ASPIRANTE
    : convocatoriaId
    ? ACCIONES_CONVOCATORIA
    : ACCIONES_GENERAL;

  /* Welcome message */
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcome = aspiranteNombre
        ? `Hola! Puedo analizar el perfil de **${aspiranteNombre}**, sus documentos, estudios, experiencia e idiomas. Los documentos aparecerán como enlaces para abrirlos directamente. ¿En qué te ayudo?`
        : convocatoriaId
        ? `Hola! Tengo acceso a los aspirantes de la convocatoria #${convocatoriaId}. Puedo comparar perfiles, identificar los mejores candidatos y mostrar sus documentos. ¿Por dónde empezamos?`
        : `Hola! Soy el asistente IA de UniDoc. Puedo **buscar usuarios y aspirantes** en la base de datos por nombre, apellido o cédula, y mostrarte sus documentos, estudios, experiencia e idiomas con enlaces directos.\n\nEjemplos:\n• "¿Qué documentos tiene Carlos Pérez?"\n• "Muéstrame los documentos de cédula 1023456789"\n• "Busca a María García"`;

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
    setTimeout(() => inputRef.current?.focus(), 150);
  };

  const handleClose = () => {
    setIsOpen(false);
    onClose?.();
  };

  const enviarMensaje = async (pregunta: string) => {
    if (!pregunta.trim() || loading) return;

    // Snapshot del historial ANTES de añadir el nuevo mensaje
    const historialActual = messages
      .filter(m => m.id !== '0') // excluye bienvenida
      .slice(-10)                // últimos 10 para no inflar el payload
      .map(m => ({ role: m.role, content: m.content }));

    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: pregunta }]);
    setInput('');
    setLoading(true);

    try {
      const payload: Record<string, unknown> = { pregunta, historial: historialActual };
      if (aspiranteId) {
        payload.user_id = aspiranteId;
      } else if (convocatoriaId) {
        payload.convocatoria_id = convocatoriaId;
      } else {
        // Modo búsqueda general: pasa la pregunta como término de búsqueda en la BD
        payload.buscar = pregunta;
      }

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
      {/* ── Toggle tab fixed on right edge ────────────────────────── */}
      <button
        onClick={isOpen ? handleClose : handleOpen}
        style={{ top: '50%', transform: 'translateY(-50%)' }}
        className={`fixed z-[90] flex flex-col items-center gap-2 py-5 px-2.5
          bg-gradient-to-b from-violet-600 to-indigo-600 text-white
          rounded-l-xl shadow-xl hover:from-violet-700 hover:to-indigo-700
          transition-all duration-300
          ${isOpen ? 'right-[380px]' : 'right-0'}`}
        title={isOpen ? 'Cerrar asistente IA' : 'Abrir asistente IA'}
        aria-label={isOpen ? 'Cerrar asistente IA' : 'Abrir asistente IA'}
      >
        <Sparkles size={17} />
        <span
          className="text-[11px] font-semibold tracking-wide"
          style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
        >
          IA UniDoc
        </span>
        {isOpen ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
      </button>

      {/* ── Sidebar panel ───────────────────────────────────────── */}
      <div
        className={`fixed top-0 right-0 h-screen w-[380px] max-w-[100vw] z-[85]
          bg-white shadow-2xl border-l border-gray-200 flex flex-col
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        aria-hidden={!isOpen}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center shrink-0">
              <Sparkles size={15} className="text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-white font-semibold text-sm leading-tight">Asistente IA UniDoc</p>
              <p className="text-violet-200 text-xs truncate">{contextLabel}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-white hover:bg-white/20 p-1.5 rounded-lg shrink-0 transition-colors"
            aria-label="Cerrar"
          >
            <X size={16} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center shrink-0 mt-1">
                  <Bot size={12} className="text-violet-600" />
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed break-words ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-none'
                    : 'bg-white text-gray-700 shadow-sm border border-gray-100 rounded-bl-none'
                }`}
              >
                {msg.role === 'assistant'
                  ? renderContent(msg.content)
                  : <span className="whitespace-pre-wrap">{msg.content}</span>
                }
              </div>
              {msg.role === 'user' && (
                <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 mt-1">
                  <User size={12} className="text-indigo-600" />
                </div>
              )}
            </div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div className="flex gap-2 justify-start">
              <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center">
                <Loader2 size={12} className="text-violet-600 animate-spin" />
              </div>
              <div className="bg-white rounded-xl px-3 py-2.5 shadow-sm border border-gray-100 rounded-bl-none">
                <div className="flex gap-1 items-center h-3">
                  <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick actions — only shown at conversation start */}
        {messages.length <= 1 && !loading && (
          <div className="px-3 py-2 flex flex-wrap gap-1.5 shrink-0 bg-gray-50 border-t border-gray-100">
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
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                void enviarMensaje(input);
              }
            }}
            placeholder={modoGeneral ? 'Busca por nombre, apellido o cédula...' : 'Pregunta sobre los aspirantes...'}
            className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-300 disabled:bg-gray-50"
            disabled={loading}
          />
          <button
            onClick={() => void enviarMensaje(input)}
            disabled={!input.trim() || loading}
            className="w-9 h-9 bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-white rounded-xl flex items-center justify-center transition-colors shrink-0"
            aria-label="Enviar"
          >
            <Send size={14} />
          </button>
        </div>
      </div>

      {/* Backdrop on mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[80] bg-black/20 lg:hidden"
          onClick={handleClose}
          aria-hidden="true"
        />
      )}
    </>
  );
};

export default ChatIAWidget;
