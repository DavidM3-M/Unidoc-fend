"use client";

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
  if (!token) throw new Error("No authentication token found");
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
        Aspirante: `${import.meta.env.VITE_API_URL}${
          import.meta.env.VITE_ENDPOINT_OBTENER_RUT_ASPIRANTE
        }`,
        Docente: `${import.meta.env.VITE_API_URL}${
          import.meta.env.VITE_ENDPOINT_OBTENER_RUT_DOCENTE
        }`,
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
    };

    const url = `${import.meta.env.VITE_API_URL}${
      isRutRegistered
        ? ENDPOINTS_POST[rol].actualizar
        : ENDPOINTS_POST[rol].crear
    }`;
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
    <div className="">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-50">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
            <p className="text-gray-700 font-medium">
              Cargando datos del RUT...
            </p>
          </div>
        </div>
      )}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 sm:grid-cols-2 gap-6"
      >
        {/* INFORMACIÓN PRINCIPAL DEL RUT */}
        <div className="col-span-full p-4 border-l-8 rounded-lg border-blue-500 bg-white">
          <div className="flex justify-between items-center gap-4 w-full">
            <IdCard className="icono bg-gradient-to-br from-blue-400 to-blue-500" />

            <div className="flex flex-col items-start w-full">
              <h4>Información principal del RUT</h4>
              <span className="description-text">
                Datos generales identificatorios
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
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

        <hr className="col-span-full border-gray-300" />

        {/* CLASIFICACIÓN Y ACTIVIDAD ECONÓMICA */}
        <div className="col-span-full p-4 border-l-8 rounded-lg border-green-500 bg-white">
          <div className="flex justify-between items-center gap-4 w-full">
            <FolderKanban className="icono bg-gradient-to-br from-green-400 to-green-500" />

            <div className="flex flex-col items-start w-full">
              <h4>Clasificación y actividad económica</h4>
              <span className="description-text">
                Naturaleza jurídica y actividad CIIU
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
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

        <hr className="col-span-full border-gray-300" />

        {/* RESPONSABILIDADES TRIBUTARIAS */}
        <div className="col-span-full p-4 border-l-8 rounded-lg border-purple-500 bg-white">
          <div className="flex justify-between items-center gap-4 w-full">
            <BadgePercent className="icono bg-gradient-to-br from-purple-400 to-purple-500" />

            <div className="flex flex-col items-start w-full">
              <h4>Responsabilidades tributarias</h4>
              <span className="description-text">
                Obligaciones fiscales asociadas
              </span>
            </div>
          </div>

          <div className="mt-4">
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

        <hr className="col-span-full border-gray-300" />

        {/* ARCHIVO RUT */}
        <div className="col-span-full p-4 border-l-8 rounded-lg border-gray-500 bg-white shadow-sm">
          <div className="flex flex-col  items-start sm:flex-row  justify-between sm:items-center gap-4 w-full">
            <Paperclip className="icono bg-gradient-to-br from-gray-400 to-gray-500" />

            <div className="flex flex-col items-start w-full">
              <h4>Documento RUT</h4>
              <span className="description-text">
                Adjunte el archivo PDF del RUT
              </span>
            </div>

            <span className="info-section">Requerido</span>
          </div>

          <div className="mt-4">
            <AdjuntarArchivo
              id="archivo"
              register={register("archivo")}
              nombre="RUT"
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
