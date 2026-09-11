import { AlertTriangle, CheckCircle2, Clock, Sparkles, Slash } from "lucide-react";
import { ESTADOS_ANTIGUEDAD, EstadoAntiguedad, ViaAscenso } from "../../types/escalafon";

/**
 * Piezas compartidas por la bandeja de ascensos, el detalle del docente y el listado de puntaje.
 *
 * Viven juntas porque las tres pantallas tienen que pintar el mismo expediente igual: si la
 * bandeja dijera «elegible» y el detalle «faltan requisitos», nadie sabría a cuál creerle.
 */

const CATEGORIA_ESTILOS: Record<string, string> = {
  Auxiliar: "bg-slate-50 text-slate-700 border-slate-200",
  Asistente: "bg-blue-50 text-blue-700 border-blue-200",
  Asociado: "bg-purple-50 text-purple-700 border-purple-200",
  Titular: "bg-amber-50 text-amber-700 border-amber-200",
};

/** Escalón como píldora. Sin escalón se dice «Sin escalafón», que no es lo mismo que «Ninguna». */
export const EscalonPill = ({
  escalon,
  className = "",
}: {
  escalon: string | null | undefined;
  className?: string;
}) => {
  const base =
    "inline-flex px-2.5 py-1 rounded-full text-xs font-semibold border whitespace-nowrap";

  if (!escalon) {
    return (
      <span
        className={`${base} bg-gray-100 text-gray-500 border-gray-200 ${className}`}
        title="Sin escalón vigente registrado"
      >
        Sin escalafón
      </span>
    );
  }

  const estilo = CATEGORIA_ESTILOS[escalon] ?? "bg-gray-100 text-gray-600 border-gray-200";
  return <span className={`${base} ${estilo} ${className}`}>{escalon}</span>;
};

const SEMAFORO: Record<
  EstadoAntiguedad,
  { clase: string; icono: typeof Clock }
> = {
  elegible: { clase: "bg-green-50 text-green-700 border-green-200", icono: CheckCircle2 },
  antiguedad_cumplida: { clase: "bg-blue-50 text-blue-700 border-blue-200", icono: Clock },
  por_verificar_experiencia: {
    clase: "bg-amber-50 text-amber-700 border-amber-200",
    icono: AlertTriangle,
  },
  sin_experiencia_suficiente: {
    clase: "bg-gray-100 text-gray-600 border-gray-200",
    icono: Slash,
  },
};

/**
 * Semáforo de antigüedad: el orden de trabajo de la bandeja.
 *
 * Prioriza, no impide — cualquier documento se puede revisar en cualquier momento. Por eso el
 * `title` dice qué hacer con cada estado en vez de sonar a bloqueo.
 *
 * Cada píldora lleva icono además de color: quien no distingue verde de ámbar necesita la forma.
 */
export const SemaforoAntiguedad = ({
  estado,
  className = "",
}: {
  estado: EstadoAntiguedad | null | undefined;
  className?: string;
}) => {
  if (!estado || !SEMAFORO[estado]) {
    return <span className="text-[#b0b8c2]">—</span>;
  }

  const { clase, icono: Icono } = SEMAFORO[estado];
  const { etiqueta, significa, accion } = ESTADOS_ANTIGUEDAD[estado];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap ${clase} ${className}`}
      title={`${significa}. ${accion}.`}
    >
      <Icono size={12} /> {etiqueta}
    </span>
  );
};

/**
 * Marca de la vía por la que el docente es elegible.
 *
 * La excepción (hoy, tener Doctorado aprobado) salta **todos** los requisitos, antigüedad
 * incluida, y puede saltarse escalones: sin distinguirla, un expediente con `faltantes` vacío y
 * 0 meses en el escalón parece un error de cálculo.
 */
export const ViaPill = ({ via }: { via: ViaAscenso }) => {
  if (via === "excepcion") {
    return (
      <span
        className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border bg-[#fdf7e6] text-[#8a6d1a] border-[#e8d9a6] whitespace-nowrap"
        title="Entra por regla de excepción: no se le exigen los requisitos del escalón siguiente, ni la antigüedad"
      >
        <Sparkles size={12} /> Por excepción
      </span>
    );
  }

  if (via === "requisitos") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border bg-green-50 text-green-700 border-green-200 whitespace-nowrap">
        <CheckCircle2 size={12} /> Por requisitos
      </span>
    );
  }

  return <span className="text-[#b0b8c2]">—</span>;
};

/** Contador de la cabecera de la bandeja. */
export const Tile = ({
  etiqueta,
  valor,
  detalle,
  color,
  activo = false,
  onClick,
}: {
  etiqueta: string;
  valor: number | string;
  detalle?: string;
  color: "ambar" | "verde" | "azul" | "gris" | "dorado";
  activo?: boolean;
  onClick?: () => void;
}) => {
  const barras = {
    ambar: "bg-amber-600",
    verde: "bg-green-700",
    azul: "bg-[#1e3a5f]",
    gris: "bg-[#9aa7b5]",
    // Mismo dorado de `ViaPill` para "por excepción": la barra ya insinúa la vía antes de leer el número.
    dorado: "bg-[#c89b14]",
  };

  const Etiqueta = onClick ? "button" : "div";

  return (
    <Etiqueta
      onClick={onClick}
      type={onClick ? "button" : undefined}
      className={`relative overflow-hidden text-left w-full border rounded-2xl p-4 bg-white ${
        activo ? "border-[#1e3a5f] ring-1 ring-[#1e3a5f]/20" : "border-[rgba(30,58,95,0.09)]"
      } ${
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

/**
 * Antigüedad como texto corto: meses respaldados sobre los exigidos.
 *
 * Cuando hay meses declarados sin aprobar se dicen aparte, porque son trabajo pendiente de este
 * rol —revisar certificados de experiencia— y no un dato del docente.
 */
export const TextoAntiguedad = ({
  meses,
  declarados,
  requeridos,
}: {
  meses: number;
  declarados: number;
  requeridos: number | null;
}) => {
  const porVerificar = Math.max(0, (declarados ?? 0) - (meses ?? 0));

  return (
    <span className="text-sm text-[#2c3e50] tabular-nums">
      {meses ?? 0}
      {requeridos !== null && <span className="text-[#6b7a8d]"> / {requeridos}</span>} meses
      {porVerificar > 0 && (
        <span className="block text-xs text-amber-700">+{porVerificar} sin aprobar</span>
      )}
    </span>
  );
};
