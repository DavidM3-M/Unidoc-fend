import React, { forwardRef } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

type InputSearchProps = React.InputHTMLAttributes<HTMLInputElement> & {
  containerClass?: string;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
};

const InputSearch = forwardRef<HTMLInputElement, InputSearchProps>(
  (
    {
      type = "text",
      className = "",
      containerClass = "",
      // Mantenemos tu icono original con color de apoyo institucional
      icon = <MagnifyingGlassIcon className="h-5 w-5 text-[#6b7a8d]" />,
      iconPosition = "left",
      ...props
    },
    ref
  ) => {
    const hasIcon = !!icon;
    const iconPadding = hasIcon ? (iconPosition === "left" ? "pl-10" : "pr-10") : "px-3";

    return (
      <div className={`relative ${containerClass}`}>
        {hasIcon && iconPosition === "left" && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
        
        <input
          {...props}
          ref={ref}
          type={type}
          // Medidas y estructura intactas, solo colores actualizados
          className={`${className} ${iconPadding}         
            h-11 w-[500px] rounded-lg border-[1.8px] border-[rgba(30,58,95,0.15)] 
            bg-[#ffffff]
            py-2.5 text-sm text-[#2c3e50]
            placeholder-[#6b7a8d] outline-none
            focus:border-[#e8740e] focus:ring-1 focus:ring-[#e8740e]
            transition-all duration-300 ease-in-out
            disabled:opacity-50 disabled:cursor-not-allowed`}
        />
        
        {hasIcon && iconPosition === "right" && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
      </div>
    );
  }
);

InputSearch.displayName = "InputSearch";

export default InputSearch;