import { useForm } from "react-hook-form";
import { AdjuntarArchivo } from "../../../componentes/formularios/AdjuntarArchivo";
import { ButtonPrimary } from "../../../componentes/formularios/ButtonPrimary";
import InputErrors from "../../../componentes/formularios/InputErrors";
import { InputLabel } from "../../../componentes/formularios/InputLabel";
import { MostrarArchivo } from "../../../componentes/formularios/MostrarArchivo";
import TextInput from "../../../componentes/formularios/TextInput";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  convocatoriaSchema,
  convocatoriaSchemaUpdate,
} from "../../../validaciones/talento-humano.ts/convocatoriaSchema";
import TextArea from "../../../componentes/formularios/TextArea";
import { useArchivoPreview } from "../../../hooks/ArchivoPreview";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ButtonRegresar } from "../../../componentes/formularios/ButtonRegresar";
import { SelectLocales } from "../../../componentes/formularios/SelectsLocales";
import { toast } from "react-toastify";
import axiosInstance from "../../../utils/axiosConfig";
import { useEffect, useState } from "react";

type Inputs = {
  // Campos originales
  nombre_convocatoria: string;
  tipo: string;
  fecha_publicacion: string;
  fecha_cierre: string;
  descripcion: string;
  estado_convocatoria: "Abierta" | "Cerrada" | "Finalizada";
  
  // Nuevos campos
  numero_convocatoria: string;
  periodo_academico: string;
  cargo_solicitado: string;
  facultad: string;
  cursos: string;
  tipo_vinculacion: string;
  personas_requeridas: number;
  fecha_inicio_contrato: string;
  perfil_profesional: string;
  experiencia_requerida: string;
  solicitante: string;
  aprobaciones: string;
  archivo?: FileList;
};

