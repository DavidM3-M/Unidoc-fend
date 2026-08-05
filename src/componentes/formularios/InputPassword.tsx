import { useState } from "react";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

const InputPassword = ({ className = "", ...props }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <input
        {...props}
        type={showPassword ? "text" : "password"}
        className={`
          h-12 w-full rounded-xl border border-[rgba(30,58,95,0.15)]
          bg-white p-3 pr-11 text-sm text-[#2c3e50] font-medium
          shadow-sm
          focus:outline-none focus:border-[#e8740e] focus:shadow-[0_0_0_2px_rgba(232,116,14,0.2)]
          transition-all duration-200 placeholder-[#6b7a8d]
          ${className}
        `}
      />
      <button
        type="button"
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-950/60 hover:text-[#e8740e] transition-colors duration-200"
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
