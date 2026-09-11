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
  nivelFormacionAcademicaSchema,
  type NivelFormacionAcademicaFormInputs,
} from "../../../validaciones/admin/catalogosSchema";
import type { NivelFormacionAcademica } from "../../../types/catalogos";

type Props = {
  /** Registro a editar; ausente o null cuando se está creando. */
  nivel?: NivelFormacionAcademica | null;
  onSuccess: () => void;
  onCancel: () => void;
};

const ENDPOINT = import.meta.env.VITE_ENDPOINT_ADMIN_NIVELES_FORMACION_ACADEMICA;

const NivelFormacionAcademicaModal = ({ nivel, onSuccess, onCancel }: Props) => {
  const editando = Boolean(nivel);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<NivelFormacionAcademicaFormInputs>({
    resolver: zodResolver(nivelFormacionAcademicaSchema),
    defaultValues: {
      nivel_academico: nivel?.nivel_academico ?? "",
      nivel_formacion: nivel?.nivel_formacion ?? "",
      orden: nivel?.orden != null ? String(nivel.orden) : "",
      activo: nivel?.activo ?? true,
    },
  });

  const onSubmit = async (data: NivelFormacionAcademicaFormInputs) => {
    // `orden` viaja como texto en el formulario; el backend espera un entero o null.
    const payload = { ...data, orden: data.orden ? Number(data.orden) : null };

    try {
      await toast.promise(
        editando
          ? axiosInstance.put(`${ENDPOINT}/${nivel!.id_nivel_formacion_academica}`, payload)
          : axiosInstance.post(ENDPOINT, payload),
        {
          pending: editando ? "Actualizando nivel..." : "Creando nivel...",
          success: editando ? "Nivel actualizado." : "Nivel creado.",
          error: {
            render({ data }) {
              return mensajeDeErrorApi(data, "No se pudo guardar el nivel de formación académica.");
            },
            autoClose: 5000,
          },
        }
      );

      onSuccess();
    } catch (error) {
      console.error("Error al guardar el nivel de formación académica:", error);
    }
  };

  return (
    <form className="flex flex-col gap-5 p-1" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div>
        <InputLabel htmlFor="nivel_academico" value="Nivel académico *" />
        <TextInput
          id="nivel_academico"
          placeholder="Ej: Pregrado"
          maxLength={100}
          {...register("nivel_academico")}
        />
        <InputErrors errors={errors} name="nivel_academico" />
      </div>

      <div>
        <InputLabel htmlFor="nivel_formacion" value="Nivel de formación *" />
        <TextInput
          id="nivel_formacion"
          placeholder="Ej: Universitario"
          maxLength={100}
          {...register("nivel_formacion")}
        />
        <InputErrors errors={errors} name="nivel_formacion" />
      </div>

      <div>
        <InputLabel htmlFor="orden" value="Orden en el escalafón" />
        <TextInput
          id="orden"
          type="number"
          min={0}
          max={999}
          placeholder="Ej: 50"
          {...register("orden")}
        />
        <InputErrors errors={errors} name="orden" />
        <p className="mt-2 text-xs text-[#6b7a8d]">
          Mayor número, nivel más alto: un escalón que exige Maestría (50) también lo cumple quien
          tiene Doctorado (60). Dos niveles pueden compartir el mismo número si son equivalentes.
          <br />
          <b>Déjalo vacío</b> si es formación complementaria (diplomado, curso): se registra en la
          hoja de vida pero no cuenta para ascender.
        </p>
      </div>

      <CheckboxActivo
        id="activo_nivel_formacion_academica"
        registro={register("activo")}
        ayuda="Si lo desmarcas, deja de ofrecerse en los formularios, pero lo ya registrado lo conserva."
      />

      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} disabled={isSubmitting}>
          <ButtonSecondary value="Cancelar" className="px-8 py-3" />
        </button>
        <ButtonPrimary
          value={editando ? "Guardar cambios" : "Crear nivel"}
          className="px-8"
          disabled={isSubmitting}
          loading={isSubmitting}
        />
      </div>
    </form>
  );
};

export default NivelFormacionAcademicaModal;
