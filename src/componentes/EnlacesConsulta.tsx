import { ExternalLink, Link2Off, AlertCircle } from "lucide-react";
import { EnlaceConsulta } from "../types/evaluadorProduccion";

type Props = {
  enlaces: EnlaceConsulta[];
  /** Se muestra cuando no hay ni un enlace directo, con la acción que corresponde. */
  onPedirIdentificadores?: () => void;
};

/**
 * Los sitios donde el evaluador puede consultar una producción académica.
 *
 * La regla que sostiene todo el componente: **directos y derivados van separados y etiquetados**.
 * Un enlace directo resuelve un dato que el docente afirmó —su DOI, su URL— y sirve como prueba.
 * Uno derivado es una búsqueda que armó el sistema con el título o el ISSN, y puede no encontrar
 * nada o encontrar otra cosa. Si se pintaran en una sola lista, el evaluador acabaría tomando un
 * resultado de Google Scholar por una verificación.
 *
 * Los enlaces que no se pudieron construir se muestran igual, apagados y con su motivo, en vez de
 * omitirse: el evaluador necesita ver **qué le falta al registro**, no solo lo que tiene. Es la
 * diferencia entre "esta revista no está en Publindex" y "nadie registró el ISSN".
 */
const EnlacesConsulta = ({ enlaces, onPedirIdentificadores }: Props) => {
  const directos = enlaces.filter((e) => e.tipo === "directo");
  const derivados = enlaces.filter((e) => e.tipo === "derivado");
  const hayDirecto = directos.some((e) => e.disponible);

  return (
    <div className="flex flex-col gap-4">
      {/* Sin ningún enlace directo, lo único que queda es buscar por título. Se dice antes de
          que el evaluador pierda tiempo abriendo búsquedas que probablemente no acierten. */}
      {!hayDirecto && (
        <div className="flex gap-2.5 p-3 rounded-lg bg-[#fffbeb] border border-[#fde68a] text-[#92400e]">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed">
            <p className="font-semibold">Esta producción no se puede verificar directamente.</p>
            <p className="mt-0.5">
              El docente no registró DOI ni enlace a la publicación. Solo quedan búsquedas por
              título, que pueden no encontrar nada.
            </p>
            {onPedirIdentificadores && (
              <button
                type="button"
                onClick={onPedirIdentificadores}
                className="mt-2 px-3 py-1.5 rounded-lg bg-white border border-[#fde68a] text-[#92400e] text-xs font-semibold hover:bg-[#fef3c7] transition-colors"
              >
                Rechazar y pedir los identificadores
              </button>
            )}
          </div>
        </div>
      )}

      <Grupo
        titulo="Enlaces directos"
        descripcion="datos que aportó el docente"
        enlaces={directos}
      />
      <Grupo
        titulo="Búsquedas derivadas"
        descripcion="las arma el sistema, pueden no acertar"
        enlaces={derivados}
      />
    </div>
  );
};

const Grupo = ({
  titulo,
  descripcion,
  enlaces,
}: {
  titulo: string;
  descripcion: string;
  enlaces: EnlaceConsulta[];
}) => {
  if (enlaces.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#1e3a5f]">
          {titulo}
        </span>
        <span className="text-xs text-[#6b7a8d]">{descripcion}</span>
        <span className="flex-1 h-px bg-[rgba(30,58,95,0.14)]" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {enlaces.map((enlace) => (
          <Enlace key={enlace.fuente} enlace={enlace} />
        ))}
      </div>
    </div>
  );
};

const Enlace = ({ enlace }: { enlace: EnlaceConsulta }) => {
  const esDirecto = enlace.tipo === "directo";

  if (!enlace.disponible || !enlace.url) {
    return (
      <div className="flex items-center gap-2.5 p-2.5 rounded-lg border border-dashed border-[rgba(30,58,95,0.14)] bg-[#fafafa]">
        <span className="w-5 h-5 rounded shrink-0 grid place-items-center bg-[#d1d5db] text-white">
          <Link2Off size={11} />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-[#9ca3af] leading-tight">
            {enlace.fuente}
          </p>
          <p className="text-[10px] text-[#6b7a8d] truncate">{enlace.motivo}</p>
        </div>
      </div>
    );
  }

  return (
    <a
      href={enlace.url}
      target="_blank"
      // Sin `noopener`, la pestaña que se abre puede reescribir la de UniDoc por `window.opener`.
      rel="noopener noreferrer"
      className={`flex items-center gap-2.5 p-2.5 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 ${
        esDirecto
          ? "border-[#bfdbfe] bg-[#f5f9ff] hover:bg-[#eaf2ff]"
          : "border-[rgba(30,58,95,0.14)] bg-white hover:bg-[rgba(30,58,95,0.03)]"
      }`}
    >
      <span
        className={`w-5 h-5 rounded shrink-0 grid place-items-center text-white text-[9px] font-bold ${
          esDirecto ? "bg-[#1d4ed8]" : "bg-[#6b7280]"
        }`}
      >
        {enlace.fuente.charAt(0).toUpperCase()}
      </span>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-[#1e3a5f] leading-tight">
          {enlace.fuente}
        </p>
        {enlace.criterio && (
          <p className="text-[10px] text-[#6b7a8d] truncate">{enlace.criterio}</p>
        )}
      </div>
      <ExternalLink size={12} className="ml-auto shrink-0 text-[#9ca3af]" />
    </a>
  );
};

export default EnlacesConsulta;
