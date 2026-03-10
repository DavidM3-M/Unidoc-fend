import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { ColumnDef } from "@tanstack/react-table";
import axiosInstance from "../../../utils/axiosConfig";
import {
  CreditCard,
  Eye,
  User,
  Calendar,
  FileText,
  CheckCircle,
  XCircle,
  Briefcase,
  AlertTriangle,
} from "lucide-react";
import { DataTable2 } from "../../../componentes/tablas/DataTable2";
import CustomDialog from "../../../componentes/CustomDialogForm";
import DetallePostulacion from "./DetallePostulacion";

interface Postulacion {
  id_postulacion: number;
  convocatoria_id: number;
  user_id: number;
  nombre_postulante: string;
  estado_postulacion: string;
  aval_talento_humano?: boolean;
  fecha_postulacion: string;
  usuario_postulacion: {
    primer_nombre: string;
    primer_apellido: string;
    numero_identificacion: string;
    email?: string;
  };
  convocatoria_postulacion: {
    nombre_convocatoria: string;
    estado_convocatoria: string;
  };
}

interface Contratacion {
  id_contratacion: number;
  user_id: number;
  id_convocatoria?: number;
  tipo_contrato?: string;
  fecha_inicio?: string;
}

const ListarPostulaciones = () => {
  const [postulaciones, setPostulaciones] = useState<Postulacion[]>([]);

  // CAMBIO: Guardamos el mapa completo de contrataciones por usuario
  // para poder saber cuántos contratos tiene cada uno y detectar doble contratación.
  const [contratacionesPorUsuario, setContratacionesPorUsuario] = useState<Record<number, Contratacion[]>>({});

  const [loading, setLoading] = useState(true);
  const [postulacionSeleccionada, setPostulacionSeleccionada] = useState<Postulacion | null>(null);
  const [openDetalle, setOpenDetalle] = useState(false);

  const fetchDatos = async () => {
    try {
      setLoading(true);
      const [postulacionesRes, contratacionesRes] = await Promise.all([
        axiosInstance.get("/talentoHumano/obtener-postulaciones"),
        axiosInstance.get("/talentoHumano/obtener-contrataciones"),
      ]);

      if (postulacionesRes.data?.data) {
        setPostulaciones(postulacionesRes.data.data);
        sessionStorage.setItem("postulaciones", JSON.stringify(postulacionesRes.data.data));
      }

      // CAMBIO: Agrupamos contrataciones por user_id (en lugar de solo lista de IDs)
      if (contratacionesRes.data?.contrataciones) {
        const agrupadas = (contratacionesRes.data.contrataciones as Contratacion[]).reduce(
          (acc, c) => {
            if (!acc[c.user_id]) acc[c.user_id] = [];
            acc[c.user_id].push(c);
            return acc;
          },
          {} as Record<number, Contratacion[]>
        );
        setContratacionesPorUsuario(agrupadas);
      }
    } catch (error) {
      console.error("Error al obtener datos:", error);
      toast.error("Error al sincronizar con el servidor");
      const cached = sessionStorage.getItem("postulaciones");
      if (cached) setPostulaciones(JSON.parse(cached));
    } finally {
      setLoading(false);
    }
  };

  const handleVerPostulacion = (postulacion: Postulacion) => {
    setPostulacionSeleccionada(postulacion);
    setOpenDetalle(true);
  };

  const handleCerrarDetalle = () => {
    setOpenDetalle(false);
    setPostulacionSeleccionada(null);
  };

  const columns = useMemo<ColumnDef<Postulacion>[]>(
    () => [
      {
        accessorKey: "usuario_postulacion.primer_nombre",
        header: () => (
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span>Nombre</span>
          </div>
        ),
        cell: ({ row }) => {
          const usuario = row.original.usuario_postulacion;
          const userId = row.original.user_id;
          const nombreCompleto = `${usuario.primer_nombre} ${usuario.primer_apellido}`;

          // CAMBIO: obtenemos todas las contrataciones del usuario
          const contrataciones = contratacionesPorUsuario[userId] ?? [];
          const esDocente = contrataciones.length > 0;

          return (
            <div className="flex items-center gap-3">
              <div
                className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 border ${
                  esDocente
                    ? "bg-amber-100 border-amber-300"
                    : "bg-blue-100 border-blue-200"
                }`}
              >
                <User
                  className={`h-5 w-5 ${esDocente ? "text-amber-600" : "text-blue-600"}`}
                />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-gray-900 leading-none">
                    {nombreCompleto}
                  </span>

                  {/* NUEVO: Badge Docente Activo (reemplaza al badge anterior que solo decía "Docente") */}
                  {esDocente && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 text-amber-700 text-[10px] font-bold uppercase border border-amber-300">
                      <Briefcase size={10} className="stroke-[3px]" />
                      Docente Activo
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-gray-500 mt-1">
                  {usuario.email || "Sin correo registrado"}
                </span>

                {/* NUEVO: Advertencia de doble contratación si ya tiene contrato */}
                {esDocente && (
                  <div className="flex items-center gap-1 mt-1">
                    <AlertTriangle size={10} className="text-amber-500" />
                    <span className="text-[10px] text-amber-600 font-medium">
                      {contrataciones.length} contrato{contrataciones.length > 1 ? "s" : ""} activo{contrataciones.length > 1 ? "s" : ""}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "usuario_postulacion.numero_identificacion",
        header: () => (
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            <span>Identificación</span>
          </div>
        ),
        cell: ({ row }) => (
          <p className="font-medium text-gray-700">
            {row.original.usuario_postulacion.numero_identificacion || "---"}
          </p>
        ),
      },
      {
        accessorKey: "convocatoria_postulacion.nombre_convocatoria",
        header: () => (
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span>Convocatoria</span>
          </div>
        ),
        cell: ({ row }) => (
          <p
            className="text-sm text-gray-600 max-w-[200px] truncate"
            title={row.original.convocatoria_postulacion.nombre_convocatoria}
          >
            {row.original.convocatoria_postulacion.nombre_convocatoria}
          </p>
        ),
      },
      {
        accessorKey: "estado_postulacion",
        header: "Aval T.H.",
        cell: ({ row }) => {
          const aval = row.original.aval_talento_humano;
          return (
            <div className="flex items-center gap-2">
              <span
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                  aval
                    ? "bg-green-100 text-green-700 border border-green-200"
                    : "bg-amber-100 text-amber-700 border border-amber-200"
                }`}
              >
                {aval ? <CheckCircle size={12} /> : <XCircle size={12} />}
                {aval ? "Aprobado" : "Pendiente"}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "fecha_postulacion",
        header: () => (
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>Fecha</span>
          </div>
        ),
        cell: ({ row }) => (
          <span className="text-sm text-gray-500 italic">
            {new Date(row.original.fecha_postulacion).toLocaleDateString()}
          </span>
        ),
      },
      {
        id: "acciones",
        header: "Acciones",
        cell: ({ row }) => {
          const userId = row.original.user_id;
          const contrataciones = contratacionesPorUsuario[userId] ?? [];
          const esDocente = contrataciones.length > 0;

          return (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleVerPostulacion(row.original)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border shadow-sm ${
                  esDocente
                    ? "bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-300"
                    : "bg-white hover:bg-green-50 text-green-600 border-green-200"
                }`}
              >
                <Eye className="w-4 h-4" />
                DETALLES
                {/* NUEVO: Pequeño ícono de alerta si es docente activo */}
                {esDocente && <AlertTriangle className="w-3 h-3" />}
              </button>
            </div>
          );
        },
      },
    ],
    // CAMBIO: El memo depende de contratacionesPorUsuario (antes era usuariosContratados)
    [contratacionesPorUsuario]
  );

  useEffect(() => {
    fetchDatos();
  }, []);

  return (
    <div className="flex flex-col gap-4 h-full w-full bg-slate-50 rounded-3xl p-4 sm:p-6 lg:p-8 min-h-screen">
      {/* NUEVO: Leyenda informativa */}
      <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 text-sm text-amber-700">
        <AlertTriangle size={16} className="shrink-0" />
        <span>
          Los postulantes marcados como{" "}
          <span className="font-bold">Docente Activo</span> ya tienen
          contrato(s) vigente(s). Puede gestionarlos para doble contratación
          desde la vista de detalles.
        </span>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <DataTable2 data={postulaciones} columns={columns} loading={loading} />
      </div>

      <CustomDialog
        title={`Detalles de Postulación${
          postulacionSeleccionada
            ? `: ${postulacionSeleccionada.usuario_postulacion.primer_nombre} ${postulacionSeleccionada.usuario_postulacion.primer_apellido}`
            : ""
        }`}
        open={openDetalle}
        onClose={handleCerrarDetalle}
        width="1200px"
      >
        {postulacionSeleccionada && (
          <DetallePostulacion postulacion={postulacionSeleccionada} />
        )}
      </CustomDialog>
    </div>
  );
};

export default ListarPostulaciones;