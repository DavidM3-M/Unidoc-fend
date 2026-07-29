import { Link } from "react-router";
import { ButtonRegresar } from "../../componentes/formularios/ButtonRegresar";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { InputLabel } from "../../componentes/formularios/InputLabel";
import TextInput from "../../componentes/formularios/TextInput";
import InputErrors from "../../componentes/formularios/InputErrors";
import { evaluacionSchema } from "../../validaciones/docente/evaluacionSchema";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import axiosInstance from "../../utils/axiosConfig";
import axios from "axios";
import { ButtonPrimary } from "../../componentes/formularios/ButtonPrimary";
import { useLanguage } from "../../context/LanguageContext";
import DivForm from "../../componentes/formularios/DivForm";
import { ClipboardCheck } from "lucide-react";

type Inputs = {
  promedio_evaluacion_docente: number;
};

const AgregarEvaluacion = () => {
  const { t } = useLanguage();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Inputs>({ resolver: zodResolver(evaluacionSchema) });

  const onSubmit = async (data: Inputs) => {
    try {
      const formData = new FormData();
      formData.append(
        "promedio_evaluacion_docente",
        data.promedio_evaluacion_docente.toString()
      );
      formData.append("estado_evaluacion_docente", "Pendiente");

      const token = Cookies.get("token");
      if (!token) throw new Error("No se encontró token de autenticación");

      const endpoint = import.meta.env.VITE_ENDPOINT_CREAR_EVALUACION_DOCENTE;

      await toast.promise(axiosInstance.post(endpoint, formData), {
        pending: t("messages.evaluation.sending"),
        success: {
          render() {
            setTimeout(() => {
              window.location.href = "/convocatorias-app/index";
            }, 1500);
            return t("messages.evaluation.sent");
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
    <DivForm>
      {/* Botón Regresar */}
      <div className="mb-4">
        <Link to={"/index"}>
          <ButtonRegresar />
        </Link>
      </div>

      <form
        className="grid grid-cols-1 gap-6"
        onSubmit={handleSubmit(onSubmit)}
      >
        {/* Encabezado */}
        <div className="col-span-full">
          <div className="flex items-center gap-4 mb-5">
            <div className="p-3 rounded-lg bg-[rgba(30,58,95,0.05)] text-[#1e3a5f]">
              <ClipboardCheck size={24} />
            </div>

            <div className="flex flex-col items-start w-full">
              <h4 className="text-lg font-semibold text-[#1e3a5f] tracking-tight">
                Agregar evaluación
              </h4>
              <span className="text-sm text-[#6b7a8d]">
                Registra el promedio de tu evaluación docente obtenida
              </span>
            </div>
          </div>

          {/* Campos */}
          <div className="grid grid-cols-1 gap-6 pt-5 border-t border-[rgba(30,58,95,0.05)]">
            <div>
              <InputLabel htmlFor="promedio_evaluacion_docente" value="Evaluación *" />
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

            {/* Botón de envío alineado */}
            <div className="flex justify-center md:justify-end col-span-full mt-2">
              <ButtonPrimary
                value={isSubmitting ? "Enviando..." : "Agregar evaluación"}
                disabled={isSubmitting}
              />
            </div>
          </div>
        </div>
      </form>
    </DivForm>
  );
};

export default AgregarEvaluacion;