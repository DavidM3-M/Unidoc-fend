"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { set, SubmitHandler, useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode";
import axiosInstance from "../utils/axiosConfig";

import { InputLabel } from "../componentes/formularios/InputLabel";
import InputErrors from "../componentes/formularios/InputErrors";
import TextInput from "../componentes/formularios/TextInput";
import { ButtonPrimary } from "../componentes/formularios/ButtonPrimary";
import { AdjuntarArchivo } from "../componentes/formularios/AdjuntarArchivo";
import { MostrarArchivo } from "../componentes/formularios/MostrarArchivo";
import { useArchivoPreview } from "../hooks/ArchivoPreview";

import { RolesValidos } from "../types/roles";

import { Landmark, Paperclip } from "lucide-react";
import { pensionSchema, pensionSchemaUpdate } from "../validaciones/aspirante/pensionSchema";
import { SelectLocales } from "../componentes/formularios/SelectsLocales";
  
/* =============================
        TYPES
============================= */
type Inputs = {
  regimen_pensional: string;
  entidad_pensional: string;
  nit_entidad: string;
  archivo?: FileList;
};

const Pension = () => {
  const token = Cookies.get("token");
  if (!token) throw new Error("No authentication token found");

  const decoded = jwtDecode<{ rol: RolesValidos }>(token);
  const rol = decoded.rol;

  const [isPensionRegistered, setIsPensionRegistered] = useState(false);

  const schema = isPensionRegistered
    ? pensionSchemaUpdate
    : pensionSchema;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<Inputs>({
    resolver: zodResolver(schema),
  });

  const archivoValue = watch("archivo");
  const { existingFile, setExistingFile } =
    useArchivoPreview(archivoValue);

  /* =============================
        FETCH DATA
============================= */
  const fetchPensionData = async () => {
    try {
      const ENDPOINTS = {
        Aspirante: `${import.meta.env.VITE_API_URL}${import.meta.env.VITE_ENDPOINT_OBTENER_PENSION_ASPIRANTE}`,
        Docente: `${import.meta.env.VITE_API_URL}${import.meta.env.VITE_ENDPOINT_OBTENER_PENSION_DOCENTE}`,
      };

      const response = await axiosInstance.get(ENDPOINTS[rol]);
      const data = response.data.pension;

      if (data) {
        setIsPensionRegistered(true);
        setValue("regimen_pensional", data.regimen_pensional || "");
        setValue("entidad_pensional", data.entidad_pensional || "");
        setValue("nit_entidad", data.nit_entidad || "");

        if (data.documentos_pension?.length > 0) {
          const archivo = data.documentos_pension[0];
          setExistingFile({
            url: archivo.archivo_url,
            name: archivo.archivo.split("/").pop() || "Archivo existente",
          });
        }
      } else {
        setIsPensionRegistered(false);
      }
    } catch (error) {
      console.error("Error al cargar pensión:", error);
    }
  };

  useEffect(() => {
    fetchPensionData();
  }, []);

  /* =============================
        SUBMIT
============================= */
  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    const formData = new FormData();

    formData.append("regimen_pensional", data.regimen_pensional);
    formData.append("entidad_pensional", data.entidad_pensional);
    formData.append("nit_entidad", data.nit_entidad);

    if (data.archivo && data.archivo.length > 0) {
      formData.append("archivo", data.archivo[0]);
    }

    if (isPensionRegistered) {
      formData.append("_method", "PUT");
    }

    const ENDPOINTS_POST = {
      Aspirante: {
        crear: import.meta.env.VITE_ENDPOINT_CREAR_PENSION_ASPIRANTE,
        actualizar: import.meta.env.VITE_ENDPOINT_ACTUALIZAR_PENSION_ASPIRANTE,
      },
      Docente: {
        crear: import.meta.env.VITE_ENDPOINT_CREAR_PENSION_DOCENTE,
        actualizar: import.meta.env.VITE_ENDPOINT_ACTUALIZAR_PENSION_DOCENTE,
      },
    };

    const url = `${import.meta.env.VITE_API_URL}${
      isPensionRegistered
        ? ENDPOINTS_POST[rol].actualizar
        : ENDPOINTS_POST[rol].crear
    }`;

    try {
      await toast.promise(axiosInstance.post(url, formData), {
        pending: "Enviando datos...",
        success: {
          render: () => {
            setIsPensionRegistered(true);
            return "Datos de pensión guardados con éxito";
        },
        },
        error: "Error al guardar los datos de pensión",
      });
    } catch (error) {
      console.error("Error al enviar pensión:", error);
    }
  };

  /* =============================
        RENDER
============================= */
  return (
    <div className="h-full">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 sm:grid-cols-2 gap-6"
      >
        {/* INFORMACIÓN PENSIÓN */}
        <div className="col-span-full p-4 border-l-8 rounded-lg border-indigo-500 bg-white">
          <div className="flex items-center gap-4">
            <Landmark className="icono bg-gradient-to-br from-indigo-400 to-indigo-500" />
            <div>
              <h4>Información Pensional</h4>
              <span className="description-text">
                Datos de afiliación a pensión
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
            <div className="col-span-full">
              <InputLabel htmlFor="regimen_pensional" value="Régimen *" />
              <SelectLocales
                id="regimen_pensional"
                register={register("regimen_pensional")}

              />
              <InputErrors errors={errors} name="regimen_pensional" />
            </div>

            <div className="">
              <InputLabel htmlFor="entidad_pensional" value="Entidad *" />
              <TextInput
                id="entidad_pensional"
                {...register("entidad_pensional")}
              />
              <InputErrors errors={errors} name="entidad_pensional" />
            </div>

            <div>
              <InputLabel htmlFor="nit_entidad" value="NIT entidad *" />
              <TextInput
                id="nit_entidad"
                {...register("nit_entidad")}
              />
              <InputErrors errors={errors} name="nit_entidad" />
            </div>
          </div>
        </div>

        {/* ARCHIVO */}
        <div className="col-span-full p-4 border-l-8 rounded-lg border-gray-500 bg-white">
          <div className="flex items-center gap-4">
            <Paperclip className="icono bg-gradient-to-br from-gray-400 to-gray-500" />
            <div>
              <h4>Documento de pensión</h4>
              <span className="description-text">Adjunte el PDF</span>
            </div>
          </div>

          <div className="mt-4">
            <AdjuntarArchivo
              id="archivo"
              register={register("archivo")}
              nombre="Pensión *"
            />
            <InputErrors errors={errors} name="archivo" />
            <MostrarArchivo file={existingFile} />
          </div>
        </div>

        <div className="col-span-full text-center">
          <ButtonPrimary type="submit" value="Guardar" />
        </div>
      </form>
    </div>
  );
};

export default Pension;
