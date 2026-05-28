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
} from "lucide-react";
import { DataTable2 } from "../../../componentes/tablas/DataTable2";
import { Link } from "react-router-dom";
import { ButtonRegresar } from "../../../componentes/formularios/ButtonRegresar";
import DetalleContratacionModal from "../../../componentes/modales/contrataciones/DetalleContratacionModal";
import quimeritoImg from "../../../assets/images/quimerito.png";
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
}

// ─── Helper ───────────────────────────────────────────────────────────────────

const tieneLosCuatroAvales = (u: UsuarioPostulacion): boolean =>
  u.aval_talento_humano === true &&
  u.aval_coordinador === true &&
  u.aval_vicerrectoria === true &&
  u.aval_rectoria === true;

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
  const [contrataciones, setContrataciones] = useState<Contratacion[]>([]);
  const [usuariosContratados, setUsuariosContratados] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtro por convocatoria
  const [convocatoriaFiltro, setConvocatoriaFiltro] = useState<string>("");

  // Modal detalle aspirante
  const [seleccionado, setSeleccionado] = useState<Postulacion | null>(null);

  // Modal ver contrato
  const [modalVerContrato, setModalVerContrato] = useState(false);
  const [idContratacionVer, setIdContratacionVer] = useState<number | null>(null);

  // Modal generar contrato
  const [modalGenerarContrato, setModalGenerarContrato] = useState(false);
  const [userIdGenerar, setUserIdGenerar] = useState<number | null>(null);

  const fetchDatos = async () => {
    try {
      setLoading(true);

      const [postulacionesRes, contratacionesRes] = await Promise.all([
        axiosInstance.get("/talentoHumano/obtener-postulaciones"),
        axiosInstance.get("/talentoHumano/obtener-contrataciones"),
      ]);

      const postulaciones: Postulacion[] = postulacionesRes.data?.postulaciones ?? [];
      const todasContrataciones: Contratacion[] = contratacionesRes.data?.contrataciones ?? [];

      const idsContratados = todasContrataciones.map((c) => c.user_id);
      setUsuariosContratados(idsContratados);
      setContrataciones(todasContrataciones);

      const vistos = new Set<number>();
      const resultado: Postulacion[] = [];

      const ordenadas = [...postulaciones].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      ordenadas.forEach((p) => {
        if (vistos.has(p.user_id)) return;
        if (tieneLosCuatroAvales(p.usuario_postulacion)) {
          vistos.add(p.user_id);
          resultado.push(p);
        }
      });

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

  // Lista única de convocatorias para el select
  const opcionesConvocatoria = useMemo(() => {
    const nombres = aspirantes.map(
      (a) => a.convocatoria_postulacion.nombre_convocatoria
    );
    return [...new Set(nombres)].sort();
  }, [aspirantes]);

  // Aspirantes filtrados según selección
  const aspirantesFiltrados = useMemo(() => {
    if (!convocatoriaFiltro) return aspirantes;
    return aspirantes.filter(
      (a) => a.convocatoria_postulacion.nombre_convocatoria === convocatoriaFiltro
    );
  }, [aspirantes, convocatoriaFiltro]);

  const handleVerContrato = (userId: number) => {
    const contratacion = contrataciones.find((c) => c.user_id === userId);
    if (contratacion) {
      setIdContratacionVer(contratacion.id_contratacion);
      setModalVerContrato(true);
    }
  };

  const handleGenerarContrato = (userId: number) => {
    setUserIdGenerar(userId);
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
          return (
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-emerald-100 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="text-sm font-medium text-gray-900">
                {u.primer_nombre} {u.primer_apellido}
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
            {row.original.usuario_postulacion.numero_identificacion || "No especificado"}
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
            {["Talento Humano", "Coordinación", "Vicerrectoría", "Rectoría"].map((label) => (
              <span
                key={label}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800"
              >
                <CheckCircle className="w-3 h-3" />
                {label}
              </span>
            ))}
          </div>
        ),
      },
      {
        id: "acciones",
        header: "Acciones",
        cell: ({ row }) => {
          const { user_id } = row.original;
          const yaContratado = usuariosContratados.includes(user_id);
          return (
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setSeleccionado(row.original)}
                className="inline-flex items-center gap-1 bg-gray-50 hover:bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors border border-gray-200"
              >
                <User className="w-4 h-4" />
                Ver detalle
              </button>

              {yaContratado ? (
                <button
                  onClick={() => handleVerContrato(user_id)}
                  className="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
                >
                  <ClipboardList className="w-4 h-4" />
                  Ver Contrato
                </button>
              ) : (
                <button
                  onClick={() => handleGenerarContrato(user_id)}
                  className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
                >
                  <ClipboardList className="w-4 h-4" />
                  Generar Contrato
                </button>
              )}
            </div>
          );
        },
      },
    ],
    [usuariosContratados]
  );

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8" style={{ position: "relative", overflow: "hidden" }}>
      <div style={{ position: "fixed", inset: 0, backgroundImage: `url(${quimeritoImg})`, backgroundSize: "cover", backgroundPosition: "center top", backgroundRepeat: "no-repeat", zIndex: 0 }} />
      <div style={{ position: "fixed", inset: 0, background: "linear-gradient(135deg, rgba(25,64,123,0.88) 0%, rgba(0,117,191,0.80) 50%, rgba(8,173,207,0.75) 100%)", zIndex: 1 }} />
      <div className="max-w-7xl mx-auto space-y-6" style={{ position: "relative", zIndex: 2 }}>
      {/* Encabezado */}
      <div className="rounded-2xl p-6 md:p-8" style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.25)", boxShadow: "0 8px 32px rgba(25,64,123,0.25)" }}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div className="flex items-center gap-4">
          <Link to="/talento-humano/contrataciones">
            <ButtonRegresar />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white drop-shadow">Aspirantes Aprobados</h1>
            <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.75)" }}>Aspirantes que cumplen con todos los requisitos y tienen avales completos</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-xl px-4 py-2" style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.30)" }}>
          <ShieldCheck className="w-5 h-5 text-white" />
          <span className="text-sm font-semibold text-white">
            {aspirantesFiltrados.length} aspirante(s) aprobado(s)
          </span>
        </div>
      </div>
      </div>

      {/* Filtro por convocatoria */}
      <div className="rounded-2xl px-6 py-4 flex items-center gap-3" style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", border: "1px solid rgba(255,255,255,0.22)" }}>
        <div className="flex items-center gap-2 text-sm" style={{ color: "rgba(255,255,255,0.80)" }}>
          <Filter className="w-4 h-4" />
          <span>Filtrar por convocatoria:</span>
        </div>
        <select
          value={convocatoriaFiltro}
          onChange={(e) => setConvocatoriaFiltro(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none min-w-[260px]"
        >
          <option value="">Todas las convocatorias</option>
          {opcionesConvocatoria.map((nombre) => (
            <option key={nombre} value={nombre}>
              {nombre}
            </option>
          ))}
        </select>
        {convocatoriaFiltro && (
          <button
            onClick={() => setConvocatoriaFiltro("")}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
            Limpiar
          </button>
        )}
      </div>

      {/* Tabla */}
      <div className="rounded-2xl overflow-x-auto" style={{ background: "rgba(255,255,255,0.95)", backdropFilter: "blur(14px)", border: "1px solid rgba(255,255,255,0.30)", boxShadow: "0 4px 24px rgba(25,64,123,0.20)" }}>
      <div className="p-4">
        <DataTable2 data={aspirantesFiltrados} columns={columns} loading={loading} />
      </div>
      </div>

      </div>
      {/* Modal detalle aspirante */}
      {seleccionado && (
        <DetalleModal
          postulacion={seleccionado}
          onClose={() => setSeleccionado(null)}
        />
      )}


      {/* Modal ver contrato */}
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

      {/* Modal generar contrato */}
      {userIdGenerar && (
        <AgregarContratacionModal
          isOpen={modalGenerarContrato}
          onClose={() => {
            setModalGenerarContrato(false);
            setUserIdGenerar(null);
          }}
          userId={userIdGenerar}
          onContratacionAgregada={() => {
            fetchDatos();
            setModalGenerarContrato(false);
            setUserIdGenerar(null);
          }}
        />
      )}
    </div>
  );
};

export default AspirantesAprobados;