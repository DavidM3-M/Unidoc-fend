// src/protected/rectoria/avales.tsx
import InputSearch from "../../componentes/formularios/InputSearch";
import { useCallback, useEffect, useMemo, useState } from "react";
import axiosInstance from "../../utils/axiosConfig";
import { toast } from "react-toastify";
import ChatIAWidget from "../../components/ia/ChatIAWidget";
import ValidarDocumentoIA from "../../components/ia/ValidarDocumentoIA";
import axios from "axios";
import Cookie from "js-cookie";
import { CheckCircle, XCircle, Eye, FileText, X, Phone, Mail, Briefcase, GraduationCap, Award, Languages, User, Users, FileDown, Loader2, Globe, Landmark, PiggyBank, Scale, ShieldCheck, ChevronDown, BookOpen, Lightbulb } from "lucide-react";
import { generarHojaVidaPDF } from "../../utils/generarHojaVida";

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
  puntaje_aspirante?: number;
  convocatorias?: Array<{
    id_convocatoria: number;
    nombre_convocatoria: string;
    [key: string]: unknown;
  }>;
}

// Extensión local para campos opcionales que pueden venir desde el backend
type UsuarioExt = Usuario & {
  convocatoria?: { nombre?: string; fecha?: string; id?: number };
  convocatoria_id?: number;
  id_convocatoria?: number;
  idConvocatoria?: number;
  created_at?: string;
  fecha?: string;
  aval_rectoria_at?: string;
};

interface Avales {
  aval_rectoria: boolean;
  aval_vicerrectoria: boolean;
  aval_talento_humano: boolean;
  aval_coordinador: boolean;
}

interface Convocatoria {
  id: number;
  nombre?: string;
  fecha?: string;
}

interface ConvocatoriaFiltro extends Convocatoria {
  count: number;
}
interface AspiranteDetallado {
  id: number;
  documentos?: Array<{
    id: number;
    nombre: string;
    url: string;
    tipo: string;
  }>;
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
  eps?: {
    nombre_eps?: string;
    tipo_afiliacion?: string;
    estado_afiliacion?: string;
    tipo_afiliado?: string;
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
  produccion_academica?: Array<{
    titulo: string;
    tipo?: string;
    fecha?: string;
    numero_autores?: number;
    medio_divulgacion?: string;
    fecha_divulgacion?: string;
    documentosProduccionAcademica?: Array<{ id_documento?: number; archivo_url?: string; url?: string; archivo?: string }>;
  }>;
  aptitudes?: Array<{ nombre: string; }>;
  postulaciones?: Array<{
    convocatoriaPostulacion?: { titulo: string; };
  }>;
  avales: {
    rectoria: { estado?: string; aprobado_por?: number; fecha?: string; };
    vicerrectoria: { estado?: string; aprobado_por?: number; fecha?: string; };
    talento_humano?: { estado?: string; aprobado_por?: number; fecha?: string; };
    coordinador?: { estado?: string; aprobado_por?: number; fecha?: string; };
  };
}

type DocumentoAdjunto = { id_documento?: number; archivo_url?: string; url?: string; archivo?: string };
type CategoriaDocs = 'experiencias' | 'estudios' | 'idiomas';
// FormField removed (not used directly) — inline types used where needed

// Interfaces para evaluaciones
interface EvaluacionRectoria {
  id: number;
  aspirante_user_id: number;
  rectoria_user_id: number;
  plantilla_id?: number;
  prueba_psicotecnica?: string;
  validacion_archivos?: boolean;
  clase_organizada?: boolean;
  aprobado?: boolean;
  formulario?: { seccion: string; campo: string; valor: string }[];
  observaciones?: string;
  created_at?: string;
  updated_at?: string;
  estado?: string;
  fecha_evaluacion?: string;
  puntuacion_total?: number;
  comentarios_generales?: string;
  recomendaciones?: string;
  detalles?: Array<{
    categoria: string;
    puntuacion: number;
    puntuacion_maxima: number;
    comentarios?: string;
  }>;
  evaluador_nombre?: string;
}

interface PlantillaEvaluacion {
  id: number;
  nombre: string;
  descripcion?: string;
  campos?: unknown;
  [key: string]: unknown;
}

interface EvaluacionConUsuario {
  evaluacion: EvaluacionRectoria;
  usuario: Usuario;
  plantilla?: PlantillaEvaluacion;
}

const GestionAvalesRectoria = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<Usuario | null>(null);
  const [avalesUsuario, setAvalesUsuario] = useState<Avales | null>(null);
  const [perfilCompleto, setPerfilCompleto] = useState<AspiranteDetallado | null>(null);
  const [visorUrl, setVisorUrl] = useState<string | null>(null);
  const [mostrarPerfilCompleto, setMostrarPerfilCompleto] = useState(false);
  const [loadingPerfil, setLoadingPerfil] = useState(false);
  const [cerrandoModalAvales, setCerrandoModalAvales] = useState(false);
  const [cerrandoPerfilCompleto, setCerrandoPerfilCompleto] = useState(false);
  const [perfilPuntaje, setPerfilPuntaje] = useState<number | null>(null);
  const [modalRechazoOpen, setModalRechazoOpen] = useState(false);
  const [rechazoUserId, setRechazoUserId] = useState<number | null>(null);
  const [motivoRechazo, setMotivoRechazo] = useState("");
  const [loadingRechazo, setLoadingRechazo] = useState(false);
  const [modalConvocatoria, setModalConvocatoria] = useState<{ id: number | null; nombre: string } | null>(null);
  const [cerrandoModalConvocatoria, setCerrandoModalConvocatoria] = useState(false);
  // Calcular convocatorias disponibles de los usuarios
  const convocatoriasDisponibles = useMemo(() => {
    const convSet = new Set<number>();
    const convMap = new Map<number, { id: number; nombre: string }>();

    usuarios.forEach((u) => {
      if (u.convocatorias) {
        u.convocatorias.forEach((conv) => {
          const id = conv.id_convocatoria;
          if (!convSet.has(id)) {
            convSet.add(id);
            convMap.set(id, { id, nombre: conv.nombre_convocatoria });
          }
        });
      }
    });

    return Array.from(convMap.values());
  }, [usuarios]);
  const [docsPorCategoria, setDocsPorCategoria] = useState<Record<CategoriaDocs, DocumentoAdjunto[]>>({
    experiencias: [],
    estudios: [],
    idiomas: [],
  });
  // Filtros (copiados de VerPostulaciones)
  const [selectedConvocatoriaId, setSelectedConvocatoriaId] = useState<number | null>(null);
  const [nameFilter, setNameFilter] = useState("");
  const [dateFrom, setDateFrom] = useState<string | null>(null);
  const [dateTo, setDateTo] = useState<string | null>(null);
  const [sortOrder] = useState<'asc' | 'desc' | null>(null);
  const [sortByPuntaje, setSortByPuntaje] = useState<'desc' | null>(null);

  // Estados para evaluaciones
  const [modalVerEvaluacionOpen, setModalVerEvaluacionOpen] = useState(false);
  const [cerrandoModalEvaluacion, setCerrandoModalEvaluacion] = useState(false);
  const [evaluacionExistente, setEvaluacionExistente] = useState<EvaluacionRectoria | null>(null);
  const [errorEvaluacion, setErrorEvaluacion] = useState<string | null>(null);
  const [loadingEvaluacion, setLoadingEvaluacion] = useState(false);
  const [openActionsId, setOpenActionsId] = useState<number | null>(null);
  const [plantillaEvaluacion, setPlantillaEvaluacion] = useState<PlantillaEvaluacion | null>(null);
  const [evaluacionesConUsuarios, setEvaluacionesConUsuarios] = useState<EvaluacionConUsuario[]>([]);
  const [loadingEvaluaciones, setLoadingEvaluaciones] = useState(false);
  const [mostrarEvaluaciones, setMostrarEvaluaciones] = useState(false);

  const isAprobado = useCallback((val: unknown): boolean => {
    if (val === true) return true;
    if (val == null) return false;
    if (typeof val === 'object') {
      const o = val as Record<string, unknown>;
      if ('estado' in o) return isAprobado(o['estado']);
      if ('aprobado' in o) return isAprobado(o['aprobado']);
      if ('aprobado_por' in o && o['aprobado_por']) return true;
      if ('fecha' in o && o['fecha']) return true;
      return false;
    }
    if (typeof val === "number") return val === 1;
    if (typeof val === "string") {
      const s = val.toLowerCase().trim();
      return ["1", "aprobado", "aprobada", "si", "true", "a", "aceptado", "aceptada"].includes(s);
    }
    return false;
  }, []);

