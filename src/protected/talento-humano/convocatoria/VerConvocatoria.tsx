import { useEffect, useState, useCallback } from "react";
import axiosInstance from "../../../utils/axiosConfig";
import { ButtonTable } from "../../../componentes/formularios/ButtonTabla";
import { toast } from "react-toastify";
import axios from "axios";
import EliminarBoton from "../../../componentes/EliminarBoton";
import { Link } from "react-router";
import InputSearch from "../../../componentes/formularios/InputSearch";
import { ButtonRegresar } from "../../../componentes/formularios/ButtonRegresar";
import { FileSpreadsheet, Eye, Briefcase, GraduationCap, CheckCircle, Calendar, Edit } from "lucide-react";
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

const VerConvocatoria = () => {
  const [convocatorias, setConvocatorias] = useState<Convocatoria[]>([]);
  const [globalFilter, setGlobalFilter] = useState("");
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

  // Remover el useMemo de columns que ya no se usa en la vista de tarjetas

  return (
    <div className="flex flex-col gap-4 h-full bg-white rounded-3xl p-8 min-h-screen">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="flex gap-1">
            <Link to={"/talento-humano"}>
              <ButtonRegresar />
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Gestión de Convocatorias
          </h1>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 w-full">
        <div className="w-full lg:w-80">
          <InputSearch
            type="text"
            placeholder="Buscar por nombre, número..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2 w-full lg:w-auto">
          <button
            onClick={handleExportarExcel}
            disabled={exportando || convocatorias.length === 0}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
              ${exportando || convocatorias.length === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700 hover:shadow-lg'
              }
            `}
          >
            <FileSpreadsheet size={20} />
            <span className="hidden sm:inline">{exportando ? 'Exportando...' : 'Exportar Excel'}</span>
          </button>

          <button onClick={() => setAddModalOpen(true)} className="flex-1 lg:flex-none">
            <ButtonTable value="Agregar Convocatoria" />
          </button>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <p className="text-sm text-blue-600 font-medium">Total</p>
          <p className="text-2xl font-bold text-blue-900">{convocatorias.length}</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <p className="text-sm text-green-600 font-medium">Abiertas</p>
          <p className="text-2xl font-bold text-green-900">
            {convocatorias.filter(c => c.estado_convocatoria === "Abierta").length}
          </p>
        </div>
        <div className="bg-red-50 rounded-lg p-4 border border-red-200">
          <p className="text-sm text-red-600 font-medium">Cerradas</p>
          <p className="text-2xl font-bold text-red-900">
            {convocatorias.filter(c => c.estado_convocatoria === "Cerrada").length}
          </p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <p className="text-sm text-purple-600 font-medium">Plazas Totales</p>
          <p className="text-2xl font-bold text-purple-900">
            {convocatorias.reduce((sum, c) => sum + (c.personas_requeridas || 0), 0)}
          </p>
        </div>
      </div>

      {/* Grid de Tarjetas */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : convocatorias.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
          <Briefcase size={48} className="mb-4 text-gray-400" />
          <p className="text-lg font-medium">No hay convocatorias registradas</p>
          <p className="text-sm">Crea una nueva convocatoria para comenzar</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {convocatorias
            .filter(conv => {
              const searchTerm = globalFilter.toLowerCase();
              return (
                conv.nombre_convocatoria.toLowerCase().includes(searchTerm) ||
                conv.numero_convocatoria.toLowerCase().includes(searchTerm) ||
                conv.cargo_solicitado.toLowerCase().includes(searchTerm) ||
                conv.facultad.toLowerCase().includes(searchTerm)
              );
            })
            .map(conv => (
              <div
                key={conv.id_convocatoria}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 overflow-hidden flex flex-col"
              >
                {/* Header con estado */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 text-white flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-blue-100 uppercase tracking-wider mb-1">
                      {conv.numero_convocatoria}
                    </p>
                    <h3 className="text-lg font-bold line-clamp-2">{conv.nombre_convocatoria}</h3>
                  </div>
                  {getEstadoBadge(conv.estado_convocatoria)}
                </div>

                {/* Contenido */}
                <div className="px-6 py-4 flex-1 space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <Briefcase size={16} className="text-gray-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-gray-600 font-medium">Cargo</p>
                      <p className="text-gray-800 font-semibold">{conv.cargo_solicitado}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <GraduationCap size={16} className="text-gray-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-gray-600 font-medium">Facultad</p>
                      <p className="text-gray-800">{conv.facultad || 'No especificada'}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <CheckCircle size={16} className="text-gray-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-gray-600 font-medium">Plazas</p>
                      <p className="text-gray-800 font-semibold">{conv.personas_requeridas} posiciones</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Calendar size={16} className="text-gray-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-gray-600 font-medium">Período</p>
                      <p className="text-gray-800">{conv.periodo_academico}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-200">
                    <div>
                      <p className="text-gray-600 font-medium text-xs">Publicación</p>
                      <p className="text-gray-800 text-sm">
                        {new Date(conv.fecha_publicacion).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: 'short',
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 font-medium text-xs">Cierre</p>
                      <p className="text-gray-800 text-sm">
                        {new Date(conv.fecha_cierre).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: 'short',
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Acciones */}
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex gap-2 justify-between">
                  <button
                    onClick={() => handleVerDetalle(conv.id_convocatoria)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium text-sm"
                  >
                    <Eye size={16} />
                    <span>Ver</span>
                  </button>
                  <button
                    onClick={() => handleEdit(conv.id_convocatoria)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors font-medium text-sm"
                  >
                    <Edit size={16} />
                    <span>Editar</span>
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