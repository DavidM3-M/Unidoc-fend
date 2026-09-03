import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ColumnDef } from "@tanstack/react-table";
import {
  ArrowUpRight,
  CalendarDays,
  CreditCard,
  Eye,
  Info,
  TrendingUp,
  User,
} from "lucide-react";
import axiosInstance from "../../utils/axiosConfig";
import { mensajeDeErrorApi } from "../../utils/erroresApi";
import { fechaLarga } from "../../utils/fechas";
import { DataTable2 } from "../../componentes/tablas/DataTable2";
import { EscalonPill, SemaforoAntiguedad, TextoAntiguedad, Tile, ViaPill } from "./piezas";
import {
  ESTADOS_ANTIGUEDAD,
  type DocenteEscalafonFila,
  type EstadoAntiguedad,
  type PeriodoAscenso,
} from "../../types/escalafon";
import type { AreaEscalafon } from "./area";

/** Orden de trabajo, no orden alfabético: arriba lo que ya se puede ejecutar. */
const ORDEN_ESTADOS: EstadoAntiguedad[] = [
  "elegible",
  "antiguedad_cumplida",
  "por_verificar_experiencia",
  "sin_experiencia_suficiente",
];

const COLOR_TILE: Record<EstadoAntiguedad, "verde" | "azul" | "ambar" | "gris"> = {
  elegible: "verde",
  antiguedad_cumplida: "azul",
  por_verificar_experiencia: "ambar",
  sin_experiencia_suficiente: "gris",
};

/**
 * Bandeja de ascensos.
 *
 * Abre en `elegible` porque es el trabajo que se puede ejecutar hoy, pero los demás estados están
 * al lado: el semáforo **prioriza, no bloquea** — cualquier documento se sigue pudiendo revisar
 * en cualquier momento.
 *
 * El filtro por estado se aplica en el cliente a propósito: así los contadores de arriba siguen
 * diciendo la verdad sobre el total mientras se navega entre estados. Lo que sí va al servidor es
 * el periodo, porque cambia el corte con el que se evalúa cada expediente.
 *
 * La comparten Apoyo Profesoral y el Administrador: es la misma bandeja con las mismas reglas y
 * cada uno la monta con su área (ver `area.ts`). Para el Administrador es además la única forma
 * de llegar al expediente donde se corrige el historial.
 */
