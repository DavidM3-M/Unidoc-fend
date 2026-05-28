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
import { contratacionSchema } from "../../../validaciones/talento-humano.ts/contratacionSchema";
import { SelectLocales } from "../../../componentes/formularios/SelectsLocales";
import quimeritoImg from "../../../assets/images/quimerito.png";

// Define la estructura de los datos del formulario
type Inputs = {
  tipo_contrato: "Planta" | "Ocasional" | "Cátedra";
  area: "Facultad de Ciencias Administrativas, Contables y Economicas" | "Facultad de Ciencias Ambientales y Desarrollo Sostenible" | "Facultad de Derecho, Ciencias Sociales y Politicas" | "Facultad de Educacion" | "Facultad de Ingenieria";

  fecha_inicio: string;
  fecha_fin: string;
  valor_contrato: number;
  observaciones: string; // Campo opcional
};

const Contratacion = () => {
  const { id } = useParams(); // Obtiene el ID desde los parámetros de la URL
  const navigate = useNavigate(); // Función para redirigir navegaciones
  const [isContratacionRegistered, setIsContratacionRegistered] =
    useState(false); // Estado para verificar si existe una contratación previa
  const [isSubmitting, setIsSubmitting] = useState(false); // Estado para manejar la acción de envío del formulario

  // Configuración de React Hook Form
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<Inputs>({
    resolver: zodResolver(contratacionSchema), // Esquema de validación usando Zod
  });

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
    const requestData = {
      tipo_contrato: data.tipo_contrato,
      area: data.area,
      fecha_inicio: data.fecha_inicio,
      fecha_fin: data.fecha_fin,
      valor_contrato: data.valor_contrato,
      observaciones: data.observaciones || null,
    };

    // Determina la URL y el método HTTP según si es una actualización o creación
    const url = isContratacionRegistered
      ? `/talentoHumano/actualizar-contratacion/${id}`
      : `/talentoHumano/crear-contratacion/${id}`;

    const method = isContratacionRegistered ? "PUT" : "POST";

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
          pending: isContratacionRegistered
            ? "Actualizando contratación..."
            : "Creando contratación...",
          success: {
            render() {
              setTimeout(() => {
                navigate("/talento-humano/contrataciones"); // Redirige después del éxito
              }, 1500);
              return isContratacionRegistered
                ? "Contratación actualizada con éxito"
                : "Contratación creada con éxito";
            },
            autoClose: 1500,
          },
          error: isContratacionRegistered
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
    <div className="min-h-screen p-4 md:p-6 lg:p-8" style={{ position: "relative", overflow: "hidden" }}>
      <div style={{ position: "fixed", inset: 0, backgroundImage: `url(${quimeritoImg})`, backgroundSize: "cover", backgroundPosition: "center top", backgroundRepeat: "no-repeat", zIndex: 0 }} />
      <div style={{ position: "fixed", inset: 0, background: "linear-gradient(135deg, rgba(25,64,123,0.88) 0%, rgba(0,117,191,0.80) 50%, rgba(8,173,207,0.75) 100%)", zIndex: 1 }} />
      <div className="max-w-4xl mx-auto" style={{ position: "relative", zIndex: 2 }}>
    <div className="flex flex-col p-8 rounded-2xl gap-y-4" style={{ background: "rgba(255,255,255,0.13)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.25)", boxShadow: "0 8px 32px rgba(25,64,123,0.25)" }}>
      <div className="flex gap-x-4 col-span-full items-center">
        <Link to={"/talento-humano/contrataciones"}>
          <ButtonRegresar /> {/* Botón para regresar */}
        </Link>
        <h3 className="font-bold text-3xl col-span-full text-white drop-shadow">
          {isContratacionRegistered
            ? "Editar contratación" // Muestra si está editando una contratación
            : "Agregar contratación"}{" "}
          {/* Muestra si está creando una nueva contratación */}
        </h3>
      </div>
      <form
        className="grid grid-cols-1 sm:grid-cols-2 gap-6"
        onSubmit={handleSubmit(onsubmit)} // Maneja el envío del formulario
      >
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
    </div>
    </div>
  );
};

export default Contratacion;