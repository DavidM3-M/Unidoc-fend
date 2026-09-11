import { useLanguage } from "../../context/useLanguage";
import { useState } from "react";
import { Link } from "react-router-dom";
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
  Award,
  ClipboardCheck,
  ArrowUpRight,
} from "lucide-react";
import ListarDocentes from "./documentos/ListarDocentes";
import ListarEstudiosDocentes from "./documentos/ListarEstudiosDocentes";
import ListarIdiomasDocentes from "./documentos/ListarIdiomasDocentes";
import ListarProduccionAcademica from "./documentos/ListarProduccionAcademica";
import ListarExperienciaDocentes from "./documentos/ListarExperienciaDocentes";
import ListarDocentesPuntaje from "./documentos/ListarDocentesPuntaje";
import ListarEvaluacionesDocentes from "./evaluaciones/ListarEvaluacionesDocentes";

type Vista =
  | "docentes"
  | "estudios"
  | "idiomas"
  | "produccion"
  | "experiencia"
  | "puntaje"
  | "evaluaciones";

const ApoyoProfesoral = () => {
  const [openAdd, setOpenAdd] = useState(false);
  const [mostrarDropdown, setMostrarDropdown] = useState(false);
  const [vistaActual, setVistaActual] = useState<Vista>("docentes");

  const handleCertificadoAgregado = () => {
    setOpenAdd(false);
  };

  const { t } = useLanguage();

  const cambiarVista = (vista: Vista) => {
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
      case "puntaje":
        return "Puntaje";
      case "evaluaciones":
        return "Evaluaciones";
      default:
        return "Docentes";
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
      case "puntaje":
        return "Puntaje de Docentes";
      case "evaluaciones":
        return "Evaluaciones de Docentes";
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
      case "puntaje":
        return "Evaluación de puntaje y categoría del escalafón por docente";
      case "evaluaciones":
        return "Asignación y consulta de la evaluación docente";
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
      case "puntaje":
        return <ListarDocentesPuntaje onVolver={() => cambiarVista("docentes")} />;
      case "evaluaciones":
        return <ListarEvaluacionesDocentes />;
      default:
        return <ListarDocentes />;
    }
  };

  // Color del indicador según vista (Sincronizado con paleta)
  const getIndicadorColor = () => {
    switch (vistaActual) {
      case "estudios":
        return "text-[#1e3a5f]";
      case "idiomas":
        return "text-green-600";
      case "produccion":
        return "text-purple-600";
      case "experiencia":
        return "text-amber-600";
      case "puntaje":
        return "text-rose-600";
      case "evaluaciones":
        return "text-teal-600";
      default:
        return "text-[#6b7a8d]";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[rgba(30,58,95,0.03)] via-[#ffffff] to-[rgba(30,58,95,0.01)] p-4 md:p-6 lg:p-8">
      {/* Contenedor principal */}
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header principal */}
        <div className="bg-[#ffffff] rounded-2xl shadow-lg border border-[rgba(30,58,95,0.09)] p-6 md:p-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
            {/* Título y descripción */}
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <div className="relative">
                  <div className="p-3 bg-gradient-to-br from-[#1e3a5f] to-[#12243d] rounded-xl shadow-lg">
                    <GraduationCap className="h-7 w-7 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#1e3a5f] to-[#12243d] bg-clip-text text-transparent">
                    Apoyo Profesoral
                  </h1>
                  <p className="text-[#6b7a8d] mt-1">Gestión integral de certificaciones académicas</p>
                </div>
              </div>
              <p className="text-[#2c3e50] text-lg leading-relaxed pl-16 max-w-3xl">
                Sistema completo para crear certificados de apoyo profesoral y administrar la gestión de docentes.
                Centraliza todas las certificaciones académicas en una plataforma unificada.
              </p>
            </div>

            {/* Botones de acción (Naranja Institucional de Acción) */}
            <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
              {/* La bandeja es la pantalla de trabajo del escalafón: las vistas de abajo son
                  consulta, los ascensos se ejecutan allá. */}
              <Link
                to="/apoyo-profesoral/escalafon"
                className="inline-flex items-center justify-center gap-3 border-2 border-[#1e3a5f] text-[#1e3a5f] px-7 py-4 rounded-xl font-semibold text-base transition-colors duration-200 hover:bg-[rgba(30,58,95,0.06)]"
              >
                <ArrowUpRight className="h-6 w-6" />
                <span className="text-lg">Escalafón y ascensos</span>
              </Link>

              <button
                className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-[#e8740e] to-[#c2600b] hover:from-[#c2600b] hover:to-[#a35008] text-white px-7 py-4 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 font-semibold text-base transform hover:-translate-y-0.5"
                onClick={() => setOpenAdd(true)}
              >
                <div className="relative">
                  <PlusCircle className="h-6 w-6 transition-transform group-hover:scale-110 group-hover:rotate-90" />
                  <div className="absolute inset-0 bg-white/20 rounded-full blur-sm group-hover:blur-md transition-all"></div>
                </div>
                <span className="text-lg">{t("Agregar Certificado")}</span>
                <div className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-[#e8740e]/50 to-[#c2600b]/50 rounded-full blur-sm group-hover:h-1.5 group-hover:from-[#e8740e]/70 group-hover:to-[#c2600b]/70 transition-all"></div>
              </button>
            </div>
          </div>

          {/* Indicadores de estado */}
          <div className="flex flex-wrap items-center gap-4 pt-6 border-t border-[rgba(30,58,95,0.09)]">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-sm font-medium text-[#2c3e50]">Sistema activo</span>
              </div>
              <div className="h-4 w-px bg-[rgba(30,58,95,0.15)]"></div>
              <div className="text-sm text-[#6b7a8d]">
                {vistaActual === "estudios" ? "Vista de estudios" :
                 vistaActual === "idiomas" ? "Vista de idiomas" :
                 vistaActual === "produccion" ? "Vista de producción" :
                 vistaActual === "experiencia" ? "Vista de experiencia" :
                 vistaActual === "puntaje" ? "Vista de puntaje" :
                 vistaActual === "evaluaciones" ? "Vista de evaluaciones" : "Vista de docentes"}
              </div>
              {vistaActual !== "docentes" && (
                <>
                  <div className="h-4 w-px bg-[rgba(30,58,95,0.15)]"></div>
                  <div className="flex items-center gap-2">
                    {vistaActual === "estudios" ?
                      <BookOpen className="h-4 w-4 text-[#1e3a5f]" /> :
                      vistaActual === "idiomas" ?
                      <Globe className="h-4 w-4 text-green-600" /> :
                      vistaActual === "produccion" ?
                      <FileText className="h-4 w-4 text-purple-600" /> :
                      vistaActual === "experiencia" ?
                      <Briefcase className="h-4 w-4 text-amber-600" /> :
                      vistaActual === "puntaje" ?
                      <Award className="h-4 w-4 text-rose-600" /> :
                      <ClipboardCheck className="h-4 w-4 text-teal-600" />
                    }
                    <span className={`text-sm font-medium ${getIndicadorColor()}`}>
                      {vistaActual === "estudios" ? "Mostrando estudios" :
                       vistaActual === "idiomas" ? "Mostrando idiomas" :
                       vistaActual === "produccion" ? "Mostrando producción" :
                       vistaActual === "experiencia" ? "Mostrando experiencia" :
                       vistaActual === "puntaje" ? "Mostrando puntaje" : "Mostrando evaluaciones"}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="bg-[#ffffff] rounded-2xl shadow-lg border border-[rgba(30,58,95,0.09)] overflow-hidden">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-bold text-[#1e3a5f]">
                  {getTitulo()}
                </h2>
                <p className="text-[#6b7a8d] text-sm mt-1">
                  {getDescripcion()}
                </p>
              </div>

              {/* Dropdown de filtros (Azul Institucional Principal) */}
              <div className="relative">
                <button
                  className="group px-4 py-2 bg-gradient-to-r from-[#1e3a5f] to-[#12243d] hover:from-[#12243d] hover:to-[#0a1422] text-white rounded-lg font-medium text-sm transition-colors flex items-center gap-2 shadow-md hover:shadow-lg"
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

                    <div className="absolute right-0 mt-2 w-80 bg-[#ffffff] rounded-xl shadow-xl border border-[rgba(30,58,95,0.15)] z-20 overflow-hidden">
                      <div className="p-2">
                        <div className="px-3 py-2 border-b border-[rgba(30,58,95,0.06)]">
                          <h4 className="text-sm font-semibold text-[#1e3a5f]">Cambiar vista</h4>
                          <p className="text-xs text-[#6b7a8d]">Selecciona lo que quieres ver</p>
                        </div>

                        {/* Opción Docentes */}
                        <button
                          onClick={() => cambiarVista("docentes")}
                          className={`w-full flex items-center gap-3 px-3 py-3 text-sm transition-colors rounded-lg ${
                            vistaActual === "docentes"
                              ? "bg-[rgba(30,58,95,0.06)] text-[#1e3a5f]"
                              : "hover:bg-[rgba(30,58,95,0.02)] text-[#2c3e50]"
                          }`}
                        >
                          <div className={`p-2 rounded-lg ${
                            vistaActual === "docentes"
                              ? "bg-[rgba(30,58,95,0.12)] text-[#1e3a5f]"
                              : "bg-[rgba(30,58,95,0.04)] text-[#6b7a8d]"
                          }`}>
                            <Users className="h-4 w-4" />
                          </div>
                          <div className="text-left">
                            <div className="font-medium">Listar todos los docentes</div>
                            <div className="text-xs text-[#6b7a8d]">Vista principal de docentes</div>
                          </div>
                          {vistaActual === "docentes" && (
                            <div className="ml-auto">
                              <div className="h-2 w-2 rounded-full bg-[#e8740e]"></div>
                            </div>
                          )}
                        </button>

                        {/* Opción Estudios */}
                        <button
                          onClick={() => cambiarVista("estudios")}
                          className={`w-full flex items-center gap-3 px-3 py-3 text-sm transition-colors rounded-lg ${
                            vistaActual === "estudios"
                              ? "bg-[rgba(30,58,95,0.06)] text-[#1e3a5f]"
                              : "hover:bg-[rgba(30,58,95,0.02)] text-[#2c3e50]"
                          }`}
                        >
                          <div className={`p-2 rounded-lg ${
                            vistaActual === "estudios"
                              ? "bg-[rgba(30,58,95,0.12)] text-[#1e3a5f]"
                              : "bg-[rgba(30,58,95,0.04)] text-[#6b7a8d]"
                          }`}>
                            <BookOpen className="h-4 w-4" />
                          </div>
                          <div className="text-left">
                            <div className="font-medium">Listar estudios de docentes</div>
                            <div className="text-xs text-[#6b7a8d]">Todos los estudios registrados</div>
                          </div>
                          {vistaActual === "estudios" && (
                            <div className="ml-auto">
                              <div className="h-2 w-2 rounded-full bg-[#e8740e]"></div>
                            </div>
                          )}
                        </button>

                        {/* Opción Idiomas */}
                        <button
                          onClick={() => cambiarVista("idiomas")}
                          className={`w-full flex items-center gap-3 px-3 py-3 text-sm transition-colors rounded-lg ${
                            vistaActual === "idiomas"
                              ? "bg-[rgba(30,58,95,0.06)] text-[#1e3a5f]"
                              : "hover:bg-[rgba(30,58,95,0.02)] text-[#2c3e50]"
                          }`}
                        >
                          <div className={`p-2 rounded-lg ${
                            vistaActual === "idiomas"
                              ? "bg-[rgba(30,58,95,0.12)] text-[#1e3a5f]"
                              : "bg-[rgba(30,58,95,0.04)] text-[#6b7a8d]"
                          }`}>
                            <Globe className="h-4 w-4" />
                          </div>
                          <div className="text-left">
                            <div className="font-medium">Listar idiomas de docentes</div>
                            <div className="text-xs text-[#6b7a8d]">Idiomas y certificaciones</div>
                          </div>
                          {vistaActual === "idiomas" && (
                            <div className="ml-auto">
                              <div className="h-2 w-2 rounded-full bg-[#e8740e]"></div>
                            </div>
                          )}
                        </button>

                        {/* Opción Producción Académica */}
                        <button
                          onClick={() => cambiarVista("produccion")}
                          className={`w-full flex items-center gap-3 px-3 py-3 text-sm transition-colors rounded-lg ${
                            vistaActual === "produccion"
                              ? "bg-[rgba(30,58,95,0.06)] text-[#1e3a5f]"
                              : "hover:bg-[rgba(30,58,95,0.02)] text-[#2c3e50]"
                          }`}
                        >
                          <div className={`p-2 rounded-lg ${
                            vistaActual === "produccion"
                              ? "bg-[rgba(30,58,95,0.12)] text-[#1e3a5f]"
                              : "bg-[rgba(30,58,95,0.04)] text-[#6b7a8d]"
                          }`}>
                            <FileText className="h-4 w-4" />
                          </div>
                          <div className="text-left">
                            <div className="font-medium">Listar producción académica</div>
                            <div className="text-xs text-[#6b7a8d]">Publicaciones e investigaciones</div>
                          </div>
                          {vistaActual === "produccion" && (
                            <div className="ml-auto">
                              <div className="h-2 w-2 rounded-full bg-[#e8740e]"></div>
                            </div>
                          )}
                        </button>

                        {/* Opción Experiencia */}
                        <button
                          onClick={() => cambiarVista("experiencia")}
                          className={`w-full flex items-center gap-3 px-3 py-3 text-sm transition-colors rounded-lg ${
                            vistaActual === "experiencia"
                              ? "bg-[rgba(30,58,95,0.06)] text-[#1e3a5f]"
                              : "hover:bg-[rgba(30,58,95,0.02)] text-[#2c3e50]"
                          }`}
                        >
                          <div className={`p-2 rounded-lg ${
                            vistaActual === "experiencia"
                              ? "bg-[rgba(30,58,95,0.12)] text-[#1e3a5f]"
                              : "bg-[rgba(30,58,95,0.04)] text-[#6b7a8d]"
                          }`}>
                            <Briefcase className="h-4 w-4" />
                          </div>
                          <div className="text-left">
                            <div className="font-medium">Listar experiencia de docentes</div>
                            <div className="text-xs text-[#6b7a8d]">Experiencia laboral y académica</div>
                          </div>
                          {vistaActual === "experiencia" && (
                            <div className="ml-auto">
                              <div className="h-2 w-2 rounded-full bg-[#e8740e]"></div>
                            </div>
                          )}
                        </button>

                        {/* Opción Puntaje */}
                        <button
                          onClick={() => cambiarVista("puntaje")}
                          className={`w-full flex items-center gap-3 px-3 py-3 text-sm transition-colors rounded-lg ${
                            vistaActual === "puntaje"
                              ? "bg-[rgba(30,58,95,0.06)] text-[#1e3a5f]"
                              : "hover:bg-[rgba(30,58,95,0.02)] text-[#2c3e50]"
                          }`}
                        >
                          <div className={`p-2 rounded-lg ${
                            vistaActual === "puntaje"
                              ? "bg-[rgba(30,58,95,0.12)] text-[#1e3a5f]"
                              : "bg-[rgba(30,58,95,0.04)] text-[#6b7a8d]"
                          }`}>
                            <Award className="h-4 w-4" />
                          </div>
                          <div className="text-left">
                            <div className="font-medium">Ver puntaje de docentes</div>
                            <div className="text-xs text-[#6b7a8d]">Puntaje y categoría del escalafón</div>
                          </div>
                          {vistaActual === "puntaje" && (
                            <div className="ml-auto">
                              <div className="h-2 w-2 rounded-full bg-[#e8740e]"></div>
                            </div>
                          )}
                        </button>

                        {/* Opción Evaluaciones */}
                        <button
                          onClick={() => cambiarVista("evaluaciones")}
                          className={`w-full flex items-center gap-3 px-3 py-3 text-sm transition-colors rounded-lg ${
                            vistaActual === "evaluaciones"
                              ? "bg-[rgba(30,58,95,0.06)] text-[#1e3a5f]"
                              : "hover:bg-[rgba(30,58,95,0.02)] text-[#2c3e50]"
                          }`}
                        >
                          <div className={`p-2 rounded-lg ${
                            vistaActual === "evaluaciones"
                              ? "bg-[rgba(30,58,95,0.12)] text-[#1e3a5f]"
                              : "bg-[rgba(30,58,95,0.04)] text-[#6b7a8d]"
                          }`}>
                            <ClipboardCheck className="h-4 w-4" />
                          </div>
                          <div className="text-left">
                            <div className="font-medium">Asignar evaluación docente</div>
                            <div className="text-xs text-[#6b7a8d]">Calificación asignada por Apoyo Profesoral</div>
                          </div>
                          {vistaActual === "evaluaciones" && (
                            <div className="ml-auto">
                              <div className="h-2 w-2 rounded-full bg-[#e8740e]"></div>
                            </div>
                          )}
                        </button>

                        <div className="mt-2 pt-2 border-t border-[rgba(30,58,95,0.06)]">
                          <button
                            onClick={() => setMostrarDropdown(false)}
                            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-[#6b7a8d] hover:text-[#2c3e50] hover:bg-[rgba(30,58,95,0.02)] rounded-lg transition-colors"
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

            {/* Contenedor dinámico */}
            <div className="rounded-xl border border-[rgba(30,58,95,0.09)] overflow-hidden">
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