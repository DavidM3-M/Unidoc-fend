import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { AlertTriangle, Info, LogIn } from "lucide-react";
import axiosInstance from "../../utils/axiosConfig";
import { mensajeDeErrorApi } from "../../utils/erroresApi";
import { InputLabel } from "../../componentes/formularios/InputLabel";
import TextInput from "../../componentes/formularios/TextInput";
import InputErrors from "../../componentes/formularios/InputErrors";
import Select from "../../componentes/formularios/Select";
import { ButtonPrimary } from "../../componentes/formularios/ButtonPrimary";
import { ButtonSecondary } from "../../componentes/formularios/ButtonSecondary";
import { useEscalonesAdmin } from "../../hooks/useEscalonesAdmin";
import {
  ingresoManualSchema,
  type IngresoManualFormInputs,
} from "../../validaciones/escalafon/historialSchema";
import type { AreaEscalafon } from "./area";

type Props = {
  area: AreaEscalafon;
  userId: number;
  nombreDocente: string;
  onFinalizado: () => void;
  onCancel: () => void;
};

/**
 * Registra el ingreso de un docente al escalafón en el escalón y la fecha que elige el
 * Administrador.
 *
 * El ingreso ordinario no pasa por aquí: lo dispara la contratación de planta y siempre entra por
 * el primer escalón. Esto cubre lo que aquel no sabe hacer —el docente que llega con una
 * categoría ya reconocida, el reingreso tras una reversión, la carga de expedientes anteriores al
 * sistema— pero **sigue exigiendo contratación de planta vigente**: el escalafón es de los
 * docentes de planta y esa regla no se relaja porque quien registre sea el Administrador.
 *
 * De ahí que el caso «la contratación se cargó tarde» no se arregle aquí sino corrigiendo el
 * tramo: cuando Talento Humano registra el contrato, el docente ya entró solo.
 *
 * Solo se ofrecen escalones activos: el que se elija queda como el escalón **vigente** del
 * docente, y el motor resuelve la categoría contra el catálogo activo.
 */
const IngresoManualModal = ({ area, userId, nombreDocente, onFinalizado, onCancel }: Props) => {
  const { escalones, cargando } = useEscalonesAdmin();
  const activos = escalones.filter((escalon) => escalon.activo);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<IngresoManualFormInputs>({
    resolver: zodResolver(ingresoManualSchema),
    defaultValues: { escalon_id: "", desde: "", motivo: "" },
  });

  const onSubmit = async (data: IngresoManualFormInputs) => {
    const payload = {
      escalon_id: Number(data.escalon_id),
      desde: data.desde,
      motivo: data.motivo.trim(),
    };

    try {
      await toast.promise(
        axiosInstance.post(`${area.endpointDocentes}/${userId}/ingreso-manual`, payload),
        {
          pending: "Registrando el ingreso...",
          success: `${nombreDocente} quedó registrado en el escalafón.`,
          error: {
            render({ data: error }) {
              return mensajeDeErrorApi(error, "No se pudo registrar el ingreso.");
            },
            autoClose: 8000,
          },
        }
      );

      onFinalizado();
    } catch (error) {
      console.error("Error al registrar el ingreso manual:", error);
      // El 409 casi siempre viene de que el expediente cambió por debajo (el observer ya lo metió
      // al registrarse una contratación), así que recargar es lo correcto también al fallar.
      onFinalizado();
    }
  };

  return (
    <form className="flex flex-col gap-5 p-1" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="flex items-start gap-2 rounded-lg bg-[rgba(30,58,95,0.04)] p-3 text-xs leading-relaxed text-[#2c3e50]">
        <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#1e3a5f]" />
        <p>
          Lo normal es que el docente entre solo: al registrarse su contratación de planta el
          sistema lo mete como <b>Auxiliar</b>. Usa esta pantalla cuando eso no baste —llega con
          una categoría ya reconocida, reingresa tras una reversión, o es un expediente anterior al
          sistema—. <b>Sigue haciendo falta una contratación de planta vigente.</b>
        </p>
      </div>

      <div className="rounded-lg border border-[rgba(30,58,95,0.09)] p-3 text-sm">
        <span className="text-[#6b7a8d]">Docente</span>
        <p className="font-semibold text-[#1e3a5f]">{nombreDocente}</p>
      </div>

      <div>
        <InputLabel htmlFor="escalon_id" value="Escalón de entrada *" />
        <Select id="escalon_id" disabled={cargando} {...register("escalon_id")}>
          <option value="">{cargando ? "Cargando escalones..." : "Selecciona el escalón"}</option>
          {activos.map((escalon) => (
            <option key={escalon.id_escalon} value={escalon.id_escalon}>
              {escalon.nombre}
            </option>
          ))}
        </Select>
        <InputErrors errors={errors} name="escalon_id" />
        <p className="mt-2 text-xs text-[#6b7a8d]">
          Queda como su categoría vigente. Solo se ofrecen escalones activos.
        </p>
      </div>

      <div>
        <InputLabel htmlFor="desde" value="Desde *" />
        <TextInput id="desde" type="date" {...register("desde")} />
        <InputErrors errors={errors} name="desde" />
        <p className="mt-2 text-xs text-[#6b7a8d]">
          Es el origen del conteo de antigüedad y el inicio de la ventana de producción académica
          que puntúa. No puede ser futura.
        </p>
      </div>

      <div>
        <InputLabel htmlFor="motivo" value="Motivo *" />
        <TextInput
          id="motivo"
          placeholder="Ej: Categoría homologada al vincularse desde otra universidad"
          maxLength={1000}
          {...register("motivo")}
        />
        <InputErrors errors={errors} name="motivo" />
        <p className="mt-2 text-xs text-[#6b7a8d]">
          Obligatorio. Queda en el historial del docente y en la bitácora, firmado con tu nombre.
        </p>
      </div>

      <div className="flex gap-2.5 rounded-lg border border-[#fde68a] bg-[#fffbeb] p-3 text-xs leading-relaxed text-[#92400e]">
        <AlertTriangle size={15} className="mt-0.5 shrink-0" />
        <div>
          Estás otorgando una categoría <b>sin evaluación del motor ni periodo de ascenso</b>. Es
          una decisión administrativa: queda registrada como tal.
        </div>
      </div>

      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
        <button type="button" onClick={onCancel} disabled={isSubmitting}>
          <ButtonSecondary value="Cancelar" className="px-8 py-3" />
        </button>
        <ButtonPrimary
          value={
            <span className="inline-flex items-center gap-2">
              <LogIn className="h-4 w-4" /> Registrar ingreso
            </span>
          }
          className="px-8"
          disabled={isSubmitting || cargando}
          loading={isSubmitting}
        />
      </div>
    </form>
  );
};

export default IngresoManualModal;
