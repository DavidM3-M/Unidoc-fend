import { useEffect, useState, useCallback, useMemo } from "react";
import axiosInstance from "../../../utils/axiosConfig";
import { toast } from "react-toastify";
import axios from "axios";
import EliminarBoton from "../../../componentes/EliminarBoton";
import { Link } from "react-router";
import InputSearch from "../../../componentes/formularios/InputSearch";
import { ButtonRegresar } from "../../../componentes/formularios/ButtonRegresar";
import {
  FileSpreadsheet, Eye, Briefcase, GraduationCap, CheckCircle, Calendar,
  Edit, ClipboardList, PlusCircle, Users, XCircle, LayoutGrid,
} from "lucide-react";
import DetalleConvocatoriaModal from "../../../componentes/modales/DetalleConvocatoriaModal";
import AgregarConvocatoriaModal from "../../../componentes/modales/AgregarConvocatoriaModal";
import quimeritoImg from "../../../assets/images/quimerito.png";

interface Aprobacion {
  id: string | number;
  nombre?: string;
  [key: string]: string | number | undefined;
}

interface Convocatoria {
  id_convocatoria: number;
  numero_convocatoria: string;
  nombre_convocatoria: string;
  tipo: string;
  tipo_otro?: string;
  periodo_academico: string;
  cargo_solicitado: string;
  facultad: string;
  facultad_id?: string;
  facultad_otro?: string;
  estado_convocatoria: string;
  fecha_publicacion: string;
  fecha_cierre: string;
  personas_requeridas: number;
  cursos?: string;
  tipo_vinculacion?: string;
  fecha_inicio_contrato?: string;
  descripcion?: string;
  perfil_profesional?: string;
  perfil_profesional_id?: number | string;
  experiencia_requerida?: string;
  experiencia_requerida_id?: number | string;
  experiencia_requerida_contexto?: string;
  experiencia_requerida_contexto_text?: string;
  cantidad_experiencia?: number | string;
  unidad_experiencia?: string;
  referencia_experiencia?: string;
  solicitante?: string;
  aprobaciones?: string;
  avales_establecidos?: Aprobacion[];
  aprobaciones_list?: string[];
  tipo_cargo_id?: number | string;
  requisitos_idiomas?: Array<{ idioma: string; nivel: string }>;
  idiomas_list?: Array<{ idioma: string; nivel: string }>;
  documentos_convocatoria?: Array<{ id_documento: number; archivo: string; url: string }>;
}

const isConvocatoriaVencida = (fecha_cierre: string) => {
  const fechaCierre = new Date(fecha_cierre);
  const hoy = new Date();
  fechaCierre.setHours(0, 0, 0, 0);
  hoy.setHours(0, 0, 0, 0);
  return fechaCierre < hoy;
};

const getEstadoActual = (convocatoria: Convocatoria) => {
  if (isConvocatoriaVencida(convocatoria.fecha_cierre)) return "Cerrada";
  return convocatoria.estado_convocatoria;
};

