import { useCallback } from "react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { ColumnDef } from "@tanstack/react-table";
import { Briefcase, Info, PlusCircle } from "lucide-react";
import axiosInstance from "../../../utils/axiosConfig";
import { mensajeDeErrorApi } from "../../../utils/erroresApi";
import { DataTable2 } from "../../../componentes/tablas/DataTable2";
import CustomDialog from "../../../componentes/CustomDialogForm";
import EliminarBoton from "../../../componentes/EliminarBoton";
import { ButtonRegresar } from "../../../componentes/formularios/ButtonRegresar";
import { BotonEditar, EstadoBadge } from "./ControlesCatalogo";
import TipoExperienciaModal from "./TipoExperienciaModal";
import type { TipoExperiencia } from "../../../types/catalogos";

const ENDPOINT = import.meta.env.VITE_ENDPOINT_ADMIN_TIPOS_EXPERIENCIA;

/**
 * Catálogo de tipos de experiencia profesional.
 *
 * A diferencia de los ámbitos de divulgación, aquí no hay jerarquía: es una lista plana. Lo que
 * sí tiene particular es que las experiencias y convocatorias lo referencian por nombre, así que
 * renombrar arrastra registros históricos y borrar exige que nadie lo esté usando.
 */
const CatalogoTiposExperiencia = () => {
  const [tipos, setTipos] = useState<TipoExperiencia[]>([]);
  const [cargando, setCargando] = useState(true);
  const [modal, setModal] = useState<{ abierto: boolean; tipo: TipoExperiencia | null }>({
    abierto: false,
    tipo: null,
  });

  const fetchTipos = async () => {
    try {
      setCargando(true);
      const respuesta = await axiosInstance.get(ENDPOINT);
      setTipos(respuesta.data?.data ?? []);
    } catch (error) {
      console.error("Error al obtener los tipos de experiencia:", error);
      toast.error(mensajeDeErrorApi(error, "Error al cargar los tipos de experiencia"));
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    fetchTipos();
  }, []);

  const eliminarTipo = useCallback(async (id: number) => {
    try {
      await axiosInstance.delete(`${ENDPOINT}/${id}`);
      toast.success("Tipo de experiencia eliminado.");
      fetchTipos();
    } catch (error) {
      console.error("Error al eliminar el tipo de experiencia:", error);
      // El 409 detalla cuántas experiencias y convocatorias lo bloquean.
      toast.error(mensajeDeErrorApi(error, "No se pudo eliminar el tipo de experiencia."), {
        autoClose: 6000,
      });
    }
  }, []);

  const handleGuardado = () => {
    setModal({ abierto: false, tipo: null });
    fetchTipos();
  };

  const columnas = useMemo<ColumnDef<TipoExperiencia>[]>(
    () => [
      {
        accessorKey: "nombre_tipo_experiencia",
        header: "Tipo de experiencia",
        cell: ({ row }) => (
          <span className="font-medium text-gray-900">
            {row.original.nombre_tipo_experiencia}
          </span>
        ),
      },
      {
        id: "usos",
        accessorFn: (fila) => fila.experiencias_count ?? 0,
        header: "Experiencias que lo usan",
        cell: ({ row }) => (
          <span className="inline-flex items-center justify-center min-w-[2rem] px-2.5 py-1 rounded-full text-xs font-bold bg-[#1e3a5f]/10 text-[#1e3a5f]">
            {row.original.experiencias_count ?? 0}
          </span>
        ),
      },
      {
        id: "estado",
        accessorFn: (fila) => (fila.activo ? "Activo" : "Inactivo"),
        header: "Estado",
        cell: ({ row }) => <EstadoBadge activo={row.original.activo} />,
      },
      {
        id: "acciones",
        header: "Acciones",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <BotonEditar
              onClick={() => setModal({ abierto: true, tipo: row.original })}
            />
            <EliminarBoton
              id={row.original.id_tipo_experiencia}
              onConfirmDelete={eliminarTipo}
            />
          </div>
        ),
      },
    ],
    [eliminarTipo]
  );

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto">
      <div className="flex items-center gap-4">
        <Link to="/dashboard">
          <ButtonRegresar />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#1e3a5f] flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-[#e8740e]" />
            Tipos de experiencia profesional
          </h1>
          <p className="text-sm text-[#6b7a8d]">
            Opciones disponibles al registrar experiencia laboral y al crear convocatorias
          </p>
        </div>
      </div>

      <div className="bg-white border border-[rgba(30,58,95,0.09)] rounded-xl shadow-md p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-bold text-[#1e3a5f]">Catálogo</h2>
            <p className="text-sm text-[#6b7a8d]">
              Un tipo nuevo queda disponible de inmediato en los formularios.
            </p>
          </div>

          <button
            onClick={() => setModal({ abierto: true, tipo: null })}
            className="inline-flex items-center justify-center gap-2 bg-[#e8740e] hover:bg-[#c2600b] text-white px-6 py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transition-colors"
          >
            <PlusCircle className="h-5 w-5" />
            Nuevo tipo de experiencia
          </button>
        </div>

        <div className="mb-4 flex items-start gap-2 rounded-lg bg-[rgba(30,58,95,0.04)] p-3 text-xs text-[#2c3e50]">
          <Info className="h-4 w-4 flex-shrink-0 text-[#1e3a5f]" />
          <p>
            Un tipo que ya está en uso no se puede eliminar. Para retirarlo de los formularios
            sin perder el histórico, edítalo y desmarca la casilla{" "}
            <span className="font-semibold">Activo</span>.
          </p>
        </div>

        <div className="overflow-x-auto">
          <DataTable2
            data={tipos}
            columns={columnas}
            loading={cargando}
            searchPlaceholder="Buscar tipo de experiencia..."
          />
        </div>
      </div>

      {modal.abierto && (
        <CustomDialog
          title={
            modal.tipo ? "Editar tipo de experiencia" : "Nuevo tipo de experiencia"
          }
          open={modal.abierto}
          onClose={() => setModal({ abierto: false, tipo: null })}
          width="600px"
        >
          <TipoExperienciaModal
            tipo={modal.tipo}
            onSuccess={handleGuardado}
            onCancel={() => setModal({ abierto: false, tipo: null })}
          />
        </CustomDialog>
      )}
    </div>
  );
};

export default CatalogoTiposExperiencia;
