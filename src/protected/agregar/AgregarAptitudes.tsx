import { Link } from "react-router";
import { ButtonRegresar } from "../../componentes/formularios/ButtonRegresar";
import { InputLabel } from "../../componentes/formularios/InputLabel";
import TextInput from "../../componentes/formularios/TextInput";
import InputErrors from "../../componentes/formularios/InputErrors";
import { aptitudSchema } from "../../validaciones/aptitudSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";
import TextArea from "../../componentes/formularios/TextArea";
import { toast } from "react-toastify";
import axiosInstance from "../../utils/axiosConfig";
import axios from "axios";
import Cookies from "js-cookie";
import { useState } from "react";
import { ButtonPrimary } from "../../componentes/formularios/ButtonPrimary";
import { RolesValidos } from "../../types/roles";
import { jwtDecode } from "jwt-decode";
import DivForm from "../../componentes/formularios/DivForm";

type Inputs = {
  nombre_aptitud: string;
  descripcion_aptitud: string;
};

const AgregarAptitudes = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>({ resolver: zodResolver(aptitudSchema) });

  const onSubmit: SubmitHandler<Inputs> = async (data: Inputs) => {
    setIsSubmitting(true); // 1. Desactivar el botón al iniciar el envío
    try {
      const formData = new FormData();
      formData.append("nombre_aptitud", data.nombre_aptitud);
      formData.append("descripcion_aptitud", data.descripcion_aptitud);

      const token = Cookies.get("token");
      if (!token) throw new Error("No authentication token found");
      const decoded = jwtDecode<{ rol: RolesValidos }>(token);
      const rol = decoded.rol;

      const ENDPOINTS = {
        Aspirante: `${import.meta.env.VITE_API_URL}${
          import.meta.env.VITE_ENDPOINT_CREAR_APTITUDES_ASPIRANTE
        }`,
        Docente: `${import.meta.env.VITE_API_URL}${
          import.meta.env.VITE_ENDPOINT_CREAR_APTITUDES_DOCENTE
        }`,
      };
      const endpoint = ENDPOINTS[rol];

      await toast.promise(axiosInstance.post(endpoint, formData), {
        pending: "Enviando datos...",
        success: {
          render() {
            setTimeout(() => {
              window.location.href = "/index";
            }, 1500);
            return "Datos guardados correctamente";
          },
          autoClose: 1500,
        },
        error: {
          render({ data }) {
            const error = data;
            if (axios.isAxiosError(error)) {
              if (error.code === "ECONNABORTED") {
                return "Tiempo de espera agotado. Intenta de nuevo.";
              } else if (error.response) {
                const errores = error.response.data?.errors;
                if (errores && typeof errores === "object") {
                  return `Errores: ${Object.values(errores).flat().join(", ")}`;
                }
                return (
                  error.response.data?.message || "Error al guardar los datos."
                );
              } else if (error.request) {
                return "No se recibió respuesta del servidor.";
              }
            }
            return "Error inesperado al guardar los datos.";
          },
          autoClose: 3000,
        },
      });
    } catch (error) {
      console.error("Error en el envío:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DivForm >
      <form
        className="grid grid-cols-1 gap-6"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="">
          <InputLabel htmlFor="Aptitud" value="Aptitud *" />
          <TextInput
            id="Aptitud"
            placeholder="Titulo de aptitud..."
            {...register("nombre_aptitud")}
          />
          <InputErrors errors={errors} name="nombre_aptitud" />
        </div>
        <div className="">
          <InputLabel htmlFor="Descripcion" value="Descripción *" />
          <TextArea
            id="Descripcion"
            placeholder="Descripción de la aptitud..."
            {...register("descripcion_aptitud")}
          />
          <InputErrors errors={errors} name="descripcion_aptitud" />
        </div>
        <div className="flex justify-center col-span-full">
          <ButtonPrimary
            value={isSubmitting ? "Enviando..." : "Agregar aptitud"}
            disabled={isSubmitting}
          />
        </div>
      </form>
    </DivForm>
  );
};
export default AgregarAptitudes;
