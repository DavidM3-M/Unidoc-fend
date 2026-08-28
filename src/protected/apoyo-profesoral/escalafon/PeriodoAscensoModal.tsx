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
import {
  periodoAscensoSchema,
  type PeriodoAscensoFormInputs,
} from "../../../validaciones/apoyo-profesoral/escalafonSchema";
import type { PeriodoAscenso } from "../../../types/escalafon";

type Props = {
  periodo?: PeriodoAscenso | null;
  /** Cierre del último periodo distinto de este: el nuevo tiene que ser posterior. */
  fechaCierreUltimo?: string | null;
  onSuccess: () => void;
  onCancel: () => void;
};

const ENDPOINT = import.meta.env.VITE_ENDPOINT_AP_ESCALAFON_PERIODOS;

const PeriodoAscensoModal = ({ periodo, fechaCierreUltimo, onSuccess, onCancel }: Props) => {
  const editando = Boolean(periodo);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PeriodoAscensoFormInputs>({
    resolver: zodResolver(periodoAscensoSchema(fechaCierreUltimo)),
    defaultValues: {
      nombre: periodo?.nombre ?? "",
      fecha_cierre: periodo?.fecha_cierre?.slice(0, 10) ?? "",
    },
  });

  const onSubmit = async (data: PeriodoAscensoFormInputs) => {
    const payload = { nombre: data.nombre, fecha_cierre: data.fecha_cierre };

    try {
      await toast.promise(
        editando
          ? axiosInstance.put(`${ENDPOINT}/${periodo!.id_periodo_ascenso}`, payload)
          : axiosInstance.post(ENDPOINT, payload),
        {
          pending: editando ? "Actualizando periodo..." : "Creando periodo...",
          success: editando ? "Periodo actualizado." : "Periodo creado.",
          error: {
            // El 409 de un periodo ya cerrado llega con el mensaje redactado en español: se
            // muestra tal cual, sin traducir códigos.
            render({ data: error }) {
              return mensajeDeErrorApi(error, "No se pudo guardar el periodo.");
            },
            autoClose: 6000,
          },
        }
      );

      onSuccess();
    } catch (error) {
      console.error("Error al guardar el periodo de ascenso:", error);
    }
  };

  return (
    <form className="flex flex-col gap-5 p-1" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div>
        <InputLabel htmlFor="nombre" value="Nombre *" />
        <TextInput
          id="nombre"
          placeholder="Ej: Ascensos 2026-II"
          maxLength={100}
          {...register("nombre")}
        />
        <InputErrors errors={errors} name="nombre" />
      </div>

      <div>
        <InputLabel htmlFor="fecha_cierre" value="Fecha de cierre *" />
        <TextInput id="fecha_cierre" type="date" {...register("fecha_cierre")} />
        <InputErrors errors={errors} name="fecha_cierre" />
      </div>

      {/* Por qué no hay fecha de apertura: es la duda que trae cualquiera que haya usado otro
          sistema de convocatorias. */}
      <div className="flex items-start gap-2 rounded-lg bg-[rgba(30,58,95,0.04)] p-3 text-xs leading-relaxed text-[#2c3e50]">
        <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#1e3a5f]" />
        <p>
          No hay fecha de apertura: los docentes suben documentos cuando quieran. Esta fecha es el
          corte con el que se congelan todos los requisitos — lo que se suba después cuenta para
          el periodo siguiente.
          {editando && (
            <>
              {" "}
              Una vez cerrado el periodo ya no se puede editar, porque su fecha es el corte con el
              que se evaluaron ascensos reales.
            </>
          )}
        </p>
      </div>

      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} disabled={isSubmitting}>
          <ButtonSecondary value="Cancelar" className="px-8 py-3" />
        </button>
        <ButtonPrimary
          value={editando ? "Guardar cambios" : "Crear periodo"}
          className="px-8"
          disabled={isSubmitting}
          loading={isSubmitting}
        />
      </div>
    </form>
  );
};

export default PeriodoAscensoModal;
