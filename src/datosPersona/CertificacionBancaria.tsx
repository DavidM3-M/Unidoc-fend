"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import { InputLabel } from "../componentes/formularios/InputLabel";
import InputErrors from "../componentes/formularios/InputErrors";
import TextInput from "../componentes/formularios/TextInput";
import { ButtonPrimary } from "../componentes/formularios/ButtonPrimary";
import { AdjuntarArchivo } from "../componentes/formularios/AdjuntarArchivo";
import { MostrarArchivo } from "../componentes/formularios/MostrarArchivo";
import { useArchivoPreview } from "../hooks/ArchivoPreview";
import axiosInstance from "../utils/axiosConfig";
import { RolesValidos } from "../types/roles";
import { jwtDecode } from "jwt-decode";
import { Building, CalendarIcon, Paperclip } from "lucide-react";
import {
  bancoSchema,
  bancoSchemaUpdate,
} from "../validaciones/aspirante/certificacionBancariaSchema";
import { SelectLocales } from "../componentes/formularios/SelectsLocales";

type Inputs = {
  nombre_banco: string;
  tipo_cuenta: string;
  numero_cuenta: string;
  fecha_emision?: string;
  archivo?: FileList;
};
type CertificacionBancariaProps = {
  onClose: () => void;
  onSuccess: () => void;
};

