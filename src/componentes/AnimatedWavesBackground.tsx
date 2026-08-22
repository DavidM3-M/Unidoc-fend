import { useEffect, useRef } from "react";

/** Una capa del oleaje. Cada una lleva su propia velocidad para que nunca se repita el patrón. */
type Capa = {
  /** Altura de reposo, como fracción del alto del lienzo. */
  base: number;
  /** Amplitud en píxeles. */
  amplitud: number;
  /** Frecuencia espacial: cuanto menor, más larga es la onda. */
  frecuencia: number;
  /** Velocidad y sentido. Negativa = avanza al revés que las demás. */
  velocidad: number;
  color: string;
};

/** Degradado del fondo: navy claro arriba, profundo abajo. */
const FONDO: Array<[number, string]> = [
  [0, "#2a4a75"],
  [0.5, "#1e3a5f"],
  [1, "#16304f"],
];

/**
 * Cinco capas en vez de tres. Las dos de arriba son claras y las tres de abajo oscuras, así el
 * volumen se lee de arriba a abajo. Los sentidos alternados evitan que el conjunto parezca una
 * sola forma desplazándose.
 */
const CAPAS: Capa[] = [
  { base: 0.42, amplitud: 26, frecuencia: 0.0032, velocidad: 0.30, color: "rgba(255,255,255,0.045)" },
  { base: 0.52, amplitud: 34, frecuencia: 0.0024, velocidad: -0.22, color: "rgba(255,255,255,0.035)" },
  { base: 0.62, amplitud: 30, frecuencia: 0.0040, velocidad: 0.42, color: "rgba(12,26,44,0.22)" },
  { base: 0.74, amplitud: 40, frecuencia: 0.0018, velocidad: -0.16, color: "rgba(9,20,35,0.30)" },
  { base: 0.88, amplitud: 24, frecuencia: 0.0029, velocidad: 0.26, color: "rgba(6,14,26,0.40)" },
];

/** Distancia entre muestras de la onda. Con curvas cuadráticas 10 px basta y sobra. */
const PASO = 10;

/**
 * Fondo animado del inicio de sesión.
 *
 * La versión anterior unía las muestras de la onda con `lineTo`, así que cada cresta era en
 * realidad un polígono y se le notaban las esquinas. Aquí se traza con curvas cuadráticas
 * apoyadas en el punto medio de cada par, que es la forma estándar de suavizar una polilínea.
 *
 * Además corrige cuatro cosas que no se veían pero costaban:
 *
 * 1. El bucle no se cancelaba al desmontar. El `return` del efecto solo quitaba el listener de
 *    `resize`, de modo que cada inicio de sesión dejaba un `requestAnimationFrame` dibujando
 *    para siempre sobre un lienzo que ya no estaba en pantalla.
 * 2. No se respetaba `prefers-reduced-motion`. Ahora quien tenga esa preferencia recibe un
 *    fotograma fijo, y el cambio de preferencia se atiende en caliente.
 * 3. El lienzo se dimensionaba en píxeles CSS, así que en pantallas de alta densidad se dibujaba
 *    al doble de tamaño y se veía blando.
 * 4. El degradado del fondo se recreaba en cada fotograma siendo siempre el mismo. Ahora se pinta
 *    una vez en un lienzo aparte y se copia.
 *
 * Y se detiene mientras la pestaña está en segundo plano, que es donde un fondo animado gasta
 * batería sin que nadie lo mire.
 */
const AnimatedWavesBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // El degradado vive en su propio lienzo: se pinta al medir y luego solo se copia.
    const fondo = document.createElement("canvas");
    const fctx = fondo.getContext("2d");
    if (!fctx) return;

    const menosMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)");

    let ancho = 0;
    let alto = 0;
    let tiempo = 0;
    let animacion = 0;
    let reMedir: number | undefined;

    const densidad = Math.min(window.devicePixelRatio || 1, 2);

    const medir = () => {
      ancho = window.innerWidth;
      alto = window.innerHeight;

      canvas.width = Math.round(ancho * densidad);
      canvas.height = Math.round(alto * densidad);
      ctx.setTransform(densidad, 0, 0, densidad, 0, 0);

      fondo.width = canvas.width;
      fondo.height = canvas.height;
      fctx.setTransform(densidad, 0, 0, densidad, 0, 0);

      const degradado = fctx.createLinearGradient(0, 0, 0, alto);
      FONDO.forEach(([posicion, color]) => degradado.addColorStop(posicion, color));
      fctx.fillStyle = degradado;
      fctx.fillRect(0, 0, ancho, alto);
    };

    /**
     * Traza una capa cerrada contra el borde inferior.
     *
     * El punto de control de cada curva es la muestra anterior y el destino es el punto medio
     * hacia la siguiente: así la curva pasa suave por todas sin quiebres.
     */
    const trazarCapa = (capa: Capa, fase: number) => {
      const reposo = alto * capa.base;
      let px = 0;
      let py = reposo + capa.amplitud * Math.sin(fase);

      ctx.beginPath();
      ctx.moveTo(0, alto);
      ctx.lineTo(0, py);

      for (let x = PASO; x <= ancho + PASO; x += PASO) {
        const y = reposo + capa.amplitud * Math.sin(x * capa.frecuencia + fase);
        ctx.quadraticCurveTo(px, py, (px + x) / 2, (py + y) / 2);
        px = x;
        py = y;
      }

      ctx.lineTo(ancho, py);
      ctx.lineTo(ancho, alto);
      ctx.closePath();
      ctx.fillStyle = capa.color;
      ctx.fill();
    };

    const pintar = () => {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.drawImage(fondo, 0, 0);
      ctx.setTransform(densidad, 0, 0, densidad, 0, 0);

      CAPAS.forEach((capa) => trazarCapa(capa, tiempo * capa.velocidad * 0.02));
    };

    const bucle = () => {
      tiempo += 1;
      pintar();
      animacion = requestAnimationFrame(bucle);
    };

    const parar = () => {
      if (animacion) {
        cancelAnimationFrame(animacion);
        animacion = 0;
      }
    };

    const arrancar = () => {
      if (animacion || menosMovimiento.matches || document.hidden) return;
      animacion = requestAnimationFrame(bucle);
    };

    const alRedimensionar = () => {
      window.clearTimeout(reMedir);
      reMedir = window.setTimeout(() => {
        medir();
        pintar();
      }, 120);
    };

    // Con la pestaña oculta no hay nada que mirar: se detiene y se retoma al volver.
    const alCambiarVisibilidad = () => (document.hidden ? parar() : arrancar());

    // Si el usuario cambia la preferencia sin recargar, se atiende al momento.
    const alCambiarPreferencia = () => {
      if (menosMovimiento.matches) {
        parar();
        pintar();
      } else {
        arrancar();
      }
    };

    medir();
    pintar();
    arrancar();

    window.addEventListener("resize", alRedimensionar);
    document.addEventListener("visibilitychange", alCambiarVisibilidad);
    menosMovimiento.addEventListener("change", alCambiarPreferencia);

    return () => {
      parar();
      window.clearTimeout(reMedir);
      window.removeEventListener("resize", alRedimensionar);
      document.removeEventListener("visibilitychange", alCambiarVisibilidad);
      menosMovimiento.removeEventListener("change", alCambiarPreferencia);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed top-0 left-0 w-full h-full -z-50"
    />
  );
};

export default AnimatedWavesBackground;
