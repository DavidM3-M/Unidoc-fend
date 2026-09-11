import type { EstudioRegistro } from "../../../types/trayectoria";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import axiosInstance from "../../../utils/axiosConfig";
import { InputLabel } from "../../../componentes/formularios/InputLabel";
import { SelectNivelFormacionAcademica } from "../../../componentes/formularios/SelectNivelFormacionAcademica";
import { SelectInstitucionSnies } from "../../../componentes/formularios/SelectInstitucionSnies";
import { SelectProgramaFormacion } from "../../../componentes/formularios/SelectProgramaFormacion";
import InputErrors from "../../../componentes/formularios/InputErrors";
import { LabelRadio } from "../../../componentes/formularios/LabelRadio";
import TextInput from "../../../componentes/formularios/TextInput";
import { SeccionFormulario } from "../../../componentes/formularios/SeccionFormulario";
import { PieFormulario } from "../../../componentes/formularios/PieFormulario";
import { studySchemaUpdate } from "../../../validaciones/studySchema";
import { AdjuntarArchivo } from "../../../componentes/formularios/AdjuntarArchivo";
import { useArchivoPreview } from "../../../hooks/ArchivoPreview";
import { MostrarArchivo } from "../../../componentes/formularios/MostrarArchivo";
import { RolesValidos } from "../../../types/roles";
import { jwtDecode } from "jwt-decode";
import DivForm from "../../../componentes/formularios/DivForm";
import { CalendarIcon, CheckCircle, GraduationCap, IdCard } from "lucide-react";
import { useLanguage } from "../../../context/useLanguage";

type Inputs = {
  tipo_estudio: string;
  nivel_formacion_academica_id?: string;
  graduado: "Si" | "No";
  institucion: string;
  titulo_estudio: string;
  programa_formacion_educativa_id?: string;
  titulo_convalidado: "Si" | "No";
  fecha_inicio: string;

  fecha_fin?: string;
  resolucion_convalidacion?: string;
  fecha_graduacion?: string;
  posible_fecha_graduacion?: string;
  fecha_convalidacion?: string;
  archivo?: FileList;
};

type Props = {
  estudio: EstudioRegistro | null;
  onSuccess: () => void;
  onCancelar?: () => void;
};

