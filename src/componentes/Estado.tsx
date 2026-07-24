interface Documento {
  estado?: "pendiente" | "aprobado" | "rechazado";
  motivo_rechazo?: string | null;
}

interface Props {
  documentos: Documento[];
}

const capitalizar = (texto: string) =>
  texto.charAt(0).toUpperCase() + texto.slice(1);

// Mismos colores que ya usan las pantallas de verificación de
// Apoyo Profesoral (VerEstudiosDocente.tsx y hermanos) para el pill de estado.
const ESTILOS_ESTADO: Record<string, string> = {
  aprobado: "bg-green-50 text-green-700 border-green-200",
  rechazado: "bg-red-50 text-red-700 border-red-200",
  pendiente: "bg-amber-50 text-amber-700 border-amber-200",
};

const EstadoDocumento = ({ documentos }: Props) => {
  // Asegúrate de que el array no esté vacío
  if (!documentos || documentos.length === 0) return null;

  const { estado, motivo_rechazo } = documentos[0];
  if (!estado) return null;

  return (
    <p className="flex items-center gap-1.5 flex-wrap">
      <span>Estado:</span>
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
          ESTILOS_ESTADO[estado] ?? "bg-gray-100 text-gray-700 border-gray-200"
        }`}
      >
        {capitalizar(estado)}
      </span>

      {estado === "rechazado" && motivo_rechazo && (
        <span className="group/tip relative inline-flex">
          <button
            type="button"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center justify-center w-4 h-4 rounded-full bg-red-700 text-white text-[10px] font-bold leading-none cursor-help"
            aria-label="Ver motivo del rechazo"
          >
            i
          </button>
          <span
            role="tooltip"
            className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 w-60 -translate-x-1/2 rounded-lg bg-[#1e3a5f] px-3 py-2 text-xs font-normal leading-snug text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover/tip:opacity-100 group-focus-within/tip:opacity-100"
          >
            {motivo_rechazo}
            <span className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-[#1e3a5f]" />
          </span>
        </span>
      )}
    </p>
  );
};

export default EstadoDocumento;
