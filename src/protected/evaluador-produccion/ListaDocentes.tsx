import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ColumnDef } from "@tanstack/react-table";
import { CreditCard, Eye, Mail, User } from "lucide-react";
import axiosInstance from "../../utils/axiosConfig";
import { DataTable2 } from "../../componentes/tablas/DataTable2";
import { DocenteResumen } from "../../types/evaluadorProduccion";

type DocenteConConteo = DocenteResumen & {
  total: number;
  pendientes: number;
  avaladas: number;
  rechazadas: number;
};

/**
 * Docentes con producción académica registrada.
 *
 * Es la entrada al expediente cuando el evaluador no viene siguiendo una producción concreta:
 * «¿cómo va Fulano?». Solo aparece quien tiene al menos una producción, porque un docente sin
 * ninguna no le da trabajo a este rol.
 */
const ListaDocentes = () => {
  const navigate = useNavigate();
  const [docentes, setDocentes] = useState<DocenteConConteo[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      try {
        const { data } = await axiosInstance.get("/evaluadorProduccion/docentes");
        setDocentes(data.data);
      } catch (error) {
        console.error("Error al cargar los docentes:", error);
        toast.error("No se pudieron cargar los docentes");
      } finally {
        setCargando(false);
      }
    };

    cargar();
  }, []);

  const columnas = useMemo<ColumnDef<DocenteConConteo>[]>(
    () => [
      {
        accessorKey: "nombre_completo",
        header: () => (
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span>Docente</span>
          </div>
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 grid place-items-center text-[10.5px] font-bold shrink-0">
              {row.original.nombre_completo
                .split(/\s+/)
                .slice(0, 2)
                .map((p) => p.charAt(0).toUpperCase())
                .join("")}
            </span>
            <span className="text-sm font-medium text-gray-900">
              {row.original.nombre_completo}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "numero_identificacion",
        header: () => (
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            <span>Identificación</span>
          </div>
        ),
        cell: ({ row }) => (
          <span className="tabular-nums">{row.original.numero_identificacion ?? "—"}</span>
        ),
      },
      {
        accessorKey: "email",
        header: () => (
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            <span>Correo</span>
          </div>
        ),
        cell: ({ row }) => <span>{row.original.email ?? "—"}</span>,
      },
      {
        id: "conteos",
        header: "Producciones",
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5 flex-wrap">
            {row.original.pendientes > 0 && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                {row.original.pendientes} pendiente
                {row.original.pendientes === 1 ? "" : "s"}
              </span>
            )}
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200">
              {row.original.avaladas} avalada{row.original.avaladas === 1 ? "" : "s"}
            </span>
            {row.original.rechazadas > 0 && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
                {row.original.rechazadas} rechazada
                {row.original.rechazadas === 1 ? "" : "s"}
              </span>
            )}
          </div>
        ),
      },
      {
        id: "acciones",
        header: "Acción",
        cell: ({ row }) => (
          <button
            type="button"
            onClick={() => navigate(`/evaluador-produccion/docentes/${row.original.id}`)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white hover:bg-gray-50 text-[#6b7a8d] border border-[rgba(30,58,95,0.14)] text-sm font-medium transition-colors"
          >
            <Eye className="w-4 h-4" /> Ver expediente
          </button>
        ),
      },
    ],
    [navigate]
  );

  return (
    <div className="flex flex-col gap-4 h-full w-full bg-white rounded-3xl p-4 sm:p-6 lg:p-8 min-h-screen border border-[rgba(30,58,95,0.09)]">
      <div className="overflow-x-auto">
        <DataTable2
          data={docentes}
          columns={columnas}
          loading={cargando}
          searchPlaceholder="Buscar docente por nombre, identificación o correo…"
        />
      </div>
    </div>
  );
};

export default ListaDocentes;
