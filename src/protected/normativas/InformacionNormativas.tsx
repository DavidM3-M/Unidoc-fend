import { Texto } from "../../componentes/formularios/Texto";

const InformacionNormativas = () => {
  return (
    <div className="flex flex-col w-full rounded-md">
      <div className="grid grid-cols-1 bg-white py-12 px-8 rounded-xl gap-7 shadow-sm">
        {/* Encabezado con línea divisoria */}
        <div className="flex flex-col md:flex-row gap-y-2 col-span-full justify-between border-b border-gray-200 pb-6">
          <h1 className="font-bold text-3xl text-gray-800">Normativas</h1>
        </div>

        {/* Contenido de normativas */}
        <div className="text-gray-600 text-justify text-lg leading-relaxed space-y-4">
          <Texto 
            value="El Banco de Aspirantes constituye la herramienta para la recopilación de información y documentación. Como referentes normativos se constituyen los Acuerdos Superiores, Académicos, Resoluciones Rectorales y Circulares, reglamentarios del proceso de selección y vinculación de profesores."
            className="text-gray-700 leading-7"
          />
        </div>
      </div>
    </div>
  );
};

export default InformacionNormativas;