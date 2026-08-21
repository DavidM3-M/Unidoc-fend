import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import axiosInstance from "../../../utils/axiosConfig";
import { SelectForm } from "../../../componentes/formularios/SelectForm";
import InputErrors from "../../../componentes/formularios/InputErrors";
import TextInput from "../../../componentes/formularios/TextInput";
import { experienciaSchemaUpdate } from "../../../validaciones/experienceSchema";
import { AdjuntarArchivo } from "../../../componentes/formularios/AdjuntarArchivo";
import { LabelRadio } from "../../../componentes/formularios/LabelRadio";
import { useArchivoPreview } from "../../../hooks/ArchivoPreview";
import { MostrarArchivo } from "../../../componentes/formularios/MostrarArchivo";
import { RolesValidos } from "../../../types/roles";
import { jwtDecode } from "jwt-decode";
import DivForm from "../../../componentes/formularios/DivForm";
import { SeccionFormulario } from "../../../componentes/formularios/SeccionFormulario";
import { CampoFormulario } from "../../../componentes/formularios/CampoFormulario";
import { PieFormulario } from "../../../componentes/formularios/PieFormulario";
import {
  mesesEntreFechas,
  hayDiscrepanciaDeMeses,
  textoMeses,
} from "../../../utils/experienciaMeses";
import { NOMBRE_UNIAUTONOMA } from "../../../utils/uniautonoma";
import { Briefcase, BriefcaseBusinessIcon } from "lucide-react";
import { BuildingLibraryIcon } from "@heroicons/react/24/outline";
import { useLanguage } from "../../../context/LanguageContext";

type Inputs = {
  tipo_experiencia: string;
  institucion_experiencia: string;
  cargo: string;
  fecha_inicio: string;
  intensidad_horaria: number;
  meses_trabajados: number;
  trabajo_actual: "Si" | "No";
  experiencia_universidad: "Si" | "No";
  fecha_finalizacion?: string;
  fecha_expedicion_certificado?: string;
  archivo?: FileList;
};

type Props = {
  experiencia: any;
  onSuccess: () => void;
  onCancelar?: () => void;
};

