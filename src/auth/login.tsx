"use client";

import axios from "axios";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import { loginSchema } from "../validaciones/loginSchema";
import { Link, useNavigate } from "react-router";
import { InputLabel } from "../componentes/formularios/InputLabel";
import TextInput from "../componentes/formularios/TextInput";
import InputErrors from "../componentes/formularios/InputErrors";
import { ButtonPrimary } from "../componentes/formularios/ButtonPrimary";
import { zodResolver } from "@hookform/resolvers/zod";
import logoClaro from "../assets/images/logoClaro.jpg";
import { jwtDecode } from "jwt-decode";
import InputPassword from "../componentes/formularios/InputPassword";
import AnimatedWavesBackground from "../componentes/AnimatedWavesBackground";
import { useLanguage } from "../context/LanguageContext";

type Inputs = {
  email: string;
  password: string;
};

const Login = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const url = import.meta.env.VITE_API_URL + "/auth/iniciar-sesion";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>({ resolver: zodResolver(loginSchema) });

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
      pending: "Iniciando sesión...",
      success: {
        render({ data }) {
          const { token } = data.data;

          Cookies.set("token", token, {
            sameSite: "Strict",
            path: "/",
            expires: 1,
          });

          // Decodifica el token para obtener el rol
          const decoded = jwtDecode<{ rol: string }>(token);

          const rol = decoded.rol;

          // Redirige después de un pequeño delay dependiendo su rol
          setTimeout(() => {
            if (rol === "Aspirante" || rol === "Docente") {
              navigate("/index");
            } else if (rol === "Administrador") {
              navigate("/dashboard");
            } else if (rol === "Talento Humano") {
              navigate("/talento-humano");
            } else if (rol === "Apoyo Profesoral") {
              navigate("/apoyo-profesoral");
            }else if (rol === "Rectoria") {
              navigate("/rectoria/avales");
            }else if (rol === "Vicerrectoria") {
              navigate("/vicerrectoria/avales");
            } else if (rol === "Coordinador") {
              navigate("/coordinador");
            } else {
              toast.error("Rol no reconocido");
            }
          }, 500);

          return "¡Bienvenido!";
        },
        autoClose: 500,
      },
      error: {
        render({ data }) {
          const error = data;
          if (axios.isAxiosError(error)) {
            if (error.code === "ECONNABORTED") {
              return "Tiempo de espera agotado. Intente nuevamente";
            } else if (error.response) {
              switch (error.response.status) {
                case 401:
                  return "Credenciales incorrectas";
                case 500:
                  return "Error en el servidor";
                default:
                  return (
                    error.response.data?.message || "Error al iniciar sesión"
                  );
              }
            } else if (error.request) {
              return "No se recibió respuesta del servidor";
            }
          }
          return "Error al iniciar sesión";
        },
        autoClose: 2000,
      },
    });
  };

  return (
    <>
      <AnimatedWavesBackground />
      <div className="flex flex-col items-center justify-center min-h-screen relative z-10 p-3 gap-3 md:gap-4">
        
        {/* Recuadro superior - Logo y bienvenida */}
        <div className="bg-white/90 backdrop-blur-md px-6 py-6 w-full sm:w-[500px] shadow-2xl rounded-2xl border border-white/30">
          <div className="flex justify-center items-center mb-4">
            <div className="bg-white rounded-full p-5 shadow-lg border border-gray-100">
              <img className="size-24" src={logoClaro} alt="Logo UniDoc" />
            </div>
          </div>
          <h3 className="font-bold text-2xl text-center text-gray-800 mb-1">{t("login.title")}</h3>
          <p className="text-center text-gray-600 text-xs sm:text-sm">
            {t("login.subtitle")}
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
                placeholder={t("login.emailPlaceholder")}
                {...register("email")}
              />
              <InputErrors errors={errors} name="email" />
            </div>
            
            <div>
              <InputLabel htmlFor="password" value="Contraseña" />
              <InputPassword
                id="password"
                type="password"
                placeholder={t("login.passwordPlaceholder")}
                {...register("password")}
              />
              <InputErrors errors={errors} name="password" />
              <p className="text-xs pt-2 text-gray-500 text-start">
                <Link
                  to="/restablecer-contrasena"
                  className="text-blue-600 hover:text-blue-700 transition-colors font-medium"
                >
                  {t("login.forgot")}
                </Link>
              </p>
            </div>
            
            <div className="flex justify-center pt-2">
              <ButtonPrimary
                className="w-full sm:w-2/3"
                value={t("login.cta")}
                type="submit"
              />
            </div>
          </form>
        </div>

        {/* Recuadro inferior - Registro */}
        <div className="bg-white/90 backdrop-blur-md px-6 py-4 w-full sm:w-[500px] shadow-2xl rounded-2xl border border-white/30 text-center">
          <p className="text-xs sm:text-sm text-gray-600">
            {t("login.noAccount")} {" "}
            <Link 
              to="/registro" 
              className="text-blue-600 hover:text-blue-700 transition-colors font-bold"
            >
              {t("login.register")}
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default Login;