  const fetchUsuarios = useCallback(async () => {
  try {
    setLoading(true);
    
    // Obtener usuarios con avales
    const usuariosResponse = await axiosInstance.get("/rectoria/usuarios");
    const rawUsuarios = usuariosResponse.data?.data ?? usuariosResponse.data?.usuarios ?? usuariosResponse.data ?? [];
    
    // Obtener convocatorias con postulaciones
    const convocatoriasResponse = await axiosInstance.get("/rectoria/convocatorias");
    const rawConvocatorias = convocatoriasResponse.data?.data ?? [];
    
    // Crear mapa de usuarios con avales
    const usuariosMap = new Map<number, Usuario>();
    
    if (Array.isArray(rawUsuarios)) {
      rawUsuarios.forEach((asp: Record<string, unknown>) => {
        const userId = asp.id as number;
        if (!userId) return;
        
        usuariosMap.set(userId, {
          id: userId,
          primer_nombre: (asp.primer_nombre as string) || ((asp.nombre_completo as string)?.split(' ')[0]) || '',
          segundo_nombre: (asp.segundo_nombre as string) || '',
          primer_apellido: (asp.primer_apellido as string) || ((asp.nombre_completo as string)?.split(' ')[1]) || '',
          segundo_apellido: (asp.segundo_apellido as string) || '',
          numero_identificacion: (asp.numero_identificacion as string),
          email: (asp.email as string),
          aval_rectoria: isAprobado(asp.aval_rectoria),
          aval_vicerrectoria: isAprobado(asp.aval_vicerrectoria),
          aval_talento_humano: isAprobado(asp.aval_talento_humano),
          aval_coordinador: isAprobado(asp.aval_coordinador),
          aval_rectoria_at: (asp.aval_rectoria_at as string),
          convocatorias: [],
        });
      });
    }
    
    // Asignar convocatorias desde las postulaciones
    if (Array.isArray(rawConvocatorias)) {
      rawConvocatorias.forEach((conv: Record<string, unknown>) => {
        const convId = conv.id_convocatoria as number;
        const convNombre = conv.nombre_convocatoria as string;
        
        if (Array.isArray(conv.postulaciones_convocatoria)) {
          (conv.postulaciones_convocatoria as Record<string, unknown>[]).forEach((post: Record<string, unknown>) => {
            const user = post.usuario_postulacion as Record<string, unknown> | undefined;
            if (user && (user.id as number)) {
              const existingUser = usuariosMap.get(user.id as number);
              if (existingUser) {
                // Agregar convocatoria si no existe
                if (!existingUser.convocatorias!.some(c => c.id_convocatoria === convId)) {
                  existingUser.convocatorias!.push({
                    id_convocatoria: convId,
                    nombre_convocatoria: convNombre,
                  });
                }
              } else {
                // Si el usuario no está en el mapa, agregarlo
                usuariosMap.set(user.id as number, {
                  id: user.id as number,
                  primer_nombre: (user.primer_nombre as string) || '',
                  segundo_nombre: (user.segundo_nombre as string) || '',
                  primer_apellido: (user.primer_apellido as string) || '',
                  segundo_apellido: (user.segundo_apellido as string) || '',
                  numero_identificacion: (user.numero_identificacion as string) || '',
                  email: (user.email as string) || '',
                  aval_rectoria: isAprobado(user['aval_rectoria']),
                  aval_vicerrectoria: isAprobado(user['aval_vicerrectoria']),
                  aval_talento_humano: isAprobado(user['aval_talento_humano']),
                  aval_coordinador: isAprobado(user['aval_coordinador']),
                  aval_rectoria_at: undefined,
                  convocatorias: [{
                    id_convocatoria: convId,
                    nombre_convocatoria: convNombre,
                  }],
                });
              }
            }
          });
        }
      });
    }
    
    const usuarios = Array.from(usuariosMap.values());
    setUsuarios(usuarios);
  } catch (error) {
    console.error("Error al obtener datos:", error);
    toast.error("Error al cargar los postulantes");
  } finally {
    setLoading(false);
  }
}, [isAprobado]);

  const getEstadoAvalPerfil = useCallback((perfil: AspiranteDetallado | null, tipo: "rectoria" | "vicerrectoria" | "talento_humano" | "coordinador") => {
    if (!perfil) return false;
    if (tipo === "talento_humano") {
      const a = perfil.avales as Record<string, unknown>;
      const top = (perfil as unknown as Record<string, unknown>)['aval_talento_humano'];
      return isAprobado((a && (a['talentoHumano'] ?? a['talento_humano']) ? (a['talentoHumano'] ?? a['talento_humano']) : top));
    }
    if (tipo === "coordinador") {
      const a2 = perfil.avales as Record<string, unknown>;
      const top2 = (perfil as unknown as Record<string, unknown>)['aval_coordinador'];
      return isAprobado(a2?.['coordinador'] ? (a2['coordinador'] as Record<string, unknown>)['estado'] : top2);
    }
    if (tipo === "rectoria") {
      const a3 = perfil.avales as Record<string, unknown>;
      const rectVal = a3?.['rectoria'];
      if (typeof rectVal === 'object' && rectVal != null) {
        return isAprobado((rectVal as Record<string, unknown>)['estado'] ?? rectVal);
      }
      return isAprobado(rectVal ?? (perfil as unknown as Record<string, unknown>)['aval_rectoria']);
    }
    // vicerrectoria
    const a4 = perfil.avales as Record<string, unknown>;
    const vicVal = a4?.['vicerrectoria'];
    if (typeof vicVal === 'object' && vicVal != null) {
      return isAprobado((vicVal as Record<string, unknown>)['estado'] ?? vicVal);
    }
    return isAprobado(vicVal ?? (perfil as unknown as Record<string, unknown>)['aval_vicerrectoria']);
  }, [isAprobado]);

const fetchConvocatorias = useCallback(async () => {
  try {
    const response = await axiosInstance.get<{ data: Convocatoria[] }>("/rectoria/obtener-convocatorias");
    const data = response.data?.data ?? [];
    const convs: Convocatoria[] = Array.isArray(data)
      ? data.map((c) => ({
          id: Number(c.id ?? 0),
          nombre: c.nombre ?? `Convocatoria ${c.id}`,
          fecha: c.fecha,
        }))
      : [];
    void convs;
    // convocatoriasDisponibles se calcula automáticamente de los usuarios
  } catch (error) {
    console.warn("No se pudieron cargar convocatorias de Rectoría", error);
    // convocatoriasDisponibles se calcula automáticamente de los usuarios
  }
}, []);

  useEffect(() => {
    fetchUsuarios();
    fetchConvocatorias();
  }, [fetchUsuarios, fetchConvocatorias]);

  const handleDarAval = async (userId: number) => {
  try {
    const payload: Record<string, unknown> = { estado: 'Aprobado' };
    if (modalConvocatoria?.id) payload.convocatoria_id = modalConvocatoria.id;
    await axiosInstance.post(`/rectoria/aval-hoja-vida/${userId}`, payload);
    
    setUsuarios((prev) =>
      prev.map((user) =>
        user.id === userId ? { ...user, aval_rectoria: true } : user
      )
    );

    toast.success("Aval de Rectoría otorgado exitosamente");
    
    if (usuarioSeleccionado?.id === userId) {
      verAvales(userId);
    }
    
    if (mostrarPerfilCompleto && perfilCompleto?.id === userId) {
      verPerfilCompleto(userId);
    }
  } catch (error) {
    console.error("Error al dar aval:", error);
    if (axios.isAxiosError(error)) {
      toast.error(error.response?.data?.mensaje || error.response?.data?.message || "Error al otorgar el aval");
    }
  }
};

  const handleRechazarAval = (userId: number) => {
    setRechazoUserId(userId);
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
      if (modalConvocatoria?.id) payload.convocatoria_id = modalConvocatoria.id;
      await axiosInstance.post(`/rectoria/rechazar-aval/${rechazoUserId}`, payload);
      setUsuarios((prev) =>
        prev.map((user) =>
          user.id === rechazoUserId ? { ...user, aval_rectoria: false } : user
        )
      );
      toast.success("Aval de Rectoría rechazado y notificación enviada");
      setModalRechazoOpen(false);
      setMotivoRechazo("");
      if (usuarioSeleccionado?.id === rechazoUserId) {
        verAvales(rechazoUserId);
      }
      if (mostrarPerfilCompleto && perfilCompleto?.id === rechazoUserId) {
        verPerfilCompleto(rechazoUserId);
      }
    } catch (error) {
      console.error("Error al rechazar aval:", error);
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.mensaje || error.response?.data?.message || "Error al rechazar el aval");
      } else {
        toast.error("Error al rechazar el aval");
      }
    } finally {
      setLoadingRechazo(false);
    }
  };

  const verAvales = async (userId: number) => {
    try {
      const convParam = modalConvocatoria?.id ? `?convocatoria_id=${modalConvocatoria.id}` : '';
      const response = await axiosInstance.get(`/rectoria/usuarios/${userId}/avales${convParam}`);
      const data = response.data?.data ?? response.data;
      console.debug("verAvales response:", data);
      let normalized: Avales | null = null;
      if (data && typeof data === 'object') {
        const obj = data as Record<string, unknown>;
        if ('aval_rectoria' in obj || 'aval_vicerrectoria' in obj) {
          normalized = {
            aval_rectoria: isAprobado(obj['aval_rectoria']),
            aval_vicerrectoria: isAprobado(obj['aval_vicerrectoria']),
            aval_talento_humano: isAprobado(obj['aval_talento_humano'] ?? obj['avalTalentoHumano'] ?? obj['aval_talentoHumano']),
            aval_coordinador: isAprobado(obj['aval_coordinador'] ?? obj['aval_coordinacion'] ?? obj['avalCoordinador']),
          };
        } else if ('rectoria' in obj || 'vicerrectoria' in obj) {
          const rect = obj['rectoria'] as Record<string, unknown> | undefined;
          const vic = obj['vicerrectoria'] as Record<string, unknown> | undefined;
          const talento = (obj['talento_humano'] ?? obj['talentoHumano'] ?? obj['talentoHumano']) as Record<string, unknown> | undefined;
          const coord = (obj['coordinador'] ?? obj['coordinacion'] ?? obj['coordinator']) as Record<string, unknown> | undefined;
          normalized = {
            aval_rectoria: isAprobado(rect?.estado ?? obj['rectoria'] ?? obj['aval_rectoria']),
            aval_vicerrectoria: isAprobado(vic?.estado ?? obj['vicerrectoria'] ?? obj['aval_vicerrectoria']),
            aval_talento_humano: isAprobado(talento?.estado ?? obj['talento_humano'] ?? obj['talentoHumano'] ?? obj['aval_talento_humano']),
            aval_coordinador: isAprobado(coord?.estado ?? obj['coordinador'] ?? obj['coordinacion'] ?? obj['aval_coordinador']),
          };
        }
      }

      setAvalesUsuario(normalized);
    } catch (error) {
      console.error("Error al obtener avales:", error);
      toast.error("Error al cargar los avales");
    }
  };


  // Funciones para evaluaciones
  const handleVerEvaluacion = async (aspiranteId: number) => {
    setLoadingEvaluacion(true);
    setEvaluacionExistente(null);
    setPlantillaEvaluacion(null);
    setErrorEvaluacion(null);
    setModalVerEvaluacionOpen(true);

    try {
      // Buscar evaluación por ID de aspirante
      const res = await axiosInstance.get(`/rectoria/evaluaciones/${aspiranteId}`);

      // Verificar diferentes estructuras de respuesta posibles
      let evaluacion: unknown = null;
      let plantilla: PlantillaEvaluacion | null = null;

      if (res.data && res.data.data && res.data.data.evaluacion) {
        // Estructura correcta: { data: { evaluacion: {...}, plantilla: {...} } }
        evaluacion = res.data.data.evaluacion;
      } else if (res.data && res.data.evaluacion) {
        // Estructura alternativa: { evaluacion: {...}, plantilla: {...} }
        evaluacion = res.data.evaluacion;
        plantilla = res.data.plantilla ?? null;
      } else if (res.data && res.data.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
        // Estructura con array: { data: [{ evaluacion: {...}, ... }] }
        evaluacion = res.data.data[0].evaluacion;
        plantilla = res.data.data[0].plantilla ?? null;
      } else if (res.data && res.data.data && res.data.data.coordinador) {
        // Posible estructura: { data: { coordinador: { ... } } }
        evaluacion = res.data.data.coordinador;
        plantilla = res.data.data.plantilla ?? null;
      } else if (res.data && res.data.coordinador) {
        // Posible estructura: { coordinador: { ... } }
        evaluacion = res.data.coordinador;
        plantilla = res.data.plantilla ?? null;
      } else if (res.data && typeof res.data === 'object') {
        // Buscar recursivamente una posible evaluación con campos esperados
        const findEval = (obj: unknown): Record<string, unknown> | null => {
          if (!obj || typeof obj !== 'object') return null;
          const o = obj as Record<string, unknown>;
          if ('prueba_psicotecnica' in o || 'aprobado' in o || 'validacion_archivos' in o) return o;
          for (const k of Object.keys(o)) {
            const val = o[k];
            if (typeof val === 'object') {
              const found = findEval(val);
              if (found) return found;
            }
          }
          return null;
        };
        evaluacion = findEval(res.data);
      }

      if (evaluacion) {
        setEvaluacionExistente(evaluacion as EvaluacionRectoria);
        setPlantillaEvaluacion(plantilla);
      } else {
        setPlantillaEvaluacion(null);
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

  const fetchEvaluacionesConUsuarios = async () => {
    try {
      setLoadingEvaluaciones(true);
      const response = await axiosInstance.get('/rectoria/evaluaciones-con-usuarios');
      const data = response.data?.data ?? response.data;
      const evaluaciones = Array.isArray(data) ? data : [];
      setEvaluacionesConUsuarios(evaluaciones);
      setMostrarEvaluaciones(true);
    } catch (error: unknown) {
      console.error("Error al obtener evaluaciones:", error);
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Error al cargar las evaluaciones");
      } else {
        toast.error("Error al cargar las evaluaciones");
      }
    } finally {
      setLoadingEvaluaciones(false);
    }
  };

  // `userRole` removed because it's not used; we still log decoded role for debugging

useEffect(() => {
  const fetchUserRole = () => {
    try {
      const token = localStorage.getItem("token") || Cookie.get("token");
      
      if (!token) {
        console.error("No hay token");
        return;
      }

      const payload = JSON.parse(atob(token.split(".")[1]));
      void (payload.rol || payload.role || payload.user_role);
    } catch (error) {
      console.error("Error al decodificar token:", error);
    }
  };

  fetchUserRole();
}, []);



  // Función para ver hoja de vida (Brayan Cuellar)
const handleVerHojaVida = async (idUsuario: number) => {
  try {
    // se usa la ruta que cree de rectoria
    const url = `/admin/aspirantes/${idUsuario}/hoja-vida-pdf`;

    const response = await axiosInstance.get(url, { 
      responseType: "blob"
    });

    const fileURL = URL.createObjectURL(response.data);
    window.open(fileURL, "_blank");
    toast.success("Hoja de vida abierta correctamente");

  } catch (error) {
    console.error("Error al ver la hoja de vida:", error);
    if (axios.isAxiosError(error)) {
      console.error("Status:", error.response?.status);
      toast.error("Error al cargar la hoja de vida");
    }
  }
};

// Función para ver perfil completo(Brayan Cuellar)

const verPerfilCompleto = async (userId: number) => {
  try {
    setLoadingPerfil(true);
    // Fetch puntaje en paralelo
    axiosInstance.get(`/aspirante/${userId}/puntaje`)
      .then((r) => setPerfilPuntaje(r.data?.data?.total ?? r.data?.total ?? null))
      .catch(() => setPerfilPuntaje(null));
    const response = await axiosInstance.get(`/admin/aspirantes/${userId}`);
    setPerfilCompleto(response.data.aspirante);
    // obtener avales oficiales para este usuario y sincronizar el modal
    try {
      await verAvales(userId);
    } catch (e) {
      console.debug("verPerfilCompleto: verAvales fallo", e);
    }
    setMostrarPerfilCompleto(true);
    setCerrandoPerfilCompleto(false);
    fetchDocsCategoria(userId, 'experiencias');
    fetchDocsCategoria(userId, 'estudios');
    fetchDocsCategoria(userId, 'idiomas');
  } catch (error) {
    console.error("Error al obtener perfil completo:", error);
    toast.error("Error al cargar el perfil del aspirante");
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
    setDocsPorCategoria({ experiencias: [], estudios: [], idiomas: [] });
    setCerrandoPerfilCompleto(false);
  }, 200);
};

const cerrarModalAvales = () => {
  setCerrandoModalAvales(true);
  setTimeout(() => {
    setUsuarioSeleccionado(null);
    setAvalesUsuario(null);
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
    const resp = await axiosInstance.get(`/rectoria/documentos/${userId}/${categoria}`, { baseURL });
    const docs = (resp.data?.data ?? resp.data?.documentos ?? resp.data) as DocumentoAdjunto[];
    setDocsPorCategoria((prev) => ({ ...prev, [categoria]: Array.isArray(docs) ? docs : [] }));
  } catch (error) {
    console.warn('No se pudieron cargar documentos por categoría', error);
    setDocsPorCategoria((prev) => ({ ...prev, [categoria]: [] }));
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

  setVisorUrl(url);
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
    const endpoint = `${baseUrl}/rectoria/ver-documento/${doc.id_documento}`;
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


  const estadisticas = useMemo(() => {
    const conAval = usuarios.filter(u => u.aval_rectoria).length;
    const sinAval = usuarios.filter(u => !u.aval_rectoria).length;
    return { conAval, sinAval, total: usuarios.length };
  }, [usuarios]);

  const convocatorias = useMemo(() => {
    const map = new Map<number, { id: number; nombre: string; count: number }>();
    usuarios.forEach((u) => {
      if (u.convocatorias) {
        u.convocatorias.forEach((conv) => {
          const id = conv.id_convocatoria;
          const nombre = conv.nombre_convocatoria;
          if (map.has(id)) {
            map.get(id)!.count += 1;
          } else {
            map.set(id, { id, nombre, count: 1 });
          }
        });
      }
    });
    return Array.from(map.values());
  }, [usuarios]);

  const convocatoriasParaFiltro = useMemo<ConvocatoriaFiltro[]>(() => {
    const counts = new Map<number, number>();
    convocatorias.forEach((c) => counts.set(c.id, c.count));

    const base: Convocatoria[] = convocatoriasDisponibles.length > 0
      ? convocatoriasDisponibles
      : convocatorias.map((c) => ({ id: c.id, nombre: c.nombre, fecha: undefined }));

    const idsBase = new Set(base.map((c) => c.id));
    const merged: ConvocatoriaFiltro[] = base.map((c) => ({
      id: c.id,
      nombre: c.nombre,
      fecha: c.fecha,
      count: counts.get(c.id) ?? 0,
    }));

    convocatorias.forEach((c) => {
      if (!idsBase.has(c.id)) {
        merged.push({ id: c.id, nombre: c.nombre, count: c.count });
      }
    });

    return merged;
  }, [convocatorias, convocatoriasDisponibles]);

  const datosFiltrados = useMemo(() => {
    let data = usuarios.slice();
    if (selectedConvocatoriaId) {
      data = data.filter((u) => {
        if (!u.convocatorias || u.convocatorias.length === 0) {
          return false;
        }
        return u.convocatorias.some((conv) => conv.id_convocatoria === selectedConvocatoriaId);
      });
    }
    if (nameFilter) {
      const q = nameFilter.toLowerCase();
      data = data.filter((u) => {
        const nombre = `${u.primer_nombre} ${u.segundo_nombre || ''} ${u.primer_apellido} ${u.segundo_apellido || ''}`.toLowerCase();
        return nombre.includes(q) || String(u.numero_identificacion ?? '').includes(q) || String(u.email ?? '').toLowerCase().includes(q);
      });
    }
    const parseUserDate = (u: UsuarioExt) => {
      const s = u.aval_rectoria_at ?? u.fecha ?? u.created_at ?? null;
      return s ? new Date(String(s)) : null;
    };
    if (dateFrom) {
      const from = new Date(dateFrom);
      data = data.filter((u) => {
        const d = parseUserDate(u as UsuarioExt);
        return d ? d >= from : false;
      });
    }
    if (dateTo) {
      const to = new Date(dateTo);
      data = data.filter((u) => {
        const d = parseUserDate(u as UsuarioExt);
        return d ? d <= to : false;
      });
    }
    if (sortOrder) {
      data = data.slice().sort((a, b) => {
        const da = parseUserDate(a as UsuarioExt)?.getTime() ?? 0;
        const db = parseUserDate(b as UsuarioExt)?.getTime() ?? 0;
        return sortOrder === 'asc' ? da - db : db - da;
      });
    }
    if (sortByPuntaje === 'desc') {
      data = data.slice().sort((a, b) => (b.puntaje_aspirante ?? 0) - (a.puntaje_aspirante ?? 0));
    }
    return data;
  }, [usuarios, selectedConvocatoriaId, nameFilter, dateFrom, dateTo, sortOrder, sortByPuntaje]);

  const convocatoriasAgrupadas = useMemo(() => {
    const map = new Map<string, { id: number | null; nombre: string; usuarios: Usuario[] }>();
    datosFiltrados.forEach((u) => {
      if (u.convocatorias && u.convocatorias.length > 0) {
        // Usuario tiene convocatorias específicas
        u.convocatorias.forEach((conv) => {
          const key = `id-${conv.id_convocatoria}`;
          if (!map.has(key)) {
            map.set(key, {
              id: conv.id_convocatoria,
              nombre: conv.nombre_convocatoria,
              usuarios: [u]
            });
          } else {
            map.get(key)!.usuarios.push(u);
          }
        });
      } else {
        // Usuario sin convocatorias
        const key = "sin-convocatoria";
        if (!map.has(key)) {
          map.set(key, { id: null, nombre: "Sin convocatoria", usuarios: [u] });
        } else {
          map.get(key)!.usuarios.push(u);
        }
      }
    });
    const result = Array.from(map.values());
    return result;
  }, [datosFiltrados]);

  const usuariosModal = useMemo(() => {
    if (!modalConvocatoria) return [] as Usuario[];
    return datosFiltrados.filter((u) => {
      if (!u.convocatorias || u.convocatorias.length === 0) {
        return modalConvocatoria.id === null;
      }
      return u.convocatorias.some((conv) => conv.id_convocatoria === modalConvocatoria.id);
    });
  }, [datosFiltrados, modalConvocatoria]);

  const cerrarModalConvocatoria = () => {
    setCerrandoModalConvocatoria(true);
    setTimeout(() => {
      setModalConvocatoria(null);
      setCerrandoModalConvocatoria(false);
    }, 200);
  };

  return (
    <>
    <div className="min-h-screen bg-gradient-to-br from-[#f3ede1]/30 via-white to-[#f3ede1]/10 p-4 md:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">

      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg border border-[rgba(30,58,95,0.09)] p-6 md:p-8">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="p-3 bg-gradient-to-br from-[#1e3a5f] to-[#152a45] rounded-xl shadow-lg">
              <CheckCircle className="h-7 w-7 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 h-3 w-3 bg-[#c89b14] rounded-full border-2 border-white animate-pulse" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#1e3a5f] to-[#152a45] bg-clip-text text-transparent">
              Gestión de Avales — Rectoría
            </h1>
            <p className="text-[#6b7a8d] mt-1">Revisa y otorga avales a las hojas de vida de los postulantes</p>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-[#1e3a5f] to-[#152a45] p-4 rounded-2xl text-white shadow-md">
          <p className="text-xs font-semibold uppercase tracking-wide opacity-80">Total Postulantes</p>
          <p className="text-3xl font-bold mt-1">{estadisticas.total}</p>
        </div>
        <div className="bg-gradient-to-br from-[#c89b14] to-[#a67c0a] p-4 rounded-2xl text-white shadow-md">
          <p className="text-xs font-semibold uppercase tracking-wide opacity-80">Con Aval</p>
          <p className="text-3xl font-bold mt-1">{estadisticas.conAval}</p>
        </div>
        <div className="bg-gradient-to-br from-[#e8740e] to-[#c65a00] p-4 rounded-2xl text-white shadow-md">
          <p className="text-xs font-semibold uppercase tracking-wide opacity-80">Sin Aval</p>
          <p className="text-3xl font-bold mt-1">{estadisticas.sinAval}</p>
        </div>
      </div>

      {/* Sección de Evaluaciones o Convocatorias */}
      {mostrarEvaluaciones ? (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Award size={20} className="text-[#1e3a5f]" />
              Evaluaciones de Rectoría
            </h2>
            <button
              onClick={() => fetchEvaluacionesConUsuarios()}
              disabled={loadingEvaluaciones}
              className="px-3 py-2 bg-[#1e3a5f] text-white rounded-xl hover:bg-[#152a45] disabled:opacity-60 flex items-center gap-2 text-sm font-medium transition"
            >
              {loadingEvaluaciones ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
              {loadingEvaluaciones ? 'Cargando...' : 'Actualizar'}
            </button>
          </div>

          {loadingEvaluaciones ? (
            <div className="py-10 text-center text-[#6b7a8d] flex items-center justify-center gap-2">
              <Loader2 size={20} className="animate-spin" />
              Cargando evaluaciones...
            </div>
          ) : evaluacionesConUsuarios.length === 0 ? (
            <div className="py-10 text-center text-[#6b7a8d]">No hay evaluaciones disponibles.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {evaluacionesConUsuarios.map((item) => (
                <div key={item.evaluacion.id} className="border border-[rgba(30,58,95,0.09)] rounded-2xl p-4 shadow-sm bg-white hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-[#2c3e50] text-sm">
                        {item.usuario.primer_nombre} {item.usuario.primer_apellido}
                      </h3>
                      <p className="text-xs text-[#6b7a8d]">{item.usuario.numero_identificacion}</p>
                    </div>
                    <button
                      onClick={() => handleVerEvaluacion(item.usuario.id)}
                      className="text-[#1e3a5f] hover:text-[#152a45] p-1"
                      title="Ver evaluación completa"
                    >
                      <Eye size={16} />
                    </button>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-[#6b7a8d]">Puntuación Total:</span>
                      <span className="font-semibold text-[#1e3a5f]">{item.evaluacion.puntuacion_total || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6b7a8d]">Estado:</span>
                      <span className={`font-medium ${item.evaluacion.estado === 'aprobado' ? 'text-[#c89b14]' : item.evaluacion.estado === 'rechazado' ? 'text-[#e8740e]' : 'text-[#6b7a8d]'}`}>
                        {item.evaluacion.estado || 'Pendiente'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6b7a8d]">Fecha:</span>
                      <span className="text-[#2c3e50]">{item.evaluacion.fecha_evaluacion ? new Date(item.evaluacion.fecha_evaluacion).toLocaleDateString() : 'N/A'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
      {/* Filtros */}
      <div className="bg-white rounded-2xl shadow-md border border-[rgba(30,58,95,0.09)] p-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div>
            <label className="text-xs font-semibold text-[#2c3e50] uppercase tracking-wide mb-1.5 block">Convocatoria</label>
            <select
              value={selectedConvocatoriaId ?? ""}
              onChange={(e) => setSelectedConvocatoriaId(e.target.value ? Number(e.target.value) : null)}
              className="w-full p-2.5 border border-[rgba(30,58,95,0.09)] rounded-xl bg-white text-sm focus:ring-2 focus:ring-[#1e3a5f]/30 focus:border-[#1e3a5f] outline-none transition"
            >
              <option value="">Todas las convocatorias</option>
              {convocatoriasParaFiltro.map((c) => (
                <option key={c.id} value={c.id}>{c.nombre} ({c.count})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#2c3e50] uppercase tracking-wide mb-1.5 block">Buscar por nombre</label>
            <InputSearch
              type="text"
              placeholder="Nombre del usuario..."
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-xs font-semibold text-[#2c3e50] uppercase tracking-wide mb-1.5 block">Desde</label>
              <input
                type="date"
                value={dateFrom ?? ""}
                onChange={(e) => setDateFrom(e.target.value || null)}
                className="w-full p-2.5 border border-[rgba(30,58,95,0.09)] rounded-xl text-sm focus:ring-2 focus:ring-[#1e3a5f]/30 focus:border-[#1e3a5f] outline-none transition"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs font-semibold text-[#2c3e50] uppercase tracking-wide mb-1.5 block">Hasta</label>
              <input
                type="date"
                value={dateTo ?? ""}
                onChange={(e) => setDateTo(e.target.value || null)}
                className="w-full p-2.5 border border-[rgba(30,58,95,0.09)] rounded-xl text-sm focus:ring-2 focus:ring-[#1e3a5f]/30 focus:border-[#1e3a5f] outline-none transition"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Sort by puntaje */}
      <div className="flex justify-end">
        <button
          onClick={() => setSortByPuntaje(sortByPuntaje === 'desc' ? null : 'desc')}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
            sortByPuntaje === 'desc'
              ? 'bg-[#c89b14]/20 text-[#c89b14] border-[#c89b14]/30'
              : 'bg-white text-[#2c3e50] border-[rgba(30,58,95,0.09)] hover:bg-[#f3ede1]'
          }`}
        >
          {sortByPuntaje === 'desc' ? '★ Puntaje ↓' : '★ Por Puntaje'}
        </button>
      </div>

      {/* Convocatorias en tarjetas */}
      {loading ? (
        <div className="py-16 text-center text-[#6b7a8d] flex flex-col items-center gap-2">
          <Loader2 size={28} className="animate-spin text-[#1e3a5f]" />
          <span>Cargando postulantes...</span>
        </div>
      ) : convocatoriasAgrupadas.length === 0 ? (
        <div className="py-16 text-center text-[#6b7a8d] bg-white rounded-2xl border border-[rgba(30,58,95,0.09)] shadow-sm">
          No hay usuarios con los filtros actuales.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {convocatoriasAgrupadas.map((conv) => {
            return (
              <div key={conv.id ?? "sin-convocatoria"} className="group bg-white rounded-2xl border border-[rgba(30,58,95,0.09)] shadow-md hover:shadow-xl hover:shadow-[#1e3a5f]/10 hover:border-[#c89b14] transition-all duration-300 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-[#2c3e50]">{conv.nombre}</h3>
                    <p className="text-sm text-[#6b7a8d] mt-0.5">
                      <span className="inline-flex items-center gap-1">
                        <Users size={13} className="text-[#1e3a5f]" />
                        {conv.usuarios.length} postulante(s)
                      </span>
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setCerrandoModalConvocatoria(false);
                      setModalConvocatoria({ id: conv.id, nombre: conv.nombre });
                    }}
                    className="shrink-0 text-sm px-4 py-2 rounded-xl bg-[#1e3a5f] text-white hover:bg-[#152a45] font-medium transition shadow-sm"
                  >
                    Ver postulantes
                  </button>
                </div>
                <div className="mt-4 pt-3 border-t border-[rgba(30,58,95,0.09)] text-sm text-[#6b7a8d]">
                  Haz clic en "Ver postulantes" para visualizar el listado completo.
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de aspirantes por convocatoria */}
      {modalConvocatoria && (
        <div className={`modal-overlay fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto ${cerrandoModalConvocatoria ? "modal-exit" : ""}`}>
          <div className={`modal-content bg-white rounded-xl shadow-2xl w-full max-w-7xl my-2 ${cerrandoModalConvocatoria ? "modal-exit" : ""}`}>
            <div className="flex items-center justify-between p-5 border-b border-[rgba(30,58,95,0.09)]">
              <div>
                <h2 className="text-xl font-bold text-[#2c3e50]">Postulantes - {modalConvocatoria.nombre}</h2>
                <p className="text-sm text-[#6b7a8d]">{usuariosModal.length} postulante(s)</p>
              </div>
              <button
                onClick={cerrarModalConvocatoria}
                className="text-[#6b7a8d] hover:text-[#2c3e50] p-2 rounded-lg"
                aria-label="Cerrar modal"
              >
                <X size={22} />
              </button>
            </div>

            <div className="p-5 max-h-[calc(100vh-100px)] overflow-y-auto">
              {usuariosModal.length === 0 ? (
                <div className="text-center text-[#6b7a8d] py-10">No hay postulantes para esta convocatoria.</div>
              ) : (
                <div className="space-y-4">
                  {usuariosModal.map((u) => (
                    <div key={u.id} className="border border-[rgba(30,58,95,0.09)] rounded-xl p-4 bg-white shadow-sm">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#1e3a5f]/10 flex items-center justify-center text-[#1e3a5f]">
                            <User size={18} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-[#2c3e50]">
                              {u.primer_nombre} {u.primer_apellido}
                            </h3>
                            <div className="text-sm text-[#6b7a8d]">
                              {u.numero_identificacion} • {u.email}
                            </div>
                            {u.puntaje_aspirante != null && (
                              <span className="inline-block mt-1 text-xs font-bold px-2 py-0.5 rounded-full bg-[#c89b14]/20 text-[#c89b14]" title="Puntaje de aptitud">
                                ★ {u.puntaje_aspirante} pts
                              </span>
                            )}
                            <div className="mt-1">
                              <span
                                className={`text-xs px-2 py-1 rounded-full ${
                                  u.aval_rectoria ? "bg-[#c89b14]/20 text-[#c89b14]" : "bg-[#e8740e]/20 text-[#e8740e]"
                                }`}
                              >
                                {u.aval_rectoria ? "Aval otorgado" : "Pendiente"}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="relative">
                          <button
                            onClick={() => setOpenActionsId(openActionsId === u.id ? null : u.id)}
                            className="inline-flex items-center gap-1 bg-[#1e3a5f] text-white px-3 py-2 rounded-md hover:bg-[#152a45] text-sm font-medium"
                          >
                            Acciones
                            <ChevronDown size={14} className={`transition-transform duration-150 ${openActionsId === u.id ? 'rotate-180' : ''}`} />
                          </button>
                          {openActionsId === u.id && (
                            <div className="absolute right-0 top-full mt-1 z-20 bg-white border border-[rgba(30,58,95,0.09)] rounded-lg shadow-lg w-52 py-1">
                              <button
                                onClick={() => { setPerfilPuntaje(null); verPerfilCompleto(u.id); setOpenActionsId(null); }}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[#2c3e50] hover:bg-[#f3ede1]"
                              >
                                <User size={14} className="text-[#1e3a5f]" />
                                Ver perfil
                              </button>
                              <button
                                onClick={() => { handleVerHojaVida(u.id); setOpenActionsId(null); }}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[#2c3e50] hover:bg-[#f3ede1]"
                              >
                                <FileText size={14} className="text-[#1e3a5f]" />
                                Hoja de Vida
                              </button>
                              <button
                                onClick={() => { handleVerEvaluacion(u.id); setOpenActionsId(null); }}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[#2c3e50] hover:bg-[#f3ede1]"
                              >
                                <Eye size={14} className="text-[#1e3a5f]" />
                                Ver Evaluación
                              </button>
                              <div className="border-t border-[rgba(30,58,95,0.09)] my-1" />
                              {!u.aval_rectoria && (
                                <button
                                  onClick={() => { handleDarAval(u.id); setOpenActionsId(null); }}
                                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[#c89b14] hover:bg-[#c89b14]/10"
                                >
                                  <CheckCircle size={14} />
                                  Dar Aval
                                </button>
                              )}
                              <button
                                onClick={() => { handleRechazarAval(u.id); setOpenActionsId(null); }}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[#e8740e] hover:bg-[#e8740e]/10"
                              >
                                <XCircle size={14} />
                                Rechazar
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Avales */}
      {usuarioSeleccionado && avalesUsuario && (
        <div className={`modal-overlay fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 ${cerrandoModalAvales ? "modal-exit" : ""}`}>
          <div className={`modal-content bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto ${cerrandoModalAvales ? "modal-exit" : ""}`}>
            <div className="bg-gradient-to-r from-[#1e3a5f] to-[#152a45] text-white p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-bold mb-2">
                Estado de Avales
              </h2>
              <p className="text-[#ede6d8] text-sm sm:text-base">
                {usuarioSeleccionado.primer_nombre} {usuarioSeleccionado.primer_apellido}
              </p>
              <p className="text-[#ede6d8] text-xs sm:text-sm">
                ID: {usuarioSeleccionado.numero_identificacion}
              </p>
            </div>

            <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
              <div className={`border-2 rounded-lg p-3 sm:p-4 ${
                (getEstadoAvalPerfil(perfilCompleto, 'rectoria') || avalesUsuario?.aval_rectoria) ? 'border-[#c89b14] bg-[#c89b14]/10' : 'border-[#e8740e] bg-[#e8740e]/10'
              }`}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {(getEstadoAvalPerfil(perfilCompleto, 'rectoria') || avalesUsuario?.aval_rectoria) ? (
                      <CheckCircle className="text-[#c89b14] flex-shrink-0" size={24} />
                    ) : (
                      <XCircle className="text-[#e8740e] flex-shrink-0" size={24} />
                    )}
                    <div>
                      <h3 className="font-bold text-base sm:text-lg text-[#2c3e50]">Aval de Rectoría</h3>
                      <p className="text-xs sm:text-sm text-[#6b7a8d] mt-1">
                        {(getEstadoAvalPerfil(perfilCompleto, 'rectoria') || avalesUsuario?.aval_rectoria) ? 'Aval otorgado' : 'Aval pendiente'}
                      </p>
                    </div>
                  </div>
                  {!avalesUsuario.aval_rectoria && (
                    <button
                      onClick={() => handleDarAval(usuarioSeleccionado.id)}
                      className="w-full sm:w-auto bg-[#c89b14] text-white px-4 py-2 rounded-lg hover:bg-[#a67c0a] transition-colors text-sm"
                    >
                      Dar Aval
                    </button>
                  )}
                  <button
                    onClick={() => handleRechazarAval(usuarioSeleccionado.id)}
                    className="w-full sm:w-auto bg-[#e8740e] text-white px-4 py-2 rounded-lg hover:bg-[#c65a00] transition-colors text-sm flex items-center gap-1"
                  >
                    <XCircle size={16} />
                    Rechazar
                  </button>
                </div>
              </div>

              <div className={`border-2 rounded-lg p-3 sm:p-4 ${
                (getEstadoAvalPerfil(perfilCompleto, 'vicerrectoria') || avalesUsuario?.aval_vicerrectoria) ? 'border-[#c89b14] bg-[#c89b14]/10' : 'border-[rgba(30,58,95,0.09)] bg-[#f3ede1]/30'
              }`}>
                <div className="flex items-center gap-2">
                  {(getEstadoAvalPerfil(perfilCompleto, 'vicerrectoria') || avalesUsuario?.aval_vicerrectoria) ? (
                    <CheckCircle className="text-[#c89b14] flex-shrink-0" size={24} />
                  ) : (
                    <XCircle className="text-[#6b7a8d] flex-shrink-0" size={24} />
                  )}
                  <div>
                    <h3 className="font-bold text-sm sm:text-base text-[#2c3e50]">Aval de Vicerrectoría</h3>
                    <p className="text-xs sm:text-sm text-[#6b7a8d]">
                      {(getEstadoAvalPerfil(perfilCompleto, 'vicerrectoria') || avalesUsuario?.aval_vicerrectoria) ? 'Aval otorgado' : 'Aval pendiente'}
                    </p>
                  </div>
                </div>
              </div>

              <div className={`border-2 rounded-lg p-3 sm:p-4 ${
                avalesUsuario.aval_talento_humano ? 'border-[#c89b14] bg-[#c89b14]/10' : 'border-[rgba(30,58,95,0.09)] bg-[#f3ede1]/30'
              }`}>
                <div className="flex items-center gap-2">
                  {avalesUsuario.aval_talento_humano ? (
                    <CheckCircle className="text-[#c89b14] flex-shrink-0" size={24} />
                  ) : (
                    <XCircle className="text-[#6b7a8d] flex-shrink-0" size={24} />
                  )}
                  <div>
                    <h3 className="font-bold text-sm sm:text-base text-[#2c3e50]">Aval de Talento Humano</h3>
                    <p className="text-xs sm:text-sm text-[#6b7a8d]">
                      {avalesUsuario.aval_talento_humano ? 'Aval otorgado' : 'Aval pendiente'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-[rgba(30,58,95,0.09)] p-4 bg-[#f3ede1]/30 flex justify-end">
              <button
                onClick={cerrarModalAvales}
                className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-[#2c3e50] text-white rounded-lg hover:bg-[#1e3a5f] transition-colors text-sm sm:text-base"
              >
                Cerrar
              </button>
            </div>
          </div>
          
        </div>
        
      )}
      </>)}
      {/* Modal de Perfil Completo */}
{mostrarPerfilCompleto && perfilCompleto && (
  <div className={`modal-overlay fixed inset-0 bg-black/50 z-50 p-2 sm:p-4 overflow-y-auto ${cerrandoPerfilCompleto ? "modal-exit" : ""}`}>
    <div className={`modal-content bg-white rounded-xl shadow-2xl w-full max-w-5xl mx-auto my-4 sm:my-8 ${cerrandoPerfilCompleto ? "modal-exit" : ""}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1e3a5f] to-[#152a45] text-white p-4 sm:p-6 rounded-t-xl">
        <div className="flex justify-between items-start gap-2">
          <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
            {perfilCompleto.datos_personales.foto_perfil_url ? (
              <img
                src={perfilCompleto.datos_personales.foto_perfil_url}
                alt="Foto"
                className="w-14 h-14 sm:w-20 sm:h-20 rounded-full object-cover border-4 border-white shadow-lg shrink-0"
              />
            ) : (
              <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-[#c89b14] flex items-center justify-center border-4 border-white shadow-lg shrink-0">
                <User size={32} />
              </div>
            )}
            <div className="min-w-0">
              <h2 className="text-lg sm:text-2xl font-bold break-words leading-tight">
                {perfilCompleto.datos_personales.primer_nombre} {perfilCompleto.datos_personales.segundo_nombre} {perfilCompleto.datos_personales.primer_apellido} {perfilCompleto.datos_personales.segundo_apellido}
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
                  <span className="text-[#c89b14] text-lg">★</span>
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
        
        {/* Botones de acción */}
          <div className="flex flex-wrap gap-2 mt-4">
          <button
            onClick={() => handleVerHojaVida(perfilCompleto.id)}
            disabled={loadingPerfil}
            className={`bg-white text-[#1e3a5f] px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 ${loadingPerfil ? 'opacity-60 cursor-not-allowed' : 'hover:bg-[#f3ede1]'}`}
          >
            {loadingPerfil ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
            Descargar Hoja de Vida
          </button>
          {!isAprobado(perfilCompleto.avales.rectoria.estado) && (
            <button
              onClick={() => !loadingPerfil && handleDarAval(perfilCompleto.id)}
              disabled={loadingPerfil}
              className={`bg-[#c89b14] text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 ${loadingPerfil ? 'opacity-60 cursor-not-allowed' : 'hover:bg-[#a67c0a]'}`}
            >
              {loadingPerfil ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
              Dar Aval
            </button>
          )}
          <button
            onClick={() => !loadingPerfil && handleRechazarAval(perfilCompleto.id)}
            disabled={loadingPerfil}
            className={`bg-[#e8740e] text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 ${loadingPerfil ? 'opacity-60 cursor-not-allowed' : 'hover:bg-[#c65a00]'}`}
          >
            {loadingPerfil ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} />}
            Rechazar
          </button>
        </div>
      </div>

      {/* Contenido */}
      <div className="p-4 sm:p-6 max-h-[65vh] sm:max-h-[calc(100vh-250px)] overflow-y-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Datos Personales */}
          <div className="bg-[#f3ede1]/50 p-4 rounded-lg">
            <h3 className="text-lg font-bold text-[#2c3e50] mb-3 flex items-center gap-2">
              <User size={20} className="text-[#1e3a5f]" />
              Datos Personales
            </h3>
            <div className="space-y-2 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <span className="font-semibold text-[#6b7a8d]">Género:</span>
                <span className="text-[#2c3e50]">{perfilCompleto.datos_personales.genero}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <span className="font-semibold text-[#6b7a8d]">Fecha Nacimiento:</span>
                <span className="text-[#2c3e50]">{perfilCompleto.datos_personales.fecha_nacimiento}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <span className="font-semibold text-[#6b7a8d]">Estado Civil:</span>
                <span className="text-[#2c3e50]">{perfilCompleto.datos_personales.estado_civil}</span>
              </div>
              {perfilCompleto.datos_personales.municipio && (
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-semibold text-[#6b7a8d]">Ubicación:</span>
                  <span className="text-[#2c3e50]">{perfilCompleto.datos_personales.municipio}, {perfilCompleto.datos_personales.departamento}</span>
                </div>
              )}
            </div>
          </div>

          {/* Contacto */}
          {perfilCompleto.informacion_contacto && (
            <div className="bg-[#f3ede1]/50 p-4 rounded-lg">
              <h3 className="text-lg font-bold text-[#2c3e50] mb-3 flex items-center gap-2">
                <Phone size={20} className="text-[#1e3a5f]" />
                Contacto
              </h3>
              <div className="space-y-2 text-sm">
                {perfilCompleto.informacion_contacto.telefono && (
                  <div className="grid grid-cols-2 gap-2">
                    <span className="font-semibold text-[#6b7a8d]">Teléfono:</span>
                    <span className="text-[#2c3e50]">{perfilCompleto.informacion_contacto.telefono}</span>
                  </div>
                )}
                {perfilCompleto.informacion_contacto.celular && (
                  <div className="grid grid-cols-2 gap-2">
                    <span className="font-semibold text-[#6b7a8d]">Celular:</span>
                    <span className="text-[#2c3e50]">{perfilCompleto.informacion_contacto.celular}</span>
                  </div>
                )}
                {perfilCompleto.informacion_contacto.direccion && (
                  <div className="grid grid-cols-2 gap-2">
                    <span className="font-semibold text-[#6b7a8d]">Dirección:</span>
                    <span className="text-[#2c3e50]">{perfilCompleto.informacion_contacto.direccion}</span>
                  </div>
                )}
                {perfilCompleto.informacion_contacto.barrio && (
                  <div className="grid grid-cols-2 gap-2">
                    <span className="font-semibold text-[#6b7a8d]">Barrio:</span>
                    <span className="text-[#2c3e50]">{perfilCompleto.informacion_contacto.barrio}</span>
                  </div>
                )}
                {perfilCompleto.informacion_contacto.correo_alterno && (
                  <div className="grid grid-cols-2 gap-2">
                    <span className="font-semibold text-[#6b7a8d]">Correo Alterno:</span>
                    <span className="text-[#2c3e50]">{perfilCompleto.informacion_contacto.correo_alterno}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* EPS y RUT */}
          {(perfilCompleto.eps || perfilCompleto.rut) && (
            <div className="bg-[#f3ede1]/50 p-4 rounded-lg">
              <h3 className="text-lg font-bold text-[#2c3e50] mb-3">Info Adicional</h3>
              <div className="space-y-2">
                {perfilCompleto.eps?.nombre_eps && (
                  <button
                    type="button"
                    onClick={() => handleAbrirDocumentoDeLista(perfilCompleto.eps!.documentosEps)}
                    className="bg-white p-3 rounded border border-[rgba(30,58,95,0.09)] text-left w-full hover:bg-[#f3ede1] transition-colors cursor-pointer text-sm"
                  >
                    <div className="grid grid-cols-2 gap-2">
                      <span className="font-semibold text-[#6b7a8d]">EPS:</span>
                      <span className="text-[#2c3e50]">{perfilCompleto.eps.nombre_eps}</span>
                    </div>
                    {perfilCompleto.eps.tipo_afiliacion && (
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        <span className="font-semibold text-[#6b7a8d]">Tipo:</span>
                        <span className="text-[#2c3e50]">{perfilCompleto.eps.tipo_afiliacion}</span>
                      </div>
                    )}
                    {perfilCompleto.eps.estado_afiliacion && (
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        <span className="font-semibold text-[#6b7a8d]">Estado:</span>
                        <span className="text-[#2c3e50]">{perfilCompleto.eps.estado_afiliacion}</span>
                      </div>
                    )}
                  </button>
                )}
                {perfilCompleto.rut?.numero_rut && (
                  <button
                    type="button"
                    onClick={() => handleAbrirDocumentoDeLista(perfilCompleto.rut!.documentosRut)}
                    className="bg-white p-3 rounded border border-[rgba(30,58,95,0.09)] text-left w-full hover:bg-[#f3ede1] transition-colors cursor-pointer text-sm"
                  >
                    <div className="grid grid-cols-2 gap-2">
                      <span className="font-semibold text-[#6b7a8d]">RUT:</span>
                      <span className="text-[#2c3e50]">{perfilCompleto.rut.numero_rut}</span>
                    </div>
                    {perfilCompleto.rut.razon_social && (
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        <span className="font-semibold text-[#6b7a8d]">Razón social:</span>
                        <span className="text-[#2c3e50]">{perfilCompleto.rut.razon_social}</span>
                      </div>
                    )}
                    {perfilCompleto.rut.tipo_persona && (
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        <span className="font-semibold text-[#6b7a8d]">Tipo persona:</span>
                        <span className="text-[#2c3e50]">{perfilCompleto.rut.tipo_persona}</span>
                      </div>
                    )}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Avales */}
          <div className="bg-[#f3ede1]/50 p-4 rounded-lg">
            <h3 className="text-lg font-bold text-[#2c3e50] mb-3 flex items-center gap-2">
              <Award size={20} className="text-[#1e3a5f]" />
              Avales
            </h3>
            <div className="space-y-3">
                    <div className={`flex items-center justify-between p-2 rounded ${isAprobado(perfilCompleto.avales.rectoria.estado) ? 'bg-[#c89b14]/20' : 'bg-[#e8740e]/20'}`}>
                      <span className="font-semibold text-sm text-[#2c3e50]">Rectoría</span>
                      <span className={`text-sm flex items-center gap-1 ${isAprobado(perfilCompleto.avales.rectoria.estado) ? 'text-[#c89b14]' : 'text-[#e8740e]'}`}>
                        {isAprobado(perfilCompleto.avales.rectoria.estado) ? (<><CheckCircle size={16} /> Aprobado</>) : (<><XCircle size={16} /> Pendiente</>)}
                      </span>
                    </div>
                    <div className={`flex items-center justify-between p-2 rounded ${isAprobado(perfilCompleto.avales.vicerrectoria.estado) ? 'bg-[#c89b14]/20' : 'bg-[rgba(30,58,95,0.09)]'}`}>
                      <span className="font-semibold text-sm text-[#2c3e50]">Vicerrectoría</span>
                      <span className={`text-sm flex items-center gap-1 ${isAprobado(perfilCompleto.avales.vicerrectoria.estado) ? 'text-[#c89b14]' : 'text-[#6b7a8d]'}`}>
                        {isAprobado(perfilCompleto.avales.vicerrectoria.estado) ? (<><CheckCircle size={16} /> Aprobado</>) : (<><XCircle size={16} /> Pendiente</>)}
                      </span>
                    </div>
                    <div className={`flex items-center justify-between p-2 rounded ${ (getEstadoAvalPerfil(perfilCompleto, 'talento_humano') || avalesUsuario?.aval_talento_humano) ? 'bg-[#c89b14]/20' : 'bg-[rgba(30,58,95,0.09)]'}`}>
                      <span className="font-semibold text-sm text-[#2c3e50]">Talento Humano</span>
                      <span className={`text-sm flex items-center gap-1 ${ (getEstadoAvalPerfil(perfilCompleto, 'talento_humano') || avalesUsuario?.aval_talento_humano) ? 'text-[#c89b14]' : 'text-[#6b7a8d]'}`}>
                        { (getEstadoAvalPerfil(perfilCompleto, 'talento_humano') || avalesUsuario?.aval_talento_humano) ? (<><CheckCircle size={16} /> Aprobado</>) : (<><XCircle size={16} /> Pendiente</>)}
                      </span>
                    </div>
                    <div className={`flex items-center justify-between p-2 rounded ${ (getEstadoAvalPerfil(perfilCompleto, 'coordinador') || avalesUsuario?.aval_coordinador) ? 'bg-[#c89b14]/20' : 'bg-[rgba(30,58,95,0.09)]'}`}>
                      <span className="font-semibold text-sm text-[#2c3e50]">Coordinación</span>
                      <span className={`text-sm flex items-center gap-1 ${ (getEstadoAvalPerfil(perfilCompleto, 'coordinador') || avalesUsuario?.aval_coordinador) ? 'text-[#c89b14]' : 'text-[#6b7a8d]'}`}>
                        { (getEstadoAvalPerfil(perfilCompleto, 'coordinador') || avalesUsuario?.aval_coordinador) ? (<><CheckCircle size={16} /> Aprobado</>) : (<><XCircle size={16} /> Pendiente</>)}
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
                  onClick={() => handleAbrirDocumentoCategoria('experiencias')}
                  className="bg-white p-4 rounded border border-[rgba(30,58,95,0.09)] text-left hover:bg-[#f3ede1] transition-colors cursor-pointer"
                >
                  <h4 className="font-bold text-[#2c3e50]">{exp.cargo}</h4>
                  <p className="text-sm text-[#6b7a8d]">{exp.empresa}</p>
                  <p className="text-xs text-[#6b7a8d] mt-1">
                    {exp.fecha_inicio} - {exp.fecha_fin || 'Actualidad'}
                  </p>
                  {exp.descripcion && <p className="text-sm mt-2 text-[#2c3e50]">{exp.descripcion}</p>}
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
                  onClick={() => handleAbrirDocumentoCategoria('estudios')}
                  className="bg-white p-4 rounded border border-[rgba(30,58,95,0.09)] text-left hover:bg-[#f3ede1] transition-colors cursor-pointer"
                >
                  <h4 className="font-bold text-[#2c3e50]">{est.titulo}</h4>
                  <p className="text-sm text-[#6b7a8d]">{est.institucion}</p>
                  <p className="text-xs text-[#6b7a8d]">{est.nivel_educativo}</p>
                  <p className="text-xs text-[#6b7a8d] mt-1">
                    {est.fecha_inicio} - {est.fecha_fin || 'En curso'}
                  </p>
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
              <Languages size={20} className="text-[#1e3a5f]" />
              Idiomas
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {perfilCompleto.idiomas.map((idioma, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleAbrirDocumentoCategoria('idiomas')}
                  className="bg-white p-3 rounded border border-[rgba(30,58,95,0.09)] text-left hover:bg-[#f3ede1] transition-colors cursor-pointer"
                >
                  <p className="font-semibold text-[#2c3e50]">{idioma.idioma}</p>
                  <p className="text-sm text-[#6b7a8d]">Nivel: {idioma.nivel}</p>
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
                        className="bg-white p-4 rounded border border-[rgba(30,58,95,0.09)] text-left w-full hover:bg-[#f3ede1] transition-colors cursor-pointer"
                      >
                        <div className="space-y-2 text-sm">
                          {perfilCompleto.certificacion_bancaria.nombre_banco && (
                            <div className="grid grid-cols-2 gap-2">
                              <span className="font-semibold text-[#6b7a8d]">Banco:</span>
                              <span className="text-[#2c3e50]">{perfilCompleto.certificacion_bancaria.nombre_banco}</span>
                            </div>
                          )}
                          {perfilCompleto.certificacion_bancaria.tipo_cuenta && (
                            <div className="grid grid-cols-2 gap-2">
                              <span className="font-semibold text-[#6b7a8d]">Tipo de cuenta:</span>
                              <span className="text-[#2c3e50]">{perfilCompleto.certificacion_bancaria.tipo_cuenta}</span>
                            </div>
                          )}
                          {perfilCompleto.certificacion_bancaria.numero_cuenta && (
                            <div className="grid grid-cols-2 gap-2">
                              <span className="font-semibold text-[#6b7a8d]">Número de cuenta:</span>
                              <span className="text-[#2c3e50]">{perfilCompleto.certificacion_bancaria.numero_cuenta}</span>
                            </div>
                          )}
                          {perfilCompleto.certificacion_bancaria.fecha_emision && (
                            <div className="grid grid-cols-2 gap-2">
                              <span className="font-semibold text-[#6b7a8d]">Fecha de emisión:</span>
                              <span className="text-[#2c3e50]">{perfilCompleto.certificacion_bancaria.fecha_emision}</span>
                            </div>
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
                        className="bg-white p-4 rounded border border-[rgba(30,58,95,0.09)] text-left w-full hover:bg-[#f3ede1] transition-colors cursor-pointer"
                      >
                        <div className="space-y-2 text-sm">
                          {perfilCompleto.pension.regimen_pensional && (
                            <div className="grid grid-cols-2 gap-2">
                              <span className="font-semibold text-[#6b7a8d]">Régimen:</span>
                              <span className="text-[#2c3e50]">{perfilCompleto.pension.regimen_pensional}</span>
                            </div>
                          )}
                          {perfilCompleto.pension.entidad_pensional && (
                            <div className="grid grid-cols-2 gap-2">
                              <span className="font-semibold text-[#6b7a8d]">Entidad:</span>
                              <span className="text-[#2c3e50]">{perfilCompleto.pension.entidad_pensional}</span>
                            </div>
                          )}
                          {perfilCompleto.pension.nit_entidad && (
                            <div className="grid grid-cols-2 gap-2">
                              <span className="font-semibold text-[#6b7a8d]">NIT:</span>
                              <span className="text-[#2c3e50]">{perfilCompleto.pension.nit_entidad}</span>
                            </div>
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
                        className="bg-white p-4 rounded border border-[rgba(30,58,95,0.09)] text-left w-full hover:bg-[#f3ede1] transition-colors cursor-pointer"
                      >
                        <div className="space-y-2 text-sm">
                          {perfilCompleto.antecedente_judicial.estado_antecedentes && (
                            <div className="grid grid-cols-2 gap-2">
                              <span className="font-semibold text-[#6b7a8d]">Estado:</span>
                              <span className="text-[#2c3e50]">{perfilCompleto.antecedente_judicial.estado_antecedentes}</span>
                            </div>
                          )}
                          {perfilCompleto.antecedente_judicial.fecha_validacion && (
                            <div className="grid grid-cols-2 gap-2">
                              <span className="font-semibold text-[#6b7a8d]">Fecha validación:</span>
                              <span className="text-[#2c3e50]">{perfilCompleto.antecedente_judicial.fecha_validacion}</span>
                            </div>
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
                            onClick={() => handleAbrirDocumentoDeLista(prod.documentosProduccionAcademica)}
                            className="bg-white p-4 rounded border border-[rgba(30,58,95,0.09)] text-left w-full hover:bg-[#f3ede1] transition-colors cursor-pointer"
                          >
                            <h4 className="font-bold text-[#2c3e50]">{prod.titulo}</h4>
                            {prod.medio_divulgacion && (
                              <p className="text-sm text-[#6b7a8d]">Medio: {prod.medio_divulgacion}</p>
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
                            className="bg-[#1e3a5f]/10 text-[#1e3a5f] px-3 py-1 rounded-full text-sm font-medium"
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
                        className="bg-white p-4 rounded border border-[rgba(30,58,95,0.09)] text-left w-full hover:bg-[#f3ede1] transition-colors cursor-pointer"
                      >
                        <div className="space-y-2 text-sm">
                          {perfilCompleto.arl.nombre_arl && (
                            <div className="grid grid-cols-2 gap-2">
                              <span className="font-semibold text-[#6b7a8d]">ARL:</span>
                              <span className="text-[#2c3e50]">{perfilCompleto.arl.nombre_arl}</span>
                            </div>
                          )}
                          {perfilCompleto.arl.clase_riesgo && (
                            <div className="grid grid-cols-2 gap-2">
                              <span className="font-semibold text-[#6b7a8d]">Clase de riesgo:</span>
                              <span className="text-[#2c3e50]">{perfilCompleto.arl.clase_riesgo}</span>
                            </div>
                          )}
                          {perfilCompleto.arl.estado_afiliacion && (
                            <div className="grid grid-cols-2 gap-2">
                              <span className="font-semibold text-[#6b7a8d]">Estado:</span>
                              <span className="text-[#2c3e50]">{perfilCompleto.arl.estado_afiliacion}</span>
                            </div>
                          )}
                          {perfilCompleto.arl.fecha_afiliacion && (
                            <div className="grid grid-cols-2 gap-2">
                              <span className="font-semibold text-[#6b7a8d]">Fecha afiliación:</span>
                              <span className="text-[#2c3e50]">{perfilCompleto.arl.fecha_afiliacion}</span>
                            </div>
                          )}
                          {perfilCompleto.arl.fecha_retiro && (
                            <div className="grid grid-cols-2 gap-2">
                              <span className="font-semibold text-[#6b7a8d]">Fecha retiro:</span>
                              <span className="text-[#2c3e50]">{perfilCompleto.arl.fecha_retiro}</span>
                            </div>
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
          className="bg-white p-3 rounded border border-[rgba(30,58,95,0.09)] hover:bg-[#f3ede1] flex items-center gap-2 text-left"
        >
          <FileText size={18} className="text-[#1e3a5f]" />
          <span className="text-sm truncate text-[#2c3e50]">{doc.nombre}</span>
        </button>
      ))}
    </div>
  </div>
)}
      </div>

      {/* Footer */}
      <div className="border-t border-[rgba(30,58,95,0.09)] p-4 bg-[#f3ede1]/30 flex justify-end">
        <button
          onClick={cerrarPerfilCompleto }
          className="px-6 py-2 bg-[#2c3e50] text-white rounded-lg hover:bg-[#1e3a5f]"
        >
          Cerrar
        </button>
      </div>
    </div>
  </div>
)}

{/* Modal de motivo de rechazo */}
{modalRechazoOpen && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70] p-4">
    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
      <div className="flex items-center justify-between p-4 border-b border-[rgba(30,58,95,0.09)]">
        <h3 className="text-lg font-bold text-[#2c3e50] flex items-center gap-2">
          <XCircle className="text-[#e8740e]" size={20} />
          Rechazar aval de Rectoría
        </h3>
        <button onClick={() => setModalRechazoOpen(false)} className="text-[#6b7a8d] hover:text-[#2c3e50] p-1 rounded">
          <X size={20} />
        </button>
      </div>
      <div className="p-4">
        <p className="text-sm text-[#6b7a8d] mb-3">
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
      <div className="flex justify-end gap-2 p-4 border-t border-[rgba(30,58,95,0.09)] bg-[#f3ede1]/30 rounded-b-xl">
        <button
          onClick={() => setModalRechazoOpen(false)}
          className="px-4 py-2 rounded-lg bg-[#ede6d8] text-[#2c3e50] hover:bg-[#e0d9cc] text-sm"
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
      <div className="flex items-center justify-between p-3 border-b border-[rgba(30,58,95,0.09)] bg-[#f3ede1]/30 rounded-t-xl">
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

{/* Modal de Evaluación */}
{modalVerEvaluacionOpen && (
    <div className={`modal-overlay fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto ${cerrandoModalEvaluacion ? "modal-exit" : ""}`}>
    <div className="modal-content bg-white rounded-xl shadow-2xl w-full max-w-3xl my-8">
      <div className="flex items-center justify-between p-5 border-b border-[rgba(30,58,95,0.09)]">
        <div>
          <h2 className="text-xl font-bold text-[#2c3e50]">Evaluación registrada</h2>
        </div>
        <button
          onClick={cerrarModalVerEvaluacion}
          className="text-[#6b7a8d] hover:text-[#2c3e50] p-2 rounded-lg"
          aria-label="Cerrar modal"
        >
          <X size={22} />
        </button>
      </div>

      <div className="p-5 space-y-4 max-h-[calc(100vh-220px)] overflow-y-auto">
        {loadingEvaluacion ? (
          <div className="text-center text-[#6b7a8d]">Cargando evaluación...</div>
        ) : errorEvaluacion ? (
          <div className="text-center text-[#e8740e] font-semibold">{errorEvaluacion}</div>
        ) : evaluacionExistente ? (
          <div className="space-y-6">
            {/* Estado de la evaluación */}
            <div className="bg-gradient-to-r from-[#f3ede1] to-[#ede6d8] p-4 rounded-lg border border-[#c89b14]/20">
              <h3 className="text-lg font-semibold text-[#1e3a5f] mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Estado de la Evaluación
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`p-3 rounded-lg ${evaluacionExistente.aprobado ? 'bg-[#c89b14]/20 text-[#c89b14]' : 'bg-[#e8740e]/20 text-[#e8740e]'}`}>
                  <div className="font-semibold">Resultado</div>
                  <div className="text-lg">{evaluacionExistente.aprobado ? 'Aprobado ✓' : 'No aprobado ✗'}</div>
                </div>
                <div className="bg-white p-3 rounded-lg border border-[rgba(30,58,95,0.09)]">
                  <div className="font-semibold text-[#2c3e50]">Prueba psicotécnica</div>
                  <div className="text-[#6b7a8d]">{evaluacionExistente.prueba_psicotecnica || 'No especificada'}</div>
                </div>
              </div>
            </div>


            {/* Validaciones */}
            <div className="bg-[#f3ede1]/50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-[#2c3e50] mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Validaciones
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${evaluacionExistente.validacion_archivos ? 'bg-[#c89b14]' : 'bg-[#e8740e]'}`}></div>
                  <span className="text-[#2c3e50]">Validación de archivos</span>
                  <span className="text-sm text-[#6b7a8d]">({evaluacionExistente.validacion_archivos ? 'Aprobado' : 'Pendiente'})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${evaluacionExistente.clase_organizada ? 'bg-[#c89b14]' : 'bg-[#e8740e]'}`}></div>
                  <span className="text-[#2c3e50]">Clase organizada</span>
                  <span className="text-sm text-[#6b7a8d]">({evaluacionExistente.clase_organizada ? 'Sí' : 'No'})</span>
                </div>
              </div>
            </div>

            {/* Formulario organizado por secciones */}
            {evaluacionExistente.formulario && Array.isArray(evaluacionExistente.formulario) && evaluacionExistente.formulario.length > 0 && (
              <div className="bg-white border border-[rgba(30,58,95,0.09)] rounded-lg p-4">
                <h3 className="text-lg font-semibold text-[#2c3e50] mb-4 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Información del Candidato
                </h3>
                {(() => {
                  const secciones: Record<string, Array<{seccion?: string, campo?: string, valor?: string}>> = {};
                  (evaluacionExistente.formulario as Array<Record<string, unknown>>).forEach((item) => {
                    const key = String(item['seccion'] ?? 'General');
                    if (!secciones[key]) secciones[key] = [];
                    secciones[key].push({ seccion: key, campo: String(item['campo'] ?? item['label'] ?? ''), valor: String(item['valor'] ?? item['value'] ?? '') });
                  });

                  return Object.entries(secciones).map(([seccion, items]) => (
                    <div key={seccion} className="mb-4 last:mb-0">
                      <h4 className="font-medium text-[#2c3e50] mb-2 pb-1 border-b border-[rgba(30,58,95,0.09)]">{seccion}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {items.map((item, idx) => (
                          <div key={idx} className="bg-[#f3ede1]/30 p-3 rounded">
                            <div className="font-medium text-sm text-[#6b7a8d]">{item.campo}</div>
                            <div className="text-[#2c3e50] mt-1">{item.valor || 'No especificado'}</div>
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
              <div className="bg-[#c89b14]/10 border border-[#c89b14]/20 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-[#c89b14] mb-2 flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Observaciones
                </h3>
                <p className="text-[#2c3e50] whitespace-pre-wrap">{evaluacionExistente.observaciones}</p>
              </div>
            )}

           {/* Información del registro */}
            <div className="bg-[#f3ede1]/50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-[#2c3e50] mb-3 flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Información del Registro
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-[#6b7a8d]">Creada:</span>
                  <div className="text-[#2c3e50]">{evaluacionExistente.created_at ? new Date(evaluacionExistente.created_at).toLocaleString('es-ES') : '-'}</div>
                </div>
                <div>
                  <span className="font-medium text-[#6b7a8d]">Última actualización:</span>
                  <div className="text-[#2c3e50]">{evaluacionExistente.updated_at ? new Date(evaluacionExistente.updated_at).toLocaleString('es-ES') : '-'}</div>
                </div>
              </div>
            </div>

            {/* Plantilla asociada */}
            {plantillaEvaluacion && (
              <div className="bg-[#1e3a5f]/10 border border-[#1e3a5f]/20 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-[#1e3a5f] mb-2 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Plantilla Utilizada
                </h3>
                <div className="space-y-2">
                  <div><span className="font-medium">Nombre:</span> {plantillaEvaluacion.nombre}</div>
                  {plantillaEvaluacion.descripcion && (
                    <div><span className="font-medium">Descripción:</span> {plantillaEvaluacion.descripcion}</div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center text-[#6b7a8d]">No se encontró evaluación registrada.</div>
        )}
      </div>

      <div className="flex justify-end gap-2 p-5 border-t border-[rgba(30,58,95,0.09)]">
        <button onClick={cerrarModalVerEvaluacion} className="px-4 py-2 rounded-lg bg-[#ede6d8] text-[#2c3e50] hover:bg-[#e0d9cc]">Cerrar</button>
      </div>
    </div>
  </div>
)}
    </div>
    </div>

    {/* Asistente IA — flotante */}
    <ChatIAWidget
      convocatoriaId={modalConvocatoria?.id ?? null}
      aspiranteId={perfilCompleto?.id ?? null}
      aspiranteNombre={
        perfilCompleto
          ? `${perfilCompleto.datos_personales.primer_nombre} ${perfilCompleto.datos_personales.primer_apellido}`
          : null
      }
    />
    </>
  );
};
export default GestionAvalesRectoria;