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
  fecha_fin: string;
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
  const [isCertificadoRegistered] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDocentes, setSelectedDocentes] = useState<DocenteOption[]>([]);
  const [isLoadingDocentes, setIsLoadingDocentes] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<Inputs>({
    resolver: zodResolver(certificadosSchema),
  });

  const cargarDocentes = async (inputValue: string) => {
    try {
      setIsLoadingDocentes(true);
      const response = await axiosInstance.get(
        "apoyoProfesoral/listar-docentes"
      );
      const busqueda = inputValue.trim().toLowerCase();
      const docentes: Docente[] = busqueda
        ? response.data.data.filter(
            (docente: Docente) =>
              docente.nombre_completo.toLowerCase().includes(busqueda) ||
              docente.numero_identificacion.toLowerCase().includes(busqueda)
          )
        : response.data.data;

      return docentes.map((docente: Docente) => ({
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
    setIsSubmitting(true);
    const url = "apoyoProfesoral/crear-certificados-masivos";
    const formData = {
      institucion: data.institucion,
      titulo_estudio: data.titulo_estudio,
      fecha_inicio: data.fecha_inicio,
      fecha_fin: data.fecha_fin || null,
      docentes: data.docentes,
    };
    try {
      await toast.promise(axiosInstance.post(url, formData), {
        pending: "Creando certificado...",
        success: {
          render() {
            return "Certificado creado con éxito";
          },
          autoClose: 1500,
        },
        error: "Error al crear el certificado",
      });

      onSuccess(data);
    } catch (error) {
      console.error("Error al crear certificado:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDocentesChange = (selectedOptions: readonly DocenteOption[]) => {
    setSelectedDocentes([...selectedOptions]);
    setValue(
      "docentes",
      (selectedOptions || []).map((opt: DocenteOption) => opt.value),
      {
        shouldValidate: true,
      }
    );
  };

  return (
    <DivForm>
      {/* Se utiliza bg-[#ffffff] (card) y el color de texto principal #2c3e50 */}
      <form
        className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 bg-[#ffffff] text-[#2c3e50] font-sans"
        onSubmit={handleSubmit(onSubmit)}
      >
        {/* Sección de Información de la Certificación */}
        <div className="col-span-full">
          {/* Encabezado */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 w-full">
            {/* Reemplazo de gradiente genérico por el Azul Institucional (#1e3a5f) */}
            <FileArchive className="icono bg-[#1e3a5f] text-white p-2 rounded-lg" size={40} />

            <div className="flex flex-col items-start w-full">
              {/* Título de sección: Inter, Peso 700, Tamaño 20px, Color Navy */}
              <h4 className="font-sans font-bold text-[20px] text-[#1e3a5f] tracking-tight">
                Información de la certificación
              </h4>
              {/* Texto secundario/apoyo: Inter, Peso 500, Tamaño 14px, Color Muted, line-height amplio */}
              <span className="text-[14px] font-medium text-[#6b7a8d] leading-relaxed">
                Datos generales de tu certificación o capacitación
              </span>
            </div>
          </div>

          {/* Campos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
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

        {/* Separador visual utilizando el borde tenue institucional: rgba(30,58,95,0.09) */}
        <hr className="col-span-full border-[rgba(30,58,95,0.09)]" />

        {/* Sección de Periodo de la Certificación */}
        <div className="col-span-full">
          {/* Encabezado */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 w-full">
            {/* Reemplazo de gradiente por el Dorado Institucional (#c89b14) para indicadores secundarios */}
            <Calendar className="icono bg-[#c89b14] text-white p-2 rounded-lg" size={40} />

            <div className="flex flex-col items-start w-full">
              <h4 className="font-sans font-bold text-[20px] text-[#1e3a5f] tracking-tight">
                Periodo de la certificación
              </h4>
              <span className="text-[14px] font-medium text-[#6b7a8d] leading-relaxed">
                Fechas de inicio y fin de la capacitación
              </span>
            </div>
          </div>

          {/* Campos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
            <div>
              <InputLabel htmlFor="fecha_inicio" value="Fecha de inicio *" />
              <TextInput
                type="date"
                id="fecha_inicio"
                {...register("fecha_inicio")}
              />
              <InputErrors errors={errors} name="fecha_inicio" />
            </div>

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

        <hr className="col-span-full border-[rgba(30,58,95,0.09)]" />

        {/* Sección de Docentes */}
        <div className="col-span-full">
          {/* Encabezado */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 w-full">
            {/* Reemplazo de gradiente por Naranja de Acción (#e8740e) para resaltar prioridad */}
            <Users className="icono bg-[#e8740e] text-white p-2 rounded-lg" size={40} />

            <div className="flex flex-col items-start w-full">
              <h4 className="font-sans font-bold text-[20px] text-[#1e3a5f] tracking-tight">
                Docentes o instructores
              </h4>
              <span className="text-[14px] font-medium text-[#6b7a8d] leading-relaxed">
                Selecciona los docentes que impartieron la certificación
              </span>
            </div>
          </div>

          {/* Campos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
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

        <hr className="col-span-full border-[rgba(30,58,95,0.09)]" />

        {/* Botón para agregar o actualizar */}
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