
import CambiarContraseña from "./cambiarContrasena";
import FotoPerfil from "./fotoPerfil";



const Configuracion = () => {

  return (
    <div className="flex flex-col gap-4 h-full sm:w-[600px] bg-white rounded-3xl p-8">
      <FotoPerfil />
      <CambiarContraseña />
    </div>
  );
};

export default Configuracion;