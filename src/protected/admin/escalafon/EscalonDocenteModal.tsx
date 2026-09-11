import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import axiosInstance from "../../../utils/axiosConfig";
import { mensajeDeErrorApi } from "../../../utils/erroresApi";
import { InputLabel } from "../../../componentes/formularios/InputLabel";
import TextInput from "../../../componentes/formularios/TextInput";
import InputErrors from "../../../componentes/formularios/InputErrors";
import Select from "../../../componentes/formularios/Select";
import { ButtonPrimary } from "../../../componentes/formularios/ButtonPrimary";
import { ButtonSecondary } from "../../../componentes/formularios/ButtonSecondary";
import { CheckboxActivo } from "../catalogos/ControlesCatalogo";
import {
  escalonDocenteSchema,
  type EscalonDocenteFormInputs,
} from "../../../validaciones/admin/catalogosSchema";
import type {
  EscalonDocente,
  ExamenIdioma,
  Idioma,
  NivelFormacionAcademica,
  RangoExamenIdioma,
} from "../../../types/catalogos";

type Props = {
  escalon?: EscalonDocente | null;
  onSuccess: () => void;
  onCancel: () => void;
};

const ENDPOINT = import.meta.env.VITE_ENDPOINT_ADMIN_ESCALONES_DOCENTE;
const ENDPOINT_NIVELES_FORMACION = import.meta.env.VITE_ENDPOINT_ADMIN_NIVELES_FORMACION_ACADEMICA;
const ENDPOINT_IDIOMAS = import.meta.env.VITE_ENDPOINT_ADMIN_IDIOMAS;
const ENDPOINT_EXAMENES_IDIOMA = import.meta.env.VITE_ENDPOINT_ADMIN_EXAMENES_IDIOMA;
const ENDPOINT_RANGOS_EXAMEN = import.meta.env.VITE_ENDPOINT_ADMIN_RANGOS_EXAMEN_IDIOMA;
const ORDEN_MCER = ["A1", "A2", "B1", "B2", "C1", "C2"];

const EscalonDocenteModal = ({ escalon, onSuccess, onCancel }: Props) => {
  const editando = Boolean(escalon);

  // Mismos catálogos que ya administras en otras pantallas — nada que mantener duplicado aquí:
  // si creas un nivel de formación, un idioma o un examen de idioma nuevo, aparece acá solo.
  const [nivelesFormacion, setNivelesFormacion] = useState<NivelFormacionAcademica[]>([]);
  const [idiomas, setIdiomas] = useState<Idioma[]>([]);

  // Niveles que de verdad se pueden certificar en el idioma elegido, según los rangos que ya
  // tienen cargados sus exámenes en el catálogo de Idiomas. Sin rangos reales para ese idioma,
  // no se ofrece ningún nivel — nada de mostrar una lista completa como respaldo.
  const [nivelesDisponibles, setNivelesDisponibles] = useState<string[]>([]);
  const [cargandoNivelesDisponibles, setCargandoNivelesDisponibles] = useState(false);

  useEffect(() => {
    axiosInstance
      .get(ENDPOINT_NIVELES_FORMACION)
      .then((respuesta) => setNivelesFormacion(respuesta.data?.data ?? []))
      .catch((error) => console.error("Error al obtener los niveles de formación:", error));

    axiosInstance
      .get(ENDPOINT_IDIOMAS)
      .then((respuesta) => setIdiomas(respuesta.data?.data ?? []))
      .catch((error) => console.error("Error al obtener los idiomas:", error));
  }, []);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<EscalonDocenteFormInputs>({
    resolver: zodResolver(escalonDocenteSchema),
    defaultValues: {
      nombre: escalon?.nombre ?? "",
      orden: escalon?.orden ?? 1,
      formacion_minima: escalon?.formacion_minima ?? "",
      idioma_catalogo_id: escalon?.idioma_catalogo_id != null ? String(escalon.idioma_catalogo_id) : "",
      nivel_mcer_minimo: escalon?.nivel_mcer_minimo ?? "",
      puntaje_minimo: escalon?.puntaje_minimo != null ? String(escalon.puntaje_minimo) : "",
      meses_minimos_escalon_anterior:
        escalon?.meses_minimos_escalon_anterior != null
          ? String(escalon.meses_minimos_escalon_anterior)
          : "",
      evaluacion_minima: escalon?.evaluacion_minima != null ? String(escalon.evaluacion_minima) : "",
      activo: escalon?.activo ?? true,
    },
  });

  const idiomaSeleccionado = watch("idioma_catalogo_id");

  /**
   * Devuelve el nivel MCER guardado al `<select>` una vez que sus opciones existen en el DOM.
   *
   * Va en su propio efecto y no dentro del `.then()` que carga los niveles: ahí `setValue` corre
   * en el mismo bloque síncrono que `setNivelesDisponibles`, o sea **antes** de que React haya
   * pintado las `<option>`. Asignarle a un `<select>` un valor que todavía no existe como opción
   * no da error —el navegador lo deja en blanco—, que es justo lo que hacía que este campo
   * siguiera mostrando «Sin requisito» aunque el escalón exigiera B2.
   *
   * Como dependencia lleva `nivelesDisponibles`, este efecto se ejecuta en el commit posterior,
   * con las opciones ya en el DOM.
   */
  useEffect(() => {
    if (!escalon?.nivel_mcer_minimo) return;
    if (nivelesDisponibles.length === 0) return;
    if (!nivelesDisponibles.includes(escalon.nivel_mcer_minimo)) return;

    setValue("nivel_mcer_minimo", escalon.nivel_mcer_minimo);
  }, [escalon, nivelesDisponibles, setValue]);

  /**
   * Vuelve a aplicar los requisitos guardados cuando llegan las opciones de los desplegables.
   *
   * `<Select {...register(...)}>` es un `<select>` no controlado: al montar, react-hook-form le
   * asigna el valor por el ref, pero en ese momento la única opción que existe es «Sin requisito»
   * —los niveles de formación y los idiomas se piden en un `useEffect`—. Asignarle a un `<select>`
   * un valor que no corresponde a ninguna opción no da error: el navegador lo deja en blanco.
   *
   * El resultado era que al abrir «Editar escalón» de Asistente, que exige Maestría e Inglés B1,
   * los tres desplegables aparecían en «Sin requisito» como si no exigiera nada.
   */
  useEffect(() => {
    if (!escalon) return;
    if (nivelesFormacion.length === 0 && idiomas.length === 0) return;

    if (nivelesFormacion.length > 0 && escalon.formacion_minima) {
      setValue("formacion_minima", escalon.formacion_minima);
    }

    if (idiomas.length > 0 && escalon.idioma_catalogo_id != null) {
      setValue("idioma_catalogo_id", String(escalon.idioma_catalogo_id));
    }
  }, [escalon, nivelesFormacion, idiomas, setValue]);

  useEffect(() => {
    // Sin idioma elegido no hay de dónde sacar niveles reales — el select queda vacío, no se
    // rellena con nada mientras tanto.
    if (!idiomaSeleccionado) {
      setNivelesDisponibles([]);
      return;
    }

    let vigente = true;
    setCargandoNivelesDisponibles(true);

    axiosInstance
      .get(ENDPOINT_EXAMENES_IDIOMA, { params: { idioma_id: idiomaSeleccionado } })
      .then(async (respuesta) => {
        const examenes: ExamenIdioma[] = respuesta.data?.data ?? [];

        if (examenes.length === 0) {
          return [];
        }

        const rangosPorExamen = await Promise.all(
          examenes.map((examen) =>
            axiosInstance
              .get(ENDPOINT_RANGOS_EXAMEN, { params: { examen_idioma_id: examen.id_examen_idioma } })
              .then((r) => (r.data?.data ?? []) as RangoExamenIdioma[])
          )
        );

        const nivelesConRango = new Set<string>(rangosPorExamen.flat().map((rango) => rango.nivel_mcer));

        // Solo los niveles con un rango real cargado en el catálogo de Idiomas para este
        // idioma — nada inventado ni de respaldo.
        return ORDEN_MCER.filter((nivel) => nivelesConRango.has(nivel));
      })
      .then((niveles) => {
        if (!vigente) return;

        // Siempre la lista real, sin excepciones: si el nivel que este escalón tenía
        // guardado ya no tiene un rango real detrás (ej. el idioma no tiene exámenes
        // cargados todavía), se limpia — no se deja un valor sin respaldo en el catálogo.
        setNivelesDisponibles(niveles);

        const actual = watch("nivel_mcer_minimo");
        if (actual && !niveles.includes(actual)) {
          setValue("nivel_mcer_minimo", "");
        }
      })
      .catch((error) => {
        console.error("Error al obtener los niveles disponibles para el idioma:", error);
        if (vigente) setNivelesDisponibles([]);
      })
      .finally(() => {
        if (vigente) setCargandoNivelesDisponibles(false);
      });

    return () => {
      vigente = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idiomaSeleccionado]);

  const onSubmit = async (data: EscalonDocenteFormInputs) => {
    const payload = {
      nombre: data.nombre,
      orden: data.orden,
      formacion_minima: data.formacion_minima || null,
      idioma_catalogo_id: data.idioma_catalogo_id ? Number(data.idioma_catalogo_id) : null,
      nivel_mcer_minimo: data.nivel_mcer_minimo || null,
      puntaje_minimo: data.puntaje_minimo ? Number(data.puntaje_minimo) : null,
      meses_minimos_escalon_anterior: data.meses_minimos_escalon_anterior
        ? Number(data.meses_minimos_escalon_anterior)
        : null,
      evaluacion_minima: data.evaluacion_minima ? Number(data.evaluacion_minima) : null,
      activo: data.activo,
    };

    try {
      await toast.promise(
        editando
          ? axiosInstance.put(`${ENDPOINT}/${escalon!.id_escalon}`, payload)
          : axiosInstance.post(ENDPOINT, payload),
        {
          pending: editando ? "Actualizando escalón..." : "Creando escalón...",
          success: editando ? "Escalón actualizado." : "Escalón creado.",
          error: {
            render({ data }) {
              return mensajeDeErrorApi(data, "No se pudo guardar el escalón.");
            },
            autoClose: 5000,
          },
        }
      );

      onSuccess();
    } catch (error) {
      console.error("Error al guardar el escalón:", error);
    }
  };

  return (
    <form className="flex flex-col gap-5 p-1" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <InputLabel htmlFor="nombre" value="Nombre *" />
          <TextInput id="nombre" placeholder="Ej: Asistente" maxLength={50} {...register("nombre")} />
          <InputErrors errors={errors} name="nombre" />
        </div>
        <div>
          <InputLabel htmlFor="orden" value="Orden *" />
          <TextInput id="orden" type="number" min={1} {...register("orden")} />
          <InputErrors errors={errors} name="orden" />
          <p className="mt-2 text-xs text-[#6b7a8d]">Mayor número, escalón más alto.</p>
        </div>
      </div>

      <div className="rounded-lg bg-[rgba(30,58,95,0.04)] p-4">
        <p className="text-xs font-semibold text-[#1e3a5f] mb-3">
          Requisitos — deja en blanco los que este escalón no exija (ej. el escalón base no exige ninguno).
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <InputLabel htmlFor="formacion_minima" value="Formación mínima" />
            <Select id="formacion_minima" {...register("formacion_minima")}>
              <option value="">Sin requisito</option>
              {nivelesFormacion
                .filter((nivel) => nivel.activo)
                .map((nivel) => (
                  <option key={nivel.id_nivel_formacion_academica} value={nivel.nivel_formacion}>
                    {nivel.nivel_academico} — {nivel.nivel_formacion}
                  </option>
                ))}
            </Select>
            <InputErrors errors={errors} name="formacion_minima" />
            <p className="mt-2 text-xs text-[#6b7a8d]">
              Del catálogo Formación académica → Niveles de formación.
            </p>
          </div>
          <div>
            <InputLabel htmlFor="idioma_catalogo_id" value="Idioma" />
            <Select id="idioma_catalogo_id" {...register("idioma_catalogo_id")}>
              <option value="">Sin requisito</option>
              {idiomas
                .filter((idioma) => idioma.activo)
                .map((idioma) => (
                  <option key={idioma.id_idioma_catalogo} value={idioma.id_idioma_catalogo}>
                    {idioma.nombre_idioma}
                  </option>
                ))}
            </Select>
            <InputErrors errors={errors} name="idioma_catalogo_id" />
            <p className="mt-2 text-xs text-[#6b7a8d]">Del catálogo Catálogos → Idiomas.</p>
          </div>
          <div>
            <InputLabel htmlFor="nivel_mcer_minimo" value="Nivel MCER mínimo" />
            <Select id="nivel_mcer_minimo" disabled={cargandoNivelesDisponibles} {...register("nivel_mcer_minimo")}>
              <option value="">Sin requisito</option>
              {nivelesDisponibles.map((nivel) => (
                <option key={nivel} value={nivel}>
                  {nivel}
                </option>
              ))}
            </Select>
            <InputErrors errors={errors} name="nivel_mcer_minimo" />
            {idiomaSeleccionado && !cargandoNivelesDisponibles && nivelesDisponibles.length === 0 ? (
              <p className="mt-2 text-xs text-[#e8740e] font-medium">
                Ese idioma todavía no tiene rangos de puntaje cargados en Catálogos → Idiomas.
                Agrégale un examen con al menos un rango para poder elegir un nivel aquí.
              </p>
            ) : (
              <p className="mt-2 text-xs text-[#6b7a8d]">
                {idiomaSeleccionado
                  ? "Solo se listan los niveles que ese idioma puede certificar según sus exámenes."
                  : "Selecciona primero el idioma."}
              </p>
            )}
          </div>
          <div>
            <InputLabel htmlFor="puntaje_minimo" value="Puntaje mínimo de producción académica" />
            <TextInput id="puntaje_minimo" type="number" min={0} {...register("puntaje_minimo")} />
            <InputErrors errors={errors} name="puntaje_minimo" />
          </div>
          <div>
            <InputLabel
              htmlFor="meses_minimos_escalon_anterior"
              value="Meses mínimos en el escalón anterior"
            />
            <TextInput
              id="meses_minimos_escalon_anterior"
              type="number"
              min={0}
              {...register("meses_minimos_escalon_anterior")}
            />
            <InputErrors errors={errors} name="meses_minimos_escalon_anterior" />
            <p className="mt-2 text-xs text-[#6b7a8d]">
              Antigüedad en la categoría inmediatamente inferior, no acumulada en la Universidad:
              al ascender el contador vuelve a cero. Ej: 48 meses = 4 años como Auxiliar.
            </p>
          </div>
          <div>
            <InputLabel htmlFor="evaluacion_minima" value="Evaluación docente mínima" />
            <TextInput
              id="evaluacion_minima"
              type="number"
              min={0}
              max={5}
              step={0.01}
              {...register("evaluacion_minima")}
            />
            <InputErrors errors={errors} name="evaluacion_minima" />
            <p className="mt-2 text-xs text-[#6b7a8d]">
              Se compara contra el promedio de evaluación que le asigna Apoyo Profesoral.
            </p>
          </div>
        </div>
        <p className="mt-3 text-xs text-[#6b7a8d]">
          "Al menos una producción aprobada" se exige siempre que este escalón tenga algún
          requisito — no se configura aquí.
        </p>
      </div>

      <CheckboxActivo
        id="activo_escalon_docente"
        registro={register("activo")}
        ayuda="Si lo desmarcas, el motor de evaluación deja de asignarlo a ningún docente."
      />

      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} disabled={isSubmitting}>
          <ButtonSecondary value="Cancelar" className="px-8 py-3" />
        </button>
        <ButtonPrimary
          value={editando ? "Guardar cambios" : "Crear escalón"}
          className="px-8"
          disabled={isSubmitting}
          loading={isSubmitting}
        />
      </div>
    </form>
  );
};

export default EscalonDocenteModal;