const Convocatoria = () => {
  const { id } = useParams();
  const [isConvocatoriaRegistered, setIsConvocatoriaRegistered] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const schema = isConvocatoriaRegistered
    ? convocatoriaSchemaUpdate
    : convocatoriaSchema;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<Inputs>({
    resolver: zodResolver(schema),
  });

  const archivoValue = watch("archivo");
  const { existingFile, setExistingFile } = useArchivoPreview(archivoValue);

  const fetchDatos = async () => {
    if (!id) return;
    const URL = `/talentoHumano/obtener-convocatoria/${id}`;
    try {
      const response = await axiosInstance.get(URL);
      const data = response.data.convocatoria;
      setIsConvocatoriaRegistered(true);
      
      // Campos originales
      setValue("nombre_convocatoria", data.nombre_convocatoria);
      setValue("tipo", data.tipo);
      setValue("fecha_publicacion", data.fecha_publicacion);
      setValue("fecha_cierre", data.fecha_cierre);
      setValue("descripcion", data.descripcion);
      setValue("estado_convocatoria", data.estado_convocatoria);
      
      // Nuevos campos
      setValue("numero_convocatoria", data.numero_convocatoria);
      setValue("periodo_academico", data.periodo_academico);
      setValue("cargo_solicitado", data.cargo_solicitado);
      setValue("facultad", data.facultad);
      setValue("cursos", data.cursos);
      setValue("tipo_vinculacion", data.tipo_vinculacion);
      setValue("personas_requeridas", data.personas_requeridas);
      setValue("fecha_inicio_contrato", data.fecha_inicio_contrato);
      setValue("perfil_profesional", data.perfil_profesional);
      setValue("experiencia_requerida", data.experiencia_requerida);
      setValue("solicitante", data.solicitante);
      setValue("aprobaciones", data.aprobaciones);

      // Cargar archivo existente si hay
      if (data.documentos_convocatoria && data.documentos_convocatoria.length > 0) {
        const archivo = data.documentos_convocatoria[0];
        setExistingFile({
          url: archivo.archivo_url,
          name: archivo.archivo.split("/").pop() || "Archivo existente",
        });
      }
    } catch (error) {
      console.error("Error al obtener convocatoria:", error);
      toast.error("Error al cargar los datos de la convocatoria");
    }
  };

  useEffect(() => {
    fetchDatos();
  }, []);

  const onSubmit = async (data: Inputs) => {
    setIsSubmitting(true);

    const formData = new FormData();
    console.log(" Datos del formulario antes de enviar:", data);
    
    // Campos originales
    formData.append("nombre_convocatoria", data.nombre_convocatoria);
    formData.append("tipo", data.tipo);
    formData.append("fecha_publicacion", data.fecha_publicacion);
    formData.append("fecha_cierre", data.fecha_cierre);
    formData.append("descripcion", data.descripcion);
    formData.append("estado_convocatoria", data.estado_convocatoria);
    
    // Nuevos campos
    formData.append("numero_convocatoria", data.numero_convocatoria);
    formData.append("periodo_academico", data.periodo_academico);
    formData.append("cargo_solicitado", data.cargo_solicitado);
    formData.append("facultad", data.facultad);
    formData.append("cursos", data.cursos);
    formData.append("tipo_vinculacion", data.tipo_vinculacion);
    formData.append("personas_requeridas", data.personas_requeridas.toString());
    formData.append("fecha_inicio_contrato", data.fecha_inicio_contrato);
    formData.append("perfil_profesional", data.perfil_profesional);
    formData.append("experiencia_requerida", data.experiencia_requerida);
    formData.append("solicitante", data.solicitante);
    formData.append("aprobaciones", data.aprobaciones);

    // Agregar archivo si existe
    if (data.archivo && data.archivo.length > 0) {
      formData.append("archivo", data.archivo[0]);
    }

    if (isConvocatoriaRegistered) {
      formData.append("_method", "PUT");
    }

    const url = isConvocatoriaRegistered
      ? `/talentoHumano/actualizar-convocatoria/${id}`
      : "/talentoHumano/crear-convocatoria";

    try {
      await toast.promise(
        axiosInstance.post(url, formData, {
          timeout: 10000,
        }),
        {
          pending: isConvocatoriaRegistered ? "Actualizando convocatoria..." : "Creando convocatoria...",
          success: {
            render() {
              setTimeout(() => {
                navigate("/talento-humano/convocatorias");
              }, 1500);
              return isConvocatoriaRegistered 
                ? "Convocatoria actualizada con éxito" 
                : "Convocatoria creada con éxito";
            },
            autoClose: 1500,
          },
          error: "Error al procesar la convocatoria",
        }
      );
    } catch (error: any) {
      console.error("Error al procesar la convocatoria:", error);
      console.log("ERRORES:", error?.response?.data);
// Mostrar errores específicos de validación
      if (error?.response?.data?.errors) {
    const errores = error.response.data.errors;
    Object.keys(errores).forEach((campo) => {
      toast.error(`${campo}: ${errores[campo][0]}`);
    });
  } else if (error?.response?.data?.message) {
    toast.error(error.response.data.message);
  } else {
    toast.error("Error al procesar la convocatoria");
  }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col bg-white p-8 rounded-xl shadow-md w-full max-w-6xl gap-y-4">
      <div className="flex gap-x-4 col-span-full items-center">
        <Link to={"/talento-humano/convocatorias"}>
          <ButtonRegresar />
        </Link>
        <h3 className="font-bold text-3xl col-span-full">
          {isConvocatoriaRegistered
            ? "Editar convocatoria"
            : "Agregar convocatoria"}
        </h3>
      </div>

      <form
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        onSubmit={handleSubmit(onSubmit)}
      >
        {/* SECCIÓN: INFORMACIÓN BÁSICA */}
        <div className="col-span-full">
          <h4 className="text-xl font-bold text-blue-700 border-b-2 border-blue-200 pb-2 mb-4">
            Información Básica
          </h4>
        </div>

        {/* Estado de convocatoria */}
        <div>
          <InputLabel htmlFor="estado_convocatoria" value="Estado de convocatoria" />
          <SelectLocales
            id="estado_convocatoria"
            register={register("estado_convocatoria")}
          />
          <InputErrors errors={errors} name="estado_convocatoria" />
        </div>

        {/* Número de convocatoria */}
        <div>
          <InputLabel htmlFor="numero_convocatoria" value="Número de convocatoria" />
          <TextInput
            id="numero_convocatoria"
            placeholder="Ej: CONV-2024-001"
            {...register("numero_convocatoria")}
          />
          <InputErrors errors={errors} name="numero_convocatoria" />
        </div>

        {/* Nombre de convocatoria */}
        <div>
          <InputLabel htmlFor="nombre_convocatoria" value="Nombre de convocatoria" />
          <TextInput
            id="nombre_convocatoria"
            placeholder="Nombre de convocatoria"
            {...register("nombre_convocatoria")}
          />
          <InputErrors errors={errors} name="nombre_convocatoria" />
        </div>

        {/* Tipo */}
        <div>
          <InputLabel htmlFor="tipo" value="Tipo" />
          <TextInput 
            id="tipo" 
            placeholder="Ej: Docencia, Administrativo" 
            {...register("tipo")} 
          />
          <InputErrors errors={errors} name="tipo" />
        </div>

        {/* Período académico */}
        <div>
          <InputLabel htmlFor="periodo_academico" value="Período académico" />
          <TextInput
            id="periodo_academico"
            placeholder="Ej: 2024-1"
            {...register("periodo_academico")}
          />
          <InputErrors errors={errors} name="periodo_academico" />
        </div>

        {/* SECCIÓN: CARGO Y FACULTAD */}
        <div className="col-span-full">
          <h4 className="text-xl font-bold text-blue-700 border-b-2 border-blue-200 pb-2 mb-4 mt-4">
            Cargo y Ubicación
          </h4>
        </div>

        {/* Cargo solicitado */}
        <div>
          <InputLabel htmlFor="cargo_solicitado" value="Cargo solicitado" />
          <TextInput
            id="cargo_solicitado"
            placeholder="Ej: Docente de Cátedra"
            {...register("cargo_solicitado")}
          />
          <InputErrors errors={errors} name="cargo_solicitado" />
        </div>

        {/* Facultad */}
        <div>
          <InputLabel htmlFor="facultad" value="Facultad" />
          <TextInput
            id="facultad"
            placeholder="Ej: Ingeniería"
            {...register("facultad")}
          />
          <InputErrors errors={errors} name="facultad" />
        </div>

        {/* Cursos */}
        <div>
          <InputLabel htmlFor="cursos" value="Cursos" />
          <TextInput
            id="cursos"
            placeholder="Ej: Programación I, Bases de Datos"
            {...register("cursos")}
          />
          <InputErrors errors={errors} name="cursos" />
        </div>

        {/* SECCIÓN: VINCULACIÓN */}
        <div className="col-span-full">
          <h4 className="text-xl font-bold text-blue-700 border-b-2 border-blue-200 pb-2 mb-4 mt-4">
            Detalles de Vinculación
          </h4>
        </div>

        {/* Tipo de vinculación */}
        <div>
          <InputLabel htmlFor="tipo_vinculacion" value="Tipo de vinculación" />
          <TextInput
            id="tipo_vinculacion"
            placeholder="Ej: Cátedra, Tiempo completo"
            {...register("tipo_vinculacion")}
          />
          <InputErrors errors={errors} name="tipo_vinculacion" />
        </div>

        {/* Personas requeridas */}
        <div>
          <InputLabel htmlFor="personas_requeridas" value="Personas requeridas" />
          <TextInput
            type="number"
            id="personas_requeridas"
            placeholder="Número de personas"
            min="1"
            {...register("personas_requeridas", { valueAsNumber: true })}
          />
          <InputErrors errors={errors} name="personas_requeridas" />
        </div>

        {/* Fecha de publicación */}
        <div>
          <InputLabel htmlFor="fecha_publicacion" value="Fecha de publicación" />
          <TextInput
            type="date"
            id="fecha_publicacion"
            {...register("fecha_publicacion")}
          />
          <InputErrors errors={errors} name="fecha_publicacion" />
        </div>

        {/* Fecha de cierre */}
        <div>
          <InputLabel htmlFor="fecha_cierre" value="Fecha de cierre" />
          <TextInput
            type="date"
            id="fecha_cierre"
            {...register("fecha_cierre")}
          />
          <InputErrors errors={errors} name="fecha_cierre" />
        </div>

        {/* Fecha inicio de contrato */}
        <div>
          <InputLabel htmlFor="fecha_inicio_contrato" value="Fecha inicio de contrato" />
          <TextInput
            type="date"
            id="fecha_inicio_contrato"
            {...register("fecha_inicio_contrato")}
          />
          <InputErrors errors={errors} name="fecha_inicio_contrato" />
        </div>

        {/* SECCIÓN: REQUISITOS */}
        <div className="col-span-full">
          <h4 className="text-xl font-bold text-blue-700 border-b-2 border-blue-200 pb-2 mb-4 mt-4">
            Requisitos y Perfil
          </h4>
        </div>

        {/* Perfil profesional */}
        <div className="col-span-full">
          <InputLabel htmlFor="perfil_profesional" value="Perfil profesional" />
          <TextArea
            id="perfil_profesional"
            placeholder="Describe el perfil profesional requerido..."
            {...register("perfil_profesional")}
          />
          <InputErrors errors={errors} name="perfil_profesional" />
        </div>

        {/* Experiencia requerida */}
        <div className="col-span-full">
          <InputLabel htmlFor="experiencia_requerida" value="Experiencia requerida" />
          <TextArea
            id="experiencia_requerida"
            placeholder="Describe la experiencia requerida..."
            {...register("experiencia_requerida")}
          />
          <InputErrors errors={errors} name="experiencia_requerida" />
        </div>

        {/* Descripción */}
        <div className="col-span-full">
          <InputLabel htmlFor="descripcion" value="Descripción general" />
          <TextArea
            id="descripcion"
            placeholder="Descripción general de la convocatoria..."
            {...register("descripcion")}
          />
          <InputErrors errors={errors} name="descripcion" />
        </div>

        {/* SECCIÓN: ADMINISTRATIVA */}
        <div className="col-span-full">
          <h4 className="text-xl font-bold text-blue-700 border-b-2 border-blue-200 pb-2 mb-4 mt-4">
            Información Administrativa
          </h4>
        </div>

        {/* Solicitante */}
        <div className="sm:col-span-2">
          <InputLabel htmlFor="solicitante" value="Solicitante" />
          <TextInput
            id="solicitante"
            placeholder="Nombre del solicitante"
            {...register("solicitante")}
          />
          <InputErrors errors={errors} name="solicitante" />
        </div>

        {/* Aprobaciones */}
        <div className="col-span-full">
          <InputLabel htmlFor="aprobaciones" value="Aprobaciones" />
          <TextArea
            id="aprobaciones"
            placeholder="Describa las aprobaciones necesarias..."
            {...register("aprobaciones")}
          />
          <InputErrors errors={errors} name="aprobaciones" />
        </div>

        {/* Archivo */}
        <div className="col-span-full">
          <h4 className="text-xl font-bold text-blue-700 border-b-2 border-blue-200 pb-2 mb-4 mt-4">
            Documentos Adjuntos
          </h4>
          <AdjuntarArchivo id="archivo" register={register("archivo")} />
          <InputErrors errors={errors} name="archivo" />
          <MostrarArchivo file={existingFile} />
        </div>

        {/* Botón para crear/actualizar */}
        <div className="flex justify-center col-span-full mt-6">
          <ButtonPrimary
            value={
              isSubmitting
                ? "Procesando..."
                : isConvocatoriaRegistered
                ? "Actualizar convocatoria"
                : "Crear convocatoria"
            }
            disabled={isSubmitting}
          />
        </div>
      </form>
    </div>
  );
};

export default Convocatoria;