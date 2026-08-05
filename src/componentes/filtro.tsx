import React, { useState, useEffect, useRef } from 'react';

type OpcionFiltro = {
  valor: string;
  etiqueta: string;
  icono?: React.ReactNode;
};

type FiltroProps = {
  opciones: OpcionFiltro[];
  valorInicial?: string;
  onChange: (valor: string) => void;
  className?: string;
  estiloBoton?: string;
  estiloLista?: string;
  estiloItem?: string;
  placeholder?: string;
};

const FiltroDesplegable: React.FC<FiltroProps> = ({
  opciones,
  valorInicial = '',
  onChange,
  className = '',
  estiloBoton = 'bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]',
  estiloLista = 'bg-white border border-gray-300 rounded-lg shadow-lg',
  estiloItem = 'hover:bg-gray-100',
  placeholder = 'Seleccionar'
}) => {
  const [valorSeleccionado, setValorSeleccionado] = useState(valorInicial);
  const [dropdownAbierto, setDropdownAbierto] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Manejar clics fuera del dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownAbierto(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Obtener la etiqueta de la opción seleccionada
  const obtenerEtiquetaActiva = () => {
    return opciones.find(op => op.valor === valorSeleccionado)?.etiqueta || placeholder;
  };

  // Manejar selección de opción
  const handleSeleccion = (valor: string) => {
    setValorSeleccionado(valor);
    onChange(valor);
    setDropdownAbierto(false);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Botón principal del dropdown */}
      <button
        type="button"
        onClick={() => setDropdownAbierto(!dropdownAbierto)}
        className={`flex items-center justify-between w-full px-4 py-2 text-left ${estiloBoton}`}
        aria-haspopup="listbox"
        aria-expanded={dropdownAbierto}
      >
        <div className="flex items-center">
          {opciones.find(op => op.valor === valorSeleccionado)?.icono}
          <span className={opciones.find(op => op.valor === valorSeleccionado)?.icono ? 'ml-2' : ''}>
            {obtenerEtiquetaActiva()}
          </span>
        </div>
        <svg
          className={`w-5 h-5 ml-2 transition-transform duration-200 ${
            dropdownAbierto ? 'transform rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Lista desplegable */}
      {dropdownAbierto && (
        <div
          className={`absolute z-10 w-full mt-1 ${estiloLista}`}
          role="listbox"
        >
          {opciones.map((opcion) => (
            <button
              key={opcion.valor}
              type="button"
              onClick={() => handleSeleccion(opcion.valor)}
              className={`block w-full px-4 py-2 text-left ${
                /* ✅ REFACTORIZADO: bg-blue-100 text-blue-800 -> bg-[#f0f4f8] text-[#1e3a5f] */
                valorSeleccionado === opcion.valor ? 'bg-[#f0f4f8] text-[#1e3a5f] font-medium' : 'text-gray-800'
              } ${estiloItem}`}
              role="option"
              aria-selected={valorSeleccionado === opcion.valor}
            >
              <div className="flex items-center">
                {opcion.icono}
                <span className={opcion.icono ? 'ml-2' : ''}>{opcion.etiqueta}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default FiltroDesplegable;