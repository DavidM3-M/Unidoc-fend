import axios from "axios";
import { useEffect, useState } from "react";
import { UseFormRegisterReturn } from "react-hook-form";

type Props = {
  id: string;
  register: UseFormRegisterReturn;
  className?: string;
  url: string;
  parentId?: number | null;
  parentRequired?: boolean;
  disabled?: boolean;
};

type Option = {
  value: number;
  label: string;
};

export const SelectFormProduccionAcademica = ({
  id,
  register,
  className,
  url,
  parentId,
  parentRequired = false,
  disabled = false,
}: Props) => {
  const [data, setData] = useState<Option[]>([]);
  const [loading, setLoading] = useState(false);
  const API_BASE = `${import.meta.env.VITE_API_URL}/tiposProduccionAcademica/`;

  const hasValidParentId = Number.isFinite(parentId);

  useEffect(() => {
    if (parentRequired && !hasValidParentId) {
      setData([]);
      return;
    }

    const fetchProduccion = async () => {
      try {
        setLoading(true);
        let endpoint = API_BASE + url;

        if (hasValidParentId) {
          endpoint += `/${parentId}`;
        }
        const response = await axios.get(endpoint);
        const items = response.data.map((item: any) => ({
          value: item.id || item.id_producto_academico || item.id_ambito_divulgacion || item.producto_academico_id,
          label: item.nombre || item.nombre_producto_academico || item.nombre_ambito_divulgacion || item.nombre_producto_academico,
        }));

        setData(items);
      } catch (error) {
        console.error(`Error al cargar ${id}:`, error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    if (url) {
      fetchProduccion();
    }
  }, [url, parentId, parentRequired, hasValidParentId]);

  return (
    <div className="flex flex-col">
      <select
        defaultValue=""
        {...register}
        id={id}
        disabled={disabled || loading}
        /* Mismas clases que `SelectForm` y `SelectFormConId`. Este control se había quedado en
           40 px con borde gris y sin estado de foco: quedaba desalineado junto a los campos de
           48 px del mismo formulario y era invisible para quien navega con teclado. */
        className={`${className ?? ""}
          h-12 w-full rounded-xl border-2 border-[#1e3a5f]/20
          shadow-md p-3 text-sm text-[#1e3a5f] font-medium
          focus:outline-none focus:border-[#e8740e] focus:shadow-lg focus:ring-1 focus:ring-[#e8740e]
          transition-all duration-200 bg-white disabled:bg-gray-50 disabled:cursor-not-allowed`}
      >
        <option value="" disabled>
          Seleccione una opción
        </option>
        {loading ? (
          <option disabled>Cargando...</option>
        ) : (
          data.map((opt, idx) => (
            <option key={`${id}-${opt.value}-${idx}`} value={opt.value}>
              {opt.label}
            </option>
          ))
        )}
      </select>
    </div>
  );
};
