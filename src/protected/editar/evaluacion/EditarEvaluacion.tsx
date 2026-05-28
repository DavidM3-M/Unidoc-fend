import { useForm } from "react-hook-form";
import { ButtonPrimary } from "../../../componentes/formularios/ButtonPrimary";
import { ButtonRegresar } from "../../../componentes/formularios/ButtonRegresar";
import InputErrors from "../../../componentes/formularios/InputErrors";
import { InputLabel } from "../../../componentes/formularios/InputLabel";
import { useLanguage } from "../../../context/LanguageContext";
import TextInput from "../../../componentes/formularios/TextInput";
import { zodResolver } from "@hookform/resolvers/zod";
import { evaluacionSchema } from "../../../validaciones/docente/evaluacionSchema";
import { Link } from "react-router";
import { useEffect, useState } from "react";
import axiosInstance from "../../../utils/axiosConfig";
import { toast } from "react-toastify";

type Inputs = {
  promedio_evaluacion_docente: number;
};

const EditarEvaluacion = () => {
  const { t } = useLanguage();
  const [isSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<Inputs>({ resolver: zodResolver(evaluacionSchema) });

  useEffect(() => {
    const fetchEvaluacion = async () => {
      try {
        const endpoint = import.meta.env.VITE_ENDPOINT_OBTENER_EVALUACION_DOCENTE;
        const response = await axiosInstance.get(endpoint);
        console.log(response.data);
        setValue(
          "promedio_evaluacion_docente",
          response.data.data.promedio_evaluacion_docente
        );

      } catch (error) {
        console.error("Error al obtener la evaluacion:", error);
      }
    };

    fetchEvaluacion();
  }, [setValue]);

  const onSubmit = async (data: Inputs) => {
    try {
      const formData = new FormData();
      formData.append("_method", "PUT");

      formData.append(
        "promedio_evaluacion_docente",
        data.promedio_evaluacion_docente.toString()
      );

      const endpoint = import.meta.env.VITE_ENDPOINT_ACTUALIZAR_EVALUACION_DOCENTE;

      await toast.promise(axiosInstance.post(endpoint, formData), {
        pending: t("messages.evaluation.updating"),
        success: {
          render() {
            setTimeout(() => {
              window.location.href = "/index";
            }, 1500);
            return t("messages.evaluation.updated");
          },
        },
        error: t("messages.evaluation.updateError"),
      });
    } catch (error) {
      console.error("Error al enviar los datos:", error);
      toast.error(t("messages.evaluation.updateError"));
    }
  };

  return (
    <div className="flex flex-col bg-white p-8 rounded-xl shadow-md sm:w-xl max-w-4xl gap-y-4">
      <div className="flex gap-x-4 col-span-full items-center">
        <Link to={"/index"}>
          <ButtonRegresar />
        </Link>
        <h4 className="font-bold text-xl">Editar evaluación</h4>
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
            value={isSubmitting ? "Enviando..." : "Editar evaluación"}
            disabled={isSubmitting}
          />
        </div>
      </form>
    </div>
  );
};
export default EditarEvaluacion;
