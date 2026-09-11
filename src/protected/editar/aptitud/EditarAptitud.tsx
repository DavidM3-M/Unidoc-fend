import type { AptitudRegistro } from "../../../types/trayectoria";
import { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { aptitudSchema } from "../../../validaciones/aptitudSchema";
import axiosInstance from "../../../utils/axiosConfig";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import { InputLabel } from "../../../componentes/formularios/InputLabel";
import TextInput from "../../../componentes/formularios/TextInput";
import TextArea from "../../../componentes/formularios/TextArea";
import InputErrors from "../../../componentes/formularios/InputErrors";
import { ButtonPrimary } from "../../../componentes/formularios/ButtonPrimary";
import { RolesValidos } from "../../../types/roles";
import { jwtDecode } from "jwt-decode";
import DivForm from "../../../componentes/formularios/DivForm";
import { Briefcase } from "lucide-react";
import { useLanguage } from "../../../context/useLanguage";

type Inputs = {
  nombre_aptitud: string;
  descripcion_aptitud: string;
};

type Props = {
  aptitud?: AptitudRegistro | null;
  onSuccess?: () => void;
};

const EditarAptitud = ({ aptitud, onSuccess }: Props) => {
  const { t } = useLanguage();
  const token = Cookies.get("token");
  if (!token) throw new Error("No authentication token found");
  const decoded = jwtDecode<{ rol: RolesValidos }>(token);
  const rol = decoded.rol;

  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<Inputs>({
    resolver: zodResolver(aptitudSchema),
  });

  useEffect(() => {
    const loadAptitud = async () => {
      try {
        if (aptitud) {
          setValue("nombre_aptitud", aptitud?.nombre_aptitud || "");
          setValue("descripcion_aptitud", aptitud?.descripcion_aptitud || "");
        }
      } catch (error) {
        console.error("Error al obtener la aptitud:", error);
        toast.error("Error al cargar los datos de la aptitud");
      }
    };

    loadAptitud();
  }, [aptitud, setValue]);

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    if (!aptitud) return;
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("_method", "PUT");
      formData.append("nombre_aptitud", data.nombre_aptitud);
      formData.append("descripcion_aptitud", data.descripcion_aptitud);

      const ENDPOINTS = {
        Aspirante: import.meta.env.VITE_ENDPOINT_ACTUALIZAR_APTITUDES_ASPIRANTE,
        Docente: import.meta.env.VITE_ENDPOINT_ACTUALIZAR_APTITUDES_DOCENTE,
        Administrativo: import.meta.env
          .VITE_ENDPOINT_ACTUALIZAR_APTITUDES_DOCENTE,
      };

      const endpoint = ENDPOINTS[rol];

      const putPromise = axiosInstance.post(
        `${endpoint}/${aptitud.id_aptitud}`,
        formData,
      );

      await toast.promise(putPromise, {
        pending: t("messages.aptitude.updating"),
        success: t("messages.aptitude.updated"),
        error: t("messages.aptitude.updateError"),
      });

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
        className="grid grid-cols-1 gap-6"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="col-span-full">
          {/* Encabezado rediseñado con el color corporativo */}
          <div className="flex flex-col sm:flex-row justify-start items-center gap-4 w-full border-b border-gray-100 pb-5 mb-2">
            <div className="bg-[#1e3a5f]/10 p-3 rounded-xl flex-shrink-0">
              <Briefcase className="w-6 h-6 text-[#1e3a5f]" />
            </div>

            <div className="flex flex-col items-start w-full">
              <h4 className="text-xl font-bold text-[#1e3a5f] m-0">
                Aptitud
              </h4>
              <span className="text-sm text-gray-500 mt-1">
                Actualiza la información de tu aptitud profesional
              </span>
            </div>
          </div>

          {/* Campos */}
          <div className="grid grid-cols-1 sm:grid-cols-1 gap-6 mt-5">
            {/* Nombre de aptitud */}
            <div className="col-span-full">
              <InputLabel htmlFor="Aptitud" value="Aptitud *" />
              <TextInput
                id="Aptitud"
                placeholder="Título de la aptitud..."
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
            <div className="flex justify-end col-span-full mt-2">
              <ButtonPrimary
                value={isSubmitting ? "Enviando..." : "Actualizar aptitud"}
                disabled={isSubmitting}
              />
            </div>
          </div>
        </div>
      </form>
    </DivForm>
  );
};

export default EditarAptitud;
