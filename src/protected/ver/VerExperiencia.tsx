import { Briefcase, BriefcaseBusinessIcon } from "lucide-react";

import InformacionLabel from "../../componentes/formularios/InformacionLabel";
import LabelVer from "../../componentes/formularios/LabelVer";
import VerDocumento from "../../componentes/formularios/VerDocumento";

const VerExperiencia = ({ experiencia }: { experiencia: any }) => {
  const documento = experiencia.documentos_experiencia?.[0];

  return (
    <div className="flex flex-col gap-6 pt-4">
      {/* Sección principal: tipo y cargo */}
      <div className="flex flex-col rounded-r-xl border border-gray-200 border-l-4 border-l-[#1e3a5f] bg-white p-5 gap-4 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 w-full">
          <div className="p-3 bg-[#1e3a5f]/5 rounded-xl text-[#1e3a5f] flex items-center justify-center">
            <Briefcase size={24} />
          </div>

          <div className="flex flex-col items-start w-full">
            <h4 className="text-base font-bold text-[#1e3a5f]">Experiencia profesional</h4>
            <span className="text-xs text-gray-500 font-medium">
              Información relacionada con tu experiencia laboral
            </span>
          </div>
        </div>

        <div className="mt-2">
          {/* Tipo de experiencia */}
          <span className="flex px-3 py-1 font-semibold rounded-lg bg-[#1e3a5f]/5 border border-[#1e3a5f]/10 text-[#1e3a5f] text-xs sm:text-sm w-fit">
            {experiencia.tipo_experiencia || "Experiencia profesional"}
          </span>

          {/* Cargo */}
          <h2 className="text-xl font-bold text-gray-900 tracking-tight mt-3">
            {experiencia.cargo || "Cargo no especificado"}
          </h2>
          
          <div className="grid sm:grid-cols-2 gap-4 pt-4 mt-2 border-t border-gray-100">
            <div>
              <LabelVer text="Institución:" />
              <div className="mt-1">
                <InformacionLabel text={experiencia.institucion_experiencia} />
              </div>
            </div>
            <div>
              <LabelVer text="Intensidad horaria:" />
              <div className="mt-1">
                <InformacionLabel
                  text={`${experiencia.intensidad_horaria} horas`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <hr className="col-span-full border-gray-200/60" />

      {/* Información general */}
      <div className="flex flex-col rounded-r-xl border border-gray-200 border-l-4 border-l-[#1e3a5f] bg-white p-5 gap-4 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 w-full">
          <div className="p-3 bg-[#1e3a5f]/5 rounded-xl text-[#1e3a5f] flex items-center justify-center">
            <BriefcaseBusinessIcon size={24} />
          </div>

          <div className="flex flex-col items-start w-full">
            <h4 className="text-base font-bold text-[#1e3a5f]">Información fechas</h4>
            <span className="text-xs text-gray-500 font-medium">
              Fechas de inicio y finalización de la experiencia profesional
            </span>
          </div>
        </div>
        
        <div className="grid sm:grid-cols-2 gap-4 pt-3 border-t border-gray-100">
          <div>
            <LabelVer text="Fecha inicio:" />
            <div className="mt-1">
              <InformacionLabel text={experiencia.fecha_inicio} />
            </div>
          </div>
          <div>
            <LabelVer text="Fecha finalización:" />
            <div className="mt-1">
              <InformacionLabel
                text={experiencia.fecha_finalizacion || "Trabajo actual"}
              />
            </div>
          </div>
          <div className="sm:col-span-2">
            <LabelVer text="Fecha expedición del certificado:" />
            <div className="mt-1">
              <InformacionLabel text={experiencia.fecha_expedicion_certificado} />
            </div>
          </div>
        </div>
      </div>

      {/* Documento */}
      <div className="mt-2">
        <VerDocumento documento={documento} />
      </div>
    </div>
  );
};

export default VerExperiencia;