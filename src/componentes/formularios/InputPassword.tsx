"use client";

import { useState } from "react";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

const InputPassword = ({ className = "", ...props }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <input
        {...props}
        type={showPassword ? "text" : "password"}
        className={`${className}         
          h-12 w-full rounded-xl border-2 border-gray-300
          shadow-md p-3 pr-11 text-sm text-slate-900 font-medium
          focus:outline-none focus:border-blue-500 focus:shadow-lg focus:ring-1 focus:ring-blue-400
          transition-all duration-200 placeholder-gray-400`}
      />
      <button
        type="button"
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-950/60 hover:text-blue-600 transition-colors duration-200"
        onClick={() => setShowPassword(!showPassword)}
        aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
      >
        {showPassword ? (
          <EyeIcon className="h-5 w-5" />
        ) : (
          <EyeSlashIcon className="h-5 w-5" />
        )}
      </button>
    </div>
  );
};

export default InputPassword;