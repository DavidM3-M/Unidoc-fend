/* eslint-disable @typescript-eslint/no-explicit-any */
// componentes/experiencia/TablaExperiencia.tsx
import { useEffect, useMemo, useState } from "react";
import {
  User,
  Briefcase,
  Calendar,
  Building,
  AlertCircle,
  Award,
  Clock3,
  Eye,
} from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable2 } from "../../../componentes/tablas/DataTable2";
import axiosInstance from "../../../utils/axiosConfig";
import { toast } from "react-toastify";
import CustomDialog from "../../../componentes/CustomDialogForm";
import VerExperiencia from "../../ver/VerExperiencia"; 

interface Experiencia {
  id_experiencia: number;
  user_id: number;
  tipo_experiencia: string;
  institucion_experiencia: string;
  cargo: string;
  fecha_inicio: string;
  fecha_finalizacion: string | null;
  trabajo_actual: string;
  intensidad_horaria: number;
  funciones: string;
  fecha_expedicion_certificado: string;
  docente_nombre: string;
  primer_nombre: string;
  segundo_nombre?: string;
  primer_apellido: string;
  segundo_apellido?: string;
  email: string;
  created_at?: string;
}

const ListarExperienciaDocentes = () => {
  const [experiencias, setExperiencias] = useState<Experiencia[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDetalle, setOpenDetalle] = useState(false);
  const [experienciaSeleccionada, setExperienciaSeleccionada] = useState<Experiencia | null>(null);

  useEffect(() => {
    cargarExperiencias();
  }, []);

  const cargarExperiencias = async () => {
    try {
      setCargando(true);
      setError(null);

      const response = await axiosInstance.get(
        "/apoyoProfesoral/mostrar-todas-experiencia"
      );

      console.log("Respuesta experiencia:", response.data);

      if (response.data?.status === "success" && Array.isArray(response.data.data)) {
        const todasLasExperiencias: Experiencia[] = [];

        response.data.data.forEach((docente: any) => {
          if (!docente.experiencias_usuario) return;

          const nombre = `${docente.primer_nombre} ${
            docente.segundo_nombre || ""
          } ${docente.primer_apellido} ${
            docente.segundo_apellido || ""
          }`.trim();

          docente.experiencias_usuario.forEach((experiencia: any) => {
            todasLasExperiencias.push({
              id_experiencia: experiencia.id_experiencia,
              user_id: experiencia.user_id,
              tipo_experiencia: experiencia.tipo_experiencia,
              institucion_experiencia: experiencia.institucion_experiencia,
              cargo: experiencia.cargo,
              fecha_inicio: experiencia.fecha_inicio,
              fecha_finalizacion: experiencia.fecha_finalizacion,
              trabajo_actual: experiencia.trabajo_actual,
              intensidad_horaria: experiencia.intensidad_horaria || 0,
              funciones: experiencia.funciones || "No especificado",
              fecha_expedicion_certificado: experiencia.fecha_expedicion_certificado,
              docente_nombre: nombre,
              primer_nombre: docente.primer_nombre,
              segundo_nombre: docente.segundo_nombre,
              primer_apellido: docente.primer_apellido,
              segundo_apellido: docente.segundo_apellido,
              email: docente.email,
              created_at: experiencia.created_at,
            });
          });
        });

        setExperiencias(todasLasExperiencias);
      }
      
    } catch (error) {
      console.error("Error al obtener experiencias:", error);
      setError("No se pudieron cargar las experiencias. Intenta nuevamente.");
      toast.error("Error al cargar las experiencias");
    } finally {
      setCargando(false);
    }
  };

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
  const handleVerExperiencia = (experiencia: Experiencia) => {
    setExperienciaSeleccionada(experiencia);
    setOpenDetalle(true);
  };

  // Handler para cerrar el modal
  const handleCerrarDetalle = () => {
    setOpenDetalle(false);
    setTimeout(() => setExperienciaSeleccionada(null), 300);
  };

  const getTipoColor = (tipo: string) => {
    if (!tipo) return "bg-gray-100 text-gray-800 border-gray-200";
    
    const tipoLower = tipo.toLowerCase();
    if (tipoLower.includes("académica") || tipoLower.includes("academica")) {
      return "bg-purple-100 text-purple-800 border-purple-200";
    } else if (tipoLower.includes("dirección") || tipoLower.includes("direccion")) {
      return "bg-blue-100 text-blue-800 border-blue-200";
    } else if (tipoLower.includes("investigación") || tipoLower.includes("investigacion")) {
      return "bg-green-100 text-green-800 border-green-200";
    } else if (tipoLower.includes("laboral") || tipoLower.includes("profesional")) {
      return "bg-amber-100 text-amber-800 border-amber-200";
    } else if (tipoLower.includes("docencia") || tipoLower.includes("enseñanza")) {
      return "bg-indigo-100 text-indigo-800 border-indigo-200";
    } else {
      return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const columns = useMemo<ColumnDef<Experiencia>[]>(
    () => [
      {
        accessorKey: "docente_nombre",
        header: () => (
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span>Docente</span>
          </div>
        ),
        cell: ({ row }) => {
          const experiencia = row.original;
          return (
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">
                  {experiencia.docente_nombre}
                </div>
                <div className="text-xs text-gray-500">{experiencia.email}</div>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "tipo_experiencia",
        header: () => (
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            <span>Tipo</span>
          </div>
        ),
        cell: ({ row }) => {
          const experiencia = row.original;
          return (
            <span
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getTipoColor(
                experiencia.tipo_experiencia
              )}`}
            >
              {experiencia.tipo_experiencia || "Sin tipo"}
            </span>
          );
        },
      },
      {
        accessorKey: "cargo",
        header: () => (
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4" />
            <span>Cargo</span>
          </div>
        ),
        cell: ({ row }) => (
          <div>
            <p className="font-medium text-gray-900">
              {row.getValue("cargo") || "Sin cargo"}
            </p>
          </div>
        ),
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
              {row.getValue("institucion_experiencia") || "Sin institución"}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "intensidad_horaria",
        header: () => (
          <div className="flex items-center gap-2">
            <Clock3 className="w-4 h-4" />
            <span>Horas</span>
          </div>
        ),
        cell: ({ row }) => {
          const horas = row.getValue("intensidad_horaria") as number;
          return (
            <div className="flex items-center gap-1">
              <span className="font-medium">{horas || 0}</span>
              <span className="text-sm text-gray-500">horas</span>
            </div>
          );
        },
      },
      {
        id: "periodo",
        header: () => (
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>Período</span>
          </div>
        ),
        cell: ({ row }) => {
          const experiencia = row.original;
          const inicio = formatDate(experiencia.fecha_inicio);
          const fin = experiencia.trabajo_actual === "Sí" || experiencia.fecha_finalizacion === null
            ? "Actualidad"
            : formatDate(experiencia.fecha_finalizacion);
            
          
          return (
            <div className="flex flex-col">
              <span className="text-sm text-gray-600">Desde: {inicio}</span>
              <span className="text-sm text-gray-600">Hasta: {fin}</span>
            </div>
          );
        },
      },
      {
        id: "acciones",
        header: "Acciones",
        cell: ({ row }) => {
          return (
            <div>
              <button
                onClick={() => handleVerExperiencia(row.original)}
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

  const estadisticas = useMemo(() => {
    const total = experiencias.length;
    const docentesUnicos = Array.from(new Set(experiencias.map(e => e.user_id))).length;
    const horasTotales = experiencias.reduce((sum, exp) => sum + (exp.intensidad_horaria || 0), 0);
    
    const tiposExperiencia = experiencias.reduce((acc, exp) => {
      const tipo = exp.tipo_experiencia || "Sin tipo";
      acc[tipo] = (acc[tipo] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const tipoMasComun = Object.entries(tiposExperiencia).sort((a, b) => b[1] - a[1])[0];
    const experienciasTipoMasComun = tipoMasComun ? tipoMasComun[1] : 0;
    const tipoMasComunNombre = tipoMasComun ? tipoMasComun[0] : "Sin datos";

    return { total, docentesUnicos, horasTotales, experienciasTipoMasComun, tipoMasComunNombre };
  }, [experiencias]);

  if (cargando) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-gradient-to-br from-blue-50/50 to-white rounded-2xl border border-gray-200 shadow-sm">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600 font-medium">Cargando experiencias...</p>
        <p className="text-sm text-gray-500 mt-1">
          Obteniendo información de todos los docentes
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
          Error al cargar experiencias
        </h3>
        <p className="text-gray-600 text-center mb-4 max-w-md">{error}</p>
        <button
          onClick={cargarExperiencias}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

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
              Gestión de experiencias profesionales de todos los docentes
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
                {estadisticas.docentesUnicos}
              </div>
              <div className="text-sm text-green-600">Docentes</div>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm border border-purple-200 col-span-2">
              <div className="text-2xl font-semibold text-purple-700">
                {estadisticas.tipoMasComunNombre}
              </div>
              <div className="text-sm text-purple-600">Tipo más común</div>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm border border-amber-200">
              <div className="text-2xl font-bold text-amber-700">
                {estadisticas.horasTotales}
              </div>
              <div className="text-sm text-amber-600">Horas totales</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <DataTable2
          data={experiencias}
          columns={columns}
          loading={cargando}
          showSearch={true}
          searchPlaceholder="Buscar por docente, institución, cargo, tipo..."
        />
      </div>



      {/* Modal de Detalles de la Experiencia */}
      <CustomDialog
        title={`Detalles de la Experiencia${
          experienciaSeleccionada ? ` - ${experienciaSeleccionada.docente_nombre}` : ""
        }`}
        open={openDetalle}
        onClose={handleCerrarDetalle}
      >
        <div className="p-4">
          {experienciaSeleccionada ? (
            <>
              {/* Contenido de la experiencia */}
              <VerExperiencia experiencia={experienciaSeleccionada} />

              {/* Información adicional */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">
                  Información del Docente
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Docente</p>
                    <p className="font-medium">{experienciaSeleccionada.docente_nombre}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{experienciaSeleccionada.email}</p>
                  </div>
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

export default ListarExperienciaDocentes;