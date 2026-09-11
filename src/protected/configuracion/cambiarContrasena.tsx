import { isAxiosError } from "axios";
import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import axiosInstance from "../../utils/axiosConfig";
import InputErrors from "../../componentes/formularios/InputErrors";
import { ButtonPrimary } from "../../componentes/formularios/ButtonPrimary";
import TextInput from "../../componentes/formularios/TextInput";
import { InputLabel } from "../../componentes/formularios/InputLabel";
import { zodResolver } from "@hookform/resolvers/zod";
import { cambiarContrasenaSchema } from "../../validaciones/cambiarContrasena";
import { jwtDecode } from "jwt-decode";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

type Inputs = {
  password: string;
  new_password: string;
  new_password_confirmation: string;
};

type JwtPayload = {
  sub: number;
};

const CambiarContraseña = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Control de visibilidad de contraseñas
  const [showPassword, setShowPassword] = useState({
    password: false,
    new_password: false,
    new_password_confirmation: false,
  });

  const togglePasswordVisibility = (field: keyof typeof showPassword) => {
    setShowPassword({ ...showPassword, [field]: !showPassword[field] });
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Inputs>({
    resolver: zodResolver(cambiarContrasenaSchema),
  });

  const onSubmitPassword: SubmitHandler<Inputs> = async (data) => {
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("password", data.password);
      formData.append("new_password", data.new_password);

      const token = Cookies.get("token");
      if (!token) throw new Error("Token no encontrado");

      const decodedToken = jwtDecode<JwtPayload>(token);
      const id_sub = decodedToken.sub;
      const url = `/auth/actualizar-contrasena/${id_sub}`;

      // El interceptor de axiosInstance ya añade el header Authorization automáticamente
      try {
        await axiosInstance.post(url, formData);
        toast.success("Contraseña cambiada correctamente");
        reset();
      } catch (error: unknown) {
        // Mostrar el mensaje del servidor (ej. contraseña actual incorrecta) en lugar de silenciar el error
        const msg = (isAxiosError<{ message?: string }>(error) ? error.response?.data?.message : undefined) || "Error al cambiar la contraseña";
        toast.error(msg);
      }
    } catch (error) {
      console.error("Error general:", error);
      toast.error("Ocurrió un error inesperado");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto mt-10">
      <div
        className="cursor-pointer bg-white border border-gray-200 text-gray-800 rounded-lg shadow-sm p-4 flex justify-between items-center w-full hover:bg-gray-50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h1 className="text-lg font-bold text-[#1e3a5f]">Cambiar contraseña</h1>
        <span
          className={`ml-45 transform transition-transform text-gray-500 ${
            isOpen ? "rotate-180" : "rotate-0"
          }`}
        >
          ▼
        </span>
      </div>

      {isOpen && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-3 transition-all">
          <form onSubmit={handleSubmit(onSubmitPassword)}>
            <div>
              <div className="mb-6 relative">
                <InputLabel
                  htmlFor="password"
                  value="Contraseña actual"
                  className="font-semibold text-gray-700"
                />
                <div className="relative">
                  <TextInput
                    id="password"
                    type={showPassword.password ? "text" : "password"}
                    placeholder="Contraseña actual..."
                    {...register("password")}
                    className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] transition-colors"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-[#1e3a5f] transition-colors"
                    onClick={() => togglePasswordVisibility("password")}
                  >
                    {showPassword.password ? (
                      <EyeIcon className="w-5 h-5" />
                    ) : (
                      <EyeSlashIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <InputErrors errors={errors} name="password" />
              </div>

              <div className="mb-6 relative">
                <InputLabel
                  htmlFor="new_password"
                  value="Nueva contraseña"
                  className="font-semibold text-gray-700"
                />
                <div className="relative">
                  <TextInput
                    id="new_password"
                    type={showPassword.new_password ? "text" : "password"}
                    placeholder="Nueva contraseña..."
                    {...register("new_password")}
                    className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] transition-colors"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-[#1e3a5f] transition-colors"
                    onClick={() => togglePasswordVisibility("new_password")}
                  >
                    {showPassword.new_password ? (
                      <EyeIcon className="w-5 h-5" />
                    ) : (
                      <EyeSlashIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <InputErrors errors={errors} name="new_password" />
              </div>

              <div className="mb-6 relative">
                <InputLabel
                  htmlFor="new_password_confirmation"
                  value="Confirmar contraseña nueva"
                  className="font-semibold text-gray-700"
                />
                <div className="relative">
                  <TextInput
                    id="new_password_confirmation"
                    type={
                      showPassword.new_password_confirmation
                        ? "text"
                        : "password"
                    }
                    placeholder="Confirmar contraseña nueva..."
                    {...register("new_password_confirmation")}
                    className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] transition-colors"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-[#1e3a5f] transition-colors"
                    onClick={() =>
                      togglePasswordVisibility(
                        "new_password_confirmation"
                      )
                    }
                  >
                    {showPassword.new_password_confirmation ? (
                      <EyeIcon className="w-5 h-5" />
                    ) : (
                      <EyeSlashIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <InputErrors
                  errors={errors}
                  name="new_password_confirmation"
                />
              </div>

              <div className="w-full flex justify-center pt-2">
                <ButtonPrimary
                  value={isSubmitting ? "Guardando..." : "Cambiar contraseña"}
                  className="bg-[#1e3a5f] text-white py-2 px-6 rounded-lg shadow-sm hover:shadow-md transition-all hover:bg-[#152943]"
                />
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default CambiarContraseña;