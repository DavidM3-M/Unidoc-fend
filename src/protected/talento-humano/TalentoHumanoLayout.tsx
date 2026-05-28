import { useState } from "react";
import CustomDialog from "../../componentes/CustomDialogForm";
import {
  Users,
  PlusCircle,
  Filter,
  ChevronDown,
  ClipboardList,
  UserCheck,
  X,
  Briefcase,
} from "lucide-react";
import ListarPostulaciones from "./postulaciones/ListarPostulaciones";
import ListarContrataciones from "./contratacion/ListarContrataciones";
import ListarConvocatorias from "./convocatoria/ListarConvocatorias";

const TalentoHumanoLayout = () => {
  const [openAdd, setOpenAdd] = useState(false);
  const [mostrarDropdown, setMostrarDropdown] = useState(false);
  const [vistaActual, setVistaActual] = useState<"postulaciones" | "contrataciones" | "convocatorias">("convocatorias");

  const cambiarVista = (vista: "postulaciones" | "contrataciones" | "convocatorias") => {
    setVistaActual(vista);
    setMostrarDropdown(false);
  };

  const getBotonTexto = () => {
    switch (vistaActual) {
      case "contrataciones": return "Contrataciones";
      case "convocatorias": return "Convocatorias";
      default: return "Postulaciones";
    }
  };

  const getBotonIcono = () => {
    switch (vistaActual) {
      case "contrataciones": return <UserCheck className="h-4 w-4" />;
      case "convocatorias": return <ClipboardList className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  const getTitulo = () => {
    switch (vistaActual) {
      case "contrataciones": return "Gestión de Contrataciones";
      case "convocatorias": return "Gestión de Convocatorias";
      default: return "Gestión de Postulaciones";
    }
  };

  const getDescripcion = () => {
    switch (vistaActual) {
      case "contrataciones": return "Todos los procesos de contratación registrados en el sistema";
      case "convocatorias": return "Todas las convocatorias publicadas y en proceso";
      default: return "Todas las postulaciones de candidatos registradas en el sistema";
    }
  };

  const getIndicadorColor = () => {
    switch (vistaActual) {
      case "contrataciones": return "text-teal-600";
      case "convocatorias": return "text-emerald-600";
      default: return "text-green-600";
    }
  };

  const renderVistaActual = () => {
    switch (vistaActual) {
      case "contrataciones": return <ListarContrataciones />;
      case "convocatorias": return <ListarConvocatorias />;
      default: return <ListarPostulaciones />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50/30 via-white to-emerald-50/10 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header principal */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">

            {/* Título y descripción */}
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <div className="relative">
                  <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg">
                    <Briefcase className="h-7 w-7 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-700 to-emerald-900 bg-clip-text text-transparent">
                    Talento Humano
                  </h1>
                  <p className="text-gray-600 mt-1">Gestión integral del talento y los procesos de vinculación</p>
                </div>
              </div>
              <p className="text-gray-600 text-lg leading-relaxed pl-16 max-w-3xl">
                Sistema completo para administrar convocatorias, postulaciones y contrataciones del personal.
                Centraliza todos los procesos de gestión humana en una plataforma unificada.
              </p>
            </div>

            {/* Botón de acción */}
            <div className="flex-shrink-0">
              <button
                className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white px-7 py-4 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 font-semibold text-base transform hover:-translate-y-0.5"
                onClick={() => setOpenAdd(true)}
              >
                <div className="relative">
                  <PlusCircle className="h-6 w-6 transition-transform group-hover:scale-110 group-hover:rotate-90" />
                  <div className="absolute inset-0 bg-white/20 rounded-full blur-sm group-hover:blur-md transition-all"></div>
                </div>
                <span className="text-lg">Agregar {getBotonTexto().slice(0, -1)}</span>
                <div className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400/50 to-emerald-600/50 rounded-full blur-sm group-hover:h-1.5 transition-all"></div>
              </button>
            </div>
          </div>

          {/* Indicadores de estado */}
          <div className="flex flex-wrap items-center gap-4 pt-6 border-t border-gray-200">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-sm font-medium text-gray-700">Sistema activo</span>
              </div>
              <div className="h-4 w-px bg-gray-300"></div>
              <div className="text-sm text-gray-500">
                {vistaActual === "convocatorias" ? "Vista de convocatorias" :
                 vistaActual === "contrataciones" ? "Vista de contrataciones" : "Vista de postulaciones"}
              </div>
              <div className="h-4 w-px bg-gray-300"></div>
              <div className="flex items-center gap-2">
                {getBotonIcono()}
                <span className={`text-sm font-medium ${getIndicadorColor()}`}>
                  Mostrando {getBotonTexto().toLowerCase()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-800">{getTitulo()}</h2>
                <p className="text-gray-600 text-sm mt-1">{getDescripcion()}</p>
              </div>

              {/* Dropdown de filtros */}
              <div className="relative">
                <button
                  className="group px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-lg font-medium text-sm transition-colors flex items-center gap-2 shadow-md hover:shadow-lg"
                  onClick={() => setMostrarDropdown(!mostrarDropdown)}
                >
                  <Filter className="h-4 w-4" />
                  {getBotonTexto()}
                  <ChevronDown className={`h-4 w-4 transition-transform ${mostrarDropdown ? "rotate-180" : ""}`} />
                </button>

                {mostrarDropdown && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setMostrarDropdown(false)} />
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-20 overflow-hidden">
                      <div className="p-2">
                        <div className="px-3 py-2 border-b border-gray-100">
                          <h4 className="text-sm font-semibold text-gray-700">Cambiar vista</h4>
                          <p className="text-xs text-gray-500">Selecciona lo que quieres ver</p>
                        </div>

                        {/* Opción Convocatorias */}
                        <button
                          onClick={() => cambiarVista("convocatorias")}
                          className={`w-full flex items-center gap-3 px-3 py-3 text-sm transition-colors rounded-lg ${
                            vistaActual === "convocatorias" ? "bg-emerald-50 text-emerald-700" : "hover:bg-gray-50 text-gray-700"
                          }`}
                        >
                          <div className={`p-2 rounded-lg ${vistaActual === "convocatorias" ? "bg-emerald-100 text-emerald-600" : "bg-gray-100 text-gray-500"}`}>
                            <ClipboardList className="h-4 w-4" />
                          </div>
                          <div className="text-left">
                            <div className="font-medium">Convocatorias</div>
                            <div className="text-xs text-gray-500">Convocatorias publicadas y activas</div>
                          </div>
                          {vistaActual === "convocatorias" && (
                            <div className="ml-auto"><div className="h-2 w-2 rounded-full bg-emerald-600"></div></div>
                          )}
                        </button>

                        {/* Opción Postulaciones */}
                        <button
                          onClick={() => cambiarVista("postulaciones")}
                          className={`w-full flex items-center gap-3 px-3 py-3 text-sm transition-colors rounded-lg ${
                            vistaActual === "postulaciones" ? "bg-emerald-50 text-emerald-700" : "hover:bg-gray-50 text-gray-700"
                          }`}
                        >
                          <div className={`p-2 rounded-lg ${vistaActual === "postulaciones" ? "bg-emerald-100 text-emerald-600" : "bg-gray-100 text-gray-500"}`}>
                            <Users className="h-4 w-4" />
                          </div>
                          <div className="text-left">
                            <div className="font-medium">Postulaciones</div>
                            <div className="text-xs text-gray-500">Candidatos postulados a convocatorias</div>
                          </div>
                          {vistaActual === "postulaciones" && (
                            <div className="ml-auto"><div className="h-2 w-2 rounded-full bg-emerald-600"></div></div>
                          )}
                        </button>

                        {/* Opción Contrataciones */}
                        <button
                          onClick={() => cambiarVista("contrataciones")}
                          className={`w-full flex items-center gap-3 px-3 py-3 text-sm transition-colors rounded-lg ${
                            vistaActual === "contrataciones" ? "bg-emerald-50 text-emerald-700" : "hover:bg-gray-50 text-gray-700"
                          }`}
                        >
                          <div className={`p-2 rounded-lg ${vistaActual === "contrataciones" ? "bg-emerald-100 text-emerald-600" : "bg-gray-100 text-gray-500"}`}>
                            <UserCheck className="h-4 w-4" />
                          </div>
                          <div className="text-left">
                            <div className="font-medium">Contrataciones</div>
                            <div className="text-xs text-gray-500">Procesos de contratación en curso</div>
                          </div>
                          {vistaActual === "contrataciones" && (
                            <div className="ml-auto"><div className="h-2 w-2 rounded-full bg-emerald-600"></div></div>
                          )}
                        </button>

                        <div className="mt-2 pt-2 border-t border-gray-100">
                          <button
                            onClick={() => setMostrarDropdown(false)}
                            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
                          >
                            <X className="h-4 w-4" />
                            Cerrar menú
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Contenido dinámico */}
            <div className="rounded-xl border border-gray-200 overflow-hidden">
              {renderVistaActual()}
            </div>
          </div>
        </div>
      </div>

      {/* Modal para agregar */}
      <CustomDialog
        title={`Agregar ${getBotonTexto().slice(0, -1)}`}
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        width="600px"
      >
        <div className="p-4">
          <p>Componente de agregar {getBotonTexto().toLowerCase()} en desarrollo...</p>
        </div>
      </CustomDialog>
    </div>
  );
};

export default TalentoHumanoLayout;