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
      const response = await axiosInstance.get("/admin/listar-usuarios");
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
      const response = await axiosInstance.get("/admin/listar-roles");
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

      // Crear un blob, descargarlo y liberar el object URL para evitar fuga de memoria
      const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = blobUrl;
      link.setAttribute("download", `usuarios_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);

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
          return (
            <span className="inline-block px-3 py-1 text-xs font-bold bg-[#f3ede1] text-[#1e3a5f] border border-[rgba(30,58,95,0.1)] rounded-full">
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
              className="border border-[rgba(30,58,95,0.2)] bg-[#ffffff] text-[#2c3e50] rounded-lg px-2 sm:px-3 py-1.5 text-xs sm:text-sm hover:border-[#1e3a5f] focus:outline-none focus:ring-2 focus:ring-[#e8740e] transition-colors"
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
    <div className="flex flex-col gap-6 w-full bg-[#f3ede1] min-h-screen p-4 sm:p-6 lg:p-8 font-sans text-[#2c3e50]">
      <div className="bg-[#ffffff] rounded-2xl shadow-lg border border-[rgba(30,58,95,0.09)] p-4 sm:p-6 lg:p-8">
        
        {/* Encabezado */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-col sm:flex-row w-full sm:w-auto">
            <div className="flex gap-1">
              <Link to={"/dashboard"}>
                <ButtonRegresar />
              </Link>
            </div>
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-[#1e3a5f] flex items-center gap-2 flex-wrap tracking-tight">
                <UserCog size={28} className="text-[#e8740e] flex-shrink-0" />
                <span>Gestión de Usuarios</span>
              </h1>
              <p className="text-xs sm:text-sm text-[#6b7a8d] mt-1 font-medium">
                Administra los usuarios y sus roles en el sistema
              </p>
            </div>
          </div>

          {/* Botón de exportar */}
          <button
            onClick={handleExportarExcel}
            disabled={exportando}
            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-bold transition-all shadow-md text-sm sm:text-base ${
              exportando
                ? "bg-[#6b7a8d] cursor-not-allowed text-white"
                : "bg-[#e8740e] hover:bg-[#c2600b] text-white"
            }`}
          >
            <Download size={18} className="flex-shrink-0" />
            <span className="whitespace-nowrap">{exportando ? "Exportando..." : "Exportar a Excel"}</span>
          </button>
        </div>

        {/* Estadísticas por rol */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 mb-6">
          {Object.entries(estadisticas).map(([rol, cantidad], index) => {
            const paleta = [
              'border-[#1e3a5f]', 
              'border-[#e8740e]', 
              'border-[#c89b14]', 
              'border-[#2c3e50]', 
              'border-[#6b7a8d]'
            ];
            const colorBorde = paleta[index % paleta.length];

            return (
              <div
                key={rol}
                className={`bg-[#ffffff] border-l-4 ${colorBorde} border-y border-r border-[rgba(30,58,95,0.09)] p-3 sm:p-4 rounded-r-lg shadow-sm`}
              >
                <p className="text-[10px] sm:text-xs font-bold text-[#6b7a8d] uppercase tracking-wider truncate">{rol}</p>
                <p className="text-2xl sm:text-3xl font-black text-[#1e3a5f] mt-1">{cantidad}</p>
              </div>
            );
          })}
        </div>

        {/* Total de usuarios */}
        <div className="bg-[#f3ede1] border-l-4 border-[#e8740e] p-3 sm:p-4 mb-6 rounded-r-lg">
          <p className="text-xs sm:text-sm text-[#1e3a5f] font-medium">
            <strong className="font-black">Total de usuarios registrados:</strong> {usuarios.length}
          </p>
        </div>

        {/* Campo de búsqueda */}
        <div className="w-full mb-6">
          <InputSearch
            className="w-full"
            type="text"
            placeholder="Buscar por nombre, identificación o correo..."
            value={globalFilter}
            onChange={(e: any) => setGlobalFilter(e.target.value)}
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
    </div>
  );
};

export default GestionUsuarios;