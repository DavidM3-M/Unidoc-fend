import { useCallback } from "react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { ColumnDef } from "@tanstack/react-table";
import { GraduationCap, Info, PlusCircle } from "lucide-react";
import axiosInstance from "../../../utils/axiosConfig";
import { mensajeDeErrorApi } from "../../../utils/erroresApi";
import { DataTable2 } from "../../../componentes/tablas/DataTable2";
import CustomDialog from "../../../componentes/CustomDialogForm";
import EliminarBoton from "../../../componentes/EliminarBoton";
import { ButtonRegresar } from "../../../componentes/formularios/ButtonRegresar";
import { BotonEditar, EstadoBadge } from "./ControlesCatalogo";
import NivelFormacionAcademicaModal from "./NivelFormacionAcademicaModal";
import type { NivelFormacionAcademica } from "../../../types/catalogos";

const ENDPOINT = import.meta.env.VITE_ENDPOINT_ADMIN_NIVELES_FORMACION_ACADEMICA;

/**
 * Catálogo de niveles de formación académica.
 *
 * A diferencia de Producción académica y Tipos de experiencia, aquí Nivel Académico y Nivel de
 * Formación son texto libre: no hay lista fija SNIES ni validación cruzada entre ambos campos.
 * Catálogo independiente por ahora — nada lo referencia todavía.
 */
const CatalogoNivelesFormacionAcademica = () => {
  const [niveles, setNiveles] = useState<NivelFormacionAcademica[]>([]);
  const [cargando, setCargando] = useState(true);
  const [modal, setModal] = useState<{ abierto: boolean; nivel: NivelFormacionAcademica | null }>({
    abierto: false,
    nivel: null,
  });

  const fetchNiveles = async () => {
    try {
      setCargando(true);
      const respuesta = await axiosInstance.get(ENDPOINT);
      setNiveles(respuesta.data?.data ?? []);
    } catch (error) {
      console.error("Error al obtener los niveles de formación académica:", error);
      toast.error(mensajeDeErrorApi(error, "Error al cargar los niveles de formación académica"));
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    fetchNiveles();
  }, []);

  const eliminarNivel = useCallback(async (id: number) => {
    try {
      await axiosInstance.delete(`${ENDPOINT}/${id}`);
      toast.success("Nivel de formación académica eliminado.");
      fetchNiveles();
    } catch (error) {
      console.error("Error al eliminar el nivel de formación académica:", error);
      toast.error(mensajeDeErrorApi(error, "No se pudo eliminar el nivel de formación académica."));
    }
  }, []);

  const handleGuardado = () => {
    setModal({ abierto: false, nivel: null });
    fetchNiveles();
  };

  const columnas = useMemo<ColumnDef<NivelFormacionAcademica>[]>(
    () => [
      {
        accessorKey: "nivel_academico",
        header: "Nivel académico",
        cell: ({ row }) => (
          <span className="font-medium text-gray-900">{row.original.nivel_academico}</span>
        ),
      },
      {
        accessorKey: "nivel_formacion",
        header: "Nivel de formación",
      },
      {
        accessorKey: "orden",
        header: "Orden escalafón",
        cell: ({ row }) =>
          row.original.orden === null ? (
            <span
              className="text-xs text-[#6b7a8d]"
              title="No participa en el escalafón: se registra en la hoja de vida pero no sirve para ascender"
            >
              No aplica
            </span>
          ) : (
            <span className="font-semibold tabular-nums text-[#1e3a5f]">{row.original.orden}</span>
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
            <BotonEditar onClick={() => setModal({ abierto: true, nivel: row.original })} />
            <EliminarBoton
              id={row.original.id_nivel_formacion_academica}
              onConfirmDelete={eliminarNivel}
            />
          </div>
        ),
      },
    ],
    [eliminarNivel]
  );

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto">
      <div className="flex items-center gap-4">
        <Link to="/dashboard">
          <ButtonRegresar />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#1e3a5f] flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-[#e8740e]" />
            Formación académica
          </h1>
          <p className="text-sm text-[#6b7a8d]">
            Nivel académico y nivel de formación disponibles al registrar estudios
          </p>
        </div>
      </div>

      <div className="bg-white border border-[rgba(30,58,95,0.09)] rounded-xl shadow-md p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-bold text-[#1e3a5f]">Catálogo</h2>
            <p className="text-sm text-[#6b7a8d]">
              Un nivel nuevo queda disponible de inmediato en los formularios.
            </p>
          </div>

          <button
            onClick={() => setModal({ abierto: true, nivel: null })}
            className="inline-flex items-center justify-center gap-2 bg-[#e8740e] hover:bg-[#c2600b] text-white px-6 py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transition-colors"
          >
            <PlusCircle className="h-5 w-5" />
            Nuevo nivel
          </button>
        </div>

        <div className="mb-4 flex items-start gap-2 rounded-lg bg-[rgba(30,58,95,0.04)] p-3 text-xs text-[#2c3e50]">
          <Info className="h-4 w-4 flex-shrink-0 text-[#1e3a5f]" />
          <p>
            Nivel académico y nivel de formación son campos de texto libre — no hay lista fija ni
            validación cruzada entre ambos. Para retirar un nivel de los formularios sin perder el
            histórico, edítalo y desmarca <span className="font-semibold">Activo</span>.
          </p>
        </div>

        <div className="overflow-x-auto">
          <DataTable2
            data={niveles}
            columns={columnas}
            loading={cargando}
            searchPlaceholder="Buscar nivel de formación..."
          />
        </div>
      </div>

      {modal.abierto && (
        <CustomDialog
          title={modal.nivel ? "Editar nivel de formación" : "Nuevo nivel de formación"}
          open={modal.abierto}
          onClose={() => setModal({ abierto: false, nivel: null })}
          width="600px"
        >
          <NivelFormacionAcademicaModal
            nivel={modal.nivel}
            onSuccess={handleGuardado}
            onCancel={() => setModal({ abierto: false, nivel: null })}
          />
        </CustomDialog>
      )}
    </div>
  );
};

export default CatalogoNivelesFormacionAcademica;
