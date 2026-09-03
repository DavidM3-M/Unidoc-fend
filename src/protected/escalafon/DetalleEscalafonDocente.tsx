import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  AlertTriangle,
  ArrowUpRight,
  CalendarDays,
  CreditCard,
  FolderOpen,
  History,
  Info,
  LogIn,
  Mail,
  Pencil,
  RotateCcw,
} from "lucide-react";
import axiosInstance from "../../utils/axiosConfig";
import { mensajeDeErrorApi } from "../../utils/erroresApi";
import { fechaLarga } from "../../utils/fechas";
import { BarraProgreso } from "../../componentes/formularios/BarraProgreso";
import { usePuntajeMinimoEscalon } from "../../hooks/usePuntajeMinimoEscalon";
import CustomDialog from "../../componentes/CustomDialogForm";
import ModalMotivoRechazo from "../../componentes/modales/ModalMotivoRechazo";
import { ButtonRegresar } from "../../componentes/formularios/ButtonRegresar";
import AscensoModal from "./AscensoModal";
import IngresoManualModal from "./IngresoManualModal";
import CorregirTramoModal from "./CorregirTramoModal";
import BitacoraEscalafonPanel from "./BitacoraEscalafonPanel";
import PestanasDocumentosDocente from "../apoyo-profesoral/trayectoria-docente/PestanasDocumentosDocente";
import { EscalonPill, SemaforoAntiguedad, ViaPill } from "./piezas";
import {
  type DetalleEscalafonDocente as Detalle,
  type HistorialEscalon,
  type PeriodoAscenso,
} from "../../types/escalafon";
import type { AreaEscalafon } from "./area";

/**
 * Expediente de escalafón de un docente: su evaluación y su historial completo.
 *
 * Los dos actos ordinarios —ascenso y reversión— viven aquí porque ambos necesitan mirar el
 * historial antes de ejecutarse. Ninguno ocurre solo: cumplir los requisitos no cambia la
 * categoría, y rechazar un documento tampoco la baja. El ingreso ordinario tampoco es un acto
 * manual: el docente de planta arranca como Auxiliar automáticamente.
 *
 * La pantalla la comparten Apoyo Profesoral y el Administrador. A este último se le añaden aquí
 * las dos intervenciones que solo tiene él —registrar un ingreso manual y corregir un tramo—, más
 * la bitácora que las deja auditadas. Se muestran según `area.puedeCorregir`; esconderlas no es la
 * barrera de seguridad —esas rutas no existen bajo `/apoyoProfesoral`— pero evita ofrecer algo
 * que va a fallar.
 */
