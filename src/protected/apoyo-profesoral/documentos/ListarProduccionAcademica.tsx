import type { FC } from "react";
import { useCallback } from "react";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  FileText,
  Users,
  Calendar,
  User,
  Eye
} from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable2 } from "../../../componentes/tablas/DataTable2";
import axiosInstance from "../../../utils/axiosConfig";
import { toast } from "react-toastify";
import CustomDialog from "../../../componentes/CustomDialogForm";
import VerProduccion from "../../ver/VerProduccion";

/* =======================
   Interfaces
======================= */
interface ProduccionAcademica {
  id_produccion_academica: number;
  user_id: number;
  ambito_divulgacion_id: number;
  producto_academico_id: number;
  titulo: string;
  numero_autores: number;
  medio_divulgacion: string;
  fecha_divulgacion: string;
  docente_nombre: string;
  primer_nombre: string;
  segundo_nombre?: string;
  primer_apellido: string;
  segundo_apellido?: string;
  email: string;
  created_at?: string;
}

/* =======================
   Componente
======================= */

const ListarProduccionAcademica: FC<{ onVolver?: () => void }> = () => {
  const [produccion, setProduccion] = useState<ProduccionAcademica[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDetalle, setOpenDetalle] = useState(false);
  const [produccionSeleccionada, setProduccionSeleccionada] = useState<ProduccionAcademica | null>(null);

  /* =======================
     Función para cargar datos
  ======================= */

  const cargarProduccion = useCallback(async () => {
    try {
      setCargando(true);
      setError(null);

      const response = await axiosInstance.get(
        "/apoyoProfesoral/mostrar-todos-produccion"
      );

      console.log("Respuesta producción:", response);

      if (response.data?.status === "success" && Array.isArray(response.data.data)) {
        const todasLasProducciones: ProduccionAcademica[] = [];

        response.data.data.forEach((docente: any) => {
          if (!docente.produccion_academica_usuario) return;

          const nombre = `${docente.primer_nombre} ${
            docente.segundo_nombre || ""
          } ${docente.primer_apellido} ${
            docente.segundo_apellido || ""
          }`.trim();

          docente.produccion_academica_usuario.forEach((produccionItem: any) => {
            todasLasProducciones.push({
              id_produccion_academica: produccionItem.id_produccion_academica,
              user_id: produccionItem.user_id,
              ambito_divulgacion_id: produccionItem.ambito_divulgacion_id,
              producto_academico_id: produccionItem.producto_academico_id,
              titulo: produccionItem.titulo,
              numero_autores: produccionItem.numero_autores,
              medio_divulgacion: produccionItem.medio_divulgacion,
              fecha_divulgacion: produccionItem.fecha_divulgacion,
              docente_nombre: nombre,
              primer_nombre: docente.primer_nombre,
              segundo_nombre: docente.segundo_nombre,
              primer_apellido: docente.primer_apellido,
              segundo_apellido: docente.segundo_apellido,
              email: docente.email,
              created_at: produccionItem.created_at,
            });
          });
        });

        setProduccion(todasLasProducciones);
      }

      console.log("Producción cargada:", produccion);
    } catch (error) {
      console.error("Error al obtener producción académica:", error);
      setError("No se pudieron cargar la producción académica. Intenta nuevamente.");
      toast.error("Error al cargar la producción académica");
    } finally {
      setCargando(false);
    }
  }, [produccion]);

  /* =======================
     Funciones auxiliares
  ======================= */

  const formatDate = (dateString: string | null) => {
    if (!dateString || dateString === "null") return "No especificada";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Handler para ver el detalle
  const handleVerProduccion = (produccionItem: ProduccionAcademica) => {
    setProduccionSeleccionada(produccionItem);
    setOpenDetalle(true);
  };

  // Handler para cerrar el modal
  const handleCerrarDetalle = () => {
    setOpenDetalle(false);
    setTimeout(() => setProduccionSeleccionada(null), 300);
  };

  /* =======================
     Efecto para cargar datos
  ======================= */

  useEffect(() => {
    cargarProduccion();
  }, [cargarProduccion]);

  /* =======================
     Columnas de la tabla
  ======================= */

  const columns = useMemo<ColumnDef<ProduccionAcademica>[]>(
    () => [
      {
        accessorKey: "docente_nombre",
        header: () => (
          <div className="flex items-center gap-2 text-[#1e3a5f] font-semibold">
            <User className="w-4 h-4" />
            <span>Docente</span>
          </div>
        ),
        cell: ({ row }) => {
          const produccionItem = row.original;
          return (
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 bg-[rgba(30,58,95,0.06)] rounded-full flex items-center justify-center border border-[rgba(30,58,95,0.1)]">
                <User className="h-4 w-4 text-[#1e3a5f]" />
              </div>
              <div>
                <div className="text-sm font-medium text-[#2c3e50]">
                  {produccionItem.docente_nombre}
                </div>
                <div className="text-xs text-[#6b7a8d]">
                  {produccionItem.email}
                </div>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "titulo",
        header: () => <span className="text-[#1e3a5f] font-semibold">Título</span>,
        cell: ({ row }) => (
          <div>
            <p className="font-medium text-[#2c3e50]">
              {row.getValue("titulo") || "No especificado"}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "medio_divulgacion",
        header: () => <span className="text-[#1e3a5f] font-semibold">Medio de divulgación</span>,
        cell: ({ row }) => (
          <div>
            <p className="font-medium text-[#2c3e50]">
              {row.getValue("medio_divulgacion") || "No especificado"}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "numero_autores",
        header: () => (
          <div className="flex items-center gap-2 text-[#1e3a5f] font-semibold">
            <Users className="w-4 h-4" />
            <span>Autores</span>
          </div>
        ),
        cell: ({ row }) => {
          const numAutores = row.getValue("numero_autores") as number;
          return (
            <div className="flex items-center gap-1 text-[#2c3e50]">
              <span className="font-medium">{numAutores}</span>
              <span className="text-sm text-[#6b7a8d]">autor(es)</span>
            </div>
          );
        },
      },
      {
        id: "fecha_divulgacion",
        header: () => (
          <div className="flex items-center gap-2 text-[#1e3a5f] font-semibold">
            <Calendar className="w-4 h-4" />
            <span>Fecha</span>
          </div>
        ),
        cell: ({ row }) => {
          const produccionItem = row.original;
          return (
            <div className="text-sm text-[#2c3e50]">
              {formatDate(produccionItem.fecha_divulgacion)}
            </div>
          );
        },
      },
      {
        id: "acciones",
        header: () => <span className="text-[#1e3a5f] font-semibold">Acciones</span>,
        cell: ({ row }) => {
          return (
            <div>
              <button
                onClick={() => handleVerProduccion(row.original)}
                className="flex items-center justify-center gap-2 bg-[#ffffff] hover:bg-[rgba(30,58,95,0.04)] text-[#1e3a5f] px-3 py-2 rounded-lg text-sm font-semibold transition-all border border-[rgba(30,58,95,0.15)] hover:border-[#1e3a5f] shadow-sm"
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

  /* =======================
     Estadísticas
  ======================= */

  const estadisticas = useMemo(() => {
    const total = produccion.length;
    const totalAutores = produccion.reduce((sum, item) => sum + item.numero_autores, 0);
    const publicacionesRecientes = produccion.filter(item => {
      const fecha = new Date(item.fecha_divulgacion);
      const hoy = new Date();
      const unAnoAtras = new Date(hoy.setFullYear(hoy.getFullYear() - 1));
      return fecha > unAnoAtras;
    }).length;

    return { total, totalAutores, publicacionesRecientes };
  }, [produccion]);

  /* =======================
     Estados de carga y error
  ======================= */

  if (cargando) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-[#ffffff] rounded-2xl border border-[rgba(30,58,95,0.15)] shadow-sm">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1e3a5f] mb-4"></div>
        <p className="text-[#1e3a5f] font-medium">Cargando producción académica...</p>
        <p className="text-sm text-[#6b7a8d] mt-1">
          Obteniendo información de todos los docentes
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-[#ffffff] rounded-2xl border border-[rgba(30,58,95,0.15)] shadow-sm">
        <div className="p-3 bg-[#d32f2f]/10 rounded-full mb-4">
          <AlertCircle className="h-10 w-10 text-[#d32f2f]" />
        </div>
        <h3 className="text-lg font-bold text-[#1e3a5f] mb-2">
          Error al cargar producción académica
        </h3>
        <p className="text-[#6b7a8d] text-center mb-4 max-w-md">{error}</p>
        <button
          onClick={cargarProduccion}
          className="px-4 py-2 bg-[#1e3a5f] hover:bg-[#162d4a] text-white rounded-lg font-medium transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  /* =======================
     Render principal
  ======================= */
  return (
    <div className="space-y-6 font-sans">
      {/* Header con estadísticas */}
      <div className="bg-[rgba(30,58,95,0.03)] rounded-xl p-6 border border-[rgba(30,58,95,0.09)]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#1e3a5f] flex items-center gap-3">
              <FileText className="w-8 h-8 text-[#1e3a5f]" />
              Producción Académica
            </h1>
            <p className="text-[#6b7a8d] mt-1">
              Gestión de producción académica de todos los docentes
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="bg-[#ffffff] rounded-lg p-3 shadow-sm border border-[rgba(30,58,95,0.15)]">
              <div className="text-2xl font-bold text-[#1e3a5f]">
                {estadisticas.total}
              </div>
              <div className="text-sm text-[#6b7a8d]">Total publicaciones</div>
            </div>
            <div className="bg-[#ffffff] rounded-lg p-3 shadow-sm border border-[rgba(30,58,95,0.15)]">
              <div className="text-2xl font-bold text-[#1e3a5f]">
                {estadisticas.totalAutores}
              </div>
              <div className="text-sm text-[#6b7a8d]">Total autores</div>
            </div>
            <div className="bg-[#ffffff] rounded-lg p-3 shadow-sm border border-[rgba(30,58,95,0.15)]">
              <div className="text-2xl font-bold text-[#1e3a5f]">
                {estadisticas.publicacionesRecientes}
              </div>
              <div className="text-sm text-[#6b7a8d]">Último año</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-[#ffffff] rounded-xl border border-[rgba(30,58,95,0.15)] shadow-sm overflow-hidden">
        <DataTable2
          data={produccion}
          columns={columns}
          loading={cargando}
          showSearch={true}
          searchPlaceholder="Buscar por docente, título, medio de divulgación..."
        />
      </div>

      {/* Leyenda informativa */}
      <div className="bg-[rgba(30,58,95,0.03)] rounded-lg p-4 border border-[rgba(30,58,95,0.09)]">
        <h3 className="text-sm font-semibold text-[#1e3a5f] mb-3">
          Información sobre la producción académica:
        </h3>
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#1e3a5f]"></div>
            <span className="text-sm text-[#6b7a8d]">
              Incluye artículos, libros, ponencias y otros productos académicos
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#6b7a8d]"></div>
            <span className="text-sm text-[#6b7a8d]">
              Los datos incluyen el número total de autores por publicación
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[rgba(30,58,95,0.5)]"></div>
            <span className="text-sm text-[#6b7a8d]">
              Se muestra el medio de divulgación y fecha de publicación
            </span>
          </div>
        </div>
      </div>

      {/* Modal de Detalles de la Producción Académica */}
      <CustomDialog
        title={`Detalles de la Producción Académica${
          produccionSeleccionada ? ` - ${produccionSeleccionada.docente_nombre}` : ""
        }`}
        open={openDetalle}
        onClose={handleCerrarDetalle}
        width="900px"
      >
        <div className="p-4">
          {produccionSeleccionada ? (
            <>
              {/* Contenido de la producción académica */}
              <VerProduccion produccion={produccionSeleccionada} />

              {/* Información adicional */}
              <div className="mt-6 pt-6 border-t border-[rgba(30,58,95,0.15)]">
                <h4 className="text-lg font-bold text-[#1e3a5f] mb-3">
                  Información del Docente
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-[#6b7a8d]">Docente</p>
                    <p className="font-medium text-[#2c3e50]">{produccionSeleccionada.docente_nombre}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#6b7a8d]">Email</p>
                    <p className="font-medium text-[#2c3e50]">{produccionSeleccionada.email}</p>
                  </div>
                  {produccionSeleccionada.created_at && (
                    <div>
                      <p className="text-sm text-[#6b7a8d]">Fecha de registro</p>
                      <p className="font-medium text-[#2c3e50]">
                        {formatDate(produccionSeleccionada.created_at)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-[#6b7a8d]">
                No se ha seleccionado ninguna producción académica
              </p>
            </div>
          )}
        </div>
      </CustomDialog>
    </div>
  );
};

export default ListarProduccionAcademica;