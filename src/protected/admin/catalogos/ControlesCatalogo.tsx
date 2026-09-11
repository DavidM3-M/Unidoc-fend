import type { UseFormRegisterReturn } from "react-hook-form";

/**
 * Piezas de UI que comparten las tres pantallas de catálogos (productos académicos, ámbitos de
 * divulgación y tipos de experiencia), porque los tres registros se muestran y se editan igual:
 * un nombre y la bandera `activo`.
 */

/** Pill Activo / Inactivo con los mismos colores que usan las tablas de verificación. */
export const EstadoBadge = ({ activo }: { activo: boolean }) => (
  <span
    className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold border ${
      activo
        ? "bg-green-50 text-green-700 border-green-200"
        : "bg-gray-100 text-gray-600 border-gray-200"
    }`}
  >
    {activo ? "Activo" : "Inactivo"}
  </span>
);

/**
 * Casilla `activo` de los formularios.
 *
 * Desmarcarla es la alternativa a borrar: retira el registro de los desplegables sin romper lo
 * que ya lo referencia, que es justamente lo que el backend sugiere cuando responde 409.
 */
export const CheckboxActivo = ({
  id,
  registro,
  ayuda,
}: {
  id: string;
  registro: UseFormRegisterReturn;
  ayuda: string;
}) => (
  <label
    htmlFor={id}
    className="flex items-start gap-3 rounded-lg bg-[rgba(30,58,95,0.04)] p-3 cursor-pointer"
  >
    <input
      id={id}
      type="checkbox"
      className="mt-0.5 h-4 w-4 flex-shrink-0 rounded border-[rgba(30,58,95,0.3)] text-[#e8740e] focus:ring-[#e8740e]"
      {...registro}
    />
    <span className="text-sm text-[#2c3e50]">
      <span className="font-semibold">Activo</span>
      <span className="block text-xs text-[#6b7a8d]">{ayuda}</span>
    </span>
  </label>
);

/** Botón "Editar" de las tablas, con el mismo estilo que el de Gestión de Normativas. */
export const BotonEditar = ({ onClick }: { onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className="px-3 py-1.5 border border-[#c89b14] text-[#c89b14] hover:bg-[#c89b14] hover:text-white rounded-md text-sm font-bold transition-colors"
  >
    Editar
  </button>
);
