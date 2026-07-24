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
        disabled={disabled}
        className={`${className}
          h-10 w-full rounded-lg border-[1.8px] border-gray-200
          p-2 text-sm text-slate-900 shadow-sm`}
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
