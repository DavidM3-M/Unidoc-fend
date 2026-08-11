import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { ShieldCheck } from "lucide-react";
import axiosInstance from "../../../utils/axiosConfig";
import { mensajeDeErrorApi } from "../../../utils/erroresApi";
import { hoyISO } from "../../../utils/fechas";
import { InputLabel } from "../../../componentes/formularios/InputLabel";
import TextInput from "../../../componentes/formularios/TextInput";
import TextArea from "../../../componentes/formularios/TextArea";
import InputErrors from "../../../componentes/formularios/InputErrors";
import { ButtonPrimary } from "../../../componentes/formularios/ButtonPrimary";
import { ButtonSecondary } from "../../../componentes/formularios/ButtonSecondary";
import {
  umbralEvaluacionSchema,
  type UmbralFormInputs,
} from "../../../validaciones/admin/umbralEvaluacionSchema";

type Props = {
  /** Umbral que está rigiendo ahora, solo para mostrarlo como referencia. */
  valorVigente?: number | null;
  onSuccess: () => void;
  onCancel: () => void;
};

const RegistrarUmbralModal = ({ valorVigente, onSuccess, onCancel }: Props) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UmbralFormInputs>({
    resolver: zodResolver(umbralEvaluacionSchema),
    defaultValues: {
      vigencia_desde: hoyISO(),
    },
  });

  const onSubmit = async (data: UmbralFormInputs) => {
    try {
      await toast.promise(
        axiosInstance.post(
          import.meta.env.VITE_ENDPOINT_CREAR_UMBRAL_EVALUACION,
          data
        ),
        {
          pending: "Registrando umbral...",
          success: "Umbral registrado. Las categorías ya otorgadas no se ven afectadas.",
          error: {
            render({ data }) {
              return mensajeDeErrorApi(data, "Error al registrar el umbral.");
            },
            autoClose: 4000,
          },
        }
      );

      onSuccess();
    } catch (error) {
      console.error("Error al registrar el umbral de evaluación:", error);
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
      {valorVigente !== null && valorVigente !== undefined && (
        <p className="text-sm text-[#6b7a8d]">
          El umbral vigente es{" "}
          <span className="font-semibold text-[#1e3a5f]">{valorVigente}</span>.
          Registrar uno nuevo cierra el actual y conserva el histórico.
        </p>
      )}

      <div>
        <InputLabel htmlFor="valor_minimo" value="Nuevo umbral (0.0 - 5.0) *" />
        <TextInput
          type="number"
          id="valor_minimo"
          step="0.1"
          min="0"
          max="5"
          placeholder="Ej: 4.5"
          {...register("valor_minimo", { valueAsNumber: true })}
        />
        <InputErrors errors={errors} name="valor_minimo" />
      </div>

      <div>
        <InputLabel htmlFor="vigencia_desde" value="Rige desde *" />
        <TextInput
          type="date"
          id="vigencia_desde"
          min={hoyISO()}
          {...register("vigencia_desde")}
        />
        <InputErrors errors={errors} name="vigencia_desde" />
      </div>

      <div>
        <InputLabel htmlFor="observaciones" value="Observaciones" />
        <TextArea
          id="observaciones"
          placeholder="Justificación del cambio (ej: Acuerdo 012 de 2026)"
          maxLength={500}
          {...register("observaciones")}
        />
        <InputErrors errors={errors} name="observaciones" />
      </div>

      <div className="flex items-start gap-2 rounded-lg bg-[rgba(30,58,95,0.04)] p-3 text-xs text-[#2c3e50]">
        <ShieldCheck className="h-4 w-4 flex-shrink-0 text-[#1e3a5f]" />
        <p>
          Cambiar el umbral <span className="font-semibold">no degrada</span> las
          categorías ya otorgadas: cada docente conserva la suya mientras siga
          cumpliendo los requisitos que regían cuando la obtuvo.
        </p>
      </div>

      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} disabled={isSubmitting}>
          <ButtonSecondary value="Cancelar" className="px-8 py-3" />
        </button>
        <ButtonPrimary
          value="Registrar umbral"
          className="px-8"
          disabled={isSubmitting}
          loading={isSubmitting}
        />
      </div>
    </form>
  );
};

export default RegistrarUmbralModal;
