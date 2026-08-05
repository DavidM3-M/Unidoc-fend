import React from 'react';
import clsx from 'clsx';

type Props = {
  value: string | React.ReactNode;
  type?: "submit" | "button" | "reset";
  className?: string;
  disabled?: boolean;
  loading?: boolean;
}

export const ButtonPrimary = ({ 
  className, 
  value, 
  type = "submit", 
  disabled = false,
  loading = false
}: Props) => {
  return (
    <button
      className={clsx(
        // Tipografía Inter (implícita en font-sans), peso semibold (600)
        'font-sans font-semibold py-3 px-6 md:px-16 rounded-xl transition-all duration-200 text-base shadow-sm hover:shadow-md',
        
        // Color Institucional Sólido: #1e3a5f (Azul Institucional)
        // Se reemplaza el gradiente por una acción sólida de marca
        !className?.includes('bg-') && 'bg-[#1e3a5f] hover:bg-[#162d4a] text-white',
        
        // Estado de deshabilitado siguiendo la opacidad de marca
        (disabled || loading) && 'opacity-60 cursor-not-allowed',
        
        className
      )}
      type={type}
      disabled={disabled || loading}
    >
      {loading ? (
        <span className="inline-flex items-center justify-center">
          {/* Spinner minimalista para mantener elegancia */}
          <span className="animate-pulse mr-2">Cargando...</span>
        </span>
      ) : value}
    </button>
  );
}