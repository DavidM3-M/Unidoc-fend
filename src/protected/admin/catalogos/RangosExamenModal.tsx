import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { PlusCircle } from "lucide-react";
import axiosInstance from "../../../utils/axiosConfig";
import { mensajeDeErrorApi } from "../../../utils/erroresApi";
import { InputLabel } from "../../../componentes/formularios/InputLabel";
import TextInput from "../../../componentes/formularios/TextInput";
import InputErrors from "../../../componentes/formularios/InputErrors";
import { SelectForm } from "../../../componentes/formularios/SelectForm";
import { ButtonPrimary } from "../../../componentes/formularios/ButtonPrimary";
import { ButtonSecondary } from "../../../componentes/formularios/ButtonSecondary";
import EliminarBoton from "../../../componentes/EliminarBoton";
import { BotonEditar } from "./ControlesCatalogo";
import {
  rangoExamenIdiomaSchema,
  type RangoExamenIdiomaFormInputs,
} from "../../../validaciones/admin/catalogosSchema";
import type { ExamenIdioma, RangoExamenIdioma } from "../../../types/catalogos";

type Props = {
  examen: ExamenIdioma;
  onClose: () => void;
};

const ENDPOINT = import.meta.env.VITE_ENDPOINT_ADMIN_RANGOS_EXAMEN_IDIOMA;

/**
 * Tabla de equivalencia puntaje → MCER de un examen, con alta/edición/borrado de rangos.
 *
 * Es maestro-detalle de tercer nivel (Idioma → Examen → Rango), así que en vez de otro diálogo
 * anidado, el formulario de alta/edición vive dentro de este mismo contenido: se muestra la
 * tabla o el formulario, nunca los dos a la vez.
 */
