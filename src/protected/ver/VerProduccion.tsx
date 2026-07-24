import { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosConfig";
import InformacionLabel from "../../componentes/formularios/InformacionLabel";
import LabelVer from "../../componentes/formularios/LabelVer";
import VerDocumento from "../../componentes/formularios/VerDocumento";
import { BookOpen, Calendar, Globe } from "lucide-react";

const VerProduccion = ({ produccion }: { produccion: any }) => {
  const documento = produccion.documentos_produccion_academica?.[0];
  const [ambito, setAmbito] = useState<any>(null);
  const [loadingAmbito, setLoadingAmbito] = useState(true);

  const Url = import.meta.env.VITE_ENDPOINT_OBTENER_AMBITO_DIVULGACION;

  useEffect(() => {
    const fetchAmbito = async () => {
      try {
        const resp = await axiosInstance.get(
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

    if (produccion.ambito_divulgacion_id) {
      fetchAmbito();
    }
  }, [produccion.ambito_divulgacion_id, Url]);

  // Función para formatear fechas
  const formatFecha = (fecha: string): string => {
    if (!fecha || fecha === "null") return "Sin fecha";
    try {
      const date = new Date(fecha);
      return date.toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      return fecha;
    }
  };

  return (
    <div className="flex flex-col gap-6 pt-4">
      {/* Sección principal: Tipo - Título */}
      <div className="flex flex-col rounded-r-xl border border-gray-200 border-l-4 border-l-[#1e3a5f] bg-white p-5 gap-4 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 w-full">
          <div className="p-3 bg-[#1e3a5f]/5 rounded-xl text-[#1e3a5f] flex items-center justify-center">
            <BookOpen size={24} />
          </div>

          <div className="flex flex-col items-start w-full">
            <h4 className="text-base font-bold text-[#1e3a5f]">Producción académica</h4>
            <span className="text-xs text-gray-500 font-medium">
              Información relacionada con tu producción académica
            </span>
          </div>
        </div>

        <div className="mt-2">
          {/* Ámbito de divulgación */}
          <span className="flex px-3 py-1 font-semibold rounded-lg bg-[#1e3a5f]/5 border border-[#1e3a5f]/10 text-[#1e3a5f] text-xs sm:text-sm w-fit">
            {ambito?.nombre_ambito_divulgacion || "Ámbito no especificado"}
          </span>

          {/* Título */}
          <h2 className="text-xl font-bold text-gray-900 tracking-tight mt-3">
            {produccion.titulo || "Sin título especificado"}
          </h2>

          <div className="grid sm:grid-cols-2 gap-4 pt-4 mt-2 border-t border-gray-100">
            <div>
              <LabelVer text="Medio de divulgación:" />
              <div className="mt-1">
                <InformacionLabel text={produccion.medio_divulgacion} />
              </div>
            </div>
            <div>
              <LabelVer text="Número de autores:" />
              <div className="mt-1">
                <InformacionLabel
                  text={`${produccion.numero_autores} ${
                    produccion.numero_autores === 1 ? "autor" : "autores"
                  }`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <hr className="col-span-full border-gray-200/60" />

      {/* Información de producto académico y ámbito */}
      <div className="flex flex-col rounded-r-xl border border-gray-200 border-l-4 border-l-[#1e3a5f] bg-white p-5 gap-4 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 w-full">
          <div className="p-3 bg-[#1e3a5f]/5 rounded-xl text-[#1e3a5f] flex items-center justify-center">
            <Globe size={24} />
          </div>

          <div className="flex flex-col items-start w-full">
            <h4 className="text-base font-bold text-[#1e3a5f]">Información de producto y ámbito</h4>
            <span className="text-xs text-gray-500 font-medium">
              Detalles del producto académico y ámbito de divulgación
            </span>
          </div>
        </div>
        
        <div className="grid sm:grid-cols-2 gap-4 pt-3 border-t border-gray-100">
          <div>
            <LabelVer text="Producto académico:" />
            <div className="mt-1">
              {loadingAmbito ? (
                <div className="text-gray-400 text-sm italic">Cargando...</div>
              ) : (
                <InformacionLabel
                  text={ambito?.nombre_producto_academico || "No especificado"}
                />
              )}
            </div>
          </div>
          <div>
            <LabelVer text="Ámbito de divulgación:" />
            <div className="mt-1">
              {loadingAmbito ? (
                <div className="text-gray-400 text-sm italic">Cargando...</div>
              ) : (
                <InformacionLabel
                  text={ambito?.nombre_ambito_divulgacion || "No especificado"}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <hr className="col-span-full border-gray-200/60" />

      {/* Información de fechas */}
      <div className="flex flex-col rounded-r-xl border border-gray-200 border-l-4 border-l-[#1e3a5f] bg-white p-5 gap-4 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 w-full">
          <div className="p-3 bg-[#1e3a5f]/5 rounded-xl text-[#1e3a5f] flex items-center justify-center">
            <Calendar size={24} />
          </div>

          <div className="flex flex-col items-start w-full">
            <h4 className="text-base font-bold text-[#1e3a5f]">Información de fechas</h4>
            <span className="text-xs text-gray-500 font-medium">
              Fecha de divulgación y registro
            </span>
          </div>
        </div>
        
        <div className="grid sm:grid-cols-2 gap-4 pt-3 border-t border-gray-100">
          <div>
            <LabelVer text="Fecha de divulgación:" />
            <div className="mt-1">
              <InformacionLabel
                text={formatFecha(produccion.fecha_divulgacion)}
              />
            </div>
          </div>
          <div>
            <LabelVer text="Fecha de registro:" />
            <div className="mt-1">
              <InformacionLabel
                text={
                  produccion.created_at
                    ? formatFecha(produccion.created_at)
                    : "No disponible"
                }
              />
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

export default VerProduccion;