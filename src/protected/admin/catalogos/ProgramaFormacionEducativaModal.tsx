import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import axiosInstance from "../../../utils/axiosConfig";
import { mensajeDeErrorApi } from "../../../utils/erroresApi";
import { InputLabel } from "../../../componentes/formularios/InputLabel";
import TextInput from "../../../componentes/formularios/TextInput";
import InputErrors from "../../../componentes/formularios/InputErrors";
import Select from "../../../componentes/formularios/Select";
import { ButtonPrimary } from "../../../componentes/formularios/ButtonPrimary";
import { ButtonSecondary } from "../../../componentes/formularios/ButtonSecondary";
import { CheckboxActivo } from "./ControlesCatalogo";
import {
  programaFormacionEducativaSchema,
  type ProgramaFormacionEducativaFormInputs,
} from "../../../validaciones/admin/catalogosSchema";
import type { NivelFormacionAcademica, ProgramaFormacionEducativa } from "../../../types/catalogos";

type Props = {
  /** Registro a editar; ausente o null cuando se está creando. */
  programa?: ProgramaFormacionEducativa | null;
  onSuccess: () => void;
  onCancel: () => void;
};

const ENDPOINT = import.meta.env.VITE_ENDPOINT_ADMIN_FORMACION_EDUCATIVA;
const ENDPOINT_NIVELES = import.meta.env.VITE_ENDPOINT_ADMIN_NIVELES_FORMACION_ACADEMICA;

const ProgramaFormacionEducativaModal = ({ programa, onSuccess, onCancel }: Props) => {
  const editando = Boolean(programa);
  const [niveles, setNiveles] = useState<NivelFormacionAcademica[]>([]);
  const [cargandoNiveles, setCargandoNiveles] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProgramaFormacionEducativaFormInputs>({
    resolver: zodResolver(programaFormacionEducativaSchema),
    defaultValues: {
      nombre_programa: programa?.nombre_programa ?? "",
      titulo_otorgado: programa?.titulo_otorgado ?? "",
      institucion_nombre: programa?.institucion?.nombre_institucion ?? "",
      nivel_formacion_academica_id: programa?.nivel_formacion_academica?.id_nivel_formacion_academica,
      activo: programa ? programa.estado_programa === "Activo" : true,
    },
  });

  useEffect(() => {
    const fetchNiveles = async () => {
      try {
        setCargandoNiveles(true);
        const respuesta = await axiosInstance.get(ENDPOINT_NIVELES);
        setNiveles(respuesta.data?.data ?? []);
      } catch (error) {
        console.error("Error al obtener los niveles de formación académica:", error);
        toast.error("No se pudieron cargar los niveles de formación");
      } finally {
        setCargandoNiveles(false);
      }
    };
    fetchNiveles();
  }, []);

  const onSubmit = async (data: ProgramaFormacionEducativaFormInputs) => {
    try {
      await toast.promise(
        editando
          ? axiosInstance.put(`${ENDPOINT}/${programa!.id_programa}`, data)
          : axiosInstance.post(ENDPOINT, data),
        {
          pending: editando ? "Actualizando programa..." : "Creando programa...",
          success: editando ? "Programa actualizado." : "Programa creado.",
          error: {
            render({ data }) {
              return mensajeDeErrorApi(data, "No se pudo guardar el programa.");
            },
            autoClose: 5000,
          },
        }
      );

      onSuccess();
    } catch (error) {
      console.error("Error al guardar el programa de formación educativa:", error);
    }
  };

  return (
    <form className="flex flex-col gap-5 p-1" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div>
        <InputLabel htmlFor="nombre_programa" value="Nombre del programa *" />
        <TextInput
          id="nombre_programa"
          placeholder="Ej: Especialización en Sistemas Bancarios"
          maxLength={255}
          {...register("nombre_programa")}
        />
        <InputErrors errors={errors} name="nombre_programa" />
      </div>

      <div>
        <InputLabel htmlFor="titulo_otorgado" value="Título otorgado" />
        <TextInput
          id="titulo_otorgado"
          placeholder="Ej: Especialista en Sistemas Bancarios"
          maxLength={255}
          {...register("titulo_otorgado")}
        />
        <InputErrors errors={errors} name="titulo_otorgado" />
      </div>

      <div>
        <InputLabel htmlFor="institucion_nombre" value="Institución *" />
        <TextInput
          id="institucion_nombre"
          placeholder="Ej: Universidad Nacional de Colombia"
          maxLength={255}
          {...register("institucion_nombre")}
        />
        <InputErrors errors={errors} name="institucion_nombre" />
      </div>

      <div>
        <InputLabel htmlFor="nivel_formacion_academica_id" value="Nivel de formación *" />
        <Select
          id="nivel_formacion_academica_id"
          disabled={cargandoNiveles}
          {...register("nivel_formacion_academica_id")}
        >
          <option value="">{cargandoNiveles ? "Cargando..." : "Selecciona un nivel"}</option>
          {niveles.map((nivel) => (
            <option key={nivel.id_nivel_formacion_academica} value={nivel.id_nivel_formacion_academica}>
              {nivel.nivel_academico} — {nivel.nivel_formacion}
            </option>
          ))}
        </Select>
        <InputErrors errors={errors} name="nivel_formacion_academica_id" />
      </div>

      <CheckboxActivo
        id="activo_programa_formacion_educativa"
        registro={register("activo")}
        ayuda="Si lo desmarcas, deja de ofrecerse en los formularios, pero lo ya registrado lo conserva."
      />

      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} disabled={isSubmitting}>
          <ButtonSecondary value="Cancelar" className="px-8 py-3" />
        </button>
        <ButtonPrimary
          value={editando ? "Guardar cambios" : "Crear programa"}
          className="px-8"
          disabled={isSubmitting}
          loading={isSubmitting}
        />
      </div>
    </form>
  );
};

export default ProgramaFormacionEducativaModal;
