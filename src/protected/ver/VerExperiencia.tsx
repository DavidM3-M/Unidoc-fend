import { CalendarIcono, EdificioIcon, IdiomaIcon, RelojIcon } from "../../assets/icons/Iconos";
import InformacionLabel from "../../componentes/formularios/InformacionLabel";
import LabelVer from "../../componentes/formularios/LabelVer";
import VerDocumento from "../../componentes/formularios/VerDocumento";

const VerExperiencia = ({ experiencia }: { experiencia: any }) => {
  const documento = experiencia.documentos_experiencia?.[0];

  return (
    <div className="flex flex-col gap-4 text-[#637887]">
      {/* Título */}
      <div className="flex flex-col gap-2">
        <span className="flex px-3 py-1 font-semibold rounded-full bg-blue-50 text-blue-800 sm:text-sm w-fit">
          {experiencia.tipo_experiencia || "Experiencia profesional"}
        </span>

        <h2 className="text-xl font-bold text-gray-800">
          {experiencia.cargo || "Cargo no especificado"}
        </h2>
      </div>

      {/* Institución */}
      <div className="border-b-[1px] border-gray-400 ">
        <LabelVer text="Institución:" />
        <div className="flex items-center">
          <EdificioIcon />
          <InformacionLabel text={experiencia.institucion_experiencia} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 sm:h-[62px] gap-8">

        {/* Fechas: inicio, fin, certificado */}
        <div className="h-full flex flex-col justify-center border-b-[1px] border-gray-400">
          <LabelVer text="Periodo:" />
          <div className="flex items-center ">
            <CalendarIcono />
            <InformacionLabel
              text={`${experiencia.fecha_inicio} / ${
                experiencia.fecha_finalizacion ?? "Actual"
              }`}
            />
          </div>
        </div>
        {/* Intensidad horaria */}
        <div className="border-b-[1px] border-gray-400">
          <LabelVer text="Intensidad horaria:" />
          <div className="flex items-center">
            <RelojIcon />
            <InformacionLabel
              text={`${experiencia.intensidad_horaria} horas`}
            />
          </div>
        </div>
      </div>

      {/* Documento adjunto */}
      <VerDocumento documento={documento} />
    </div>
  );
};

export default VerExperiencia;
