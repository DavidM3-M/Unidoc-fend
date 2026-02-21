// Importación de dependencias
import {
  DocumentTextIcon,
  EyeIcon,
  ArrowPathIcon,
  ArrowRightIcon,
  CheckIcon,
  CalendarIcon,
  BriefcaseIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useState, useCallback } from "react";
import axiosInstance from "../../../utils/axiosConfig";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import { Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { RolesValidos } from "../../../types/roles";
import DetalleConvocatoriaModal from "../../../componentes/modales/DetalleConvocatoriaModal";

// Interfaces para tipado
interface Documento {
  id_documento: number;
  documentable_id: number;
  archivo: string;
  estado: string;
  archivo_url: string;
}

interface Convocatoria {
  id_convocatoria: number;
  nombre_convocatoria: string;
  tipo: string;
  fecha_publicacion: string;
  fecha_cierre: string;
  descripcion?: string;
  estado_convocatoria: string;
  cargo_solicitado?: string;
  facultad?: string;
  documentos_convocatoria?: Documento[];
}

const ListaConvocatorias = () => {
  const [convocatorias, setConvocatorias] = useState<Convocatoria[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [postulando, setPostulando] = useState<number | null>(null);
  
  const token = Cookies.get("token");
  if (!token) throw new Error("No authentication token found");
  const decoded = jwtDecode<{ rol: RolesValidos }>(token);
  const rol = decoded.rol;

  const handleVerDetalle = (id: number) => {
    setSelectedId(id);
    setModalOpen(true);
  };

  const fetchConvocatorias = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const ENDPOINTS = {
        Aspirante: `${import.meta.env.VITE_API_URL}${
          import.meta.env.VITE_ENDPOINT_OBTENER_CONVOCATORIAS_ASPIRANTE
        }`,
        Docente: `${import.meta.env.VITE_API_URL}${
          import.meta.env.VITE_ENDPOINT_OBTENER_CONVOCATORIAS_DOCENTE
        }`,
      };

      const endpoint = ENDPOINTS[rol];
      const response = await axiosInstance.get(endpoint);

      if (!response.data?.convocatorias) {
        throw new Error('La respuesta no contiene el campo "convocatorias"');
      }

      setConvocatorias(response.data.convocatorias);
    } catch (err) {
      console.error("Error al obtener convocatorias:", err);
      setError("Error al cargar las convocatorias");
    } finally {
      setLoading(false);
    }
  }, [rol]);

  const confirmarPostulacion = (idConvocatoria: number) => {
    const convocatoria = convocatorias.find(
      (c) => c.id_convocatoria === idConvocatoria
    );

    toast.info(
      <div className="p-4 text-center">
        <p className="font-medium mb-4">
          ¿Estás seguro que deseas postularte a "
          {convocatoria?.nombre_convocatoria}"?
        </p>
        <div className="flex justify-center gap-3">
          <button
            onClick={() => {
              toast.dismiss();
              handlePostularse(idConvocatoria);
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Sí, postularme
          </button>
          <button
            onClick={() => toast.dismiss()}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
          >
            No
          </button>
        </div>
      </div>,
      {
        autoClose: false,
        closeButton: false,
        closeOnClick: false,
        draggable: false,
        className: "w-full max-w-xs",
      }
    );
  };

  const handlePostularse = async (idConvocatoria: number) => {
    try {
      setPostulando(idConvocatoria);
      const ENDPOINTS = {
        Aspirante: `${import.meta.env.VITE_API_URL}${
          import.meta.env.VITE_ENDPOINT_CREAR_POSTULACION_ASPIRANTE
        }`,
        Docente: `${import.meta.env.VITE_API_URL}${
          import.meta.env.VITE_ENDPOINT_CREAR_POSTULACION_DOCENTE
        }`,
      };

      const endpoint = ENDPOINTS[rol];
      await axiosInstance.post(`${endpoint}/${idConvocatoria}`);
      toast.success("¡Postulación enviada correctamente!");

      setConvocatorias((prevConvocatorias) =>
        prevConvocatorias.map((conv) =>
          conv.id_convocatoria === idConvocatoria
            ? { ...conv, estado_usuario: "Postulado" }
            : conv
        )
      );
    } catch (err: unknown) {
      console.error("Error al postularse:", err);
      let errorMessage = "Ocurrió un error al postularse";
      const resp = typeof err === "object" && err !== null && "response" in err ? (err as unknown as { response?: unknown }).response : null;
      if (resp && typeof resp === "object") {
        const data = (resp as { data?: unknown }).data;
        const status = (resp as { status?: unknown }).status as number | undefined;

        if (data && typeof data === "object") {
          // Preferir mensajes específicos enviados por el backend
          const d = data as { error?: string; message?: string };
          errorMessage = d.error ?? d.message ?? errorMessage;
        } else if (typeof status === "number") {
          switch (status) {
            case 403:
              errorMessage = "Esta convocatoria está cerrada y no admite más postulaciones";
              break;
            case 409:
              errorMessage = "Ya te has postulado a esta convocatoria";
              break;
          }
        }
      }
      toast.error(errorMessage);
    } finally {
      setPostulando(null);
    }
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getEstadoBadge = (estado: string) => {
    const estadoLower = estado.toLowerCase();
    if (estadoLower === "abierta" || estadoLower === "activa") {
      return "bg-green-100 text-green-800 border-green-300";
    }
    if (estadoLower === "cerrada" || estadoLower === "finalizada") {
      return "bg-red-100 text-red-800 border-red-300";
    }
    return "bg-yellow-100 text-yellow-800 border-yellow-300";
  };

  useEffect(() => {
    fetchConvocatorias();
  }, [fetchConvocatorias]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 w-full bg-white rounded-lg shadow-sm p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-blue-600 font-medium">Cargando convocatorias...</p>
        <p className="text-gray-600 text-sm mt-2">Por favor espere un momento</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 p-4 w-full">
        <DocumentTextIcon className="h-12 w-12 text-red-500 mb-4" />
        <p className="text-red-500 text-center mb-4">{error}</p>
        <button
          onClick={fetchConvocatorias}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          <ArrowPathIcon className="h-5 w-5" />
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">
          Convocatorias Disponibles
        </h1>
        <Link
          to="/ver/postulaciones"
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-md w-full sm:w-auto justify-center"
        >
          <CheckIcon className="h-5 w-5" />
          Ver mis postulaciones
        </Link>
      </div>

      {/* Lista de convocatorias */}
      {convocatorias.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 w-full bg-white rounded-lg shadow-sm p-6 text-center">
          <DocumentTextIcon className="h-12 w-12 text-blue-500 mb-4" />
          <p className="text-blue-600 font-medium">
            No hay convocatorias disponibles actualmente.
          </p>
          <p className="text-gray-600 text-sm mt-2">Por favor, intente más tarde.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {convocatorias.map((convocatoria) => (
            <div
              key={convocatoria.id_convocatoria}
              className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow"
            >
              {/* Header de la tarjeta */}
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h2 className="text-lg font-bold text-white mb-1">
                      {convocatoria.nombre_convocatoria}
                    </h2>
                    <p className="text-blue-100 text-sm">{convocatoria.tipo}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold border ${getEstadoBadge(
                      convocatoria.estado_convocatoria
                    )}`}
                  >
                    {convocatoria.estado_convocatoria}
                  </span>
                </div>
              </div>

              {/* Contenido */}
              <div className="p-5 space-y-4">
                {/* Información adicional */}
                {convocatoria.cargo_solicitado && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <BriefcaseIcon className="h-5 w-5 text-blue-500" />
                    <span>{convocatoria.cargo_solicitado}</span>
                  </div>
                )}

                {convocatoria.facultad && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <DocumentTextIcon className="h-5 w-5 text-blue-500" />
                    <span>{convocatoria.facultad}</span>
                  </div>
                )}

                {/* Fechas */}
                <div className="grid grid-cols-2 gap-3 pt-3 border-t">
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-1">Publicación</p>
                    <div className="flex items-center justify-center gap-1 text-sm font-medium text-gray-700">
                      <CalendarIcon className="h-4 w-4" />
                      {formatearFecha(convocatoria.fecha_publicacion)}
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-1">Cierre</p>
                    <div className="flex items-center justify-center gap-1 text-sm font-medium text-red-600">
                      <CalendarIcon className="h-4 w-4" />
                      {formatearFecha(convocatoria.fecha_cierre)}
                    </div>
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="space-y-2 pt-4">
                  <button
                    onClick={() => handleVerDetalle(convocatoria.id_convocatoria)}
                    className="w-full flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
                  >
                    <EyeIcon className="h-5 w-5" />
                    Ver Detalles
                  </button>

                  <button
                    onClick={() => confirmarPostulacion(convocatoria.id_convocatoria)}
                    disabled={
                      postulando === convocatoria.id_convocatoria ||
                      convocatoria.estado_convocatoria === "Cerrada"
                    }
                    className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-300"
                  >
                    {postulando === convocatoria.id_convocatoria ? (
                      <>
                        <ArrowPathIcon className="h-5 w-5 animate-spin" />
                        Postulando...
                      </>
                    ) : (
                      <>
                        <ArrowRightIcon className="h-5 w-5" />
                        Postularse
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de detalles */}
      {selectedId && (
        <DetalleConvocatoriaModal
          idConvocatoria={selectedId}
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setSelectedId(null);
          }}
        />
      )}
    </div>
  );
};

export default ListaConvocatorias;