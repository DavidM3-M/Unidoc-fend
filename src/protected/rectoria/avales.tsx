// src/protected/rectoria/avales.tsx
import InputSearch from "../../componentes/formularios/InputSearch";
import { DataTable } from "../../componentes/tablas/DataTable";
import { useEffect, useMemo, useState } from "react";
import axiosInstance from "../../utils/axiosConfig";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "react-toastify";
import axios from "axios";
import Cookie from "js-cookie";
import { CheckCircle, XCircle, Eye, FileText } from "lucide-react";
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
}

interface Avales {
  aval_rectoria: boolean;
  aval_vicerrectoria: boolean;
  aval_talento_humano: boolean;
}

const GestionAvalesRectoria = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<Usuario | null>(null);
  const [avalesUsuario, setAvalesUsuario] = useState<Avales | null>(null);

  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/rectoria/usuarios");
      setUsuarios(response.data.data);
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
      toast.error("Error al cargar los usuarios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const handleDarAval = async (userId: number) => {
    try {
      await axiosInstance.post(`/rectoria/aval-hoja-vida/${userId}`);
      
      setUsuarios((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, aval_rectoria: true } : user
        )
      );

      toast.success("Aval de Rectoría otorgado exitosamente");
      
      if (usuarioSeleccionado?.id === userId) {
        verAvales(userId);
      }
    } catch (error) {
      console.error("Error al dar aval:", error);
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.error || "Error al otorgar el aval");
      }
    }
  };

  const verAvales = async (userId: number) => {
    try {
      const response = await axiosInstance.get(`/rectoria/usuarios/${userId}/avales`);
      setAvalesUsuario(response.data.data);
    } catch (error) {
      console.error("Error al obtener avales:", error);
      toast.error("Error al cargar los avales");
    }
  };

  const handleVerDetalles = (usuario: Usuario) => {
    setUsuarioSeleccionado(usuario);
    verAvales(usuario.id);
  };
  const [userRole, setUserRole] = useState<string | null>(null);

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
      setUserRole(rol);
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
    const url = `/rectoria/hoja-de-vida-pdf/${idUsuario}`;
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
        accessorKey: "aval_rectoria",
        header: "Aval Rectoría",
        cell: ({ row }) => {
          const tieneAval = row.original.aval_rectoria;
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
    <div className="flex justify-center gap-1">
      {/* Botón Hoja de Vida */}
      <div className="relative group/btn">
        <button
          onClick={() => handleVerHojaVida(row.original.id)}
          className="bg-purple-600 text-white p-2 rounded-lg hover:bg-purple-700 transition-all duration-200"
        >
          <FileText size={18} />
        </button>
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover/btn:opacity-100 transition-opacity pointer-events-none z-10">
          Hoja de Vida
        </div>
      </div>

      {/* Botón Ver Avales */}
      <div className="relative group/btn">
        <button
          onClick={() => handleVerDetalles(row.original)}
          className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-all duration-200"
        >
          <Eye size={18} />
        </button>
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover/btn:opacity-100 transition-opacity pointer-events-none z-10">
          Ver Avales
        </div>
      </div>

      {/* Botón Dar Aval */}
      {!row.original.aval_rectoria && (
        <div className="relative group/btn">
          <button
            onClick={() => handleDarAval(row.original.id)}
            className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition-all duration-200"
          >
            <CheckCircle size={18} />
          </button>
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover/btn:opacity-100 transition-opacity pointer-events-none z-10">
            Dar Aval
          </div>
        </div>
      )}
    </div>
  ),
  size: 150,
},
    ],
    []
  );

  const estadisticas = useMemo(() => {
    const conAval = usuarios.filter(u => u.aval_rectoria).length;
    const sinAval = usuarios.filter(u => !u.aval_rectoria).length;
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
              <span>Gestión de Avales - Rectoría</span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              Revisa y otorga avales a las hojas de vida
            </p>
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
        <DataTable
          data={usuarios}
          columns={columns}
          globalFilter={globalFilter}
          loading={loading}
        />
      </div>

      {/* Modal de Avales */}
      {usuarioSeleccionado && avalesUsuario && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
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
                avalesUsuario.aval_rectoria ? 'border-green-500 bg-green-50' : 'border-orange-500 bg-orange-50'
              }`}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {avalesUsuario.aval_rectoria ? (
                      <CheckCircle className="text-green-600 flex-shrink-0" size={24} />
                    ) : (
                      <XCircle className="text-orange-600 flex-shrink-0" size={24} />
                    )}
                    <div>
                      <h3 className="font-bold text-base sm:text-lg">Aval de Rectoría</h3>
                      <p className="text-xs sm:text-sm text-gray-600 mt-1">
                        {avalesUsuario.aval_rectoria ? 'Aval otorgado' : 'Aval pendiente'}
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
                avalesUsuario.aval_vicerrectoria ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-gray-50'
              }`}>
                <div className="flex items-center gap-2">
                  {avalesUsuario.aval_vicerrectoria ? (
                    <CheckCircle className="text-green-600 flex-shrink-0" size={24} />
                  ) : (
                    <XCircle className="text-gray-400 flex-shrink-0" size={24} />
                  )}
                  <div>
                    <h3 className="font-bold text-sm sm:text-base">Aval de Vicerrectoría</h3>
                    <p className="text-xs sm:text-sm text-gray-600">
                      {avalesUsuario.aval_vicerrectoria ? 'Aval otorgado' : 'Aval pendiente'}
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
                onClick={() => setUsuarioSeleccionado(null)}
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

export default GestionAvalesRectoria;