const RangosExamenModal = ({ examen, onClose }: Props) => {
  const [rangos, setRangos] = useState<RangoExamenIdioma[]>([]);
  const [cargando, setCargando] = useState(true);
  const [rangoEditando, setRangoEditando] = useState<RangoExamenIdioma | null>(null);
  const [formAbierto, setFormAbierto] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RangoExamenIdiomaFormInputs>({
    resolver: zodResolver(rangoExamenIdiomaSchema),
  });

  const fetchRangos = async () => {
    try {
      setCargando(true);
      const respuesta = await axiosInstance.get(ENDPOINT, {
        params: { examen_idioma_id: examen.id_examen_idioma },
      });
      setRangos(respuesta.data?.data ?? []);
    } catch (error) {
      console.error("Error al obtener los rangos del examen:", error);
      toast.error(mensajeDeErrorApi(error, "Error al cargar los rangos"));
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    fetchRangos();
    // Solo al montar: el examen no cambia mientras este diálogo está abierto.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const abrirNuevo = () => {
    setRangoEditando(null);
    reset({ puntaje_min: undefined, puntaje_max: undefined, nivel_mcer: undefined });
    setFormAbierto(true);
  };

  const abrirEditar = (rango: RangoExamenIdioma) => {
    setRangoEditando(rango);
    reset({
      puntaje_min: rango.puntaje_min,
      puntaje_max: rango.puntaje_max,
      nivel_mcer: rango.nivel_mcer,
    });
    setFormAbierto(true);
  };

  const cancelarForm = () => {
    setFormAbierto(false);
    setRangoEditando(null);
  };

  const onSubmit = async (data: RangoExamenIdiomaFormInputs) => {
    const payload = rangoEditando ? data : { ...data, examen_idioma_id: examen.id_examen_idioma };

    try {
      await toast.promise(
        rangoEditando
          ? axiosInstance.put(`${ENDPOINT}/${rangoEditando.id_rango_examen_idioma}`, payload)
          : axiosInstance.post(ENDPOINT, payload),
        {
          pending: rangoEditando ? "Actualizando rango..." : "Creando rango...",
          success: rangoEditando ? "Rango actualizado." : "Rango creado.",
          error: {
            render({ data }) {
              return mensajeDeErrorApi(data, "No se pudo guardar el rango.");
            },
            autoClose: 5000,
          },
        }
      );

      cancelarForm();
      fetchRangos();
    } catch (error) {
      console.error("Error al guardar el rango:", error);
    }
  };

  const eliminarRango = async (id: number) => {
    try {
      await axiosInstance.delete(`${ENDPOINT}/${id}`);
      toast.success("Rango eliminado.");
      fetchRangos();
    } catch (error) {
      console.error("Error al eliminar el rango:", error);
      toast.error(mensajeDeErrorApi(error, "No se pudo eliminar el rango."));
    }
  };

  return (
    <div className="flex flex-col gap-4 p-1">
      <div>
        <p className="text-sm text-[#6b7a8d]">
          Examen: <span className="font-semibold text-[#1e3a5f]">{examen.nombre_examen}</span>
        </p>
        <p className="text-xs text-[#6b7a8d]">
          Tabla de equivalencia entre el puntaje del examen y el nivel MCER (A1–C2).
        </p>
      </div>

      {formAbierto ? (
        <form className="flex flex-col gap-4 rounded-lg bg-[rgba(30,58,95,0.04)] p-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <InputLabel htmlFor="puntaje_min" value="Puntaje mínimo *" />
              <TextInput id="puntaje_min" type="number" step="0.01" {...register("puntaje_min")} />
              <InputErrors errors={errors} name="puntaje_min" />
            </div>
            <div>
              <InputLabel htmlFor="puntaje_max" value="Puntaje máximo *" />
              <TextInput id="puntaje_max" type="number" step="0.01" {...register("puntaje_max")} />
              <InputErrors errors={errors} name="puntaje_max" />
            </div>
          </div>

          <div>
            <InputLabel htmlFor="nivel_mcer" value="Nivel MCER equivalente *" />
            <SelectForm
              id="nivel_mcer"
              register={register("nivel_mcer")}
              url="niveles-idioma"
              data_url="nivel_idioma"
            />
            <InputErrors errors={errors} name="nivel_mcer" />
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
            <button type="button" onClick={cancelarForm} disabled={isSubmitting}>
              <ButtonSecondary value="Cancelar" className="px-6 py-2.5" />
            </button>
            <ButtonPrimary
              value={rangoEditando ? "Guardar cambios" : "Agregar rango"}
              className="px-6"
              disabled={isSubmitting}
              loading={isSubmitting}
            />
          </div>
        </form>
      ) : (
        <button
          onClick={abrirNuevo}
          className="inline-flex w-fit items-center justify-center gap-2 bg-[#e8740e] hover:bg-[#c2600b] text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-md hover:shadow-lg transition-colors"
        >
          <PlusCircle className="h-4 w-4" />
          Agregar rango
        </button>
      )}

      <div className="overflow-x-auto rounded-lg border border-[rgba(30,58,95,0.09)]">
        <table className="w-full text-sm">
          <thead className="bg-[rgba(30,58,95,0.04)] text-xs uppercase tracking-wide text-[#6b7a8d]">
            <tr>
              <th className="px-4 py-2.5 text-left font-semibold">Puntaje mínimo</th>
              <th className="px-4 py-2.5 text-left font-semibold">Puntaje máximo</th>
              <th className="px-4 py-2.5 text-left font-semibold">Nivel MCER</th>
              <th className="px-4 py-2.5 text-left font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[rgba(30,58,95,0.06)]">
            {cargando && (
              <tr>
                <td colSpan={4} className="px-4 py-4 text-center text-[#6b7a8d]">
                  Cargando...
                </td>
              </tr>
            )}
            {!cargando && rangos.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-4 text-center text-[#6b7a8d]">
                  Este examen todavía no tiene rangos definidos.
                </td>
              </tr>
            )}
            {rangos.map((rango) => (
              <tr key={rango.id_rango_examen_idioma}>
                <td className="px-4 py-2.5 text-gray-900">{rango.puntaje_min}</td>
                <td className="px-4 py-2.5 text-gray-900">{rango.puntaje_max}</td>
                <td className="px-4 py-2.5">
                  <span className="inline-flex items-center justify-center min-w-[2.5rem] px-2.5 py-1 rounded-full text-xs font-bold bg-[#1e3a5f]/10 text-[#1e3a5f]">
                    {rango.nivel_mcer}
                  </span>
                </td>
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <BotonEditar onClick={() => abrirEditar(rango)} />
                    <EliminarBoton id={rango.id_rango_examen_idioma} onConfirmDelete={eliminarRango} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end pt-2 border-t border-[rgba(30,58,95,0.09)]">
        <button type="button" onClick={onClose}>
          <ButtonSecondary value="Cerrar" className="px-8 py-3" />
        </button>
      </div>
    </div>
  );
};

export default RangosExamenModal;
