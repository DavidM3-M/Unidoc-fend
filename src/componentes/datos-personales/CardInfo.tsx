"use client";

import { ReactNode } from "react";

interface CardInfoProps {
  // Estado
  estado: "completado" | "pendiente" | "falta-documento";
  /** Título de la card */
  titulo: string;
  /** Descripción breve (subtítulo) */
  descripcion: string;
  /** Icono a mostrar (componente de Heroicons) */
  icono: React.ElementType;
  /** Color de fondo suave para el icono (ej: "bg-blue-100") */
  colorIcono?: string;
  /** Color del texto del icono (ej: "text-blue-600") */
  colorTexto?: string;
  /** Función al hacer clic en la card */
  onClick?: () => void;
  /** Clases adicionales */
  className?: string;
  /** Children opcional para contenido extra */
  children?: ReactNode;
}

const CardInfo = ({
  estado,
  titulo,
  descripcion,
  icono: Icono,
  colorIcono = "bg-blue-100",
  colorTexto = "text-blue-600",
  onClick,
  className = "",
  children,
}: CardInfoProps) => {
  return (
    <div
      onClick={onClick}
      className={`
        group relative bg-white rounded-xl shadow-md hover:shadow-lg md:h-50
        transition-all duration-300 transform hover:-translate-y-0.5
        overflow-hidden border border-gray-100 cursor-pointer
        ${className}
      `}
    >
      <div className="p-4">
        <div className="flex items-start gap-y-4 flex-col">
          {/* Icono con fondo suave */}
          <div
            className={`
            ${colorIcono} p-3 rounded-xl
            group-hover:scale-110 transition-transform duration-300
          `}
          >
            <Icono className={`w-6 h-6 ${colorTexto}`} />
          </div>

          {/* Título y descripción */}
          <div className="w-full h-full">
            <div className="flex items-center justify-between w-full">
              <h3 className="text-lg font-semibold text-gray-800 mb-1">
                {titulo}
              </h3>
              {/* Flecha indicadora sutil */}
              <svg
                className="w-5 h-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              {descripcion}
            </p>
          </div>
          <div className="absolute top-3 right-3">
            {estado === "completado" ? (
              <span className=" bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                Completado
              </span>
            ) : estado === "falta-documento" ? (
              <span className=" bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                Falta Documento
              </span>
            ) : (
              <span className="border border-blue-500 text-blue-500 text-xs px-2 py-1 rounded-full">
                Pendiente
              </span>
            )}
          </div>
        </div>

        {/* Children adicionales */}
        {children && <div className="">{children}</div>}
      </div>

      {/* Línea sutil en hover */}
      <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent group-hover:w-full transition-all duration-500" />
    </div>
  );
};

export default CardInfo;
