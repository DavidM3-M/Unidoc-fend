import {  useParams } from "react-router";
import { InputLabel } from "../../../componentes/formularios/InputLabel";
import { SelectFormProduccionAcademica } from "../../../componentes/formularios/SelectFormProduccion";
import InputErrors from "../../../componentes/formularios/InputErrors";
import TextInput from "../../../componentes/formularios/TextInput";
import { MostrarArchivo } from "../../../componentes/formularios/MostrarArchivo";
import { ButtonPrimary } from "../../../componentes/formularios/ButtonPrimary";
import { AdjuntarArchivo } from "../../../componentes/formularios/AdjuntarArchivo";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productionSchemaUpdate } from "../../../validaciones/productionSchema";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { useArchivoPreview } from "../../../hooks/ArchivoPreview";
import axiosInstance from "../../../utils/axiosConfig";
import { toast } from "react-toastify";
import { RolesValidos } from "../../../types/roles";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import DivForm from "../../../componentes/formularios/DivForm";
import { BookOpen, ClipboardList, MegaphoneIcon } from "lucide-react";

type Inputs = {
  titulo: string;
  productos_academicos_id?: number;
  ambito_divulgacion_id: number;
  numero_autores: number;
  medio_divulgacion: string;
  fecha_divulgacion: string;
  archivo?: FileList;
};
type Props = {
  produccion: any;
  onSuccess: () => void;
};

