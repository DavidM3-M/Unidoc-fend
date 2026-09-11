import { useCallback } from "react";
import SesionValida from "../componentes/SesionValida";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { epsSchema, epsSchemaUpdate } from "../validaciones/epsSchema";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { InputLabel } from "../componentes/formularios/InputLabel";
import { SelectForm } from "../componentes/formularios/SelectForm";
import InputErrors from "../componentes/formularios/InputErrors";
import TextInput from "../componentes/formularios/TextInput";
import { ButtonPrimary } from "../componentes/formularios/ButtonPrimary";
import { AdjuntarArchivo } from "../componentes/formularios/AdjuntarArchivo";
import { MostrarArchivo } from "../componentes/formularios/MostrarArchivo";
import { useArchivoPreview } from "../hooks/ArchivoPreview";
import axiosInstance from "../utils/axiosConfig";
import { RolesValidos } from "../types/roles";
import { CalendarIcon, IdCard, Paperclip, UserIcon } from "lucide-react";

type Inputs = {
  tipo_afiliacion: string;
  nombre_eps: string;
  estado_afiliacion: string;
  fecha_afiliacion_efectiva: string;
  fecha_finalizacion_afiliacion?: string;
  tipo_afiliado: string;
  archivo?: FileList;
};
type EpsProps = {
  onClose: () => void;
  onSuccess: () => void;
};

export const EpsFormulario = (props: EpsProps) => (
  <SesionValida onInvalid={props.onClose}>{rol => <EpsFormularioContenido {...props} rol={rol} />}</SesionValida>
);

