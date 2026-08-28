import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  AlertTriangle,
  ArrowUpRight,
  CalendarDays,
  CreditCard,
  Info,
  Mail,
  RotateCcw,
} from "lucide-react";
import axiosInstance from "../../../utils/axiosConfig";
import { mensajeDeErrorApi } from "../../../utils/erroresApi";
import { fechaLarga } from "../../../utils/fechas";
import { BarraProgreso } from "../../../componentes/formularios/BarraProgreso";
import CustomDialog from "../../../componentes/CustomDialogForm";
import ModalMotivoRechazo from "../../../componentes/modales/ModalMotivoRechazo";
import { ButtonRegresar } from "../../../componentes/formularios/ButtonRegresar";
import AscensoModal from "./AscensoModal";
import { EscalonPill, SemaforoAntiguedad, ViaPill } from "./piezas";
import {
  type DetalleEscalafonDocente as Detalle,
  type HistorialEscalon,
  type PeriodoAscenso,
} from "../../../types/escalafon";

const ENDPOINT_DOCENTES = import.meta.env.VITE_ENDPOINT_AP_ESCALAFON_DOCENTES;
const ENDPOINT_HISTORIAL = import.meta.env.VITE_ENDPOINT_AP_ESCALAFON_HISTORIAL;
const ENDPOINT_PERIODOS = import.meta.env.VITE_ENDPOINT_AP_ESCALAFON_PERIODOS;

/**
 * Expediente de escalafón de un docente: su evaluación y su historial completo.
 *
 * Los dos actos —ascenso y reversión— viven aquí porque ambos necesitan mirar el historial antes
 * de ejecutarse. Ninguno ocurre solo: cumplir los requisitos no cambia la categoría, y rechazar un
 * documento tampoco la baja. El ingreso al escalafón ya no es un acto manual: el docente de Planta
 * arranca como Auxiliar automáticamente.
 */
