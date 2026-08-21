import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { ColumnDef } from "@tanstack/react-table";
import { GraduationCap, Info, PlusCircle, Save } from "lucide-react";
import axiosInstance from "../../../utils/axiosConfig";
import { mensajeDeErrorApi } from "../../../utils/erroresApi";
import { DataTable2 } from "../../../componentes/tablas/DataTable2";
import CustomDialog from "../../../componentes/CustomDialogForm";
import EliminarBoton from "../../../componentes/EliminarBoton";
import { ButtonRegresar } from "../../../componentes/formularios/ButtonRegresar";
import { BotonEditar, EstadoBadge } from "../catalogos/ControlesCatalogo";
import EscalonDocenteModal from "./EscalonDocenteModal";
import ReglaExcepcionEscalonModal from "./ReglaExcepcionEscalonModal";
import type { AmbitoDivulgacion, EscalonDocente, ReglaExcepcionEscalon } from "../../../types/catalogos";

const ENDPOINT_ESCALONES = import.meta.env.VITE_ENDPOINT_ADMIN_ESCALONES_DOCENTE;
const ENDPOINT_REGLAS = import.meta.env.VITE_ENDPOINT_ADMIN_REGLAS_EXCEPCION_ESCALON;
const ENDPOINT_AMBITOS = import.meta.env.VITE_ENDPOINT_ADMIN_AMBITOS_DIVULGACION;

type Pestana = "escalones" | "excepciones" | "puntajes";

const TABS: { id: Pestana; label: string }[] = [
  { id: "escalones", label: "Escalones" },
  { id: "excepciones", label: "Excepciones" },
  { id: "puntajes", label: "Puntajes de producción académica" },
];

const requisitos = (escalon: EscalonDocente): string[] => {
  const lista: string[] = [];
  if (escalon.formacion_minima) lista.push(escalon.formacion_minima);
  if (escalon.nivel_mcer_minimo) {
    const nombreIdioma = escalon.idioma?.nombre_idioma ?? "Idioma";
    lista.push(`${nombreIdioma} ${escalon.nivel_mcer_minimo}`);
  }
  if (escalon.puntaje_minimo != null) lista.push(`≥ ${escalon.puntaje_minimo} puntos`);
  if (escalon.meses_minimos != null) {
    const anios = Math.round((escalon.meses_minimos / 12) * 10) / 10;
    lista.push(`≥ ${escalon.meses_minimos} meses (${anios} años)`);
  }
  if (escalon.evaluacion_minima != null) lista.push(`Evaluación ≥ ${escalon.evaluacion_minima}`);
  return lista;
};

/**
 * Escalafón docente: escalones y sus requisitos, excepciones (reglas de piso, ej. "tiene
 * Doctorado -> mínimo Asociado"), y puntajes de producción académica — todo lo que consume
 * `MotorEscalafonDocenteService` en un solo lugar administrable.
 */
