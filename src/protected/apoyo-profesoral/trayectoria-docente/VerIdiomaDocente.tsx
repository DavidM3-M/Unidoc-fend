import { useEffect, useMemo, useState } from "react";
import axiosInstance from "../../../utils/axiosConfig";
import { toast } from "react-toastify";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable2 } from "../../../componentes/tablas/DataTable2";
import {
  CheckCircle,
  Clock,
  XCircle,
  FileText,
  Languages,
  Building,
  Eye,
  Globe,
  Award,
  Calendar,
  Filter,
} from "lucide-react";
import CustomDialog from "../../../componentes/CustomDialogForm";
import VerIdioma from "../../ver/VerIdioma";

interface DocumentoIdioma {
  id_documento: number;
  archivo: string;
  estado: string;
  archivo_url: string;
}

interface Idioma {
  id_idioma: number;
  idioma: string;
  institucion_idioma: string;
  fecha_certificado: string;
  nivel: string;
  documentos_idioma?: DocumentoIdioma[];
  created_at?: string;
}

const VerIdiomaDocente = ({ idDocente }: { idDocente: string }) => {
  const [idiomas, setIdiomas] = useState<Idioma[]>([]);
  const [openDetalle, setOpenDetalle] = useState(false);
  const [idiomaSeleccionado, setIdiomaSeleccionado] = useState<Idioma | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  // Función para cargar datos
  const fetchIdiomas = async () => {
    try {
      setLoading(true);

      const response = await axiosInstance.get(
        import.meta.env.VITE_ENDPOINT_FILTRAR_DOCENTE_IDIOMA_ID + idDocente
      );

      if (response.data?.data) {
        setIdiomas(response.data.data);
      }
    } catch (error) {
      console.error("Error al obtener idiomas:", error);
      toast.error("Error al cargar los idiomas");
    } finally {
      setLoading(false);
    }
  };

  // Actualizar el estado del documento
  const actualizarEstadoDocumento = async (
    idDocumento: number,
    nuevoEstado: string
  ) => {
    try {
      const formData = new FormData();
      formData.append("estado", nuevoEstado);
      formData.append("_method", "PUT");

      await axiosInstance.post(
        import.meta.env.VITE_ENDOPOINT_ACTUALIZAR_ESTADO_DOCUMENTO_DOCENTE +
          `${idDocumento}`,
        formData
      );

      toast.success("Estado actualizado correctamente");
      fetchIdiomas();
      sessionStorage.removeItem(`idiomas_docente_${idDocente}`);
    } catch (error) {
      console.error("Error al actualizar el estado del documento:", error);
      toast.error("Error al actualizar el estado");
    }
  };

  // Función para formatear fechas
  const formatDate = (dateString: string) => {
    if (!dateString || dateString === "null") return "No especificada";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Función para obtener el color del estado
  const getEstadoColor = (estado: string) => {
    switch (estado?.toLowerCase()) {
      case "aprobado":
        return "bg-green-100 text-green-800 border-green-200";
      case "rechazado":
        return "bg-red-100 text-red-800 border-red-200";
      case "pendiente":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Función para obtener el icono del estado
  const getEstadoIcon = (estado: string) => {
    switch (estado?.toLowerCase()) {
      case "aprobado":
        return <CheckCircle className="w-4 h-4" />;
      case "rechazado":
        return <XCircle className="w-4 h-4" />;
      case "pendiente":
        return <Clock className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  // Función para obtener el color del nivel
  const getNivelColor = (nivel: string) => {
    const nivelLower = nivel?.toLowerCase();
    switch (true) {
      case nivelLower?.includes("básico") ||
        nivelLower?.includes("a1") ||
        nivelLower?.includes("a2"):
        return "bg-blue-100 text-blue-800 border-blue-200";
      case nivelLower?.includes("intermedio") ||
        nivelLower?.includes("b1") ||
        nivelLower?.includes("b2"):
        return "bg-purple-100 text-purple-800 border-purple-200";
      case nivelLower?.includes("avanzado") ||
        nivelLower?.includes("c1") ||
        nivelLower?.includes("c2"):
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case nivelLower?.includes("nativo") || nivelLower?.includes("fluido"):
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Handler para ver el detalle de un idioma
  const handleVerIdioma = (idioma: Idioma) => {
    setIdiomaSeleccionado(idioma);
    setOpenDetalle(true);
  };

  // Handler para cerrar el modal
  const handleCerrarDetalle = () => {
    setOpenDetalle(false);
    setTimeout(() => setIdiomaSeleccionado(null), 300);
  };

  useEffect(() => {
    fetchIdiomas();
  }, [idDocente]);

  const columns = useMemo<ColumnDef<Idioma>[]>(
    () => [
      {
        accessorKey: "idioma",
        header: () => (
          <div className="flex items-center gap-2">
            <Languages className="w-4 h-4" />
            <span>Idioma</span>
          </div>
        ),
        cell: ({ row }) => {
          const idioma = row.getValue("idioma") as string;
          return (
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-600" />
              <span className="font-medium">{idioma || "No especificado"}</span>
            </div>
          );
        },
      },
      {
        accessorKey: "nivel",
        header: () => (
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4" />
            <span>Nivel</span>
          </div>
        ),
        cell: ({ row }) => {
          const nivel = row.getValue("nivel") as string;
          return (
            <span
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getNivelColor(
                nivel
              )}`}
            >
              {nivel || "No especificado"}
            </span>
          );
        },
      },
      {
        accessorKey: "institucion_idioma",
        header: () => (
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4" />
            <span>Institución</span>
          </div>
        ),
        cell: ({ row }) => (
          <div>
            <p className="font-medium">
              {row.getValue("institucion_idioma") || "No especificada"}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "fecha_certificado",
        header: () => (
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>Fecha certificado</span>
          </div>
        ),
        cell: ({ row }) => (
          <div>
            <p className="font-medium text-gray-900">
              {formatDate(row.getValue("fecha_certificado") as string)}
            </p>
          </div>
        ),
      },
      {
        id: "estado_documento",
        accessorFn: (row) => {
          const estado =
            row.documentos_idioma?.[0]?.estado?.toLowerCase() ||
            "sin_documento";

          // Orden personalizado: Pendiente (1), Aprobado (2), Rechazado (3), sin_documento (4)
          const ordenEstados = {
            pendiente: 1,
            aprobado: 2,
            rechazado: 3,
            sin_documento: 4,
          };

          return ordenEstados[estado as keyof typeof ordenEstados] || 99;
        },
        header: () => (
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            <span>Estado documento</span>
          </div>
        ),
        enableSorting: true,
        cell: ({ row }) => {
          const idioma = row.original;
          const estado =
            idioma.documentos_idioma?.[0]?.estado || "No disponible";
          return (
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getEstadoColor(
                  estado
                )}`}
              >
                {getEstadoIcon(estado)}
                {estado.charAt(0).toUpperCase() + estado.slice(1)}
              </span>
            </div>
          );
        },
      },
      {
        id: "acciones",
        header: "Acciones",
        cell: ({ row }) => {
          const idioma = row.original;
          const documento = idioma.documentos_idioma?.[0];

          return (
            <div className="flex flex-col gap-2">
              {documento && (
                <>
                  <select
                    value={documento.estado}
                    onChange={(e) =>
                      actualizarEstadoDocumento(
                        documento.id_documento,
                        e.target.value
                      )
                    }
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="aprobado">Aprobado</option>
                    <option value="rechazado">Rechazado</option>
                  </select>

                  {documento.archivo_url && (
                    <a
                      href={documento.archivo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors border border-blue-200"
                    >
                      <FileText className="w-4 h-4" />
                      Ver certificado
                    </a>
                  )}
                </>
              )}

              {/* Botón para modal del idioma */}
              <button
                onClick={() => handleVerIdioma(idioma)}
                className="flex items-center justify-center gap-2 bg-green-50 hover:bg-green-100 text-green-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors border border-green-200"
              >
                <Eye className="w-4 h-4" />
                Ver detalle
              </button>
            </div>
          );
        },
      },
    ],
    []
  );

  // Estadísticas
  const estadisticas = useMemo(() => {
    const total = idiomas.length;
    const aprobados = idiomas.filter(
      (i) => i.documentos_idioma?.[0]?.estado?.toLowerCase() === "aprobado"
    ).length;
    const pendientes = idiomas.filter(
      (i) => i.documentos_idioma?.[0]?.estado?.toLowerCase() === "pendiente"
    ).length;
    const rechazados = idiomas.filter(
      (i) => i.documentos_idioma?.[0]?.estado?.toLowerCase() === "rechazado"
    ).length;

    return { total, aprobados, pendientes, rechazados };
  }, [idiomas]);

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <Languages className="w-8 h-8 text-blue-600" />
              Idiomas Registrados
            </h1>
            <p className="text-gray-600 mt-1">
              Gestión de certificaciones de idiomas del docente
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
              <div className="text-2xl font-bold text-gray-900">
                {estadisticas.total}
              </div>
              <div className="text-sm text-gray-500">Total idiomas</div>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm border border-green-200">
              <div className="text-2xl font-bold text-green-700">
                {estadisticas.aprobados}
              </div>
              <div className="text-sm text-green-600">Aprobados</div>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm border border-yellow-200">
              <div className="text-2xl font-bold text-yellow-700">
                {estadisticas.pendientes}
              </div>
              <div className="text-sm text-yellow-600">Pendientes</div>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm border border-red-200">
              <div className="text-2xl font-bold text-red-700">
                {estadisticas.rechazados}
              </div>
              <div className="text-sm text-red-600">Rechazados</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <DataTable2 data={idiomas} columns={columns} loading={loading} />
      </div>

      {/* Leyenda */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Leyenda de estados:
          </h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-sm text-gray-600">
                Aprobado - Certificado verificado y aceptado
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span className="text-sm text-gray-600">
                Pendiente - En proceso de revisión
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-sm text-gray-600">
                Rechazado - Certificado no cumple requisitos
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Leyenda de niveles:
          </h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                Básico (A1/A2)
              </span>
              <span className="text-sm text-gray-600">Comprensión básica</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                Intermedio (B1/B2)
              </span>
              <span className="text-sm text-gray-600">
                Comunicación independiente
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 border border-indigo-200">
                Avanzado (C1/C2)
              </span>
              <span className="text-sm text-gray-600">Fluidez avanzada</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Detalles del Idioma */}
      <CustomDialog
        title={`Detalles del Idioma${
          idiomaSeleccionado ? `: ${idiomaSeleccionado.idioma}` : ""
        }`}
        open={openDetalle}
        onClose={handleCerrarDetalle}
        width="900px"
      >
        <div className="p-4">
          {idiomaSeleccionado ? (
            <>
              {/* Contenido del idioma usando tu componente */}
              <VerIdioma idiomaData={idiomaSeleccionado} />

              {/* Información administrativa adicional */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">
                  Información Administrativa
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {idiomaSeleccionado.created_at && (
                    <div>
                      <p className="text-sm text-gray-600">Fecha de registro</p>
                      <p className="font-medium">
                        {formatDate(idiomaSeleccionado.created_at)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">
                No se ha seleccionado ningún idioma
              </p>
            </div>
          )}
        </div>
      </CustomDialog>
    </div>
  );
};

export default VerIdiomaDocente;
