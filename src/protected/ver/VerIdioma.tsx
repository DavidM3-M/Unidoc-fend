import {
  CalendarIcono,
  IdiomaIcon,
  NivelIcon,
} from "../../assets/icons/Iconos";
import InformacionLabel from "../../componentes/formularios/InformacionLabel";
import LabelVer from "../../componentes/formularios/LabelVer";
import VerDocumento from "../../componentes/formularios/VerDocumento";

const VerIdioma = ({ idiomaData }: { idiomaData: any }) => {
  const documento = idiomaData.documentos_idioma?.[0];

  return (
    <div className="flex flex-col gap-4 text-[#637887]">
      {/* Título */}
      <div className="flex flex-col gap-2">
        <span className="flex px-3 py-1 font-semibold rounded-full bg-blue-50 text-blue-800 sm:text-sm w-fit">
          Idioma
        </span>

        <h2 className="text-xl font-bold text-gray-800">
          {idiomaData.idioma || "Idioma no especificado"}
        </h2>
      </div>

      {/* Institución */}
      <div className="border-b-[1px] border-gray-400">
        <LabelVer text="Institución:" />
        <div className="flex items-center">
          <IdiomaIcon />
          <InformacionLabel text={idiomaData.institucion_idioma} />
        </div>
      </div>

      {/* Nivel y fecha */}
      <div className="grid grid-cols-1 sm:grid-cols-2 sm:h-[62px] gap-8">

        {/* Nivel */}
        <div className="h-full flex flex-col justify-center border-b-[1px] border-gray-400">
          <LabelVer text="Nivel:" />
          <div className="flex items-center">
            <NivelIcon />
            <InformacionLabel text={idiomaData.nivel} />
          </div>
        </div>

        {/* Fecha certificado */}
        <div className="h-full flex flex-col justify-center border-b-[1px] border-gray-400 ">
          <LabelVer text="Fecha de certificado:" />
          <div className="flex items-center">
            <CalendarIcono />
            <InformacionLabel text={idiomaData.fecha_certificado} />
          </div>
        </div>
      </div>

      {/* Documento adjunto */}
      <VerDocumento documento={documento} />
    </div>
  );
};

export default VerIdioma;