const BandejaAscensos = ({ area }: { area: AreaEscalafon }) => {
  const navigate = useNavigate();

  const [filas, setFilas] = useState<DocenteEscalafonFila[]>([]);
  const [cargando, setCargando] = useState(true);
  const [periodos, setPeriodos] = useState<PeriodoAscenso[]>([]);
  const [periodoId, setPeriodoId] = useState<string>("");
  const [estado, setEstado] = useState<EstadoAntiguedad | "">("elegible");
  /** Aparte del semáforo: cruza con cualquier estado, porque la excepción salta la antigüedad. */
  const [soloExcepcion, setSoloExcepcion] = useState(false);

  const cargarDocentes = useCallback(async () => {
    try {
      setCargando(true);

      const params: Record<string, string> = {};
      if (periodoId) params.periodo_ascenso_id = periodoId;

      const respuesta = await axiosInstance.get(area.endpointDocentes, { params });
      setFilas(respuesta.data?.data ?? []);
    } catch (error) {
      console.error("Error al cargar la bandeja de ascensos:", error);
      toast.error(mensajeDeErrorApi(error, "No se pudo cargar la bandeja de ascensos"));
    } finally {
      setCargando(false);
    }
  }, [periodoId, area.endpointDocentes]);

  useEffect(() => {
    cargarDocentes();
  }, [cargarDocentes]);

  useEffect(() => {
    axiosInstance
      .get(area.endpointPeriodos)
      .then((respuesta) => setPeriodos(respuesta.data?.data ?? []))
      .catch((error) => console.error("Error al obtener los periodos de ascenso:", error));
  }, [area.endpointPeriodos]);

  const conteos = useMemo(() => {
    const acumulado = {
      elegible: 0,
      antiguedad_cumplida: 0,
      por_verificar_experiencia: 0,
      sin_experiencia_suficiente: 0,
    } as Record<EstadoAntiguedad, number>;

    filas.forEach((fila) => {
      if (fila.estado_antiguedad in acumulado) acumulado[fila.estado_antiguedad] += 1;
    });

    return acumulado;
  }, [filas]);

  /** Docentes que entran saltándose requisitos y antigüedad (hoy, por Doctorado aprobado). */
  const totalExcepcion = useMemo(
    () => filas.filter((fila) => fila.via === "excepcion").length,
    [filas]
  );

  // `estado` y `soloExcepcion` son mutuamente excluyentes (ver los onClick de los tiles):
  // nunca hay que combinarlos.
  const visibles = useMemo(() => {
    if (soloExcepcion) return filas.filter((fila) => fila.via === "excepcion");
    return estado ? filas.filter((fila) => fila.estado_antiguedad === estado) : filas;
  }, [filas, estado, soloExcepcion]);

  /** El periodo con el que se está mirando la bandeja: el elegido, o el que traen las filas. */
  const periodoEnUso = useMemo(() => {
    if (periodoId) {
      return periodos.find((p) => String(p.id_periodo_ascenso) === periodoId) ?? null;
    }

    const delBackend = filas.find((fila) => fila.periodo_ascenso)?.periodo_ascenso;
    return delBackend
      ? periodos.find((p) => p.id_periodo_ascenso === delBackend.id_periodo_ascenso) ?? null
      : null;
  }, [periodoId, periodos, filas]);

  const fechaCorte = filas.find((fila) => fila.fecha_corte)?.fecha_corte ?? null;

  const columnas = useMemo<ColumnDef<DocenteEscalafonFila>[]>(
    () => [
      {
        accessorKey: "nombre_completo",
        header: () => (
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>Docente</span>
          </div>
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-2.5">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-blue-100 text-[10.5px] font-bold text-blue-700">
              {row.original.nombre_completo
                .split(/\s+/)
                .slice(0, 2)
                .map((parte) => parte.charAt(0).toUpperCase())
                .join("")}
            </span>
            <span>
              <span className="block text-sm font-medium leading-tight text-gray-900">
                {row.original.nombre_completo}
              </span>
              <span className="block text-xs text-[#6b7a8d]">
                {row.original.email ?? "Sin correo"}
              </span>
            </span>
          </div>
        ),
      },
      {
        accessorKey: "numero_identificacion",
        header: () => (
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            <span>Identificación</span>
          </div>
        ),
        meta: { nowrap: true },
        cell: ({ row }) => (
          <span className="tabular-nums">{row.original.numero_identificacion ?? "—"}</span>
        ),
      },
      {
        id: "escalon",
        accessorFn: (fila) => fila.escalon_vigente ?? "",
        header: "Escalón",
        cell: ({ row }) => (
          <div className="flex flex-wrap items-center gap-1.5">
            <EscalonPill escalon={row.original.escalon_vigente} />
            {row.original.escalon_objetivo ? (
              <>
                <ArrowUpRight className="h-3.5 w-3.5 text-[#6b7a8d]" />
                <span className="text-xs font-semibold text-[#1e3a5f]">
                  {row.original.escalon_objetivo}
                </span>
              </>
            ) : (
              row.original.escalon_vigente && (
                <span className="text-xs text-[#9aa7b5]">categoría más alta</span>
              )
            )}
          </div>
        ),
      },
      {
        id: "antiguedad",
        accessorFn: (fila) => fila.meses_en_escalon,
        header: "Antigüedad",
        meta: { nowrap: true },
        cell: ({ row }) => (
          <TextoAntiguedad
            meses={row.original.meses_en_escalon}
            declarados={row.original.meses_en_escalon_declarados}
            requeridos={row.original.meses_requeridos}
          />
        ),
      },
      {
        accessorKey: "puntaje_total",
        header: () => (
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span>Puntaje</span>
          </div>
        ),
        meta: { nowrap: true },
        cell: ({ row }) => {
          // Puntos sin documento aprobado. Se dicen aparte del total, igual que los meses sin
          // certificar de la columna de al lado: son trabajo de este rol, no un dato del docente.
          const sinAprobar = Math.max(
            0,
            (row.original.puntaje_declarado ?? 0) - (row.original.puntaje_total ?? 0)
          );

          return (
            <div className="flex flex-col items-start gap-0.5">
              <span
                className="inline-flex min-w-[2.5rem] items-center justify-center rounded-full bg-[#1e3a5f]/10 px-2.5 py-1 text-xs font-bold text-[#1e3a5f] tabular-nums"
                title="Solo la producción divulgada y subida dentro de la categoría actual"
              >
                {row.original.puntaje_total}
              </span>
              {sinAprobar > 0 && (
                <span className="text-xs text-amber-700">+{sinAprobar} sin aprobar</span>
              )}
            </div>
          );
        },
      },
      {
        id: "estado",
        accessorFn: (fila) => ESTADOS_ANTIGUEDAD[fila.estado_antiguedad]?.etiqueta ?? "",
        header: "Estado",
        cell: ({ row }) => (
          <div className="flex flex-col items-start gap-1">
            <SemaforoAntiguedad estado={row.original.estado_antiguedad} />
            {row.original.elegible && <ViaPill via={row.original.via} />}
          </div>
        ),
      },
      {
        id: "acciones",
        header: "Acción",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`${area.rutaBase}/docentes/${row.original.id}`);
              }}
              className="inline-flex items-center gap-2 rounded-lg border border-[rgba(30,58,95,0.14)] bg-white px-3 py-2 text-sm font-medium text-[#6b7a8d] transition-colors hover:bg-gray-50"
            >
              <Eye className="h-4 w-4" /> Ver expediente
            </button>
          </div>
        ),
      },
    ],
    [navigate, area.rutaBase]
  );

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-5">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-[#1e3a5f]">
            <ArrowUpRight className="h-6 w-6 text-[#e8740e]" />
            Bandeja de ascensos
          </h1>
          <p className="text-sm text-[#6b7a8d]">
            El sistema dice quién es elegible; el ascenso lo ejecutas tú.
          </p>
        </div>

        <Link
          to={`${area.rutaBase}/periodos`}
          className="inline-flex items-center gap-2 self-start rounded-lg border border-[rgba(30,58,95,0.14)] bg-white px-4 py-2 text-sm font-semibold text-[#1e3a5f] transition-colors hover:bg-[rgba(30,58,95,0.05)]"
        >
          <CalendarDays className="h-4 w-4" /> Periodos de ascenso
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {ORDEN_ESTADOS.map((clave) => (
          <Tile
            key={clave}
            etiqueta={ESTADOS_ANTIGUEDAD[clave].etiqueta}
            valor={conteos[clave]}
            detalle={ESTADOS_ANTIGUEDAD[clave].accion}
            color={COLOR_TILE[clave]}
            activo={estado === clave}
            onClick={() => {
              setEstado(estado === clave ? "" : clave);
              setSoloExcepcion(false);
            }}
          />
        ))}

        {/* Un docente por excepción ya cae en "elegible" (salta hasta la antigüedad), así que
            este tile es otra forma de mirar el mismo semáforo, no una quinta franja: se muestra
            como selección única igual que las demás, en vez de poder quedar marcado junto a otra. */}
        <Tile
          etiqueta="Por excepción"
          valor={totalExcepcion}
          detalle="Entran saltándose requisitos y antigüedad"
          color="dorado"
          activo={soloExcepcion}
          onClick={() => {
            setSoloExcepcion((valor) => !valor);
            setEstado("");
          }}
        />
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-[rgba(30,58,95,0.09)] bg-white p-4 sm:p-6">
        <div className="flex flex-wrap items-center gap-3">
          <span className="w-16 shrink-0 text-[10.5px] font-semibold uppercase tracking-wider text-[#6b7a8d]">
            Filtros
          </span>

          <label className="flex items-center gap-2 text-sm text-[#2c3e50]">
            <span className="text-[#6b7a8d]">Estado</span>
            <select
              value={estado}
              onChange={(e) => {
                setEstado(e.target.value as EstadoAntiguedad | "");
                setSoloExcepcion(false);
              }}
              className="rounded-lg border border-[rgba(30,58,95,0.14)] px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30"
            >
              <option value="">Todos</option>
              {ORDEN_ESTADOS.map((clave) => (
                <option key={clave} value={clave}>
                  {ESTADOS_ANTIGUEDAD[clave].etiqueta}
                </option>
              ))}
            </select>
          </label>

          <label className="flex items-center gap-2 text-sm text-[#2c3e50]">
            <span className="text-[#6b7a8d]">Periodo</span>
            <select
              value={periodoId}
              onChange={(e) => setPeriodoId(e.target.value)}
              className="rounded-lg border border-[rgba(30,58,95,0.14)] px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30"
            >
              <option value="">Periodo vigente</option>
              {periodos.map((periodo) => (
                <option key={periodo.id_periodo_ascenso} value={periodo.id_periodo_ascenso}>
                  {periodo.nombre}
                  {periodo.cerrado ? " (cerrado)" : ""}
                </option>
              ))}
            </select>
          </label>

          {(estado !== "" || periodoId !== "" || soloExcepcion) && (
            <button
              type="button"
              onClick={() => {
                setEstado("");
                setPeriodoId("");
                setSoloExcepcion(false);
              }}
              className="text-sm text-[#6b7a8d] underline hover:text-[#1e3a5f]"
            >
              Limpiar filtros
            </button>
          )}
        </div>

        {/* Contra un periodo abierto esto es una proyección: sirve para mirar, no para ejecutar. */}
        <div className="flex items-start gap-2 rounded-lg bg-[rgba(30,58,95,0.04)] p-3 text-xs leading-relaxed text-[#2c3e50]">
          <Info className="h-4 w-4 flex-shrink-0 text-[#1e3a5f]" />
          <p>
            {periodoEnUso?.cerrado ? (
              <>
                <b>{periodoEnUso.nombre}</b> está cerrado: los expedientes se evaluaron con lo que
                había al {fechaLarga(periodoEnUso.fecha_cierre)} y los ascensos ya se pueden
                ejecutar.
              </>
            ) : periodoEnUso ? (
              <>
                <b>{periodoEnUso.nombre}</b> sigue abierto. Esto es una proyección de cómo quedaría
                el expediente al cierre ({fechaLarga(periodoEnUso.fecha_cierre)}); los ascensos se
                ejecutan después de cerrarlo.
              </>
            ) : fechaCorte ? (
              <>Expedientes evaluados al {fechaLarga(fechaCorte)}.</>
            ) : (
              <>
                No hay un periodo de ascenso anunciado. Puedes seguir revisando documentos; para
                ejecutar ascensos hace falta un periodo cerrado.
              </>
            )}
          </p>
        </div>

        <div className="overflow-x-auto">
          <DataTable2
            data={visibles}
            columns={columnas}
            loading={cargando}
            searchPlaceholder="Buscar docente por nombre, identificación o correo…"
          />
        </div>

        {!cargando && visibles.length === 0 && filas.length > 0 && (
          <p className="py-6 text-center text-sm text-[#6b7a8d]">
            {soloExcepcion
              ? "Ningún docente entra por excepción"
              : `Ningún docente está en «${estado ? ESTADOS_ANTIGUEDAD[estado].etiqueta : "este estado"}»`}{" "}
            ahora mismo.{" "}
            <button
              type="button"
              onClick={() => {
                setEstado("");
                setSoloExcepcion(false);
              }}
              className="underline hover:text-[#1e3a5f]"
            >
              Ver todos
            </button>
          </p>
        )}
      </div>
    </div>
  );
};

export default BandejaAscensos;