const EditarProduccion = ({ produccion, onSuccess }: Props) => {
  const token = Cookies.get("token");
  if (!token) throw new Error("No authentication token found");
  const decoded = jwtDecode<{ rol: RolesValidos }>(token);
  const rol = decoded.rol;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { id } = useParams();
  console.log("Produccion recibida en EditarProduccion:", produccion);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<Inputs>({ resolver: zodResolver(productionSchemaUpdate) });

  const archivoValue = watch("archivo");
  const { existingFile, setExistingFile } = useArchivoPreview(archivoValue);

  useEffect(() => {
    const fetchAmbito = async () => {
      if (!produccion) return;

      try {
        const Url = `${import.meta.env.VITE_API_URL}${
          import.meta.env.VITE_ENDPOINT_OBTENER_AMBITO_DIVULGACION
        }`;
        const resp = await axios.get(
          `${Url}${produccion.ambito_divulgacion_id}`
        );

        console.log("Respuesta de ambito divulgacion:", resp.data);

        setValue(
          "productos_academicos_id",
          resp.data.producto_academico_id || ""
        );

        await new Promise((resolve) => setTimeout(resolve, 1000));
        setValue(
          "ambito_divulgacion_id",
          resp.data.id_ambito_divulgacion || ""
        );

        setValue("titulo", produccion.titulo || "");
        setValue("numero_autores", produccion.numero_autores || "");
        setValue("medio_divulgacion", produccion.medio_divulgacion || "");
        setValue("fecha_divulgacion", produccion.fecha_divulgacion || "");

        // 📄 Documento
        if (
          produccion.documentos_produccion_academica &&
          produccion.documentos_produccion_academica.length > 0
        ) {
          const archivo = produccion.documentos_produccion_academica[0];

          setExistingFile({
            url: archivo.archivo_url,
            name: archivo.archivo.split("/").pop() || "Archivo existente",
          });
        }
      } catch (error) {
        console.error("Error trayendo datos:", error);
      }
    };

    fetchAmbito();
  }, [produccion, setValue, setExistingFile]);

  const onSubmit: SubmitHandler<Inputs> = async (data: Inputs) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("_method", "PUT");
      formData.append(
        "ambito_divulgacion_id",
        data.ambito_divulgacion_id.toString()
      );
      formData.append("titulo", data.titulo);
      formData.append("numero_autores", data.numero_autores.toString());
      formData.append("medio_divulgacion", data.medio_divulgacion);
      formData.append("fecha_divulgacion", data.fecha_divulgacion);

      if (data.archivo && data.archivo.length > 0) {
        formData.append("archivo", data.archivo[0]);
      }

      const ENDPOINTS = {
        Aspirante: `${import.meta.env.VITE_API_URL}${
          import.meta.env.VITE_ENDPOINT_ACTUALIZAR_PRODUCCIONES_ASPIRANTE
        }`,
        Docente: `${import.meta.env.VITE_API_URL}${
          import.meta.env.VITE_ENDPOINT_ACTUALIZAR_PRODUCCIONES_DOCENTE
        }`,
      };
      const endpoint = ENDPOINTS[rol];

      const putPromise = axiosInstance.post(
        `${endpoint}/${produccion.id_produccion_academica}`,
        formData
      );

      await toast.promise(putPromise, {
        pending: "Actualizando datos...",
        success: "Datos actualizados correctamente",
        error: "Error al actualizar los datos",
      });

      onSuccess();
    } catch (error) {
      console.error("Error al actualizar la producción:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const produccionSeleccionado = watch("productos_academicos_id");

  return (
    <DivForm>
      <form
        className="grid grid-cols-1 sm:grid-cols-2 gap-6"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="col-span-full p-2 border-t-8 rounded-lg border-indigo-500">
          {/* Encabezado */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 w-full">
            <BookOpen className="icono bg-gradient-to-br from-indigo-400 to-indigo-500" />

            <div className="flex flex-col items-start w-full">
              <h4>Producción académica</h4>
              <span className="description-text">
                Selecciona el producto académico y su ámbito de divulgación
              </span>
            </div>
          </div>

          {/* Campos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
            {/* Producto académico */}
            <div>
              <InputLabel
                htmlFor="productos_academicos_id"
                value="Productos académicos *"
              />
              <SelectFormProduccionAcademica
                id="productos_academicos_id"
                register={register("productos_academicos_id", {
                  valueAsNumber: true,
                  required: true,
                })}
                url="productos-academicos"
              />
              <InputErrors errors={errors} name="productos_academicos_id" />
            </div>

            {/* Ámbito de divulgación */}
            <div>
              <InputLabel
                htmlFor="ambito_divulgacion_id"
                value="Ámbito de divulgación *"
              />
              <SelectFormProduccionAcademica
                id="ambito_divulgacion_id"
                register={register("ambito_divulgacion_id", {
                  valueAsNumber: true,
                  required: true,
                })}
                parentId={produccionSeleccionado}
                url="ambitos_divulgacion"
              />
              <InputErrors errors={errors} name="ambito_divulgacion_id" />
            </div>
          </div>
        </div>

        <div className="col-span-full p-2 border-t-8 rounded-lg border-teal-500">
          {/* Encabezado */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 w-full">
            <ClipboardList className="icono bg-gradient-to-br from-teal-400 to-teal-500" />

            <div className="flex flex-col items-start w-full">
              <h4>Detalles de la producción</h4>
              <span className="description-text">
                Información sobre el título y el número de autores
              </span>
            </div>
          </div>

          {/* Campos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
            {/* Título */}
            <div className="flex flex-col w-full">
              <InputLabel htmlFor="titulo" value="Título *" />
              <TextInput
                id="titulo"
                placeholder="Título..."
                {...register("titulo")}
              />
              <InputErrors errors={errors} name="titulo" />
            </div>

            {/* Número de autores */}
            <div className="flex flex-col w-full">
              <InputLabel
                htmlFor="numero_autores"
                value="Número de autores *"
              />
              <TextInput
                type="number"
                id="numero_autores"
                placeholder="Número de autores..."
                {...register("numero_autores", { valueAsNumber: true })}
              />
              <InputErrors errors={errors} name="numero_autores" />
            </div>
          </div>
        </div>

        <div className="col-span-full p-2 border-t-8 rounded-lg border-orange-500">
          {/* Encabezado */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 w-full">
            <MegaphoneIcon className="icono bg-gradient-to-br from-orange-400 to-orange-500" />

            <div className="flex flex-col items-start w-full">
              <h4>Divulgación de la producción</h4>
              <span className="description-text">
                Detalles sobre el medio y la fecha de divulgación
              </span>
            </div>
          </div>

          {/* Campos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
            {/* Medio de divulgación */}
            <div className="flex flex-col w-full">
              <InputLabel
                htmlFor="medio_divulgacion"
                value="Medio de divulgación *"
              />
              <TextInput
                id="medio_divulgacion"
                placeholder="Medio de divulgación..."
                {...register("medio_divulgacion")}
              />
              <InputErrors errors={errors} name="medio_divulgacion" />
            </div>

            {/* Fecha de divulgación */}
            <div className="flex flex-col w-full">
              <InputLabel
                htmlFor="fecha_divulgacion"
                value="Fecha de divulgación *"
              />
              <TextInput
                id="fecha_divulgacion"
                type="date"
                {...register("fecha_divulgacion")}
              />
              <InputErrors errors={errors} name="fecha_divulgacion" />
            </div>
          </div>
        </div>

        <div className="col-span-full">
          <InputLabel htmlFor="archivo" value="Archivo" />
          <AdjuntarArchivo id="archivo" register={register("archivo")} />
          <InputErrors errors={errors} name="archivo" />
          <MostrarArchivo file={existingFile} />
        </div>
        <div className="flex justify-center col-span-full">
          <ButtonPrimary
            value={isSubmitting ? "Enviando..." : "Editar producción"}
            disabled={isSubmitting}
          />
        </div>
      </form>
    </DivForm>
  );
};

export default EditarProduccion;
