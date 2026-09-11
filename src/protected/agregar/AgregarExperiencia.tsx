import Cookies from "js-cookie";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { experienciaSchema } from "../../validaciones/experienceSchema";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import { SelectForm } from "../../componentes/formularios/SelectForm";
import InputErrors from "../../componentes/formularios/InputErrors";
import TextInput from "../../componentes/formularios/TextInput";
import { AdjuntarArchivo } from "../../componentes/formularios/AdjuntarArchivo";
import { LabelRadio } from "../../componentes/formularios/LabelRadio";
import { useArchivoPreview } from "../../hooks/ArchivoPreview";
import { MostrarArchivo } from "../../componentes/formularios/MostrarArchivo";
import { RolesValidos } from "../../types/roles";
import axiosInstance from "../../utils/axiosConfig";
import { jwtDecode } from "jwt-decode";
import DivForm from "../../componentes/formularios/DivForm";
import { SeccionFormulario } from "../../componentes/formularios/SeccionFormulario";
import { CampoFormulario } from "../../componentes/formularios/CampoFormulario";
import { PieFormulario } from "../../componentes/formularios/PieFormulario";
import {
  mesesEntreFechas,
  hayDiscrepanciaDeMeses,
  textoMeses,
} from "../../utils/experienciaMeses";
import { NOMBRE_UNIAUTONOMA } from "../../utils/uniautonoma";
import { Briefcase, BriefcaseBusinessIcon } from "lucide-react";
import { BuildingLibraryIcon } from "@heroicons/react/24/outline";
import { useLanguage } from "../../context/useLanguage";

type Inputs = {
  tipo_experiencia: string;
  institucion_experiencia: string;
  trabajo_actual: "Si" | "No";
  cargo: string;
  intensidad_horaria: number;
  meses_trabajados: number;
  experiencia_universidad: "Si" | "No";
  fecha_inicio: string;
  fecha_finalizacion?: string;
  fecha_expedicion_certificado?: string;
  archivo: FileList;
};

type Props = {
  onSuccess: (data: Inputs) => void;
  onCancelar?: () => void;
};

