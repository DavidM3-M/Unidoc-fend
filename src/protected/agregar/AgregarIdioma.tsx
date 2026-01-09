"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { languageSchema } from "../../validaciones/languageSchema";
import { SubmitHandler, useForm } from "react-hook-form";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import { InputLabel } from "../../componentes/formularios/InputLabel";
import TextInput from "../../componentes/formularios/TextInput";
import InputErrors from "../../componentes/formularios/InputErrors";
import { SelectForm } from "../../componentes/formularios/SelectForm";
import { ButtonPrimary } from "../../componentes/formularios/ButtonPrimary";
import { AdjuntarArchivo } from "../../componentes/formularios/AdjuntarArchivo";
import { useArchivoPreview } from "../../hooks/ArchivoPreview";
import { MostrarArchivo } from "../../componentes/formularios/MostrarArchivo";
import { RolesValidos } from "../../types/roles";
import axiosInstance from "../../utils/axiosConfig";
import { jwtDecode } from "jwt-decode";
import DivForm from "../../componentes/formularios/DivForm";
import { useState } from "react";
import { LanguageIcon } from "@heroicons/react/24/outline";
import { Award } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

type Inputs = {
  idioma: string;
  institucion_idioma: string;
  nivel: string;
  fecha_certificado: string;
  archivo: FileList;
};

type Props = {
  onSuccess: (data: Inputs) => void;
};

const AgregarIdioma = ({ onSuccess }: Props) => {
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Inputs>({
    resolver: zodResolver(languageSchema),
  });

  const archivoValue = watch("archivo");
  const { existingFile } = useArchivoPreview(archivoValue);

  const onSubmit: SubmitHandler<Inputs> = async (data: Inputs) => {
    setIsSubmitting(true); // 1. Desactivar botón
    try {
      const formData = new FormData();
      formData.append("idioma", data.idioma);
      formData.append("institucion_idioma", data.institucion_idioma);
      formData.append("nivel", data.nivel);
      formData.append("fecha_certificado", data.fecha_certificado || "");
      formData.append("archivo", data.archivo?.[0] || "");

      const token = Cookies.get("token");
      if (!token) throw new Error("No authentication token found");

      const decoded = jwtDecode<{ rol: RolesValidos }>(token);
      const rol = decoded.rol;

      const ENDPOINTS = {
        Aspirante: `${import.meta.env.VITE_API_URL}${
          import.meta.env.VITE_ENDPOINT_CREAR_IDIOMAS_ASPIRANTE
        }`,
        Docente: `${import.meta.env.VITE_API_URL}${
          import.meta.env.VITE_ENDPOINT_CREAR_IDIOMAS_DOCENTE
        }`,
      };

      const endpoint = ENDPOINTS[rol];

      // 2. Envío con mensaje de carga
      await toast.promise(axiosInstance.post(endpoint, formData), {
        pending: t("messages.sending"),
        success: t("messages.success"),
        error: t("messages.error"),
      });

      onSuccess(data);
    } catch (error) {
      console.error("Error en el envío:", error);
    } finally {
      setIsSubmitting(false);
      // 4. Reactivar botón
    }
  };

  return (
    <DivForm>
      <form
        className="grid grid-cols-1 sm:grid-cols-2 gap-6"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="col-span-full ">
          {/* Encabezado */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 w-full">
            <LanguageIcon className="icono bg-gradient-to-br from-pink-400 to-pink-500" />

            <div className="flex flex-col items-start w-full">
              <h4>Información del idioma</h4>
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
        <hr className="col-span-full border-gray-300" />

        <div className="col-span-full ">
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
        <hr className="col-span-full border-gray-300" />

        <div className="col-span-full">
          <AdjuntarArchivo id="archivo" register={register("archivo")} />
          <InputErrors errors={errors} name="archivo" />
          <MostrarArchivo file={existingFile} />
        </div>
        <div className="flex justify-center col-span-full">
          <ButtonPrimary
            value={isSubmitting ? "Enviando..." : "Agregar idioma"}
            disabled={isSubmitting}
          />
        </div>
      </form>
    </DivForm>
  );
};

export default AgregarIdioma;
