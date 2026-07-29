import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { rutSchema, rutSchemaUpdate } from "../validaciones/rutSchema";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import { InputLabel } from "../componentes/formularios/InputLabel";
import TextInput from "../componentes/formularios/TextInput";
import InputErrors from "../componentes/formularios/InputErrors";
import { SelectForm } from "../componentes/formularios/SelectForm";
import { ButtonPrimary } from "../componentes/formularios/ButtonPrimary";
import { AdjuntarArchivo } from "../componentes/formularios/AdjuntarArchivo";
import { useArchivoPreview } from "../hooks/ArchivoPreview";
import { MostrarArchivo } from "../componentes/formularios/MostrarArchivo";
import { RolesValidos } from "../types/roles";
import axiosInstance from "../utils/axiosConfig";
import { jwtDecode } from "jwt-decode";
import { BadgePercent, FolderKanban, IdCard, Paperclip } from "lucide-react";

type Inputs = {
  numero_rut: string;
  razon_social: string;
  tipo_persona: string;
  codigo_ciiu: string;
  responsabilidades_tributarias: string;
  archivo?: FileList;
};
type RutProps = {
  onClose: () => void;
  onSuccess: () => void;
};

export const Rut = ({ onClose, onSuccess }: RutProps) => {
  const token = Cookies.get("token");
  // Sin token válido: cerrar el modal en lugar de lanzar una excepción no capturada
  if (!token) {
    onClose();
    return null;
  }
  const decoded = jwtDecode<{ rol: RolesValidos }>(token);
  const rol = decoded.rol;
  const [loading, setLoading] = useState(true);

  const [isRutRegistered, setIsRutRegistered] = useState(false);
  const schema = isRutRegistered ? rutSchemaUpdate : rutSchema;
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

  //Traer los datos del usuario al cargar el componente
  const fetchUserData = async () => {
    setLoading(true);
    try {
      const ENDPOINTS = {
        Aspirante: import.meta.env.VITE_ENDPOINT_OBTENER_RUT_ASPIRANTE,
        Docente: import.meta.env.VITE_ENDPOINT_OBTENER_RUT_DOCENTE,
        Administrativo: import.meta.env.VITE_ENDPOINT_OBTENER_RUT_DOCENTE,
      };
      const endpoint = ENDPOINTS[rol];
      const response = await axiosInstance.get(endpoint);
      const data = response.data.rut;
      if (data) {
        setIsRutRegistered(true);
        setValue("numero_rut", data.numero_rut);
        setValue("razon_social", data.razon_social);
        setValue("tipo_persona", data.tipo_persona);
        setValue("codigo_ciiu", data.codigo_ciiu);
        setValue(
          "responsabilidades_tributarias",
          data.responsabilidades_tributarias,
        );

        if (data.documentos_rut && data.documentos_rut.length > 0) {
          const archivo = data.documentos_rut[0];
          setExistingFile({
            url: archivo.archivo_url,
            name: archivo.archivo.split("/").pop() || "Archivo existente",
          });
        }
      } else {
        console.log("No se encontraron datos del RUT");
      }
    } catch (error) {
      console.error("Error al cargar los datos del usuario:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const onSubmit: SubmitHandler<Inputs> = async (data: Inputs) => {
    const formData = new FormData();
    formData.append("numero_rut", data.numero_rut);
    formData.append("razon_social", data.razon_social);
    formData.append("tipo_persona", data.tipo_persona);
    formData.append("codigo_ciiu", data.codigo_ciiu);
    formData.append(
      "responsabilidades_tributarias",
      data.responsabilidades_tributarias,
    );

    if (data.archivo && data.archivo.length > 0) {
      formData.append("archivo", data.archivo[0]);
    }

    // Agregar `_method` si es actualización
    if (isRutRegistered) {
      formData.append("_method", "PUT");
    }

    const ENDPOINTS_POST = {
      Aspirante: {
        crear: import.meta.env.VITE_ENDPOINT_CREAR_RUT_ASPIRANTE,
        actualizar: import.meta.env.VITE_ENDPOINT_ACTUALIZAR_RUT_ASPIRANTE,
      },
      Docente: {
        crear: import.meta.env.VITE_ENDPOINT_CREAR_RUT_DOCENTE,
        actualizar: import.meta.env.VITE_ENDPOINT_ACTUALIZAR_RUT_DOCENTE,
      },
      Administrativo: {
        crear: import.meta.env.VITE_ENDPOINT_CREAR_RUT_DOCENTE,
        actualizar: import.meta.env.VITE_ENDPOINT_ACTUALIZAR_RUT_DOCENTE,
      },
    };

    const url = isRutRegistered
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
      setIsRutRegistered(true);
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error al enviar los datos:", error);
    }
  };

  return (
    <div className="relative h-full">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-50 rounded-xl">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[rgba(30,58,95,0.1)] border-t-[#1e3a5f]"></div>
            <p className="text-[#2c3e50] font-medium">
              Cargando datos del RUT...
            </p>
          </div>
        </div>
      )}
      
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 gap-6"
      >
        {/* INFORMACIÓN PRINCIPAL DEL RUT */}
        <div className="col-span-full p-6 border border-[rgba(30,58,95,0.1)] rounded-xl bg-white shadow-[0_2px_10px_rgba(30,58,95,0.02)] transition-all">
          <div className="flex items-center gap-4 mb-5">
            <div className="p-3 rounded-lg bg-[rgba(30,58,95,0.05)] text-[#1e3a5f]">
              <IdCard size={24} />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-[#1e3a5f] tracking-tight">Información principal del RUT</h4>
              <span className="text-sm text-[#6b7a8d]">
                Datos generales identificatorios
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-5 border-t border-[rgba(30,58,95,0.05)]">
            <div>
              <InputLabel htmlFor="numero_rut" value="Número RUT *" />
              <TextInput
                className="w-full"
                id="numero_rut"
                type="text"
                placeholder="Número RUT..."
                {...register("numero_rut")}
              />
              <InputErrors errors={errors} name="numero_rut" />
            </div>

            <div>
              <InputLabel htmlFor="razon_social" value="Razón social *" />
              <TextInput
                className="w-full"
                id="razon_social"
                type="text"
                placeholder="Razón social..."
                {...register("razon_social")}
              />
              <InputErrors errors={errors} name="razon_social" />
            </div>
          </div>
        </div>

        {/* CLASIFICACIÓN Y ACTIVIDAD ECONÓMICA */}
        <div className="col-span-full p-6 border border-[rgba(30,58,95,0.1)] rounded-xl bg-white shadow-[0_2px_10px_rgba(30,58,95,0.02)] transition-all">
          <div className="flex items-center gap-4 mb-5">
            <div className="p-3 rounded-lg bg-[rgba(30,58,95,0.05)] text-[#1e3a5f]">
              <FolderKanban size={24} />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-[#1e3a5f] tracking-tight">Clasificación y actividad económica</h4>
              <span className="text-sm text-[#6b7a8d]">
                Naturaleza jurídica y actividad CIIU
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-5 border-t border-[rgba(30,58,95,0.05)]">
            <div>
              <InputLabel htmlFor="tipo_persona" value="Tipo de persona *" />
              <SelectForm
                id="tipo_persona"
                register={register("tipo_persona")}
                url="tipo-persona"
                data_url="tipo_persona"
              />
              <InputErrors errors={errors} name="tipo_persona" />
            </div>

            <div>
              <InputLabel htmlFor="codigo_ciiu" value="Código CIIU *" />
              <SelectForm
                id="codigo_ciiu"
                register={register("codigo_ciiu")}
                url="codigo-ciiu"
                data_url="codigo_ciiu"
              />
              <InputErrors errors={errors} name="codigo_ciiu" />
            </div>
          </div>
        </div>

        {/* RESPONSABILIDADES TRIBUTARIAS */}
        <div className="col-span-full p-6 border border-[rgba(30,58,95,0.1)] rounded-xl bg-white shadow-[0_2px_10px_rgba(30,58,95,0.02)] transition-all">
          <div className="flex items-center gap-4 mb-5">
            <div className="p-3 rounded-lg bg-[rgba(30,58,95,0.05)] text-[#1e3a5f]">
              <BadgePercent size={24} />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-[#1e3a5f] tracking-tight">Responsabilidades tributarias</h4>
              <span className="text-sm text-[#6b7a8d]">
                Obligaciones fiscales asociadas
              </span>
            </div>
          </div>

          <div className="pt-5 border-t border-[rgba(30,58,95,0.05)]">
            <InputLabel
              htmlFor="responsabilidades_tributarias"
              value="Responsabilidades tributarias *"
            />
            <TextInput
              className="w-full"
              id="responsabilidades_tributarias"
              type="text"
              placeholder="Responsabilidades tributarias..."
              {...register("responsabilidades_tributarias")}
            />
            <InputErrors errors={errors} name="responsabilidades_tributarias" />
          </div>
        </div>

        {/* ARCHIVO RUT */}
        <div className="col-span-full p-6 border border-[rgba(30,58,95,0.1)] rounded-xl bg-white shadow-[0_2px_10px_rgba(30,58,95,0.02)] transition-all">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-5 w-full">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-[rgba(30,58,95,0.05)] text-[#6b7a8d]">
                <Paperclip size={24} />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-[#1e3a5f] tracking-tight">Documento RUT</h4>
                <span className="text-sm text-[#6b7a8d]">
                  Adjunte el archivo PDF del RUT
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
              nombre="RUT"
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