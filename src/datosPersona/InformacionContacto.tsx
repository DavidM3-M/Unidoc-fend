"use client";

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

export const InformacionContacto = () => {
  const token = Cookies.get("token");
  if (!token) throw new Error("No authentication token found");
  const decoded = jwtDecode<{ rol: RolesValidos }>(token);
  const rol = decoded.rol;

  const [isInformacion, setInformacion] = useState(false);
  const schema = isInformacion
    ? informacionContactoUpdate
    : informacionContacto;
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<Inputs>({
    resolver: zodResolver(schema),
  });

  const archivoValue = watch("archivo");
  const { existingFile, setExistingFile } = useArchivoPreview(archivoValue);

  const fetchInformacionContacto = async () => {
    const API = import.meta.env.VITE_API_URL;
    try {
      const ENDPOINTS = {
        Aspirante: `${import.meta.env.VITE_API_URL}${
          import.meta.env.VITE_ENDPOINT_OBTENER_INFORMACION_CONTACTO_ASPIRANTE
        }`,
        Docente: `${import.meta.env.VITE_API_URL}${
          import.meta.env.VITE_ENDPOINT_OBTENER_INFORMACION_CONTACTO_DOCENTE
        }`,
      };
      const endpoint = ENDPOINTS[rol];
      const respInformacionContact = await axiosInstance.get(endpoint);

      const informacion = respInformacionContact.data.informacion_contacto;
      const respUbic = await axiosInstance.get(
        `${API}/ubicaciones/municipio/${informacion.municipio_id}`
      );
      const ubic = respUbic.data;
      if (informacion) {
        setInformacion(true);
        setValue(
          "categoria_libreta_militar",
          informacion.categoria_libreta_militar || ""
        );
        setValue(
          "numero_libreta_militar",
          informacion.numero_libreta_militar || ""
        );
        setValue(
          "numero_distrito_militar",
          informacion.numero_distrito_militar || ""
        );
        setValue(
          "direccion_residencia",
          informacion.direccion_residencia || ""
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
        await new Promise((resolve) => setTimeout(resolve, 500));
        setValue("pais", ubic.pais_id);
        await new Promise((resolve) => setTimeout(resolve, 500));
        setValue("departamento", ubic.departamento_id);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setValue("municipio_id", ubic.municipio_id);
      } else {
        setInformacion(false);
        console.log("No hay información de contacto disponible.");
      }
    } catch (error) {
      console.error("Error al obtener la información de contacto:", error);
    }
  };

  useEffect(() => {
    fetchInformacionContacto();
  }, []);

  // enviar data a la API
  // Enviar los datos del formulario
  const onSubmit: SubmitHandler<Inputs> = async (data: Inputs) => {
    const formData = new FormData();

    formData.append("municipio_id", data.municipio_id.toString());
    formData.append(
      "categoria_libreta_militar",
      data.categoria_libreta_militar || ""
    );
    formData.append(
      "numero_libreta_militar",
      data.numero_libreta_militar || ""
    );
    formData.append(
      "numero_distrito_militar",
      data.numero_distrito_militar || ""
    );
    formData.append("direccion_residencia", data.direccion_residencia || "");
    formData.append("barrio", data.barrio || "");
    formData.append("telefono_movil", data.telefono_movil);
    formData.append("celular_alternativo", data.celular_alternativo || "");
    formData.append("correo_alterno", data.correo_alterno || "");

    if (data.archivo && data.archivo.length > 0) {
      formData.append("archivo", data.archivo[0]);
    }

    // Agregar `_method` si es actualización
    if (isInformacion) {
      formData.append("_method", "PUT");
    }
    const ENDPOINTS_POST = {
      Aspirante: {
        crear: import.meta.env
          .VITE_ENDPOINT_CREAR_INFORMACION_CONTACTO_ASPIRANTE,
        actualizar: import.meta.env
          .VITE_ENDPOINT_ACTUALIZAR_INFORMACION_CONTACTO_ASPIRANTE,
      },
      Docente: {
        crear: import.meta.env.VITE_ENDPOINT_CREAR_INFORMACION_CONTACTO_DOCENTE,
        actualizar: import.meta.env
          .VITE_ENDPOINT_ACTUALIZAR_INFORMACION_CONTACTO_DOCENTE,
      },
    };

    const url = `${import.meta.env.VITE_API_URL}${
      isInformacion ? ENDPOINTS_POST[rol].actualizar : ENDPOINTS_POST[rol].crear
    }`;

    try {
      await toast.promise(axiosInstance.post(url, formData), {
        pending: "Enviando datos...",
        success: {
          render() {
            setInformacion(true); // Actualiza el estado después de guardar
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
    }
  }, [categoriaLibretaMilitar, setValue]);

  return (
    <div className="">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 sm:grid-cols-2 gap-6"
      >
        {/* UBICACIÓN DE RESIDENCIA */}
        <div className="col-span-full p-4 border-l-8 rounded-lg border-blue-500 bg-white">
          <div className="flex justify-between items-center gap-4 w-full">
            <MapPin className="icono bg-gradient-to-br from-blue-400 to-blue-500" />
            <div className="flex flex-col items-start w-full">
              <h4 className="">Ubicación de residencia</h4>
              <span className="description-text">
                Seleccione su ubicación actual
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-4">
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
        <hr className="col-span-full border-gray-300" />

        {/* LIBRETA MILITAR */}
        <div className="col-span-full p-4 border-l-8 rounded-lg border-green-500 bg-white ">
          <div className="flex justify-between items-center gap-4 w-full">
            <IdCard className="icono bg-gradient-to-br from-green-400 to-green-500" />
            <div className="flex flex-col items-start w-full">
              <h4>Información de libreta militar</h4>
              <span className="description-text">
                Complete esta sección si aplica
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-4">
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
        <hr className="col-span-full border-gray-300" />

        {/* DIRECCIÓN */}
        <div className="col-span-full p-4 border-l-8 rounded-lg border-purple-500 bg-white">
          <div className="flex justify-between items-center gap-4 w-full">
            <Home className="icono bg-gradient-to-br from-purple-400 to-purple-500" />
            <div className="flex flex-col items-start w-full">
              <h4>Dirección de residencia</h4>
              <span className="description-text">
                Datos exactos del lugar donde vive
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
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
        <hr className="col-span-full border-gray-300" />

        {/* CONTACTO */}
        <div className="col-span-full p-4 border-l-8 rounded-lg border-orange-500  ">
          <div className="flex justify-between items-center gap-4 w-full">
            <Phone className="icono bg-gradient-to-br from-orange-400 to-orange-500" />
            <div className="flex flex-col items-start w-full">
              <h4>Información de contacto</h4>
              <span className="description-text">
                Teléfonos y correo alternativo
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-4">
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

        {watch("categoria_libreta_militar") !== noTiene && (
          <div className="col-span-full  p-4 border-l-8 rounded-lg border-gray-500 bg-white shadow-sm">
            <div className="flex flex-col items-start sm:flex-row justify-between sm:items-center gap-4 w-full">
              <Paperclip className="icono bg-gradient-to-br from-gray-400 to-gray-500" />
              <div className="flex flex-col items-start w-full">
                <h4>Documento de libreta militar</h4>
                <span className="description-text">
                  Adjunte su archivo en PDF
                </span>
              </div>
              <span className="info-section">Requerido</span>
            </div>

            <div className="mt-4">
              <AdjuntarArchivo
                id="archivo"
                register={register("archivo")}
                nombre="libreta militar"
              />
              <MostrarArchivo file={existingFile} />
              <InputErrors errors={errors} name="archivo" />
            </div>
          </div>
        )}

        <div className="col-span-full text-center">
          <ButtonPrimary type="submit" value="Guardar" />
        </div>
      </form>
    </div>
  );
};
