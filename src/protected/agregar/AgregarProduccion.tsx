import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { productionSchema } from "../../validaciones/productionSchema";
import { toast } from "react-toastify";
import { SelectFormProduccionAcademica } from "../../componentes/formularios/SelectFormProduccion";
import InputErrors from "../../componentes/formularios/InputErrors";
import TextInput from "../../componentes/formularios/TextInput";
import { useState } from "react";
import { AdjuntarArchivo } from "../../componentes/formularios/AdjuntarArchivo";
import Cookies from "js-cookie";
import { MostrarArchivo } from "../../componentes/formularios/MostrarArchivo";
import { useArchivoPreview } from "../../hooks/ArchivoPreview";
import axiosInstance from "../../utils/axiosConfig";
import { RolesValidos } from "../../types/roles";
import { jwtDecode } from "jwt-decode";
import DivForm from "../../componentes/formularios/DivForm";
import { SeccionFormulario } from "../../componentes/formularios/SeccionFormulario";
import { CampoFormulario } from "../../componentes/formularios/CampoFormulario";
import { PieFormulario } from "../../componentes/formularios/PieFormulario";
import { BookOpen, ClipboardList, MegaphoneIcon } from "lucide-react";
import { useLanguage } from "../../context/useLanguage";

type Inputs = {
  productos_academicos_id: number;
  ambito_divulgacion_id: number;
  titulo: string;
  numero_autores: number;
  medio_divulgacion: string;
  fecha_divulgacion: string;
  archivo: FileList;
  // Identificadores con los que el Evaluador de Producción verifica la publicación sin pedir
  // documentos adicionales. Opcionales: un libro o una ponencia institucional no tienen DOI.
  doi?: string;
  issn_isbn?: string;
  url_publicacion?: string;
};

type Props = {
  onSuccess: (data: Inputs) => void;
  onCancelar?: () => void;
};

const AgregarProduccion = ({ onSuccess, onCancelar }: Props) => {
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Inputs>({ resolver: zodResolver(productionSchema) });

  const archivoValue = watch("archivo");
  const { existingFile } = useArchivoPreview(archivoValue);

  const onSubmit: SubmitHandler<Inputs> = async (data: Inputs) => {
    setIsSubmitting(true); // 1. Desactivar el botón al iniciar el envío
    try {
      const formData = new FormData();

      formData.append(
        "ambito_divulgacion_id",
        data.ambito_divulgacion_id.toString()
      );
      formData.append("titulo", data.titulo);
      formData.append("numero_autores", data.numero_autores.toString());
      formData.append("medio_divulgacion", data.medio_divulgacion);
      formData.append("fecha_divulgacion", data.fecha_divulgacion);
      formData.append("archivo", data.archivo?.[0] || "");

      // Solo se envían si el docente los llenó. Mandar `doi=""` haría que el backend guarde
      // cadena vacía en vez de null, y el filtro «sin enlace de consulta» del evaluador dejaría
      // de contarlos como incompletos.
      if (data.doi) formData.append("doi", data.doi);
      if (data.issn_isbn) formData.append("issn_isbn", data.issn_isbn);
      if (data.url_publicacion) formData.append("url_publicacion", data.url_publicacion);

      // Token y rol
      const token = Cookies.get("token");
      if (!token) throw new Error("No authentication token found");

      const decoded = jwtDecode<{ rol: RolesValidos }>(token);
      const rol = decoded.rol;

      // ENDPOINTS por rol
      const ENDPOINTS = {
        Aspirante: import.meta.env.VITE_ENDPOINT_CREAR_PRODUCCIONES_ASPIRANTE,
        Docente: import.meta.env.VITE_ENDPOINT_CREAR_PRODUCCIONES_DOCENTE,
        Administrativo: import.meta.env.VITE_ENDPOINT_CREAR_PRODUCCIONES_DOCENTE,
      };

      const endpoint = ENDPOINTS[rol];

      // API Request con toast tipo Estudios
      await toast.promise(axiosInstance.post(endpoint, formData), {
        pending: t("messages.production.adding"),
        success: t("messages.production.added"),
        error: t("messages.production.addError"),
      });

      // Igual que en Estudios — cerrar modal, refrescar lista
      onSuccess(data);
    } catch (error) {
      console.error("Error al enviar los datos:", error);
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
            {/* Este select no se guarda: solo filtra la lista de ámbitos. No hay columna donde
                ponerlo y el producto se puede deducir del ámbito
                (`ambito_divulgacions.producto_academico_id`), así que no se pierde información
                — pero el docente tenía que poder saberlo. */}
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

        {/* ============ SECCIÓN 4: dónde se puede consultar ============
            Van juntos y en un recuadro aparte, con la razón escrita: un campo opcional sin
            ganancia visible no lo llena nadie. La ganancia es real — con DOI o enlace, el
            Evaluador de Producción verifica la publicación en un clic en vez de buscar el
            título a ciegas, y el aval sale mucho más rápido. */}
        <div className="col-span-full">
          <div className="rounded-2xl border border-[#fed7aa] bg-[#fffbf6] p-5">
            <div className="flex items-center gap-2.5 mb-1.5">
              <span className="w-5 h-5 rounded-full bg-[#e8740e] text-white grid place-items-center text-xs font-bold">
                +
              </span>
              <h3 className="text-base font-bold text-[#9a3412]">
                Dónde se puede consultar
              </h3>
            </div>
            <p className="text-sm text-[#9a3412] mb-5 leading-relaxed">
              Estos datos no son obligatorios, pero son los que permiten verificar tu producción
              sin pedirte documentos adicionales.{" "}
              <b>Una producción con DOI o enlace se avala mucho más rápido.</b>
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <CampoFormulario
                htmlFor="doi"
                label="DOI"
                error={<InputErrors errors={errors} name="doi" />}
                ayuda="Puedes pegar el enlace completo de doi.org; el sistema extrae el identificador."
              >
                <TextInput
                  id="doi"
                  placeholder="Ej: 10.21500/rces.2026.4187"
                  maxLength={255}
                  {...register("doi")}
                />
              </CampoFormulario>

              <CampoFormulario
                htmlFor="issn_isbn"
                label="ISSN o ISBN"
                error={<InputErrors errors={errors} name="issn_isbn" />}
                ayuda="Aparece en la portada o en los créditos de la publicación."
              >
                <TextInput
                  id="issn_isbn"
                  placeholder="Ej: 2145-9088"
                  maxLength={32}
                  {...register("issn_isbn")}
                />
              </CampoFormulario>

              <div className="sm:col-span-2">
                <CampoFormulario
                  htmlFor="url_publicacion"
                  label="Enlace a la publicación"
                  error={<InputErrors errors={errors} name="url_publicacion" />}
                  ayuda="La página donde cualquiera puede leer o consultar tu publicación."
                >
                  <TextInput
                    id="url_publicacion"
                    type="url"
                    placeholder="https://…"
                    maxLength={500}
                    {...register("url_publicacion")}
                  />
                </CampoFormulario>
              </div>
            </div>
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
          textoGuardar="Agregar producción"
          enviando={isSubmitting}
        />
      </form>
    </DivForm>
  );
};

export default AgregarProduccion;
