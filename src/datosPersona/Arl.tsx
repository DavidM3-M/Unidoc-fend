import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";
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
import { SelectLocales } from "../componentes/formularios/SelectsLocales";

import { RolesValidos } from "../types/roles";
import { HardHat, Paperclip } from "lucide-react";
import { arlSchema, arlSchemaUpdate } from "../validaciones/aspirante/arlSchema";


/* =============================
        TYPES
============================= */

type ArlProps = {
  onClose: () => void;
  onSuccess: () => void;
};

type Inputs = {
  nombre_arl: string;
  fecha_afiliacion: string;
  fecha_retiro?: string;
  estado_afiliacion: "Activo" | "Inactivo";
  clase_riesgo: number;
  archivo?: FileList;
};

const Arl = ({ onClose, onSuccess }: ArlProps) => {
  const token = Cookies.get("token");
  // Sin token válido: cerrar el modal en lugar de lanzar una excepción no capturada
  if (!token) {
    onClose();
    return null;
  }

  const decoded = jwtDecode<{ rol: RolesValidos }>(token);
  const rol = decoded.rol;

  const [isRegistered, setIsRegistered] = useState(false);
  const [loading, setLoading] = useState(true);

  const schema = isRegistered ? arlSchemaUpdate : arlSchema;

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

  const fetchData = async () => {
    try {
      const ENDPOINTS = {
        Aspirante: import.meta.env.VITE_ENDPOINT_OBTENER_ARL_ASPIRANTE,
        Docente: import.meta.env.VITE_ENDPOINT_OBTENER_ARL_DOCENTE,
      };

      const response = await axiosInstance.get(ENDPOINTS[rol]);
      const data = response.data.arl;

      if (data) {
        setIsRegistered(true);

        setValue("nombre_arl", data.nombre_arl || "");
        setValue("fecha_afiliacion", data.fecha_afiliacion || "");
        setValue("fecha_retiro", data.fecha_retiro || "");
        setValue("estado_afiliacion", data.estado_afiliacion || "");
        setValue("clase_riesgo", data.clase_riesgo || 1);

        if (data.documentos_arl?.length > 0) {
          const archivo = data.documentos_arl[0];
          setExistingFile({
            url: archivo.archivo_url,
            name:
              archivo.archivo.split("/").pop() ||
              "Archivo existente",
          });
        }
      } else {
        setIsRegistered(false);
      }
    } catch (error) {
      console.error("Error al cargar ARL:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* =============================
        SUBMIT
  ============================= */

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    const formData = new FormData();

    formData.append("nombre_arl", data.nombre_arl);
    formData.append("fecha_afiliacion", data.fecha_afiliacion);
    formData.append("estado_afiliacion", data.estado_afiliacion);
    formData.append("clase_riesgo", String(data.clase_riesgo));

    if (data.fecha_retiro) {
      formData.append("fecha_retiro", data.fecha_retiro);
    }

    if (data.archivo && data.archivo.length > 0) {
      formData.append("archivo", data.archivo[0]);
    }

    if (isRegistered) {
      formData.append("_method", "PUT");
    }

    const ENDPOINTS_POST = {
      Aspirante: {
        crear: import.meta.env.VITE_ENDPOINT_CREAR_ARL_ASPIRANTE,
        actualizar:
          import.meta.env.VITE_ENDPOINT_ACTUALIZAR_ARL_ASPIRANTE,
      },
      Docente: {
        crear: import.meta.env.VITE_ENDPOINT_CREAR_ARL_DOCENTE,
        actualizar:
          import.meta.env.VITE_ENDPOINT_ACTUALIZAR_ARL_DOCENTE,
      },
    };

    const url = isRegistered
      ? ENDPOINTS_POST[rol].actualizar
      : ENDPOINTS_POST[rol].crear;

    try {
      await toast.promise(axiosInstance.post(url, formData), {
        pending: "Enviando datos...",
        success: "Datos de ARL guardados con éxito",
        error: "Error al guardar ARL",
      });

      setIsRegistered(true);
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error al enviar ARL:", error);
    }
  };

  /* =============================
        RENDER
  ============================= */

  return (
    <div className="h-full">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-50">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
            <p className="text-gray-700 font-medium">
              Cargando datos de ARL...
            </p>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 sm:grid-cols-2 gap-6"
      >
        {/* INFORMACIÓN ARL */}
        <div className="col-span-full p-4 border-l-8 rounded-lg border-orange-500 bg-white">
          <div className="flex items-center gap-4">
            <HardHat className="icono bg-gradient-to-br from-orange-400 to-orange-500" />
            <div>
              <h4>Información ARL</h4>
              <span className="description-text">
                Datos de afiliación a riesgos laborales
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
            <div>
              <InputLabel htmlFor="nombre_arl" value="Nombre ARL *" />
              <TextInput id="nombre_arl" placeholder="Nombre de la ARL..." {...register("nombre_arl")} />
              <InputErrors errors={errors} name="nombre_arl" />
            </div>

            <div>
              <InputLabel
                htmlFor="clase_riesgo"
                value="Clase de riesgo (1-5) *"
              />
              <SelectLocales
                id="clase_riesgo"
                register={register("clase_riesgo")}
              />
              <InputErrors errors={errors} name="clase_riesgo" />
            </div>

            <div>
              <InputLabel
                htmlFor="fecha_afiliacion"
                value="Fecha afiliación *"
              />
              <TextInput
                type="date"
                id="fecha_afiliacion"
                {...register("fecha_afiliacion")}
              />
              <InputErrors errors={errors} name="fecha_afiliacion" />
            </div>

            <div>
              <InputLabel
                htmlFor="fecha_retiro"
                value="Fecha retiro"
              />
              <TextInput
                type="date"
                id="fecha_retiro"
                {...register("fecha_retiro")}
              />
              <InputErrors errors={errors} name="fecha_retiro" />
            </div>

            <div className="col-span-full">
              <InputLabel
                htmlFor="estado_afiliacion"
                value="Estado afiliación *"
              />
              <SelectLocales
                id="estado_afiliacion"
                register={register("estado_afiliacion")}
              />
              <InputErrors
                errors={errors}
                name="estado_afiliacion"
              />
            </div>
          </div>
        </div>

        {/* ARCHIVO */}
        <div className="col-span-full p-4 border-l-8 rounded-lg border-gray-500 bg-white">
          <div className="flex items-center gap-4">
            <Paperclip className="icono bg-gradient-to-br from-gray-400 to-gray-500" />
            <div>
              <h4>Certificado ARL</h4>
              <span className="description-text">
                Adjunte el PDF
              </span>
            </div>
          </div>

          <div className="mt-4">
            <AdjuntarArchivo
              id="archivo"
              register={register("archivo")}
              nombre="Certificado ARL *"
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

export default Arl;