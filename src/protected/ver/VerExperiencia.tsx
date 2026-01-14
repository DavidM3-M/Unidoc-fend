import { Briefcase, BriefcaseBusinessIcon } from "lucide-react";

import InformacionLabel from "../../componentes/formularios/InformacionLabel";
import LabelVer from "../../componentes/formularios/LabelVer";
import VerDocumento from "../../componentes/formularios/VerDocumento";

const VerExperiencia = ({ experiencia }: { experiencia: any }) => {
  const documento = experiencia.documentos_experiencia?.[0];

  return (
    <div className="flex flex-col gap-6 pt-4 text-[#637887]">
      {/* Sección principal: tipo y cargo */}
      <div className="flex flex-col border-l-8 rounded-lg border-cyan-500 p-4 gap-3">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 w-full">
          <Briefcase className="icono bg-gradient-to-br from-cyan-400 to-cyan-500" />

          <div className="flex flex-col items-start w-full">
            <h4>Experiencia profesional</h4>
            <span className="description-text">
              Información relacionada con tu experiencia laboral
            </span>
          </div>
        </div>

        <div className="mt-2">
          {/* Tipo de experiencia */}
          <span className="flex px-3 py-1 font-semibold rounded-full bg-blue-50 text-blue-800 sm:text-sm w-fit">
            {experiencia.tipo_experiencia || "Experiencia profesional"}
          </span>

          {/* Cargo */}
          <h2 className="text-xl font-bold text-gray-800 mt-2">
            {experiencia.cargo || "Cargo no especificado"}
          </h2>
          <div className="grid  sm:grid-cols-2 mt-4 ">
            <div>
              <LabelVer text="Institución:" />
              <InformacionLabel text={experiencia.institucion_experiencia} />
            </div>
            <div>
              <LabelVer text="Intensidad horaria:" />
              <InformacionLabel
                text={`${experiencia.intensidad_horaria} horas`}
              />
            </div>
          </div>
        </div>
      </div>

      <hr className="border-gray-300" />

      {/* Información general */}
      <div className="flex flex-col border-l-8 rounded-lg border-rose-500 p-4 gap-3">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 w-full">
          <BriefcaseBusinessIcon className="icono bg-gradient-to-br from-rose-400 to-rose-500" />

          <div className="flex flex-col items-start w-full">
            <h4>Información fechas</h4>
            <span className="description-text">
              Fechas de inicio y finalización de la experiencia profesional
            </span>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-2">
          <div>
            <LabelVer text="Fecha inicio:" />
            <InformacionLabel text={experiencia.fecha_inicio} />
          </div>
          <div>
            <LabelVer text="Fecha finalización:" />
            <InformacionLabel
              text={experiencia.fecha_finalizacion || "Trabajo actual"}
            />
          </div>
          <div>
            <LabelVer text="Fecha expedición del certificado:" />
            <InformacionLabel text={experiencia.fecha_expedicion_certificado} />
          </div>
        </div>
      </div>

      {/* Documento */}
      <VerDocumento documento={documento} />
    </div>
  );
};

export default VerExperiencia;
