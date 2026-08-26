import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { ArrowLeft, Copy, Eye, Loader2 } from "lucide-react";
import axiosInstance from "../../utils/axiosConfig";
import { ExpedienteDocente as Expediente } from "../../types/evaluadorProduccion";
import { EstadoProduccionPill, MarcaEnlaces, Puntaje, formatFecha } from "./piezas";

/**
 * Todas las producciones de un docente en una pantalla.
 *
 * Resuelve dos cosas que la bandeja no puede: ver el peso acumulado de las decisiones sobre esa
 * persona —cuántos de sus puntos de escalafón vienen de producción avalada— y detectar la misma
 * publicación registrada dos veces con títulos ligeramente distintos, que es un caso real cuando
 * una ponencia se convierte después en artículo.
 */
const ExpedienteDocente = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [expediente, setExpediente] = useState<Expediente | null>(null);
  const [cargando, setCargando] = useState(true);

  const cargar = useCallback(async () => {
    try {
      setCargando(true);
      const { data } = await axiosInstance.get(
        `/evaluadorProduccion/docentes/${id}/producciones`
      );
      setExpediente(data.data);
    } catch (error) {
      console.error("Error al cargar el expediente:", error);
      toast.error("No se pudo cargar el expediente del docente");
    } finally {
      setCargando(false);
    }
  }, [id]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  if (cargando) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-3xl border border-[rgba(30,58,95,0.09)]">
        <Loader2 className="animate-spin text-[#e8740e] mb-3" size={34} />
        <p className="text-[#1e3a5f] font-bold">Cargando el expediente…</p>
      </div>
    );
  }

  if (!expediente) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-[rgba(30,58,95,0.09)] text-center">
        <p className="text-[#1e3a5f] font-bold mb-3">No se encontró el docente.</p>
        <button
          type="button"
          onClick={() => navigate("/evaluador-produccion/docentes")}
          className="px-4 py-2 rounded-lg bg-[#1e3a5f] text-white text-sm font-semibold"
        >
          Volver al listado
        </button>
      </div>
    );
  }

  const { docente, producciones, resumen, posibles_duplicados: duplicados } = expediente;

  return (
    <div className="flex flex-col gap-5 w-full bg-white rounded-3xl p-4 sm:p-6 lg:p-8 min-h-screen border border-[rgba(30,58,95,0.09)]">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[rgba(30,58,95,0.14)] text-[#6b7a8d] text-sm font-medium hover:bg-gray-50 transition-colors w-fit"
      >
        <ArrowLeft size={15} /> Volver
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-3">
        <div className="flex items-center gap-3 p-4 rounded-2xl border border-[rgba(30,58,95,0.09)] bg-[#fafbfc]">
          <span className="w-11 h-11 rounded-full bg-blue-100 text-blue-700 grid place-items-center text-sm font-bold shrink-0">
            {docente.nombre_completo
              .split(/\s+/)
              .slice(0, 2)
              .map((p) => p.charAt(0).toUpperCase())
              .join("")}
          </span>
          <div className="min-w-0">
            <p className="font-bold text-gray-900 text-base truncate">
              {docente.nombre_completo}
            </p>
            <p className="text-xs text-[#6b7a8d] truncate">
              {docente.numero_identificacion} · {docente.email}
            </p>
          </div>
        </div>

        {/* «19 de 38 registrados» dice de un golpe cuánto de lo que declaró el docente está
            efectivamente avalado, y por tanto cuánto está en juego en esta pantalla. */}
        <div className="p-4 rounded-2xl border border-[rgba(30,58,95,0.09)] bg-[#fafbfc]">
          <p className="text-[10.5px] uppercase tracking-wider text-[#6b7a8d] font-semibold mb-1.5">
            Puntaje de producción avalada
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#1e3a5f] leading-none tabular-nums">
              {resumen.puntaje_avalado}
            </span>
            <span className="text-xs text-[#6b7a8d]">
              de {resumen.puntaje_declarado} registrados
            </span>
          </div>
          <p className="text-xs text-[#6b7a8d] mt-1.5">
            {resumen.avaladas} avaladas · {resumen.pendientes} pendientes ·{" "}
            {resumen.rechazadas} rechazadas
          </p>
        </div>
      </div>

      {/* Aviso, nunca bloqueo: la decisión sigue siendo del evaluador. */}
      {duplicados.length > 0 && (
        <div className="flex gap-3 p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-sm leading-relaxed">
          <Copy size={17} className="shrink-0 mt-0.5" />
          <div>
            <b>
              {duplicados.length === 1
                ? "Hay dos registros con títulos muy parecidos."
                : `Hay ${duplicados.length} grupos de registros con títulos muy parecidos.`}
            </b>{" "}
            Revisa si son la misma publicación antes de avalar ambas.
            <ul className="mt-2 flex flex-col gap-2">
              {duplicados.map((grupo, i) => (
                <li key={i} className="text-xs">
                  <span className="font-semibold">{grupo.anio}:</span>
                  <ul className="mt-0.5 ml-3 list-disc marker:text-blue-400">
                    {grupo.titulos.map((titulo, j) => (
                      <li key={j}>«{titulo}»</li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-[rgba(30,58,95,0.09)] shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-[#f3ede1] to-[rgba(243,237,225,0.5)] border-b border-[rgba(30,58,95,0.12)]">
                {["Título", "Tipo y ámbito", "Puntaje", "Divulgación", "Enlaces", "Estado", "Revisó", ""].map(
                  (encabezado) => (
                    <th
                      key={encabezado}
                      className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-[#1e3a5f] whitespace-nowrap"
                    >
                      {encabezado && (
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#e8740e] mr-2 align-middle" />
                      )}
                      {encabezado}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(30,58,95,0.06)]">
              {producciones.map((fila) => (
                <tr
                  key={fila.id_produccion_academica}
                  className={fila.estado === "pendiente" ? "bg-[rgba(30,58,95,0.02)]" : ""}
                >
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-gray-900 text-sm leading-snug max-w-[300px]">
                      {fila.titulo}
                    </p>
                    <p className="text-xs text-[#6b7a8d] mt-0.5">
                      {fila.medio_divulgacion ?? "Sin medio registrado"}
                    </p>
                  </td>
                  <td className="px-5 py-3.5 text-sm">
                    <span className="block text-[#2c3e50]">{fila.producto_academico ?? "—"}</span>
                    <span className="block text-xs text-[#6b7a8d]">
                      {fila.ambito_divulgacion ?? "—"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <Puntaje valor={fila.puntaje} />
                  </td>
                  <td className="px-5 py-3.5 text-sm tabular-nums whitespace-nowrap">
                    {formatFecha(fila.fecha_divulgacion)}
                  </td>
                  <td className="px-5 py-3.5">
                    <MarcaEnlaces fila={fila} />
                  </td>
                  <td className="px-5 py-3.5">
                    <EstadoProduccionPill fila={fila} />
                  </td>
                  <td className="px-5 py-3.5 text-sm whitespace-nowrap">
                    {fila.revisado_por ? (
                      <>
                        <span className="block text-[#2c3e50]">{fila.revisado_por.nombre}</span>
                        <span className="block text-xs text-[#6b7a8d] tabular-nums">
                          {formatFecha(fila.revisado_en)}
                        </span>
                      </>
                    ) : (
                      <span className="text-[#b0b8c2] italic">
                        {fila.es_decision_historica ? "no registrado" : "—"}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/evaluador-produccion/produccion/${fila.id_produccion_academica}`
                        )
                      }
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                        fila.estado === "pendiente"
                          ? "bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                          : "bg-white hover:bg-gray-50 text-[#6b7a8d] border-[rgba(30,58,95,0.14)]"
                      }`}
                    >
                      <Eye size={14} />
                      {fila.estado === "pendiente" ? "Revisar" : "Ver"}
                    </button>
                  </td>
                </tr>
              ))}

              {producciones.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-sm text-[#6b7a8d]">
                    Este docente no tiene producciones académicas registradas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ExpedienteDocente;
