import { InputLabel } from "./InputLabel";

type Props = {
  htmlFor: string;
  label: string;
  /** Acción a la derecha de la etiqueta, ej. el enlace "No está en la lista". */
  accion?: React.ReactNode;
  /** Línea de ayuda bajo el control: de dónde sale el valor o qué se espera. */
  ayuda?: React.ReactNode;
  /** El `<InputErrors>` del campo. Va entre el control y la ayuda. */
  error?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
};

/**
 * Anatomía de un campo: etiqueta, control, error y ayuda, con el espaciado que ya usan los
 * modales del rol Administrador (`IdiomaModal`, `ExamenIdiomaModal` y hermanos).
 *
 * El orden importa: el error va pegado al control y la ayuda debajo, para que un mensaje de
 * error no empuje la explicación fuera de vista ni se confunda con ella.
 */
export const CampoFormulario = ({
  htmlFor,
  label,
  accion,
  ayuda,
  error,
  className = "",
  children,
}: Props) => (
  <div className={`flex flex-col w-full min-w-0 ${className}`}>
    {accion ? (
      <div className="flex items-center justify-between gap-3">
        <InputLabel htmlFor={htmlFor} value={label} />
        {accion}
      </div>
    ) : (
      <InputLabel htmlFor={htmlFor} value={label} />
    )}

    {children}
    {error}

    {ayuda && <p className="mt-2 text-xs text-[#6b7a8d] leading-snug">{ayuda}</p>}
  </div>
);

/**
 * Enlace de texto que va a la derecha de una etiqueta para alternar el modo de un campo
 * (elegir del catálogo ↔ escribir a mano, puntaje ↔ nivel).
 */
export const AccionCampo = ({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    onClick={onClick}
    className="text-xs font-semibold text-[#1e3a5f] underline decoration-[rgba(30,58,95,0.3)] hover:decoration-[#e8740e] whitespace-nowrap"
  >
    {children}
  </button>
);

/**
 * Caja del alto de un control que ocupa el lugar de un campo que todavía no aplica, en vez de
 * dejar que el campo desaparezca y arrastre a los demás de columna.
 *
 * - `tono="vacio"`  → gris punteado: el dato depende de algo que aún no se ha elegido.
 * - `tono="dato"`   → azul sólido: hay un valor, pero lo calcula el sistema y no se edita.
 * - `tono="ok"`     → verde: vigente.
 * - `tono="alerta"` → rojo: vencido.
 */
export const CampoInformativo = ({
  tono = "vacio",
  children,
}: {
  tono?: "vacio" | "dato" | "ok" | "alerta";
  children: React.ReactNode;
}) => {
  const tonos = {
    vacio: "border-dashed border-[rgba(30,58,95,0.2)] bg-[#f7f8fa] text-[#9aa7b5] font-normal",
    dato: "border-[rgba(30,58,95,0.15)] bg-[#f4f7fa] text-[#1e3a5f] font-bold",
    ok: "border-[rgba(47,125,84,0.25)] bg-[#f2f9f5] text-[#2f7d54] font-semibold",
    alerta: "border-[rgba(179,65,58,0.25)] bg-[#fdf4f3] text-[#b3413a] font-semibold",
  };

  return (
    <div
      className={`min-h-12 w-full rounded-xl border p-3 text-sm flex items-center gap-2 ${tonos[tono]}`}
    >
      {children}
    </div>
  );
};

export default CampoFormulario;
