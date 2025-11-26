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

type Inputs = {
  email: string;
  password: string;
};

const Login = () => {
  const navigate = useNavigate();

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
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="flex bg-white flex-col gap-8 md:gap-4 px-8 py-4 sm:w-[500px] items-center justify-center md:min-h-[550px] shadow-lg  relative rounded-3xl">
        <div className="flex flex-col gap-2  w-full">
          <div className="flex  justify-center items-center">
            <img className="size-30" src={logoClaro} alt="" />
          </div>
          <h3 className="font-bold text-2xl"> Iniciar sesión </h3>
          <h3>
            ¡Hola! <span className="text-blue-500 font-bold">Ingresa</span> con
            tu correo y contraseña
          </h3>
        </div>
        <form
          className="flex flex-col gap-6 w-full"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="">
            <InputLabel htmlFor="email" value="Email" />
            <TextInput
              id="email"
              type="text"
              placeholder="Email..."
              {...register("email")}
            />
            <InputErrors errors={errors} name="email" />
          </div>
          <div className="">
            <InputLabel htmlFor="password" value="Contraseña" />
            <InputPassword
              id="password"
              type="password"
              placeholder="Contraseña..."
              {...register("password")}
            />
            <InputErrors errors={errors} name="password" />
            <p className="text-sm pt-2 text-gray-500 text-start">
              <Link
                to="/restablecer-contrasena"
                className="text-blue-500 hover:text-blue-600"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </p>
          </div>
          <div className="">
            <ButtonPrimary
              className="w-full"
              value="Iniciar Sesión"
              type="submit"
            />
          </div>
          <p className="text-base text-gray-500 text-center">
            ¿No tienes una cuenta?{" "}
            <Link to="/registro" className="text-blue-500 hover:text-blue-600">
              Regístrate aquí
            </Link>
          </p>
        </form>
        <div className="hidden sm:flex absolute size-full right-0 rotate-5 rounded-3xl -z-10  bg-blue-500"></div>
      </div>
    </div>
  );
};

export default Login;
