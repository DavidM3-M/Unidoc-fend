import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { ColumnDef } from "@tanstack/react-table";
import { ChevronRight, Languages, ListChecks, PlusCircle } from "lucide-react";
import axiosInstance from "../../../utils/axiosConfig";
import { mensajeDeErrorApi } from "../../../utils/erroresApi";
import { DataTable2 } from "../../../componentes/tablas/DataTable2";
import CustomDialog from "../../../componentes/CustomDialogForm";
import EliminarBoton from "../../../componentes/EliminarBoton";
import { ButtonRegresar } from "../../../componentes/formularios/ButtonRegresar";
import { BotonEditar, EstadoBadge } from "./ControlesCatalogo";
import IdiomaModal from "./IdiomaModal";
import ExamenIdiomaModal from "./ExamenIdiomaModal";
import RangosExamenModal from "./RangosExamenModal";
import type { ExamenIdioma, Idioma } from "../../../types/catalogos";

const ENDPOINT_IDIOMAS = import.meta.env.VITE_ENDPOINT_ADMIN_IDIOMAS;
const ENDPOINT_EXAMENES = import.meta.env.VITE_ENDPOINT_ADMIN_EXAMENES_IDIOMA;

/**
 * Catálogo de idiomas y, colgando de cada uno, sus exámenes de certificación con puntaje
 * numérico (IELTS, TOEFL iBT, Cambridge...).
 *
 * Maestro-detalle igual que Producción académica: un examen no existe suelto, y el idioma al que
 * pertenece sale de la fila seleccionada. Los rangos de cada examen (puntaje → nivel MCER) se
 * administran en un tercer nivel, dentro de `RangosExamenModal`.
 *
 * Este catálogo es solo el lado del Administrador: todavía no está conectado con el formulario
 * de Docente/Aspirante ni con `CalculoPuntajeDocenteService`.
 */
