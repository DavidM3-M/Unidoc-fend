import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Registro from "./auth/register.tsx";
import Login from "./auth/login.tsx";
import GoogleCallback from "./auth/GoogleCallback.tsx";
import InformacionPersona from "./protected/datos-personales/page.tsx";
import ProtectedRoute from "./componentes/ProtectedRoute.tsx";
import Notificaciones from "./protected/notificaciones/Notificaciones.tsx";
import Index from "./protected/index/page.tsx";
// import AgregarEstudio from "./protected/agregar/AgregarEstudio.tsx";
// import AgregarExperiencia from "./protected/agregar/AgregarExperiencia.tsx";
// import AgregarIdioma from "./protected/agregar/AgregarIdioma.tsx";
// import PreEstudio from "./protected/editar/estudio/pre-estudio.tsx";
// import EditarEstudio from "./protected/editar/estudio/EditarEstudio.tsx";
// import Configuracion from "./protected/configuracion/configuracion.tsx";
// import PreIdioma from "./protected/editar/idioma/pre-idioma.tsx";
// import EditarIdioma from "./protected/editar/idioma/EditarIdioma.tsx";
// import EditarExperiencia from "./protected/editar/experiencia/EditarExperiencia.tsx";
// import PreExperiencia from "./protected/editar/experiencia/pre-experiencia.tsx";
// import AgregarProduccion from "./protected/agregar/AgregarProduccion.tsx";
// import PreProduccion from "./protected/editar/produccion/pre-produccion.tsx";
// import EditarProduccion from "./protected/editar/produccion/EditarProduccion.tsx";
import AgregarAptitudes from "./protected/agregar/AgregarAptitudes.tsx";
import Normativas from "./protected/normativas/page.tsx";
import MiPerfil from "./protected/configuracion/contrataciones.tsx";
import RestablecerContrasena from "./auth/restablecerContrasena.tsx";
import AspiranteLayouts from "./layouts/AspirantesLayouts.tsx";
import AdminLayouts from "./layouts/AdminLayouts.tsx";
import Dashboard from "./protected/admin/dashboard.tsx";
import PreAptitud from "./protected/editar/aptitud/pre-aptitud.tsx";
import EditarAptitud from "./protected/editar/aptitud/EditarAptitud.tsx";
import RestablecerContrasena2 from "./auth/restablecerContrasena-2.tsx";
import TalentoHumanoLayouts from "./layouts/TalentoHumano.tsx";
import VerConvocatoria from "./protected/talento-humano/convocatoria/VerConvocatoria.tsx";
import Convocatoria from "./protected/talento-humano/convocatoria/Convocatoria.tsx";
import TalentoHumano from "./protected/talento-humano/TalentoHumano.tsx";
import VerPostulaciones from "./protected/talento-humano/postulaciones/VerPostulaciones.tsx";
import Convocatorias from "./protected/convocatorias/page.tsx";
import Postulaciones from "./protected/postulaciones/page.tsx";
import VerContrataciones from "./protected/talento-humano/contratacion/VerContratacion.tsx";
import Contratacion from "./protected/talento-humano/contratacion/Contratacion.tsx";
import CoordinadorLayout from "./layouts/CoordinadorLayout.tsx";
import Coordinador from "./protected/coordinador/Coordinador.tsx";
import VerAspirantesTH from "./protected/coordinador/aspirantes/VerAspirantes.tsx";

import ListarDocentes from "./protected/apoyo-profesoral/documentos/ListarDocentes.tsx";
import Contrataciones from "./protected/configuracion/contrataciones.tsx";
import VerContratacionesPorUsuario from "./protected/talento-humano/contratacion/VerContratacionesPorUsuario.tsx";
import AgregarCertificados from "./protected/apoyo-profesoral/certificados/AgregarCertificados.tsx";
import ApoyoProfesoral from "./protected/apoyo-profesoral/ApoyoProfesoral.tsx";
import DocumentosDocente from "./protected/apoyo-profesoral/documentos/DocumentosDocente.tsx";
import ApoyoProfesoralLayouts from "./layouts/ApoyoProfesoral.tsx";
import BandejaAscensos from "./protected/escalafon/BandejaAscensos.tsx";
import DetalleEscalafonDocente from "./protected/escalafon/DetalleEscalafonDocente.tsx";
import PeriodosAscenso from "./protected/escalafon/PeriodosAscenso.tsx";
import GestionUsuarios from "./protected/admin/usuarios.tsx";
import GestionNormativas from "./protected/admin/normativas.tsx";
import VerContratacionesAdmin from "./protected/admin/contrataciones/VerContratacionesAdmin.tsx";
import ContratacionAdmin from "./protected/admin/contrataciones/ContratacionAdmin.tsx";
import CatalogoProduccionAcademica from "./protected/admin/catalogos/ProduccionAcademica.tsx";
import CatalogoTiposExperiencia from "./protected/admin/catalogos/TiposExperiencia.tsx";
import CatalogoNivelesFormacionAcademica from "./protected/admin/catalogos/NivelesFormacionAcademica.tsx";
import FormacionEducativa from "./protected/admin/catalogos/FormacionEducativa.tsx";
import CatalogoIdiomas from "./protected/admin/catalogos/Idiomas.tsx";
import EscalafonDocente from "./protected/admin/escalafon/EscalafonDocente.tsx";
import { AREA_ADMIN, AREA_APOYO_PROFESORAL } from "./protected/escalafon/area.ts";

