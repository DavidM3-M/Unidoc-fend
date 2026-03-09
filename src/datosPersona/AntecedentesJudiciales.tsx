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

import { ShieldCheck, Paperclip } from "lucide-react";
import { antecedentesSchema, antecedentesSchemaUpdate } from "../validaciones/aspirante/antecedentesJudiciales";



/* =============================
        TYPES
============================= */
type AntecedentesProps = {
  onClose: () => void;
  onSuccess: () => void;
};

type Inputs = {
  fecha_validacion: string;
  estado_antecedentes: "Sin Antecedentes" | "Con Antecedentes";
  archivo?: FileList;
};

const AntecedentesJudiciales = ({
  onClose,
  onSuccess,
}: AntecedentesProps) => {
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

  const schema = isRegistered
    ? antecedentesSchemaUpdate
    : antecedentesSchema;

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
        Aspirante: `${import.meta.env.VITE_API_URL}${import.meta.env.VITE_ENDPOINT_OBTENER_ANTECEDENTES_JUDICIALES_ASPIRANTE}`,
        Docente: `${import.meta.env.VITE_API_URL}${import.meta.env.VITE_ENDPOINT_OBTENER_ANTECEDENTES_JUDICIALES_DOCENTE}`,
      };

      const response = await axiosInstance.get(ENDPOINTS[rol]);
      const data = response.data.antecedente_judicial;
      console.log("Datos obtenidos de antecedentes judiciales:", data);
      if (data) {
        setIsRegistered(true);

        setValue("fecha_validacion", data.fecha_validacion || "");
        setValue(
          "estado_antecedentes",
          data.estado_antecedentes || ""
        );

        if (data.documentos_antecedentes_judiciales?.length > 0) {
          const archivo = data.documentos_antecedentes_judiciales[0];
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
      console.error("Error al cargar antecedentes:", error);
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

    formData.append("fecha_validacion", data.fecha_validacion);
    formData.append("estado_antecedentes", data.estado_antecedentes);

    if (data.archivo && data.archivo.length > 0) {
      formData.append("archivo", data.archivo[0]);
    }

    if (isRegistered) {
      formData.append("_method", "PUT");
    }

    const ENDPOINTS_POST = {
      Aspirante: {
        crear: import.meta.env
          .VITE_ENDPOINT_CREAR_ANTECEDENTES_JUDICIALES_ASPIRANTE,
        actualizar:
          import.meta.env
            .VITE_ENDPOINT_ACTUALIZAR_ANTECEDENTES_JUDICIALES_ASPIRANTE,
      },
      Docente: {
        crear: import.meta.env
          .VITE_ENDPOINT_CREAR_ANTECEDENTES_JUDICIALES_DOCENTE,
        actualizar:
          import.meta.env
            .VITE_ENDPOINT_ACTUALIZAR_ANTECEDENTES_JUDICIALES_DOCENTE,
      },
    };

    const url = `${import.meta.env.VITE_API_URL}${
      isRegistered
        ? ENDPOINTS_POST[rol].actualizar
        : ENDPOINTS_POST[rol].crear
    }`;

    try {
      await toast.promise(axiosInstance.post(url, formData), {
        pending: "Enviando datos...",
        success: "Antecedentes guardados con éxito",
        error: "Error al guardar antecedentes",
      });

      setIsRegistered(true);
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error al enviar antecedentes:", error);
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
              Cargando antecedentes...
            </p>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 sm:grid-cols-2 gap-6"
      >
        {/* INFORMACIÓN */}
        <div className="col-span-full p-4 border-l-8 rounded-lg border-red-500 bg-white">
          <div className="flex items-center gap-4">
            <ShieldCheck className="icono bg-gradient-to-br from-red-400 to-red-500" />
            <div>
              <h4>Antecedentes Judiciales</h4>
              <span className="description-text">
                Información de validación judicial
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
            <div>
              <InputLabel
                htmlFor="fecha_validacion"
                value="Fecha validación *"
              />
              <TextInput
                type="date"
                id="fecha_validacion"
                {...register("fecha_validacion")}
              />
              <InputErrors errors={errors} name="fecha_validacion" />
            </div>

            <div>
              <InputLabel
                htmlFor="estado_antecedentes"
                value="Estado *"
              />
              <SelectLocales
                id="estado_antecedentes"
                register={register("estado_antecedentes")}
              />
              <InputErrors
                errors={errors}
                name="estado_antecedentes"
              />
            </div>
          </div>
        </div>

        {/* ARCHIVO */}
        <div className="col-span-full p-4 border-l-8 rounded-lg border-gray-500 bg-white">
          <div className="flex items-center gap-4">
            <Paperclip className="icono bg-gradient-to-br from-gray-400 to-gray-500" />
            <div>
              <h4>Documento PDF</h4>
              <span className="description-text">
                Adjunte el certificado en PDF
              </span>
            </div>
          </div>

          <div className="mt-4">
            <AdjuntarArchivo
              id="archivo"
              register={register("archivo")}
              nombre="Antecedentes *"
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

export default AntecedentesJudiciales;