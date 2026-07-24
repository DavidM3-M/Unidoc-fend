import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import axios from "axios";
import { SubmitHandler, useForm } from "react-hook-form";
import { InputLabel } from "../componentes/formularios/InputLabel";
import { SelectForm } from "../componentes/formularios/SelectForm";
import InputErrors from "../componentes/formularios/InputErrors";
import TextInput from "../componentes/formularios/TextInput";
import { ButtonPrimary } from "../componentes/formularios/ButtonPrimary";
import { zodResolver } from "@hookform/resolvers/zod";
import { AdjuntarArchivo } from "../componentes/formularios/AdjuntarArchivo";
import { MostrarArchivo } from "../componentes/formularios/MostrarArchivo";
import { useArchivoPreview } from "../hooks/ArchivoPreview";
import { SelectFormUbicaciones } from "../componentes/formularios/SelectFormUbicacion";
import {
  informacionContacto,
  informacionContactoUpdate,
} from "../validaciones/informacionPersonaSchema";
import axiosInstance from "../utils/axiosConfig";
import { RolesValidos } from "../types/roles";
import { jwtDecode } from "jwt-decode";
import { Home, IdCard, MapPin, Paperclip, Phone } from "lucide-react";

export type Inputs = {
  categoria_libreta_militar: string;
  telefono_movil: string;
  pais: number;
  departamento: number;
  municipio_id: number;
  correo_alterno?: string;
  numero_libreta_militar?: string;
  numero_distrito_militar?: string;
  direccion_residencia?: string;
  barrio?: string;
  celular_alternativo?: string;
  archivo?: FileList;
};
type InformacionContactoProps = {
  onClose: () => void;
  onSuccess: () => void;
};

