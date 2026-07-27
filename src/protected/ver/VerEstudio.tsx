import { CalendarIcon, CheckCircle, GraduationCap, IdCard } from "lucide-react";
import InformacionLabel from "../../componentes/formularios/InformacionLabel";
import LabelVer from "../../componentes/formularios/LabelVer";
import VerDocumento from "../../componentes/formularios/VerDocumento";

const VerEstudio = ({ estudio }: { estudio: any }) => {
  const documento = estudio.documentos_estudio?.[0];
  return (
    <div className="flex flex-col gap-6 pt-4">
      
      {/* Sección: Información del estudio */}
      <div className="flex flex-col rounded-r-xl border border-gray-200 border-l-4 border-l-[#1e3a5f] bg-white p-5 gap-4 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 w-full">
          <div className="p-3 bg-[#1e3a5f]/5 rounded-xl text-[#1e3a5f] flex items-center justify-center">
            <IdCard size={24} />
          </div>

          <div className="flex flex-col items-start w-full">
            <h4 className="text-base font-bold text-[#1e3a5f]">Información del estudio</h4>
            <span className="text-xs text-gray-500 font-medium">
              Datos de tu formación académica
            </span>
          </div>
        </div>
        
        <div className="mt-2">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-2">
              <span className="flex px-3 py-1 font-semibold rounded-lg bg-[#1e3a5f]/5 border border-[#1e3a5f]/10 text-[#1e3a5f] text-xs sm:text-sm w-fit">
                {estudio.tipo_estudio || "Estudio académico"}
              </span>
              
              {/* Mostrar si es convalidado */}
              {estudio.titulo_convalidado === "Si" && (
                <span className="flex px-3 py-1 font-semibold rounded-lg bg-gray-100 border border-gray-200 text-gray-800 text-xs sm:text-sm w-fit">
                  Convalidado
                </span>
              )}
              
              {/* Mostrar si es graduado */}
              {estudio.graduado === "Si" && (
                <span className="flex px-3 py-1 font-semibold rounded-lg bg-[#1e3a5f]/10 border border-[#1e3a5f]/20 text-[#1e3a5f] text-xs sm:text-sm w-fit">
                  Graduado
                </span>
              )}
            </div>
            
            <div>
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                {estudio.titulo_estudio || "Sin título especificado"}
              </h2>
            </div>
          </div>
        </div>
        
        <div className="pt-3 border-t border-gray-100">
          <LabelVer text="Institución:" />
          <div className="mt-1">
            <InformacionLabel text={estudio.institucion} />
          </div>
        </div>
      </div>

      <hr className="col-span-full border-gray-200/60" />

      {/* Sección: Estado de graduación */}
      <div className="flex flex-col rounded-r-xl border border-gray-200 border-l-4 border-l-[#1e3a5f] bg-white p-5 gap-4 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 w-full">
          <div className="p-3 bg-[#1e3a5f]/5 rounded-xl text-[#1e3a5f] flex items-center justify-center">
            <GraduationCap size={24} />
          </div>

          <div className="flex flex-col items-start w-full">
            <h4 className="text-base font-bold text-[#1e3a5f]">Estado de graduación</h4>
            <span className="text-xs text-gray-500 font-medium">
              Información sobre tu grado académico
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-gray-100">
          <div>
            <LabelVer text="Graduado:" />
            <div className="mt-1">
              <InformacionLabel
                text={estudio.graduado === "Si" ? "Sí" : "En proceso"}
              />
            </div>
          </div>
          <div>
            <LabelVer
              text={
                estudio.fecha_graduacion
                  ? "Fecha de graduación:"
                  : "Posible fecha de graduación:"
              }
            />
            <div className="mt-1">
              <InformacionLabel
                text={
                  estudio.fecha_graduacion || estudio.posible_fecha_graduacion
                }
              />
            </div>
          </div>
        </div>
      </div>

      <hr className="col-span-full border-gray-200/60" />

      {/* Sección: Convalidación */}
      <div className="flex flex-col rounded-r-xl border border-gray-200 border-l-4 border-l-[#1e3a5f] bg-white p-5 gap-4 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 w-full">
          <div className="p-3 bg-[#1e3a5f]/5 rounded-xl text-[#1e3a5f] flex items-center justify-center">
            <CheckCircle size={24} />
          </div>

          <div className="flex flex-col items-start w-full">
            <h4 className="text-base font-bold text-[#1e3a5f]">Convalidación de título</h4>
            <span className="text-xs text-gray-500 font-medium">
              Información sobre si el título ha sido convalidado
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-gray-100">
          <div>
            <LabelVer text="Título convalidado:" />
            <div className="mt-1">
              <InformacionLabel
                text={estudio.titulo_convalidado === "Si" ? "Sí" : "No"}
              />
            </div>
          </div>
          {estudio.titulo_convalidado === "Si" && (
            <>
              <div>
                <LabelVer text="Número de resolución:" />
                <div className="mt-1">
                  <InformacionLabel
                    text={estudio.resolucion_convalidacion || "N/A"}
                  />
                </div>
              </div>
              <div className="sm:col-span-2">
                <LabelVer text="Fecha de convalidación:" />
                <div className="mt-1">
                  <InformacionLabel text={estudio.fecha_convalidacion || "N/A"} />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      
      <hr className="col-span-full border-gray-200/60" />

      {/* Sección: Periodo y actividad */}
      <div className="flex flex-col rounded-r-xl border border-gray-200 border-l-4 border-l-[#1e3a5f] bg-white p-5 gap-4 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 w-full">
          <div className="p-3 bg-[#1e3a5f]/5 rounded-xl text-[#1e3a5f] flex items-center justify-center">
            <CalendarIcon size={24} />
          </div>

          <div className="flex flex-col items-start w-full">
            <h4 className="text-base font-bold text-[#1e3a5f]">Periodo de estudio / actividad</h4>
            <span className="text-xs text-gray-500 font-medium">
              Fechas de inicio y fin de tu formación académica
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-gray-100">
          <div>
            <LabelVer text="Fecha de inicio:" />
            <div className="mt-1">
              <InformacionLabel text={estudio.fecha_inicio} />
            </div>
          </div>
          <div>
            <LabelVer text="Fecha de fin:" />
            <div className="mt-1">
              <InformacionLabel text={estudio.fecha_fin || "N/A"} />
            </div>
          </div>
        </div>
      </div>

      {/* Renderizador del documento adjunto */}
      <div className="mt-2">
        <VerDocumento documento={documento} />
      </div>
    </div>
  );
};

export default VerEstudio;