import { zodResolver } from "@hookform/resolvers/zod";
import { studySchema } from "../../validaciones/studySchema";
import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { InputLabel } from "../../componentes/formularios/InputLabel";
import { SelectForm } from "../../componentes/formularios/SelectForm";
import InputErrors from "../../componentes/formularios/InputErrors";
import { LabelRadio } from "../../componentes/formularios/LabelRadio";
import TextInput from "../../componentes/formularios/TextInput";
import { ButtonPrimary } from "../../componentes/formularios/ButtonPrimary";
import Cookies from "js-cookie";
import axiosInstance from "../../utils/axiosConfig";
import { AdjuntarArchivo } from "../../componentes/formularios/AdjuntarArchivo";
import { MostrarArchivo } from "../../componentes/formularios/MostrarArchivo";
import { useArchivoPreview } from "../../hooks/ArchivoPreview";
import { RolesValidos } from "../../types/roles";
import { jwtDecode } from "jwt-decode";
import DivForm from "../../componentes/formularios/DivForm";
import { CalendarIcon, CheckCircle, GraduationCap, IdCard } from "lucide-react";

type Inputs = {
  tipo_estudio: string;
  graduado: "Si" | "No";
  institucion: string;
  titulo_estudio: string;
  titulo_convalidado: "Si" | "No";
  fecha_inicio: string;
  archivo: FileList;

  fecha_fin?: string;
  resolucion_convalidacion?: string;
  fecha_graduacion?: string;
  posible_fecha_graduacion?: string;
  fecha_convalidacion?: string;
};

type Props = {
  onSuccess: (data: Inputs) => void;
};

