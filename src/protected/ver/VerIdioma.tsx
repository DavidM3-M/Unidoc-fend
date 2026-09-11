import type { IdiomaRegistro } from "../../types/trayectoria";
import { LanguageIcon } from "@heroicons/react/24/outline";
import InformacionLabel from "../../componentes/formularios/InformacionLabel";
import LabelVer from "../../componentes/formularios/LabelVer";
import VerDocumento from "../../componentes/formularios/VerDocumento";
import { Award } from "lucide-react";
import { calcularVigencia, formatearFecha } from "../../utils/idiomaCertificado";
import { fechaLarga } from "../../utils/fechas";

const VerIdioma = ({ idiomaData }: { idiomaData: IdiomaRegistro | null }) => {
  if (!idiomaData) return null;
  const documento = idiomaData.documentos_idioma?.[0];

  // Con puntaje, el nivel lo derivó el servidor de los rangos que el Administrador cargó para
  // el examen; sin puntaje, lo eligió el docente de una lista.
  const tienePuntaje =
    idiomaData.puntaje_obtenido !== null && idiomaData.puntaje_obtenido !== undefined;

  const vigencia = calcularVigencia(
    idiomaData.fecha_certificado,
    idiomaData.examen_idioma?.vigencia_meses
  );

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

        {/* Nivel + idioma. Los textos de reserva estaban cruzados: el chip del nivel caía a
            "Idioma no especificado" y el título del idioma a "Nivel no especificado". */}
        <div className="mt-2">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex px-3 py-1 font-semibold rounded-lg bg-[#1e3a5f]/5 border border-[#1e3a5f]/10 text-[#1e3a5f] text-xs sm:text-sm w-fit">
                {"Nivel: " + (idiomaData.nivel || "Nivel no especificado")}
              </span>

              {idiomaData.nivel && (
                <span
                  className={`text-[10px] font-bold uppercase tracking-wide rounded-full px-2 py-0.5 ${
                    tienePuntaje
                      ? "bg-[#e9f5ee] text-[#2f7d54]"
                      : "bg-[rgba(30,58,95,0.06)] text-[#6b7a8d]"
                  }`}
                >
                  {tienePuntaje ? "calculado" : "declarado"}
                </span>
              )}
            </div>

            <h2 className="text-xl font-bold text-gray-900 tracking-tight">
              {idiomaData.idioma || "Idioma no especificado"}
            </h2>
          </div>
        </div>

        {/* El campo guarda el examen/certificación (IELTS, TOEFL, Cambridge...), no una
            institución: se etiqueta por lo que realmente contiene. */}
        <div className="pt-3 border-t border-gray-100">
          <LabelVer text="Examen / Certificación:" />
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
            <h4 className="text-base font-bold text-[#1e3a5f]">Resultado del certificado</h4>
            <span className="text-xs text-gray-500 font-medium">
              Puntaje, fecha de emisión y vigencia
            </span>
          </div>
        </div>

        {/* El nivel ya está arriba: repetirlo aquí como "Nivel alcanzado" era el mismo dato dos
            veces. En su lugar va el puntaje, que es la evidencia y no se mostraba en ninguna
            parte, y la vigencia. */}
        <div className="grid sm:grid-cols-2 gap-4 pt-3 border-t border-gray-100">
          <div>
            <LabelVer text="Puntaje obtenido:" />
            <div className="mt-1 flex items-center gap-2">
              <InformacionLabel
                text={
                  tienePuntaje
                    ? String(idiomaData.puntaje_obtenido)
                    : "Este examen no registra puntaje numérico"
                }
              />
            </div>
          </div>

          <div>
            <LabelVer text="Fecha del certificado:" />
            <div className="mt-1 flex items-center gap-2">
              <InformacionLabel text={fechaLarga(idiomaData.fecha_certificado)} />
            </div>
          </div>

          <div className="sm:col-span-2">
            <LabelVer text="Vigencia:" />
            <div className="mt-1 flex flex-wrap items-center gap-2">
              {vigencia ? (
                <>
                  <InformacionLabel
                    text={
                      vigencia.vencido
                        ? `Venció el ${formatearFecha(vigencia.venceEl)}`
                        : `Vigente hasta ${formatearFecha(vigencia.venceEl)}`
                    }
                  />
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wide rounded-full px-2 py-0.5 ${
                      vigencia.vencido
                        ? "bg-[#fbeaea] text-[#b3413a]"
                        : "bg-[#e9f5ee] text-[#2f7d54]"
                    }`}
                  >
                    {vigencia.vencido ? "vencido" : "vigente"}
                  </span>
                </>
              ) : (
                <InformacionLabel text="Este examen no declara vencimiento" />
              )}
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
