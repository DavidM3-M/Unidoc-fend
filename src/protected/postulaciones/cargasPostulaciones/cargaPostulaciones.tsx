import { DocumentTextIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import axiosInstance from "../../../utils/axiosConfig";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import EliminarBoton from "../../../componentes/EliminarBoton";
import { Link } from "react-router-dom";
import { ButtonRegresar } from "../../../componentes/formularios/ButtonRegresar";
import { jwtDecode } from "jwt-decode";
import { RolesValidos } from "../../../types/roles";

/**
 * Representa una convocatoria a la que se puede postular
 */
interface Convocatoria {
  id_convocatoria: number;
  nombre_convocatoria: string;
  tipo: string;
  fecha_publicacion: string;
  fecha_cierre: string;
  descripcion?: string; // Opcional
  estado_convocatoria: string;
}

/**
 * Representa una postulación realizada por el usuario
 */
interface Postulacion {
  id_postulacion: number;
  convocatoria_postulacion: Convocatoria;
  estado_postulacion?: string; // Estado principal (preferido)
  estado?: string; // Estado alternativo (para compatibilidad)
}

const VerPostulaciones = () => {
  const token = Cookies.get("token");
  if (!token) throw new Error("No authentication token found");
  const decoded = jwtDecode<{ rol: RolesValidos }>(token);
  const rol = decoded.rol;
  // Estados del componente
  const [postulaciones, setPostulaciones] = useState<Postulacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Obtiene las postulaciones del usuario desde el API
   */

  const fetchPostulaciones = async () => {
    try {
      setLoading(true);
      setError(null);

      const ENDPOINTS = {
        Aspirante: import.meta.env.VITE_ENDOPOINT_OBTENER_POSTULACIONES_ASPIRANTE,
        Docente: import.meta.env.VITE_ENDOPOINT_OBTENER_POSTULACIONES_DOCENTE,
      };
      const endpoint = ENDPOINTS[rol];

      const response = await axiosInstance.get(endpoint);

      if (!response.data?.postulaciones) {
        throw new Error('La respuesta no contiene el campo "postulaciones"');
      }

      setPostulaciones(response.data.postulaciones);
    } catch (err) {
      console.error("Error al obtener postulaciones:", err);
      setError(
        "Error al cargar las postulaciones. Por favor intente nuevamente."
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * Elimina una postulación específica
   */
  const eliminarPostulacion = async (id: number) => {
    try {
      const ENDPOINTS = {
        Aspirante: import.meta.env.VITE_ENDPOINT_ELIMINAR_POSTULACIONES_ASPIRANTE,
        Docente: import.meta.env.VITE_ENDPOINT_ELIMINAR_POSTULACIONES_DOCENTE,
      };
      const endpoint = ENDPOINTS[rol];
      const response = await axiosInstance.delete(`${endpoint}/${id}`);

      toast.success(response.data.message);
      setPostulaciones((prev) => prev.filter((p) => p.id_postulacion !== id));
    } catch (err: any) {
      console.error("Error al eliminar postulación:", err);
      toast.error(
        err.response?.data?.message ||
          "Ocurrió un error al eliminar la postulación."
      );
    }
  };

  // Efecto para cargar postulaciones al montar el componente
  useEffect(() => {
    fetchPostulaciones();
  }, []);

  // Estado de carga
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 w-full bg-white rounded-lg shadow p-6">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-blue-600 font-medium">Cargando postulaciones...</p>
        <p className="text-gray-500 text-sm mt-1">
          Por favor espere un momento
        </p>
      </div>
    );
  }

  // Manejo de errores
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 w-full p-4">
        <DocumentTextIcon className="h-10 w-10 text-red-500 mb-3" />
        <p className="text-red-500 mb-3 text-center">{error}</p>
        <button
          onClick={fetchPostulaciones}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          <ArrowPathIcon className="h-5 w-5" />
          Reintentar
        </button>
      </div>
    );
  }

  // Renderizado principal
  return (
    <div className="space-y-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="flex gap-1">
            <Link to={"/convocatorias"}>
              <ButtonRegresar />
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Mis Postulaciones
          </h1>
        </div>
      </div>

      {/* Contenido */}
      {postulaciones.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 w-full bg-white rounded-xl shadow-md p-8 text-center border border-blue-200">
          <DocumentTextIcon className="h-10 w-10 text-blue-500 mb-4" />
          <p className="text-blue-600 font-semibold text-lg">
            No tienes postulaciones registradas.
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Explora las convocatorias disponibles y postúlate.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {postulaciones.map((postulacion) => {
            // Normaliza el estado (usa estado_postulacion o estado como fallback)
            const estado =
              postulacion.estado_postulacion ||
              postulacion.estado ||
              "desconocido";

            return (
              <div
                key={postulacion.id_postulacion}
                className="bg-white rounded-2xl shadow-md border border-blue-200 hover:shadow-lg transition-shadow duration-300 p-6 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Encabezado de la postulación */}
                  <div className="flex items-center gap-3">
                    <DocumentTextIcon className="h-6 w-6 text-blue-600" />
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                      {postulacion.convocatoria_postulacion.nombre_convocatoria}
                    </h2>
                  </div>

                  {/* Información básica */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
                    <div>
                      <p className="text-gray-500">Tipo</p>
                      <p>{postulacion.convocatoria_postulacion.tipo}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Estado convocatoria</p>
                      <p className="capitalize underline">
                        {postulacion.convocatoria_postulacion.estado_convocatoria.toLowerCase()}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Fecha publicación</p>
                      <p>
                        {new Date(
                          postulacion.convocatoria_postulacion.fecha_publicacion
                        ).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Fecha cierre</p>
                      <p>
                        {new Date(
                          postulacion.convocatoria_postulacion.fecha_cierre
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Descripción (opcional) */}
                  {postulacion.convocatoria_postulacion.descripcion && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-500">Descripción:</p>
                      <p className="text-gray-700 break-words whitespace-pre-line text-justify">
                        {postulacion.convocatoria_postulacion.descripcion}
                      </p>
                    </div>
                  )}

                  {/* Estado de la postulación */}
                  <div className="mt-4">
                    <p className="text-sm text-gray-500 mb-2">
                      Estado de la postulación:
                    </p>
                    <div className="bg-blue-50 px-3 py-1 rounded-md inline-block border border-blue-100">
                      <p className="text-blue-800 font-medium">
                        {estado === "Faltan documentos"
                          ? "Documentación incompleta"
                          : estado === "Aceptada"
                          ? "Aceptada"
                          : estado === "Rechazada"
                          ? "Rechazada"
                          : estado}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Botón de eliminar */}
                <div className="mt-6 flex justify-end">
                  <EliminarBoton
                    id={postulacion.id_postulacion}
                    onConfirmDelete={eliminarPostulacion}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default VerPostulaciones;
