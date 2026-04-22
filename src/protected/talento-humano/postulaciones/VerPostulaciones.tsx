import InputSearch from "../../../componentes/formularios/InputSearch";
import { useEffect, useMemo, useState } from "react";
import axiosInstance from "../../../utils/axiosConfig";
import { toast } from "react-toastify";
import axios from "axios";
import Cookie from "js-cookie";
import { generarHojaVidaPDF } from "../../../utils/generarHojaVida";

import { Link } from "react-router-dom";
import { ButtonRegresar } from "../../../componentes/formularios/ButtonRegresar";
import { User, FileText, CheckCircle, XCircle, Mail, Phone, Briefcase, GraduationCap, Award, FileDown, X, Loader2, Globe, Landmark, PiggyBank, Scale, ShieldCheck, ChevronDown } from "lucide-react";
// Interfaz para definir la estructura de los datos de las postulaciones
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

// Pure helpers — defined outside component to maintain stable references
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
  const [avalesTHLocal, setAvalesTHLocal] = useState<Record<number, boolean>>({});
  const [avalesInicialesCargados, setAvalesInicialesCargados] = useState(false);
  // Filtro por convocatoria (id)
  const [selectedConvocatoriaId, setSelectedConvocatoriaId] = useState<number | null>(null);
  // (convocatoriaSearch removed â€” not used)
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
  // Estado para manejar el indicador de carga
  const [loading, setLoading] = useState(true);
  const [openActionsId, setOpenActionsId] = useState<number | null>(null);
  const [filtroAval, setFiltroAval] = useState<"all" | "avalado" | "pendiente">("all");
  // Estados para mostrar perfil completo
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
    if (role === 'talentoHumano' && perfilCompleto?.id && avalesTHLocal[perfilCompleto.id]) return true;
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

  const handleAvalTalentoHumano = async (userId: number) => {
    try {
      const response = await axiosInstance.post(`/talento-humano/aval-hoja-vida/${userId}`);
      const mensaje = response?.data?.message ?? "Aval de Talento Humano registrado correctamente";
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
    setLoadingPerfil(true);
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

    window.open(url, '_blank');
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

  // convocatoriasFiltradas not needed â€” use `convocatorias` directly

  // Datos filtrados por convocatoria seleccionada
  const datosFiltrados = useMemo(() => {
    let data = postulaciones;
    if (selectedConvocatoriaId) {
      data = data.filter((p) => p.convocatoria_id === selectedConvocatoriaId);
    }
    if (nameFilter) {
      const q = nameFilter.toLowerCase();
      data = data.filter((p) => {
        const nombre = `${p.usuario_postulacion.primer_nombre} ${p.usuario_postulacion.primer_apellido}`.toLowerCase();
        return nombre.includes(q);
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
      data = data.filter((p) => new Date(p.fecha_postulacion) <= to);
    }
    // Filtrar por estado de aval TH
    if (filtroAval !== "all") {
      data = data.filter((p) => {
        const rawEstado = p.aval_talento_humano ?? extractAvalEstado(p.avales);
        const avalado = avalesTHLocal[p.user_id] || isAprobadoLocal(rawEstado);
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

    return data;
  }, [postulaciones, selectedConvocatoriaId, nameFilter, dateFrom, dateTo, sortOrder, globalFilter, filtroAval, avalesTHLocal]);

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

  // Stats para las tarjetas â€” basadas en el total sin filtros para mostrar el universo completo
  const totalAvaladosTH = useMemo(
    () => postulaciones.filter((p) => {
      const rawEstado = p.aval_talento_humano ?? extractAvalEstado(p.avales);
      return avalesTHLocal[p.user_id] || isAprobadoLocal(rawEstado);
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50/30 via-white to-indigo-50/10 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header principal */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-3">
                <Link to={"/talento-humano"}>
                  <ButtonRegresar />
                </Link>
                <div className="relative">
                  <div className="p-3 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg">
                    <User className="h-7 w-7 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-700 to-indigo-900 bg-clip-text text-transparent">
                    Gestión de Postulaciones
                  </h1>
                  <p className="text-gray-600 mt-1">Administra las postulaciones por convocatoria</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              <button
                onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : prev === 'desc' ? null : 'asc')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all text-sm bg-white border border-indigo-300 text-indigo-700 hover:bg-indigo-50 hover:shadow"
                title="Ordenar por fecha"
              >
                {sortOrder === 'asc' ? 'Fecha â†‘' : sortOrder === 'desc' ? 'Fecha â†“' : 'Ordenar Fecha'}
              </button>
              <button
                onClick={() => exportToCSV(datosFiltrados)}
                disabled={datosFiltrados.length === 0}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                  datosFiltrados.length === 0
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-white border border-indigo-300 text-indigo-700 hover:bg-indigo-50 hover:shadow"
                }`}
              >
                <FileDown className="h-4 w-4" />
                <span className="hidden sm:inline">Exportar CSV</span>
              </button>
            </div>
          </div>

          {/* Stats cards â€” funcionan como filtros de aval */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Total */}
            <button
              onClick={() => handleFiltroAval("all")}
              className={`text-left rounded-xl p-4 border-2 transition-all duration-200 hover:shadow-md ${
                filtroAval === "all"
                  ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200"
                  : "bg-indigo-50 border-indigo-200 text-indigo-900 hover:border-indigo-400"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <User className={`h-4 w-4 ${filtroAval === "all" ? "text-indigo-100" : "text-indigo-500"}`} />
                <p className={`text-xs font-semibold uppercase tracking-wide ${filtroAval === "all" ? "text-indigo-100" : "text-indigo-600"}`}>
                  Total
                </p>
              </div>
              <p className={`text-3xl font-bold ${filtroAval === "all" ? "text-white" : "text-indigo-900"}`}>
                {postulaciones.length}
              </p>
              {filtroAval === "all" && (
                <p className="text-xs text-indigo-100 mt-1">Filtro activo</p>
              )}
            </button>

            {/* Avalados TH */}
            <button
              onClick={() => handleFiltroAval("avalado")}
              className={`text-left rounded-xl p-4 border-2 transition-all duration-200 hover:shadow-md ${
                filtroAval === "avalado"
                  ? "bg-green-600 border-green-600 text-white shadow-lg shadow-green-200"
                  : "bg-green-50 border-green-200 text-green-900 hover:border-green-400"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className={`h-4 w-4 ${filtroAval === "avalado" ? "text-green-100" : "text-green-500"}`} />
                <p className={`text-xs font-semibold uppercase tracking-wide ${filtroAval === "avalado" ? "text-green-100" : "text-green-600"}`}>
                  Avalados TH
                </p>
              </div>
              <p className={`text-3xl font-bold ${filtroAval === "avalado" ? "text-white" : "text-green-900"}`}>
                {totalAvaladosTH}
              </p>
              {filtroAval === "avalado" && (
                <p className="text-xs text-green-100 mt-1">Filtro activo â€” clic para quitar</p>
              )}
            </button>

            {/* Pendientes */}
            <button
              onClick={() => handleFiltroAval("pendiente")}
              className={`text-left rounded-xl p-4 border-2 transition-all duration-200 hover:shadow-md ${
                filtroAval === "pendiente"
                  ? "bg-amber-600 border-amber-600 text-white shadow-lg shadow-amber-200"
                  : "bg-amber-50 border-amber-200 text-amber-900 hover:border-amber-400"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <XCircle className={`h-4 w-4 ${filtroAval === "pendiente" ? "text-amber-100" : "text-amber-500"}`} />
                <p className={`text-xs font-semibold uppercase tracking-wide ${filtroAval === "pendiente" ? "text-amber-100" : "text-amber-600"}`}>
                  Pendientes
                </p>
              </div>
              <p className={`text-3xl font-bold ${filtroAval === "pendiente" ? "text-white" : "text-amber-900"}`}>
                {totalPendientesTH}
              </p>
              {filtroAval === "pendiente" && (
                <p className="text-xs text-amber-100 mt-1">Filtro activo â€” clic para quitar</p>
              )}
            </button>

            {/* Convocatorias (info only) */}
            <div className="text-left rounded-xl p-4 border-2 bg-purple-50 border-purple-200">
              <div className="flex items-center gap-2 mb-1">
                <Briefcase className="h-4 w-4 text-purple-500" />
                <p className="text-xs font-semibold uppercase tracking-wide text-purple-600">Convocatorias</p>
              </div>
              <p className="text-3xl font-bold text-purple-900">{totalConvocatoriasUnicas}</p>
            </div>
          </div>
        </div>

        {/* Filtros secundarios */}
        <div className="bg-white rounded-2xl shadow border border-gray-100 px-6 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">Convocatoria</label>
              <select
                value={selectedConvocatoriaId ?? ""}
                onChange={(e) => setSelectedConvocatoriaId(e.target.value ? Number(e.target.value) : null)}
                className="w-full p-2 border border-gray-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 outline-none"
              >
                <option value="">Todas las convocatorias</option>
                {convocatorias.map((c) => (
                  <option key={c.id} value={c.id}>{c.nombre} ({c.count})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">Buscar postulante</label>
              <InputSearch
                type="text"
                placeholder="Nombre o identificación..."
                value={nameFilter}
                onChange={(e) => setNameFilter(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <div className="w-1/2">
                <label className="text-sm font-semibold text-gray-700 mb-1 block">Desde</label>
                <input
                  type="date"
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 outline-none"
                  value={dateFrom ?? ""}
                  onChange={(e) => setDateFrom(e.target.value || null)}
                />
              </div>
              <div className="w-1/2">
                <label className="text-sm font-semibold text-gray-700 mb-1 block">Hasta</label>
                <input
                  type="date"
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 outline-none"
                  value={dateTo ?? ""}
                  onChange={(e) => setDateTo(e.target.value || null)}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-4 pt-4 border-t border-gray-100">
            <div className="w-full sm:w-96">
              <InputSearch
                type="text"
                placeholder="Buscar por nombre, convocatoria, estado..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
              />
            </div>
            <p className="text-sm text-gray-500 ml-auto">
              Mostrando <span className="font-semibold text-indigo-700">{convocatoriasAgrupadas.length}</span> convocatoria(s) con{" "}
              <span className="font-semibold text-indigo-700">{datosFiltrados.length}</span> postulante(s)
              {filtroAval !== "all" && (
                <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
                  Filtro: {filtroAval === "avalado" ? "Avalados" : "Pendientes"}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Grid de tarjetas de convocatorias */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              <p className="text-gray-500 text-sm">Cargando postulaciones...</p>
            </div>
          ) : convocatoriasAgrupadas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-3">
              <User className="h-14 w-14 text-gray-300" />
              <p className="text-lg font-semibold text-gray-500">No hay postulaciones</p>
              <p className="text-sm">
                {filtroAval !== "all" || globalFilter || nameFilter || selectedConvocatoriaId
                  ? "Prueba ajustando los filtros de búsqueda"
                  : "Aún no hay postulaciones registradas"}
              </p>
              {(filtroAval !== "all" || globalFilter || nameFilter || selectedConvocatoriaId) && (
                <button
                  onClick={() => { setFiltroAval("all"); setGlobalFilter(""); setNameFilter(""); setSelectedConvocatoriaId(null); setDateFrom(null); setDateTo(null); }}
                  className="mt-2 px-4 py-2 text-sm text-indigo-700 border border-indigo-300 rounded-lg hover:bg-indigo-50 transition-colors"
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
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-indigo-200 overflow-hidden flex flex-col group"
                >
                  {/* Header de la card */}
                  <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4 text-white flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-indigo-100 uppercase tracking-wider mb-1">
                        {conv.postulantes.length} postulante(s)
                      </p>
                      <h3 className="text-base font-bold line-clamp-2 leading-snug">{conv.nombre}</h3>
                    </div>
                    {conv.estado && (
                      <span className={`ml-3 flex-shrink-0 px-2 py-1 text-xs font-semibold rounded-full ${
                        conv.estado.toLowerCase() === "abierta"
                          ? "bg-green-100 text-green-800"
                          : conv.estado.toLowerCase() === "cerrada"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-800"
                      }`}>
                        {conv.estado}
                      </span>
                    )}
                  </div>

                  {/* Contenido */}
                  <div className="px-5 py-4 flex-1 space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-indigo-400 flex-shrink-0" />
                      <span className="text-gray-600">{conv.postulantes.length} postulante(s) en esta convocatoria</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                      <span className="text-gray-600">
                        {conv.postulantes.filter((p) => {
                          const rawEstado = p.aval_talento_humano ?? extractAvalEstado(p.avales);
                          return avalesTHLocal[p.user_id] || isAprobadoLocal(rawEstado);
                        }).length} avalado(s) TH
                      </span>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="bg-gray-50 px-5 py-3 border-t border-gray-100">
                    <button
                      onClick={() => {
                        setCerrandoModalConvocatoria(false);
                        setModalSearch("");
                        setModalPage(1);
                        setModalConvocatoria({ id: conv.id, nombre: conv.nombre });
                      }}
                      className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors font-medium text-xs border border-indigo-200"
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
        <div className={`modal-overlay fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto ${cerrandoModalConvocatoria ? "modal-exit" : ""}`}>
          <div className={`modal-content bg-white rounded-xl shadow-2xl w-full max-w-6xl my-8 ${cerrandoModalConvocatoria ? "modal-exit" : ""}`}>
            <div className="flex items-center justify-between p-5 border-b">
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  Postulantes - {modalConvocatoria.nombre}
                </h2>
                <p className="text-sm text-gray-500">{postulantesModal.length} postulante(s)</p>
              </div>
              <button
                onClick={cerrarModalConvocatoria}
                className="text-gray-500 hover:text-gray-700 p-2 rounded-lg"
                aria-label="Cerrar modal"
              >
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
                        onChange={(e) => {
                          setModalSearch(e.target.value);
                          setModalPage(1);
                        }}
                        className="w-full"
                      />
                    </div>
                    <div className="text-xs text-gray-500">
                      {postulantesModalFiltrados.length} postulante(s) â€¢ Página {modalPage} de {totalModalPages}
                    </div>
                  </div>

                  {postulantesModalPaginados.map((p) => {
                    const yaContratado = usuariosContratados.includes(p.user_id);
                    const avP = p.avales;
                    const rawEstado = p.aval_talento_humano ?? extractAvalEstado(avP);
                    const avaladoTH = avalesTHLocal[p.user_id] || isAprobadoLocal(rawEstado);
                    // Debug: mostrar cómo se detectó el estado de aval para este usuario
                    console.debug('aval detection', { userId: p.user_id, rawEstado, localFlag: avalesTHLocal[p.user_id], avaladoTH });
                    return (
                      <div key={p.id_postulacion} className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm transition-all duration-200 hover:shadow-md hover:border-indigo-100">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                              <User size={18} />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-800">
                                {p.usuario_postulacion.primer_nombre} {p.usuario_postulacion.primer_apellido}
                              </h3>
                              <div className="text-sm text-gray-500">
                                {p.usuario_postulacion.numero_identificacion} â€¢ {new Date(p.fecha_postulacion).toLocaleDateString()}
                              </div>
                              <div className="mt-1">
                                <span
                                  className={`text-xs px-2 py-1 rounded-full ${
                                    avaladoTH
                                      ? 'bg-green-100 text-green-700'
                                      : p.estado_postulacion === 'Rechazada'
                                      ? 'bg-red-100 text-red-700'
                                      : 'bg-yellow-100 text-yellow-700'
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
                              className="inline-flex items-center gap-1 bg-indigo-600 text-white px-3 py-2 rounded-md hover:bg-indigo-700 transition-colors duration-200 text-sm font-medium"
                            >
                              Acciones
                              <ChevronDown size={14} className={`transition-transform duration-150 ${openActionsId === p.id_postulacion ? 'rotate-180' : ''}`} />
                            </button>
                            {openActionsId === p.id_postulacion && (
                              <div className="absolute right-0 top-full mt-1 z-20 bg-white border border-gray-200 rounded-lg shadow-lg w-52 py-1">
                                <button
                                  onClick={() => { handleVerHojaVida(p.convocatoria_id, p.user_id); setOpenActionsId(null); }}
                                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                  <FileText size={14} className="text-indigo-500" />
                                  Hoja de Vida
                                </button>
                                <button
                                  onClick={() => { verPerfilCompleto(p.user_id, p.convocatoria_id); setOpenActionsId(null); }}
                                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                  <User size={14} className="text-indigo-500" />
                                  Ver perfil
                                </button>
                                <div className="border-t border-gray-100 my-1" />
                                {!avaladoTH && avalesInicialesCargados && (
                                  <button
                                    onClick={async () => { await handleAvalTalentoHumano(p.user_id); setAvalesTHLocal((prev) => ({ ...prev, [p.user_id]: true })); setOpenActionsId(null); }}
                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-emerald-700 hover:bg-emerald-50"
                                  >
                                    <CheckCircle size={14} />
                                    Dar aval TH
                                  </button>
                                )}
                                {p.estado_postulacion === "Aceptada" && (
                                  yaContratado ? (
                                    <Link
                                      to={`/talento-humano/contrataciones/usuario/${p.user_id}`}
                                      onClick={() => setOpenActionsId(null)}
                                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-green-700 hover:bg-green-50"
                                    >
                                      Ver Contrato
                                    </Link>
                                  ) : (
                                    <Link
                                      to={`/talento-humano/contrataciones/contratacion/${p.user_id}`}
                                      onClick={() => setOpenActionsId(null)}
                                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-green-700 hover:bg-green-50"
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
                      className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm disabled:opacity-50 transition-colors duration-200"
                    >
                      Anterior
                    </button>
                    <div className="text-xs text-gray-500">
                      Página {modalPage} de {totalModalPages}
                    </div>
                    <button
                      onClick={() => setModalPage((p) => Math.min(totalModalPages, p + 1))}
                      disabled={modalPage >= totalModalPages}
                      className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm disabled:opacity-50 transition-colors duration-200"
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
        <div className={`modal-overlay fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto ${cerrandoPerfilCompleto ? "modal-exit" : ""}`}>
          <div className={`modal-content bg-white rounded-xl shadow-2xl w-full max-w-5xl my-8 ${cerrandoPerfilCompleto ? "modal-exit" : ""}`}>
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white p-6 rounded-t-xl">
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-4">
                  {perfilCompleto.datos_personales.foto_perfil_url ? (
                    <img
                      src={perfilCompleto.datos_personales.foto_perfil_url}
                      alt="Foto"
                      className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-indigo-500 flex items-center justify-center border-4 border-white shadow-lg">
                      <User size={40} />
                    </div>
                  )}
                  <div>
                    <h2 className="text-2xl font-bold">
                      {perfilCompleto.datos_personales.primer_nombre} {perfilCompleto.datos_personales.segundo_nombre || ''} {perfilCompleto.datos_personales.primer_apellido} {perfilCompleto.datos_personales.segundo_apellido || ''}
                    </h2>
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
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <User size={20} className="text-indigo-600" />
                    Datos Personales
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <span className="font-semibold text-gray-600">Género:</span>
                      <span>{perfilCompleto.datos_personales.genero}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <span className="font-semibold text-gray-600">Fecha Nacimiento:</span>
                      <span>{perfilCompleto.datos_personales.fecha_nacimiento}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <span className="font-semibold text-gray-600">Estado Civil:</span>
                      <span>{perfilCompleto.datos_personales.estado_civil}</span>
                    </div>
                    {perfilCompleto.datos_personales.municipio && (
                      <div className="grid grid-cols-2 gap-2">
                        <span className="font-semibold text-gray-600">Ubicación:</span>
                        <span>{perfilCompleto.datos_personales.municipio}, {perfilCompleto.datos_personales.departamento}</span>
                      </div>
                    )}
                  </div>
                </div>

                {perfilCompleto.informacion_contacto && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <Phone size={20} className="text-indigo-600" />
                      Contacto
                    </h3>
                    <div className="space-y-2 text-sm">
                      {perfilCompleto.informacion_contacto.telefono && (
                        <div className="grid grid-cols-2 gap-2">
                          <span className="font-semibold text-gray-600">Teléfono:</span>
                          <span>{perfilCompleto.informacion_contacto.telefono}</span>
                        </div>
                      )}
                      {perfilCompleto.informacion_contacto.celular && (
                        <div className="grid grid-cols-2 gap-2">
                          <span className="font-semibold text-gray-600">Celular:</span>
                          <span>{perfilCompleto.informacion_contacto.celular}</span>
                        </div>
                      )}
                      {perfilCompleto.informacion_contacto.direccion && (
                        <div className="grid grid-cols-2 gap-2">
                          <span className="font-semibold text-gray-600">Dirección:</span>
                          <span>{perfilCompleto.informacion_contacto.direccion}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-bold text-gray-800 mb-3">Info Adicional</h3>
                  <div className="space-y-2 text-sm">
                    {perfilCompleto.eps?.nombre_eps && (
                      <div className="grid grid-cols-2 gap-2">
                        <span className="font-semibold text-gray-600">EPS:</span>
                        <span>{perfilCompleto.eps.nombre_eps}</span>
                      </div>
                    )}
                    {perfilCompleto.rut?.numero_rut && (
                      <div className="grid grid-cols-2 gap-2">
                        <span className="font-semibold text-gray-600">RUT:</span>
                        <span>{perfilCompleto.rut.numero_rut}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <Award size={20} className="text-indigo-600" />
                    Avales
                  </h3>
                  <div className="space-y-3">
                    <div className={`flex items-center justify-between p-2 rounded ${getAvalEstadoPerfil('talentoHumano') ? 'bg-green-100' : 'bg-orange-100'}`}>
                      <span className="font-semibold text-sm">Talento Humano</span>
                      <span className={`text-sm flex items-center gap-1 ${getAvalEstadoPerfil('talentoHumano') ? 'text-green-700' : 'text-orange-700'}`}>
                        {getAvalEstadoPerfil('talentoHumano') ? (<><CheckCircle size={16} /> Aprobado</>) : (<><XCircle size={16} /> Pendiente</>) }
                      </span>
                    </div>
                    <div className={`flex items-center justify-between p-2 rounded ${getAvalEstadoPerfil('coordinador') ? 'bg-green-100' : 'bg-orange-100'}`}>
                      <span className="font-semibold text-sm">Coordinación</span>
                      <span className={`text-sm flex items-center gap-1 ${getAvalEstadoPerfil('coordinador') ? 'text-green-700' : 'text-orange-700'}`}>
                        {getAvalEstadoPerfil('coordinador') ? (<><CheckCircle size={16} /> Aprobado</>) : (<><XCircle size={16} /> Pendiente</>)}
                      </span>
                    </div>
                    <div className={`flex items-center justify-between p-2 rounded ${getAvalEstadoPerfil('rectoria') ? 'bg-green-100' : 'bg-orange-100'}`}>
                      <span className="font-semibold text-sm">Rectoría</span>
                      <span className={`text-sm flex items-center gap-1 ${getAvalEstadoPerfil('rectoria') ? 'text-green-700' : 'text-orange-700'}`}>
                        {getAvalEstadoPerfil('rectoria') ? (<><CheckCircle size={16} /> Aprobado</>) : (<><XCircle size={16} /> Pendiente</>) }
                      </span>
                    </div>
                    <div className={`flex items-center justify-between p-2 rounded ${getAvalEstadoPerfil('vicerrectoria') ? 'bg-green-100' : 'bg-orange-100'}`}>
                      <span className="font-semibold text-sm">Vicerrectoría</span>
                      <span className={`text-sm flex items-center gap-1 ${getAvalEstadoPerfil('vicerrectoria') ? 'text-green-700' : 'text-orange-700'}`}>
                        {getAvalEstadoPerfil('vicerrectoria') ? (<><CheckCircle size={16} /> Aprobado</>) : (<><XCircle size={16} /> Pendiente</>)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Experiencias */}
              {perfilCompleto.experiencias && perfilCompleto.experiencias.length > 0 && (
                <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <Briefcase size={20} className="text-indigo-600" />
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
                        className="bg-white p-4 rounded border text-left hover:bg-indigo-50 transition-colors cursor-pointer"
                      >
                        <h4 className="font-bold">{exp.cargo}</h4>
                        <p className="text-sm text-gray-600">{exp.empresa}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {exp.fecha_inicio} - {exp.fecha_fin || 'Actualidad'}
                        </p>
                        {exp.descripcion && <p className="text-sm mt-2">{exp.descripcion}</p>}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Estudios */}
              {perfilCompleto.estudios && perfilCompleto.estudios.length > 0 && (
                <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <GraduationCap size={20} className="text-indigo-600" />
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
                        className="bg-white p-4 rounded border text-left hover:bg-indigo-50 transition-colors cursor-pointer"
                      >
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
                  <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <Globe size={20} className="text-indigo-600" />
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
                        className="bg-white p-4 rounded border text-left hover:bg-indigo-50 transition-colors cursor-pointer"
                      >
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
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <Landmark size={20} className="text-indigo-600" />
                Certificación Bancaria
              </h3>
              <button
                type="button"
                onClick={() => handleAbrirDocumentoDeLista(perfilCompleto.certificacion_bancaria!.documentosCertificacionBancaria)}
                className="bg-white p-4 rounded border text-left w-full hover:bg-indigo-50 transition-colors cursor-pointer"
              >
                <div className="space-y-2 text-sm">
                  {perfilCompleto.certificacion_bancaria.nombre_banco && (
                    <div className="grid grid-cols-2 gap-2">
                      <span className="font-semibold text-gray-600">Banco:</span>
                      <span>{perfilCompleto.certificacion_bancaria.nombre_banco}</span>
                    </div>
                  )}
                  {perfilCompleto.certificacion_bancaria.tipo_cuenta && (
                    <div className="grid grid-cols-2 gap-2">
                      <span className="font-semibold text-gray-600">Tipo de cuenta:</span>
                      <span>{perfilCompleto.certificacion_bancaria.tipo_cuenta}</span>
                    </div>
                  )}
                  {perfilCompleto.certificacion_bancaria.numero_cuenta && (
                    <div className="grid grid-cols-2 gap-2">
                      <span className="font-semibold text-gray-600">Número de cuenta:</span>
                      <span>{perfilCompleto.certificacion_bancaria.numero_cuenta}</span>
                    </div>
                  )}
                  {perfilCompleto.certificacion_bancaria.fecha_emision && (
                    <div className="grid grid-cols-2 gap-2">
                      <span className="font-semibold text-gray-600">Fecha de emisión:</span>
                      <span>{perfilCompleto.certificacion_bancaria.fecha_emision}</span>
                    </div>
                  )}
                </div>
              </button>
            </div>
          )}

          {/* Pensión */}
          {perfilCompleto.pension && (
            <div className="mt-6 bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <PiggyBank size={20} className="text-indigo-600" />
                Pensión
              </h3>
              <button
                type="button"
                onClick={() => handleAbrirDocumentoDeLista(perfilCompleto.pension!.documentosPension)}
                className="bg-white p-4 rounded border text-left w-full hover:bg-indigo-50 transition-colors cursor-pointer"
              >
                <div className="space-y-2 text-sm">
                  {perfilCompleto.pension.regimen_pensional && (
                    <div className="grid grid-cols-2 gap-2">
                      <span className="font-semibold text-gray-600">Régimen:</span>
                      <span>{perfilCompleto.pension.regimen_pensional}</span>
                    </div>
                  )}
                  {perfilCompleto.pension.entidad_pensional && (
                    <div className="grid grid-cols-2 gap-2">
                      <span className="font-semibold text-gray-600">Entidad:</span>
                      <span>{perfilCompleto.pension.entidad_pensional}</span>
                    </div>
                  )}
                  {perfilCompleto.pension.nit_entidad && (
                    <div className="grid grid-cols-2 gap-2">
                      <span className="font-semibold text-gray-600">NIT:</span>
                      <span>{perfilCompleto.pension.nit_entidad}</span>
                    </div>
                  )}
                </div>
              </button>
            </div>
          )}

          {/* Antecedentes Judiciales */}
          {perfilCompleto.antecedente_judicial && (
            <div className="mt-6 bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <Scale size={20} className="text-indigo-600" />
                Antecedentes Judiciales
              </h3>
              <button
                type="button"
                onClick={() => handleAbrirDocumentoDeLista(perfilCompleto.antecedente_judicial!.documentosAntecedentesJudiciales)}
                className="bg-white p-4 rounded border text-left w-full hover:bg-indigo-50 transition-colors cursor-pointer"
              >
                <div className="space-y-2 text-sm">
                  {perfilCompleto.antecedente_judicial.estado_antecedentes && (
                    <div className="grid grid-cols-2 gap-2">
                      <span className="font-semibold text-gray-600">Estado:</span>
                      <span>{perfilCompleto.antecedente_judicial.estado_antecedentes}</span>
                    </div>
                  )}
                  {perfilCompleto.antecedente_judicial.fecha_validacion && (
                    <div className="grid grid-cols-2 gap-2">
                      <span className="font-semibold text-gray-600">Fecha validación:</span>
                      <span>{perfilCompleto.antecedente_judicial.fecha_validacion}</span>
                    </div>
                  )}
                </div>
              </button>
            </div>
          )}

          {/* ARL */}
          {perfilCompleto.arl && (
            <div className="mt-6 bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <ShieldCheck size={20} className="text-indigo-600" />
                ARL
              </h3>
              <button
                type="button"
                onClick={() => handleAbrirDocumentoDeLista(perfilCompleto.arl!.documentosArl)}
                className="bg-white p-4 rounded border text-left w-full hover:bg-indigo-50 transition-colors cursor-pointer"
              >
                <div className="space-y-2 text-sm">
                  {perfilCompleto.arl.nombre_arl && (
                    <div className="grid grid-cols-2 gap-2">
                      <span className="font-semibold text-gray-600">ARL:</span>
                      <span>{perfilCompleto.arl.nombre_arl}</span>
                    </div>
                  )}
                  {perfilCompleto.arl.clase_riesgo && (
                    <div className="grid grid-cols-2 gap-2">
                      <span className="font-semibold text-gray-600">Clase de riesgo:</span>
                      <span>{perfilCompleto.arl.clase_riesgo}</span>
                    </div>
                  )}
                  {perfilCompleto.arl.estado_afiliacion && (
                    <div className="grid grid-cols-2 gap-2">
                      <span className="font-semibold text-gray-600">Estado:</span>
                      <span>{perfilCompleto.arl.estado_afiliacion}</span>
                    </div>
                  )}
                  {perfilCompleto.arl.fecha_afiliacion && (
                    <div className="grid grid-cols-2 gap-2">
                      <span className="font-semibold text-gray-600">Fecha afiliación:</span>
                      <span>{perfilCompleto.arl.fecha_afiliacion}</span>
                    </div>
                  )}
                  {perfilCompleto.arl.fecha_retiro && (
                    <div className="grid grid-cols-2 gap-2">
                      <span className="font-semibold text-gray-600">Fecha retiro:</span>
                      <span>{perfilCompleto.arl.fecha_retiro}</span>
                    </div>
                  )}
                </div>
              </button>
            </div>
          )}
              {/* Documentos */}
              {perfilCompleto.documentos && perfilCompleto.documentos.length > 0 && (
                <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <FileDown size={20} className="text-indigo-600" />
                    Documentos
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {perfilCompleto.documentos.map((doc) => (
                      <button
                        key={doc.id}
                        type="button"
                        onClick={() => handleAbrirDocumento(doc.url)}
                        className="bg-white p-3 rounded border hover:bg-gray-50 flex items-center gap-2 text-left"
                      >
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
    </div>
  );
};

export default VerPostulaciones;
