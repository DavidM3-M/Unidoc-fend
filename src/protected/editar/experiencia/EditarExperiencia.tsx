import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import Cookies from "js-cookie";
import axiosInstance from "../../../utils/axiosConfig";
import { ButtonRegresar } from "../../../componentes/formularios/ButtonRegresar";
import { InputLabel } from "../../../componentes/formularios/InputLabel";
import { SelectForm } from "../../../componentes/formularios/SelectForm";
import InputErrors from "../../../componentes/formularios/InputErrors";
import TextInput from "../../../componentes/formularios/TextInput";
import { ButtonPrimary } from "../../../componentes/formularios/ButtonPrimary";
import { experienciaSchemaUpdate } from "../../../validaciones/experienceSchema";
import { AdjuntarArchivo } from "../../../componentes/formularios/AdjuntarArchivo";
import { LabelRadio } from "../../../componentes/formularios/LabelRadio";
import { useArchivoPreview } from "../../../hooks/ArchivoPreview";
import { MostrarArchivo } from "../../../componentes/formularios/MostrarArchivo";
import { RolesValidos } from "../../../types/roles";
import { jwtDecode } from "jwt-decode";
import DivForm from "../../../componentes/formularios/DivForm";

type Inputs = {
  tipo_experiencia: string;
  institucion_experiencia: string;
  cargo: string;
  fecha_inicio: string;
  intensidad_horaria: number;
  trabajo_actual: "Si" | "No";
  experiencia_universidad: "Si" | "No";
  fecha_finalizacion?: string;
  fecha_expedicion_certificado?: string;
  archivo?: FileList;
};
type Props = {
  experiencia: any;
  onSuccess: () => void;
};

