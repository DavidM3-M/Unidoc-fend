import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter, Route, Routes } from "react-router";
import Registro from "./auth/register.tsx";
import Login from "./auth/login.tsx";
import InformacionPersona from "./protected/datos-personales/page.tsx";
import ProtectedRoute from "./componentes/ProtectedRoute.tsx";
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

import EditarEvaluacion from "./protected/editar/evaluacion/EditarEvaluacion.tsx";
import ListarDocentes from "./protected/apoyo-profesoral/documentos/ListarDocentes.tsx";
import Contrataciones from "./protected/configuracion/contrataciones.tsx";
import AgregarEvaluacion from "./protected/agregar/AgregarEvaluacion.tsx";
import VerContratacionesPorUsuario from "./protected/talento-humano/contratacion/VerContratacionesPorUsuario.tsx";
import AgregarCertificados from "./protected/apoyo-profesoral/certificados/AgregarCertificados.tsx";
import ApoyoProfesoral from "./protected/apoyo-profesoral/ApoyoProfesoral.tsx";
import DocumentosDocente from "./protected/apoyo-profesoral/documentos/DocumentosDocente.tsx";
import ApoyoProfesoralLayouts from "./layouts/ApoyoProfesoral.tsx";
import GestionUsuarios from "./protected/admin/usuarios.tsx";
import GestionNormativas from "./protected/admin/normativas.tsx";

import AspirantesVicerectoria from "./protected/traer-roles/aspirantes.tsx";

