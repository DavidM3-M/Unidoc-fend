// src/protected/rectoria/avales.tsx
import InputSearch from "../../componentes/formularios/InputSearch";
import { useCallback, useEffect, useMemo, useState } from "react";
import axiosInstance from "../../utils/axiosConfig";
import { toast } from "react-toastify";
import axios from "axios";
import Cookie from "js-cookie";
import { CheckCircle, XCircle, Eye, FileText, X, Phone, Mail, Briefcase, GraduationCap, Award, Languages, User, FileDown, Loader2, Globe } from "lucide-react";

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
  eps?: { nombre_eps?: string; };
  rut?: { numero_rut?: string; };
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
    tipo: string;
    fecha: string;
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
  const [mostrarPerfilCompleto, setMostrarPerfilCompleto] = useState(false);
  const [loadingPerfil, setLoadingPerfil] = useState(false);
  const [cerrandoModalAvales, setCerrandoModalAvales] = useState(false);
  const [cerrandoPerfilCompleto, setCerrandoPerfilCompleto] = useState(false);
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

  // Estados para evaluaciones
  const [modalVerEvaluacionOpen, setModalVerEvaluacionOpen] = useState(false);
  const [cerrandoModalEvaluacion, setCerrandoModalEvaluacion] = useState(false);
  const [evaluacionExistente, setEvaluacionExistente] = useState<EvaluacionRectoria | null>(null);
  const [errorEvaluacion, setErrorEvaluacion] = useState<string | null>(null);
  const [loadingEvaluacion, setLoadingEvaluacion] = useState(false);
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
    console.log("Respuesta de usuarios:", rawUsuarios);
    
    // Obtener convocatorias con postulaciones
    const convocatoriasResponse = await axiosInstance.get("/rectoria/convocatorias");
    const rawConvocatorias = convocatoriasResponse.data?.data ?? [];
    console.log("Respuesta de convocatorias:", rawConvocatorias);
    
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
                  aval_rectoria: false, // No tenemos avales aquí
                  aval_vicerrectoria: false,
                  aval_talento_humano: false,
                  aval_coordinador: false,
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
    console.log("Usuarios procesados:", usuarios);
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
    console.log("Respuesta de convocatorias:", data);
    const convs: Convocatoria[] = Array.isArray(data)
      ? data.map((c) => ({
          id: Number(c.id ?? 0),
          nombre: c.nombre ?? `Convocatoria ${c.id}`,
          fecha: c.fecha,
        }))
      : [];
    console.log("Convocatorias procesadas:", convs);
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
    // Usar el mismo endpoint estándar para avales por rol (paradigma: /rectoria/aval-hoja-vida/:id)
    const payload: Record<string, unknown> = { estado: 'Aprobado' };
    console.log("POST /rectoria/aval-hoja-vida/", userId, "payload:", payload);
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
      toast.error(error.response?.data?.mensaje || "Error al otorgar el aval");
    }
  }
};

  const verAvales = async (userId: number) => {
    try {
      const response = await axiosInstance.get(`/rectoria/usuarios/${userId}/avales`);
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
      const rol = payload.rol || payload.role || payload.user_role;
      console.log("ROL DETECTADO:", rol);
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
    console.log("URL llamada:", url);

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
    return data;
  }, [usuarios, selectedConvocatoriaId, nameFilter, dateFrom, dateTo, sortOrder]);

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
    <div className="flex flex-col gap-4 w-full bg-white rounded-xl sm:rounded-2xl lg:rounded-3xl p-4 sm:p-6 lg:p-8 min-h-screen">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-col sm:flex-row w-full sm:w-auto">
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 flex items-center gap-2 flex-wrap">
              <CheckCircle size={28} className="text-purple-600 flex-shrink-0" />
              <span>Gestión de Avales - Rectoría</span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              Revisa y otorga avales a las hojas de vida
            </p>
          </div>
          {/* Botón de 'Ver Evaluaciones' eliminado por solicitud del usuario */}
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

      {/* Sección de Evaluaciones o Convocatorias */}
      {mostrarEvaluaciones ? (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Award size={20} className="text-purple-600" />
              Evaluaciones de Rectoría
            </h2>
            <button
              onClick={() => fetchEvaluacionesConUsuarios()}
              disabled={loadingEvaluaciones}
              className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 flex items-center gap-2 text-sm"
            >
              {loadingEvaluaciones ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
              {loadingEvaluaciones ? 'Cargando...' : 'Actualizar'}
            </button>
          </div>

          {loadingEvaluaciones ? (
            <div className="py-10 text-center text-gray-500 flex items-center justify-center gap-2">
              <Loader2 size={20} className="animate-spin" />
              Cargando evaluaciones...
            </div>
          ) : evaluacionesConUsuarios.length === 0 ? (
            <div className="py-10 text-center text-gray-500">
              No hay evaluaciones disponibles.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {evaluacionesConUsuarios.map((item) => (
                <div key={item.evaluacion.id} className="border rounded-lg p-4 shadow-sm bg-white hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 text-sm">
                        {item.usuario.primer_nombre} {item.usuario.primer_apellido}
                      </h3>
                      <p className="text-xs text-gray-500">{item.usuario.numero_identificacion}</p>
                    </div>
                    <button
                      onClick={() => handleVerEvaluacion(item.usuario.id)}
                      className="text-blue-600 hover:text-blue-800 p-1"
                      title="Ver evaluación completa"
                    >
                      <Eye size={16} />
                    </button>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Puntuación Total:</span>
                      <span className="font-semibold text-purple-600">
                        {item.evaluacion.puntuacion_total || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Estado:</span>
                      <span className={`font-medium ${item.evaluacion.estado === 'aprobado' ? 'text-green-600' : item.evaluacion.estado === 'rechazado' ? 'text-red-600' : 'text-yellow-600'}`}>
                        {item.evaluacion.estado || 'Pendiente'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Fecha:</span>
                      <span className="text-gray-800">
                        {item.evaluacion.fecha_evaluacion ? new Date(item.evaluacion.fecha_evaluacion).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
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
            {convocatoriasParaFiltro.map((c) => (
              <option key={c.id} value={c.id}>{c.nombre} ({c.count})</option>
            ))}
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

      {/* Convocatorias en tarjetas */}
      {loading ? (
        <div className="py-10 text-center text-gray-500">Cargando usuarios...</div>
      ) : convocatoriasAgrupadas.length === 0 ? (
        <div className="py-10 text-center text-gray-500">No hay usuarios con los filtros actuales.</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {convocatoriasAgrupadas.map((conv) => {
            return (
              <div key={conv.id ?? "sin-convocatoria"} className="border rounded-2xl p-5 shadow-sm bg-white">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{conv.nombre}</h3>
                    <p className="text-sm text-gray-500">{conv.usuarios.length} postulante(s)</p>
                  </div>
                  <button
                    onClick={() => {
                      setCerrandoModalConvocatoria(false);
                      setModalConvocatoria({ id: conv.id, nombre: conv.nombre });
                    }}
                    className="text-sm px-3 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                  >
                    Ver postulantes
                  </button>
                </div>

                <div className="mt-4">
                  <div className="text-sm text-gray-500">
                    Haz clic en "Ver postulantes" para visualizar el listado completo.
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de aspirantes por convocatoria */}
      {modalConvocatoria && (
        <div className={`modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto ${cerrandoModalConvocatoria ? "modal-exit" : ""}`}>
          <div className={`modal-content bg-white rounded-xl shadow-2xl w-full max-w-6xl my-8 ${cerrandoModalConvocatoria ? "modal-exit" : ""}`}>
            <div className="flex items-center justify-between p-5 border-b">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Postulantes - {modalConvocatoria.nombre}</h2>
                <p className="text-sm text-gray-500">{usuariosModal.length} postulante(s)</p>
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
              {usuariosModal.length === 0 ? (
                <div className="text-center text-gray-500 py-10">No hay postulantes para esta convocatoria.</div>
              ) : (
                <div className="space-y-4">
                  {usuariosModal.map((u) => (
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
                                className={`text-xs px-2 py-1 rounded-full ${
                                  u.aval_rectoria ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                                }`}
                              >
                                {u.aval_rectoria ? "Aval otorgado" : "Pendiente"}
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
                            onClick={() => handleVerHojaVida(u.id)}
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



                          {!u.aval_rectoria && (
                            <button
                              onClick={() => handleDarAval(u.id)}
                              className="inline-flex items-center gap-2 bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 shadow text-sm"
                            >
                              <CheckCircle size={14} />
                              <span>Dar Aval</span>
                            </button>
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
        <div className={`modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 ${cerrandoModalAvales ? "modal-exit" : ""}`}>
          <div className={`modal-content bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto ${cerrandoModalAvales ? "modal-exit" : ""}`}>
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-bold mb-2">
                Estado de Avales
              </h2>
              <p className="text-purple-100 text-sm sm:text-base">
                {usuarioSeleccionado.primer_nombre} {usuarioSeleccionado.primer_apellido}
              </p>
              <p className="text-purple-100 text-xs sm:text-sm">
                ID: {usuarioSeleccionado.numero_identificacion}
              </p>
            </div>

            <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
              <div className={`border-2 rounded-lg p-3 sm:p-4 ${
                (getEstadoAvalPerfil(perfilCompleto, 'rectoria') || avalesUsuario?.aval_rectoria) ? 'border-green-500 bg-green-50' : 'border-orange-500 bg-orange-50'
              }`}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {(getEstadoAvalPerfil(perfilCompleto, 'rectoria') || avalesUsuario?.aval_rectoria) ? (
                      <CheckCircle className="text-green-600 flex-shrink-0" size={24} />
                    ) : (
                      <XCircle className="text-orange-600 flex-shrink-0" size={24} />
                    )}
                    <div>
                      <h3 className="font-bold text-base sm:text-lg">Aval de Rectoría</h3>
                      <p className="text-xs sm:text-sm text-gray-600 mt-1">
                        {(getEstadoAvalPerfil(perfilCompleto, 'rectoria') || avalesUsuario?.aval_rectoria) ? 'Aval otorgado' : 'Aval pendiente'}
                      </p>
                    </div>
                  </div>
                  {!avalesUsuario.aval_rectoria && (
                    <button
                      onClick={() => handleDarAval(usuarioSeleccionado.id)}
                      className="w-full sm:w-auto bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                    >
                      Dar Aval
                    </button>
                  )}
                </div>
              </div>

              <div className={`border-2 rounded-lg p-3 sm:p-4 ${
                (getEstadoAvalPerfil(perfilCompleto, 'vicerrectoria') || avalesUsuario?.aval_vicerrectoria) ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-gray-50'
              }`}>
                <div className="flex items-center gap-2">
                  {(getEstadoAvalPerfil(perfilCompleto, 'vicerrectoria') || avalesUsuario?.aval_vicerrectoria) ? (
                    <CheckCircle className="text-green-600 flex-shrink-0" size={24} />
                  ) : (
                    <XCircle className="text-gray-400 flex-shrink-0" size={24} />
                  )}
                  <div>
                    <h3 className="font-bold text-sm sm:text-base">Aval de Vicerrectoría</h3>
                    <p className="text-xs sm:text-sm text-gray-600">
                      {(getEstadoAvalPerfil(perfilCompleto, 'vicerrectoria') || avalesUsuario?.aval_vicerrectoria) ? 'Aval otorgado' : 'Aval pendiente'}
                    </p>
                  </div>
                </div>
              </div>

              <div className={`border-2 rounded-lg p-3 sm:p-4 ${
                avalesUsuario.aval_talento_humano ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-gray-50'
              }`}>
                <div className="flex items-center gap-2">
                  {avalesUsuario.aval_talento_humano ? (
                    <CheckCircle className="text-green-600 flex-shrink-0" size={24} />
                  ) : (
                    <XCircle className="text-gray-400 flex-shrink-0" size={24} />
                  )}
                  <div>
                    <h3 className="font-bold text-sm sm:text-base">Aval de Talento Humano</h3>
                    <p className="text-xs sm:text-sm text-gray-600">
                      {avalesUsuario.aval_talento_humano ? 'Aval otorgado' : 'Aval pendiente'}
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
      </>)}
      {/* Modal de Perfil Completo */}
{mostrarPerfilCompleto && perfilCompleto && (
  <div className={`modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto ${cerrandoPerfilCompleto ? "modal-exit" : ""}`}>
    <div className={`modal-content bg-white rounded-xl shadow-2xl w-full max-w-5xl my-8 ${cerrandoPerfilCompleto ? "modal-exit" : ""}`}>
      {/* Header */}
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
                {perfilCompleto.datos_personales.primer_nombre} {perfilCompleto.datos_personales.segundo_nombre} {perfilCompleto.datos_personales.primer_apellido} {perfilCompleto.datos_personales.segundo_apellido}
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
        
        {/* Botones de acción */}
          <div className="flex gap-2 mt-4">
          <button
            onClick={() => handleVerHojaVida(perfilCompleto.id)}
            disabled={loadingPerfil}
            className={`bg-white text-indigo-600 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 ${loadingPerfil ? 'opacity-60 cursor-not-allowed' : 'hover:bg-indigo-50'}`}
          >
            {loadingPerfil ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
            Descargar Hoja de Vida
          </button>
          {!isAprobado(perfilCompleto.avales.rectoria.estado) && (
            <button
              onClick={() => !loadingPerfil && handleDarAval(perfilCompleto.id)}
              disabled={loadingPerfil}
              className={`bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 ${loadingPerfil ? 'opacity-60 cursor-not-allowed' : 'hover:bg-green-700'}`}
            >
              {loadingPerfil ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
              Dar Aval
            </button>
          )}
        </div>
      </div>

      {/* Contenido */}
      <div className="p-6 max-h-[calc(100vh-250px)] overflow-y-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Datos Personales */}
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

          {/* Contacto */}
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

          {/* EPS y RUT */}
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

          {/* Avales */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
              <Award size={20} className="text-indigo-600" />
              Avales
            </h3>
            <div className="space-y-3">
                    <div className={`flex items-center justify-between p-2 rounded ${isAprobado(perfilCompleto.avales.rectoria.estado) ? 'bg-green-100' : 'bg-orange-100'}`}>
                      <span className="font-semibold text-sm">Rectoría</span>
                      <span className={`text-sm flex items-center gap-1 ${isAprobado(perfilCompleto.avales.rectoria.estado) ? 'text-green-700' : 'text-orange-700'}`}>
                        {isAprobado(perfilCompleto.avales.rectoria.estado) ? (<><CheckCircle size={16} /> Aprobado</>) : (<><XCircle size={16} /> Pendiente</>)}
                      </span>
                    </div>
                    <div className={`flex items-center justify-between p-2 rounded ${isAprobado(perfilCompleto.avales.vicerrectoria.estado) ? 'bg-green-100' : 'bg-gray-100'}`}>
                      <span className="font-semibold text-sm">Vicerrectoría</span>
                      <span className={`text-sm flex items-center gap-1 ${isAprobado(perfilCompleto.avales.vicerrectoria.estado) ? 'text-green-700' : 'text-gray-600'}`}>
                        {isAprobado(perfilCompleto.avales.vicerrectoria.estado) ? (<><CheckCircle size={16} /> Aprobado</>) : (<><XCircle size={16} /> Pendiente</>)}
                      </span>
                    </div>
                    <div className={`flex items-center justify-between p-2 rounded ${ (getEstadoAvalPerfil(perfilCompleto, 'talento_humano') || avalesUsuario?.aval_talento_humano) ? 'bg-green-100' : 'bg-gray-100'}`}>
                      <span className="font-semibold text-sm">Talento Humano</span>
                      <span className={`text-sm flex items-center gap-1 ${ (getEstadoAvalPerfil(perfilCompleto, 'talento_humano') || avalesUsuario?.aval_talento_humano) ? 'text-green-700' : 'text-gray-600'}`}>
                        { (getEstadoAvalPerfil(perfilCompleto, 'talento_humano') || avalesUsuario?.aval_talento_humano) ? (<><CheckCircle size={16} /> Aprobado</>) : (<><XCircle size={16} /> Pendiente</>)}
                      </span>
                    </div>
                    <div className={`flex items-center justify-between p-2 rounded ${ (getEstadoAvalPerfil(perfilCompleto, 'coordinador') || avalesUsuario?.aval_coordinador) ? 'bg-green-100' : 'bg-gray-100'}`}>
                      <span className="font-semibold text-sm">Coordinación</span>
                      <span className={`text-sm flex items-center gap-1 ${ (getEstadoAvalPerfil(perfilCompleto, 'coordinador') || avalesUsuario?.aval_coordinador) ? 'text-green-700' : 'text-gray-600'}`}>
                        { (getEstadoAvalPerfil(perfilCompleto, 'coordinador') || avalesUsuario?.aval_coordinador) ? (<><CheckCircle size={16} /> Aprobado</>) : (<><XCircle size={16} /> Pendiente</>)}
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
                  onClick={() => handleAbrirDocumentoCategoria('experiencias')}
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
                  onClick={() => handleAbrirDocumentoCategoria('estudios')}
                  className="bg-white p-4 rounded border text-left hover:bg-indigo-50 transition-colors cursor-pointer"
                >
                  <h4 className="font-bold">{est.titulo}</h4>
                  <p className="text-sm text-gray-600">{est.institucion}</p>
                  <p className="text-xs text-gray-500">{est.nivel_educativo}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {est.fecha_inicio} - {est.fecha_fin || 'En curso'}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Idiomas */}
        {perfilCompleto.idiomas && perfilCompleto.idiomas.length > 0 && (
          <div className="mt-6 bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
              <Languages size={20} className="text-indigo-600" />
              Idiomas
            </h3>
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

      {/* Footer */}
      <div className="border-t p-4 bg-gray-50 flex justify-end">
        <button
          onClick={cerrarPerfilCompleto }
          className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
        >
          Cerrar
        </button>
      </div>
    </div>
  </div>
)}
{/* Modal de Evaluación */}
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
                  const secciones: Record<string, Array<{seccion?: string, campo?: string, valor?: string}>> = {};
                  (evaluacionExistente.formulario as Array<Record<string, unknown>>).forEach((item) => {
                    const key = String(item['seccion'] ?? 'General');
                    if (!secciones[key]) secciones[key] = [];
                    secciones[key].push({ seccion: key, campo: String(item['campo'] ?? item['label'] ?? ''), valor: String(item['valor'] ?? item['value'] ?? '') });
                  });

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
                  <Award className="w-5 h-5" />
                  Observaciones
                </h3>
                <p className="text-yellow-700 whitespace-pre-wrap">{evaluacionExistente.observaciones}</p>
              </div>
            )}

            {/* Información del registro */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Información del Registro
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-600">Creada:</span>
                  <div className="text-gray-800">{evaluacionExistente.created_at ? new Date(evaluacionExistente.created_at).toLocaleString('es-ES') : '-'}</div>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Última actualización:</span>
                  <div className="text-gray-800">{evaluacionExistente.updated_at ? new Date(evaluacionExistente.updated_at).toLocaleString('es-ES') : '-'}</div>
                </div>
              </div>
            </div>

            {/* Plantilla asociada */}
            {plantillaEvaluacion && (
              <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-indigo-800 mb-2 flex items-center gap-2">
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
          <div className="text-center text-gray-500">No se encontró evaluación registrada.</div>
        )}
      </div>

      <div className="flex justify-end gap-2 p-5 border-t">
        <button onClick={cerrarModalVerEvaluacion} className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700">Cerrar</button>
      </div>
    </div>
  </div>
)}
    </div>
    
  );
};
export default GestionAvalesRectoria;