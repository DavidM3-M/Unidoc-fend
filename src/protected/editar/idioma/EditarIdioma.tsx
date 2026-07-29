import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import { useLanguage } from "../../../context/LanguageContext";
import axiosInstance from "../../../utils/axiosConfig";
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

  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
        
        // Retraso intencional para dar tiempo a que las opciones del SelectForm se carguen
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

      // === Archivo (solo si el usuario carga uno nuevo) ===
      if (data.archivo && data.archivo.length > 0) {
        formData.append("archivo", data.archivo[0]);
      }

      // === Endpoints por rol ===
      const ENDPOINTS = {
        Aspirante: import.meta.env.VITE_ENDPOINT_ACTUALIZAR_IDIOMAS_ASPIRANTE,
        Docente: import.meta.env.VITE_ENDPOINT_ACTUALIZAR_IDIOMAS_DOCENTE,
        Administrativo: import.meta.env.VITE_ENDPOINT_ACTUALIZAR_IDIOMAS_DOCENTE,
      };

      const endpoint = ENDPOINTS[rol];

      // === Petición con toast.promise ===
      const putPromise = axiosInstance.post(
        `${endpoint}/${idioma.id_idioma}`,
        formData
      );

      await toast.promise(putPromise, {
        pending: t("messages.language.updating"),
        success: t("messages.language.updated"),
        error: t("messages.language.updateError"),
      });

      // Callback de éxito
      onSuccess?.();
    } catch (error) {
      console.error("Error en la actualización:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DivForm>
      <form
        className="grid grid-cols-1 sm:grid-cols-2 gap-y-8 bg-white"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="col-span-full">
          {/* Encabezado: Idioma */}
          <div className="flex flex-col sm:flex-row justify-start items-center gap-4 w-full border-b border-gray-100 pb-4 mb-2">
            <div className="bg-[#1e3a5f]/10 p-3 rounded-xl flex-shrink-0">
              <LanguageIcon className="w-6 h-6 text-[#1e3a5f]" />
            </div>

            <div className="flex flex-col items-start w-full">
              <h4 className="text-xl font-bold text-[#1e3a5f] m-0">Idioma</h4>
              <span className="text-sm text-gray-500 mt-1">
                Información del idioma y nivel correspondiente
              </span>
            </div>
          </div>

          {/* Campos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-5">
            {/* Idioma */}
            <div className="col-span-full sm:col-span-1">
              <InputLabel htmlFor="idioma" value="Idioma *" />
              <TextInput
                id="idioma"
                placeholder="Ingrese el idioma"
                {...register("idioma")}
              />
              <InputErrors errors={errors} name="idioma" />
            </div>

            {/* Nivel de idioma */}
            <div className="col-span-full sm:col-span-1">
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
        
        <div className="col-span-full mt-2">
          {/* Encabezado: Certificación */}
          <div className="flex flex-col sm:flex-row justify-start items-center gap-4 w-full border-b border-gray-100 pb-4 mb-2">
            <div className="bg-[#1e3a5f]/10 p-3 rounded-xl flex-shrink-0">
              <Award className="w-6 h-6 text-[#1e3a5f]" />
            </div>

            <div className="flex flex-col items-start w-full">
              <h4 className="text-xl font-bold text-[#1e3a5f] m-0">Certificación del idioma</h4>
              <span className="text-sm text-gray-500 mt-1">
                Información sobre la institución y la fecha del certificado
              </span>
            </div>
          </div>

          {/* Campos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-5">
            {/* Institución */}
            <div className="col-span-full sm:col-span-1">
              <InputLabel htmlFor="institucion_idioma" value="Institución *" />
              <TextInput
                id="institucion_idioma"
                placeholder="Nombre de la institución"
                {...register("institucion_idioma")}
              />
              <InputErrors errors={errors} name="institucion_idioma" />
            </div>

            {/* Fecha de certificado */}
            <div className="col-span-full sm:col-span-1">
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
        
        {/* Archivo */}
        <div className="col-span-full border-t border-gray-100 pt-6">
          <InputLabel htmlFor="archivo" value="Archivo" />
          <AdjuntarArchivo id="archivo" register={register("archivo")} />
          <InputErrors errors={errors} name="archivo" />
          <MostrarArchivo file={existingFile} />
        </div>

        {/* Botón */}
        <div className="flex justify-end col-span-full mt-2">
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