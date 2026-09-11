import { useCallback } from "react";
import SesionValida from "../componentes/SesionValida";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
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

const AntecedentesJudiciales = (props: AntecedentesProps) => (
  <SesionValida onInvalid={props.onClose}>{rol => <AntecedentesJudicialesContenido {...props} rol={rol} />}</SesionValida>
);

const AntecedentesJudicialesContenido = ({
  onClose,
  onSuccess, rol }: AntecedentesProps & { rol: RolesValidos }) => {

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
  const { existingFile, setExistingFile } = useArchivoPreview(archivoValue);

  /* =============================
        FETCH DATA
  ============================= */
  const fetchData = useCallback(async () => {
    try {
      const ENDPOINTS = {
        Aspirante: import.meta.env.VITE_ENDPOINT_OBTENER_ANTECEDENTES_JUDICIALES_ASPIRANTE,
        Docente: import.meta.env.VITE_ENDPOINT_OBTENER_ANTECEDENTES_JUDICIALES_DOCENTE,
        Administrativo: import.meta.env.VITE_ENDPOINT_OBTENER_ANTECEDENTES_JUDICIALES_DOCENTE,
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
  }, [rol, setExistingFile, setValue]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
        crear: import.meta.env.VITE_ENDPOINT_CREAR_ANTECEDENTES_JUDICIALES_ASPIRANTE,
        actualizar: import.meta.env.VITE_ENDPOINT_ACTUALIZAR_ANTECEDENTES_JUDICIALES_ASPIRANTE,
      },
      Docente: {
        crear: import.meta.env.VITE_ENDPOINT_CREAR_ANTECEDENTES_JUDICIALES_DOCENTE,
        actualizar: import.meta.env.VITE_ENDPOINT_ACTUALIZAR_ANTECEDENTES_JUDICIALES_DOCENTE,
      },
      Administrativo: {
        crear: import.meta.env.VITE_ENDPOINT_CREAR_ANTECEDENTES_JUDICIALES_DOCENTE,
        actualizar: import.meta.env.VITE_ENDPOINT_ACTUALIZAR_ANTECEDENTES_JUDICIALES_DOCENTE,
      },
    };

    const url = isRegistered
      ? ENDPOINTS_POST[rol].actualizar
      : ENDPOINTS_POST[rol].crear;

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
    <div className="h-full relative">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-50 rounded-xl">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[rgba(30,58,95,0.1)] border-t-[#1e3a5f]"></div>
            <p className="text-[#2c3e50] font-medium">
              Cargando antecedentes...
            </p>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 gap-6"
      >
        {/* INFORMACIÓN */}
        <div className="col-span-full p-6 border border-[rgba(30,58,95,0.1)] rounded-xl bg-white shadow-[0_2px_10px_rgba(30,58,95,0.02)] transition-all">
          <div className="flex items-center gap-4 mb-5">
            <div className="p-3 rounded-lg bg-[rgba(30,58,95,0.05)] text-[#1e3a5f]">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-[#1e3a5f] tracking-tight">Antecedentes Judiciales</h4>
              <span className="text-sm text-[#6b7a8d]">
                Información de validación judicial
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-5 border-t border-[rgba(30,58,95,0.05)]">
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
        <div className="col-span-full p-6 border border-[rgba(30,58,95,0.1)] rounded-xl bg-white shadow-[0_2px_10px_rgba(30,58,95,0.02)] transition-all">
          <div className="flex items-center gap-4 mb-5">
            <div className="p-3 rounded-lg bg-[rgba(30,58,95,0.05)] text-[#6b7a8d]">
              <Paperclip size={24} />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-[#1e3a5f] tracking-tight">Documento PDF</h4>
              <span className="text-sm text-[#6b7a8d]">
                Adjunte el certificado en PDF
              </span>
            </div>
          </div>

          <div className="pt-5 border-t border-[rgba(30,58,95,0.05)]">
            <AdjuntarArchivo
              id="archivo"
              register={register("archivo")}
              nombre="Antecedentes *"
            />
            <InputErrors errors={errors} name="archivo" />
            <div className="mt-4">
              <MostrarArchivo file={existingFile} />
            </div>
          </div>
        </div>

        <div className="col-span-full mt-2 text-center md:text-right">
          <ButtonPrimary type="submit" value="Guardar" />
        </div>
      </form>
    </div>
  );
};

export default AntecedentesJudiciales;