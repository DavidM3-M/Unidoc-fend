import { useEffect, useState } from "react";
import axios from "axios";
import { CalendarIcono } from "../../assets/icons/Iconos";
import InformacionLabel from "../../componentes/formularios/InformacionLabel";
import LabelVer from "../../componentes/formularios/LabelVer";
import VerDocumento from "../../componentes/formularios/VerDocumento";

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
        const resp = await axios.get(`${Url}${produccion.ambito_divulgacion_id}`);
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
    <div className="flex flex-col gap-4 text-[#637887]">
      {/* Tipo o título */}
      <div className="flex flex-col gap-2">
        <span className="flex px-3 py-1 font-semibold rounded-full bg-blue-50 text-blue-800 sm:text-sm w-fit">
          
          {ambito?.nombre_producto_academico} - {ambito?.nombre_ambito_divulgacion}
        </span>

        <h2 className="text-xl font-bold text-gray-800">
          {produccion.titulo || "Sin título especificado"}
        </h2>
      </div>

      {/* Medio de divulgación */}
      <div className="border-b-[1px] border-gray-400">
        <LabelVer text="Medio de divulgación:" />
        <InformacionLabel text={produccion.medio_divulgacion} />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        {/* Fecha */}
        <div className="h-full flex flex-col justify-center border-b-[1px] border-gray-400">
          <LabelVer text="Fecha de divulgación:" />
          <div className="flex items-center gap-2">
            <CalendarIcono />
            <InformacionLabel text={produccion.fecha_divulgacion} />
          </div>
        </div>

        {/* Autores */}
        <div className="h-full flex flex-col justify-center border-b-[1px] border-gray-400">
          <LabelVer text="Número de autores:" />
          <InformacionLabel text={`${produccion.numero_autores}`} />
        </div>

        {/* Ámbito */}
        <div className="h-full flex flex-col justify-center border-b-[1px] border-gray-400 sm:col-span-2">
          <LabelVer text="Ámbito de divulgación:" />

          <InformacionLabel
            text={
              loadingAmbito
                ? "Cargando..."
                : ambito?.nombre_ambito_divulgacion ||
                  `ID: ${produccion.ambito_divulgacion_id}`
            }
          />
        </div>
      </div>

      {/* Documento */}
      <VerDocumento documento={documento} />
    </div>
  );
};

export default VerProduccion;