const EditarExperiencia = ({ experiencia, onSuccess }: Props) => {
  const token = Cookies.get("token");
  if (!token) throw new Error("No authentication token found");
  const decoded = jwtDecode<{ rol: RolesValidos }>(token);
  const rol = decoded.rol;

  const [isSubmitting, setIsSubmitting] = useState(false);

  const { id } = useParams();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<Inputs>({
    resolver: zodResolver(experienciaSchemaUpdate),
    defaultValues: {
      experiencia_universidad: "No",
    },
  });

  const archivoValue = watch("archivo");
  const { existingFile, setExistingFile } = useArchivoPreview(archivoValue);
  const experiencia_universidad = watch("experiencia_universidad");

  useEffect(() => {
    if (experiencia_universidad === "Si") {
      setValue("institucion_experiencia", "Corporación Universidad del Cauca");
    } else {
      setValue("institucion_experiencia", "");
    }
  }, [experiencia_universidad, setValue]);

  useEffect(() => {
    if (experiencia) {
      const data = experiencia;
      setValue("tipo_experiencia", data.tipo_experiencia);
      setValue("institucion_experiencia", data.institucion_experiencia);
      setValue("trabajo_actual", data.trabajo_actual);
      setValue("cargo", data.cargo);
      setValue("intensidad_horaria", data.intensidad_horaria);
      setValue("fecha_inicio", data.fecha_inicio);
      setValue("fecha_finalizacion", data.fecha_finalizacion ?? "");
      setValue(
        "fecha_expedicion_certificado",
        data.fecha_expedicion_certificado
      );

      if (
        data.documentos_experiencia &&
        data.documentos_experiencia.length > 0
      ) {
        const archivo = data.documentos_experiencia[0];
        setExistingFile({
          url: archivo.archivo_url,
          name: archivo.archivo.split("/").pop() || "Archivo existente",
        });
      }
    }
  }, [experiencia, setValue, setExistingFile]);

  const onSubmit: SubmitHandler<Inputs> = async (data: Inputs) => {
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("_method", "PUT");

      // === Campos principales ===
      formData.append("tipo_experiencia", data.tipo_experiencia);
      formData.append("institucion_experiencia", data.institucion_experiencia);
      formData.append("trabajo_actual", data.trabajo_actual);
      formData.append("cargo", data.cargo);
      formData.append("intensidad_horaria", data.intensidad_horaria.toString());
      formData.append("fecha_inicio", data.fecha_inicio || "");
      formData.append("fecha_finalizacion", data.fecha_finalizacion || "");
      formData.append(
        "fecha_expedicion_certificado",
        data.fecha_expedicion_certificado || ""
      );

      // === Archivo (solo si el usuario carga uno nuevo) ===
      if (data.archivo && data.archivo.length > 0) {
        formData.append("archivo", data.archivo[0]);
      }

      // === Endpoints por rol ===
      const ENDPOINTS = {
        Aspirante: `${import.meta.env.VITE_API_URL}${
          import.meta.env.VITE_ENDPOINT_ACTUALIZAR_EXPERIENCIAS_ASPIRANTE
        }`,
        Docente: `${import.meta.env.VITE_API_URL}${
          import.meta.env.VITE_ENDPOINT_ACTUALIZAR_EXPERIENCIAS_DOCENTE
        }`,
      };

      const endpoint = ENDPOINTS[rol];

      // === Petición con toast.promise ===
      const putPromise = axiosInstance.post(`${endpoint}/${experiencia.id_experiencia}`, formData);

      await toast.promise(putPromise, {
        pending: "Actualizando datos...",
        success: "Datos actualizados correctamente",
        error: "Error al actualizar los datos",
      });

      // Callback de éxito si lo tienes
      onSuccess?.();
    } catch (error) {
      console.error("Error en la actualización:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const trabajo_actual = watch("trabajo_actual");
  useEffect(() => {
    if (trabajo_actual === "Si") {
      setValue("fecha_finalizacion", "");
    }
  }, [trabajo_actual, setValue]);
  return (
    <DivForm>
      <form
        className="grid grid-cols-1 sm:grid-cols-2 gap-6"
        onSubmit={handleSubmit(onSubmit)}
      >
        {/* Tipo de experiencia */}
        <div className="col-span-full">
          <InputLabel
            htmlFor="tipo_experiencia"
            value="Tipo de experiencia *"
          />
          <SelectForm
            id="tipo_experiencia"
            register={register("tipo_experiencia")}
            url="tipos-experiencia"
            data_url="tipo_experiencia"
          />
          <InputErrors errors={errors} name="tipo_experiencia" />
        </div>

        {/* Experiencia en universidad en universidad del cauca */}
        <div className="col-span-full">
          <InputLabel
            htmlFor="experiencia_universidad"
            value="Experiencia en universidad autónoma"
          />
          <div className="flex flex-row flex-wrap gap-4 rounded-lg border-[1.8px] border-blue-600 bg-slate-100/40 h-[44px] px-4">
            <LabelRadio
              htmlFor="experiencia-si"
              value="Si"
              inputProps={register("experiencia_universidad")}
              label="Sí"
            />
            <LabelRadio
              htmlFor="experiencia_universidad-no"
              value="No"
              inputProps={register("experiencia_universidad")}
              label="No"
            />
          </div>
          <InputErrors errors={errors} name="experiencia_universidad" />
        </div>

        {/* Institución */}
        <div className="">
          <InputLabel htmlFor="institucion_experiencia" value="Institución *" />
          <TextInput
            id="institucion_experiencia"
            placeholder="Institución"
            {...register("institucion_experiencia")}
          />
          <InputErrors errors={errors} name="institucion_experiencia" />
        </div>

        {/* Cargo */}
        <div className="">
          <InputLabel htmlFor="cargo" value="Cargo *" />
          <TextInput id="cargo" placeholder="Cargo" {...register("cargo")} />
          <InputErrors errors={errors} name="cargo" />
        </div>

        {/* Trabajo actual */}
        <div className="flex flex-col w-full">
          <InputLabel
            htmlFor="trabajo_actual"
            value="¿Es su trabajo actual? *"
          />
          <div className="flex flex-row flex-wrap gap-4 rounded-lg border-[1.8px] border-blue-600 bg-slate-100/40 h-[44px] px-4">
            <LabelRadio
              htmlFor="trabajo_actual-si"
              value="Si"
              inputProps={register("trabajo_actual")}
              label="Sí"
            />
            <LabelRadio
              htmlFor="trabajo_actual-no"
              value="No"
              inputProps={register("trabajo_actual")}
              label="No"
            />
          </div>
          <InputErrors errors={errors} name="trabajo_actual" />
        </div>

        {/* Intensidad horaria */}
        <div className="">
          <InputLabel
            htmlFor="intensidad_horaria"
            value="Intensidad horaria (Horas) *"
          />
          <TextInput
            type="number"
            id="intensidad_horaria"
            placeholder="Intensidad horaria"
            {...register("intensidad_horaria", { valueAsNumber: true })}
          />
          <InputErrors errors={errors} name="intensidad_horaria" />
        </div>

        {/* Fechas */}
        <div className="">
          <InputLabel htmlFor="fecha_inicio" value="Fecha de inicio *" />
          <TextInput
            type="date"
            id="fecha_inicio"
            {...register("fecha_inicio")}
          />
          <InputErrors errors={errors} name="fecha_inicio" />
        </div>
        {watch("trabajo_actual") === "No" && (
          <div className="">
            <InputLabel
              htmlFor="fecha_finalizacion"
              value="Fecha de finalización"
            />
            <TextInput
              type="date"
              id="fecha_finalizacion"
              {...register("fecha_finalizacion")}
            />
            <InputErrors errors={errors} name="fecha_finalizacion" />
          </div>
        )}
        <div>
          <InputLabel
            htmlFor="fecha_expedicion_certificado"
            value="Fecha de expedición del certificado *"
          />
          <TextInput
            type="date"
            id="fecha_expedicion_certificado"
            placeholder="Fecha expedicion de certificado"
            {...register("fecha_expedicion_certificado")}
          />
          <InputErrors errors={errors} name="fecha_expedicion_certificado" />
        </div>

        {/* Archivo */}
        <div className="col-span-full">
          <InputLabel htmlFor="archivo" value="Archivo" />
          <AdjuntarArchivo id="archivo" register={register("archivo")} />
          <InputErrors errors={errors} name="archivo" />
          <MostrarArchivo file={existingFile} />
        </div>

        {/* Botón */}
        <div className="flex justify-center col-span-full">
          <ButtonPrimary
            value={isSubmitting ? "Enviando..." : "Editar experiencia"}
            disabled={isSubmitting}
          />
        </div>
      </form>
    </DivForm>
  );
};

export default EditarExperiencia;
