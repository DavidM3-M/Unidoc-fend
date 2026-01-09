import { useEffect, useState } from 'react';
import { 
  SpeakerWaveIcon, 
  LanguageIcon, 
  EyeIcon,
  AdjustmentsHorizontalIcon 
} from '@heroicons/react/24/outline';
import { useLanguage } from "../context/LanguageContext";

const AccessibilityControls = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [fontSize, setFontSize] = useState('normal');
  const [readMode, setReadMode] = useState(false);
  const { lang, setLang } = useLanguage();

  useEffect(() => {
    if (!readMode) return;

    // Narrador por click: narra cualquier elemento que toques/hagas click
    const handleClickToRead = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target) return;

      // Obtener el texto del elemento
      const text = target.innerText?.trim();
      if (!text || text.length < 1) return;

      // Cancelar la lectura anterior y leer el nuevo elemento
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === "en" ? "en-US" : "es-ES";
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      window.speechSynthesis.speak(utterance);
    };

    if (readMode) {
      document.body.addEventListener('click', handleClickToRead, true);
    }

    return () => {
      document.body.removeEventListener('click', handleClickToRead, true);
      window.speechSynthesis.cancel();
    };
  }, [readMode, lang]);

  const toggleReadMode = () => {
    window.speechSynthesis.cancel();
    setReadMode((prev) => !prev);
  };

  const handleFontSizeChange = (size: string) => {
    setFontSize(size);
    const root = document.documentElement;
    switch(size) {
      case 'small':
        root.style.fontSize = '14px';
        break;
      case 'large':
        root.style.fontSize = '18px';
        break;
      default:
        root.style.fontSize = '16px';
    }
  };

  const handleHighContrast = () => {
    document.body.classList.toggle('high-contrast');
  };

  return (
    <>
      {/* Botón flotante principal */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-blue-600 to-blue-500 text-white p-4 rounded-full shadow-2xl hover:shadow-xl transition-all duration-200 hover:scale-110"
        aria-label="Opciones de accesibilidad"
      >
        <AdjustmentsHorizontalIcon className="h-6 w-6" />
      </button>

      {/* Panel de opciones */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/30 p-4 w-64 animate-fadeIn">
          <h3 className="font-bold text-gray-800 mb-4 text-sm">Accesibilidad</h3>
          
          <div className="flex flex-col gap-3">
            {/* Lector de pantalla */}
            <button
              onClick={toggleReadMode}
              className={`flex items-center gap-3 p-3 rounded-xl transition-colors text-left border ${readMode ? 'bg-blue-600 text-white border-blue-600' : 'hover:bg-blue-50 border-transparent text-gray-700'}`}
              aria-label="Activar narrador"
              aria-pressed={readMode}
            >
              <SpeakerWaveIcon className={`h-5 w-5 ${readMode ? 'text-white' : 'text-blue-600'}`} />
              <span className="text-sm font-medium">{readMode ? 'Narrador activo' : 'Narrador'}</span>
            </button>

            {/* Tamaño de texto */}
            <div className="p-3 rounded-xl hover:bg-blue-50">
              <div className="flex items-center gap-3 mb-2">
                <EyeIcon className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">Tamaño de texto</span>
              </div>
              <div className="flex gap-2 ml-8">
                <button
                  onClick={() => handleFontSizeChange('small')}
                  className={`px-3 py-1 text-xs rounded-lg border ${fontSize === 'small' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border-gray-300'}`}
                >
                  A
                </button>
                <button
                  onClick={() => handleFontSizeChange('normal')}
                  className={`px-3 py-1 text-sm rounded-lg border ${fontSize === 'normal' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border-gray-300'}`}
                >
                  A
                </button>
                <button
                  onClick={() => handleFontSizeChange('large')}
                  className={`px-3 py-1 text-base rounded-lg border ${fontSize === 'large' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border-gray-300'}`}
                >
                  A
                </button>
              </div>
            </div>

            {/* Alto contraste */}
            <button
              onClick={handleHighContrast}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 transition-colors text-left"
              aria-label="Activar alto contraste"
            >
              <div className="h-5 w-5 rounded-full bg-gradient-to-r from-black to-white"></div>
              <span className="text-sm font-medium text-gray-700">Alto contraste</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AccessibilityControls;
