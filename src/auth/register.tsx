import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "../validaciones/registerSchema";
import axios from "axios";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { useCallback, useRef, useState } from "react";

import { SelectForm } from "../componentes/formularios/SelectForm";
import { LabelRadio } from "../componentes/formularios/LabelRadio";
import { InputLabel } from "../componentes/formularios/InputLabel";
import TextInput from "../componentes/formularios/TextInput";
import InputErrors from "../componentes/formularios/InputErrors";
import { SelectFormUbicaciones } from "../componentes/formularios/SelectFormUbicacion";
import InputPassword from "../componentes/formularios/InputPassword";
import AnimatedWavesBackground from "../componentes/AnimatedWavesBackground";
import { useLanguage } from "../context/useLanguage";

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

/** Campos que se consultan contra el servidor para saber si ya están tomados. */
type CampoUnico = "numero_identificacion" | "email";

/** Estado de esa consulta, por campo. */
type EstadoUnico = "reposo" | "consultando" | "libre" | "tomado";

const CAMPOS_POR_PASO: Record<number, Array<keyof Inputs>> = {
  1: ["primer_nombre", "segundo_nombre", "primer_apellido", "segundo_apellido"],
  2: ["tipo_identificacion", "numero_identificacion"],
  3: ["estado_civil", "fecha_nacimiento", "genero"],
  4: ["pais", "departamento", "municipio_id"],
  5: ["email", "password", "password_confirmation"],
};

const TOTAL_PASOS = 5;

