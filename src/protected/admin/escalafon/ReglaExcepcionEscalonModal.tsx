import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import axiosInstance from "../../../utils/axiosConfig";
import { mensajeDeErrorApi } from "../../../utils/erroresApi";
import { InputLabel } from "../../../componentes/formularios/InputLabel";
import InputErrors from "../../../componentes/formularios/InputErrors";
import Select from "../../../componentes/formularios/Select";
import { ButtonPrimary } from "../../../componentes/formularios/ButtonPrimary";
import { ButtonSecondary } from "../../../componentes/formularios/ButtonSecondary";
import { CheckboxActivo } from "../catalogos/ControlesCatalogo";
import {
  reglaExcepcionEscalonSchema,
  type ReglaExcepcionEscalonFormInputs,
} from "../../../validaciones/admin/catalogosSchema";
import type { EscalonDocente, NivelFormacionAcademica, ReglaExcepcionEscalon } from "../../../types/catalogos";

type Props = {
  escalones: EscalonDocente[];
  regla?: ReglaExcepcionEscalon | null;
  onSuccess: () => void;
  onCancel: () => void;
};

const ENDPOINT = import.meta.env.VITE_ENDPOINT_ADMIN_REGLAS_EXCEPCION_ESCALON;
const ENDPOINT_NIVELES_FORMACION = import.meta.env.VITE_ENDPOINT_ADMIN_NIVELES_FORMACION_ACADEMICA;

const ReglaExcepcionEscalonModal = ({ escalones, regla, onSuccess, onCancel }: Props) => {
  const editando = Boolean(regla);

  // El único tipo de condición que el motor entiende hoy es "formación" — mismo catálogo que
  // usa el selector de Escalones, para no listar un nivel que no exista de verdad.
  const [nivelesFormacion, setNivelesFormacion] = useState<NivelFormacionAcademica[]>([]);

  useEffect(() => {
    axiosInstance
      .get(ENDPOINT_NIVELES_FORMACION)
      .then((respuesta) => setNivelesFormacion(respuesta.data?.data ?? []))
      .catch((error) => console.error("Error al obtener los niveles de formación:", error));
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ReglaExcepcionEscalonFormInputs>({
    resolver: zodResolver(reglaExcepcionEscalonSchema),
    defaultValues: {
      tipo_condicion: "formacion",
      valor_condicion: regla?.valor_condicion ?? "",
      escalon_otorgado_id: regla?.escalon_otorgado_id,
      activo: regla?.activo ?? true,
    },
  });

  const onSubmit = async (data: ReglaExcepcionEscalonFormInputs) => {
    try {
      await toast.promise(
        editando
          ? axiosInstance.put(`${ENDPOINT}/${regla!.id_regla_excepcion}`, data)
          : axiosInstance.post(ENDPOINT, data),
        {
          pending: editando ? "Actualizando excepción..." : "Creando excepción...",
          success: editando ? "Excepción actualizada." : "Excepción creada.",
          error: {
            render({ data }) {
              return mensajeDeErrorApi(data, "No se pudo guardar la excepción.");
            },
            autoClose: 5000,
          },
        }
      );

      onSuccess();
    } catch (error) {
      console.error("Error al guardar la excepción del escalafón:", error);
    }
  };

  return (
    <form className="flex flex-col gap-5 p-1" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div>
        <InputLabel htmlFor="valor_condicion" value="Condición: tiene un estudio aprobado de tipo... *" />
        <Select id="valor_condicion" {...register("valor_condicion")}>
          <option value="">Selecciona un nivel de formación</option>
          {nivelesFormacion
            .filter((nivel) => nivel.activo)
            .map((nivel) => (
              <option key={nivel.id_nivel_formacion_academica} value={nivel.nivel_formacion}>
                {nivel.nivel_academico} — {nivel.nivel_formacion}
              </option>
            ))}
        </Select>
        <InputErrors errors={errors} name="valor_condicion" />
        <p className="mt-2 text-xs text-[#6b7a8d]">
          Del catálogo Formación académica → Niveles de formación.
        </p>
        <input type="hidden" value="formacion" {...register("tipo_condicion")} />
      </div>

      <div>
        <InputLabel htmlFor="escalon_otorgado_id" value="Otorga como mínimo *" />
        <Select id="escalon_otorgado_id" {...register("escalon_otorgado_id")}>
          <option value="">Selecciona un escalón</option>
          {escalones.map((escalon) => (
            <option key={escalon.id_escalon} value={escalon.id_escalon}>
              {escalon.nombre}
            </option>
          ))}
        </Select>
        <InputErrors errors={errors} name="escalon_otorgado_id" />
        <p className="mt-2 text-xs text-[#6b7a8d]">
          Sin importar si cumple el resto de requisitos de ese escalón.
        </p>
      </div>

      <CheckboxActivo
        id="activo_regla_excepcion"
        registro={register("activo")}
        ayuda="Si la desmarcas, el motor de evaluación deja de aplicar esta excepción."
      />

      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} disabled={isSubmitting}>
          <ButtonSecondary value="Cancelar" className="px-8 py-3" />
        </button>
        <ButtonPrimary
          value={editando ? "Guardar cambios" : "Crear excepción"}
          className="px-8"
          disabled={isSubmitting}
          loading={isSubmitting}
        />
      </div>
    </form>
  );
};

export default ReglaExcepcionEscalonModal;
