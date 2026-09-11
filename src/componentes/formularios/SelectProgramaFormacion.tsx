import axios from "axios";
import AsyncCreatableSelect from "react-select/async-creatable";

type Programa = {
  id_programa: number;
  nombre_programa: string;
  titulo_otorgado: string | null;
  nivel_formacion_academica_id: number | null;
  nivel_formacion_academica: { id_nivel_formacion_academica: number; nivel_formacion: string } | null;
};

type Opcion = {
  value: string;
  label: string;
  programa?: Programa;
};

type Props = {
  id?: string;
  institucionId: number | null;
  nivelFormacionAcademicaId: string;
  value: string;
  onChange: (value: string, programa: Programa | null) => void;
  onBlur?: () => void;
  placeholder?: string;
};

const API_URL = `${import.meta.env.VITE_API_URL}/programas-formacion-educativa`;

/**
 * Último paso de la cascada Nivel → Institución → Programa del catálogo SNIES. A diferencia de
 * `SelectInstitucionSnies` (368 filas, se precarga completo), `programas_formacion_educativa`
 * tiene ~32.000 filas: no se puede precargar, así que busca de verdad contra el backend
 * (debounced) según lo que escribe el aspirante, filtrado por el nivel y la institución ya
 * elegidos — ambos obligatorios para habilitar la búsqueda.
 */
export const SelectProgramaFormacion = ({
  id,
  institucionId,
  nivelFormacionAcademicaId,
  value,
  onChange,
  onBlur,
  placeholder = "Busca tu programa…",
}: Props) => {
  const cargarOpciones = async (input: string): Promise<Opcion[]> => {
    // Sin institución del catálogo no hay contra qué buscar: si el docente escribió una
    // institución que no está en el SNIES, sus programas tampoco van a estar. Se devuelve vacío
    // y el campo queda solo para escribir, que es justo lo que se espera en ese caso.
    if (!institucionId || !nivelFormacionAcademicaId) return [];

    try {
      const respuesta = await axios.get<{ programas: Programa[] }>(API_URL, {
        params: {
          institucion_id: institucionId,
          nivel_formacion_academica_id: nivelFormacionAcademicaId,
          q: input,
        },
        timeout: 45000,
      });

      return (respuesta.data.programas || []).map((programa) => ({
        value: programa.nombre_programa,
        label: programa.titulo_otorgado
          ? `${programa.nombre_programa} — ${programa.titulo_otorgado}`
          : programa.nombre_programa,
        programa,
      }));
    } catch (error) {
      console.error("Error al buscar programas de formación educativa", error);
      return [];
    }
  };

  const seleccionActual: Opcion | null = value ? { value, label: value } : null;

  // Lo único que bloquea el campo es no haber elegido el nivel de estudio, que siempre viene del
  // catálogo. La institución NO lo bloquea: si el docente la escribió a mano (no está en el
  // SNIES), igual tiene que poder escribir su programa — antes quedaba trabado esperando un id
  // de institución que nunca iba a llegar.
  const deshabilitado = !nivelFormacionAcademicaId;
  const soloEscritura = !institucionId;

  const textoPlaceholder = () => {
    if (deshabilitado) return "Primero elige el nivel de estudio";
    if (soloEscritura) return "Escribe el nombre de tu programa o título";
    return placeholder;
  };

  return (
    <AsyncCreatableSelect<Opcion, false>
      inputId={id}
      isClearable
      isDisabled={deshabilitado}
      cacheOptions
      defaultOptions={false}
      loadOptions={cargarOpciones}
      value={seleccionActual}
      onChange={(opcion) => onChange(opcion ? opcion.value : "", opcion?.programa ?? null)}
      onBlur={onBlur}
      placeholder={textoPlaceholder()}
      noOptionsMessage={({ inputValue }) => {
        if (soloEscritura) {
          return "Esa institución no está en el catálogo SNIES: escribe tu programa y se guardará así.";
        }
        return inputValue ? "Sin coincidencias en el catálogo SNIES" : "Escribe para buscar tu programa";
      }}
      loadingMessage={() => "Buscando…"}
      formatCreateLabel={(texto) => `Usar "${texto}" (no está en el catálogo SNIES)`}
      unstyled
      classNames={{
        control: ({ isFocused, isDisabled: disabled }) =>
          `h-12 w-full rounded-xl border px-3 shadow-sm transition-all duration-200 ${
            disabled
              ? "bg-gray-50 border-gray-300 cursor-not-allowed"
              : isFocused
              ? "bg-white border-[#e8740e] shadow-[0_0_0_2px_rgba(232,116,14,0.2)]"
              : "bg-white border-[rgba(30,58,95,0.15)]"
          }`,
        valueContainer: () => "gap-1 py-0",
        placeholder: () => "text-[#6b7a8d]",
        singleValue: () => "text-sm font-medium text-[#2c3e50]",
        input: () => "text-sm font-medium text-[#2c3e50]",
        indicatorSeparator: () => "hidden",
        dropdownIndicator: () => "text-[#6b7a8d] px-2",
        clearIndicator: () => "text-[#6b7a8d] px-1 hover:text-[#e8740e]",
        menu: () =>
          "mt-2 rounded-xl border border-[rgba(30,58,95,0.15)] bg-white shadow-lg overflow-hidden z-20",
        menuList: () => "p-1 max-h-72",
        option: ({ isFocused, isSelected }) =>
          `rounded-lg px-3 py-2 cursor-pointer ${
            isSelected
              ? "bg-[rgba(232,116,14,0.12)]"
              : isFocused
              ? "bg-[#f2f5f9]"
              : ""
          }`,
        noOptionsMessage: () => "px-3 py-3 text-sm text-[#8b98a6]",
        loadingMessage: () => "px-3 py-3 text-sm text-[#8b98a6]",
      }}
    />
  );
};

export default SelectProgramaFormacion;
