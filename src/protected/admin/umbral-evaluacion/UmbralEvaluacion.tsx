import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { ColumnDef } from "@tanstack/react-table";
import { CalendarDays, Info, PlusCircle, SlidersHorizontal, User } from "lucide-react";
import axiosInstance from "../../../utils/axiosConfig";
import { formatearFecha } from "../../../utils/fechas";
import { DataTable2 } from "../../../componentes/tablas/DataTable2";
import CustomDialog from "../../../componentes/CustomDialogForm";
import { ButtonRegresar } from "../../../componentes/formularios/ButtonRegresar";
import RegistrarUmbralModal from "./RegistrarUmbralModal";
import {
  nombreCreador,
  type UmbralEvaluacion as Umbral,
} from "../../../types/umbralEvaluacion";

const UmbralEvaluacion = () => {
  const [vigente, setVigente] = useState<Umbral | null>(null);
  const [historico, setHistorico] = useState<Umbral[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);

  const fetchDatos = async () => {
    try {
      setLoading(true);

      const [respVigente, respHistorico] = await Promise.all([
        axiosInstance.get(import.meta.env.VITE_ENDPOINT_UMBRAL_EVALUACION_VIGENTE),
        axiosInstance.get(import.meta.env.VITE_ENDPOINT_UMBRAL_EVALUACION_HISTORICO),
      ]);

      setVigente(respVigente.data?.data ?? null);
      setHistorico(respHistorico.data?.data ?? []);
    } catch (error) {
      console.error("Error al obtener el umbral de evaluación:", error);
      toast.error("Error al cargar el umbral de evaluación");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatos();
  }, []);

  const handleRegistrado = () => {
    setModalAbierto(false);
    fetchDatos();
  };

  const columns = useMemo<ColumnDef<Umbral>[]>(
    () => [
      {
        accessorKey: "valor_minimo",
        header: () => (
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4" />
            <span>Umbral</span>
          </div>
        ),
        cell: ({ row }) => (
          <span className="inline-flex items-center justify-center min-w-[2.5rem] px-2.5 py-1 rounded-full text-xs font-bold bg-[#1e3a5f]/10 text-[#1e3a5f]">
            {row.original.valor_minimo}
          </span>
        ),
      },
      {
        id: "vigencia_desde",
        accessorFn: (fila) => formatearFecha(fila.vigencia_desde) ?? "",
        header: () => (
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4" />
            <span>Rige desde</span>
          </div>
        ),
        cell: ({ row }) => (
          <span className="font-medium text-gray-900">
            {formatearFecha(row.original.vigencia_desde) ?? "—"}
          </span>
        ),
      },
      {
        id: "vigencia_hasta",
        accessorFn: (fila) => formatearFecha(fila.vigencia_hasta) ?? "Vigente",
        header: "Rige hasta",
        cell: ({ row }) => {
          const hasta = formatearFecha(row.original.vigencia_hasta);

          // Sin cierre = es el umbral que se está aplicando hoy.
          if (!hasta) {
            return (
              <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold border bg-green-50 text-green-700 border-green-200">
                Vigente
              </span>
            );
          }

          return <span className="text-gray-700">{hasta}</span>;
        },
      },
      {
        id: "creado_por",
        accessorFn: (fila) => nombreCreador(fila.creado_por) ?? "Sistema",
        header: () => (
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span>Registrado por</span>
          </div>
        ),
        cell: ({ row }) => {
          const nombre = nombreCreador(row.original.creado_por);

          return (
            <span className={nombre ? "font-medium text-gray-900" : "text-gray-500 italic"}>
              {nombre ?? "Sistema"}
            </span>
          );
        },
      },
      {
        accessorKey: "observaciones",
        header: "Observaciones",
        cell: ({ row }) => {
          const observaciones = row.original.observaciones;
          if (!observaciones) return <span className="text-gray-400">—</span>;

          return (
            <p className="max-w-[320px] whitespace-normal text-sm text-gray-700">
              {observaciones}
            </p>
          );
        },
      },
    ],
    []
  );

  const creadorVigente = nombreCreador(vigente?.creado_por);
  const desdeVigente = formatearFecha(vigente?.vigencia_desde);

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto">
      <div className="flex items-center gap-4">
        <Link to="/dashboard">
          <ButtonRegresar />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#1e3a5f]">
            Umbral de evaluación docente
          </h1>
          <p className="text-sm text-[#6b7a8d]">
            Nota mínima de evaluación exigida para ascender de categoría
          </p>
        </div>
      </div>

      {/* Tarjeta del umbral vigente */}
      <div className="bg-white border border-[rgba(30,58,95,0.09)] rounded-xl shadow-md p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-center justify-center rounded-xl bg-[#f3ede1] px-8 py-4">
              <span className="text-4xl font-bold text-[#1e3a5f]">
                {loading ? "—" : vigente?.valor_minimo ?? "—"}
              </span>
              <span className="text-xs font-semibold uppercase tracking-wide text-[#6b7a8d]">
                Umbral vigente
              </span>
            </div>

            <div className="flex flex-col gap-1 text-sm">
              {desdeVigente && (
                <p className="text-[#2c3e50]">
                  <span className="font-semibold">Rige desde:</span> {desdeVigente}
                </p>
              )}
              <p className="text-[#2c3e50]">
                <span className="font-semibold">Registrado por:</span>{" "}
                {creadorVigente ?? "Sistema"}
              </p>
              {vigente?.observaciones && (
                <p className="max-w-md text-[#6b7a8d]">{vigente.observaciones}</p>
              )}
            </div>
          </div>

          <button
            onClick={() => setModalAbierto(true)}
            className="inline-flex items-center justify-center gap-2 bg-[#e8740e] hover:bg-[#c2600b] text-white px-6 py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transition-colors"
          >
            <PlusCircle className="h-5 w-5" />
            Registrar nuevo umbral
          </button>
        </div>

        {vigente?.por_defecto && (
          <div className="mt-5 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
            <Info className="h-4 w-4 flex-shrink-0" />
            <p>
              Todavía no hay ningún umbral registrado: el sistema está aplicando el
              valor por defecto. Registra uno para dejar constancia de quién lo
              definió y desde cuándo rige.
            </p>
          </div>
        )}
      </div>

      {/* Histórico */}
      <div className="bg-white border border-[rgba(30,58,95,0.09)] rounded-xl shadow-md p-6">
        <div className="mb-4">
          <h2 className="text-lg font-bold text-[#1e3a5f]">Histórico de umbrales</h2>
          <p className="text-sm text-[#6b7a8d]">
            Los umbrales no se editan ni se borran: cada cambio cierra el anterior.
          </p>
        </div>

        <div className="overflow-x-auto">
          <DataTable2
            data={historico}
            columns={columns}
            loading={loading}
            searchPlaceholder="Buscar por valor, fecha o responsable..."
          />
        </div>
      </div>

      <CustomDialog
        title="Registrar nuevo umbral"
        open={modalAbierto}
        onClose={() => setModalAbierto(false)}
        width="600px"
      >
        <RegistrarUmbralModal
          valorVigente={vigente?.valor_minimo}
          onSuccess={handleRegistrado}
          onCancel={() => setModalAbierto(false)}
        />
      </CustomDialog>
    </div>
  );
};

export default UmbralEvaluacion;
