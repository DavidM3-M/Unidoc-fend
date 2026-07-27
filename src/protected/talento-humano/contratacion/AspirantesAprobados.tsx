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
  Layers,
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
}

interface ConvocatoriaPostulacion {
  nombre_convocatoria: string;
  estado_convocatoria: string;
  // Avales que esta convocatoria específica exige (definidos al crearla).
  // Viene como array gracias al cast 'array' en el modelo Convocatoria.
  avales_establecidos?: string[] | null;
}

interface Postulacion {
  id_postulacion: number;
  convocatoria_id: number;
  user_id: number;
  estado_postulacion: string;
  fecha_postulacion?: string;
  created_at: string;
  // Avales calculados por postulación (ver backend: obtenerPostulaciones).
  // IMPORTANTE: viven aquí, NO en usuario_postulacion, porque dependen
  // de la convocatoria específica, no solo del usuario.
  aval_talento_humano?: boolean;
  aval_coordinador?: boolean;
  aval_vicerrectoria?: boolean;
  aval_rectoria?: boolean;
  usuario_postulacion: UsuarioPostulacion;
  convocatoria_postulacion: ConvocatoriaPostulacion;
}

interface Contratacion {
  id_contratacion: number;
  user_id: number;
  convocatoria_id: number;
}

// Postulación enriquecida con metadatos de agrupación visual,
// calculados una sola vez antes de pasarla a la tabla.
interface PostulacionAgrupada extends Postulacion {
  __grupoIndex: number; // índice de color/estilo del grupo (0, 1, 2...)
  __esPrimeraDelGrupo: boolean; // true si es la primera fila visible de este aspirante
  __tieneDobleContratacion: boolean; // true si este aspirante aparece en más de una fila visible
}

// ─── Helper: mapeo entre el nombre del aval (como se guarda en avales_establecidos) ──
// y la clave booleana correspondiente en Postulacion.
// Se normaliza sin tildes y en minúsculas para evitar problemas de codificación
// (ej. "Vicerrectoría" guardado como "Vicerrectoria" en algún punto).

const normalizar = (texto: string): string =>
  texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, ""); // quita tildes

type AvalKey =
  | "aval_talento_humano"
  | "aval_coordinador"
  | "aval_vicerrectoria"
  | "aval_rectoria";

interface AvalDef {
  key: AvalKey;
  label: string;
  // Variantes/alias con las que este aval puede aparecer guardado en avales_establecidos.
  // Esto cubre diferencias reales observadas en la BD, ej: "Coordinador" en vez de "Coordinación".
  aliases: string[];
}

const AVALES_DISPONIBLES: AvalDef[] = [
  { key: "aval_talento_humano", label: "Talento Humano", aliases: ["Talento Humano"] },
  { key: "aval_coordinador", label: "Coordinación", aliases: ["Coordinación", "Coordinador"] },
  { key: "aval_vicerrectoria", label: "Vicerrectoría", aliases: ["Vicerrectoría", "Vicerrector"] },
  { key: "aval_rectoria", label: "Rectoría", aliases: ["Rectoría", "Rector"] },
];

// Dado el array avales_establecidos de la convocatoria (ej: ["Talento Humano", "Rectoría"]),
// devuelve solo las definiciones de aval que aplican a esa convocatoria.
// Si avales_establecidos viene vacío o nulo, se asume que no se exige ningún aval
// (comportamiento conservador: no había instrucciones de avales = no se bloquea).
const obtenerAvalesRequeridos = (avalesEstablecidos?: string[] | null): AvalDef[] => {
  if (!avalesEstablecidos || avalesEstablecidos.length === 0) return [];
  const normalizados = avalesEstablecidos.map(normalizar);
  return AVALES_DISPONIBLES.filter((avalDef) =>
    avalDef.aliases.some((alias) => {
      const aliasNorm = normalizar(alias);
      return normalizados.some((n) => n.includes(aliasNorm) || aliasNorm.includes(n));
    })
  );
};

// Solo exige los avales
// que la convocatoria de esa postulación tiene configurados en avales_establecidos.
// Lee los avales desde la propia Postulacion (no desde usuario_postulacion),
// porque cada postulación tiene sus propios avales según su convocatoria.
const cumpleAvalesRequeridos = (postulacion: Postulacion): boolean => {
  const requeridos = obtenerAvalesRequeridos(postulacion.convocatoria_postulacion.avales_establecidos);
  // Si la convocatoria no exige ningún aval, se considera aprobado directamente.
  if (requeridos.length === 0) return true;
  return requeridos.every((avalDef) => postulacion[avalDef.key] === true);
};