export const InformacionContacto = ({
  onClose,
  onSuccess,
}: InformacionContactoProps) => {
  const token = Cookies.get("token");
  // Sin token válido: cerrar el modal en lugar de lanzar una excepción no capturada
  if (!token) {
    onClose();
    return null;
  }
  const decoded = jwtDecode<{ rol: RolesValidos }>(token);
  const rol = decoded.rol;
  const [loading, setLoading] = useState(true);

  const [isInformacion, setInformacion] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<Inputs>({
    resolver: (values, context, options) =>
      zodResolver(
        isInformacion
          ? informacionContactoUpdate(!!existingFile)
          : informacionContacto,
      )(values, context, options),
  });

  const archivoValue = watch("archivo");
  const { existingFile, setExistingFile } = useArchivoPreview(archivoValue);

  const fetchInformacionContacto = async () => {
    setLoading(true);
    const API = import.meta.env.VITE_API_URL;
    try {
      const ENDPOINTS = {
        Aspirante: import.meta.env.VITE_ENDPOINT_OBTENER_INFORMACION_CONTACTO_ASPIRANTE,
        Docente: import.meta.env.VITE_ENDPOINT_OBTENER_INFORMACION_CONTACTO_DOCENTE,
        Administrativo: import.meta.env.VITE_ENDPOINT_OBTENER_INFORMACION_CONTACTO_DOCENTE,
      };
      const endpoint = ENDPOINTS[rol];
      const respInformacionContact = await axiosInstance.get(endpoint);

      const informacion = respInformacionContact.data.informacion_contacto;
      if (informacion) {
        setInformacion(true);
        setValue(
          "categoria_libreta_militar",
          informacion.categoria_libreta_militar || "",
        );
        setValue(
          "numero_libreta_militar",
          informacion.numero_libreta_militar || "",
        );
        setValue(
          "numero_distrito_militar",
          informacion.numero_distrito_militar || "",
        );
        setValue(
          "direccion_residencia",
          informacion.direccion_residencia || "",
        );
        setValue("barrio", informacion.barrio || "");
        setValue("telefono_movil", informacion.telefono_movil || "");
        setValue("celular_alternativo", informacion.celular_alternativo || "");
        setValue("correo_alterno", informacion.correo_alterno || "");
        setValue("archivo", new DataTransfer().files);

        if (
          informacion.documentos_informacion_contacto &&
          informacion.documentos_informacion_contacto.length > 0
        ) {
          const archivo = informacion.documentos_informacion_contacto[0];
          setExistingFile({
            url: archivo.archivo_url,
            name: archivo.archivo.split("/").pop() || "Archivo existente",
          });
        }

        if (informacion.municipio_id) {
          const respUbic = await axiosInstance.get(
            `/ubicaciones/municipio/${informacion.municipio_id}`,
          );
          const ubic = respUbic.data;
          await new Promise((resolve) => setTimeout(resolve, 500));
          setValue("pais", ubic.pais_id);
          await new Promise((resolve) => setTimeout(resolve, 500));
          setValue("departamento", ubic.departamento_id);
          await new Promise((resolve) => setTimeout(resolve, 1000));
          setValue("municipio_id", ubic.municipio_id);
        }
      } else {
        setInformacion(false);
        console.log("No hay información de contacto disponible.");
      }
    } catch (error) {
      console.error("Error al obtener la información de contacto:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInformacionContacto();
  }, []);

  const onSubmit: SubmitHandler<Inputs> = async (data: Inputs) => {
    const formData = new FormData();

    formData.append("municipio_id", data.municipio_id.toString());
    formData.append(
      "categoria_libreta_militar",
      data.categoria_libreta_militar || "",
    );
    formData.append(
      "numero_libreta_militar",
      data.numero_libreta_militar || "",
    );
    formData.append(
      "numero_distrito_militar",
      data.numero_distrito_militar || "",
    );
    formData.append("direccion_residencia", data.direccion_residencia || "");
    formData.append("barrio", data.barrio || "");
    formData.append("telefono_movil", data.telefono_movil);
    formData.append("celular_alternativo", data.celular_alternativo || "");
    formData.append("correo_alterno", data.correo_alterno || "");

    if (data.archivo && data.archivo.length > 0) {
      formData.append("archivo", data.archivo[0]);
    }

    if (isInformacion) {
      formData.append("_method", "PUT");
    }
    const ENDPOINTS_POST = {
      Aspirante: {
        crear: import.meta.env.VITE_ENDPOINT_CREAR_INFORMACION_CONTACTO_ASPIRANTE,
        actualizar: import.meta.env.VITE_ENDPOINT_ACTUALIZAR_INFORMACION_CONTACTO_ASPIRANTE,
      },
      Docente: {
        crear: import.meta.env.VITE_ENDPOINT_CREAR_INFORMACION_CONTACTO_DOCENTE,
        actualizar: import.meta.env.VITE_ENDPOINT_ACTUALIZAR_INFORMACION_CONTACTO_DOCENTE,
      },
      Administrativo: {
        crear: import.meta.env.VITE_ENDPOINT_CREAR_INFORMACION_CONTACTO_DOCENTE,
        actualizar: import.meta.env.VITE_ENDPOINT_ACTUALIZAR_INFORMACION_CONTACTO_DOCENTE,
      },
    };

    const url = isInformacion
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
        error: {
          render({ data }) {
            if (axios.isAxiosError(data)) {
              return (
                data.response?.data.message || "Error al guardar los datos"
              );
            }
            return "Error al guardar los datos";
          },
        },
      });
      setInformacion(true);
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error al enviar el formulario:", error);
    }
  };

  const departamentoSeleccionado = watch("departamento");
  const noTiene = "No tiene";
  const categoriaLibretaMilitar = watch("categoria_libreta_militar");

  useEffect(() => {
    if (categoriaLibretaMilitar === noTiene) {
      setValue("numero_libreta_militar", "");
      setValue("numero_distrito_militar", "");
      setValue("archivo", new DataTransfer().files);
      setExistingFile(null);
    }
  }, [categoriaLibretaMilitar, setValue, setExistingFile]);

  return (
    <div className="relative h-full">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-50 rounded-xl">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[rgba(30,58,95,0.1)] border-t-[#1e3a5f]"></div>
            <p className="text-[#2c3e50] font-medium">
              Cargando información de contacto...
            </p>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 gap-6"
      >
        {/* UBICACIÓN DE RESIDENCIA */}
        <div className="col-span-full p-6 border border-[rgba(30,58,95,0.1)] rounded-xl bg-white shadow-[0_2px_10px_rgba(30,58,95,0.02)] transition-all">
          <div className="flex items-center gap-4 mb-5">
            <div className="p-3 rounded-lg bg-[rgba(30,58,95,0.05)] text-[#1e3a5f]">
              <MapPin size={24} />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-[#1e3a5f] tracking-tight">Ubicación de residencia</h4>
              <span className="text-sm text-[#6b7a8d]">
                Seleccione su ubicación actual
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-5 border-t border-[rgba(30,58,95,0.05)]">
            <div>
              <InputLabel htmlFor="pais" value="País *" />
              <SelectFormUbicaciones
                id="pais"
                register={register("pais", {
                  valueAsNumber: true,
                  required: true,
                })}
                url="paises"
              />
              <InputErrors errors={errors} name="pais" />
            </div>

            <div>
              <InputLabel htmlFor="departamento" value="Departamento *" />
              <SelectFormUbicaciones
                id="departamento"
                register={register("departamento", {
                  valueAsNumber: true,
                  required: true,
                })}
                url="departamentos"
              />
              <InputErrors errors={errors} name="departamento" />
            </div>

            <div>
              <InputLabel htmlFor="municipio_id" value="Municipio *" />
              <SelectFormUbicaciones
                id="municipio_id"
                register={register("municipio_id", {
                  valueAsNumber: true,
                  required: true,
                })}
                url="municipios"
                parentId={departamentoSeleccionado}
              />
              <InputErrors errors={errors} name="municipio_id" />
            </div>
          </div>
        </div>

        {/* LIBRETA MILITAR */}
        <div className="col-span-full p-6 border border-[rgba(30,58,95,0.1)] rounded-xl bg-white shadow-[0_2px_10px_rgba(30,58,95,0.02)] transition-all">
          <div className="flex items-center gap-4 mb-5">
            <div className="p-3 rounded-lg bg-[rgba(30,58,95,0.05)] text-[#1e3a5f]">
              <IdCard size={24} />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-[#1e3a5f] tracking-tight">Información de libreta militar</h4>
              <span className="text-sm text-[#6b7a8d]">
                Complete esta sección si aplica
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-5 border-t border-[rgba(30,58,95,0.05)]">
            <div>
              <InputLabel
                htmlFor="categoria_libreta_militar"
                value="Categoría libreta militar *"
              />
              <SelectForm
                id="categoria_libreta_militar"
                register={register("categoria_libreta_militar")}
                url="categoria-libreta-militar"
                data_url="tipo_libreta_militar"
              />
              <InputErrors errors={errors} name="categoria_libreta_militar" />
            </div>

            {watch("categoria_libreta_militar") !== noTiene && (
              <>
                <div>
                  <InputLabel
                    htmlFor="numero_libreta_militar"
                    value="Número libreta militar"
                  />
                  <TextInput
                    className="w-full"
                    id="numero_libreta_militar"
                    type="text"
                    placeholder="Número libreta militar..."
                    {...register("numero_libreta_militar")}
                  />
                  <InputErrors errors={errors} name="numero_libreta_militar" />
                </div>

                <div>
                  <InputLabel
                    htmlFor="numero_distrito_militar"
                    value="Número distrito militar"
                  />
                  <TextInput
                    className="w-full"
                    id="numero_distrito_militar"
                    type="text"
                    placeholder="Número distrito militar..."
                    {...register("numero_distrito_militar")}
                  />
                  <InputErrors errors={errors} name="numero_distrito_militar" />
                </div>
              </>
            )}
          </div>
        </div>

        {/* DIRECCIÓN */}
        <div className="col-span-full p-6 border border-[rgba(30,58,95,0.1)] rounded-xl bg-white shadow-[0_2px_10px_rgba(30,58,95,0.02)] transition-all">
          <div className="flex items-center gap-4 mb-5">
            <div className="p-3 rounded-lg bg-[rgba(30,58,95,0.05)] text-[#1e3a5f]">
              <Home size={24} />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-[#1e3a5f] tracking-tight">Dirección de residencia</h4>
              <span className="text-sm text-[#6b7a8d]">
                Datos exactos del lugar donde vive
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-5 border-t border-[rgba(30,58,95,0.05)]">
            <div>
              <InputLabel htmlFor="direccion_residencia" value="Dirección *" />
              <TextInput
                className="w-full"
                id="direccion_residencia"
                type="text"
                placeholder="Dirección de residencia..."
                {...register("direccion_residencia")}
              />
              <InputErrors errors={errors} name="direccion_residencia" />
            </div>

            <div>
              <InputLabel htmlFor="barrio" value="Barrio" />
              <TextInput
                className="w-full"
                id="barrio"
                type="text"
                placeholder="Barrio..."
                {...register("barrio")}
              />
              <InputErrors errors={errors} name="barrio" />
            </div>
          </div>
        </div>

        {/* CONTACTO */}
        <div className="col-span-full p-6 border border-[rgba(30,58,95,0.1)] rounded-xl bg-white shadow-[0_2px_10px_rgba(30,58,95,0.02)] transition-all">
          <div className="flex items-center gap-4 mb-5">
            <div className="p-3 rounded-lg bg-[rgba(30,58,95,0.05)] text-[#1e3a5f]">
              <Phone size={24} />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-[#1e3a5f] tracking-tight">Información de contacto</h4>
              <span className="text-sm text-[#6b7a8d]">
                Teléfonos y correo alternativo
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-5 border-t border-[rgba(30,58,95,0.05)]">
            <div>
              <InputLabel htmlFor="telefono_movil" value="Teléfono móvil *" />
              <TextInput
                className="w-full"
                id="telefono_movil"
                type="number"
                placeholder="Teléfono..."
                {...register("telefono_movil")}
              />
              <InputErrors errors={errors} name="telefono_movil" />
            </div>

            <div>
              <InputLabel
                htmlFor="celular_alternativo"
                value="Celular alternativo"
              />
              <TextInput
                className="w-full"
                id="celular_alternativo"
                type="number"
                placeholder="Celular alternativo..."
                {...register("celular_alternativo")}
              />
              <InputErrors errors={errors} name="celular_alternativo" />
            </div>

            <div>
              <InputLabel htmlFor="correo_alterno" value="Correo alternativo" />
              <TextInput
                className="w-full"
                id="correo_alterno"
                type="email"
                placeholder="Correo alternativo..."
                {...register("correo_alterno")}
              />
              <InputErrors errors={errors} name="correo_alterno" />
            </div>
          </div>
        </div>

        {/* ARCHIVO LIBRETA MILITAR */}
        {watch("categoria_libreta_militar") !== noTiene && (
          <div className="col-span-full p-6 border border-[rgba(30,58,95,0.1)] rounded-xl bg-white shadow-[0_2px_10px_rgba(30,58,95,0.02)] transition-all">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-5 w-full">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-[rgba(30,58,95,0.05)] text-[#6b7a8d]">
                  <Paperclip size={24} />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-[#1e3a5f] tracking-tight">Documento de libreta militar</h4>
                  <span className="text-sm text-[#6b7a8d]">
                    Adjunte su archivo en PDF
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
                nombre="libreta militar"
              />
              <InputErrors errors={errors} name="archivo" />
              <div className="mt-4">
                <MostrarArchivo file={existingFile} />
              </div>
            </div>
          </div>
        )}

        {/* BOTÓN */}
        <div className="col-span-full mt-2 text-center md:text-right">
          <ButtonPrimary type="submit" value="Guardar" />
        </div>
      </form>
    </div>
  );
};