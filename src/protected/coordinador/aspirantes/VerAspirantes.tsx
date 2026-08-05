import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import axiosInstance from "../../../utils/axiosConfig";
import InputSearch from "../../../componentes/formularios/InputSearch";
import ChatIAWidget from "../../../components/ia/ChatIAWidget";
import ValidarDocumentoIA from "../../../components/ia/ValidarDocumentoIA";
import { User, FileText, CheckCircle, XCircle, Mail, Phone, Briefcase, GraduationCap, Award, FileDown, X, Loader2, Globe, Landmark, PiggyBank, Scale, ShieldCheck, BookOpen, Lightbulb, Sparkles } from "lucide-react";
import axios from "axios";

interface Aspirante {
  id: number;
  primer_nombre: string;
  segundo_nombre?: string;
  primer_apellido: string;
  segundo_apellido?: string;
  numero_identificacion: string;
  email?: string;
  aval_coordinador?: boolean | string | number;
  aval_talento_humano?: boolean | string | number;
  aval_vicerrectoria?: boolean | string | number;
  aval_rectoria?: boolean | string | number;
  puntaje_aspirante?: number;
}

interface Convocatoria {
  id?: number;
  nombre?: string;
  estado?: string;
}
interface PostulacionItem {
  aspirante?: Aspirante;
  convocatoria?: Convocatoria;
  estado_postulacion?: string;
  postulacion_id?: number;
  aval_coord_aprobado?: boolean;
}

interface PostulacionesAgrupadas {
  convocatoria?: Convocatoria;
  postulaciones?: PostulacionItem[];
}

// Tipado para perfil detallado (similar a talento humano)
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
    tipo?: string;
    fecha?: string;
    numero_autores?: number;
    medio_divulgacion?: string;
    fecha_divulgacion?: string;
    documentosProduccionAcademica?: Array<{ id_documento?: number; archivo_url?: string; url?: string; archivo?: string }>;
  }>;
  aptitudes?: Array<{ nombre: string }>;
  postulaciones?: Array<{ convocatoriaPostulacion?: { titulo: string } }>;
  avales?: {
    talentoHumano?: { estado?: boolean | string };
    talento_humano?: { estado?: boolean | string };
    coordinador?: { estado?: boolean | string };
    rectoria?: { estado?: string };
    vicerrectoria?: { estado?: string };
  };
  aval_talento_humano?: boolean | string | number;
  aval_coordinador?: boolean | string | number;
  aval_vicerrectoria?: boolean | string | number;
  aval_rectoria?: boolean | string | number;
}

type DocumentoAdjunto = { id_documento?: number; archivo_url?: string; url?: string; archivo?: string };
type CategoriaDocs = 'experiencias' | 'estudios' | 'idiomas' | 'producciones' | 'rut' | 'informacion-contacto' | 'eps' | 'usuario';

