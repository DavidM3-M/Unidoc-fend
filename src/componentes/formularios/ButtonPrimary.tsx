import React from 'react';
import clsx from 'clsx';

type Props = {
  value: string | React.ReactNode; // Permite contenido React
  type?: "submit" | "button" | "reset";
  className?: string;
  disabled?: boolean;
  loading?: boolean; // Nueva prop opcional
}

export const ButtonPrimary = ({ 
  className, 
  value, 
  type = "submit", 
  disabled = false,
  loading = false // Nueva prop
}: Props) => {
  return (
    <button
      className={clsx(
        'font-semibold py-3 px-6 md:px-16 rounded-xl transition-all duration-200 text-base shadow-lg hover:shadow-xl',
        !className?.includes('bg-') && 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white',
        (disabled || loading) && 'opacity-60 cursor-not-allowed',
        className
      )}
      type={type}
      disabled={disabled || loading} // Deshabilitar si está loading
    >
      {loading ? (
        <span className="inline-flex items-center justify-center">
          {/* Opcional: añadir un spinner aquí */}
          <span className="mr-2">Enviando...</span>
        </span>
      ) : value}
    </button>
  );
}