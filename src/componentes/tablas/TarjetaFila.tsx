import { useState } from "react";
import { Row, flexRender } from "@tanstack/react-table";
import { ChevronDown } from "lucide-react";
import { RolMovil, resolverMetaColumna, textoCabecera } from "../../types/tabla";

type Props<TData> = {
  fila: Row<TData>;
};

/**
 * Una fila de la tabla convertida en tarjeta, para anchos por debajo de 640 px.
 *
 * Es la única de las opciones evaluadas que **elimina** el scroll horizontal en vez de suavizarlo.
 * A cambio pierde la comparación entre filas, que en Escalafón y Puntajes es justamente para lo
 * que sirve la tabla: esas pantallas pasan `vistaMovil="tabla"` y conservan la tabla con la acción
 * fija.
 *
 * El reparto se lee de `meta.rolMovil`, pero casi ninguna pantalla lo declara: los valores por
 * defecto de `resolverMetaColumna` colocan la primera columna como título, `estado` y `acciones`
 * abajo, y todo lo demás plegado. Por eso las 25 pantallas funcionan sin editarlas.
 */
function TarjetaFila<TData>({ fila }: Props<TData>) {
  const [abierto, setAbierto] = useState(false);

  const celdas = fila.getVisibleCells();

  // Se agrupa por rol una sola vez en vez de filtrar siete veces sobre el mismo arreglo.
  const porRol = celdas.reduce((acc, celda, indice) => {
    const { rolMovil } = resolverMetaColumna(celda.column, indice);
    (acc[rolMovil] ??= []).push({ celda, indice });
    return acc;
  }, {} as Record<RolMovil, { celda: (typeof celdas)[number]; indice: number }[]>);

  const render = (entrada: { celda: (typeof celdas)[number] }) =>
    flexRender(entrada.celda.column.columnDef.cell, entrada.celda.getContext());

  const detalles = porRol.detalle ?? [];

  return (
    <article className="border border-[rgba(30,58,95,0.09)] rounded-2xl p-3.5 bg-white">
      <div className="flex items-start justify-between gap-2.5">
        <div className="min-w-0 flex-1">
          {porRol.titulo?.map((e) => (
            <div key={e.celda.id} className="text-sm font-semibold text-gray-900 leading-snug">
              {render(e)}
            </div>
          ))}
          {porRol.meta?.map((e) => (
            <div key={e.celda.id} className="text-xs text-[#6b7a8d] mt-0.5">
              {render(e)}
            </div>
          ))}
        </div>

        {porRol.destacado?.map((e) => (
          <div key={e.celda.id} className="shrink-0">
            {render(e)}
          </div>
        ))}
      </div>

      {porRol.chip && porRol.chip.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2.5">
          {porRol.chip.map((e) => (
            <div key={e.celda.id}>{render(e)}</div>
          ))}
        </div>
      )}

      {/* El desplegable solo existe si hay algo plegado: no se ofrece un control vacío. */}
      {detalles.length > 0 && (
        <>
          <button
            type="button"
            onClick={() => setAbierto((v) => !v)}
            aria-expanded={abierto}
            className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 rounded transition-colors"
          >
            <ChevronDown
              size={13}
              className={`transition-transform ${abierto ? "rotate-180" : ""}`}
            />
            {abierto
              ? "Ocultar detalles"
              : `Ver ${detalles.length} ${detalles.length === 1 ? "dato más" : "datos más"}`}
          </button>

          {abierto && (
            <dl className="mt-2.5 pt-2.5 border-t border-dashed border-[rgba(30,58,95,0.14)] grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-xs">
              {detalles.map((e) => {
                const meta = resolverMetaColumna(e.celda.column, e.indice);
                const etiqueta =
                  meta.etiquetaMovil ?? textoCabecera(e.celda.column) ?? e.celda.column.id;

                return (
                  <div key={e.celda.id} className="contents">
                    <dt className="text-[#6b7a8d] whitespace-nowrap">{etiqueta}</dt>
                    <dd className="m-0 text-[#2c3e50] font-medium min-w-0 break-words">
                      {render(e)}
                    </dd>
                  </div>
                );
              })}
            </dl>
          )}
        </>
      )}

      {(porRol.estado || porRol.accion) && (
        <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-[rgba(30,58,95,0.09)]">
          <div className="flex items-center gap-2 min-w-0">
            {porRol.estado?.map((e) => (
              <div key={e.celda.id} className="min-w-0">
                {render(e)}
              </div>
            ))}
          </div>
          {/* La acción queda abajo a la derecha: siempre al alcance del pulgar, nunca a tres
              pantallas de scroll como en la tabla. */}
          <div className="flex items-center gap-2 shrink-0">
            {porRol.accion?.map((e) => (
              <div key={e.celda.id}>{render(e)}</div>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}

export default TarjetaFila;
