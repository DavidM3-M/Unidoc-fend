import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { ColumnDef } from "@tanstack/react-table";
import { CalendarDays, Info, Lock, PlusCircle, Pencil } from "lucide-react";
import axiosInstance from "../../../utils/axiosConfig";
import { mensajeDeErrorApi } from "../../../utils/erroresApi";
import { fechaLarga } from "../../../utils/fechas";
import { DataTable2 } from "../../../componentes/tablas/DataTable2";
import CustomDialog from "../../../componentes/CustomDialogForm";
import { ButtonRegresar } from "../../../componentes/formularios/ButtonRegresar";
import PeriodoAscensoModal from "./PeriodoAscensoModal";
import type { PeriodoAscenso } from "../../../types/escalafon";

const ENDPOINT = import.meta.env.VITE_ENDPOINT_AP_ESCALAFON_PERIODOS;

/**
 * Periodos de ascenso.
 *
 * Un periodo es solo un nombre y una fecha de cierre: en esa fecha se congelan los requisitos de
 * todos los expedientes. **No hay fecha de apertura** a propósito — los docentes suben documentos
 * cuando quieran, no hay ventana de carga que abrir.
 *
 * Sin al menos un periodo cerrado no se puede ascender a nadie, así que esta pantalla es el
 * primer paso del flujo, aunque sea la más pequeña.
 */
