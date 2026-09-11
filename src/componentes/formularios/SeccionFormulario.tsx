type Props = {
  /** Ícono de la sección, ya dimensionado por quien lo pasa (24 px). */
  icono: React.ReactNode;
  titulo: string;
  descripcion: string;
};

/**
 * Encabezado de sección de los formularios de hoja de vida (Estudio, Producción, Experiencia,
 * Idioma), tanto al agregar como al editar.
 *
 * Existía copiado en los ocho formularios y las copias se fueron separando: los de agregar
 * quedaron en 16 px con el ícono en esquina de 8 px sobre un fondo al 5 %, los de editar en
 * 20 px con esquina de 12 px al 10 % y borde inferior, y AgregarEstudio en 18 px semibold. Se
 * unifica en la versión de agregar, que es la más contenida: el diálogo ya tiene su propio
 * título de 20 px sobre azul y dos títulos de ese peso competían entre sí.
 */
export const SeccionFormulario = ({ icono, titulo, descripcion }: Props) => (
  <div className="flex items-center gap-4 mb-5 w-full">
    <div className="p-3 rounded-lg bg-[rgba(30,58,95,0.05)] text-[#1e3a5f] flex items-center justify-center shrink-0">
      {icono}
    </div>
    <div className="flex flex-col items-start w-full min-w-0">
      <h4 className="text-base font-bold text-[#1e3a5f] tracking-tight m-0">{titulo}</h4>
      <span className="text-xs text-[#6b7a8d] mt-0.5">{descripcion}</span>
    </div>
  </div>
);

export default SeccionFormulario;
