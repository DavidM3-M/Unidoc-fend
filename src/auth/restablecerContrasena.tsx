import { SubmitHandler, useForm } from "react-hook-form";
import { ButtonPrimary } from "../componentes/formularios/ButtonPrimary";
import InputErrors from "../componentes/formularios/InputErrors";
import { InputLabel } from "../componentes/formularios/InputLabel";
import TextInput from "../componentes/formularios/TextInput";
import { zodResolver } from "@hookform/resolvers/zod";
import { restablecerContrasenaSchema } from "../validaciones/restablecerContrasenaSchema";
import axios from "axios";
import { toast } from "react-toastify";
import AnimatedWavesBackground from "../componentes/AnimatedWavesBackground";
import { useLanguage } from "../context/useLanguage";
import { MarcaRecuperacion, PasosRecuperacion, VolverAlLogin } from "./PiezasRecuperacion";

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
      {/* El fondo animado se conserva tal cual: es lo unico que hay detras de la tarjeta. */}
      <AnimatedWavesBackground />

      {/*
        Una sola tarjeta en vez de tres. Eran tres cajas con su propio borde, sombra y separacion
        —titulo, formulario y un enlace suelto— que juntas pasaban de 700 px de alto: en un telefono
        el boton quedaba por debajo del pliegue. Es la misma correccion que ya recibio `login.tsx`.
        `dvh` en lugar de `vh` para que la barra del navegador movil no reste altura util.
      */}
      <div className="relative z-10 w-full min-h-dvh flex items-center justify-center px-4 py-6 font-[var(--font-base)]">
        <div className="w-full max-w-[440px] sm:max-w-[560px] bg-white rounded-2xl shadow-2xl border border-[var(--color-border)] p-6 sm:p-8 flex flex-col gap-5">

          <MarcaRecuperacion titulo={t("forgot.title")} descripcion={t("forgot.subtitle")} />

          <PasosRecuperacion activo={1} />

          <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
            <div>
              <InputLabel htmlFor="email" value="Email" />
              <TextInput
                id="email"
                type="email"
                autoComplete="email"
                placeholder="ejemplo@correo.com"
                {...register("email")}
              />
              <InputErrors errors={errors} name="email" />
            </div>

            {/*
              El plazo esta escrito a mano en `AuthController::actualizarContrasenaConToken` y hasta
              ahora la pantalla no lo mencionaba. Cinco minutos es poco: quien pide el enlace y se
              levanta un momento vuelve a un error sin haber hecho nada mal. Decirlo antes de enviar
              convierte ese fallo en una expectativa.
            */}
            <div className="flex items-start gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-navy-lightest)] px-3 py-2.5">
              <svg
                className="mt-0.5 h-4 w-4 flex-none text-[var(--color-navy)]"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
              >
                <circle cx="8" cy="8" r="6.6" stroke="currentColor" strokeWidth="1.5" />
                <path d="M8 4.7V8l2.1 2.1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <p className="text-xs leading-relaxed text-[var(--color-text)]">
                El enlace que te enviemos caduca a los{" "}
                <span className="font-bold text-[var(--color-navy)]">5 minutos</span> y solo sirve una vez.
              </p>
            </div>

            {/* Navy, como el resto de acciones primarias. El naranja queda para el foco de campo. */}
            <ButtonPrimary className="w-full !px-6" value={t("forgot.cta")} type="submit" />
          </form>

          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <hr className="flex-1 border-[var(--color-beige-alt)]" />
              <span className="text-xs text-[var(--color-muted)] font-medium">o</span>
              <hr className="flex-1 border-[var(--color-beige-alt)]" />
            </div>

            <VolverAlLogin texto={t("forgot.back")} />
          </div>
        </div>
      </div>
    </>
  );
};

export default RestablecerContrasena;