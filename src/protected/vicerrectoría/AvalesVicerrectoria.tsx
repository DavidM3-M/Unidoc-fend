// src/protected/vicerrectoria/avales.tsx
import InputSearch from "../../componentes/formularios/InputSearch";
import { useCallback, useEffect, useMemo, useState } from "react";
import axiosInstance from "../../utils/axiosConfig";
import { toast } from "react-toastify";
import { CheckCircle, XCircle, Eye, FileText, User, Mail, Phone, Award, Briefcase, GraduationCap, Languages, FileDown, X, Loader2 } from "lucide-react";
import axios from "axios";

/** Tipos auxiliares */
interface Usuario {
  id: number;
  primer_nombre: string;
  segundo_nombre?: string;
  primer_apellido: string;
  segundo_apellido?: string;
  numero_identificacion: string;
  email: string;
  aval_rectoria?: boolean;
  aval_vicerrectoria?: boolean;
  aval_talento_humano?: boolean;
  aval_coordinador?: boolean;
  aval_rectoria_at?: string;
  postulaciones?: Postulacion[];
}
/** Postulación según estructura del endpoint /vicerrectoria/usuarios/{userId}/postulaciones */
interface Postulacion {
  postulacion_id: number;
  estado_postulacion: string;
  convocatoria: {
    id_convocatoria: number;
    nombre_convocatoria: string;
    [key: string]: unknown;
  };
}


interface Avales {
  aval_rectoria: boolean;
  aval_vicerrectoria: boolean;
  aval_talento_humano: boolean;
  aval_coordinador: boolean;
}

