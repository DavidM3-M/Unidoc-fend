import axiosInstance from "../../../utils/axiosConfig";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable2 } from "../../../componentes/tablas/DataTable2";
import {
  CheckCircle,
  Clock,
  XCircle,
  FileText,
  GraduationCap,
  Building,
  Eye,
  Filter,
} from "lucide-react";
import VerEstudio from "../../ver/VerEstudio";
import CustomDialog from "../../../componentes/CustomDialogForm";

interface DocumentoEstudio {
  id_documento: number;
  archivo: string;
  estado: string;
  archivo_url: string;
}

interface Estudio {
  id_estudio: number;
  tipo_estudio: string;
  institucion: string;
  graduado: string;
  fecha_graduacion: string;
  titulo_convalido: string;
  fecha_convalidacion: string;
  resolucion_convalidacion: string;
  posible_fecha_graduacion: string;
  titulo_estudio: string;
  fecha_inicio: string;
  fecha_fin: string;
  documentos_estudio: DocumentoEstudio[];
  created_at: string;
}

const VerEstudiosDocente = ({ idDocente }: { idDocente: string }) => {
  const [estudios, setEstudios] = useState<Estudio[]>([]);
  const [openDetalle, setOpenDetalle] = useState(false);
  const [estudioSeleccionado, setEstudioSeleccionado] =
    useState<Estudio | null>(null);
  const [loading, setLoading] = useState(true);

  // Función para cargar datos con caché
  const fetchEstudios = async () => {
    try {
      setLoading(true);

      const response = await axiosInstance.get(
        import.meta.env.VITE_ENDPOINT_FILTRAR_DOCENTE_ESTUDIO_ID +
          `${idDocente}`
      );

      if (response.data?.data) {
        setEstudios(response.data.data);
      }
      console.log("Estudios cargados:", response.data.data);
    } catch (error) {
      console.error("Error al obtener estudios:", error);
      toast.error("Error al cargar los estudios");
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
      fetchEstudios(); // Esto recargará los datos frescos del servidor
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

  // Función para obtener el color del estado adaptado a tonos más sutiles
  const getEstadoColor = (estado: string) => {
    switch (estado?.toLowerCase()) {
      case "aprobado":
        return "bg-green-50 text-green-700 border-green-200";
      case "rechazado":
        return "bg-red-50 text-red-700 border-red-200";
      case "pendiente":
        return "bg-amber-50 text-amber-700 border-amber-200";
      default:
        return "bg-[rgba(30,58,95,0.05)] text-[#6b7a8d] border-[rgba(30,58,95,0.1)]";
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

  // Handler para ver el detalle de un estudio
  const handleVerEstudio = (estudio: Estudio) => {
    setEstudioSeleccionado(estudio);
    setOpenDetalle(true);
  };

  // Handler para cerrar el modal
  const handleCerrarDetalle = () => {
    setOpenDetalle(false);
    setTimeout(() => setEstudioSeleccionado(null), 300);
  };

  useEffect(() => {
    fetchEstudios();
  }, [idDocente]);

  const columns = useMemo<ColumnDef<Estudio>[]>(
    () => [
      {
        accessorKey: "tipo_estudio",
        header: () => (
          <div className="flex items-center gap-2 text-[#1e3a5f] font-semibold">
            <GraduationCap className="w-4 h-4" />
            <span>Tipo de estudio</span>
          </div>
        ),
        cell: ({ row }) => {
          const tipo = row.getValue("tipo_estudio") as string;
          return (
            <div className="flex items-center gap-2 text-[#2c3e50]">
              <span className="font-medium">{tipo || "No especificado"}</span>
            </div>
          );
        },
      },
      {
        accessorKey: "institucion",
        header: () => (
          <div className="flex items-center gap-2 text-[#1e3a5f] font-semibold">
            <Building className="w-4 h-4" />
            <span>Institución</span>
          </div>
        ),
        cell: ({ row }) => (
          <div>
            <p className="font-medium text-[#2c3e50]">
              {row.getValue("institucion") || "No especificada"}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "titulo_estudio",
        header: () => <span className="text-[#1e3a5f] font-semibold">Título obtenido</span>,
        cell: ({ row }) => (
          <div>
            <p className="font-medium text-[#2c3e50]">
              {row.getValue("titulo_estudio") || "No especificado"}
            </p>
          </div>
        ),
      },
      {
        id: "periodo",
        header: () => <span className="text-[#1e3a5f] font-semibold">Periodo</span>,
        cell: ({ row }) => {
          const estudio = row.original;
          const inicio = formatDate(estudio.fecha_inicio);
          const fin = formatDate(estudio.fecha_fin);
          return (
            <div className="flex flex-col">
              <span className="text-sm text-[#6b7a8d]">Desde: {inicio}</span>
              <span className="text-sm text-[#6b7a8d]">Hasta: {fin}</span>
            </div>
          );
        },
      },
      {
        id: "estado_documento",
        accessorFn: (row) => {
          const estado =
            row.documentos_estudio?.[0]?.estado?.toLowerCase() ||
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
          <div className="flex items-center gap-2 text-[#1e3a5f] font-semibold">
            <Filter className="w-4 h-4" />
            <span>Estado documento</span>
          </div>
        ),
        enableSorting: true,
        cell: ({ row }) => {
          const estudio = row.original;
          const estado =
            estudio.documentos_estudio?.[0]?.estado || "No disponible";
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
        header: () => <span className="text-[#1e3a5f] font-semibold">Acciones</span>,
        cell: ({ row }) => {
          const estudio = row.original;
          const documento = estudio.documentos_estudio?.[0];

          return (
            <div className="flex items-center gap-3">
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
                      className="border border-[rgba(30,58,95,0.2)] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[rgba(30,58,95,0.3)] focus:border-[#1e3a5f] outline-none transition-all bg-[#ffffff] text-[#2c3e50] font-medium cursor-pointer"
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
                        className="flex items-center justify-center gap-2 bg-[rgba(30,58,95,0.05)] hover:bg-[rgba(30,58,95,0.1)] text-[#1e3a5f] px-3 py-2 rounded-lg text-sm font-semibold transition-colors border border-[rgba(30,58,95,0.15)]"
                      >
                        <FileText className="w-4 h-4" />
                        Ver documento
                      </a>
                    )}
                  </>
                )}

                {/* Botón para modal del estudio */}
                <button
                  onClick={() => handleVerEstudio(estudio)}
                  className="flex items-center justify-center gap-2 bg-[#ffffff] hover:bg-[rgba(30,58,95,0.04)] text-[#1e3a5f] px-3 py-2 rounded-lg text-sm font-semibold transition-all border border-[rgba(30,58,95,0.15)] hover:border-[#1e3a5f] shadow-sm"
                >
                  <Eye className="w-4 h-4" />
                  Ver detalle
                </button>
              </div>
            </div>
          );
        },
      },
    ],
    []
  );

  // Estadísticas
  const estadisticas = useMemo(() => {
    const total = estudios.length;
    const aprobados = estudios.filter(
      (e) => e.documentos_estudio?.[0]?.estado?.toLowerCase() === "aprobado"
    ).length;
    const pendientes = estudios.filter(
      (e) => e.documentos_estudio?.[0]?.estado?.toLowerCase() === "pendiente"
    ).length;
    const rechazados = estudios.filter(
      (e) => e.documentos_estudio?.[0]?.estado?.toLowerCase() === "rechazado"
    ).length;

    return { total, aprobados, pendientes, rechazados };
  }, [estudios]);

  return (
    <div className="space-y-6 font-sans">
      {/* Header con estadísticas */}
      <div className="bg-[rgba(30,58,95,0.03)] rounded-xl p-6 border border-[rgba(30,58,95,0.09)]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#1e3a5f] flex items-center gap-3">
              <GraduationCap className="w-8 h-8 text-[#1e3a5f]" />
              Estudios Registrados
            </h1>
            <p className="text-[#6b7a8d] mt-1">
              Gestión de estudios académicos del docente
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-[#ffffff] rounded-lg p-3 shadow-sm border border-[rgba(30,58,95,0.15)]">
              <div className="text-2xl font-bold text-[#1e3a5f]">
                {estadisticas.total}
              </div>
              <div className="text-sm text-[#6b7a8d]">Total estudios</div>
            </div>
            <div className="bg-[#ffffff] rounded-lg p-3 shadow-sm border border-green-200">
              <div className="text-2xl font-bold text-green-700">
                {estadisticas.aprobados}
              </div>
              <div className="text-sm text-green-600">Aprobados</div>
            </div>
            <div className="bg-[#ffffff] rounded-lg p-3 shadow-sm border border-amber-200">
              <div className="text-2xl font-bold text-amber-600">
                {estadisticas.pendientes}
              </div>
              <div className="text-sm text-amber-600">Pendientes</div>
            </div>
            <div className="bg-[#ffffff] rounded-lg p-3 shadow-sm border border-red-200">
              <div className="text-2xl font-bold text-red-600">
                {estadisticas.rechazados}
              </div>
              <div className="text-sm text-red-600">Rechazados</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-[#ffffff] rounded-xl border border-[rgba(30,58,95,0.15)] shadow-sm overflow-hidden">
        <DataTable2 data={estudios} columns={columns} loading={loading} />
      </div>

      {/* Leyenda de estados */}
      <div className="bg-[rgba(30,58,95,0.02)] rounded-lg p-4 border border-[rgba(30,58,95,0.1)]">
        <h3 className="text-sm font-bold text-[#1e3a5f] mb-3">
          Leyenda de estados:
        </h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-sm text-[#6b7a8d] font-medium">
              Aprobado - Documento verificado y aceptado
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
            <span className="text-sm text-[#6b7a8d] font-medium">
              Pendiente - En proceso de revisión
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-sm text-[#6b7a8d] font-medium">
              Rechazado - Documento no cumple requisitos
            </span>
          </div>
        </div>
      </div>

      {/* Modal de Detalles del Estudio */}
      <CustomDialog
        title={`Detalles del Estudio${
          estudioSeleccionado ? `: ${estudioSeleccionado.titulo_estudio}` : ""
        }`}
        open={openDetalle}
        onClose={handleCerrarDetalle}
        width="900px"
      >
        <div className="p-4">
          {estudioSeleccionado ? (
            <>
              {/* Contenido del estudio */}
              <VerEstudio estudio={estudioSeleccionado} />

              {/* Información adicional para apoyo profesoral */}
              <div className="mt-6 pt-6 border-t border-[rgba(30,58,95,0.15)]">
                <h4 className="text-lg font-bold text-[#1e3a5f] mb-3">
                  Información Administrativa
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-[#6b7a8d]">Fecha de registro</p>
                    <p className="font-medium text-[#2c3e50]">
                      {formatDate(estudioSeleccionado.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-[#6b7a8d]">
                No se ha seleccionado ningún estudio
              </p>
            </div>
          )}
        </div>
      </CustomDialog>
    </div>
  );
};

export default VerEstudiosDocente;