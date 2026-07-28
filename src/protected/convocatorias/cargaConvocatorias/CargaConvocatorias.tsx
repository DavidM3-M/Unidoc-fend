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
        Aspirante: import.meta.env.VITE_ENDPOINT_OBTENER_CONVOCATORIAS_ASPIRANTE,
        Docente: import.meta.env.VITE_ENDPOINT_OBTENER_CONVOCATORIAS_DOCENTE,
<<<<<<< HEAD
=======
        Administrativo: import.meta.env.VITE_ENDPOINT_OBTENER_CONVOCATORIAS_DOCENTE,
>>>>>>> 628d43043a4ce9a1d388f7e4ca35dad740613150
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
        <p className="font-medium text-[#1e3a5f] mb-4">
          ¿Estás seguro que deseas postularte a "
          {convocatoria?.nombre_convocatoria}"?
        </p>
        <div className="flex justify-center gap-3">
          <button
            onClick={() => {
              toast.dismiss();
              handlePostularse(idConvocatoria);
            }}
            className="px-4 py-2 bg-[#1e3a5f] text-white rounded-lg hover:bg-[#152943] transition-colors"
          >
            Sí, postularme
          </button>
          <button
            onClick={() => toast.dismiss()}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors border border-gray-200"
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
        className: "w-full max-w-xs !rounded-xl !p-0",
      }
    );
  };

  const handlePostularse = async (idConvocatoria: number) => {
    try {
      setPostulando(idConvocatoria);
      const ENDPOINTS = {
        Aspirante: import.meta.env.VITE_ENDPOINT_CREAR_POSTULACION_ASPIRANTE,
        Docente: import.meta.env.VITE_ENDPOINT_CREAR_POSTULACION_DOCENTE,
<<<<<<< HEAD
=======
        Administrativo: import.meta.env.VITE_ENDPOINT_CREAR_POSTULACION_DOCENTE,
>>>>>>> 628d43043a4ce9a1d388f7e4ca35dad740613150
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
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }
    if (estadoLower === "cerrada" || estadoLower === "finalizada") {
      return "bg-red-50 text-red-700 border-red-200";
    }
    return "bg-amber-50 text-amber-700 border-amber-200";
  };

  const isConvocatoriaVencida = (fecha_cierre: string) => {
    const fechaCierre = new Date(fecha_cierre);
    const hoy = new Date();
    // Comparar solo las fechas, sin las horas
    fechaCierre.setHours(0, 0, 0, 0);
    hoy.setHours(0, 0, 0, 0);
    return fechaCierre < hoy;
  };

  const convocatoriasActivas = convocatorias.filter(
    (convocatoria) => !isConvocatoriaVencida(convocatoria.fecha_cierre)
  );

  useEffect(() => {
    fetchConvocatorias();
  }, [fetchConvocatorias]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 w-full bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1e3a5f] mb-4"></div>
        <p className="text-[#1e3a5f] font-medium">Cargando convocatorias...</p>
        <p className="text-gray-500 text-sm mt-2">Por favor espere un momento</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl shadow-sm border border-red-100 p-4 w-full">
        <DocumentTextIcon className="h-12 w-12 text-red-400 mb-4" />
        <p className="text-red-600 text-center mb-4 font-medium">{error}</p>
        <button
          onClick={fetchConvocatorias}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#1e3a5f] text-white rounded-lg hover:bg-[#152943] shadow-sm transition-all"
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
        <h1 className="text-2xl font-bold text-[#1e3a5f]">
          Convocatorias Disponibles
        </h1>
        <Link
          to="/ver/postulaciones"
          className="flex items-center gap-2 px-5 py-2.5 bg-[#1e3a5f] text-white rounded-lg hover:bg-[#152943] transition-all shadow-sm w-full sm:w-auto justify-center font-medium"
        >
          <CheckIcon className="h-5 w-5" />
          Ver mis postulaciones
        </Link>
      </div>

      {/* Lista de convocatorias */}
      {convocatoriasActivas.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 w-full bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
          <DocumentTextIcon className="h-12 w-12 text-[#1e3a5f] opacity-50 mb-4" />
          <p className="text-[#1e3a5f] font-medium text-lg">
            No hay convocatorias disponibles actualmente.
          </p>
          <p className="text-gray-500 text-sm mt-2">Por favor, intente más tarde.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {convocatoriasActivas.map((convocatoria) => (
            <div
              key={convocatoria.id_convocatoria}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200 flex flex-col"
            >
              {/* Header de la tarjeta */}
              <div className="bg-[#1e3a5f] p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h2 className="text-lg font-bold text-white mb-1 leading-tight">
                      {convocatoria.nombre_convocatoria}
                    </h2>
                    <p className="text-gray-300 text-sm font-medium">{convocatoria.tipo}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-[11px] font-bold border whitespace-nowrap ${getEstadoBadge(
                      convocatoria.estado_convocatoria
                    )}`}
                  >
                    {convocatoria.estado_convocatoria}
                  </span>
                </div>
              </div>

              {/* Contenido */}
              <div className="p-5 flex flex-col flex-grow space-y-4">
                {/* Información adicional */}
                <div className="space-y-3 flex-grow">
                  {convocatoria.cargo_solicitado && (
                    <div className="flex items-start gap-2 text-sm text-gray-600">
                      <BriefcaseIcon className="h-5 w-5 text-[#1e3a5f] opacity-70 shrink-0" />
                      <span className="leading-tight">{convocatoria.cargo_solicitado}</span>
                    </div>
                  )}

                  {convocatoria.facultad && (
                    <div className="flex items-start gap-2 text-sm text-gray-600">
                      <DocumentTextIcon className="h-5 w-5 text-[#1e3a5f] opacity-70 shrink-0" />
                      <span className="leading-tight">{convocatoria.facultad}</span>
                    </div>
                  )}
                </div>

                {/* Fechas */}
                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100">
                  <div className="text-center bg-gray-50 rounded-lg py-2">
                    <p className="text-[11px] text-gray-500 mb-0.5 uppercase tracking-wide font-semibold">Publicación</p>
                    <div className="flex items-center justify-center gap-1 text-sm font-medium text-[#1e3a5f]">
                      <CalendarIcon className="h-3.5 w-3.5" />
                      {formatearFecha(convocatoria.fecha_publicacion)}
                    </div>
                  </div>
                  <div className="text-center bg-red-50/50 rounded-lg py-2">
                    <p className="text-[11px] text-gray-500 mb-0.5 uppercase tracking-wide font-semibold">Cierre</p>
                    <div className="flex items-center justify-center gap-1 text-sm font-medium text-red-600">
                      <CalendarIcon className="h-3.5 w-3.5" />
                      {formatearFecha(convocatoria.fecha_cierre)}
                    </div>
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="space-y-2 pt-2">
                  <button
                    onClick={() => handleVerDetalle(convocatoria.id_convocatoria)}
                    className="w-full flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 text-[#1e3a5f] border border-slate-200 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors"
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
                    className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400 disabled:shadow-none"
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