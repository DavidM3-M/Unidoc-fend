import { useEffect, useState } from "react";
import axios from "axios";
import Select from "react-select";

type ResponsabilidadTributaria = {
  id: number;
  codigo: string;
  descripcion: string;
};

type Opcion = {
  value: number;
  label: string;
};

type Props = {
  id?: string;
  value: number[];
  onChange: (value: number[]) => void;
  onBlur?: () => void;
  placeholder?: string;
  isDisabled?: boolean;
};

const API_URL = `${import.meta.env.VITE_API_URL}/constantes/responsabilidades-tributarias`;

export const SelectResponsabilidadesTributarias = ({
  id,
  value,
  onChange,
  onBlur,
  placeholder = "Busca y agrega las responsabilidades tributarias…",
  isDisabled = false,
}: Props) => {
  const [opciones, setOpciones] = useState<Opcion[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let activo = true;

    axios
      .get<{ responsabilidades_tributarias: ResponsabilidadTributaria[] }>(API_URL, { timeout: 45000 })
      .then((res) => {
        if (!activo) return;
        const lista = (res.data.responsabilidades_tributarias || []).map((item) => ({
          value: item.id,
          label: `${item.codigo} · ${item.descripcion}`,
        }));
        setOpciones(lista);
      })
      .catch((error) => {
        console.error("Error al cargar el catálogo de responsabilidades tributarias", error);
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, []);

  const seleccionActual = opciones.filter((opcion) => value.includes(opcion.value));

  return (
    <Select<Opcion, true>
      inputId={id}
      isMulti
      isClearable
      isDisabled={isDisabled}
      isLoading={cargando}
      options={opciones}
      value={seleccionActual}
      onChange={(opciones) => onChange(opciones.map((opcion) => opcion.value))}
      onBlur={onBlur}
      placeholder={placeholder}
      noOptionsMessage={() => "Sin coincidencias en el catálogo de la DIAN"}
      loadingMessage={() => "Cargando catálogo…"}
      unstyled
      classNames={{
        control: ({ isFocused, isDisabled: disabled }) =>
          `min-h-12 w-full rounded-xl border px-3 py-1 shadow-sm transition-all duration-200 ${
            disabled
              ? "bg-gray-50 border-gray-300 cursor-not-allowed"
              : isFocused
              ? "bg-white border-[#e8740e] shadow-[0_0_0_2px_rgba(232,116,14,0.2)]"
              : "bg-white border-[rgba(30,58,95,0.15)]"
          }`,
        valueContainer: () => "gap-1 py-1",
        placeholder: () => "text-[#6b7a8d]",
        input: () => "text-sm font-medium text-[#2c3e50]",
        indicatorSeparator: () => "hidden",
        dropdownIndicator: () => "text-[#6b7a8d] px-2",
        clearIndicator: () => "text-[#6b7a8d] px-1 hover:text-[#e8740e]",
        multiValue: () =>
          "flex items-center gap-1 rounded-lg bg-[rgba(30,58,95,0.08)] pl-2 pr-1 py-1 my-0.5",
        multiValueLabel: () => "text-xs font-medium text-[#1e3a5f]",
        multiValueRemove: () =>
          "ml-1 rounded text-[#1e3a5f]/60 hover:bg-[#1e3a5f]/10 hover:text-[#e8740e]",
        menu: () =>
          "mt-2 rounded-xl border border-[rgba(30,58,95,0.15)] bg-white shadow-lg overflow-hidden z-20",
        menuList: () => "p-1 max-h-72",
        option: ({ isFocused, isSelected }) =>
          `rounded-lg px-3 py-2 cursor-pointer text-sm ${
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

export default SelectResponsabilidadesTributarias;