interface AspiranteDetallado {
  id: number;
  documentos?: Array<{ id: number; nombre: string; url: string; tipo: string }>;
  datos_personales: {
    primer_nombre: string;
    segundo_nombre?: string;
    primer_apellido: string;
    segundo_apellido?: string;
    tipo_identificacion: string;
    numero_identificacion: string;
    genero: string;
    fecha_nacimiento: string;
    estado_civil: string;
    email: string;
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
  idiomas?: Array<{
    id_idioma?: number;
    idioma: string;
    nivel: string;
    documentos_idioma?: Array<{ archivo_url?: string; url?: string; archivo?: string }>;
    documentosIdioma?: Array<{ archivo_url?: string; url?: string; archivo?: string }>;
  }>;
  experiencias?: Array<{
    id_experiencia?: number;
    cargo: string;
    empresa: string;
    fecha_inicio: string;
    fecha_fin?: string;
    descripcion?: string;
    documentos_experiencia?: Array<{ archivo_url?: string; url?: string; archivo?: string }>;
    documentosExperiencia?: Array<{ archivo_url?: string; url?: string; archivo?: string }>;
  }>;
  estudios?: Array<{
    id_estudio?: number;
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
  avales: {
    rectoria: { estado?: string; aprobado_por?: number; fecha?: string };
    vicerrectoria: { estado?: string; aprobado_por?: number; fecha?: string };
    talentoHumano?: { estado?: string | boolean; aprobado_por?: number; fecha?: string };
    talento_humano?: { estado?: string | boolean; aprobado_por?: number; fecha?: string };
    coordinador?: { estado?: string | boolean; aprobado_por?: number; fecha?: string };
  };
  aval_talento_humano?: boolean | string | number;
  aval_coordinador?: boolean | string | number;
}

type DocumentoAdjunto = { id_documento?: number; archivo_url?: string; url?: string; archivo?: string };
type CategoriaDocs = 'experiencias' | 'estudios' | 'idiomas';

interface Convocatoria {
  id: number;
  nombre?: string;
  fecha?: string;
}

// Eliminado: ConvocatoriaFiltro, ya no se usa

/** Tipos para respuestas API genéricas */
interface ApiResponse<T> {
  data: T;
}

/** Tipo de postulacion según backend real */
interface Postulacion {
  id_postulacion: number;
  convocatoria_postulacion: {
    id_convocatoria: number;
    nombre_convocatoria: string;
  };
  estado_postulacion: string;
}

// Interfaces para evaluaciones
interface EvaluacionVicerrectoria {
  id: number;
  aspirante_user_id: number;
  vicerrectoria_user_id: number;
  plantilla_id?: number;
  prueba_psicotecnica?: string;
  validacion_archivos?: boolean;
  clase_organizada?: boolean;
  aprobado?: boolean;
  formulario?: { seccion: string; campo: string; valor: string }[];
  observaciones?: string;
  created_at?: string;
  updated_at?: string;
}

const GestionAvalesVicerrectoria = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<Usuario | null>(null);
  const [avalesUsuario, setAvalesUsuario] = useState<Avales | null>(null);
  const [convocatoriasUsuario, setConvocatoriasUsuario] = useState<Convocatoria[] | null>(null);
  const [convocatoriasDisponibles, setConvocatoriasDisponibles] = useState<Convocatoria[]>([]);
  const [convocatoriaSeleccionada, setConvocatoriaSeleccionada] = useState<number | null>(null);
  const [perfilCompleto, setPerfilCompleto] = useState<AspiranteDetallado | null>(null);
  const [mostrarPerfilCompleto, setMostrarPerfilCompleto] = useState(false);
  const [loadingPerfil, setLoadingPerfil] = useState(false);
  const [cerrandoModalAvales, setCerrandoModalAvales] = useState(false);
  const [cerrandoPerfilCompleto, setCerrandoPerfilCompleto] = useState(false);
  const [docsPorCategoria, setDocsPorCategoria] = useState<Record<CategoriaDocs, DocumentoAdjunto[]>>({
    experiencias: [],
    estudios: [],
    idiomas: [],
  });
  // Filtros (similar a VerPostulaciones)
  const [selectedConvocatoriaId, setSelectedConvocatoriaId] = useState<number | null>(null);
  const [nameFilter, setNameFilter] = useState("");
  const [dateFrom, setDateFrom] = useState<string | null>(null);
  const [dateTo, setDateTo] = useState<string | null>(null);

  // Estados para evaluaciones
  const [modalVerEvaluacionOpen, setModalVerEvaluacionOpen] = useState(false);
  const [cerrandoModalEvaluacion, setCerrandoModalEvaluacion] = useState(false);
  const [evaluacionExistente, setEvaluacionExistente] = useState<EvaluacionVicerrectoria | null>(null);
  const [errorEvaluacion, setErrorEvaluacion] = useState<string | null>(null);
  const [loadingEvaluacion, setLoadingEvaluacion] = useState(false);
 

  const isAprobado = useCallback((val: unknown): boolean => {
    if (val === true) return true;
    if (typeof val === "number") return val === 1;
    if (typeof val === "string") {
      const s = val.toLowerCase();
      return s === "1" || s === "aprobado" || s === "si" || s === "true";
    }
    return false;
  }, []);

  const getEstadoAvalPerfil = useCallback((perfil: AspiranteDetallado, tipo: "talento_humano" | "coordinador") => {
    if (tipo === "talento_humano") {
      return (
        perfil.avales?.talentoHumano?.estado ??
        perfil.avales?.talento_humano?.estado ??
        perfil.aval_talento_humano
      );
    }
    return perfil.avales?.coordinador?.estado ?? perfil.aval_coordinador;
  }, []);

  const fetchUsuarios = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get<ApiResponse<Usuario[]>>("/vicerrectoria/usuarios");
      const data = response.data?.data ?? (response.data as unknown as Record<string, unknown>)?.usuarios ?? response.data;
        let usuarios: Usuario[] = Array.isArray(data)
          ? (data as Usuario[]).map((u) => {
              // Fallback for possible extra property from backend
              const uObj = u as unknown as Record<string, unknown>;
              const nombreCompleto = (uObj["nombre_completo"] as string | undefined) ?? (uObj["nombre"] as string | undefined) ?? "";
              return {
                id: Number(u.id ?? 0),
                primer_nombre: String(u.primer_nombre ?? nombreCompleto),
                segundo_nombre: String(u.segundo_nombre ?? ""),
                primer_apellido: String(u.primer_apellido ?? ""),
                segundo_apellido: String(u.segundo_apellido ?? ""),
                numero_identificacion: String(u.numero_identificacion ?? ""),
                email: String(u.email ?? ""),
                aval_rectoria: isAprobado(u.aval_rectoria),
                aval_vicerrectoria: isAprobado(u.aval_vicerrectoria),
                aval_talento_humano: isAprobado(u.aval_talento_humano),
                aval_coordinador: isAprobado(uObj["aval_coordinador"] ?? uObj["aval_coordinacion"]),
                aval_rectoria_at: u.aval_rectoria_at ? String(u.aval_rectoria_at) : undefined,
              };
            })
          : [];

      // Obtener postulaciones para cada usuario
      usuarios = await Promise.all(
        usuarios.map(async (user) => {
          try {
            const resp = await axiosInstance.get<ApiResponse<Postulacion[]>>(`/vicerrectoria/usuarios/${user.id}/postulaciones`);
            const postulaciones = resp.data?.data ?? resp.data;
            return { ...user, postulaciones: Array.isArray(postulaciones) ? postulaciones : [] };
          } catch {
            return { ...user, postulaciones: [] };
          }
        })
      );
      setUsuarios(usuarios);
    } catch (error: unknown) {
      console.error("Error al obtener usuarios:", error);
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Error al cargar los usuarios");
      } else {
        toast.error("Error al cargar los usuarios");
      }
    } finally {
      setLoading(false);
    }
  }, [isAprobado]);

  const fetchConvocatorias = useCallback(async () => {
    try {
      const response = await axiosInstance.get<{ data?: Convocatoria[]; convocatorias?: Convocatoria[] }>("/vicerrectoria/obtener-convocatorias");
      const data = response.data?.data ?? response.data?.convocatorias ?? response.data;
        const convs: Convocatoria[] = Array.isArray(data)
          ? (data as Convocatoria[]).map((c) => {
              const cObj = c as unknown as Record<string, unknown>;
              return {
                id: Number(
                  c.id ??
                  cObj["id_convocatoria"] ??
                  cObj["idConvocatoria"] ??
                  cObj["convocatoriaId"] ??
                  0
                ),
                nombre:
                  c.nombre ??
                  (cObj["nombre_convocatoria"] as string | undefined) ??
                  (cObj["titulo"] as string | undefined) ??
                  (cObj["nombreConvocatoria"] as string | undefined) ??
                  `Convocatoria ${Number(c.id ?? cObj["id_convocatoria"] ?? 0)}`,
                fecha: c.fecha,
              };
            })
          : [];
      setConvocatoriasDisponibles(convs.filter((c) => Boolean(c.id)));
      return convs.filter((c) => Boolean(c.id));
    } catch (error: unknown) {
      console.warn("No se pudieron cargar convocatorias de Vicerrectoría", error);
      setConvocatoriasDisponibles([]);
      return [];
    }
  }, []);

  // Funciones para evaluaciones
  const handleVerEvaluacion = async (aspiranteId: number) => {
    setLoadingEvaluacion(true);
    setEvaluacionExistente(null);
    setErrorEvaluacion(null);
    setModalVerEvaluacionOpen(true);

    try {
      // Buscar evaluación por ID de aspirante
      const res = await axiosInstance.get(`/vicerrectoria/evaluaciones/${aspiranteId}`);

      // Verificar diferentes estructuras de respuesta posibles
      let evaluacion = null;

      if (res.data && res.data.data && res.data.data.evaluacion) {
        // Estructura correcta: { data: { evaluacion: {...}, plantilla: {...} } }
        evaluacion = res.data.data.evaluacion;
      } else if (res.data && res.data.evaluacion) {
        // Estructura alternativa: { evaluacion: {...}, plantilla: {...} }
        evaluacion = res.data.evaluacion;
      } else if (res.data && res.data.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
        // Estructura con array: { data: [{ evaluacion: {...}, ... }] }
        evaluacion = res.data.data[0].evaluacion;
      }

      if (evaluacion) {
        setEvaluacionExistente(evaluacion);
      } else {
        setErrorEvaluacion("No se encontró evaluación registrada para este aspirante.");
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err?.response?.status === 404) {
        setErrorEvaluacion("Evaluación no encontrada para este usuario.");
      } else if (axios.isAxiosError(err) && err?.response?.status === 500) {
        setErrorEvaluacion("Error interno del servidor. Puede que la evaluación no exista, haya sido borrada o haya un problema con la plantilla asociada.");
      } else {
        setErrorEvaluacion("No se pudo obtener la evaluación. Intente más tarde.");
      }
    } finally {
      setLoadingEvaluacion(false);
    }
  };

  const cerrarModalVerEvaluacion = () => {
    setCerrandoModalEvaluacion(true);
    setTimeout(() => {
      setModalVerEvaluacionOpen(false);
      setEvaluacionExistente(null);
      setErrorEvaluacion(null);
      setCerrandoModalEvaluacion(false);
    }, 200);
  };

  useEffect(() => {
    fetchUsuarios();
    fetchConvocatorias();
  }, [fetchUsuarios, fetchConvocatorias]);

  const handleDarAval = async (userId: number) => {
    try {
      const payload: Record<string, unknown> = { estado: "Aprobado" };
      if (convocatoriaSeleccionada) payload.convocatoria_id = convocatoriaSeleccionada;

      console.log("POST /vicerrectoria/aval-hoja-vida/", userId, "payload:", payload);
      const response = await axiosInstance.post(`/vicerrectoria/aval-hoja-vida/${userId}`, payload);
      console.log("response dar aval:", response.status, response.data);

      // Optimistic UI: marcar en la lista
      setUsuarios((prev) => prev.map((u) => (u.id === userId ? { ...u, aval_vicerrectoria: true } : u)));
      // también actualizar avalesUsuario si está abierto
      setAvalesUsuario((prev) => (prev ? { ...prev, aval_vicerrectoria: true } : prev));
      toast.success("Aval de Vicerrectoría otorgado exitosamente");
      if (usuarioSeleccionado?.id === userId) await verAvales(userId);
      // Si el modal de perfil completo está abierto para este usuario, recargar el perfil
      if (mostrarPerfilCompleto && perfilCompleto?.id === userId) {
        await verPerfilCompleto(userId);
      }
    } catch (error: unknown) {
      console.error("Error al dar aval:", error);
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.error || error.response?.data?.message || "Error al otorgar el aval");
      } else {
        toast.error("Error al otorgar el aval");
      }
    }
  };

  const verAvales = async (userId: number) => {
    try {
      const response = await axiosInstance.get<ApiResponse<unknown>>(`/vicerrectoria/usuarios/${userId}/avales`);
      const data = response.data?.data ?? response.data;

      let normalized: Avales | null = null;
      if (data && typeof data === "object" && data !== null) {
        const obj = data as Record<string, unknown>;
        if ("aval_rectoria" in obj || "aval_vicerrectoria" in obj) {
          normalized = {
            aval_rectoria: isAprobado(obj["aval_rectoria"]),
            aval_vicerrectoria: isAprobado(obj["aval_vicerrectoria"]),
            aval_talento_humano: isAprobado(obj["aval_talento_humano"]),
            aval_coordinador: isAprobado(obj["aval_coordinador"] ?? obj["aval_coordinacion"]),
          };
        } else if ("rectoria" in obj || "vicerrectoria" in obj) {
          const rect = obj["rectoria"] as unknown;
          const vic = obj["vicerrectoria"] as unknown;
          const talento = obj["talento_humano"] as unknown;
          const coord = obj["coordinador"] as unknown;
          // cada uno puede ser un objeto con .estado o un valor directo
          const rectEstado = typeof rect === "object" && rect !== null ? ((rect as Record<string, unknown>)["estado"] ?? rect) : rect;
          const vicEstado = typeof vic === "object" && vic !== null ? ((vic as Record<string, unknown>)["estado"] ?? vic) : vic;
          const talentoEstado = typeof talento === "object" && talento !== null ? ((talento as Record<string, unknown>)["estado"] ?? talento) : talento;
          const coordEstado = typeof coord === "object" && coord !== null ? ((coord as Record<string, unknown>)["estado"] ?? coord) : coord;
          normalized = {
            aval_rectoria: isAprobado(rectEstado),
            aval_vicerrectoria: isAprobado(vicEstado),
            aval_talento_humano: isAprobado(talentoEstado),
            aval_coordinador: isAprobado(coordEstado),
          };
        }
      }

      setAvalesUsuario(normalized);
    } catch (error: unknown) {
      console.error("Error al obtener avales:", error);
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Error al cargar los avales");
      } else {
        toast.error("Error al cargar los avales");
      }
    }
  };

  const fetchConvocatoriasUsuario = async (userId: number) => {
    try {
      const response = await axiosInstance.get<ApiResponse<Postulacion[]>>(
        `/vicerrectoria/usuarios/${userId}/postulaciones`
      );
      console.log("DEBUG fetchConvocatoriasUsuario response:", response.status, response.data);
      const data = response.data?.data ?? response.data;
      console.log("DEBUG fetchConvocatoriasUsuario data normalized:", data);
      // Eliminado: lógica antigua de mapeo de convocatorias por usuario/postulación
    } catch (error: unknown) {
      console.warn("No se pudieron obtener convocatorias del usuario o endpoint no existe:", error);
      if (convocatoriasDisponibles.length > 0) {
        setConvocatoriasUsuario(convocatoriasDisponibles);
        return;
      }
      const convs = await fetchConvocatorias();
      setConvocatoriasUsuario(convs.length > 0 ? convs : null);
    }
  };

  const verPerfilCompleto = async (userId: number) => {
    try {
      setLoadingPerfil(true);
      const response = await axiosInstance.get(`/admin/aspirantes/${userId}`);
      setPerfilCompleto(response.data.aspirante);
      setMostrarPerfilCompleto(true);
      setCerrandoPerfilCompleto(false);
      await verAvales(userId);
      fetchDocsCategoria(userId, 'experiencias');
      fetchDocsCategoria(userId, 'estudios');
      fetchDocsCategoria(userId, 'idiomas');
    } catch (error: unknown) {
      console.error("Error al obtener perfil completo:", error);
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Error al cargar el perfil del aspirante");
      } else {
        toast.error("Error al cargar el perfil del aspirante");
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
      setDocsPorCategoria({ experiencias: [], estudios: [], idiomas: [] });
      setCerrandoPerfilCompleto(false);
    }, 200);
  };

  const cerrarModalAvales = () => {
    setCerrandoModalAvales(true);
    setTimeout(() => {
      setUsuarioSeleccionado(null);
      setAvalesUsuario(null);
      setConvocatoriasUsuario(null);
      setConvocatoriaSeleccionada(null);
      setCerrandoModalAvales(false);
    }, 200);
  };

  const getBaseUrlNoApi = () => {
    const baseUrl = import.meta.env.VITE_API_URL ?? '';
    return baseUrl.replace(/\/api\/?$/, '');
  };

  const fetchDocsCategoria = async (userId: number, categoria: CategoriaDocs) => {
    try {
      const baseURL = import.meta.env.VITE_API_URL ?? '';
      const resp = await axiosInstance.get(`/vicerrectoria/documentos/${userId}/${categoria}`, { baseURL });
      const docs = (resp.data?.data ?? resp.data?.documentos ?? resp.data) as DocumentoAdjunto[];
      setDocsPorCategoria((prev) => ({ ...prev, [categoria]: Array.isArray(docs) ? docs : [] }));
    } catch (error) {
      console.warn('No se pudieron cargar documentos por categoría', error);
    }
  };

  const handleAbrirDocumento = (docUrl: string) => {
    if (!docUrl) {
      toast.error('Documento no disponible');
      return;
    }

    const baseUrl = getBaseUrlNoApi();
    const url = docUrl.startsWith('http')
      ? docUrl
      : `${baseUrl}${docUrl.startsWith('/') ? '' : '/'}${docUrl}`;

    window.open(url, '_blank');
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
      const endpoint = `${baseUrl}/vicerrectoria/ver-documento/${doc.id_documento}`;
      window.open(endpoint, '_blank');
      return;
    }

    toast.info('No hay documento asociado para esta sección');
  };

  const handleAbrirDocumentoCategoria = (categoria: CategoriaDocs) => {
    const docs = docsPorCategoria[categoria];
    if (docs && docs.length > 0) {
      handleAbrirDocumentoDeLista(docs);
      return;
    }
    toast.info('No hay documento asociado para esta sección');
  };


  /**
   * handleVerHojaVida
   * - Según tus rutas actuales, Vicerrectoría expone: GET /vicerrectoria/hoja-de-vida-pdf/{idUsuario}
   * - No se modifica el modal ni su estado desde aquí.
   * - Si no hay convocatorias cargadas, se intenta cargarlas en background antes de fallar.
   */
  const handleVerHojaVida = async (userOrId: number | Usuario | AspiranteDetallado) => {
    const id = typeof userOrId === "number" ? userOrId : userOrId.id;

    if (convocatoriasUsuario === null) {
      await fetchConvocatoriasUsuario(id as number);
    }

    try {
      const response = await axiosInstance.get(`/vicerrectoria/hoja-de-vida-pdf/${id}`, {
        responseType: "blob",
      });

      const headers = response.headers as Record<string, string>;
      const contentType = headers["content-type"] ?? headers["Content-Type"] ?? "";

      if (contentType.includes("application/pdf")) {
        const pdfBlob = new Blob([response.data], { type: "application/pdf" });
        const pdfUrl = URL.createObjectURL(pdfBlob);
        window.open(pdfUrl, "_blank");
        return;
      }

      if (response.data instanceof Blob) {
        const text = await response.data.text();
        let parsed;
        try {
          parsed = JSON.parse(text);
        } catch {
          parsed = { message: text };
        }
        toast.error(parsed.message || "Respuesta inesperada al descargar PDF");
      } else {
        toast.error("Respuesta inesperada al descargar PDF");
      }
    } catch (error: unknown) {
      console.error("Error al ver la hoja de vida:", error);
      if (axios.isAxiosError(error) && error.response) {
        const status = error.response.status;
        const data = error.response.data;
        if (data instanceof Blob) {
          try {
            const errText = await data.text();
            let errJson;
            try {
              errJson = JSON.parse(errText);
            } catch {
              errJson = { message: errText };
            }
            if (status === 404) {
              toast.error(errJson.message || "Archivo no encontrado (404). Verifica usuario.");
            } else if (status === 403) {
              toast.error("Acceso denegado (403). Revisa roles/token.");
            } else {
              toast.error(errJson.message || "Error al cargar la hoja de vida");
            }
          } catch {
            toast.error("Error al cargar la hoja de vida");
          }
        } else {
          toast.error(error.response.data?.message || `Error al cargar la hoja de vida (${status})`);
        }
      } else {
        toast.error("Error al cargar la hoja de vida");
      }
    }
  };

  const estadisticas = useMemo(() => {
    const conAval = usuarios.filter((u) => u.aval_vicerrectoria).length;
    const sinAval = usuarios.filter((u) => !u.aval_vicerrectoria).length;
    return { conAval, sinAval, total: usuarios.length };
  }, [usuarios]);

  // Convocatorias extraídas de la lista de usuarios (cuando estén disponibles)
  // Eliminado: lógica y variables de convocatorias antiguas. Si se requiere filtrar por convocatoria, usar solo las postulaciones actuales.


  // Agrupar postulaciones por convocatoria
  const postulacionesPorConvocatoria = useMemo(() => {
    const map = new Map<number, { id: number; nombre: string; postulantes: Usuario[] }>();
    usuarios.forEach((u) => {
      (u.postulaciones ?? []).forEach((p) => {
        const id = p.convocatoria.id_convocatoria;
        const nombre = p.convocatoria.nombre_convocatoria || `Convocatoria ${id}`;
        if (!map.has(id)) {
          map.set(id, { id, nombre, postulantes: [u] });
        } else {
          map.get(id)!.postulantes.push(u);
        }
      });
    });
    return Array.from(map.values());
  }, [usuarios]);

  // Filtros y búsqueda
  const [modalConvocatoria, setModalConvocatoria] = useState<{ id: number; nombre: string } | null>(null);
  const [modalSearch, setModalSearch] = useState("");
  const [modalPage, setModalPage] = useState(1);
  const modalPageSize = 12;

  const postulantesModal = useMemo(() => {
    if (!modalConvocatoria) return [] as Usuario[];
    const grupo = postulacionesPorConvocatoria.find((g) => g.id === modalConvocatoria.id);
    return grupo?.postulantes ?? [];
  }, [postulacionesPorConvocatoria, modalConvocatoria]);

  const postulantesModalFiltrados = useMemo(() => {
    if (!modalSearch.trim()) return postulantesModal;
    const q = modalSearch.toLowerCase();
    return postulantesModal.filter((u) => {
      const nombre = `${u.primer_nombre} ${u.segundo_nombre || ''} ${u.primer_apellido || ''} ${u.segundo_apellido || ''}`.toLowerCase();
      const id = (u.numero_identificacion ?? "").toLowerCase();
      const email = (u.email ?? "").toLowerCase();
      return nombre.includes(q) || id.includes(q) || email.includes(q);
    });
  }, [postulantesModal, modalSearch]);

  const totalModalPages = useMemo(() => {
    return Math.max(1, Math.ceil(postulantesModalFiltrados.length / modalPageSize));
  }, [postulantesModalFiltrados.length, modalPageSize]);

  const postulantesModalPaginados = useMemo(() => {
    const start = (modalPage - 1) * modalPageSize;
    return postulantesModalFiltrados.slice(start, start + modalPageSize);
  }, [postulantesModalFiltrados, modalPage, modalPageSize]);


  // `cerrarModalConvocatoria` removed — modalConvocatoria is no longer used.

  return (
    <div className="flex flex-col gap-4 w-full bg-white rounded-xl sm:rounded-2xl lg:rounded-3xl p-4 sm:p-6 lg:p-8 min-h-screen">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-col sm:flex-row w-full sm:w-auto">
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 flex items-center gap-2 flex-wrap">
              <CheckCircle size={28} className="text-purple-600 flex-shrink-0" />
              <span>Gestión de Avales - Vicerrectoría</span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">Revisa y otorga avales a las hojas de vida</p>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 sm:p-4 rounded-lg text-white shadow-md">
          <p className="text-xs sm:text-sm font-medium opacity-90">Total Usuarios</p>
          <p className="text-2xl sm:text-3xl font-bold mt-1">{estadisticas.total}</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 p-3 sm:p-4 rounded-lg text-white shadow-md">
          <p className="text-xs sm:text-sm font-medium opacity-90">Con Aval</p>
          <p className="text-2xl sm:text-3xl font-bold mt-1">{estadisticas.conAval}</p>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-3 sm:p-4 rounded-lg text-white shadow-md">
          <p className="text-xs sm:text-sm font-medium opacity-90">Sin Aval</p>
          <p className="text-2xl sm:text-3xl font-bold mt-1">{estadisticas.sinAval}</p>
        </div>
      </div>

      {/* Campo de búsqueda general */}
      {/* Controles: convocatoria + búsqueda por nombre + filtro por fechas */}
      <div className="w-full mb-3 grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
        <div>
          <label className="text-sm font-semibold text-gray-700">Convocatoria</label>
          <select
            value={selectedConvocatoriaId ?? ""}
            onChange={(e) => setSelectedConvocatoriaId(e.target.value ? Number(e.target.value) : null)}
            className="w-full mt-1 p-2 border rounded-lg bg-white"
          >
            <option value="">Todas</option>
            {/* Filtro de convocatoria deshabilitado, solo opción 'Todas' */}
          </select>
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-700">Nombre</label>
          <InputSearch
            type="text"
            placeholder="Nombre del usuario..."
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
            className="w-full mt-1"
          />
        </div>

        <div className="flex gap-2">
          <div className="w-1/2">
            <label className="text-sm font-semibold text-gray-700">Desde</label>
            <input type="date" value={dateFrom ?? ""} onChange={(e) => setDateFrom(e.target.value || null)} className="w-full mt-1 p-2 border rounded-lg" />
          </div>
          <div className="w-1/2">
            <label className="text-sm font-semibold text-gray-700">Hasta</label>
            <input type="date" value={dateTo ?? ""} onChange={(e) => setDateTo(e.target.value || null)} className="w-full mt-1 p-2 border rounded-lg" />
          </div>
        </div>
      </div>

      {/* Tarjetas de convocatorias */}
      {loading ? (
        <div className="py-10 text-center text-gray-500">Cargando postulaciones...</div>
      ) : postulacionesPorConvocatoria.length === 0 ? (
        <div className="py-10 text-center text-gray-500">No hay postulaciones con los filtros actuales.</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {postulacionesPorConvocatoria.map((conv) => (
            <div key={conv.id} className="border rounded-2xl p-5 shadow-sm bg-white">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{conv.nombre}</h3>
                  <p className="text-sm text-gray-500">{conv.postulantes.length} postulante(s)</p>
                </div>
                <button
                  onClick={() => {
                    setModalSearch("");
                    setModalPage(1);
                    setModalConvocatoria({ id: conv.id, nombre: conv.nombre });
                  }}
                  className="text-sm px-3 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  Ver postulantes
                </button>
              </div>
              <div className="mt-4">
                <div className="text-sm text-gray-500">
                  Haz clic en “Ver postulantes” para visualizar el listado completo.
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de postulantes por convocatoria */}
      {modalConvocatoria && (
        <div className={`modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto`}>
          <div className={`modal-content bg-white rounded-xl shadow-2xl w-full max-w-6xl my-8`}>
            <div className="flex items-center justify-between p-5 border-b">
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  Postulantes - {modalConvocatoria.nombre}
                </h2>
                <p className="text-sm text-gray-500">{postulantesModal.length} postulante(s)</p>
              </div>
              <button
                onClick={() => setModalConvocatoria(null)}
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
                      {postulantesModalFiltrados.length} postulante(s) • Página {modalPage} de {totalModalPages}
                    </div>
                  </div>

                  {postulantesModalPaginados.map((u) => (
                    <div key={u.id} className="border rounded-xl p-4 bg-white shadow-sm">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                            <User size={18} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-800">
                              {u.primer_nombre} {u.primer_apellido}
                            </h3>
                            <div className="text-sm text-gray-500">
                              {u.numero_identificacion} • {u.email}
                            </div>
                            <div className="mt-1">
                              <span
                                className={`text-xs px-2 py-1 rounded-full ${u.aval_vicerrectoria ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
                              >
                                {u.aval_vicerrectoria ? "Aval otorgado" : "Aval pendiente"}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => verPerfilCompleto(u.id)}
                            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-3 py-2 rounded-md hover:bg-indigo-700 shadow text-sm"
                          >
                            <User size={14} />
                            <span>Ver perfil</span>
                          </button>
                          <button
                            onClick={() => handleVerHojaVida(u)}
                            className="inline-flex items-center gap-2 bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-50 px-3 py-2 rounded-md shadow-sm text-sm"
                          >
                            <FileText size={14} />
                            <span>Hoja de Vida</span>
                          </button>
                          <button
                            onClick={() => handleVerEvaluacion(u.id)}
                            className="inline-flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 shadow text-sm"
                          >
                            <Eye size={14} />
                            <span>Ver Evaluación</span>
                          </button>
                          {!u.aval_vicerrectoria && (
                            <button
                              onClick={() => handleDarAval(u.id)}
                              className="inline-flex items-center gap-2 bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 shadow text-sm"
                            >
                              <CheckCircle size={14} />
                              Dar Aval
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t">
                    <button
                      onClick={() => setModalPage((p) => Math.max(1, p - 1))}
                      disabled={modalPage <= 1}
                      className="px-3 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm disabled:opacity-50"
                    >
                      Anterior
                    </button>
                    <div className="text-xs text-gray-500">
                      Página {modalPage} de {totalModalPages}
                    </div>
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
      {/* Modal de aspirantes por convocatoria eliminado: ahora todos los aspirantes se ven directamente */}

      {/* Modal de Avales (sin cambios en estructura o UI) */}
      {usuarioSeleccionado && avalesUsuario && (
        <div className={`modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 ${cerrandoModalAvales ? "modal-exit" : ""}`}>
          <div className={`modal-content bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto ${cerrandoModalAvales ? "modal-exit" : ""}`}>
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-bold mb-2">Estado de Avales</h2>
              <p className="text-purple-100 text-sm sm:text-base">
                {usuarioSeleccionado.primer_nombre} {usuarioSeleccionado.primer_apellido}
              </p>
              <p className="text-purple-100 text-xs sm:text-sm">ID: {usuarioSeleccionado.numero_identificacion}</p>
            </div>

            <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
              <div
                className={`border-2 rounded-lg p-3 sm:p-4 ${
                  avalesUsuario.aval_vicerrectoria ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"
                }`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                        {avalesUsuario.aval_vicerrectoria ? (
                          <CheckCircle className="text-green-600 flex-shrink-0" size={24} />
                        ) : (
                          <XCircle className="text-red-600 flex-shrink-0" size={24} />
                        )}
                    <div>
                      <h3 className="font-bold text-base sm:text-lg">Aval de Vicerrectoría</h3>
                      <p className="text-xs sm:text-sm text-gray-600 mt-1">
                        {avalesUsuario.aval_vicerrectoria ? "Aval otorgado" : "Aval pendiente"}
                      </p>
                    </div>
                  </div>
                  {!avalesUsuario.aval_vicerrectoria && (
                    <button
                      onClick={() => usuarioSeleccionado && handleDarAval(usuarioSeleccionado.id)}
                      className="w-full sm:w-auto bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                    >
                      Dar Aval
                    </button>
                  )}
                </div>
              </div>

              {/* Convocatoria removed to match Rectoría modal (no download/select block) */}

              <div
                className={`border-2 rounded-lg p-3 sm:p-4 ${
                  avalesUsuario.aval_rectoria ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"
                }`}
              >
                <div className="flex items-center gap-2">
                  {avalesUsuario.aval_rectoria ? (
                    <CheckCircle className="text-green-600 flex-shrink-0" size={24} />
                  ) : (
                    <XCircle className="text-red-600 flex-shrink-0" size={24} />
                  )}
                  <div>
                    <h3 className="font-bold text-sm sm:text-base">Aval de Rectoría</h3>
                    <p className="text-xs sm:text-sm text-gray-600">
                      {avalesUsuario.aval_rectoria ? "Aval otorgado" : "Aval pendiente"}
                    </p>
                  </div>
                </div>
              </div>

              <div
                className={`border-2 rounded-lg p-3 sm:p-4 ${
                  avalesUsuario.aval_talento_humano ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"
                }`}
              >
                <div className="flex items-center gap-2">
                  {avalesUsuario.aval_talento_humano ? (
                    <CheckCircle className="text-green-600 flex-shrink-0" size={24} />
                  ) : (
                    <XCircle className="text-red-600 flex-shrink-0" size={24} />
                  )}
                  <div>
                    <h3 className="font-bold text-sm sm:text-base">Aval de Talento Humano</h3>
                    <p className="text-xs sm:text-sm text-gray-600">
                      {avalesUsuario.aval_talento_humano ? "Aval otorgado" : "Aval pendiente"}
                    </p>
                  </div>
                </div>
              </div>

              <div
                className={`border-2 rounded-lg p-3 sm:p-4 ${
                  avalesUsuario.aval_coordinador ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"
                }`}
              >
                <div className="flex items-center gap-2">
                  {avalesUsuario.aval_coordinador ? (
                    <CheckCircle className="text-green-600 flex-shrink-0" size={24} />
                  ) : (
                    <XCircle className="text-red-600 flex-shrink-0" size={24} />
                  )}
                  <div>
                    <h3 className="font-bold text-sm sm:text-base">Aval de Coordinación</h3>
                    <p className="text-xs sm:text-sm text-gray-600">
                      {avalesUsuario.aval_coordinador ? "Aval otorgado" : "Aval pendiente"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t p-4 bg-gray-50 flex justify-end">
              <button
                onClick={cerrarModalAvales}
                className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm sm:text-base"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal de Perfil Completo (traído de Rectoría y adaptado) */}
      {mostrarPerfilCompleto && perfilCompleto && (
        <div className={`modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto ${cerrandoPerfilCompleto ? "modal-exit" : ""}`}>
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
                  onClick={() => handleVerHojaVida(perfilCompleto)}
                  disabled={loadingPerfil}
                  className={`bg-white text-indigo-600 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 ${loadingPerfil ? 'opacity-60 cursor-not-allowed' : 'hover:bg-indigo-50'}`}
                >
                  {loadingPerfil ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
                  Descargar Hoja de Vida
                </button>
                <button
                  onClick={() => handleVerEvaluacion(perfilCompleto.id)}
                  disabled={loadingPerfil}
                  className={`bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 ${loadingPerfil ? 'opacity-60 cursor-not-allowed' : 'hover:bg-blue-700'}`}
                >
                  {loadingPerfil ? <Loader2 size={16} className="animate-spin" /> : <Eye size={16} />}
                  Ver Evaluación
                </button>
                {!isAprobado(perfilCompleto.avales.vicerrectoria.estado) && (
                  <button
                    onClick={() => handleDarAval(perfilCompleto.id)}
                    disabled={loadingPerfil}
                    className={`bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 ${loadingPerfil ? 'opacity-60 cursor-not-allowed' : 'hover:bg-green-700'}`}
                  >
                    {loadingPerfil ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                    Dar Aval
                  </button>
                )}
              </div>
            </div>

            <div className="p-6 max-h-[calc(100vh-250px)] overflow-y-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <User size={20} className="text-indigo-600" /> Datos Personales
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
                    <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2"><Phone size={20} className="text-indigo-600" /> Contacto</h3>
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
                      {perfilCompleto.informacion_contacto.barrio && (
                        <div className="grid grid-cols-2 gap-2">
                          <span className="font-semibold text-gray-600">Barrio:</span>
                          <span>{perfilCompleto.informacion_contacto.barrio}</span>
                        </div>
                      )}
                      {perfilCompleto.informacion_contacto.correo_alterno && (
                        <div className="grid grid-cols-2 gap-2">
                          <span className="font-semibold text-gray-600">Correo Alterno:</span>
                          <span>{perfilCompleto.informacion_contacto.correo_alterno}</span>
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
                        <span>{perfilCompleto.eps?.nombre_eps}</span>
                      </div>
                    )}
                    {perfilCompleto.rut?.numero_rut && (
                      <div className="grid grid-cols-2 gap-2">
                        <span className="font-semibold text-gray-600">RUT:</span>
                        <span>{perfilCompleto.rut?.numero_rut}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2"><Award size={20} className="text-indigo-600" /> Avales</h3>
                  <div className="space-y-3">
                    <div className={`flex items-center justify-between p-2 rounded ${isAprobado(avalesUsuario?.aval_talento_humano ?? getEstadoAvalPerfil(perfilCompleto, 'talento_humano')) ? 'bg-green-100' : 'bg-red-100'}`}>
                      <span className="font-semibold text-sm">Talento Humano</span>
                      <span className={`text-sm flex items-center gap-1 ${isAprobado(avalesUsuario?.aval_talento_humano ?? getEstadoAvalPerfil(perfilCompleto, 'talento_humano')) ? 'text-green-700' : 'text-red-700'}`}>
                        {isAprobado(avalesUsuario?.aval_talento_humano ?? getEstadoAvalPerfil(perfilCompleto, 'talento_humano')) ? 'Aprobado' : 'Pendiente'}
                      </span>
                    </div>
                    <div className={`flex items-center justify-between p-2 rounded ${isAprobado(avalesUsuario?.aval_coordinador ?? getEstadoAvalPerfil(perfilCompleto, 'coordinador')) ? 'bg-green-100' : 'bg-red-100'}`}>
                      <span className="font-semibold text-sm">Coordinación</span>
                      <span className={`text-sm flex items-center gap-1 ${isAprobado(avalesUsuario?.aval_coordinador ?? getEstadoAvalPerfil(perfilCompleto, 'coordinador')) ? 'text-green-700' : 'text-red-700'}`}>
                        {isAprobado(avalesUsuario?.aval_coordinador ?? getEstadoAvalPerfil(perfilCompleto, 'coordinador')) ? 'Aprobado' : 'Pendiente'}
                      </span>
                    </div>
                    <div className={`flex items-center justify-between p-2 rounded ${isAprobado(perfilCompleto.avales.rectoria.estado) ? 'bg-green-100' : 'bg-red-100'}`}>
                      <span className="font-semibold text-sm">Rectoría</span>
                      <span className={`text-sm flex items-center gap-1 ${isAprobado(perfilCompleto.avales.rectoria.estado) ? 'text-green-700' : 'text-red-700'}`}>
                        {isAprobado(perfilCompleto.avales.rectoria.estado) ? 'Aprobado' : 'Pendiente'}
                      </span>
                    </div>
                    <div className={`flex items-center justify-between p-2 rounded ${isAprobado(perfilCompleto.avales.vicerrectoria.estado) ? 'bg-green-100' : 'bg-red-100'}`}>
                      <span className="font-semibold text-sm">Vicerrectoría</span>
                      <span className={`text-sm flex items-center gap-1 ${isAprobado(perfilCompleto.avales.vicerrectoria.estado) ? 'text-green-700' : 'text-red-700'}`}>
                        {isAprobado(perfilCompleto.avales.vicerrectoria.estado) ? 'Aprobado' : 'Pendiente'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {perfilCompleto.experiencias && perfilCompleto.experiencias.length > 0 && (
                <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2"><Briefcase size={20} className="text-indigo-600" /> Experiencia Laboral</h3>
                  <div className="space-y-3">
                    {perfilCompleto.experiencias.map((exp, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleAbrirDocumentoCategoria('experiencias')}
                        className="bg-white p-4 rounded border text-left hover:bg-indigo-50 transition-colors cursor-pointer"
                      >
                        <h4 className="font-bold">{exp.cargo} - {exp.empresa}</h4>
                        <p className="text-sm text-gray-600">{exp.descripcion}</p>
                        <p className="text-xs text-gray-500 mt-1">{exp.fecha_inicio} - {exp.fecha_fin || 'Actual'}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {perfilCompleto.estudios && perfilCompleto.estudios.length > 0 && (
                <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2"><GraduationCap size={20} className="text-indigo-600" /> Formación Académica</h3>
                  <div className="space-y-3">
                    {perfilCompleto.estudios.map((est, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleAbrirDocumentoCategoria('estudios')}
                        className="bg-white p-4 rounded border text-left hover:bg-indigo-50 transition-colors cursor-pointer"
                      >
                        <h4 className="font-bold">{est.titulo}</h4>
                        <p className="text-sm text-gray-600">{est.institucion}</p>
                        <p className="text-xs text-gray-500">{est.nivel_educativo}</p>
                        <p className="text-xs text-gray-500 mt-1">{est.fecha_inicio} - {est.fecha_fin || 'Actual'}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {perfilCompleto.idiomas && perfilCompleto.idiomas.length > 0 && (
                <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2"><Languages size={20} className="text-indigo-600" /> Idiomas</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {perfilCompleto.idiomas.map((idioma, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleAbrirDocumentoCategoria('idiomas')}
                        className="bg-white p-3 rounded border text-left hover:bg-indigo-50 transition-colors cursor-pointer"
                      >
                        <p className="font-semibold">{idioma.idioma}</p>
                        <p className="text-sm text-gray-600">Nivel: {idioma.nivel}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {perfilCompleto.documentos && perfilCompleto.documentos.length > 0 && (
                <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2"><FileDown size={20} className="text-indigo-600" /> Documentos</h3>
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

      {/* Modal para ver evaluación existente */}
      {modalVerEvaluacionOpen && (
        <div className={`modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto ${cerrandoModalEvaluacion ? "modal-exit" : ""}`}>
          <div className="modal-content bg-white rounded-xl shadow-2xl w-full max-w-3xl my-8">
            <div className="flex items-center justify-between p-5 border-b">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Evaluación registrada</h2>
              </div>
              <button
                onClick={cerrarModalVerEvaluacion}
                className="text-gray-500 hover:text-gray-700 p-2 rounded-lg"
                aria-label="Cerrar modal"
              >
                <X size={22} />
              </button>
            </div>
            <div className="p-5 space-y-4 max-h-[calc(100vh-220px)] overflow-y-auto">
              {loadingEvaluacion ? (
                <div className="text-center text-gray-500">Cargando evaluación...</div>
              ) : errorEvaluacion ? (
                <div className="text-center text-red-500 font-semibold">{errorEvaluacion}</div>
              ) : evaluacionExistente ? (
                <div className="space-y-6">
                  {/* Estado de la evaluación */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                    <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      Estado de la Evaluación
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className={`p-3 rounded-lg ${evaluacionExistente.aprobado ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        <div className="font-semibold">Resultado</div>
                        <div className="text-lg">{evaluacionExistente.aprobado ? 'Aprobado ✓' : 'No aprobado ✗'}</div>
                      </div>
                      <div className="bg-white p-3 rounded-lg border">
                        <div className="font-semibold text-gray-700">Prueba psicotécnica</div>
                        <div className="text-gray-600">{evaluacionExistente.prueba_psicotecnica || 'No especificada'}</div>
                      </div>
                    </div>
                  </div>

                  {/* Validaciones */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Validaciones
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${evaluacionExistente.validacion_archivos ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span>Validación de archivos</span>
                        <span className="text-sm text-gray-600">({evaluacionExistente.validacion_archivos ? 'Aprobado' : 'Pendiente'})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${evaluacionExistente.clase_organizada ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span>Clase organizada</span>
                        <span className="text-sm text-gray-600">({evaluacionExistente.clase_organizada ? 'Sí' : 'No'})</span>
                      </div>
                    </div>
                  </div>

                  {/* Formulario organizado por secciones */}
                  {evaluacionExistente.formulario && Array.isArray(evaluacionExistente.formulario) && evaluacionExistente.formulario.length > 0 && (
                    <div className="bg-white border rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Información del Candidato
                      </h3>
                      {(() => {
                        // Agrupar formulario por secciones
                        const secciones: Record<string, Array<{seccion: string, campo: string, valor: string}>> = 
                          evaluacionExistente.formulario.reduce((acc, item) => {
                            if (!acc[item.seccion]) acc[item.seccion] = [];
                            acc[item.seccion].push(item);
                            return acc;
                          }, {} as Record<string, Array<{seccion: string, campo: string, valor: string}>>);

                        return Object.entries(secciones).map(([seccion, items]) => (
                          <div key={seccion} className="mb-4 last:mb-0">
                            <h4 className="font-medium text-gray-700 mb-2 pb-1 border-b border-gray-200">{seccion}</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {items.map((item, idx) => (
                                <div key={idx} className="bg-gray-50 p-3 rounded">
                                  <div className="font-medium text-sm text-gray-600">{item.campo}</div>
                                  <div className="text-gray-800 mt-1">{item.valor || 'No especificado'}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ));
                      })()}
                    </div>
                  )}

                  {/* Observaciones */}
                  {evaluacionExistente.observaciones && (
                    <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-yellow-800 mb-2 flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Observaciones
                      </h3>
                      <p className="text-yellow-700">{evaluacionExistente.observaciones}</p>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
            <div className="border-t p-4 bg-gray-50 flex justify-end">
              <button
                onClick={cerrarModalVerEvaluacion}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionAvalesVicerrectoria;