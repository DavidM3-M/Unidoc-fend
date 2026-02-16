/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import { User, GraduationCap, Building, AlertCircle, Eye, CheckCircle, Clock, Calendar } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable2 } from "../../../componentes/tablas/DataTable2";
import axiosInstance from "../../../utils/axiosConfig";
import { toast } from "react-toastify";
import CustomDialog from "../../../componentes/CustomDialogForm";
import VerEstudio from "../../ver/VerEstudio";

interface Estudio {
  id_estudio: number;
  user_id: number;
  tipo_estudio: string;
  titulo_estudio: string;
  institucion: string;
  graduado: string;
  fecha_inicio: string;
  fecha_fin: string;
  fecha_graduacion: string | null;
  titulo_convalidado: string;
  fecha_convalidacion: string | null;
  resolucion_convalidacion: string | null;
  posible_fecha_graduacion: string | null;
  docente_nombre: string;
  primer_nombre: string;
  segundo_nombre?: string;
  primer_apellido: string;
  segundo_apellido?: string;
  email: string;
  created_at: string;
}

const ListarEstudiosDocentes = () => {
  const [estudios, setEstudios] = useState<Estudio[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error] = useState<string | null>(null);
  const [openDetalle, setOpenDetalle] = useState(false);
  const [estudioSeleccionado, setEstudioSeleccionado] =
    useState<Estudio | null>(null);

  useEffect(() => {
    cargarEstudios();
  }, []);

  const cargarEstudios = async () => {
    try {
      setCargando(true);

      const response = await axiosInstance.get(
        import.meta.env.VITE_ENDPOINT_LISTAR_ESTUDIO_DOCENTE
      );

      if (response.data?.data) {
        const todosLosEstudios: Estudio[] = [];

        response.data.data.forEach((docente: any) => {
          if (!docente.estudios_usuario) return;

          const nombre = `${docente.primer_nombre} ${
            docente.segundo_nombre || ""
          } ${docente.primer_apellido} ${
            docente.segundo_apellido || ""
          }`.trim();

          docente.estudios_usuario.forEach((estudio: any) => {
            todosLosEstudios.push({
              id_estudio: estudio.id_estudio,
              user_id: estudio.user_id,
              tipo_estudio: estudio.tipo_estudio,
              titulo_estudio: estudio.titulo_estudio,
              institucion: estudio.institucion,
              graduado: estudio.graduado,
              fecha_inicio: estudio.fecha_inicio,
              fecha_fin: estudio.fecha_fin,
              fecha_graduacion: estudio.fecha_graduacion,
              titulo_convalidado: estudio.titulo_convalidado,
              fecha_convalidacion: estudio.fecha_convalidacion,
              resolucion_convalidacion: estudio.resolucion_convalidacion,
              posible_fecha_graduacion: estudio.posible_fecha_graduacion,
              docente_nombre: nombre,
              primer_nombre: docente.primer_nombre,
              segundo_nombre: docente.segundo_nombre,
              primer_apellido: docente.primer_apellido,
              segundo_apellido: docente.segundo_apellido,
              email: docente.email,
              created_at: estudio.created_at,
            });
          });
        });

        setEstudios(todosLosEstudios);
      }

      console.log("Estudios cargados:", estudios);
    } catch (error) {
      console.error("Error al obtener estudios:", error);
      toast.error("Error al cargar los estudios");
    } finally {
      setCargando(false);
    }
  };

  // Función para formatear fechas
  const formatDate = (dateString: string | null) => {
    if (!dateString || dateString === "null") return "No especificada";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
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

  // Definir las columnas para DataTable2
  const columns = useMemo<ColumnDef<Estudio>[]>(
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
          const estudio = row.original;
          return (
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">
                  {estudio.docente_nombre}
                </div>
                <div className="text-xs text-gray-500">{estudio.email}</div>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "tipo_estudio",
        header: () => (
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4" />
            <span>Tipo de estudio</span>
          </div>
        ),
        cell: ({ row }) => {
          const tipo = row.getValue("tipo_estudio") as string;
          return (
            <div>
              <p className="font-medium text-gray-900">
                {tipo || "No especificado"}
              </p>
            </div>
          );
        },
      },
      {
        accessorKey: "institucion",
        header: () => (
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4" />
            <span>Institución</span>
          </div>
        ),
        cell: ({ row }) => (
          <div>
            <p className="font-medium">
              {row.getValue("institucion") || "No especificada"}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "titulo_estudio",
        header: "Título obtenido",
        cell: ({ row }) => (
          <div>
            <p className="font-medium text-gray-900">
              {row.getValue("titulo_estudio") || "No especificado"}
            </p>
          </div>
        ),
      },
      {
        id: "periodo",
        header: () => (
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>Periodo</span>
          </div>
        ),
        cell: ({ row }) => {
          const estudio = row.original;
          const inicio = formatDate(estudio.fecha_inicio);
          const fin = formatDate(estudio.fecha_fin);
          return (
            <div className="flex flex-col">
              <span className="text-sm text-gray-600">Desde: {inicio}</span>
              <span className="text-sm text-gray-600">Hasta: {fin}</span>
            </div>
          );
        },
      },
      {
        id: "graduado",
        header: "Estado académico",
        cell: ({ row }) => {
          const estudio = row.original;
          return (
            <div className="flex flex-col gap-1">
              <span
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                  estudio.graduado === "Si"
                    ? "bg-green-100 text-green-800 border-green-200"
                    : "bg-yellow-100 text-yellow-800 border-yellow-200"
                }`}
              >
                {estudio.graduado === "Si" ? (
                  <>
                    <CheckCircle className="w-3 h-3" />
                    Graduado
                  </>
                ) : (
                  <>
                    <Clock className="w-3 h-3" />
                    En proceso
                  </>
                )}
              </span>

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
                onClick={() => handleVerEstudio(row.original)}
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

  if (cargando) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-gradient-to-br from-blue-50/50 to-white rounded-2xl border border-gray-200 shadow-sm">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600 font-medium">Cargando estudios...</p>
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
          Error al cargar estudios
        </h3>
        <p className="text-gray-600 text-center mb-4 max-w-md">{error}</p>
        <button
          onClick={cargarEstudios}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}

      <DataTable2
        data={estudios}
        columns={columns}
        loading={cargando}
        showSearch={true}
        searchPlaceholder="Buscar por docente, título, institución..."
      />
      {/* Modal de Detalles del Estudio */}
      <CustomDialog
        title={`Detalles del Estudio ${
          estudioSeleccionado ? `- ${estudioSeleccionado.docente_nombre}` : ""
        }`}
        open={openDetalle}
        onClose={handleCerrarDetalle}
      >
        <div className="p-4">
          {estudioSeleccionado ? (
            <>
              {/* Contenido del estudio */}
              <VerEstudio estudio={estudioSeleccionado} />

              {/* Información adicional para apoyo profesoral */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">
                  Información Administrativa
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Fecha de registro</p>
                    <p className="font-medium">
                      {formatDate(estudioSeleccionado.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">
                No se ha seleccionado ningún estudio
              </p>
            </div>
          )}
        </div>
      </CustomDialog>
    </div>
  );
};

export default ListarEstudiosDocentes;
