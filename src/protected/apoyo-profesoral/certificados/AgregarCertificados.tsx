import { ButtonPrimary } from "../../../componentes/formularios/ButtonPrimary";
import InputErrors from "../../../componentes/formularios/InputErrors";
import { InputLabel } from "../../../componentes/formularios/InputLabel";
import TextInput from "../../../componentes/formularios/TextInput";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { certificadosSchema } from "../../../validaciones/apoyo-profesoral/certificadosSchema";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import axiosInstance from "../../../utils/axiosConfig";
import AsyncSelect from "react-select/async";
import DivForm from "../../../componentes/formularios/DivForm";
import { Calendar, FileArchive, Users } from "lucide-react";

type Inputs = {
  institucion: string;
  titulo_estudio: string;
  fecha_inicio: string;
  fecha_fin?: string;
  docentes: number[];
};
type Docente = {
  id: number;
  nombre_completo: string;
  email: string;
  numero_identificacion: string;
};

type DocenteOption = {
  value: number;
  label: string;
};

type Props = {
  onSuccess: (data: Inputs) => void;
};

const AgregarCertificados = ({ onSuccess }: Props) => {
  // Función para redirigir navegaciones
  const [isCertificadoRegistered] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // Estado para controlar el envío del formulario
  const [selectedDocentes, setSelectedDocentes] = useState<DocenteOption[]>([]);
  const [isLoadingDocentes, setIsLoadingDocentes] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<Inputs>({
    resolver: zodResolver(certificadosSchema), // Esquema de validación usando Zod
  });

  const cargarDocentes = async () => {
    try {
      setIsLoadingDocentes(true);
      const response = await axiosInstance.get(
        "apoyoProfesoral/listar-docentes"
      );
      console.log("Docentes:", response.data.data);
      return response.data.data.map((docente: Docente) => ({
        value: docente.id,
        label: `${docente.nombre_completo} (${docente.numero_identificacion})`,
      }));
    } catch (error) {
      console.error("Error cargando docentes:", error);
      toast.error("Error al cargar la lista de docentes");
      return [];
    } finally {
      setIsLoadingDocentes(false);
    }
  };

  const onSubmit = async (data: Inputs) => {
    setIsSubmitting(true); // Cambia el estado a enviando
    const url = "apoyoProfesoral/crear-certificados-masivos";
    const formData = {
      institucion: data.institucion,
      titulo_estudio: data.titulo_estudio,
      fecha_inicio: data.fecha_inicio,
      fecha_fin: data.fecha_fin || null,
      docentes: data.docentes, // esto ya es un array de números
    };
    try {
      await toast.promise(axiosInstance.post(url, formData), {
        pending: "Creando certificado...",
        success: {
          render() {
            setTimeout(() => {
              // window.location.href = "/talento-humano";
            }, 1500);
            return "Certificado creada con éxito";
          },
          autoClose: 1500,
        },
        error: "Error al crear la certificado",
      });

      onSuccess(data);
    } catch (error) {
      console.error("Error al crear certificado:", error);
    } finally {
      setIsSubmitting(false); // Cambia el estado a no enviando
    }
  };
  const handleDocentesChange = (selectedOptions: any) => {
    setSelectedDocentes(selectedOptions || []);
    setValue(
      "docentes",
      (selectedOptions || []).map((opt: DocenteOption) => opt.value),
      {
        shouldValidate: true,
      }
    );
  };
  console.log("watch:", watch());
  console.log("errors:", errors);

  return (
    <DivForm>
      <form
        className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 bg-white"
        onSubmit={handleSubmit(onSubmit)}
      >
        {/* Sección de Información de la Certificación */}
        <div className="col-span-full">
          {/* Encabezado */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 w-full">
            <FileArchive className="icono bg-gradient-to-br from-blue-400 to-blue-500" />
            {/* FileCertificate es para certificados */}

            <div className="flex flex-col items-start w-full">
              <h4>Información de la certificación</h4>
              <span className="description-text">
                Datos generales de tu certificación o capacitación
              </span>
            </div>
          </div>

          {/* Campos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
            {/* Institución */}
            <div>
              <InputLabel htmlFor="institucion" value="Institución *" />
              <TextInput
                type="text"
                id="institucion"
                placeholder="Nombre de la institución"
                {...register("institucion")}
              />
              <InputErrors errors={errors} name="institucion" />
            </div>

            {/* Título de estudio */}
            <div>
              <InputLabel
                htmlFor="titulo_estudio"
                value="Título de estudio *"
              />
              <TextInput
                type="text"
                id="titulo_estudio"
                placeholder="Nombre del título"
                {...register("titulo_estudio")}
              />
              <InputErrors errors={errors} name="titulo_estudio" />
            </div>
          </div>
        </div>
        <hr className="col-span-full border-gray-300" />

        {/* Sección de Periodo de la Certificación */}
        <div className="col-span-full">
          {/* Encabezado */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 w-full">
            <Calendar className="icono bg-gradient-to-br from-green-400 to-green-500" />
            {/* Calendar es para fechas/periodos */}

            <div className="flex flex-col items-start w-full">
              <h4>Periodo de la certificación</h4>
              <span className="description-text">
                Fechas de inicio y fin de la capacitación
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
              <InputLabel htmlFor="fecha_fin" value="Fecha de fin *" />
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

        {/* Sección de Docentes */}
        <div className="col-span-full">
          {/* Encabezado */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 w-full">
            <Users className="icono bg-gradient-to-br from-purple-400 to-purple-500" />
            {/* Users es para múltiples personas/docentes */}

            <div className="flex flex-col items-start w-full">
              <h4>Docentes o instructores</h4>
              <span className="description-text">
                Selecciona los docentes que impartieron la certificación
              </span>
            </div>
          </div>

          {/* Campos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
            {/* Docentes */}
            <div className="col-span-full">
              <InputLabel htmlFor="docentes" value="Docentes *" />
              <AsyncSelect
                id="docentes"
                isMulti
                defaultOptions
                loadOptions={cargarDocentes}
                value={selectedDocentes}
                onChange={handleDocentesChange}
                placeholder="Busque y seleccione docentes..."
                loadingMessage={() => "Cargando docentes..."}
                noOptionsMessage={() => "No se encontraron docentes"}
                className="basic-multi-select"
                classNamePrefix="select"
                isLoading={isLoadingDocentes}
              />
              <InputErrors errors={errors} name="docentes" />
            </div>
          </div>
        </div>
        <hr className="col-span-full border-gray-300" />

        {/* Botón para agregar o actualizar contratación */}
        <div className="flex justify-center col-span-full">
          <ButtonPrimary
            value={
              isSubmitting
                ? "Procesando..."
                : isCertificadoRegistered
                ? "Actualizar certificación"
                : "Crear certificación"
            }
            disabled={isSubmitting}
          />
        </div>
      </form>
    </DivForm>
  );
};

export default AgregarCertificados;