const AgregarEstudio = ({ onSuccess }: Props) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<Inputs>({
    resolver: zodResolver(studySchema),
  });

  const archivoValue = watch("archivo");
  const { existingFile } = useArchivoPreview(archivoValue);

  // Efecto para limpiar los campos de fecha de graduación y posible fecha de convalidación si el graduado es "No"
  const convalido = watch("titulo_convalidado");
  useEffect(() => {
    if (convalido === "No") {
      setValue("fecha_convalidacion", "");
      setValue("resolucion_convalidacion", "");
    } else if (convalido === "Si") {
      setValue("resolucion_convalidacion", "");
    }
  }, [convalido, setValue]);
  // Efecto para limpiar los campos de fecha de graduación y posible fecha de convalidación si el graduado es "No"
  useEffect(() => {
    if (watch("graduado") === "Si") {
      setValue("posible_fecha_graduacion", "");
    } else if (watch("graduado") === "No") {
      setValue("fecha_graduacion", "");
    }
  }, [watch("graduado"), setValue]);

  // Función para manejar el envío del formulario
  const onSubmit: SubmitHandler<Inputs> = async (data: Inputs) => {
    setIsSubmitting(true); // 1. Desactivar el botón al iniciar el envío
    try {
      const formData = new FormData();
      formData.append("tipo_estudio", data.tipo_estudio);
      formData.append("graduado", data.graduado);
      formData.append("institucion", data.institucion);
      formData.append("fecha_graduacion", data.fecha_graduacion || "");
      formData.append("titulo_convalidado", data.titulo_convalidado);
      formData.append("fecha_convalidacion", data.fecha_convalidacion || "");
      formData.append(
        "resolucion_convalidacion",
        data.resolucion_convalidacion || ""
      );
      formData.append(
        "posible_fecha_graduacion",
        data.posible_fecha_graduacion || ""
      );
      formData.append("titulo_estudio", data.titulo_estudio);
      formData.append("fecha_inicio", data.fecha_inicio);
      formData.append("fecha_fin", data.fecha_fin || "");
      formData.append("archivo", data.archivo[0] || "");

      const token = Cookies.get("token");
      if (!token) throw new Error("No authentication token found");
      const decoded = jwtDecode<{ rol: RolesValidos }>(token);
      const rol = decoded.rol;
      const ENDPOINTS = {
        Aspirante: `${import.meta.env.VITE_API_URL}${
          import.meta.env.VITE_ENDPOINT_CREAR_ESTUDIOS_ASPIRANTE
        }`,
        Docente: `${import.meta.env.VITE_API_URL}${
          import.meta.env.VITE_ENDPOINT_CREAR_ESTUDIOS_DOCENTE
        }`,
      };
      const endpoint = ENDPOINTS[rol];

      await toast.promise(axiosInstance.post(endpoint, formData), {
        pending: "Enviando datos...",
        success: "Datos guardados correctamente",
        error: "Error al guardar los datos.",
      });

      onSuccess(data);
    } catch (error) {
      console.error("Error en el envío:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DivForm>
      <form
        className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 bg-white"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="col-span-full ">
          {/* Encabezado */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 w-full">
            <IdCard className="icono bg-gradient-to-br from-blue-400 to-blue-500" />

            <div className="flex flex-col items-start w-full">
              <h4>Información del estudio</h4>
              <span className="description-text">
                Datos generales de tu formación académica
              </span>
            </div>
          </div>

          {/* Campos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
            {/* Tipo de estudio */}
            <div>
              <InputLabel htmlFor="tipo_estudio" value="Tipo de estudio *" />
              <SelectForm
                id="tipo_estudio"
                register={register("tipo_estudio")}
                url="tipos-estudio"
                data_url="tipo_estudio"
              />
              <InputErrors errors={errors} name="tipo_estudio" />
            </div>

            {/* Institución */}
            <div className="">
              <InputLabel htmlFor="institucion" value="Institución *" />
              <TextInput
                id="institucion"
                placeholder="Institución"
                {...register("institucion")}
              />
              <InputErrors errors={errors} name="institucion" />
            </div>

            {/* Título */}
            <div className="col-span-full">
              <InputLabel htmlFor="titulo" value="Título *" />
              <TextInput
                id="titulo"
                placeholder="Título"
                {...register("titulo_estudio")}
              />
              <InputErrors errors={errors} name="titulo_estudio" />
            </div>
          </div>
        </div>
        <hr className="col-span-full border-gray-300" />
        <div className="col-span-full">
          {/* Encabezado */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 w-full">
            <GraduationCap className="icono bg-gradient-to-br from-green-400 to-green-500" />

            <div className="flex flex-col items-start w-full">
              <h4>Estado de graduación</h4>
              <span className="description-text">
                Información sobre tu grado académico
              </span>
            </div>
          </div>

          {/* Campos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
            {/* Graduado */}
            <div className="">
              <InputLabel htmlFor="graduado" value="Graduado *" />
              <div
                className="flex flex-wrap gap-4 sm:h-10 w-full rounded-lg border-[1.8px] 
            border-gray-200 shadow-sm p-2 text-sm text-slate-900"
              >
                <LabelRadio
                  htmlFor="graduado-si"
                  value="Si"
                  inputProps={register("graduado")}
                  label="Si"
                />
                <LabelRadio
                  htmlFor="graduado-no"
                  value="No"
                  inputProps={register("graduado")}
                  label="No"
                />
              </div>
              <InputErrors errors={errors} name="graduado" />
            </div>

            {/* Fecha de graduación */}
            {watch("graduado") === "Si" && (
              <div className="col-span-full sm:col-span-1">
                <InputLabel htmlFor="fecha_grado" value="Fecha de grado" />
                <TextInput
                  id="fecha_grado"
                  type="date"
                  {...register("fecha_graduacion")}
                />
                <InputErrors errors={errors} name="fecha_grado" />
              </div>
            )}

            {/* Posible fecha de graduación */}
            {watch("graduado") === "No" && (
              <div className="col-span-full sm:col-span-1">
                <InputLabel
                  htmlFor="posible_fecha_graduacion"
                  value="Posible fecha de graduación"
                />
                <TextInput
                  id="posible_fecha_graduacion"
                  type="date"
                  {...register("posible_fecha_graduacion")}
                />
                <InputErrors errors={errors} name="posible_fecha_graduacion" />
              </div>
            )}
          </div>
        </div>
        <hr className="col-span-full border-gray-300" />

        <div className="col-span-full ">
          {/* Encabezado */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 w-full">
            <CheckCircle className="icono bg-gradient-to-br from-purple-400 to-purple-500" />

            <div className="flex flex-col items-start w-full">
              <h4>Convalidación de título</h4>
              <span className="description-text">
                Información sobre si el título ha sido convalidado
              </span>
            </div>
          </div>

          {/* Campos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
            {/* Convalidado */}
            <div className="col-span-full">
              <InputLabel htmlFor="convalido" value="¿Título convalidado? *" />
              <div
                className="flex flex-wrap gap-4 sm:h-10 w-full rounded-lg border-[1.8px] 
            border-gray-200 shadow-sm p-2 text-sm text-slate-900"
              >
                <LabelRadio
                  htmlFor="convalido-si"
                  value="Si"
                  inputProps={register("titulo_convalidado")}
                  label="Si"
                />
                <LabelRadio
                  htmlFor="convalido-no"
                  value="No"
                  inputProps={register("titulo_convalidado")}
                  label="No"
                />
              </div>
              <InputErrors errors={errors} name="titulo_convalidado" />
            </div>

            {/* Fecha de convalidación */}
            {watch("titulo_convalidado") === "Si" && (
              <>
                <div className="col-span-full sm:col-span-1">
                  <InputLabel
                    htmlFor="fecha_convalidacion"
                    value="Fecha de convalidación"
                  />
                  <TextInput
                    id="fecha_convalidacion"
                    type="date"
                    {...register("fecha_convalidacion")}
                  />
                  <InputErrors errors={errors} name="fecha_convalidacion" />
                </div>

                <div className="col-span-full sm:col-span-1">
                  <InputLabel
                    htmlFor="resolucion_convalidacion"
                    value="Resolución de convalidación"
                  />
                  <TextInput
                    id="resolucion_convalidacion"
                    placeholder="Resolución de convalidación"
                    {...register("resolucion_convalidacion")}
                  />
                  <InputErrors
                    errors={errors}
                    name="resolucion_convalidacion"
                  />
                </div>
              </>
            )}
          </div>
        </div>
        <hr className="col-span-full border-gray-300" />

        <div className="col-span-full">
          {/* Encabezado */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 w-full">
            <CalendarIcon className="icono bg-gradient-to-br from-indigo-400 to-indigo-500" />

            <div className="flex flex-col items-start w-full">
              <h4>Periodo de estudio / actividad</h4>
              <span className="description-text">
                Selecciona las fechas de inicio y fin
              </span>
            </div>
          </div>

          {/* Campos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
            {/* Fecha de inicio */}
            <div>
              <InputLabel htmlFor="fecha_inicio" value="Fecha de inicio *" />
              <TextInput
                type="date"
                id="fecha_inicio"
                {...register("fecha_inicio")}
              />
              <InputErrors errors={errors} name="fecha_inicio" />
            </div>

            {/* Fecha de fin */}
            <div>
              <InputLabel htmlFor="fecha_fin" value="Fecha de fin" />
              <TextInput
                type="date"
                id="fecha_fin"
                {...register("fecha_fin")}
              />
              <InputErrors errors={errors} name="fecha_fin" />
            </div>
          </div>
        </div>
        <hr className="col-span-full border-gray-300" />

        {/* Archivo */}
        <div className="col-span-full">
          <AdjuntarArchivo id="archivo" register={register("archivo")} />
          <InputErrors errors={errors} name="archivo" />
          <MostrarArchivo file={existingFile} />
        </div>

        {/* Botón para agregar estudio */}
        <div className="flex justify-center col-span-full">
          <ButtonPrimary
            value={isSubmitting ? "Enviando..." : "Agregar estudio"}
            disabled={isSubmitting}
          />
        </div>
      </form>
    </DivForm>
  );
};
export default AgregarEstudio;
