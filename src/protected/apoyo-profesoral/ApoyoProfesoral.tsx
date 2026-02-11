import { useLanguage } from "../../context/LanguageContext";
import { useState } from "react";
import CustomDialog from "../../componentes/CustomDialogForm";
import AgregarCertificados from "./certificados/AgregarCertificados";
import { 
  GraduationCap, 
  PlusCircle, 
  BookOpen, 
  Users, 
  Filter, 
  ChevronDown, 
  X, 
  Globe,
  FileText,
  Briefcase,
} from "lucide-react";
import ListarDocentes from "./documentos/ListarDocentes";
import ListarEstudiosDocentes from "./documentos/ListarEstudiosDocentes";
import ListarIdiomasDocentes from "./documentos/ListarIdiomasDocentes";
import ListarProduccionAcademica from "./documentos/ListarProduccionAcademica";
import ListarExperienciaDocentes from "./documentos/ListarExperienciaDocentes";

const ApoyoProfesoral = () => {
  const [openAdd, setOpenAdd] = useState(false);
  const [mostrarDropdown, setMostrarDropdown] = useState(false);
  const [vistaActual, setVistaActual] = useState<"docentes" | "estudios" | "idiomas" | "produccion" | "experiencia">("docentes");

  const handleCertificadoAgregado = () => {
    setOpenAdd(false);
  };

  const { t } = useLanguage();

  const cambiarVista = (vista: "docentes" | "estudios" | "idiomas" | "produccion" | "experiencia") => {
    setVistaActual(vista);
    setMostrarDropdown(false);
  };

  // Texto del botón según vista actual
  const getBotonTexto = () => {
    switch (vistaActual) {
      case "estudios":
        return "Estudios";
      case "idiomas":
        return "Idiomas";
      case "produccion":
        return "Producción";
      case "experiencia":
        return "Experiencia";
      default:
        return "Docentes";
    }
  };

  // Icono del botón según vista actual
  const getBotonIcono = () => {
    switch (vistaActual) {
      case "estudios":
        return <BookOpen className="h-4 w-4" />;
      case "idiomas":
        return <Globe className="h-4 w-4" />;
      case "produccion":
        return <FileText className="h-4 w-4" />;
      case "experiencia":
        return <Briefcase className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  // Título según vista actual
  const getTitulo = () => {
    switch (vistaActual) {
      case "estudios":
        return "Estudios de Docentes";
      case "idiomas":
        return "Idiomas de Docentes";
      case "produccion":
        return "Producción Académica";
      case "experiencia":
        return "Experiencia de Docentes";
      default:
        return "Lista de Docentes";
    }
  };

  // Descripción según vista actual
  const getDescripcion = () => {
    switch (vistaActual) {
      case "estudios":
        return "Todos los estudios académicos registrados en el sistema";
      case "idiomas":
        return "Todos los idiomas y certificaciones lingüísticas registradas";
      case "produccion":
        return "Producción académica, publicaciones e investigaciones";
      case "experiencia":
        return "Experiencia laboral y académica de los docentes";
      default:
        return "Lista completa de docentes registrados en el sistema";
    }
  };

  // Componente a renderizar según vista
  const getComponenteVista = () => {
    switch (vistaActual) {
      case "estudios":
        return <ListarEstudiosDocentes onVolver={() => cambiarVista("docentes")} />;
      case "idiomas":
        return <ListarIdiomasDocentes onVolver={() => cambiarVista("docentes")} />;
      case "produccion":
        return <ListarProduccionAcademica onVolver={() => cambiarVista("docentes")} />;
      case "experiencia":
        return <ListarExperienciaDocentes onVolver={() => cambiarVista("docentes")} />;
      default:
        return <ListarDocentes />;
    }
  };

  // Color del indicador según vista
  const getIndicadorColor = () => {
    switch (vistaActual) {
      case "estudios":
        return "text-blue-600";
      case "idiomas":
        return "text-green-600";
      case "produccion":
        return "text-purple-600";
      case "experiencia":
        return "text-amber-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-white to-blue-50/10 p-4 md:p-6 lg:p-8">
      {/* Contenedor principal */}
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header principal */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
            {/* Título y descripción */}
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <div className="relative">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                    <GraduationCap className="h-7 w-7 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-700 to-blue-900 bg-clip-text text-transparent">
                    Apoyo Profesoral
                  </h1>
                  <p className="text-gray-600 mt-1">Gestión integral de certificaciones académicas</p>
                </div>
              </div>
              <p className="text-gray-600 text-lg leading-relaxed pl-16 max-w-3xl">
                Sistema completo para crear certificados de apoyo profesoral y administrar la gestión de docentes. 
                Centraliza todas las certificaciones académicas en una plataforma unificada.
              </p>
            </div>

            {/* Botón de acción */}
            <div className="flex-shrink-0">
              <button
                className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-7 py-4 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 font-semibold text-base transform hover:-translate-y-0.5"
                onClick={() => setOpenAdd(true)}
              >
                <div className="relative">
                  <PlusCircle className="h-6 w-6 transition-transform group-hover:scale-110 group-hover:rotate-90" />
                  <div className="absolute inset-0 bg-white/20 rounded-full blur-sm group-hover:blur-md transition-all"></div>
                </div>
                <span className="text-lg">{t("Agregar Certificado")}</span>
                <div className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-blue-400/50 to-blue-600/50 rounded-full blur-sm group-hover:h-1.5 group-hover:from-blue-300/60 group-hover:to-blue-500/60 transition-all"></div>
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
                {vistaActual === "estudios" ? "Vista de estudios" : 
                 vistaActual === "idiomas" ? "Vista de idiomas" :
                 vistaActual === "produccion" ? "Vista de producción" :
                 vistaActual === "experiencia" ? "Vista de experiencia" : "Vista de docentes"}
              </div>
              {(vistaActual === "estudios" || vistaActual === "idiomas" || vistaActual === "produccion" || vistaActual === "experiencia") && (
                <>
                  <div className="h-4 w-px bg-gray-300"></div>
                  <div className="flex items-center gap-2">
                    {vistaActual === "estudios" ? 
                      <BookOpen className="h-4 w-4 text-blue-600" /> : 
                      vistaActual === "idiomas" ?
                      <Globe className="h-4 w-4 text-green-600" /> :
                      vistaActual === "produccion" ?
                      <FileText className="h-4 w-4 text-purple-600" /> :
                      <Briefcase className="h-4 w-4 text-amber-600" />
                    }
                    <span className={`text-sm font-medium ${getIndicadorColor()}`}>
                      {vistaActual === "estudios" ? "Mostrando estudios" : 
                       vistaActual === "idiomas" ? "Mostrando idiomas" : 
                       vistaActual === "produccion" ? "Mostrando producción" : "Mostrando experiencia"}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  {getTitulo()}
                </h2>
                <p className="text-gray-600 text-sm mt-1">
                  {getDescripcion()}
                </p>
              </div>
              
              {/* Dropdown de filtros */}
              <div className="relative">
                <button 
                  className="group px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium text-sm transition-colors flex items-center gap-2 shadow-md hover:shadow-lg"
                  onClick={() => setMostrarDropdown(!mostrarDropdown)}
                >
                  <Filter className="h-4 w-4" />
                  {getBotonTexto()}
                  <ChevronDown className={`h-4 w-4 transition-transform ${mostrarDropdown ? 'rotate-180' : ''}`} />
                </button>
                
                {/* Dropdown menu */}
                {mostrarDropdown && (
                  <>
                    {/* Overlay para cerrar al hacer clic fuera */}
                    <div 
                      className="fixed inset-0 z-10"
                      onClick={() => setMostrarDropdown(false)}
                    />
                    
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-20 overflow-hidden">
                      <div className="p-2">
                        <div className="px-3 py-2 border-b border-gray-100">
                          <h4 className="text-sm font-semibold text-gray-700">Cambiar vista</h4>
                          <p className="text-xs text-gray-500">Selecciona lo que quieres ver</p>
                        </div>
                        
                        {/* Opción Docentes */}
                        <button
                          onClick={() => cambiarVista("docentes")}
                          className={`w-full flex items-center gap-3 px-3 py-3 text-sm transition-colors rounded-lg ${
                            vistaActual === "docentes" 
                              ? "bg-blue-50 text-blue-700" 
                              : "hover:bg-gray-50 text-gray-700"
                          }`}
                        >
                          <div className={`p-2 rounded-lg ${
                            vistaActual === "docentes" 
                              ? "bg-blue-100 text-blue-600" 
                              : "bg-gray-100 text-gray-500"
                          }`}>
                            <Users className="h-4 w-4" />
                          </div>
                          <div className="text-left">
                            <div className="font-medium">Listar todos los docentes</div>
                            <div className="text-xs text-gray-500">Vista principal de docentes</div>
                          </div>
                          {vistaActual === "docentes" && (
                            <div className="ml-auto">
                              <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                            </div>
                          )}
                        </button>
                        
                        {/* Opción Estudios */}
                        <button
                          onClick={() => cambiarVista("estudios")}
                          className={`w-full flex items-center gap-3 px-3 py-3 text-sm transition-colors rounded-lg ${
                            vistaActual === "estudios" 
                              ? "bg-blue-50 text-blue-700" 
                              : "hover:bg-gray-50 text-gray-700"
                          }`}
                        >
                          <div className={`p-2 rounded-lg ${
                            vistaActual === "estudios" 
                              ? "bg-blue-100 text-blue-600" 
                              : "bg-gray-100 text-gray-500"
                          }`}>
                            <BookOpen className="h-4 w-4" />
                          </div>
                          <div className="text-left">
                            <div className="font-medium">Listar estudios de docentes</div>
                            <div className="text-xs text-gray-500">Todos los estudios registrados</div>
                          </div>
                          {vistaActual === "estudios" && (
                            <div className="ml-auto">
                              <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                            </div>
                          )}
                        </button>
                        
                        {/* Opción Idiomas */}
                        <button
                          onClick={() => cambiarVista("idiomas")}
                          className={`w-full flex items-center gap-3 px-3 py-3 text-sm transition-colors rounded-lg ${
                            vistaActual === "idiomas" 
                              ? "bg-blue-50 text-blue-700" 
                              : "hover:bg-gray-50 text-gray-700"
                          }`}
                        >
                          <div className={`p-2 rounded-lg ${
                            vistaActual === "idiomas" 
                              ? "bg-blue-100 text-blue-600" 
                              : "bg-gray-100 text-gray-500"
                          }`}>
                            <Globe className="h-4 w-4" />
                          </div>
                          <div className="text-left">
                            <div className="font-medium">Listar idiomas de docentes</div>
                            <div className="text-xs text-gray-500">Idiomas y certificaciones</div>
                          </div>
                          {vistaActual === "idiomas" && (
                            <div className="ml-auto">
                              <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                            </div>
                          )}
                        </button>
                        
                        {/* Opción Producción Académica */}
                        <button
                          onClick={() => cambiarVista("produccion")}
                          className={`w-full flex items-center gap-3 px-3 py-3 text-sm transition-colors rounded-lg ${
                            vistaActual === "produccion" 
                              ? "bg-blue-50 text-blue-700" 
                              : "hover:bg-gray-50 text-gray-700"
                          }`}
                        >
                          <div className={`p-2 rounded-lg ${
                            vistaActual === "produccion" 
                              ? "bg-blue-100 text-blue-600" 
                              : "bg-gray-100 text-gray-500"
                          }`}>
                            <FileText className="h-4 w-4" />
                          </div>
                          <div className="text-left">
                            <div className="font-medium">Listar producción académica</div>
                            <div className="text-xs text-gray-500">Publicaciones e investigaciones</div>
                          </div>
                          {vistaActual === "produccion" && (
                            <div className="ml-auto">
                              <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                            </div>
                          )}
                        </button>
                        
                        {/* Opción Experiencia */}
                        <button
                          onClick={() => cambiarVista("experiencia")}
                          className={`w-full flex items-center gap-3 px-3 py-3 text-sm transition-colors rounded-lg ${
                            vistaActual === "experiencia" 
                              ? "bg-blue-50 text-blue-700" 
                              : "hover:bg-gray-50 text-gray-700"
                          }`}
                        >
                          <div className={`p-2 rounded-lg ${
                            vistaActual === "experiencia" 
                              ? "bg-blue-100 text-blue-600" 
                              : "bg-gray-100 text-gray-500"
                          }`}>
                            <Briefcase className="h-4 w-4" />
                          </div>
                          <div className="text-left">
                            <div className="font-medium">Listar experiencia de docentes</div>
                            <div className="text-xs text-gray-500">Experiencia laboral y académica</div>
                          </div>
                          {vistaActual === "experiencia" && (
                            <div className="ml-auto">
                              <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                            </div>
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
              {getComponenteVista()}
            </div>
          </div>
        </div>
      </div>

      {/* Modal para agregar certificado */}
      <CustomDialog
        title={t("Agregar Nuevo Certificado")}
        open={openAdd}
        onClose={() => setOpenAdd(false)}
      >
        <div className="p-1">
          <AgregarCertificados onSuccess={handleCertificadoAgregado} />
        </div>
      </CustomDialog>
    </div>
  );
};

export default ApoyoProfesoral;