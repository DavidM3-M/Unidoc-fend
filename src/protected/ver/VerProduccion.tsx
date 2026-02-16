import { useEffect, useState } from "react";
import axios from "axios";
import InformacionLabel from "../../componentes/formularios/InformacionLabel";
import LabelVer from "../../componentes/formularios/LabelVer";
import VerDocumento from "../../componentes/formularios/VerDocumento";
import { BookOpen, Calendar, Globe } from "lucide-react";

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
    <div className="flex flex-col gap-6 pt-4 text-[#637887]">
      {/* Sección principal: Tipo - Título */}
      <div className="flex flex-col border-l-8 rounded-lg border-cyan-500 p-4 gap-3">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 w-full">
          <BookOpen className="icono bg-gradient-to-br from-cyan-400 to-cyan-500" />

          <div className="flex flex-col items-start w-full">
            <h4>Producción académica</h4>
            <span className="description-text">
              Información relacionada con tu producción académica
            </span>
          </div>
        </div>

        <div className="mt-2">
          {/* Ámbito de divulgación */}
          <span className="flex px-3 py-1 font-semibold rounded-full bg-blue-50 text-blue-800 sm:text-sm w-fit">
            {ambito?.nombre_ambito_divulgacion || "Ámbito no especificado"}
          </span>

          {/* Título */}
          <h2 className="text-xl font-bold text-gray-800 mt-2">
            {produccion.titulo || "Sin título especificado"}
          </h2>

          <div className="grid sm:grid-cols-2 mt-4 gap-4">
            <div>
              <LabelVer text="Medio de divulgación:" />
              <InformacionLabel text={produccion.medio_divulgacion} />
            </div>
            <div>
              <LabelVer text="Número de autores:" />
              <InformacionLabel
                text={`${produccion.numero_autores} ${
                  produccion.numero_autores === 1 ? "autor" : "autores"
                }`}
              />
            </div>
          </div>
        </div>
      </div>

      <hr className="border-gray-300" />

      {/* Información de producto académico y ámbito */}
      <div className="flex flex-col border-l-8 rounded-lg border-rose-500 p-4 gap-3">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 w-full">
          <Globe className="icono bg-gradient-to-br from-rose-400 to-rose-500" />

          <div className="flex flex-col items-start w-full">
            <h4>Información de producto y ámbito</h4>
            <span className="description-text">
              Detalles del producto académico y ámbito de divulgación
            </span>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <LabelVer text="Producto académico:" />
            {loadingAmbito ? (
              <div className="text-gray-400 italic">Cargando...</div>
            ) : (
              <InformacionLabel
                text={ambito?.nombre_producto_academico || "No especificado"}
              />
            )}
          </div>
          <div>
            <LabelVer text="Ámbito de divulgación:" />
            {loadingAmbito ? (
              <div className="text-gray-400 italic">Cargando...</div>
            ) : (
              <InformacionLabel
                text={ambito?.nombre_ambito_divulgacion || "No especificado"}
              />
            )}
          </div>
        </div>
      </div>

      <hr className="border-gray-300" />

      {/* Información de fechas */}
      <div className="flex flex-col border-l-8 rounded-lg border-orange-500 p-4 gap-3">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 w-full">
          <Calendar className="icono bg-gradient-to-br from-orange-400 to-orange-500" />

          <div className="flex flex-col items-start w-full">
            <h4>Información de fechas</h4>
            <span className="description-text">
              Fecha de divulgación y registro
            </span>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <LabelVer text="Fecha de divulgación:" />
            <InformacionLabel
              text={formatFecha(produccion.fecha_divulgacion)}
            />
          </div>
          <div>
            <LabelVer text="Fecha de registro:" />
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

      {/* Documento */}
      <VerDocumento documento={documento} />
    </div>
  );
};

export default VerProduccion;
