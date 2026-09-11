import { ReactNode } from "react";
import { Clock, CheckCircle2, XCircle, History, FileQuestion, Link2, Link2Off } from "lucide-react";
import { EstadoProduccion, ProduccionFila } from "../../types/evaluadorProduccion";

/**
 * Piezas compartidas por la bandeja, la ficha y el expediente del Evaluador de Producción.
 *
 * Viven juntas porque las tres pantallas tienen que pintar el estado exactamente igual: si la
 * bandeja dijera «avalada» y la ficha «aval anterior», el evaluador no sabría a cuál creerle.
 */

/**
 * Píldora de estado de una producción.
 *
 * Cuatro estados, no tres. Además de pendiente / avalada / rechazada existe «aval anterior al
 * cambio»: producciones que Apoyo Profesoral aprobó antes del traslado del aval, sin
 * `revisado_por`. Van en gris a propósito —ni verde ni ámbar— porque nadie de este rol las
 * decidió, y pintarlas verdes le atribuiría al evaluador un trabajo que no hizo.
 *
 * Cada píldora lleva icono además de color: quien no distingue verde de ámbar necesita la forma.
 */
export const EstadoProduccionPill = ({
  fila,
  className = "",
}: {
  fila: Pick<ProduccionFila, "estado" | "es_decision_historica" | "motivo_rechazo">;
  className?: string;
}) => {
  const base =
    "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap";

  if (fila.es_decision_historica) {
    return (
      <span
        className={`${base} bg-gray-100 text-gray-600 border-gray-200 ${className}`}
        title="Decidida por Apoyo Profesoral antes de que el aval pasara a este rol"
      >
        <History size={12} /> Aval anterior
      </span>
    );
  }

  const estilos: Record<EstadoProduccion, { clase: string; icono: ReactNode; texto: string }> = {
    pendiente: {
      clase: "bg-amber-50 text-amber-700 border-amber-200",
      icono: <Clock size={12} />,
      texto: "Pendiente",
    },
    aprobado: {
      clase: "bg-green-50 text-green-700 border-green-200",
      icono: <CheckCircle2 size={12} />,
      texto: "Avalada",
    },
    rechazado: {
      clase: "bg-red-50 text-red-700 border-red-200",
      icono: <XCircle size={12} />,
      texto: "Rechazada",
    },
    sin_documento: {
      clase: "bg-gray-100 text-gray-600 border-gray-200",
      icono: <FileQuestion size={12} />,
      texto: "Sin documento",
    },
  };

  const { clase, icono, texto } = estilos[fila.estado] ?? estilos.sin_documento;

  return (
    <span
      className={`${base} ${clase} ${className}`}
      title={fila.estado === "rechazado" && fila.motivo_rechazo ? fila.motivo_rechazo : undefined}
    >
      {icono} {texto}
    </span>
  );
};

/**
 * Marca si la producción trae un identificador con el que llegar a la publicación.
 *
 * Se muestra en la bandeja para que el evaluador sepa qué registros son verificables **antes** de
 * abrirlos: con 23 pendientes, empezar por las que sí tienen DOI ahorra la mitad de la jornada.
 */
export const MarcaEnlaces = ({ fila }: { fila: ProduccionFila }) => {
  const etiquetas = [
    fila.doi ? "DOI" : null,
    fila.issn_isbn ? "ISSN" : null,
    fila.url_publicacion ? "URL" : null,
  ].filter(Boolean) as string[];

  if (etiquetas.length === 0) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded border bg-gray-50 text-gray-400 border-gray-100">
        <Link2Off size={10} /> sin enlace
      </span>
    );
  }

  return (
    <span className="flex gap-1 items-center flex-wrap">
      {!fila.tiene_enlace_directo && (
        <Link2Off size={11} className="text-amber-500" aria-label="Sin enlace directo" />
      )}
      {fila.tiene_enlace_directo && <Link2 size={11} className="text-indigo-500" />}
      {etiquetas.map((etiqueta) => (
        <span
          key={etiqueta}
          className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100"
        >
          {etiqueta}
        </span>
      ))}
    </span>
  );
};

/** Puntaje de escalafón que otorga el ámbito de la producción. */
export const Puntaje = ({ valor }: { valor: number }) => (
  <span className="inline-block min-w-[46px] text-center font-bold text-xs px-2 py-1 rounded-md bg-[rgba(30,58,95,0.07)] text-[#1e3a5f] tabular-nums">
    {valor} pts
  </span>
);

/** Contador de la cabecera de la bandeja. */
export const Tile = ({
  etiqueta,
  valor,
  detalle,
  color,
  onClick,
}: {
  etiqueta: string;
  valor: number | string;
  detalle?: string;
  color: "ambar" | "verde" | "rojo" | "naranja";
  onClick?: () => void;
}) => {
  const barras = {
    ambar: "bg-amber-600",
    verde: "bg-green-700",
    rojo: "bg-red-700",
    naranja: "bg-[#e8740e]",
  };

  const Etiqueta = onClick ? "button" : "div";

  return (
    <Etiqueta
      onClick={onClick}
      type={onClick ? "button" : undefined}
      className={`relative overflow-hidden text-left w-full border border-[rgba(30,58,95,0.09)] rounded-2xl p-4 bg-white ${
        onClick
          ? "hover:border-[rgba(30,58,95,0.25)] transition-colors focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30"
          : ""
      }`}
    >
      <span className={`absolute left-0 top-0 bottom-0 w-[3px] ${barras[color]}`} />
      <p className="text-[10.5px] uppercase tracking-wider text-[#6b7a8d] font-semibold mb-1.5">
        {etiqueta}
      </p>
      <p className="text-3xl font-bold text-[#1e3a5f] leading-none tabular-nums">{valor}</p>
      {detalle && <p className="text-xs text-[#6b7a8d] mt-1.5">{detalle}</p>}
    </Etiqueta>
  );
};
