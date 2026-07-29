import { useEffect, useMemo, useState } from "react";
import axiosInstance from "../../../utils/axiosConfig";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "react-toastify";
import axios from "axios";
import { Link } from "react-router-dom";
import { ButtonRegresar } from "../../../componentes/formularios/ButtonRegresar";
import { DataTable2 } from "../../../componentes/tablas/DataTable2";
import Modal from "../../../componentes/Modal";
import {
  User,
  Briefcase,
  DollarSign,
  Calendar,
  ShieldCheck,
  ArrowRight,
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";
import AgregarContratacionModal from "../../../componentes/modales/contrataciones/AgregarContratacionModal";
import DetalleContratacionModal from "../../../componentes/modales/contrataciones/DetalleContratacionModal";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface UsuarioContratacion {
  primer_nombre: string;
  primer_apellido: string;
  numero_identificacion: string;
}

interface Contratacion {
  id_contratacion: number;
  user_id: number;
  tipo_proceso?: string;
  tipo_vinculacion?: string;
  tipo_contrato: string;
  area: string;
  fecha_inicio: string;
  fecha_fin: string;
  valor_contrato: number;
  observaciones?: string;
  usuario_contratacion?: UsuarioContratacion;
}

// ─── Componente ───────────────────────────────────────────────────────────────

const VerContrataciones = () => {
  const [contrataciones, setContrataciones] = useState<Contratacion[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados modales
  const [modalDetalle, setModalDetalle] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [modalEliminar, setModalEliminar] = useState(false);
  const [contratacionSeleccionada, setContratacionSeleccionada] = useState<Contratacion | null>(null);
  const [contratoEliminacionId, setContratoEliminacionId] = useState<number | null>(null);
  const [motivoEliminacion, setMotivoEliminacion] = useState<"desvinculacion" | "no_vinculacion" | "otro">("desvinculacion");
  const [detalleMotivo, setDetalleMotivo] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchDatos = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/talentoHumano/obtener-contrataciones");
      const datosLimpios = response.data.contrataciones.map((item: any) => ({
        ...item,
        usuario: item.usuario || {
          nombre: "No especificado",
          apellido: "",
          numero_identificacion: "N/A",
        },
      }));
      setContrataciones(datosLimpios);
    } catch (error) {
      console.error("Error al obtener contrataciones:", error);
      toast.error("Error al cargar las contrataciones");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatos();
  }, []);

  const handleEliminar = async (id: number, motivo: string, detalle: string) => {
    try {
      setIsDeleting(true);
      await axiosInstance.delete(`/talentoHumano/eliminar-contratacion/${id}`, {
        data: {
          motivo_eliminacion: motivo,
          motivo: detalle || undefined,
        },
      });
      setContrataciones((prev) =>
        prev.filter((item) => item.id_contratacion !== id)
      );
      toast.success("Contratación eliminada correctamente");
      setModalEliminar(false);
      setContratoEliminacionId(null);
      setMotivoEliminacion("desvinculacion");
      setDetalleMotivo("");
    } catch (error) {
      console.error("Error al eliminar contratación:", error);
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Error al eliminar contratación");
      } else {
        toast.error("Error inesperado al eliminar");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleVerDetalle = (contratacion: Contratacion) => {
    setContratacionSeleccionada(contratacion);
    setModalDetalle(true);
  };

  const handleEditar = (contratacion: Contratacion) => {
    setContratacionSeleccionada(contratacion);
    setModalEditar(true);
  };

  const columns = useMemo<ColumnDef<Contratacion>[]>(
    () => [
      {
        id: "nombre",
        header: () => (
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span>Nombre</span>
          </div>
        ),
        accessorFn: (row) =>
          `${row.usuario_contratacion?.primer_nombre ?? ""} ${row.usuario_contratacion?.primer_apellido ?? ""}`.trim(),
        cell: ({ row }) => {
          const u = row.original.usuario_contratacion;
          const nombre = u ? `${u.primer_nombre} ${u.primer_apellido}` : "No especificado";
          return (
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-[var(--color-beige)] rounded-full flex items-center justify-center flex-shrink-0">
                <User className="h-4 w-4 text-[var(--color-navy)]" />
              </div>
              <span className="text-sm font-medium text-[var(--color-text)]">{nombre}</span>
            </div>
          );
        },
      },
      // Columna oculta en pantallas pequeñas/medianas para reducir el ancho total de la tabla.
      // Solo visible desde "lg" (≥1024px).
      {
        id: "identificacion",
        header: "Identificación",
        accessorFn: (row) => row.usuario_contratacion?.numero_identificacion || "N/A",
        cell: ({ row }) => (
          <span className="text-sm text-[var(--color-text)]">
            {row.original.usuario_contratacion?.numero_identificacion || "N/A"}
          </span>
        ),
        meta: { className: "hidden lg:table-cell w-28" },
      },
      // Columna oculta en pantallas pequeñas. Visible desde "md" (≥768px).
      {
        header: () => (
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            <span>Proceso</span>
          </div>
        ),
        accessorKey: "tipo_proceso",
        cell: ({ row }) => {
          const proceso = row.original.tipo_proceso;
          const colorMap: Record<string, string> = {
            Contratacion: 'bg-[var(--color-beige)] text-[var(--color-navy)]',
            Ascenso: 'bg-[var(--color-background)] text-[var(--color-warning)]',
            CambioCargo: 'bg-[var(--color-background)] text-[var(--color-warning)]',
          };
          const labelMap: Record<string, string> = {
            Contratacion: 'Contratación',
            Ascenso: 'Ascenso',
            CambioCargo: 'Cambio cargo',
          };
          return proceso ? (
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${colorMap[proceso] ?? 'bg-[var(--color-background)] text-[var(--color-text)]'}`}>
              {labelMap[proceso] ?? proceso}
            </span>
          ) : null;
        },
        meta: { className: "hidden md:table-cell w-28" },
      },
      {
        header: () => (
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            <span>Tipo</span>
          </div>
        ),
        accessorKey: "tipo_contrato",
        cell: ({ row }) => (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-sm font-medium bg-[var(--color-beige)] text-[var(--color-navy)] whitespace-nowrap">
            {row.original.tipo_contrato}
          </span>
        ),
        meta: { className: "w-24" },
      },
      {
        header: "Área",
        accessorKey: "area",
        cell: ({ row }) => (
          <p className="text-sm text-[var(--color-text)] max-w-[160px] truncate" title={row.original.area}>
            {row.original.area}
          </p>
        ),
        meta: { className: "hidden md:table-cell" },
      },
      {
        header: () => (
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            <span>Valor</span>
          </div>
        ),
        accessorKey: "valor_contrato",
        cell: ({ row }) => (
          <span className="text-sm font-medium text-[var(--color-text)] whitespace-nowrap">
            ${row.original.valor_contrato.toLocaleString()}
          </span>
        ),
        meta: { className: "w-28" },
      },
      // Columnas de Inicio/Fin combinadas visualmente en una sola para ahorrar espacio.
      // Si tu DataTable2 no soporta `meta.className` para ocultar columnas (ver nota más abajo),
      // esta combinación por sí sola ya reduce el ancho total en 1 columna completa.
      {
        header: () => (
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>Vigencia</span>
          </div>
        ),
        id: "vigencia",
        cell: ({ row }) => (
          <span className="text-sm text-[var(--color-text)] whitespace-nowrap">
            {new Date(row.original.fecha_inicio).toLocaleDateString()}
            {" - "}
            {new Date(row.original.fecha_fin).toLocaleDateString()}
          </span>
        ),
        meta: { className: "hidden sm:table-cell w-40" },
      },
      {
        header: "Acciones",
        id: "acciones",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleVerDetalle(row.original)}
              className="inline-flex items-center gap-1 bg-[var(--color-background)] hover:bg-[var(--color-beige)] text-[var(--color-navy)] px-2 py-1.5 rounded-md text-sm font-medium transition-colors border border-[var(--color-border)]"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleEditar(row.original)}
              className="inline-flex items-center gap-1 bg-[var(--color-background)] hover:bg-[var(--color-beige)] text-[var(--color-warning)] px-2 py-1.5 rounded-md text-sm font-medium transition-colors border border-[var(--color-border)]"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setContratoEliminacionId(row.original.id_contratacion);
                setModalEliminar(true);
              }}
              className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
              title="Eliminar contratación"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ),
        meta: { className: "w-32" },
      },
    ],
    []
  );

  return (
    <div className="flex flex-col gap-4 h-full w-full bg-[var(--color-surface)] rounded-3xl p-4 sm:p-6 lg:p-8 min-h-screen">

      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link to="/talento-humano">
            <ButtonRegresar />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-text)]">
              Contrataciones
            </h1>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">
              Gestión de contratos del personal docente
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Botón compacto Aspirantes Aprobados */}
          <Link to="/talento-humano/aspirantes-aprobados">
            <div className="group flex items-center gap-2 bg-[var(--color-navy)] hover:bg-[var(--color-navy-dark)] text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md">
              <ShieldCheck className="w-4 h-4" />
              <span>Aspirantes Aprobados</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform duration-200" />
            </div>
          </Link>

          {/* Contador */}
          <div className="flex items-center gap-2 bg-[var(--color-beige)] border border-[var(--color-border)] rounded-xl px-4 py-2">
            <Briefcase className="w-5 h-5 text-[var(--color-navy)]" />
            <span className="text-sm font-semibold text-[var(--color-navy)]">
              {contrataciones.length} contrato(s)
            </span>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <DataTable2
        data={contrataciones}
        columns={columns}
        loading={loading}
      />

      {/* Modal Ver Detalle */}
      {contratacionSeleccionada && (
        <DetalleContratacionModal
          idContratacion={contratacionSeleccionada.id_contratacion}
          isOpen={modalDetalle}
          onClose={() => {
            setModalDetalle(false);
            setContratacionSeleccionada(null);
          }}
        />
      )}

      {/* Modal Editar */}
      {contratacionSeleccionada && (
        <AgregarContratacionModal
          isOpen={modalEditar}
          onClose={() => {
            setModalEditar(false);
            setContratacionSeleccionada(null);
          }}
          editId={contratacionSeleccionada.id_contratacion}
          initialDatos={{
            tipo_contrato: contratacionSeleccionada.tipo_contrato,
            area: contratacionSeleccionada.area,
            fecha_inicio: contratacionSeleccionada.fecha_inicio,
            fecha_fin: contratacionSeleccionada.fecha_fin,
            valor_contrato: contratacionSeleccionada.valor_contrato,
            observaciones: contratacionSeleccionada.observaciones,
          }}
          onContratacionActualizada={() => {
            fetchDatos();
            setModalEditar(false);
            setContratacionSeleccionada(null);
          }}
        />
      )}

      <Modal
        open={modalEliminar}
        onClose={() => {
          setModalEliminar(false);
          setContratoEliminacionId(null);
          setMotivoEliminacion("desvinculacion");
          setDetalleMotivo("");
        }}
      >
        <div className="w-[320px] max-w-full">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100 text-red-600">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[var(--color-text)]">Eliminar contratación</h3>
              <p className="text-sm text-[var(--color-text-muted)]">Indica el motivo del despido o finalización.</p>
            </div>
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm text-[var(--color-text)]">
              <input
                type="radio"
                name="motivo-eliminacion"
                value="desvinculacion"
                checked={motivoEliminacion === "desvinculacion"}
                onChange={() => setMotivoEliminacion("desvinculacion")}
              />
              Se desvinculó del proceso o contrato
            </label>
            <label className="flex items-center gap-2 text-sm text-[var(--color-text)]">
              <input
                type="radio"
                name="motivo-eliminacion"
                value="no_vinculacion"
                checked={motivoEliminacion === "no_vinculacion"}
                onChange={() => setMotivoEliminacion("no_vinculacion")}
              />
              No se logró vincular al usuario
            </label>
            <label className="flex items-center gap-2 text-sm text-[var(--color-text)]">
              <input
                type="radio"
                name="motivo-eliminacion"
                value="otro"
                checked={motivoEliminacion === "otro"}
                onChange={() => setMotivoEliminacion("otro")}
              />
              Otro motivo
            </label>

            {motivoEliminacion === "otro" && (
              <textarea
                value={detalleMotivo}
                onChange={(e) => setDetalleMotivo(e.target.value)}
                rows={4}
                placeholder="Describe el motivo de la eliminación"
                className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-navy)]/20"
              />
            )}
          </div>

          <div className="mt-5 flex justify-end gap-2">
            <button
              className="rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm text-[var(--color-text)] hover:bg-[var(--color-background)]"
              onClick={() => {
                setModalEliminar(false);
                setContratoEliminacionId(null);
                setMotivoEliminacion("desvinculacion");
                setDetalleMotivo("");
              }}
            >
              Cancelar
            </button>
            <button
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
              disabled={isDeleting || !contratoEliminacionId || (motivoEliminacion === "otro" && detalleMotivo.trim().length < 5)}
              onClick={() => {
                if (!contratoEliminacionId) return;
                const motivo = motivoEliminacion === "otro" ? detalleMotivo.trim() : motivoEliminacion;
                handleEliminar(contratoEliminacionId, motivoEliminacion, motivo);
              }}
            >
              {isDeleting ? "Eliminando..." : "Confirmar eliminación"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default VerContrataciones;