import axios from "axios";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import { loginSchema } from "../validaciones/loginSchema";
import { Link, useNavigate } from "react-router-dom";
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
      <Link
            to="/convocatorias-publicas"
            className="fixed top-4 right-4 z-50 inline-flex items-center gap-2 bg-[var(--color-navy)] hover:bg-[var(--color-navy-light)] text-white px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-lg hover:shadow-xl font-[var(--font-base)]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
            </svg>
            Ver convocatorias
          </Link>
      <div className="flex flex-col items-center justify-center min-h-screen relative z-10 p-3 gap-3 md:gap-4 font-[var(--font-base)]">  
        {/* Recuadro superior - Logo y bienvenida */}
        <div className="bg-white px-6 py-6 w-full sm:w-[500px] shadow-2xl rounded-2xl border border-[var(--color-border)]">
          <div className="flex justify-center items-center mb-4">
            <div className="bg-white rounded-full p-5 shadow-md border border-[var(--color-beige-alt)]">
              <img className="size-24" src={logoClaro} alt="Logo UniDoc" />
            </div>
          </div>
          <h3 className="font-[var(--font-hero)] font-black text-3xl text-center text-[var(--color-navy)] mb-2 tracking-tight">{t("login.title")}</h3>
          <p className="text-center text-[var(--color-text)] text-xs sm:text-sm font-medium">
            {t("login.subtitle")}
          </p>
        </div>

        {/* Recuadro medio - Formulario */}
        <div className="bg-white px-6 py-6 w-full sm:w-[500px] shadow-2xl rounded-2xl border border-[var(--color-border)]">
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
              <p className="text-xs pt-2 text-[var(--color-muted)] text-start">
                <Link
                  to="/restablecer-contrasena"
                  className="text-[var(--color-navy)] hover:text-[var(--color-orange)] transition-colors font-bold"
                >
                  {t("login.forgot")}
                </Link>
              </p>
            </div>
            
            <div className="flex justify-center pt-2">
              <ButtonPrimary
                className="w-full sm:w-2/3 !bg-[var(--color-orange)] hover:!bg-[var(--color-orange-dark)] !text-white !font-bold"
                value={t("login.cta")}
                type="submit"
              />
            </div>
          </form>
        </div>

        {/* Recuadro inferior - Registro */}
        <div className="bg-white px-6 py-4 w-full sm:w-[500px] shadow-2xl rounded-2xl border border-[var(--color-border)] text-center">
          <p className="text-xs sm:text-sm text-[var(--color-text)] mb-3">
            {t("login.noAccount")} {" "}
            <Link 
              to="/registro" 
              className="text-[var(--color-orange)] hover:text-[var(--color-orange-dark)] transition-colors font-bold"
            >
              {t("login.register")}
            </Link>
          </p>
          <div className="flex items-center gap-2 mb-3">
            <hr className="flex-1 border-[var(--color-beige-alt)]" />
            <span className="text-xs text-[var(--color-muted)] font-medium">o continúa con</span>
            <hr className="flex-1 border-[var(--color-beige-alt)]" />
          </div>
          <a
            href={`${import.meta.env.VITE_API_URL}/auth/google/redirect`}
            className="flex items-center justify-center gap-3 w-full border border-[var(--color-beige-alt)] bg-white rounded-lg px-4 py-2.5 text-sm text-[var(--color-navy)] font-bold hover:bg-[var(--color-beige)] transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Iniciar sesión con Google
          </a>
        </div>
      </div>
    </>
  );
};

export default Login;