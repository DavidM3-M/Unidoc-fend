import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { ColumnDef } from "@tanstack/react-table";
import axiosInstance from "../../../utils/axiosConfig";
import {
  User,
  CreditCard,
  FileText,
  CheckCircle,
  ShieldCheck,
  X,
  Mail,
  Calendar,
  ClipboardList,
  Filter,
  AlertTriangle,
  Briefcase,
  Plus,
} from "lucide-react";
import { DataTable2 } from "../../../componentes/tablas/DataTable2";
import { Link } from "react-router-dom";
import { ButtonRegresar } from "../../../componentes/formularios/ButtonRegresar";
import DetalleContratacionModal from "../../../componentes/modales/contrataciones/DetalleContratacionModal";
import AgregarContratacionModal from "../../../componentes/modales/contrataciones/AgregarContratacionModal";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface UsuarioPostulacion {
  id: number;
  primer_nombre: string;
  segundo_nombre?: string;
  primer_apellido: string;
  segundo_apellido?: string;
  numero_identificacion: string;
  email?: string;
  aval_talento_humano?: boolean;
  aval_coordinador?: boolean;
  aval_vicerrectoria?: boolean;
  aval_rectoria?: boolean;
}

interface Postulacion {
  id_postulacion: number;
  convocatoria_id: number;
  user_id: number;
  estado_postulacion: string;
  fecha_postulacion?: string;
  created_at: string;
  usuario_postulacion: UsuarioPostulacion;
  convocatoria_postulacion: {
    nombre_convocatoria: string;
    estado_convocatoria: string;
  };
}

