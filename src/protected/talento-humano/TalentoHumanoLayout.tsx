import { useState } from "react";
import CustomDialog from "../../componentes/CustomDialogForm";
import { 
  Users, 
  PlusCircle, 
  Filter, 
  ChevronDown, 
  ClipboardList,
  UserCheck,
} from "lucide-react";
import ListarPostulaciones from "./postulaciones/ListarPostulaciones";
import ListarContrataciones from "./contratacion/ListarContrataciones";
import ListarConvocatorias from "./convocatoria/ListarConvocatorias";

const TalentoHumanoLayout = () => {
  const [openAdd, setOpenAdd] = useState(false);
  const [mostrarDropdown, setMostrarDropdown] = useState(false);
  const [vistaActual, setVistaActual] = useState<"postulaciones" | "contrataciones" | "convocatorias">("postulaciones");

  const cambiarVista = (vista: "postulaciones" | "contrataciones" | "convocatorias") => {
    setVistaActual(vista);
    setMostrarDropdown(false);
  };

  // Texto del botón según vista actual
  const getBotonTexto = () => {
    switch (vistaActual) {
      case "contrataciones":
        return "Contrataciones";
      case "convocatorias":
        return "Convocatorias";
      default:
        return "Postulaciones";
    }
  };

  const getVistaIcono = () => {
    switch (vistaActual) {
      case "contrataciones":
        return <UserCheck className="w-5 h-5" />;
      case "convocatorias":
        return <ClipboardList className="w-5 h-5" />;
      default:
        return <Users className="w-5 h-5" />;
    }
  };

  const renderVistaActual = () => {
    switch (vistaActual) {
      case "contrataciones":
        return <ListarContrataciones />;
      case "convocatorias":
        return <ListarConvocatorias />;
      default:
        return <ListarPostulaciones />;
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              {getVistaIcono()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Talento Humano</h1>
              <p className="text-sm text-gray-600">Gestión de {getBotonTexto().toLowerCase()}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            {/* Dropdown para cambiar vista */}
            <div className="relative">
              <button
                onClick={() => setMostrarDropdown(!mostrarDropdown)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Filter className="w-4 h-4" />
                {getBotonTexto()}
                <ChevronDown className="w-4 h-4" />
              </button>

              {mostrarDropdown && (
                <div className="absolute top-full mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                  <button
                    onClick={() => cambiarVista("postulaciones")}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 first:rounded-t-lg"
                  >
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Postulaciones
                    </div>
                  </button>
                  <button
                    onClick={() => cambiarVista("contrataciones")}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4" />
                      Contrataciones
                    </div>
                  </button>
                  <button
                    onClick={() => cambiarVista("convocatorias")}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 last:rounded-b-lg"
                  >
                    <div className="flex items-center gap-2">
                      <ClipboardList className="w-4 h-4" />
                      Convocatorias
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Botón de agregar */}
            <button
              onClick={() => setOpenAdd(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              Agregar {getBotonTexto().slice(0, -1).toLowerCase()}
            </button>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 overflow-hidden">
        {renderVistaActual()}
      </div>

      {/* Modal para agregar */}
      <CustomDialog
        title={`Agregar ${getBotonTexto().slice(0, -1)}`}
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        width="600px"
      >
        {/* Aquí iría el componente de agregar correspondiente */}
        <div className="p-4">
          <p>Componente de agregar {getBotonTexto().toLowerCase()} en desarrollo...</p>
        </div>
      </CustomDialog>
    </div>
  );
};

export default TalentoHumanoLayout;