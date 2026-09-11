import type { ProduccionRegistro } from "../../types/trayectoria";
import InformacionLabel from "../../componentes/formularios/InformacionLabel";
import LabelVer from "../../componentes/formularios/LabelVer";
import VerDocumento from "../../componentes/formularios/VerDocumento";
import { BookOpen, Calendar, Globe } from "lucide-react";
import { fechaLarga } from "../../utils/fechas";

const VerProduccion = ({ produccion }: { produccion: ProduccionRegistro | null }) => {
  if (!produccion) return null;
  const documento = produccion.documentos_produccion_academica?.[0];

  // El ámbito llega con la producción (eager-load en `obtenerProducciones`), así que ya no hace
  // falta pedirlo por HTTP cada vez que se abre el detalle.
  const ambito = produccion.ambito_divulgacion_produccion_academica;
  const productoAcademico = ambito?.producto_academico_ambito_divulgacion;

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
              <InformacionLabel
                text={productoAcademico?.nombre_producto_academico || "No especificado"}
              />
            </div>
          </div>
          <div>
            <LabelVer text="Ámbito de divulgación:" />
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <InformacionLabel
                text={ambito?.nombre_ambito_divulgacion || "No especificado"}
              />
              {/* Solo con puntaje real. Hoy los 82 ámbitos de la base están en 0 porque el
                  backfill de `2026_08_16_000001` corrió sobre la tabla vacía —el entrypoint
                  migra antes de sembrar— así que mostrar "0 puntos" en todos sería ruido. */}
              {typeof ambito?.puntaje === "number" && ambito.puntaje > 0 && (
                <span className="text-[10px] font-bold uppercase tracking-wide rounded-full bg-[rgba(30,58,95,0.06)] text-[#1e3a5f] px-2 py-0.5">
                  {ambito.puntaje} {ambito.puntaje === 1 ? "punto" : "puntos"}
                </span>
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
                text={fechaLarga(produccion.fecha_divulgacion)}
              />
            </div>
          </div>
          <div>
            <LabelVer text="Fecha de registro:" />
            <div className="mt-1">
              <InformacionLabel
                text={
                  produccion.created_at
                    ? fechaLarga(produccion.created_at)
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