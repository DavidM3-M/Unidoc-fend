import { CalendarIcon, CheckCircle, GraduationCap, IdCard } from "lucide-react";
import InformacionLabel from "../../componentes/formularios/InformacionLabel";
import LabelVer from "../../componentes/formularios/LabelVer";
import VerDocumento from "../../componentes/formularios/VerDocumento";

const VerEstudio = ({ estudio }: { estudio: any }) => {
  const documento = estudio.documentos_estudio?.[0];
  return (
    <div className="flex flex-col gap-6 pt-4">
      <div className="flex flex-col border-l-8 rounded-lg border-blue-500 p-4 gap-2">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 w-full">
          <IdCard className="icono bg-gradient-to-br from-blue-400 to-blue-500" />

          <div className="flex flex-col items-start w-full">
            <h4>Información del estudio</h4>
            <span className="description-text">
              Datos de tu formación académica
            </span>
          </div>
        </div>
        <div className="mt-2">
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap  gap-2">
              <span className="flex px-3 py-1  font-semibold rounded-full bg-blue-50 text-blue-800 sm:text-sm w-fit ">
                {estudio.tipo_estudio || "Estudio académico"}
              </span>
              {/* mostrar si es convalido */}
              <span>
                {estudio.titulo_convalidado === "Si" && (
                  <span className="flex px-3 py-1  font-semibold rounded-full bg-green-50 text-green-800 sm:text-sm w-fit ">
                    Convalidado
                  </span>
                )}
              </span>
              {/* mostrar si es graduado */}
              <span>
                {estudio.graduado === "Si" && (
                  <span className="flex px-3 py-1  font-semibold rounded-full bg-purple-50 text-purple-800 sm:text-sm w-fit ">
                    Graduado
                  </span>
                )}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                {estudio.titulo_estudio || "Sin título especificado"}
              </h2>
            </div>
          </div>
        </div>
        <div className="">
          <LabelVer text="Institución:" />
          <div className="">
            <InformacionLabel text={estudio.institucion} />
          </div>
        </div>
      </div>
      <hr className="col-span-full border-gray-300" />

      <div className="flex flex-col border-l-8 rounded-lg border-green-500 p-4 gap-2">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 w-full">
          <GraduationCap className="icono bg-gradient-to-br from-green-400 to-green-500" />

          <div className="flex flex-col items-start w-full">
            <h4>Estado de graduación</h4>
            <span className="description-text">
              Información sobre tu grado académico
            </span>
          </div>
        </div>
        <div className="grid sm:grid-cols-2">
          <div>
            <LabelVer text="Graduado:" />

            <InformacionLabel
              text={estudio.graduado === "Si" ? "Sí" : "En proceso"}
            />
          </div>
          <div>
            <LabelVer
              text={
                estudio.fecha_graduacion
                  ? "Fecha de graduación:"
                  : "Posible fecha de graduación:"
              }
            />
            <InformacionLabel
              text={
                estudio.fecha_graduacion || estudio.posible_fecha_graduacion
              }
            />
          </div>
        </div>
      </div>

      {/* Convalidacion */}
      <hr className="col-span-full border-gray-300" />

      <div className="flex flex-col border-l-8 rounded-lg border-purple-500 p-4 gap-2">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 w-full">
          <CheckCircle className="icono bg-gradient-to-br from-purple-400 to-purple-500" />

          <div className="flex flex-col items-start w-full">
            <h4>Convalidación de título</h4>
            <span className="description-text">
              Información sobre si el título ha sido convalidado
            </span>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-2">
          <div>
            <LabelVer text="Título convalidado:" />
            <InformacionLabel
              text={estudio.titulo_convalidado === "Si" ? "Sí" : "No"}
            />
          </div>
          {estudio.titulo_convalidado === "Si" && (
            <>
              <div>
                <LabelVer text="Número de resolución:" />
                <InformacionLabel
                  text={estudio.resolucion_convalidacion || "N/A"}
                />
              </div>
              <div>
                <LabelVer text="Fecha de convalidación:" />
                <InformacionLabel text={estudio.fecha_convalidacion || "N/A"} />
              </div>
            </>
          )}
        </div>
      </div>
      <hr className="col-span-full border-gray-300" />

      {/* Periodo y graduado */}
      <div className="flex flex-col border-l-8 rounded-lg border-indigo-500 p-4 gap-2">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 w-full">
          <CalendarIcon className="icono bg-gradient-to-br from-indigo-400 to-indigo-500" />

          <div className="flex flex-col items-start w-full">
            <h4>Periodo de estudio / actividad</h4>
            <span className="description-text">
              Fechas de inicio y fin de tu formación académica
            </span>
          </div>
        </div>
        <div className="grid sm:grid-cols-2">
          <div>
            <LabelVer text="Fecha de inicio:" />
            <InformacionLabel text={estudio.fecha_inicio} />
          </div>
          <div>
            <LabelVer text="Fecha de fin:" />
            <InformacionLabel text={estudio.fecha_fin || "N/A"} />
          </div>
        </div>
      </div>

      <VerDocumento documento={documento} />
    </div>
  );
};

export default VerEstudio;
