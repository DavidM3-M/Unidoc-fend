import { ButtonPrimary } from "./ButtonPrimary";
import { ButtonSecondary } from "./ButtonSecondary";

type Props = {
  /** Cierra el diálogo sin guardar. Si no se pasa, no se dibuja el botón Cancelar. */
  onCancelar?: () => void;
  /** Texto del botón principal, ej. "Agregar idioma" o "Guardar cambios". */
  textoGuardar: string;
  enviando: boolean;
};

/**
 * Pie de los formularios de hoja de vida: Cancelar y la acción principal, alineados a la
 * derecha, con el spinner de `ButtonPrimary`.
 *
 * Es el mismo pie de los modales del rol Administrador. Los formularios del docente tenían solo
 * el botón principal, centrado, y sustituían su texto a mano ("Enviando...") en vez de usar la
 * prop `loading` que `ButtonPrimary` ya trae. La única salida sin guardar era la ✕ del
 * encabezado del diálogo, que no se lee como "descartar".
 *
 * En pantalla angosta se apilan con la acción principal arriba (`flex-col-reverse`), para que
 * quede bajo el pulgar y Cancelar no sea lo primero que se toca.
 */
export const PieFormulario = ({ onCancelar, textoGuardar, enviando }: Props) => (
  <div className="col-span-full flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
    {onCancelar && (
      <button type="button" onClick={onCancelar} disabled={enviando}>
        <ButtonSecondary value="Cancelar" className="px-8 py-3" />
      </button>
    )}

    <ButtonPrimary
      value={textoGuardar}
      className="px-8"
      disabled={enviando}
      loading={enviando}
    />
  </div>
);

export default PieFormulario;
