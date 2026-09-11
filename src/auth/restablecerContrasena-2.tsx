import { SubmitHandler, useForm } from "react-hook-form";
import { ButtonPrimary } from "../componentes/formularios/ButtonPrimary";
import InputErrors from "../componentes/formularios/InputErrors";
import { InputLabel } from "../componentes/formularios/InputLabel";
import InputPassword from "../componentes/formularios/InputPassword";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate, useSearchParams } from "react-router-dom";
import { restablecerContrasenaSchema2 } from "../validaciones/restablecerContrasenaSchema";
import { REQUISITOS_CONTRASENA } from "../validaciones/contrasena";
import AnimatedWavesBackground from "../componentes/AnimatedWavesBackground";
import { MarcaRecuperacion, PasosRecuperacion, VolverAlLogin } from "./PiezasRecuperacion";

type Inputs = {
  email: string;
  password: string;
  password_confirmation: string;
};

const RestablecerContrasena2 = () => {
  const navigate = useNavigate();
  // Obtener los parámetros de búsqueda de la URL
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<Inputs>({
    resolver: zodResolver(restablecerContrasenaSchema2),
    defaultValues: {
      email: email || "", // Establecer el valor predeterminado del email
    },
  });

  const url = `${
    import.meta.env.VITE_API_URL
  }/auth/restablecer-contrasena-token`;

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    if (!token) {
      toast.error("Token inválido o faltante.");
      return;
    }

    try {
      await toast.promise(
        axios.post(
          url,
          { ...data, token },
          {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            timeout: 10000,
          }
        ),
        {
          pending: "Cambiando contraseña...",
          success: "¡Tu contraseña ha sido restablecida con éxito!",
          error: {
            render({ data: error }) {
              if (axios.isAxiosError(error)) {
                if (error.code === "ECONNABORTED") {
                  return "Tiempo de espera agotado. Intente nuevamente";
                }
                if (error.response) {
                  switch (error.response.status) {
                    case 400:
                      return "Datos inválidos";
                    case 410:
                      return "Token inválido o expirado";
                    case 500:
                      return "Error en el servidor";
                    default:
                      return (
                        error.response.data?.message ||
                        "Error al restablecer la contraseña"
                      );
                  }
                }
                if (error.request) {
                  return "No se recibió respuesta del servidor";
                }
              }
              return "Error al restablecer la contraseña";
            },
          },
        }
      );

      setTimeout(() => {
        navigate("/");
      }, 1000);

      reset();
    } catch (error) {
      console.error("Error al restablecer contraseña:", error);
    }
  };

  // Los requisitos se enuncian mientras se escribe, en vez de dejar que se descubran fallando, y
  // salen de la misma definicion que valida el envio: cada uno sabe comprobarse a si mismo, asi que
  // la lista no puede quedarse diciendo algo distinto de lo que el formulario acepta.
  const contrasena = watch("password") ?? "";
  const requisitos = REQUISITOS_CONTRASENA.map(({ texto, cumple }) => ({
    texto,
    cumplido: contrasena.length > 0 && cumple(contrasena),
  }));

  return (
    <>
      <AnimatedWavesBackground />

      {/* Misma tarjeta unica y mismas medidas que el paso 1 y que `login.tsx`. */}
      <div className="relative z-10 w-full min-h-dvh flex items-center justify-center px-4 py-6 font-[var(--font-base)]">
        <div className="w-full max-w-[440px] sm:max-w-[560px] bg-white rounded-2xl shadow-2xl border border-[var(--color-border)] p-6 sm:p-8 flex flex-col gap-5">

          <MarcaRecuperacion
            titulo="Crea tu nueva contraseña"
            descripcion={
              email ? (
                <>
                  Sera la que uses para entrar como{" "}
                  <span className="font-bold text-[var(--color-navy)]">{email}</span>
                </>
              ) : (
                "Sera la que uses para entrar a partir de ahora"
              )
            }
          />

          <PasosRecuperacion activo={2} />

          <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
            <div>
              <InputLabel htmlFor="password" value="Nueva contraseña" />
              {/* `InputPassword` trae el ojo para revelarla, igual que el login. */}
              <InputPassword
                id="password"
                type="password"
                autoComplete="new-password"
                placeholder="Escribe tu nueva contraseña"
                {...register("password")}
              />
              <InputErrors errors={errors} name="password" />

              <ul className="flex flex-col gap-1 pt-2">
                {requisitos.map(({ texto, cumplido }) => (
                  <li
                    key={texto}
                    className={`flex items-center gap-1.5 text-xs transition-colors ${
                      cumplido ? "font-semibold text-[#0e6b4f]" : "text-[var(--color-muted)]"
                    }`}
                  >
                    <span aria-hidden="true" className="w-3 flex-none text-center">
                      {cumplido ? "✓" : "•"}
                    </span>
                    {texto}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <InputLabel htmlFor="password_confirmation" value="Confirmar contraseña" />
              <InputPassword
                id="password_confirmation"
                type="password"
                autoComplete="new-password"
                placeholder="Escribela otra vez"
                {...register("password_confirmation")}
              />
              <InputErrors errors={errors} name="password_confirmation" />
            </div>

            <ButtonPrimary
              className="w-full !px-6"
              value={isSubmitting ? "Guardando..." : "Guardar y entrar"}
              type="submit"
              disabled={isSubmitting}
            />
          </form>

          <VolverAlLogin texto="Volver a iniciar sesión" />
        </div>
      </div>
    </>
  );
};

export default RestablecerContrasena2;