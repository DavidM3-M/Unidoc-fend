/* eslint-disable @typescript-eslint/no-explicit-any */
// componentes/idiomas/TablaIdiomas.tsx
import { useEffect, useMemo, useState } from "react";
import {
  User,
  Globe,
  GraduationCap,
  Building,
  AlertCircle,
  CheckCircle,
  Eye,
  Calendar,
} from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable2 } from "../../../componentes/tablas/DataTable2";
import axiosInstance from "../../../utils/axiosConfig";
import { toast } from "react-toastify";
import CustomDialog from "../../../componentes/CustomDialogForm";
import VerIdioma from "../../ver/VerIdioma";

interface Idioma {
  id_idioma: number;
  user_id: number;
  idioma: string;
  institucion_idioma: string;
  fecha_certificado: string;
  nivel: string;
  docente_nombre: string;
  primer_nombre: string;
  segundo_nombre?: string;
  primer_apellido: string;
  segundo_apellido?: string;
  email: string;
  created_at?: string;
}

const ListarIdiomasDocentes = (_props: { onVolver?: () => void } = {}) => {
  const [idiomas, setIdiomas] = useState<Idioma[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error] = useState<string | null>(null);
  const [openDetalle, setOpenDetalle] = useState(false);
  const [idiomaSeleccionado, setIdiomaSeleccionado] = useState<Idioma | null>(
    null
  );

  useEffect(() => {
    cargarIdiomas();
  }, []);

  const cargarIdiomas = async () => {
    try {
      setCargando(true);

      const response = await axiosInstance.get(
        import.meta.env.VITE_ENDPOINT_LISTAR_IDIOMAS_DOCENTE
      );

      if (response.data?.data) {
        const todosLosIdiomas: Idioma[] = [];

        response.data.data.forEach((docente: any) => {
          if (!docente.idiomas_usuario) return;

          const nombre = `${docente.primer_nombre} ${
            docente.segundo_nombre || ""
          } ${docente.primer_apellido} ${
            docente.segundo_apellido || ""
          }`.trim();

          docente.idiomas_usuario.forEach((idioma: any) => {
            todosLosIdiomas.push({
              id_idioma: idioma.id_idioma,
              user_id: idioma.user_id,
              idioma: idioma.idioma,
              institucion_idioma: idioma.institucion_idioma,
              fecha_certificado: idioma.fecha_certificado,
              nivel: idioma.nivel,
              docente_nombre: nombre,
              primer_nombre: docente.primer_nombre,
              segundo_nombre: docente.segundo_nombre,
              primer_apellido: docente.primer_apellido,
              segundo_apellido: docente.segundo_apellido,
              email: docente.email,
              created_at: idioma.created_at,
            });
          });
        });

        setIdiomas(todosLosIdiomas);
      }

      console.log("Idiomas cargados:", idiomas);
    } catch (error) {
      console.error("Error al obtener idiomas:", error);
      toast.error("Error al cargar los idiomas");
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

  // Mapear niveles de idioma a colores y textos
  const getNivelInfo = (nivel: string) => {
    const niveles: Record<
      string,
      { color: string; bg: string; label: string; border: string }
    > = {
      A1: {
        color: "text-red-800",
        bg: "bg-red-100",
        label: "A1 - Básico",
        border: "border-red-200",
      },
      A2: {
        color: "text-orange-800",
        bg: "bg-orange-100",
        label: "A2 - Básico",
        border: "border-orange-200",
      },
      B1: {
        color: "text-yellow-800",
        bg: "bg-yellow-100",
        label: "B1 - Intermedio",
        border: "border-yellow-200",
      },
      B2: {
        color: "text-blue-800",
        bg: "bg-blue-100",
        label: "B2 - Intermedio Alto",
        border: "border-blue-200",
      },
      C1: {
        color: "text-green-800",
        bg: "bg-green-100",
        label: "C1 - Avanzado",
        border: "border-green-200",
      },
      C2: {
        color: "text-purple-800",
        bg: "bg-purple-100",
        label: "C2 - Maestría",
        border: "border-purple-200",
      },
    };

    return (
      niveles[nivel] || {
        color: "text-[#2c3e50]",
        bg: "bg-[rgba(30,58,95,0.06)]",
        label: nivel,
        border: "border-[rgba(30,58,95,0.15)]",
      }
    );
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

  // Definir las columnas para DataTable2
  const columns = useMemo<ColumnDef<Idioma>[]>(
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
          const idioma = row.original;
          return (
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 bg-[rgba(30,58,95,0.06)] rounded-full flex items-center justify-center border border-[rgba(30,58,95,0.1)]">
                <User className="h-4 w-4 text-[#1e3a5f]" />
              </div>
              <div>
                <div className="text-sm font-medium text-[#2c3e50]">
                  {idioma.docente_nombre}
                </div>
                <div className="text-xs text-[#6b7a8d]">{idioma.email}</div>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "idioma",
        header: () => (
          <div className="flex items-center gap-2 text-[#1e3a5f] font-semibold">
            <Globe className="w-4 h-4" />
            <span>Idioma</span>
          </div>
        ),
        cell: ({ row }) => {
          const idioma = row.getValue("idioma") as string;
          return (
            <div>
              <p className="font-medium text-[#2c3e50]">
                {idioma || "No especificado"}
              </p>
            </div>
          );
        },
      },
      {
        accessorKey: "institucion_idioma",
        header: () => (
          <div className="flex items-center gap-2 text-[#1e3a5f] font-semibold">
            <Building className="w-4 h-4" />
            <span>Institución</span>
          </div>
        ),
        cell: ({ row }) => (
          <div>
            <p className="font-medium text-[#2c3e50]">
              {row.getValue("institucion_idioma") || "No especificada"}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "nivel",
        header: () => (
          <div className="flex items-center gap-2 text-[#1e3a5f] font-semibold">
            <GraduationCap className="w-4 h-4" />
            <span>Nivel</span>
          </div>
        ),
        cell: ({ row }) => {
          const idioma = row.original;
          const nivelInfo = getNivelInfo(idioma.nivel);
          return (
            <span
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${nivelInfo.bg} ${nivelInfo.color} ${nivelInfo.border}`}
            >
              <CheckCircle className="w-3 h-3" />
              {nivelInfo.label}
            </span>
          );
        },
      },
      {
        id: "fecha_certificado",
        header: () => (
          <div className="flex items-center gap-2 text-[#1e3a5f] font-semibold">
            <Calendar className="w-4 h-4" />
            <span>Certificado</span>
          </div>
        ),
        cell: ({ row }) => {
          const idioma = row.original;
          return (
            <div className="text-sm text-[#2c3e50]">
              {formatDate(idioma.fecha_certificado)}
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
                onClick={() => handleVerIdioma(row.original)}
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

  // Estadísticas
  const estadisticas = useMemo(() => {
    const total = idiomas.length;
    const idiomasUnicos = [...new Set(idiomas.map((i) => i.idioma))].length;
    const nivelAvanzado = idiomas.filter(
      (i) => i.nivel === "C1" || i.nivel === "C2"
    ).length;

    return { total, idiomasUnicos, nivelAvanzado };
  }, [idiomas]);

  if (cargando) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-[#ffffff] rounded-2xl border border-[rgba(30,58,95,0.15)] shadow-sm">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1e3a5f] mb-4"></div>
        <p className="text-[#1e3a5f] font-medium">Cargando idiomas...</p>
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
          Error al cargar idiomas
        </h3>
        <p className="text-[#6b7a8d] text-center mb-4 max-w-md">{error}</p>
        <button
          onClick={cargarIdiomas}
          className="px-4 py-2 bg-[#1e3a5f] hover:bg-[#162d4a] text-white rounded-lg font-medium transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Header con estadísticas */}
      <div className="bg-[rgba(30,58,95,0.03)] rounded-xl p-6 border border-[rgba(30,58,95,0.09)]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#1e3a5f] flex items-center gap-3">
              <Globe className="w-8 h-8 text-[#1e3a5f]" />
              Idiomas de Docentes
            </h1>
            <p className="text-[#6b7a8d] mt-1">
              Gestión de idiomas certificados de todos los docentes
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="bg-[#ffffff] rounded-lg p-3 shadow-sm border border-[rgba(30,58,95,0.15)]">
              <div className="text-2xl font-bold text-[#1e3a5f]">
                {estadisticas.total}
              </div>
              <div className="text-sm text-[#6b7a8d]">Total idiomas</div>
            </div>
            <div className="bg-[#ffffff] rounded-lg p-3 shadow-sm border border-[rgba(30,58,95,0.15)]">
              <div className="text-2xl font-bold text-[#1e3a5f]">
                {estadisticas.idiomasUnicos}
              </div>
              <div className="text-sm text-[#6b7a8d]">Idiomas diferentes</div>
            </div>
            <div className="bg-[#ffffff] rounded-lg p-3 shadow-sm border border-[rgba(30,58,95,0.15)]">
              <div className="text-2xl font-bold text-[#1e3a5f]">
                {estadisticas.nivelAvanzado}
              </div>
              <div className="text-sm text-[#6b7a8d]">Nivel C1/C2</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-[#ffffff] rounded-xl border border-[rgba(30,58,95,0.15)] shadow-sm overflow-hidden">
        <DataTable2
          data={idiomas}
          columns={columns}
          loading={cargando}
          showSearch={true}
          searchPlaceholder="Buscar por docente, idioma, institución..."
        />
      </div>

      {/* Leyenda de niveles */}
      <div className="bg-[rgba(30,58,95,0.03)] rounded-lg p-4 border border-[rgba(30,58,95,0.09)]">
        <h3 className="text-sm font-semibold text-[#1e3a5f] mb-3">
          Leyenda de niveles:
        </h3>
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-sm text-[#6b7a8d]">A1/A2 - Nivel básico</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span className="text-sm text-[#6b7a8d]">
              B1/B2 - Nivel intermedio
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-sm text-[#6b7a8d]">
              C1/C2 - Nivel avanzado/maestría
            </span>
          </div>
        </div>
      </div>

      {/* Modal de Detalles del Idioma */}
      <CustomDialog
        title={`Detalles del Idioma${
          idiomaSeleccionado ? ` - ${idiomaSeleccionado.docente_nombre}` : ""
        }`}
        open={openDetalle}
        onClose={handleCerrarDetalle}
      >
        <div className="p-4">
          {idiomaSeleccionado ? (
            <>
              {/* Contenido del idioma */}
              <VerIdioma idiomaData={idiomaSeleccionado} />

              {/* Información adicional */}
              <div className="mt-6 pt-6 border-t border-[rgba(30,58,95,0.15)]">
                <h4 className="text-lg font-bold text-[#1e3a5f] mb-3">
                  Información del Docente
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-[#6b7a8d]">Docente</p>
                    <p className="font-medium text-[#2c3e50]">
                      {idiomaSeleccionado.docente_nombre}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-[#6b7a8d]">Email</p>
                    <p className="font-medium text-[#2c3e50]">{idiomaSeleccionado.email}</p>
                  </div>
                  {idiomaSeleccionado.created_at && (
                    <div>
                      <p className="text-sm text-[#6b7a8d]">Fecha de registro</p>
                      <p className="font-medium text-[#2c3e50]">
                        {formatDate(idiomaSeleccionado.created_at)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-[#6b7a8d]">
                No se ha seleccionado ningún idioma
              </p>
            </div>
          )}
        </div>
      </CustomDialog>
    </div>
  );
};

export default ListarIdiomasDocentes;