const EscalafonDocente = () => {
  const [tab, setTab] = useState<Pestana>("escalones");

  const [escalones, setEscalones] = useState<EscalonDocente[]>([]);
  const [cargandoEscalones, setCargandoEscalones] = useState(true);
  const [modalEscalon, setModalEscalon] = useState<{ abierto: boolean; escalon: EscalonDocente | null }>({
    abierto: false,
    escalon: null,
  });

  const [reglas, setReglas] = useState<ReglaExcepcionEscalon[]>([]);
  const [cargandoReglas, setCargandoReglas] = useState(true);
  const [modalRegla, setModalRegla] = useState<{ abierto: boolean; regla: ReglaExcepcionEscalon | null }>({
    abierto: false,
    regla: null,
  });

  const [ambitos, setAmbitos] = useState<AmbitoDivulgacion[]>([]);
  const [cargandoAmbitos, setCargandoAmbitos] = useState(true);
  const [puntajesEditados, setPuntajesEditados] = useState<Record<number, string>>({});
  const [guardandoPuntaje, setGuardandoPuntaje] = useState<number | null>(null);

  const fetchEscalones = async () => {
    try {
      setCargandoEscalones(true);
      const respuesta = await axiosInstance.get(ENDPOINT_ESCALONES);
      setEscalones(respuesta.data?.data ?? []);
    } catch (error) {
      console.error("Error al obtener los escalones:", error);
      toast.error(mensajeDeErrorApi(error, "Error al cargar los escalones"));
    } finally {
      setCargandoEscalones(false);
    }
  };

  const fetchReglas = async () => {
    try {
      setCargandoReglas(true);
      const respuesta = await axiosInstance.get(ENDPOINT_REGLAS);
      setReglas(respuesta.data?.data ?? []);
    } catch (error) {
      console.error("Error al obtener las excepciones:", error);
      toast.error(mensajeDeErrorApi(error, "Error al cargar las excepciones"));
    } finally {
      setCargandoReglas(false);
    }
  };

  const fetchAmbitos = async () => {
    try {
      setCargandoAmbitos(true);
      const respuesta = await axiosInstance.get(ENDPOINT_AMBITOS);
      setAmbitos(respuesta.data?.data ?? []);
    } catch (error) {
      console.error("Error al obtener los ámbitos de divulgación:", error);
      toast.error(mensajeDeErrorApi(error, "Error al cargar los ámbitos de divulgación"));
    } finally {
      setCargandoAmbitos(false);
    }
  };

  useEffect(() => {
    fetchEscalones();
    fetchReglas();
    fetchAmbitos();
  }, []);

  const eliminarEscalon = async (id: number) => {
    try {
      await axiosInstance.delete(`${ENDPOINT_ESCALONES}/${id}`);
      toast.success("Escalón eliminado.");
      fetchEscalones();
    } catch (error) {
      console.error("Error al eliminar el escalón:", error);
      toast.error(mensajeDeErrorApi(error, "No se pudo eliminar el escalón."), { autoClose: 6000 });
    }
  };

  const eliminarRegla = async (id: number) => {
    try {
      await axiosInstance.delete(`${ENDPOINT_REGLAS}/${id}`);
      toast.success("Excepción eliminada.");
      fetchReglas();
    } catch (error) {
      console.error("Error al eliminar la excepción:", error);
      toast.error(mensajeDeErrorApi(error, "No se pudo eliminar la excepción."));
    }
  };

  const guardarPuntaje = async (ambito: AmbitoDivulgacion) => {
    const valor = puntajesEditados[ambito.id_ambito_divulgacion];
    if (valor === undefined || valor === String(ambito.puntaje)) return;

    const puntaje = Number(valor);
    if (!Number.isInteger(puntaje) || puntaje < 0) {
      toast.error("El puntaje debe ser un número entero mayor o igual a 0.");
      return;
    }

    try {
      setGuardandoPuntaje(ambito.id_ambito_divulgacion);
      await axiosInstance.put(`${ENDPOINT_AMBITOS}/${ambito.id_ambito_divulgacion}`, { puntaje });
      toast.success(`Puntaje de «${ambito.nombre_ambito_divulgacion}» actualizado.`);
      fetchAmbitos();
      setPuntajesEditados((prev) => {
        const { [ambito.id_ambito_divulgacion]: _quitar, ...resto } = prev;
        return resto;
      });
    } catch (error) {
      console.error("Error al actualizar el puntaje del ámbito:", error);
      toast.error(mensajeDeErrorApi(error, "No se pudo actualizar el puntaje."));
    } finally {
      setGuardandoPuntaje(null);
    }
  };

  const columnasEscalones = useMemo<ColumnDef<EscalonDocente>[]>(
    () => [
      {
        accessorKey: "orden",
        header: "Orden",
        cell: ({ row }) => (
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#1e3a5f]/10 text-[#1e3a5f] text-xs font-bold">
            {row.original.orden}
          </span>
        ),
      },
      {
        accessorKey: "nombre",
        header: "Escalón",
        cell: ({ row }) => <span className="font-bold text-gray-900">{row.original.nombre}</span>,
      },
      {
        id: "requisitos",
        header: "Requisitos",
        cell: ({ row }) => {
          const lista = requisitos(row.original);
          return lista.length === 0 ? (
            <span className="text-xs text-[#9aa7b5]">Sin requisitos (escalón base)</span>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {lista.map((req) => (
                <span
                  key={req}
                  className="inline-flex items-center rounded-full bg-[rgba(30,58,95,0.06)] px-2.5 py-1 text-xs font-semibold text-[#1e3a5f]"
                >
                  {req}
                </span>
              ))}
            </div>
          );
        },
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
            <BotonEditar onClick={() => setModalEscalon({ abierto: true, escalon: row.original })} />
            <EliminarBoton id={row.original.id_escalon} onConfirmDelete={eliminarEscalon} />
          </div>
        ),
      },
    ],
    []
  );

  const columnasReglas = useMemo<ColumnDef<ReglaExcepcionEscalon>[]>(
    () => [
      {
        id: "condicion",
        header: "Condición",
        cell: ({ row }) => (
          <span className="text-sm text-gray-900">
            Tiene un estudio aprobado de tipo{" "}
            <span className="font-bold text-[#e8740e]">{row.original.valor_condicion}</span>
          </span>
        ),
      },
      {
        id: "otorga",
        header: "Otorga como mínimo",
        cell: ({ row }) => (
          <span className="inline-flex items-center rounded-full bg-[#1e3a5f]/10 px-3 py-1 text-xs font-bold text-[#1e3a5f]">
            {row.original.escalon_otorgado?.nombre ?? "—"}
          </span>
        ),
      },
      {
        id: "estado",
        accessorFn: (fila) => (fila.activo ? "Activa" : "Inactiva"),
        header: "Estado",
        cell: ({ row }) => <EstadoBadge activo={row.original.activo} />,
      },
      {
        id: "acciones",
        header: "Acciones",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <BotonEditar onClick={() => setModalRegla({ abierto: true, regla: row.original })} />
            <EliminarBoton id={row.original.id_regla_excepcion} onConfirmDelete={eliminarRegla} />
          </div>
        ),
      },
    ],
    []
  );

  return (
    <div className="flex flex-col gap-6 w-full max-w-[1400px] mx-auto">
      <div className="flex items-center gap-4">
        <Link to="/dashboard">
          <ButtonRegresar />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#1e3a5f] flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-[#e8740e]" />
            Escalafón docente
          </h1>
          <p className="text-sm text-[#6b7a8d]">
            Escalones, excepciones y puntajes que usa la evaluación automática del escalafón
          </p>
        </div>
      </div>

      <div className="flex gap-1 border-b border-[rgba(30,58,95,0.12)]">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors ${
              tab === id
                ? "border-[#e8740e] text-[#1e3a5f]"
                : "border-transparent text-[#6b7a8d] hover:text-[#1e3a5f]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "escalones" && (
        <div className="bg-white border border-[rgba(30,58,95,0.09)] rounded-xl shadow-md p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="text-lg font-bold text-[#1e3a5f]">Escalones</h2>
              <p className="text-sm text-[#6b7a8d]">
                Cada escalón exige que se cumplan todos sus requisitos a la vez.
              </p>
            </div>
            <button
              onClick={() => setModalEscalon({ abierto: true, escalon: null })}
              className="inline-flex items-center justify-center gap-2 bg-[#e8740e] hover:bg-[#c2600b] text-white px-6 py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transition-colors"
            >
              <PlusCircle className="h-5 w-5" />
              Nuevo escalón
            </button>
          </div>

          <div className="mb-4 flex items-start gap-2 rounded-lg bg-[rgba(30,58,95,0.04)] p-3 text-xs text-[#2c3e50]">
            <Info className="h-4 w-4 flex-shrink-0 text-[#1e3a5f]" />
            <p>
              Los casos como "tiene Doctorado → mínimo Asociado" no se configuran aquí: son
              excepciones, en la pestaña de al lado.
            </p>
          </div>

          <div className="overflow-x-auto">
            <DataTable2
              data={escalones}
              columns={columnasEscalones}
              loading={cargandoEscalones}
              searchPlaceholder="Buscar escalón..."
            />
          </div>
        </div>
      )}

      {tab === "excepciones" && (
        <div className="bg-white border border-[rgba(30,58,95,0.09)] rounded-xl shadow-md p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="text-lg font-bold text-[#1e3a5f]">Excepciones</h2>
              <p className="text-sm text-[#6b7a8d]">
                Reglas de piso: si se cumple la condición, el docente queda como mínimo en el
                escalón indicado.
              </p>
            </div>
            <button
              onClick={() => setModalRegla({ abierto: true, regla: null })}
              disabled={escalones.length === 0}
              className="inline-flex items-center justify-center gap-2 bg-[#e8740e] hover:bg-[#c2600b] disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transition-colors"
            >
              <PlusCircle className="h-5 w-5" />
              Nueva excepción
            </button>
          </div>

          <div className="overflow-x-auto">
            <DataTable2
              data={reglas}
              columns={columnasReglas}
              loading={cargandoReglas}
              searchPlaceholder="Buscar excepción..."
            />
          </div>
        </div>
      )}

      {tab === "puntajes" && (
        <div className="bg-white border border-[rgba(30,58,95,0.09)] rounded-xl shadow-md p-6">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-[#1e3a5f]">Puntajes de producción académica</h2>
            <p className="text-sm text-[#6b7a8d]">
              Mismos ámbitos que administras en Catálogos → Producción académica. El puntaje se
              edita aquí; en ese catálogo solo se muestra.
            </p>
          </div>

          <div className="overflow-x-auto rounded-lg border border-[rgba(30,58,95,0.09)]">
            <table className="w-full text-sm">
              <thead className="bg-[rgba(30,58,95,0.04)] text-xs uppercase tracking-wide text-[#6b7a8d]">
                <tr>
                  <th className="px-4 py-2.5 text-left font-semibold">Producto académico</th>
                  <th className="px-4 py-2.5 text-left font-semibold">Ámbito de divulgación</th>
                  <th className="px-4 py-2.5 text-left font-semibold">Estado</th>
                  <th className="px-4 py-2.5 text-left font-semibold">Puntaje</th>
                  <th className="px-4 py-2.5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(30,58,95,0.06)]">
                {cargandoAmbitos && (
                  <tr>
                    <td colSpan={5} className="px-4 py-4 text-center text-[#6b7a8d]">
                      Cargando...
                    </td>
                  </tr>
                )}
                {!cargandoAmbitos && ambitos.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-4 text-center text-[#6b7a8d]">
                      No hay ámbitos de divulgación creados todavía.
                    </td>
                  </tr>
                )}
                {ambitos.map((ambito) => {
                  const valorActual =
                    puntajesEditados[ambito.id_ambito_divulgacion] ?? String(ambito.puntaje);
                  const modificado = valorActual !== String(ambito.puntaje);

                  return (
                    <tr key={ambito.id_ambito_divulgacion}>
                      <td className="px-4 py-2.5 text-[#6b7a8d]">
                        {ambito.producto_academico_ambito_divulgacion?.nombre_producto_academico ?? "—"}
                      </td>
                      <td className="px-4 py-2.5 font-medium text-gray-900">
                        {ambito.nombre_ambito_divulgacion}
                      </td>
                      <td className="px-4 py-2.5">
                        <EstadoBadge activo={ambito.activo} />
                      </td>
                      <td className="px-4 py-2.5">
                        <input
                          type="number"
                          min={0}
                          value={valorActual}
                          onChange={(e) =>
                            setPuntajesEditados((prev) => ({
                              ...prev,
                              [ambito.id_ambito_divulgacion]: e.target.value,
                            }))
                          }
                          className="w-20 rounded-md border border-[rgba(30,58,95,0.2)] px-2 py-1 text-right font-semibold tabular-nums focus:border-[#e8740e] focus:outline-none"
                        />
                      </td>
                      <td className="px-4 py-2.5">
                        {modificado && (
                          <button
                            type="button"
                            onClick={() => guardarPuntaje(ambito)}
                            disabled={guardandoPuntaje === ambito.id_ambito_divulgacion}
                            className="inline-flex items-center gap-1.5 rounded-md bg-[#1e3a5f] hover:bg-[#152a45] disabled:opacity-60 text-white px-3 py-1.5 text-xs font-semibold transition-colors"
                          >
                            <Save className="h-3.5 w-3.5" />
                            Guardar
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modalEscalon.abierto && (
        <CustomDialog
          title={modalEscalon.escalon ? "Editar escalón" : "Nuevo escalón"}
          open={modalEscalon.abierto}
          onClose={() => setModalEscalon({ abierto: false, escalon: null })}
          width="650px"
        >
          <EscalonDocenteModal
            escalon={modalEscalon.escalon}
            onSuccess={() => {
              setModalEscalon({ abierto: false, escalon: null });
              fetchEscalones();
            }}
            onCancel={() => setModalEscalon({ abierto: false, escalon: null })}
          />
        </CustomDialog>
      )}

      {modalRegla.abierto && (
        <CustomDialog
          title={modalRegla.regla ? "Editar excepción" : "Nueva excepción"}
          open={modalRegla.abierto}
          onClose={() => setModalRegla({ abierto: false, regla: null })}
          width="600px"
        >
          <ReglaExcepcionEscalonModal
            escalones={escalones}
            regla={modalRegla.regla}
            onSuccess={() => {
              setModalRegla({ abierto: false, regla: null });
              fetchReglas();
            }}
            onCancel={() => setModalRegla({ abierto: false, regla: null })}
          />
        </CustomDialog>
      )}
    </div>
  );
};

export default EscalafonDocente;
