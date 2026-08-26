import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ColumnDef } from "@tanstack/react-table";
import { Eye, User, CheckCircle2, FileText } from "lucide-react";
import axiosInstance from "../../utils/axiosConfig";
import { DataTable2 } from "../../componentes/tablas/DataTable2";
import {
  FiltrosBandeja,
  ProduccionFila,
  ResumenBandeja,
} from "../../types/evaluadorProduccion";
import { EstadoProduccionPill, MarcaEnlaces, Puntaje, Tile, formatFecha } from "./piezas";

type Catalogo = { id: number; nombre: string };

/** Cuántas filas pide cada llamada. La tabla pagina dentro de lo que ya tiene descargado. */
const POR_PAGINA = 100;

/**
 * Bandeja del Evaluador de Producción: todas las producciones académicas del sistema.
 *
 * Abre filtrada en pendientes porque es el trabajo del día, pero **las otras fichas están al
 * lado**. Es la diferencia con el controlador anterior, que filtraba `estado = 'pendiente'` en el
 * servidor y no aceptaba otra cosa: apenas el evaluador avalaba algo, desaparecía de su pantalla
 * y no había forma de auditar ni de corregir una decisión propia.
 */
const BandejaProducciones = () => {
  const navigate = useNavigate();

  const [filas, setFilas] = useState<ProduccionFila[]>([]);
  const [resumen, setResumen] = useState<ResumenBandeja | null>(null);
  const [cargando, setCargando] = useState(true);
  const [total, setTotal] = useState(0);
  const [pagina, setPagina] = useState(1);
  const [ultimaPagina, setUltimaPagina] = useState(1);

  const [productos, setProductos] = useState<Catalogo[]>([]);
  const [ambitos, setAmbitos] = useState<Catalogo[]>([]);

  const [filtros, setFiltros] = useState<FiltrosBandeja>({ estado: "pendiente" });

  // -----------------------------------------------------------------
  // Datos
  // -----------------------------------------------------------------

  /** Deja fuera de la query los filtros vacíos, para no mandar `estado=` y que el backend lo lea. */
  const parametros = useCallback(
    (paginaPedida: number) => {
      const params: Record<string, string | number | boolean> = {
        por_pagina: POR_PAGINA,
        page: paginaPedida,
      };

      if (filtros.estado) params.estado = filtros.estado;
      if (filtros.producto) params.producto = filtros.producto;
      if (filtros.ambito) params.ambito = filtros.ambito;
      if (filtros.desde) params.desde = filtros.desde;
      if (filtros.hasta) params.hasta = filtros.hasta;
      if (filtros.sin_enlace) params.sin_enlace = true;
      if (filtros.q) params.q = filtros.q;

      return params;
    },
    [filtros]
  );

  const cargarProducciones = useCallback(
    async (paginaPedida = 1, acumular = false) => {
      try {
        setCargando(true);

        const { data } = await axiosInstance.get("/evaluadorProduccion/producciones", {
          params: parametros(paginaPedida),
        });

        setFilas((previas) => (acumular ? [...previas, ...data.data] : data.data));
        setTotal(data.meta?.total ?? data.data.length);
        setUltimaPagina(data.meta?.ultima_pagina ?? 1);
        setPagina(paginaPedida);
      } catch (error) {
        console.error("Error al cargar las producciones:", error);
        toast.error("No se pudieron cargar las producciones académicas");
      } finally {
        setCargando(false);
      }
    },
    [parametros]
  );

  const cargarResumen = useCallback(async () => {
    try {
      const { data } = await axiosInstance.get("/evaluadorProduccion/resumen");
      setResumen(data.data);
    } catch (error) {
      // Los contadores son un apoyo, no el contenido: si fallan, la bandeja sigue siendo usable
      // y no tiene sentido interrumpir al evaluador con un aviso de error.
      console.error("Error al cargar el resumen:", error);
    }
  }, []);

  useEffect(() => {
    cargarProducciones(1);
  }, [cargarProducciones]);

  useEffect(() => {
    cargarResumen();

    // Los catálogos alimentan los desplegables de tipo de producto y ámbito. Son públicos y
    // cambian poco, así que se piden una sola vez al montar.
    const cargarCatalogos = async () => {
      try {
        const [productosRes, ambitosRes] = await Promise.all([
          axiosInstance.get("/tiposProduccionAcademica/productos-academicos"),
          axiosInstance.get("/tiposProduccionAcademica/ambitos-divulgacion"),
        ]);

        setProductos(
          productosRes.data.map((p: Record<string, unknown>) => ({
            id: p.id_producto_academico as number,
            nombre: p.nombre_producto_academico as string,
          }))
        );
        setAmbitos(
          ambitosRes.data.map((a: Record<string, unknown>) => ({
            id: a.id_ambito_divulgacion as number,
            nombre: a.nombre_ambito_divulgacion as string,
          }))
        );
      } catch (error) {
        console.error("Error al cargar los catálogos:", error);
      }
    };

    cargarCatalogos();
  }, [cargarResumen]);

  // -----------------------------------------------------------------
  // Tabla
  // -----------------------------------------------------------------

  const columnas = useMemo<ColumnDef<ProduccionFila>[]>(
    () => [
      {
        id: "docente",
        accessorFn: (fila) => fila.docente?.nombre_completo ?? "",
        // En la tarjeta de móvil lo que identifica la fila es el título de la producción, no el
        // docente: la bandeja se recorre buscando qué revisar, no a quién. El docente baja a la
        // línea gris de debajo.
        meta: { rolMovil: "meta", etiquetaMovil: "Docente" },
        header: () => (
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span>Docente</span>
          </div>
        ),
        cell: ({ row }) => {
          const docente = row.original.docente;
          if (!docente) return <span className="text-[#b0b8c2] italic">Sin docente</span>;

          return (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/evaluador-produccion/docentes/${docente.id}`);
              }}
              className="flex items-center gap-2.5 text-left hover:underline focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 rounded"
            >
              <span className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 grid place-items-center text-[10.5px] font-bold shrink-0">
                {iniciales(docente.nombre_completo)}
              </span>
              <span>
                <span className="block text-sm font-medium text-gray-900 leading-tight">
                  {docente.nombre_completo}
                </span>
                <span className="block text-xs text-[#6b7a8d]">
                  {docente.numero_identificacion ?? "—"}
                </span>
              </span>
            </button>
          );
        },
      },
      {
        accessorKey: "titulo",
        // El tope de ancho evita que un título de 90 caracteres ahogue a las demás
        // columnas ahora que las celdas pueden partir el texto.
        meta: { rolMovil: "titulo", anchoMax: "300px" },
        header: () => (
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span>Título</span>
          </div>
        ),
        cell: ({ row }) => (
          <div className="max-w-[280px]">
            <p className="font-medium text-gray-900 leading-snug">{row.original.titulo}</p>
            <p className="text-xs text-[#6b7a8d] mt-0.5">
              {row.original.medio_divulgacion ?? "Sin medio registrado"}
            </p>
          </div>
        ),
      },
      {
        id: "ambito",
        accessorFn: (fila) => fila.ambito_divulgacion ?? "",
        meta: { prioridad: 2, etiquetaMovil: "Tipo y ámbito" },
        header: "Tipo y ámbito",
        cell: ({ row }) => (
          <div className="flex flex-col gap-0.5">
            <span className="text-[#2c3e50]">
              {row.original.producto_academico ?? "—"}
            </span>
            <span className="text-xs text-[#6b7a8d]">
              {row.original.ambito_divulgacion ?? "—"}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "puntaje",
        // Va a la derecha del título en la tarjeta: es el dato que decide por dónde empezar.
        meta: { rolMovil: "destacado", nowrap: true, prioridad: 1 },
        header: "Puntaje",
        cell: ({ row }) => <Puntaje valor={row.original.puntaje} />,
      },
      {
        accessorKey: "fecha_divulgacion",
        // nowrap: "12 mar 2026" partido en dos líneas se lee peor que no verlo.
        meta: { nowrap: true, prioridad: 3, etiquetaMovil: "Divulgación" },
        header: "Divulgación",
        cell: ({ row }) => (
          <span className="tabular-nums">{formatFecha(row.original.fecha_divulgacion)}</span>
        ),
      },
      {
        id: "enlaces",
        meta: { rolMovil: "chip", prioridad: 2, etiquetaMovil: "Enlaces" },
        header: "Enlaces",
        cell: ({ row }) => <MarcaEnlaces fila={row.original} />,
      },
      {
        accessorKey: "estado",
        header: "Estado",
        cell: ({ row }) => <EstadoProduccionPill fila={row.original} />,
      },
      {
        id: "acciones",
        header: "Acción",
        cell: ({ row }) => {
          const pendiente = row.original.estado === "pendiente";

          return (
            <button
              type="button"
              onClick={() =>
                navigate(
                  `/evaluador-produccion/produccion/${row.original.id_produccion_academica}`
                )
              }
              className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors border ${
                pendiente
                  ? "bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                  : "bg-white hover:bg-gray-50 text-[#6b7a8d] border-[rgba(30,58,95,0.14)]"
              }`}
            >
              <Eye className="w-4 h-4" />
              {pendiente ? "Revisar" : "Ver"}
            </button>
          );
        },
      },
    ],
    [navigate]
  );

  // -----------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------

  const fichas: { valor: FiltrosBandeja["estado"]; etiqueta: string; n?: number }[] = [
    { valor: "pendiente", etiqueta: "Pendientes", n: resumen?.pendientes },
    { valor: "aprobado", etiqueta: "Avaladas" },
    { valor: "rechazado", etiqueta: "Rechazadas" },
    { valor: "", etiqueta: "Todas", n: resumen?.total },
  ];

  const sinResultados = !cargando && filas.length === 0;

  return (
    <div className="flex flex-col gap-4 h-full w-full bg-white rounded-3xl p-4 sm:p-6 lg:p-8 min-h-screen border border-[rgba(30,58,95,0.09)]">
      {/* Contadores. Se mantienen visibles aunque la bandeja esté vacía: son la prueba del
          trabajo hecho, y el evaluador termina el día viendo esta pantalla sin filas. */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Tile
          etiqueta="Pendientes de aval"
          valor={resumen?.pendientes ?? "—"}
          color="ambar"
          onClick={() => setFiltros({ estado: "pendiente" })}
        />
        <Tile
          etiqueta="Avaladas este mes"
          valor={resumen?.avaladas_mes ?? "—"}
          color="verde"
          onClick={() => setFiltros({ estado: "aprobado" })}
        />
        <Tile
          etiqueta="Rechazadas este mes"
          valor={resumen?.rechazadas_mes ?? "—"}
          color="rojo"
          onClick={() => setFiltros({ estado: "rechazado" })}
        />
        <Tile
          etiqueta="Sin enlace de consulta"
          valor={resumen?.sin_enlace ?? "—"}
          detalle="Sin DOI ni URL"
          color="naranja"
          onClick={() => setFiltros({ estado: "", sin_enlace: true })}
        />
      </div>

      {/* Filtros. El estado va en fichas porque es el que se cambia diez veces al día; el resto
          en desplegables, que ocupan menos y se tocan poco. */}
      <div className="border border-[rgba(30,58,95,0.09)] rounded-2xl p-4 flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10.5px] uppercase tracking-wider text-[#6b7a8d] font-semibold w-16 shrink-0">
            Estado
          </span>
          {fichas.map((ficha) => {
            const activa = (filtros.estado ?? "") === (ficha.valor ?? "");

            return (
              <button
                key={ficha.etiqueta}
                type="button"
                onClick={() => setFiltros((f) => ({ ...f, estado: ficha.valor }))}
                className={`text-sm font-medium px-3 py-1.5 rounded-full border transition-colors ${
                  activa
                    ? "bg-[#1e3a5f] border-[#1e3a5f] text-white"
                    : "bg-white border-[rgba(30,58,95,0.14)] text-[#6b7a8d] hover:border-[#1e3a5f]"
                }`}
              >
                {ficha.etiqueta}
                {typeof ficha.n === "number" && (
                  <span className="ml-1.5 opacity-70 tabular-nums">{ficha.n}</span>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-dashed border-[rgba(30,58,95,0.14)]">
          <span className="text-[10.5px] uppercase tracking-wider text-[#6b7a8d] font-semibold w-16 shrink-0">
            Filtros
          </span>

          <Select
            etiqueta="Tipo de producto"
            valor={filtros.producto ?? ""}
            opciones={productos}
            onChange={(v) => setFiltros((f) => ({ ...f, producto: v }))}
          />
          <Select
            etiqueta="Ámbito"
            valor={filtros.ambito ?? ""}
            opciones={ambitos}
            onChange={(v) => setFiltros((f) => ({ ...f, ambito: v }))}
          />

          <label className="flex items-center gap-2 text-sm text-[#2c3e50]">
            <span className="text-[#6b7a8d]">Desde</span>
            <input
              type="date"
              value={filtros.desde ?? ""}
              onChange={(e) => setFiltros((f) => ({ ...f, desde: e.target.value }))}
              className="border border-[rgba(30,58,95,0.14)] rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30"
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-[#2c3e50]">
            <span className="text-[#6b7a8d]">hasta</span>
            <input
              type="date"
              value={filtros.hasta ?? ""}
              onChange={(e) => setFiltros((f) => ({ ...f, hasta: e.target.value }))}
              className="border border-[rgba(30,58,95,0.14)] rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30"
            />
          </label>

          <label className="flex items-center gap-2 text-sm text-[#2c3e50] cursor-pointer">
            <input
              type="checkbox"
              checked={filtros.sin_enlace ?? false}
              onChange={(e) => setFiltros((f) => ({ ...f, sin_enlace: e.target.checked }))}
              className="w-4 h-4 accent-[#e8740e]"
            />
            Solo sin enlace de consulta
          </label>

          {tieneFiltrosExtra(filtros) && (
            <button
              type="button"
              onClick={() => setFiltros({ estado: filtros.estado })}
              className="text-sm text-[#6b7a8d] underline hover:text-[#1e3a5f]"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <DataTable2
          data={filas}
          columns={columnas}
          loading={cargando && filas.length === 0}
          searchPlaceholder="Buscar por título, docente o medio de divulgación…"
          // La búsqueda va al servidor: `q` recorre también nombre e identificación del docente,
          // que no están entre las columnas descargadas y el filtro local nunca encontraría.
          onSearchChange={(valor) => setFiltros((f) => ({ ...f, q: valor }))}
        />
      </div>

      {/* La tabla pagina lo que ya tiene; esto trae el siguiente bloque del servidor. */}
      {pagina < ultimaPagina && (
        <div className="flex items-center justify-center gap-3 py-2">
          <span className="text-sm text-[#6b7a8d]">
            Mostrando {filas.length} de {total}
          </span>
          <button
            type="button"
            disabled={cargando}
            onClick={() => cargarProducciones(pagina + 1, true)}
            className="px-4 py-2 rounded-lg bg-[#1e3a5f] text-white text-sm font-semibold hover:bg-[#12243d] disabled:opacity-50 transition-colors"
          >
            {cargando ? "Cargando…" : "Cargar más"}
          </button>
        </div>
      )}

      {sinResultados && filtros.estado === "pendiente" && !tieneFiltrosExtra(filtros) && (
        <div className="text-center py-12">
          <div className="w-14 h-14 rounded-full bg-[#f3ede1] grid place-items-center mx-auto mb-4">
            <CheckCircle2 className="text-green-700" size={26} />
          </div>
          <h4 className="text-lg font-bold text-[#1e3a5f] mb-1.5">
            No hay producciones pendientes de aval
          </h4>
          <p className="text-sm text-[#6b7a8d] max-w-sm mx-auto">
            Todo lo que los docentes registraron ya está revisado.
            {typeof resumen?.sin_enlace === "number" && resumen.sin_enlace > 0 && (
              <> Quedan {resumen.sin_enlace} producciones sin identificadores con los que verificarlas.</>
            )}
          </p>
          <div className="flex gap-2 justify-center mt-4">
            {typeof resumen?.sin_enlace === "number" && resumen.sin_enlace > 0 && (
              <button
                type="button"
                onClick={() => setFiltros({ estado: "", sin_enlace: true })}
                className="px-4 py-2 rounded-lg bg-[#1e3a5f] text-white text-sm font-semibold hover:bg-[#12243d]"
              >
                Ver las {resumen.sin_enlace} sin enlace
              </button>
            )}
            <button
              type="button"
              onClick={() => setFiltros({ estado: "aprobado" })}
              className="px-4 py-2 rounded-lg bg-white border border-[rgba(30,58,95,0.14)] text-[#6b7a8d] text-sm font-semibold hover:bg-gray-50"
            >
              Ver todas las avaladas
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const Select = ({
  etiqueta,
  valor,
  opciones,
  onChange,
}: {
  etiqueta: string;
  valor: number | "";
  opciones: Catalogo[];
  onChange: (valor: number | "") => void;
}) => (
  <label className="flex items-center gap-2 text-sm">
    <span className="text-[#6b7a8d]">{etiqueta}</span>
    <select
      value={valor}
      onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
      className="border border-[rgba(30,58,95,0.14)] rounded-lg px-2 py-1.5 text-sm text-[#2c3e50] bg-white max-w-[190px] focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30"
    >
      <option value="">Todos</option>
      {opciones.map((o) => (
        <option key={o.id} value={o.id}>
          {o.nombre}
        </option>
      ))}
    </select>
  </label>
);

/** ¿Hay algún filtro activo además del estado? Decide si mostrar «Limpiar filtros». */
const tieneFiltrosExtra = (filtros: FiltrosBandeja): boolean =>
  Boolean(
    filtros.producto || filtros.ambito || filtros.desde || filtros.hasta || filtros.sin_enlace || filtros.q
  );

const iniciales = (nombre: string): string =>
  nombre
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join("");

export default BandejaProducciones;
