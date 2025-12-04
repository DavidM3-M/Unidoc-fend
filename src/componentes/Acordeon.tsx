"use client";

import { ChevronDown, ChevronUp } from "lucide-react";

interface AcordeonProps {
  titulo: string;
  children: React.ReactNode;
  isOpen: boolean;        
  onToggle: () => void;   
}

export const Acordeon = ({ titulo, children, isOpen, onToggle }: AcordeonProps) => {
  return (
    <div className="bg-white p-4 rounded-xl shadow-md w-full max-w-4xl mx-auto">

      {/* Encabezado */}
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between cursor-pointer"
      >
        <h2 className="text-xl font-bold">{titulo}</h2>
        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>

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
