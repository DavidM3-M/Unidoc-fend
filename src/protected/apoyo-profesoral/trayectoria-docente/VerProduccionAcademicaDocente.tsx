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
  BookOpen,
  Users,
  Calendar,
  Eye,
  AlertCircle,
  Search,
  Filter,
} from "lucide-react";
import CustomDialog from "../../../componentes/CustomDialogForm";
import VerProduccion from "../../ver/VerProduccion";

/* =======================
   Interfaces
======================= */

interface DocumentoProduccion {
  id_documento: number;
  archivo: string;
  estado: string;
  archivo_url: string;
  created_at: string;
  documentable_id: number;
  documentable_type: string;
  updated_at: string;
}

interface ProduccionAcademica {
  id_produccion_academica: number;
  user_id: number;
  ambito_divulgacion_id: number;
  producto_academico_id?: number;
  titulo: string;
  numero_autores: number;
  medio_divulgacion: string;
  fecha_divulgacion: string;
  docente_nombre?: string;
  email?: string;
  documentos_produccion_academica?: DocumentoProduccion[];
  nombre_ambito_divulgacion?: string;
  nombre_producto_academico?: string;
  created_at?: string;
  updated_at?: string;
}

interface AmbitoProducto {
  id_ambito_divulgacion: number;
  nombre_ambito_divulgacion: string;
  producto_academico_id: number;
  nombre_producto_academico: string;
}

