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
import { languageSchemaUpdate } from "../../../validaciones/languageSchema";
import { AdjuntarArchivo } from "../../../componentes/formularios/AdjuntarArchivo";
import { useArchivoPreview } from "../../../hooks/ArchivoPreview";
import { MostrarArchivo } from "../../../componentes/formularios/MostrarArchivo";
import { RolesValidos } from "../../../types/roles";
import { jwtDecode } from "jwt-decode";
import DivForm from "../../../componentes/formularios/DivForm";
import { Award } from "lucide-react";
import { LanguageIcon } from "@heroicons/react/24/outline";

type Inputs = {
  idioma: string;
  institucion_idioma: string;
  nivel: string;
  fecha_certificado: string;
  archivo?: FileList;
};

type Props = {
  idioma: any;
  onSuccess: () => void;
};

const EditarIdioma = ({ idioma, onSuccess }: Props) => {
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
    resolver: zodResolver(languageSchemaUpdate),
  });

  const archivoValue = watch("archivo");
  const { existingFile, setExistingFile } = useArchivoPreview(archivoValue);

useEffect(() => {
  const loadIdioma = async () => {
    if (idioma) {
      setValue("idioma", idioma.idioma || "");
      setValue("institucion_idioma", idioma.institucion_idioma || "");
      
      setValue("fecha_certificado", idioma.fecha_certificado || "");
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      setValue("nivel", idioma.nivel || "");
      
      if (idioma.documentos_idioma && idioma.documentos_idioma.length > 0) {
        const archivo = idioma.documentos_idioma[0];
        setExistingFile({
          url: archivo.archivo_url,
          name: archivo.archivo.split("/").pop() || "Archivo existente",
        });
      }
    }
  };

  loadIdioma();
}, [idioma, setValue, setExistingFile]);


  const onSubmit: SubmitHandler<Inputs> = async (data: Inputs) => {
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("_method", "PUT");
      formData.append("idioma", data.idioma);
      formData.append("institucion_idioma", data.institucion_idioma);
      formData.append("nivel", data.nivel);
      formData.append("fecha_certificado", data.fecha_certificado || "");

      if (data.archivo && data.archivo.length > 0) {
        formData.append("archivo", data.archivo[0]);
      }

      const ENDPOINTS = {
        Aspirante: `${import.meta.env.VITE_API_URL}${
          import.meta.env.VITE_ENDPOINT_ACTUALIZAR_IDIOMAS_ASPIRANTE
        }`,
        Docente: `${import.meta.env.VITE_API_URL}${
          import.meta.env.VITE_ENDPOINT_ACTUALIZAR_IDIOMAS_DOCENTE
        }`,
      };

      const endpoint = ENDPOINTS[rol];

      const putPromise = axiosInstance.post(
        `${endpoint}/${idioma.id_idioma}`,
        formData
      );

      await toast.promise(putPromise, {
        pending: "Actualizando datos...",
        success: "Datos actualizados correctamente",
        error: "Error al actualizar los datos",
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
        className="grid grid-cols-1 sm:grid-cols-2 gap-6"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="col-span-full p-2 border-t-8 rounded-lg border-pink-500">
          {/* Encabezado */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 w-full">
            <LanguageIcon className="icono bg-gradient-to-br from-pink-400 to-pink-500" />

            <div className="flex flex-col items-start w-full">
              <h4>Idioma</h4>
              <span className="description-text">
                Información del idioma y nivel correspondiente
              </span>
            </div>
          </div>

          {/* Campos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
            {/* Idioma */}
            <div>
              <InputLabel htmlFor="idioma" value="Idioma *" />
              <TextInput
                id="idioma"
                placeholder="Ingrese el idioma"
                {...register("idioma")}
              />
              <InputErrors errors={errors} name="idioma" />
            </div>

            {/* Nivel de idioma */}
            <div>
              <InputLabel htmlFor="nivel_idioma" value="Nivel de idioma *" />
              <SelectForm
                id="nivel"
                register={register("nivel")}
                url="niveles-idioma"
                data_url="nivel_idioma"
              />
              <InputErrors errors={errors} name="nivel" />
            </div>
          </div>
        </div>

        <div className="col-span-full p-2 border-t-8 rounded-lg border-yellow-500">
          {/* Encabezado */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 w-full">
            <Award className="icono bg-gradient-to-br from-yellow-400 to-yellow-500" />

            <div className="flex flex-col items-start w-full">
              <h4>Certificación del idioma</h4>
              <span className="description-text">
                Información sobre la institución y la fecha del certificado
              </span>
            </div>
          </div>

          {/* Campos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
            {/* Institución */}
            <div>
              <InputLabel htmlFor="institucion" value="Institución *" />
              <TextInput
                id="institucion_idioma"
                placeholder="Nombre de la institución"
                {...register("institucion_idioma")}
              />
              <InputErrors errors={errors} name="institucion_idioma" />
            </div>

            {/* Fecha de certificado */}
            <div>
              <InputLabel
                htmlFor="fecha_certificado"
                value="Fecha de certificado *"
              />
              <TextInput
                type="date"
                id="fecha_certificado"
                {...register("fecha_certificado")}
              />
              <InputErrors errors={errors} name="fecha_certificado" />
            </div>
          </div>
        </div>

        <div className="col-span-full">
          <AdjuntarArchivo id="archivo" register={register("archivo")} />
          <InputErrors errors={errors} name="archivo" />
          <MostrarArchivo file={existingFile} />
        </div>
        <div className="flex justify-center col-span-full">
          <ButtonPrimary
            value={isSubmitting ? "Enviando..." : "Editar idioma"}
            disabled={isSubmitting}
          />
        </div>
      </form>
    </DivForm>
  );
};

export default EditarIdioma;
