import type { UseFormRegisterReturn } from "react-hook-form";
import { mappeoEstadoAntecedentes } from "../../validaciones/aspirante/antecedentesJudiciales";
import { mappeoClaseRiesgo, mappeoEstadoAfiliacion } from "../../validaciones/aspirante/arlSchema";
import { mappeoTipoCuenta } from "../../validaciones/aspirante/certificacionBancariaSchema";
import { mappeoRegimenPensional } from "../../validaciones/aspirante/pensionSchema";
import { mappeoAreaContratacion, mappeoTipoContratacion, mappeoTipoProceso, mappeoTipoVinculacion } from "../../validaciones/talento-humano.ts/contratacionSchema";
import { mappeoEstadoConvocatoria } from "../../validaciones/talento-humano.ts/convocatoriaSchema";

type Props = {
  className?: string;
  register?: UseFormRegisterReturn;
  id: string;
}

export const SelectLocales = ({ id, className, register }: Props) => {
  const optionsMap = {
    estado_convocatoria: mappeoEstadoConvocatoria,
    tipo_proceso: mappeoTipoProceso,
    tipo_vinculacion: mappeoTipoVinculacion,
    tipo_contrato: mappeoTipoContratacion,
    area: mappeoAreaContratacion,
    tipo_cuenta: mappeoTipoCuenta,
    regimen_pensional: mappeoRegimenPensional,
    estado_antecedentes: mappeoEstadoAntecedentes,
    estado_afiliacion: mappeoEstadoAfiliacion,
    clase_riesgo: mappeoClaseRiesgo
  };

  const options = optionsMap[id as keyof typeof optionsMap];

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