const VerAspirantesTH = () => {
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [postulaciones, setPostulaciones] = useState<PostulacionesAgrupadas[]>([]);
  const [estadoPostulacion, setEstadoPostulacion] = useState<"Todas" | "Enviada" | "Aceptada" | "Rechazada" | "Faltan documentos">("Aceptada");
  const [modalConvocatoria, setModalConvocatoria] = useState<{ id?: number; nombre?: string } | null>(null);
  const [cerrandoModal, setCerrandoModal] = useState(false);
  const [modalSearch, setModalSearch] = useState("");
  const [sortByPuntaje, setSortByPuntaje] = useState<'desc' | null>(null);
  const [modalPage, setModalPage] = useState(1);
  const modalPageSize = 12;
  const [modalEvaluacionOpen, setModalEvaluacionOpen] = useState(false);
  const [cerrandoModalEvaluacion, setCerrandoModalEvaluacion] = useState(false);
  const [evaluando, setEvaluando] = useState<PostulacionItem | null>(null);
  const [avalesCoordLocal, setAvalesCoordLocal] = useState<Record<string, boolean>>({});
  // Estado para evaluación existente
  interface EvaluacionCoordinador {
    id: number;
    aspirante_user_id: number;
    coordinador_user_id: number;
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
  interface PlantillaEvaluacion {
    id: number;
    nombre: string;
    descripcion?: string;
    campos?: unknown;
    [key: string]: unknown;
  }
  const [evaluacionExistente, setEvaluacionExistente] = useState<EvaluacionCoordinador | null>(null);
  const [plantillaEvaluacion, setPlantillaEvaluacion] = useState<PlantillaEvaluacion | null>(null);
  const [errorEvaluacion, setErrorEvaluacion] = useState<string | null>(null);
  const [modalVerEvaluacionOpen, setModalVerEvaluacionOpen] = useState(false);
  const [loadingEvaluacion, setLoadingEvaluacion] = useState(false);
    // Función para obtener evaluación existente
    const handleVerEvaluacion = async (aspiranteId: number) => {
      setLoadingEvaluacion(true);
      setEvaluacionExistente(null);
      setPlantillaEvaluacion(null);
      setErrorEvaluacion(null);
      setModalVerEvaluacionOpen(true);

      try {
        // Buscar evaluación por ID de aspirante
        const res = await axiosInstance.get(`/coordinador/evaluaciones/${aspiranteId}`);

        // Verificar diferentes estructuras de respuesta posibles
        let evaluacion = null;
        let plantilla = null;

        if (res.data && res.data.data && res.data.data.evaluacion) {
          // Estructura correcta: { data: { evaluacion: {...}, plantilla: {...} } }
          evaluacion = res.data.data.evaluacion;
          plantilla = res.data.data.plantilla || null;
        } else if (res.data && res.data.evaluacion) {
          // Estructura alternativa: { evaluacion: {...}, plantilla: {...} }
          evaluacion = res.data.evaluacion;
          plantilla = res.data.plantilla || null;
        } else if (res.data && res.data.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
          // Estructura con array: { data: [{ evaluacion: {...}, ... }] }
          evaluacion = res.data.data[0].evaluacion;
          plantilla = res.data.data[0].plantilla || null;
        }

        if (evaluacion) {
          setEvaluacionExistente(evaluacion);
          setPlantillaEvaluacion(plantilla);
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
      setModalVerEvaluacionOpen(false);
      setEvaluacionExistente(null);
      setPlantillaEvaluacion(null);
      setErrorEvaluacion(null);
    };
  const [aprobado, setAprobado] = useState(false);
  const [pruebaPsicotecnica, setPruebaPsicotecnica] = useState("");
  const [validacionArchivos, setValidacionArchivos] = useState(false);
  const [claseOrganizada, setClaseOrganizada] = useState(false);
  const [observaciones, setObservaciones] = useState("");

  // Información personal
  const [nucleoFamiliar, setNucleoFamiliar] = useState("");
  const [competencias, setCompetencias] = useState("");
  const [oportunidadesMejora, setOportunidadesMejora] = useState("");
  const [aspiracionesLaborales, setAspiracionesLaborales] = useState("");

  // Competencias técnicas
  const [tituloPregrado, setTituloPregrado] = useState("");
  const [titulosPosgrado, setTitulosPosgrado] = useState("");
  const [experienciasRelevantes, setExperienciasRelevantes] = useState("");
  const [conocimientosEspecificos, setConocimientosEspecificos] = useState("");
  const [herramientasTIC, setHerramientasTIC] = useState("");
  const [opcionDocencia, setOpcionDocencia] = useState("");
  const [continuaProceso, setContinuaProceso] = useState(true);
  const [razonContinua, setRazonContinua] = useState("");

  // Experiencia práctica
  const [metodologia, setMetodologia] = useState("");
  const [dominioTecnico, setDominioTecnico] = useState("");
  const [expresionOral, setExpresionOral] = useState("");
  const [presentacionPersonal, setPresentacionPersonal] = useState("");

  // Conclusión
  const [conceptoGeneral, setConceptoGeneral] = useState("");
  const [sugerirContratacion, setSugerirContratacion] = useState(true);

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

  const normalizeGroups = useCallback((raw: unknown): PostulacionesAgrupadas[] => {
    if (!raw) return [];

    const parseId = (value: unknown): number | undefined => {
      if (value === null || value === undefined) return undefined;
      const num = Number(value);
      return Number.isNaN(num) ? undefined : num;
    };

    const resolveConvocatoria = (obj: Record<string, unknown>): Convocatoria | undefined => {
      const conv =
        (obj["convocatoria"] as Convocatoria) ??
        (obj["convocatoriaPostulacion"] as Convocatoria) ??
        (obj["convocatoria_postulacion"] as Convocatoria) ??
        undefined;

      const idRaw =
        (conv?.id as number | string | undefined) ??
        ((conv as Record<string, unknown> | undefined)?.["id_convocatoria"] as number | string | undefined) ??
        (obj["convocatoria_id"] as number | string | undefined) ??
        (obj["id_convocatoria"] as number | string | undefined) ??
        (obj["idConvocatoria"] as number | string | undefined) ??
        (obj["convocatoriaId"] as number | string | undefined) ??
        undefined;
      const id = parseId(idRaw);

      const nombre =
        (conv?.nombre as string | undefined) ??
        (conv as Record<string, unknown> | undefined)?.["nombre_convocatoria"] as string | undefined ??
        (conv as Record<string, unknown> | undefined)?.["numero_convocatoria"] as string | undefined ??
        (conv as Record<string, unknown> | undefined)?.["titulo"] as string | undefined ??
        (obj["nombre"] as string | undefined) ??
        (obj["titulo"] as string | undefined) ??
        (obj["nombre_convocatoria"] as string | undefined) ??
        (obj["titulo"] as string | undefined);

      if (!id && !nombre) return conv;
      return { id, nombre: nombre ?? conv?.nombre, estado: conv?.estado };
    };

    const resolveGroupConvocatoria = (obj: Record<string, unknown>): Convocatoria | undefined => {
      const conv = resolveConvocatoria(obj);
      if (conv?.id || conv?.nombre) return conv;
      const id =
        parseId(obj["convocatoria_id"]) ??
        parseId(obj["id_convocatoria"]) ??
        parseId(obj["id"]) ??
        undefined;
      const nombre =
        (obj["nombre_convocatoria"] as string | undefined) ??
        (obj["numero_convocatoria"] as string | undefined) ??
        (obj["nombre"] as string | undefined) ??
        (obj["titulo"] as string | undefined);
      if (!id && !nombre) return undefined;
      return { id, nombre: nombre ?? (id ? `Convocatoria ${id}` : "Sin convocatoria") };
    };

    if (typeof raw === "object" && raw !== null && "data" in (raw as Record<string, unknown>)) {
      return normalizeGroups((raw as { data?: unknown }).data);
    }

    const arr = Array.isArray(raw) ? raw : [];
    if (arr.length === 0) return [];

    if (arr[0]?.postulaciones) {
      return (arr as Array<{ convocatoria?: Convocatoria; postulaciones?: unknown[] }>).map((g) => {
        const convGroup =
          (g.convocatoria ? resolveConvocatoria(g.convocatoria as unknown as Record<string, unknown>) : undefined) ??
          (g.postulaciones && g.postulaciones[0] ? resolveConvocatoria(g.postulaciones[0] as Record<string, unknown>) : undefined);
        return {
          convocatoria: convGroup ?? undefined,
          postulaciones: (g.postulaciones ?? []).map((p: unknown) => {
            const obj = p as Record<string, unknown>;
            return {
              aspirante: (obj["aspirante"] as Aspirante) ?? (obj["usuarioPostulacion"] as Aspirante) ?? (obj["usuario_postulacion"] as Aspirante) ?? (obj["user"] as Aspirante) ?? (obj["usuario"] as Aspirante),
              convocatoria: resolveConvocatoria(obj),
              estado_postulacion: obj["estado_postulacion"] as string | undefined,
              postulacion_id: (obj["postulacion_id"] as number | undefined) ?? (obj["id_postulacion"] as number | undefined) ?? (obj["id"] as number | undefined),
              aval_coord_aprobado: obj["aval_coord_aprobado"] === true,
            } as PostulacionItem;
          }),
        };
      });
    }

    if (arr[0]?.postulantes || arr[0]?.aspirantes || arr[0]?.usuarios) {
      return (arr as Array<Record<string, unknown>>).map((g) => {
        const convGroup =
          resolveConvocatoria(g) ??
          (g["convocatoria"] ? resolveConvocatoria(g["convocatoria"] as Record<string, unknown>) : undefined) ??
          resolveGroupConvocatoria(g);
        const lista = (g["postulantes"] as unknown[]) ?? (g["aspirantes"] as unknown[]) ?? (g["usuarios"] as unknown[]) ?? [];
        const postulacionesMap = lista.map((p) => {
          const obj = p as Record<string, unknown>;
          return {
            aspirante: (obj["aspirante"] as unknown as Aspirante) ?? (obj["usuarioPostulacion"] as unknown as Aspirante) ?? (obj["usuario_postulacion"] as unknown as Aspirante) ?? (obj["user"] as unknown as Aspirante) ?? (obj["usuario"] as unknown as Aspirante) ?? (obj as unknown as Aspirante),
            convocatoria: resolveConvocatoria(obj) ?? convGroup,
            estado_postulacion: obj["estado_postulacion"] as string | undefined,
            postulacion_id: (obj["postulacion_id"] as number | undefined) ?? (obj["id_postulacion"] as number | undefined) ?? (obj["id"] as number | undefined),
          } as PostulacionItem;
        });
        return {
          convocatoria: convGroup,
          postulaciones: postulacionesMap,
        };
      });
    }

    if (arr[0]?.aspirante || arr[0]?.usuario || arr[0]?.user || arr[0]?.usuarioPostulacion || arr[0]?.usuario_postulacion) {
      const map = new Map<string, PostulacionesAgrupadas>();
      (arr as PostulacionItem[]).forEach((item) => {
        const aspirante = item.aspirante
          ?? (item as unknown as { usuarioPostulacion?: Aspirante; usuario_postulacion?: Aspirante }).usuarioPostulacion
          ?? (item as unknown as { usuarioPostulacion?: Aspirante; usuario_postulacion?: Aspirante }).usuario_postulacion
          ?? (item as unknown as { usuario?: Aspirante; user?: Aspirante }).usuario
          ?? (item as unknown as { user?: Aspirante }).user;
        const convocatoria = resolveConvocatoria(item as unknown as Record<string, unknown>)
          ?? item.convocatoria
          ?? (item as unknown as { convocatoriaPostulacion?: Convocatoria; convocatoria_postulacion?: Convocatoria }).convocatoriaPostulacion
          ?? (item as unknown as { convocatoriaPostulacion?: Convocatoria; convocatoria_postulacion?: Convocatoria }).convocatoria_postulacion;
        const id = convocatoria?.id;
        const nombre = convocatoria?.nombre;
        const key = id ? `id:${id}` : nombre ? `name:${nombre}` : "sin-convocatoria";
        const postulacion: PostulacionItem = {
          aspirante,
          convocatoria: convocatoria ?? { id: id || undefined, nombre: nombre ?? (id ? `Convocatoria ${id}` : "Sin convocatoria") },
          estado_postulacion: item.estado_postulacion ?? (item as Record<string, unknown>)["estado_postulacion"] as string | undefined,
          postulacion_id: (item as Record<string, unknown>)["postulacion_id"] as number | undefined
            ?? (item as Record<string, unknown>)["id_postulacion"] as number | undefined
            ?? (item as Record<string, unknown>)["id"] as number | undefined,
          aval_coord_aprobado: (item as Record<string, unknown>)["aval_coord_aprobado"] === true,
        };
        if (!map.has(key)) {
          map.set(key, { convocatoria: postulacion.convocatoria, postulaciones: [postulacion] });
        } else {
          map.get(key)!.postulaciones!.push(postulacion);
        }
      });
      return Array.from(map.values());
    }

    return [];
  }, []);

  const buildEstadoParams = useCallback(() => {
    if (estadoPostulacion === "Todas" || estadoPostulacion === "Aceptada") return undefined;
    return estadoPostulacion;
  }, [estadoPostulacion]);

  const handleAvalCoordinador = async (userId?: number, convocatoriaId?: number) => {
    if (!userId) {
      toast.error("No se pudo identificar el aspirante");
      return;
    }

    try {
      const payload: Record<string, unknown> = {};
      if (convocatoriaId) payload.convocatoria_id = convocatoriaId;
      const res = await axiosInstance.post(`/coordinador/aval-hoja-vida/${userId}`, payload);
      toast.success(res.data?.message ?? "Aval de Coordinador registrado");
      if (convocatoriaId) setAvalesCoordLocal((prev) => ({ ...prev, [`${convocatoriaId}_${userId}`]: true }));
      setPerfilCompleto((prev) => {
        if (!prev || prev.id !== userId) return prev;
        return {
          ...prev,
          avales: {
            ...(prev.avales ?? {}),
            coordinador: { estado: true },
          },
        };
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        if (status === 403) {
          toast.error("El aspirante no tiene aval de Talento Humano");
          return;
        }
        if (status === 409) {
          toast.info("El aval de Coordinador ya fue registrado");
          return;
        }
      }
      console.error("Error al registrar aval Coordinador", error);
      toast.error("No se pudo registrar el aval de Coordinador");
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
      await axiosInstance.post(`/coordinador/rechazar-aval/${rechazoUserId}`, payload);
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

  const fetchPostulaciones = useCallback(async () => {
    try {
      setLoading(true);
      const resConvocatorias = await axiosInstance.get("/coordinador/convocatorias", {
        params: {
          estado_postulacion: buildEstadoParams(),
        },
      });
      const gruposConvocatorias = normalizeGroups(resConvocatorias.data?.data ?? resConvocatorias.data ?? []);
      if (gruposConvocatorias.length > 0) {
        setPostulaciones(gruposConvocatorias);
        return;
      }

      const res = await axiosInstance.get("/coordinador/postulaciones", {
        params: {
          estado: "talento_humano_aprobado",
          estado_postulacion: buildEstadoParams(),
        },
      });
      const grupos = normalizeGroups(res.data?.data ?? res.data ?? []);
      if (grupos.length > 0) {
        setPostulaciones(grupos);
        return;
      }

      const resAspirantes = await axiosInstance.get("/coordinador/aspirantes", {
        params: {
          estado_postulacion: buildEstadoParams(),
        },
      });
      const gruposAspirantes = normalizeGroups(resAspirantes.data?.data ?? resAspirantes.data ?? []);
      if (gruposAspirantes.length > 0) {
        setPostulaciones(gruposAspirantes);
        return;
      }

      setPostulaciones([]);
    } catch (error) {
      console.error("Error al cargar postulaciones", error);
      toast.error("No se pudieron cargar los aspirantes aprobados por Talento Humano");
      setPostulaciones([]);
    } finally {
      setLoading(false);
    }
  }, [buildEstadoParams, normalizeGroups]);

  useEffect(() => {
    fetchPostulaciones();
  }, [fetchPostulaciones]);

  const gruposFiltrados = useMemo(() => {
    if (!search.trim()) return postulaciones;
    const q = search.toLowerCase();
    return postulaciones
      .map((g) => {
        const postulacionesFiltradas = (g.postulaciones ?? []).filter((p) => {
          if (estadoPostulacion !== "Todas" && p.estado_postulacion !== estadoPostulacion) return false;
          const a = p.aspirante;
          const nombre = `${a?.primer_nombre ?? ""} ${a?.segundo_nombre ?? ""} ${a?.primer_apellido ?? ""} ${a?.segundo_apellido ?? ""}`.toLowerCase();
          const id = (a?.numero_identificacion ?? "").toLowerCase();
          const email = (a?.email ?? "").toLowerCase();
          const conv = (g.convocatoria?.nombre ?? "").toLowerCase();
          return nombre.includes(q) || id.includes(q) || email.includes(q) || conv.includes(q);
        });
        return { ...g, postulaciones: postulacionesFiltradas };
      })
      .filter((g) => (g.postulaciones ?? []).length > 0);
  }, [postulaciones, search, estadoPostulacion]);

  const postulacionesModal = useMemo(() => {
    if (!modalConvocatoria) return [] as PostulacionItem[];
    const grupo = postulaciones.find(
      (g) => (g.convocatoria?.id ?? null) === (modalConvocatoria.id ?? null)
    );
    return grupo?.postulaciones ?? [];
  }, [postulaciones, modalConvocatoria]);

  const postulacionesModalFiltradas = useMemo(() => {
    let data = postulacionesModal;
    if (modalSearch.trim()) {
      const q = modalSearch.toLowerCase();
      data = data.filter((p) => {
        const a = p.aspirante;
        const nombre = `${a?.primer_nombre ?? ""} ${a?.segundo_nombre ?? ""} ${a?.primer_apellido ?? ""} ${a?.segundo_apellido ?? ""}`.toLowerCase();
        const id = (a?.numero_identificacion ?? "").toLowerCase();
        const email = (a?.email ?? "").toLowerCase();
        return nombre.includes(q) || id.includes(q) || email.includes(q);
      });
    }
    if (sortByPuntaje === 'desc') {
      data = data.slice().sort((a, b) => (b.aspirante?.puntaje_aspirante ?? 0) - (a.aspirante?.puntaje_aspirante ?? 0));
    }
    return data;
  }, [postulacionesModal, modalSearch, sortByPuntaje]);

  const totalModalPages = useMemo(() => {
    return Math.max(1, Math.ceil(postulacionesModalFiltradas.length / modalPageSize));
  }, [postulacionesModalFiltradas.length, modalPageSize]);

  const postulacionesModalPaginadas = useMemo(() => {
    const start = (modalPage - 1) * modalPageSize;
    return postulacionesModalFiltradas.slice(start, start + modalPageSize);
  }, [postulacionesModalFiltradas, modalPage, modalPageSize]);

  const postulacionesModalAgrupadas = useMemo(() => {
    const orden = ["Aceptada", "Enviada", "Faltan documentos", "Rechazada", "Sin estado"];
    const mapa = new Map<string, PostulacionItem[]>();
    postulacionesModalPaginadas.forEach((p) => {
      const categoria = p.estado_postulacion ?? "Sin estado";
      if (!mapa.has(categoria)) {
        mapa.set(categoria, [p]);
      } else {
        mapa.get(categoria)!.push(p);
      }
    });
    const ordenadas: Array<{ categoria: string; items: PostulacionItem[] }> = [];
    orden.forEach((cat) => {
      const items = mapa.get(cat);
      if (items && items.length > 0) {
        ordenadas.push({ categoria: cat, items });
      }
    });
    for (const [categoria, items] of mapa.entries()) {
      if (!orden.includes(categoria)) {
        ordenadas.push({ categoria, items });
      }
    }
    return ordenadas;
  }, [postulacionesModalPaginadas]);

  const cerrarModal = () => {
    setCerrandoModal(true);
    setTimeout(() => {
      setModalConvocatoria(null);
      setModalSearch("");
      setModalPage(1);
      setCerrandoModal(false);
    }, 200);
  };

  // Perfil completo del aspirante
  const verPerfilCompleto = async (userId: number, convocatoriaId?: number) => {
    setPerfilConvocatoriaId(convocatoriaId ?? null);
    setLoadingPerfil(true);
    // Fetch puntaje en paralelo
    axiosInstance.get(`/aspirante/${userId}/puntaje`)
      .then((r) => setPerfilPuntaje(r.data?.data?.total ?? r.data?.total ?? null))
      .catch(() => setPerfilPuntaje(null));
    try {
      const response = await axiosInstance.get(`/coordinador/aspirantes/${userId}`);
      let aspirante = response.data.aspirante ?? response.data?.data ?? response.data;
      try {
  const adminResp = await axiosInstance.get(`/admin/aspirantes/${userId}`);
  const adminData = adminResp.data.aspirante ?? adminResp.data?.data ?? adminResp.data;
  if (adminData) {
    aspirante = {
      ...aspirante,
      certificacion_bancaria: adminData.certificacion_bancaria,
      pension: adminData.pension,
      antecedente_judicial: adminData.antecedente_judicial,
      arl: adminData.arl,
    };
  }
} catch { /* si falla no pasa nada */ }
      if (!aspirante) {
        throw { response: { status: 404 } };
      }
      setPerfilCompleto(aspirante);
      setMostrarPerfilCompleto(true);
      setCerrandoPerfilCompleto(false);
      setLoadingPerfil(false);
      fetchDocsCategoria(userId, 'experiencias');
      fetchDocsCategoria(userId, 'estudios');
      fetchDocsCategoria(userId, 'idiomas');
      return;
    } catch (err: unknown) {
      let status: number | undefined;
      if (axios.isAxiosError(err) && err.response) {
        status = err.response.status;
      }

      if (status === 403 || status === 404) {
        try {
          const altResp = await axiosInstance.get(`/admin/aspirantes/${userId}`);
          const aspiranteAlt = altResp.data.aspirante ?? altResp.data?.data ?? altResp.data;
          if (aspiranteAlt) {
            setPerfilCompleto(aspiranteAlt);
            setMostrarPerfilCompleto(true);
            setCerrandoPerfilCompleto(false);
            setLoadingPerfil(false);
            return;
          }
        } catch (err2: unknown) {
          console.warn('Intento alternativo admin falló', err2);
        }
      }

      try {
        const alt2 = await axiosInstance.get(`/talento-humano/usuarios/${userId}`);
        const aspirante2 = alt2.data.aspirante ?? alt2.data?.data ?? alt2.data;
        if (aspirante2) {
          setPerfilCompleto(aspirante2);
          setMostrarPerfilCompleto(true);
          setCerrandoPerfilCompleto(false);
          setLoadingPerfil(false);
          return;
        }
      } catch (err3: unknown) {
        console.warn('Intento alternativo talento-humano falló', err3);
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

  const getBaseUrlNoApi = () => {
    const baseUrl = import.meta.env.VITE_API_URL ?? '';
    return baseUrl.replace(/\/api\/?$/, '');
  };

  const fetchDocsCategoria = async (userId: number, categoria: CategoriaDocs) => {
    try {
      const baseURL = import.meta.env.VITE_API_URL ?? '';
      const resp = await axiosInstance.get(`/coordinador/documentos/${userId}/${categoria}`, { baseURL });
      const docs = (resp.data?.data ?? resp.data?.documentos ?? resp.data) as DocumentoAdjunto[];
      setDocsPorCategoria((prev) => ({ ...prev, [categoria]: Array.isArray(docs) ? docs : [] }));
      return Array.isArray(docs) ? docs : [];
    } catch (error) {
      console.warn('No se pudieron cargar documentos por categoría', error);
      setDocsPorCategoria((prev) => ({ ...prev, [categoria]: [] }));
      return [];
    }
  };

  const handleDescargarHojaAspirante = async (userId: number) => {
    try {
      setLoadingPerfil(true);
      let response;
      try {
        response = await axiosInstance.get(`/coordinador/aspirantes/${userId}/hoja-vida-pdf`, { responseType: 'blob' });
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          response = await axiosInstance.get(`/admin/aspirantes/${userId}/hoja-vida-pdf`, { responseType: 'blob' });
        } else {
          throw error;
        }
      }
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

  const isAvalAprobado = (estado?: boolean | string | number) => {
    if (estado === true) return true;
    if (estado === false || estado === null || estado === undefined) return false;
    if (typeof estado === 'number') return estado === 1;
    const normalizado = String(estado).toLowerCase().trim();
    return normalizado === 'aprobado' || normalizado === 'true' || normalizado === '1' || normalizado === 'si' || normalizado === 'sí';
  };

  const getEstadoAvalTalentoHumano = (perfil: AspiranteDetallado) => {
    return (
      perfil.avales?.talentoHumano?.estado ??
      perfil.avales?.talento_humano?.estado ??
      perfil.aval_talento_humano
    );
  };

  const getEstadoAval = (perfil: AspiranteDetallado, tipo: 'coordinador' | 'vicerrectoria' | 'rectoria') => {
    if (tipo === 'coordinador') {
      return perfil.avales?.coordinador?.estado ?? perfil.aval_coordinador;
    }
    if (tipo === 'vicerrectoria') {
      return perfil.avales?.vicerrectoria?.estado ?? perfil.aval_vicerrectoria;
    }
    return perfil.avales?.rectoria?.estado ?? perfil.aval_rectoria;
  };

  const abrirDocumentoPorId = async (documentoId: number) => {
    try {
      const response = await axiosInstance.get(`/coordinador/ver-documento/${documentoId}`, { responseType: 'blob' });
      const fileURL = URL.createObjectURL(response.data);
      window.open(fileURL, '_blank');
    } catch (error) {
      console.error('No se pudo abrir el documento', error);
      toast.error('No se pudo abrir el documento');
    }
  };

  const handleAbrirDocumentoDeLista = (docs?: DocumentoAdjunto[]) => {
    const doc = docs?.find(d => resolverUrlDocumento(d)) ?? docs?.[0];
    const url = doc ? resolverUrlDocumento(doc) : null;
    if (url) {
      handleAbrirDocumento(url);
      return;
    }

    if (doc?.id_documento) {
      void abrirDocumentoPorId(doc.id_documento);
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
        await abrirDocumentoPorId(docGeneral.id);
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

  const abrirModalEvaluacion = (p: PostulacionItem) => {
    setEvaluando(p);
    setAprobado(false);
    setPruebaPsicotecnica("");
    setValidacionArchivos(false);
    setClaseOrganizada(false);
    setObservaciones("");

    setNucleoFamiliar("");
    setCompetencias("");
    setOportunidadesMejora("");
    setAspiracionesLaborales("");
    setTituloPregrado("");
    setTitulosPosgrado("");
    setExperienciasRelevantes("");
    setConocimientosEspecificos("");
    setHerramientasTIC("");
    setOpcionDocencia("");
    setContinuaProceso(true);
    setRazonContinua("");
    setMetodologia("");
    setDominioTecnico("");
    setExpresionOral("");
    setPresentacionPersonal("");
    setConceptoGeneral("");
    setSugerirContratacion(true);

    setCerrandoModalEvaluacion(false);
    setModalEvaluacionOpen(true);
  };

  const cerrarModalEvaluacion = () => {
    setCerrandoModalEvaluacion(true);
    setTimeout(() => {
      setModalEvaluacionOpen(false);
      setEvaluando(null);
      setCerrandoModalEvaluacion(false);
    }, 200);
  };

  const guardarEvaluacion = async () => {
    if (!evaluando?.aspirante?.id) {
      toast.error("No hay aspirante seleccionado para evaluar");
      return;
    }

    const formulario = [
      { seccion: "Información personal", campo: "Composición del núcleo familiar", valor: nucleoFamiliar },
      { seccion: "Información personal", campo: "Competencias, habilidades y destrezas", valor: competencias },
      { seccion: "Información personal", campo: "Oportunidades de mejora", valor: oportunidadesMejora },
      { seccion: "Información personal", campo: "Aspiraciones laborales", valor: aspiracionesLaborales },

      { seccion: "Competencias técnicas", campo: "Título pregrado", valor: tituloPregrado },
      { seccion: "Competencias técnicas", campo: "Títulos de posgrado", valor: titulosPosgrado },
      { seccion: "Competencias técnicas", campo: "Experiencias laborales relevantes", valor: experienciasRelevantes },
      { seccion: "Competencias técnicas", campo: "Conocimientos específicos o esenciales", valor: conocimientosEspecificos },
      { seccion: "Competencias técnicas", campo: "Herramientas TIC", valor: herramientasTIC },
      { seccion: "Competencias técnicas", campo: "Opción por la docencia", valor: opcionDocencia },
      { seccion: "Competencias técnicas", campo: "¿Continúa en el proceso?", valor: continuaProceso ? "Sí" : "No" },
      { seccion: "Competencias técnicas", campo: "Razón", valor: razonContinua },

      { seccion: "Experiencia práctica", campo: "Metodología", valor: metodologia },
      { seccion: "Experiencia práctica", campo: "Dominio técnico", valor: dominioTecnico },
      { seccion: "Experiencia práctica", campo: "Expresión oral", valor: expresionOral },
      { seccion: "Experiencia práctica", campo: "Presentación personal", valor: presentacionPersonal },

      { seccion: "Conclusión", campo: "Concepto general", valor: conceptoGeneral },
      { seccion: "Conclusión", campo: "Sugerir contratación", valor: sugerirContratacion ? "Sí" : "No" },
    ];

    const payload = {
      aspirante_user_id: evaluando.aspirante.id,
      prueba_psicotecnica: pruebaPsicotecnica || null,
      validacion_archivos: validacionArchivos,
      clase_organizada: claseOrganizada,
      aprobado,
      formulario,
      observaciones: observaciones || null,
    };

    try {
      const res = await axiosInstance.post("/coordinador/evaluaciones", payload);
      toast.success(res.data?.message ?? "Evaluación registrada");
      cerrarModalEvaluacion();
    } catch (error) {
      console.error("Error al guardar evaluación", error);
      toast.error("No se pudo guardar la evaluación");
    }
  };

  return (
    <>
    <div className="flex flex-col gap-4 min-h-screen w-full max-w-6xl mx-auto bg-[#f3ede1] rounded-3xl p-8">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1e3a5f]">Aspirantes aprobados por TH</h1>
          <p className="text-[#6b7a8d]">Organizados por convocatoria.</p>
        </div>
        <button
          onClick={fetchPostulaciones}
          className="px-3 py-2 rounded-lg bg-[#ffffff] border border-[rgba(30,58,95,0.09)] text-[#1e3a5f] hover:bg-[#f0e8dd]"
        >
          Actualizar
        </button>
      </div>

      <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-semibold text-[#1e3a5f]">Estado de postulación</label>
          <select
            value={estadoPostulacion}
            onChange={(e) => setEstadoPostulacion(e.target.value as "Todas" | "Enviada" | "Aceptada" | "Rechazada" | "Faltan documentos")}
            className="w-full mt-1 p-2 border border-[rgba(30,58,95,0.2)] rounded-lg bg-[#ffffff] text-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]"
          >
            <option value="Todas">Todas</option>
            <option value="Enviada">Enviada</option>
            <option value="Aceptada">Aceptada</option>
            <option value="Rechazada">Rechazada</option>
            <option value="Faltan documentos">Faltan documentos</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-semibold text-[#1e3a5f]">Buscar</label>
          <InputSearch
            type="text"
            placeholder="Nombre, identificación, correo o convocatoria"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full mt-1"
          />
        </div>
      </div>

      {loading ? (
        <div className="py-10 text-center text-[#6b7a8d]">Cargando aspirantes...</div>
      ) : gruposFiltrados.length === 0 ? (
        <div className="py-10 text-center text-[#6b7a8d]">No hay aspirantes con los filtros actuales.</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {gruposFiltrados.map((g) => {
            const conv = g.convocatoria;
            const postulacionesCount = g.postulaciones?.length ?? 0;

            return (
              <div key={conv?.id ?? "sin-convocatoria"} className="border border-[rgba(30,58,95,0.09)] rounded-2xl p-5 shadow-sm bg-[#ffffff]">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-[#1e3a5f]">{conv?.nombre ?? "Sin convocatoria"}</h3>
                    <p className="text-sm text-[#6b7a8d]">{postulacionesCount} aspirante(s)</p>
                  </div>
                  <button
                    onClick={() => {
                      setCerrandoModal(false);
                      setModalSearch("");
                      setModalPage(1);
                      setModalConvocatoria({ id: conv?.id, nombre: conv?.nombre ?? "Sin convocatoria" });
                    }}
                    className="text-sm px-3 py-2 rounded-lg bg-[#1e3a5f] text-[#ffffff] hover:bg-[#2c3e50]"
                  >
                    Ver aspirantes
                  </button>
                </div>

                <div className="mt-4">
                  <div className="text-sm text-[#6b7a8d]">
                    Haz clic en "Ver aspirantes" para visualizar el listado completo.
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modalConvocatoria && (
        <div className={`modal-overlay fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto ${cerrandoModal ? "modal-exit" : ""}`}>
          <div className={`modal-content bg-[#f3ede1] rounded-xl shadow-2xl w-full max-w-7xl my-2 ${cerrandoModal ? "modal-exit" : ""}`}>
            <div className="flex items-center justify-between p-5 border-b border-[rgba(30,58,95,0.09)]">
              <div>
                <h2 className="text-xl font-bold text-[#1e3a5f]">Aspirantes - {modalConvocatoria.nombre}</h2>
                <p className="text-sm text-[#6b7a8d]">{postulacionesModal.length} aspirante(s)</p>
              </div>
              <button
                onClick={cerrarModal}
                className="text-[#6b7a8d] hover:text-[#1e3a5f] p-2 rounded-lg"
                aria-label="Cerrar modal"
              >
                <X size={22} />
              </button>
            </div>

            <div className="p-5 max-h-[calc(100vh-100px)] overflow-y-auto bg-[#ffffff]">
              {postulacionesModal.length === 0 ? (
                <div className="text-center text-[#6b7a8d] py-10">No hay aspirantes para esta convocatoria.</div>
              ) : (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="w-full sm:max-w-md">
                      <InputSearch
                        type="text"
                        placeholder="Buscar aspirante por nombre, identificación o correo"
                        value={modalSearch}
                        onChange={(e) => {
                          setModalSearch(e.target.value);
                          setModalPage(1);
                        }}
                        className="w-full"
                      />
                    </div>
                    <div className="text-xs text-[#6b7a8d]">
                      {postulacionesModalFiltradas.length} aspirante(s) • Página {modalPage} de {totalModalPages}
                    </div>
                    <button
                      onClick={() => setSortByPuntaje(sortByPuntaje === 'desc' ? null : 'desc')}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                        sortByPuntaje === 'desc'
                          ? 'bg-[#e8740e] text-[#ffffff] border-[#e8740e]'
                          : 'bg-[#ffffff] text-[#1e3a5f] border-[rgba(30,58,95,0.09)] hover:bg-[#f0e8dd]'
                      }`}
                    >
                      {sortByPuntaje === 'desc' ? '★ Puntaje ↓' : '★ Por Puntaje'}
                    </button>
                  </div>

                  {postulacionesModalAgrupadas.map((grupo) => (
                    <div key={grupo.categoria} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-[#1e3a5f]">{grupo.categoria}</h3>
                        <span className="text-xs text-[#6b7a8d]">{grupo.items.length} aspirante(s)</span>
                      </div>
                      {grupo.items.map((p) => {
                        const avaladoCoord = p.aspirante?.id ? (avalesCoordLocal[`${p.convocatoria?.id}_${p.aspirante.id}`] || p.aval_coord_aprobado === true) : false;
                        return (
                          <div key={p.postulacion_id ?? `${p.aspirante?.id}-${p.convocatoria?.id}`} className="border border-[rgba(30,58,95,0.09)] rounded-xl p-4 bg-[#ffffff] shadow-sm">
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                              <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-full bg-[#f3ede1] flex items-center justify-center text-[#1e3a5f]">
                                  <User size={18} />
                                </div>
                                <div>
                                  <h3 className="font-semibold text-[#1e3a5f]">
                                    {p.aspirante?.primer_nombre} {p.aspirante?.primer_apellido}
                                  </h3>
                                  <div className="text-sm text-[#6b7a8d]">
                                    {p.aspirante?.numero_identificacion} • {p.aspirante?.email}
                                  </div>
                                  {p.aspirante?.puntaje_aspirante != null && (
                                    <span className="inline-block mt-1 text-xs font-bold px-2 py-0.5 rounded-full bg-[#f3ede1] text-[#e8740e]" title="Puntaje de aptitud">
                                      ★ {p.aspirante.puntaje_aspirante} pts
                                    </span>
                                  )}
                                  <div className="mt-1 flex flex-wrap gap-2">
                                    <span className="text-xs px-2 py-1 rounded-full bg-[#e8f5e9] text-[#2e7d32]">TH aprobado</span>
                                    {avaladoCoord && (
                                      <span className="text-xs px-2 py-1 rounded-full bg-[#c8e6c9] text-[#1b5e20]">Aval Coordinación</span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="text-sm text-[#6b7a8d]">
                                Estado postulación: <span className="font-semibold">{p.estado_postulacion ?? "Enviada"}</span>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                <button
                                  onClick={() => p.aspirante?.id && verPerfilCompleto(p.aspirante.id, p.convocatoria?.id)}
                                  className="inline-flex items-center gap-2 bg-[#ffffff] text-[#1e3a5f] border border-[rgba(30,58,95,0.2)] hover:bg-[#f0e8dd] px-3 py-2 rounded-md shadow-sm text-sm"
                                >
                                  <User size={14} />
                                  <span>Ver perfil</span>
                                </button>
                                <button
                                  onClick={() => abrirModalEvaluacion(p)}
                                  className="inline-flex items-center gap-2 bg-[#1e3a5f] text-[#ffffff] px-3 py-2 rounded-md hover:bg-[#2c3e50] shadow text-sm"
                                >
                                  Crear evaluación
                                </button>
                                <button
                                  onClick={() => {
                                    if (p.aspirante?.id) {
                                      handleVerEvaluacion(p.aspirante.id);
                                    }
                                  }}
                                  disabled={!p.aspirante?.id}
                                  className="inline-flex items-center gap-2 bg-[#ffffff] text-[#1e3a5f] border border-[rgba(30,58,95,0.2)] hover:bg-[#f0e8dd] px-3 py-2 rounded-md shadow-sm text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  Ver evaluación
                                </button>
                                      {/* Modal para ver evaluación existente */}
                                      {modalVerEvaluacionOpen && (
                                        <div className={`modal-overlay fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto`}>
                                          <div className="modal-content bg-[#ffffff] rounded-xl shadow-2xl w-full max-w-3xl my-8">
                                            <div className="flex items-center justify-between p-5 border-b border-[rgba(30,58,95,0.09)]">
                                              <div>
                                                <h2 className="text-xl font-bold text-[#1e3a5f]">Evaluación registrada</h2>
                                              </div>
                                              <button
                                                onClick={cerrarModalVerEvaluacion}
                                                className="text-[#6b7a8d] hover:text-[#1e3a5f] p-2 rounded-lg"
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
                                                  <div className="bg-[#f3ede1] p-4 rounded-lg border border-[rgba(30,58,95,0.09)]">
                                                    <h3 className="text-lg font-semibold text-[#1e3a5f] mb-3 flex items-center gap-2">
                                                      <CheckCircle className="w-5 h-5" />
                                                      Estado de la Evaluación
                                                    </h3>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                      <div className={`p-3 rounded-lg ${evaluacionExistente.aprobado ? 'bg-[#c8e6c9] text-[#1b5e20]' : 'bg-[#ffcccc] text-[#c62828]'}`}>
                                                        <div className="font-semibold">Resultado</div>
                                                        <div className="text-lg">{evaluacionExistente.aprobado ? 'Aprobado ✓' : 'No aprobado ✗'}</div>
                                                      </div>
                                                      <div className="bg-[#ffffff] p-3 rounded-lg border border-[rgba(30,58,95,0.09)]">
                                                        <div className="font-semibold text-[#1e3a5f]">Prueba psicotécnica</div>
                                                        <div className="text-[#6b7a8d]">{evaluacionExistente.prueba_psicotecnica || 'No especificada'}</div>
                                                      </div>
                                                    </div>
                                                  </div>

                                                  {/* Validaciones */}
                                                  <div className="bg-[#ffffff] p-4 rounded-lg border border-[rgba(30,58,95,0.09)]">
                                                    <h3 className="text-lg font-semibold text-[#1e3a5f] mb-3 flex items-center gap-2">
                                                      <FileText className="w-5 h-5" />
                                                      Validaciones
                                                    </h3>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                      <div className="flex items-center gap-2">
                                                        <div className={`w-3 h-3 rounded-full ${evaluacionExistente.validacion_archivos ? 'bg-[#4caf50]' : 'bg-[#f44336]'}`}></div>
                                                        <span className="text-[#1e3a5f]">Validación de archivos</span>
                                                        <span className="text-sm text-[#6b7a8d]">({evaluacionExistente.validacion_archivos ? 'Aprobado' : 'Pendiente'})</span>
                                                      </div>
                                                      <div className="flex items-center gap-2">
                                                        <div className={`w-3 h-3 rounded-full ${evaluacionExistente.clase_organizada ? 'bg-[#4caf50]' : 'bg-[#f44336]'}`}></div>
                                                        <span className="text-[#1e3a5f]">Clase organizada</span>
                                                        <span className="text-sm text-[#6b7a8d]">({evaluacionExistente.clase_organizada ? 'Sí' : 'No'})</span>
                                                      </div>
                                                    </div>
                                                  </div>

                                                  {/* Formulario organizado por secciones */}
                                                  {evaluacionExistente.formulario && Array.isArray(evaluacionExistente.formulario) && evaluacionExistente.formulario.length > 0 && (
                                                    <div className="bg-[#ffffff] border border-[rgba(30,58,95,0.09)] rounded-lg p-4">
                                                      <h3 className="text-lg font-semibold text-[#1e3a5f] mb-4 flex items-center gap-2">
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
                                                            <h4 className="font-medium text-[#1e3a5f] mb-2 pb-1 border-b border-[rgba(30,58,95,0.09)]">{seccion}</h4>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                              {items.map((item, idx) => (
                                                                <div key={idx} className="bg-[#f3ede1] p-3 rounded">
                                                                  <div className="font-medium text-sm text-[#6b7a8d]">{item.campo}</div>
                                                                  <div className="text-[#1e3a5f] mt-1">{item.valor || 'No especificado'}</div>
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
                                                    <div className="bg-[#fff9c4] border border-[#fbc02d] p-4 rounded-lg">
                                                      <h3 className="text-lg font-semibold text-[#f57c00] mb-2 flex items-center gap-2">
                                                        <Award className="w-5 h-5" />
                                                        Observaciones
                                                      </h3>
                                                      <p className="text-[#e8740e] whitespace-pre-wrap">{evaluacionExistente.observaciones}</p>
                                                    </div>
                                                  )}

                                                  {/* Información del registro */}
                                                  <div className="bg-[#f3ede1] p-4 rounded-lg border border-[rgba(30,58,95,0.09)]">
                                                    <h3 className="text-lg font-semibold text-[#1e3a5f] mb-3 flex items-center gap-2">
                                                      <Globe className="w-5 h-5" />
                                                      Información del Registro
                                                    </h3>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                      <div>
                                                        <span className="font-medium text-[#6b7a8d]">Creada:</span>
                                                        <div className="text-[#1e3a5f]">{evaluacionExistente.created_at ? new Date(evaluacionExistente.created_at).toLocaleString('es-ES') : '-'}</div>
                                                      </div>
                                                      <div>
                                                        <span className="font-medium text-[#6b7a8d]">Última actualización:</span>
                                                        <div className="text-[#1e3a5f]">{evaluacionExistente.updated_at ? new Date(evaluacionExistente.updated_at).toLocaleString('es-ES') : '-'}</div>
                                                      </div>
                                                    </div>
                                                  </div>

                                                  {/* Plantilla asociada */}
                                                  {plantillaEvaluacion && (
                                                    <div className="bg-[#e3f2fd] border border-[rgba(30,58,95,0.2)] p-4 rounded-lg">
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
                                              <button onClick={cerrarModalVerEvaluacion} className="px-4 py-2 rounded-lg bg-[#f3ede1] text-[#1e3a5f] border border-[rgba(30,58,95,0.09)]">Cerrar</button>
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                {!avaladoCoord && (
                                  <button
                                    onClick={() => handleAvalCoordinador(p.aspirante?.id, p.convocatoria?.id)}
                                    className="inline-flex items-center gap-2 bg-[#4caf50] text-[#ffffff] px-3 py-2 rounded-md hover:bg-[#45a049] shadow text-sm"
                                  >
                                    Dar aval Coordinador
                                  </button>
                                )}
                                {p.aspirante?.id && (
                                  <button
                                    onClick={() => handleRechazarAval(p.aspirante!.id, p.convocatoria?.id)}
                                    className="inline-flex items-center gap-2 bg-[#f44336] text-[#ffffff] px-3 py-2 rounded-md hover:bg-[#da190b] shadow text-sm"
                                  >
                                    <XCircle size={14} />
                                    Rechazar
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))}

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-[rgba(30,58,95,0.09)]">
                    <button
                      onClick={() => setModalPage((p) => Math.max(1, p - 1))}
                      disabled={modalPage <= 1}
                      className="px-3 py-2 rounded-lg bg-[#f3ede1] text-[#1e3a5f] text-sm disabled:opacity-50"
                    >
                      Anterior
                    </button>
                    <div className="text-xs text-[#6b7a8d]">
                      Página {modalPage} de {totalModalPages}
                    </div>
                    <button
                      onClick={() => setModalPage((p) => Math.min(totalModalPages, p + 1))}
                      disabled={modalPage >= totalModalPages}
                      className="px-3 py-2 rounded-lg bg-[#f3ede1] text-[#1e3a5f] text-sm disabled:opacity-50"
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
          <div className={`modal-content bg-[#ffffff] rounded-xl shadow-2xl w-full max-w-5xl mx-auto my-4 sm:my-8 ${cerrandoPerfilCompleto ? "modal-exit" : ""}`}>
            <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2c3e50] text-white p-4 sm:p-6 rounded-t-xl">
              <div className="flex justify-between items-start gap-2">
                <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
                  {perfilCompleto.datos_personales.foto_perfil_url ? (
                    <img
                      src={perfilCompleto.datos_personales.foto_perfil_url}
                      alt="Foto"
                      className="w-14 h-14 sm:w-20 sm:h-20 rounded-full object-cover border-4 border-white shadow-lg shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-[#e8740e] flex items-center justify-center border-4 border-white shadow-lg shrink-0">
                      <User size={32} />
                    </div>
                  )}
                  <div className="min-w-0">
                    <h2 className="text-lg sm:text-2xl font-bold break-words leading-tight">
                      {perfilCompleto.datos_personales.primer_nombre} {perfilCompleto.datos_personales.segundo_nombre || ''} {perfilCompleto.datos_personales.primer_apellido} {perfilCompleto.datos_personales.segundo_apellido || ''}
                    </h2>
                    <p className="text-blue-100 mt-1 text-sm">
                      {perfilCompleto.datos_personales.tipo_identificacion}: {perfilCompleto.datos_personales.numero_identificacion}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2 text-sm">
                      <span className="flex items-center gap-1 break-all">
                        <Mail size={14} className="shrink-0" />
                        {perfilCompleto.datos_personales.email}
                      </span>
                    </div>
                    {perfilPuntaje != null && (
                      <div className="mt-3 inline-flex items-center gap-2 bg-[#e8740e]/20 border border-[#e8740e]/50 rounded-xl px-4 py-2">
                        <span className="text-[#e8740e] text-lg">★</span>
                        <div>
                          <p className="text-xs text-gray-200 font-medium uppercase tracking-wide">Puntaje de aptitud</p>
                          <p className="text-2xl font-bold text-white leading-none">{perfilPuntaje} <span className="text-sm font-normal text-gray-300">pts</span></p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <button onClick={cerrarPerfilCompleto} className="text-white hover:bg-[#2c3e50] p-2 rounded-lg shrink-0">
                  <X size={24} />
                </button>
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                <button
                  onClick={() => handleDescargarHojaAspirante(perfilCompleto.id)}
                  disabled={loadingPerfil}
                  className={`bg-white text-[#1e3a5f] px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 ${loadingPerfil ? 'opacity-60 cursor-not-allowed' : 'hover:bg-gray-100'}`}
                >
                  {loadingPerfil ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
                  Descargar Hoja de Vida
                </button>
                <button
                  onClick={() => setIaOpen(true)}
                  className="bg-[#e8740e] hover:bg-[#c2600b] text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2"
                >
                  <Sparkles size={16} />
                  Asistente IA
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6 max-h-[65vh] sm:max-h-[calc(100vh-250px)] overflow-y-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-[#f3ede1] p-4 rounded-lg">
                  <h3 className="text-lg font-bold text-[#1e3a5f] mb-3 flex items-center gap-2">
                    <User size={20} className="text-[#e8740e]" />
                    Datos Personales
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <span className="font-semibold text-[#6b7a8d]">Género:</span>
                      <span className="text-[#1e3a5f]">{perfilCompleto.datos_personales.genero}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <span className="font-semibold text-[#6b7a8d]">Fecha Nacimiento:</span>
                      <span className="text-[#1e3a5f]">{perfilCompleto.datos_personales.fecha_nacimiento}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <span className="font-semibold text-[#6b7a8d]">Estado Civil:</span>
                      <span className="text-[#1e3a5f]">{perfilCompleto.datos_personales.estado_civil}</span>
                    </div>
                    {perfilCompleto.datos_personales.municipio && (
                      <div className="grid grid-cols-2 gap-2">
                        <span className="font-semibold text-[#6b7a8d]">Ubicación:</span>
                        <span className="text-[#1e3a5f]">{perfilCompleto.datos_personales.municipio}, {perfilCompleto.datos_personales.departamento}</span>
                      </div>
                    )}
                  </div>
                </div>

                {perfilCompleto.informacion_contacto && (
                  <div className="bg-[#f3ede1] p-4 rounded-lg">
                    <h3 className="text-lg font-bold text-[#1e3a5f] mb-3 flex items-center gap-2">
                      <Phone size={20} className="text-[#e8740e]" />
                      Contacto
                    </h3>
                    <div className="space-y-2 text-sm">
                      {perfilCompleto.informacion_contacto.telefono && (
                        <div className="grid grid-cols-2 gap-2">
                          <span className="font-semibold text-[#6b7a8d]">Teléfono:</span>
                          <span className="text-[#1e3a5f]">{perfilCompleto.informacion_contacto.telefono}</span>
                        </div>
                      )}
                      {perfilCompleto.informacion_contacto.celular && (
                        <div className="grid grid-cols-2 gap-2">
                          <span className="font-semibold text-[#6b7a8d]">Celular:</span>
                          <span className="text-[#1e3a5f]">{perfilCompleto.informacion_contacto.celular}</span>
                        </div>
                      )}
                      {perfilCompleto.informacion_contacto.direccion && (
                        <div className="grid grid-cols-2 gap-2">
                          <span className="font-semibold text-[#6b7a8d]">Dirección:</span>
                          <span className="text-[#1e3a5f]">{perfilCompleto.informacion_contacto.direccion}</span>
                        </div>
                      )}
                      {perfilCompleto.informacion_contacto.barrio && (
                        <div className="grid grid-cols-2 gap-2">
                          <span className="font-semibold text-[#6b7a8d]">Barrio:</span>
                          <span className="text-[#1e3a5f]">{perfilCompleto.informacion_contacto.barrio}</span>
                        </div>
                      )}
                      {perfilCompleto.informacion_contacto.correo_alterno && (
                        <div className="grid grid-cols-2 gap-2">
                          <span className="font-semibold text-[#6b7a8d]">Correo Alterno:</span>
                          <span className="break-all text-[#1e3a5f]">{perfilCompleto.informacion_contacto.correo_alterno}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {(perfilCompleto.eps || perfilCompleto.rut) && (
                  <div className="bg-[#f3ede1] p-4 rounded-lg">
                    <h3 className="text-lg font-bold text-[#1e3a5f] mb-3">Info Adicional</h3>
                    <div className="space-y-2">
                      {perfilCompleto.eps?.nombre_eps && (
                        <button
                          type="button"
                          onClick={() => handleAbrirDocumentoDeLista(perfilCompleto.eps!.documentosEps)}
                          className="bg-[#ffffff] p-3 rounded border border-[rgba(30,58,95,0.09)] text-left w-full hover:bg-[#e8f5e9] transition-colors cursor-pointer text-sm"
                        >
                          <div className="grid grid-cols-2 gap-2">
                            <span className="font-semibold text-[#6b7a8d]">EPS:</span>
                            <span className="text-[#1e3a5f]">{perfilCompleto.eps.nombre_eps}</span>
                          </div>
                          {perfilCompleto.eps.tipo_afiliacion && (
                            <div className="grid grid-cols-2 gap-2 mt-1">
                              <span className="font-semibold text-[#6b7a8d]">Tipo:</span>
                              <span className="text-[#1e3a5f]">{perfilCompleto.eps.tipo_afiliacion}</span>
                            </div>
                          )}
                          {perfilCompleto.eps.estado_afiliacion && (
                            <div className="grid grid-cols-2 gap-2 mt-1">
                              <span className="font-semibold text-[#6b7a8d]">Estado:</span>
                              <span className="text-[#1e3a5f]">{perfilCompleto.eps.estado_afiliacion}</span>
                            </div>
                          )}
                        </button>
                      )}
                      {perfilCompleto.rut?.numero_rut && (
                        <button
                          type="button"
                          onClick={() => handleAbrirDocumentoDeLista(perfilCompleto.rut!.documentosRut)}
                          className="bg-[#ffffff] p-3 rounded border border-[rgba(30,58,95,0.09)] text-left w-full hover:bg-[#e8f5e9] transition-colors cursor-pointer text-sm"
                        >
                          <div className="grid grid-cols-2 gap-2">
                            <span className="font-semibold text-[#6b7a8d]">RUT:</span>
                            <span className="text-[#1e3a5f]">{perfilCompleto.rut.numero_rut}</span>
                          </div>
                          {perfilCompleto.rut.razon_social && (
                            <div className="grid grid-cols-2 gap-2 mt-1">
                              <span className="font-semibold text-[#6b7a8d]">Razón social:</span>
                              <span className="text-[#1e3a5f]">{perfilCompleto.rut.razon_social}</span>
                            </div>
                          )}
                          {perfilCompleto.rut.tipo_persona && (
                            <div className="grid grid-cols-2 gap-2 mt-1">
                              <span className="font-semibold text-[#6b7a8d]">Tipo persona:</span>
                              <span className="text-[#1e3a5f]">{perfilCompleto.rut.tipo_persona}</span>
                            </div>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                )}

                <div className="bg-[#f3ede1] p-4 rounded-lg">
                  <h3 className="text-lg font-bold text-[#1e3a5f] mb-3 flex items-center gap-2">
                    <Award size={20} className="text-[#e8740e]" />
                    Avales
                  </h3>
                  <div className="space-y-3">
                    <div className={`flex items-center justify-between p-2 rounded ${isAvalAprobado(getEstadoAvalTalentoHumano(perfilCompleto)) ? 'bg-[#c8e6c9]' : 'bg-[#fff3e0]'}`}>
                      <span className="font-semibold text-sm text-[#1e3a5f]">Talento Humano</span>
                      <span className={`text-sm flex items-center gap-1 ${isAvalAprobado(getEstadoAvalTalentoHumano(perfilCompleto)) ? 'text-[#2e7d32]' : 'text-[#f57c00]'}`}>
                        {isAvalAprobado(getEstadoAvalTalentoHumano(perfilCompleto)) ? (<><CheckCircle size={16} /> Aprobado</>) : (<><XCircle size={16} /> Pendiente</>) }
                      </span>
                    </div>
                    <div className={`flex items-center justify-between p-2 rounded ${isAvalAprobado(getEstadoAval(perfilCompleto, 'coordinador')) || avalesCoordLocal[`${perfilConvocatoriaId}_${perfilCompleto.id}`] ? 'bg-[#c8e6c9]' : 'bg-[#fff3e0]'}`}>
                      <span className="font-semibold text-sm text-[#1e3a5f]">Evaluación</span>
                      <span className={`text-sm flex items-center gap-1 ${isAvalAprobado(getEstadoAval(perfilCompleto, 'coordinador')) || avalesCoordLocal[`${perfilConvocatoriaId}_${perfilCompleto.id}`] ? 'text-[#2e7d32]' : 'text-[#f57c00]'}`}>
                        {isAvalAprobado(getEstadoAval(perfilCompleto, 'coordinador')) || avalesCoordLocal[`${perfilConvocatoriaId}_${perfilCompleto.id}`] ? (<><CheckCircle size={16} /> Aprobado</>) : (<><XCircle size={16} /> Pendiente</>) }
                      </span>
                    </div>
                    <div className={`flex items-center justify-between p-2 rounded ${isAvalAprobado(getEstadoAval(perfilCompleto, 'rectoria')) ? 'bg-[#c8e6c9]' : 'bg-[#fff3e0]'}`}>
                      <span className="font-semibold text-sm text-[#1e3a5f]">Rectoría</span>
                      <span className={`text-sm flex items-center gap-1 ${isAvalAprobado(getEstadoAval(perfilCompleto, 'rectoria')) ? 'text-[#2e7d32]' : 'text-[#f57c00]'}`}>
                        {isAvalAprobado(getEstadoAval(perfilCompleto, 'rectoria')) ? (<><CheckCircle size={16} /> Aprobado</>) : (<><XCircle size={16} /> Pendiente</>) }
                      </span>
                    </div>
                    <div className={`flex items-center justify-between p-2 rounded ${isAvalAprobado(getEstadoAval(perfilCompleto, 'vicerrectoria')) ? 'bg-[#c8e6c9]' : 'bg-[#fff3e0]'}`}>
                      <span className="font-semibold text-sm text-[#1e3a5f]">Vicerrectoría</span>
                      <span className={`text-sm flex items-center gap-1 ${isAvalAprobado(getEstadoAval(perfilCompleto, 'vicerrectoria')) ? 'text-[#2e7d32]' : 'text-[#f57c00]'}`}>
                        {isAvalAprobado(getEstadoAval(perfilCompleto, 'vicerrectoria')) ? (<><CheckCircle size={16} /> Aprobado</>) : (<><XCircle size={16} /> Pendiente</>)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {perfilCompleto.experiencias && perfilCompleto.experiencias.length > 0 && (
                <div className="mt-6 bg-[#f3ede1] p-4 rounded-lg">
                  <h3 className="text-lg font-bold text-[#1e3a5f] mb-3 flex items-center gap-2">
                    <Briefcase size={20} className="text-[#e8740e]" />
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
                        className="bg-[#ffffff] p-4 rounded border border-[rgba(30,58,95,0.09)] text-left hover:bg-[#f0e8dd] transition-colors cursor-pointer"
                      >
                        <h4 className="font-bold text-[#1e3a5f]">{exp.cargo}</h4>
                        <p className="text-sm text-[#6b7a8d]">{exp.empresa}</p>
                        <p className="text-xs text-[#6b7a8d] mt-1">
                          {exp.fecha_inicio} - {exp.fecha_fin || 'Actualidad'}
                        </p>
                        {exp.descripcion && <p className="text-sm mt-2 text-[#1e3a5f]">{exp.descripcion}</p>}
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

              {perfilCompleto.estudios && perfilCompleto.estudios.length > 0 && (
                <div className="mt-6 bg-[#f3ede1] p-4 rounded-lg">
                  <h3 className="text-lg font-bold text-[#1e3a5f] mb-3 flex items-center gap-2">
                    <GraduationCap size={20} className="text-[#e8740e]" />
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
                        className="bg-[#ffffff] p-4 rounded border border-[rgba(30,58,95,0.09)] text-left hover:bg-[#f0e8dd] transition-colors cursor-pointer"
                      >
                        <h4 className="font-bold text-[#1e3a5f]">{est.titulo}</h4>
                        <p className="text-sm text-[#6b7a8d]">{est.institucion}</p>
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

              {perfilCompleto.idiomas && perfilCompleto.idiomas.length > 0 && (
                <div className="mt-6 bg-[#f3ede1] p-4 rounded-lg">
                  <h3 className="text-lg font-bold text-[#1e3a5f] mb-3 flex items-center gap-2">
                    <Globe size={20} className="text-[#e8740e]" />
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
                        className="bg-[#ffffff] p-4 rounded border border-[rgba(30,58,95,0.09)] text-left hover:bg-[#f0e8dd] transition-colors cursor-pointer"
                      >
                        <h4 className="font-bold text-[#1e3a5f]">{idioma.idioma}</h4>
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
                <div className="mt-6 bg-[#f3ede1] p-4 rounded-lg">
                  <h3 className="text-lg font-bold text-[#1e3a5f] mb-3 flex items-center gap-2">
                    <Landmark size={20} className="text-[#e8740e]" />
                    Certificación Bancaria
                  </h3>
                  <button
                    type="button"
                    onClick={() => handleAbrirDocumentoDeLista(perfilCompleto.certificacion_bancaria!.documentosCertificacionBancaria)}
                    className="bg-[#ffffff] p-4 rounded border border-[rgba(30,58,95,0.09)] text-left w-full hover:bg-[#f0e8dd] transition-colors cursor-pointer"
                  >
                    <div className="space-y-2 text-sm">
                      {perfilCompleto.certificacion_bancaria.nombre_banco && (
                        <div className="grid grid-cols-2 gap-2">
                          <span className="font-semibold text-[#6b7a8d]">Banco:</span>
                          <span className="text-[#1e3a5f]">{perfilCompleto.certificacion_bancaria.nombre_banco}</span>
                        </div>
                      )}
                      {perfilCompleto.certificacion_bancaria.tipo_cuenta && (
                        <div className="grid grid-cols-2 gap-2">
                          <span className="font-semibold text-[#6b7a8d]">Tipo de cuenta:</span>
                          <span className="text-[#1e3a5f]">{perfilCompleto.certificacion_bancaria.tipo_cuenta}</span>
                        </div>
                      )}
                      {perfilCompleto.certificacion_bancaria.numero_cuenta && (
                        <div className="grid grid-cols-2 gap-2">
                          <span className="font-semibold text-[#6b7a8d]">Número de cuenta:</span>
                          <span className="text-[#1e3a5f]">{perfilCompleto.certificacion_bancaria.numero_cuenta}</span>
                        </div>
                      )}
                      {perfilCompleto.certificacion_bancaria.fecha_emision && (
                        <div className="grid grid-cols-2 gap-2">
                          <span className="font-semibold text-[#6b7a8d]">Fecha de emisión:</span>
                          <span className="text-[#1e3a5f]">{perfilCompleto.certificacion_bancaria.fecha_emision}</span>
                        </div>
                      )}
                    </div>
                  </button>
                </div>
              )}

              {/* Pensión */}
              {perfilCompleto.pension && (
                <div className="mt-6 bg-[#f3ede1] p-4 rounded-lg">
                  <h3 className="text-lg font-bold text-[#1e3a5f] mb-3 flex items-center gap-2">
                    <PiggyBank size={20} className="text-[#e8740e]" />
                    Pensión
                  </h3>
                  <button
                    type="button"
                    onClick={() => handleAbrirDocumentoDeLista(perfilCompleto.pension!.documentosPension)}
                    className="bg-[#ffffff] p-4 rounded border border-[rgba(30,58,95,0.09)] text-left w-full hover:bg-[#f0e8dd] transition-colors cursor-pointer"
                  >
                    <div className="space-y-2 text-sm">
                      {perfilCompleto.pension.regimen_pensional && (
                        <div className="grid grid-cols-2 gap-2">
                          <span className="font-semibold text-[#6b7a8d]">Régimen:</span>
                          <span className="text-[#1e3a5f]">{perfilCompleto.pension.regimen_pensional}</span>
                        </div>
                      )}
                      {perfilCompleto.pension.entidad_pensional && (
                        <div className="grid grid-cols-2 gap-2">
                          <span className="font-semibold text-[#6b7a8d]">Entidad:</span>
                          <span className="text-[#1e3a5f]">{perfilCompleto.pension.entidad_pensional}</span>
                        </div>
                      )}
                      {perfilCompleto.pension.nit_entidad && (
                        <div className="grid grid-cols-2 gap-2">
                          <span className="font-semibold text-[#6b7a8d]">NIT:</span>
                          <span className="text-[#1e3a5f]">{perfilCompleto.pension.nit_entidad}</span>
                        </div>
                      )}
                    </div>
                  </button>
                </div>
              )}

              {/* Antecedentes Judiciales */}
              {perfilCompleto.antecedente_judicial && (
                <div className="mt-6 bg-[#f3ede1] p-4 rounded-lg">
                  <h3 className="text-lg font-bold text-[#1e3a5f] mb-3 flex items-center gap-2">
                    <Scale size={20} className="text-[#e8740e]" />
                    Antecedentes Judiciales
                  </h3>
                  <button
                    type="button"
                    onClick={() => handleAbrirDocumentoDeLista(perfilCompleto.antecedente_judicial!.documentosAntecedentesJudiciales)}
                    className="bg-[#ffffff] p-4 rounded border border-[rgba(30,58,95,0.09)] text-left w-full hover:bg-[#f0e8dd] transition-colors cursor-pointer"
                  >
                    <div className="space-y-2 text-sm">
                      {perfilCompleto.antecedente_judicial.estado_antecedentes && (
                        <div className="grid grid-cols-2 gap-2">
                          <span className="font-semibold text-[#6b7a8d]">Estado:</span>
                          <span className="text-[#1e3a5f]">{perfilCompleto.antecedente_judicial.estado_antecedentes}</span>
                        </div>
                      )}
                      {perfilCompleto.antecedente_judicial.fecha_validacion && (
                        <div className="grid grid-cols-2 gap-2">
                          <span className="font-semibold text-[#6b7a8d]">Fecha validación:</span>
                          <span className="text-[#1e3a5f]">{perfilCompleto.antecedente_judicial.fecha_validacion}</span>
                        </div>
                      )}
                    </div>
                  </button>
                </div>
              )}

              {/* Producción Académica */}
              {perfilCompleto.produccion_academica && perfilCompleto.produccion_academica.length > 0 && (
                <div className="mt-6 bg-[#f3ede1] p-4 rounded-lg">
                  <h3 className="text-lg font-bold text-[#1e3a5f] mb-3 flex items-center gap-2">
                    <BookOpen size={20} className="text-[#e8740e]" />
                    Producción Académica
                  </h3>
                  <div className="space-y-3">
                    {perfilCompleto.produccion_academica.map((prod, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => void handleAbrirDocumentoPreferido(prod.documentosProduccionAcademica, 'producciones')}
                        className="bg-[#ffffff] p-4 rounded border border-[rgba(30,58,95,0.09)] text-left w-full hover:bg-[#f0e8dd] transition-colors cursor-pointer"
                      >
                        <h4 className="font-bold text-[#1e3a5f]">{prod.titulo}</h4>
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
                <div className="mt-6 bg-[#f3ede1] p-4 rounded-lg">
                  <h3 className="text-lg font-bold text-[#1e3a5f] mb-3 flex items-center gap-2">
                    <Lightbulb size={20} className="text-[#e8740e]" />
                    Aptitudes
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {perfilCompleto.aptitudes.map((apt, idx) => (
                      <span
                        key={idx}
                        className="bg-[#e8f5e9] text-[#2e7d32] px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {(apt as unknown as Record<string, string>)['nombre_aptitud'] ?? apt.nombre}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* ARL */}
              {perfilCompleto.arl && (
                <div className="mt-6 bg-[#f3ede1] p-4 rounded-lg">
                  <h3 className="text-lg font-bold text-[#1e3a5f] mb-3 flex items-center gap-2">
                    <ShieldCheck size={20} className="text-[#e8740e]" />
                    ARL
                  </h3>
                  <button
                    type="button"
                    onClick={() => handleAbrirDocumentoDeLista(perfilCompleto.arl!.documentosArl)}
                    className="bg-[#ffffff] p-4 rounded border border-[rgba(30,58,95,0.09)] text-left w-full hover:bg-[#f0e8dd] transition-colors cursor-pointer"
                  >
                    <div className="space-y-2 text-sm">
                      {perfilCompleto.arl.nombre_arl && (
                        <div className="grid grid-cols-2 gap-2">
                          <span className="font-semibold text-[#6b7a8d]">ARL:</span>
                          <span className="text-[#1e3a5f]">{perfilCompleto.arl.nombre_arl}</span>
                        </div>
                      )}
                      {perfilCompleto.arl.clase_riesgo && (
                        <div className="grid grid-cols-2 gap-2">
                          <span className="font-semibold text-[#6b7a8d]">Clase de riesgo:</span>
                          <span className="text-[#1e3a5f]">{perfilCompleto.arl.clase_riesgo}</span>
                        </div>
                      )}
                      {perfilCompleto.arl.estado_afiliacion && (
                        <div className="grid grid-cols-2 gap-2">
                          <span className="font-semibold text-[#6b7a8d]">Estado:</span>
                          <span className="text-[#1e3a5f]">{perfilCompleto.arl.estado_afiliacion}</span>
                        </div>
                      )}
                      {perfilCompleto.arl.fecha_afiliacion && (
                        <div className="grid grid-cols-2 gap-2">
                          <span className="font-semibold text-[#6b7a8d]">Fecha afiliación:</span>
                          <span className="text-[#1e3a5f]">{perfilCompleto.arl.fecha_afiliacion}</span>
                        </div>
                      )}
                      {perfilCompleto.arl.fecha_retiro && (
                        <div className="grid grid-cols-2 gap-2">
                          <span className="font-semibold text-[#6b7a8d]">Fecha retiro:</span>
                          <span className="text-[#1e3a5f]">{perfilCompleto.arl.fecha_retiro}</span>
                        </div>
                      )}
                    </div>
                  </button>
                </div>
              )}

              {perfilCompleto.documentos && perfilCompleto.documentos.length > 0 && (
                <div className="mt-6 bg-[#f3ede1] p-4 rounded-lg">
                  <h3 className="text-lg font-bold text-[#1e3a5f] mb-3 flex items-center gap-2">
                    <FileDown size={20} className="text-[#e8740e]" />
                    Documentos
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {perfilCompleto.documentos.map((doc) => (
                      <button
                        key={doc.id}
                        type="button"
                        onClick={() => handleAbrirDocumento(doc.url)}
                        className="bg-[#ffffff] p-3 rounded border border-[rgba(30,58,95,0.09)] hover:bg-[#f0e8dd] flex items-center gap-2 text-left"
                      >
                        <FileText size={18} className="text-[#e8740e]" />
                        <span className="text-sm truncate text-[#1e3a5f]">{doc.nombre}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-[rgba(30,58,95,0.09)] p-4 bg-[#f3ede1] flex justify-between items-center gap-2 rounded-b-xl">
              <button
                onClick={() => perfilCompleto && handleRechazarAval(perfilCompleto.id, perfilConvocatoriaId ?? undefined)}
                className="px-4 py-2 bg-[#f44336] text-white rounded-lg hover:bg-[#da190b] text-sm flex items-center gap-2"
              >
                <XCircle size={14} />
                Rechazar
              </button>
              <button onClick={cerrarPerfilCompleto} className="px-6 py-2 bg-[#6b7a8d] text-white rounded-lg hover:bg-[#5a6876]">Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de motivo de rechazo */}
      {modalRechazoOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70] p-4">
          <div className="bg-[#ffffff] rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b border-[rgba(30,58,95,0.09)]">
              <h3 className="text-lg font-bold text-[#1e3a5f] flex items-center gap-2">
                <XCircle className="text-[#f44336]" size={20} />
                Rechazar aval de Coordinación
              </h3>
              <button onClick={() => setModalRechazoOpen(false)} className="text-[#6b7a8d] hover:text-[#1e3a5f] p-1 rounded">
                <X size={20} />
              </button>
            </div>
            <div className="p-4">
              <p className="text-sm text-[#6b7a8d] mb-3">
                Indique el motivo por el cual se rechaza el aval. Esta información será enviada al aspirante por correo electrónico.
              </p>
              <textarea
                className="w-full border border-[rgba(30,58,95,0.2)] rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] text-[#1e3a5f]"
                rows={4}
                placeholder="Escriba el motivo de rechazo..."
                value={motivoRechazo}
                onChange={(e) => setMotivoRechazo(e.target.value)}
                maxLength={1000}
              />
              <p className="text-xs text-[#6b7a8d] text-right mt-1">{motivoRechazo.length}/1000</p>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t border-[rgba(30,58,95,0.09)] bg-[#f3ede1] rounded-b-xl">
              <button
                onClick={() => setModalRechazoOpen(false)}
                className="px-4 py-2 rounded-lg bg-[#ffffff] text-[#1e3a5f] hover:bg-[#f0e8dd] text-sm border border-[rgba(30,58,95,0.09)]"
              >
                Cancelar
              </button>
              <button
                onClick={() => void confirmarRechazo()}
                disabled={loadingRechazo || !motivoRechazo.trim()}
                className="px-4 py-2 rounded-lg bg-[#f44336] text-white hover:bg-[#da190b] text-sm flex items-center gap-2 disabled:opacity-50"
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
          <div className="bg-[#ffffff] rounded-xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-3 border-b border-[rgba(30,58,95,0.09)] bg-[#f3ede1] rounded-t-xl">
              <span className="text-sm font-semibold text-[#1e3a5f]">Vista de documento</span>
              <div className="flex gap-2">
                <a
                  href={visorUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 px-3 py-1.5 text-xs bg-[#1e3a5f] text-white rounded-lg hover:bg-[#2c3e50]"
                >
                  <FileText size={13} /> Abrir en nueva pestaña
                </a>
                <button
                  onClick={() => setVisorUrl(null)}
                  className="p-1.5 text-[#6b7a8d] hover:text-[#1e3a5f] hover:bg-[#f0e8dd] rounded-lg"
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

      {modalEvaluacionOpen && evaluando && (
        <div className={`modal-overlay fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto ${cerrandoModalEvaluacion ? "modal-exit" : ""}`}>
          <div className={`modal-content bg-[#ffffff] rounded-xl shadow-2xl w-full max-w-5xl my-8 ${cerrandoModalEvaluacion ? "modal-exit" : ""}`}>
            <div className="flex items-center justify-between p-5 border-b border-[rgba(30,58,95,0.09)]">
              <div>
                <h2 className="text-xl font-bold text-[#1e3a5f]">Evaluación Psicotecnia y Clase</h2>
                <p className="text-sm text-[#6b7a8d]">
                  {evaluando.aspirante?.primer_nombre} {evaluando.aspirante?.primer_apellido}
                </p>
              </div>
              <button
                onClick={cerrarModalEvaluacion}
                className="text-[#6b7a8d] hover:text-[#1e3a5f] p-2 rounded-lg"
                aria-label="Cerrar modal"
              >
                <X size={22} />
              </button>
            </div>

            <div className="p-6 space-y-8 max-h-[calc(100vh-220px)] overflow-y-auto">
              {/* Información básica de la evaluación */}
              <div className="bg-gradient-to-r from-[#f3ede1] to-[#e8f5e9] p-6 rounded-xl border border-[rgba(30,58,95,0.09)]">
                <h3 className="text-lg font-semibold text-[#1e3a5f] mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-[#2e7d32]" />
                  Información Básica de la Evaluación
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-[#1e3a5f] mb-2">Prueba psicotécnica</label>
                    <input
                      type="text"
                      value={pruebaPsicotecnica}
                      onChange={(e) => setPruebaPsicotecnica(e.target.value)}
                      className="w-full p-3 border border-[rgba(30,58,95,0.2)] rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent text-[#1e3a5f]"
                      placeholder="Resultado de la prueba psicotécnica"
                    />
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="validacionArchivos"
                        checked={validacionArchivos}
                        onChange={(e) => setValidacionArchivos(e.target.checked)}
                        className="w-4 h-4 text-[#1e3a5f] bg-[#f3ede1] border-[rgba(30,58,95,0.2)] rounded focus:ring-[#1e3a5f]"
                      />
                      <label htmlFor="validacionArchivos" className="text-sm font-medium text-[#1e3a5f]">Validación de archivos</label>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="claseOrganizada"
                        checked={claseOrganizada}
                        onChange={(e) => setClaseOrganizada(e.target.checked)}
                        className="w-4 h-4 text-[#1e3a5f] bg-[#f3ede1] border-[rgba(30,58,95,0.2)] rounded focus:ring-[#1e3a5f]"
                      />
                      <label htmlFor="claseOrganizada" className="text-sm font-medium text-[#1e3a5f]">Clase organizada</label>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="aprobado"
                        checked={aprobado}
                        onChange={(e) => setAprobado(e.target.checked)}
                        className="w-4 h-4 text-[#2e7d32] bg-[#f3ede1] border-[rgba(30,58,95,0.2)] rounded focus:ring-[#2e7d32]"
                      />
                      <label htmlFor="aprobado" className="text-sm font-medium text-[#1e3a5f]">Aprobado</label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Observaciones */}
              <div className="bg-[#fff9c4] border border-[#fbc02d] p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-[#f57c00] mb-3 flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Observaciones
                </h3>
                <textarea
                  rows={4}
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  className="w-full p-3 border border-[#fbc02d] rounded-lg focus:ring-2 focus:ring-[#f57c00] focus:border-[#f57c00] resize-none text-[#e8740e]"
                  placeholder="Observaciones generales sobre la evaluación..."
                />
              </div>

              {/* Información personal */}
              <div className="bg-[#ffffff] border border-[rgba(30,58,95,0.09)] p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-[#1e3a5f] mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-[#e8740e]" />
                  Información Personal
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#1e3a5f] mb-2">Composición del núcleo familiar</label>
                    <textarea
                      rows={3}
                      value={nucleoFamiliar}
                      onChange={(e) => setNucleoFamiliar(e.target.value)}
                      className="w-full p-3 border border-[rgba(30,58,95,0.2)] rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent resize-none text-[#1e3a5f]"
                      placeholder="Describa la composición del núcleo familiar..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1e3a5f] mb-2">Competencias, habilidades y destrezas</label>
                    <textarea
                      rows={3}
                      value={competencias}
                      onChange={(e) => setCompetencias(e.target.value)}
                      className="w-full p-3 border border-[rgba(30,58,95,0.2)] rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent resize-none text-[#1e3a5f]"
                      placeholder="Describa las competencias y habilidades..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1e3a5f] mb-2">Oportunidades de mejora</label>
                    <textarea
                      rows={3}
                      value={oportunidadesMejora}
                      onChange={(e) => setOportunidadesMejora(e.target.value)}
                      className="w-full p-3 border border-[rgba(30,58,95,0.2)] rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent resize-none text-[#1e3a5f]"
                      placeholder="Identifique oportunidades de mejora..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1e3a5f] mb-2">Aspiraciones laborales</label>
                    <textarea
                      rows={3}
                      value={aspiracionesLaborales}
                      onChange={(e) => setAspiracionesLaborales(e.target.value)}
                      className="w-full p-3 border border-[rgba(30,58,95,0.2)] rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent resize-none text-[#1e3a5f]"
                      placeholder="Describa las aspiraciones laborales..."
                    />
                  </div>
                </div>
              </div>

              {/* Competencias técnicas */}
              <div className="bg-[#f3ede1] border border-[rgba(30,58,95,0.09)] p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-[#1e3a5f] mb-4 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-[#e8740e]" />
                  Competencias Técnicas
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[#1e3a5f] mb-2">Título de pregrado</label>
                      <textarea
                        rows={2}
                        value={tituloPregrado}
                        onChange={(e) => setTituloPregrado(e.target.value)}
                        className="w-full p-3 border border-[rgba(30,58,95,0.2)] rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent resize-none text-[#1e3a5f]"
                        placeholder="Título obtenido..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#1e3a5f] mb-2">Títulos de posgrado</label>
                      <textarea
                        rows={2}
                        value={titulosPosgrado}
                        onChange={(e) => setTitulosPosgrado(e.target.value)}
                        className="w-full p-3 border border-[rgba(30,58,95,0.2)] rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent resize-none text-[#1e3a5f]"
                        placeholder="Títulos de posgrado obtenidos..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#1e3a5f] mb-2">Opción por la docencia</label>
                      <textarea
                        rows={2}
                        value={opcionDocencia}
                        onChange={(e) => setOpcionDocencia(e.target.value)}
                        className="w-full p-3 border border-[rgba(30,58,95,0.2)] rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent resize-none text-[#1e3a5f]"
                        placeholder="Motivación por la docencia..."
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[#1e3a5f] mb-2">Experiencias laborales relevantes</label>
                      <textarea
                        rows={3}
                        value={experienciasRelevantes}
                        onChange={(e) => setExperienciasRelevantes(e.target.value)}
                        className="w-full p-3 border border-[rgba(30,58,95,0.2)] rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent resize-none text-[#1e3a5f]"
                        placeholder="Experiencias laborales relevantes..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#1e3a5f] mb-2">Conocimientos específicos</label>
                      <textarea
                        rows={3}
                        value={conocimientosEspecificos}
                        onChange={(e) => setConocimientosEspecificos(e.target.value)}
                        className="w-full p-3 border border-[rgba(30,58,95,0.2)] rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent resize-none text-[#1e3a5f]"
                        placeholder="Conocimientos específicos del área..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#1e3a5f] mb-2">Herramientas TIC</label>
                      <textarea
                        rows={3}
                        value={herramientasTIC}
                        onChange={(e) => setHerramientasTIC(e.target.value)}
                        className="w-full p-3 border border-[rgba(30,58,95,0.2)] rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent resize-none text-[#1e3a5f]"
                        placeholder="Herramientas TIC que maneja..."
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Experiencia práctica */}
              <div className="bg-[#ffffff] border border-[rgba(30,58,95,0.09)] p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-[#1e3a5f] mb-4 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-[#e8740e]" />
                  Experiencia Práctica
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[#1e3a5f] mb-2">Metodología</label>
                      <textarea
                        rows={3}
                        value={metodologia}
                        onChange={(e) => setMetodologia(e.target.value)}
                        className="w-full p-3 border border-[rgba(30,58,95,0.2)] rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent resize-none text-[#1e3a5f]"
                        placeholder="Evaluación de la metodología utilizada..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#1e3a5f] mb-2">Dominio técnico</label>
                      <textarea
                        rows={3}
                        value={dominioTecnico}
                        onChange={(e) => setDominioTecnico(e.target.value)}
                        className="w-full p-3 border border-[rgba(30,58,95,0.2)] rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent resize-none text-[#1e3a5f]"
                        placeholder="Evaluación del dominio técnico..."
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[#1e3a5f] mb-2">Expresión oral, claridad y asertividad</label>
                      <textarea
                        rows={3}
                        value={expresionOral}
                        onChange={(e) => setExpresionOral(e.target.value)}
                        className="w-full p-3 border border-[rgba(30,58,95,0.2)] rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent resize-none text-[#1e3a5f]"
                        placeholder="Evaluación de la expresión oral..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#1e3a5f] mb-2">Presentación personal</label>
                      <textarea
                        rows={2}
                        value={presentacionPersonal}
                        onChange={(e) => setPresentacionPersonal(e.target.value)}
                        className="w-full p-3 border border-[rgba(30,58,95,0.2)] rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent resize-none text-[#1e3a5f]"
                        placeholder="Evaluación de la presentación personal..."
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Conclusión */}
              <div className="bg-gradient-to-r from-[#e8f5e9] to-[#c8e6c9] border border-[#4caf50] p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-[#2e7d32] mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Conclusión
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#1e3a5f] mb-2">Concepto general</label>
                    <textarea
                      rows={4}
                      value={conceptoGeneral}
                      onChange={(e) => setConceptoGeneral(e.target.value)}
                      className="w-full p-3 border border-[#4caf50] rounded-lg focus:ring-2 focus:ring-[#4caf50] focus:border-[#4caf50] resize-none text-[#1e3a5f]"
                      placeholder="Concepto general de la evaluación..."
                    />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="continuaProceso"
                        checked={continuaProceso}
                        onChange={(e) => setContinuaProceso(e.target.checked)}
                        className="w-4 h-4 text-[#2e7d32] bg-[#e8f5e9] border-[#4caf50] rounded focus:ring-[#4caf50]"
                      />
                      <label htmlFor="continuaProceso" className="text-sm font-medium text-[#1e3a5f]">Continúa en el proceso</label>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="sugerirContratacion"
                        checked={sugerirContratacion}
                        onChange={(e) => setSugerirContratacion(e.target.checked)}
                        className="w-4 h-4 text-[#2e7d32] bg-[#e8f5e9] border-[#4caf50] rounded focus:ring-[#4caf50]"
                      />
                      <label htmlFor="sugerirContratacion" className="text-sm font-medium text-[#1e3a5f]">Sugerir contratación</label>
                    </div>
                    {continuaProceso && (
                      <div>
                        <label className="block text-sm font-medium text-[#1e3a5f] mb-2">Razón</label>
                        <textarea
                          rows={2}
                          value={razonContinua}
                          onChange={(e) => setRazonContinua(e.target.value)}
                          className="w-full p-3 border border-[#4caf50] rounded-lg focus:ring-2 focus:ring-[#4caf50] focus:border-[#4caf50] resize-none text-[#1e3a5f]"
                          placeholder="Explique la razón por la que continúa en el proceso..."
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 p-5 border-t border-[rgba(30,58,95,0.09)]">
              <button onClick={cerrarModalEvaluacion} className="px-4 py-2 rounded-lg bg-[#f3ede1] text-[#1e3a5f] border border-[rgba(30,58,95,0.09)]">Cancelar</button>
              <button onClick={guardarEvaluacion} className="px-4 py-2 rounded-lg bg-[#1e3a5f] text-[#ffffff] hover:bg-[#2c3e50]">Guardar evaluación</button>
            </div>
          </div>
        </div>
      )}
    </div>

    {/* Asistente IA — flotante */}
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

export default VerAspirantesTH;