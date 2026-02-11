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
  Briefcase,
  Building,
  Clock as ClockIcon,
  User,
  Eye,
  Filter,
} from "lucide-react";
import CustomDialog from "../../../componentes/CustomDialogForm";
import VerExperiencia from "../../ver/VerExperiencia";

interface DocumentoExperiencia {
  id_documento: number;
  archivo: string;
  estado: string;
  archivo_url: string;
}

interface Experiencia {
  id_experiencia?: number;
  tipo_experiencia: string;
  institucion_experiencia: string;
  cargo: string;
  intensidad_horaria: number;
  fecha_inicio: string;
  fecha_finalizacion: string;
  documentos_experiencia?: DocumentoExperiencia[];
  created_at?: string;
}

const VerExperienciaDocente = ({ idDocente }: { idDocente: string }) => {
  const [experiencias, setExperiencias] = useState<Experiencia[]>([]);
  const [openDetalle, setOpenDetalle] = useState(false);
  const [experienciaSeleccionada, setExperienciaSeleccionada] =
    useState<Experiencia | null>(null);
  const [loading, setLoading] = useState(true);

  // Función para cargar datos
  const fetchExperiencias = async () => {
    try {
      setLoading(true);

      const response = await axiosInstance.get(
        import.meta.env.VITE_ENDPOINT_FILTRAR_DOCENTE_EXPERIENCIA_ID +
          `${idDocente}`
      );

      if (response.data?.data) {
        setExperiencias(response.data.data);
      }
    } catch (error) {
      console.error("Error al obtener experiencias:", error);
      toast.error("Error al cargar las experiencias");
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
      fetchExperiencias();
    } catch (error) {
      console.error("Error al actualizar el estado del documento:", error);
      toast.error("Error al actualizar el estado");
    }
  };

  // Función para formatear fechas
  const formatDate = (dateString: string) => {
    if (!dateString || dateString === "null") return "Trabajo actual";
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

  // Handler para ver el detalle de una experiencia
  const handleVerExperiencia = (experiencia: Experiencia) => {
    setExperienciaSeleccionada(experiencia);
    setOpenDetalle(true);
  };

  // Handler para cerrar el modal
  const handleCerrarDetalle = () => {
    setOpenDetalle(false);
    setTimeout(() => setExperienciaSeleccionada(null), 300);
  };

  useEffect(() => {
    fetchExperiencias();
  }, [idDocente]);

  const columns = useMemo<ColumnDef<Experiencia>[]>(
    () => [
      {
        accessorKey: "tipo_experiencia",
        header: () => (
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            <span>Tipo</span>
          </div>
        ),
        cell: ({ row }) => {
          const tipo = row.getValue("tipo_experiencia") as string;
          return (
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-blue-600" />
              <span className="font-medium">{tipo || "No especificado"}</span>
            </div>
          );
        },
      },
      {
        accessorKey: "institucion_experiencia",
        header: () => (
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4" />
            <span>Institución</span>
          </div>
        ),
        cell: ({ row }) => (
          <div>
            <p className="font-medium">
              {row.getValue("institucion_experiencia") || "No especificada"}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "cargo",
        header: () => (
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span>Cargo</span>
          </div>
        ),
        cell: ({ row }) => (
          <div>
            <p className="font-medium text-gray-900">
              {row.getValue("cargo") || "No especificado"}
            </p>
          </div>
        ),
      },
      {
        id: "periodo",
        header: "Periodo",
        cell: ({ row }) => {
          const experiencia = row.original;
          const inicio = formatDate(experiencia.fecha_inicio);
          const fin = formatDate(experiencia.fecha_finalizacion);
          return (
            <div className="flex flex-col">
              <span className="text-sm text-gray-600">Desde: {inicio}</span>
              <span className="text-sm text-gray-600">Hasta: {fin}</span>
            </div>
          );
        },
      },
      {
        accessorKey: "intensidad_horaria",
        header: () => (
          <div className="flex items-center gap-2">
            <ClockIcon className="w-4 h-4" />
            <span>Intensidad</span>
          </div>
        ),
        cell: ({ row }) => {
          const intensidad = row.getValue("intensidad_horaria") as number;
          return (
            <div className="flex items-center gap-1">
              <span className="font-medium">{intensidad || 0}</span>
              <span className="text-sm text-gray-600">horas/sem</span>
            </div>
          );
        },
      },
      {
        id: "estado_documento",
        accessorFn: (row) => {
          const estado =
            row.documentos_experiencia?.[0]?.estado?.toLowerCase() ||
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
          const experiencia = row.original;
          const estado =
            experiencia.documentos_experiencia?.[0]?.estado || "No disponible";
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
          const experiencia = row.original;
          const documento = experiencia.documentos_experiencia?.[0];

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
                      Ver documento
                    </a>
                  )}
                </>
              )}

              {/* Botón para modal de la experiencia */}
              <button
                onClick={() => handleVerExperiencia(experiencia)}
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
    const total = experiencias.length;
    const aprobados = experiencias.filter(
      (e) => e.documentos_experiencia?.[0]?.estado?.toLowerCase() === "aprobado"
    ).length;
    const pendientes = experiencias.filter(
      (e) =>
        e.documentos_experiencia?.[0]?.estado?.toLowerCase() === "pendiente"
    ).length;
    const rechazados = experiencias.filter(
      (e) =>
        e.documentos_experiencia?.[0]?.estado?.toLowerCase() === "rechazado"
    ).length;

    // Calcular años totales de experiencia (aproximado)
    let totalMeses = 0;
    experiencias.forEach((exp) => {
      if (exp.fecha_inicio && exp.fecha_finalizacion) {
        const inicio = new Date(exp.fecha_inicio);
        const fin =
          exp.fecha_finalizacion === "actual"
            ? new Date()
            : new Date(exp.fecha_finalizacion);
        const meses =
          (fin.getFullYear() - inicio.getFullYear()) * 12 +
          (fin.getMonth() - inicio.getMonth());
        totalMeses += Math.max(0, meses);
      }
    });
    const totalAnios = Math.round(totalMeses / 12);

    return { total, aprobados, pendientes, rechazados, totalAnios };
  }, [experiencias]);

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <Briefcase className="w-8 h-8 text-blue-600" />
              Experiencia Profesional
            </h1>
            <p className="text-gray-600 mt-1">
              Gestión de experiencia laboral y profesional del docente
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
              <div className="text-2xl font-bold text-gray-900">
                {estadisticas.total}
              </div>
              <div className="text-sm text-gray-500">Total experiencias</div>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm border border-green-200">
              <div className="text-2xl font-bold text-green-700">
                {estadisticas.aprobados}
              </div>
              <div className="text-sm text-green-600">Aprobadas</div>
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
              <div className="text-sm text-red-600">Rechazadas</div>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm border border-blue-200">
              <div className="text-2xl font-bold text-blue-700">
                {estadisticas.totalAnios}+
              </div>
              <div className="text-sm text-blue-600">Años experiencia</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <DataTable2 data={experiencias} columns={columns} loading={loading} />
      </div>

      {/* Leyenda */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          Leyenda de estados:
        </h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-sm text-gray-600">
              Aprobado - Documento verificado y aceptado
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
              Rechazado - Documento no cumple requisitos
            </span>
          </div>
        </div>
      </div>

      {/* Modal de Detalles de la Experiencia */}
      <CustomDialog
        title={`Detalles de la Experiencia${
          experienciaSeleccionada ? `: ${experienciaSeleccionada.cargo}` : ""
        }`}
        open={openDetalle}
        onClose={handleCerrarDetalle}
        width="900px"
      >
        <div className="p-4">
          {experienciaSeleccionada ? (
            <>
              {/* Contenido de la experiencia usando tu componente */}
              <VerExperiencia experiencia={experienciaSeleccionada} />

              {/* Información administrativa adicional */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">
                  Información Administrativa
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {experienciaSeleccionada.created_at && (
                    <div>
                      <p className="text-sm text-gray-600">Fecha de registro</p>
                      <p className="font-medium">
                        {formatDate(experienciaSeleccionada.created_at)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">
                No se ha seleccionado ninguna experiencia
              </p>
            </div>
          )}
        </div>
      </CustomDialog>
    </div>
  );
};

export default VerExperienciaDocente;
