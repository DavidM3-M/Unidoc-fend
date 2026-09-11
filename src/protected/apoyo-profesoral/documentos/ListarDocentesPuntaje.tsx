import type { FC } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { createPortal } from "react-dom";
import { ColumnDef } from "@tanstack/react-table";
import axiosInstance from "../../../utils/axiosConfig";
import {
  ArrowUpRight,
  Award,
  Clock,
  CreditCard,
  Mail,
  TrendingUp,
  User,
} from "lucide-react";
import { DataTable2 } from "../../../componentes/tablas/DataTable2";
import { EscalonPill, SemaforoAntiguedad } from "../../escalafon/piezas";
import type { EstadoAntiguedad } from "../../../types/escalafon";

/**
 * Fila del listado general de puntaje.
 *
 * `categoria_lograda` conserva el nombre pero ya no sale de un cálculo: es el escalón vigente
 * según el historial, otorgado por Apoyo Profesoral. Ningún puntaje cambia categorías solo.
 */
interface DocentePuntaje {
  id: number;
  nombre_completo: string;
  email: string;
  numero_identificacion: string;
  /** Solo la ventana del escalón actual: la producción anterior al ingreso no cuenta. */
  puntaje_total: number;
  /** El mismo puntaje contando la producción aún sin documento aprobado. Nunca menor. */
  puntaje_declarado: number;
  categoria_lograda: string | null;
  escalon_objetivo: string | null;
  elegible: boolean;
  estado_antiguedad: EstadoAntiguedad;
  razon: string;
}

const TOOLTIP_ANCHO = 240; // w-60
const TOOLTIP_MARGEN = 8;

// Mismo patrón de tooltip-vía-portal que TooltipMotivoRechazo (Estado.tsx)
// y TooltipRazonPuntaje (puntaje.tsx): se dibuja hacia <body> para no quedar
// recortado por el overflow del contenedor de la tabla.
const TooltipRazon = ({ razon }: { razon: string }) => {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  const mostrar = () => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const centro = rect.left + rect.width / 2;
    const left = Math.min(
      Math.max(centro, TOOLTIP_ANCHO / 2 + TOOLTIP_MARGEN),
      window.innerWidth - TOOLTIP_ANCHO / 2 - TOOLTIP_MARGEN
    );

    setPos({ top: rect.top, left });
  };

  const ocultar = () => setPos(null);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={(e) => e.stopPropagation()}
        onMouseEnter={mostrar}
        onMouseLeave={ocultar}
        onFocus={mostrar}
        onBlur={ocultar}
        className="flex items-center justify-center w-4 h-4 rounded-full bg-[#1e3a5f] text-white text-[10px] font-bold leading-none cursor-help"
        aria-label="Ver razón del puntaje"
      >
        i
      </button>

      {pos &&
        createPortal(
          <div
            role="tooltip"
            style={{ top: pos.top - 8, left: pos.left, width: TOOLTIP_ANCHO }}
            className="fixed z-[1000] -translate-x-1/2 -translate-y-full rounded-lg bg-[#1e3a5f] px-3 py-2 text-xs font-normal leading-snug text-white shadow-lg pointer-events-none"
          >
            {razon}
            <span className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-[#1e3a5f]" />
          </div>,
          document.body
        )}
    </>
  );
};

/**
 * Clave versionada: la respuesta cambió de forma con el escalafón v2 y un caché de la sesión
 * anterior pintaría filas sin semáforo ni objetivo hasta que llegue la petición.
 */
const CLAVE_CACHE = "docentesPuntajeV2";

