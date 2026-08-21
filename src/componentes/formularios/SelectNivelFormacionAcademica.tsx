import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { InputLabel } from "./InputLabel";

type NivelFormacion = {
  id: number;
  nombre: string;
  nivel_academico: string;
  /** Jerarquía del escalafón. Null = el nivel no cuenta para ascender (diplomado, curso...). */
  orden: number | null;
};

type Props = {
  /** Nivel académico elegido (ej. "Pregrado", "Posgrado"). */
  nivelAcademico: string;
  onChangeNivelAcademico: (valor: string) => void;
  /** Id del nivel de formación elegido (segundo select, filtrado por el académico). */
  nivelFormacionId: string;
  onChangeNivelFormacion: (id: string, opcion: NivelFormacion | null) => void;
  /** Errores del formulario, que se pintan bajo el select de tipo de estudio. */
  error?: React.ReactNode;
};

const API_URL = `${import.meta.env.VITE_API_URL}/constantes/niveles-formacion-academica`;

const selectClass = `h-12 w-full rounded-xl border-2 border-[#1e3a5f]/20
  shadow-md p-3 text-sm text-[#1e3a5f] font-medium
  focus:outline-none focus:border-[#e8740e] focus:shadow-lg focus:ring-1 focus:ring-[#e8740e]
  transition-all duration-200 bg-white disabled:bg-gray-50 disabled:cursor-not-allowed`;

/**
 * Primer paso de la cascada Nivel → Institución → Programa: Nivel académico (Pregrado/Posgrado)
 * y, filtrado por ese valor, Nivel de formación (Doctorado, Maestría, Universitario...).
 *
 * Con solo ~11 filas en `niveles_formacion_academica`, se trae el catálogo completo una vez y
 * el agrupado por `nivel_academico` se hace en el cliente — no hace falta un endpoint aparte.
 */
export const SelectNivelFormacionAcademica = ({
  nivelAcademico,
  onChangeNivelAcademico,
  nivelFormacionId,
  onChangeNivelFormacion,
  error,
}: Props) => {
  const [niveles, setNiveles] = useState<NivelFormacion[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let vigente = true;

    axios
      .get(API_URL, { timeout: 45000 })
      .then((respuesta) => {
        if (!vigente) return;
        setNiveles(respuesta.data?.opciones ?? []);
      })
      .catch((error) => {
        console.error("Error al cargar los niveles de formación académica", error);
        if (vigente) setNiveles([]);
      })
      .finally(() => {
        if (vigente) setCargando(false);
      });

    return () => {
      vigente = false;
    };
  }, []);

  // Al editar un registro existente: ya viene el id del nivel de formación, pero el nivel
  // académico (primer select) todavía no se sabe hasta que carga el catálogo — se resuelve solo
  // apenas está disponible, para no obligar al usuario a re-elegirlo.
  useEffect(() => {
    if (nivelAcademico || !nivelFormacionId || niveles.length === 0) return;

    const actual = niveles.find((n) => String(n.id) === nivelFormacionId);
    if (actual) onChangeNivelAcademico(actual.nivel_academico);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [niveles, nivelFormacionId]);

  const nivelesAcademicos = useMemo(
    () => Array.from(new Set(niveles.map((n) => n.nivel_academico))).filter(Boolean),
    [niveles]
  );

  const nivelesFormacionFiltrados = useMemo(
    () => niveles.filter((n) => n.nivel_academico === nivelAcademico),
    [niveles, nivelAcademico]
  );

  const nivelSeleccionado = useMemo(
    () => niveles.find((n) => String(n.id) === nivelFormacionId) ?? null,
    [niveles, nivelFormacionId]
  );

  // Devuelve dos celdas hermanas (no anidadas) para que caigan como dos columnas del grid del
  // formulario, cada una con su propia etiqueta. Antes iban dentro de una sola celda y los dos
  // desplegables quedaban apilados bajo una etiqueta única, que se veía roto.
  return (
    <>
      <div>
        <InputLabel htmlFor="nivel_academico" value="Nivel académico *" />
        <select
          id="nivel_academico"
          className={selectClass}
          value={nivelAcademico}
          disabled={cargando}
          onChange={(e) => {
            onChangeNivelAcademico(e.target.value);
            onChangeNivelFormacion("", null);
          }}
        >
          <option value="" disabled>
            {cargando ? "Cargando…" : "Seleccione una opción"}
          </option>
          {nivelesAcademicos.map((valor) => (
            <option key={valor} value={valor}>
              {valor}
            </option>
          ))}
        </select>
      </div>

      <div>
        <InputLabel htmlFor="tipo_estudio" value="Tipo de estudio *" />
        <select
          id="tipo_estudio"
          className={selectClass}
          value={nivelFormacionId}
          disabled={!nivelAcademico}
          onChange={(e) => {
            const opcion = nivelesFormacionFiltrados.find((n) => String(n.id) === e.target.value) ?? null;
            onChangeNivelFormacion(e.target.value, opcion);
          }}
        >
          <option value="" disabled>
            {nivelAcademico ? "Seleccione una opción" : "Primero elige el nivel académico"}
          </option>
          {nivelesFormacionFiltrados.map((nivel) => (
            <option key={nivel.id} value={nivel.id}>
              {nivel.nombre}
            </option>
          ))}
        </select>

        {/* Aviso honesto: la formación complementaria (orden nulo) se guarda en la hoja de vida
            pero no participa del escalafón. Mejor decirlo aquí que dejar al docente esperando
            un ascenso que nunca va a llegar. */}
        {error}

        {nivelSeleccionado?.orden === null && (
          <p className="mt-2 text-xs text-[#a5590a] bg-[#fdf1e2] border border-[rgba(232,116,14,0.32)] rounded-lg px-3 py-2">
            Este nivel queda en tu hoja de vida, pero <b>no cuenta para el escalafón docente</b>.
          </p>
        )}
      </div>
    </>
  );
};

export default SelectNivelFormacionAcademica;
