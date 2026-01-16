// src/protected/vicerrectoria/avales.tsx
import InputSearch from "../../componentes/formularios/InputSearch";
import { DataTable } from "../../componentes/tablas/DataTable";
import { useEffect, useMemo, useState } from "react";
import axiosInstance from "../../utils/axiosConfig";
import { ColumnDef } from "@tanstack/react-table";
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
  aval_rectoria_at?: string;
  convocatoria_id?: number;
  id_convocatoria?: number;
  idConvocatoria?: number;
}

interface Avales {
  aval_rectoria: boolean;
  aval_vicerrectoria: boolean;
  aval_talento_humano: boolean;
}

interface AspiranteDetallado {
  id: number;
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
  idiomas?: Array<{ idioma: string; nivel: string }>;
  experiencias?: Array<{ cargo: string; empresa: string; fecha_inicio: string; fecha_fin?: string; descripcion?: string }>;
  estudios?: Array<{ titulo: string; institucion: string; fecha_inicio: string; fecha_fin?: string; nivel_educativo: string }>;
  produccion_academica?: Array<{ titulo: string; tipo: string; fecha: string }>;
  aptitudes?: Array<{ nombre: string }>;
  postulaciones?: Array<{ convocatoriaPostulacion?: { titulo: string } }>;
  documentos?: Array<{ id: number; nombre: string; url: string; tipo: string }>;
  avales: {
    rectoria: { estado?: string; aprobado_por?: number; fecha?: string };
    vicerrectoria: { estado?: string; aprobado_por?: number; fecha?: string };
  };
}

interface Convocatoria {
  id: number;
  nombre?: string;
  fecha?: string;
}

/** Tipos para respuestas API genéricas */
interface ApiResponse<T> {
  data: T;
}

/** Tipo de postulacion (ajustable según backend) */
interface Postulacion {
  id?: number;
  convocatoria_id?: number;
  id_convocatoria?: number;
  convocatoria?: { id?: number; nombre?: string; fecha?: string };
  nombre?: string;
  fecha?: string;
}

