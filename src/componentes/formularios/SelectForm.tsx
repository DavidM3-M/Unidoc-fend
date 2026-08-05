import axios from "axios";
import { useEffect, useState } from "react";

type Props = {
  className?: string;
  register?: any;
  id: string;
  options?: { value: string | number; label: string }[];
  url: string;
  data_url: string;
};

export const SelectForm = ({ id, className, register, options = [], url, data_url }: Props) => {
  const [data, setData] = useState<{ value: string, label: string }[]>([]);
  const API_BASE = `${import.meta.env.VITE_API_URL}/constantes/`;
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(API_BASE + url, {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 50000,
        });

        const tipos = data_url ? response.data[data_url] : response.data;
        if (!Array.isArray(tipos)) {
          console.error("SelectForm: expected array from endpoint", url, tipos);
          return;
        }

        const opcionesFormateadas = tipos.map((tipo: any) => {
          if (typeof tipo === "string") {
            return { value: tipo, label: tipo };
          }

          if (tipo && typeof tipo === "object") {
            if ("value" in tipo && "label" in tipo) {
              return { value: String(tipo.value), label: String(tipo.label) };
            }
            if ("id" in tipo && "nombre" in tipo) {
              return { value: String(tipo.id), label: String(tipo.nombre) };
            }
            if ("nombre" in tipo) {
              return { value: String(tipo.nombre), label: String(tipo.nombre) };
            }
            if ("id" in tipo) {
              return { value: String(tipo.id), label: String(tipo.id) };
            }
          }

          return { value: String(tipo), label: String(tipo) };
        });

        setData(opcionesFormateadas);
      } catch (error) {
        console.error("Error al cargar las opciones del select", error);
      }
    };

    fetchData();
  }, [url, data_url]);

  const finalOptions = options.length > 0 ? options : data;

  return (
    <div className="flex flex-col">
      <select
        defaultValue=""
        {...register}
        id={id}
        className={`${className} 
          h-12 w-full rounded-xl border-2 border-[#1e3a5f]/20
          shadow-md p-3 text-sm text-[#1e3a5f] font-medium
          focus:outline-none focus:border-[#e8740e] focus:shadow-lg focus:ring-1 focus:ring-[#e8740e]
          transition-all duration-200 bg-white`}
      >
        <option value="" disabled>Seleccione una opción</option>
        {
          finalOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))
        }
      </select>
    </div>
  );
};