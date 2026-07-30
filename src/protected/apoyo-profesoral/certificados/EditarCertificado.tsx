import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { ButtonPrimary } from "../../../componentes/formularios/ButtonPrimary";
import InputErrors from "../../../componentes/formularios/InputErrors";
import { InputLabel } from "../../../componentes/formularios/InputLabel";
import TextInput from "../../../componentes/formularios/TextInput";
import DivForm from "../../../componentes/formularios/DivForm";
import axiosInstance from "../../../utils/axiosConfig";
import { certificadoUpdateSchema } from "../../../validaciones/apoyo-profesoral/certificadosSchema";
import { Calendar, FileArchive } from "lucide-react";

type Inputs = {
  institucion: string;
  titulo_estudio: string;
  fecha_inicio: string;
  fecha_fin: string;
};

type Certificado = {
  id_estudio: number;
  institucion: string;
  titulo_estudio: string;
  fecha_inicio: string;
  fecha_fin: string;
};

type Props = {
  certificado: Certificado;
  onSuccess: () => void;
};

const EditarCertificado = ({ certificado, onSuccess }: Props) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<Inputs>({
    resolver: zodResolver(certificadoUpdateSchema),
  });

  useEffect(() => {
    if (certificado) {
      setValue("institucion", certificado.institucion || "");
      setValue("titulo_estudio", certificado.titulo_estudio || "");
      setValue("fecha_inicio", certificado.fecha_inicio || "");
      setValue("fecha_fin", certificado.fecha_fin || "");
    }
  }, [certificado, setValue]);

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    setIsSubmitting(true);
    const endpoint = import.meta.env.VITE_ENDPOINT_ACTUALIZAR_CERTIFICADO_DOCENTE;
    const formData = {
      institucion: data.institucion,
      titulo_estudio: data.titulo_estudio,
      fecha_inicio: data.fecha_inicio,
      fecha_fin: data.fecha_fin || null,
      _method: "PUT",
    };

    try {
      await toast.promise(
        axiosInstance.post(`${endpoint}${certificado.id_estudio}`, formData),
        {
          pending: "Actualizando certificado...",
          success: {
            render() {
              return "Certificado actualizado con éxito";
            },
            autoClose: 1500,
          },
          error: "Error al actualizar el certificado",
        }
      );
      onSuccess();
    } catch (error) {
      console.error("Error al actualizar certificado:", error);
    } finally {
      setIsSubmitting(false);
    }
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

        {/* Botón para actualizar */}
        <div className="flex justify-center col-span-full">
          <ButtonPrimary
            value={isSubmitting ? "Procesando..." : "Actualizar certificación"}
            disabled={isSubmitting}
          />
        </div>
      </form>
    </DivForm>
  );
};

export default EditarCertificado;
