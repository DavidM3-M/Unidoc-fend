"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { productionSchema } from "../../validaciones/productionSchema";
import axios from "axios";
import { toast } from "react-toastify";
import { Link } from "react-router";
import { ButtonRegresar } from "../../componentes/formularios/ButtonRegresar";
import { SelectFormProduccionAcademica } from "../../componentes/formularios/SelectFormProduccion";
import InputErrors from "../../componentes/formularios/InputErrors";
import { InputLabel } from "../../componentes/formularios/InputLabel";
import TextInput from "../../componentes/formularios/TextInput";
import { ButtonPrimary } from "../../componentes/formularios/ButtonPrimary";
import { useState } from "react";
import { AdjuntarArchivo } from "../../componentes/formularios/AdjuntarArchivo";
import Cookies from "js-cookie";
import { MostrarArchivo } from "../../componentes/formularios/MostrarArchivo";
import { useArchivoPreview } from "../../hooks/ArchivoPreview";
import axiosInstance from "../../utils/axiosConfig";
import { RolesValidos } from "../../types/roles";
import { jwtDecode } from "jwt-decode";
import DivForm from "../../componentes/formularios/DivForm";

type Inputs = {
  productos_academicos_id: number;
  ambito_divulgacion_id: number;
  titulo: string;
  numero_autores: number;
  medio_divulgacion: string;
  fecha_divulgacion: string;
  archivo: FileList;
};

type Props = {
  onSuccess: (data: Inputs) => void;
};

const AgregarProduccion = ({ onSuccess }: Props) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Inputs>({ resolver: zodResolver(productionSchema) });

  const archivoValue = watch("archivo");
  const { existingFile } = useArchivoPreview(archivoValue);

  const onSubmit: SubmitHandler<Inputs> = async (data: Inputs) => {
    setIsSubmitting(true); // 1. Desactivar el botón al iniciar el envío
    try {
      const formData = new FormData();

      formData.append(
        "ambito_divulgacion_id",
        data.ambito_divulgacion_id.toString()
      );
      formData.append("titulo", data.titulo);
      formData.append("numero_autores", data.numero_autores.toString());
      formData.append("medio_divulgacion", data.medio_divulgacion);
      formData.append("fecha_divulgacion", data.fecha_divulgacion);
      formData.append("archivo", data.archivo?.[0] || "");

      // Token y rol
      const token = Cookies.get("token");
      if (!token) throw new Error("No authentication token found");

      const decoded = jwtDecode<{ rol: RolesValidos }>(token);
      const rol = decoded.rol;

      // ENDPOINTS por rol
      const ENDPOINTS = {
        Aspirante: `${import.meta.env.VITE_API_URL}${
          import.meta.env.VITE_ENDPOINT_CREAR_PRODUCCIONES_ASPIRANTE
        }`,
        Docente: `${import.meta.env.VITE_API_URL}${
          import.meta.env.VITE_ENDPOINT_CREAR_PRODUCCIONES_DOCENTE
        }`,
      };

      const endpoint = ENDPOINTS[rol];

      // API Request con toast tipo Estudios
      await toast.promise(axiosInstance.post(endpoint, formData), {
        pending: "Enviando datos...",
        success: "Datos guardados correctamente",
        error: "Error al guardar los datos.",
      });

      // Igual que en Estudios — cerrar modal, refrescar lista
      onSuccess(data);
    } catch (error) {
      console.error("Error al enviar los datos:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const produccionSeleccionado = watch("productos_academicos_id");
  return (
    <>
      <DivForm>
        <form
          className="grid grid-cols-1 sm:grid-cols-2 gap-6"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="flex flex-col w-full">
            <InputLabel
              htmlFor="productos_academicos_id"
              value="Productos académicos *"
            />
            <SelectFormProduccionAcademica
              id="productos_academicos_id"
              register={register("productos_academicos_id", {
                valueAsNumber: true,
                required: true,
              })}
              url="productos-academicos"
            />
            <InputErrors errors={errors} name="productos_academicos_id" />
          </div>
          <div>
            <InputLabel
              htmlFor="ambito_divulgacion_id"
              value="Ámbito de divulgación *"
            />
            <SelectFormProduccionAcademica
              id="ambito_divulgacion_id"
              register={register("ambito_divulgacion_id", {
                valueAsNumber: true,
                required: true,
              })}
              parentId={produccionSeleccionado}
              url="ambitos_divulgacion"
            />
            <InputErrors errors={errors} name="ambito_divulgacion_id" />
          </div>

          <div className="flex flex-col w-full">
            <InputLabel htmlFor="titulo" value="Título *" />
            <TextInput
              id="titulo"
              placeholder="Título..."
              {...register("titulo")}
            />
            <InputErrors errors={errors} name="titulo" />
          </div>
          <div className="flex flex-col w-full">
            <InputLabel htmlFor="numero_autores" value="Número de autores *" />
            <TextInput
              type="number"
              id="numero_autores"
              placeholder="Número de autores..."
              {...register("numero_autores", { valueAsNumber: true })}
            />
            <InputErrors errors={errors} name="numero_autores" />
          </div>
          <div className="flex flex-col w-full">
            <InputLabel
              htmlFor="medio_divulgacion"
              value="Medio de divulgación *"
            />
            <TextInput
              id="medio_divulgacion"
              placeholder="Medio de divulgación..."
              {...register("medio_divulgacion")}
            />
            <InputErrors errors={errors} name="medio_divulgacion" />
          </div>
          <div className="flex flex-col w-full">
            <InputLabel
              htmlFor="fecha_divulgacion"
              value="Fecha de divulgación *"
            />
            <TextInput
              id="fecha_divulgacion"
              type="date"
              {...register("fecha_divulgacion")}
            />
            <InputErrors errors={errors} name="fecha_divulgacion" />
          </div>
          <div className="col-span-full">
            <InputLabel htmlFor="archivo" value="Archivo" />
            <AdjuntarArchivo id="archivo" register={register("archivo")} />
            <InputErrors errors={errors} name="archivo" />
            <MostrarArchivo file={existingFile} />
          </div>
          <div className="flex justify-center col-span-full">
            <ButtonPrimary
              value={isSubmitting ? "Enviando..." : "Agregar producción"}
              disabled={isSubmitting}
            />
          </div>
        </form>
      </DivForm>
    </>
  );
};
export default AgregarProduccion;
