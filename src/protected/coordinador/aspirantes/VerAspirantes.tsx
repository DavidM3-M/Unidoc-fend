import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import axiosInstance from "../../../utils/axiosConfig";
import InputSearch from "../../../componentes/formularios/InputSearch";
import { User, FileText, CheckCircle, XCircle, Mail, Phone, Briefcase, GraduationCap, Award, FileDown, X, Loader2, Globe } from "lucide-react";
import axios from "axios";

interface Aspirante {
  id: number;
  primer_nombre: string;
  segundo_nombre?: string;
  primer_apellido: string;
  segundo_apellido?: string;
  numero_identificacion: string;
  email?: string;
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
  eps?: { nombre_eps?: string };
  rut?: { numero_rut?: string };
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
  const [modalPage, setModalPage] = useState(1);
  const modalPageSize = 12;
  const [modalEvaluacionOpen, setModalEvaluacionOpen] = useState(false);
  const [cerrandoModalEvaluacion, setCerrandoModalEvaluacion] = useState(false);
  const [evaluando, setEvaluando] = useState<PostulacionItem | null>(null);
  const [avalesCoordLocal, setAvalesCoordLocal] = useState<Record<number, boolean>>({});
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

  const handleAvalCoordinador = async (userId?: number) => {
    if (!userId) {
      toast.error("No se pudo identificar el aspirante");
      return;
    }

    try {
      const res = await axiosInstance.post(`/coordinador/aval-hoja-vida/${userId}`);
      toast.success(res.data?.message ?? "Aval de Coordinador registrado");
      setAvalesCoordLocal((prev) => ({ ...prev, [userId]: true }));
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
    if (!modalSearch.trim()) return postulacionesModal;
    const q = modalSearch.toLowerCase();
    return postulacionesModal.filter((p) => {
      const a = p.aspirante;
      const nombre = `${a?.primer_nombre ?? ""} ${a?.segundo_nombre ?? ""} ${a?.primer_apellido ?? ""} ${a?.segundo_apellido ?? ""}`.toLowerCase();
      const id = (a?.numero_identificacion ?? "").toLowerCase();
      const email = (a?.email ?? "").toLowerCase();
      return nombre.includes(q) || id.includes(q) || email.includes(q);
    });
  }, [postulacionesModal, modalSearch]);

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
  const verPerfilCompleto = async (userId: number) => {
    setLoadingPerfil(true);
    try {
      const response = await axiosInstance.get(`/coordinador/aspirantes/${userId}`);
      const aspirante = response.data.aspirante ?? response.data?.data ?? response.data;
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

    window.open(url, '_blank');
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
    <div className="flex flex-col gap-4 min-h-screen w-full max-w-6xl mx-auto bg-white rounded-3xl p-8">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Aspirantes aprobados por TH</h1>
          <p className="text-gray-500">Organizados por convocatoria.</p>
        </div>
        <button
          onClick={fetchPostulaciones}
          className="px-3 py-2 rounded-lg bg-gray-100 text-gray-800"
        >
          Actualizar
        </button>
      </div>

      <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-semibold text-gray-700">Estado de postulación</label>
          <select
            value={estadoPostulacion}
            onChange={(e) => setEstadoPostulacion(e.target.value as "Todas" | "Enviada" | "Aceptada" | "Rechazada" | "Faltan documentos")}
            className="w-full mt-1 p-2 border rounded-lg bg-white"
          >
            <option value="Todas">Todas</option>
            <option value="Enviada">Enviada</option>
            <option value="Aceptada">Aceptada</option>
            <option value="Rechazada">Rechazada</option>
            <option value="Faltan documentos">Faltan documentos</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-700">Buscar</label>
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
        <div className="py-10 text-center text-gray-500">Cargando aspirantes...</div>
      ) : gruposFiltrados.length === 0 ? (
        <div className="py-10 text-center text-gray-500">No hay aspirantes con los filtros actuales.</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {gruposFiltrados.map((g) => {
            const conv = g.convocatoria;
            const postulacionesCount = g.postulaciones?.length ?? 0;

            return (
              <div key={conv?.id ?? "sin-convocatoria"} className="border rounded-2xl p-5 shadow-sm bg-white">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{conv?.nombre ?? "Sin convocatoria"}</h3>
                    <p className="text-sm text-gray-500">{postulacionesCount} aspirante(s)</p>
                  </div>
                  <button
                    onClick={() => {
                      setCerrandoModal(false);
                      setModalSearch("");
                      setModalPage(1);
                      setModalConvocatoria({ id: conv?.id, nombre: conv?.nombre ?? "Sin convocatoria" });
                    }}
                    className="text-sm px-3 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                  >
                    Ver aspirantes
                  </button>
                </div>

                <div className="mt-4">
                  <div className="text-sm text-gray-500">
                    Haz clic en “Ver aspirantes” para visualizar el listado completo.
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modalConvocatoria && (
        <div className={`modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto ${cerrandoModal ? "modal-exit" : ""}`}>
          <div className={`modal-content bg-white rounded-xl shadow-2xl w-full max-w-6xl my-8 ${cerrandoModal ? "modal-exit" : ""}`}>
            <div className="flex items-center justify-between p-5 border-b">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Aspirantes - {modalConvocatoria.nombre}</h2>
                <p className="text-sm text-gray-500">{postulacionesModal.length} aspirante(s)</p>
              </div>
              <button
                onClick={cerrarModal}
                className="text-gray-500 hover:text-gray-700 p-2 rounded-lg"
                aria-label="Cerrar modal"
              >
                <X size={22} />
              </button>
            </div>

            <div className="p-5 max-h-[calc(100vh-220px)] overflow-y-auto">
              {postulacionesModal.length === 0 ? (
                <div className="text-center text-gray-500 py-10">No hay aspirantes para esta convocatoria.</div>
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
                    <div className="text-xs text-gray-500">
                      {postulacionesModalFiltradas.length} aspirante(s) • Página {modalPage} de {totalModalPages}
                    </div>
                  </div>

                  {postulacionesModalAgrupadas.map((grupo) => (
                    <div key={grupo.categoria} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-gray-700">{grupo.categoria}</h3>
                        <span className="text-xs text-gray-500">{grupo.items.length} aspirante(s)</span>
                      </div>
                      {grupo.items.map((p) => {
                        const avaladoCoord = p.aspirante?.id ? avalesCoordLocal[p.aspirante.id] : false;
                        return (
                          <div key={p.postulacion_id ?? `${p.aspirante?.id}-${p.convocatoria?.id}`} className="border rounded-xl p-4 bg-white shadow-sm">
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                              <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                                  <User size={18} />
                                </div>
                                <div>
                                  <h3 className="font-semibold text-gray-800">
                                    {p.aspirante?.primer_nombre} {p.aspirante?.primer_apellido}
                                  </h3>
                                  <div className="text-sm text-gray-500">
                                    {p.aspirante?.numero_identificacion} • {p.aspirante?.email}
                                  </div>
                                  <div className="mt-1 flex flex-wrap gap-2">
                                    <span className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-700">TH aprobado</span>
                                    {avaladoCoord && (
                                      <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">Aval Coordinación</span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="text-sm text-gray-500">
                                Estado postulación: <span className="font-semibold">{p.estado_postulacion ?? "Enviada"}</span>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                <button
                                  onClick={() => p.aspirante?.id && verPerfilCompleto(p.aspirante.id)}
                                  className="inline-flex items-center gap-2 bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-50 px-3 py-2 rounded-md shadow-sm text-sm"
                                >
                                  <User size={14} />
                                  <span>Ver perfil</span>
                                </button>
                                <button
                                  onClick={() => abrirModalEvaluacion(p)}
                                  className="inline-flex items-center gap-2 bg-indigo-600 text-white px-3 py-2 rounded-md hover:bg-indigo-700 shadow text-sm"
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
                                  className="inline-flex items-center gap-2 bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-50 px-3 py-2 rounded-md shadow-sm text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  Ver evaluación
                                </button>
                                      {/* Modal para ver evaluación existente */}
                                      {modalVerEvaluacionOpen && (
                                        <div className={`modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto`}>
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
                                {!avaladoCoord && (
                                  <button
                                    onClick={() => handleAvalCoordinador(p.aspirante?.id)}
                                    className="inline-flex items-center gap-2 bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 shadow text-sm"
                                  >
                                    Dar aval Coordinador
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
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

      {/* Modal de Perfil Completo */}
      {mostrarPerfilCompleto && perfilCompleto && (
        <div className={`modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto ${cerrandoPerfilCompleto ? "modal-exit" : ""}`}>
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
                    <div className={`flex items-center justify-between p-2 rounded ${isAvalAprobado(getEstadoAvalTalentoHumano(perfilCompleto)) ? 'bg-green-100' : 'bg-orange-100'}`}>
                      <span className="font-semibold text-sm">Talento Humano</span>
                      <span className={`text-sm flex items-center gap-1 ${isAvalAprobado(getEstadoAvalTalentoHumano(perfilCompleto)) ? 'text-green-700' : 'text-orange-700'}`}>
                        {isAvalAprobado(getEstadoAvalTalentoHumano(perfilCompleto)) ? (<><CheckCircle size={16} /> Aprobado</>) : (<><XCircle size={16} /> Pendiente</>) }
                      </span>
                    </div>
                    <div className={`flex items-center justify-between p-2 rounded ${isAvalAprobado(getEstadoAval(perfilCompleto, 'coordinador')) || avalesCoordLocal[perfilCompleto.id] ? 'bg-green-100' : 'bg-orange-100'}`}>
                      <span className="font-semibold text-sm">Evaluación</span>
                      <span className={`text-sm flex items-center gap-1 ${isAvalAprobado(getEstadoAval(perfilCompleto, 'coordinador')) || avalesCoordLocal[perfilCompleto.id] ? 'text-green-700' : 'text-orange-700'}`}>
                        {isAvalAprobado(getEstadoAval(perfilCompleto, 'coordinador')) || avalesCoordLocal[perfilCompleto.id] ? (<><CheckCircle size={16} /> Aprobado</>) : (<><XCircle size={16} /> Pendiente</>) }
                      </span>
                    </div>
                    <div className={`flex items-center justify-between p-2 rounded ${isAvalAprobado(getEstadoAval(perfilCompleto, 'rectoria')) ? 'bg-green-100' : 'bg-orange-100'}`}>
                      <span className="font-semibold text-sm">Rectoría</span>
                      <span className={`text-sm flex items-center gap-1 ${isAvalAprobado(getEstadoAval(perfilCompleto, 'rectoria')) ? 'text-green-700' : 'text-orange-700'}`}>
                        {isAvalAprobado(getEstadoAval(perfilCompleto, 'rectoria')) ? (<><CheckCircle size={16} /> Aprobado</>) : (<><XCircle size={16} /> Pendiente</>) }
                      </span>
                    </div>
                    <div className={`flex items-center justify-between p-2 rounded ${isAvalAprobado(getEstadoAval(perfilCompleto, 'vicerrectoria')) ? 'bg-green-100' : 'bg-orange-100'}`}>
                      <span className="font-semibold text-sm">Vicerrectoría</span>
                      <span className={`text-sm flex items-center gap-1 ${isAvalAprobado(getEstadoAval(perfilCompleto, 'vicerrectoria')) ? 'text-green-700' : 'text-orange-700'}`}>
                        {isAvalAprobado(getEstadoAval(perfilCompleto, 'vicerrectoria')) ? (<><CheckCircle size={16} /> Aprobado</>) : (<><XCircle size={16} /> Pendiente</>)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

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

      {modalEvaluacionOpen && evaluando && (
        <div className={`modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto ${cerrandoModalEvaluacion ? "modal-exit" : ""}`}>
          <div className={`modal-content bg-white rounded-xl shadow-2xl w-full max-w-5xl my-8 ${cerrandoModalEvaluacion ? "modal-exit" : ""}`}>
            <div className="flex items-center justify-between p-5 border-b">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Evaluación Psicotecnia y Clase</h2>
                <p className="text-sm text-gray-500">
                  {evaluando.aspirante?.primer_nombre} {evaluando.aspirante?.primer_apellido}
                </p>
              </div>
              <button
                onClick={cerrarModalEvaluacion}
                className="text-gray-500 hover:text-gray-700 p-2 rounded-lg"
                aria-label="Cerrar modal"
              >
                <X size={22} />
              </button>
            </div>

            <div className="p-6 space-y-8 max-h-[calc(100vh-220px)] overflow-y-auto">
              {/* Información básica de la evaluación */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Información Básica de la Evaluación
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Prueba psicotécnica</label>
                    <input
                      type="text"
                      value={pruebaPsicotecnica}
                      onChange={(e) => setPruebaPsicotecnica(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="validacionArchivos" className="text-sm font-medium text-gray-700">Validación de archivos</label>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="claseOrganizada"
                        checked={claseOrganizada}
                        onChange={(e) => setClaseOrganizada(e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="claseOrganizada" className="text-sm font-medium text-gray-700">Clase organizada</label>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="aprobado"
                        checked={aprobado}
                        onChange={(e) => setAprobado(e.target.checked)}
                        className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500"
                      />
                      <label htmlFor="aprobado" className="text-sm font-medium text-gray-700">Aprobado</label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Observaciones */}
              <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-yellow-800 mb-3 flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Observaciones
                </h3>
                <textarea
                  rows={4}
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  className="w-full p-3 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 resize-none"
                  placeholder="Observaciones generales sobre la evaluación..."
                />
              </div>

              {/* Información personal */}
              <div className="bg-white border border-gray-200 p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Información Personal
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Composición del núcleo familiar</label>
                    <textarea
                      rows={3}
                      value={nucleoFamiliar}
                      onChange={(e) => setNucleoFamiliar(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      placeholder="Describa la composición del núcleo familiar..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Competencias, habilidades y destrezas</label>
                    <textarea
                      rows={3}
                      value={competencias}
                      onChange={(e) => setCompetencias(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      placeholder="Describa las competencias y habilidades..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Oportunidades de mejora</label>
                    <textarea
                      rows={3}
                      value={oportunidadesMejora}
                      onChange={(e) => setOportunidadesMejora(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      placeholder="Identifique oportunidades de mejora..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Aspiraciones laborales</label>
                    <textarea
                      rows={3}
                      value={aspiracionesLaborales}
                      onChange={(e) => setAspiracionesLaborales(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      placeholder="Describa las aspiraciones laborales..."
                    />
                  </div>
                </div>
              </div>

              {/* Competencias técnicas */}
              <div className="bg-gray-50 border border-gray-200 p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5" />
                  Competencias Técnicas
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Título de pregrado</label>
                      <textarea
                        rows={2}
                        value={tituloPregrado}
                        onChange={(e) => setTituloPregrado(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                        placeholder="Título obtenido..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Títulos de posgrado</label>
                      <textarea
                        rows={2}
                        value={titulosPosgrado}
                        onChange={(e) => setTitulosPosgrado(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                        placeholder="Títulos de posgrado obtenidos..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Opción por la docencia</label>
                      <textarea
                        rows={2}
                        value={opcionDocencia}
                        onChange={(e) => setOpcionDocencia(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                        placeholder="Motivación por la docencia..."
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Experiencias laborales relevantes</label>
                      <textarea
                        rows={3}
                        value={experienciasRelevantes}
                        onChange={(e) => setExperienciasRelevantes(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                        placeholder="Experiencias laborales relevantes..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Conocimientos específicos</label>
                      <textarea
                        rows={3}
                        value={conocimientosEspecificos}
                        onChange={(e) => setConocimientosEspecificos(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                        placeholder="Conocimientos específicos del área..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Herramientas TIC</label>
                      <textarea
                        rows={3}
                        value={herramientasTIC}
                        onChange={(e) => setHerramientasTIC(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                        placeholder="Herramientas TIC que maneja..."
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Experiencia práctica */}
              <div className="bg-white border border-gray-200 p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  Experiencia Práctica
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Metodología</label>
                      <textarea
                        rows={3}
                        value={metodologia}
                        onChange={(e) => setMetodologia(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                        placeholder="Evaluación de la metodología utilizada..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Dominio técnico</label>
                      <textarea
                        rows={3}
                        value={dominioTecnico}
                        onChange={(e) => setDominioTecnico(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                        placeholder="Evaluación del dominio técnico..."
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Expresión oral, claridad y asertividad</label>
                      <textarea
                        rows={3}
                        value={expresionOral}
                        onChange={(e) => setExpresionOral(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                        placeholder="Evaluación de la expresión oral..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Presentación personal</label>
                      <textarea
                        rows={2}
                        value={presentacionPersonal}
                        onChange={(e) => setPresentacionPersonal(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                        placeholder="Evaluación de la presentación personal..."
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Conclusión */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Conclusión
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Concepto general</label>
                    <textarea
                      rows={4}
                      value={conceptoGeneral}
                      onChange={(e) => setConceptoGeneral(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
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
                        className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500"
                      />
                      <label htmlFor="continuaProceso" className="text-sm font-medium text-gray-700">Continúa en el proceso</label>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="sugerirContratacion"
                        checked={sugerirContratacion}
                        onChange={(e) => setSugerirContratacion(e.target.checked)}
                        className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500"
                      />
                      <label htmlFor="sugerirContratacion" className="text-sm font-medium text-gray-700">Sugerir contratación</label>
                    </div>
                    {continuaProceso && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Razón</label>
                        <textarea
                          rows={2}
                          value={razonContinua}
                          onChange={(e) => setRazonContinua(e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                          placeholder="Explique la razón por la que continúa en el proceso..."
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 p-5 border-t">
              <button onClick={cerrarModalEvaluacion} className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700">Cancelar</button>
              <button onClick={guardarEvaluacion} className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">Guardar evaluación</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerAspirantesTH;