import RectoriaLayouts from "./layouts/RectoriaLayouts.tsx";
import GestionAvalesRectoria from "./protected/rectoria/AvalesRectoria.tsx";
import GestionAvalesVicerrectoria from "./protected/vicerrectoría/AvalesVicerrectoria.tsx";
import VicerrectoriaLayout from "./layouts/VicerrectoriaLayout.tsx";
import Configuracion from "./protected/configuracion/configuracion.tsx";
import { LanguageProvider } from "./context/LanguageContext";
import AccessibilityControls from "./componentes/AccessibilityControls";
import ConvocatoriasPublicas from "./protected/publico/ConvocatoriasPublicas.tsx";

import AspirantesAprobados from "./protected/talento-humano/contratacion/AspirantesAprobados.tsx";

import EvaluadorProduccionLayout from "./layouts/EvaluadorProduccionLayout.tsx";
import BandejaProducciones from "./protected/evaluador-produccion/BandejaProducciones.tsx";
import FichaProduccion from "./protected/evaluador-produccion/FichaProduccion.tsx";
import ListaDocentesProduccion from "./protected/evaluador-produccion/ListaDocentes.tsx";
import ExpedienteDocenteProduccion from "./protected/evaluador-produccion/ExpedienteDocente.tsx";


createRoot(document.getElementById("root")!).render(
  <LanguageProvider>
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, "") || "/"}>
      <Routes>
        {/* Rutas públicas con App como layout principal */}
        <Route path="/" element={<App />}>
          <Route index element={<ConvocatoriasPublicas />} />
          <Route path="inicio-sesion" element={<Login />} />
          <Route path="login" element={<Login />} />
          <Route path="registro" element={<Registro />} />
          <Route path="auth/google/callback" element={<GoogleCallback />} />
          <Route path="restablecer-contrasena" element={<RestablecerContrasena />} />
          <Route path="restablecer-contrasena2" element={<RestablecerContrasena2 />} />

          <Route path="convocatorias-publicas" element={<ConvocatoriasPublicas />} />

          {/* Rutas protegidas para aspirante */}
          <Route
            element={
              <ProtectedRoute allowedRoles={["Aspirante", "Docente", "Administrativo"]}>
                <AspiranteLayouts />
              </ProtectedRoute>
            }
          >
            <Route path="index" element={<Index />} />
            <Route path="datos-personales" element={<InformacionPersona />} />
            <Route path="normativas" element={<Normativas />} />
            <Route path="convocatorias" element={<Convocatorias />} />
            <Route path="configuracion" element={<Configuracion />} />
            <Route path="notificaciones" element={<Notificaciones />} />
            <Route path="perfil" element={<MiPerfil />} />

            <Route path="agregar">
              <Route index element={<span>No found</span>} />
              <Route path="aptitudes" element={<AgregarAptitudes onSuccess={(data) => { console.log("Aptitud creada:", data); }} />} />
            </Route>

            <Route path="ver">
              <Route index element={<span>No found</span>} />
              <Route path="postulaciones" element={<Postulaciones />} />
            </Route>

            <Route path="editar">
              <Route path="aptitud/editar/:id" element={<EditarAptitud />} />
              <Route path="aptitud/:id" element={<PreAptitud onSuccess={() => { console.log("Aptitud actualizada correctamente"); }} />} />
            </Route>

            <Route path="contratacion" element={<ProtectedRoute allowedRoles={["Docente"]}><Contrataciones /></ProtectedRoute>} />
          </Route>

          {/* Ruta para talento humano */}
          <Route path="talento-humano" element={<ProtectedRoute allowedRoles={["Talento Humano"]}><TalentoHumanoLayouts /></ProtectedRoute>}>
            <Route index element={<TalentoHumano />} />

            <Route path="convocatorias">
              <Route index element={<VerConvocatoria />} />
              <Route path="convocatoria" element={<Convocatoria />} />
              <Route path="convocatoria/:id" element={<Convocatoria />} />
            </Route>

            <Route path="postulaciones">
              <Route index element={<VerPostulaciones />} />
            </Route>

            <Route path="aspirantes-aprobados" element={<AspirantesAprobados />} />

            <Route path="contrataciones">
              <Route index element={<VerContrataciones />} />
              <Route path="contratacion" element={<Contratacion />} />
              <Route path="contratacion/:id" element={<Contratacion />} />
            </Route>

            <Route path="contrataciones/usuario/:user_id" element={<VerContratacionesPorUsuario />} />
          </Route>

          {/* Rutas protegidas para administrador */}
          <Route element={<ProtectedRoute allowedRoles={["Administrador"]}><AdminLayouts /></ProtectedRoute>}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="usuarios" element={<GestionUsuarios />} />
            <Route path="admin/normativas" element={<GestionNormativas />} />

            {/* Catálogos que antes solo se poblaban desde seeders */}
            <Route path="admin/catalogos/produccion-academica" element={<CatalogoProduccionAcademica />} />
            <Route path="admin/catalogos/tipos-experiencia" element={<CatalogoTiposExperiencia />} />
            <Route path="admin/catalogos/formacion-academica/niveles" element={<CatalogoNivelesFormacionAcademica />} />
            <Route path="admin/catalogos/formacion-academica/programas" element={<FormacionEducativa />} />
            <Route path="admin/catalogos/idiomas" element={<CatalogoIdiomas />} />
            <Route path="admin/escalafon-docente" element={<EscalafonDocente />} />

            {/* Escalafón: los actos sobre el expediente de un docente. Son las mismas
                pantallas que usa Apoyo Profesoral —el mismo acto con las mismas reglas— y por
                eso reciben su área en vez de estar duplicadas. Ver `protected/escalafon/area.ts`.
                El Administrador añade el ingreso manual, la corrección de tramos y la bitácora. */}
            <Route path="admin/escalafon">
              <Route index element={<BandejaAscensos area={AREA_ADMIN} />} />
              <Route path="periodos" element={<PeriodosAscenso area={AREA_ADMIN} />} />
              <Route
                path="docentes/:id"
                element={<DetalleEscalafonDocente area={AREA_ADMIN} />}
              />
            </Route>

            <Route path="admin/contrataciones">
              <Route index element={<VerContratacionesAdmin />} />
              <Route path="contratacion" element={<ContratacionAdmin />} />
              <Route path="contratacion/:id" element={<ContratacionAdmin />} />
            </Route>
          </Route>

          {/* Rutas protegidas para Rectoría */}
          <Route element={<ProtectedRoute allowedRoles={["Rectoria"]}><RectoriaLayouts /></ProtectedRoute>}>
            <Route path="rectoria/avales" element={<GestionAvalesRectoria />} />
          </Route>

          {/* Rutas protegidas para Vicerrectoría */}
          <Route element={<ProtectedRoute allowedRoles={["Vicerrectoria"]}><VicerrectoriaLayout /></ProtectedRoute>}>
            <Route path="vicerrectoria/avales" element={<GestionAvalesVicerrectoria />} />
          </Route>

          {/* Rutas protegidas para Coordinador */}
          <Route element={<ProtectedRoute allowedRoles={["Coordinador"]}><CoordinadorLayout /></ProtectedRoute>}>
            <Route path="coordinador">
              <Route index element={<Coordinador />} />
              <Route path="aspirantes" element={<VerAspirantesTH />} />
            </Route>
          </Route>

          {/* Rutas protegidas para apoyo profesoral */}
          <Route element={<ProtectedRoute allowedRoles={["Apoyo Profesoral"]}><ApoyoProfesoralLayouts /></ProtectedRoute>}>
            <Route path="apoyo-profesoral">
              <Route index element={<ApoyoProfesoral />} />
              <Route path="docentes" element={<ListarDocentes />} />
              <Route path="notificaciones" element={<Notificaciones />} />
              <Route path="docentes/documentos/:id" element={<DocumentosDocente />} />

              {/* Escalafón: la bandeja es la pantalla de trabajo diaria del rol. */}
              <Route path="escalafon">
                <Route index element={<BandejaAscensos area={AREA_APOYO_PROFESORAL} />} />
                <Route
                  path="periodos"
                  element={<PeriodosAscenso area={AREA_APOYO_PROFESORAL} />}
                />
                <Route
                  path="docentes/:id"
                  element={<DetalleEscalafonDocente area={AREA_APOYO_PROFESORAL} />}
                />
              </Route>
              <Route path="agregar">
                <Route index element={<span>No found</span>} />
                <Route path="certificado" element={<AgregarCertificados onSuccess={() => {}} />} />
              </Route>
            </Route>
          </Route>

          {/* Rutas protegidas para el Evaluador de Producción.
              El rol en base de datos es "Evaluador Produccion", sin tilde: así está sembrado en
              RoleSeeder y así lo comparan los middlewares del backend. La etiqueta con tilde vive
              solo en la cabecera. */}
          <Route element={<ProtectedRoute allowedRoles={["Evaluador Produccion"]}><EvaluadorProduccionLayout /></ProtectedRoute>}>
            <Route path="evaluador-produccion">
              <Route index element={<BandejaProducciones />} />
              <Route path="produccion/:id" element={<FichaProduccion />} />
              <Route path="docentes" element={<ListaDocentesProduccion />} />
              <Route path="notificaciones" element={<Notificaciones />} />
              <Route path="docentes/:id" element={<ExpedienteDocenteProduccion />} />
            </Route>
          </Route>

          {/* Ruta catch-all para 404 */}
          <Route path="*" element={<h1 className="text-white text-6xl font-bold">No found</h1>} />
        </Route>
      </Routes>
      <AccessibilityControls />
    </BrowserRouter>
  </LanguageProvider>
)
