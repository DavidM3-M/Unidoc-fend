import InputSearch from "../../../componentes/formularios/InputSearch";
import { useEffect, useMemo, useState } from "react";
import axiosInstance from "../../../utils/axiosConfig";
import { toast } from "react-toastify";
import ChatIAWidget from "../../../components/ia/ChatIAWidget";
import ValidarDocumentoIA from "../../../components/ia/ValidarDocumentoIA";
import ValidarTodosIA, { type DocumentoParaValidar } from "../../../components/ia/ValidarTodosIA";
import axios from "axios";
import Cookie from "js-cookie";
import { generarHojaVidaPDF } from "../../../utils/generarHojaVida";

import { Link } from "react-router-dom";
import { ButtonRegresar } from "../../../componentes/formularios/ButtonRegresar";
import { User, FileText, CheckCircle, XCircle, Mail, Phone, Briefcase, GraduationCap, Award, FileDown, X, Loader2, Globe, Landmark, PiggyBank, Scale, ShieldCheck, ChevronDown, BookOpen, Lightbulb, Sparkles } from "lucide-react";
// Interfaz para definir la estructura de los datos de las postulaciones
interface Postulaciones {
  id_postulacion: number;
  convocatoria_id: number;
  user_id: number;
  nombre_postulante: string;
  estado_postulacion: string;
  aval_talento_humano?: boolean;
  aval_th_aprobado?: boolean;
  fecha_postulacion: string;
  usuario_postulacion: {
    primer_nombre: string;
    primer_apellido: string;
    numero_identificacion: string;
    aval_talento_humano?: boolean;
    puntaje_aspirante?: number;
  };
  convocatoria_postulacion: {
    nombre_convocatoria: string;
    estado_convocatoria: string;
  };
  avales?: {
    talentoHumano?: { estado?: boolean | string };
  };
}

// Interfaz para definir la estructura de los datos de contrataciones
interface Contratacion {
  id_contratacion: number;
  user_id: number;
  tipo_contrato: string;
  area: string;
  fecha_inicio: string;
  fecha_fin: string;
  valor_contrato: number;
}

// Tipado para perfil detallado (similar a rectoría)
interface AspiranteDetallado {
  id: number;
  documentos?: Array<{ id: number; nombre: string; url: string; tipo: string }>;
  datos_personales: {
    primer_nombre: string;
    segundo_nombre?: string;
    primer_apellido: string;
    segundo_apellido?: string;
    tipo_identificacion?: string;
    numero_identificacion: string;
    genero?: string;
    fecha_nacimiento?: string;
    estado_civil?: string;
    email?: string;
    municipio?: string;
    departamento?: string;
    foto_perfil_url?: string;
  };
  informacion_contacto?: {
    telefono?: string;
    celular?: string;
    direccion?: string;
    barrio?: string;
    correo_alterno?: string;
  };
  eps?: {
    nombre_eps?: string;
    tipo_afiliacion?: string;
    estado_afiliacion?: string;
    tipo_afiliado?: string;
    numero_afiliado?: string;
    documentosEps?: Array<{ id_documento?: number; archivo_url?: string; url?: string; archivo?: string }>;
  };
  rut?: {
    numero_rut?: string;
    razon_social?: string;
    tipo_persona?: string;
    documentosRut?: Array<{ id_documento?: number; archivo_url?: string; url?: string; archivo?: string }>;
  };
  certificacion_bancaria?: {
    nombre_banco?: string;
    tipo_cuenta?: string;
    numero_cuenta?: string;
    fecha_emision?: string;
    documentosCertificacionBancaria?: Array<{ id_documento?: number; archivo_url?: string; url?: string; archivo?: string }>;
  };
  pension?: {
    regimen_pensional?: string;
    entidad_pensional?: string;
    nit_entidad?: string;
    documentosPension?: Array<{ id_documento?: number; archivo_url?: string; url?: string; archivo?: string }>;
  };
  antecedente_judicial?: {
    fecha_validacion?: string;
    estado_antecedentes?: string;
    documentosAntecedentesJudiciales?: Array<{ id_documento?: number; archivo_url?: string; url?: string; archivo?: string }>;
  };
  arl?: {
    nombre_arl?: string;
    fecha_afiliacion?: string;
    fecha_retiro?: string;
    estado_afiliacion?: string;
    clase_riesgo?: string;
    documentosArl?: Array<{ id_documento?: number; archivo_url?: string; url?: string; archivo?: string }>;
  };
  idiomas?: Array<{
    idioma: string;
    nivel: string;
    documentos_idioma?: Array<{ archivo_url?: string; url?: string; archivo?: string }>;
    documentosIdioma?: Array<{ archivo_url?: string; url?: string; archivo?: string }>;
  }>;
  experiencias?: Array<{
    cargo: string;
    empresa: string;
    fecha_inicio: string;
    fecha_fin?: string;
    descripcion?: string;
    documentos_experiencia?: Array<{ archivo_url?: string; url?: string; archivo?: string }>;
    documentosExperiencia?: Array<{ archivo_url?: string; url?: string; archivo?: string }>;
  }>;
  estudios?: Array<{
    titulo: string;
    institucion: string;
    fecha_inicio: string;
    fecha_fin?: string;
    nivel_educativo: string;
    documentos_estudio?: Array<{ archivo_url?: string; url?: string; archivo?: string }>;
    documentosEstudio?: Array<{ archivo_url?: string; url?: string; archivo?: string }>;
  }>;
  produccion_academica?: Array<{
    titulo: string;
    numero_autores?: number;
    medio_divulgacion?: string;
    fecha_divulgacion?: string;
    documentosProduccionAcademica?: Array<{ id_documento?: number; archivo_url?: string; url?: string; archivo?: string }>;
  }>;
  aptitudes?: Array<{ nombre: string }>;
  postulaciones?: Array<{ convocatoriaPostulacion?: { titulo: string } }>;
  avales?: {
    talentoHumano?: { estado?: boolean | string };
    rectoria?: { estado?: string };
    vicerrectoria?: { estado?: string };
    coordinador?: { estado?: string };
  };
}

type DocumentoAdjunto = { id_documento?: number; archivo_url?: string; url?: string; archivo?: string };
type CategoriaDocs = 'experiencias' | 'estudios' | 'idiomas' | 'producciones' | 'rut' | 'informacion-contacto' | 'eps' | 'usuario';

// Pure helpers  defined outside component to maintain stable references
const isAprobadoLocal = (val: unknown): boolean => {
  if (val === true) return true;
  if (val == null) return false;
  if (typeof val === 'object') {
    const o = val as Record<string, unknown>;
    if ('estado' in o) return isAprobadoLocal(o['estado']);
    if ('aprobado' in o) return isAprobadoLocal(o['aprobado']);
    if ('aprobado_por' in o && o['aprobado_por']) return true;
    if ('fecha' in o && o['fecha']) return true;
    return false;
  }
  if (typeof val === 'number') return val === 1;
  if (typeof val === 'string') {
    const s = val.toLowerCase().trim();
    return ['1', 'aprobado', 'aprobada', 'si', 'true', 'a', 'aceptado', 'aceptada'].includes(s);
  }
  return false;
};

const extractAvalEstado = (av: unknown): unknown => {
  if (!av || typeof av !== 'object') return undefined;
  const a = av as Record<string, unknown>;
  if ('talentoHumano' in a) {
    const th = a['talentoHumano'];
    if (th && typeof th === 'object') return (th as Record<string, unknown>)['estado'] ?? th;
    return th;
  }
  if ('talento_humano' in a) {
    const th = a['talento_humano'];
    if (th && typeof th === 'object') return (th as Record<string, unknown>)['estado'] ?? th;
    return th;
  }
  return undefined;
};

