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
  contratacionSchema,
  contratacionSchemaUpdate,
} from "../../../validaciones/talento-humano.ts/contratacionSchema";
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
  motivo?: string;
};

const Contratacion = () => {
  const { id } = useParams(); // Obtiene el ID desde los parámetros de la URL
  const navigate = useNavigate(); // Función para redirigir navegaciones
  // Si la URL tiene un `id`, estamos en modo edición (el backend retornará la contratación)
  const [isContratacionRegistered, setIsContratacionRegistered] =
    useState(false); // Se activa cuando el backend confirma que existe contratación
  const isEditMode = !!id; // Conocido desde el inicio vía URL
  const [isSubmitting, setIsSubmitting] = useState(false); // Estado para manejar la acción de envío del formulario

  // Configuración de React Hook Form — usamos el esquema de actualización si el ID está en la URL
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<Inputs>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver((isEditMode ? contratacionSchemaUpdate : contratacionSchema) as any),
    defaultValues: {
      tipo_proceso: "Contratacion",
      tipo_vinculacion: "Docente",
    },
  });

  const tipoProceso = watch("tipo_proceso");

  // Función para obtener los datos de la contratación desde el backend
  const fetchDatos = async () => {
    if (!id) return; // Si no hay ID, no hace nada

    try {
      const response = await axiosInstance.get(
        `/talentoHumano/obtener-contratacion/${id}`
      );
      const data = response.data.contratacion;

      // Rellena el formulario con los datos obtenidos
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
    }
  };

  // Llama a la función fetchDatos cuando el componente se monta o el ID cambia
  useEffect(() => {
    if (id) fetchDatos();
  }, [id]);

  // Función para manejar el envío del formulario
  const onsubmit = async (data: Inputs) => {
    setIsSubmitting(true); // Cambia el estado de envío a "true"

    // Datos que se enviarán al backend
    const requestData: Record<string, unknown> = {
      tipo_proceso: data.tipo_proceso,
      tipo_vinculacion: data.tipo_vinculacion,
      tipo_contrato: data.tipo_contrato,
      area: data.area,
      fecha_inicio: data.fecha_inicio,
      fecha_fin: data.fecha_fin,
      valor_contrato: data.valor_contrato,
      observaciones: data.observaciones || null,
    };

    if (isEditMode && data.motivo) {
      requestData.motivo = data.motivo;
    }

    // Determina la URL y el método HTTP según si es una actualización o creación
    const url = isEditMode
      ? `/talentoHumano/actualizar-contratacion/${id}`
      : `/talentoHumano/crear-contratacion/${id}`;

    const method = isEditMode ? "PUT" : "POST";

    try {
      // Envía la solicitud al backend y muestra mensajes de estado usando `toast`
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
                navigate("/talento-humano/contrataciones"); // Redirige después del éxito
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
      setIsSubmitting(false); // Cambia el estado de envío a "false"
    }
  };

  // Renderiza el formulario
  return (
    <div className="flex flex-col bg-white p-8 rounded-xl shadow-md w-full max-w-4xl gap-y-4">
      <div className="flex gap-x-4 col-span-full items-center">
        <Link to={"/talento-humano/contrataciones"}>
          <ButtonRegresar /> {/* Botón para regresar */}
        </Link>
        <h3 className="font-bold text-3xl col-span-full">
          {isEditMode
            ? "Editar contratación" // Muestra si está editando una contratación
            : "Agregar contratación"}{" "}
          {/* Muestra si está creando una nueva contratación */}
        </h3>
      </div>
      <form
        className="grid grid-cols-1 sm:grid-cols-2 gap-6"
        onSubmit={handleSubmit(onsubmit)} // Maneja el envío del formulario
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
          <SelectLocales
            id="tipo_contrato"
            register={register("tipo_contrato")}
          />
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
          />
          <InputErrors errors={errors} name="fecha_inicio" />
        </div>

        {/* Fecha de fin */}
        <div>
          <InputLabel htmlFor="fecha_fin" value="Fecha de fin *" />
          <TextInput type="date" id="fecha_fin" {...register("fecha_fin")} />
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
          />
          <InputErrors errors={errors} name="observaciones" />
        </div>

        {/* Motivo del cambio (requerido legalmente en modo edición) */}
        {isEditMode && (
          <div className="col-span-full">
            <InputLabel
              htmlFor="motivo"
              value="Motivo del cambio * (requerido por normativa legal)"
            />
            <textarea
              id="motivo"
              placeholder="Describa el motivo de la modificación del contrato..."
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              {...register("motivo")}
            />
            <InputErrors errors={errors} name="motivo" />
          </div>
        )}

        {/* Botón para agregar o actualizar contratación */}
        <div className="flex justify-center col-span-full">
          <ButtonPrimary
            value={
              isSubmitting
                ? "Procesando..."
                : isContratacionRegistered
                ? "Actualizar contratación"
                : "Crear contratación"
            }
            disabled={isSubmitting}
          />
        </div>
      </form>
    </div>
  );
};

export default Contratacion;