const VerProduccionAcademicaDocente = ({
  idDocente,
}: {
  idDocente: string;
}) => {
  const [producciones, setProducciones] = useState<ProduccionAcademica[]>([]);
  const [produccionFiltrada, setProduccionFiltrada] = useState<
    ProduccionAcademica[]
  >([]);
  const [ambitosProductos, setAmbitosProductos] = useState<
    Record<number, AmbitoProducto>
  >({});
  const [openDetalle, setOpenDetalle] = useState(false);
  const [produccionSeleccionada, setProduccionSeleccionada] =
    useState<ProduccionAcademica | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [cargando, setCargando] = useState(true);
  const [cargandoAmbitos, setCargandoAmbitos] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* =======================
     Función para formatear fechas
  ======================= */
  const formatFecha = (fecha: string): string => {
    if (!fecha || fecha === "null") return "Sin fecha";
    try {
      const date = new Date(fecha);
      return date.toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      return fecha;
    }
  };

  /* =======================
     Función para cargar ámbito y producto académico
  ======================= */
  const cargarAmbitoProducto = async (ambitoId: number) => {
    try {
      const response = await axiosInstance.get<AmbitoProducto>(
        `/tiposProduccionAcademica/ambito-divulgacion-completo/${ambitoId}`
      );
      return response.data;
    } catch (error) {
      console.error(`Error al cargar ámbito ${ambitoId}:`, error);
      return null;
    }
  };

  /* =======================
     Función para obtener el color del estado
  ======================= */
  const getEstadoColor = (estado: string) => {
    if (!estado) return "bg-gray-100 text-gray-800 border-gray-200";
    switch (estado.toLowerCase()) {
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

  /* =======================
     Función para obtener el icono del estado
  ======================= */
  const getEstadoIcon = (estado: string) => {
    if (!estado) return <FileText className="w-4 h-4" />;
    switch (estado.toLowerCase()) {
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

  /* =======================
     Función para recargar datos
  ======================= */
  const recargarDatos = async () => {
    setCargando(true);
    setError(null);
    try {
      const response = await axiosInstance.get(
        `/apoyoProfesoral/filtrar-docentes-produccion/${idDocente}`
      );

      if (response.data?.data) {
        const produccionesData = response.data.data;

        setProducciones(produccionesData);
        setProduccionFiltrada(produccionesData);

        // Cargar datos de ámbitos y productos
        const ambitosIds = new Set<number>();
        produccionesData.forEach((produccion: ProduccionAcademica) => {
          if (produccion.ambito_divulgacion_id) {
            ambitosIds.add(produccion.ambito_divulgacion_id);
          }
        });

        if (ambitosIds.size > 0) {
          setCargandoAmbitos(true);
          const ambitosMap: Record<number, AmbitoProducto> = {};
          const promises = Array.from(ambitosIds).map(async (ambitoId) => {
            const data = await cargarAmbitoProducto(ambitoId);
            if (data) {
              ambitosMap[ambitoId] = data;
            }
          });

          await Promise.all(promises);
          setAmbitosProductos(ambitosMap);

          // Actualizar las producciones con nombres de ámbito y producto
          const produccionesActualizadas = produccionesData.map(
            (produccion: ProduccionAcademica) => {
              const ambitoProducto =
                ambitosMap[produccion.ambito_divulgacion_id];
              if (ambitoProducto) {
                return {
                  ...produccion,
                  nombre_ambito_divulgacion:
                    ambitoProducto.nombre_ambito_divulgacion,
                  nombre_producto_academico:
                    ambitoProducto.nombre_producto_academico,
                };
              }
              return produccion;
            }
          );

          setProducciones(produccionesActualizadas);
          setProduccionFiltrada(produccionesActualizadas);
          setCargandoAmbitos(false);
        }
      } else {
        toast.error("No se encontraron producciones académicas");
      }
    } catch (error: any) {
      console.error("Error al cargar producciones académicas:", error);
      setError(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Error al cargar las producciones académicas"
      );
      toast.error("Error al cargar las producciones académicas");
    } finally {
      setCargando(false);
    }
  };

  /* =======================
     Actualizar el estado del documento
  ======================= */
  const actualizarEstadoDocumento = async (
    idDocumento: number,
    nuevoEstado: string
  ) => {
    try {
      const formData = new FormData();
      formData.append("estado", nuevoEstado);
      formData.append("_method", "PUT");

      await axiosInstance.post(
        `/apoyoProfesoral/actualizar-documento/${idDocumento}`,
        formData
      );

      toast.success("Estado actualizado correctamente");
      recargarDatos();
    } catch (error) {
      console.error("Error al actualizar el estado del documento:", error);
      toast.error("Error al actualizar el estado");
    }
  };

  /* =======================
     Handler para ver el detalle de una producción
  ======================= */
  const handleVerProduccion = (produccion: ProduccionAcademica) => {
    setProduccionSeleccionada(produccion);
    setOpenDetalle(true);
  };

  /* =======================
     Handler para cerrar el modal
  ======================= */
  const handleCerrarDetalle = () => {
    setOpenDetalle(false);
    setTimeout(() => setProduccionSeleccionada(null), 300);
  };

  /* =======================
     FILTRO DE BÚSQUEDA - PATRÓN APLICADO DEL PRIMER COMPONENTE
  ======================= */
  useEffect(() => {
    if (!searchTerm.trim()) {
      setProduccionFiltrada(producciones);
      return;
    }

    const term = searchTerm.toLowerCase().trim();
    const filtered = producciones.filter((item) => {
      // Buscar en título
      if (item.titulo.toLowerCase().includes(term)) return true;

      // Buscar en medio de divulgación
      if (item.medio_divulgacion.toLowerCase().includes(term)) return true;

      // Buscar en número de autores
      if (item.numero_autores.toString().includes(term)) return true;

      // Buscar en fecha
      if (formatFecha(item.fecha_divulgacion).toLowerCase().includes(term))
        return true;

      // Buscar en ámbito de divulgación
      if (
        item.nombre_ambito_divulgacion &&
        item.nombre_ambito_divulgacion.toLowerCase().includes(term)
      )
        return true;

      // Buscar en producto académico
      if (
        item.nombre_producto_academico &&
        item.nombre_producto_academico.toLowerCase().includes(term)
      )
        return true;

      // Buscar en estado del documento
      const estado = item.documentos_produccion_academica?.[0]?.estado;
      if (estado && estado.toLowerCase().includes(term)) return true;

      return false;
    });

    setProduccionFiltrada(filtered);
  }, [searchTerm, producciones]);

  /* =======================
     Efecto para cargar datos
  ======================= */
  useEffect(() => {
    recargarDatos();
  }, [idDocente]);

  /* =======================
     Columnas de la tabla
  ======================= */
  const columns: ColumnDef<ProduccionAcademica>[] = useMemo(
    () => [
      {
        header: "Título",
        accessorFn: (row) => `${row.titulo} ${row.medio_divulgacion}`,
        cell: ({ row }) => (
          <div>
            <div className="font-medium">{row.original.titulo}</div>
            <div className="text-xs text-gray-500">
              {row.original.medio_divulgacion}
            </div>
          </div>
        ),
      },
      {
        header: "Autores",
        accessorKey: "numero_autores",
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4 text-gray-400" />
            <span>{row.original.numero_autores}</span>
          </div>
        ),
      },
      {
        header: "Producto académico",
        cell: ({ row }) => {
          const ambitoProducto =
            ambitosProductos[row.original.ambito_divulgacion_id];
          if (ambitoProducto) {
            return (
              <div className="font-medium">
                {ambitoProducto.nombre_producto_academico}
              </div>
            );
          }
          return cargandoAmbitos ? (
            <span className="text-gray-400">Cargando...</span>
          ) : (
            <span className="text-gray-500">Sin información</span>
          );
        },
      },
      {
        header: "Ámbito",
        cell: ({ row }) => {
          const ambitoProducto =
            ambitosProductos[row.original.ambito_divulgacion_id];
          if (ambitoProducto) {
            return (
              <div className="font-medium">
                {ambitoProducto.nombre_ambito_divulgacion}
              </div>
            );
          }
          return cargandoAmbitos ? (
            <span className="text-gray-400">Cargando...</span>
          ) : (
            <span className="text-gray-500">Sin información</span>
          );
        },
      },
      {
        header: "Fecha",
        accessorKey: "fecha_divulgacion",
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span>{formatFecha(row.original.fecha_divulgacion)}</span>
          </div>
        ),
      },
      {
        id: "estado_documento",
        accessorFn: (row) => {
          const documentos = row.documentos_produccion_academica || [];
          const documento = documentos[0];
          const estado = documento?.estado?.toLowerCase() || "sin_documento";

          // Orden personalizado
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
          const produccion = row.original;
          const documentos = produccion.documentos_produccion_academica || [];
          const documento = documentos[0];
          const estado = documento?.estado || "Sin documento";

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
          const produccion = row.original;
          const documentos = produccion.documentos_produccion_academica || [];
          const documento = documentos[0];

          return (
            <div className="flex flex-col gap-2">
              {documento ? (
                <>
                  <select
                    value={documento.estado || "pendiente"}
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
              ) : (
                <div className="text-gray-400 italic text-sm">
                  Sin documento adjunto
                </div>
              )}

              <button
                onClick={() => handleVerProduccion(produccion)}
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
    [ambitosProductos, cargandoAmbitos]
  );

  /* =======================
     Cálculo de estadísticas
  ======================= */
  const estadisticas = useMemo(() => {
    const total = producciones.length;
    const aprobados = producciones.filter(
      (p) =>
        p.documentos_produccion_academica?.[0]?.estado?.toLowerCase() ===
        "aprobado"
    ).length;
    const pendientes = producciones.filter(
      (p) =>
        p.documentos_produccion_academica?.[0]?.estado?.toLowerCase() ===
        "pendiente"
    ).length;
    const rechazados = producciones.filter(
      (p) =>
        p.documentos_produccion_academica?.[0]?.estado?.toLowerCase() ===
        "rechazado"
    ).length;

    return {
      total,
      aprobados,
      pendientes,
      rechazados,
    };
  }, [producciones]);

  /* =======================
     Componente de estado de carga
  ======================= */
  if (cargando) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-gradient-to-br from-blue-50/50 to-white rounded-2xl border border-gray-200 shadow-sm">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600 font-medium">
          Cargando producción académica...
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Obteniendo información del docente
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-gradient-to-br from-blue-50/50 to-white rounded-2xl border border-gray-200 shadow-sm">
        <div className="p-3 bg-red-100 rounded-full mb-4">
          <AlertCircle className="h-10 w-10 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Error al cargar producción académica
        </h3>
        <p className="text-gray-600 text-center mb-4 max-w-md">{error}</p>
        <button
          onClick={recargarDatos}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  /* =======================
     UI principal
  ======================= */
  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-blue-600" />
              Producción Académica
            </h1>
            <p className="text-gray-600 mt-1">
              Gestión de producción académica y publicaciones del docente
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
              <div className="text-2xl font-bold text-gray-900">
                {estadisticas.total}
              </div>
              <div className="text-sm text-gray-500">Total producción</div>
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
          </div>
        </div>
      </div>

      {/* INPUT DE BÚSQUEDA */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex-1 w-full">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar producciones por título, medio, producto académico, ámbito o estado..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 pl-11 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
            <div className="absolute left-3 top-3.5 text-gray-400">
              <Search className="w-5 h-5" />
            </div>
          </div>
        </div>

        {cargando && (
          <div className="flex items-center gap-2 text-blue-600">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <span className="text-sm">Cargando...</span>
          </div>
        )}

        {/* Contador de resultados */}
        <div className="text-sm text-gray-500 whitespace-nowrap">
          {produccionFiltrada.length} de {producciones.length} registros
        </div>
      </div>

      {/* Tabla de datos */}
      <DataTable2
        data={produccionFiltrada}
        columns={columns}
        showSearch={false}
      />

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
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-400"></div>
            <span className="text-sm text-gray-600">
              Sin documento - No se ha adjuntado documento
            </span>
          </div>
        </div>
      </div>

      {/* Modal de Detalles de la Producción */}
      <CustomDialog
        title={`Detalles de la Producción${
          produccionSeleccionada ? `: ${produccionSeleccionada.titulo}` : ""
        }`}
        open={openDetalle}
        onClose={handleCerrarDetalle}
        width="900px"
      >
        <div className="p-4">
          {produccionSeleccionada ? (
            <VerProduccion produccion={produccionSeleccionada} />
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">
                No se ha seleccionado ninguna producción académica
              </p>
            </div>
          )}
        </div>
      </CustomDialog>
    </div>
  );
};

export default VerProduccionAcademicaDocente;