const GestionAvalesVicerrectoria = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<Usuario | null>(null);
  const [avalesUsuario, setAvalesUsuario] = useState<Avales | null>(null);
  const [convocatoriasUsuario, setConvocatoriasUsuario] = useState<Convocatoria[] | null>(null);
  const [convocatoriaSeleccionada, setConvocatoriaSeleccionada] = useState<number | null>(null);
  const [perfilCompleto, setPerfilCompleto] = useState<AspiranteDetallado | null>(null);
  const [mostrarPerfilCompleto, setMostrarPerfilCompleto] = useState(false);
  const [loadingPerfil, setLoadingPerfil] = useState(false);

  const isAprobado = (val: unknown): boolean => {
    if (val === true) return true;
    if (typeof val === "number") return val === 1;
    if (typeof val === "string") {
      const s = val.toLowerCase();
      return s === "1" || s === "aprobado" || s === "si" || s === "true";
    }
    return false;
  };

  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get<ApiResponse<Usuario[]>>("/vicerrectoria/usuarios");
      const data = response.data?.data ?? response.data;
      // use `isAprobado` helper defined at component scope

      const normalized: Usuario[] = Array.isArray(data)
        ? data.map((u: unknown) => {
            const obj = u as Record<string, unknown>;
            return {
              id: Number(obj["id"] ?? 0),
              primer_nombre: String(obj["primer_nombre"] ?? obj["nombre_completo"] ?? obj["nombre"] ?? ""),
              segundo_nombre: String(obj["segundo_nombre"] ?? ""),
              primer_apellido: String(obj["primer_apellido"] ?? ""),
              segundo_apellido: String(obj["segundo_apellido"] ?? ""),
              numero_identificacion: String(obj["numero_identificacion"] ?? ""),
              email: String(obj["email"] ?? ""),
              aval_rectoria: isAprobado(obj["aval_rectoria"]),
              aval_vicerrectoria: isAprobado(obj["aval_vicerrectoria"]),
              aval_talento_humano: isAprobado(obj["aval_talento_humano"]),
              aval_rectoria_at: obj["aval_rectoria_at"] ? String(obj["aval_rectoria_at"]) : undefined,
            } as Usuario;
          })
        : [];

      setUsuarios(normalized);
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
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

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
          };
        } else if ("rectoria" in obj || "vicerrectoria" in obj) {
          const rect = obj["rectoria"] as unknown;
          const vic = obj["vicerrectoria"] as unknown;
          const talento = obj["talento_humano"] as unknown;
          // cada uno puede ser un objeto con .estado o un valor directo
          const rectEstado = typeof rect === "object" && rect !== null ? ((rect as Record<string, unknown>)["estado"] ?? rect) : rect;
          const vicEstado = typeof vic === "object" && vic !== null ? ((vic as Record<string, unknown>)["estado"] ?? vic) : vic;
          const talentoEstado = typeof talento === "object" && talento !== null ? ((talento as Record<string, unknown>)["estado"] ?? talento) : talento;
          normalized = {
            aval_rectoria: isAprobado(rectEstado),
            aval_vicerrectoria: isAprobado(vicEstado),
            aval_talento_humano: isAprobado(talentoEstado),
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
      const convs: Convocatoria[] = Array.isArray(data)
        ? data
            .map((p: Postulacion) => {
              const id = p.convocatoria_id ?? p.id_convocatoria ?? p.id ?? p.convocatoria?.id ?? undefined;
              if (!id) return null;
              return {
                id,
                nombre: p.convocatoria?.nombre ?? p.nombre ?? `Convocatoria ${id}`,
                fecha: p.convocatoria?.fecha ?? p.fecha,
              } as Convocatoria;
            })
            .filter((c): c is Convocatoria => c !== null)
        : [];
      setConvocatoriasUsuario(convs);
    } catch (error: unknown) {
      console.warn("No se pudieron obtener convocatorias del usuario o endpoint no existe:", error);
      setConvocatoriasUsuario(null);
    }
  };

  const handleVerDetalles = (usuario: Usuario) => {
    setUsuarioSeleccionado(usuario);
    setConvocatoriasUsuario(null);
    setConvocatoriaSeleccionada(null);
    verAvales(usuario.id);
    fetchConvocatoriasUsuario(usuario.id);
  };

  const verPerfilCompleto = async (userId: number) => {
    try {
      setLoadingPerfil(true);
      const response = await axiosInstance.get(`/admin/aspirantes/${userId}`);
      setPerfilCompleto(response.data.aspirante);
      setMostrarPerfilCompleto(true);
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
    setMostrarPerfilCompleto(false);
    setPerfilCompleto(null);
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

  const columns = useMemo<ColumnDef<Usuario>[]>(
    () => [
      {
        accessorKey: "numero_identificacion",
        header: "Identificación",
        size: 120,
      },
      {
        id: "nombreCompleto",
        header: "Nombre Completo",
        accessorFn: (row) => {
          const nombre = `${row.primer_nombre} ${row.segundo_nombre || ""} ${row.primer_apellido} ${row.segundo_apellido || ""}`.trim();
          return nombre;
        },
        size: 200,
      },
      {
        accessorKey: "email",
        header: "Correo Electrónico",
        size: 200,
      },
      {
        accessorKey: "aval_vicerrectoria",
        header: "Aval Vicerrectoría",
        cell: ({ row }) => {
          const tieneAval = row.original.aval_vicerrectoria;
          return (
            <div className="flex items-center gap-2">
              {tieneAval ? (
                <span className="flex items-center gap-1 text-green-600 font-semibold text-sm">
                  <CheckCircle size={18} className="flex-shrink-0" />
                  <span className="hidden sm:inline">Otorgado</span>
                </span>
              ) : (
                <span className="flex items-center gap-1 text-orange-600 font-semibold text-sm">
                  <XCircle size={18} className="flex-shrink-0" />
                  <span className="hidden sm:inline">Pendiente</span>
                </span>
              )}
            </div>
          );
        },
        size: 130,
      },
      {
        header: "Acciones",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <div className="relative group/btn">
              <button
                onClick={() => verPerfilCompleto(row.original.id)}
                className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 transition-all duration-200"
                title="Ver Perfil Completo"
              >
                <User size={18} />
              </button>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover/btn:opacity-100 transition-opacity pointer-events-none z-10">Ver Perfil Completo</div>
            </div>

            <button
              onClick={() => handleVerHojaVida(row.original)}
              aria-label="Hoja de Vida"
              className="bg-purple-600 text-white p-2 rounded-lg hover:bg-purple-700 transition-colors"
              title="Hoja de Vida"
            >
              <FileText size={18} />
            </button>

            <button
              onClick={() => handleVerDetalles(row.original)}
              aria-label="Ver Avales"
              className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors"
              title="Ver Avales"
            >
              <Eye size={18} />
            </button>

            {!row.original.aval_vicerrectoria && (
              <button
                onClick={() => handleDarAval(row.original.id)}
                aria-label="Dar Aval"
                className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition-colors"
                title="Dar Aval"
              >
                <CheckCircle size={18} />
              </button>
            )}
          </div>
        ),
        size: 180,
      },
    ],
    []
  );

  const estadisticas = useMemo(() => {
    const conAval = usuarios.filter((u) => u.aval_vicerrectoria).length;
    const sinAval = usuarios.filter((u) => !u.aval_vicerrectoria).length;
    return { conAval, sinAval, total: usuarios.length };
  }, [usuarios]);

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
      <div className="w-full">
        <InputSearch
          className="w-full"
          type="text"
          placeholder="Buscar por nombre, identificación o correo..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
        />
      </div>

      {/* Tabla de datos */}
      <div className="w-full overflow-x-auto">
        <DataTable data={usuarios} columns={columns} globalFilter={globalFilter} loading={loading} />
      </div>

      {/* Modal de Avales (sin cambios en estructura o UI) */}
      {usuarioSeleccionado && avalesUsuario && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
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
                  avalesUsuario.aval_vicerrectoria ? "border-green-500 bg-green-50" : "border-orange-500 bg-orange-50"
                }`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                        {avalesUsuario.aval_vicerrectoria ? (
                          <CheckCircle className="text-green-600 flex-shrink-0" size={24} />
                        ) : (
                          <XCircle className="text-orange-600 flex-shrink-0" size={24} />
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

              {/* Convocatoria (sin modificar estructura del modal) */}
              <div className="p-3 sm:p-4 border rounded-lg bg-gray-50">
                <label className="block text-sm font-medium text-gray-700 mb-2">Convocatoria</label>
                {convocatoriasUsuario === null ? (
                  <p className="text-xs text-gray-500">
                    No hay información de convocatorias; si falta, selecciona manualmente o verifica en el backend.
                  </p>
                ) : convocatoriasUsuario.length === 0 ? (
                  <p className="text-xs text-gray-500">No se encontraron postulaciones para este usuario.</p>
                ) : (
                  <select
                    value={convocatoriaSeleccionada ?? ""}
                    onChange={(e) => setConvocatoriaSeleccionada(Number(e.target.value))}
                    className="w-full sm:w-auto border rounded px-3 py-2"
                  >
                    <option value="">-- Selecciona convocatoria --</option>
                    {convocatoriasUsuario.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre ?? `Convocatoria ${c.id}`} {c.fecha ? `- ${c.fecha}` : ""}
                      </option>
                    ))}
                  </select>
                )}
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => usuarioSeleccionado && handleVerHojaVida(usuarioSeleccionado)}
                    disabled={loadingPerfil}
                    className={`bg-purple-600 text-white px-3 py-2 rounded text-sm flex items-center gap-2 ${loadingPerfil ? 'opacity-60 cursor-not-allowed' : 'hover:bg-purple-700'}`}
                  >
                    {loadingPerfil ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
                    Descargar Hoja de Vida
                  </button>
                </div>
              </div>

              <div
                className={`border-2 rounded-lg p-3 sm:p-4 ${
                  avalesUsuario.aval_rectoria ? "border-green-500 bg-green-50" : "border-gray-300 bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-2">
                  {avalesUsuario.aval_rectoria ? (
                    <CheckCircle className="text-green-600 flex-shrink-0" size={24} />
                  ) : (
                    <XCircle className="text-gray-400 flex-shrink-0" size={24} />
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
                  avalesUsuario.aval_talento_humano ? "border-green-500 bg-green-50" : "border-gray-300 bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-2">
                  {avalesUsuario.aval_talento_humano ? (
                    <CheckCircle className="text-green-600 flex-shrink-0" size={24} />
                  ) : (
                    <XCircle className="text-gray-400 flex-shrink-0" size={24} />
                  )}
                  <div>
                    <h3 className="font-bold text-sm sm:text-base">Aval de Talento Humano</h3>
                    <p className="text-xs sm:text-sm text-gray-600">
                      {avalesUsuario.aval_talento_humano ? "Aval otorgado" : "Aval pendiente"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t p-4 bg-gray-50 flex justify-end">
              <button
                onClick={() => {
                  setUsuarioSeleccionado(null);
                  setAvalesUsuario(null);
                  setConvocatoriasUsuario(null);
                  setConvocatoriaSeleccionada(null);
                }}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl my-8">
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
                    <div className={`flex items-center justify-between p-2 rounded ${isAprobado(perfilCompleto.avales.rectoria.estado) ? 'bg-green-100' : 'bg-orange-100'}`}>
                      <span className="font-semibold text-sm">Rectoría</span>
                      <span className={`text-sm flex items-center gap-1 ${isAprobado(perfilCompleto.avales.rectoria.estado) ? 'text-green-700' : 'text-orange-700'}`}>
                        {isAprobado(perfilCompleto.avales.rectoria.estado) ? 'Aprobado' : 'Pendiente'}
                      </span>
                    </div>
                    <div className={`flex items-center justify-between p-2 rounded ${isAprobado(perfilCompleto.avales.vicerrectoria.estado) ? 'bg-green-100' : 'bg-gray-100'}`}>
                      <span className="font-semibold text-sm">Vicerrectoría</span>
                      <span className={`text-sm flex items-center gap-1 ${isAprobado(perfilCompleto.avales.vicerrectoria.estado) ? 'text-green-700' : 'text-gray-600'}`}>
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
                      <div key={idx} className="bg-white p-4 rounded border">
                        <h4 className="font-bold">{exp.cargo} - {exp.empresa}</h4>
                        <p className="text-sm text-gray-600">{exp.descripcion}</p>
                        <p className="text-xs text-gray-500 mt-1">{exp.fecha_inicio} - {exp.fecha_fin || 'Actual'}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {perfilCompleto.estudios && perfilCompleto.estudios.length > 0 && (
                <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2"><GraduationCap size={20} className="text-indigo-600" /> Formación Académica</h3>
                  <div className="space-y-3">
                    {perfilCompleto.estudios.map((est, idx) => (
                      <div key={idx} className="bg-white p-4 rounded border">
                        <h4 className="font-bold">{est.titulo}</h4>
                        <p className="text-sm text-gray-600">{est.institucion}</p>
                        <p className="text-xs text-gray-500">{est.nivel_educativo}</p>
                        <p className="text-xs text-gray-500 mt-1">{est.fecha_inicio} - {est.fecha_fin || 'Actual'}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {perfilCompleto.idiomas && perfilCompleto.idiomas.length > 0 && (
                <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2"><Languages size={20} className="text-indigo-600" /> Idiomas</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {perfilCompleto.idiomas.map((idioma, idx) => (
                      <div key={idx} className="bg-white p-3 rounded border">
                        <p className="font-semibold">{idioma.idioma}</p>
                        <p className="text-sm text-gray-600">Nivel: {idioma.nivel}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {perfilCompleto.documentos && perfilCompleto.documentos.length > 0 && (
                <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2"><FileDown size={20} className="text-indigo-600" /> Documentos</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {perfilCompleto.documentos.map((doc) => (
                      <a key={doc.id} href={doc.url} target="_blank" rel="noopener noreferrer" className="bg-white p-3 rounded border hover:bg-gray-50 flex items-center gap-2">
                        <FileText size={18} className="text-indigo-600" />
                        <span className="text-sm truncate">{doc.nombre}</span>
                      </a>
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

export default GestionAvalesVicerrectoria;