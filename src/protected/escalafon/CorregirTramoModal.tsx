import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { AlertTriangle, ArrowRight, Info, Pencil } from "lucide-react";
import axiosInstance from "../../utils/axiosConfig";
import { mensajeDeErrorApi } from "../../utils/erroresApi";
import { fechaLarga } from "../../utils/fechas";
import { InputLabel } from "../../componentes/formularios/InputLabel";
import TextInput from "../../componentes/formularios/TextInput";
import InputErrors from "../../componentes/formularios/InputErrors";
import Select from "../../componentes/formularios/Select";
import { ButtonPrimary } from "../../componentes/formularios/ButtonPrimary";
import { ButtonSecondary } from "../../componentes/formularios/ButtonSecondary";
import { useEscalonesAdmin } from "../../hooks/useEscalonesAdmin";
import {
  corregirTramoSchema,
  type CorregirTramoFormInputs,
} from "../../validaciones/escalafon/historialSchema";
import type { HistorialEscalon, RespuestaCorreccion } from "../../types/escalafon";
import type { AreaEscalafon } from "./area";

type Props = {
  area: AreaEscalafon;
  tramo: HistorialEscalon;
  nombreDocente: string;
  onFinalizado: () => void;
  onCancel: () => void;
};

/** Una cifra antes y después, con la flecha en medio. Solo se pinta si de verdad cambió. */
const Movimiento = ({
  etiqueta,
  antes,
  despues,
  sufijo = "",
}: {
  etiqueta: string;
  antes: number | string | null;
  despues: number | string | null;
  sufijo?: string;
}) => {
  if (antes === despues) {
    return (
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span className="text-[#6b7a8d]">{etiqueta}</span>
        <span className="tabular-nums text-[#9aa7b5]">
          sin cambio ({antes ?? "—"}
          {sufijo})
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-baseline justify-between gap-3 text-sm">
      <span className="text-[#6b7a8d]">{etiqueta}</span>
      <span className="inline-flex items-baseline gap-1.5 font-semibold text-[#1e3a5f]">
        <span className="tabular-nums text-[#9aa7b5] line-through">
          {antes ?? "—"}
          {sufijo}
        </span>
        <ArrowRight className="h-3.5 w-3.5 self-center text-[#e8740e]" />
        <span className="tabular-nums">
          {despues ?? "—"}
          {sufijo}
        </span>
      </span>
    </div>
  );
};

/**
 * Corrige el escalón y/o las fechas de un tramo ya registrado.
 *
 * Es lo único que permite arreglar un expediente sin falsearlo: antes, la única forma de tocar un
 * tramo era revertirlo, y revertir un ingreso deja al docente fuera del escalafón.
 *
 * Lo que **no** se puede corregir —y por eso no está en el formulario— es a qué docente pertenece
 * el tramo, contra qué periodo se otorgó, la vía y las firmas. Los dos primeros trasplantarían
 * antigüedad y falsearían la base legal del acto; las firmas son de quien ejecutó el acto
 * original, y la de quien corrige vive en la bitácora.
 *
 * Tras guardar se muestra qué movió la corrección en vez de cerrar sin más. No es un adorno: las
 * consecuencias no son evidentes desde el formulario. Adelantar `desde` descarta producción
 * académica que hasta ese momento puntuaba, y retrasarlo puede **no dar ni un mes** de antigüedad,
 * porque el motor intersecta los tramos del historial con la experiencia uniautónoma documentada
 * en vez de quedarse con el historial. Sin verlo, se repite la corrección a ciegas.
 */
const CorregirTramoModal = ({ area, tramo, nombreDocente, onFinalizado, onCancel }: Props) => {
  const { escalones, cargando } = useEscalonesAdmin();
  const [resultado, setResultado] = useState<RespuestaCorreccion | null>(null);

  const eraVigente = tramo.hasta === null;

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CorregirTramoFormInputs>({
    resolver: zodResolver(corregirTramoSchema),
    defaultValues: {
      // Vacío en vez de preseleccionado: el catálogo llega por una petición aparte y todavía no
      // está aquí en el primer render. Además dice mejor lo que hace —«Sin cambio»— que repetir
      // el escalón actual, que invita a guardar sin haber tocado nada.
      escalon_id: "",
      desde: tramo.desde?.slice(0, 10) ?? "",
      hasta: tramo.hasta?.slice(0, 10) ?? "",
      reabrir: eraVigente,
      motivo: "",
    },
  });

  const reabrir = watch("reabrir");

  /**
   * Un escalón inactivo vale para un tramo histórico pero no para el vigente: el motor resuelve
   * la categoría contra el catálogo activo. Se filtran aquí para no ofrecer algo que el backend
   * va a rechazar con un 409.
   */
  const disponibles = escalones.filter(
    (escalon) => escalon.activo || (!reabrir && escalon.nombre === tramo.escalon)
  );

  const onSubmit = async (data: CorregirTramoFormInputs) => {
    // Solo se envía lo que cambió. `hasta` es el caso delicado: mandarlo como `null` significa
    // «reabrir el tramo», y omitirlo significa «no tocarlo». Las dos cosas son peticiones
    // distintas, así que la clave se incluye a propósito o no se incluye en absoluto.
    const payload: Record<string, unknown> = { motivo: data.motivo.trim() };

    if (data.escalon_id) payload.escalon_id = Number(data.escalon_id);
    if (data.desde) payload.desde = data.desde;

    if (data.reabrir) {
      if (!eraVigente) payload.hasta = null;
    } else if (data.hasta) {
      payload.hasta = data.hasta;
    }

    try {
      const respuesta = await axiosInstance.put(
        `${area.endpointHistorial}/${tramo.id_historial_escalon}`,
        payload
      );

      toast.success(respuesta.data?.message ?? "Tramo corregido.");
      setResultado(respuesta.data?.data ?? null);
    } catch (error) {
      console.error("Error al corregir el tramo:", error);
      toast.error(mensajeDeErrorApi(error, "No se pudo corregir el tramo."), { autoClose: 9000 });
    }
  };

  // ---- Resumen posterior: qué movió realmente la corrección ----
  if (resultado) {
    const { impacto } = resultado;
    const cambioCategoria = impacto.escalon_vigente.antes !== impacto.escalon_vigente.despues;

    return (
      <div className="flex flex-col gap-4 p-1">
        <p className="text-sm text-[#2c3e50]">
          El tramo de <b>{nombreDocente}</b> quedó corregido. Esto es lo que movió en su expediente
          {impacto.fecha_corte && <>, medido al {fechaLarga(impacto.fecha_corte)}</>}:
        </p>

        <div className="flex flex-col gap-2.5 rounded-xl border border-[rgba(30,58,95,0.09)] p-4">
          <Movimiento
            etiqueta="Categoría vigente"
            antes={impacto.escalon_vigente.antes ?? "Sin escalafón"}
            despues={impacto.escalon_vigente.despues ?? "Sin escalafón"}
          />
          <Movimiento
            etiqueta="Antigüedad en el escalón"
            antes={impacto.meses_en_escalon.antes}
            despues={impacto.meses_en_escalon.despues}
            sufijo=" meses"
          />
          <Movimiento
            etiqueta="Puntaje de producción"
            antes={impacto.puntaje_total.antes}
            despues={impacto.puntaje_total.despues}
            sufijo=" pts"
          />
        </div>

        {impacto.meses_en_escalon.antes === impacto.meses_en_escalon.despues && (
          <p className="flex items-start gap-2 rounded-lg bg-[rgba(30,58,95,0.04)] p-3 text-xs leading-relaxed text-[#2c3e50]">
            <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#1e3a5f]" />
            <span>
              La antigüedad no se movió. Si esperabas que subiera al retrasar la fecha de inicio,
              revisa su experiencia: solo cuentan los meses respaldados por experiencia en la
              Universidad Autónoma con certificado aprobado, y el sistema cruza las dos series.
            </span>
          </p>
        )}

        {cambioCategoria && (
          <p className="flex items-start gap-2 rounded-lg border border-[#fde68a] bg-[#fffbeb] p-3 text-xs leading-relaxed text-[#92400e]">
            <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span>
              Le cambiaste la categoría vigente sin evaluación del motor ni periodo de ascenso.
              Queda registrado en la bitácora y el docente recibe una notificación con tu motivo.
            </span>
          </p>
        )}

        <div className="flex justify-end pt-2">
          <button type="button" onClick={onFinalizado}>
            <ButtonSecondary value="Entendido" className="px-8 py-3" />
          </button>
        </div>
      </div>
    );
  }

  // ---- Formulario ----
  return (
    <form className="flex flex-col gap-5 p-1" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="rounded-lg border border-[rgba(30,58,95,0.09)] p-3 text-sm">
        <span className="text-[#6b7a8d]">Corrigiendo el tramo de</span>
        <p className="font-semibold text-[#1e3a5f]">
          {nombreDocente} · {tramo.escalon}
        </p>
        <p className="text-xs text-[#6b7a8d]">
          {tramo.desde} — {tramo.hasta ?? "vigente"}
          {tramo.via && ` · vía ${tramo.via}`}
        </p>
      </div>

      <div>
        <InputLabel htmlFor="escalon_id" value="Escalón" />
        <Select id="escalon_id" disabled={cargando} {...register("escalon_id")}>
          <option value="">{cargando ? "Cargando escalones..." : "Sin cambio"}</option>
          {disponibles.map((escalon) => (
            <option key={escalon.id_escalon} value={escalon.id_escalon}>
              {escalon.nombre}
              {!escalon.activo ? " (inactivo)" : ""}
            </option>
          ))}
        </Select>
        <InputErrors errors={errors} name="escalon_id" />
        {reabrir && (
          <p className="mt-2 text-xs text-[#6b7a8d]">
            Al quedar vigente, solo se pueden asignar escalones activos.
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <InputLabel htmlFor="desde" value="Desde" />
          <TextInput id="desde" type="date" {...register("desde")} />
          <InputErrors errors={errors} name="desde" />
        </div>

        <div>
          <InputLabel htmlFor="hasta" value="Hasta" />
          <TextInput id="hasta" type="date" disabled={reabrir} {...register("hasta")} />
          <InputErrors errors={errors} name="hasta" />
        </div>
      </div>

      {/* Vaciar un campo de fecha es ambiguo —¿no lo toco, o lo dejo abierto?— así que reabrir es
          una decisión explícita. En un tramo que ya está vigente la casilla queda fija: cerrarlo
          desde aquí sacaría al docente del escalafón sin dejar rastro, y para eso está revertir. */}
      <label
        className={`flex items-start gap-2.5 rounded-lg border p-3 text-sm ${
          eraVigente
            ? "cursor-not-allowed border-[rgba(30,58,95,0.09)] bg-[#f7f8fa] text-[#9aa7b5]"
            : "cursor-pointer border-[rgba(30,58,95,0.14)] text-[#2c3e50]"
        }`}
      >
        <input
          type="checkbox"
          className="mt-0.5 h-4 w-4 accent-[#1e3a5f]"
          disabled={eraVigente}
          {...register("reabrir")}
        />
        <span>
          <b>Dejar este tramo vigente</b> (sin fecha de fin)
          <span className="block text-xs">
            {eraVigente
              ? "Ya es el tramo vigente. Para cerrarlo y sacar al docente del escalafón, usa la reversión."
              : "El docente pasa a tener esta categoría como la actual. Solo puede haber un tramo vigente."}
          </span>
        </span>
      </label>

      <div>
        <InputLabel htmlFor="motivo" value="Motivo *" />
        <TextInput
          id="motivo"
          placeholder="Ej: la contratación se cargó con la fecha del contrato renovado"
          maxLength={1000}
          {...register("motivo")}
        />
        <InputErrors errors={errors} name="motivo" />
        <p className="mt-2 text-xs text-[#6b7a8d]">
          Obligatorio. Queda en la bitácora con tu nombre y el estado del tramo antes y después, y
          le llega al docente por correo.
        </p>
      </div>

      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
        <button type="button" onClick={onCancel} disabled={isSubmitting}>
          <ButtonSecondary value="Cancelar" className="px-8 py-3" />
        </button>
        <ButtonPrimary
          value={
            <span className="inline-flex items-center gap-2">
              <Pencil className="h-4 w-4" /> Guardar corrección
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

export default CorregirTramoModal;
