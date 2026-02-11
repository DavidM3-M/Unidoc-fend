"use client";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "../validaciones/registerSchema";
import axios from "axios";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import React from "react";

import { SelectForm } from "../componentes/formularios/SelectForm";
import { LabelRadio } from "../componentes/formularios/LabelRadio";
import { InputLabel } from "../componentes/formularios/InputLabel";
import TextInput from "../componentes/formularios/TextInput";
import InputErrors from "../componentes/formularios/InputErrors";
import { SelectFormUbicaciones } from "../componentes/formularios/SelectFormUbicacion";
import InputPassword from "../componentes/formularios/InputPassword";
import AnimatedWavesBackground from "../componentes/AnimatedWavesBackground";
import { useLanguage } from "../context/LanguageContext";

type Inputs = {
  primer_nombre: string;
  primer_apellido: string;
  segundo_nombre?: string;
  segundo_apellido?: string;
  pais: number;
  departamento: number;
  municipio_id: number;
  email: string;
  password: string;
  password_confirmation: string;
  fecha_nacimiento: string;
  genero: "Masculino" | "Femenino" | "Otro";
  tipo_identificacion: string;
  numero_identificacion: string;
  estado_civil: string;
};

const Registro = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  //Url de la API
  const url = import.meta.env.VITE_API_URL + "/auth/registrar-usuario";

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    formState: { errors },
  } = useForm<Inputs>({
    mode: "onChange",
    resolver: zodResolver(registerSchema),
  });

  // Estado para el paso del formulario
  const [step, setStep] = React.useState(1);

  // Validacion de los campos del formulario
  const validateStep = async () => {
    if (step === 1) {
      return await trigger([
        "primer_nombre",
        "segundo_nombre",
        "primer_apellido",
        "segundo_apellido",
      ]);
    }
    if (step === 2) {
      return await trigger(["tipo_identificacion", "numero_identificacion"]);
    }
    if (step === 3) {
      return await trigger(["estado_civil", "fecha_nacimiento", "genero"]);
    }
    if (step === 4) {
      return await trigger(["pais", "departamento", "municipio_id"]);
    }
    if (step === 5) {
      return await trigger(["email", "password", "password_confirmation"]);
    }
    return true;
  };

  // Validar y pasar al siguiente paso
  const handleNext = async () => {
    const isValid = await validateStep();
    if (isValid) {
      setStep((prev) => prev + 1);
    }
  };

  // Manejo del paso anterior del formulario
  const handlePrev = () => {
    setStep((prev) => prev - 1);
  };

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    const { password_confirmation, pais, departamento, ...formData } = data;

    const registroPromise = axios.post(url, formData, {
      // Cabeceras de la petición
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 10000,
    });

    // Manejo de la respuesta usando toast.promise
    toast.promise(registroPromise, {
      pending: "Registrando... Por favor espera.",
      success: {
        render() {
          // Si la respuesta es exitosa, redirigimos y mostramos el mensaje
          return "¡Bienvenido! Redirigiendo...";
        },
        autoClose: 1000,
        onClose: () => navigate("/"), // Redirige a la página principal
      },
      error: {
        render({ data }) {
          let errorMessage = "Error al registrar";

          if (axios.isAxiosError(data)) {
            if (data.code === "ECONNABORTED") {
              errorMessage = "Tiempo de espera agotado. Intente nuevamente";
            } else if (data.response) {
              switch (data.response.status) {
                case 422:
                  errorMessage =
                    "Email ya existe o numero de identificación ya existe";

                  break;
                case 500:
                  errorMessage = `Error en el servidor: ${
                    data.response.data?.message || "Error desconocido"
                  }`;

                  break;
                default:
                  errorMessage = "Error desconocido";
              }
            } else {
              errorMessage = "Error desconocido";
            }
          }

          return errorMessage;
        },
        autoClose: 5000,
      },
    });
  };

  const paisSeleccionado = watch("pais");
  const departamentoSeleccionado = watch("departamento");

  return (
    <>
      <AnimatedWavesBackground />
      <div className="flex flex-col items-center justify-center min-h-screen relative z-10 p-3 py-6">
        <div className="flex bg-white/90 backdrop-blur-md flex-col gap-6 px-6 py-6 w-full sm:w-[500px] md:w-[550px] items-center justify-center shadow-2xl rounded-2xl border border-white/30 max-h-[85vh] overflow-y-auto">
          <div className="flex flex-col gap-x-2 w-full justify-between">
            <h3 className="font-bold text-xl sm:text-2xl text-gray-800 text-center">{t("register.title")}</h3>
          </div>
        <form className="flex flex-col gap-4 w-full" onSubmit={handleSubmit(onSubmit)}>
          <div className="">
            {step === 1 && (
              <>
                <div className="flex flex-col gap-4">
                  <div className="font-semibold text-xl">
                    <h3>{t("register.step1.title")}</h3>
                  </div>
                  <div className="">
                    <InputLabel htmlFor="primer_nombre" value={t("register.firstName")} />
                    <TextInput
                      id="primer_nombre"
                      type="text"
                      placeholder={t("register.firstName")}
                      {...register("primer_nombre")}
                    />
                    <InputErrors errors={errors} name="primer_nombre" />
                  </div>

                  <div className="">
                    <InputLabel
                      htmlFor="segundo_nombre"
                      value={t("register.secondName")}
                    />
                    <TextInput
                      id="segundo_nombre"
                      type="text"
                      placeholder={t("register.secondName")}
                      {...register("segundo_nombre")}
                    />
                    <InputErrors errors={errors} name="segundo_nombre" />
                  </div>

                  <div className="">
                    <InputLabel
                      htmlFor="primer_apellido"
                      value={t("register.firstLastName")}
                    />
                    <TextInput
                      id="primer_apellido"
                      type="text"
                      placeholder={t("register.firstLastName")}
                      {...register("primer_apellido")}
                    />
                    <InputErrors errors={errors} name="primer_apellido" />
                  </div>

                  <div className="">
                    <InputLabel
                      htmlFor="segundo_apellido"
                      value={t("register.secondLastName")}
                    />
                    <TextInput
                      id="segundo_apellido"
                      type="text"
                      placeholder={t("register.secondLastName")}
                      {...register("segundo_apellido")}
                    />
                    <InputErrors errors={errors} name="segundo_apellido" />
                  </div>
                </div>
              </>
            )}
            {step === 2 && (
              <div className="flex flex-col gap-4">
                <div className="font-semibold text-xl">
                  <h3>{t("register.step2.title")}</h3>
                </div>
                <div className="">
                  <InputLabel
                    htmlFor="tipo_identificacion"
                    value={t("register.idType")}
                  />
                  <SelectForm
                    id="tipo_identificacion"
                    register={register("tipo_identificacion")}
                    url="tipos-documento"
                    data_url="tipos_documento"
                  />
                  <InputErrors errors={errors} name="tipo_identificacion" />
                </div>

                <div className="">
                  <InputLabel
                    htmlFor="identificación"
                    value={t("register.idNumber")}
                  />
                  <TextInput
                    id="numero_identificacion"
                    type="number"
                    placeholder={t("register.idNumber")}
                    {...register("numero_identificacion")}
                  />
                  <InputErrors errors={errors} name="numero_identificacion" />
                </div>
              </div>
            )}

            {step === 3 && (
              <>
                <div className="flex flex-col gap-4">
                  <div className="font-semibold text-xl">
                    <h3>{t("register.step3.title")}</h3>
                  </div>
                  <div className="">
                    <InputLabel htmlFor="estado_civil" value={t("register.civilStatus")} />
                    <SelectForm
                      id="estado_civil"
                      register={register("estado_civil")}
                      url="estado-civil"
                      data_url="estado_civil"
                    />

                    <InputErrors errors={errors} name="estado_civil" />
                  </div>
                  <div className="">
                    <InputLabel
                      htmlFor="fecha_nacimiento"
                      value={t("register.birthDate")}
                    />
                    <TextInput
                      id="fecha_nacimiento"
                      type="date"
                      {...register("fecha_nacimiento")}
                    />
                    <InputErrors errors={errors} name="fecha_nacimiento" />
                  </div>

                  <div className="">
                    <InputLabel htmlFor="genero" value={t("register.gender")} />

                    <div className="flex flex-row flex-wrap gap-4 h-10 w-full rounded-lg border-[1.8px] 
            border-gray-200 shadow-sm p-2 text-sm text-slate-900">
                      <LabelRadio
                        htmlFor="genero-masculino"
                        value="Masculino"
                        inputProps={register("genero")}
                        label={t("register.male")}
                      />
                      <LabelRadio
                        htmlFor="genero-femenino"
                        value="Femenino"
                        inputProps={register("genero")}
                        label={t("register.female")}
                      />
                      <LabelRadio
                        htmlFor="genero-otro"
                        value="Otro"
                        inputProps={register("genero")}
                        label={t("register.other")}
                      />
                    </div>
                    <InputErrors errors={errors} name="genero" />
                  </div>
                </div>
              </>
            )}
            {step === 4 && (
              <>
                <div className="flex flex-col gap-4">
                  <div className="font-semibold text-xl">
                    <h3>{t("register.step4.title")}</h3>
                  </div>
                  <div>
                    <InputLabel htmlFor="pais" value={t("register.country")} />
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
                    <InputLabel htmlFor="departamento" value={t("register.department")} />
                    <SelectFormUbicaciones
                      id="departamento"
                      register={register("departamento", {
                        valueAsNumber: true,
                        required: true,
                      })}
                      parentId={paisSeleccionado}
                      disabled={!paisSeleccionado}
                      url="departamentos"
                    />
                    <InputErrors errors={errors} name="departamento" />
                  </div>

                  <div>
                    <InputLabel htmlFor="municipio_id" value={t("register.municipality")} />
                    <SelectFormUbicaciones
                      id="municipio_id"
                      register={register("municipio_id", {
                        valueAsNumber: true,
                        required: true,
                      })}
                      parentId={departamentoSeleccionado}
                      disabled={!departamentoSeleccionado}
                      url="municipios"
                    />
                    <InputErrors errors={errors} name="municipio_id" />
                  </div>
                </div>
              </>
            )}
            {step === 5 && (
              <>
                <div className="flex flex-col gap-4">
                  <div className="font-semibold text-xl">
                    <h3>{t("register.step5.title")}</h3>
                  </div>
                  <div className="">
                    <InputLabel htmlFor="email" value={t("register.email")} />
                    <TextInput
                      id="email"
                      type="text"
                      placeholder={t("register.email")}
                      {...register("email")}
                    />
                    <InputErrors errors={errors} name="email" />
                  </div>

                  <div className="">
                    <InputLabel htmlFor="password" value={t("register.password")} />
                    <InputPassword
                      id="password"
                      type="password"
                      placeholder={t("register.password")}
                      {...register("password")}
                    />
                    <InputErrors errors={errors} name="password" />
                  </div>
                  <div className="">
                    <InputLabel
                      htmlFor="password_confirmation"
                      value={t("register.passwordConfirm")}
                    />
                    <InputPassword
                      id="password_confirmation"
                      type="password"
                      placeholder={t("register.passwordConfirm")}
                      {...register("password_confirmation")}
                    />
                    <InputErrors errors={errors} name="password_confirmation" />
                  </div>
                </div>
              </>
            )}
          </div>
          <div className="flex justify-center gap-3 flex-wrap">
            {step > 1 && (
              <button
                className="bg-gradient-to-r from-gray-600 to-gray-500 hover:from-gray-700 hover:to-gray-600 text-white font-semibold py-3 px-6 sm:px-10 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 text-sm sm:text-base"
                onClick={handlePrev}
                type="button"
              >
                {t("register.prev")}
              </button>
            )}
            {step < 5 && (
              <button
                className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold py-3 px-6 sm:px-10 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 text-sm sm:text-base"
                onClick={handleNext}
                type="button"
              >
                {t("register.next")}
              </button>
            )}
            {step === 5 && (
              <button
                className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-semibold py-3 px-6 sm:px-10 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 text-sm sm:text-base"
                type="submit"
              >
                {t("register.submit")}
              </button>
            )}
          </div>
          <p className="text-xs sm:text-sm text-gray-600 text-center">
            {t("register.hasAccount")} {" "}
            <Link
              to="/inicio-sesion"
              className="text-blue-600 hover:text-blue-700 transition-colors font-bold"
            >
              {t("register.login")}
            </Link>
          </p>
        </form>
        </div>
      </div>
    </>
  );
};
export default Registro;
