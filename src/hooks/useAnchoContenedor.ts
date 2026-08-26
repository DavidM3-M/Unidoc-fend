import { useCallback, useEffect, useRef, useState } from "react";
import { Franja, franjaPara } from "../types/tabla";

/**
 * Mide el ancho real del contenedor y devuelve la franja que le corresponde.
 *
 * Deliberadamente **no** usa `window.innerWidth`. Varias tablas de UniDoc viven dentro de
 * `CustomDialog` con `width="1500px"`, otras dentro de una ficha a media pantalla y otras en una
 * columna de un grid. Midiendo la ventana, una tabla angosta dentro de un escritorio ancho
 * seguiría desbordándose exactamente igual que antes del arreglo, que es el error clásico de este
 * tipo de cambios.
 *
 * Se devuelve un callback ref en vez de un objeto ref para que la medición arranque en cuanto el
 * nodo se monta: con un `useRef` normal, un contenedor que aparece después (dentro de un modal que
 * se abre) no dispara ningún efecto y la tabla se queda con el ancho inicial de 0.
 */
export const useAnchoContenedor = () => {
  const [ancho, setAncho] = useState(0);
  const observador = useRef<ResizeObserver | null>(null);

  const ref = useCallback((nodo: HTMLElement | null) => {
    observador.current?.disconnect();

    if (!nodo) return;

    // El entorno de pruebas y algunos navegadores muy viejos no traen ResizeObserver. Sin él se
    // cae a una medición única, que es peor que reaccionar al resize pero mejor que romper.
    if (typeof ResizeObserver === "undefined") {
      setAncho(nodo.getBoundingClientRect().width);
      return;
    }

    observador.current = new ResizeObserver((entradas) => {
      const entrada = entradas[0];
      if (!entrada) return;

      // `borderBoxSize` no está en todos los navegadores; `contentRect` sí.
      setAncho(entrada.contentRect.width);
    });

    observador.current.observe(nodo);
    setAncho(nodo.getBoundingClientRect().width);
  }, []);

  useEffect(() => () => observador.current?.disconnect(), []);

  // Antes de la primera medición el ancho es 0. Se asume escritorio a propósito: es la vista
  // completa, así que un parpadeo va de más información a menos, y no al revés.
  const franja: Franja = ancho === 0 ? "escritorio" : franjaPara(ancho);

  return { ref, ancho, franja };
};