const CatalogoIdiomas = () => {
  const [idiomas, setIdiomas] = useState<Idioma[]>([]);
  const [examenes, setExamenes] = useState<ExamenIdioma[]>([]);
  const [cargandoIdiomas, setCargandoIdiomas] = useState(true);
  const [cargandoExamenes, setCargandoExamenes] = useState(false);

  // Se guarda el ID y no el objeto: así, al recargar la lista tras un cambio, la selección se
  // resuelve contra los datos frescos y se limpia sola si el idioma fue eliminado.
  const [seleccionadoId, setSeleccionadoId] = useState<number | null>(null);

  const [modalIdioma, setModalIdioma] = useState<{ abierto: boolean; idioma: Idioma | null }>({
    abierto: false,
    idioma: null,
  });

  const [modalExamen, setModalExamen] = useState<{ abierto: boolean; examen: ExamenIdioma | null }>({
    abierto: false,
    examen: null,
  });

  const [modalRangos, setModalRangos] = useState<{ abierto: boolean; examen: ExamenIdioma | null }>({
    abierto: false,
    examen: null,
  });

  const seleccionado = idiomas.find((i) => i.id_idioma_catalogo === seleccionadoId) ?? null;

  const fetchIdiomas = async () => {
    try {
      setCargandoIdiomas(true);
      const respuesta = await axiosInstance.get(ENDPOINT_IDIOMAS);
      setIdiomas(respuesta.data?.data ?? []);
    } catch (error) {
      console.error("Error al obtener los idiomas:", error);
      toast.error(mensajeDeErrorApi(error, "Error al cargar los idiomas"));
    } finally {
      setCargandoIdiomas(false);
    }
  };

  const fetchExamenes = async (idIdioma: number) => {
    try {
      setCargandoExamenes(true);
      const respuesta = await axiosInstance.get(ENDPOINT_EXAMENES, {
        params: { idioma_id: idIdioma },
      });
      setExamenes(respuesta.data?.data ?? []);
    } catch (error) {
      console.error("Error al obtener los exámenes de idioma:", error);
      toast.error(mensajeDeErrorApi(error, "Error al cargar los exámenes de idioma"));
    } finally {
      setCargandoExamenes(false);
    }
  };

  useEffect(() => {
    fetchIdiomas();
  }, []);

  useEffect(() => {
    if (seleccionadoId === null) {
      setExamenes([]);
      return;
    }

    fetchExamenes(seleccionadoId);
  }, [seleccionadoId]);

  const eliminarIdioma = async (id: number) => {
    try {
      await axiosInstance.delete(`${ENDPOINT_IDIOMAS}/${id}`);
      toast.success("Idioma eliminado.");

      if (seleccionadoId === id) setSeleccionadoId(null);
      fetchIdiomas();
    } catch (error) {
      console.error("Error al eliminar el idioma:", error);
      // El 409 llega con el detalle de cuántos exámenes lo bloquean y la sugerencia de inactivarlo.
      toast.error(mensajeDeErrorApi(error, "No se pudo eliminar el idioma."), { autoClose: 6000 });
    }
  };

  const eliminarExamen = async (id: number) => {
    try {
      await axiosInstance.delete(`${ENDPOINT_EXAMENES}/${id}`);
      toast.success("Examen de idioma eliminado.");

      if (seleccionadoId !== null) fetchExamenes(seleccionadoId);
      fetchIdiomas();
    } catch (error) {
      console.error("Error al eliminar el examen de idioma:", error);
      toast.error(mensajeDeErrorApi(error, "No se pudo eliminar el examen de idioma."), { autoClose: 6000 });
    }
  };

  const handleIdiomaGuardado = () => {
    setModalIdioma({ abierto: false, idioma: null });
    fetchIdiomas();
  };

  const handleExamenGuardado = () => {
    setModalExamen({ abierto: false, examen: null });
    if (seleccionadoId !== null) fetchExamenes(seleccionadoId);
    fetchIdiomas();
  };

  const handleRangosCerrado = () => {
    setModalRangos({ abierto: false, examen: null });
    if (seleccionadoId !== null) fetchExamenes(seleccionadoId);
  };

  const columnasIdiomas = useMemo<ColumnDef<Idioma>[]>(
    () => [
      {
        accessorKey: "nombre_idioma",
        header: "Idioma",
        cell: ({ row }) => {
          const idioma = row.original;
          const esSeleccionado = idioma.id_idioma_catalogo === seleccionadoId;

          return (
            <button
              type="button"
              onClick={() => setSeleccionadoId(idioma.id_idioma_catalogo)}
              aria-pressed={esSeleccionado}
              className={`flex items-center gap-1.5 text-left transition-colors ${
                esSeleccionado ? "font-bold text-[#e8740e]" : "font-medium text-gray-900 hover:text-[#1e3a5f]"
              }`}
            >
              <ChevronRight className={`h-4 w-4 flex-shrink-0 ${esSeleccionado ? "text-[#e8740e]" : "text-[#6b7a8d]"}`} />
              <span className="whitespace-normal">{idioma.nombre_idioma}</span>
            </button>
          );
        },
      },
      {
        id: "examenes",
        accessorFn: (fila) => fila.examenes_count ?? 0,
        header: "Exámenes",
        cell: ({ row }) => (
          <span className="inline-flex items-center justify-center min-w-[2rem] px-2.5 py-1 rounded-full text-xs font-bold bg-[#1e3a5f]/10 text-[#1e3a5f]">
            {row.original.examenes_count ?? 0}
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
            <BotonEditar onClick={() => setModalIdioma({ abierto: true, idioma: row.original })} />
            <EliminarBoton id={row.original.id_idioma_catalogo} onConfirmDelete={eliminarIdioma} />
          </div>
        ),
      },
    ],
    [seleccionadoId]
  );

  const columnasExamenes = useMemo<ColumnDef<ExamenIdioma>[]>(
    () => [
      {
        accessorKey: "nombre_examen",
        header: "Examen",
        cell: ({ row }) => <span className="font-medium text-gray-900">{row.original.nombre_examen}</span>,
      },
      {
        id: "vigencia",
        accessorFn: (fila) => fila.vigencia_meses ?? "No vence",
        header: "Vigencia",
        cell: ({ row }) =>
          row.original.vigencia_meses ? `${row.original.vigencia_meses} meses` : "No vence",
      },
      {
        id: "rangos",
        accessorFn: (fila) => fila.rangos_count ?? 0,
        header: "Rangos",
        cell: ({ row }) => (
          <button
            type="button"
            onClick={() => setModalRangos({ abierto: true, examen: row.original })}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1e3a5f] hover:text-[#e8740e]"
          >
            <ListChecks className="h-3.5 w-3.5" />
            {row.original.rangos_count ?? 0} rango(s)
          </button>
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
            <BotonEditar onClick={() => setModalExamen({ abierto: true, examen: row.original })} />
            <EliminarBoton id={row.original.id_examen_idioma} onConfirmDelete={eliminarExamen} />
          </div>
        ),
      },
    ],
    [seleccionadoId]
  );

  return (
    <div className="flex flex-col gap-6 w-full max-w-[1700px] mx-auto">
      <div className="flex items-center gap-4">
        <Link to="/dashboard">
          <ButtonRegresar />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#1e3a5f] flex items-center gap-2">
            <Languages className="h-6 w-6 text-[#e8740e]" />
            Catálogo de idiomas
          </h1>
          <p className="text-sm text-[#6b7a8d]">
            Idiomas y sus exámenes de certificación con puntaje numérico
          </p>
        </div>
      </div>

      {/* Maestro y detalle en paralelo, igual que Producción académica. Por debajo de xl no
          caben dos tablas, así que se apilan. */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
        {/* Maestro: idiomas */}
        <div className="bg-white border border-[rgba(30,58,95,0.09)] rounded-xl shadow-md p-6 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="text-lg font-bold text-[#1e3a5f]">Idiomas</h2>
              <p className="text-sm text-[#6b7a8d]">Haz clic en un nombre para ver sus exámenes al lado.</p>
            </div>

            <button
              onClick={() => setModalIdioma({ abierto: true, idioma: null })}
              className="inline-flex items-center justify-center gap-2 bg-[#e8740e] hover:bg-[#c2600b] text-white px-5 py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transition-colors whitespace-nowrap"
            >
              <PlusCircle className="h-5 w-5" />
              Nuevo idioma
            </button>
          </div>

          <div className="overflow-x-auto">
            <DataTable2
              data={idiomas}
              columns={columnasIdiomas}
              loading={cargandoIdiomas}
              searchPlaceholder="Buscar idioma..."
            />
          </div>
        </div>

        {/* Detalle: exámenes del idioma seleccionado */}
        <div className="bg-white border border-[rgba(30,58,95,0.09)] rounded-xl shadow-md p-6 min-w-0">
          {seleccionado ? (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div className="min-w-0">
                  <h2 className="text-lg font-bold text-[#1e3a5f] break-words">
                    Exámenes de «{seleccionado.nombre_idioma}»
                  </h2>
                  <p className="text-sm text-[#6b7a8d]">
                    Cada examen define sus propios rangos de puntaje → nivel MCER.
                  </p>
                </div>

                <button
                  onClick={() => setModalExamen({ abierto: true, examen: null })}
                  className="inline-flex items-center justify-center gap-2 bg-[#e8740e] hover:bg-[#c2600b] text-white px-5 py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transition-colors whitespace-nowrap"
                >
                  <PlusCircle className="h-5 w-5" />
                  Nuevo examen
                </button>
              </div>

              <div className="overflow-x-auto">
                <DataTable2
                  data={examenes}
                  columns={columnasExamenes}
                  loading={cargandoExamenes}
                  searchPlaceholder="Buscar examen..."
                />
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
              <div className="rounded-full bg-[#f3ede1] p-3">
                <Languages className="h-7 w-7 text-[#e8740e]" />
              </div>
              <h2 className="text-lg font-bold text-[#1e3a5f]">Ningún idioma seleccionado</h2>
              <p className="max-w-md text-sm text-[#6b7a8d]">
                Haz clic en el nombre de un idioma, en la tabla de al lado, para administrar sus
                exámenes de certificación aquí.
              </p>
            </div>
          )}
        </div>
      </div>

      {modalIdioma.abierto && (
        <CustomDialog
          title={modalIdioma.idioma ? "Editar idioma" : "Nuevo idioma"}
          open={modalIdioma.abierto}
          onClose={() => setModalIdioma({ abierto: false, idioma: null })}
          width="600px"
        >
          <IdiomaModal
            idioma={modalIdioma.idioma}
            onSuccess={handleIdiomaGuardado}
            onCancel={() => setModalIdioma({ abierto: false, idioma: null })}
          />
        </CustomDialog>
      )}

      {modalExamen.abierto && seleccionado && (
        <CustomDialog
          title={modalExamen.examen ? "Editar examen de idioma" : "Nuevo examen de idioma"}
          open={modalExamen.abierto}
          onClose={() => setModalExamen({ abierto: false, examen: null })}
          width="600px"
        >
          <ExamenIdiomaModal
            idioma={seleccionado}
            examen={modalExamen.examen}
            onSuccess={handleExamenGuardado}
            onCancel={() => setModalExamen({ abierto: false, examen: null })}
          />
        </CustomDialog>
      )}

      {modalRangos.abierto && modalRangos.examen && (
        <CustomDialog
          title={`Rangos de puntaje — ${modalRangos.examen.nombre_examen}`}
          open={modalRangos.abierto}
          onClose={handleRangosCerrado}
          width="700px"
        >
          <RangosExamenModal examen={modalRangos.examen} onClose={handleRangosCerrado} />
        </CustomDialog>
      )}
    </div>
  );
};

export default CatalogoIdiomas;
