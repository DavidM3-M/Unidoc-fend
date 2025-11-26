// src/protected/vicerrectoria/avales.tsx
import { useEffect, useMemo, useState } from "react";
import axiosInstance from "../../utils/axiosConfig";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "react-toastify";
import axios from "axios";
import { CheckCircle, XCircle, Eye } from "lucide-react";

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
}

interface Avales {
  aval_rectoria: boolean;
  aval_vicerrectoria: boolean;
  aval_talento_humano: boolean;
}

const GestionAvalesVicerrectoria = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<Usuario | null>(null);
  const [avalesUsuario, setAvalesUsuario] = useState<Avales | null>(null);

  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/vicerrectoria/usuarios");
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
      await axiosInstance.post(`/vicerrectoria/aval-hoja-vida/${userId}`);
      setUsuarios((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, aval_vicerrectoria: true } : user
        )
      );
      toast.success("Aval de Vicerrectoría otorgado exitosamente");
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
      const response = await axiosInstance.get(`/vicerrectoria/usuarios/${userId}/avales`);
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

  const columns = useMemo<ColumnDef<Usuario>[]>(
    () => [
      { accessorKey: "numero_identificacion", header: "Identificación", size: 120 },
      {
        id: "nombreCompleto",
        header: "Nombre Completo",
        accessorFn: (row) =>
          `${row.primer_nombre} ${row.segundo_nombre || ""} ${row.primer_apellido} ${row.segundo_apellido || ""}`.trim(),
        size: 200,
      },
      { accessorKey: "email", header: "Correo Electrónico", size: 200 },
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
          <div className="flex flex-col sm:flex-row flex-wrap gap-2">
            <button
              onClick={() => handleVerDetalles(row.original)}
              className="bg-blue-600 text-white px-2 sm:px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-xs sm:text-sm whitespace-nowrap"
            >
              <Eye size={16} className="flex-shrink-0" />
              <span>Ver Avales</span>
            </button>
            {!row.original.aval_vicerrectoria && (
              <button
                onClick={() => handleDarAval(row.original.id)}
                className="bg-green-600 text-white px-2 sm:px-3 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 text-xs sm:text-sm whitespace-nowrap"
              >
                <CheckCircle size={16} className="flex-shrink-0" />
                <span>Dar Aval</span>
              </button>
            )}
          </div>
        ),
        size: 220,
      },
    ],
    []
  );

  // Aquí puedes reutilizar el mismo return que hicimos para Rectoría,
  // cambiando los textos y colores del encabezado a "Gestión de Avales - Vicerrectoría"
  // y adaptando el modal para mostrar aval_vicerrectoria como el principal.
};

export default GestionAvalesVicerrectoria;