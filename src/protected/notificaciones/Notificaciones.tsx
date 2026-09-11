import { useCallback, useEffect, useState } from "react";
import { BellOff, CheckCheck, RotateCcw } from "lucide-react";
import axiosInstance from "../../utils/axiosConfig";
import ItemNotificacion from "../../componentes/notificaciones/ItemNotificacion";
import { useNotificaciones } from "../../hooks/useNotificaciones";
import type { Notificacion, RespuestaNotificaciones } from "../../types/notificaciones";

/**
 * Historial completo de notificaciones.
 *
 * No reutiliza el estado compartido de la campana porque persiguen cosas distintas: la campana
 * mantiene siempre las ocho últimas y se refresca sola, mientras que aquí el usuario va acumulando
 * páginas hacia atrás y un sondeo que reescribiera la lista le movería lo que está leyendo.
 *
 * Lo que sí comparte son las acciones de marcado, para que apagar un aviso aquí también apague el
 * globo rojo del encabezado sin recargar la página.
 */

const POR_PAGINA = 20;

const Notificaciones = () => {
  const { marcarLeida: marcarLeidaGlobal, marcarTodasLeidas: marcarTodasGlobal } = useNotificaciones();

  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [pagina, setPagina] = useState(1);
  const [paginas, setPaginas] = useState(1);
  const [total, setTotal] = useState(0);
  const [noLeidas, setNoLeidas] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);

  const cargarPagina = useCallback(async (numero: number) => {
    setCargando(true);
    setError(false);
    try {
      const { data } = await axiosInstance.get<RespuestaNotificaciones>("/notificaciones", {
        params: { pagina: numero, limite: POR_PAGINA },
      });

      // Se concatena en vez de reemplazar: es un «cargar más», no un paginador con números.
      setNotificaciones((previas) =>
        numero === 1 ? data.notificaciones : [...previas, ...data.notificaciones]
      );
      setPagina(data.pagina);
      setPaginas(data.paginas);
      setTotal(data.total);
      setNoLeidas(data.no_leidas);
    } catch {
      setError(true);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarPagina(1);
  }, [cargarPagina]);

  const marcarUna = (id: string) => {
    const objetivo = notificaciones.find((n) => n.id === id);
    if (!objetivo || objetivo.leida) return;

    setNotificaciones((previas) => previas.map((n) => (n.id === id ? { ...n, leida: true } : n)));
    setNoLeidas((n) => Math.max(0, n - 1));
    marcarLeidaGlobal(id);
  };

  const marcarTodas = () => {
    if (noLeidas === 0) return;
    setNotificaciones((previas) => previas.map((n) => ({ ...n, leida: true })));
    setNoLeidas(0);
    marcarTodasGlobal();
  };

  return (
    <section className="mx-auto w-full max-w-[720px] px-4 py-8">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1e3a5f]">Notificaciones</h1>
          <p className="mt-0.5 text-sm text-[#6b7a8d]">
            {total === 0
              ? "Sin actividad registrada"
              : `${total} en total · ${noLeidas} sin leer`}
          </p>
        </div>

        {noLeidas > 0 && (
          <button
            type="button"
            onClick={marcarTodas}
            className="flex items-center gap-1.5 rounded-lg border border-[rgba(30,58,95,0.15)] px-3 py-2 text-sm font-medium text-[#1e3a5f] transition-colors hover:bg-[rgba(30,58,95,0.05)]"
          >
            <CheckCheck size={16} />
            Marcar todas como leídas
          </button>
        )}
      </header>

      <div className="divide-y divide-[rgba(30,58,95,0.08)] overflow-hidden rounded-xl border border-[rgba(30,58,95,0.1)] bg-white">
        {notificaciones.map((n) => (
          <ItemNotificacion key={n.id} notificacion={n} onLeer={marcarUna} />
        ))}

        {cargando && notificaciones.length === 0 && (
          <p className="px-4 py-12 text-center text-sm text-[#6b7a8d]">Cargando…</p>
        )}

        {!cargando && error && notificaciones.length === 0 && (
          <div className="px-4 py-12 text-center">
            <p className="text-sm text-[#6b7a8d]">No se pudieron cargar las notificaciones.</p>
            <button
              type="button"
              onClick={() => cargarPagina(1)}
              className="mx-auto mt-3 flex items-center gap-1 text-sm font-medium text-[#1e3a5f] hover:underline"
            >
              <RotateCcw size={15} />
              Reintentar
            </button>
          </div>
        )}

        {!cargando && !error && notificaciones.length === 0 && (
          <div className="px-4 py-16 text-center">
            <BellOff size={32} className="mx-auto text-[#c3ccd6]" aria-hidden="true" />
            <p className="mt-3 text-sm text-[#6b7a8d]">Todavía no tienes notificaciones.</p>
          </div>
        )}
      </div>

      {pagina < paginas && (
        <div className="mt-4 text-center">
          <button
            type="button"
            disabled={cargando}
            onClick={() => cargarPagina(pagina + 1)}
            className="rounded-lg border border-[rgba(30,58,95,0.15)] px-4 py-2 text-sm font-medium text-[#1e3a5f] transition-colors hover:bg-[rgba(30,58,95,0.05)] disabled:opacity-50"
          >
            {cargando ? "Cargando…" : "Cargar más"}
          </button>
        </div>
      )}
    </section>
  );
};

export default Notificaciones;
