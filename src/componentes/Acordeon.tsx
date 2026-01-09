"use client";

import { ChevronDown, ChevronUp } from "lucide-react";

interface AcordeonProps {
  titulo: string;
  children: React.ReactNode;
  isOpen: boolean;        
  onToggle: () => void;
  description?: string;
}

export const Acordeon = ({ titulo, children, isOpen, onToggle, description }: AcordeonProps) => {
  return (
    <div className="bg-white p-4 rounded-xl shadow-md w-full max-w-4xl mx-auto">

      {/* Encabezado */}
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between cursor-pointer"
      >
        <h2 className="text-xl font-bold">{titulo}</h2>
        <div className="p-2 bg-gray-100 bg-opacity-15 rounded-lg hover:bg-opacity-25 transition-all">
          {isOpen ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
        </div>
      </button>

      {/* Descripción siempre visible */}
      {description && (
        <div className="mt-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-gray-700 text-sm leading-relaxed">
            {description}
          </p>
        </div>
      )}

      {/* Contenido con transición */}
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? "max-h-[2500px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="pt-5">
          {children}
        </div>
      </div>

    </div>
  );
};
