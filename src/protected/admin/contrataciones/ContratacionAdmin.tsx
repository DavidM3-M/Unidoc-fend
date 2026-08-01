import { useForm } from "react-hook-form";
import { ButtonPrimary } from "../../../componentes/formularios/ButtonPrimary";
import InputErrors from "../../../componentes/formularios/InputErrors";
import { InputLabel } from "../../../componentes/formularios/InputLabel";
import TextInput from "../../../componentes/formularios/TextInput";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ButtonRegresar } from "../../../componentes/formularios/ButtonRegresar";
import { toast } from "react-toastify";
import axiosInstance from "../../../utils/axiosConfig";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import {
  contratacionSchemaAdmin,
  contratacionSchemaUpdate,
} from "../../../validaciones/admin/contratacionSchema";
import { SelectLocales } from "../../../componentes/formularios/SelectsLocales";

// Define la estructura de los datos del formulario
type Inputs = {
  tipo_proceso: "Contratacion" | "Ascenso" | "CambioCargo";
  tipo_vinculacion: "Docente" | "Administrativo";
  tipo_contrato: "Planta" | "Ocasional" | "Cátedra";
  area:
    | "Facultad de Ciencias Administrativas, Contables y Economicas"
    | "Facultad de Ciencias Ambientales y Desarrollo Sostenible"
    | "Facultad de Derecho, Ciencias Sociales y Politicas"
    | "Facultad de Educacion"
    | "Facultad de Ingenieria";
  fecha_inicio: string;
  fecha_fin: string;
  valor_contrato: number;
  observaciones: string;
  motivo: string;
};