const VerPostulaciones = () => {
  // Estado para almacenar las postulaciones
  const [postulaciones, setPostulaciones] = useState<Postulaciones[]>([]);
  // Estado para almacenar los IDs de los usuarios ya contratados
  const [usuariosContratados, setUsuariosContratados] = useState<number[]>([]);
  // Estado para manejar el filtro global de búsqueda
  const [globalFilter, setGlobalFilter] = useState("");
  const [avalesTHLocal, setAvalesTHLocal] = useState<Record<string, boolean>>({});
  const [avalesInicialesCargados, setAvalesInicialesCargados] = useState(false);
  // Filtro por convocatoria (id)
  const [selectedConvocatoriaId, setSelectedConvocatoriaId] = useState<number | null>(null);
  // (convocatoriaSearch removed â not used)
  // Búsqueda por nombre de postulante
  const [nameFilter, setNameFilter] = useState("");
  // Modal de postulantes por convocatoria
  const [modalConvocatoria, setModalConvocatoria] = useState<{ id: number; nombre: string } | null>(null);
  const [cerrandoModalConvocatoria, setCerrandoModalConvocatoria] = useState(false);
  const [modalSearch, setModalSearch] = useState("");
  const [modalPage, setModalPage] = useState(1);
  const modalPageSize = 12;
  // Filtro por rango de fecha (fecha_postulacion)
  const [dateFrom, setDateFrom] = useState<string | null>(null);
  const [dateTo, setDateTo] = useState<string | null>(null);
  // Ordenamiento por fecha: 'asc' | 'desc' | null
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null);
  // Ordenamiento por puntaje: 'desc' (mayor primero) | null
  const [sortByPuntaje, setSortByPuntaje] = useState<'desc' | null>(null);
  // Estado para manejar el indicador de carga
  const [loading, setLoading] = useState(true);
  const [openActionsId, setOpenActionsId] = useState<number | null>(null);
  const [filtroAval, setFiltroAval] = useState<"all" | "avalado" | "pendiente">("all");
  // Estados para mostrar perfil completo
  const [perfilCompleto, setPerfilCompleto] = useState<AspiranteDetallado | null>(null);
  const [visorUrl, setVisorUrl] = useState<string | null>(null);
  const [mostrarPerfilCompleto, setMostrarPerfilCompleto] = useState(false);
  const [iaOpen, setIaOpen] = useState(false);
  const [loadingPerfil, setLoadingPerfil] = useState(false);
  const [cerrandoPerfilCompleto, setCerrandoPerfilCompleto] = useState(false);
  const [perfilPuntaje, setPerfilPuntaje] = useState<number | null>(null);
  const [perfilConvocatoriaId, setPerfilConvocatoriaId] = useState<number | null>(null);
  const [modalRechazoOpen, setModalRechazoOpen] = useState(false);
  const [rechazoUserId, setRechazoUserId] = useState<number | null>(null);
  const [rechazoConvocatoriaId, setRechazoConvocatoriaId] = useState<number | null>(null);
  const [motivoRechazo, setMotivoRechazo] = useState("");
  const [loadingRechazo, setLoadingRechazo] = useState(false);
  const [docsPorCategoria, setDocsPorCategoria] = useState<Record<CategoriaDocs, DocumentoAdjunto[]>>({
    experiencias: [],
    estudios: [],
    idiomas: [],
    producciones: [],
    rut: [],
    'informacion-contacto': [],
    eps: [],
    usuario: [],
  });

  // Normaliza y devuelve si un aval de `perfilCompleto.avales` está aprobado
  const getAvalEstadoPerfil = (role: 'talentoHumano' | 'coordinador' | 'rectoria' | 'vicerrectoria'): boolean => {
    const avales = perfilCompleto?.avales as Record<string, unknown> | undefined;
    if (!avales) return false;

    const aliases: Record<string, string[]> = {
      talentoHumano: ['talentoHumano', 'talento_humano', 'talento-humano', 'aval_talento_humano', 'aval_talentoHumano'],
      coordinador: ['coordinador', 'aval_coordinador', 'avalCoordinador'],
      rectoria: ['rectoria', 'aval_rectoria', 'avalRectoria'],
      vicerrectoria: ['vicerrectoria', 'aval_vicerrectoria', 'avalVicerrectoria'],
    };

    for (const key of aliases[role]) {
      if (!(key in avales)) continue;
      const val = avales[key as string];
      if (val == null) continue;
      // si viene como objeto { estado: true }
      if (typeof val === 'object') {
        const o = val as Record<string, unknown>;
        if ('estado' in o) {
          if (isAprobadoLocal(o['estado'])) return true;
        } else {
          if (isAprobadoLocal(o)) return true;
        }
      } else {
        if (isAprobadoLocal(val)) return true;
      }
    }

    // fallback: si es talentoHumano, tambien revisar el mapa local optimista
    if (role === 'talentoHumano' && perfilCompleto?.id && avalesTHLocal[`${perfilConvocatoriaId ?? ''}_${perfilCompleto.id}`]) return true;
    return false;
  };

  // (fetchDatos will be executed inside useEffect below)

  // Llama a la función fetchDatos al montar el componente
  useEffect(() => {
    async function fetchDatos() {
      // helper copies to avoid depending on outer helpers
      const isAprobadoInner = (val: unknown): boolean => {
        if (val === true) return true;
        if (val == null) return false;
        if (typeof val === 'object') {
          const o = val as Record<string, unknown>;
          if ('estado' in o) return isAprobadoInner(o['estado']);
          if ('aprobado' in o) return isAprobadoInner(o['aprobado']);
          if ('aprobado_por' in o && o['aprobado_por']) return true;
          if ('fecha' in o && o['fecha']) return true;
          return false;
        }
        if (typeof val === 'number') return val === 1;
        if (typeof val === 'string') {
          const s = val.toLowerCase().trim();
          return ['1', 'aprobado', 'aprobada', 'si', 'true', 'a', 'aceptado', 'aceptada'].includes(s);
        }
        return false;
      };

      const extractAvalEstadoInner = (av: unknown): unknown => {
        if (!av || typeof av !== 'object') return undefined;
        const a = av as Record<string, unknown>;
        if ('talentoHumano' in a) {
          const th = a['talentoHumano'];
          if (th && typeof th === 'object') return (th as Record<string, unknown>)['estado'] ?? th;
          return th;
        }
        if ('talento_humano' in a) {
          const th = a['talento_humano'];
          if (th && typeof th === 'object') return (th as Record<string, unknown>)['estado'] ?? th;
          return th;
        }
        return undefined;
      };
      try {
        setLoading(true); // Indica que los datos están en proceso de carga
        const [postulacionesRes, contratacionesRes] = await Promise.all([
          axiosInstance.get("/talentoHumano/obtener-postulaciones"),
          axiosInstance.get("/talentoHumano/obtener-contrataciones"),
        ]);

        // Actualiza el estado con los datos obtenidos
        const postulacionesData = postulacionesRes.data.postulaciones as Postulaciones[];
        setPostulaciones(postulacionesData);
        // Inicializar avales por clave compuesta (convocatoria_id + user_id) usando el campo por convocatoria del backend
        const avalesIniciales = (postulacionesData ?? []).reduce((acc, item) => {
          const estado = item.aval_th_aprobado === true;
          if (estado && item.user_id && item.convocatoria_id) {
            acc[`${item.convocatoria_id}_${item.user_id}`] = true;
          }
          return acc;
        }, {} as Record<string, boolean>);
        setAvalesTHLocal(avalesIniciales);
        setAvalesInicialesCargados(true);
        // Extrae los IDs de los usuarios ya contratados
        const idsContratados = contratacionesRes.data.contrataciones.map(
          (c: Contratacion) => c.user_id
        );
        setUsuariosContratados(idsContratados);
      } catch (error) {
        console.error("Error al obtener datos:", error);
        toast.error("Error al cargar los datos"); // Muestra un mensaje de error
      } finally {
        setLoading(false); // Indica que la carga ha finalizado
      }
    }

    void fetchDatos();
  }, []);

  // const handleEliminar = async (id: number) => {
  //   try {
  //     await axiosInstance.delete(`/talentoHumano/eliminar-postulacion/${id}`);

  //     // Actualizar estado de manera óptima
  //     setPostulaciones((prev) =>
  //       prev.filter((item) => item.id_postulacion !== id)
  //     );
  //     toast.success("Convocatoria eliminada correctamente");
  //   } catch (error) {
  //     console.error("Error al eliminar:", error);

  //     if (axios.isAxiosError(error)) {
  //       toast.error("Error al eliminar la convocatoria");
  //     }
  //   }
  // };

  // Actualizar el estado de la postulación

  const handleAvalTalentoHumano = async (userId: number, convocatoriaId?: number) => {
    try {
      const response = await axiosInstance.post(`/talento-humano/aval-hoja-vida/${userId}`, convocatoriaId ? { convocatoria_id: convocatoriaId } : {});
      const mensaje = response?.data?.message ?? "Aval de Talento Humano registrado correctamente";
      toast.success(mensaje);
      if (convocatoriaId) setAvalesTHLocal((prev) => ({ ...prev, [`${convocatoriaId}_${userId}`]: true }));
      setPerfilCompleto((prev) => {
        if (!prev || prev.id !== userId) return prev;
        return {
          ...prev,
          avales: {
            ...(prev.avales ?? {}),
            talentoHumano: { estado: true },
          },
        };
      });
    } catch (error) {
      console.error("Error al registrar aval de Talento Humano:", error);
      if (axios.isAxiosError(error)) {
        const mensaje =
          error.response?.data?.message ??
          error.response?.data?.error ??
          "No se pudo registrar el aval de Talento Humano";
        toast.error(mensaje);
      } else {
        toast.error("No se pudo registrar el aval de Talento Humano");
      }
    }
  };

  const handleRechazarAval = (userId: number, convocatoriaId?: number) => {
    setRechazoUserId(userId);
    setRechazoConvocatoriaId(convocatoriaId ?? null);
    setMotivoRechazo("");
    setModalRechazoOpen(true);
  };

  const confirmarRechazo = async () => {
    if (!rechazoUserId) return;
    if (!motivoRechazo.trim()) {
      toast.error("Debe ingresar el motivo de rechazo");
      return;
    }
    setLoadingRechazo(true);
    try {
      const payload: Record<string, unknown> = { motivo_rechazo: motivoRechazo.trim() };
      if (rechazoConvocatoriaId) payload.convocatoria_id = rechazoConvocatoriaId;
      await axiosInstance.post(`/talento-humano/rechazar-aval/${rechazoUserId}`, payload);
      toast.success("Rechazo registrado y notificación enviada al aspirante");
      setModalRechazoOpen(false);
      setMotivoRechazo("");
    } catch (error) {
      console.error("Error al rechazar aval:", error);
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || error.response?.data?.error || "Error al rechazar el aval");
      } else {
        toast.error("Error al rechazar el aval");
      }
    } finally {
      setLoadingRechazo(false);
    }
  };

  // Función para ver la hoja de vida de un postulante en formato PDF
  const handleVerHojaVida = async (convocatoriaId: number, userId: number) => {
    const url = `${
      import.meta.env.VITE_API_URL
    }/talentoHumano/hoja-de-vida-pdf/${convocatoriaId}/${userId}`;
    console.log("URL de la hoja de vida:", url);
    try {
      const response = await axios.get(url, {
        responseType: "blob", // Indica que la respuesta es un archivo binario
        headers: {
          Authorization: `Bearer ${Cookie.get("token")}`, // Incluye el token de autorización
        },
        withCredentials: true,
      });

      // Crear un blob a partir de la respuesta
      const pdfBlob = new Blob([response.data], { type: "application/pdf" });

      // Crear una URL para el blob
      const pdfUrl = URL.createObjectURL(pdfBlob);

      // Abrir el PDF en una nueva pestaña
      window.open(pdfUrl, "_blank");
    } catch (error) {
      console.error("Error al ver la hoja de vida:", error);
    }
  };

  // Normaliza la respuesta de avales del backend (array o flat object) al formato
  // { talentoHumano, coordinador, rectoria, vicerrectoria } con { estado, aprobado_por, fecha }
  const normalizarAvalesResponse = (raw: unknown): Record<string, unknown> => {
    if (!raw || typeof raw !== 'object') return {};
    // Flujo nuevo: array de { aval, estado, aprobador_id, fecha_aprobacion, ... }
    if (Array.isArray(raw)) {
      const map: Record<string, unknown> = {};
      const aliasMap: Record<string, string> = {
        'Talento Humano': 'talentoHumano',
        'Coordinador': 'coordinador',
        'Rectoria': 'rectoria',
        'Vicerrectoria': 'vicerrectoria',
        'Decanato': 'decanato',
      };
      (raw as Record<string, unknown>[]).forEach((item) => {
        const rolName = String(item['aval'] ?? '');
        const key = aliasMap[rolName] ?? rolName.toLowerCase();
        map[key] = { estado: item['estado'], aprobado_por: item['aprobador_id'], fecha: item['fecha_aprobacion'] };
      });
      return map;
    }
    // Flujo legacy: objeto plano con booleans
    const r = { ...(raw as Record<string, unknown>) };
    r['talentoHumano'] = r['talentoHumano'] ?? r['talento_humano'] ?? r['aval_talento_humano'];
    r['talento_humano'] = r['talento_humano'] ?? r['talentoHumano'] ?? r['aval_talento_humano'];
    r['coordinador'] = r['coordinador'] ?? r['aval_coordinador'];
    r['vicerrectoria'] = r['vicerrectoria'] ?? r['aval_vicerrectoria'];
    r['rectoria'] = r['rectoria'] ?? r['aval_rectoria'];
    return r;
  };

  // Función para obtener y mostrar el perfil completo del usuario
  const verPerfilCompleto = async (userId: number, convocatoriaId?: number) => {
    setPerfilConvocatoriaId(convocatoriaId ?? null);
    setLoadingPerfil(true);
    // Fetch puntaje en paralelo
    axiosInstance.get(`/aspirante/${userId}/puntaje`)
      .then((r) => setPerfilPuntaje(r.data?.data?.total ?? r.data?.total ?? null))
      .catch(() => setPerfilPuntaje(null));
    try {
      // Intento principal: endpoint admin (puede devolver 403 si el rol no tiene permiso)
      const response = await axiosInstance.get(`/admin/aspirantes/${userId}`);
      const aspirante = response.data.aspirante ?? response.data?.data ?? response.data;
      // Si la respuesta parece vacía o con error de permisos, intentamos endpoints alternos
      if (!aspirante) {
        throw { response: { status: 404 } };
      }
      // Merge avales from talento-humano avals endpoint to ensure authoritative state
      try {
        const convParam = convocatoriaId ? `?convocatoria_id=${convocatoriaId}` : '';
        const url = `${import.meta.env.VITE_API_URL}/talento-humano/usuarios/${userId}/avales${convParam}`;
        const avalesResp = await axios.get(url, {
          headers: { Authorization: `Bearer ${Cookie.get('token')}` },
          withCredentials: true,
        });
        const rawAvales = avalesResp.data?.data ?? avalesResp.data?.avales ?? avalesResp.data ?? null;
        const mergedAvales = normalizarAvalesResponse(rawAvales);
        setPerfilCompleto({ ...(aspirante as unknown as AspiranteDetallado), avales: mergedAvales as unknown as AspiranteDetallado['avales'] });
      } catch (e: unknown) {
        // if avales endpoint fails, still show aspirante
        console.warn('No se pudieron obtener avales adicionales:', e);
        if (axios.isAxiosError(e)) console.error('Detalle error avales:', e.response?.data ?? e.message);
        setPerfilCompleto(aspirante);
      }
      setMostrarPerfilCompleto(true);
      setCerrandoPerfilCompleto(false);
      setLoadingPerfil(false);
      fetchDocsCategoria(userId, 'experiencias');
      fetchDocsCategoria(userId, 'estudios');
      fetchDocsCategoria(userId, 'idiomas');
      return;
    } catch (err: unknown) {
      // Si fue un 403, intentar endpoint de talento humano alternativo
      let status: number | undefined;
      if (axios.isAxiosError(err) && err.response) {
        status = err.response.status;
      }

      if (status === 403) {
        try {
          const altResp = await axiosInstance.get(`/talentoHumano/obtener-aspirante/${userId}`);
          const aspiranteAlt = altResp.data.aspirante ?? altResp.data?.data ?? altResp.data;
          if (aspiranteAlt) {
            try {
              const convParam = convocatoriaId ? `?convocatoria_id=${convocatoriaId}` : '';
              const url = `${import.meta.env.VITE_API_URL}/talento-humano/usuarios/${userId}/avales${convParam}`;
              const avalesResp = await axios.get(url, {
                headers: { Authorization: `Bearer ${Cookie.get('token')}` },
                withCredentials: true,
              });
              const rawAvales = avalesResp.data?.data ?? avalesResp.data?.avales ?? avalesResp.data ?? null;
              const mergedAvales = normalizarAvalesResponse(rawAvales);
              setPerfilCompleto({ ...(aspiranteAlt as unknown as AspiranteDetallado), avales: mergedAvales as unknown as AspiranteDetallado['avales'] });
            } catch (e: unknown) {
              console.warn('No se pudieron obtener avales adicionales (alt):', e);
              if (axios.isAxiosError(e)) console.error('Detalle error avales (alt):', e.response?.data ?? e.message);
              setPerfilCompleto(aspiranteAlt);
            }
            setMostrarPerfilCompleto(true);
            setCerrandoPerfilCompleto(false);
            setLoadingPerfil(false);
            return;
          }
        } catch (err2: unknown) {
          console.warn('Intento alternativo talentoHumano falló', err2);
        }
      }

      // Último intento genérico: ruta /talentoHumano/aspirantes/:id
      try {
        const alt2 = await axiosInstance.get(`/talentoHumano/aspirantes/${userId}`);
        const aspirante2 = alt2.data.aspirante ?? alt2.data?.data ?? alt2.data;
        if (aspirante2) {
            try {
            const convParam = convocatoriaId ? `?convocatoria_id=${convocatoriaId}` : '';
            const url = `${import.meta.env.VITE_API_URL}/talento-humano/usuarios/${userId}/avales${convParam}`;
            const avalesResp = await axios.get(url, {
              headers: { Authorization: `Bearer ${Cookie.get('token')}` },
              withCredentials: true,
            });
            const rawAvales = avalesResp.data?.data ?? avalesResp.data?.avales ?? avalesResp.data ?? null;
            const mergedAvales = normalizarAvalesResponse(rawAvales);
            setPerfilCompleto({ ...(aspirante2 as unknown as AspiranteDetallado), avales: mergedAvales as unknown as AspiranteDetallado['avales'] });
            } catch (e: unknown) {
              console.warn('No se pudieron obtener avales adicionales (alt2):', e);
              if (axios.isAxiosError(e)) console.error('Detalle error avales (alt2):', e.response?.data ?? e.message);
              setPerfilCompleto(aspirante2);
          }
          setMostrarPerfilCompleto(true);
          setCerrandoPerfilCompleto(false);
          setLoadingPerfil(false);
          return;
        }
      } catch (err3: unknown) {
        console.warn('Intento alternativo 2 falló', err3);
      }

      console.error('Error al obtener perfil completo:', err);
      if (status === 403) {
        toast.error('No tiene permisos para ver este perfil (403)');
      } else {
        toast.error('Error al cargar el perfil del aspirante');
      }
    } finally {
      setLoadingPerfil(false);
    }
  };

  const cerrarPerfilCompleto = () => {
    setCerrandoPerfilCompleto(true);
    setTimeout(() => {
      setMostrarPerfilCompleto(false);
      setPerfilCompleto(null);
      setPerfilPuntaje(null);
      setDocsPorCategoria({
        experiencias: [],
        estudios: [],
        idiomas: [],
        producciones: [],
        rut: [],
        'informacion-contacto': [],
        eps: [],
        usuario: [],
      });
      setCerrandoPerfilCompleto(false);
    }, 200);
  };

  const cerrarModalConvocatoria = () => {
    setCerrandoModalConvocatoria(true);
    setTimeout(() => {
      setModalConvocatoria(null);
      setModalSearch("");
      setModalPage(1);
      setCerrandoModalConvocatoria(false);
    }, 200);
  };

  const getBaseUrlNoApi = () => {
    const baseUrl = import.meta.env.VITE_API_URL ?? '';
    return baseUrl.replace(/\/api\/?$/, '');
  };

  const fetchDocsCategoria = async (userId: number, categoria: CategoriaDocs) => {
    try {
      const baseURL = import.meta.env.VITE_API_URL ?? '';
      const resp = await axiosInstance.get(`/talento-humano/documentos/${userId}/${categoria}`, { baseURL });
      const docs = (resp.data?.data ?? resp.data?.documentos ?? resp.data) as DocumentoAdjunto[];
      setDocsPorCategoria((prev) => ({ ...prev, [categoria]: Array.isArray(docs) ? docs : [] }));
      return Array.isArray(docs) ? docs : [];
    } catch (error) {
      console.warn('No se pudieron cargar documentos por categoría', error);
      setDocsPorCategoria((prev) => ({ ...prev, [categoria]: [] }));
      return [];
    }
  };

  // Descargar hoja de vida desde endpoint de aspirante (usado en modal)
  const handleDescargarHojaAspirante = async (userId: number) => {
    try {
      setLoadingPerfil(true);
      // ruta que usa admin/aspirantes para perfiles completos
      const response = await axiosInstance.get(`/admin/aspirantes/${userId}/hoja-vida-pdf`, { responseType: 'blob' });
      const fileURL = URL.createObjectURL(response.data);
      window.open(fileURL, '_blank');
      toast.success('Hoja de vida abierta correctamente');
    } catch (error) {
      console.error('Error al descargar hoja de vida:', error);
      toast.error('Error al cargar la hoja de vida');
    } finally {
      setLoadingPerfil(false);
    }
  };

  const resolverUrlDocumento = (doc?: DocumentoAdjunto) => {
    if (!doc) return null;
    if (doc.archivo_url) return doc.archivo_url.replace('/api/storage/', '/storage/');
    if (doc.url) return doc.url.replace('/api/storage/', '/storage/');
    if (doc.archivo) {
      const baseUrl = getBaseUrlNoApi();
      const ruta = doc.archivo.startsWith('storage/') ? doc.archivo : `storage/${doc.archivo}`;
      return `${baseUrl}${ruta.startsWith('/') ? '' : '/'}${ruta}`;
    }
    return null;
  };

  const handleAbrirDocumentoDeLista = (docs?: DocumentoAdjunto[]) => {
    const doc = docs?.find(d => resolverUrlDocumento(d)) ?? docs?.[0];
    const url = doc ? resolverUrlDocumento(doc) : null;
    if (url) {
      handleAbrirDocumento(url);
      return;
    }

    if (doc?.id_documento) {
      const baseUrl = import.meta.env.VITE_API_URL ?? '';
      const endpoint = `${baseUrl}/talento-humano/ver-documento/${doc.id_documento}`;
      window.open(endpoint, '_blank');
      return;
    }

    toast.info('No hay documento asociado para esta sección');
  };

  const handleAbrirDocumentoCategoria = async (categoria: CategoriaDocs) => {
    const docs = docsPorCategoria[categoria];
    if (docs && docs.length > 0) {
      handleAbrirDocumentoDeLista(docs);
      return;
    }
    const nuevos = perfilCompleto ? await fetchDocsCategoria(perfilCompleto.id, categoria) : [];
    if (nuevos.length > 0) {
      handleAbrirDocumentoDeLista(nuevos);
      return;
    }
    toast.info('No hay documento asociado para esta sección');
  };

  const getDocumentoGeneralPorCategoria = (categoria: CategoriaDocs) => {
    const documentos = perfilCompleto?.documentos ?? [];
    if (documentos.length === 0) return null;

    const keywords: Record<CategoriaDocs, string[]> = {
      experiencias: ['experiencia', 'experiencias'],
      estudios: ['estudio', 'estudios', 'formacion', 'formación'],
      idiomas: ['idioma', 'idiomas', 'lengua', 'language'],
      producciones: ['produccion', 'producción', 'producciones', 'publicacion', 'publicación'],
      rut: ['rut'],
      'informacion-contacto': ['contacto', 'informacion', 'información'],
      eps: ['eps', 'salud', 'entidad promotora'],
      usuario: ['usuario', 'perfil', 'datos personales'],
    };

    const encontrado = documentos.find((doc) => {
      const tipo = (doc.tipo ?? '').toLowerCase();
      return keywords[categoria].some((k) => tipo.includes(k));
    });

    return encontrado ?? null;
  };

  const handleAbrirDocumentoPreferido = async (docs?: DocumentoAdjunto[], categoria?: CategoriaDocs) => {
    if (docs && docs.length > 0) {
      handleAbrirDocumentoDeLista(docs);
      return;
    }
    if (categoria) {
      const docGeneral = getDocumentoGeneralPorCategoria(categoria);
      if (docGeneral?.url) {
        handleAbrirDocumento(docGeneral.url);
        return;
      }
      if (docGeneral?.id) {
        const baseUrl = import.meta.env.VITE_API_URL ?? '';
        const endpoint = `${baseUrl}/talento-humano/ver-documento/${docGeneral.id}`;
        window.open(endpoint, '_blank');
        return;
      }
      await handleAbrirDocumentoCategoria(categoria);
    }
  };

  const handleAbrirDocumento = (docUrl: string) => {
    if (!docUrl) {
      toast.error('Documento no disponible');
      return;
    }

    const baseUrl = getBaseUrlNoApi();
    const normalizada = docUrl.replace('/api/storage/', '/storage/');
    const url = normalizada.startsWith('http')
      ? normalizada
      : `${baseUrl}${normalizada.startsWith('/') ? '' : '/'}${normalizada}`;

    setVisorUrl(url);
  };

  // Exportar datos (filtrados) a CSV
  const exportToCSV = (rows: Postulaciones[]) => {
    if (!rows || rows.length === 0) {
      toast.info('No hay datos para exportar');
      return;
    }

    const header = ['Convocatoria','Estado','Identificación','Postulante','Fecha Postulación','User ID','Convocatoria ID'];
    const csvRows = [header.join(',')];

    rows.forEach(r => {
      const nombre = `${r.usuario_postulacion.primer_nombre} ${r.usuario_postulacion.primer_apellido}`.replace(/,/g,'');
      const conv = (r.convocatoria_postulacion && r.convocatoria_postulacion.nombre_convocatoria) ? r.convocatoria_postulacion.nombre_convocatoria.replace(/,/g,'') : '';
      const line = [conv, r.estado_postulacion, r.usuario_postulacion.numero_identificacion, nombre, r.fecha_postulacion, r.user_id, r.convocatoria_id];
      csvRows.push(line.map(v => `"${v}"`).join(','));
    });

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const ts = new Date().toISOString().slice(0,19).replace(/[:T]/g,'-');
    a.download = `postulaciones_${ts}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  // Lista única de convocatorias extraídas de las postulaciones (id, nombre, count)
  const convocatorias = useMemo(() => {
    const map = new Map<number, { id: number; nombre: string; count: number }>();
    postulaciones.forEach((p) => {
      const id = p.convocatoria_id;
      const nombre = p.convocatoria_postulacion?.nombre_convocatoria || `Convocatoria ${id}`;
      if (map.has(id)) {
        map.get(id)!.count += 1;
      } else {
        map.set(id, { id, nombre, count: 1 });
      }
    });
    return Array.from(map.values());
  }, [postulaciones]);

  // convocatoriasFiltradas not needed â use `convocatorias` directly

  // Datos filtrados por convocatoria seleccionada
  const datosFiltrados = useMemo(() => {
    let data = postulaciones;
    if (selectedConvocatoriaId) {
      data = data.filter((p) => p.convocatoria_id === selectedConvocatoriaId);
    }
    if (nameFilter) {
      const q = nameFilter.toLowerCase();
      data = data.filter((p) => {
        const nombre = `${p.usuario_postulacion.primer_nombre ?? ''} ${p.usuario_postulacion.primer_apellido ?? ''}`.toLowerCase();
        const identificacion = (p.usuario_postulacion.numero_identificacion ?? '').toLowerCase();
        return nombre.includes(q) || identificacion.includes(q);
      });
    }
    if (globalFilter) {
      const q = globalFilter.toLowerCase();
      data = data.filter((p) => {
        const nombre = `${p.usuario_postulacion.primer_nombre} ${p.usuario_postulacion.primer_apellido}`.toLowerCase();
        const convocatoria = (p.convocatoria_postulacion?.nombre_convocatoria ?? '').toLowerCase();
        const estado = (p.estado_postulacion ?? '').toLowerCase();
        const identificacion = (p.usuario_postulacion?.numero_identificacion ?? '').toLowerCase();
        return (
          nombre.includes(q) ||
          convocatoria.includes(q) ||
          estado.includes(q) ||
          identificacion.includes(q)
        );
      });
    }
    if (dateFrom) {
      const from = new Date(dateFrom);
      data = data.filter((p) => new Date(p.fecha_postulacion) >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      data = data.filter((p) => new Date(p.fecha_postulacion) <= to);
    }
    // Filtrar por estado de aval TH
    if (filtroAval !== "all") {
      data = data.filter((p) => {
        const avalado = avalesTHLocal[`${p.convocatoria_id}_${p.user_id}`] ?? (p.aval_th_aprobado === true);
        return filtroAval === "avalado" ? avalado : !avalado;
      });
    }
    // Ordenar por fecha si se especificó
    if (sortOrder) {
      data = data.slice().sort((a, b) => {
        const da = new Date(a.fecha_postulacion).getTime();
        const db = new Date(b.fecha_postulacion).getTime();
        return sortOrder === 'asc' ? da - db : db - da;
      });
    }
    // Ordenar por puntaje (mayor primero)
    if (sortByPuntaje === 'desc') {
      data = data.slice().sort((a, b) =>
        (b.usuario_postulacion?.puntaje_aspirante ?? 0) - (a.usuario_postulacion?.puntaje_aspirante ?? 0)
      );
    }

    return data;
  }, [postulaciones, selectedConvocatoriaId, nameFilter, dateFrom, dateTo, sortOrder, sortByPuntaje, globalFilter, filtroAval, avalesTHLocal]);

  const convocatoriasAgrupadas = useMemo(() => {
    const map = new Map<number, { id: number; nombre: string; estado?: string; postulantes: Postulaciones[] }>();
    datosFiltrados.forEach((p) => {
      const id = p.convocatoria_id;
      const nombre = p.convocatoria_postulacion?.nombre_convocatoria || `Convocatoria ${id}`;
      const estado = p.convocatoria_postulacion?.estado_convocatoria;
      if (!map.has(id)) {
        map.set(id, { id, nombre, estado, postulantes: [p] });
      } else {
        map.get(id)!.postulantes.push(p);
      }
    });
    return Array.from(map.values());
  }, [datosFiltrados]);

  // Stats para las tarjetas â basadas en el total sin filtros para mostrar el universo completo
  const totalAvaladosTH = useMemo(
    () => postulaciones.filter((p) => {
      return avalesTHLocal[`${p.convocatoria_id}_${p.user_id}`] ?? (p.aval_th_aprobado === true);
    }).length,
    [postulaciones, avalesTHLocal]
  );
  const totalPendientesTH = postulaciones.length - totalAvaladosTH;
  const totalConvocatoriasUnicas = useMemo(
    () => new Set(postulaciones.map((p) => p.convocatoria_id)).size,
    [postulaciones]
  );

  const handleFiltroAval = (valor: "all" | "avalado" | "pendiente") => {
    setFiltroAval(prev => prev === valor ? "all" : valor);
  };

  const postulantesModal = useMemo(() => {
    if (!modalConvocatoria) return [] as Postulaciones[];
    return datosFiltrados.filter((p) => p.convocatoria_id === modalConvocatoria.id);
  }, [datosFiltrados, modalConvocatoria]);

  const postulantesModalFiltrados = useMemo(() => {
    if (!modalSearch.trim()) return postulantesModal;
    const q = modalSearch.toLowerCase();
    return postulantesModal.filter((p) => {
      const nombre = `${p.usuario_postulacion.primer_nombre ?? ""} ${p.usuario_postulacion.primer_apellido ?? ""}`.toLowerCase();
      const id = (p.usuario_postulacion.numero_identificacion ?? "").toLowerCase();
      return nombre.includes(q) || id.includes(q);
    });
  }, [postulantesModal, modalSearch]);

  const totalModalPages = useMemo(() => {
    return Math.max(1, Math.ceil(postulantesModalFiltrados.length / modalPageSize));
  }, [postulantesModalFiltrados.length, modalPageSize]);

  const postulantesModalPaginados = useMemo(() => {
    const start = (modalPage - 1) * modalPageSize;
    return postulantesModalFiltrados.slice(start, start + modalPageSize);
  }, [postulantesModalFiltrados, modalPage, modalPageSize]);

  // Renderiza el contenido del componente
  return (
    <>
    <div className="min-h-screen bg-gradient-to-br from-[#1e3a5f]/30 via-white to-[#1e3a5f]/10 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header principal */}
        <div className="bg-white rounded-2xl shadow-lg border border-[rgba(30,58,95,0.09)] p-6 md:p-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-3">
                <Link to={"/talento-humano"}>
                  <ButtonRegresar />
                </Link>
                <div className="relative">
                  <div className="p-3 bg-gradient-to-br from-[#1e3a5f] to-[#152a45] rounded-xl shadow-lg">
                    <User className="h-7 w-7 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 h-3 w-3 bg-[#c89b14] rounded-full border-2 border-white animate-pulse"></div>
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#152a45] to-[#0f1f33] bg-clip-text text-transparent">
                    Gestión de Postulaciones
                  </h1>
                  <p className="text-[#2c3e50] mt-1">Administra las postulaciones por convocatoria</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              <button
                onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : prev === 'desc' ? null : 'asc')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all text-sm bg-white border border-[#1e3a5f]/50 text-[#1e3a5f] hover:bg-[#1e3a5f]/10 hover:shadow"
                title="Ordenar por fecha"
              >
                {sortOrder === 'asc' ? 'Fecha ↑' : sortOrder === 'desc' ? 'Fecha ↓' : 'Ordenar Fecha'}
              </button>
              <button
                onClick={() => setSortByPuntaje(prev => prev === 'desc' ? null : 'desc')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all text-sm border ${sortByPuntaje === 'desc' ? 'bg-[#c89b14] border-[#c89b14] text-white shadow' : 'bg-white border-[#c89b14]/50 text-[#c89b14] hover:bg-[#c89b14]/10 hover:shadow'}`}
                title="Ordenar por puntaje de aptitud"
              >
                {sortByPuntaje === 'desc' ? '? Puntaje ?' : '? Por Puntaje'}
              </button>
              <button
                onClick={() => exportToCSV(datosFiltrados)}
                disabled={datosFiltrados.length === 0}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                  datosFiltrados.length === 0
                    ? "bg-[#ede6d8] text-[#6b7a8d] cursor-not-allowed"
                    : "bg-white border border-[#1e3a5f]/50 text-[#1e3a5f] hover:bg-[#1e3a5f]/10 hover:shadow"
                }`}
              >
                <FileDown className="h-4 w-4" />
                <span className="hidden sm:inline">Exportar CSV</span>
              </button>
            </div>
          </div>

          {/* Stats cards — funcionan como filtros de aval */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Total */}
            <button
              onClick={() => handleFiltroAval("all")}
              className={`text-left rounded-xl p-4 border-2 transition-all duration-200 hover:shadow-md ${
                filtroAval === "all"
                  ? "bg-[#1e3a5f] border-[#1e3a5f] text-white shadow-lg shadow-[#1e3a5f]/20"
                  : "bg-[#1e3a5f]/10 border-[#1e3a5f]/30 text-[#152a45] hover:border-[#1e3a5f]/50"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <User className={`h-4 w-4 ${filtroAval === "all" ? "text-[#ede6d8]" : "text-[#1e3a5f]"}`} />
                <p className={`text-xs font-semibold uppercase tracking-wide ${filtroAval === "all" ? "text-[#ede6d8]" : "text-[#1e3a5f]"}`}>
                  Total
                </p>
              </div>
              <p className={`text-3xl font-bold ${filtroAval === "all" ? "text-white" : "text-[#152a45]"}`}>
                {postulaciones.length}
              </p>
              {filtroAval === "all" && (
                <p className="text-xs text-[#ede6d8] mt-1">Filtro activo</p>
              )}
            </button>

            {/* Avalados TH */}
            <button
              onClick={() => handleFiltroAval("avalado")}
              className={`text-left rounded-xl p-4 border-2 transition-all duration-200 hover:shadow-md ${
                filtroAval === "avalado"
                  ? "bg-[#c89b14] border-[#c89b14] text-white shadow-lg shadow-[#c89b14]/20"
                  : "bg-[#c89b14]/10 border-[#c89b14]/30 text-[#a67c0a] hover:border-[#c89b14]/50"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className={`h-4 w-4 ${filtroAval === "avalado" ? "text-[#ede6d8]" : "text-[#c89b14]"}`} />
                <p className={`text-xs font-semibold uppercase tracking-wide ${filtroAval === "avalado" ? "text-[#ede6d8]" : "text-[#c89b14]"}`}>
                  Avalados TH
                </p>
              </div>
              <p className={`text-3xl font-bold ${filtroAval === "avalado" ? "text-white" : "text-[#a67c0a]"}`}>
                {totalAvaladosTH}
              </p>
              {filtroAval === "avalado" && (
                <p className="text-xs text-[#ede6d8] mt-1">Filtro activo — clic para quitar</p>
              )}
            </button>

            {/* Pendientes */}
            <button
              onClick={() => handleFiltroAval("pendiente")}
              className={`text-left rounded-xl p-4 border-2 transition-all duration-200 hover:shadow-md ${
                filtroAval === "pendiente"
                  ? "bg-[#e8740e] border-[#e8740e] text-white shadow-lg shadow-[#e8740e]/20"
                  : "bg-[#e8740e]/10 border-[#e8740e]/30 text-[#c65a00] hover:border-[#e8740e]/50"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <XCircle className={`h-4 w-4 ${filtroAval === "pendiente" ? "text-[#ede6d8]" : "text-[#e8740e]"}`} />
                <p className={`text-xs font-semibold uppercase tracking-wide ${filtroAval === "pendiente" ? "text-[#ede6d8]" : "text-[#e8740e]"}`}>
                  Pendientes
                </p>
              </div>
              <p className={`text-3xl font-bold ${filtroAval === "pendiente" ? "text-white" : "text-[#c65a00]"}`}>
                {totalPendientesTH}
              </p>
              {filtroAval === "pendiente" && (
                <p className="text-xs text-[#ede6d8] mt-1">Filtro activo — clic para quitar</p>
              )}
            </button>

            {/* Convocatorias (info only) */}
            <div className="text-left rounded-xl p-4 border-2 bg-[#1e3a5f]/10 border-[#1e3a5f]/30">
              <div className="flex items-center gap-2 mb-1">
                <Briefcase className="h-4 w-4 text-[#1e3a5f]" />
                <p className="text-xs font-semibold uppercase tracking-wide text-[#1e3a5f]">Convocatorias</p>
              </div>
              <p className="text-3xl font-bold text-[#152a45]">{totalConvocatoriasUnicas}</p>
            </div>
          </div>
        </div>

        {/* Filtros secundarios */}
        <div className="bg-white rounded-2xl shadow border border-[rgba(30,58,95,0.09)] px-6 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div>
              <label className="text-sm font-semibold text-[#2c3e50] mb-1 block">Convocatoria</label>
              <select
                value={selectedConvocatoriaId ?? ""}
                onChange={(e) => setSelectedConvocatoriaId(e.target.value ? Number(e.target.value) : null)}
                className="w-full p-2 border border-[rgba(30,58,95,0.09)] rounded-lg bg-white text-sm focus:ring-2 focus:ring-[#1e3a5f]/30 focus:border-[#1e3a5f]/50 outline-none"
              >
                <option value="">Todas las convocatorias</option>
                {convocatorias.map((c) => (
                  <option key={c.id} value={c.id}>{c.nombre} ({c.count})</option>
                ))}
              </select>
            </div>

            <div className="min-w-0">
              <label className="text-sm font-semibold text-[#2c3e50] mb-1 block">Buscar postulante</label>
              <InputSearch
                type="text"
                placeholder="Nombre o identificación..."
                value={nameFilter}
                onChange={(e) => setNameFilter(e.target.value)}
                containerClass="w-full"
                className="!w-full"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-[#2c3e50] mb-1 block">Desde</label>
              <input
                type="date"
                className="w-full p-2 border border-[rgba(30,58,95,0.09)] rounded-lg text-sm focus:ring-2 focus:ring-[#1e3a5f]/30 focus:border-[#1e3a5f]/50 outline-none"
                value={dateFrom ?? ""}
                onChange={(e) => setDateFrom(e.target.value || null)}
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-[#2c3e50] mb-1 block">Hasta</label>
              <input
                type="date"
                className="w-full p-2 border border-[rgba(30,58,95,0.09)] rounded-lg text-sm focus:ring-2 focus:ring-[#1e3a5f]/30 focus:border-[#1e3a5f]/50 outline-none"
                value={dateTo ?? ""}
                onChange={(e) => setDateTo(e.target.value || null)}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-4 pt-4 border-t border-[rgba(30,58,95,0.09)]">
            <div className="w-full sm:w-96 min-w-0">
              <InputSearch
                type="text"
                placeholder="Buscar por nombre, convocatoria, estado..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                containerClass="w-full"
                className="!w-full"
              />
            </div>
            <p className="text-sm text-[#6b7a8d] ml-auto">
              Mostrando <span className="font-semibold text-[#1e3a5f]">{convocatoriasAgrupadas.length}</span> convocatoria(s) con{" "}
              <span className="font-semibold text-[#1e3a5f]">{datosFiltrados.length}</span> postulante(s)
              {filtroAval !== "all" && (
                <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-medium bg-[#1e3a5f]/20 text-[#1e3a5f]">
                  Filtro: {filtroAval === "avalado" ? "Avalados" : "Pendientes"}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Grid de tarjetas de convocatorias */}
        <div className="bg-white rounded-2xl shadow-lg border border-[rgba(30,58,95,0.09)] p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1e3a5f]"></div>
              <p className="text-[#6b7a8d] text-sm">Cargando postulaciones...</p>
            </div>
          ) : convocatoriasAgrupadas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-[#6b7a8d] gap-3">
              <User className="h-14 w-14 text-[#6b7a8d]" />
              <p className="text-lg font-semibold text-[#6b7a8d]">No hay postulaciones</p>
              <p className="text-sm">
                {filtroAval !== "all" || globalFilter || nameFilter || selectedConvocatoriaId
                  ? "Prueba ajustando los filtros de búsqueda"
                  : "Aún no hay postulaciones registradas"}
              </p>
              {(filtroAval !== "all" || globalFilter || nameFilter || selectedConvocatoriaId) && (
                <button
                  onClick={() => { setFiltroAval("all"); setGlobalFilter(""); setNameFilter(""); setSelectedConvocatoriaId(null); setDateFrom(null); setDateTo(null); }}
                  className="mt-2 px-4 py-2 text-sm text-[#1e3a5f] border border-[#1e3a5f]/50 rounded-lg hover:bg-[#1e3a5f]/10 transition-colors"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {convocatoriasAgrupadas.map((conv) => (
                <div
                  key={conv.id}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-[rgba(30,58,95,0.09)] hover:border-[#1e3a5f]/30 overflow-hidden flex flex-col group"
                >
                  {/* Header de la card */}
                  <div className="bg-gradient-to-r from-[#152a45] to-[#152a45] px-6 py-4 text-white flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-[#ede6d8] uppercase tracking-wider mb-1">
                        {conv.postulantes.length} postulante(s)
                      </p>
                      <h3 className="text-base font-bold line-clamp-2 leading-snug">{conv.nombre}</h3>
                    </div>
                    {conv.estado && (
                      <span className={`ml-3 flex-shrink-0 px-2 py-1 text-xs font-semibold rounded-full ${
                        conv.estado.toLowerCase() === "abierta"
                          ? "bg-[#c89b14]/20 text-[#a67c0a]"
                          : conv.estado.toLowerCase() === "cerrada"
                          ? "bg-[#e8740e]/20 text-[#e8740e]"
                          : "bg-[#e8740e]/20 text-[#c65a00]"
                      }`}>
                        {conv.estado}
                      </span>
                    )}
                  </div>

                  {/* Contenido */}
                  <div className="px-5 py-4 flex-1 space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-[#1e3a5f] flex-shrink-0" />
                      <span className="text-[#2c3e50]">{conv.postulantes.length} postulante(s) en esta convocatoria</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-[#c89b14] flex-shrink-0" />
                      <span className="text-[#2c3e50]">
                        {conv.postulantes.filter((p) => {
                          return avalesTHLocal[`${p.convocatoria_id}_${p.user_id}`] ?? (p.aval_th_aprobado === true);
                        }).length} avalado(s) TH
                      </span>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="bg-[#f3ede1]/50 px-5 py-3 border-t border-[rgba(30,58,95,0.09)]">
                    <button
                      onClick={() => {
                        setCerrandoModalConvocatoria(false);
                        setModalSearch("");
                        setModalPage(1);
                        setModalConvocatoria({ id: conv.id, nombre: conv.nombre });
                      }}
                      className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-[#1e3a5f]/10 text-[#1e3a5f] rounded-lg hover:bg-[#1e3a5f]/20 transition-colors font-medium text-xs border border-[#1e3a5f]/30"
                    >
                      <User className="h-3.5 w-3.5" />
                      Ver postulantes
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      {/* Modal de postulantes por convocatoria */}
      {modalConvocatoria && (
        <div className={`modal-overlay fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-2 sm:p-4 overflow-y-auto ${cerrandoModalConvocatoria ? "modal-exit" : ""}`}>
          <div className={`modal-content bg-white rounded-xl shadow-2xl w-full max-w-7xl my-2 min-h-[85vh] flex flex-col ${cerrandoModalConvocatoria ? "modal-exit" : ""}`}>
            <div className="flex items-center justify-between p-5 border-b">
              <div>
                <h2 className="text-xl font-bold text-[#2c3e50]">
                  Postulantes - {modalConvocatoria.nombre}
                </h2>
                <p className="text-sm text-[#6b7a8d]">{postulantesModal.length} postulante(s)</p>
              </div>
              <button
                onClick={cerrarModalConvocatoria}
                className="text-[#6b7a8d] hover:text-[#2c3e50] p-2 rounded-lg"
                aria-label="Cerrar modal"
              >
                <X size={22} />
              </button>
            </div>

            <div className="p-5 flex-1 overflow-y-auto">
              {postulantesModal.length === 0 ? (
                <div className="text-center text-[#6b7a8d] py-10">No hay postulantes para esta convocatoria.</div>
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="w-full sm:max-w-md">
                      <InputSearch
                        type="text"
                        placeholder="Buscar postulante por nombre o identificación"
                        value={modalSearch}
                        onChange={(e) => {
                          setModalSearch(e.target.value);
                          setModalPage(1);
                        }}
                        className="w-full"
                      />
                    </div>
                    <div className="text-xs text-[#6b7a8d]">
                      {postulantesModalFiltrados.length} postulante(s) • Página {modalPage} de {totalModalPages}
                    </div>
                  </div>

                  {postulantesModalPaginados.map((p) => {
                    const yaContratado = usuariosContratados.includes(p.user_id);
                    const avaladoTH = avalesTHLocal[`${p.convocatoria_id}_${p.user_id}`] ?? (p.aval_th_aprobado === true);
                    return (
                      <div key={p.id_postulacion} className="border border-[rgba(30,58,95,0.09)] rounded-xl p-4 bg-white shadow-sm transition-all duration-200 hover:shadow-md hover:border-[#1e3a5f]/30">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#1e3a5f]/10 flex items-center justify-center text-[#1e3a5f]">
                              <User size={18} />
                            </div>
                            <div>
                              <h3 className="font-semibold text-[#2c3e50]">
                                {p.usuario_postulacion.primer_nombre} {p.usuario_postulacion.primer_apellido}
                              </h3>
                              <div className="text-sm text-[#6b7a8d]">
                                {p.usuario_postulacion.numero_identificacion} • {new Date(p.fecha_postulacion).toLocaleDateString()}
                              {p.usuario_postulacion.puntaje_aspirante != null && (<span className="ml-2 text-xs font-bold px-2 py-0.5 rounded-full bg-[#c89b14]/20 text-[#a67c0a]" title="Puntaje de aptitud">? {p.usuario_postulacion.puntaje_aspirante} pts</span>)}
                              </div>
                              <div className="mt-1">
                                <span
                                  className={`text-xs px-2 py-1 rounded-full ${
                                    avaladoTH
                                      ? 'bg-[#c89b14]/20 text-[#c89b14]'
                                      : p.estado_postulacion === 'Rechazada'
                                      ? 'bg-[#e8740e]/20 text-[#e8740e]'
                                      : 'bg-[#e8740e]/20 text-[#e8740e]'
                                  }`}
                                >
                                  {avaladoTH ? 'Avalado TH' : (p.estado_postulacion || 'Enviada')}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="relative">
                            <button
                              onClick={() => setOpenActionsId(openActionsId === p.id_postulacion ? null : p.id_postulacion)}
                              className="inline-flex items-center gap-1 bg-[#1e3a5f] text-white px-3 py-2 rounded-md hover:bg-[#152a45] transition-colors duration-200 text-sm font-medium"
                            >
                              Acciones
                              <ChevronDown size={14} className={`transition-transform duration-150 ${openActionsId === p.id_postulacion ? 'rotate-180' : ''}`} />
                            </button>
                            {openActionsId === p.id_postulacion && (
                              <div className="absolute right-0 top-full mt-1 z-20 bg-white border border-[rgba(30,58,95,0.09)] rounded-lg shadow-lg w-52 py-1">
                                <button
                                  onClick={() => { handleVerHojaVida(p.convocatoria_id, p.user_id); setOpenActionsId(null); }}
                                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[#2c3e50] hover:bg-[#f3ede1]/50"
                                >
                                  <FileText size={14} className="text-[#1e3a5f]" />
                                  Hoja de Vida
                                </button>
                                <button
                                  onClick={() => { setPerfilPuntaje(null); verPerfilCompleto(p.user_id, p.convocatoria_id); setOpenActionsId(null); }}
                                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[#2c3e50] hover:bg-[#f3ede1]/50"
                                >
                                  <User size={14} className="text-[#1e3a5f]" />
                                  Ver perfil
                                </button>
                                <div className="border-t border-[rgba(30,58,95,0.09)] my-1" />
                                {!avaladoTH && avalesInicialesCargados && (
                                  <button
                                    onClick={async () => { await handleAvalTalentoHumano(p.user_id, p.convocatoria_id); setAvalesTHLocal((prev) => ({ ...prev, [`${p.convocatoria_id}_${p.user_id}`]: true })); setOpenActionsId(null); }}
                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[#c89b14] hover:bg-[#c89b14]/10"
                                  >
                                    <CheckCircle size={14} />
                                    Dar aval TH
                                  </button>
                                )}
                                <button
                                  onClick={() => { handleRechazarAval(p.user_id, p.convocatoria_id); setOpenActionsId(null); }}
                                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[#e8740e] hover:bg-[#e8740e]/10"
                                >
                                  <XCircle size={14} />
                                  Rechazar
                                </button>
                                {p.estado_postulacion === "Aceptada" && (
                                  yaContratado ? (
                                    <Link
                                      to={`/talento-humano/contrataciones/usuario/${p.user_id}`}
                                      onClick={() => setOpenActionsId(null)}
                                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[#c89b14] hover:bg-[#c89b14]/10"
                                    >
                                      Ver Contrato
                                    </Link>
                                  ) : (
                                    <Link
                                      to={`/talento-humano/contrataciones/contratacion/${p.user_id}`}
                                      onClick={() => setOpenActionsId(null)}
                                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[#c89b14] hover:bg-[#c89b14]/10"
                                    >
                                      Contratar
                                    </Link>
                                  )
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t">
                    <button
                      onClick={() => setModalPage((p) => Math.max(1, p - 1))}
                      disabled={modalPage <= 1}
                      className="px-3 py-2 rounded-lg bg-[#f3ede1] hover:bg-[#ede6d8] text-[#2c3e50] text-sm disabled:opacity-50 transition-colors duration-200"
                    >
                      Anterior
                    </button>
                    <div className="text-xs text-[#6b7a8d]">
                      Página {modalPage} de {totalModalPages}
                    </div>
                    <button
                      onClick={() => setModalPage((p) => Math.min(totalModalPages, p + 1))}
                      disabled={modalPage >= totalModalPages}
                      className="px-3 py-2 rounded-lg bg-[#f3ede1] hover:bg-[#ede6d8] text-[#2c3e50] text-sm disabled:opacity-50 transition-colors duration-200"
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Perfil Completo */}
      {mostrarPerfilCompleto && perfilCompleto && (
        <div className={`modal-overlay fixed inset-0 bg-black/50 z-50 p-2 sm:p-4 overflow-y-auto ${cerrandoPerfilCompleto ? "modal-exit" : ""}`}>
          <div className={`modal-content bg-white rounded-xl shadow-2xl w-full max-w-5xl mx-auto my-4 sm:my-8 ${cerrandoPerfilCompleto ? "modal-exit" : ""}`}>
            <div className="bg-gradient-to-r from-[#152a45] to-[#152a45] text-white p-4 sm:p-6 rounded-t-xl">
              <div className="flex justify-between items-start gap-2">
                <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
                  {perfilCompleto.datos_personales.foto_perfil_url ? (
                    <img
                      src={perfilCompleto.datos_personales.foto_perfil_url}
                      alt="Foto"
                      className="w-14 h-14 sm:w-20 sm:h-20 rounded-full object-cover border-4 border-white shadow-lg shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-[#1e3a5f] flex items-center justify-center border-4 border-white shadow-lg shrink-0">
                      <User size={32} />
                    </div>
                  )}
                  <div className="min-w-0">
                    <h2 className="text-lg sm:text-2xl font-bold break-words leading-tight">
                      {perfilCompleto.datos_personales.primer_nombre} {perfilCompleto.datos_personales.segundo_nombre || ''} {perfilCompleto.datos_personales.primer_apellido} {perfilCompleto.datos_personales.segundo_apellido || ''}
                    </h2>
                    <p className="text-[#ede6d8] mt-1 text-sm">
                      {perfilCompleto.datos_personales.tipo_identificacion}: {perfilCompleto.datos_personales.numero_identificacion}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2 text-sm">
                      <span className="flex items-center gap-1 break-all">
                        <Mail size={14} className="shrink-0" />
                        {perfilCompleto.datos_personales.email}
                      </span>
                    </div>
                    {perfilPuntaje != null && (
                      <div className="mt-3 inline-flex items-center gap-2 bg-[#c89b14]/20 border border-[#c89b14]/50 rounded-xl px-4 py-2">
                        <span className="text-[#ede6d8] text-lg">?</span>
                        <div>
                          <p className="text-xs text-[#ede6d8] font-medium uppercase tracking-wide">Puntaje de aptitud</p>
                          <p className="text-2xl font-bold text-white leading-none">{perfilPuntaje} <span className="text-sm font-normal text-[#ede6d8]">pts</span></p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <button onClick={cerrarPerfilCompleto} className="text-white hover:bg-[#0f1f33] p-2 rounded-lg shrink-0">
                  <X size={24} />
                </button>
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                <button
                  onClick={() => handleDescargarHojaAspirante(perfilCompleto.id)}
                  disabled={loadingPerfil}
                  className={`bg-white text-[#1e3a5f] px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 ${loadingPerfil ? 'opacity-60 cursor-not-allowed' : 'hover:bg-[#1e3a5f]/10'}`}
                >
                  {loadingPerfil ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
                  Descargar Hoja de Vida
                </button>
                <button
                  onClick={() => setIaOpen(true)}
                  className="bg-[#1e3a5f] hover:bg-[#1e3a5f]/70 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2"
                >
                  <Sparkles size={16} />
                  Asistente IA
                </button>
              </div>

              {/* Validar todos los documentos con IA */}
              {(() => {
                const docs: DocumentoParaValidar[] = [];
                const addDoc = (arr: Array<{ archivo_url?: string; url?: string; archivo?: string } | undefined> | undefined, etiqueta: string, tipo: string) => {
                  const doc = arr?.find(d => d?.archivo_url || d?.url);
                  const url = doc?.archivo_url ?? doc?.url ?? (doc?.archivo ? `${window.location.origin}/storage/${doc.archivo}` : null);
                  if (url) docs.push({ url, tipo, etiqueta, nombreArchivo: doc?.archivo });
                };

                if (perfilCompleto.eps?.documentosEps?.length)
                  addDoc(perfilCompleto.eps.documentosEps, 'EPS', `certificado de afiliación a EPS ${perfilCompleto.eps.nombre_eps ?? ''}`);
                if (perfilCompleto.rut?.documentosRut?.length)
                  addDoc(perfilCompleto.rut.documentosRut, 'RUT', `documento RUT ${perfilCompleto.rut.numero_rut ?? ''}`);
                if (perfilCompleto.arl?.documentosArl?.length)
                  addDoc(perfilCompleto.arl.documentosArl, 'ARL', `certificado de afiliación a ARL ${perfilCompleto.arl.nombre_arl ?? ''}`);
                if (perfilCompleto.certificacion_bancaria?.documentosCertificacionBancaria?.length)
                  addDoc(perfilCompleto.certificacion_bancaria.documentosCertificacionBancaria, 'Certificación Bancaria', `certificación bancaria del banco ${perfilCompleto.certificacion_bancaria.nombre_banco ?? ''}, cuenta tipo ${perfilCompleto.certificacion_bancaria.tipo_cuenta ?? ''}`);
                if (perfilCompleto.pension?.documentosPension?.length)
                  addDoc(perfilCompleto.pension.documentosPension, 'Pensión', `certificado pensional de ${perfilCompleto.pension.entidad_pensional ?? 'entidad pensional'}`);
                if (perfilCompleto.antecedente_judicial?.documentosAntecedentesJudiciales?.length)
                  addDoc(perfilCompleto.antecedente_judicial.documentosAntecedentesJudiciales, 'Antecedentes Judiciales', 'certificado de antecedentes judiciales');
                perfilCompleto.estudios?.forEach((est, i) => {
                  addDoc(est.documentos_estudio ?? est.documentosEstudio, `Estudio ${i + 1}: ${est.titulo ?? est.nivel_educativo ?? ''}`, `certificado académico de ${est.nivel_educativo ?? 'estudio'} "${est.titulo ?? ''}" en ${est.institucion ?? ''}`);
                });
                perfilCompleto.experiencias?.forEach((exp, i) => {
                  addDoc(exp.documentos_experiencia ?? exp.documentosExperiencia, `Experiencia ${i + 1}: ${exp.cargo ?? ''}`, `certificado de experiencia laboral como ${exp.cargo ?? ''} en ${exp.empresa ?? ''}`);
                });
                perfilCompleto.idiomas?.forEach((id, i) => {
                  addDoc(id.documentos_idioma ?? id.documentosIdioma, `Idioma ${i + 1}: ${id.idioma ?? ''}`, `certificado de idioma ${id.idioma ?? ''} nivel ${id.nivel ?? ''}`);
                });

                return docs.length > 0 ? (
                  <div className="mt-3">
                    <ValidarTodosIA documentos={docs} />
                  </div>
                ) : null;
              })()}
            </div>

            <div className="p-4 sm:p-6 max-h-[65vh] sm:max-h-[calc(100vh-250px)] overflow-y-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-[#f3ede1]/50 p-4 rounded-lg">
                  <h3 className="text-lg font-bold text-[#2c3e50] mb-3 flex items-center gap-2">
                    <User size={20} className="text-[#1e3a5f]" />
                    Datos Personales
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <span className="font-semibold text-[#2c3e50]">Género:</span>
                      <span>{perfilCompleto.datos_personales.genero}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <span className="font-semibold text-[#2c3e50]">Fecha Nacimiento:</span>
                      <span>{perfilCompleto.datos_personales.fecha_nacimiento}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <span className="font-semibold text-[#2c3e50]">Estado Civil:</span>
                      <span>{perfilCompleto.datos_personales.estado_civil}</span>
                    </div>
                    {perfilCompleto.datos_personales.municipio && (
                      <div className="grid grid-cols-2 gap-2">
                        <span className="font-semibold text-[#2c3e50]">Ubicación:</span>
                        <span>{perfilCompleto.datos_personales.municipio}, {perfilCompleto.datos_personales.departamento}</span>
                      </div>
                    )}
                  </div>
                </div>

                {perfilCompleto.informacion_contacto && (
                  <div className="bg-[#f3ede1]/50 p-4 rounded-lg">
                    <h3 className="text-lg font-bold text-[#2c3e50] mb-3 flex items-center gap-2">
                      <Phone size={20} className="text-[#1e3a5f]" />
                      Contacto
                    </h3>
                    <div className="space-y-2 text-sm">
                      {perfilCompleto.informacion_contacto.telefono && (
                        <div className="grid grid-cols-2 gap-2">
                          <span className="font-semibold text-[#2c3e50]">Teléfono:</span>
                          <span>{perfilCompleto.informacion_contacto.telefono}</span>
                        </div>
                      )}
                      {perfilCompleto.informacion_contacto.celular && (
                        <div className="grid grid-cols-2 gap-2">
                          <span className="font-semibold text-[#2c3e50]">Celular:</span>
                          <span>{perfilCompleto.informacion_contacto.celular}</span>
                        </div>
                      )}
                      {perfilCompleto.informacion_contacto.direccion && (
                        <div className="grid grid-cols-2 gap-2">
                          <span className="font-semibold text-[#2c3e50]">Dirección:</span>
                          <span>{perfilCompleto.informacion_contacto.direccion}</span>
                        </div>
                      )}
                      {perfilCompleto.informacion_contacto.barrio && (
                        <div className="grid grid-cols-2 gap-2">
                          <span className="font-semibold text-[#2c3e50]">Barrio:</span>
                          <span>{perfilCompleto.informacion_contacto.barrio}</span>
                        </div>
                      )}
                      {perfilCompleto.informacion_contacto.correo_alterno && (
                        <div className="grid grid-cols-2 gap-2">
                          <span className="font-semibold text-[#2c3e50]">Correo Alterno:</span>
                          <span className="break-all">{perfilCompleto.informacion_contacto.correo_alterno}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {(perfilCompleto.eps || perfilCompleto.rut) && (
                  <div className="bg-[#f3ede1]/50 p-4 rounded-lg">
                    <h3 className="text-lg font-bold text-[#2c3e50] mb-3">Info Adicional</h3>
                    <div className="space-y-2">
                      {perfilCompleto.eps?.nombre_eps && (
                        <button
                          type="button"
                          onClick={() => handleAbrirDocumentoDeLista(perfilCompleto.eps!.documentosEps)}
                          className="bg-white p-3 rounded border text-left w-full hover:bg-[#1e3a5f]/10 transition-colors cursor-pointer text-sm"
                        >
                          <div className="grid grid-cols-2 gap-2">
                            <span className="font-semibold text-[#2c3e50]">EPS:</span>
                            <span>{perfilCompleto.eps.nombre_eps}</span>
                          </div>
                          {perfilCompleto.eps.tipo_afiliacion && (
                            <div className="grid grid-cols-2 gap-2 mt-1">
                              <span className="font-semibold text-[#2c3e50]">Tipo:</span>
                              <span>{perfilCompleto.eps.tipo_afiliacion}</span>
                            </div>
                          )}
                          {perfilCompleto.eps.estado_afiliacion && (
                            <div className="grid grid-cols-2 gap-2 mt-1">
                              <span className="font-semibold text-[#2c3e50]">Estado:</span>
                              <span>{perfilCompleto.eps.estado_afiliacion}</span>
                            </div>
                          )}
                          {perfilCompleto.eps.documentosEps?.[0]?.archivo_url && (
                            <ValidarDocumentoIA
                              documentoUrl={perfilCompleto.eps.documentosEps[0].archivo_url!}
                              tipoEsperado={`certificado de afiliación a EPS ${perfilCompleto.eps.nombre_eps}`}
                              nombreArchivo={perfilCompleto.eps.documentosEps[0].archivo}
                            />
                          )}
                        </button>
                      )}
                      {perfilCompleto.rut?.numero_rut && (
                        <button
                          type="button"
                          onClick={() => handleAbrirDocumentoDeLista(perfilCompleto.rut!.documentosRut)}
                          className="bg-white p-3 rounded border text-left w-full hover:bg-[#1e3a5f]/10 transition-colors cursor-pointer text-sm"
                        >
                          <div className="grid grid-cols-2 gap-2">
                            <span className="font-semibold text-[#2c3e50]">RUT:</span>
                            <span>{perfilCompleto.rut.numero_rut}</span>
                          </div>
                          {perfilCompleto.rut.razon_social && (
                            <div className="grid grid-cols-2 gap-2 mt-1">
                              <span className="font-semibold text-[#2c3e50]">Razón social:</span>
                              <span>{perfilCompleto.rut.razon_social}</span>
                            </div>
                          )}
                          {perfilCompleto.rut.tipo_persona && (
                            <div className="grid grid-cols-2 gap-2 mt-1">
                              <span className="font-semibold text-[#2c3e50]">Tipo persona:</span>
                              <span>{perfilCompleto.rut.tipo_persona}</span>
                            </div>
                          )}
                          {perfilCompleto.rut.documentosRut?.[0]?.archivo_url && (
                            <ValidarDocumentoIA
                              documentoUrl={perfilCompleto.rut.documentosRut[0].archivo_url!}
                              tipoEsperado={`documento RUT número ${perfilCompleto.rut.numero_rut}`}
                              nombreArchivo={perfilCompleto.rut.documentosRut[0].archivo}
                            />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                )}

                <div className="bg-[#f3ede1]/50 p-4 rounded-lg">
                  <h3 className="text-lg font-bold text-[#2c3e50] mb-3 flex items-center gap-2">
                    <Award size={20} className="text-[#1e3a5f]" />
                    Avales
                  </h3>
                  <div className="space-y-3">
                    <div className={`flex items-center justify-between p-2 rounded ${getAvalEstadoPerfil('talentoHumano') ? 'bg-[#c89b14]/20' : 'bg-[#e8740e]/20'}`}>
                      <span className="font-semibold text-sm">Talento Humano</span>
                      <span className={`text-sm flex items-center gap-1 ${getAvalEstadoPerfil('talentoHumano') ? 'text-[#c89b14]' : 'text-[#e8740e]'}`}>
                        {getAvalEstadoPerfil('talentoHumano') ? (<><CheckCircle size={16} /> Aprobado</>) : (<><XCircle size={16} /> Pendiente</>) }
                      </span>
                    </div>
                    <div className={`flex items-center justify-between p-2 rounded ${getAvalEstadoPerfil('coordinador') ? 'bg-[#c89b14]/20' : 'bg-[#e8740e]/20'}`}>
                      <span className="font-semibold text-sm">Coordinación</span>
                      <span className={`text-sm flex items-center gap-1 ${getAvalEstadoPerfil('coordinador') ? 'text-[#c89b14]' : 'text-[#e8740e]'}`}>
                        {getAvalEstadoPerfil('coordinador') ? (<><CheckCircle size={16} /> Aprobado</>) : (<><XCircle size={16} /> Pendiente</>)}
                      </span>
                    </div>
                    <div className={`flex items-center justify-between p-2 rounded ${getAvalEstadoPerfil('rectoria') ? 'bg-[#c89b14]/20' : 'bg-[#e8740e]/20'}`}>
                      <span className="font-semibold text-sm">Rectoría</span>
                      <span className={`text-sm flex items-center gap-1 ${getAvalEstadoPerfil('rectoria') ? 'text-[#c89b14]' : 'text-[#e8740e]'}`}>
                        {getAvalEstadoPerfil('rectoria') ? (<><CheckCircle size={16} /> Aprobado</>) : (<><XCircle size={16} /> Pendiente</>) }
                      </span>
                    </div>
                    <div className={`flex items-center justify-between p-2 rounded ${getAvalEstadoPerfil('vicerrectoria') ? 'bg-[#c89b14]/20' : 'bg-[#e8740e]/20'}`}>
                      <span className="font-semibold text-sm">Vicerrectoría</span>
                      <span className={`text-sm flex items-center gap-1 ${getAvalEstadoPerfil('vicerrectoria') ? 'text-[#c89b14]' : 'text-[#e8740e]'}`}>
                        {getAvalEstadoPerfil('vicerrectoria') ? (<><CheckCircle size={16} /> Aprobado</>) : (<><XCircle size={16} /> Pendiente</>)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Experiencias */}
              {perfilCompleto.experiencias && perfilCompleto.experiencias.length > 0 && (
                <div className="mt-6 bg-[#f3ede1]/50 p-4 rounded-lg">
                  <h3 className="text-lg font-bold text-[#2c3e50] mb-3 flex items-center gap-2">
                    <Briefcase size={20} className="text-[#1e3a5f]" />
                    Experiencia Laboral
                  </h3>
                  <div className="space-y-3">
                    {perfilCompleto.experiencias.map((exp, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() =>
                          void handleAbrirDocumentoPreferido(
                            exp.documentos_experiencia ?? exp.documentosExperiencia,
                            'experiencias'
                          )
                        }
                        className="bg-white p-4 rounded border text-left hover:bg-[#1e3a5f]/10 transition-colors cursor-pointer"
                      >
                        <h4 className="font-bold">{exp.cargo}</h4>
                        <p className="text-sm text-[#2c3e50]">{exp.empresa}</p>
                        <p className="text-xs text-[#6b7a8d] mt-1">
                          {exp.fecha_inicio} - {exp.fecha_fin || 'Actualidad'}
                        </p>
                        {exp.descripcion && <p className="text-sm mt-2">{exp.descripcion}</p>}
                        {(exp.documentos_experiencia ?? exp.documentosExperiencia)?.[0]?.archivo_url && (
                          <ValidarDocumentoIA
                            documentoUrl={(exp.documentos_experiencia ?? exp.documentosExperiencia)![0].archivo_url!}
                            tipoEsperado={`certificado de experiencia laboral - ${exp.cargo}`}
                            nombreArchivo={(exp.documentos_experiencia ?? exp.documentosExperiencia)![0].archivo}
                          />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Estudios */}
              {perfilCompleto.estudios && perfilCompleto.estudios.length > 0 && (
                <div className="mt-6 bg-[#f3ede1]/50 p-4 rounded-lg">
                  <h3 className="text-lg font-bold text-[#2c3e50] mb-3 flex items-center gap-2">
                    <GraduationCap size={20} className="text-[#1e3a5f]" />
                    Formación Académica
                  </h3>
                  <div className="space-y-3">
                    {perfilCompleto.estudios.map((est, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() =>
                          void handleAbrirDocumentoPreferido(
                            est.documentos_estudio ?? est.documentosEstudio,
                            'estudios'
                          )
                        }
                        className="bg-white p-4 rounded border text-left hover:bg-[#1e3a5f]/10 transition-colors cursor-pointer"
                      >
                        <h4 className="font-bold">{est.titulo}</h4>
                        <p className="text-sm text-[#2c3e50]">{est.institucion}</p>
                        <p className="text-xs text-[#6b7a8d]">{est.nivel_educativo}</p>
                        <p className="text-xs text-[#6b7a8d] mt-1">{est.fecha_inicio} - {est.fecha_fin || 'En curso'}</p>
                        {(est.documentos_estudio ?? est.documentosEstudio)?.[0]?.archivo_url && (
                          <ValidarDocumentoIA
                            documentoUrl={(est.documentos_estudio ?? est.documentosEstudio)![0].archivo_url!}
                            tipoEsperado={`certificado académico - ${est.nivel_educativo ?? 'estudio'}`}
                            nombreArchivo={(est.documentos_estudio ?? est.documentosEstudio)![0].archivo}
                          />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Idiomas */}
              {perfilCompleto.idiomas && perfilCompleto.idiomas.length > 0 && (
                <div className="mt-6 bg-[#f3ede1]/50 p-4 rounded-lg">
                  <h3 className="text-lg font-bold text-[#2c3e50] mb-3 flex items-center gap-2">
                    <Globe size={20} className="text-[#1e3a5f]" />
                    Idiomas
                  </h3>
                  <div className="space-y-3">
                    {perfilCompleto.idiomas.map((idioma, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() =>
                          void handleAbrirDocumentoPreferido(
                            idioma.documentos_idioma ?? idioma.documentosIdioma,
                            'idiomas'
                          )
                        }
                        className="bg-white p-4 rounded border text-left hover:bg-[#1e3a5f]/10 transition-colors cursor-pointer"
                      >
                        <h4 className="font-bold">{idioma.idioma}</h4>
                        <p className="text-sm text-[#2c3e50]">Nivel: {idioma.nivel}</p>
                        {(idioma.documentos_idioma ?? idioma.documentosIdioma)?.[0]?.archivo_url && (
                          <ValidarDocumentoIA
                            documentoUrl={(idioma.documentos_idioma ?? idioma.documentosIdioma)![0].archivo_url!}
                            tipoEsperado={`certificado de idioma ${idioma.idioma} nivel ${idioma.nivel}`}
                            nombreArchivo={(idioma.documentos_idioma ?? idioma.documentosIdioma)![0].archivo}
                          />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
          {/* Certificación Bancaria */}
          {perfilCompleto.certificacion_bancaria && (
            <div className="mt-6 bg-[#f3ede1]/50 p-4 rounded-lg">
              <h3 className="text-lg font-bold text-[#2c3e50] mb-3 flex items-center gap-2">
                <Landmark size={20} className="text-[#1e3a5f]" />
                Certificación Bancaria
              </h3>
              <button
                type="button"
                onClick={() => handleAbrirDocumentoDeLista(perfilCompleto.certificacion_bancaria!.documentosCertificacionBancaria)}
                className="bg-white p-4 rounded border text-left w-full hover:bg-[#1e3a5f]/10 transition-colors cursor-pointer"
              >
                <div className="space-y-2 text-sm">
                  {perfilCompleto.certificacion_bancaria.nombre_banco && (
                    <div className="grid grid-cols-2 gap-2">
                      <span className="font-semibold text-[#2c3e50]">Banco:</span>
                      <span>{perfilCompleto.certificacion_bancaria.nombre_banco}</span>
                    </div>
                  )}
                  {perfilCompleto.certificacion_bancaria.tipo_cuenta && (
                    <div className="grid grid-cols-2 gap-2">
                      <span className="font-semibold text-[#2c3e50]">Tipo de cuenta:</span>
                      <span>{perfilCompleto.certificacion_bancaria.tipo_cuenta}</span>
                    </div>
                  )}
                  {perfilCompleto.certificacion_bancaria.numero_cuenta && (
                    <div className="grid grid-cols-2 gap-2">
                      <span className="font-semibold text-[#2c3e50]">Número de cuenta:</span>
                      <span>{perfilCompleto.certificacion_bancaria.numero_cuenta}</span>
                    </div>
                  )}
                  {perfilCompleto.certificacion_bancaria.fecha_emision && (
                    <div className="grid grid-cols-2 gap-2">
                      <span className="font-semibold text-[#2c3e50]">Fecha de emisión:</span>
                      <span>{perfilCompleto.certificacion_bancaria.fecha_emision}</span>
                    </div>
                  )}
                  {perfilCompleto.certificacion_bancaria.documentosCertificacionBancaria?.[0]?.archivo_url && (
                    <ValidarDocumentoIA
                      documentoUrl={perfilCompleto.certificacion_bancaria.documentosCertificacionBancaria[0].archivo_url!}
                      tipoEsperado={`certificación bancaria del banco ${perfilCompleto.certificacion_bancaria.nombre_banco ?? ''}, cuenta tipo ${perfilCompleto.certificacion_bancaria.tipo_cuenta ?? ''}`}
                      nombreArchivo={perfilCompleto.certificacion_bancaria.documentosCertificacionBancaria[0].archivo}
                    />
                  )}
                </div>
              </button>
            </div>
          )}

          {/* Pensión */}
          {perfilCompleto.pension && (
            <div className="mt-6 bg-[#f3ede1]/50 p-4 rounded-lg">
              <h3 className="text-lg font-bold text-[#2c3e50] mb-3 flex items-center gap-2">
                <PiggyBank size={20} className="text-[#1e3a5f]" />
                Pensión
              </h3>
              <button
                type="button"
                onClick={() => handleAbrirDocumentoDeLista(perfilCompleto.pension!.documentosPension)}
                className="bg-white p-4 rounded border text-left w-full hover:bg-[#1e3a5f]/10 transition-colors cursor-pointer"
              >
                <div className="space-y-2 text-sm">
                  {perfilCompleto.pension.regimen_pensional && (
                    <div className="grid grid-cols-2 gap-2">
                      <span className="font-semibold text-[#2c3e50]">Régimen:</span>
                      <span>{perfilCompleto.pension.regimen_pensional}</span>
                    </div>
                  )}
                  {perfilCompleto.pension.entidad_pensional && (
                    <div className="grid grid-cols-2 gap-2">
                      <span className="font-semibold text-[#2c3e50]">Entidad:</span>
                      <span>{perfilCompleto.pension.entidad_pensional}</span>
                    </div>
                  )}
                  {perfilCompleto.pension.nit_entidad && (
                    <div className="grid grid-cols-2 gap-2">
                      <span className="font-semibold text-[#2c3e50]">NIT:</span>
                      <span>{perfilCompleto.pension.nit_entidad}</span>
                    </div>
                  )}
                  {perfilCompleto.pension.documentosPension?.[0]?.archivo_url && (
                    <ValidarDocumentoIA
                      documentoUrl={perfilCompleto.pension.documentosPension[0].archivo_url!}
                      tipoEsperado={`certificado pensional de ${perfilCompleto.pension.entidad_pensional ?? 'entidad pensional'}`}
                      nombreArchivo={perfilCompleto.pension.documentosPension[0].archivo}
                    />
                  )}
                </div>
              </button>
            </div>
          )}

          {/* Antecedentes Judiciales */}
          {perfilCompleto.antecedente_judicial && (
            <div className="mt-6 bg-[#f3ede1]/50 p-4 rounded-lg">
              <h3 className="text-lg font-bold text-[#2c3e50] mb-3 flex items-center gap-2">
                <Scale size={20} className="text-[#1e3a5f]" />
                Antecedentes Judiciales
              </h3>
              <button
                type="button"
                onClick={() => handleAbrirDocumentoDeLista(perfilCompleto.antecedente_judicial!.documentosAntecedentesJudiciales)}
                className="bg-white p-4 rounded border text-left w-full hover:bg-[#1e3a5f]/10 transition-colors cursor-pointer"
              >
                <div className="space-y-2 text-sm">
                  {perfilCompleto.antecedente_judicial.estado_antecedentes && (
                    <div className="grid grid-cols-2 gap-2">
                      <span className="font-semibold text-[#2c3e50]">Estado:</span>
                      <span>{perfilCompleto.antecedente_judicial.estado_antecedentes}</span>
                    </div>
                  )}
                  {perfilCompleto.antecedente_judicial.fecha_validacion && (
                    <div className="grid grid-cols-2 gap-2">
                      <span className="font-semibold text-[#2c3e50]">Fecha validación:</span>
                      <span>{perfilCompleto.antecedente_judicial.fecha_validacion}</span>
                    </div>
                  )}
                  {perfilCompleto.antecedente_judicial.documentosAntecedentesJudiciales?.[0]?.archivo_url && (
                    <ValidarDocumentoIA
                      documentoUrl={perfilCompleto.antecedente_judicial.documentosAntecedentesJudiciales[0].archivo_url!}
                      tipoEsperado="certificado de antecedentes judiciales"
                      nombreArchivo={perfilCompleto.antecedente_judicial.documentosAntecedentesJudiciales[0].archivo}
                    />
                  )}
                </div>
              </button>
            </div>
          )}

          {/* Producción Académica */}
          {perfilCompleto.produccion_academica && perfilCompleto.produccion_academica.length > 0 && (
            <div className="mt-6 bg-[#f3ede1]/50 p-4 rounded-lg">
              <h3 className="text-lg font-bold text-[#2c3e50] mb-3 flex items-center gap-2">
                <BookOpen size={20} className="text-[#1e3a5f]" />
                Producción Académica
              </h3>
              <div className="space-y-3">
                {perfilCompleto.produccion_academica.map((prod, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() =>
                      void handleAbrirDocumentoPreferido(
                        prod.documentosProduccionAcademica,
                        'producciones'
                      )
                    }
                    className="bg-white p-4 rounded border text-left w-full hover:bg-[#1e3a5f]/10 transition-colors cursor-pointer"
                  >
                    <h4 className="font-bold">{prod.titulo}</h4>
                    {prod.medio_divulgacion && (
                      <p className="text-sm text-[#2c3e50]">Medio: {prod.medio_divulgacion}</p>
                    )}
                    {prod.numero_autores != null && (
                      <p className="text-sm text-[#6b7a8d]">Autores: {prod.numero_autores}</p>
                    )}
                    {prod.fecha_divulgacion && (
                      <p className="text-xs text-[#6b7a8d] mt-1">{prod.fecha_divulgacion}</p>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Aptitudes */}
          {perfilCompleto.aptitudes && perfilCompleto.aptitudes.length > 0 && (
            <div className="mt-6 bg-[#f3ede1]/50 p-4 rounded-lg">
              <h3 className="text-lg font-bold text-[#2c3e50] mb-3 flex items-center gap-2">
                <Lightbulb size={20} className="text-[#1e3a5f]" />
                Aptitudes
              </h3>
              <div className="flex flex-wrap gap-2">
                {perfilCompleto.aptitudes.map((apt, idx) => (
                  <span
                    key={idx}
                    className="bg-[#1e3a5f]/20 text-[#1e3a5f] px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {(apt as unknown as Record<string, string>)['nombre_aptitud'] ?? apt.nombre}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* ARL */}
          {perfilCompleto.arl && (
            <div className="mt-6 bg-[#f3ede1]/50 p-4 rounded-lg">
              <h3 className="text-lg font-bold text-[#2c3e50] mb-3 flex items-center gap-2">
                <ShieldCheck size={20} className="text-[#1e3a5f]" />
                ARL
              </h3>
              <button
                type="button"
                onClick={() => handleAbrirDocumentoDeLista(perfilCompleto.arl!.documentosArl)}
                className="bg-white p-4 rounded border text-left w-full hover:bg-[#1e3a5f]/10 transition-colors cursor-pointer"
              >
                <div className="space-y-2 text-sm">
                  {perfilCompleto.arl.nombre_arl && (
                    <div className="grid grid-cols-2 gap-2">
                      <span className="font-semibold text-[#2c3e50]">ARL:</span>
                      <span>{perfilCompleto.arl.nombre_arl}</span>
                    </div>
                  )}
                  {perfilCompleto.arl.clase_riesgo && (
                    <div className="grid grid-cols-2 gap-2">
                      <span className="font-semibold text-[#2c3e50]">Clase de riesgo:</span>
                      <span>{perfilCompleto.arl.clase_riesgo}</span>
                    </div>
                  )}
                  {perfilCompleto.arl.estado_afiliacion && (
                    <div className="grid grid-cols-2 gap-2">
                      <span className="font-semibold text-[#2c3e50]">Estado:</span>
                      <span>{perfilCompleto.arl.estado_afiliacion}</span>
                    </div>
                  )}
                  {perfilCompleto.arl.fecha_afiliacion && (
                    <div className="grid grid-cols-2 gap-2">
                      <span className="font-semibold text-[#2c3e50]">Fecha afiliación:</span>
                      <span>{perfilCompleto.arl.fecha_afiliacion}</span>
                    </div>
                  )}
                  {perfilCompleto.arl.fecha_retiro && (
                    <div className="grid grid-cols-2 gap-2">
                      <span className="font-semibold text-[#2c3e50]">Fecha retiro:</span>
                      <span>{perfilCompleto.arl.fecha_retiro}</span>
                    </div>
                  )}
                  {perfilCompleto.arl.documentosArl?.[0]?.archivo_url && (
                    <ValidarDocumentoIA
                      documentoUrl={perfilCompleto.arl.documentosArl[0].archivo_url!}
                      tipoEsperado={`certificado de afiliación a ARL ${perfilCompleto.arl.nombre_arl ?? ''}`}
                      nombreArchivo={perfilCompleto.arl.documentosArl[0].archivo}
                    />
                  )}
                </div>
              </button>
            </div>
          )}
              {/* Documentos */}
              {perfilCompleto.documentos && perfilCompleto.documentos.length > 0 && (
                <div className="mt-6 bg-[#f3ede1]/50 p-4 rounded-lg">
                  <h3 className="text-lg font-bold text-[#2c3e50] mb-3 flex items-center gap-2">
                    <FileDown size={20} className="text-[#1e3a5f]" />
                    Documentos
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {perfilCompleto.documentos.map((doc) => (
                      <button
                        key={doc.id}
                        type="button"
                        onClick={() => handleAbrirDocumento(doc.url)}
                        className="bg-white p-3 rounded border hover:bg-[#f3ede1]/50 flex items-center gap-2 text-left"
                      >
                        <FileText size={18} className="text-[#1e3a5f]" />
                        <span className="text-sm truncate">{doc.nombre}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="border-t p-4 bg-[#f3ede1]/50 flex justify-between items-center gap-2">
              <button
                onClick={() => perfilCompleto && handleRechazarAval(perfilCompleto.id, perfilConvocatoriaId ?? undefined)}
                className="px-4 py-2 bg-[#e8740e] text-white rounded-lg hover:bg-[#c65a00] text-sm flex items-center gap-2"
              >
                <XCircle size={14} />
                Rechazar
              </button>
              <button onClick={cerrarPerfilCompleto} className="px-6 py-2 bg-[#6b7a8d] text-white rounded-lg hover:bg-[#2c3e50]">Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de motivo de rechazo */}
      {modalRechazoOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70] p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-bold text-[#2c3e50] flex items-center gap-2">
                <XCircle className="text-[#e8740e]" size={20} />
                Rechazar aval de Talento Humano
              </h3>
              <button onClick={() => setModalRechazoOpen(false)} className="text-[#6b7a8d] hover:text-[#2c3e50] p-1 rounded">
                <X size={20} />
              </button>
            </div>
            <div className="p-4">
              <p className="text-sm text-[#2c3e50] mb-3">
                Indique el motivo por el cual se rechaza el aval. Esta información será enviada al aspirante por correo electrónico.
              </p>
              <textarea
                className="w-full border border-[rgba(30,58,95,0.09)] rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#e8740e]/30"
                rows={4}
                placeholder="Escriba el motivo de rechazo..."
                value={motivoRechazo}
                onChange={(e) => setMotivoRechazo(e.target.value)}
                maxLength={1000}
              />
              <p className="text-xs text-[#6b7a8d] text-right mt-1">{motivoRechazo.length}/1000</p>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t bg-[#f3ede1]/50 rounded-b-xl">
              <button
                onClick={() => setModalRechazoOpen(false)}
                className="px-4 py-2 rounded-lg bg-[#f3ede1] text-[#2c3e50] hover:bg-[#ede6d8] text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={() => void confirmarRechazo()}
                disabled={loadingRechazo || !motivoRechazo.trim()}
                className="px-4 py-2 rounded-lg bg-[#e8740e] text-white hover:bg-[#c65a00] text-sm flex items-center gap-2 disabled:opacity-50"
              >
                {loadingRechazo ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                Confirmar rechazo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Visor de documentos */}
      {visorUrl && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-3 border-b bg-[#f3ede1]/50 rounded-t-xl">
              <span className="text-sm font-semibold text-[#2c3e50]">Vista de documento</span>
              <div className="flex gap-2">
                <a
                  href={visorUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 px-3 py-1.5 text-xs bg-[#1e3a5f] text-white rounded-lg hover:bg-[#152a45]"
                >
                  <FileText size={13} /> Abrir en nueva pestaña
                </a>
                <button
                  onClick={() => setVisorUrl(null)}
                  className="p-1.5 text-[#6b7a8d] hover:text-[#2c3e50] hover:bg-[#ede6d8] rounded-lg"
                  aria-label="Cerrar visor"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            <iframe
              src={visorUrl}
              className="flex-1 w-full rounded-b-xl"
              title="Visor de documento"
            />
          </div>
        </div>
      )}
      </div>
    </div>

    {/* Asistente IA  flotante */}
    <ChatIAWidget
      convocatoriaId={perfilConvocatoriaId}
      aspiranteId={perfilCompleto?.id ?? null}
      aspiranteNombre={
        perfilCompleto
          ? `${perfilCompleto.datos_personales.primer_nombre} ${perfilCompleto.datos_personales.primer_apellido}`
          : null
      }
      open={iaOpen}
      onClose={() => setIaOpen(false)}
    />
    </>
  );
};

export default VerPostulaciones;