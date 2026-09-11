import axios from "axios";
import { useEffect, useRef, useState } from "react";

/**
 * Los catálogos que usa este select siempre traen `id` + `nombre`, pero algunos agregan datos
 * propios (los exámenes de idioma traen `vigencia_meses` y sus `rangos`). El index signature
 * deja que el formulario los lea sin que este componente tenga que conocerlos.
 */
type Opcion = { id: number; nombre: string; [dato: string]: unknown };

type Props = {
  className?: string;
  id: string;
  /** Ruta bajo /constantes/, ej. "niveles-formacion-academica". */
  url: string;
  /** Query params opcionales para catálogos en cascada, ej. { idioma_catalogo_id }. */
  params?: Record<string, string | number | undefined>;
  /** Valor actual (id como string, para calzar con react-hook-form). */
  value: string;
  onChange: (id: string, opcion: Opcion | null) => void;
  /**
   * Se dispara cuando el catálogo termina de cargar, con la opción que corresponde al `value`
   * actual (o null si no hay ninguno).
   *
   * Es lo que permite rehidratar al editar: el formulario recupera los datos completos de la
   * opción ya guardada —los rangos y la vigencia de un examen, por ejemplo— sin que el usuario
   * tenga que volver a elegirla. Antes esto se resolvía con un `setTimeout(500)` a la espera de
   * que el catálogo hubiera llegado, que fallaba en conexiones lentas.
   */
  onCargado?: (opcionActual: Opcion | null, opciones: Opcion[]) => void;
  onBlur?: () => void;
  disabled?: boolean;
  placeholder?: string;
};

/**
 * Variante de `SelectForm` para catálogos donde el formulario necesita el id (no solo el
 * nombre) — ej. para autocompletar un campo de texto derivado a la vez que se guarda la FK.
 * `SelectForm` no sirve para esto: solo expone value=label=string, sin id detrás.
 *
 * El backend responde `{ opciones: [{ id, nombre }] }` (mismas claves en los tres catálogos que
 * lo usan: niveles de formación, idiomas, exámenes de idioma) para que este componente sea
 * genérico y no necesite mapear nombres de clave distintos por endpoint.
 */
export const SelectFormConId = ({
  className,
  id,
  url,
  params,
  value,
  onChange,
  onCargado,
  onBlur,
  disabled = false,
  placeholder = "Seleccione una opción",
}: Props) => {
  const [opciones, setOpciones] = useState<Opcion[]>([]);
  const [cargando, setCargando] = useState(true);
  const API_BASE = `${import.meta.env.VITE_API_URL}/constantes/`;

  // En refs para que la carga del catálogo no dependa de ellos: `value` cambia con cada
  // selección y `onCargado` suele venir como función nueva en cada render — incluirlos en las
  // dependencias volvería a pedir el catálogo una y otra vez.
  const valueRef = useRef(value);
  valueRef.current = value;

  const onCargadoRef = useRef(onCargado);
  onCargadoRef.current = onCargado;

  useEffect(() => {
    let vigente = true;
    setCargando(true);

    axios
      .get(API_BASE + url, { params, timeout: 45000 })
      .then((respuesta) => {
        if (!vigente) return;

        const recibidas: Opcion[] = respuesta.data?.opciones ?? [];
        setOpciones(recibidas);

        const actual = recibidas.find((o) => String(o.id) === valueRef.current) ?? null;
        onCargadoRef.current?.(actual, recibidas);
      })
      .catch((error) => {
        console.error(`Error al cargar las opciones de ${url}`, error);
        if (vigente) setOpciones([]);
      })
      .finally(() => {
        if (vigente) setCargando(false);
      });

    return () => {
      vigente = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, JSON.stringify(params)]);

  return (
    <select
      id={id}
      className={`${className ?? ""} h-12 w-full rounded-xl border-2 border-[#1e3a5f]/20
        shadow-md p-3 text-sm text-[#1e3a5f] font-medium
        focus:outline-none focus:border-[#e8740e] focus:shadow-lg focus:ring-1 focus:ring-[#e8740e]
        transition-all duration-200 bg-white disabled:bg-gray-50 disabled:cursor-not-allowed`}
      value={value}
      disabled={disabled || cargando}
      onBlur={onBlur}
      onChange={(e) => {
        const idSeleccionado = e.target.value;
        const opcion = opciones.find((o) => String(o.id) === idSeleccionado) ?? null;
        onChange(idSeleccionado, opcion);
      }}
    >
      <option value="" disabled>
        {cargando ? "Cargando…" : placeholder}
      </option>
      {opciones.map((opcion) => (
        <option key={opcion.id} value={opcion.id}>
          {opcion.nombre}
        </option>
      ))}
    </select>
  );
};

export default SelectFormConId;
