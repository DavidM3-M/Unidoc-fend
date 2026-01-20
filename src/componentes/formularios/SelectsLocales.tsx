// En SelectsLocales.tsx
import { mappeoEstadoConvocatoria } from "../../validaciones/talento-humano.ts/convocatoriaSchema";

interface SelectLocalesProps {
  id: string;
  register: any;
}

export const SelectLocales = ({ id, register }: SelectLocalesProps) => {
  return (
    <select
      id={id}
      {...register}
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    >
      <option value="">Selecciona un estado</option>
      {mappeoEstadoConvocatoria.map((estado) => (
        <option key={estado.value} value={estado.value}>
          {estado.label}
        </option>
      ))}
    </select>
  );
};