const ListarDocentesPuntaje: FC<{ onVolver?: () => void }> = () => {
  const [docentesPuntaje, setDocentesPuntaje] = useState<DocentePuntaje[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDatos = async () => {
    try {
      setLoading(true);

      const cached = sessionStorage.getItem(CLAVE_CACHE);
      if (cached) {
        setDocentesPuntaje(JSON.parse(cached));
      }

      const response = await axiosInstance.get(
        import.meta.env.VITE_ENDPOINT_LISTAR_DOCENTES_PUNTAJE
      );

      if (response.data?.data) {
        setDocentesPuntaje(response.data.data);
        sessionStorage.setItem(CLAVE_CACHE, JSON.stringify(response.data.data));
      }
    } catch (error) {
      console.error("Error al obtener el puntaje de los docentes:", error);
      toast.error("Error al cargar el puntaje de los docentes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatos();
  }, []);

  const columns = useMemo<ColumnDef<DocentePuntaje>[]>(
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
                <div className="text-sm font-medium text-gray-900">
                  {nombre}
                </div>
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
        accessorKey: "puntaje_total",
        header: () => (
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            <span>Puntaje</span>
          </div>
        ),
        cell: ({ row }) => {
          const puntaje = row.getValue("puntaje_total") as number;
          // Lo declarado sin avalar es justamente la cola de revisión de esta pantalla.
          const sinAprobar = Math.max(0, (row.original.puntaje_declarado ?? 0) - puntaje);

          return (
            <div className="flex flex-col items-start gap-0.5">
              <span className="inline-flex items-center justify-center min-w-[2.5rem] px-2.5 py-1 rounded-full text-xs font-bold bg-[#1e3a5f]/10 text-[#1e3a5f]">
                {puntaje}
              </span>
              {sinAprobar > 0 && (
                <span className="text-xs text-amber-700">+{sinAprobar} sin aprobar</span>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "categoria_lograda",
        header: () => (
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4" />
            <span>Categoría</span>
          </div>
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5 flex-wrap">
            <EscalonPill escalon={row.original.categoria_lograda} />
            {/* El objetivo dice hacia dónde va el expediente; sin él la categoría sola no
                indica si queda algo por hacer. */}
            {row.original.escalon_objetivo && (
              <span className="inline-flex items-center gap-1 text-xs text-[#6b7a8d]">
                <ArrowUpRight className="w-3.5 h-3.5" />
                {row.original.escalon_objetivo}
              </span>
            )}
          </div>
        ),
      },
      {
        accessorKey: "estado_antiguedad",
        header: () => (
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>Antigüedad</span>
          </div>
        ),
        cell: ({ row }) => <SemaforoAntiguedad estado={row.original.estado_antiguedad} />,
      },
      {
        id: "elegible",
        accessorFn: (fila) => (fila.elegible ? "Elegible" : "No elegible"),
        header: "Elegible",
        cell: ({ row }) =>
          row.original.elegible ? (
            <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-green-50 text-green-700 border-green-200">
              Sí
            </span>
          ) : (
            <span className="text-xs text-[#9aa7b5]">No</span>
          ),
      },
      {
        accessorKey: "razon",
        header: "Razón",
        cell: ({ row }) => {
          const razon = row.getValue("razon") as string;
          if (!razon) return <span className="text-gray-400">—</span>;
          return (
            <div className="flex items-center gap-1.5">
              <p className="truncate max-w-[220px] text-sm text-gray-700">
                {razon}
              </p>
              <TooltipRazon razon={razon} />
            </div>
          );
        },
      },
    ],
    []
  );

  return (
    <div className="flex flex-col gap-4 h-full w-full bg-white rounded-3xl p-4 sm:p-6 lg:p-8 min-h-screen">
      {/* Esta pantalla es la vista general. Los ascensos se trabajan en la bandeja, que trae el
          semáforo, el detalle y los actos: duplicar las acciones aquí las desincronizaría. */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[rgba(30,58,95,0.09)] bg-[rgba(30,58,95,0.03)] px-4 py-3">
        <p className="text-sm text-[#2c3e50]">
          Vista general de puntajes. Para revisar y ejecutar ascensos usa la bandeja.
        </p>
        <Link
          to="/apoyo-profesoral/escalafon"
          className="inline-flex items-center gap-2 rounded-lg bg-[#1e3a5f] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#12243d]"
        >
          Ir a la bandeja de ascensos
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="overflow-x-auto">
        <DataTable2
          data={docentesPuntaje}
          columns={columns}
          loading={loading}
          searchPlaceholder="Buscar por nombre, identificación o email..."
          // Esta pantalla existe para comparar puntajes entre docentes; en tarjetas cada
          // puntaje queda aislado y deja de poder leerse como un ranking.
          vistaMovil="tabla"
        />
      </div>
    </div>
  );
};

export default ListarDocentesPuntaje;
