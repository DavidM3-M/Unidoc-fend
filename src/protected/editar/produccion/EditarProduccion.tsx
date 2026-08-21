import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import { useLanguage } from "../../../context/LanguageContext";
import axiosInstance from "../../../utils/axiosConfig";
import { SelectFormProduccionAcademica } from "../../../componentes/formularios/SelectFormProduccion";
import InputErrors from "../../../componentes/formularios/InputErrors";
import TextInput from "../../../componentes/formularios/TextInput";
import { MostrarArchivo } from "../../../componentes/formularios/MostrarArchivo";
import { AdjuntarArchivo } from "../../../componentes/formularios/AdjuntarArchivo";
import { productionSchemaUpdate } from "../../../validaciones/productionSchema";
import { useArchivoPreview } from "../../../hooks/ArchivoPreview";
import { RolesValidos } from "../../../types/roles";
import { jwtDecode } from "jwt-decode";
import DivForm from "../../../componentes/formularios/DivForm";
import { SeccionFormulario } from "../../../componentes/formularios/SeccionFormulario";
import { CampoFormulario } from "../../../componentes/formularios/CampoFormulario";
import { PieFormulario } from "../../../componentes/formularios/PieFormulario";
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
  onCancelar?: () => void;
};

const EditarProduccion = ({ produccion, onSuccess, onCancelar }: Props) => {
  const token = Cookies.get("token");
  if (!token) throw new Error("No authentication token found");
  const decoded = jwtDecode<{ rol: RolesValidos }>(token);
  const rol = decoded.rol;

  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<Inputs>({ resolver: zodResolver(productionSchemaUpdate) });

  const archivoValue = watch("archivo");
  const { existingFile, setExistingFile } = useArchivoPreview(archivoValue);
  const produccionSeleccionado = watch("productos_academicos_id");

  // Los campos propios del registro se llenan de inmediato y fuera de cualquier petición: antes
  // todo el precargado vivía dentro del `try` que pedía el ámbito, así que un fallo de esa
  // llamada dejaba el formulario completamente en blanco.
  useEffect(() => {
    if (!produccion) return;

    setValue("titulo", produccion.titulo || "");
    setValue("numero_autores", produccion.numero_autores || 0);
    setValue("medio_divulgacion", produccion.medio_divulgacion || "");
    setValue("fecha_divulgacion", produccion.fecha_divulgacion || "");
    setValue("ambito_divulgacion_id", produccion.ambito_divulgacion_id);

    if (produccion.documentos_produccion_academica?.length > 0) {
      const archivo = produccion.documentos_produccion_academica[0];

      setExistingFile({
        url: archivo.archivo_url,
        name: archivo.archivo.split("/").pop() || "Archivo existente",
      });
    }
  }, [produccion, setValue, setExistingFile]);

  // El producto académico no se guarda con la producción (solo filtra la lista de ámbitos), así
  // que hay que deducirlo del ámbito para dejar el primer select en su valor. Cuando la
  // producción ya trae el ámbito con su relación —el listado hace eager-load— sale de ahí sin
  // pedir nada; el `fetch` es solo el respaldo para quien abra el formulario con datos viejos
  // en caché.
  useEffect(() => {
    if (!produccion?.ambito_divulgacion_id) return;

    const productoIncluido =
      produccion.ambito_divulgacion_produccion_academica?.producto_academico_id;

    if (productoIncluido) {
      setValue("productos_academicos_id", productoIncluido);
      return;
    }

    let vigente = true;

    const resolverProducto = async () => {
      try {
        const url = import.meta.env.VITE_ENDPOINT_OBTENER_AMBITO_DIVULGACION;
        const resp = await axiosInstance.get(`${url}${produccion.ambito_divulgacion_id}`);

        if (!vigente) return;

        setValue("productos_academicos_id", resp.data?.producto_academico_id ?? undefined);
      } catch (error) {
        // Se pierde el filtro del primer select, no el resto del formulario.
        console.error("No se pudo resolver el producto académico del ámbito:", error);
      }
    };

    resolverProducto();

    return () => {
      vigente = false;
    };
  }, [produccion, setValue]);

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
        Aspirante: import.meta.env.VITE_ENDPOINT_ACTUALIZAR_PRODUCCIONES_ASPIRANTE,
        Docente: import.meta.env.VITE_ENDPOINT_ACTUALIZAR_PRODUCCIONES_DOCENTE,
        Administrativo: import.meta.env.VITE_ENDPOINT_ACTUALIZAR_PRODUCCIONES_DOCENTE,
      };
      
      const endpoint = ENDPOINTS[rol];

      const putPromise = axiosInstance.post(
        `${endpoint}/${produccion.id_produccion_academica}`,
        formData
      );

      await toast.promise(putPromise, {
        pending: t("messages.production.updating"),
        success: t("messages.production.updated"),
        error: t("messages.production.updateError"),
      });

      onSuccess();
    } catch (error) {
      console.error("Error al actualizar la producción:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DivForm>
      <form
        className="grid grid-cols-1 sm:grid-cols-2 gap-6"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        {/* ============ SECCIÓN 1: producto y ámbito ============ */}
        <div className="col-span-full">
          <SeccionFormulario
            icono={<BookOpen size={24} />}
            titulo="Información de la producción"
            descripcion="Selecciona el producto académico y su ámbito de divulgación"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <CampoFormulario
              htmlFor="productos_academicos_id"
              label="Producto académico *"
              error={<InputErrors errors={errors} name="productos_academicos_id" />}
              ayuda="Sirve para filtrar la lista de ámbitos. Lo que queda registrado es el ámbito que elijas al lado."
            >
              <SelectFormProduccionAcademica
                id="productos_academicos_id"
                register={register("productos_academicos_id", {
                  valueAsNumber: true,
                  required: true,
                })}
                url="productos-academicos"
              />
            </CampoFormulario>

            <CampoFormulario
              htmlFor="ambito_divulgacion_id"
              label="Ámbito de divulgación *"
              error={<InputErrors errors={errors} name="ambito_divulgacion_id" />}
              ayuda="Es el valor del catálogo que define el puntaje de esta producción."
            >
              <SelectFormProduccionAcademica
                id="ambito_divulgacion_id"
                register={register("ambito_divulgacion_id", {
                  valueAsNumber: true,
                  required: true,
                })}
                parentId={produccionSeleccionado}
                parentRequired
                url="ambitos_divulgacion"
              />
            </CampoFormulario>
          </div>
        </div>

        <hr className="col-span-full border-[rgba(30,58,95,0.1)] my-1" />

        {/* ============ SECCIÓN 2: título y autores ============ */}
        <div className="col-span-full">
          <SeccionFormulario
            icono={<ClipboardList size={24} />}
            titulo="Detalles de la producción"
            descripcion="Información sobre el título y el número de autores"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <CampoFormulario
              htmlFor="titulo"
              label="Título *"
              error={<InputErrors errors={errors} name="titulo" />}
            >
              <TextInput
                id="titulo"
                placeholder="Título de la producción"
                maxLength={255}
                {...register("titulo")}
              />
            </CampoFormulario>

            <CampoFormulario
              htmlFor="numero_autores"
              label="Número de autores *"
              error={<InputErrors errors={errors} name="numero_autores" />}
              ayuda="Incluyéndote a ti."
            >
              <TextInput
                type="number"
                id="numero_autores"
                min={1}
                placeholder="Ej: 2"
                {...register("numero_autores", { valueAsNumber: true })}
              />
            </CampoFormulario>
          </div>
        </div>

        <hr className="col-span-full border-[rgba(30,58,95,0.1)] my-1" />

        {/* ============ SECCIÓN 3: divulgación ============ */}
        <div className="col-span-full">
          <SeccionFormulario
            icono={<MegaphoneIcon className="w-6 h-6" />}
            titulo="Divulgación de la producción"
            descripcion="Detalles sobre el medio y la fecha de divulgación"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <CampoFormulario
              htmlFor="medio_divulgacion"
              label="Medio de divulgación *"
              error={<InputErrors errors={errors} name="medio_divulgacion" />}
              ayuda="El nombre concreto: la revista, la editorial o el evento."
            >
              <TextInput
                id="medio_divulgacion"
                placeholder="Ej: Revista UNAM"
                maxLength={255}
                {...register("medio_divulgacion")}
              />
            </CampoFormulario>

            <CampoFormulario
              htmlFor="fecha_divulgacion"
              label="Fecha de divulgación *"
              error={<InputErrors errors={errors} name="fecha_divulgacion" />}
            >
              <TextInput
                id="fecha_divulgacion"
                type="date"
                {...register("fecha_divulgacion")}
              />
            </CampoFormulario>
          </div>
        </div>

        <hr className="col-span-full border-[rgba(30,58,95,0.1)] my-1" />

        {/* ============ ARCHIVO ============ */}
        <div className="col-span-full">
          <AdjuntarArchivo id="archivo" register={register("archivo")} />
          <InputErrors errors={errors} name="archivo" />
          <MostrarArchivo file={existingFile} />
        </div>

        <PieFormulario
          onCancelar={onCancelar}
          textoGuardar="Guardar cambios"
          enviando={isSubmitting}
        />
      </form>
    </DivForm>
  );
};

export default EditarProduccion;
