import { useEffect, useState } from "react";
import axios from "axios";
import CreatableSelect from "react-select/creatable";

type Banco = {
  nombre: string;
};

type Opcion = {
  value: string;
  label: string;
};

type Props = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  isDisabled?: boolean;
};

const API_URL = `${import.meta.env.VITE_API_URL}/bancos`;

export const SelectBanco = ({
  id,
  value,
  onChange,
  onBlur,
  placeholder = "Escribe el nombre del banco…",
  isDisabled = false,
}: Props) => {
  const [opciones, setOpciones] = useState<Opcion[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let activo = true;

    axios
      .get<{ bancos: Banco[] }>(API_URL, { timeout: 45000 })
      .then((res) => {
        if (!activo) return;
        const lista = (res.data.bancos || []).map((banco) => ({
          value: banco.nombre,
          label: banco.nombre,
        }));
        setOpciones(lista);
      })
      .catch((error) => {
        console.error("Error al cargar el catálogo de bancos", error);
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, []);

  const seleccionActual: Opcion | null = value ? { value, label: value } : null;

  return (
    <CreatableSelect<Opcion, false>
      inputId={id}
      isClearable
      isDisabled={isDisabled}
      isLoading={cargando}
      options={opciones}
      value={seleccionActual}
      onChange={(opcion) => onChange(opcion ? opcion.value : "")}
      onBlur={onBlur}
      placeholder={placeholder}
      noOptionsMessage={() => "Sin coincidencias en el catálogo"}
      loadingMessage={() => "Cargando catálogo de bancos…"}
      formatCreateLabel={(texto) => `Usar "${texto}" (no está en el catálogo)`}
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
        singleValue: ({ isDisabled: disabled }) =>
          `text-sm font-medium ${disabled ? "text-gray-500" : "text-[#2c3e50]"}`,
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

export default SelectBanco;
