// src/protected/rectoria/avales.tsx
import InputSearch from "../../componentes/formularios/InputSearch";
import { DataTable } from "../../componentes/tablas/DataTable";
import { useEffect, useMemo, useState } from "react";
import axiosInstance from "../../utils/axiosConfig";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "react-toastify";
import axios from "axios";
import Cookie from "js-cookie";
import { CheckCircle, XCircle, Eye, FileText,X,Phone,Mail,Briefcase,GraduationCap,Award,Languages,User,FileDown      } from "lucide-react";

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
    categoria_libreta_militar?: string;
    numero_libreta_militar?: string;
    numero_distrito_militar?: string;
    documentos_libreta_militar?: Array<{
      id: number;
      nombre: string;
      url: string;
      tipo: string;
      estado: string;
    }>;
  };
  eps?: {
    nombre_eps?: string;
    tipo_afiliacion?: string;
    estado_afiliacion?: string;
    fecha_afiliacion_efectiva?: string;
    fecha_finalizacion_afiliacion?: string;
    tipo_afiliado?: string;
    numero_afiliado?: string;
    documentos?: Array<{
      id: number;
      nombre: string;
      url: string;
      tipo: string;
      estado: string;
    }>;
  };
  rut?: {
    numero_rut?: string;
    razon_social?: string;
    tipo_persona?: string;
    codigo_ciiu?: string;
    responsabilidades_tributarias?: string;
    documentos?: Array<{
      id: number;
      nombre: string;
      url: string;
      tipo: string;
      estado: string;
    }>;
  };
  idiomas?: Array<{ 
    idioma: string; 
    nivel: string;
    documentos?: Array<{
      id: number;
      nombre: string;
      url: string;
      tipo: string;
      estado: string;
    }>;
   }>;
  experiencias?: Array<{
    cargo: string;
    empresa: string;
    fecha_inicio: string;
    fecha_fin?: string;
    descripcion?: string;
    documentos?: Array<{
      id: number;
      nombre: string;
      url: string;
      tipo: string;
      estado: string;
  }>;
  }>;
  estudios?: Array<{
    titulo: string;
    institucion: string;
    fecha_inicio: string;
    fecha_fin?: string;
    nivel_educativo: string;
    documentos?: Array<{
      id: number;
      nombre: string;
      url: string;
      tipo: string;
      estado: string;
  }>;
  }>;
  produccion_academica?: Array<{
    titulo: string;
    numero_autores?: number;
    medio_divulgacion?: string;
    fecha_divulgacion?: string;
    documentos?: Array<{
      id: number;
      nombre: string;
      url: string;
      tipo: string;
      estado: string;
    }>;
  }>;
  aptitudes?: Array<{
    nombre: string;
    descripcion?: string;
  }>;
  postulaciones?: Array<{
    convocatoriaPostulacion?: { titulo: string; };
  }>;
  documentos?: Array<{
    id: number;
    nombre: string;
    url: string;
    tipo: string;
    categoria: string;
    estado: string;
  }>;
  avales: {
    rectoria: { estado?: string; aprobado_por?: number; fecha?: string; };
    vicerrectoria: { estado?: string; aprobado_por?: number; fecha?: string; };
  };
}

const GestionAvalesRectoria = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<Usuario | null>(null);
  const [avalesUsuario, setAvalesUsuario] = useState<Avales | null>(null);
  const [perfilCompleto, setPerfilCompleto] = useState<AspiranteDetallado | null>(null);
  const [mostrarPerfilCompleto, setMostrarPerfilCompleto] = useState(false);
  const [loadingPerfil, setLoadingPerfil] = useState(false);

  const fetchUsuarios = async () => {
  try {
    setLoading(true);
    const response = await axiosInstance.get("/admin/aspirantes");
    const aspirantes = response.data.aspirantes.data.map((asp: any) => ({
      id: asp.id,
      primer_nombre: asp.nombre_completo.split(' ')[0],
      segundo_nombre: asp.nombre_completo.split(' ')[1] || '',
      primer_apellido: asp.nombre_completo.split(' ')[2] || '',
      segundo_apellido: asp.nombre_completo.split(' ')[3] || '',
      numero_identificacion: asp.numero_identificacion,
      email: asp.email,
      aval_rectoria: asp.aval_rectoria === 'Aprobado',
      aval_vicerrectoria: asp.aval_vicerrectoria === 'Aprobado',
      aval_rectoria_at: asp.aval_rectoria_at,
    }));
    setUsuarios(aspirantes);
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
    await axiosInstance.post(`/admin/aspirantes/${userId}/dar-aval`, {
      tipo_aval: 'rectoria',
      estado: 'Aprobado'
    });
    
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
    setMostrarPerfilCompleto(true);
  } catch (error) {
    console.error("Error al obtener perfil completo:", error);
    toast.error("Error al cargar el perfil del aspirante");
  } finally {
    setLoadingPerfil(false);
  }
};

