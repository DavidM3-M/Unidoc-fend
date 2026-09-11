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
import { idiomaSchema, type IdiomaFormInputs } from "../../../validaciones/admin/catalogosSchema";
import type { Idioma } from "../../../types/catalogos";

type Props = {
  /** Registro a editar; ausente o null cuando se está creando. */
  idioma?: Idioma | null;
  onSuccess: () => void;
  onCancel: () => void;
};

const ENDPOINT = import.meta.env.VITE_ENDPOINT_ADMIN_IDIOMAS;

const IdiomaModal = ({ idioma, onSuccess, onCancel }: Props) => {
  const editando = Boolean(idioma);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<IdiomaFormInputs>({
    resolver: zodResolver(idiomaSchema),
    defaultValues: {
      nombre_idioma: idioma?.nombre_idioma ?? "",
      activo: idioma?.activo ?? true,
    },
  });

  const onSubmit = async (data: IdiomaFormInputs) => {
    try {
      await toast.promise(
        editando
          ? axiosInstance.put(`${ENDPOINT}/${idioma!.id_idioma_catalogo}`, data)
          : axiosInstance.post(ENDPOINT, data),
        {
          pending: editando ? "Actualizando idioma..." : "Creando idioma...",
          success: editando ? "Idioma actualizado." : "Idioma creado.",
          error: {
            render({ data }) {
              return mensajeDeErrorApi(data, "No se pudo guardar el idioma.");
            },
            autoClose: 5000,
          },
        }
      );

      onSuccess();
    } catch (error) {
      console.error("Error al guardar el idioma:", error);
    }
  };

  return (
    <form className="flex flex-col gap-5 p-1" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div>
        <InputLabel htmlFor="nombre_idioma" value="Nombre del idioma *" />
        <TextInput
          id="nombre_idioma"
          placeholder="Ej: Inglés"
          maxLength={100}
          {...register("nombre_idioma")}
        />
        <InputErrors errors={errors} name="nombre_idioma" />
      </div>

      <CheckboxActivo
        id="activo_idioma"
        registro={register("activo")}
        ayuda="Si lo desmarcas, deja de ofrecerse en los formularios, pero lo ya registrado lo conserva."
      />

      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} disabled={isSubmitting}>
          <ButtonSecondary value="Cancelar" className="px-8 py-3" />
        </button>
        <ButtonPrimary
          value={editando ? "Guardar cambios" : "Crear idioma"}
          className="px-8"
          disabled={isSubmitting}
          loading={isSubmitting}
        />
      </div>
    </form>
  );
};

export default IdiomaModal;
