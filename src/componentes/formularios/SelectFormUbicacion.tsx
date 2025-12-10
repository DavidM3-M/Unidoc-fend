import axios from "axios";
import { useEffect, useState } from "react";
import { UseFormRegisterReturn } from "react-hook-form";

type Props = {
  id: string;
  register: UseFormRegisterReturn;
  className?: string;
  url: string;
  parentId?: number | null;
  disabled?: boolean;    
};

type Option = {
  value: number;
  label: string;
};

export const SelectFormUbicaciones = ({
  id,
  register,
  className,
  url,
  parentId,
  disabled = false,
}: Props) => {
  const [data, setData] = useState<Option[]>([]);
  const [loading, setLoading] = useState(false);
  const API_BASE = `${import.meta.env.VITE_API_URL}/ubicaciones/`;

  useEffect(() => {
    const fetchUbicaciones = async () => {
      try {
        setLoading(true);
        let endpoint = API_BASE + url;

        if (parentId !== undefined && parentId !== null) {
          endpoint += `/${parentId}`;
        }

        const response = await axios.get(endpoint);
        const items = response.data.map((item: any) => ({
          value: item.id || item.id_departamento || item.id_municipio || item.id_pais,
          label: item.nombre,
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
      fetchUbicaciones();
    }
  }, [url, parentId]);

  return (
    <div className="flex flex-col">
      <select
        defaultValue=""
        {...register}
        id={id}
        disabled={disabled} 
        className={`${className}
          h-10 w-full rounded-lg border-[1.8px] border-gray-200
          p-2 text-sm text-slate-900 shadow-sm
 `}
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