interface Contratacion {
  id_contratacion: number;
  user_id: number;
  id_convocatoria?: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const tieneLosCuatroAvales = (u: UsuarioPostulacion): boolean =>
  u.aval_talento_humano === true &&
  u.aval_coordinador === true &&
  u.aval_vicerrectoria === true &&
  u.aval_rectoria === true;

// ─── Badge Docente Activo ─────────────────────────────────────────────────────

const DocenteActivoBadge = ({ count }: { count: number }) => (
  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-300 text-[10px] font-bold uppercase">
    <Briefcase size={9} className="stroke-[3px]" />
    Docente · {count} contrato{count > 1 ? "s" : ""}
  </span>
);

// ─── Modal de detalle del aspirante ──────────────────────────────────────────

const DetalleModal = ({
  postulacion,
  onClose,
}: {
  postulacion: Postulacion;
  onClose: () => void;
}) => {
  const u = postulacion.usuario_postulacion;
  const c = postulacion.convocatoria_postulacion;

  const avales = [
    { key: "aval_talento_humano", label: "Talento Humano" },
    { key: "aval_coordinador", label: "Coordinación" },
    { key: "aval_vicerrectoria", label: "Vicerrectoría" },
    { key: "aval_rectoria", label: "Rectoría" },
  ];

  return (
    <div className="modal-overlay fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="modal-content bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">Detalle del Aspirante</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <User className="w-4 h-4" />
              Información del Postulante
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-500">Nombre completo</p>
                <p className="font-medium text-gray-900">
                  {u.primer_nombre} {u.segundo_nombre ?? ""}{" "}
                  {u.primer_apellido} {u.segundo_apellido ?? ""}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Identificación</p>
                <p className="font-medium text-gray-900">{u.numero_identificacion}</p>
              </div>
              {u.email && (
                <div className="sm:col-span-2">
                  <p className="text-gray-500 flex items-center gap-1">
                    <Mail className="w-3 h-3" /> Email
                  </p>
                  <p className="font-medium text-gray-900">{u.email}</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Convocatoria
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-500">Nombre</p>
                <p className="font-medium text-gray-900">{c.nombre_convocatoria}</p>
              </div>
              <div>
                <p className="text-gray-500">Estado</p>
                <p className="font-medium text-gray-900">{c.estado_convocatoria}</p>
              </div>
              <div>
                <p className="text-gray-500 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Fecha de postulación
                </p>
                <p className="font-medium text-gray-900">
                  {new Date(postulacion.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-emerald-50 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-emerald-700 mb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              Avales Aprobados
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {avales.map((a) => (
                <div
                  key={a.key}
                  className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-emerald-200"
                >
                  <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span className="text-sm font-medium text-emerald-800">{a.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end p-4 border-t">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm font-medium"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Componente principal ─────────────────────────────────────────────────────

const AspirantesAprobados = () => {
  const [aspirantes, setAspirantes] = useState<Postulacion[]>([]);
  const [loading, setLoading] = useState(true);

  // CAMBIO: Mapa completo de contrataciones por user_id para soportar doble contratación
  const [contratacionesPorUsuario, setContratacionesPorUsuario] = useState<
    Record<number, Contratacion[]>
  >({});

  const [convocatoriaFiltro, setConvocatoriaFiltro] = useState<string>("");

  // Modal detalle aspirante
  const [seleccionado, setSeleccionado] = useState<Postulacion | null>(null);

  // Modal ver contrato
  const [modalVerContrato, setModalVerContrato] = useState(false);
  const [idContratacionVer, setIdContratacionVer] = useState<number | null>(null);

  // Modal generar contrato
  const [modalGenerarContrato, setModalGenerarContrato] = useState(false);
  const [userIdGenerar, setUserIdGenerar] = useState<number | null>(null);
  const [idConvocatoriaGenerar, setIdConvocatoriaGenerar] = useState<number | null>(null);

  const fetchDatos = async () => {
    try {
      setLoading(true);
      const [postulacionesRes, contratacionesRes] = await Promise.all([
        axiosInstance.get("/talentoHumano/obtener-postulaciones"),
        axiosInstance.get("/talentoHumano/obtener-contrataciones"),
      ]);

      const postulaciones: Postulacion[] = postulacionesRes.data?.postulaciones ?? [];
      const todasContrataciones: Contratacion[] =
        contratacionesRes.data?.contrataciones ?? [];

      // CAMBIO: Agrupamos por user_id para saber cuántos contratos tiene cada uno
      const agrupadas = todasContrataciones.reduce(
        (acc, c) => {
          if (!acc[c.user_id]) acc[c.user_id] = [];
          acc[c.user_id].push(c);
          return acc;
        },
        {} as Record<number, Contratacion[]>
      );
      setContratacionesPorUsuario(agrupadas);

      // CAMBIO: Mostramos UNA FILA POR CADA POSTULACIÓN aprobada (no deduplicamos por user_id).
      // Esto es necesario para que el botón "Doble Contrato" envíe el convocatoria_id correcto
      // de cada postulación específica. Si un docente tiene 2 postulaciones aprobadas en
      // 2 convocatorias distintas, aparecerán 2 filas — una por cada convocatoria.
      const resultado = postulaciones
        .filter((p) => tieneLosCuatroAvales(p.usuario_postulacion))
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

      setAspirantes(resultado);
    } catch (error) {
      console.error("Error al obtener aspirantes aprobados:", error);
      toast.error("Error al cargar los aspirantes aprobados");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatos();
  }, []);

  const opcionesConvocatoria = useMemo(() => {
    const nombres = aspirantes.map(
      (a) => a.convocatoria_postulacion.nombre_convocatoria
    );
    return [...new Set(nombres)].sort();
  }, [aspirantes]);

  const aspirantesFiltrados = useMemo(() => {
    if (!convocatoriaFiltro) return aspirantes;
    return aspirantes.filter(
      (a) =>
        a.convocatoria_postulacion.nombre_convocatoria === convocatoriaFiltro
    );
  }, [aspirantes, convocatoriaFiltro]);

  // CAMBIO: Ver el primer contrato del usuario (o el más reciente).
  // Para ver todos los contratos, hay un Link a VerContratacionesPorUsuario.
  const handleVerContrato = (userId: number) => {
    const contratos = contratacionesPorUsuario[userId] ?? [];
    if (contratos.length > 0) {
      setIdContratacionVer(contratos[0].id_contratacion);
      setModalVerContrato(true);
    }
  };

  const handleGenerarContrato = (userId: number, convocatoriaId: number) => {
    setUserIdGenerar(userId);
    setIdConvocatoriaGenerar(convocatoriaId);
    setModalGenerarContrato(true);
  };

  const columns = useMemo<ColumnDef<Postulacion>[]>(
    () => [
      {
        accessorKey: "usuario_postulacion.primer_nombre",
        header: () => (
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span>Nombre</span>
          </div>
        ),
        cell: ({ row }) => {
          const u = row.original.usuario_postulacion;
          const userId = row.original.user_id;
          const contratos = contratacionesPorUsuario[userId] ?? [];
          const esDocente = contratos.length > 0;

          return (
            <div className="flex items-center gap-3">
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${esDocente
                    ? "bg-amber-100"
                    : "bg-emerald-100"
                  }`}
              >
                <User
                  className={`h-4 w-4 ${esDocente ? "text-amber-600" : "text-emerald-600"
                    }`}
                />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-gray-900">
                    {u.primer_nombre} {u.primer_apellido}
                  </span>
                  {/* NUEVO: Badge docente activo con conteo de contratos */}
                  {esDocente && <DocenteActivoBadge count={contratos.length} />}
                </div>
                {/* NUEVO: Advertencia de doble contratación */}
                {esDocente && (
                  <div className="flex items-center gap-1 mt-0.5">
                    <AlertTriangle size={10} className="text-amber-500" />
                    <span className="text-[10px] text-amber-600 font-medium">
                      Puede agregar nuevo contrato para otra convocatoria
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "usuario_postulacion.numero_identificacion",
        header: () => (
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            <span>Identificación</span>
          </div>
        ),
        cell: ({ row }) => (
          <p className="font-medium text-gray-900">
            {row.original.usuario_postulacion.numero_identificacion}
          </p>
        ),
      },
      {
        accessorKey: "convocatoria_postulacion.nombre_convocatoria",
        header: () => (
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span>Convocatoria</span>
          </div>
        ),
        cell: ({ row }) => (
          <p className="font-medium text-gray-900">
            {row.original.convocatoria_postulacion.nombre_convocatoria}
          </p>
        ),
      },
      {
        id: "avales",
        header: () => (
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            <span>Avales</span>
          </div>
        ),
        cell: () => (
          <div className="flex flex-wrap gap-1">
            {["Talento Humano", "Coordinación", "Vicerrectoría", "Rectoría"].map((l) => (
              <span
                key={l}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800"
              >
                <CheckCircle className="w-3 h-3" /> {l}
              </span>
            ))}
          </div>
        ),
      },
      {
        id: "acciones",
        header: "Acciones",
        cell: ({ row }) => {
          const { user_id, convocatoria_id } = row.original;
          const contratos = contratacionesPorUsuario[user_id] ?? [];
          const esDocente = contratos.length > 0;

          // ¿Ya tiene contrato para ESTA convocatoria específica?
          const yaContratadoEnEstaConvocatoria = contratos.some(
            (c) => Number(c.id_convocatoria) === Number(convocatoria_id)
          );

          return (
            <div className="flex items-center gap-2 flex-wrap">
              {/* Ver detalle del aspirante */}
              <button
                onClick={() => setSeleccionado(row.original)}
                className="inline-flex items-center gap-1 bg-gray-50 hover:bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors border border-gray-200"
              >
                <User className="w-4 h-4" /> Ver detalle
              </button>

              {yaContratadoEnEstaConvocatoria ? (
                // Ya tiene contrato en esta convocatoria → ver contrato
                <button
                  onClick={() => handleVerContrato(user_id)}
                  className="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
                >
                  <ClipboardList className="w-4 h-4" /> Ver Contrato
                </button>
              ) : (
                // No tiene contrato en esta convocatoria → puede generar
                <button
                  onClick={() => handleGenerarContrato(user_id, convocatoria_id)}
                  className={`inline-flex items-center gap-1 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm ${esDocente
                      ? "bg-amber-500 hover:bg-amber-600"   // naranja para doble contratación
                      : "bg-emerald-600 hover:bg-emerald-700"
                    }`}
                >
                  {esDocente ? (
                    <>
                      <Plus className="w-4 h-4" />
                      Doble Contrato
                    </>
                  ) : (
                    <>
                      <ClipboardList className="w-4 h-4" />
                      Generar Contrato
                    </>
                  )}
                </button>
              )}

              {/* NUEVO: Si es docente activo, acceso rápido a ver todos sus contratos */}
              {esDocente && (
                <Link
                  to={`/talento-humano/contrataciones/usuario/${user_id}`}
                  className="inline-flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors border border-indigo-200"
                >
                  <Briefcase className="w-4 h-4" />
                  Ver todos ({contratos.length})
                </Link>
              )}
            </div>
          );
        },
      },
    ],
    [contratacionesPorUsuario]
  );

  // Contadores para el header
  const totalDocentes = useMemo(
    () => aspirantesFiltrados.filter((a) => (contratacionesPorUsuario[a.user_id]?.length ?? 0) > 0).length,
    [aspirantesFiltrados, contratacionesPorUsuario]
  );

  return (
    <div className="flex flex-col gap-4 h-full w-full bg-white rounded-3xl p-4 sm:p-6 lg:p-8 min-h-screen">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div className="flex items-center gap-4">
          <Link to="/talento-humano/contrataciones">
            <ButtonRegresar />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
              Aspirantes Aprobados
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Aspirantes con todos los avales completos — incluye docentes activos para doble contratación
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span className="text-sm font-semibold text-emerald-700">
              {aspirantesFiltrados.length} aprobado(s)
            </span>
          </div>
          {/* NUEVO: Contador de docentes activos */}
          {totalDocentes > 0 && (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <span className="text-sm font-semibold text-amber-700">
                {totalDocentes} docente{totalDocentes > 1 ? "s" : ""} activo{totalDocentes > 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* NUEVO: Banner informativo sobre doble contratación */}
      {totalDocentes > 0 && (
        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          <span>
            Los aspirantes marcados como{" "}
            <span className="font-bold">Docente Activo</span> ya tienen
            contrato(s) vigente(s). Puedes generar un{" "}
            <span className="font-bold">Doble Contrato</span> para una
            convocatoria distinta. El sistema validará que no se duplique la
            misma convocatoria.
          </span>
        </div>
      )}

      {/* Filtro por convocatoria */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Filter className="w-4 h-4" />
          <span>Filtrar por convocatoria:</span>
        </div>
        <select
          value={convocatoriaFiltro}
          onChange={(e) => setConvocatoriaFiltro(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none min-w-[260px]"
        >
          <option value="">Todas las convocatorias</option>
          {opcionesConvocatoria.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto">
        <DataTable2
          data={aspirantesFiltrados}
          columns={columns}
          loading={loading}
        />
      </div>

      {/* Modales */}
      {seleccionado && (
        <DetalleModal
          postulacion={seleccionado}
          onClose={() => setSeleccionado(null)}
        />
      )}

      {idContratacionVer && (
        <DetalleContratacionModal
          idContratacion={idContratacionVer}
          isOpen={modalVerContrato}
          onClose={() => {
            setModalVerContrato(false);
            setIdContratacionVer(null);
          }}
        />
      )}

      {userIdGenerar && (
        <AgregarContratacionModal
          isOpen={modalGenerarContrato}
          onClose={() => {
            setModalGenerarContrato(false);
            setUserIdGenerar(null);
            setIdConvocatoriaGenerar(null);
          }}
          userId={userIdGenerar}
          idConvocatoria={idConvocatoriaGenerar || undefined}
          onContratacionAgregada={() => {
            fetchDatos();
            setModalGenerarContrato(false);
            setUserIdGenerar(null);
            setIdConvocatoriaGenerar(null);
          }}
        />
      )}
    </div>
  );
};

export default AspirantesAprobados;