import RectoriaLayouts from "./layouts/RectoriaLayouts.tsx";
import GestionAvalesRectoria from "./protected/rectoria/avales.tsx";
import GestionAvalesVicerrectoria from "./protected/rectoria/avales.tsx";
import VicerrectoriaLayout from "./layouts/VicerrectoriaLayout.tsx";
import Configuracion from "./protected/configuracion/configuracion.tsx";
createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <Routes>
      {/* Rutas para traer roles - Aspirantes */}
      <Route path="traer-roles">
        <Route path="aspirantes" element={<AspirantesVicerectoria />} />
      </Route>

      {/* Ruta catch-all para 404 */}
      {/* Rutas públicas con App como layout principal */}

      <Route path="/" element={<App />}>
        <Route index element={<Login />} />
        <Route path="inicio-sesion" element={<Login />} />
        <Route path="registro" element={<Registro />} />
        <Route
          path="restablecer-contrasena"
          element={<RestablecerContrasena />}
        />
        <Route
          path="restablecer-contrasena2"
          element={<RestablecerContrasena2 />}
        />

        {/* Rutas protegidas para aspirante */}
        <Route
          element={
            <ProtectedRoute allowedRoles={["Aspirante", "Docente"]}>
              <AspiranteLayouts />
            </ProtectedRoute>
          }
        >
          <Route path="index" element={<Index />} />
          <Route path="datos-personales" element={<InformacionPersona />} />
          <Route path="normativas" element={<Normativas />} />
          <Route path="convocatorias" element={<Convocatorias />} />
          <Route path="configuracion" element={<Configuracion />} />
          <Route path="perfil" element={<MiPerfil />} />

          {/* Rutas anidadas para agregar */}
          <Route path="agregar">
            <Route index element={<span>No found</span>} />
            {/* <Route path="estudio" element={<AgregarEstudio />} />
            <Route path="experiencia" element={<AgregarExperiencia />} />
            <Route path="idioma" element={<AgregarIdioma />} />
            <Route path="produccion" element={<AgregarProduccion />} /> */}
            <Route
              path="aptitudes"
              element={
                <AgregarAptitudes
                  onSuccess={(data) => {
                    console.log("Aptitud creada:", data);
                    // aquí puedes refrescar la lista o redirigir al perfil
                  }}
                />
              }
            />

            {/* Rutas protegida solo para docente */}
            <Route
              path="evaluacion"
              element={
                <ProtectedRoute allowedRoles={["Docente"]}>
                  <AgregarEvaluacion />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Rutas anidadas para ver postulaciones */}
          <Route path="ver">
            <Route index element={<span>No found</span>} />
            <Route path="postulaciones" element={<Postulaciones />} />
          </Route>

          {/* Rutas anidadas para editar */}
          <Route path="editar">
            {/* <Route path="estudios" element={<PreEstudio />} />
            <Route path="estudio/:id" element={<EditarEstudio />} />
            <Route path="idiomas" element={<PreIdioma />} />
            <Route path="idioma/:id" element={<EditarIdioma />} />
            <Route path="experiencias" element={<PreExperiencia />} />
            <Route path="experiencia/:id" element={<EditarExperiencia />} />
            <Route path="producciones" element={<PreProduccion />} />
            <Route path="produccion/:id" element={<EditarProduccion />} /> */}
            <Route path="aptitud/editar/:id" element={<EditarAptitud />} />
            <Route
              path="aptitud/:id"
              element={
                <PreAptitud
                  onSuccess={() => {
                    console.log("Aptitud actualizada correctamente");
                  }}
                />
              }
            />
            <Route
              path="evaluacion"
              element={
                <ProtectedRoute allowedRoles={["Docente"]}>
                  <EditarEvaluacion />
                </ProtectedRoute>
              }
            />
          </Route>
          <Route
            path="contratacion"
            element={
              <ProtectedRoute allowedRoles={["Docente"]}>
                <Contrataciones />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Ruta para talento humano */}
        <Route
          path="talento-humano"
          element={
            <ProtectedRoute allowedRoles={["Talento Humano"]}>
              <TalentoHumanoLayouts />
            </ProtectedRoute>
          }
        >
          <Route index element={<TalentoHumano />} />

          <Route path="convocatorias">
            <Route index element={<VerConvocatoria />} />
            <Route path="">
              <Route path="convocatoria" element={<Convocatoria />} />
              <Route path="convocatoria/:id" element={<Convocatoria />} />
            </Route>
          </Route>

          <Route path="postulaciones">
            <Route index element={<VerPostulaciones />} />
          </Route>

          <Route path="contrataciones">
            <Route index element={<VerContrataciones />} />
            <Route path="">
              <Route path="contratacion" element={<Contratacion />} />
              <Route path="contratacion/:id" element={<Contratacion />} />
            </Route>
          </Route>

          <Route
            path="/talento-humano/contrataciones/usuario/:user_id"
            element={<VerContratacionesPorUsuario />}
          />
        </Route>

        {/* Ruta protegidas para administrador */}
        <Route
          element={
            <ProtectedRoute allowedRoles={["Administrador"]}>
              <AdminLayouts />
            </ProtectedRoute>
          }
        >
          {/* Aquí puedes agregar las rutas específicas para el administrador */}
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="usuarios" element={<GestionUsuarios />} />
          <Route path="admin/normativas" element={<GestionNormativas />} />
        </Route>
        {/* Rutas protegidas para Rectoría */}
        <Route
          element={
            <ProtectedRoute allowedRoles={["Rectoria"]}>
              <RectoriaLayouts />
            </ProtectedRoute>
          }
        >
          <Route path="rectoria/avales" element={<GestionAvalesRectoria />} />
        </Route>

        {/* Rutas protegidas para Vicerrectoría */}
        <Route
          element={
            <ProtectedRoute allowedRoles={["Vicerrectoria"]}>
              <VicerrectoriaLayout />
            </ProtectedRoute>
          }
        >
          <Route
            path="vicerrectoria/avales"
            element={<GestionAvalesVicerrectoria />}
          />
        </Route>

        {/* Rutas protegidas para ayuda profesoral */}
        <Route
          element={
            <ProtectedRoute allowedRoles={["Apoyo Profesoral"]}>
              <ApoyoProfesoralLayouts />
            </ProtectedRoute>
          }
        >
          <Route path="apoyo-profesoral">
            <Route index element={<ApoyoProfesoral />} />

            <Route path="docentes" element={<ListarDocentes />}></Route>
            <Route
              path="docentes/documentos/:id"
              element={<DocumentosDocente />}
            />

            <Route path="agregar">
              <Route index element={<span>No found</span>} />
              <Route path="certificado" element={<AgregarCertificados />} />
            </Route>
          </Route>
        </Route>

        {/* Ruta catch-all para 404 */}
        <Route
          path="*"
          element={<h1 className="text-white text-6xl font-bold">No found</h1>}
        />
      </Route>
    </Routes>
  </BrowserRouter>
);
