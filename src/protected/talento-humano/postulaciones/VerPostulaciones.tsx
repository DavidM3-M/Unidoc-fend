import InputSearch from "../../../componentes/formularios/InputSearch";
import { useEffect, useMemo, useState } from "react";
import axiosInstance from "../../../utils/axiosConfig";
import { toast } from "react-toastify";
import axios from "axios";
import Cookie from "js-cookie";

import { Link } from "react-router-dom";
import { ButtonRegresar } from "../../../componentes/formularios/ButtonRegresar";
import {
  User, FileText, CheckCircle, XCircle, Mail, Phone, Briefcase,
  GraduationCap, Award, FileDown, X, Loader2, Globe, Landmark,
  PiggyBank, Scale, ShieldCheck, AlertTriangle
} from "lucide-react";

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface Postulaciones {
  id_postulacion: number;
  convocatoria_id: number;
  user_id: number;
  nombre_postulante: string;
  estado_postulacion: string;
  aval_talento_humano?: boolean;
  fecha_postulacion: string;
  usuario_postulacion: {
    primer_nombre: string;
    primer_apellido: string;
    numero_identificacion: string;
  };
  convocatoria_postulacion: {
    nombre_convocatoria: string;
    estado_convocatoria: string;
  };
  avales?: {
    talentoHumano?: { estado?: boolean | string };
  };
}

interface Contratacion {
  id_contratacion: number;
  user_id: number;
  id_convocatoria?: number;
  tipo_contrato: string;
  area: string;
  fecha_inicio: string;
  fecha_fin: string;
  valor_contrato: number;
}

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
  eps?: { nombre_eps?: string };
  rut?: { numero_rut?: string };
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
  produccion_academica?: Array<{ titulo: string; tipo: string; fecha: string }>;
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

// ─── Componente Badge de Docente Activo ───────────────────────────────────────

const DocenteActivoBadge = () => (
  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-300 text-[10px] font-bold uppercase">
    <Briefcase size={9} className="stroke-[3px]" />
    Docente Activo
  </span>
);

// ─── Componente Banner de Advertencia Doble Contratación ─────────────────────

const DobleContratacionBanner = ({ contratacionesActivas }: { contratacionesActivas: number }) => (
  <div className="flex items-start gap-2 bg-amber-50 border border-amber-300 rounded-lg px-3 py-2 mt-2">
    <AlertTriangle size={14} className="text-amber-600 mt-0.5 shrink-0" />
    <p className="text-xs text-amber-700 leading-tight">
      <span className="font-bold">Doble contratación:</span> Este docente ya tiene{" "}
      <span className="font-bold">{contratacionesActivas}</span> contrato
      {contratacionesActivas > 1 ? "s" : ""} activo{contratacionesActivas > 1 ? "s" : ""}.
      Puede crear un nuevo contrato para esta convocatoria.
    </p>
  </div>
);

// ─── Componente Principal ─────────────────────────────────────────────────────