const EpsFormularioContenido = ({ onClose, onSuccess, rol }: EpsProps & { rol: RolesValidos }) => {
  const [loading, setLoading] = useState(true);

  const [isEpsRegistered, setIsEpsRegistered] = useState(false);

  const schema = isEpsRegistered ? epsSchemaUpdate : epsSchema;

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

  // Traer los datos del usuario al cargar el componente
  const fetchEpsData = useCallback(async () => {
    setLoading(true);
    try {
      const ENDPOINTS = {
        Aspirante: import.meta.env.VITE_ENDPOINT_OBTENER_EPS_ASPIRANTE,
        Docente: import.meta.env.VITE_ENDPOINT_OBTENER_EPS_DOCENTE,
        Administrativo: import.meta.env.VITE_ENDPOINT_OBTENER_EPS_DOCENTE,
      };
      const endpoint = ENDPOINTS[rol];
      const response = await axiosInstance.get(endpoint);

      const data = response.data.eps;
      if (data) {
        setIsEpsRegistered(true);
        setValue("tipo_afiliacion", data.tipo_afiliacion || "");
        setValue("nombre_eps", data.nombre_eps || "");
        setValue("estado_afiliacion", data.estado_afiliacion || "");
        setValue(
          "fecha_afiliacion_efectiva",
          data.fecha_afiliacion_efectiva || "",
        );
        setValue(
          "fecha_finalizacion_afiliacion",
          data.fecha_finalizacion_afiliacion || "",
        );
        setValue("tipo_afiliado", data.tipo_afiliado || "");

        if (data.documentos_eps && data.documentos_eps.length > 0) {
          const archivo = data.documentos_eps[0];
          setExistingFile({
            url: archivo.archivo_url,
            name: archivo.archivo.split("/").pop() || "Archivo existente",
          });
        }
      } else {
        setIsEpsRegistered(false);
        console.log("No se encontraron datos de EPS para el usuario.");
      }
    } catch (error) {
      console.error("Error al cargar los datos del usuario:", error);
    } finally {
      setLoading(false);
    }
  }, [rol, setExistingFile, setValue]);

  useEffect(() => {
    fetchEpsData();
  }, [fetchEpsData]);

  // Enviar los datos del formulario
  const onSubmit: SubmitHandler<Inputs> = async (data: Inputs) => {
    const formData = new FormData();
    formData.append("tipo_afiliacion", data.tipo_afiliacion);
    formData.append("nombre_eps", data.nombre_eps);
    formData.append("estado_afiliacion", data.estado_afiliacion);
    formData.append(
      "fecha_afiliacion_efectiva",
      data.fecha_afiliacion_efectiva,
    );
    formData.append(
      "fecha_finalizacion_afiliacion",
      data.fecha_finalizacion_afiliacion || "",
    );
    formData.append("tipo_afiliado", data.tipo_afiliado);

    if (data.archivo && data.archivo.length > 0) {
      formData.append("archivo", data.archivo[0]);
    }

    // Agregar `_method` si es actualización
    if (isEpsRegistered) {
      formData.append("_method", "PUT");
    }
    const ENDPOINTS_POST = {
      Aspirante: {
        crear: import.meta.env.VITE_ENDPOINT_CREAR_EPS_ASPIRANTE,
        actualizar: import.meta.env.VITE_ENDPOINT_ACTUALIZAR_EPS_ASPIRANTE,
      },
      Docente: {
        crear: import.meta.env.VITE_ENDPOINT_CREAR_EPS_DOCENTE,
        actualizar: import.meta.env.VITE_ENDPOINT_ACTUALIZAR_EPS_DOCENTE,
      },
      Administrativo: {
        crear: import.meta.env.VITE_ENDPOINT_CREAR_EPS_DOCENTE,
        actualizar: import.meta.env.VITE_ENDPOINT_ACTUALIZAR_EPS_DOCENTE,
      },
    };

    const url = isEpsRegistered
      ? ENDPOINTS_POST[rol].actualizar
      : ENDPOINTS_POST[rol].crear;

    try {
      await toast.promise(axiosInstance.post(url, formData), {
        pending: "Enviando datos...",
        success: {
          render() {
            return "Datos guardados correctamente";
          },
        },
        error: "Error al guardar los datos",
      });
      setIsEpsRegistered(true);
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error al enviar el formulario:", error);
    }
  };

  return (
    <div className="relative h-full">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-50 rounded-xl">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[rgba(30,58,95,0.1)] border-t-[#1e3a5f]"></div>
            <p className="text-[#2c3e50] font-medium">
              Cargando datos de EPS...
            </p>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 gap-6"
      >
        {/* INFORMACIÓN DE EPS */}
        <div className="col-span-full p-6 border border-[rgba(30,58,95,0.1)] rounded-xl bg-white shadow-[0_2px_10px_rgba(30,58,95,0.02)] transition-all">
          <div className="flex items-center gap-4 mb-5">
            <div className="p-3 rounded-lg bg-[rgba(30,58,95,0.05)] text-[#1e3a5f]">
              <IdCard size={24} />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-[#1e3a5f] tracking-tight">Información de afiliación EPS</h4>
              <span className="text-sm text-[#6b7a8d]">
                Datos principales sobre su afiliación
              </span>
            </div>
          </div>

          {/* Campos */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-5 border-t border-[rgba(30,58,95,0.05)]">
            <div>
              <InputLabel
                htmlFor="tipo_afiliacion"
                value="Tipo de afiliación *"
              />
              <SelectForm
                id="tipo_afiliacion"
                register={register("tipo_afiliacion")}
                url="tipo-afiliacion"
                data_url="tipo_afiliacion_eps"
              />
              <InputErrors errors={errors} name="tipo_afiliacion" />
            </div>

            <div className="sm:col-span-2">
              <InputLabel htmlFor="nombre_eps" value="Nombre EPS *" />
              <TextInput
                id="nombre_eps"
                {...register("nombre_eps")}
                placeholder="Nombre de EPS..."
              />
              <InputErrors errors={errors} name="nombre_eps" />
            </div>
          </div>
        </div>

        {/* ESTADO Y FECHAS */}
        <div className="col-span-full p-6 border border-[rgba(30,58,95,0.1)] rounded-xl bg-white shadow-[0_2px_10px_rgba(30,58,95,0.02)] transition-all">
          <div className="flex items-center gap-4 mb-5">
            <div className="p-3 rounded-lg bg-[rgba(30,58,95,0.05)] text-[#1e3a5f]">
              <CalendarIcon size={24} />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-[#1e3a5f] tracking-tight">Estado y fechas de afiliación</h4>
              <span className="text-sm text-[#6b7a8d]">
                Información temporal sobre su afiliación EPS
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-5 border-t border-[rgba(30,58,95,0.05)]">
            <div>
              <InputLabel
                htmlFor="estado_afiliacion"
                value="Estado de afiliación *"
              />
              <SelectForm
                id="estado_afiliacion"
                register={register("estado_afiliacion")}
                url="estado-afiliacion"
                data_url="estado_afiliacion_eps"
              />
              <InputErrors errors={errors} name="estado_afiliacion" />
            </div>

            <div>
              <InputLabel
                htmlFor="fecha_afiliacion_efectiva"
                value="Fecha afiliación efectiva *"
              />
              <TextInput
                type="date"
                id="fecha_afiliacion_efectiva"
                {...register("fecha_afiliacion_efectiva")}
              />
              <InputErrors errors={errors} name="fecha_afiliacion_efectiva" />
            </div>

            <div>
              <InputLabel
                htmlFor="fecha_finalizacion_afiliacion"
                value="Fecha finalización afiliación"
              />
              <TextInput
                type="date"
                id="fecha_finalizacion_afiliacion"
                {...register("fecha_finalizacion_afiliacion")}
              />
              <InputErrors
                errors={errors}
                name="fecha_finalizacion_afiliacion"
              />
            </div>
          </div>
        </div>

        {/* TIPO Y NÚMERO AFILIADO */}
        <div className="col-span-full p-6 border border-[rgba(30,58,95,0.1)] rounded-xl bg-white shadow-[0_2px_10px_rgba(30,58,95,0.02)] transition-all">
          <div className="flex items-center gap-4 mb-5">
            <div className="p-3 rounded-lg bg-[rgba(30,58,95,0.05)] text-[#1e3a5f]">
              <UserIcon size={24} />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-[#1e3a5f] tracking-tight">Información del afiliado</h4>
              <span className="text-sm text-[#6b7a8d]">
                Tipo de afiliado
              </span>
            </div>
          </div>

          <div className="grid gap-6 pt-5 border-t border-[rgba(30,58,95,0.05)]">
            <div>
              <InputLabel htmlFor="tipo_afiliado" value="Tipo afiliado *" />
              <SelectForm
                id="tipo_afiliado"
                register={register("tipo_afiliado")}
                url="tipo-afiliado"
                data_url="tipo_afiliado_eps"
              />
              <InputErrors errors={errors} name="tipo_afiliado" />
            </div>
          </div>
        </div>

        {/* ARCHIVO EPS */}
        <div className="col-span-full p-6 border border-[rgba(30,58,95,0.1)] rounded-xl bg-white shadow-[0_2px_10px_rgba(30,58,95,0.02)] transition-all">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-5 w-full">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-[rgba(30,58,95,0.05)] text-[#6b7a8d]">
                <Paperclip size={24} />
              </div>
              <div className="flex flex-col items-start w-full">
                <h4 className="text-lg font-semibold text-[#1e3a5f] tracking-tight">Documento EPS</h4>
                <span className="text-sm text-[#6b7a8d]">
                  Adjunte su archivo en PDF como soporte de afiliación.
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
              nombre="EPS *"
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