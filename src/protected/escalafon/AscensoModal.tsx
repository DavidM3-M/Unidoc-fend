import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { AlertTriangle, ArrowUpRight } from "lucide-react";
import axiosInstance from "../../utils/axiosConfig";
import { mensajeDeErrorApi } from "../../utils/erroresApi";
import { fechaLarga } from "../../utils/fechas";
import { InputLabel } from "../../componentes/formularios/InputLabel";
import TextInput from "../../componentes/formularios/TextInput";
import InputErrors from "../../componentes/formularios/InputErrors";
import Select from "../../componentes/formularios/Select";
import { ButtonPrimary } from "../../componentes/formularios/ButtonPrimary";
import { ButtonSecondary } from "../../componentes/formularios/ButtonSecondary";
import {
  ascensoEscalafonSchema,
  type AscensoEscalafonFormInputs,
} from "../../validaciones/escalafon/escalafonSchema";
import type { PeriodoAscenso } from "../../types/escalafon";
import type { AreaEscalafon } from "./area";

type Props = {
  /** El ascenso es el mismo acto para los dos roles, pero cada uno lo pide por su ruta. */
  area: AreaEscalafon;
  userId: number;
  nombreDocente: string;
  escalonVigente: string | null;
  escalonObjetivo: string | null;
  /** Todos los periodos; el select solo ofrece los cerrados. */
  periodos: PeriodoAscenso[];
  /**
   * Cerrar y recargar el expediente. Se llama tanto tras el ascenso como tras un 409: en ambos
   * casos lo que muestra la pantalla dejó de ser cierto.
   */
  onFinalizado: () => void;
  onCancel: () => void;
};

/**
 * Ejecuta el ascenso de un docente contra un periodo **ya cerrado**.
 *
 * El backend revalida la elegibilidad al recibir la petición: no confía en lo que mostró la
 * bandeja. Si otro funcionario rechazó un documento mientras tanto, responde 409 con el motivo
 * redactado — se muestra tal cual y la fila se refresca, en vez de dar el ascenso por hecho.
 */
const AscensoModal = ({
  area,
  userId,
  nombreDocente,
  escalonVigente,
  escalonObjetivo,
  periodos,
  onFinalizado,
  onCancel,
}: Props) => {
  const cerrados = periodos.filter((periodo) => periodo.cerrado);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AscensoEscalafonFormInputs>({
    resolver: zodResolver(ascensoEscalafonSchema),
    defaultValues: {
      // Con un solo periodo cerrado no tiene sentido obligar a elegirlo.
      periodo_ascenso_id:
        cerrados.length === 1 ? String(cerrados[0].id_periodo_ascenso) : "",
      motivo: "",
    },
  });

  const onSubmit = async (data: AscensoEscalafonFormInputs) => {
    const payload = {
      periodo_ascenso_id: Number(data.periodo_ascenso_id),
      motivo: data.motivo?.trim() ? data.motivo.trim() : null,
    };

    try {
      await toast.promise(
        axiosInstance.post(`${area.endpointDocentes}/${userId}/ascender`, payload),
        {
          pending: "Ejecutando el ascenso...",
          success: `${nombreDocente} ascendió a ${escalonObjetivo ?? "la categoría siguiente"}.`,
          error: {
            render({ data: error }) {
              return mensajeDeErrorApi(error, "No se pudo ejecutar el ascenso.");
            },
            autoClose: 8000,
          },
        }
      );

      onFinalizado();
    } catch (error) {
      console.error("Error al ejecutar el ascenso:", error);
      // Aunque falle hay que recargar: el 409 suele venir de un cambio en el expediente que la
      // pantalla todavía no refleja (otro funcionario rechazó un documento mientras tanto).
      onFinalizado();
    }
  };

  if (cerrados.length === 0) {
    return (
      <div className="flex flex-col gap-4 p-1">
        <div className="flex items-start gap-2 rounded-lg border border-[#fde68a] bg-[#fffbeb] p-3 text-sm leading-relaxed text-[#92400e]">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <p>
            No hay ningún periodo cerrado. Solo se puede ascender contra un periodo cerrado:
            mientras sigue abierto, la bandeja muestra una proyección de cómo quedaría el
            expediente al cierre.
          </p>
        </div>
        <div className="flex justify-end pt-2">
          <button type="button" onClick={onCancel}>
            <ButtonSecondary value="Entendido" className="px-8 py-3" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <form className="flex flex-col gap-5 p-1" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="flex flex-wrap items-center gap-2 rounded-lg bg-[rgba(30,58,95,0.04)] p-3 text-sm text-[#2c3e50]">
        <span className="font-semibold text-[#1e3a5f]">{nombreDocente}</span>
        <span className="text-[#6b7a8d]">{escalonVigente ?? "Sin escalafón"}</span>
        <ArrowUpRight className="h-4 w-4 text-[#e8740e]" />
        <span className="font-semibold text-[#1e3a5f]">{escalonObjetivo ?? "—"}</span>
      </div>

      <div>
        <InputLabel htmlFor="periodo_ascenso_id" value="Periodo de ascenso (cerrado) *" />
        <Select id="periodo_ascenso_id" {...register("periodo_ascenso_id")}>
          <option value="">Selecciona el periodo</option>
          {cerrados.map((periodo) => (
            <option key={periodo.id_periodo_ascenso} value={periodo.id_periodo_ascenso}>
              {periodo.nombre} — cierre {fechaLarga(periodo.fecha_cierre)}
            </option>
          ))}
        </Select>
        <InputErrors errors={errors} name="periodo_ascenso_id" />
        <p className="mt-2 text-xs text-[#6b7a8d]">
          El expediente se evalúa con los requisitos congelados en la fecha de cierre de ese
          periodo.
        </p>
      </div>

      <div>
        <InputLabel htmlFor="motivo" value="Motivo" />
        <TextInput
          id="motivo"
          placeholder="Ej: Resolución 118 de 2026"
          maxLength={255}
          {...register("motivo")}
        />
        <InputErrors errors={errors} name="motivo" />
        <p className="mt-2 text-xs text-[#6b7a8d]">Opcional. Queda en el historial del docente.</p>
      </div>

      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
        <button type="button" onClick={onCancel} disabled={isSubmitting}>
          <ButtonSecondary value="Cancelar" className="px-8 py-3" />
        </button>
        <ButtonPrimary
          value="Ejecutar ascenso"
          className="px-8"
          disabled={isSubmitting}
          loading={isSubmitting}
        />
      </div>
    </form>
  );
};

export default AscensoModal;
