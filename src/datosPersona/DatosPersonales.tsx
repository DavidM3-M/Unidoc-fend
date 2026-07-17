import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { InputLabel } from "../componentes/formularios/InputLabel";
import { SelectForm } from "../componentes/formularios/SelectForm";
import InputErrors from "../componentes/formularios/InputErrors";
import TextInput from "../componentes/formularios/TextInput";
import { LabelRadio } from "../componentes/formularios/LabelRadio";
import { ButtonPrimary } from "../componentes/formularios/ButtonPrimary";
import Cookies from "js-cookie";
import { userSchemaUpdate } from "../validaciones/datosPersonaSchema";
import { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosConfig";
import { AdjuntarArchivo } from "../componentes/formularios/AdjuntarArchivo";
import { SelectFormUbicaciones } from "../componentes/formularios/SelectFormUbicacion";
import { MostrarArchivo } from "../componentes/formularios/MostrarArchivo";
import { useArchivoPreview } from "../hooks/ArchivoPreview";
import { Calendar, IdCard, MapPin, Paperclip, User } from "lucide-react";

export type Inputs = {
  primer_nombre: string;
  segundo_nombre?: string;
  primer_apellido: string;
  segundo_apellido?: string;
  fecha_nacimiento: string;
  genero: "Masculino" | "Femenino" | "Otro";
  estado_civil: string;
  tipo_identificacion: string;
  numero_identificacion: string;
  pais: number;
  departamento: number;
  municipio_id: number;
  archivo?: FileList;
};
type DatosPersonalesProps = {
  onClose: () => void;
  onSuccess: () => void;
};

export const DatosPersonales = ({
  onClose,
  onSuccess,
}: DatosPersonalesProps) => {
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<Inputs>({
    resolver: zodResolver(userSchemaUpdate),
  });

  const fetchDatosPersonales = async () => {
    setLoading(true);
    try {
      const respUser = await axiosInstance.get(
        '/auth/obtener-usuario-autenticado',
      );

      const user = respUser.data.user;

      if (user) {
        setValue("tipo_identificacion", user.tipo_identificacion);
        setValue("numero_identificacion", user.numero_identificacion);
        setValue("primer_nombre", user.primer_nombre);
        setValue("segundo_nombre", user.segundo_nombre || "");
        setValue("primer_apellido", user.primer_apellido);
        setValue("segundo_apellido", user.segundo_apellido || "");
        setValue("fecha_nacimiento", user.fecha_nacimiento);
        setValue("genero", user.genero);
        setValue("estado_civil", user.estado_civil);

        if (user.documentos_user && user.documentos_user.length > 0) {
          const archivo = user.documentos_user[0];
          setExistingFile({
            url: archivo.archivo_url,
            name: archivo.archivo.split("/").pop() || "Archivo existente",
          });
        }

        if (user.municipio_id) {
          const respUbic = await axiosInstance.get(
            `/ubicaciones/municipio/${user.municipio_id}`,
            {
              headers: { Authorization: `Bearer ${Cookies.get("token")}` },
            },
          );
          const ubic = respUbic.data;
          await new Promise((resolve) => setTimeout(resolve, 500));
          setValue("pais", ubic.pais_id);
          await new Promise((resolve) => setTimeout(resolve, 500));
          setValue("departamento", ubic.departamento_id);
          await new Promise((resolve) => setTimeout(resolve, 600));
          setValue("municipio_id", ubic.municipio_id);
        }
      }
    } catch (error) {
      console.error("Error al obtener los datos personales:", error);
    } finally {
      setLoading(false);
    }
  };

  const archivoValue = watch("archivo");

  const { existingFile, setExistingFile } = useArchivoPreview(archivoValue);

  useEffect(() => {
    fetchDatosPersonales();
    // fetchDatosPersonales se define dentro del componente pero no cambia entre renders; se omite de deps intencionalmente
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Obtener los valores del formulario y enviarlos a la API
  const onSubmit: SubmitHandler<Inputs> = async (data: Inputs) => {
    //crear formdata para enviar a la API

    const formData = new FormData();
    formData.append("tipo_identificacion", data.tipo_identificacion);
    formData.append("numero_identificacion", data.numero_identificacion);
    formData.append("primer_nombre", data.primer_nombre);
    formData.append("segundo_nombre", data.segundo_nombre || "");
    formData.append("primer_apellido", data.primer_apellido);
    formData.append("segundo_apellido", data.segundo_apellido || "");
    formData.append("fecha_nacimiento", data.fecha_nacimiento);
    formData.append("genero", data.genero);
    formData.append("estado_civil", data.estado_civil);
    formData.append("municipio_id", data.municipio_id.toString());

    if (data.archivo && data.archivo.length > 0) {
      formData.append("archivo", data.archivo[0]);
    }

    const token = Cookies.get("token");

    const url = '/auth/actualizar-usuario';

    try {
      await toast.promise(
        axiosInstance.post(url, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
          timeout: 10000,
        }),
        {
          pending: "Enviando datos...",
          success: "Datos guardados correctamente",
          error: "Error al guardar los datos",
        },
      );
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error al enviar los datos:", error);
    }
  };

  const departamentoSeleccionado = watch("departamento");

  return (
    <div className="relative h-full">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-50 rounded-xl">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[rgba(30,58,95,0.1)] border-t-[#1e3a5f]"></div>
            <p className="text-[#2c3e50] font-medium">
              Cargando datos personales...
            </p>
          </div>
        </div>
      )}
      
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 gap-6"
      >
        {/* UBICACIÓN */}
        <div className="col-span-full p-6 border border-[rgba(30,58,95,0.1)] rounded-xl bg-white shadow-[0_2px_10px_rgba(30,58,95,0.02)] transition-all">
          <div className="flex items-center gap-4 mb-5">
            <div className="p-3 rounded-lg bg-[rgba(30,58,95,0.05)] text-[#1e3a5f]">
              <MapPin size={24} />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-[#1e3a5f] tracking-tight">Ubicación de nacimiento</h4>
              <span className="text-sm text-[#6b7a8d]">
                Complete la información de origen
              </span>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-6 pt-5 border-t border-[rgba(30,58,95,0.05)]">
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

        {/* IDENTIFICACIÓN */}
        <div className="col-span-full p-6 border border-[rgba(30,58,95,0.1)] rounded-xl bg-white shadow-[0_2px_10px_rgba(30,58,95,0.02)] transition-all">
          <div className="flex items-center gap-4 mb-5">
            <div className="p-3 rounded-lg bg-[rgba(30,58,95,0.05)] text-[#1e3a5f]">
              <IdCard size={24} />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-[#1e3a5f] tracking-tight">Identificación personal</h4>
              <span className="text-sm text-[#6b7a8d]">
                Complete los datos documentales requeridos
              </span>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 pt-5 border-t border-[rgba(30,58,95,0.05)]">
            <div>
              <InputLabel
                htmlFor="tipo_identificacion"
                value="Tipo de identificación *"
              />
              <SelectForm
                id="tipo_identificacion"
                register={register("tipo_identificacion")}
                url="tipos-documento"
                data_url="tipos_documento"
              />
              <InputErrors errors={errors} name="tipo_identificacion" />
            </div>

            <div>
              <InputLabel
                htmlFor="numero_identificacion"
                value="Número de identificación *"
              />
              <TextInput
                className="w-full"
                id="numero_identificacion"
                type="text"
                placeholder="Número de identificación..."
                {...register("numero_identificacion")}
              />
              <InputErrors errors={errors} name="numero_identificacion" />
            </div>
          </div>
        </div>

        {/* NOMBRES */}
        <div className="col-span-full p-6 border border-[rgba(30,58,95,0.1)] rounded-xl bg-white shadow-[0_2px_10px_rgba(30,58,95,0.02)] transition-all">
          <div className="flex items-center gap-4 mb-5">
            <div className="p-3 rounded-lg bg-[rgba(30,58,95,0.05)] text-[#1e3a5f]">
              <User size={24} />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-[#1e3a5f] tracking-tight">Información personal</h4>
              <span className="text-sm text-[#6b7a8d]">
                Complete los nombres y apellidos
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-5 border-t border-[rgba(30,58,95,0.05)]">
            <div>
              <InputLabel htmlFor="primer_nombre" value="Primer nombre *" />
              <TextInput
                className="w-full"
                id="primer_nombre"
                type="text"
                placeholder="Primer nombre..."
                {...register("primer_nombre")}
              />
              <InputErrors errors={errors} name="primer_nombre" />
            </div>

            <div>
              <InputLabel htmlFor="segundo_nombre" value="Segundo nombre" />
              <TextInput
                className="w-full"
                id="segundo_nombre"
                type="text"
                placeholder="Segundo nombre..."
                {...register("segundo_nombre")}
              />
              <InputErrors errors={errors} name="segundo_nombre" />
            </div>

            <div>
              <InputLabel htmlFor="primer_apellido" value="Primer apellido *" />
              <TextInput
                className="w-full"
                id="primer_apellido"
                type="text"
                placeholder="Primer apellido..."
                {...register("primer_apellido")}
              />
              <InputErrors errors={errors} name="primer_apellido" />
            </div>

            <div>
              <InputLabel htmlFor="segundo_apellido" value="Segundo apellido" />
              <TextInput
                className="w-full"
                id="segundo_apellido"
                type="text"
                placeholder="Segundo apellido..."
                {...register("segundo_apellido")}
              />
              <InputErrors errors={errors} name="segundo_apellido" />
            </div>
          </div>
        </div>

        {/* DEMOGRÁFICO */}
        <div className="col-span-full p-6 border border-[rgba(30,58,95,0.1)] rounded-xl bg-white shadow-[0_2px_10px_rgba(30,58,95,0.02)] transition-all">
          <div className="flex items-center gap-4 mb-5">
            <div className="p-3 rounded-lg bg-[rgba(30,58,95,0.05)] text-[#1e3a5f]">
              <Calendar size={24} />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-[#1e3a5f] tracking-tight">Información demográfica</h4>
              <span className="text-sm text-[#6b7a8d]">
                Complete los datos de nacimiento, estado civil y género
              </span>
            </div>
          </div>

          <div className="grid lg:grid-cols-4 gap-6 pt-5 border-t border-[rgba(30,58,95,0.05)]">
            <div>
              <InputLabel
                htmlFor="fecha_nacimiento"
                value="Fecha de nacimiento *"
              />
              <TextInput
                id="fecha_nacimiento"
                type="date"
                {...register("fecha_nacimiento")}
              />
              <InputErrors errors={errors} name="fecha_nacimiento" />
            </div>

            <div>
              <InputLabel htmlFor="estado_civil" value="Estado civil *" />
              <SelectForm
                id="estado_civil"
                register={register("estado_civil")}
                url="estado-civil"
                data_url="estado_civil"
              />
              <InputErrors errors={errors} name="estado_civil" />
            </div>

            <div className="sm:col-span-2">
              <InputLabel htmlFor="genero" value="Género *" />
              <div className="flex flex-wrap items-center gap-4 sm:min-h-[42px] w-full p-2 text-sm text-[#2c3e50] rounded-lg border border-[rgba(30,58,95,0.1)] shadow-[0_1px_2px_rgba(30,58,95,0.03)] bg-[#f8fafc]">
                <LabelRadio
                  htmlFor="masculino"
                  value="Masculino"
                  inputProps={register("genero")}
                  label="Masculino"
                />
                <LabelRadio
                  htmlFor="femenino"
                  value="Femenino"
                  inputProps={register("genero")}
                  label="Femenino"
                />
                <LabelRadio
                  htmlFor="otro"
                  value="Otro"
                  inputProps={register("genero")}
                  label="Otro"
                />
              </div>
              <InputErrors errors={errors} name="genero" />
            </div>
          </div>
        </div>

        {/* ARCHIVO IDENTIFICACIÓN */}
        <div className="col-span-full p-6 border border-[rgba(30,58,95,0.1)] rounded-xl bg-white shadow-[0_2px_10px_rgba(30,58,95,0.02)] transition-all">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-5 w-full">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-[rgba(30,58,95,0.05)] text-[#6b7a8d]">
                <Paperclip size={24} />
              </div>
              <div className="flex flex-col items-start w-full">
                <h4 className="text-lg font-semibold text-[#1e3a5f] tracking-tight">Documento de Identificación</h4>
                <span className="text-sm text-[#6b7a8d]">
                  Adjunte su archivo en PDF como soporte de identificación.
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
              nombre="Identificación *"
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