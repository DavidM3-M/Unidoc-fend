import { useCallback } from "react";
import SesionValida from "../componentes/SesionValida";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { useEffect, useState } from "react";
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
import { Building, CalendarIcon, Paperclip } from "lucide-react";
import {
  bancoSchema,
  bancoSchemaUpdate,
} from "../validaciones/aspirante/certificacionBancariaSchema";
import { SelectLocales } from "../componentes/formularios/SelectsLocales";
import { SelectBanco } from "../componentes/formularios/SelectBanco";

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

export const CertificacionBancaria = (props: CertificacionBancariaProps) => (
  <SesionValida onInvalid={props.onClose}>{rol => <CertificacionBancariaContenido {...props} rol={rol} />}</SesionValida>
);

const CertificacionBancariaContenido = ({
  onClose,
  onSuccess, rol }: CertificacionBancariaProps & { rol: RolesValidos }) => {

  const [isBancoRegistered, setIsBancoRegistered] = useState(false);

  const schema = isBancoRegistered ? bancoSchemaUpdate : bancoSchema;
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
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
  const fetchBancoData = useCallback(async () => {
    setLoading(true);
    try {
      const ENDPOINTS = {
        Aspirante: import.meta.env.VITE_ENDPOINT_OBTENER_CERTIFICACION_BANCARIA_ASPIRANTE,
        Docente: import.meta.env.VITE_ENDPOINT_OBTENER_CERTIFICACION_BANCARIA_DOCENTE,
        Administrativo: import.meta.env.VITE_ENDPOINT_OBTENER_CERTIFICACION_BANCARIA_DOCENTE,
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
  }, [rol, setExistingFile, setValue]);

  useEffect(() => {
    fetchBancoData();
  }, [fetchBancoData]);

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
      Administrativo: {
        crear: import.meta.env
          .VITE_ENDPOINT_CREAR_CERTIFICACION_BANCARIA_DOCENTE,
        actualizar: import.meta.env
          .VITE_ENDPOINT_ACTUALIZAR_CERTIFICACION_BANCARIA_DOCENTE,
      },
    };

    const url = isBancoRegistered
      ? ENDPOINTS_POST[rol].actualizar
      : ENDPOINTS_POST[rol].crear;

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
    <div className="h-full relative">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-50 rounded-xl">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[rgba(30,58,95,0.1)] border-t-[#1e3a5f]"></div>
            <p className="text-[#2c3e50] font-medium">
              Cargando datos bancarios...
            </p>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 gap-6"
      >
        {/* INFORMACIÓN BANCARIA */}
        <div className="col-span-full p-6 border border-[rgba(30,58,95,0.1)] rounded-xl bg-white shadow-[0_2px_10px_rgba(30,58,95,0.02)] transition-all">
          <div className="flex items-center gap-4 mb-5">
            <div className="p-3 rounded-lg bg-[rgba(30,58,95,0.05)] text-[#1e3a5f]">
              <Building size={24} />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-[#1e3a5f] tracking-tight">Información bancaria</h4>
              <span className="text-sm text-[#6b7a8d]">
                Datos principales de su cuenta bancaria
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-5 border-t border-[rgba(30,58,95,0.05)]">
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
              <Controller
                name="nombre_banco"
                control={control}
                render={({ field }) => (
                  <SelectBanco
                    id="nombre_banco"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                  />
                )}
              />
              <InputErrors errors={errors} name="nombre_banco" />
            </div>
          </div>
        </div>

        {/* DATOS DE CUENTA */}
        <div className="col-span-full p-6 border border-[rgba(30,58,95,0.1)] rounded-xl bg-white shadow-[0_2px_10px_rgba(30,58,95,0.02)] transition-all">
          <div className="flex items-center gap-4 mb-5">
            <div className="p-3 rounded-lg bg-[rgba(30,58,95,0.05)] text-[#1e3a5f]">
              <CalendarIcon size={24} />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-[#1e3a5f] tracking-tight">Datos de la cuenta</h4>
              <span className="text-sm text-[#6b7a8d]">
                Número de cuenta y fecha de emisión
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-5 border-t border-[rgba(30,58,95,0.05)]">
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

        {/* ARCHIVO */}
        <div className="col-span-full p-6 border border-[rgba(30,58,95,0.1)] rounded-xl bg-white shadow-[0_2px_10px_rgba(30,58,95,0.02)] transition-all">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-5 w-full">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-[rgba(30,58,95,0.05)] text-[#6b7a8d]">
                <Paperclip size={24} />
              </div>
              <div className="flex flex-col items-start w-full">
                <h4 className="text-lg font-semibold text-[#1e3a5f] tracking-tight">Documento bancario</h4>
                <span className="text-sm text-[#6b7a8d]">
                  Adjunte el certificado bancario en PDF.
                </span>
              </div>
            </div>
            <span className="text-xs font-medium px-2.5 py-1 bg-[#1e3a5f]/10 text-[#1e3a5f] rounded-full self-start sm:self-auto">
              Requerido
            </span>
          </div>

          <div className="pt-5 border-t border-[rgba(30,58,95,0.05)]">
            <AdjuntarArchivo
              id="archivo"
              register={register("archivo")}
              nombre="Certificado bancario *"
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