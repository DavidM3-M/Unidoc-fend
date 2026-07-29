import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import { createPortal } from "react-dom";
import { ColumnDef } from "@tanstack/react-table";
import axiosInstance from "../../../utils/axiosConfig";
import { Award, CreditCard, Mail, TrendingUp, User } from "lucide-react";
import { DataTable2 } from "../../../componentes/tablas/DataTable2";

interface DocentePuntaje {
  id: number;
  nombre_completo: string;
  email: string;
  numero_identificacion: string;
  puntaje_total: number;
  categoria_lograda: string;
  razon: string;
}

const CATEGORIA_ESTILOS: Record<string, string> = {
  Auxiliar: "bg-slate-50 text-slate-700 border-slate-200",
  Asistente: "bg-blue-50 text-blue-700 border-blue-200",
  Asociado: "bg-purple-50 text-purple-700 border-purple-200",
  Titular: "bg-amber-50 text-amber-700 border-amber-200",
  Ninguna: "bg-gray-100 text-gray-500 border-gray-200",
};

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

const ListarDocentesPuntaje = (_props: { onVolver?: () => void } = {}) => {
  const [docentesPuntaje, setDocentesPuntaje] = useState<DocentePuntaje[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDatos = async () => {
    try {
      setLoading(true);

      const cached = sessionStorage.getItem("docentesPuntaje");
      if (cached) {
        setDocentesPuntaje(JSON.parse(cached));
      }

      const response = await axiosInstance.get(
        import.meta.env.VITE_ENDPOINT_LISTAR_DOCENTES_PUNTAJE
      );

      if (response.data?.data) {
        setDocentesPuntaje(response.data.data);
        sessionStorage.setItem(
          "docentesPuntaje",
          JSON.stringify(response.data.data)
        );
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
          return (
            <span className="inline-flex items-center justify-center min-w-[2.5rem] px-2.5 py-1 rounded-full text-xs font-bold bg-[#1e3a5f]/10 text-[#1e3a5f]">
              {puntaje}
            </span>
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
        cell: ({ row }) => {
          const categoria = row.getValue("categoria_lograda") as string;
          const estilo =
            CATEGORIA_ESTILOS[categoria] ??
            "bg-gray-100 text-gray-500 border-gray-200";
          return (
            <span
              className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold border ${estilo}`}
            >
              {categoria}
            </span>
          );
        },
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
      <div className="overflow-x-auto">
        <DataTable2
          data={docentesPuntaje}
          columns={columns}
          loading={loading}
          searchPlaceholder="Buscar por nombre, identificación o email..."
        />
      </div>
    </div>
  );
};

export default ListarDocentesPuntaje;
