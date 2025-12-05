import { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
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

type Inputs = {
  nombre_aptitud: string;
  descripcion_aptitud: string;
};

type Props = {
  aptitud?: any;
  onSuccess?: () => void;
};

const EditarAptitud = ({ aptitud, onSuccess }: Props) => {
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
  console.log(aptitud);

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
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("_method", "PUT");
      formData.append("nombre_aptitud", data.nombre_aptitud);
      formData.append("descripcion_aptitud", data.descripcion_aptitud);

      const ENDPOINTS = {
        Aspirante: `${import.meta.env.VITE_API_URL}${
          import.meta.env.VITE_ENDPOINT_ACTUALIZAR_APTITUDES_ASPIRANTE
        }`,
        Docente: `${import.meta.env.VITE_API_URL}${
          import.meta.env.VITE_ENDPOINT_ACTUALIZAR_APTITUDES_DOCENTE
        }`,
      };

      const endpoint = ENDPOINTS[rol];

      const putPromise = axiosInstance.post(
        `${endpoint}/${aptitud.id_aptitud}`,
        formData
      );

      await toast.promise(putPromise, {
        pending: "Actualizando aptitud...",
        success: "Aptitud actualizada correctamente",
        error: "Error al actualizar la aptitud",
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
        {/* Encabezado */}
        <div className="col-span-full">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 w-full">
            <Briefcase className="icono bg-gradient-to-br from-cyan-400 to-cyan-500" />

            <div className="flex flex-col items-start w-full">
              <h4>Aptitud</h4>
              <span className="description-text">
                Información sobre tus habilidades o aptitudes específicas
              </span>
            </div>
          </div>

          {/* Campos */}
          <div className="grid grid-cols-1 sm:grid-cols-1 gap-6 mt-4">
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
            <div className="flex justify-center col-span-full">
              <ButtonPrimary
                value={isSubmitting ? "Enviando..." : "Editar aptitud"}
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