const VerConvocatoria = () => {
  const [convocatorias, setConvocatorias] = useState<Convocatoria[]>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<"all" | "Abierta" | "Cerrada">("all");
  const [loading, setLoading] = useState(true);
  const [exportando, setExportando] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editInitialDatos, setEditInitialDatos] = useState<Partial<Convocatoria> | null>(null);
  const [editId, setEditId] = useState<number | null>(null);

  const fetchDatos = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/talentoHumano/obtener-convocatorias");
      console.log("Convocatorias recibidas:", response.data.convocatorias);
      setConvocatorias(response.data.convocatorias);
    } catch (error) {
      console.error("Error al obtener convocatorias:", error);
      toast.error("Error al cargar las convocatorias");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDatos(); }, []);

  const handleEliminar = useCallback(async (id: number) => {
    try {
      await axiosInstance.delete(`/talentoHumano/eliminar-convocatoria/${id}`);
      setConvocatorias((prev) => prev.filter((item) => item.id_convocatoria !== id));
      toast.success("Convocatoria eliminada correctamente");
    } catch (error) {
      console.error("Error al eliminar:", error);
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Error al eliminar");
      } else {
        toast.error("Error inesperado al eliminar");
      }
    }
  }, []);

  const handleExportarExcel = async () => {
    try {
      setExportando(true);
      const response = await axiosInstance.get("/talentoHumano/exportar-convocatorias-excel", { responseType: "blob" });
      const blob = new Blob([response.data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const fecha = new Date().toISOString().split("T")[0];
      link.download = `Convocatorias_${fecha}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Excel exportado correctamente");
    } catch (error) {
      console.error("Error al exportar Excel:", error);
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Error al exportar Excel");
      } else {
        toast.error("Error inesperado al exportar");
      }
    } finally {
      setExportando(false);
    }
  };

  const handleVerDetalle = useCallback((id: number) => {
    setSelectedId(id);
    setModalOpen(true);
  }, []);

  const handleEdit = useCallback(async (id: number) => {
    const found = convocatorias.find((c) => c.id_convocatoria === id);
    if (found) {
      const mapped: Partial<Convocatoria> = {
        numero_convocatoria: found.numero_convocatoria,
        nombre_convocatoria: found.nombre_convocatoria,
        tipo: found.tipo,
        periodo_academico: found.periodo_academico,
        cargo_solicitado: found.cargo_solicitado,
        tipo_cargo_id: found.tipo_cargo_id ?? '',
        facultad: found.facultad ?? '',
        facultad_otro: undefined,
        cursos: found.cursos,
        tipo_vinculacion: found.tipo_vinculacion,
        personas_requeridas: found.personas_requeridas,
        estado_convocatoria: found.estado_convocatoria,
        fecha_publicacion: found.fecha_publicacion,
        fecha_cierre: found.fecha_cierre,
        fecha_inicio_contrato: found.fecha_inicio_contrato,
        descripcion: found.descripcion,
        perfil_profesional: found.perfil_profesional,
        perfil_profesional_id: found.perfil_profesional_id,
        experiencia_requerida: found.experiencia_requerida,
        experiencia_requerida_id: found.experiencia_requerida_id,
        experiencia_requerida_contexto_text: found.experiencia_requerida_contexto,
        solicitante: found.solicitante,
        aprobaciones: found.aprobaciones,
        avales_establecidos: found.avales_establecidos,
        aprobaciones_list: found.aprobaciones_list,
        idiomas_list: found.requisitos_idiomas ?? found.idiomas_list,
      };
      setEditInitialDatos(mapped);
      setEditId(id);
      setAddModalOpen(true);
    }
  }, [convocatorias]);

  const convocatoriasFiltradas = useMemo(() => {
    return convocatorias.filter((c) => {
      const estadoActual = getEstadoActual(c);
      const matchEstado = filtroEstado === "all" || estadoActual === filtroEstado;
      const q = globalFilter.toLowerCase();
      const matchSearch =
        !q ||
        c.nombre_convocatoria?.toLowerCase().includes(q) ||
        c.numero_convocatoria?.toLowerCase().includes(q) ||
        c.cargo_solicitado?.toLowerCase().includes(q) ||
        c.facultad?.toLowerCase().includes(q);
      return matchEstado && matchSearch;
    });
  }, [convocatorias, filtroEstado, globalFilter]);

  const totalPlazas = useMemo(() => convocatorias.reduce((sum, c) => sum + (c.personas_requeridas || 0), 0), [convocatorias]);
  const totalAbiertas = useMemo(() => convocatorias.filter(c => getEstadoActual(c) === "Abierta").length, [convocatorias]);
  const totalCerradas = useMemo(() => convocatorias.filter(c => getEstadoActual(c) === "Cerrada").length, [convocatorias]);

  const getEstadoBadge = (estado: string) => {
    if (estado === "Abierta") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-white/20 text-white border border-white/30 backdrop-blur-sm">
          <CheckCircle className="h-3 w-3" />{estado}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-black/20 text-white/80 border border-white/20">
        <XCircle className="h-3 w-3" />{estado}
      </span>
    );
  };

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8" style={{ position: "relative", overflow: "hidden" }}>
      {/* Fondo */}
      <div style={{ position: "fixed", inset: 0, backgroundImage: `url(${quimeritoImg})`, backgroundSize: "cover", backgroundPosition: "center top", backgroundRepeat: "no-repeat", zIndex: 0 }} />
      {/* Overlay */}
      <div style={{ position: "fixed", inset: 0, background: "linear-gradient(135deg, rgba(25,64,123,0.88) 0%, rgba(0,117,191,0.80) 50%, rgba(8,173,207,0.75) 100%)", zIndex: 1 }} />

      <div className="max-w-7xl mx-auto space-y-6" style={{ position: "relative", zIndex: 2 }}>
        {/* Encabezado */}
        <div className="rounded-2xl p-6 md:p-8" style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.25)", boxShadow: "0 8px 32px rgba(25,64,123,0.25)" }}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <Link to="/talento-humano">
                <ButtonRegresar />
              </Link>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white drop-shadow">Convocatorias</h1>
                <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.75)" }}>Gestión de convocatorias de vinculación docente</p>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={handleExportarExcel}
                disabled={exportando}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.30)", color: "white", backdropFilter: "blur(8px)" }}
              >
                <FileSpreadsheet className="h-4 w-4" />
                {exportando ? "Exportando..." : "Exportar Excel"}
              </button>
              <button
                onClick={() => { setEditId(null); setEditInitialDatos(null); setAddModalOpen(true); }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                style={{ background: "linear-gradient(135deg, #0075bf, #19407b)", border: "1px solid rgba(255,255,255,0.20)", color: "white", boxShadow: "0 4px 12px rgba(0,117,191,0.4)" }}
              >
                <PlusCircle className="h-4 w-4" />
                Nueva Convocatoria
              </button>
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total", value: convocatorias.length, icon: <ClipboardList className="h-5 w-5 text-white" />, active: filtroEstado === "all", onClick: () => setFiltroEstado("all"), color: "#0075bf" },
            { label: "Abiertas", value: totalAbiertas, icon: <CheckCircle className="h-5 w-5 text-white" />, active: filtroEstado === "Abierta", onClick: () => setFiltroEstado("Abierta"), color: "#08ADCF" },
            { label: "Cerradas", value: totalCerradas, icon: <XCircle className="h-5 w-5 text-white" />, active: filtroEstado === "Cerrada", onClick: () => setFiltroEstado("Cerrada"), color: "#19407b" },
            { label: "Plazas totales", value: totalPlazas, icon: <Users className="h-5 w-5 text-white" />, active: false, onClick: () => {}, color: "#0075bf" },
          ].map((stat) => (
            <div
              key={stat.label}
              onClick={stat.onClick}
              className="rounded-xl p-4 cursor-pointer transition-all duration-200"
              style={{
                background: stat.active ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.12)",
                backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)",
                border: stat.active ? `1px solid ${stat.color}` : "1px solid rgba(255,255,255,0.22)",
                boxShadow: stat.active ? `0 4px 20px rgba(0,117,191,0.35)` : "0 4px 16px rgba(25,64,123,0.18)",
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-lg" style={{ background: stat.color }}>{stat.icon}</div>
                <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "rgba(255,255,255,0.75)" }}>{stat.label}</p>
              </div>
              <p className="text-3xl font-bold text-white">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Búsqueda */}
        <div className="rounded-2xl px-6 py-4" style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", border: "1px solid rgba(255,255,255,0.22)" }}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-full sm:w-96">
              <InputSearch
                type="text"
                placeholder="Buscar por nombre, número, cargo, facultad..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
              />
            </div>
            <p className="text-sm ml-auto" style={{ color: "rgba(255,255,255,0.75)" }}>
              Mostrando <span className="font-semibold text-white">{convocatoriasFiltradas.length}</span> de {convocatorias.length} convocatorias
              {filtroEstado !== "all" && (
                <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: "rgba(255,255,255,0.20)", color: "white" }}>
                  Filtro: {filtroEstado}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Grid de tarjetas */}
        <div className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", border: "1px solid rgba(255,255,255,0.22)" }}>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white/60"></div>
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.75)" }}>Cargando convocatorias...</p>
            </div>
          ) : convocatoriasFiltradas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Briefcase className="h-14 w-14" style={{ color: "rgba(255,255,255,0.30)" }} />
              <p className="text-lg font-semibold text-white">No hay convocatorias</p>
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.65)" }}>
                {filtroEstado !== "all" || globalFilter ? "Prueba ajustando los filtros de búsqueda" : "Crea una nueva convocatoria para comenzar"}
              </p>
              {(filtroEstado !== "all" || globalFilter) && (
                <button
                  onClick={() => { setFiltroEstado("all"); setGlobalFilter(""); }}
                  className="mt-2 px-4 py-2 text-sm rounded-lg transition-colors"
                  style={{ border: "1px solid rgba(255,255,255,0.30)", color: "white", background: "rgba(255,255,255,0.10)" }}
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {convocatoriasFiltradas.map(conv => (
                <div
                  key={conv.id_convocatoria}
                  className="rounded-xl overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1"
                  style={{ background: "rgba(255,255,255,0.13)", border: "1px solid rgba(255,255,255,0.22)", boxShadow: "0 4px 20px rgba(25,64,123,0.20)" }}
                  onMouseEnter={e => { e.currentTarget.style.border = "1px solid #08ADCF"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,117,191,0.35)"; }}
                  onMouseLeave={e => { e.currentTarget.style.border = "1px solid rgba(255,255,255,0.22)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(25,64,123,0.20)"; }}
                >
                  {/* Header card */}
                  <div className="px-5 py-4 flex justify-between items-start" style={{ background: "linear-gradient(135deg, rgba(0,117,191,0.6), rgba(25,64,123,0.6))" }}>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wider mb-1 truncate" style={{ color: "rgba(255,255,255,0.75)" }}>{conv.numero_convocatoria}</p>
                      <h3 className="text-base font-bold line-clamp-2 leading-snug text-white">{conv.nombre_convocatoria}</h3>
                    </div>
                    <div className="ml-3 flex-shrink-0">{getEstadoBadge(getEstadoActual(conv))}</div>
                  </div>

                  {/* Contenido */}
                  <div className="px-5 py-4 flex-1 space-y-3 text-sm">
                    {[
                      { icon: <Briefcase className="h-4 w-4" style={{ color: "#08ADCF" }} />, label: "Cargo", value: conv.cargo_solicitado },
                      { icon: <GraduationCap className="h-4 w-4" style={{ color: "#08ADCF" }} />, label: "Facultad", value: conv.facultad || "No especificada" },
                      { icon: <Users className="h-4 w-4" style={{ color: "#08ADCF" }} />, label: "Plazas", value: `${conv.personas_requeridas} posiciones` },
                      { icon: <Calendar className="h-4 w-4" style={{ color: "#08ADCF" }} />, label: "Período", value: conv.periodo_academico },
                    ].map(item => (
                      <div key={item.label} className="flex items-start gap-2">
                        <span className="mt-0.5 flex-shrink-0">{item.icon}</span>
                        <div>
                          <p className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.55)" }}>{item.label}</p>
                          <p className="text-white font-medium">{item.value}</p>
                        </div>
                      </div>
                    ))}
                    <div className="grid grid-cols-2 gap-2 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.15)" }}>
                      <div>
                        <p className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.55)" }}>Publicación</p>
                        <p className="text-white text-sm font-medium">{new Date(conv.fecha_publicacion).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" })}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.55)" }}>Cierre</p>
                        <p className="text-white text-sm font-medium">{new Date(conv.fecha_cierre).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" })}</p>
                      </div>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="px-5 py-3 flex gap-2" style={{ borderTop: "1px solid rgba(255,255,255,0.15)", background: "rgba(0,0,0,0.10)" }}>
                    <button onClick={() => handleVerDetalle(conv.id_convocatoria)} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg font-medium text-xs transition-colors" style={{ background: "rgba(8,173,207,0.20)", color: "#a8ddf4", border: "1px solid rgba(8,173,207,0.35)" }}>
                      <Eye className="h-3.5 w-3.5" />Ver
                    </button>
                    <button onClick={() => handleEdit(conv.id_convocatoria)} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg font-medium text-xs transition-colors" style={{ background: "rgba(251,191,36,0.15)", color: "#fcd34d", border: "1px solid rgba(251,191,36,0.30)" }}>
                      <Edit className="h-3.5 w-3.5" />Editar
                    </button>
                    <div className="flex-1">
                      <EliminarBoton id={conv.id_convocatoria} onConfirmDelete={handleEliminar} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedId && (
        <DetalleConvocatoriaModal idConvocatoria={selectedId} isOpen={modalOpen} onClose={() => { setModalOpen(false); setSelectedId(null); }} />
      )}

      {addModalOpen && (
        <AgregarConvocatoriaModal
          isOpen={addModalOpen}
          onClose={() => { setAddModalOpen(false); setEditId(null); setEditInitialDatos(null); }}
          editId={editId ?? undefined}
          initialDatos={editInitialDatos ?? undefined}
          onConvocatoriaAgregada={() => { fetchDatos(); setAddModalOpen(false); setEditId(null); setEditInitialDatos(null); }}
          onConvocatoriaActualizada={() => { fetchDatos(); setAddModalOpen(false); setEditId(null); setEditInitialDatos(null); }}
        />
      )}
    </div>
  );
};

export default VerConvocatoria;