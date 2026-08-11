import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { AlertTriangle } from "lucide-react";
import axiosInstance from "../../../utils/axiosConfig";
import { mensajeDeErrorApi } from "../../../utils/erroresApi";
import { InputLabel } from "../../../componentes/formularios/InputLabel";
import TextInput from "../../../componentes/formularios/TextInput";
import InputErrors from "../../../componentes/formularios/InputErrors";
import { ButtonPrimary } from "../../../componentes/formularios/ButtonPrimary";
import { ButtonSecondary } from "../../../componentes/formularios/ButtonSecondary";
import { CheckboxActivo } from "./ControlesCatalogo";
import {
  ambitoDivulgacionSchema,
  type AmbitoDivulgacionFormInputs,
} from "../../../validaciones/admin/catalogosSchema";
import type { AmbitoDivulgacion, ProductoAcademico } from "../../../types/catalogos";

type Props = {
  /** Producto al que pertenece el ámbito; sale de la fila seleccionada, no de un select. */
  producto: ProductoAcademico;
  /** Registro a editar; ausente o null cuando se está creando. */
  ambito?: AmbitoDivulgacion | null;
  onSuccess: () => void;
  onCancel: () => void;
};

const ENDPOINT = import.meta.env.VITE_ENDPOINT_ADMIN_AMBITOS_DIVULGACION;

const AmbitoDivulgacionModal = ({ producto, ambito, onSuccess, onCancel }: Props) => {
  const editando = Boolean(ambito);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AmbitoDivulgacionFormInputs>({
    resolver: zodResolver(ambitoDivulgacionSchema),
    defaultValues: {
      nombre_ambito_divulgacion: ambito?.nombre_ambito_divulgacion ?? "",
      activo: ambito?.activo ?? true,
    },
  });

  const onSubmit = async (data: AmbitoDivulgacionFormInputs) => {
    const payload = {
      ...data,
      producto_academico_id: producto.id_producto_academico,
    };

    try {
      await toast.promise(
        editando
          ? axiosInstance.put(`${ENDPOINT}/${ambito!.id_ambito_divulgacion}`, payload)
          : axiosInstance.post(ENDPOINT, payload),
        {
          pending: editando
            ? "Actualizando ámbito de divulgación..."
            : "Creando ámbito de divulgación...",
          // Al crear, el backend devuelve en `message` el recordatorio de que el ámbito nuevo
          // todavía no otorga puntaje; se muestra tal cual en vez de un texto genérico.
          success: {
            render({ data }) {
              return (
                data?.data?.message ??
                (editando
                  ? "Ámbito de divulgación actualizado."
                  : "Ámbito de divulgación creado.")
              );
            },
            autoClose: 6000,
          },
          error: {
            render({ data }) {
              return mensajeDeErrorApi(
                data,
                "No se pudo guardar el ámbito de divulgación."
              );
            },
            autoClose: 5000,
          },
        }
      );

      onSuccess();
    } catch (error) {
      console.error("Error al guardar el ámbito de divulgación:", error);
    }
  };

  return (
    <form
      className="flex flex-col gap-5 p-1"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
    >
      <p className="text-sm text-[#6b7a8d]">
        Tipo de producto académico:{" "}
        <span className="font-semibold text-[#1e3a5f]">
          {producto.nombre_producto_academico}
        </span>
      </p>

      <div>
        <InputLabel
          htmlFor="nombre_ambito_divulgacion"
          value="Nombre del ámbito de divulgación *"
        />
        <TextInput
          id="nombre_ambito_divulgacion"
          placeholder="Ej: Difusión internacional"
          maxLength={255}
          {...register("nombre_ambito_divulgacion")}
        />
        <InputErrors errors={errors} name="nombre_ambito_divulgacion" />
        <p className="mt-2 text-xs text-[#6b7a8d]">
          El nombre solo debe ser único dentro de este tipo de producto académico.
        </p>
      </div>

      <CheckboxActivo
        id="activo_ambito"
        registro={register("activo")}
        ayuda="Si lo desmarcas, deja de ofrecerse al registrar producciones académicas, pero las ya registradas conservan su referencia."
      />

      {!editando && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          <p>
            Un ámbito nuevo <span className="font-semibold">suma 0 puntos</span> en la
            evaluación docente hasta que se actualice la tabla de clasificación por ámbito
            en el backend. Solicita ese ajuste al equipo de desarrollo.
          </p>
        </div>
      )}

      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} disabled={isSubmitting}>
          <ButtonSecondary value="Cancelar" className="px-8 py-3" />
        </button>
        <ButtonPrimary
          value={editando ? "Guardar cambios" : "Crear ámbito"}
          className="px-8"
          disabled={isSubmitting}
          loading={isSubmitting}
        />
      </div>
    </form>
  );
};

export default AmbitoDivulgacionModal;
