import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { ColumnDef } from "@tanstack/react-table";
import axiosInstance from "../../../utils/axiosConfig";
import {
  ClipboardCheck,
  CreditCard,
  Mail,
  PencilLine,
  Plus,
  User,
} from "lucide-react";
import { DataTable2 } from "../../../componentes/tablas/DataTable2";
import CustomDialog from "../../../componentes/CustomDialogForm";
import AsignarEvaluacionDocente from "./AsignarEvaluacionDocente";
import { formatearFecha } from "../../../utils/fechas";
import {
  nombreAsignador,
  type EvaluacionAsignada,
} from "../../../types/evaluacionDocente";

interface DocenteEvaluacion {
  id: number;
  nombre_completo: string;
  email: string;
  numero_identificacion: string;
  evaluacion: EvaluacionAsignada | null;
}

const ESTADO_ESTILOS: Record<string, string> = {
  Pendiente: "bg-amber-50 text-amber-700 border-amber-200",
  Aprobado: "bg-green-50 text-green-700 border-green-200",
  Rechazado: "bg-red-50 text-red-700 border-red-200",
};

const CACHE_KEY = "evaluacionesDocentes";

const ListarEvaluacionesDocentes = () => {
  const [docentes, setDocentes] = useState<DocenteEvaluacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [docenteSeleccionado, setDocenteSeleccionado] =
    useState<DocenteEvaluacion | null>(null);

  const fetchDatos = async () => {
    try {
      setLoading(true);

      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        setDocentes(JSON.parse(cached));
      }

      const response = await axiosInstance.get(
        import.meta.env.VITE_ENDPOINT_LISTAR_EVALUACIONES_DOCENTES
      );

      if (response.data?.data) {
        setDocentes(response.data.data);
        sessionStorage.setItem(CACHE_KEY, JSON.stringify(response.data.data));
      }
    } catch (error) {
      console.error("Error al obtener las evaluaciones docentes:", error);
      toast.error("Error al cargar las evaluaciones de los docentes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatos();
  }, []);

  const handleCerrarModal = () => setDocenteSeleccionado(null);

  const handleGuardado = () => {
    setDocenteSeleccionado(null);
    // El listado cacheado quedó obsoleto: se descarta antes de recargar.
    sessionStorage.removeItem(CACHE_KEY);
    fetchDatos();
  };

  const columns = useMemo<ColumnDef<DocenteEvaluacion>[]>(
    () => [
      {
        accessorKey: "nombre_completo",
        header: () => (
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span>Nombre completo</span>
          </div>
        ),
        cell: ({ row }) => {
          const nombre = row.getValue("nombre_completo") as string;
          return (
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">{nombre}</div>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "numero_identificacion",
        header: () => (
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            <span>Identificación</span>
          </div>
        ),
        cell: ({ row }) => {
          const identificacion = row.getValue("numero_identificacion") as string;
          return (
            <div>
              <p className="font-medium text-gray-900">
                {identificacion || "No especificado"}
              </p>
            </div>
          );
        },
      },
      {
        accessorKey: "email",
        header: () => (
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            <span>Correo electrónico</span>
          </div>
        ),
        cell: ({ row }) => (
          <div>
            <p className="font-medium">
              {row.getValue("email") || "No especificado"}
            </p>
          </div>
        ),
      },
      {
        id: "promedio",
        accessorFn: (fila) => fila.evaluacion?.promedio_evaluacion_docente ?? "",
        header: () => (
          <div className="flex items-center gap-2">
            <ClipboardCheck className="w-4 h-4" />
            <span>Evaluación</span>
          </div>
        ),
        cell: ({ row }) => {
          const evaluacion = row.original.evaluacion;
          if (!evaluacion) return <span className="text-gray-400">—</span>;

          return (
            <span className="inline-flex items-center justify-center min-w-[2.5rem] px-2.5 py-1 rounded-full text-xs font-bold bg-[#1e3a5f]/10 text-[#1e3a5f]">
              {evaluacion.promedio_evaluacion_docente}
            </span>
          );
        },
      },
      {
        id: "estado",
        accessorFn: (fila) => fila.evaluacion?.estado_evaluacion_docente ?? "",
        header: "Estado",
        cell: ({ row }) => {
          const estado = row.original.evaluacion?.estado_evaluacion_docente;
          if (!estado) return <span className="text-gray-400">—</span>;

          const estilo =
            ESTADO_ESTILOS[estado] ?? "bg-gray-100 text-gray-500 border-gray-200";

          return (
            <span
              className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold border ${estilo}`}
            >
              {estado}
            </span>
          );
        },
      },
      {
        id: "asignada_por",
        accessorFn: (fila) => nombreAsignador(fila.evaluacion?.asignada_por) ?? "",
        header: "Asignada por",
        cell: ({ row }) => {
          const evaluacion = row.original.evaluacion;
          const nombre = nombreAsignador(evaluacion?.asignada_por);
          const fecha = formatearFecha(evaluacion?.fecha_asignacion);

          if (!nombre && !fecha) return <span className="text-gray-400">—</span>;

          return (
            <div className="text-sm">
              <p className="font-medium text-gray-900">{nombre ?? "No especificado"}</p>
              {fecha && <p className="text-xs text-gray-500">{fecha}</p>}
            </div>
          );
        },
      },
      {
        id: "acciones",
        header: "Acciones",
        cell: ({ row }) => {
          const tieneEvaluacion = !!row.original.evaluacion;

          return (
            <button
              onClick={() => setDocenteSeleccionado(row.original)}
              className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors border ${
                tieneEvaluacion
                  ? "bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                  : "bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
              }`}
            >
              {tieneEvaluacion ? (
                <>
                  <PencilLine className="w-4 h-4" />
                  Editar
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Asignar
                </>
              )}
            </button>
          );
        },
      },
    ],
    []
  );

  return (
    <div className="flex flex-col gap-4 h-full w-full bg-white rounded-3xl p-4 sm:p-6 lg:p-8 min-h-screen">
      <div className="overflow-x-auto">
        <DataTable2
          data={docentes}
          columns={columns}
          loading={loading}
          searchPlaceholder="Buscar por nombre, identificación o email..."
        />
      </div>

      <CustomDialog
        title={
          docenteSeleccionado?.evaluacion
            ? `Editar evaluación — ${docenteSeleccionado.nombre_completo}`
            : `Asignar evaluación${
                docenteSeleccionado ? ` — ${docenteSeleccionado.nombre_completo}` : ""
              }`
        }
        open={!!docenteSeleccionado}
        onClose={handleCerrarModal}
        width="600px"
      >
        {docenteSeleccionado && (
          <AsignarEvaluacionDocente
            docenteId={docenteSeleccionado.id}
            nombreDocente={docenteSeleccionado.nombre_completo}
            evaluacionActual={docenteSeleccionado.evaluacion}
            onSuccess={handleGuardado}
            onCancel={handleCerrarModal}
          />
        )}
      </CustomDialog>
    </div>
  );
};

export default ListarEvaluacionesDocentes;
