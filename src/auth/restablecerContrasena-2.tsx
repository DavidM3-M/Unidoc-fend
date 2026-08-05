import { SubmitHandler, useForm } from "react-hook-form";
import { ButtonPrimary } from "../componentes/formularios/ButtonPrimary";
import InputErrors from "../componentes/formularios/InputErrors";
import { InputLabel } from "../componentes/formularios/InputLabel";
import TextInput from "../componentes/formularios/TextInput";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { toast } from "react-toastify";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { restablecerContrasenaSchema2 } from "../validaciones/restablecerContrasenaSchema";
import AnimatedWavesBackground from "../componentes/AnimatedWavesBackground";

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

  return (
    <>
      <AnimatedWavesBackground />
      <div className="flex flex-col items-center justify-center min-h-screen relative z-10 p-3 text-[#2c3e50] font-sans">
        <div className="flex bg-white flex-col gap-8 md:gap-4 px-8 py-4 sm:w-[500px] items-center justify-center md:min-h-[550px] shadow-2xl relative rounded-3xl border border-[rgba(30,58,95,0.09)]">
          <div className="flex flex-col gap-2 w-full">
            <h3 className="font-bold text-2xl text-[#1e3a5f] leading-tight">
              Restablecer contraseña
            </h3>
            <h3 className="text-[#6b7a8d] text-sm sm:text-base leading-relaxed font-medium">
              ¡Perfecto!{" "}
              <span className="text-[#e8740e] font-bold">Ingresa</span> tu nueva
              contraseña para{" "}
              <span className="text-[#1e3a5f] font-bold">{email}</span>
            </h3>
          </div>
          <form
            className="flex flex-col gap-4 w-full"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div>
              <InputLabel htmlFor="password" value="Nueva contraseña" />
              <TextInput
                id="password"
                type="password"
                placeholder="Ingresa tu nueva contraseña..."
                {...register("password")}
              />
              <InputErrors errors={errors} name="password" />
            </div>

            <div>
              <InputLabel
                htmlFor="password_confirmation"
                value="Confirmar contraseña"
              />
              <TextInput
                id="password_confirmation"
                type="password"
                placeholder="Confirma tu nueva contraseña..."
                {...register("password_confirmation")}
              />
              <InputErrors errors={errors} name="password_confirmation" />
            </div>

            <div>
              <ButtonPrimary
                className="w-full bg-[#e8740e] hover:bg-[#c89b14] text-white transition-colors"
                value={isSubmitting ? "Procesando..." : "Restablecer contraseña"}
                type="submit"
                disabled={isSubmitting}
              />
            </div>

            <p className="text-sm text-[#6b7a8d] text-center">
              <Link to="/" className="text-[#1e3a5f] hover:text-[#e8740e] transition-colors font-semibold">
                Volver a iniciar sesión
              </Link>
            </p>
          </form>
          <div className="hidden sm:flex absolute size-full right-0 rotate-5 rounded-3xl -z-10 bg-[#1e3a5f]"></div>
        </div>
      </div>
    </>
  );
};

export default RestablecerContrasena2;