const EditarExperiencia = ({ experiencia, onSuccess, onCancelar }: Props) => {
  const token = Cookies.get("token");
  if (!token) throw new Error("No authentication token found");
  const decoded = jwtDecode<{ rol: RolesValidos }>(token);
  const rol = decoded.rol;

  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  // En cuanto el docente toca el campo (o llega con un valor ya declarado), el cálculo por
  // fechas deja de pisarlo y solo se usa para avisar si no coinciden.
  const [mesesEditadosAMano, setMesesEditadosAMano] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<Inputs>({
    resolver: zodResolver(experienciaSchemaUpdate),
    defaultValues: {
      experiencia_universidad: "No",
    },
  });

  const archivoValue = watch("archivo");
  const { existingFile, setExistingFile } = useArchivoPreview(archivoValue);
  const trabajo_actual = watch("trabajo_actual");

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

  useEffect(() => {
    if (experiencia) {
      const data = experiencia;
      setValue("tipo_experiencia", data.tipo_experiencia);
      // Los registros viejos pueden traer el nombre escrito de cualquier forma; si la
      // experiencia es en la Universidad se normaliza al nombre oficial, que es el único
      // valor que el campo acepta en ese caso.
      setValue(
        "institucion_experiencia",
        data.es_uniautonoma ? NOMBRE_UNIAUTONOMA : data.institucion_experiencia
      );
      setValue("experiencia_universidad", data.es_uniautonoma ? "Si" : "No");
      setValue("trabajo_actual", data.trabajo_actual);
      setValue("cargo", data.cargo);
      setValue("intensidad_horaria", data.intensidad_horaria);

      // Los registros anteriores al campo no traen meses: se deja que el cálculo por fechas los
      // prellene. Los que sí lo traen se cargan tal cual y quedan marcados como editados a mano,
      // para que el cálculo no pise el valor que el docente ya había declarado.
      if (typeof data.meses_trabajados === "number") {
        setValue("meses_trabajados", data.meses_trabajados);
        setMesesEditadosAMano(true);
      }
      setValue("fecha_inicio", data.fecha_inicio);
      setValue("fecha_finalizacion", data.fecha_finalizacion ?? "");
      setValue(
        "fecha_expedicion_certificado",
        data.fecha_expedicion_certificado
      );

      if (
        data.documentos_experiencia &&
        data.documentos_experiencia.length > 0
      ) {
        const archivo = data.documentos_experiencia[0];
        setExistingFile({
          url: archivo.archivo_url,
          name: archivo.archivo.split("/").pop() || "Archivo existente",
        });
      }
    }
  }, [experiencia, setValue, setExistingFile]);

  const onSubmit: SubmitHandler<Inputs> = async (data: Inputs) => {
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("_method", "PUT");

      // === Campos principales ===
      formData.append("tipo_experiencia", data.tipo_experiencia);
      formData.append("institucion_experiencia", data.institucion_experiencia);
      formData.append("es_uniautonoma", data.experiencia_universidad === "Si" ? "1" : "0");
      formData.append("trabajo_actual", data.trabajo_actual);
      formData.append("cargo", data.cargo);
      formData.append("intensidad_horaria", data.intensidad_horaria.toString());
      formData.append("meses_trabajados", data.meses_trabajados.toString());
      formData.append("fecha_inicio", data.fecha_inicio || "");
      formData.append("fecha_finalizacion", data.fecha_finalizacion || "");
      formData.append(
        "fecha_expedicion_certificado",
        data.fecha_expedicion_certificado || ""
      );

      // === Archivo (solo si el usuario carga uno nuevo) ===
      if (data.archivo && data.archivo.length > 0) {
        formData.append("archivo", data.archivo[0]);
      }

      // === Endpoints por rol ===
      const ENDPOINTS = {
        Aspirante: import.meta.env.VITE_ENDPOINT_ACTUALIZAR_EXPERIENCIAS_ASPIRANTE,
        Docente: import.meta.env.VITE_ENDPOINT_ACTUALIZAR_EXPERIENCIAS_DOCENTE,
        Administrativo: import.meta.env.VITE_ENDPOINT_ACTUALIZAR_EXPERIENCIAS_DOCENTE,
      };

      const endpoint = ENDPOINTS[rol];

      // === Petición con toast.promise ===
      const putPromise = axiosInstance.post(
        `${endpoint}/${experiencia.id_experiencia}`,
        formData
      );

      await toast.promise(putPromise, {
        pending: t("messages.experience.updating"),
        success: t("messages.experience.updated"),
        error: t("messages.experience.updateError"),
      });

      // Callback de éxito
      onSuccess?.();
    } catch (error) {
      console.error("Error en la actualización:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (trabajo_actual === "Si") {
      setValue("fecha_finalizacion", "");
    }
  }, [trabajo_actual, setValue]);

  // ---- Meses trabajados (mismo criterio que en AgregarExperiencia) ----
  const fechaInicio = watch("fecha_inicio");
  const fechaFinalizacion = watch("fecha_finalizacion");
  const mesesDeclarados = watch("meses_trabajados");

  const mesesCalculados = mesesEntreFechas(
    fechaInicio,
    trabajo_actual === "Si" ? undefined : fechaFinalizacion
  );

  useEffect(() => {
    if (mesesEditadosAMano || mesesCalculados === null) return;

    setValue("meses_trabajados", mesesCalculados, { shouldValidate: false });
  }, [mesesCalculados, mesesEditadosAMano, setValue]);

  const discrepancia = hayDiscrepanciaDeMeses(mesesDeclarados, mesesCalculados);

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
              ayuda="Solo la experiencia en la Universidad, con documento aprobado, cuenta para el escalafón docente."
            >
              <div className="flex flex-wrap items-center gap-5 h-12 w-full rounded-xl border-2 border-[#1e3a5f]/20 shadow-md px-3 text-sm text-[#1e3a5f] bg-white">
                <LabelRadio
                  htmlFor="editar-experiencia-si"
                  value="Si"
                  inputProps={registroExperienciaUniversidad}
                  label="Sí"
                />
                <LabelRadio
                  htmlFor="editar-experiencia-no"
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
                  htmlFor="editar-trabajo_actual-si"
                  value="Si"
                  inputProps={register("trabajo_actual")}
                  label="Sí"
                />
                <LabelRadio
                  htmlFor="editar-trabajo_actual-no"
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

export default EditarExperiencia;
