import { Link } from "react-router";
import { ButtonRegresar } from "../../componentes/formularios/ButtonRegresar";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { InputLabel } from "../../componentes/formularios/InputLabel";
import TextInput from "../../componentes/formularios/TextInput";
import InputErrors from "../../componentes/formularios/InputErrors";
import { evaluacionSchema } from "../../validaciones/docente/evaluacionSchema";
import { useState } from "react";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import axiosInstance from "../../utils/axiosConfig";
import axios from "axios";
import { ButtonPrimary } from "../../componentes/formularios/ButtonPrimary";
import { useLanguage } from "../../context/LanguageContext";

type Inputs = {
  promedio_evaluacion_docente: number;
};

const AgregarEvaluacion = () => {
  const { t } = useLanguage();
  const [isSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>({ resolver: zodResolver(evaluacionSchema) });

  const onSubmit = async (data: Inputs) => {
    try {
      // Crear FormData para enviar los datos del formulario
      const formData = new FormData();
      formData.append(
        "promedio_evaluacion_docente",
        data.promedio_evaluacion_docente.toString()
      );
      formData.append("estado_evaluacion_docente", "Pendiente");

      // Obtener el token de las cookies
      const token = Cookies.get("token");
      if (!token) throw new Error("No se encontró token de autenticación");


      // Construir la URL del endpoint
      const endpoint = `${import.meta.env.VITE_API_URL}${
        import.meta.env.VITE_ENDPOINT_CREAR_EVALUACION_DOCENTE
      }`;

      // Enviar los datos con una notificación de estado
      await toast.promise(axiosInstance.post(endpoint, formData), {
        pending: t("messages.sending"),
        success: {
          render() {
            // Redirigir después de 1.5 segundos
            setTimeout(() => {
              window.location.href = "/index";
            }, 1500);
            return t("messages.success");
          },
          autoClose: 1500,
        },
        error: {
          render({ data }) {
            const error = data;
            if (axios.isAxiosError(error)) {
              if (error.code === "ECONNABORTED") {
                return "Tiempo de espera agotado. Intenta de nuevo.";
              } else if (error.response) {
                const errores = error.response.data?.errors;
                if (errores && typeof errores === "object") {
                  return `Errores: ${Object.values(errores).flat().join(", ")}`;
                }
                return (
                  error.response.data?.message || "Error al guardar los datos."
                );
              } else if (error.request) {
                return "No se recibió respuesta del servidor.";
              }
            }
            return "Error inesperado al guardar los datos.";
          },
          autoClose: 3000,
        },
      });
    } catch (error) {
      console.error("Error al enviar los datos:", error);
    }
  };

  return (
    <div className="flex flex-col bg-white p-8 rounded-xl shadow-md sm:w-xl max-w-4xl gap-y-4">
      <div className="flex gap-x-4 col-span-full items-center">
        <Link to={"/index"}>
          <ButtonRegresar />
        </Link>
        <h4 className="font-bold text-xl">Agregar evaluación</h4>
      </div>
      <form
        className="grid grid-cols-1 gap-6"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="">
          <InputLabel htmlFor="Evaluacion" value="Evaluacion *" />
          <TextInput
            type="number"
            id="promedio_evaluacion_docente"
            step="0.01"
            placeholder="Promedio de evaluación..."
            {...register("promedio_evaluacion_docente", {
              valueAsNumber: true,
              required: true,
            })}
          />
          <InputErrors errors={errors} name="promedio_evaluacion_docente" />
        </div>

        <div className="flex justify-center col-span-full">
          <ButtonPrimary
            value={isSubmitting ? "Enviando..." : "Agregar evaluación"}
            disabled={isSubmitting}
          />
        </div>
      </form>
    </div>
  );
};
export default AgregarEvaluacion;