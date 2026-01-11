// src/protected/vicerrectoria/avales.tsx
import InputSearch from "../../componentes/formularios/InputSearch";
import { DataTable } from "../../componentes/tablas/DataTable";
import { useEffect, useMemo, useState } from "react";
import axiosInstance from "../../utils/axiosConfig";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "react-toastify";
import { CheckCircle, XCircle, Eye, FileText } from "lucide-react";
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

  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get<ApiResponse<Usuario[]>>("/vicerrectoria/usuarios");
      const data = response.data?.data ?? response.data;
      setUsuarios(data ?? []);
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
      await axiosInstance.post(`/vicerrectoria/aval-hoja-vida/${userId}`);
      setUsuarios((prev) => prev.map((u) => (u.id === userId ? { ...u, aval_vicerrectoria: true } : u)));
      toast.success("Aval de Vicerrectoría otorgado exitosamente");
      if (usuarioSeleccionado?.id === userId) verAvales(userId);
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
      const response = await axiosInstance.get<ApiResponse<Avales>>(`/vicerrectoria/usuarios/${userId}/avales`);
      const data = response.data?.data ?? response.data;
      setAvalesUsuario(data ?? null);
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

  /**
   * handleVerHojaVida
   * - Según tus rutas actuales, Vicerrectoría expone: GET /vicerrectoria/hoja-de-vida-pdf/{idUsuario}
   * - No se modifica el modal ni su estado desde aquí.
   * - Si no hay convocatorias cargadas, se intenta cargarlas en background antes de fallar.
   */
  const handleVerHojaVida = async (user: Usuario) => {
    // Intentar cargar convocatorias si aún no se han cargado (evita condición de carrera)
    if (convocatoriasUsuario === null) {
      await fetchConvocatoriasUsuario(user.id);
    }

    // Según las rutas actuales en backend, la URL para Vicerrectoría usa solo user.id
    // Usamos la ruta de un parámetro para evitar pedir convocatoria innecesaria.
    try {
      const response = await axiosInstance.get(`/vicerrectoria/hoja-de-vida-pdf/${user.id}`, {
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

      // Si no es PDF, leer blob como texto para mostrar mensaje
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
                    className="bg-purple-600 text-white px-3 py-2 rounded hover:bg-purple-700 text-sm"
                  >
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
    </div>
  );
};

export default GestionAvalesVicerrectoria;