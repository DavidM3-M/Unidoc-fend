import { LanguageIcon } from "@heroicons/react/24/outline";
import InformacionLabel from "../../componentes/formularios/InformacionLabel";
import LabelVer from "../../componentes/formularios/LabelVer";
import VerDocumento from "../../componentes/formularios/VerDocumento";
import { Award } from "lucide-react";

const VerIdioma = ({ idiomaData }: { idiomaData: any }) => {
  const documento = idiomaData.documentos_idioma?.[0];

  return (
    <div className="flex flex-col gap-6 pt-4">
      {/* BLOQUE: Información del idioma */}
      <div className="flex flex-col rounded-r-xl border border-gray-200 border-l-4 border-l-[#1e3a5f] bg-white p-5 gap-4 shadow-sm">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 w-full">
          <div className="p-3 bg-[#1e3a5f]/5 rounded-xl text-[#1e3a5f] flex items-center justify-center">
            <LanguageIcon className="w-6 h-6" />
          </div>

          <div className="flex flex-col items-start w-full">
            <h4 className="text-base font-bold text-[#1e3a5f]">Información del idioma</h4>
            <span className="text-xs text-gray-500 font-medium">
              Detalles sobre tu certificación en idiomas
            </span>
          </div>
        </div>

        {/* Chips + Título */}
        <div className="mt-2">
          <div className="flex flex-col gap-3">
            {/* Chip Idioma */}
            <span className="flex px-3 py-1 font-semibold rounded-lg bg-[#1e3a5f]/5 border border-[#1e3a5f]/10 text-[#1e3a5f] text-xs sm:text-sm w-fit">
              {"Nivel: " + (idiomaData.nivel || "Idioma no especificado")}
            </span>
    
            {/* Título principal */}
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">
              {idiomaData.idioma || "Nivel no especificado"}
            </h2>
          </div>
        </div>

        {/* Institución */}
        <div className="pt-3 border-t border-gray-100">
          <LabelVer text="Institución:" />
          <div className="mt-1 flex items-center">
            <InformacionLabel text={idiomaData.institucion_idioma} />
          </div>
        </div>
      </div>

      <hr className="col-span-full border-gray-200/60" />

      {/* BLOQUE: Certificación */}
      <div className="flex flex-col rounded-r-xl border border-gray-200 border-l-4 border-l-[#1e3a5f] bg-white p-5 gap-4 shadow-sm">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 w-full">
          <div className="p-3 bg-[#1e3a5f]/5 rounded-xl text-[#1e3a5f] flex items-center justify-center">
            <Award size={24} />
          </div>

          <div className="flex flex-col items-start w-full">
            <h4 className="text-base font-bold text-[#1e3a5f]">Certificación del idioma</h4>
            <span className="text-xs text-gray-500 font-medium">
              Información sobre nivel y certificación del idioma
            </span>
          </div>
        </div>

        {/* Contenido */}
        <div className="grid sm:grid-cols-2 gap-4 pt-3 border-t border-gray-100">
          {/* Nivel */}
          <div>
            <LabelVer text="Nivel alcanzado:" />
            <div className="mt-1 flex items-center gap-2">
              <InformacionLabel text={idiomaData.nivel} />
            </div>
          </div>

          {/* Fecha de certificado */}
          <div>
            <LabelVer text="Fecha del certificado:" />
            <div className="mt-1 flex items-center gap-2">
              <InformacionLabel text={idiomaData.fecha_certificado || "N/A"} />
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

export default VerIdioma;