const DetalleEscalafonDocente = ({ area }: { area: AreaEscalafon }) => {
  const { id } = useParams<{ id: string }>();

  const [detalle, setDetalle] = useState<Detalle | null>(null);
  const [cargando, setCargando] = useState(true);
  const [periodos, setPeriodos] = useState<PeriodoAscenso[]>([]);

  const [abrirAscenso, setAbrirAscenso] = useState(false);
  const [abrirDocumentos, setAbrirDocumentos] = useState(false);
  const [porRevertir, setPorRevertir] = useState<HistorialEscalon | null>(null);
  const [revirtiendo, setRevirtiendo] = useState(false);

  // Exclusivo del Administrador.
  const [abrirIngreso, setAbrirIngreso] = useState(false);
  const [abrirBitacora, setAbrirBitacora] = useState(false);
  const [porCorregir, setPorCorregir] = useState<HistorialEscalon | null>(null);

  // Antes de los returns tempranos: es un hook y el expediente puede estar todavía cargando.
  const puntajeMinimoObjetivo = usePuntajeMinimoEscalon(
    detalle?.evaluacion?.escalon_objetivo
  );

  const cargar = useCallback(async () => {
    if (!id) return;

    try {
      setCargando(true);
      const respuesta = await axiosInstance.get(`${area.endpointDocentes}/${id}`);
      setDetalle(respuesta.data?.data ?? null);
    } catch (error) {
      console.error("Error al cargar el expediente del docente:", error);
      toast.error(mensajeDeErrorApi(error, "No se pudo cargar el expediente"));
    } finally {
      setCargando(false);
    }
  }, [id, area.endpointDocentes]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  useEffect(() => {
    axiosInstance
      .get(area.endpointPeriodos)
      .then((respuesta) => setPeriodos(respuesta.data?.data ?? []))
      .catch((error) => console.error("Error al obtener los periodos de ascenso:", error));
  }, [area.endpointPeriodos]);

  const revertir = async (motivo: string) => {
    if (!porRevertir) return;

    try {
      setRevirtiendo(true);
      await axiosInstance.post(
        `${area.endpointHistorial}/${porRevertir.id_historial_escalon}/revertir`,
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
        <Link to={area.rutaBase}>
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

  /** Puntos que el docente ya declaró pero que ningún documento aprobado respalda todavía. */
  const puntosPorAvalar = Math.max(
    0,
    (evaluacion.puntaje_declarado ?? 0) - (evaluacion.puntaje_total ?? 0)
  );

  /**
   * La del motor manda; el catálogo la respalda cuando el criterio ya se cumple y `faltantes`
   * deja de traerla. Sin respaldo la barra pierde el denominador y con él los dos tramos.
   */
  const metaPuntaje = (() => {
    const item = evaluacion.faltantes?.find((f) => f.campo === "puntaje");
    const requerido = Number(item?.requerido);
    return Number.isFinite(requerido) && requerido > 0
      ? requerido
      : puntajeMinimoObjetivo;
  })();

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-5">
      <div className="flex flex-wrap items-center gap-4">
        <Link to={area.rutaBase}>
          <ButtonRegresar />
        </Link>
        <div className="min-w-0 flex-1">
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

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {/* Los requisitos que faltan se resuelven mirando los soportes, no la barra de progreso:
              el expediente se queda corto si hay que salir a otra pantalla para verlos.

              Solo para quien avala. El panel no es un visor: aprueba, rechaza y borra documentos
              contra endpoints de `role:Apoyo Profesoral`, así que ofrecérselo al Administrador
              sería prometerle una pantalla que le responde 403 —y abrírsela, entregarle el
              trabajo de revisión entero. Ver `puedeVerDocumentos` en `area.ts`. */}
          {area.puedeVerDocumentos && (
            <button
              type="button"
              onClick={() => setAbrirDocumentos(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-[rgba(30,58,95,0.14)] bg-white px-4 py-2.5 text-sm font-semibold text-[#1e3a5f] transition-colors hover:bg-[rgba(30,58,95,0.04)]"
            >
              <FolderOpen className="h-4 w-4" /> Ver documentos
            </button>
          )}

          {area.puedeCorregir && (
            <button
              type="button"
              onClick={() => setAbrirBitacora(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-[rgba(30,58,95,0.14)] bg-white px-4 py-2.5 text-sm font-semibold text-[#6b7a8d] transition-colors hover:bg-gray-50"
            >
              <History className="h-4 w-4" /> Bitácora
            </button>
          )}
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
                pendiente={evaluacion.puntaje_declarado}
                sufijo={metaPuntaje === null ? "puntos" : ""}
                notaPendiente={`${puntosPorAvalar} puntos declarados sin documento aprobado`}
              />
            </div>

            {porVerificar > 0 && (
              <p className="flex items-start gap-2 rounded-lg border border-[#fde68a] bg-[#fffbeb] p-3 text-xs leading-relaxed text-[#92400e]">
                <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                {/* La acción que sigue no es la misma para los dos roles: Apoyo Profesoral puede
                    avalar esos certificados, el Administrador no. Decirle «revísalos» a quien no
                    tiene con qué es mandarlo a una pantalla que no va a encontrar. */}
                <span>
                  Declara {porVerificar} meses más de los que tiene respaldados.{" "}
                  {area.puedeVerDocumentos
                    ? "Revisar sus certificados de experiencia es lo primero que mueve este expediente."
                    : "Su antigüedad puede subir sin tocar nada en cuanto Apoyo Profesoral avale esos certificados de experiencia."}
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
          <div className="flex flex-col gap-3 rounded-lg border border-dashed border-[rgba(30,58,95,0.2)] bg-[#f7f8fa] p-4">
            <p className="text-sm text-[#6b7a8d]">
              Todavía no aparece en el escalafón. Lo normal es que entre solo: el docente de planta
              arranca como Auxiliar en cuanto Talento Humano registra su contratación.
              {area.puedeCorregir &&
                " Si eso no ocurrió, o llega con una categoría ya reconocida, puedes registrar su ingreso a mano."}
            </p>

            {/* Solo el Administrador. Apoyo Profesoral no tiene con qué desatascar este estado, y
                por eso su texto se queda en la explicación. */}
            {area.puedeCorregir && (
              <button
                type="button"
                onClick={() => setAbrirIngreso(true)}
                className="inline-flex w-fit items-center gap-2 rounded-lg bg-[#1e3a5f] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#12243d]"
              >
                <LogIn className="h-4 w-4" /> Registrar ingreso manual
              </button>
            )}
          </div>
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
              to={`${area.rutaBase}/periodos`}
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
                      {/* Un tramo corregido ya no es exactamente lo que produjo el acto original.
                          Se marca para los dos roles, no solo para quien puede corregir: quien
                          evalúa el expediente es justo quien necesita saberlo. */}
                      {tramo.corregido && (
                        <span
                          className="inline-flex items-center gap-1 rounded-full border border-[rgba(30,58,95,0.14)] bg-[#f2f5f9] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#4a5f7a]"
                          title="El Administrador editó este tramo a mano. El detalle está en la bitácora."
                        >
                          <Pencil size={10} /> Corregido
                        </span>
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

                  {/* Un tramo revertido no se toca: es el registro de algo que se deshizo, y
                      editarlo dejaría el expediente contando otra versión de los hechos. */}
                  {!revertido && (
                    <div className="flex shrink-0 flex-wrap items-center gap-2 self-start">
                      {area.puedeCorregir && (
                        <button
                          type="button"
                          onClick={() => setPorCorregir(tramo)}
                          className="inline-flex items-center gap-2 rounded-lg border border-[rgba(30,58,95,0.14)] bg-white px-3 py-2 text-sm font-semibold text-[#1e3a5f] transition-colors hover:bg-[rgba(30,58,95,0.04)]"
                        >
                          <Pencil className="h-4 w-4" /> Corregir
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setPorRevertir(tramo)}
                        className="inline-flex items-center gap-2 rounded-lg border border-[#fde68a] bg-[#fffbeb] px-3 py-2 text-sm font-semibold text-[#b45309] transition-colors hover:bg-[#fef3c7]"
                      >
                        <RotateCcw className="h-4 w-4" /> Revertir
                      </button>
                    </div>
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
            area={area}
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

      {abrirIngreso && (
        <CustomDialog
          title="Registrar ingreso manual al escalafón"
          open={abrirIngreso}
          onClose={() => setAbrirIngreso(false)}
          width="620px"
        >
          <IngresoManualModal
            area={area}
            userId={detalle.id}
            nombreDocente={detalle.nombre_completo}
            onFinalizado={() => {
              setAbrirIngreso(false);
              cargar();
            }}
            onCancel={() => setAbrirIngreso(false)}
          />
        </CustomDialog>
      )}

      {porCorregir && (
        <CustomDialog
          title="Corregir tramo del historial"
          open={Boolean(porCorregir)}
          onClose={() => setPorCorregir(null)}
          width="660px"
        >
          <CorregirTramoModal
            area={area}
            tramo={porCorregir}
            nombreDocente={detalle.nombre_completo}
            onFinalizado={() => {
              setPorCorregir(null);
              cargar();
            }}
            onCancel={() => setPorCorregir(null)}
          />
        </CustomDialog>
      )}

      {abrirBitacora && (
        <CustomDialog
          title={`Intervenciones manuales sobre ${detalle.nombre_completo}`}
          open={abrirBitacora}
          onClose={() => setAbrirBitacora(false)}
          width="720px"
        >
          <BitacoraEscalafonPanel area={area} userId={detalle.id} />
        </CustomDialog>
      )}

      {abrirDocumentos && area.puedeVerDocumentos && (
        <CustomDialog
          title={`Documentación de ${detalle.nombre_completo}`}
          open={abrirDocumentos}
          onClose={() => setAbrirDocumentos(false)}
          width="1500px"
        >
          {/* Aprobar un certificado desde aquí cambia la evaluación que se está mirando: se
              recarga el expediente para que las barras y el semáforo no queden en el estado
              anterior al aval. El modal sigue abierto —`cargar` no desmonta el detalle—. */}
          <PestanasDocumentosDocente
            idDocente={String(detalle.id)}
            onEstadoDocumentoCambiado={cargar}
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
