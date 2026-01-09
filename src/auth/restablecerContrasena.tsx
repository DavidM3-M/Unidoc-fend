import { SubmitHandler, useForm } from "react-hook-form";
import { ButtonPrimary } from "../componentes/formularios/ButtonPrimary";
import InputErrors from "../componentes/formularios/InputErrors";
import { InputLabel } from "../componentes/formularios/InputLabel";
import TextInput from "../componentes/formularios/TextInput";
import { zodResolver } from "@hookform/resolvers/zod";
import { restablecerContrasenaSchema } from "../validaciones/restablecerContrasenaSchema";
import axios from "axios";
import { toast } from "react-toastify";
import { Link } from "react-router";
import AnimatedWavesBackground from "../componentes/AnimatedWavesBackground";
import { useLanguage } from "../context/LanguageContext";

type Inputs = {
  email: string;
};

const RestablecerContrasena = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>({ resolver: zodResolver(restablecerContrasenaSchema) });
  const { t } = useLanguage();

  const url = import.meta.env.VITE_API_URL + "/auth/restablecer-contrasena";

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    const loginPromise = axios.post(url, data, {
      //Cabeceras de la peticion
      headers: {
        "Content-Type": "application/json", // Tipo de contenido
        Accept: "application/json", // Aceptar respuesta en formato JSON
      },
      timeout: 10000, // 10 segundos timeout
    });

    // Manejo de la respuesta
    toast.promise(loginPromise, {
      pending: "Enviando correo...",
      success: {
        render() {
          return "¡Te hemos enviado un correo, revísalo";
        },
      },
      error: {
        render({ data }) {
          const error = data;
          if (axios.isAxiosError(error)) {
            if (error.code === "ECONNABORTED") {
              return "Tiempo de espera agotado. Intente nuevamente";
            } else if (error.response) {
              switch (error.response.status) {
                case 404:
                  return "Correo no encontrado";
                case 500:
                  return "Error en el servidor";
                default:
                  return (
                    error.response.data?.message ||
                    "Error al restablecer la contraseña"
                  );
              }
            } else if (error.request) {
              return "No se recibió respuesta del servidor";
            }
          }
          return "Error al restablecer la contraseña";
        },
        autoClose: 2000,
      },
    });
  };

  return (
    <>
      <AnimatedWavesBackground />
      <div className="flex flex-col items-center justify-center min-h-screen relative z-10 p-3 gap-3 md:gap-4">
        
        {/* Recuadro superior - Descripción */}
        <div className="bg-white/90 backdrop-blur-md px-6 py-6 w-full sm:w-[500px] shadow-2xl rounded-2xl border border-white/30">
          <h3 className="font-bold text-2xl text-center text-gray-800 mb-3">{t("forgot.title")}</h3>
          <p className="text-center text-gray-600 text-xs sm:text-sm">
            {t("forgot.subtitle")}
          </p>
        </div>

        {/* Recuadro medio - Formulario */}
        <div className="bg-white/90 backdrop-blur-md px-6 py-6 w-full sm:w-[500px] shadow-2xl rounded-2xl border border-white/30">
          <form 
            className="flex flex-col gap-4" 
            onSubmit={handleSubmit(onSubmit)}
          >
            <div>
              <InputLabel htmlFor="email" value="Email" />
              <TextInput
                id="email"
                type="text"
                placeholder="ejemplo@correo.com"
                {...register("email")}
              />
              <InputErrors errors={errors} name="email" />
            </div>
            <div className="flex justify-center pt-2">
              <ButtonPrimary
                className="w-full sm:w-2/3 mt-1"
                value={t("forgot.cta")}
                type="submit"
              />
            </div>
          </form>
        </div>

        {/* Recuadro inferior - Volver */}
        <div className="bg-white/90 backdrop-blur-md px-6 py-4 w-full sm:w-[500px] shadow-2xl rounded-2xl border border-white/30 text-center">
          <p className="text-xs sm:text-sm text-gray-600">
            <Link 
              to="/" 
              className="text-blue-600 hover:text-blue-700 transition-colors font-bold"
            >
              {t("forgot.back")}
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};
export default RestablecerContrasena;
