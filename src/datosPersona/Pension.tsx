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

import { RolesValidos } from "../types/roles";

import { Landmark, Paperclip } from "lucide-react";
import {
  pensionSchema,
  pensionSchemaUpdate,
} from "../validaciones/aspirante/pensionSchema";
import { SelectLocales } from "../componentes/formularios/SelectsLocales";

/* =============================
        TYPES
============================= */
type PensionProps = {
  onClose: () => void;
  onSuccess: () => void;
};

type Inputs = {
  regimen_pensional: string;
  entidad_pensional: string;
  nit_entidad: string;
  archivo?: FileList;
};

const Pension = ({ onClose, onSuccess }: PensionProps) => {
  const token = Cookies.get("token");
  // Sin token válido: cerrar el modal en lugar de lanzar una excepción no capturada
  if (!token) {
    onClose();
    return null;
  }

  const decoded = jwtDecode<{ rol: RolesValidos }>(token);
  const rol = decoded.rol;

  const [isPensionRegistered, setIsPensionRegistered] = useState(false);
  const [loading, setLoading] = useState(true);

  const schema = isPensionRegistered ? pensionSchemaUpdate : pensionSchema;

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
  const fetchPensionData = async () => {
    try {
      const ENDPOINTS = {
        Aspirante: import.meta.env.VITE_ENDPOINT_OBTENER_PENSION_ASPIRANTE,
        Docente: import.meta.env.VITE_ENDPOINT_OBTENER_PENSION_DOCENTE,
        Administrativo: import.meta.env.VITE_ENDPOINT_OBTENER_PENSION_DOCENTE,
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
    } finally {
      setLoading(false);
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
      Administrativo: {
        crear: import.meta.env.VITE_ENDPOINT_CREAR_PENSION_DOCENTE,
        actualizar: import.meta.env.VITE_ENDPOINT_ACTUALIZAR_PENSION_DOCENTE,
      },
    };

    const url = isPensionRegistered
      ? ENDPOINTS_POST[rol].actualizar
      : ENDPOINTS_POST[rol].crear;

    try {
      await toast.promise(axiosInstance.post(url, formData), {
        pending: "Enviando datos...",
        success: {
          render: () => {
            return "Datos de pensión guardados con éxito";
          },
        },
        error: "Error al guardar los datos de pensión",
      });
      setIsPensionRegistered(true);
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error al enviar pensión:", error);
    }
  };

  /* =============================
        RENDER
============================= */

  return (
    <div className="relative h-full">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-50 rounded-xl">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[rgba(30,58,95,0.1)] border-t-[#1e3a5f]"></div>
            <p className="text-[#2c3e50] font-medium">
              Cargando datos de pensión...
            </p>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 gap-6"
      >
        {/* INFORMACIÓN PENSIÓN */}
        <div className="col-span-full p-6 border border-[rgba(30,58,95,0.1)] rounded-xl bg-white shadow-[0_2px_10px_rgba(30,58,95,0.02)] transition-all">
          <div className="flex items-center gap-4 mb-5">
            <div className="p-3 rounded-lg bg-[rgba(30,58,95,0.05)] text-[#1e3a5f]">
              <Landmark size={24} />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-[#1e3a5f] tracking-tight">Información Pensional</h4>
              <span className="text-sm text-[#6b7a8d]">
                Datos de afiliación a pensión
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-5 border-t border-[rgba(30,58,95,0.05)]">
            <div className="col-span-full">
              <InputLabel htmlFor="regimen_pensional" value="Régimen *" />
              <SelectLocales
                id="regimen_pensional"
                register={register("regimen_pensional")}
              />
              <InputErrors errors={errors} name="regimen_pensional" />
            </div>

            <div>
              <InputLabel htmlFor="entidad_pensional" value="Entidad *" />
              <TextInput
                className="w-full"
                id="entidad_pensional"
                placeholder="Ej: Colpensiones, Porvenir, etc."
                {...register("entidad_pensional")}
              />
              <InputErrors errors={errors} name="entidad_pensional" />
            </div>

            <div>
              <InputLabel htmlFor="nit_entidad" value="NIT entidad *" />
              <TextInput
                className="w-full"
                id="nit_entidad"
                placeholder="Ej: 123456789-0"
                {...register("nit_entidad")}
              />
              <InputErrors errors={errors} name="nit_entidad" />
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
              <div>
                <h4 className="text-lg font-semibold text-[#1e3a5f] tracking-tight">Documento de pensión</h4>
                <span className="text-sm text-[#6b7a8d]">
                  Adjunte el PDF
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
              nombre="Pensión *"
            />
            <InputErrors errors={errors} name="archivo" />
            <div className="mt-4">
              <MostrarArchivo file={existingFile} />
            </div>
          </div>
        </div>

        {/* BOTÓN */}
        <div className="col-span-full mt-2 text-center md:text-right">
          <ButtonPrimary type="submit" value="Guardar" />
        </div>
      </form>
    </div>
  );
};

export default Pension;