const DetalleEscalafonDocente = () => {
  const { id } = useParams<{ id: string }>();

  const [detalle, setDetalle] = useState<Detalle | null>(null);
  const [cargando, setCargando] = useState(true);
  const [periodos, setPeriodos] = useState<PeriodoAscenso[]>([]);

  const [abrirAscenso, setAbrirAscenso] = useState(false);
  const [porRevertir, setPorRevertir] = useState<HistorialEscalon | null>(null);
  const [revirtiendo, setRevirtiendo] = useState(false);

  const cargar = useCallback(async () => {
    if (!id) return;

    try {
      setCargando(true);
      const respuesta = await axiosInstance.get(`${ENDPOINT_DOCENTES}/${id}`);
      setDetalle(respuesta.data?.data ?? null);
    } catch (error) {
      console.error("Error al cargar el expediente del docente:", error);
      toast.error(mensajeDeErrorApi(error, "No se pudo cargar el expediente"));
    } finally {
      setCargando(false);
    }
  }, [id]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  useEffect(() => {
    axiosInstance
      .get(ENDPOINT_PERIODOS)
      .then((respuesta) => setPeriodos(respuesta.data?.data ?? []))
      .catch((error) => console.error("Error al obtener los periodos de ascenso:", error));
  }, []);

  const revertir = async (motivo: string) => {
    if (!porRevertir) return;

    try {
      setRevirtiendo(true);
      await axiosInstance.post(
        `${ENDPOINT_HISTORIAL}/${porRevertir.id_historial_escalon}/revertir`,
        { motivo }
      );
      toast.success(`Se revirtió el tramo de ${porRevertir.escalon}.`);
      setPorRevertir(null);
      cargar();
    } catch (error) {
      console.error("Error al revertir el tramo:", error);
      toast.error(mensajeDeErrorApi(error, "No se pudo revertir el tramo."), { autoClose: 7000 });
    } finally {
      setRevirtiendo(false);
    }
  };

  if (cargando && !detalle) {
    return (
      <div className="flex h-64 flex-col items-center justify-center">
        <div className="mb-4 h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-[#1e3a5f]" />
        <p className="font-medium text-[#1e3a5f]">Cargando expediente...</p>
      </div>
    );
  }

  if (!detalle) {
    return (
      <div className="mx-auto flex w-full max-w-[900px] flex-col gap-4">
        <Link to="/apoyo-profesoral/escalafon">
          <ButtonRegresar />
        </Link>
        <p className="rounded-xl border border-dashed border-[rgba(30,58,95,0.2)] bg-[#f7f8fa] p-6 text-center text-sm text-[#6b7a8d]">
          No se encontró el expediente de este docente.
        </p>
      </div>
    );
  }

  const { evaluacion, historial } = detalle;
  const hayPeriodoCerrado = periodos.some((periodo) => periodo.cerrado);
  const porVerificar = Math.max(
    0,
    (evaluacion.meses_en_escalon_declarados ?? 0) - (evaluacion.meses_en_escalon ?? 0)
  );

  const metaPuntaje = (() => {
    const item = evaluacion.faltantes?.find((f) => f.campo === "puntaje");
    const requerido = Number(item?.requerido);
    return Number.isFinite(requerido) ? requerido : null;
  })();

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-5">
      <div className="flex items-center gap-4">
        <Link to="/apoyo-profesoral/escalafon">
          <ButtonRegresar />
        </Link>
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-bold text-[#1e3a5f]">{detalle.nombre_completo}</h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[#6b7a8d]">
            {detalle.numero_identificacion && (
              <span className="inline-flex items-center gap-1.5">
                <CreditCard className="h-3.5 w-3.5" /> {detalle.numero_identificacion}
              </span>
            )}
            {detalle.email && (
              <span className="inline-flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" /> {detalle.email}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ---------------- Evaluación ---------------- */}
      <section className="flex flex-col gap-5 rounded-2xl border border-[rgba(30,58,95,0.09)] bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <EscalonPill escalon={evaluacion.escalon_vigente} />
            {evaluacion.escalon_vigente_desde && (
              <span className="text-xs text-[#6b7a8d]">
                desde el {fechaLarga(evaluacion.escalon_vigente_desde)}
              </span>
            )}
            {evaluacion.escalon_objetivo && (
              <>
                <ArrowUpRight className="h-4 w-4 text-[#e8740e]" />
                <span className="text-sm font-semibold text-[#1e3a5f]">
                  {evaluacion.escalon_objetivo}
                </span>
              </>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <SemaforoAntiguedad estado={evaluacion.estado_antiguedad} />
            {evaluacion.elegible && <ViaPill via={evaluacion.via} />}
          </div>
        </div>

        {evaluacion.razon && (
          <p className="rounded-lg bg-[rgba(30,58,95,0.04)] p-3 text-sm text-[#2c3e50]">
            {evaluacion.razon}
          </p>
        )}

        {/* Sin escalón vigente no hay nada que medir: los contadores en cero no son un error. */}
        {evaluacion.escalon_vigente ? (
          <>
            <div className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
              <BarraProgreso
                etiqueta={`Antigüedad como ${evaluacion.escalon_vigente}`}
                actual={evaluacion.meses_en_escalon ?? 0}
                requerido={evaluacion.meses_requeridos}
                pendiente={evaluacion.meses_en_escalon_declarados}
                sufijo={evaluacion.meses_requeridos === null ? "meses" : ""}
                notaPendiente={`${porVerificar} meses declarados sin certificado aprobado`}
              />

              <BarraProgreso
                etiqueta="Puntaje de producción"
                actual={evaluacion.puntaje_total ?? 0}
                requerido={metaPuntaje}
                sufijo={metaPuntaje === null ? "puntos" : ""}
              />
            </div>

            {porVerificar > 0 && (
              <p className="flex items-start gap-2 rounded-lg border border-[#fde68a] bg-[#fffbeb] p-3 text-xs leading-relaxed text-[#92400e]">
                <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>
                  Declara {porVerificar} meses más de los que tiene respaldados. Revisar sus
                  certificados de experiencia es lo primero que mueve este expediente.
                </span>
              </p>
            )}

            {evaluacion.faltantes.length > 0 ? (
              <div>
                <h3 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-[#6b7a8d]">
                  Requisitos pendientes
                  {evaluacion.escalon_objetivo && ` para ${evaluacion.escalon_objetivo}`}
                </h3>
                <ul className="flex flex-col gap-1.5">
                  {evaluacion.faltantes.map((faltante) => (
                    <li
                      key={faltante.campo}
                      className="flex flex-wrap items-baseline gap-x-2 rounded-lg border border-[rgba(30,58,95,0.09)] px-3 py-2 text-sm text-[#2c3e50]"
                    >
                      <span>{faltante.mensaje}</span>
                      {(faltante.requerido ?? null) !== null && (
                        <span className="text-xs text-[#6b7a8d]">
                          (requiere {faltante.requerido}
                          {faltante.actual !== undefined && faltante.actual !== null
                            ? `, actual ${faltante.actual}`
                            : ""}
                          )
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              evaluacion.escalon_objetivo && (
                <p className="rounded-lg border border-[#bfe0cd] bg-[#eaf6ef] p-3 text-sm text-[#2f7d54]">
                  No le falta ningún requisito
                  {evaluacion.via === "excepcion" && " (entra por excepción)"}.
                </p>
              )
            )}
          </>
        ) : (
          <p className="rounded-lg border border-dashed border-[rgba(30,58,95,0.2)] bg-[#f7f8fa] p-4 text-sm text-[#6b7a8d]">
            Todavía no aparece en el escalafón. El ingreso ya no se registra manualmente: el
            docente de Planta arranca como Auxiliar de forma automática.
          </p>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[rgba(30,58,95,0.09)] pt-4">
          <p className="flex items-center gap-1.5 text-xs text-[#6b7a8d]">
            <CalendarDays className="h-3.5 w-3.5" />
            {evaluacion.fecha_corte ? (
              <>
                Evaluado al {fechaLarga(evaluacion.fecha_corte)}
                {evaluacion.periodo_ascenso?.nombre && ` · ${evaluacion.periodo_ascenso.nombre}`}
              </>
            ) : (
              <>Sin periodo de ascenso anunciado</>
            )}
          </p>

          <div className="flex flex-wrap items-center gap-2">
            {evaluacion.escalon_objetivo && (
              <button
                type="button"
                disabled={!evaluacion.elegible || !hayPeriodoCerrado}
                onClick={() => setAbrirAscenso(true)}
                title={
                  !evaluacion.elegible
                    ? "Todavía no cumple los requisitos del escalón siguiente"
                    : !hayPeriodoCerrado
                    ? "Solo se puede ascender contra un periodo ya cerrado"
                    : undefined
                }
                className="inline-flex items-center gap-2 rounded-lg bg-[#1e3a5f] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#12243d] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ArrowUpRight className="h-4 w-4" /> Ascender a {evaluacion.escalon_objetivo}
              </button>
            )}
          </div>
        </div>

        {evaluacion.escalon_objetivo && evaluacion.elegible && !hayPeriodoCerrado && (
          <p className="flex items-start gap-2 text-xs leading-relaxed text-[#6b7a8d]">
            <Info className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
            Cumple los requisitos, pero no hay ningún periodo cerrado contra el cual ejecutar el
            ascenso. Ciérralo desde{" "}
            <Link
              to="/apoyo-profesoral/escalafon/periodos"
              className="underline hover:text-[#1e3a5f]"
            >
              Periodos de ascenso
            </Link>
            .
          </p>
        )}
      </section>

      {/* ---------------- Historial ---------------- */}
      <section className="flex flex-col gap-4 rounded-2xl border border-[rgba(30,58,95,0.09)] bg-white p-4 shadow-sm sm:p-6">
        <div>
          <h2 className="text-lg font-bold text-[#1e3a5f]">Historial de escalón</h2>
          <p className="text-sm text-[#6b7a8d]">
            Incluye los tramos revertidos: un ascenso que se otorgó y se deshizo también es parte
            del expediente.
          </p>
        </div>

        {historial.length === 0 ? (
          <p className="rounded-lg border border-dashed border-[rgba(30,58,95,0.2)] bg-[#f7f8fa] px-4 py-3 text-sm text-[#9aa7b5]">
            Sin tramos registrados todavía.
          </p>
        ) : (
          <ol className="flex flex-col gap-3">
            {historial.map((tramo) => {
              const revertido = Boolean(tramo.revertido_en);
              const vigente = !revertido && tramo.hasta === null;

              return (
                <li
                  key={tramo.id_historial_escalon}
                  className={`flex flex-col gap-2 rounded-xl border p-4 sm:flex-row sm:items-start sm:justify-between ${
                    revertido
                      ? "border-dashed border-[rgba(30,58,95,0.14)] bg-[#fafbfc] opacity-75"
                      : "border-[rgba(30,58,95,0.09)] bg-white"
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`font-bold text-[#1e3a5f] ${revertido ? "line-through" : ""}`}
                      >
                        {tramo.escalon}
                      </span>
                      {vigente && (
                        <span className="rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-green-700">
                          Vigente
                        </span>
                      )}
                      {revertido && (
                        <span className="rounded-full border border-[#e8d9a6] bg-[#fdf7e6] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#8a6d1a]">
                          Revertido
                        </span>
                      )}
                      {tramo.via && (
                        <span className="text-xs text-[#6b7a8d]">vía {tramo.via}</span>
                      )}
                    </div>

                    <p className="mt-1 text-sm text-[#2c3e50]">
                      {fechaLarga(tramo.desde)} —{" "}
                      {tramo.hasta ? fechaLarga(tramo.hasta) : "actualidad"}
                    </p>

                    {tramo.motivo && (
                      <p className="mt-1 text-xs italic text-[#6b7a8d]">«{tramo.motivo}»</p>
                    )}

                    {tramo.otorgado_por && (
                      <p className="mt-1 text-xs text-[#9aa7b5]">
                        Otorgado por {tramo.otorgado_por}
                      </p>
                    )}

                    {/* Quién lo deshizo y por qué: sin eso, un tramo tachado no se puede auditar. */}
                    {revertido && (
                      <p className="mt-2 rounded-lg bg-[#fdf7e6] px-3 py-2 text-xs text-[#8a6d1a]">
                        Revertido el {fechaLarga(tramo.revertido_en)}
                        {tramo.revertido_por && ` por ${tramo.revertido_por}`}
                        {tramo.motivo_reversion && `: «${tramo.motivo_reversion}»`}
                      </p>
                    )}
                  </div>

                  {!revertido && (
                    <button
                      type="button"
                      onClick={() => setPorRevertir(tramo)}
                      className="inline-flex shrink-0 items-center gap-2 self-start rounded-lg border border-[#fde68a] bg-[#fffbeb] px-3 py-2 text-sm font-semibold text-[#b45309] transition-colors hover:bg-[#fef3c7]"
                    >
                      <RotateCcw className="h-4 w-4" /> Revertir
                    </button>
                  )}
                </li>
              );
            })}
          </ol>
        )}
      </section>

      {abrirAscenso && (
        <CustomDialog
          title="Ejecutar ascenso"
          open={abrirAscenso}
          onClose={() => setAbrirAscenso(false)}
          width="620px"
        >
          <AscensoModal
            userId={detalle.id}
            nombreDocente={detalle.nombre_completo}
            escalonVigente={evaluacion.escalon_vigente}
            escalonObjetivo={evaluacion.escalon_objetivo}
            periodos={periodos}
            onFinalizado={() => {
              setAbrirAscenso(false);
              cargar();
            }}
            onCancel={() => setAbrirAscenso(false)}
          />
        </CustomDialog>
      )}

      <ModalMotivoRechazo
        open={Boolean(porRevertir)}
        loading={revirtiendo}
        tone="reversion"
        title="Revertir el tramo de escalafón"
        confirmLabel="Confirmar reversión"
        description={`El motivo le llega a ${detalle.nombre_completo} por correo: escríbalo pensando en que lo va a leer una persona.`}
        onClose={() => setPorRevertir(null)}
        onConfirm={revertir}
      >
        <div className="flex gap-2.5 rounded-lg border border-[#fde68a] bg-[#fffbeb] p-3 text-xs leading-relaxed text-[#92400e]">
          <AlertTriangle size={15} className="mt-0.5 shrink-0" />
          <div>
            <b>
              Le quitas la categoría de {porRevertir?.escalon} a {detalle.nombre_completo}.
            </b>{" "}
            El tramo queda en el historial marcado como revertido, con tu nombre y este motivo.
            {porRevertir?.hasta === null &&
              " Al ser el tramo vigente, vuelve a la categoría anterior."}
          </div>
        </div>
      </ModalMotivoRechazo>
    </div>
  );
};

export default DetalleEscalafonDocente;
