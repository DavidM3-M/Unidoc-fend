import VerPostulaciones from "./cargasPostulaciones/cargaPostulaciones";

const PostulacionSubida = () => {
  return (
    // Fragmento React para agrupar elementos
    <>
      {/* Contenedor principal flexible */}
      <div className="flex flex-col w-full">
    
        <div className="w-full flex flex-col bg-white md:py-12 px-8 rounded-xl gap-8">
          {/* Contenedor para el componente de postulaciones */}
          <div>
            <VerPostulaciones/>
          </div>
        </div>
      </div>
    </>
  );
};

export default PostulacionSubida;