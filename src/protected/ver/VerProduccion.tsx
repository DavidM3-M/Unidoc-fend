import { useEffect, useState } from "react";
import axios from "axios";
import { CalendarIcono } from "../../assets/icons/Iconos";
import InformacionLabel from "../../componentes/formularios/InformacionLabel";
import LabelVer from "../../componentes/formularios/LabelVer";
import VerDocumento from "../../componentes/formularios/VerDocumento";
import { BookOpen, CheckCircle, IdCard, MegaphoneIcon } from "lucide-react";

const VerProduccion = ({ produccion }: { produccion: any }) => {
  const documento = produccion.documentos_produccion_academica?.[0];

  const [ambito, setAmbito] = useState<any>(null);
  const [loadingAmbito, setLoadingAmbito] = useState(true);

  const Url = `${import.meta.env.VITE_API_URL}${
    import.meta.env.VITE_ENDPOINT_OBTENER_AMBITO_DIVULGACION
  }`;

  useEffect(() => {
    const fetchAmbito = async () => {
      try {
        const resp = await axios.get(
          `${Url}${produccion.ambito_divulgacion_id}`
        );
        console.log("Respuesta de ambito divulgacion:", resp.data);
        setAmbito(resp.data);
      } catch (error) {
        console.error("Error obteniendo el ámbito:", error);
      } finally {
        setLoadingAmbito(false);
      }
    };

    fetchAmbito();
  }, [produccion.ambito_divulgacion_id]);

  return (
    <div className="flex flex-col gap-6 pt-4 text-[#637887]">
      {/* Sección principal: Tipo - Título */}
      <div className="flex flex-col border-l-8 rounded-lg border-indigo-500 p-4 gap-2">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 w-full">
          <BookOpen className="icono bg-gradient-to-br from-indigo-400 to-indigo-500" />

          <div className="flex flex-col items-start w-full">
            <h4>Tipo de producción académica</h4>
            <span className="description-text">
              Información del producto académico registrado
            </span>
          </div>
        </div>

        {/* Chips / tipo */}
        <div className="flex mt-2 flex-wrap gap-2">
          <span className="flex px-3 py-1 font-semibold rounded-full bg-blue-50 text-blue-800 sm:text-sm w-fit">
            {ambito?.nombre_producto_academico}
          </span>

          <span className="flex px-3 py-1 font-semibold rounded-full bg-green-50 text-green-800 sm:text-sm w-fit">
            {ambito?.nombre_ambito_divulgacion}
          </span>
        </div>
        <h2 className="text-xl font-bold text-gray-800 mt-2">
          {produccion.titulo || "Sin título especificado"}
        </h2>
        <div>
          <LabelVer text="Numero de autores:" />
          <InformacionLabel text={`${produccion.numero_autores}`} />
        </div>
      </div>

      <hr className="col-span-full border-gray-300" />

      {/* Medio de divulgación */}
      <div className="flex flex-col border-l-8 rounded-lg border-orange-500 p-4 gap-2">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 w-full">
          <MegaphoneIcon className="icono bg-gradient-to-br from-orange-400 to-orange-500" />

          <div className="flex flex-col items-start w-full">
            <h4>Medio de divulgación</h4>
            <span className="description-text">
              Dónde fue divulgada tu producción y cuándo
            </span>
          </div>
        </div>
        <div className="grid sm:grid-cols-2">
          <div className="">
            <LabelVer text="Medio de divulgación:" />
            <InformacionLabel text={produccion.medio_divulgacion} />
          </div>
          <div>
            <LabelVer text="Fecha de divulgación:" />
            <InformacionLabel text={produccion.fecha_divulgacion} />
          </div>
        </div>
      </div>

      <hr className="col-span-full border-gray-300" />



      {/* Documento */}
      <VerDocumento documento={documento} />
    </div>
  );
};

export default VerProduccion;
