// src/protected/admin/usuarios.tsx
import InputSearch from "../../componentes/formularios/InputSearch";
import { DataTable } from "../../componentes/tablas/DataTable";
import { useEffect, useMemo, useState } from "react";
import axiosInstance from "../../utils/axiosConfig";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "react-toastify";
import axios from "axios";
import { Link } from "react-router-dom";
import { ButtonRegresar } from "../../componentes/formularios/ButtonRegresar";
import { Download, UserCog } from "lucide-react";

// Interfaz para los datos de usuarios
interface Usuario {
  id: number;
  primer_nombre: string;
  segundo_nombre?: string;
  primer_apellido: string;
  segundo_apellido?: string;
  numero_identificacion: string;
  email: string;
  telefono?: string;
  rol: string;
  created_at: string;
}

// Interfaz para roles
interface Rol {
  id: number;
  name: string;
}

const GestionUsuarios = () => {
  // Estados
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [roles, setRoles] = useState<Rol[]>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [exportando, setExportando] = useState(false);

  // Función para obtener usuarios
  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/admin/usuarios");
      setUsuarios(response.data.usuarios);
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
      toast.error("Error al cargar los usuarios");
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener roles disponibles
  const fetchRoles = async () => {
    try {
      const response = await axiosInstance.get("/admin/roles");
      setRoles(response.data);
    } catch (error) {
      console.error("Error al obtener roles:", error);
      toast.error("Error al cargar los roles");
    }
  };

  useEffect(() => {
    fetchUsuarios();
    fetchRoles();
  }, []);

  // Función para cambiar el rol de un usuario
  const handleCambiarRol = async (usuarioId: number, nuevoRol: string) => {
    try {
      await axiosInstance.put(`/admin/usuarios/${usuarioId}/cambiar-rol`, {
        rol: nuevoRol,
      });

      // Actualizar el estado local
      setUsuarios((prev) =>
        prev.map((user) =>
          user.id === usuarioId ? { ...user, rol: nuevoRol } : user
        )
      );

      toast.success("Rol actualizado correctamente");
    } catch (error) {
      console.error("Error al cambiar rol:", error);
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Error al cambiar el rol");
      }
    }
  };

  // Función para exportar a Excel
  const handleExportarExcel = async () => {
    try {
      setExportando(true);
      const response = await axiosInstance.get("/admin/usuarios/exportar-excel", {
        responseType: "blob",
      });

      // Crear un blob y descargarlo
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `usuarios_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success("Usuarios exportados correctamente");
    } catch (error) {
      console.error("Error al exportar:", error);
      toast.error("Error al exportar los usuarios");
    } finally {
      setExportando(false);
    }
  };

  // Definir las columnas de la tabla
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
        accessorKey: "telefono",
        header: "Teléfono",
        size: 120,
      },
      {
        accessorKey: "rol",
        header: "Rol Actual",
        cell: ({ row }) => {
          const rolColor = {
            Administrador: "bg-purple-100 text-purple-800",
            "Talento Humano": "bg-blue-100 text-blue-800",
            "Apoyo Profesoral": "bg-green-100 text-green-800",
            Aspirante: "bg-gray-100 text-gray-800",
            Docente: "bg-yellow-100 text-yellow-800",
            Vicerrectoría: "bg-indigo-100 text-indigo-800",
            Coordinación: "bg-pink-100 text-pink-800",
            "Sin rol": "bg-red-100 text-red-800",
          }[row.original.rol] || "bg-gray-100 text-gray-800";

          return (
            <span className={`inline-block px-2 sm:px-3 py-1 text-xs font-semibold rounded-full ${rolColor}`}>
              {row.original.rol}
            </span>
          );
        },
        size: 150,
      },
      {
        accessorKey: "created_at",
        header: "Fecha Registro",
        size: 120,
      },
      {
        header: "Acciones",
        cell: ({ row }) => (
          <div className="flex gap-2">
            <select
              className="border border-gray-300 rounded px-2 sm:px-3 py-1 text-xs sm:text-sm hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => {
                const nuevoRol = e.target.value;
                if (nuevoRol && nuevoRol !== row.original.rol) {
                  handleCambiarRol(row.original.id, nuevoRol);
                }
              }}
              value={row.original.rol}
            >
              <option value="" disabled>
                Cambiar rol...
              </option>
              {roles.map((rol) => (
                <option key={rol.id} value={rol.name}>
                  {rol.name}
                </option>
              ))}
            </select>
          </div>
        ),
        size: 180,
      },
    ],
    [roles]
  );

  // Estadísticas por rol
  const estadisticas = useMemo(() => {
    const conteoRoles = usuarios.reduce((acc, user) => {
      acc[user.rol] = (acc[user.rol] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return conteoRoles;
  }, [usuarios]);

  return (
    <div className="flex flex-col gap-4 w-full bg-white rounded-xl sm:rounded-2xl lg:rounded-3xl p-4 sm:p-6 lg:p-8 min-h-screen">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-col sm:flex-row w-full sm:w-auto">
          <div className="flex gap-1">
            <Link to={"/dashboard"}>
              <ButtonRegresar />
            </Link>
          </div>
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 flex items-center gap-2 flex-wrap">
              <UserCog size={28} className="text-blue-600 flex-shrink-0" />
              <span>Gestión de Usuarios</span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              Administra los usuarios y sus roles en el sistema
            </p>
          </div>
        </div>

        {/* Botón de exportar */}
        <button
          onClick={handleExportarExcel}
          disabled={exportando}
          className={`w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-colors text-sm sm:text-base ${
            exportando
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700 text-white"
          }`}
        >
          <Download size={18} className="flex-shrink-0" />
          <span className="whitespace-nowrap">{exportando ? "Exportando..." : "Exportar a Excel"}</span>
        </button>
      </div>

      {/* Estadísticas por rol */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 mb-4">
        {Object.entries(estadisticas).map(([rol, cantidad]) => {
          const colorMap = {
            Administrador: "from-purple-500 to-purple-600",
            "Talento Humano": "from-blue-500 to-blue-600",
            "Apoyo Profesoral": "from-green-500 to-green-600",
            Aspirante: "from-gray-500 to-gray-600",
            Docente: "from-yellow-500 to-yellow-600",
            Vicerrectoría: "from-indigo-500 to-indigo-600",
            Coordinación: "from-pink-500 to-pink-600",
            "Sin rol": "from-red-500 to-red-600",
          }[rol] || "from-gray-500 to-gray-600";

          return (
            <div
              key={rol}
              className={`bg-gradient-to-br ${colorMap} p-3 sm:p-4 rounded-lg text-white shadow-md`}
            >
              <p className="text-xs sm:text-sm font-medium opacity-90 truncate">{rol}</p>
              <p className="text-2xl sm:text-3xl font-bold mt-1">{cantidad}</p>
            </div>
          );
        })}
      </div>

      {/* Total de usuarios */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-3 sm:p-4 mb-4">
        <p className="text-xs sm:text-sm text-blue-800">
          <strong>Total de usuarios registrados:</strong> {usuarios.length}
        </p>
      </div>

      {/* Campo de búsqueda */}
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
    </div>
  );
};

export default GestionUsuarios;