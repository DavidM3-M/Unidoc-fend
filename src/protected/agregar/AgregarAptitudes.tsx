import { InputLabel } from "../../componentes/formularios/InputLabel";
import TextInput from "../../componentes/formularios/TextInput";
import InputErrors from "../../componentes/formularios/InputErrors";
import { aptitudSchema } from "../../validaciones/aptitudSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";
import TextArea from "../../componentes/formularios/TextArea";
import { toast } from "react-toastify";
import axiosInstance from "../../utils/axiosConfig";
import Cookies from "js-cookie";
import { useState } from "react";
import { ButtonPrimary } from "../../componentes/formularios/ButtonPrimary";
import { RolesValidos } from "../../types/roles";
import { jwtDecode } from "jwt-decode";
import DivForm from "../../componentes/formularios/DivForm";
import { Briefcase } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

type Inputs = {
  nombre_aptitud: string;
  descripcion_aptitud: string;
};

type Props = {
  onSuccess: (data: Inputs) => void;
};

const AgregarAptitudes = ({ onSuccess }: Props) => {
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>({ resolver: zodResolver(aptitudSchema) });

  const onSubmit: SubmitHandler<Inputs> = async (data: Inputs) => {
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("nombre_aptitud", data.nombre_aptitud);
      formData.append("descripcion_aptitud", data.descripcion_aptitud);

      const token = Cookies.get("token");
      if (!token) throw new Error("No authentication token found");

      const decoded = jwtDecode<{ rol: RolesValidos }>(token);
      const rol = decoded.rol;

      const ENDPOINTS = {
        Aspirante: import.meta.env.VITE_ENDPOINT_CREAR_APTITUDES_ASPIRANTE,
        Docente: import.meta.env.VITE_ENDPOINT_CREAR_APTITUDES_DOCENTE,
        Administrativo: import.meta.env.VITE_ENDPOINT_CREAR_APTITUDES_DOCENTE,
      };

      const endpoint = ENDPOINTS[rol];

      await toast.promise(axiosInstance.post(endpoint, formData), {
        pending: t("messages.aptitude.adding"),
        success: t("messages.aptitude.added"),
        error: t("messages.aptitude.addError"),
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
        className="grid grid-cols-1 gap-6"
        onSubmit={handleSubmit(onSubmit)}
      >
        {/* Encabezado */}
        <div className="col-span-full">
          <div className="flex items-center gap-4 mb-5">
            <div className="p-3 rounded-lg bg-[rgba(30,58,95,0.05)] text-[#1e3a5f]">
              <Briefcase size={24} />
            </div>

            <div className="flex flex-col items-start w-full">
              <h4 className="text-lg font-semibold text-[#1e3a5f] tracking-tight">
                Información de aptitudes
              </h4>
              <span className="text-sm text-[#6b7a8d]">
                Describe tus aptitudes y habilidades profesionales
              </span>
            </div>
          </div>

          {/* Campos */}
          <div className="grid grid-cols-1 gap-6 pt-5 border-t border-[rgba(30,58,95,0.05)]">
            {/* Nombre de aptitud */}
            <div className="col-span-full">
              <InputLabel htmlFor="Aptitud" value="Aptitud *" />
              <TextInput
                id="Aptitud"
                placeholder="Ingrese la aptitud..."
                {...register("nombre_aptitud")}
              />
              <InputErrors errors={errors} name="nombre_aptitud" />
            </div>

            {/* Descripción */}
            <div className="col-span-full">
              <InputLabel htmlFor="Descripcion" value="Descripción *" />
              <TextArea
                id="Descripcion"
                placeholder="Descripción de la aptitud..."
                {...register("descripcion_aptitud")}
              />
              <InputErrors errors={errors} name="descripcion_aptitud" />
            </div>

            {/* Botón */}
            <div className="flex justify-center md:justify-end col-span-full mt-2">
              <ButtonPrimary
                value={isSubmitting ? "Enviando..." : "Agregar aptitud"}
                disabled={isSubmitting}
              />
            </div>
          </div>
        </div>
      </form>
    </DivForm>
  );
};

export default AgregarAptitudes;