const VerPostulaciones = () => {
  const [postulaciones, setPostulaciones] = useState<Postulaciones[]>([]);
  // CAMBIO: Ahora guardamos el objeto completo de cada contratación para saber
  // cuántos contratos tiene un usuario y a qué convocatorias pertenecen.
  const [contratacionesPorUsuario, setContratacionesPorUsuario] = useState<Record<number, Contratacion[]>>({});

  const [globalFilter, setGlobalFilter] = useState("");
  const [avalesTHLocal, setAvalesTHLocal] = useState<Record<number, boolean>>({});
  const [avalesInicialesCargados, setAvalesInicialesCargados] = useState(false);
  const [selectedConvocatoriaId, setSelectedConvocatoriaId] = useState<number | null>(null);
  const [nameFilter, setNameFilter] = useState("");
  const [modalConvocatoria, setModalConvocatoria] = useState<{ id: number; nombre: string } | null>(null);
  const [cerrandoModalConvocatoria, setCerrandoModalConvocatoria] = useState(false);
  const [modalSearch, setModalSearch] = useState("");
  const [modalPage, setModalPage] = useState(1);
  const modalPageSize = 12;
  const [dateFrom, setDateFrom] = useState<string | null>(null);
  const [dateTo, setDateTo] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null);
  const [loading, setLoading] = useState(true);
  const [perfilCompleto, setPerfilCompleto] = useState<AspiranteDetallado | null>(null);
  const [mostrarPerfilCompleto, setMostrarPerfilCompleto] = useState(false);
  const [loadingPerfil, setLoadingPerfil] = useState(false);
  const [cerrandoPerfilCompleto, setCerrandoPerfilCompleto] = useState(false);
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

  // ─── Helpers de aval ────────────────────────────────────────────────────────

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

    if (role === 'talentoHumano' && perfilCompleto?.id && avalesTHLocal[perfilCompleto.id]) return true;
    return false;
  };

  // ─── Carga de datos ──────────────────────────────────────────────────────────

  useEffect(() => {
    async function fetchDatos() {
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
        setLoading(true);
        const [postulacionesRes, contratacionesRes] = await Promise.all([
          // CAMBIO: Usamos el endpoint que devuelve TODAS las postulaciones,
          // incluyendo la de docentes ya contratados (no filtra por estado Enviada).
          // Si tu backend tiene un endpoint específico para esto, úsalo aquí.
          axiosInstance.get("/talentoHumano/obtener-postulaciones"),
          axiosInstance.get("/talentoHumano/obtener-contrataciones"),
        ]);

        const postulacionesData = postulacionesRes.data.postulaciones as Postulaciones[];
        setPostulaciones(postulacionesData);

        const avalesIniciales = (postulacionesData ?? []).reduce((acc, item) => {
          const av = item.avales;
          const estadoRaw = item.aval_talento_humano ?? extractAvalEstadoInner(av);
          const estado = isAprobadoInner(estadoRaw);
          if (estado && item.user_id) {
            acc[item.user_id] = true;
          }
          return acc;
        }, {} as Record<number, boolean>);

        setAvalesTHLocal(avalesIniciales);
        setAvalesInicialesCargados(true);

        // CAMBIO CLAVE: En lugar de solo guardar IDs, agrupamos todas las
        // contrataciones por user_id para saber cuántos contratos tiene cada uno.
        const agrupadas = (contratacionesRes.data.contrataciones as Contratacion[]).reduce(
          (acc, c) => {
            if (!acc[c.user_id]) acc[c.user_id] = [];
            acc[c.user_id].push(c);
            return acc;
          },
          {} as Record<number, Contratacion[]>
        );
        setContratacionesPorUsuario(agrupadas);
      } catch (error) {
        console.error("Error al obtener datos:", error);
        toast.error("Error al cargar los datos");
      } finally {
        setLoading(false);
      }
    }

    void fetchDatos();
  }, []);

  // ─── Acciones ────────────────────────────────────────────────────────────────

  const handleAvalTalentoHumano = async (userId: number) => {
    try {
      const response = await axiosInstance.post(`/talento-humano/aval-hoja-vida/${userId}`);
      const mensaje = response?.data?.message ?? "Aval registrado correctamente";
      toast.success(mensaje);
      setAvalesTHLocal((prev) => ({ ...prev, [userId]: true }));
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

  const handleVerHojaVida = async (convocatoriaId: number, userId: number) => {
    const url = `${import.meta.env.VITE_API_URL}/talentoHumano/hoja-de-vida-pdf/${convocatoriaId}/${userId}`;
    try {
      const response = await axios.get(url, {
        responseType: "blob",
        headers: { Authorization: `Bearer ${Cookie.get("token")}` },
        withCredentials: true,
      });
      const pdfBlob = new Blob([response.data], { type: "application/pdf" });
      window.open(URL.createObjectURL(pdfBlob), "_blank");
    } catch (error) {
      console.error("Error al ver la hoja de vida:", error);
    }
  };

  const verPerfilCompleto = async (userId: number) => {
    setLoadingPerfil(true);
    try {
      const response = await axiosInstance.get(`/admin/aspirantes/${userId}`);
      const aspirante = response.data.aspirante ?? response.data?.data ?? response.data;
      if (!aspirante) throw { response: { status: 404 } };

      try {
        const url = `${import.meta.env.VITE_API_URL}/talento-humano/usuarios/${userId}/avales`;
        const avalesResp = await axios.get(url, {
          headers: { Authorization: `Bearer ${Cookie.get('token')}` },
          withCredentials: true,
        });
        const rawAvales = avalesResp.data?.data ?? avalesResp.data?.avales ?? avalesResp.data ?? null;
        const mergedAvales = (rawAvales && typeof rawAvales === 'object') ? ({ ...(rawAvales as Record<string, unknown>) } as Record<string, unknown>) : rawAvales;
        if (mergedAvales && typeof mergedAvales === 'object') {
          const r = mergedAvales as Record<string, unknown>;
          r['talentoHumano'] = r['talentoHumano'] ?? r['talento_humano'] ?? r['aval_talento_humano'] ?? r['talentoHumano'];
          r['talento_humano'] = r['talento_humano'] ?? r['talentoHumano'];
          r['coordinador'] = r['coordinador'] ?? r['aval_coordinador'];
          r['vicerrectoria'] = r['vicerrectoria'] ?? r['aval_vicerrectoria'];
          r['rectoria'] = r['rectoria'] ?? r['aval_rectoria'];
        }
        setPerfilCompleto({ ...(aspirante as unknown as AspiranteDetallado), avales: mergedAvales as unknown as AspiranteDetallado['avales'] });
      } catch {
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
      let status: number | undefined;
      if (axios.isAxiosError(err) && err.response) status = err.response.status;

      if (status === 403) {
        try {
          const altResp = await axiosInstance.get(`/talentoHumano/obtener-aspirante/${userId}`);
          const aspiranteAlt = altResp.data.aspirante ?? altResp.data?.data ?? altResp.data;
          if (aspiranteAlt) {
            setPerfilCompleto(aspiranteAlt);
            setMostrarPerfilCompleto(true);
            setCerrandoPerfilCompleto(false);
            setLoadingPerfil(false);
            return;
          }
        } catch { /* continúa */ }
      }

      toast.error('Error al cargar el perfil del aspirante');
    } finally {
      setLoadingPerfil(false);
    }
  };

  const cerrarPerfilCompleto = () => {
    setCerrandoPerfilCompleto(true);
    setTimeout(() => {
      setMostrarPerfilCompleto(false);
      setPerfilCompleto(null);
      setDocsPorCategoria({ experiencias: [], estudios: [], idiomas: [], producciones: [], rut: [], 'informacion-contacto': [], eps: [], usuario: [] });
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

  const getBaseUrlNoApi = () => (import.meta.env.VITE_API_URL ?? '').replace(/\/api\/?$/, '');

  const fetchDocsCategoria = async (userId: number, categoria: CategoriaDocs) => {
    try {
      const baseURL = import.meta.env.VITE_API_URL ?? '';
      const resp = await axiosInstance.get(`/talento-humano/documentos/${userId}/${categoria}`, { baseURL });
      const docs = (resp.data?.data ?? resp.data?.documentos ?? resp.data) as DocumentoAdjunto[];
      setDocsPorCategoria((prev) => ({ ...prev, [categoria]: Array.isArray(docs) ? docs : [] }));
      return Array.isArray(docs) ? docs : [];
    } catch {
      setDocsPorCategoria((prev) => ({ ...prev, [categoria]: [] }));
      return [];
    }
  };

  const handleDescargarHojaAspirante = async (userId: number) => {
    try {
      setLoadingPerfil(true);
      const response = await axiosInstance.get(`/admin/aspirantes/${userId}/hoja-vida-pdf`, { responseType: 'blob' });
      window.open(URL.createObjectURL(response.data), '_blank');
      toast.success('Hoja de vida abierta correctamente');
    } catch {
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
    if (url) { handleAbrirDocumento(url); return; }
    if (doc?.id_documento) {
      window.open(`${import.meta.env.VITE_API_URL ?? ''}/talento-humano/ver-documento/${doc.id_documento}`, '_blank');
      return;
    }
    toast.info('No hay documento asociado para esta sección');
  };

  const handleAbrirDocumentoCategoria = async (categoria: CategoriaDocs) => {
    const docs = docsPorCategoria[categoria];
    if (docs && docs.length > 0) { handleAbrirDocumentoDeLista(docs); return; }
    const nuevos = perfilCompleto ? await fetchDocsCategoria(perfilCompleto.id, categoria) : [];
    if (nuevos.length > 0) { handleAbrirDocumentoDeLista(nuevos); return; }
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
    return documentos.find((doc) => keywords[categoria].some((k) => (doc.tipo ?? '').toLowerCase().includes(k))) ?? null;
  };

  const handleAbrirDocumentoPreferido = async (docs?: DocumentoAdjunto[], categoria?: CategoriaDocs) => {
    if (docs && docs.length > 0) { handleAbrirDocumentoDeLista(docs); return; }
    if (categoria) {
      const docGeneral = getDocumentoGeneralPorCategoria(categoria);
      if (docGeneral?.url) { handleAbrirDocumento(docGeneral.url); return; }
      if (docGeneral?.id) {
        window.open(`${import.meta.env.VITE_API_URL ?? ''}/talento-humano/ver-documento/${docGeneral.id}`, '_blank');
        return;
      }
      await handleAbrirDocumentoCategoria(categoria);
    }
  };

  const handleAbrirDocumento = (docUrl: string) => {
    if (!docUrl) { toast.error('Documento no disponible'); return; }
    const baseUrl = getBaseUrlNoApi();
    const normalizada = docUrl.replace('/api/storage/', '/storage/');
    const url = normalizada.startsWith('http') ? normalizada : `${baseUrl}${normalizada.startsWith('/') ? '' : '/'}${normalizada}`;
    window.open(url, '_blank');
  };

  const exportToCSV = (rows: Postulaciones[]) => {
    if (!rows || rows.length === 0) { toast.info('No hay datos para exportar'); return; }
    const header = ['Convocatoria', 'Estado', 'Identificación', 'Postulante', 'Fecha Postulación', 'User ID', 'Convocatoria ID', 'Es Docente Activo'];
    const csvRows = [header.join(',')];
    rows.forEach(r => {
      const nombre = `${r.usuario_postulacion.primer_nombre} ${r.usuario_postulacion.primer_apellido}`.replace(/,/g, '');
      const conv = (r.convocatoria_postulacion?.nombre_convocatoria ?? '').replace(/,/g, '');
      const esDocente = (contratacionesPorUsuario[r.user_id]?.length ?? 0) > 0 ? 'Sí' : 'No';
      csvRows.push([conv, r.estado_postulacion, r.usuario_postulacion.numero_identificacion, nombre, r.fecha_postulacion, r.user_id, r.convocatoria_id, esDocente].map(v => `"${v}"`).join(','));
    });
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `postulaciones_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  // ─── Datos derivados ─────────────────────────────────────────────────────────

  const convocatorias = useMemo(() => {
    const map = new Map<number, { id: number; nombre: string; count: number }>();
    postulaciones.forEach((p) => {
      const id = p.convocatoria_id;
      const nombre = p.convocatoria_postulacion?.nombre_convocatoria || `Convocatoria #${id}`;
      const existing = map.get(id);
      if (existing) existing.count += 1;
      else map.set(id, { id, nombre, count: 1 });
    });
    return Array.from(map.values());
  }, [postulaciones]);

  // CAMBIO: Ya NO filtramos usuarios contratados — ahora aparecen TODOS.
  const datosFiltrados = useMemo(() => {
    let data = [...postulaciones];

    if (selectedConvocatoriaId) {
      data = data.filter((p) => p.convocatoria_id === selectedConvocatoriaId);
    }
    if (nameFilter) {
      const q = nameFilter.toLowerCase();
      data = data.filter((p) => `${p.usuario_postulacion.primer_nombre} ${p.usuario_postulacion.primer_apellido}`.toLowerCase().includes(q));
    }
    if (globalFilter) {
      const q = globalFilter.toLowerCase();
      data = data.filter((p) => {
        const nombre = `${p.usuario_postulacion.primer_nombre} ${p.usuario_postulacion.primer_apellido}`.toLowerCase();
        return (
          nombre.includes(q) ||
          (p.convocatoria_postulacion?.nombre_convocatoria ?? '').toLowerCase().includes(q) ||
          (p.estado_postulacion ?? '').toLowerCase().includes(q) ||
          (p.usuario_postulacion?.numero_identificacion ?? '').toLowerCase().includes(q)
        );
      });
    }
    if (dateFrom) data = data.filter((p) => new Date(p.fecha_postulacion) >= new Date(dateFrom));
    if (dateTo) data = data.filter((p) => new Date(p.fecha_postulacion) <= new Date(dateTo));
    if (sortOrder) {
      data = data.slice().sort((a, b) => {
        const da = new Date(a.fecha_postulacion).getTime();
        const db = new Date(b.fecha_postulacion).getTime();
        return sortOrder === 'asc' ? da - db : db - da;
      });
    }
    return data;
  }, [postulaciones, selectedConvocatoriaId, nameFilter, dateFrom, dateTo, sortOrder, globalFilter]);

  const convocatoriasAgrupadas = useMemo(() => {
    const map = new Map<number, { id: number; nombre: string; estado?: string; postulantes: Postulaciones[]; docentesCount: number }>();
    datosFiltrados.forEach((p) => {
      const id = p.convocatoria_id;
      const nombre = p.convocatoria_postulacion?.nombre_convocatoria || `Convocatoria ${id}`;
      const estado = p.convocatoria_postulacion?.estado_convocatoria;
      const esDocente = (contratacionesPorUsuario[p.user_id]?.length ?? 0) > 0;
      if (!map.has(id)) {
        map.set(id, { id, nombre, estado, postulantes: [p], docentesCount: esDocente ? 1 : 0 });
      } else {
        const entry = map.get(id)!;
        entry.postulantes.push(p);
        if (esDocente) entry.docentesCount += 1;
      }
    });
    return Array.from(map.values());
  }, [datosFiltrados, contratacionesPorUsuario]);

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

  const totalModalPages = useMemo(() => Math.max(1, Math.ceil(postulantesModalFiltrados.length / modalPageSize)), [postulantesModalFiltrados.length]);

  const postulantesModalPaginados = useMemo(() => {
    const start = (modalPage - 1) * modalPageSize;
    return postulantesModalFiltrados.slice(start, start + modalPageSize);
  }, [postulantesModalFiltrados, modalPage]);

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-4 h-full min-w-5xl max-w-6xl bg-white rounded-3xl p-8 min-h-screen">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link to={"/talento-humano"}>
            <ButtonRegresar />
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Postulaciones</h1>
        </div>
      </div>

      {/* Filtros */}
      <div className="w-full mb-3 grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
        <div>
          <label className="text-sm font-semibold text-gray-700">Convocatoria</label>
          <select
            value={selectedConvocatoriaId ?? ""}
            onChange={(e) => setSelectedConvocatoriaId(e.target.value ? Number(e.target.value) : null)}
            className="w-full mt-1 p-2 border rounded-lg bg-white"
          >
            <option value="">Todas</option>
            {convocatorias.map((c) => (
              <option key={c.id} value={c.id}>{c.nombre} ({c.count})</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-700">Buscar por nombre</label>
          <InputSearch
            type="text"
            placeholder="Nombre del postulante..."
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
            className="w-full mt-1"
          />
        </div>
        <div className="flex gap-2">
          <div className="w-1/2">
            <label className="text-sm font-semibold text-gray-700">Desde</label>
            <input type="date" className="w-full mt-1 p-2 border rounded-lg" value={dateFrom ?? ""} onChange={(e) => setDateFrom(e.target.value || null)} />
          </div>
          <div className="w-1/2">
            <label className="text-sm font-semibold text-gray-700">Hasta</label>
            <input type="date" className="w-full mt-1 p-2 border rounded-lg" value={dateTo ?? ""} onChange={(e) => setDateTo(e.target.value || null)} />
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center w-full">
        <div className="flex items-center gap-3 w-full">
          <InputSearch
            type="text"
            placeholder="Buscar..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
          />
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : prev === 'desc' ? null : 'asc')}
              className="px-3 py-2 rounded-lg bg-gray-100 text-sm text-gray-800"
            >
              {sortOrder === 'asc' ? 'Fecha ↑' : sortOrder === 'desc' ? 'Fecha ↓' : 'Ordenar Fecha'}
            </button>
            <button
              onClick={() => exportToCSV(datosFiltrados)}
              className="px-3 py-2 rounded-lg bg-green-600 text-white text-sm"
            >
              Exportar
            </button>
          </div>
        </div>
      </div>

      {/* Tarjetas de convocatorias */}
      {loading ? (
        <div className="py-10 text-center text-gray-500">Cargando postulaciones...</div>
      ) : convocatoriasAgrupadas.length === 0 ? (
        <div className="py-10 text-center text-gray-500">No hay postulaciones con los filtros actuales.</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {convocatoriasAgrupadas.map((conv) => (
            <div key={conv.id} className="border rounded-2xl p-5 shadow-sm bg-white">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{conv.nombre}</h3>
                  <p className="text-sm text-gray-500">{conv.postulantes.length} postulante(s)</p>
                  {/* NUEVO: indicador de docentes activos en la tarjeta */}
                  {conv.docentesCount > 0 && (
                    <p className="text-xs text-amber-600 font-medium mt-1 flex items-center gap-1">
                      <AlertTriangle size={12} />
                      {conv.docentesCount} docente{conv.docentesCount > 1 ? 's' : ''} activo{conv.docentesCount > 1 ? 's' : ''} postulado{conv.docentesCount > 1 ? 's' : ''}
                    </p>
                  )}
                  {conv.estado && (
                    <span className="inline-flex mt-2 text-xs px-2 py-1 rounded-full bg-indigo-50 text-indigo-700">
                      {conv.estado}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => {
                    setCerrandoModalConvocatoria(false);
                    setModalSearch("");
                    setModalPage(1);
                    setModalConvocatoria({ id: conv.id, nombre: conv.nombre });
                  }}
                  className="text-sm px-3 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shrink-0"
                >
                  Ver postulantes
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Modal de postulantes por convocatoria ──────────────────────────────── */}
      {modalConvocatoria && (
        <div className={`modal-overlay fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto ${cerrandoModalConvocatoria ? "modal-exit" : ""}`}>
          <div className={`modal-content bg-white rounded-xl shadow-2xl w-full max-w-6xl my-8 ${cerrandoModalConvocatoria ? "modal-exit" : ""}`}>
            <div className="flex items-center justify-between p-5 border-b">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Postulantes - {modalConvocatoria.nombre}</h2>
                <p className="text-sm text-gray-500">{postulantesModal.length} postulante(s)</p>
              </div>
              <button onClick={cerrarModalConvocatoria} className="text-gray-500 hover:text-gray-700 p-2 rounded-lg">
                <X size={22} />
              </button>
            </div>

            <div className="p-5 max-h-[calc(100vh-220px)] overflow-y-auto">
              {postulantesModal.length === 0 ? (
                <div className="text-center text-gray-500 py-10">No hay postulantes para esta convocatoria.</div>
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="w-full sm:max-w-md">
                      <InputSearch
                        type="text"
                        placeholder="Buscar postulante por nombre o identificación"
                        value={modalSearch}
                        onChange={(e) => { setModalSearch(e.target.value); setModalPage(1); }}
                        className="w-full"
                      />
                    </div>
                    <div className="text-xs text-gray-500">
                      {postulantesModalFiltrados.length} postulante(s) • Página {modalPage} de {totalModalPages}
                    </div>
                  </div>

                  {postulantesModalPaginados.map((p) => {
                    // CAMBIO: Obtenemos todas las contrataciones de este usuario
                    const contratacionesDelUsuario = contratacionesPorUsuario[p.user_id] ?? [];
                    const esDocente = contratacionesDelUsuario.length > 0;

                    // ¿Ya tiene contrato para ESTA convocatoria específica?
                    const yaContratadoEnEstaConvocatoria = contratacionesDelUsuario.some(
                      (c) => Number(c.id_convocatoria) === Number(p.convocatoria_id)
                    );

                    const avP = p.avales;
                    const rawEstado = p.aval_talento_humano ?? extractAvalEstado(avP);
                    const avaladoTH = avalesTHLocal[p.user_id] || isAprobadoLocal(rawEstado);

                    return (
                      <div
                        key={p.id_postulacion}
                        className={`border rounded-xl p-4 shadow-sm ${esDocente ? 'bg-amber-50 border-amber-200' : 'bg-white'}`}
                      >
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                          {/* Info del postulante */}
                          <div className="flex items-start gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${esDocente ? 'bg-amber-100 text-amber-600' : 'bg-indigo-50 text-indigo-600'}`}>
                              <User size={18} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-semibold text-gray-800">
                                  {p.usuario_postulacion.primer_nombre} {p.usuario_postulacion.primer_apellido}
                                </h3>
                                {/* NUEVO: Badge docente activo */}
                                {esDocente && <DocenteActivoBadge />}
                              </div>
                              <div className="text-sm text-gray-500 mt-0.5">
                                {p.usuario_postulacion.numero_identificacion} • {new Date(p.fecha_postulacion).toLocaleDateString()}
                              </div>
                              <div className="mt-1">
                                <span className={`text-xs px-2 py-1 rounded-full ${avaladoTH ? 'bg-green-100 text-green-700'
                                    : p.estado_postulacion === 'Rechazada' ? 'bg-red-100 text-red-700'
                                      : 'bg-yellow-100 text-yellow-700'
                                  }`}>
                                  {avaladoTH ? 'Avalado TH' : (p.estado_postulacion || 'Enviada')}
                                </span>
                              </div>
                              {/* NUEVO: Banner de advertencia doble contratación */}
                              {esDocente && (
                                <DobleContratacionBanner contratacionesActivas={contratacionesDelUsuario.length} />
                              )}
                            </div>
                          </div>

                          {/* Acciones */}
                          <div className="flex flex-wrap gap-2 lg:shrink-0">
                            <button
                              className="inline-flex items-center gap-2 bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-50 px-3 py-2 rounded-md shadow-sm text-sm"
                              onClick={() => handleVerHojaVida(p.convocatoria_id, p.user_id)}
                            >
                              <FileText size={14} />
                              <span>Hoja de Vida</span>
                            </button>

                            <button
                              onClick={() => verPerfilCompleto(p.user_id)}
                              className="inline-flex items-center gap-2 bg-indigo-600 text-white px-3 py-2 rounded-md hover:bg-indigo-700 shadow text-sm"
                            >
                              <User size={14} />
                              <span>Ver perfil</span>
                            </button>

                            {!avaladoTH && avalesInicialesCargados && (
                              <button
                                onClick={async () => {
                                  await handleAvalTalentoHumano(p.user_id);
                                  setAvalesTHLocal((prev) => ({ ...prev, [p.user_id]: true }));
                                }}
                                className="inline-flex items-center gap-2 bg-emerald-600 text-white px-3 py-2 rounded-md hover:bg-emerald-700 shadow text-sm"
                              >
                                <CheckCircle size={14} />
                                <span>Dar aval TH</span>
                              </button>
                            )}

                            {/* CAMBIO: Lógica de contratación revisada */}
                            {p.estado_postulacion === "Aceptada" && (
                              yaContratadoEnEstaConvocatoria ? (
                                // Ya contratado en ESTA convocatoria → ver contrato
                                <Link
                                  to={`/talento-humano/contrataciones/usuario/${p.user_id}`}
                                  className="inline-flex items-center gap-2 bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 shadow text-sm"
                                >
                                  Ver Contrato
                                </Link>
                              ) : (
                                // No contratado en esta convocatoria → puede contratar (aunque sea docente)
                                <Link
                                  to={`/talento-humano/contrataciones/contratacion/${p.user_id}`}
                                  className={`inline-flex items-center gap-2 text-white px-3 py-2 rounded-md shadow text-sm ${esDocente
                                      ? 'bg-amber-500 hover:bg-amber-600'  // Naranja para indicar doble contratación
                                      : 'bg-green-500 hover:bg-green-600'
                                    }`}
                                >
                                  {esDocente ? (
                                    <>
                                      <AlertTriangle size={14} />
                                      <span>Doble Contrato</span>
                                    </>
                                  ) : (
                                    <span>Contratar</span>
                                  )}
                                </Link>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Paginación */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t">
                    <button
                      onClick={() => setModalPage((p) => Math.max(1, p - 1))}
                      disabled={modalPage <= 1}
                      className="px-3 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm disabled:opacity-50"
                    >
                      Anterior
                    </button>
                    <div className="text-xs text-gray-500">Página {modalPage} de {totalModalPages}</div>
                    <button
                      onClick={() => setModalPage((p) => Math.min(totalModalPages, p + 1))}
                      disabled={modalPage >= totalModalPages}
                      className="px-3 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm disabled:opacity-50"
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

      {/* ── Modal de Perfil Completo ────────────────────────────────────────────── */}
      {mostrarPerfilCompleto && perfilCompleto && (
        <div className={`modal-overlay fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto ${cerrandoPerfilCompleto ? "modal-exit" : ""}`}>
          <div className={`modal-content bg-white rounded-xl shadow-2xl w-full max-w-5xl my-8 ${cerrandoPerfilCompleto ? "modal-exit" : ""}`}>
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white p-6 rounded-t-xl">
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-4">
                  {perfilCompleto.datos_personales.foto_perfil_url ? (
                    <img src={perfilCompleto.datos_personales.foto_perfil_url} alt="Foto" className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg" />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-indigo-500 flex items-center justify-center border-4 border-white shadow-lg">
                      <User size={40} />
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <h2 className="text-2xl font-bold">
                        {perfilCompleto.datos_personales.primer_nombre} {perfilCompleto.datos_personales.segundo_nombre || ''} {perfilCompleto.datos_personales.primer_apellido} {perfilCompleto.datos_personales.segundo_apellido || ''}
                      </h2>
                      {/* NUEVO: Badge en el perfil si es docente activo */}
                      {(contratacionesPorUsuario[perfilCompleto.id]?.length ?? 0) > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-400 text-amber-900 text-xs font-bold">
                          <Briefcase size={12} />
                          Docente Activo · {contratacionesPorUsuario[perfilCompleto.id].length} contrato(s)
                        </span>
                      )}
                    </div>
                    <p className="text-indigo-100 mt-1">
                      {perfilCompleto.datos_personales.tipo_identificacion}: {perfilCompleto.datos_personales.numero_identificacion}
                    </p>
                    <div className="flex gap-4 mt-2 text-sm">
                      <span className="flex items-center gap-1">
                        <Mail size={14} />
                        {perfilCompleto.datos_personales.email}
                      </span>
                    </div>
                  </div>
                </div>
                <button onClick={cerrarPerfilCompleto} className="text-white hover:bg-indigo-800 p-2 rounded-lg">
                  <X size={24} />
                </button>
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => handleDescargarHojaAspirante(perfilCompleto.id)}
                  disabled={loadingPerfil}
                  className={`bg-white text-indigo-600 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 ${loadingPerfil ? 'opacity-60 cursor-not-allowed' : 'hover:bg-indigo-50'}`}
                >
                  {loadingPerfil ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
                  Descargar Hoja de Vida
                </button>
              </div>
            </div>

            <div className="p-6 max-h-[calc(100vh-250px)] overflow-y-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Datos Personales */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <User size={20} className="text-indigo-600" />
                    Datos Personales
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="grid grid-cols-2 gap-2"><span className="font-semibold text-gray-600">Género:</span><span>{perfilCompleto.datos_personales.genero}</span></div>
                    <div className="grid grid-cols-2 gap-2"><span className="font-semibold text-gray-600">Fecha Nacimiento:</span><span>{perfilCompleto.datos_personales.fecha_nacimiento}</span></div>
                    <div className="grid grid-cols-2 gap-2"><span className="font-semibold text-gray-600">Estado Civil:</span><span>{perfilCompleto.datos_personales.estado_civil}</span></div>
                    {perfilCompleto.datos_personales.municipio && (
                      <div className="grid grid-cols-2 gap-2"><span className="font-semibold text-gray-600">Ubicación:</span><span>{perfilCompleto.datos_personales.municipio}, {perfilCompleto.datos_personales.departamento}</span></div>
                    )}
                  </div>
                </div>

                {/* Contacto */}
                {perfilCompleto.informacion_contacto && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <Phone size={20} className="text-indigo-600" />
                      Contacto
                    </h3>
                    <div className="space-y-2 text-sm">
                      {perfilCompleto.informacion_contacto.telefono && <div className="grid grid-cols-2 gap-2"><span className="font-semibold text-gray-600">Teléfono:</span><span>{perfilCompleto.informacion_contacto.telefono}</span></div>}
                      {perfilCompleto.informacion_contacto.celular && <div className="grid grid-cols-2 gap-2"><span className="font-semibold text-gray-600">Celular:</span><span>{perfilCompleto.informacion_contacto.celular}</span></div>}
                      {perfilCompleto.informacion_contacto.direccion && <div className="grid grid-cols-2 gap-2"><span className="font-semibold text-gray-600">Dirección:</span><span>{perfilCompleto.informacion_contacto.direccion}</span></div>}
                    </div>
                  </div>
                )}

                {/* Info adicional */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-bold text-gray-800 mb-3">Info Adicional</h3>
                  <div className="space-y-2 text-sm">
                    {perfilCompleto.eps?.nombre_eps && <div className="grid grid-cols-2 gap-2"><span className="font-semibold text-gray-600">EPS:</span><span>{perfilCompleto.eps.nombre_eps}</span></div>}
                    {perfilCompleto.rut?.numero_rut && <div className="grid grid-cols-2 gap-2"><span className="font-semibold text-gray-600">RUT:</span><span>{perfilCompleto.rut.numero_rut}</span></div>}
                  </div>
                </div>

                {/* Avales */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <Award size={20} className="text-indigo-600" />
                    Avales
                  </h3>
                  <div className="space-y-3">
                    {(['talentoHumano', 'coordinador', 'rectoria', 'vicerrectoria'] as const).map((rol) => {
                      const labels = { talentoHumano: 'Talento Humano', coordinador: 'Coordinación', rectoria: 'Rectoría', vicerrectoria: 'Vicerrectoría' };
                      const aprobado = getAvalEstadoPerfil(rol);
                      return (
                        <div key={rol} className={`flex items-center justify-between p-2 rounded ${aprobado ? 'bg-green-100' : 'bg-orange-100'}`}>
                          <span className="font-semibold text-sm">{labels[rol]}</span>
                          <span className={`text-sm flex items-center gap-1 ${aprobado ? 'text-green-700' : 'text-orange-700'}`}>
                            {aprobado ? <><CheckCircle size={16} /> Aprobado</> : <><XCircle size={16} /> Pendiente</>}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Experiencias */}
              {perfilCompleto.experiencias && perfilCompleto.experiencias.length > 0 && (
                <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2"><Briefcase size={20} className="text-indigo-600" />Experiencia Laboral</h3>
                  <div className="space-y-3">
                    {perfilCompleto.experiencias.map((exp, idx) => (
                      <button key={idx} type="button" onClick={() => void handleAbrirDocumentoPreferido(exp.documentos_experiencia ?? exp.documentosExperiencia, 'experiencias')} className="bg-white p-4 rounded border text-left hover:bg-indigo-50 transition-colors cursor-pointer w-full">
                        <h4 className="font-bold">{exp.cargo}</h4>
                        <p className="text-sm text-gray-600">{exp.empresa}</p>
                        <p className="text-xs text-gray-500 mt-1">{exp.fecha_inicio} - {exp.fecha_fin || 'Actualidad'}</p>
                        {exp.descripcion && <p className="text-sm mt-2">{exp.descripcion}</p>}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Estudios */}
              {perfilCompleto.estudios && perfilCompleto.estudios.length > 0 && (
                <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2"><GraduationCap size={20} className="text-indigo-600" />Formación Académica</h3>
                  <div className="space-y-3">
                    {perfilCompleto.estudios.map((est, idx) => (
                      <button key={idx} type="button" onClick={() => void handleAbrirDocumentoPreferido(est.documentos_estudio ?? est.documentosEstudio, 'estudios')} className="bg-white p-4 rounded border text-left hover:bg-indigo-50 transition-colors cursor-pointer w-full">
                        <h4 className="font-bold">{est.titulo}</h4>
                        <p className="text-sm text-gray-600">{est.institucion}</p>
                        <p className="text-xs text-gray-500">{est.nivel_educativo}</p>
                        <p className="text-xs text-gray-500 mt-1">{est.fecha_inicio} - {est.fecha_fin || 'En curso'}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Idiomas */}
              {perfilCompleto.idiomas && perfilCompleto.idiomas.length > 0 && (
                <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2"><Globe size={20} className="text-indigo-600" />Idiomas</h3>
                  <div className="space-y-3">
                    {perfilCompleto.idiomas.map((idioma, idx) => (
                      <button key={idx} type="button" onClick={() => void handleAbrirDocumentoPreferido(idioma.documentos_idioma ?? idioma.documentosIdioma, 'idiomas')} className="bg-white p-4 rounded border text-left hover:bg-indigo-50 transition-colors cursor-pointer w-full">
                        <h4 className="font-bold">{idioma.idioma}</h4>
                        <p className="text-sm text-gray-600">Nivel: {idioma.nivel}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Certificación Bancaria */}
              {perfilCompleto.certificacion_bancaria && (
                <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2"><Landmark size={20} className="text-indigo-600" />Certificación Bancaria</h3>
                  <button type="button" onClick={() => handleAbrirDocumentoDeLista(perfilCompleto.certificacion_bancaria!.documentosCertificacionBancaria)} className="bg-white p-4 rounded border text-left w-full hover:bg-indigo-50 transition-colors cursor-pointer">
                    <div className="space-y-2 text-sm">
                      {perfilCompleto.certificacion_bancaria.nombre_banco && <div className="grid grid-cols-2 gap-2"><span className="font-semibold text-gray-600">Banco:</span><span>{perfilCompleto.certificacion_bancaria.nombre_banco}</span></div>}
                      {perfilCompleto.certificacion_bancaria.tipo_cuenta && <div className="grid grid-cols-2 gap-2"><span className="font-semibold text-gray-600">Tipo de cuenta:</span><span>{perfilCompleto.certificacion_bancaria.tipo_cuenta}</span></div>}
                      {perfilCompleto.certificacion_bancaria.numero_cuenta && <div className="grid grid-cols-2 gap-2"><span className="font-semibold text-gray-600">Número de cuenta:</span><span>{perfilCompleto.certificacion_bancaria.numero_cuenta}</span></div>}
                    </div>
                  </button>
                </div>
              )}

              {/* Pensión */}
              {perfilCompleto.pension && (
                <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2"><PiggyBank size={20} className="text-indigo-600" />Pensión</h3>
                  <button type="button" onClick={() => handleAbrirDocumentoDeLista(perfilCompleto.pension!.documentosPension)} className="bg-white p-4 rounded border text-left w-full hover:bg-indigo-50 transition-colors cursor-pointer">
                    <div className="space-y-2 text-sm">
                      {perfilCompleto.pension.regimen_pensional && <div className="grid grid-cols-2 gap-2"><span className="font-semibold text-gray-600">Régimen:</span><span>{perfilCompleto.pension.regimen_pensional}</span></div>}
                      {perfilCompleto.pension.entidad_pensional && <div className="grid grid-cols-2 gap-2"><span className="font-semibold text-gray-600">Entidad:</span><span>{perfilCompleto.pension.entidad_pensional}</span></div>}
                    </div>
                  </button>
                </div>
              )}

              {/* Antecedentes Judiciales */}
              {perfilCompleto.antecedente_judicial && (
                <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2"><Scale size={20} className="text-indigo-600" />Antecedentes Judiciales</h3>
                  <button type="button" onClick={() => handleAbrirDocumentoDeLista(perfilCompleto.antecedente_judicial!.documentosAntecedentesJudiciales)} className="bg-white p-4 rounded border text-left w-full hover:bg-indigo-50 transition-colors cursor-pointer">
                    <div className="space-y-2 text-sm">
                      {perfilCompleto.antecedente_judicial.estado_antecedentes && <div className="grid grid-cols-2 gap-2"><span className="font-semibold text-gray-600">Estado:</span><span>{perfilCompleto.antecedente_judicial.estado_antecedentes}</span></div>}
                      {perfilCompleto.antecedente_judicial.fecha_validacion && <div className="grid grid-cols-2 gap-2"><span className="font-semibold text-gray-600">Fecha validación:</span><span>{perfilCompleto.antecedente_judicial.fecha_validacion}</span></div>}
                    </div>
                  </button>
                </div>
              )}

              {/* ARL */}
              {perfilCompleto.arl && (
                <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2"><ShieldCheck size={20} className="text-indigo-600" />ARL</h3>
                  <button type="button" onClick={() => handleAbrirDocumentoDeLista(perfilCompleto.arl!.documentosArl)} className="bg-white p-4 rounded border text-left w-full hover:bg-indigo-50 transition-colors cursor-pointer">
                    <div className="space-y-2 text-sm">
                      {perfilCompleto.arl.nombre_arl && <div className="grid grid-cols-2 gap-2"><span className="font-semibold text-gray-600">ARL:</span><span>{perfilCompleto.arl.nombre_arl}</span></div>}
                      {perfilCompleto.arl.clase_riesgo && <div className="grid grid-cols-2 gap-2"><span className="font-semibold text-gray-600">Clase de riesgo:</span><span>{perfilCompleto.arl.clase_riesgo}</span></div>}
                      {perfilCompleto.arl.estado_afiliacion && <div className="grid grid-cols-2 gap-2"><span className="font-semibold text-gray-600">Estado:</span><span>{perfilCompleto.arl.estado_afiliacion}</span></div>}
                    </div>
                  </button>
                </div>
              )}

              {/* Documentos */}
              {perfilCompleto.documentos && perfilCompleto.documentos.length > 0 && (
                <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2"><FileDown size={20} className="text-indigo-600" />Documentos</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {perfilCompleto.documentos.map((doc) => (
                      <button key={doc.id} type="button" onClick={() => handleAbrirDocumento(doc.url)} className="bg-white p-3 rounded border hover:bg-gray-50 flex items-center gap-2 text-left">
                        <FileText size={18} className="text-indigo-600" />
                        <span className="text-sm truncate">{doc.nombre}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="border-t p-4 bg-gray-50 flex justify-end">
              <button onClick={cerrarPerfilCompleto} className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerPostulaciones;