import { useCallback } from "react";
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
        <div className="flex items-center justify-between p-6 border-b border-[rgba(30,58,95,0.09)]">
          <h2 className="text-xl font-bold text-[#2c3e50]">Detalle del Aspirante</h2>
          <button
            onClick={onClose}
            className="text-[#6b7a8d] hover:text-[#2c3e50] p-1 rounded-lg hover:bg-[#f3ede1]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="bg-[#f3ede1]/50 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-[#2c3e50] mb-3 flex items-center gap-2">
              <User className="w-4 h-4" />
              Información del Postulante
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-[#6b7a8d]">Nombre completo</p>
                <p className="font-medium text-[#2c3e50]">
                  {u.primer_nombre} {u.segundo_nombre ?? ""}{" "}
                  {u.primer_apellido} {u.segundo_apellido ?? ""}
                </p>
              </div>
              <div>
                <p className="text-[#6b7a8d]">Identificación</p>
                <p className="font-medium text-[#2c3e50]">{u.numero_identificacion}</p>
              </div>
              {u.email && (
                <div className="sm:col-span-2">
                  <p className="text-[#6b7a8d] flex items-center gap-1">
                    <Mail className="w-3 h-3" /> Email
                  </p>
                  <p className="font-medium text-[#2c3e50]">{u.email}</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-[#f3ede1]/50 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-[#2c3e50] mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Convocatoria
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-[#6b7a8d]">Nombre</p>
                <p className="font-medium text-[#2c3e50]">{c.nombre_convocatoria}</p>
              </div>
              <div>
                <p className="text-[#6b7a8d]">Estado</p>
                <p className="font-medium text-[#2c3e50]">{c.estado_convocatoria}</p>
              </div>
              <div>
                <p className="text-[#6b7a8d] flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Fecha de postulación
                </p>
                <p className="font-medium text-[#2c3e50]">
                  {new Date(postulacion.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[#c89b14]/10 rounded-xl p-4 border border-[#c89b14]/20">
            <h3 className="text-sm font-semibold text-[#c89b14] mb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              Avales Aprobados
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {avales.map((a) => (
                <div
                  key={a.key}
                  className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-[#c89b14]/30"
                >
                  <CheckCircle className="w-4 h-4 text-[#c89b14] flex-shrink-0" />
                  <span className="text-sm font-medium text-[#c89b14]">{a.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end p-4 border-t border-[rgba(30,58,95,0.09)]">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#2c3e50] text-white rounded-lg hover:bg-[#1e3a5f] text-sm font-medium transition-colors"
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

  const handleVerContrato = useCallback((userId: number) => {
    const contratacion = contrataciones.find((c) => c.user_id === userId);
    if (contratacion) {
      setIdContratacionVer(contratacion.id_contratacion);
      setModalVerContrato(true);
    }
  }, [contrataciones]);

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
              <div className="h-8 w-8 bg-[#c89b14]/20 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-[#c89b14]" />
              </div>
              <div className="text-sm font-medium text-[#2c3e50]">
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
          <p className="font-medium text-[#2c3e50]">
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
          <p className="font-medium text-[#2c3e50]">
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
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-[#c89b14]/20 text-[#c89b14]"
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
                className="inline-flex items-center gap-1 bg-[#f3ede1] hover:bg-[#ede6d8] text-[#2c3e50] px-3 py-2 rounded-lg text-sm font-medium transition-colors border border-[rgba(30,58,95,0.09)]"
              >
                <User className="w-4 h-4" />
                Ver detalle
              </button>

              {yaContratado ? (
                <button
                  onClick={() => handleVerContrato(user_id)}
                  className="inline-flex items-center gap-1 bg-[#1e3a5f] hover:bg-[#152a45] text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
                >
                  <ClipboardList className="w-4 h-4" />
                  Ver Contrato
                </button>
              ) : (
                <button
                  onClick={() => handleGenerarContrato(user_id)}
                  className="inline-flex items-center gap-1 bg-[#c89b14] hover:bg-[#a67c0a] text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
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
    [handleVerContrato, usuariosContratados]
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
            <h1 className="text-2xl sm:text-3xl font-bold text-[#2c3e50]">
              Aspirantes Aprobados
            </h1>
            <p className="text-sm text-[#6b7a8d] mt-1">
              Aspirantes que cumplen con todos los requisitos y tienen avales completos
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-[#c89b14]/10 border border-[#c89b14]/20 rounded-xl px-4 py-2">
          <ShieldCheck className="w-5 h-5 text-[#c89b14]" />
          <span className="text-sm font-semibold text-[#c89b14]">
            {aspirantesFiltrados.length} aspirante(s) aprobado(s)
          </span>
        </div>
      </div>

      {/* Filtro por convocatoria */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-[#6b7a8d]">
          <Filter className="w-4 h-4" />
          <span>Filtrar por convocatoria:</span>
        </div>
        <select
          value={convocatoriaFiltro}
          onChange={(e) => setConvocatoriaFiltro(e.target.value)}
          className="px-3 py-2 border border-[rgba(30,58,95,0.09)] rounded-lg text-sm text-[#2c3e50] focus:ring-2 focus:ring-[#c89b14]/30 focus:border-[#c89b14] focus:outline-none min-w-[260px] bg-white"
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
            className="flex items-center gap-1 text-sm text-[#6b7a8d] hover:text-[#2c3e50] px-2 py-1 rounded-lg hover:bg-[#f3ede1] transition-colors"
          >
            <X className="w-4 h-4" />
            Limpiar
          </button>
        )}
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <DataTable2 data={aspirantesFiltrados} columns={columns} loading={loading} />
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