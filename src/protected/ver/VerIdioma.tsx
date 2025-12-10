import { LanguageIcon } from "@heroicons/react/24/outline";
import {
  CalendarIcono,
  EdificioIcon,
  IdiomaIcon,
  NivelIcon,
} from "../../assets/icons/Iconos";
import InformacionLabel from "../../componentes/formularios/InformacionLabel";
import LabelVer from "../../componentes/formularios/LabelVer";
import VerDocumento from "../../componentes/formularios/VerDocumento";
import { Award } from "lucide-react";

const VerIdioma = ({ idiomaData }: { idiomaData: any }) => {
  const documento = idiomaData.documentos_idioma?.[0];

  return (
    <div className="flex flex-col gap-6 pt-4">
      {/* BLOQUE: Información del idioma */}
      <div className="flex flex-col border-l-8 rounded-lg border-pink-500 p-4 gap-2">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 w-full">
          <LanguageIcon className="icono bg-gradient-to-br from-pink-400 to-pink-500" />

          <div className="flex flex-col items-start w-full">
            <h4>Información del idioma</h4>
            <span className="description-text">
              Detalles sobre tu certificación en idiomas
            </span>
          </div>
        </div>

        {/* Chips + Título */}
        <div className="mt-2">
          <div className="flex flex-col gap-2">
            {/* Chip Idioma */}
            <span className="flex px-3 py-1 font-semibold rounded-full bg-blue-50 text-blue-800 sm:text-sm w-fit">
              {"Nivel: " + (idiomaData.nivel || "Idioma no especificado")}
            </span>
    
            {/* Título principal */}
            <h2 className="text-xl font-bold text-gray-800">
              {idiomaData.idioma || "Nivel no especificado"}
            </h2>
          </div>
        </div>

        {/* Institución */}
        <div>
          <LabelVer text="Institución:" />
          <div className="flex items-center">
            <InformacionLabel text={idiomaData.institucion_idioma} />
          </div>
        </div>
      </div>

      <hr className="col-span-full border-gray-300" />

      {/* BLOQUE: Certificación */}
      <div className="flex flex-col border-l-8 rounded-lg border-yellow-500 p-4 gap-2">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 w-full">
          <Award className="icono bg-gradient-to-br from-yellow-400 to-yellow-500" />

          <div className="flex flex-col items-start w-full">
            <h4>Certificación del idioma</h4>
            <span className="description-text">
              Información sobre nivel y certificación del idioma
            </span>
          </div>
        </div>

        {/* Contenido */}
        <div className="grid sm:grid-cols-2 gap-2">
          {/* Nivel */}
          <div>
            <LabelVer text="Nivel alcanzado:" />
            <div className="flex items-center gap-2">
              <InformacionLabel text={idiomaData.nivel} />
            </div>
          </div>

          {/* Fecha de certificado */}
          <div>
            <LabelVer text="Fecha del certificado:" />
            <div className="flex items-center gap-2">
              <InformacionLabel text={idiomaData.fecha_certificado || "N/A"} />
            </div>
          </div>
        </div>
      </div>

      <hr className="col-span-full border-gray-300" />

      {/* Documento */}
      <VerDocumento documento={documento} />
    </div>
  );
};

export default VerIdioma;
