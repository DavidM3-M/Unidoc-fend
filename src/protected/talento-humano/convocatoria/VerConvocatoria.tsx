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
      const response = await axiosInstance.get(
        "/talentoHumano/obtener-convocatorias"
      );
      console.log("Convocatorias recibidas:", response.data.convocatorias);
      setConvocatorias(response.data.convocatorias);
    } catch (error) {
      console.error("Error al obtener convocatorias:", error);
      toast.error("Error al cargar las convocatorias");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatos();
  }, []);

  const handleEliminar = useCallback(async (id: number) => {
    try {
      await axiosInstance.delete(`/talentoHumano/eliminar-convocatoria/${id}`);
      setConvocatorias((prev) =>
        prev.filter((item) => item.id_convocatoria !== id)
      );
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
      
      const response = await axiosInstance.get(
        "/talentoHumano/exportar-convocatorias-excel",
        {
          responseType: "blob",
        }
      );

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

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
    // try to find in already-loaded convocatorias
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
        cantidad_experiencia: found.cantidad_experiencia,
        unidad_experiencia: found.unidad_experiencia,
        referencia_experiencia: found.referencia_experiencia,
        solicitante: found.solicitante,
        aprobaciones: found.aprobaciones,
        aprobaciones_list: found.aprobaciones_list || (
          found.avales_establecidos ? 
            found.avales_establecidos.map(a => String(a.id ?? a))
            : []
        ),
        requisitos_idiomas: found.requisitos_idiomas || [],
        idiomas_list: found.idiomas_list || found.requisitos_idiomas || [],
        documentos_convocatoria: found.documentos_convocatoria || [],
      };
      setEditInitialDatos(mapped);
      setEditId(id);
      setAddModalOpen(true);
      return;
    }

    // fallback: fetch from server
    try {
      const resp = await axiosInstance.get(`/talentoHumano/obtener-convocatoria/${id}`);
      const data = resp.data.convocatoria;
      const mapped: Partial<Convocatoria> = {
        numero_convocatoria: data.numero_convocatoria,
        nombre_convocatoria: data.nombre_convocatoria,
        tipo: data.tipo,
        periodo_academico: data.periodo_academico,
        cargo_solicitado: data.cargo_solicitado,
        tipo_cargo_id: data.tipo_cargo_id,
        facultad: data.facultad_id ?? data.facultad ?? '',
        facultad_otro: data.facultad_otro ?? undefined,
        cursos: data.cursos,
        tipo_vinculacion: data.tipo_vinculacion,
        personas_requeridas: data.personas_requeridas,
        estado_convocatoria: data.estado_convocatoria,
        fecha_publicacion: data.fecha_publicacion,
        fecha_cierre: data.fecha_cierre,
        fecha_inicio_contrato: data.fecha_inicio_contrato,
        descripcion: data.descripcion,
        perfil_profesional: data.perfil_profesional,
        perfil_profesional_id: data.perfil_profesional_id,
        experiencia_requerida: data.experiencia_requerida,
        experiencia_requerida_id: data.experiencia_requerida_id,
        experiencia_requerida_contexto_text: data.referencia_experiencia ?? data.experiencia_requerida_contexto,
        cantidad_experiencia: data.cantidad_experiencia,
        unidad_experiencia: data.unidad_experiencia,
        referencia_experiencia: data.referencia_experiencia,
        solicitante: data.solicitante,
        aprobaciones: data.aprobaciones,
        aprobaciones_list: data.aprobaciones_list || (
          data.avales_establecidos ? 
            data.avales_establecidos.map((a: Aprobacion) => String(a.id ?? a))
            : []
        ),
        requisitos_idiomas: data.requisitos_idiomas || [],
        idiomas_list: data.requisitos_idiomas || [],
        documentos_convocatoria: data.documentos_convocatoria || [],
      };
      setEditInitialDatos(mapped);
      setEditId(id);
      setAddModalOpen(true);
    } catch (err) {
      console.error('Error fetching convocatoria for edit', err);
      toast.error('No se pudo cargar la convocatoria para edición');
    }
  }, [convocatorias]);


  const getEstadoBadge = (estado: string) => {
    const estadoLower = estado.toLowerCase();
    if (estadoLower === "abierta") {
      return (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
          {estado}
        </span>
      );
    }
    if (estadoLower === "cerrada") {
      return (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
          {estado}
        </span>
      );
    }
    return (
      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
        {estado}
      </span>
    );
  };

  // Contadores para las stats cards
  const totalAbiertas = useMemo(
    () => convocatorias.filter(c => getEstadoActual(c).toLowerCase() === "abierta").length,
    [convocatorias]
  );
  const totalCerradas = useMemo(
    () => convocatorias.filter(c => getEstadoActual(c).toLowerCase() === "cerrada").length,
    [convocatorias]
  );
  const totalPlazas = useMemo(
    () => convocatorias.reduce((sum, c) => sum + (c.personas_requeridas || 0), 0),
    [convocatorias]
  );

  // Lista filtrada combinando texto + estado
  const convocatoriasFiltradas = useMemo(() => {
    return convocatorias.filter(conv => {
      const searchTerm = globalFilter.toLowerCase();
      const coincideBusqueda =
        conv.nombre_convocatoria.toLowerCase().includes(searchTerm) ||
        conv.numero_convocatoria.toLowerCase().includes(searchTerm) ||
        conv.cargo_solicitado.toLowerCase().includes(searchTerm) ||
        conv.facultad.toLowerCase().includes(searchTerm);

      const estadoActual = getEstadoActual(conv).toLowerCase();
      const coincideEstado =
        filtroEstado === "all" ||
        estadoActual === filtroEstado.toLowerCase();

      return coincideBusqueda && coincideEstado;
    });
  }, [convocatorias, globalFilter, filtroEstado]);

  const handleFiltroEstado = (estado: "all" | "Abierta" | "Cerrada") => {
    setFiltroEstado(prev => prev === estado ? "all" : estado);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50/30 via-white to-emerald-50/10 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header principal */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-3">
                <Link to="/talento-humano">
                  <ButtonRegresar />
                </Link>
                <div className="relative">
                  <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg">
                    <ClipboardList className="h-7 w-7 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-700 to-emerald-900 bg-clip-text text-transparent">
                    Gestión de Convocatorias
                  </h1>
                  <p className="text-gray-600 mt-1">Administra y publica convocatorias de vinculación</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              <button
                onClick={handleExportarExcel}
                disabled={exportando || convocatorias.length === 0}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                  exportando || convocatorias.length === 0
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-white border border-emerald-300 text-emerald-700 hover:bg-emerald-50 hover:shadow"
                }`}
              >
                <FileSpreadsheet className="h-4 w-4" />
                <span className="hidden sm:inline">{exportando ? "Exportando..." : "Exportar Excel"}</span>
              </button>

              <button
                onClick={() => setAddModalOpen(true)}
                className="group inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white px-5 py-2.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold text-sm transform hover:-translate-y-0.5"
              >
                <PlusCircle className="h-5 w-5 transition-transform group-hover:rotate-90" />
                Agregar Convocatoria
              </button>
            </div>
          </div>

          {/* Stats cards — funcionan como filtros */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Total */}
            <button
              onClick={() => setFiltroEstado("all")}
              className={`text-left rounded-xl p-4 border-2 transition-all duration-200 hover:shadow-md ${
                filtroEstado === "all"
                  ? "bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-200"
                  : "bg-emerald-50 border-emerald-200 text-emerald-900 hover:border-emerald-400"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <LayoutGrid className={`h-4 w-4 ${filtroEstado === "all" ? "text-emerald-100" : "text-emerald-500"}`} />
                <p className={`text-xs font-semibold uppercase tracking-wide ${filtroEstado === "all" ? "text-emerald-100" : "text-emerald-600"}`}>
                  Total
                </p>
              </div>
              <p className={`text-3xl font-bold ${filtroEstado === "all" ? "text-white" : "text-emerald-900"}`}>
                {convocatorias.length}
              </p>
              {filtroEstado === "all" && (
                <p className="text-xs text-emerald-100 mt-1">Filtro activo</p>
              )}
            </button>

            {/* Abiertas */}
            <button
              onClick={() => handleFiltroEstado("Abierta")}
              className={`text-left rounded-xl p-4 border-2 transition-all duration-200 hover:shadow-md ${
                filtroEstado === "Abierta"
                  ? "bg-green-600 border-green-600 text-white shadow-lg shadow-green-200"
                  : "bg-green-50 border-green-200 text-green-900 hover:border-green-400"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className={`h-4 w-4 ${filtroEstado === "Abierta" ? "text-green-100" : "text-green-500"}`} />
                <p className={`text-xs font-semibold uppercase tracking-wide ${filtroEstado === "Abierta" ? "text-green-100" : "text-green-600"}`}>
                  Abiertas
                </p>
              </div>
              <p className={`text-3xl font-bold ${filtroEstado === "Abierta" ? "text-white" : "text-green-900"}`}>
                {totalAbiertas}
              </p>
              {filtroEstado === "Abierta" && (
                <p className="text-xs text-green-100 mt-1">Filtro activo — clic para quitar</p>
              )}
            </button>

            {/* Cerradas */}
            <button
              onClick={() => handleFiltroEstado("Cerrada")}
              className={`text-left rounded-xl p-4 border-2 transition-all duration-200 hover:shadow-md ${
                filtroEstado === "Cerrada"
                  ? "bg-red-600 border-red-600 text-white shadow-lg shadow-red-200"
                  : "bg-red-50 border-red-200 text-red-900 hover:border-red-400"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <XCircle className={`h-4 w-4 ${filtroEstado === "Cerrada" ? "text-red-100" : "text-red-500"}`} />
                <p className={`text-xs font-semibold uppercase tracking-wide ${filtroEstado === "Cerrada" ? "text-red-100" : "text-red-600"}`}>
                  Cerradas
                </p>
              </div>
              <p className={`text-3xl font-bold ${filtroEstado === "Cerrada" ? "text-white" : "text-red-900"}`}>
                {totalCerradas}
              </p>
              {filtroEstado === "Cerrada" && (
                <p className="text-xs text-red-100 mt-1">Filtro activo — clic para quitar</p>
              )}
            </button>

            {/* Plazas (info only) */}
            <div className="text-left rounded-xl p-4 border-2 bg-purple-50 border-purple-200">
              <div className="flex items-center gap-2 mb-1">
                <Users className="h-4 w-4 text-purple-500" />
                <p className="text-xs font-semibold uppercase tracking-wide text-purple-600">Plazas totales</p>
              </div>
              <p className="text-3xl font-bold text-purple-900">{totalPlazas}</p>
            </div>
          </div>
        </div>

        {/* Barra de búsqueda + contador */}
        <div className="bg-white rounded-2xl shadow border border-gray-100 px-6 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-full sm:w-96">
              <InputSearch
                type="text"
                placeholder="Buscar por nombre, número, cargo, facultad..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
              />
            </div>
            <p className="text-sm text-gray-500 ml-auto">
              Mostrando <span className="font-semibold text-emerald-700">{convocatoriasFiltradas.length}</span> de {convocatorias.length} convocatorias
              {filtroEstado !== "all" && (
                <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                  Filtro: {filtroEstado}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Grid de Tarjetas */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
              <p className="text-gray-500 text-sm">Cargando convocatorias...</p>
            </div>
          ) : convocatoriasFiltradas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-3">
              <Briefcase className="h-14 w-14 text-gray-300" />
              <p className="text-lg font-semibold text-gray-500">No hay convocatorias</p>
              <p className="text-sm">
                {filtroEstado !== "all" || globalFilter
                  ? "Prueba ajustando los filtros de búsqueda"
                  : "Crea una nueva convocatoria para comenzar"}
              </p>
              {(filtroEstado !== "all" || globalFilter) && (
                <button
                  onClick={() => { setFiltroEstado("all"); setGlobalFilter(""); }}
                  className="mt-2 px-4 py-2 text-sm text-emerald-700 border border-emerald-300 rounded-lg hover:bg-emerald-50 transition-colors"
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
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-emerald-200 overflow-hidden flex flex-col group"
                >
                  {/* Header de la card */}
                  <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4 text-white flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-emerald-100 uppercase tracking-wider mb-1 truncate">
                        {conv.numero_convocatoria}
                      </p>
                      <h3 className="text-base font-bold line-clamp-2 leading-snug">{conv.nombre_convocatoria}</h3>
                    </div>
                    <div className="ml-3 flex-shrink-0">
                      {getEstadoBadge(getEstadoActual(conv))}
                    </div>
                  </div>

                  {/* Contenido */}
                  <div className="px-5 py-4 flex-1 space-y-3 text-sm">
                    <div className="flex items-start gap-2">
                      <Briefcase className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-gray-500 text-xs font-medium">Cargo</p>
                        <p className="text-gray-800 font-semibold">{conv.cargo_solicitado}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <GraduationCap className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-gray-500 text-xs font-medium">Facultad</p>
                        <p className="text-gray-800">{conv.facultad || "No especificada"}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Users className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-gray-500 text-xs font-medium">Plazas</p>
                        <p className="text-gray-800 font-semibold">{conv.personas_requeridas} posiciones</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Calendar className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-gray-500 text-xs font-medium">Período</p>
                        <p className="text-gray-800">{conv.periodo_academico}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-100">
                      <div>
                        <p className="text-gray-500 text-xs font-medium">Publicación</p>
                        <p className="text-gray-800 text-sm font-medium">
                          {new Date(conv.fecha_publicacion).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" })}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs font-medium">Cierre</p>
                        <p className="text-gray-800 text-sm font-medium">
                          {new Date(conv.fecha_cierre).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" })}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 flex gap-2">
                    <button
                      onClick={() => handleVerDetalle(conv.id_convocatoria)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors font-medium text-xs border border-emerald-200"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Ver
                    </button>
                    <button
                      onClick={() => handleEdit(conv.id_convocatoria)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition-colors font-medium text-xs border border-amber-200"
                    >
                      <Edit className="h-3.5 w-3.5" />
                      Editar
                    </button>
                    <div className="flex-1">
                      <EliminarBoton
                        id={conv.id_convocatoria}
                        onConfirmDelete={handleEliminar}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedId && (
        <DetalleConvocatoriaModal
          idConvocatoria={selectedId}
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setSelectedId(null);
          }}
        />
      )}

      {addModalOpen && (
        <AgregarConvocatoriaModal
          isOpen={addModalOpen}
          onClose={() => { setAddModalOpen(false); setEditId(null); setEditInitialDatos(null); }}
          editId={editId ?? undefined}
          initialDatos={editInitialDatos ?? undefined}
          onConvocatoriaAgregada={() => {
            // refrescar la lista tras agregar
            fetchDatos();
            setAddModalOpen(false);
            setEditId(null);
            setEditInitialDatos(null);
          }}
          onConvocatoriaActualizada={() => {
            fetchDatos();
            setAddModalOpen(false);
            setEditId(null);
            setEditInitialDatos(null);
          }}
        />
      )}
    </div>
  );
};

export default VerConvocatoria;