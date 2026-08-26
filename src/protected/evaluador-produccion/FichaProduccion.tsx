import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Download,
  AlertTriangle,
  RotateCcw,
  Loader2,
  FileWarning,
} from "lucide-react";
import axiosInstance from "../../utils/axiosConfig";
import ModalMotivoRechazo from "../../componentes/modales/ModalMotivoRechazo";
import EnlacesConsulta from "../../componentes/EnlacesConsulta";
import { ProduccionFicha } from "../../types/evaluadorProduccion";
import { EstadoProduccionPill, formatFecha } from "./piezas";

/**
 * Ficha de una producción académica: la pantalla donde se decide.
 *
 * Todo lo necesario para avalar o rechazar cabe acá sin abrir otra pestaña de la aplicación: el
 * documento a la izquierda, la ficha y los enlaces de consulta a la derecha, la decisión abajo.
 *
 * El aviso que encabeza la pantalla dice cuántos puntos de escalafón otorga el aval y cómo queda
 * el docente. Es el dato que hasta ahora nadie veía al aprobar, y es lo que convierte un clic
 * administrativo en una decisión académica informada.
 */
const FichaProduccion = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [ficha, setFicha] = useState<ProduccionFicha | null>(null);
  const [cargando, setCargando] = useState(true);
  const [decidiendo, setDecidiendo] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);

  const cargar = useCallback(async () => {
    try {
      setCargando(true);
      const { data } = await axiosInstance.get(`/evaluadorProduccion/producciones/${id}`);
      setFicha(data.data);
    } catch (error) {
      console.error("Error al cargar la producción:", error);
      toast.error("No se pudo cargar la producción académica");
    } finally {
      setCargando(false);
    }
  }, [id]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const avalar = async () => {
    if (!ficha) return;

    try {
      setDecidiendo(true);
      const { data } = await axiosInstance.put(
        `/evaluadorProduccion/producciones/${ficha.id_produccion_academica}/avalar`
      );
      toast.success(data.message ?? "Producción avalada");
      // Se relee en vez de parchear el estado en memoria: el impacto en el escalafón lo calcula
      // el servidor y quedaría desactualizado si lo escribiéramos a mano acá.
      await cargar();
    } catch (error) {
      console.error("Error al avalar:", error);
      toast.error("No se pudo avalar la producción");
    } finally {
      setDecidiendo(false);
    }
  };

  const rechazar = async (motivo: string) => {
    if (!ficha) return;

    try {
      setDecidiendo(true);
      const { data } = await axiosInstance.put(
        `/evaluadorProduccion/producciones/${ficha.id_produccion_academica}/rechazar`,
        { motivo }
      );
      toast.success(data.message ?? "Producción rechazada");
      setModalAbierto(false);
      await cargar();
    } catch (error) {
      console.error("Error al rechazar:", error);
      toast.error("No se pudo rechazar la producción");
    } finally {
      setDecidiendo(false);
    }
  };

  if (cargando) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-3xl border border-[rgba(30,58,95,0.09)]">
        <Loader2 className="animate-spin text-[#e8740e] mb-3" size={34} />
        <p className="text-[#1e3a5f] font-bold">Cargando la producción…</p>
      </div>
    );
  }

  if (!ficha) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-[rgba(30,58,95,0.09)] text-center">
        <p className="text-[#1e3a5f] font-bold mb-3">No se encontró la producción académica.</p>
        <button
          type="button"
          onClick={() => navigate("/evaluador-produccion")}
          className="px-4 py-2 rounded-lg bg-[#1e3a5f] text-white text-sm font-semibold"
        >
          Volver a la bandeja
        </button>
      </div>
    );
  }

  const documento = ficha.documentos[0];
  const esPendiente = ficha.estado === "pendiente";
  const estaAvalada = ficha.estado === "aprobado";
  const impacto = ficha.impacto_escalafon;

  return (
    <div className="flex flex-col gap-5 w-full bg-white rounded-3xl p-4 sm:p-6 lg:p-8 min-h-screen border border-[rgba(30,58,95,0.09)]">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => navigate("/evaluador-produccion")}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[rgba(30,58,95,0.14)] text-[#6b7a8d] text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft size={15} /> Volver a la bandeja
        </button>
        <EstadoProduccionPill fila={ficha} />
      </div>

      {/* La consecuencia, antes de la decisión. Un «¿está seguro?» no se puede evaluar;
          «pasa de 19 a 29 puntos» sí. */}
      <AvisoImpacto
        estado={ficha.estado}
        docente={ficha.docente?.nombre_completo ?? "el docente"}
        impacto={impacto}
        esDecisionHistorica={ficha.es_decision_historica}
        motivoRechazo={ficha.motivo_rechazo}
        revisadoPor={ficha.revisado_por?.nombre ?? null}
        revisadoEn={ficha.revisado_en}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
        {/* --------------------- Documento --------------------- */}
        <section className="border border-[rgba(30,58,95,0.09)] rounded-2xl overflow-hidden">
          <header className="flex items-center justify-between gap-3 px-4 py-3 bg-gradient-to-r from-[#f3ede1] to-[rgba(243,237,225,0.45)] border-b border-[rgba(30,58,95,0.14)]">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-[#1e3a5f]">
              Documento de soporte
            </h2>
            {documento?.archivo_url && (
              <div className="flex gap-2">
                <a
                  href={documento.archivo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-[rgba(30,58,95,0.14)] text-[#6b7a8d] text-xs font-semibold hover:bg-white transition-colors"
                >
                  <ExternalLink size={12} /> Abrir
                </a>
                <a
                  href={documento.archivo_url}
                  download
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-[rgba(30,58,95,0.14)] text-[#6b7a8d] text-xs font-semibold hover:bg-white transition-colors"
                >
                  <Download size={12} /> Descargar
                </a>
              </div>
            )}
          </header>

          {documento?.archivo_url ? (
            <>
              {/* `<object>` y no `<iframe>`: si el navegador no sabe mostrar el PDF, cae al
                  contenido interno en vez de dejar un marco en blanco. */}
              <object
                data={documento.archivo_url}
                type="application/pdf"
                className="w-full h-[520px] bg-[#58606b]"
              >
                <div className="p-8 text-center bg-[#58606b] text-white">
                  <p className="text-sm mb-3">Tu navegador no puede mostrar el PDF aquí.</p>
                  <a
                    href={documento.archivo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-[#1e3a5f] text-sm font-semibold"
                  >
                    <ExternalLink size={14} /> Abrir en una pestaña nueva
                  </a>
                </div>
              </object>

              <footer className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 bg-[#3f464f] text-[#cbd5e1] text-xs">
                <span className="truncate max-w-[60%]">{nombreArchivo(documento.archivo)}</span>
                <span>Cargado el {formatFecha(documento.cargado_en)}</span>
              </footer>
            </>
          ) : (
            <div className="p-10 text-center">
              <FileWarning className="mx-auto mb-3 text-[#e8740e]" size={30} />
              <p className="text-sm font-semibold text-[#1e3a5f]">
                Esta producción no tiene documento de soporte.
              </p>
              <p className="text-xs text-[#6b7a8d] mt-1">
                No hay nada que avalar hasta que el docente cargue el archivo.
              </p>
            </div>
          )}
        </section>

        {/* --------------------- Ficha --------------------- */}
        <section className="border border-[rgba(30,58,95,0.09)] rounded-2xl overflow-hidden">
          <header className="px-4 py-3 bg-gradient-to-r from-[#f3ede1] to-[rgba(243,237,225,0.45)] border-b border-[rgba(30,58,95,0.14)]">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-[#1e3a5f]">
              Ficha de la producción
            </h2>
          </header>

          <div className="p-4 flex flex-col gap-4">
            {ficha.docente && (
              <div className="flex items-center gap-3 p-3 rounded-xl border border-[rgba(30,58,95,0.09)] bg-[#fafbfc]">
                <span className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 grid place-items-center text-xs font-bold shrink-0">
                  {ficha.docente.nombre_completo
                    .split(/\s+/)
                    .slice(0, 2)
                    .map((p) => p.charAt(0).toUpperCase())
                    .join("")}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-gray-900 text-sm truncate">
                    {ficha.docente.nombre_completo}
                  </p>
                  <p className="text-xs text-[#6b7a8d] truncate">
                    {ficha.docente.numero_identificacion} · {ficha.docente.email}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    navigate(`/evaluador-produccion/docentes/${ficha.docente!.id}`)
                  }
                  className="px-2.5 py-1.5 rounded-lg border border-[rgba(30,58,95,0.14)] text-[#6b7a8d] text-xs font-semibold hover:bg-white transition-colors shrink-0"
                >
                  Ver expediente
                </button>
              </div>
            )}

            <div>
              <h3 className="text-base font-bold text-[#1e3a5f] leading-snug">{ficha.titulo}</h3>
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                <span className="text-xs px-2 py-0.5 rounded-md bg-[rgba(30,58,95,0.06)] text-[#1e3a5f]">
                  {ficha.producto_academico ?? "Sin tipo"}
                </span>
                <span className="text-[#b0b8c2]">→</span>
                <span className="text-xs px-2 py-0.5 rounded-md bg-[rgba(30,58,95,0.06)] text-[#1e3a5f]">
                  {ficha.ambito_divulgacion ?? "Sin ámbito"}
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-[#fff7ed] text-[#c2410c] border border-[#fed7aa]">
                  otorga {ficha.puntaje} pts
                </span>
              </div>
            </div>

            <dl className="grid grid-cols-2 gap-px bg-[rgba(30,58,95,0.14)] border border-[rgba(30,58,95,0.14)] rounded-xl overflow-hidden">
              <Dato etiqueta="Medio de divulgación" valor={ficha.medio_divulgacion} ancho />
              <Dato etiqueta="Fecha de divulgación" valor={formatFecha(ficha.fecha_divulgacion)} />
              <Dato etiqueta="Número de autores" valor={ficha.numero_autores?.toString()} />
              <Dato etiqueta="DOI" valor={ficha.doi} />
              <Dato etiqueta="ISSN / ISBN" valor={ficha.issn_isbn} />
              <Dato etiqueta="Enlace de la publicación" valor={ficha.url_publicacion} ancho />
              <Dato etiqueta="Registrada en UniDoc" valor={formatFecha(ficha.registrada_en)} ancho />
            </dl>

            <EnlacesConsulta
              enlaces={ficha.enlaces_consulta}
              onPedirIdentificadores={() => setModalAbierto(true)}
            />

            {/* --------------------- Decisión --------------------- */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-[#fafbfc] border border-[rgba(30,58,95,0.14)]">
              <span className="text-xs text-[#6b7a8d]">
                {esPendiente ? "Sin revisar" : "Ya revisada"} · afecta a{" "}
                <b className="text-[#2c3e50]">
                  {ficha.documentos.length}{" "}
                  {ficha.documentos.length === 1 ? "documento" : "documentos"}
                </b>
              </span>

              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={decidiendo || ficha.documentos.length === 0}
                  onClick={() => setModalAbierto(true)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold border transition-colors disabled:opacity-50 ${
                    estaAvalada
                      ? "bg-[#fffbeb] text-[#b45309] border-[#fde68a] hover:bg-[#fef3c7]"
                      : "bg-white text-red-700 border-red-200 hover:bg-red-50"
                  }`}
                >
                  {estaAvalada ? <RotateCcw size={14} /> : <XCircle size={14} />}
                  {estaAvalada ? "Revertir aval" : "Rechazar"}
                </button>

                {!estaAvalada && (
                  <button
                    type="button"
                    disabled={decidiendo || ficha.documentos.length === 0}
                    onClick={avalar}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    {decidiendo ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <CheckCircle2 size={14} />
                    )}
                    Avalar producción
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>

      <ModalMotivoRechazo
        open={modalAbierto}
        loading={decidiendo}
        tone={estaAvalada ? "reversion" : "rechazo"}
        title={estaAvalada ? "Revertir aval" : "Rechazar producción académica"}
        confirmLabel={estaAvalada ? "Confirmar reversión" : "Confirmar rechazo"}
        description={
          estaAvalada
            ? `Avalada por ${ficha.revisado_por?.nombre ?? "otro evaluador"} el ${formatFecha(
                ficha.revisado_en
              )}.`
            : "Indique el motivo por el cual se rechaza esta producción. El docente lo recibirá tal cual, así que sea concreto sobre qué debe corregir."
        }
        onClose={() => setModalAbierto(false)}
        onConfirm={rechazar}
      >
        {/* El alcance de la decisión, dicho antes de confirmar: cae sobre varios documentos y
            mueve el escalafón del docente. */}
        <div
          className={`flex gap-2.5 p-3 rounded-lg border text-xs leading-relaxed ${
            estaAvalada
              ? "bg-[#fffbeb] border-[#fde68a] text-[#92400e]"
              : "bg-gray-50 border-gray-200 text-gray-600"
          }`}
        >
          <AlertTriangle size={15} className="shrink-0 mt-0.5" />
          <div>
            {estaAvalada ? (
              <>
                <b>El escalafón de {ficha.docente?.nombre_completo ?? "el docente"} va a cambiar.</b>{" "}
                Su puntaje de producción baja de <b>{impacto.puntaje_actual}</b> a{" "}
                <b>{impacto.puntaje_si_revierte}</b> puntos, y su categoría puede descender.
                Recibirá una notificación con el motivo que escriba acá.
              </>
            ) : (
              <>
                Se rechazarán{" "}
                <b>
                  los {ficha.documentos.length}{" "}
                  {ficha.documentos.length === 1 ? "documento" : "documentos"}
                </b>{" "}
                de esta producción, y no sumará sus {ficha.puntaje} puntos al escalafón.
              </>
            )}
          </div>
        </div>
      </ModalMotivoRechazo>
    </div>
  );
};

/**
 * Aviso de cabecera: qué significa esta decisión en puntos de escalafón.
 *
 * Cambia según el estado, porque la pregunta del evaluador es distinta en cada caso: ante una
 * pendiente quiere saber qué concede, ante una avalada qué perdería al revertir, y ante una
 * rechazada por qué se rechazó.
 */
const AvisoImpacto = ({
  estado,
  docente,
  impacto,
  esDecisionHistorica,
  motivoRechazo,
  revisadoPor,
  revisadoEn,
}: {
  estado: ProduccionFicha["estado"];
  docente: string;
  impacto: ProduccionFicha["impacto_escalafon"];
  esDecisionHistorica: boolean;
  motivoRechazo: string | null;
  revisadoPor: string | null;
  revisadoEn: string | null;
}) => {
  const base = "flex gap-3 p-3.5 rounded-xl border text-sm leading-relaxed";

  if (esDecisionHistorica) {
    return (
      <div className={`${base} bg-gray-50 border-gray-200 text-gray-600`}>
        <AlertTriangle size={17} className="shrink-0 mt-0.5" />
        <div>
          <b>Aval anterior al cambio.</b> Esta producción la decidió Apoyo Profesoral antes de que
          el aval pasara a este rol, así que no hay constancia de quién la revisó. Sigue vigente:
          revísala solo si detectas un problema.
        </div>
      </div>
    );
  }

  if (estado === "aprobado") {
    return (
      <div className={`${base} bg-green-50 border-green-200 text-green-800`}>
        <CheckCircle2 size={17} className="shrink-0 mt-0.5" />
        <div>
          <b>Avalada</b>
          {revisadoPor && <> por {revisadoPor}</>}
          {revisadoEn && <> el {formatFecha(revisadoEn)}</>}. Está sumando{" "}
          <b>{impacto.otorga} puntos</b> al escalafón de {docente}. Revertir el aval los quitaría y
          su puntaje bajaría a <b>{impacto.puntaje_si_revierte}</b>.
        </div>
      </div>
    );
  }

  if (estado === "rechazado") {
    return (
      <div className={`${base} bg-red-50 border-red-200 text-red-800`}>
        <XCircle size={17} className="shrink-0 mt-0.5" />
        <div>
          <b>Rechazada</b>
          {revisadoPor && <> por {revisadoPor}</>}
          {revisadoEn && <> el {formatFecha(revisadoEn)}</>}. No suma puntos al escalafón.
          {motivoRechazo && (
            <p className="mt-1 italic">«{motivoRechazo}»</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`${base} bg-[#fffbeb] border-[#fde68a] text-[#92400e]`}>
      <AlertTriangle size={17} className="shrink-0 mt-0.5" />
      <div>
        <b>Pendiente de aval.</b> Avalar esta producción le otorga{" "}
        <b>{impacto.otorga} puntos</b> de escalafón a {docente}. Su puntaje de producción pasaría
        de <b>{impacto.puntaje_actual}</b> a <b>{impacto.puntaje_si_avala}</b> puntos.
      </div>
    </div>
  );
};

/**
 * Una fila de la ficha.
 *
 * Un dato ausente se muestra como «no registrado» en cursiva gris, no se oculta: el evaluador
 * necesita saber que se preguntó y que no había nada, que es distinto de que nadie lo mirara.
 */
const Dato = ({
  etiqueta,
  valor,
  ancho = false,
}: {
  etiqueta: string;
  valor?: string | null;
  ancho?: boolean;
}) => (
  <div className={`bg-white px-3 py-2 ${ancho ? "col-span-2" : ""}`}>
    <dt className="text-[10px] uppercase tracking-wider text-[#6b7a8d] font-semibold">
      {etiqueta}
    </dt>
    <dd
      className={`text-xs mt-0.5 break-words ${
        valor && valor !== "—" ? "text-[#2c3e50] font-medium" : "text-[#b0b8c2] italic"
      }`}
    >
      {valor && valor !== "—" ? valor : "no registrado"}
    </dd>
  </div>
);

/** Se queda con el nombre del archivo, sin la ruta de almacenamiento. */
const nombreArchivo = (ruta: string): string => ruta.split("/").pop() ?? ruta;

export default FichaProduccion;
