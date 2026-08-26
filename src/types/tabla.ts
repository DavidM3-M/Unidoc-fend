import type { Column, RowData } from "@tanstack/react-table";

/**
 * Cómo se comporta cada columna cuando la tabla no cabe.
 *
 * El problema que resuelve: `DataTable2` lo usan 25 pantallas con 7 a 9 columnas cada una. Todas
 * ponían `whitespace-nowrap` en cada celda y 48 px de padding, así que una tabla de 9 columnas
 * medía ~1400 px de ancho mínimo y en un teléfono de 412 px había que arrastrarla tres pantallas
 * para llegar al botón de la acción, que además siempre es la última columna.
 *
 * La pieza importante del diseño está en `resolverMetaColumna`: los valores por defecto se deducen
 * de la posición y del id de la columna, así que **las 25 pantallas mejoran sin tocarlas**. Declarar
 * `meta` es un refinamiento posterior, no un requisito.
 */

/** 1 = siempre visible · 2 = se oculta en móvil · 3 = solo escritorio. */
export type PrioridadColumna = 1 | 2 | 3;

/**
 * Dónde cae la columna dentro de la tarjeta de móvil.
 *
 * - `titulo`     lo que identifica la fila; va arriba y grande.
 * - `meta`       línea gris bajo el título (fecha, dependencia).
 * - `destacado`  a la derecha del título: un puntaje, un total.
 * - `chip`       etiqueta corta en la fila de chips.
 * - `estado`     píldora de estado, abajo a la izquierda.
 * - `accion`     el botón, abajo a la derecha.
 * - `detalle`    se pliega tras «Ver N datos más».
 * - `oculto`     no aparece en la tarjeta.
 */
export type RolMovil =
  | "titulo"
  | "meta"
  | "destacado"
  | "chip"
  | "estado"
  | "accion"
  | "detalle"
  | "oculto";

export type MetaColumna = {
  prioridad?: PrioridadColumna;
  rolMovil?: RolMovil;
  /** Nombre del dato dentro de la tarjeta. Por defecto se usa el `header` si es texto. */
  etiquetaMovil?: string;
  /** `true` en fechas, cédulas y puntajes: partirlos en dos líneas sería un error de lectura. */
  nowrap?: boolean;
  /** Tope de ancho para columnas de texto largo, ej. `"280px"`. */
  anchoMax?: string;
};

// Aumenta el tipo de TanStack para que `meta` deje de ser `unknown` en las 25 pantallas.
declare module "@tanstack/react-table" {
  // Los parámetros los exige la firma original de la interfaz aunque acá no se usen.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> extends MetaColumna {}
}

/** Las tres formas que puede tomar la tabla según el ancho de su contenedor. */
export type Franja = "movil" | "tablet" | "escritorio";

/**
 * Cortes en píxeles.
 *
 * Se comparan contra el ancho del **contenedor**, no el de la ventana: varias de estas tablas
 * viven dentro de `CustomDialog` con `width="1500px"` y otras a media pantalla. Ver
 * `useAnchoContenedor`.
 */
export const CORTE_TABLET = 640;
export const CORTE_ESCRITORIO = 1024;

export const franjaPara = (ancho: number): Franja => {
  if (ancho >= CORTE_ESCRITORIO) return "escritorio";
  if (ancho >= CORTE_TABLET) return "tablet";
  return "movil";
};

/** Hasta qué prioridad se muestra en cada franja. */
export const prioridadMaximaVisible = (franja: Franja): PrioridadColumna =>
  franja === "escritorio" ? 3 : franja === "tablet" ? 2 : 1;

/**
 * Deduce `prioridad` y `rolMovil` cuando la columna no los declara.
 *
 * Se apoya en dos convenciones que ya cumplen las 25 pantallas sin haberlo acordado: la primera
 * columna siempre dice quién o qué es la fila, y la de acciones siempre lleva `id: "acciones"`.
 * Por eso el arreglo funciona sin editarlas.
 */
export const resolverMetaColumna = <TData,>(
  columna: Column<TData, unknown>,
  indice: number
): Required<Pick<MetaColumna, "prioridad" | "rolMovil">> & MetaColumna => {
  const declarada: MetaColumna = columna.columnDef.meta ?? {};
  const id = columna.id.toLowerCase();

  const esAccion = /accion/.test(id);
  const esEstado = id === "estado" || /^estado_/.test(id);
  const esPrimera = indice === 0;

  const prioridadPorDefecto: PrioridadColumna =
    esPrimera || esAccion || esEstado ? 1 : 2;

  const rolPorDefecto: RolMovil = esAccion
    ? "accion"
    : esEstado
    ? "estado"
    : esPrimera
    ? "titulo"
    : "detalle";

  return {
    ...declarada,
    prioridad: declarada.prioridad ?? prioridadPorDefecto,
    rolMovil: declarada.rolMovil ?? rolPorDefecto,
  };
};

/**
 * Texto de la cabecera, cuando se puede sacar.
 *
 * Muchas columnas definen `header` como un componente con icono, y de esos no se puede extraer
 * texto sin renderizarlos. En ese caso el llamador cae a `etiquetaMovil` o al id.
 */
export const textoCabecera = <TData,>(columna: Column<TData, unknown>): string | null => {
  const header = columna.columnDef.header;
  return typeof header === "string" ? header : null;
};