// Paleta de colores para distinguir grupos de doble contratación.
// Se cicla si hay más de 4 aspirantes con doble contrato visibles a la vez.
const COLORES_GRUPO = [
  { borde: "border-l-[var(--color-navy)]", fondo: "bg-[var(--color-beige)]/70" },
  { borde: "border-l-[var(--color-warning)]", fondo: "bg-[var(--color-background)]" },
  { borde: "border-l-[var(--color-success)]", fondo: "bg-[var(--color-beige)]/50" },
  { borde: "border-l-[var(--color-navy-light)]", fondo: "bg-[var(--color-background)]" },
];

// Reordena las postulaciones para que las de un mismo aspirante (user_id)
// queden adyacentes, preservando el orden relativo original (por fecha)
// en la posición de la PRIMERA aparición de cada aspirante.
// Además calcula metadatos de agrupación (color, si es la primera fila, etc).
const agruparPorAspirante = (postulaciones: Postulacion[]): PostulacionAgrupada[] => {
  const indiceGrupoPorUsuario = new Map<number, number>();
  const filasPorUsuario = new Map<number, Postulacion[]>();
  const ordenDeAparicion: number[] = [];

  postulaciones.forEach((p) => {
    if (!filasPorUsuario.has(p.user_id)) {
      filasPorUsuario.set(p.user_id, []);
      ordenDeAparicion.push(p.user_id);
    }
    filasPorUsuario.get(p.user_id)!.push(p);
  });

  let proximoColor = 0;
  const resultado: PostulacionAgrupada[] = [];

  ordenDeAparicion.forEach((userId) => {
    const filas = filasPorUsuario.get(userId)!;
    const tieneDobleContratacion = filas.length > 1;
    const colorIndex = tieneDobleContratacion ? proximoColor % COLORES_GRUPO.length : -1;
    if (tieneDobleContratacion) proximoColor++;

    filas.forEach((fila, idx) => {
      resultado.push({
        ...fila,
        __grupoIndex: colorIndex,
        __esPrimeraDelGrupo: idx === 0,
        __tieneDobleContratacion: tieneDobleContratacion,
      });
    });

    indiceGrupoPorUsuario.set(userId, colorIndex);
  });

  return resultado;
};

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
  const avalesRequeridos = obtenerAvalesRequeridos(c.avales_establecidos);

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
            {avalesRequeridos.length === 0 ? (
              <p className="text-sm text-emerald-700">
                Esta convocatoria no exige avales específicos.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {avalesRequeridos.map((a) => (
                  <div
                    key={a.key}
                    className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-emerald-200"
                  >
                    <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span className="text-sm font-medium text-emerald-800">{a.label}</span>
                  </div>
                ))}
              </div>
            )}
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
  const [usuariosContratados, setUsuariosContratados] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const [convocatoriaFiltro, setConvocatoriaFiltro] = useState<string>("");

  const contratosPorUsuarioPorConvocatoria = useMemo(() => {
    return contrataciones.reduce((acc, contrato) => {
      const usuarioContratos = acc[contrato.user_id] || {};
      usuarioContratos[contrato.convocatoria_id] =
        (usuarioContratos[contrato.convocatoria_id] ?? 0) + 1;
      acc[contrato.user_id] = usuarioContratos;
      return acc;
    }, {} as Record<number, Record<number, number>>);
  }, [contrataciones]);

  // Modal detalle aspirante
  const [seleccionado, setSeleccionado] = useState<Postulacion | null>(null);

  // Modal ver contrato
  const [modalVerContrato, setModalVerContrato] = useState(false);
  const [idContratacionVer, setIdContratacionVer] = useState<number | null>(null);

  // Modal generar contrato
  const [modalGenerarContrato, setModalGenerarContrato] = useState(false);
  const [userIdGenerar, setUserIdGenerar] = useState<number | null>(null);
  const [convocatoriaIdGenerar, setConvocatoriaIdGenerar] = useState<number | null>(null);

  const fetchDatos = async () => {
    try {
      setLoading(true);

      const [postulacionesRes, contratacionesRes] = await Promise.all([
        axiosInstance.get("/talentoHumano/obtener-postulaciones"),
        axiosInstance.get("/talentoHumano/obtener-contrataciones"),
      ]);

      const postulaciones: Postulacion[] = postulacionesRes.data?.postulaciones ?? [];
      const todasContrataciones: Contratacion[] = contratacionesRes.data?.contrataciones ?? [];

      const idsContratados = todasContrataciones.map((c) => `${c.user_id}_${c.convocatoria_id}`);
      setUsuariosContratados(idsContratados);
      setContrataciones(todasContrataciones);

      const vistos = new Set<string>();
      const resultado: Postulacion[] = [];

      const ordenadas = [...postulaciones].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      ordenadas.forEach((p) => {
        const clave = `${p.user_id}_${p.convocatoria_id}`;
        if (vistos.has(clave)) return;
        // Se exige únicamente lo que la convocatoria de ESTA postulación
        // tenga configurado en avales_establecidos, leyendo los avales
        // propios de esta postulación (no compartidos entre convocatorias).
        if (cumpleAvalesRequeridos(p)) {
          vistos.add(clave);
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

  // Datos finales que se pasan a la tabla: mismas filas que aspirantesFiltrados,
  // pero reordenadas para que el mismo aspirante quede adyacente, y con
  // metadatos de agrupación visual ya calculados.
  const datosAgrupados = useMemo(
    () => agruparPorAspirante(aspirantesFiltrados),
    [aspirantesFiltrados]
  );

  const handleVerContrato = (userId: number, convocatoriaId?: number) => {
    const contratacion = contrataciones.find(
      (c) => c.user_id === userId && (convocatoriaId === undefined || c.convocatoria_id === convocatoriaId)
    );
    if (contratacion) {
      setIdContratacionVer(contratacion.id_contratacion);
      setModalVerContrato(true);
    }
  };

  const handleGenerarContrato = (userId: number, convocatoriaId: number) => {
    setUserIdGenerar(userId);
    setConvocatoriaIdGenerar(convocatoriaId);
    setModalGenerarContrato(true);
  };

  // Helper para aplicar el color de fondo/borde del grupo a una celda.
  // Las filas sin doble contratación no llevan ningún estilo adicional.
  const claseGrupo = (row: PostulacionAgrupada): string => {
    if (!row.__tieneDobleContratacion || row.__grupoIndex < 0) return "";
    const color = COLORES_GRUPO[row.__grupoIndex];
    return `border-l-4 ${color.borde} ${color.fondo}`;
  };

  const columns = useMemo<ColumnDef<PostulacionAgrupada>[]>(
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
          const data = row.original;
          const u = data.usuario_postulacion;
          return (
            <div className={`flex items-center gap-2 ${claseGrupo(data)} -mx-2 px-2 py-1 rounded-r`}>
              <div className="h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 bg-[var(--color-beige)]">
                <User className="h-4 w-4 text-[var(--color-navy)]" />
              </div>
              <div>
                <div className="text-sm font-medium text-[var(--color-text)]">
                  {u.primer_nombre} {u.primer_apellido}
                </div>
                {data.__tieneDobleContratacion && data.__esPrimeraDelGrupo && (
                  <div className="flex items-center gap-1 text-[11px] text-[var(--color-navy)] font-medium mt-0.5">
                    <Layers className="w-3 h-3" />
                    Doble contratación
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
          <p className="font-medium text-[var(--color-text)]">
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
          <p className="font-medium text-[var(--color-text)]">
            {row.original.convocatoria_postulacion.nombre_convocatoria}
          </p>
        ),
      },
      {
        id: "otroContrato",
        header: () => (
          <div className="flex items-center gap-2">
            <ClipboardList className="w-4 h-4" />
            <span>Otro contrato</span>
          </div>
        ),
        cell: ({ row }) => {
          const userId = row.original.user_id;
          const convocatoriaId = row.original.convocatoria_id;
          const contratosUsuario = contratosPorUsuarioPorConvocatoria[userId] ?? {};
          const contratosEnOtraConvocatoria = Object.entries(contratosUsuario).reduce(
            (sum, [convId, count]) =>
              Number(convId) === convocatoriaId ? sum : sum + count,
            0
          );

          return contratosEnOtraConvocatoria > 0 ? (
            <span className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold bg-[var(--color-warning)]/10 text-[var(--color-warning)] border border-[var(--color-warning)]/30">
              Sí ({contratosEnOtraConvocatoria})
            </span>
          ) : (
            <span className="text-sm text-[var(--color-text-muted)]">No</span>
          );
        },
      },
      {
        id: "avales",
        header: () => (
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            <span>Avales</span>
          </div>
        ),
        cell: ({ row }) => {
          // Se muestran solo los avales que esta convocatoria exige
          // (que, al llegar hasta aquí, ya sabemos están todos aprobados
          // para ESTA postulación específica).
          const requeridos = obtenerAvalesRequeridos(
            row.original.convocatoria_postulacion.avales_establecidos
          );
          if (requeridos.length === 0) {
            return <span className="text-sm text-[var(--color-text-muted)]">Sin avales requeridos</span>;
          }
          return (
            <div className="flex flex-wrap gap-1">
              {requeridos.map((a) => (
                <span
                  key={a.key}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--color-beige)] text-[var(--color-navy)]"
                >
                  <CheckCircle className="w-3 h-3" />
                  {a.label}
                </span>
              ))}
            </div>
          );
        },
      },
      {
        id: "acciones",
        header: "Acciones",
        cell: ({ row }) => {
          const { user_id, convocatoria_id } = row.original;
          const yaContratado = usuariosContratados.includes(`${user_id}_${convocatoria_id}`);
          return (
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setSeleccionado(row.original)}
                className="inline-flex items-center gap-1 bg-[var(--color-background)] hover:bg-[var(--color-beige)] text-[var(--color-text)] px-3 py-2 rounded-lg text-sm font-medium transition-colors border border-[var(--color-border)]"
              >
                <User className="w-4 h-4" />
                Ver detalle
              </button>

              {yaContratado ? (
                <button
                  onClick={() => handleVerContrato(user_id, row.original.convocatoria_id)}
                  className="inline-flex items-center gap-1 bg-[var(--color-navy)] hover:bg-[var(--color-navy-dark)] text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
                >
                  <ClipboardList className="w-4 h-4" />
                  Ver Contrato
                </button>
              ) : (
                <button
                  onClick={() => handleGenerarContrato(user_id, row.original.convocatoria_id)}
                  className="inline-flex items-center gap-1 bg-[var(--color-success)] hover:bg-[var(--color-success)]/90 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
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
    [usuariosContratados, contratosPorUsuarioPorConvocatoria]
  );

  return (
    <div className="flex flex-col gap-4 h-full w-full bg-[var(--color-surface)] rounded-3xl p-4 sm:p-6 lg:p-8 min-h-screen">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div className="flex items-center gap-4">
          <Link to="/talento-humano/contrataciones">
            <ButtonRegresar />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-text)]">
              Aspirantes Aprobados
            </h1>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">
              Aspirantes que cumplen con todos los avales requeridos por su convocatoria
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-[var(--color-beige)] border border-[var(--color-border)] rounded-xl px-4 py-2">
          <ShieldCheck className="w-5 h-5 text-[var(--color-success)]" />
          <span className="text-sm font-semibold text-[var(--color-navy)]">
            {aspirantesFiltrados.length} aspirante(s) aprobado(s)
          </span>
        </div>
      </div>

      {/* Filtro por convocatoria */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
          <Filter className="w-4 h-4" />
          <span>Filtrar por convocatoria:</span>
        </div>
        <select
          value={convocatoriaFiltro}
          onChange={(e) => setConvocatoriaFiltro(e.target.value)}
          className="px-3 py-2 border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text)] focus:ring-2 focus:ring-[var(--color-navy)]/30 focus:border-[var(--color-navy)] focus:outline-none min-w-[260px] bg-[var(--color-surface)]"
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
            className="flex items-center gap-1 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] px-2 py-1 rounded-lg hover:bg-[var(--color-background)] transition-colors"
          >
            <X className="w-4 h-4" />
            Limpiar
          </button>
        )}
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <DataTable2 data={datosAgrupados} columns={columns} loading={loading} />
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
            setConvocatoriaIdGenerar(null);
          }}
          userId={userIdGenerar}
          convocatoriaId={convocatoriaIdGenerar ?? undefined}
          onContratacionAgregada={() => {
            fetchDatos();
            setModalGenerarContrato(false);
            setUserIdGenerar(null);
            setConvocatoriaIdGenerar(null);
          }}
        />
      )}
    </div>
  );
};

export default AspirantesAprobados;