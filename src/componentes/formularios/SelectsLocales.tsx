import { mappeoTipoCuenta } from "../../validaciones/aspirante/certificacionBancariaSchema";
import { mappeoRegimenPensional } from "../../validaciones/aspirante/pensionSchema";
import { mappeoAreaContratacion, mappeoTipoContratacion } from "../../validaciones/talento-humano.ts/contratacionSchema";
import { mappeoEstadoConvocatoria } from "../../validaciones/talento-humano.ts/convocatoriaSchema";


type Props = {
  className?: string;
  register?: any;
  id: string;
}

export const SelectLocales = ({ id, className, register = false }: Props) => {
  const optionsMap = {
    estado_convocatoria: mappeoEstadoConvocatoria,
    tipo_contrato: mappeoTipoContratacion,
    area: mappeoAreaContratacion,
    tipo_cuenta: mappeoTipoCuenta,
    regimen_pensional: mappeoRegimenPensional,
  };

  const options = optionsMap[id as keyof typeof optionsMap];

  return (
    <div className="flex flex-col">
      <select
        defaultValue=""
        {...register}
        id={id}
        className={`${className}
          h-12 w-full rounded-xl border-2 border-gray-300
          shadow-md p-3 text-sm text-slate-900 font-medium
          focus:outline-none focus:border-blue-500 focus:shadow-lg focus:ring-1 focus:ring-blue-400
          transition-all duration-200 bg-white
 `}
      >
        <option value="" disabled>
          Seleccione una opción
        </option>
        {options && Object.entries(options).map(([key, value]) => (
          <option key={key} value={key}>
            {value}
          </option>
        ))}
      </select>
    </div>
  );
};