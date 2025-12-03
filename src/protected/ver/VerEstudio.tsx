import { CalendarIcono, EdificioIcon } from "../../assets/icons/Iconos";
import InformacionLabel from "../../componentes/formularios/InformacionLabel";
import LabelVer from "../../componentes/formularios/LabelVer";
import VerDocumento from "../../componentes/formularios/VerDocumento";

const VerEstudio = ({ estudio }: { estudio: any }) => {
  const documento = estudio.documentos_estudio?.[0];

  return (
    <div className="flex flex-col gap-4 text-[#637887]">
      <div className="flex flex-col gap-2">
        <span className="flex px-3 py-1  font-semibold rounded-full bg-blue-50 text-blue-800 sm:text-sm w-fit ">
          {estudio.tipo_estudio || "Estudio académico"}
        </span>
        <h2 className="text-xl font-bold text-gray-800">
          {estudio.titulo_estudio || "Sin título especificado"}
        </h2>
      </div>
      <div className="border-b-[1px] border-gray-400">
        <LabelVer text="Institución:" />
        <div className="flex items-center">
          <EdificioIcon />
          <InformacionLabel text={estudio.institucion} />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 sm:h-[62px] gap-8">
        <div className="h-full flex flex-col justify-center border-b-[1px] border-gray-400">
          <LabelVer text="Periodo:" />
          <div className="flex items-center ">
            <CalendarIcono />
            <InformacionLabel
              text={`${estudio.fecha_inicio} / ${estudio.fecha_fin}`}
            />
          </div>
        </div>
        <div className="h-full flex flex-col justify-center border-b-[1px] border-gray-400">
          <LabelVer text="Graduado:" />
          {/* circulo de estado */}
          <div className="flex items-center gap-2">
            <span
              className={`h-4 w-4 rounded-full ${
                estudio.graduado === "Si" ? "bg-green-600" : "bg-orange-500"
              }`}
            ></span>

            <span
              className={`font-sm  ${
                estudio.graduado === "Si" ? "text-green-700" : "text-orange-500"
              }`}
            >
              {estudio.graduado === "Si" ? "Graduado" : "No graduado"}
            </span>
          </div>
        </div>
      </div>

      <VerDocumento documento={documento} />
    </div>
  );
};

export default VerEstudio;