const ContratacionAdmin = () => {
  const { id } = useParams(); // :id es user_id (creación) o id_contratacion (edición)
  const navigate = useNavigate();
  // Se activa solo cuando el GET confirma que ya existe una contratación con ese id.
  // A diferencia de Talento Humano, el modo creación/edición se decide con este
  // estado (post-fetch) y no con la mera presencia de :id en la URL, para que
  // "crear contratación para el usuario X" (id = user_id, sin contratación aún)
  // no se trate como edición.
  const [isContratacionRegistered, setIsContratacionRegistered] =
    useState(false);
  const isEditMode = isContratacionRegistered;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingInicial, setIsLoadingInicial] = useState(!!id);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<Inputs>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver((isEditMode ? contratacionSchemaUpdate : contratacionSchemaAdmin) as any),
    defaultValues: {
      tipo_proceso: "Contratacion",
      tipo_vinculacion: "Docente",
    },
  });

  const tipoProceso = watch("tipo_proceso");

  // Intenta obtener una contratación existente para el id de la URL. Si falla
  // (porque el id es en realidad un user_id sin contratación aún), el formulario
  // permanece en modo creación.
  const fetchDatos = async () => {
    if (!id) return;

    try {
      const response = await axiosInstance.get(
        `/admin/obtener-contratacion/${id}`
      );
      const data = response.data.contratacion;

      setIsContratacionRegistered(true);
      setValue("tipo_proceso", data.tipo_proceso ?? "Contratacion");
      setValue("tipo_vinculacion", data.tipo_vinculacion ?? "Docente");
      setValue("tipo_contrato", data.tipo_contrato);
      setValue("area", data.area);
      setValue("fecha_inicio", data.fecha_inicio.split("T")[0]);
      setValue("fecha_fin", data.fecha_fin.split("T")[0]);
      setValue("valor_contrato", data.valor_contrato);
      setValue("observaciones", data.observaciones || "");
    } catch (error) {
      console.error("Error al obtener contratación:", error);
    } finally {
      setIsLoadingInicial(false);
    }
  };

  useEffect(() => {
    if (id) fetchDatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const onsubmit = async (data: Inputs) => {
    setIsSubmitting(true);

    const requestData: Record<string, unknown> = {
      tipo_proceso: data.tipo_proceso,
      tipo_vinculacion: data.tipo_vinculacion,
      tipo_contrato: data.tipo_contrato,
      area: data.area,
      fecha_inicio: data.fecha_inicio,
      fecha_fin: data.fecha_fin,
      valor_contrato: data.valor_contrato,
      observaciones: data.observaciones || null,
      motivo: data.motivo,
    };

    const url = isEditMode
      ? `/admin/actualizar-contratacion/${id}`
      : `/admin/crear-contratacion/${id}`;

    const method = isEditMode ? "PUT" : "POST";

    try {
      await toast.promise(
        axiosInstance({
          method,
          url,
          data: requestData,
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
            "Content-Type": "application/json",
          },
        }),
        {
          pending: isEditMode
            ? "Actualizando contratación..."
            : "Creando contratación...",
          success: {
            render() {
              setTimeout(() => {
                navigate("/admin/contrataciones");
              }, 1500);
              return isEditMode
                ? "Contratación actualizada con éxito"
                : "Contratación creada con éxito";
            },
            autoClose: 1500,
          },
          error: isEditMode
            ? "Error al actualizar la contratación"
            : "Error al crear la contratación",
        }
      );
    } catch (error) {
      console.error("Error al procesar la contratación:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col bg-white p-8 rounded-xl shadow-md w-full max-w-4xl gap-y-4 border border-[rgba(30,58,95,0.09)]">
      <div className="flex gap-x-4 col-span-full items-center">
        <Link to={"/admin/contrataciones"}>
          <ButtonRegresar />
        </Link>
        <h3 className="font-bold text-3xl col-span-full text-[#2c3e50]">
          {isEditMode ? "Editar contratación" : "Agregar contratación"}
        </h3>
      </div>
      <form
        className="grid grid-cols-1 sm:grid-cols-2 gap-6"
        onSubmit={handleSubmit(onsubmit)}
      >
        {/* Tipo de Proceso (solo visible en creación) */}
        {!isEditMode && (
          <div>
            <InputLabel htmlFor="tipo_proceso" value="Tipo de Proceso *" />
            <SelectLocales id="tipo_proceso" register={register("tipo_proceso")} />
            <InputErrors errors={errors} name="tipo_proceso" />
          </div>
        )}

        {/* Tipo de Vinculación (solo visible cuando proceso === Contratacion y modo creación) */}
        {!isEditMode && tipoProceso === "Contratacion" && (
          <div>
            <InputLabel htmlFor="tipo_vinculacion" value="Tipo de Vinculación *" />
            <SelectLocales id="tipo_vinculacion" register={register("tipo_vinculacion")} />
            <InputErrors errors={errors} name="tipo_vinculacion" />
          </div>
        )}

        {/* Tipo de Contrato */}
        <div>
          <InputLabel htmlFor="tipo_contrato" value="Tipo de Contrato" />
          <SelectLocales id="tipo_contrato" register={register("tipo_contrato")} />
          <InputErrors errors={errors} name="tipo_contrato" />
        </div>

        {/* Área */}
        <div>
          <InputLabel htmlFor="area" value="Área de Contratación" />
          <SelectLocales id="area" register={register("area")} />
          <InputErrors errors={errors} name="area" />
        </div>

        {/* Fecha de inicio */}
        <div>
          <InputLabel htmlFor="fecha_inicio" value="Fecha de inicio *" />
          <TextInput
            type="date"
            id="fecha_inicio"
            {...register("fecha_inicio")}
            className="w-full border border-[rgba(30,58,95,0.09)] rounded-lg px-3 py-2 text-sm text-[#2c3e50] focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 focus:border-[#1e3a5f]"
          />
          <InputErrors errors={errors} name="fecha_inicio" />
        </div>

        {/* Fecha de fin */}
        <div>
          <InputLabel htmlFor="fecha_fin" value="Fecha de fin *" />
          <TextInput
            type="date"
            id="fecha_fin"
            {...register("fecha_fin")}
            className="w-full border border-[rgba(30,58,95,0.09)] rounded-lg px-3 py-2 text-sm text-[#2c3e50] focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 focus:border-[#1e3a5f]"
          />
          <InputErrors errors={errors} name="fecha_fin" />
        </div>

        {/* Valor del contrato */}
        <div>
          <InputLabel htmlFor="valor_contrato" value="Valor del contrato *" />
          <TextInput
            type="number"
            id="valor_contrato"
            placeholder="Valor contrato..."
            step="0.01"
            {...register("valor_contrato", { valueAsNumber: true })}
            className="w-full border border-[rgba(30,58,95,0.09)] rounded-lg px-3 py-2 text-sm text-[#2c3e50] focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 focus:border-[#1e3a5f]"
          />
          <InputErrors errors={errors} name="valor_contrato" />
        </div>

        {/* Observaciones */}
        <div className="col-span-full">
          <InputLabel htmlFor="observaciones" value="Observaciones" />
          <TextInput
            id="observaciones"
            placeholder="Observaciones (opcional)"
            {...register("observaciones")}
            className="w-full border border-[rgba(30,58,95,0.09)] rounded-lg px-3 py-2 text-sm text-[#2c3e50] focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 focus:border-[#1e3a5f]"
          />
          <InputErrors errors={errors} name="observaciones" />
        </div>

        {/* Motivo: siempre obligatorio para Administrador (creación y edición) */}
        <div className="col-span-full">
          <InputLabel
            htmlFor="motivo"
            value={
              isEditMode
                ? "Motivo del cambio * (requerido por normativa legal)"
                : "Motivo * (requerido por normativa legal)"
            }
          />
          {!isEditMode && (
            <p className="text-xs text-[#6b7a8d] mb-1">
              Justifique por qué se omite el flujo de avales de convocatoria.
            </p>
          )}
          <textarea
            id="motivo"
            placeholder={
              isEditMode
                ? "Describa el motivo de la modificación del contrato..."
                : "Describa por qué se crea esta contratación sin avales de convocatoria..."
            }
            rows={3}
            className="w-full border border-[rgba(30,58,95,0.09)] rounded-lg px-3 py-2 text-sm text-[#2c3e50] focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 focus:border-[#1e3a5f] resize-none bg-white"
            {...register("motivo")}
          />
          <InputErrors errors={errors} name="motivo" />
        </div>

        {/* Botón para agregar o actualizar contratación */}
        <div className="flex justify-center col-span-full">
          <ButtonPrimary
            value={
              isSubmitting
                ? "Procesando..."
                : isLoadingInicial
                ? "Cargando..."
                : isEditMode
                ? "Actualizar contratación"
                : "Crear contratación"
            }
            disabled={isSubmitting || isLoadingInicial}
          />
        </div>
      </form>
    </div>
  );
};

export default ContratacionAdmin;
