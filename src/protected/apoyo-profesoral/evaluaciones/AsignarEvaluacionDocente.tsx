import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { toast } from "react-toastify";
import axiosInstance from "../../../utils/axiosConfig";
import { InputLabel } from "../../../componentes/formularios/InputLabel";
import TextInput from "../../../componentes/formularios/TextInput";
import Select from "../../../componentes/formularios/Select";
import InputErrors from "../../../componentes/formularios/InputErrors";
import { ButtonPrimary } from "../../../componentes/formularios/ButtonPrimary";
import { ButtonSecondary } from "../../../componentes/formularios/ButtonSecondary";
import { useLanguage } from "../../../context/useLanguage";
import {
  ESTADOS_EVALUACION,
  evaluacionSchema,
  type EvaluacionFormInputs,
} from "../../../validaciones/apoyo-profesoral/evaluacionSchema";
import type { EvaluacionAsignada } from "../../../types/evaluacionDocente";

type Props = {
  docenteId: number;
  nombreDocente: string;
  /** Evaluación ya asignada: si viene, el formulario actualiza en vez de asignar. */
  evaluacionActual?: EvaluacionAsignada | null;
  onSuccess: () => void;
  onCancel?: () => void;
};

const AsignarEvaluacionDocente = ({
  docenteId,
  nombreDocente,
  evaluacionActual,
  onSuccess,
  onCancel,
}: Props) => {
  const { t } = useLanguage();
  const esActualizacion = !!evaluacionActual;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EvaluacionFormInputs>({
    resolver: zodResolver(evaluacionSchema),
    defaultValues: {
      // El backend serializa el decimal(3,1) como string, hay que volverlo número.
      promedio_evaluacion_docente: evaluacionActual
        ? Number(evaluacionActual.promedio_evaluacion_docente)
        : undefined,
      estado_evaluacion_docente:
        evaluacionActual?.estado_evaluacion_docente ?? "Pendiente",
    },
  });

  const mensajeDeError = (error: unknown) => {
    if (axios.isAxiosError(error)) {
      if (error.code === "ECONNABORTED") {
        return "Tiempo de espera agotado. Intenta de nuevo.";
      }

      if (error.response) {
        const errores = error.response.data?.errors;
        if (errores && typeof errores === "object") {
          return `Errores: ${Object.values(errores).flat().join(", ")}`;
        }
        // 409 al asignar sobre un docente que ya tiene evaluación, 404 al actualizar
        // una que no existe: en ambos casos el backend explica qué ruta usar.
        return error.response.data?.message || "Error al guardar los datos.";
      }

      if (error.request) {
        return "No se recibió respuesta del servidor.";
      }
    }

    return "Error inesperado al guardar los datos.";
  };

  const onSubmit = async (data: EvaluacionFormInputs) => {
    // El backend expone PUT real (sin el truco `_method`), así que se envía JSON.
    const peticion = esActualizacion
      ? axiosInstance.put(
          `${import.meta.env.VITE_ENDPOINT_AP_ACTUALIZAR_EVALUACION_DOCENTE}${docenteId}`,
          data
        )
      : axiosInstance.post(
          `${import.meta.env.VITE_ENDPOINT_ASIGNAR_EVALUACION_DOCENTE}${docenteId}`,
          data
        );

    try {
      await toast.promise(peticion, {
        pending: esActualizacion
          ? t("messages.evaluation.updating")
          : t("messages.evaluation.assigning"),
        success: esActualizacion
          ? t("messages.evaluation.updated")
          : t("messages.evaluation.assigned"),
        error: {
          render({ data }) {
            return mensajeDeError(data);
          },
          autoClose: 4000,
        },
      });

      onSuccess();
    } catch (error) {
      console.error("Error al guardar la evaluación docente:", error);
    }
  };

  return (
    // noValidate: sin esto el navegador bloquea el submit con su propio globo
    // cuando el número se sale de min/max/step, y zod nunca alcanza a pintar el
    // mensaje debajo del campo.
    <form
      className="flex flex-col gap-5 p-1"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
    >
      <p className="text-sm text-[#6b7a8d]">
        {esActualizacion ? "Actualizando" : "Asignando"} la evaluación de{" "}
        <span className="font-semibold text-[#1e3a5f]">{nombreDocente}</span>.
      </p>

      <div>
        <InputLabel
          htmlFor="promedio_evaluacion_docente"
          value="Promedio de evaluación (0.0 - 5.0) *"
        />
        <TextInput
          type="number"
          id="promedio_evaluacion_docente"
          step="0.1"
          min="0"
          max="5"
          placeholder="Ej: 4.5"
          {...register("promedio_evaluacion_docente", { valueAsNumber: true })}
        />
        <InputErrors errors={errors} name="promedio_evaluacion_docente" />
      </div>

      <div>
        <InputLabel htmlFor="estado_evaluacion_docente" value="Estado *" />
        <Select id="estado_evaluacion_docente" {...register("estado_evaluacion_docente")}>
          {ESTADOS_EVALUACION.map((estado) => (
            <option key={estado} value={estado}>
              {estado}
            </option>
          ))}
        </Select>
        <InputErrors errors={errors} name="estado_evaluacion_docente" />
      </div>

      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
        {onCancel && (
          <button type="button" onClick={onCancel} disabled={isSubmitting}>
            <ButtonSecondary value="Cancelar" className="px-8 py-3" />
          </button>
        )}
        <ButtonPrimary
          value={esActualizacion ? "Actualizar evaluación" : "Asignar evaluación"}
          className="px-8"
          disabled={isSubmitting}
          loading={isSubmitting}
        />
      </div>
    </form>
  );
};

export default AsignarEvaluacionDocente;