const AgregarExperiencia = ({ onSuccess, onCancelar }: Props) => {
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    setValue,
    register,
    handleSubmit,
    watch,
    getValues,
    formState: { errors },
  } = useForm<Inputs>({
    resolver: zodResolver(experienciaSchema),
    defaultValues: {
      experiencia_universidad: "No",
    },
  });

  const archivoValue = watch("archivo");
  const { existingFile } = useArchivoPreview(archivoValue);

  // ---- Institución ----
  // La experiencia en la Universidad siempre es de la misma institución, así que al marcar "Sí"
  // el nombre se escribe solo y el campo queda bloqueado. Al volver a "No" se limpia —pero solo
  // si sigue siendo el nombre que puso el formulario, para no borrar lo que el docente escribió.
  const esUniautonoma = watch("experiencia_universidad") === "Si";

  const registroExperienciaUniversidad = register("experiencia_universidad", {
    onChange: (evento) => {
      if (evento.target.value === "Si") {
        setValue("institucion_experiencia", NOMBRE_UNIAUTONOMA, {
          shouldValidate: true,
        });
      } else if (getValues("institucion_experiencia") === NOMBRE_UNIAUTONOMA) {
        setValue("institucion_experiencia", "");
      }
    },
  });

  const trabajo_actual = watch("trabajo_actual");
  useEffect(() => {
    if (trabajo_actual === "Si") {
      setValue("fecha_finalizacion", "");
    }
  }, [trabajo_actual, setValue]);

  // ---- Meses trabajados ----
  // El número se prellena desde las fechas, pero el docente manda: su certificado puede decir
  // otra cosa (contratos por horas, semestres sueltos, vinculaciones con interrupciones). En
  // cuanto lo toca a mano, el cálculo deja de pisarlo y solo se usa para avisar si no coinciden.
  const fechaInicio = watch("fecha_inicio");
  const fechaFinalizacion = watch("fecha_finalizacion");
  const mesesDeclarados = watch("meses_trabajados");

  const mesesCalculados = mesesEntreFechas(
    fechaInicio,
    trabajo_actual === "Si" ? undefined : fechaFinalizacion
  );

  const [mesesEditadosAMano, setMesesEditadosAMano] = useState(false);

  useEffect(() => {
    if (mesesEditadosAMano || mesesCalculados === null) return;

    setValue("meses_trabajados", mesesCalculados, { shouldValidate: false });
  }, [mesesCalculados, mesesEditadosAMano, setValue]);

  const discrepancia = hayDiscrepanciaDeMeses(mesesDeclarados, mesesCalculados);

  const onSubmit: SubmitHandler<Inputs> = async (data: Inputs) => {
    setIsSubmitting(true); // 1. Desactivar botón
    try {
      const formData = new FormData();

      // Campos normales
      formData.append("tipo_experiencia", data.tipo_experiencia);
      formData.append("institucion_experiencia", data.institucion_experiencia);
      formData.append("es_uniautonoma", data.experiencia_universidad === "Si" ? "1" : "0");
      formData.append("trabajo_actual", data.trabajo_actual);
      formData.append("cargo", data.cargo);
      formData.append("intensidad_horaria", data.intensidad_horaria.toString());
      formData.append("meses_trabajados", data.meses_trabajados.toString());
      formData.append("fecha_inicio", data.fecha_inicio);
      formData.append("fecha_finalizacion", data.fecha_finalizacion || "");
      formData.append(
        "fecha_expedicion_certificado",
        data.fecha_expedicion_certificado || ""
      );

      // Archivo
      formData.append("archivo", data.archivo?.[0] || "");

      // Token y rol
      const token = Cookies.get("token");
      if (!token) throw new Error("No authentication token found");

      const decoded = jwtDecode<{ rol: RolesValidos }>(token);
      const rol = decoded.rol;

      // ENDPOINTS dinámicos por rol
      const ENDPOINTS = {
        Aspirante: import.meta.env.VITE_ENDPOINT_CREAR_EXPERIENCIAS_ASPIRANTE,
        Docente: import.meta.env.VITE_ENDPOINT_CREAR_EXPERIENCIAS_DOCENTE,
        Administrativo: import.meta.env.VITE_ENDPOINT_CREAR_EXPERIENCIAS_DOCENTE,
      };

      const endpoint = ENDPOINTS[rol];

      // Petición API
      await toast.promise(axiosInstance.post(endpoint, formData), {
        pending: t("messages.experience.adding"),
        success: t("messages.experience.added"),
        error: t("messages.experience.addError"),
      });

      // Igual que en Estudios:
      // -> ejecutas la función para cerrar modal o refrescar lista
      onSuccess(data);
    } catch (error) {
      console.error("Error en el envío:", error);
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
        {/* ============ SECCIÓN 1: tipo de experiencia ============ */}
        <div className="col-span-full">
          <SeccionFormulario
            icono={<Briefcase size={24} />}
            titulo="Información de la experiencia"
            descripcion="Información sobre tu experiencia y tipo de experiencia"
          />

          <div className="grid grid-cols-1 gap-6">
            <CampoFormulario
              htmlFor="tipo_experiencia"
              label="Tipo de experiencia *"
              error={<InputErrors errors={errors} name="tipo_experiencia" />}
              ayuda="La lista la mantiene la Universidad desde el catálogo de tipos de experiencia."
            >
              <SelectForm
                id="tipo_experiencia"
                register={register("tipo_experiencia")}
                url="tipos-experiencia"
                data_url="tipo_experiencia"
              />
            </CampoFormulario>

            <CampoFormulario
              htmlFor="experiencia_universidad"
              label="¿Esta experiencia es en la Universidad Autónoma?"
              error={<InputErrors errors={errors} name="experiencia_universidad" />}
              ayuda="Solo la experiencia en la Universidad, con documento aprobado, cuenta para el escalafón docente. Se verifica junto con el documento que adjuntes abajo."
            >
              {/* Mismo alto, borde y radio que los demás controles: antes este grupo medía
                  40 px con borde gris, así que quedaba desalineado en su fila del grid. */}
              <div className="flex flex-wrap items-center gap-5 h-12 w-full rounded-xl border-2 border-[#1e3a5f]/20 shadow-md px-3 text-sm text-[#1e3a5f] bg-white">
                <LabelRadio
                  htmlFor="experiencia-si"
                  value="Si"
                  inputProps={registroExperienciaUniversidad}
                  label="Sí"
                />
                <LabelRadio
                  htmlFor="experiencia_universidad-no"
                  value="No"
                  inputProps={registroExperienciaUniversidad}
                  label="No"
                />
              </div>
            </CampoFormulario>
          </div>
        </div>

        <hr className="col-span-full border-[rgba(30,58,95,0.1)] my-1" />

        {/* ============ SECCIÓN 2: institución, cargo y dedicación ============ */}
        <div className="col-span-full">
          <SeccionFormulario
            icono={<BuildingLibraryIcon className="w-6 h-6" />}
            titulo="Detalles de la experiencia"
            descripcion="Institución, cargo y dedicación"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <CampoFormulario
              htmlFor="institucion_experiencia"
              label="Institución *"
              error={<InputErrors errors={errors} name="institucion_experiencia" />}
              ayuda={
                esUniautonoma
                  ? "Se llena sola porque marcaste que la experiencia es en la Universidad."
                  : "Escríbela como aparece en el certificado."
              }
            >
              <TextInput
                id="institucion_experiencia"
                placeholder="Ej: Universidad del Cauca"
                maxLength={100}
                readOnly={esUniautonoma}
                className={
                  esUniautonoma
                    ? "bg-[#f4f7fa] text-[#1e3a5f] cursor-not-allowed"
                    : ""
                }
                {...register("institucion_experiencia")}
              />
            </CampoFormulario>

            <CampoFormulario
              htmlFor="cargo"
              label="Cargo *"
              error={<InputErrors errors={errors} name="cargo" />}
            >
              <TextInput
                id="cargo"
                placeholder="Ej: Docente de programación"
                maxLength={100}
                {...register("cargo")}
              />
            </CampoFormulario>

            <CampoFormulario
              htmlFor="intensidad_horaria"
              label="Horas semanales *"
              error={<InputErrors errors={errors} name="intensidad_horaria" />}
              ayuda="Las que figuran en el certificado. Máximo 127."
            >
              <TextInput
                type="number"
                id="intensidad_horaria"
                min={1}
                max={127}
                placeholder="Ej: 40"
                {...register("intensidad_horaria", { valueAsNumber: true })}
              />
            </CampoFormulario>

            {/* Meses trabajados: se prellena desde las fechas y el docente lo corrige si su
                certificado dice otra cosa. El aviso de discrepancia no bloquea el envío —una
                diferencia legítima es justamente el motivo de pedir el dato. */}
            <CampoFormulario
              htmlFor="meses_trabajados"
              label="Meses trabajados *"
              error={<InputErrors errors={errors} name="meses_trabajados" />}
              ayuda={
                discrepancia ? (
                  <span className="text-[#9a6b12] font-semibold">
                    No coincide con las fechas ({textoMeses(mesesCalculados as number)}).
                    Asegúrate de que el certificado respalde este total.
                  </span>
                ) : mesesCalculados !== null ? (
                  <>
                    Calculado desde las fechas: <b>{textoMeses(mesesCalculados)}</b>. Ajústalo si
                    tu certificado indica otro total.
                  </>
                ) : (
                  "Se calcula solo cuando registres las fechas más abajo."
                )
              }
            >
              <TextInput
                type="number"
                id="meses_trabajados"
                min={1}
                max={1200}
                placeholder="Ej: 68"
                className={discrepancia ? "border-[#e8c98a]" : ""}
                {...register("meses_trabajados", {
                  valueAsNumber: true,
                  onChange: () => setMesesEditadosAMano(true),
                })}
              />
            </CampoFormulario>
          </div>
        </div>

        <hr className="col-span-full border-[rgba(30,58,95,0.1)] my-1" />

        {/* ============ SECCIÓN 3: fechas ============ */}
        <div className="col-span-full">
          <SeccionFormulario
            icono={<BriefcaseBusinessIcon size={24} />}
            titulo="Información del trabajo"
            descripcion="Datos sobre tu trabajo actual y fechas relevantes"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CampoFormulario
              htmlFor="trabajo_actual"
              label="¿Es su trabajo actual? *"
              error={<InputErrors errors={errors} name="trabajo_actual" />}
            >
              <div className="flex flex-wrap items-center gap-5 h-12 w-full rounded-xl border-2 border-[#1e3a5f]/20 shadow-md px-3 text-sm text-[#1e3a5f] bg-white">
                <LabelRadio
                  htmlFor="trabajo_actual-si"
                  value="Si"
                  inputProps={register("trabajo_actual")}
                  label="Sí"
                />
                <LabelRadio
                  htmlFor="trabajo_actual-no"
                  value="No"
                  inputProps={register("trabajo_actual")}
                  label="No"
                />
              </div>
            </CampoFormulario>

            <CampoFormulario
              htmlFor="fecha_inicio"
              label="Fecha de inicio *"
              error={<InputErrors errors={errors} name="fecha_inicio" />}
            >
              <TextInput type="date" id="fecha_inicio" {...register("fecha_inicio")} />
            </CampoFormulario>

            {/* Solo aplica cuando la experiencia ya terminó. */}
            {trabajo_actual === "No" && (
              <CampoFormulario
                htmlFor="fecha_finalizacion"
                label="Fecha de finalización"
                error={<InputErrors errors={errors} name="fecha_finalizacion" />}
              >
                <TextInput
                  type="date"
                  id="fecha_finalizacion"
                  {...register("fecha_finalizacion")}
                />
              </CampoFormulario>
            )}

            <CampoFormulario
              htmlFor="fecha_expedicion_certificado"
              label="Fecha de expedición del certificado *"
              error={<InputErrors errors={errors} name="fecha_expedicion_certificado" />}
            >
              <TextInput
                type="date"
                id="fecha_expedicion_certificado"
                {...register("fecha_expedicion_certificado")}
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

          <div className="mt-4 p-3 bg-[rgba(30,58,95,0.03)] border border-[rgba(30,58,95,0.1)] rounded-lg flex items-start gap-3">
            <svg
              className="w-5 h-5 text-[#1e3a5f] flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-semibold text-[#1e3a5f]">
                El certificado debe respaldar lo que declaras
              </p>
              <p className="text-xs text-[#6b7a8d] mt-1">
                Apoyo Profesoral contrasta las fechas, las horas y los meses contra el documento
                adjunto. Si no coinciden, la experiencia se rechaza.
              </p>
            </div>
          </div>
        </div>

        <PieFormulario
          onCancelar={onCancelar}
          textoGuardar="Agregar experiencia"
          enviando={isSubmitting}
        />
      </form>
    </DivForm>
  );
};

export default AgregarExperiencia;
