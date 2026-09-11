import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { Info } from "lucide-react";
import axiosInstance from "../../../utils/axiosConfig";
import { mensajeDeErrorApi } from "../../../utils/erroresApi";
import { InputLabel } from "../../../componentes/formularios/InputLabel";
import TextInput from "../../../componentes/formularios/TextInput";
import InputErrors from "../../../componentes/formularios/InputErrors";
import { ButtonPrimary } from "../../../componentes/formularios/ButtonPrimary";
import { ButtonSecondary } from "../../../componentes/formularios/ButtonSecondary";
import { CheckboxActivo } from "./ControlesCatalogo";
import {
  tipoExperienciaSchema,
  type TipoExperienciaFormInputs,
} from "../../../validaciones/admin/catalogosSchema";
import type { RegistrosRenombrados, TipoExperiencia } from "../../../types/catalogos";

type Props = {
  /** Registro a editar; ausente o null cuando se está creando. */
  tipo?: TipoExperiencia | null;
  onSuccess: () => void;
  onCancel: () => void;
};

const ENDPOINT = import.meta.env.VITE_ENDPOINT_ADMIN_TIPOS_EXPERIENCIA;

/** Resumen de los registros históricos que el backend renombró junto con el tipo. */
const resumenRenombrado = (registros?: RegistrosRenombrados): string => {
  const experiencias = registros?.experiencias ?? 0;
  const convocatorias = registros?.convocatorias ?? 0;

  if (experiencias === 0 && convocatorias === 0) {
    return "Tipo de experiencia actualizado.";
  }

  const partes: string[] = [];
  if (experiencias > 0) partes.push(`${experiencias} experiencia(s)`);
  if (convocatorias > 0) partes.push(`${convocatorias} convocatoria(s)`);

  return `Tipo de experiencia actualizado. Se renombraron también ${partes.join(" y ")}.`;
};

const TipoExperienciaModal = ({ tipo, onSuccess, onCancel }: Props) => {
  const editando = Boolean(tipo);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TipoExperienciaFormInputs>({
    resolver: zodResolver(tipoExperienciaSchema),
    defaultValues: {
      nombre_tipo_experiencia: tipo?.nombre_tipo_experiencia ?? "",
      activo: tipo?.activo ?? true,
    },
  });

  const onSubmit = async (data: TipoExperienciaFormInputs) => {
    try {
      await toast.promise(
        editando
          ? axiosInstance.put(`${ENDPOINT}/${tipo!.id_tipo_experiencia}`, data)
          : axiosInstance.post(ENDPOINT, data),
        {
          pending: editando
            ? "Actualizando tipo de experiencia..."
            : "Creando tipo de experiencia...",
          success: {
            // Al actualizar, el backend informa cuántas experiencias y convocatorias
            // arrastró el renombrado; es información que el administrador debe ver.
            render({ data }) {
              if (!editando) return "Tipo de experiencia creado.";
              return resumenRenombrado(data?.data?.registros_renombrados);
            },
            autoClose: 6000,
          },
          error: {
            render({ data }) {
              return mensajeDeErrorApi(data, "No se pudo guardar el tipo de experiencia.");
            },
            autoClose: 5000,
          },
        }
      );

      onSuccess();
    } catch (error) {
      console.error("Error al guardar el tipo de experiencia:", error);
    }
  };

  return (
    <form
      className="flex flex-col gap-5 p-1"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
    >
      <div>
        <InputLabel
          htmlFor="nombre_tipo_experiencia"
          value="Nombre del tipo de experiencia *"
        />
        <TextInput
          id="nombre_tipo_experiencia"
          placeholder="Ej: Experiencia docente universitaria"
          maxLength={100}
          {...register("nombre_tipo_experiencia")}
        />
        <InputErrors errors={errors} name="nombre_tipo_experiencia" />
      </div>

      <CheckboxActivo
        id="activo_tipo_experiencia"
        registro={register("activo")}
        ayuda="Si lo desmarcas, deja de ofrecerse en el formulario de experiencia, pero las experiencias ya registradas lo conservan."
      />

      {editando && (
        <div className="flex items-start gap-2 rounded-lg bg-[rgba(30,58,95,0.04)] p-3 text-xs text-[#2c3e50]">
          <Info className="h-4 w-4 flex-shrink-0 text-[#1e3a5f]" />
          <p>
            Las experiencias y convocatorias guardan este tipo{" "}
            <span className="font-semibold">por su nombre</span>. Si lo cambias, el sistema
            renombra también los registros históricos para que sigan coincidiendo.
          </p>
        </div>
      )}

      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} disabled={isSubmitting}>
          <ButtonSecondary value="Cancelar" className="px-8 py-3" />
        </button>
        <ButtonPrimary
          value={editando ? "Guardar cambios" : "Crear tipo"}
          className="px-8"
          disabled={isSubmitting}
          loading={isSubmitting}
        />
      </div>
    </form>
  );
};

export default TipoExperienciaModal;
