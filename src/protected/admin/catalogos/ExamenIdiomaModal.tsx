import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import axiosInstance from "../../../utils/axiosConfig";
import { mensajeDeErrorApi } from "../../../utils/erroresApi";
import { InputLabel } from "../../../componentes/formularios/InputLabel";
import TextInput from "../../../componentes/formularios/TextInput";
import InputErrors from "../../../componentes/formularios/InputErrors";
import { ButtonPrimary } from "../../../componentes/formularios/ButtonPrimary";
import { ButtonSecondary } from "../../../componentes/formularios/ButtonSecondary";
import { CheckboxActivo } from "./ControlesCatalogo";
import {
  examenIdiomaSchema,
  type ExamenIdiomaFormInputs,
} from "../../../validaciones/admin/catalogosSchema";
import type { ExamenIdioma, Idioma } from "../../../types/catalogos";

type Props = {
  /** Idioma al que pertenece el examen; sale de la fila seleccionada, no de un select. */
  idioma: Idioma;
  /** Registro a editar; ausente o null cuando se está creando. */
  examen?: ExamenIdioma | null;
  onSuccess: () => void;
  onCancel: () => void;
};

const ENDPOINT = import.meta.env.VITE_ENDPOINT_ADMIN_EXAMENES_IDIOMA;

const ExamenIdiomaModal = ({ idioma, examen, onSuccess, onCancel }: Props) => {
  const editando = Boolean(examen);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ExamenIdiomaFormInputs>({
    resolver: zodResolver(examenIdiomaSchema),
    defaultValues: {
      nombre_examen: examen?.nombre_examen ?? "",
      vigencia_meses: examen?.vigencia_meses ? String(examen.vigencia_meses) : "",
      activo: examen?.activo ?? true,
    },
  });

  const onSubmit = async (data: ExamenIdiomaFormInputs) => {
    const payload = {
      nombre_examen: data.nombre_examen,
      vigencia_meses: data.vigencia_meses ? Number(data.vigencia_meses) : null,
      activo: data.activo,
      idioma_catalogo_id: idioma.id_idioma_catalogo,
    };

    try {
      await toast.promise(
        editando
          ? axiosInstance.put(`${ENDPOINT}/${examen!.id_examen_idioma}`, payload)
          : axiosInstance.post(ENDPOINT, payload),
        {
          pending: editando ? "Actualizando examen..." : "Creando examen...",
          success: editando ? "Examen actualizado." : "Examen creado.",
          error: {
            render({ data }) {
              return mensajeDeErrorApi(data, "No se pudo guardar el examen.");
            },
            autoClose: 5000,
          },
        }
      );

      onSuccess();
    } catch (error) {
      console.error("Error al guardar el examen de idioma:", error);
    }
  };

  return (
    <form className="flex flex-col gap-5 p-1" onSubmit={handleSubmit(onSubmit)} noValidate>
      <p className="text-sm text-[#6b7a8d]">
        Idioma: <span className="font-semibold text-[#1e3a5f]">{idioma.nombre_idioma}</span>
      </p>

      <div>
        <InputLabel htmlFor="nombre_examen" value="Nombre del examen *" />
        <TextInput
          id="nombre_examen"
          placeholder="Ej: IELTS Academic"
          maxLength={150}
          {...register("nombre_examen")}
        />
        <InputErrors errors={errors} name="nombre_examen" />
        <p className="mt-2 text-xs text-[#6b7a8d]">
          El nombre solo debe ser único dentro de este idioma.
        </p>
      </div>

      <div>
        <InputLabel htmlFor="vigencia_meses" value="Vigencia del certificado (meses)" />
        <TextInput
          id="vigencia_meses"
          type="number"
          min={1}
          max={240}
          placeholder="Ej: 24"
          {...register("vigencia_meses")}
        />
        <InputErrors errors={errors} name="vigencia_meses" />
        <p className="mt-2 text-xs text-[#6b7a8d]">
          Déjalo vacío si el certificado no vence (ej. Cambridge). IELTS vence a los 24 meses.
        </p>
      </div>

      <CheckboxActivo
        id="activo_examen_idioma"
        registro={register("activo")}
        ayuda="Si lo desmarcas, deja de ofrecerse en los formularios, pero lo ya registrado lo conserva."
      />

      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} disabled={isSubmitting}>
          <ButtonSecondary value="Cancelar" className="px-8 py-3" />
        </button>
        <ButtonPrimary
          value={editando ? "Guardar cambios" : "Crear examen"}
          className="px-8"
          disabled={isSubmitting}
          loading={isSubmitting}
        />
      </div>
    </form>
  );
};

export default ExamenIdiomaModal;