export const CertificacionBancaria = ({
  onClose,
  onSuccess,
}: CertificacionBancariaProps) => {
  const token = Cookies.get("token");
  if (!token) throw new Error("No authentication token found");

  const decoded = jwtDecode<{ rol: RolesValidos }>(token);
  const rol = decoded.rol;

  const [isBancoRegistered, setIsBancoRegistered] = useState(false);

  const schema = isBancoRegistered ? bancoSchemaUpdate : bancoSchema;
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<Inputs>({
    resolver: zodResolver(schema),
    defaultValues: {},
  });

  const archivoValue = watch("archivo");
  const { existingFile, setExistingFile } = useArchivoPreview(archivoValue);

  /* =============================
      OBTENER DATOS BANCARIOS
  ============================== */
  const fetchBancoData = async () => {
    setLoading(true);
    try {
      const ENDPOINTS = {
        Aspirante: `${import.meta.env.VITE_API_URL}${import.meta.env.VITE_ENDPOINT_OBTENER_CERTIFICACION_BANCARIA_ASPIRANTE}`,
        Docente: `${import.meta.env.VITE_API_URL}${import.meta.env.VITE_ENDPOINT_OBTENER_CERTIFICACION_BANCARIA_DOCENTE}`,
      };

      const endpoint = ENDPOINTS[rol];
      const response = await axiosInstance.get(endpoint);

      const data = response.data.certificacion_bancaria;

      if (data) {
        setIsBancoRegistered(true);

        setValue("nombre_banco", data.nombre_banco || "");
        setValue("tipo_cuenta", data.tipo_cuenta || "");
        setValue("numero_cuenta", data.numero_cuenta || "");
        setValue("fecha_emision", data.fecha_emision || "");

        if (data.documentos_certificacion_bancaria?.length > 0) {
          const archivo = data.documentos_certificacion_bancaria[0];
          setExistingFile({
            url: archivo.archivo_url,
            name: archivo.archivo.split("/").pop() || "Archivo existente",
          });
        }
      } else {
        setIsBancoRegistered(false);
      }
    } catch (error) {
      console.error("Error al cargar datos bancarios:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBancoData();
  }, []);

  /* =============================
        ENVIAR FORMULARIO
  ============================== */
  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    const formData = new FormData();

    formData.append("nombre_banco", data.nombre_banco);
    formData.append("tipo_cuenta", data.tipo_cuenta);
    formData.append("numero_cuenta", data.numero_cuenta);
    formData.append("fecha_emision", data.fecha_emision || "");
    if (data.archivo && data.archivo.length > 0) {
      formData.append("archivo", data.archivo[0]);
    }

    if (isBancoRegistered) {
      formData.append("_method", "PUT");
    }
    console.log("data", data);

    const ENDPOINTS_POST = {
      Aspirante: {
        crear: import.meta.env
          .VITE_ENDPOINT_CREAR_CERTIFICACION_BANCARIA_ASPIRANTE,
        actualizar: import.meta.env
          .VITE_ENDPOINT_ACTUALIZAR_CERTIFICACION_BANCARIA_ASPIRANTE,
      },
      Docente: {
        crear: import.meta.env
          .VITE_ENDPOINT_CREAR_CERTIFICACION_BANCARIA_DOCENTE,
        actualizar: import.meta.env
          .VITE_ENDPOINT_ACTUALIZAR_CERTIFICACION_BANCARIA_DOCENTE,
      },
    };

    const url = `${import.meta.env.VITE_API_URL}${
      isBancoRegistered
        ? ENDPOINTS_POST[rol].actualizar
        : ENDPOINTS_POST[rol].crear
    }`;

    try {
      await toast.promise(axiosInstance.post(url, formData), {
        pending: "Enviando datos...",
        success: {
          render() {
            return "Datos bancarios guardados correctamente";
          },
        },
        error: "Error al guardar los datos bancarios",
      });
      setIsBancoRegistered(true);
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error al enviar formulario:", error);
    }
  };

  /* =============================
            UI
  ============================== */

  return (
    <div className="h-full">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-50">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
            <p className="text-gray-700 font-medium">
              Cargando datos bancarios...
            </p>
          </div>
        </div>
      )}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 sm:grid-cols-2 gap-6"
      >
        {/* INFORMACIÓN BANCARIA */}
        <div className="col-span-full p-4 border-l-8 rounded-lg border-blue-500 bg-white">
          <div className="flex justify-between items-center gap-4 w-full">
            <Building className="icono bg-gradient-to-br from-blue-400 to-blue-500" />

            <div className="flex flex-col items-start w-full">
              <h4>Información bancaria</h4>
              <span className="description-text">
                Datos principales de su cuenta bancaria
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-4">
            <div>
              <InputLabel htmlFor="tipo_cuenta" value="Tipo de cuenta *" />
              <SelectLocales
                id="tipo_cuenta"
                register={register("tipo_cuenta")}
              />
              <InputErrors errors={errors} name="tipo_cuenta" />
            </div>
            <div className="sm:col-span-2">
              <InputLabel htmlFor="nombre_banco" value="Nombre del banco *" />
              <TextInput
                id="nombre_banco"
                {...register("nombre_banco")}
                placeholder="Nombre del banco..."
              />
              <InputErrors errors={errors} name="nombre_banco" />
            </div>
          </div>
        </div>

        <hr className="col-span-full border-gray-300" />

        {/* DATOS DE CUENTA */}
        <div className="col-span-full p-4 border-l-8 rounded-lg border-green-500 bg-white">
          <div className="flex justify-between items-center gap-4 w-full">
            <CalendarIcon className="icono bg-gradient-to-br from-green-400 to-green-500" />

            <div className="flex flex-col items-start w-full">
              <h4>Datos de la cuenta</h4>
              <span className="description-text">
                Número de cuenta y fecha de emisión
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-4">
            <div className="sm:col-span-2">
              <InputLabel htmlFor="numero_cuenta" value="Número de cuenta *" />
              <TextInput
                id="numero_cuenta"
                {...register("numero_cuenta")}
                placeholder="Número de cuenta..."
              />
              <InputErrors errors={errors} name="numero_cuenta" />
            </div>

            <div>
              <InputLabel htmlFor="fecha_emision" value="Fecha de emisión" />
              <TextInput
                type="date"
                id="fecha_emision"
                {...register("fecha_emision")}
              />
              <InputErrors errors={errors} name="fecha_emision" />
            </div>
          </div>
        </div>

        <hr className="col-span-full border-gray-300" />

        {/* ARCHIVO */}
        <div className="col-span-full p-4 border-l-8 rounded-lg border-gray-500 bg-white shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 w-full">
            <Paperclip className="icono bg-gradient-to-br from-gray-400 to-gray-500" />

            <div className="flex flex-col items-start w-full">
              <h4>Documento bancario</h4>
              <span className="description-text">
                Adjunte el certificado bancario en PDF.
              </span>
            </div>

            <span className="info-section">Requerido</span>
          </div>

          <div className="mt-4">
            <AdjuntarArchivo
              id="archivo"
              register={register("archivo")}
              nombre="Certificado bancario *"
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