const EditarEstudio = ({ estudio, onSuccess, onCancelar }: Props) => {
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const token = Cookies.get("token");
  if (!token) throw new Error("No authentication token found");
  const decoded = jwtDecode<{ rol: RolesValidos }>(token);
  const rol = decoded.rol;

  // Misma cascada que AgregarEstudio: Nivel académico → Nivel de formación → Institución →
  // Programa, todo desde catálogos reales. Institución/Programa admiten texto libre si no
  // existen todavía en el catálogo.
  const [nivelAcademico, setNivelAcademico] = useState("");
  const [institucionSniesId, setInstitucionSniesId] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<Inputs>({
    resolver: zodResolver(studySchemaUpdate),
  });

  const archivoValue = watch("archivo");
  const { existingFile, setExistingFile } = useArchivoPreview(archivoValue);
  const nivelFormacionId = watch("nivel_formacion_academica_id") || "";

  // Efecto para limpiar los campos de fecha de graduación y posible fecha de convalidación si el graduado es "No"
  const graduado = watch("graduado");
  const convalido = watch("titulo_convalidado");

  useEffect(() => {
    if (convalido === "No") {
      setValue("fecha_convalidacion", "");
      setValue("resolucion_convalidacion", "");
    }
  }, [convalido, setValue]);

  // Efecto para limpiar los campos de fecha de graduación y posible fecha de convalidación si el graduado es "No"
  useEffect(() => {
    if (graduado === "Si") {
      setValue("posible_fecha_graduacion", "");
    } else if (graduado === "No") {
      setValue("fecha_graduacion", "");
    }
  }, [graduado, setValue]);

  useEffect(() => {
    if (estudio) {
      setValue("tipo_estudio", estudio.tipo_estudio || "");
      setValue("graduado", estudio.graduado === "Si" ? "Si" : "No");
      setValue("institucion", estudio.institucion || "");
      setValue("fecha_graduacion", estudio.fecha_graduacion || "");
      setValue("titulo_convalidado", estudio.titulo_convalidado === "Si" ? "Si" : "No");
      setValue("fecha_convalidacion", estudio.fecha_convalidacion || "");
      setValue(
        "resolucion_convalidacion",
        estudio.resolucion_convalidacion || ""
      );
      setValue(
        "posible_fecha_graduacion",
        estudio.posible_fecha_graduacion || ""
      );
      setValue("titulo_estudio", estudio.titulo_estudio || "");
      setValue("fecha_inicio", estudio.fecha_inicio || "");
      setValue("fecha_fin", estudio.fecha_fin || "");

      if (estudio.programa_formacion_educativa_id) {
        setValue("programa_formacion_educativa_id", String(estudio.programa_formacion_educativa_id));
      }
      if (estudio.nivel_formacion_academica_id) {
        setValue("nivel_formacion_academica_id", String(estudio.nivel_formacion_academica_id));
      }

      if (estudio.documentos_estudio && estudio.documentos_estudio.length > 0) {
        const archivo = estudio.documentos_estudio[0];
        setExistingFile({
          url: archivo.archivo_url ?? "",
          name: archivo.archivo.split("/").pop() || "Archivo existente",
        });
      }
    }
  }, [estudio, setValue, setExistingFile]);

  // Función para manejar el envío del formulario
  const onSubmit: SubmitHandler<Inputs> = async (data: Inputs) => {
    if (!estudio) return;
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("_method", "PUT");
      formData.append("tipo_estudio", data.tipo_estudio);
      formData.append("nivel_formacion_academica_id", data.nivel_formacion_academica_id || "");
      formData.append("programa_formacion_educativa_id", data.programa_formacion_educativa_id || "");
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

      if (data.archivo && data.archivo.length > 0) {
        formData.append("archivo", data.archivo[0]);
      }

      const ENDPOINTS = {
        Aspirante: import.meta.env.VITE_ENDPOINT_ACTUALIZAR_ESTUDIOS_ASPIRANTE,
        Docente: import.meta.env.VITE_ENDPOINT_ACTUALIZAR_ESTUDIOS_DOCENTE,
        Administrativo: import.meta.env.VITE_ENDPOINT_ACTUALIZAR_ESTUDIOS_DOCENTE,
      };
      const endpoint = ENDPOINTS[rol];
      const putPromise = axiosInstance.post(
        `${endpoint}/${estudio.id_estudio}`,
        formData
      );

      await toast.promise(putPromise, {
        pending: t("messages.study.updating"),
        success: t("messages.study.updated"),
        error: t("messages.study.updateError"),
      });

      onSuccess();
    } catch (error) {
      console.error("Error en la actualización:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DivForm>
      <form
        className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-white"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        <div className="col-span-full">
          {/* Encabezado: Información del estudio */}
          <SeccionFormulario
            icono={<IdCard size={24} />}
            titulo="Información del estudio"
            descripcion="Datos generales de tu formación académica"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-5">
            {/* Renderiza sus propias dos celdas del grid, cada una con su etiqueta. */}
            <Controller
              name="nivel_formacion_academica_id"
              control={control}
              render={({ field }) => (
                <SelectNivelFormacionAcademica
                  nivelAcademico={nivelAcademico}
                  onChangeNivelAcademico={setNivelAcademico}
                  nivelFormacionId={field.value ?? ""}
                  onChangeNivelFormacion={(id, opcion) => {
                    field.onChange(id);
                    setValue("tipo_estudio", opcion?.nombre || "");
                    setValue("titulo_estudio", "");
                    setValue("programa_formacion_educativa_id", "");
                  }}
                  error={<InputErrors errors={errors} name="tipo_estudio" />}
                />
              )}
            />

            <div>
              <InputLabel htmlFor="institucion" value="Institución *" />
              <Controller
                name="institucion"
                control={control}
                render={({ field }) => (
                  <SelectInstitucionSnies
                    id="institucion"
                    value={field.value}
                    isDisabled={!nivelFormacionId}
                    placeholder={
                      nivelFormacionId ? "Busca la institución…" : "Primero elige el nivel de estudio"
                    }
                    onChange={(value, idInstitucion) => {
                      field.onChange(value);
                      setInstitucionSniesId(idInstitucion);
                      setValue("titulo_estudio", "");
                      setValue("programa_formacion_educativa_id", "");
                    }}
                    onBlur={field.onBlur}
                  />
                )}
              />
              <InputErrors errors={errors} name="institucion" />
              {!institucionSniesId && watch("institucion") && (
                <p className="mt-1.5 text-xs text-[#e8740e]">
                  Confirma de nuevo la institución para poder buscar/cambiar el programa.
                </p>
              )}
            </div>

            <div className="col-span-full">
              <InputLabel htmlFor="programa" value="Programa / Título *" />
              <Controller
                name="titulo_estudio"
                control={control}
                render={({ field }) => (
                  <SelectProgramaFormacion
                    id="programa"
                    institucionId={institucionSniesId}
                    nivelFormacionAcademicaId={nivelFormacionId}
                    value={field.value}
                    onChange={(value, programa) => {
                      field.onChange(value);
                      setValue("titulo_estudio", programa?.titulo_otorgado || value);
                      setValue(
                        "programa_formacion_educativa_id",
                        programa ? String(programa.id_programa) : ""
                      );
                    }}
                    onBlur={field.onBlur}
                  />
                )}
              />
              <InputErrors errors={errors} name="titulo_estudio" />
              <p className="mt-1.5 text-xs text-[#6b7a8d]">
                Búscalo en el catálogo SNIES; si no aparece, escribe el nombre y quedará guardado igual.
              </p>
            </div>
          </div>
        </div>

        <div className="col-span-full mt-2">
          {/* Encabezado: Estado de graduación */}
          <SeccionFormulario
            icono={<GraduationCap size={24} />}
            titulo="Estado de graduación"
            descripcion="Información sobre tu grado académico"
          />

          {/* Campos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-5">
            {/* Graduado */}
            <div>
              <InputLabel htmlFor="graduado" value="Graduado *" />
              <div
                className="flex flex-wrap items-center gap-5 h-12 w-full rounded-xl border-2 border-[#1e3a5f]/20 shadow-md px-3 text-sm text-[#1e3a5f] bg-white"
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
                  // Tope en hoy: el calendario del navegador no deja ni escoger una fecha
                  // posterior. La validación del esquema sigue ahí —`max` solo limita el
                  // selector, no impide teclear— pero así el error deja de ser el primer aviso.
                  max={new Date().toISOString().slice(0, 10)}
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

        <div className="col-span-full mt-2">
          {/* Encabezado: Convalidación de título */}
          <SeccionFormulario
            icono={<CheckCircle size={24} />}
            titulo="Convalidación de título"
            descripcion="Información sobre si el título ha sido convalidado"
          />

          {/* Campos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-5">
            {/* Convalidado */}
            <div className="col-span-full">
              <InputLabel htmlFor="convalido" value="¿Título convalidado? *" />
              <div
                className="flex flex-wrap items-center gap-5 h-12 w-full rounded-xl border-2 border-[#1e3a5f]/20 shadow-md px-3 text-sm text-[#1e3a5f] bg-white"
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

        <div className="col-span-full mt-2">
          {/* Encabezado: Periodo de estudio */}
          <SeccionFormulario
            icono={<CalendarIcon size={24} />}
            titulo="Periodo de estudio / actividad"
            descripcion="Selecciona las fechas de inicio y fin"
          />

          {/* Campos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-5">
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

        {/* Archivo */}
        <div className="col-span-full border-t border-gray-100 pt-6">
          <AdjuntarArchivo id="archivo" register={register("archivo")} />
          <InputErrors errors={errors} name="archivo" />
          <MostrarArchivo file={existingFile} />
        </div>

        {/* Botón para editar estudio */}
        <PieFormulario
          onCancelar={onCancelar}
          textoGuardar="Guardar cambios"
          enviando={isSubmitting}
        />
      </form>
    </DivForm>
  );
};

export default EditarEstudio;