const PeriodosAscenso = () => {
  const [periodos, setPeriodos] = useState<PeriodoAscenso[]>([]);
  const [cargando, setCargando] = useState(true);
  const [modal, setModal] = useState<{ abierto: boolean; periodo: PeriodoAscenso | null }>({
    abierto: false,
    periodo: null,
  });
  const [porCerrar, setPorCerrar] = useState<PeriodoAscenso | null>(null);
  const [cerrando, setCerrando] = useState(false);

  const fetchPeriodos = async () => {
    try {
      setCargando(true);
      const respuesta = await axiosInstance.get(ENDPOINT);
      setPeriodos(respuesta.data?.data ?? []);
    } catch (error) {
      console.error("Error al obtener los periodos de ascenso:", error);
      toast.error(mensajeDeErrorApi(error, "Error al cargar los periodos de ascenso"));
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    fetchPeriodos();
  }, []);

  /** Cierre más lejano entre los demás periodos: el nuevo tiene que ser posterior. */
  const cierreUltimo = (excepto?: number | null): string | null => {
    const fechas = periodos
      .filter((p) => p.id_periodo_ascenso !== excepto)
      .map((p) => p.fecha_cierre)
      .filter(Boolean)
      .sort();

    return fechas.length > 0 ? fechas[fechas.length - 1] : null;
  };

  const cerrarPeriodo = async () => {
    if (!porCerrar) return;

    try {
      setCerrando(true);
      await axiosInstance.post(`${ENDPOINT}/${porCerrar.id_periodo_ascenso}/cerrar`);
      toast.success(`«${porCerrar.nombre}» quedó cerrado.`);
      setPorCerrar(null);
      fetchPeriodos();
    } catch (error) {
      console.error("Error al cerrar el periodo:", error);
      toast.error(mensajeDeErrorApi(error, "No se pudo cerrar el periodo."), { autoClose: 6000 });
    } finally {
      setCerrando(false);
    }
  };

  const columnas = useMemo<ColumnDef<PeriodoAscenso>[]>(
    () => [
      {
        accessorKey: "nombre",
        header: "Periodo",
        cell: ({ row }) => (
          <span className="font-bold text-gray-900">{row.original.nombre}</span>
        ),
      },
      {
        accessorKey: "fecha_cierre",
        header: "Fecha de cierre",
        meta: { nowrap: true },
        cell: ({ row }) => (
          <span className="text-sm text-[#2c3e50]">{fechaLarga(row.original.fecha_cierre)}</span>
        ),
      },
      {
        id: "estado",
        accessorFn: (fila) => (fila.cerrado ? "Cerrado" : "Vigente"),
        header: "Estado",
        cell: ({ row }) =>
          row.original.cerrado ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
              <Lock size={12} /> Cerrado
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">
              <CalendarDays size={12} /> Vigente
            </span>
          ),
      },
      {
        id: "acciones",
        header: "Acciones",
        cell: ({ row }) => {
          const periodo = row.original;

          // Un periodo cerrado no se edita: su fecha es el corte con el que se evaluaron
          // ascensos reales. El backend responde 409, así que aquí ni se ofrece.
          if (periodo.cerrado) {
            return <span className="text-xs text-[#9aa7b5]">Sin acciones</span>;
          }

          return (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setModal({ abierto: true, periodo })}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[rgba(30,58,95,0.14)] bg-white px-3 py-2 text-sm font-medium text-[#6b7a8d] transition-colors hover:bg-gray-50"
              >
                <Pencil className="h-4 w-4" /> Editar
              </button>
              <button
                type="button"
                onClick={() => setPorCerrar(periodo)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#1e3a5f] bg-white px-3 py-2 text-sm font-semibold text-[#1e3a5f] transition-colors hover:bg-[rgba(30,58,95,0.06)]"
              >
                <Lock className="h-4 w-4" /> Cerrar ahora
              </button>
            </div>
          );
        },
      },
    ],
    []
  );

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link to="/apoyo-profesoral/escalafon">
          <ButtonRegresar />
        </Link>
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-[#1e3a5f]">
            <CalendarDays className="h-6 w-6 text-[#e8740e]" />
            Periodos de ascenso
          </h1>
          <p className="text-sm text-[#6b7a8d]">
            La fecha de cierre es el corte con el que se evalúa a todos los docentes
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-[rgba(30,58,95,0.09)] bg-white p-6 shadow-md">
        <div className="mb-4 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <h2 className="text-lg font-bold text-[#1e3a5f]">Periodos</h2>
            <p className="text-sm text-[#6b7a8d]">
              Solo se puede ascender contra un periodo ya cerrado.
            </p>
          </div>
          <button
            onClick={() => setModal({ abierto: true, periodo: null })}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#e8740e] px-6 py-3 font-semibold text-white shadow-md transition-colors hover:bg-[#c2600b] hover:shadow-lg"
          >
            <PlusCircle className="h-5 w-5" />
            Nuevo periodo
          </button>
        </div>

        <div className="mb-4 flex items-start gap-2 rounded-lg bg-[rgba(30,58,95,0.04)] p-3 text-xs text-[#2c3e50]">
          <Info className="h-4 w-4 flex-shrink-0 text-[#1e3a5f]" />
          <p>
            Mientras un periodo sigue abierto, la bandeja muestra una proyección: así quedaría el
            expediente al cierre. Los ascensos se ejecutan después, contra el periodo cerrado.
          </p>
        </div>

        <div className="overflow-x-auto">
          <DataTable2
            data={periodos}
            columns={columnas}
            loading={cargando}
            searchPlaceholder="Buscar periodo..."
          />
        </div>
      </div>

      {modal.abierto && (
        <CustomDialog
          title={modal.periodo ? "Editar periodo de ascenso" : "Nuevo periodo de ascenso"}
          open={modal.abierto}
          onClose={() => setModal({ abierto: false, periodo: null })}
          width="600px"
        >
          <PeriodoAscensoModal
            periodo={modal.periodo}
            fechaCierreUltimo={cierreUltimo(modal.periodo?.id_periodo_ascenso ?? null)}
            onSuccess={() => {
              setModal({ abierto: false, periodo: null });
              fetchPeriodos();
            }}
            onCancel={() => setModal({ abierto: false, periodo: null })}
          />
        </CustomDialog>
      )}

      {porCerrar && (
        <CustomDialog
          title="Cerrar el periodo anticipadamente"
          open={Boolean(porCerrar)}
          onClose={() => setPorCerrar(null)}
          width="520px"
        >
          <div className="flex flex-col gap-4 p-1">
            <p className="text-sm text-[#2c3e50]">
              «{porCerrar.nombre}» quedará cerrado desde ahora. Su fecha de cierre —
              {fechaLarga(porCerrar.fecha_cierre)}— <b>no cambia</b>: sigue siendo el corte con el
              que se evalúan los expedientes.
            </p>
            <p className="text-sm text-[#6b7a8d]">
              A partir de ese momento se pueden ejecutar los ascensos contra este periodo, y ya no
              se podrá editarlo.
            </p>
            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setPorCerrar(null)}
                disabled={cerrando}
                className="rounded-xl border border-[rgba(30,58,95,0.14)] px-6 py-3 text-sm font-semibold text-[#6b7a8d] transition-colors hover:bg-gray-50 disabled:opacity-60"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={cerrarPeriodo}
                disabled={cerrando}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1e3a5f] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#12243d] disabled:opacity-60"
              >
                <Lock className="h-4 w-4" />
                {cerrando ? "Cerrando..." : "Cerrar periodo"}
              </button>
            </div>
          </div>
        </CustomDialog>
      )}
    </div>
  );
};

export default PeriodosAscenso;