const Registro = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const url = import.meta.env.VITE_API_URL + "/auth/registrar-usuario";
  const urlDisponibilidad = import.meta.env.VITE_API_URL + "/auth/verificar-disponibilidad";

  const [paso, setPaso] = useState(1);
  const [enviando, setEnviando] = useState(false);
  const [intentado, setIntentado] = useState(false);

  const [unico, setUnico] = useState<Record<CampoUnico, EstadoUnico>>({
    numero_identificacion: "reposo",
    email: "reposo",
  });

  // Última consulta lanzada por campo: si el usuario sigue escribiendo, la respuesta de una
  // consulta vieja no debe pisar el estado de la nueva.
  const consulta = useRef<Record<CampoUnico, number>>({
    numero_identificacion: 0,
    email: 0,
  });

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<Inputs>({
    // Al salir del campo, no en cada tecla: con `onChange` el error saltaba a la primera letra.
    mode: "onTouched",
    resolver: zodResolver(registerSchema),
  });

  const etiquetas: Record<string, string> = {
    primer_nombre: t("register.firstName"),
    segundo_nombre: t("register.secondName"),
    primer_apellido: t("register.firstLastName"),
    segundo_apellido: t("register.secondLastName"),
    tipo_identificacion: t("register.idType"),
    numero_identificacion: t("register.idNumber"),
    estado_civil: t("register.civilStatus"),
    fecha_nacimiento: t("register.birthDate"),
    genero: t("register.gender"),
    pais: t("register.country"),
    departamento: t("register.department"),
    municipio_id: t("register.municipality"),
    email: t("register.email"),
    password: t("register.password"),
    password_confirmation: t("register.passwordConfirm"),
  };

  /** Paso en el que vive cada campo, para poder volver a él cuando el servidor lo rechaza. */
  const pasoDelCampo = (campo: string): number => {
    const encontrado = Object.entries(CAMPOS_POR_PASO).find(([, campos]) =>
      (campos as string[]).includes(campo)
    );
    return encontrado ? Number(encontrado[0]) : 1;
  };

  const enfocarCampo = (campo: string) => {
    // Se espera al repintado del paso antes de buscar el elemento.
    window.setTimeout(() => {
      const elemento =
        document.getElementById(campo) ??
        document.querySelector<HTMLElement>(`[name="${campo}"]`);
      elemento?.focus({ preventScroll: true });
      elemento?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 60);
  };

  /**
   * Pregunta al servidor si el valor ya está registrado.
   *
   * Se lanza al salir del campo. Antes esto solo se sabía al terminar los cinco pasos y enviar,
   * porque la unicidad la comprueba el `unique:users` del backend: el usuario llenaba todo el
   * formulario para que le rechazaran un dato del paso 2.
   */
  const comprobarDisponibilidad = useCallback(
    async (campo: CampoUnico, valor: string) => {
      const limpio = (valor ?? "").trim();

      if (!limpio) {
        setUnico((s) => ({ ...s, [campo]: "reposo" }));
        return;
      }

      const marca = ++consulta.current[campo];
      setUnico((s) => ({ ...s, [campo]: "consultando" }));

      try {
        const { data } = await axios.post(
          urlDisponibilidad,
          { campo, valor: limpio },
          { headers: { "Content-Type": "application/json" }, timeout: 8000 }
        );

        // Llegó tarde: ya hay una consulta más nueva en marcha.
        if (marca !== consulta.current[campo]) return;

        if (data?.disponible) {
          setUnico((s) => ({ ...s, [campo]: "libre" }));
          if (errors[campo]?.type === "tomado") clearErrors(campo);
        } else {
          setUnico((s) => ({ ...s, [campo]: "tomado" }));
          setError(campo, {
            type: "tomado",
            message:
              campo === "email"
                ? "Este correo ya está registrado. ¿Quieres iniciar sesión?"
                : "Este número de identificación ya está registrado.",
          });
        }
      } catch {
        // Si la consulta falla no se bloquea a nadie: el servidor volverá a comprobarlo al
        // registrar, que es donde la unicidad se garantiza de verdad.
        if (marca === consulta.current[campo]) {
          setUnico((s) => ({ ...s, [campo]: "reposo" }));
        }
      }
    },
    [urlDisponibilidad, setError, clearErrors, errors]
  );

  const validarPaso = async () => {
    const ok = await trigger(CAMPOS_POR_PASO[paso]);
    if (!ok) return false;

    // En el paso 2 y en el 5 no basta con el formato: hay que esperar al veredicto del servidor.
    const porComprobar = (CAMPOS_POR_PASO[paso] as string[]).filter(
      (c): c is CampoUnico => c === "numero_identificacion" || c === "email"
    );

    for (const campo of porComprobar) {
      if (unico[campo] === "consultando") return false;
      if (unico[campo] === "tomado") {
        enfocarCampo(campo);
        return false;
      }
      // Aún no se consultó (por ejemplo si se pegó el valor y se pulsó sin salir del campo).
      if (unico[campo] === "reposo") {
        await comprobarDisponibilidad(campo, watch(campo) as string);
        return false;
      }
    }

    return true;
  };

  const siguiente = async () => {
    setIntentado(true);
    if (await validarPaso()) {
      setIntentado(false);
      setPaso((p) => Math.min(TOTAL_PASOS, p + 1));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const anterior = () => {
    setIntentado(false);
    setPaso((p) => Math.max(1, p - 1));
  };

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    setEnviando(true);

    // `password_confirmation` no viaja: el servidor no usa la regla `confirmed`. `pais` y
    // `departamento` tampoco: solo acotan el selector de municipio.
    const { password_confirmation, pais, departamento, ...formData } = data;
    void password_confirmation;
    void pais;
    void departamento;

    try {
      await axios.post(url, formData, {
        headers: { "Content-Type": "application/json" },
        timeout: 10000,
      });

      toast.success("¡Bienvenido! Redirigiendo...", { autoClose: 1000 });
      setTimeout(() => navigate("/"), 1000);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.code === "ECONNABORTED") {
          toast.error("Tiempo de espera agotado. Intenta de nuevo.");
        } else if (error.response?.status === 422) {
          // Antes esto era un aviso flotante con el PRIMER error y nada más: si lo repetido era
          // la cédula del paso 2, había que adivinarlo y volver a mano. Ahora cada mensaje se
          // pega a su campo y el asistente salta al paso donde está.
          const delServidor = error.response.data?.errors as
            | Record<string, string[]>
            | undefined;

          if (delServidor && Object.keys(delServidor).length > 0) {
            Object.entries(delServidor).forEach(([campo, mensajes]) => {
              if (campo in etiquetas) {
                setError(campo as keyof Inputs, {
                  type: "server",
                  message: mensajes?.[0] ?? "Dato no válido",
                });
              }
            });

            const primero = Object.keys(delServidor).find((c) => c in etiquetas);
            if (primero) {
              setIntentado(true);
              setPaso(pasoDelCampo(primero));
              enfocarCampo(primero);
            }
            toast.error("Revisa los datos marcados en rojo.");
          } else {
            toast.error("No se pudo crear la cuenta. Revisa los datos.");
          }
        } else if (error.response?.status === 500) {
          toast.error("Error en el servidor. Intenta más tarde.");
        } else {
          toast.error("No se pudo crear la cuenta.");
        }
      } else {
        toast.error("No se pudo crear la cuenta.");
      }
    } finally {
      setEnviando(false);
    }
  };

  const paisSeleccionado = watch("pais");
  const departamentoSeleccionado = watch("departamento");
  const municipioSeleccionado = watch("municipio_id");

  const erroresDelPaso = (CAMPOS_POR_PASO[paso] as string[]).filter((c) => c in errors);

  const tituloPaso = [
    t("register.step1.title"),
    t("register.step2.title"),
    t("register.step3.title"),
    t("register.step4.title"),
    t("register.step5.title"),
  ][paso - 1];

  const nombresPasos = ["Nombre", "Documento", "Datos", "Ubicación", "Cuenta"];

  /** Pista bajo un campo con consulta de disponibilidad en curso o resuelta. */
  const PistaUnico = ({ campo }: { campo: CampoUnico }) => {
    if (unico[campo] === "consultando") {
      return (
        <p className="mt-2 flex items-center gap-2 text-xs text-[var(--color-muted)]">
          <span className="inline-block size-3 rounded-full border-2 border-[rgba(30,58,95,0.25)] border-t-[var(--color-navy)] animate-spin" />
          Comprobando…
        </p>
      );
    }
    if (unico[campo] === "libre") {
      return <p className="mt-2 text-xs font-semibold text-[#2f7d54]">Disponible</p>;
    }
    return null;
  };

  return (
    <>
      <AnimatedWavesBackground />

      <div className="relative z-10 w-full min-h-dvh flex items-center justify-center px-4 py-6 font-[var(--font-base)]">
        {/* Sin `max-h` ni `overflow-y-auto`: era lo que metía una barra de desplazamiento
            DENTRO del recuadro. La tarjeta crece y se desplaza la página. */}
        <div className="w-full max-w-[460px] sm:max-w-[560px] bg-white rounded-2xl shadow-2xl border border-[var(--color-border)] p-6 sm:p-9 flex flex-col gap-6">

          <header className="flex flex-col items-center gap-1">
            <h1 className="font-[var(--font-hero)] font-black text-[26px] sm:text-[30px] leading-tight text-center text-[var(--color-navy)] tracking-tight">
              {t("register.title")}
            </h1>
            <p className="text-xs text-[var(--color-muted)] font-medium">
              Paso {paso} de {TOTAL_PASOS}
            </p>
          </header>

          {/* Escalera: dónde estás, qué queda y qué ya está hecho. */}
          <nav aria-label="Progreso del registro" className="flex items-center">
            {nombresPasos.map((nombre, i) => {
              const n = i + 1;
              const hecho = n < paso;
              const actual = n === paso;
              return (
                <div key={nombre} className="flex items-center flex-1 min-w-0 last:flex-none">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      aria-current={actual ? "step" : undefined}
                      className={`grid place-items-center size-7 flex-shrink-0 rounded-full text-[11px] font-extrabold transition-colors ${
                        hecho
                          ? "bg-[#2f7d54] text-white"
                          : actual
                          ? "bg-[var(--color-navy)] text-white ring-4 ring-[rgba(30,58,95,0.14)]"
                          : "bg-[#eef1f5] text-[#9aa7b5]"
                      }`}
                    >
                      {hecho ? "✓" : n}
                    </span>
                    <span
                      className={`hidden sm:block text-[11px] font-semibold truncate ${
                        actual
                          ? "text-[var(--color-navy)]"
                          : hecho
                          ? "text-[var(--color-text)]"
                          : "text-[#9aa7b5]"
                      }`}
                    >
                      {nombre}
                    </span>
                  </div>
                  {n < TOTAL_PASOS && (
                    <span
                      className={`flex-1 h-0.5 mx-2 min-w-[8px] rounded-full ${
                        hecho ? "bg-[#2f7d54]" : "bg-[#e6eaef]"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </nav>

          {/* Resumen del paso, solo tras intentar avanzar. */}
          {intentado && erroresDelPaso.length > 0 && (
            <div
              role="alert"
              className="rounded-xl border border-[rgba(179,65,58,0.28)] bg-[#fdf4f3] px-4 py-3"
            >
              <p className="text-sm font-bold text-[#b3413a] mb-1.5">
                {erroresDelPaso.length === 1
                  ? "Falta 1 dato en este paso"
                  : `Faltan ${erroresDelPaso.length} datos en este paso`}
              </p>
              <ul className="flex flex-col gap-1">
                {erroresDelPaso.map((campo) => (
                  <li key={campo} className="text-xs text-[#8f3a34]">
                    <button
                      type="button"
                      onClick={() => enfocarCampo(campo)}
                      className="underline font-semibold hover:text-[#b3413a] cursor-pointer"
                    >
                      {etiquetas[campo] ?? campo}
                    </button>
                    {errors[campo as keyof Inputs]?.message
                      ? ` — ${errors[campo as keyof Inputs]?.message}`
                      : ""}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)} noValidate>
            <h2 className="font-bold text-lg text-[var(--color-navy)]">{tituloPaso}</h2>

            {/* ── 1 · Nombre ─────────────────────────────────────── */}
            {paso === 1 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
                <div>
                  <InputLabel htmlFor="primer_nombre" value={t("register.firstName")} />
                  <TextInput
                    id="primer_nombre"
                    type="text"
                    autoComplete="given-name"
                    placeholder={t("register.firstName")}
                    {...register("primer_nombre")}
                  />
                  <InputErrors errors={errors} name="primer_nombre" />
                </div>
                <div>
                  <InputLabel htmlFor="segundo_nombre" value={t("register.secondName")} />
                  <TextInput
                    id="segundo_nombre"
                    type="text"
                    autoComplete="additional-name"
                    placeholder={t("register.secondName")}
                    {...register("segundo_nombre")}
                  />
                  <InputErrors errors={errors} name="segundo_nombre" />
                </div>
                <div>
                  <InputLabel htmlFor="primer_apellido" value={t("register.firstLastName")} />
                  <TextInput
                    id="primer_apellido"
                    type="text"
                    autoComplete="family-name"
                    placeholder={t("register.firstLastName")}
                    {...register("primer_apellido")}
                  />
                  <InputErrors errors={errors} name="primer_apellido" />
                </div>
                <div>
                  <InputLabel htmlFor="segundo_apellido" value={t("register.secondLastName")} />
                  <TextInput
                    id="segundo_apellido"
                    type="text"
                    autoComplete="off"
                    placeholder={t("register.secondLastName")}
                    {...register("segundo_apellido")}
                  />
                  <InputErrors errors={errors} name="segundo_apellido" />
                </div>
              </div>
            )}

            {/* ── 2 · Documento ──────────────────────────────────── */}
            {paso === 2 && (
              <div className="flex flex-col gap-4">
                <div>
                  <InputLabel htmlFor="tipo_identificacion" value={t("register.idType")} />
                  <SelectForm
                    id="tipo_identificacion"
                    register={register("tipo_identificacion")}
                    url="tipos-documento"
                    data_url="tipos_documento"
                  />
                  <InputErrors errors={errors} name="tipo_identificacion" />
                </div>
                <div>
                  <InputLabel htmlFor="numero_identificacion" value={t("register.idNumber")} />
                  {/* Era `type="number"`: la rueda del ratón cambiaba el valor sin querer y un
                      documento no es una cantidad. Texto con teclado numérico. */}
                  <TextInput
                    id="numero_identificacion"
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    placeholder={t("register.idNumber")}
                    {...register("numero_identificacion", {
                      onBlur: (e) =>
                        comprobarDisponibilidad("numero_identificacion", e.target.value),
                      onChange: () =>
                        setUnico((s) => ({ ...s, numero_identificacion: "reposo" })),
                    })}
                  />
                  <InputErrors errors={errors} name="numero_identificacion" />
                  <PistaUnico campo="numero_identificacion" />
                </div>
              </div>
            )}

            {/* ── 3 · Datos personales ───────────────────────────── */}
            {paso === 3 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
                <div>
                  <InputLabel htmlFor="estado_civil" value={t("register.civilStatus")} />
                  <SelectForm
                    id="estado_civil"
                    register={register("estado_civil")}
                    url="estado-civil"
                    data_url="estado_civil"
                  />
                  <InputErrors errors={errors} name="estado_civil" />
                </div>
                <div>
                  <InputLabel htmlFor="fecha_nacimiento" value={t("register.birthDate")} />
                  <TextInput
                    id="fecha_nacimiento"
                    type="date"
                    autoComplete="bday"
                    {...register("fecha_nacimiento")}
                  />
                  <InputErrors errors={errors} name="fecha_nacimiento" />
                </div>
                <div className="sm:col-span-2">
                  <InputLabel htmlFor="genero-masculino" value={t("register.gender")} />
                  <div className="flex flex-row flex-wrap items-center gap-5 h-12 w-full rounded-xl border border-[rgba(30,58,95,0.15)] shadow-sm px-3 text-sm text-[var(--color-text)] bg-white">
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
            )}

            {/* ── 4 · Ubicación ──────────────────────────────────── */}
            {paso === 4 && (
              <div className="flex flex-col gap-4">
                <div>
                  <InputLabel htmlFor="pais" value={t("register.country")} />
                  <SelectFormUbicaciones
                    id="pais"
                    register={register("pais", { valueAsNumber: true, required: true })}
                    value={paisSeleccionado}
                    url="paises"
                  />
                  <InputErrors errors={errors} name="pais" />
                </div>
                <div>
                  <InputLabel htmlFor="departamento" value={t("register.department")} />
                  <SelectFormUbicaciones
                    id="departamento"
                    register={register("departamento", { valueAsNumber: true, required: true })}
                    parentId={paisSeleccionado}
                    disabled={!paisSeleccionado}
                    value={departamentoSeleccionado}
                    url="departamentos"
                  />
                  <InputErrors errors={errors} name="departamento" />
                </div>
                <div>
                  <InputLabel htmlFor="municipio_id" value={t("register.municipality")} />
                  <SelectFormUbicaciones
                    id="municipio_id"
                    register={register("municipio_id", { valueAsNumber: true, required: true })}
                    parentId={departamentoSeleccionado}
                    parentRequired
                    disabled={!departamentoSeleccionado}
                    value={municipioSeleccionado}
                    url="municipios"
                  />
                  <InputErrors errors={errors} name="municipio_id" />
                </div>
              </div>
            )}

            {/* ── 5 · Cuenta ─────────────────────────────────────── */}
            {paso === 5 && (
              <div className="flex flex-col gap-4">
                <div>
                  <InputLabel htmlFor="email" value={t("register.email")} />
                  {/* `type="email"` y `autocomplete="username"`: es el identificador de la
                      cuenta, y sin eso el gestor de contraseñas no sabe a quién asociar la
                      clave, así que no ofrecía guardarla. */}
                  <TextInput
                    id="email"
                    type="email"
                    autoComplete="username"
                    placeholder={t("register.email")}
                    {...register("email", {
                      onBlur: (e) => comprobarDisponibilidad("email", e.target.value),
                      onChange: () => setUnico((s) => ({ ...s, email: "reposo" })),
                    })}
                  />
                  <InputErrors errors={errors} name="email" />
                  <PistaUnico campo="email" />
                  {unico.email === "tomado" && (
                    <p className="mt-1 text-xs">
                      <Link
                        to="/inicio-sesion"
                        className="font-bold text-[var(--color-navy)] underline hover:text-[var(--color-orange)]"
                      >
                        Ir a iniciar sesión
                      </Link>
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
                  <div>
                    <InputLabel htmlFor="password" value={t("register.password")} />
                    {/* `new-password`: con esto el navegador ofrece generar una segura. */}
                    <InputPassword
                      id="password"
                      autoComplete="new-password"
                      placeholder={t("register.password")}
                      {...register("password")}
                    />
                    <InputErrors errors={errors} name="password" />
                    <p className="mt-2 text-xs text-[var(--color-muted)] leading-snug">
                      Mínimo 8 caracteres, con mayúsculas, minúsculas y números.
                    </p>
                  </div>
                  <div>
                    <InputLabel
                      htmlFor="password_confirmation"
                      value={t("register.passwordConfirm")}
                    />
                    <InputPassword
                      id="password_confirmation"
                      autoComplete="new-password"
                      placeholder={t("register.passwordConfirm")}
                      {...register("password_confirmation")}
                    />
                    <InputErrors errors={errors} name="password_confirmation" />
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between gap-3 pt-1">
              {paso > 1 ? (
                <button
                  type="button"
                  onClick={anterior}
                  className="rounded-xl border border-[var(--color-border)] bg-[var(--color-beige)] px-6 py-3 text-sm font-bold text-[var(--color-navy)] shadow-sm transition-all hover:bg-[var(--color-beige-alt)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-orange)]"
                >
                  {t("register.prev")}
                </button>
              ) : (
                <span />
              )}

              {paso < TOTAL_PASOS ? (
                <button
                  type="button"
                  onClick={siguiente}
                  disabled={
                    unico.numero_identificacion === "consultando" || unico.email === "consultando"
                  }
                  className="rounded-xl bg-[var(--color-navy)] px-8 py-3 text-sm font-bold text-white shadow-lg transition-all hover:bg-[var(--color-navy-light)] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-orange)]"
                >
                  {t("register.next")}
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={enviando || unico.email === "consultando"}
                  className="rounded-xl bg-[var(--color-navy)] px-8 py-3 text-sm font-bold text-white shadow-lg transition-all hover:bg-[var(--color-navy-light)] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-orange)]"
                >
                  {enviando ? "Creando tu cuenta…" : t("register.submit")}
                </button>
              )}
            </div>
          </form>

          <p className="text-xs sm:text-sm text-[var(--color-text)] text-center font-medium">
            {t("register.hasAccount")}{" "}
            <Link
              to="/inicio-sesion"
              className="text-[var(--color-orange)] hover:text-[var(--color-orange-dark)] transition-colors font-bold"
            >
              {t("register.login")}
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default Registro;