const cerrarPerfilCompleto = () => {
  setMostrarPerfilCompleto(false);
  setPerfilCompleto(null);
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
      {/* Botón Ver Perfil Completo - NUEVO */}
<div className="relative group/btn">
  <button
    onClick={() => verPerfilCompleto(row.original.id)}
    className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 transition-all duration-200"
  >
    <User size={18} />
  </button>
  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover/btn:opacity-100 transition-opacity pointer-events-none z-10">
    Ver Perfil Completo
  </div>
</div>
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
  size: 180,
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
      {/* Modal de Perfil Completo */}
{mostrarPerfilCompleto && perfilCompleto && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
    <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl my-8">
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
            className="bg-white text-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-50 text-sm font-semibold flex items-center gap-2"
          >
            <FileText size={16} />
            Descargar Hoja de Vida
          </button>
          {perfilCompleto.avales.rectoria.estado !== 'Aprobado' && (
            <button
              onClick={() => handleDarAval(perfilCompleto.id)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm font-semibold flex items-center gap-2"
            >
              <CheckCircle size={16} />
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
           {/* Avales */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
              <Award size={20} className="text-indigo-600" />
              Avales
            </h3>
            <div className="space-y-3">
              <div className={`flex items-center justify-between p-2 rounded ${
                perfilCompleto.avales.rectoria.estado === 'Aprobado' ? 'bg-green-100' : 'bg-orange-100'
              }`}>
                <span className="font-semibold text-sm">Rectoría</span>
                <span className={`text-sm flex items-center gap-1 ${
                  perfilCompleto.avales.rectoria.estado === 'Aprobado' ? 'text-green-700' : 'text-orange-700'
                }`}>
                  {perfilCompleto.avales.rectoria.estado === 'Aprobado' ? (
                    <><CheckCircle size={16} /> Aprobado</>
                  ) : (
                    <><XCircle size={16} /> Pendiente</>
                  )}
                </span>
              </div>
              <div className={`flex items-center justify-between p-2 rounded ${
                perfilCompleto.avales.vicerrectoria.estado === 'Aprobado' ? 'bg-green-100' : 'bg-gray-100'
              }`}>
                <span className="font-semibold text-sm">Vicerrectoría</span>
                <span className={`text-sm flex items-center gap-1 ${
                  perfilCompleto.avales.vicerrectoria.estado === 'Aprobado' ? 'text-green-700' : 'text-gray-600'
                }`}>
                  {perfilCompleto.avales.vicerrectoria.estado === 'Aprobado' ? (
                    <><CheckCircle size={16} /> Aprobado</>
                  ) : (
                    <><XCircle size={16} /> Pendiente</>
                  )}
                </span>
              </div>
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
)}{/* Información Militar */}
{perfilCompleto.informacion_contacto?.categoria_libreta_militar && (
  <div className="bg-gray-50 p-4 rounded-lg">
    <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
      <Award size={20} className="text-indigo-600" />
      Información Militar
    </h3>
    <div className="space-y-2 text-sm">
      <div className="grid grid-cols-2 gap-2">
        <span className="font-semibold text-gray-600">Categoría:</span>
        <span>{perfilCompleto.informacion_contacto.categoria_libreta_militar}</span>
      </div>
      
      {perfilCompleto.informacion_contacto.numero_libreta_militar && (
        <div className="grid grid-cols-2 gap-2">
          <span className="font-semibold text-gray-600">Número:</span>
          <span>{perfilCompleto.informacion_contacto.numero_libreta_militar}</span>
        </div>
      )}
      
      {perfilCompleto.informacion_contacto.numero_distrito_militar && (
        <div className="grid grid-cols-2 gap-2">
          <span className="font-semibold text-gray-600">Distrito:</span>
          <span>{perfilCompleto.informacion_contacto.numero_distrito_militar}</span>
        </div>
      )}
      
      {/* Documentos Libreta Militar */}
      {perfilCompleto.informacion_contacto.documentos_libreta_militar && 
      perfilCompleto.informacion_contacto.documentos_libreta_militar.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="font-semibold text-gray-600 text-sm mb-2">Documentos:</p>
          <div className="space-y-1">
            {perfilCompleto.informacion_contacto.documentos_libreta_militar.map((doc) => (
              <a
                key={doc.id}
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 hover:underline"
              >
                <FileDown size={12} />
                {doc.nombre}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  </div>
)}
           
          {/* EPS y RUT */}
<div className="bg-gray-50 p-4 rounded-lg lg:col-span-2">
  <h3 className="text-lg font-bold text-gray-800 mb-3">Info Adicional</h3>
  
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
    {/* EPS */}
    {perfilCompleto.eps && (
      <div className="bg-white p-3 rounded border">
        <h4 className="font-semibold text-sm text-indigo-600 mb-2 flex items-center gap-2">
          <FileText size={16} />
          EPS
        </h4>
        <div className="space-y-1 text-sm">
          <div className="grid grid-cols-2 gap-2">
            <span className="font-semibold text-gray-600">Nombre:</span>
            <span>{perfilCompleto.eps.nombre_eps}</span>
          </div>
          {perfilCompleto.eps.tipo_afiliacion && (
            <div className="grid grid-cols-2 gap-2">
              <span className="font-semibold text-gray-600">Tipo:</span>
              <span>{perfilCompleto.eps.tipo_afiliacion}</span>
            </div>
          )}
          {perfilCompleto.eps.estado_afiliacion && (
            <div className="grid grid-cols-2 gap-2">
              <span className="font-semibold text-gray-600">Estado:</span>
              <span className={perfilCompleto.eps.estado_afiliacion === 'Activo' ? 'text-green-600 font-semibold' : ''}>
                {perfilCompleto.eps.estado_afiliacion}
              </span>
            </div>
          )}
          {perfilCompleto.eps.fecha_afiliacion_efectiva && (
            <div className="grid grid-cols-2 gap-2">
              <span className="font-semibold text-gray-600">Fecha:</span>
              <span>{perfilCompleto.eps.fecha_afiliacion_efectiva}</span>
            </div>
          )}
          
          {/* Documentos EPS */}
          {perfilCompleto.eps.documentos && perfilCompleto.eps.documentos.length > 0 && (
            <div className="mt-2 pt-2 border-t">
              <p className="font-semibold text-gray-600 text-xs mb-1">Documentos:</p>
              {perfilCompleto.eps.documentos.map((doc) => (
                <a
                  key={doc.id}
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 hover:underline"
                >
                  <FileDown size={12} />
                  {doc.nombre}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    )}

           {/* RUT */}
    {perfilCompleto.rut && (
      <div className="bg-white p-3 rounded border">
        <h4 className="font-semibold text-sm text-indigo-600 mb-2 flex items-center gap-2">
          <FileText size={16} />
          RUT
        </h4>
        <div className="space-y-1 text-sm">
          <div className="grid grid-cols-2 gap-2">
            <span className="font-semibold text-gray-600">Número:</span>
            <span>{perfilCompleto.rut.numero_rut}</span>
          </div>
          {perfilCompleto.rut.razon_social && (
            <div className="grid grid-cols-2 gap-2">
              <span className="font-semibold text-gray-600">Razón Social:</span>
              <span>{perfilCompleto.rut.razon_social}</span>
            </div>
          )}
          {perfilCompleto.rut.tipo_persona && (
            <div className="grid grid-cols-2 gap-2">
              <span className="font-semibold text-gray-600">Tipo:</span>
              <span>{perfilCompleto.rut.tipo_persona}</span>
            </div>
          )}
          {perfilCompleto.rut.codigo_ciiu && (
            <div className="grid grid-cols-2 gap-2">
              <span className="font-semibold text-gray-600">CIIU:</span>
              <span className="text-xs">{perfilCompleto.rut.codigo_ciiu}</span>
            </div>
          )}
          
          {/* Documentos RUT */}
          {perfilCompleto.rut.documentos && perfilCompleto.rut.documentos.length > 0 && (
            <div className="mt-2 pt-2 border-t">
              <p className="font-semibold text-gray-600 text-xs mb-1">Documentos:</p>
              {perfilCompleto.rut.documentos.map((doc) => (
                <a
                  key={doc.id}
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 hover:underline"
                >
                  <FileDown size={12} />
                  {doc.nombre}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    )}
  </div>
</div>

         
        </div>
 {/* Aptitudes */}
            {perfilCompleto.aptitudes && perfilCompleto.aptitudes.length > 0 && (
              <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <Award size={20} className="text-indigo-600" />
                  Aptitudes y Habilidades
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {perfilCompleto.aptitudes.map((aptitud, idx) => (
                    <div key={idx} className="bg-white p-3 rounded border border-indigo-200">
                      <p className="font-semibold text-indigo-700">{aptitud.nombre}</p>
                      {aptitud.descripcion && (
                        <p className="text-sm text-gray-600 mt-1">{aptitud.descripcion}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
           {/* Producción Académica */}
{perfilCompleto.produccion_academica && perfilCompleto.produccion_academica.length > 0 && (
  <div className="mt-6 bg-gray-50 p-4 rounded-lg">
    <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
      <GraduationCap size={20} className="text-indigo-600" />
      Producción Académica
    </h3>
    <div className="space-y-3">
      {perfilCompleto.produccion_academica.map((prod, idx) => (
        <div key={idx} className="bg-white p-4 rounded border">
          <h4 className="font-bold text-gray-800">{prod.titulo}</h4>
          <div className="space-y-1 mt-2 text-sm">
            {prod.numero_autores && (
              <div className="flex gap-2">
                <span className="text-gray-600 font-semibold">Autores:</span>
                <span>{prod.numero_autores}</span>
              </div>
            )}
            {prod.medio_divulgacion && (
              <div className="flex gap-2">
                <span className="text-gray-600 font-semibold">Medio:</span>
                <span>{prod.medio_divulgacion}</span>
              </div>
            )}
            {prod.fecha_divulgacion && (
              <div className="flex gap-2">
                <span className="text-gray-600 font-semibold">Fecha:</span>
                <span>{prod.fecha_divulgacion}</span>
              </div>
            )}
          </div>
          
          {prod.documentos && prod.documentos.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-xs font-semibold text-gray-600 mb-2">Documentos de soporte:</p>
              <div className="flex flex-wrap gap-2">
                {prod.documentos.map((doc) => (
                  <a
                    key={doc.id}
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 hover:underline bg-indigo-50 px-2 py-1 rounded"
                  >
                    <FileDown size={12} />
                    {doc.nombre}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  </div>
)}

        {/* Experiencias */}
        {perfilCompleto.experiencias && perfilCompleto.experiencias.length > 0 && (
          <div className="mt-6 bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
              <Briefcase size={20} className="text-indigo-600" />
              Experiencia Laboral
            </h3>
            <div className="space-y-3">
              {perfilCompleto.experiencias.map((exp, idx) => (
                <div key={idx} className="bg-white p-4 rounded border">
                  <h4 className="font-bold">{exp.cargo}</h4>
                  <p className="text-sm text-gray-600">{exp.empresa}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {exp.fecha_inicio} - {exp.fecha_fin || 'Actualidad'}
                  </p>
                  {exp.descripcion && <p className="text-sm mt-2">{exp.descripcion}</p>}
                {/* Documentos */}
          {exp.documentos && exp.documentos.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-xs font-semibold text-gray-600 mb-2">Documentos de soporte:</p>
              <div className="flex flex-wrap gap-2">
                {exp.documentos.map((doc) => (
                  <a
                    key={doc.id}
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 hover:underline bg-indigo-50 px-2 py-1 rounded"
                  >
                    <FileDown size={12} />
                    {doc.nombre}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
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
                <div key={idx} className="bg-white p-4 rounded border">
                  <h4 className="font-bold">{est.titulo}</h4>
                  <p className="text-sm text-gray-600">{est.institucion}</p>
                  <p className="text-xs text-gray-500">{est.nivel_educativo}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {est.fecha_inicio} - {est.fecha_fin || 'En curso'}
                  </p>
                {/* Documentos */}
          {est.documentos && est.documentos.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-xs font-semibold text-gray-600 mb-2">Documentos de soporte:</p>
              <div className="flex flex-wrap gap-2">
                {est.documentos.map((doc) => (
                  <a
                    key={doc.id}
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 hover:underline bg-indigo-50 px-2 py-1 rounded"
                  >
                    <FileDown size={12} />
                    {doc.nombre}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
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
                <div key={idx} className="bg-white p-3 rounded border">
                  <p className="font-semibold">{idioma.idioma}</p>
                  <p className="text-sm text-gray-600">Nivel: {idioma.nivel}</p>
               {/* Documentos */}
          {idioma.documentos && idioma.documentos.length > 0 && (
            <div className="mt-2 pt-2 border-t border-gray-200">
              <p className="text-xs font-semibold text-gray-600 mb-1">Certificados:</p>
              {idioma.documentos.map((doc) => (
                <a
                  key={doc.id}
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 hover:underline mt-1"
                >
                  <FileDown size={12} />
                  {doc.nombre}
                </a>
              ))}
            </div>
          )}
        </div>
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
                <a  
                  key={doc.id}
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white p-3 rounded border hover:bg-gray-50 flex items-center gap-2"
                >
                  <FileText size={18} className="text-indigo-600" />
                  <span className="text-sm truncate">{doc.nombre}</span>
                </a>
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
</div>
  );
};
export default GestionAvalesRectoria;