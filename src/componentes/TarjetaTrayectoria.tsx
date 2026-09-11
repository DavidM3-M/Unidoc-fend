import { ChevronRight } from "lucide-react";

type Props = {
  /** Ícono del módulo, ya dimensionado (24 px). Es lo único que distingue una columna de otra. */
  icono: React.ReactNode;
  onClick: () => void;
  /** Contenido a la derecha del título, antes del chevron: la insignia de nivel en Idioma. */
  aparte?: React.ReactNode;
  titulo: React.ReactNode;
  children: React.ReactNode;
};

/**
 * Tarjeta de las listas de hoja de vida (Educativa, Producción, Experiencia, Idioma).
 *
 * Las cuatro listas tenían su propia copia del mismo `<li>`, y cada una había derivado a un
 * degradado distinto de Tailwind: `orange-600` en Educativa, `amber-600` en las otras tres.
 * Ninguno de esos tonos existe en el resto del sistema — el rol Administrador usa el par
 * institucional #1e3a5f / #e8740e en todas sus pantallas, igual que los encabezados de sección
 * de estos mismos formularios. Aquí se unifica en ese par: ícono azul sólido y acento naranja
 * en el hover. Las columnas se siguen distinguiendo por el ícono, que es lo que el ojo lee
 * primero de todos modos.
 */
export const TarjetaTrayectoria = ({ icono, onClick, aparte, titulo, children }: Props) => (
  <li
    className="group relative bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 overflow-hidden border border-gray-100 cursor-pointer p-4"
    onClick={onClick}
  >
    <div className="flex items-start gap-4">
      <div className="flex items-center justify-center w-12 h-12 bg-[#1e3a5f] text-white rounded-xl shadow-sm shrink-0 group-hover:scale-110 transition-transform duration-300">
        {icono}
      </div>

      <div className="text-gray-500 w-full min-w-0 text-sm">
        <div className="flex items-start justify-between gap-3 mb-1">
          <div className="min-w-0">{titulo}</div>

          <div className="flex items-center gap-2 shrink-0">
            {aparte}
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#e8740e] group-hover:translate-x-1 transition-all" />
          </div>
        </div>

        {children}
      </div>
    </div>

    <div className="absolute bottom-0 left-0 w-0 h-1 bg-gradient-to-r from-transparent via-[#e8740e] to-transparent group-hover:w-full transition-all duration-500" />
  </li>
);

/** Título principal de la tarjeta. */
export const TituloTarjeta = ({ children }: { children: React.ReactNode }) => (
  <p className="font-bold text-[#1e3a5f] text-base leading-tight">{children}</p>
);

/** Segunda línea, la que lleva más peso después del título. */
export const SubtituloTarjeta = ({ children }: { children: React.ReactNode }) => (
  <p className="font-medium text-gray-700">{children}</p>
);

/**
 * Fila de metadatos sobre una línea divisoria: chips y fecha. Reemplaza la pila de párrafos
 * sueltos que tenían las tarjetas, donde todo pesaba igual.
 */
export const MetaTarjeta = ({ children }: { children: React.ReactNode }) => (
  <div className="mt-2 pt-2 border-t border-gray-100 flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-xs text-gray-400">
    {children}
  </div>
);

/** Chip de la fila de metadatos. */
export const ChipTarjeta = ({
  tono = "navy",
  children,
}: {
  tono?: "navy" | "gold" | "ok" | "alerta" | "aviso";
  children: React.ReactNode;
}) => {
  const tonos = {
    navy: "bg-[#1e3a5f]/[0.06] text-[#1e3a5f] border-[#1e3a5f]/15",
    gold: "bg-[#c89b14]/10 text-[#8a6c0e] border-[#c89b14]/30",
    ok: "bg-green-50 text-green-700 border-green-200",
    alerta: "bg-red-50 text-red-700 border-red-200",
    aviso: "bg-amber-50 text-amber-700 border-amber-200",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${tonos[tono]}`}
    >
      {children}
    </span>
  );
};

export default TarjetaTrayectoria;
