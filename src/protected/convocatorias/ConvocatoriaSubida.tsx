import ListaConvocatorias from "./cargaConvocatorias/CargaConvocatorias";

/**
 * Componente contenedor para la visualización de convocatorias.
 * Este componente proporciona una estructura base con estilos consistentes
 * para alojar el componente ListaConvocatorias.
 */
const ConvocatoriaSubida = () => {
  return (
    <>
      {/* Contenedor principal flexible */}
      <div className="flex flex-col w-full">
        
        <div className="w-full flex flex-col bg-white md:py-12 px-8 rounded-xl gap-8">
          {/* Espacio reservado para el componente de lista de convocatorias */}
          <div>
            <ListaConvocatorias/> 
          </div>
        </div>
      </div>
    </>
  );
};

export default ConvocatoriaSubida;