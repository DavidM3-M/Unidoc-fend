import { Link } from "react-router-dom";
// Version vectorial y con fondo transparente, la misma que usa `login.tsx`.
import logoUniDoc from "../assets/images/unidoc-logo-azul.svg";

/**
 * Piezas que comparten las dos pantallas de recuperacion de contraseña.
 *
 * Viven aparte porque `restablecerContrasena.tsx` y `restablecerContrasena-2.tsx` son dos tramos
 * del mismo flujo y tienen que verse como uno solo: si la marca o el indicador de pasos se
 * escriben dos veces, se separan en cuanto alguien toque uno de los dos archivos.
 */

/** Encabezado de marca: el mismo logo, tamaño y tipografia que `login.tsx`. */
export const MarcaRecuperacion = ({
  titulo,
  descripcion,
}: {
  titulo: string;
  descripcion: React.ReactNode;
}) => (
  <div className="flex flex-col items-center gap-2">
    {/* Alto fijo y ancho automatico: el logo no es cuadrado. */}
    <img className="h-14 sm:h-16 w-auto" src={logoUniDoc} alt="UniDoc - Docencia Uniautónoma" />
    <h1 className="font-[var(--font-hero)] font-black text-[26px] sm:text-[30px] leading-tight text-center text-[var(--color-navy)] tracking-tight">
      {titulo}
    </h1>
    <p className="text-center text-[var(--color-muted)] text-sm font-medium text-balance">
      {descripcion}
    </p>
  </div>
);

/**
 * Indicador de los dos tramos del flujo.
 *
 * No es decoracion: entre el paso 1 y el 2 hay un correo de por medio, y el segundo se abre desde
 * el buzon —a veces en otro dispositivo— sin nada que explique de donde viene. El indicador dice
 * donde esta el usuario, y en el paso 2 muestra el primero ya cumplido, que es la señal de que el
 * enlace del correo funciono.
 */
export const PasosRecuperacion = ({ activo }: { activo: 1 | 2 }) => {
  const pasos = [
    { numero: 1, etiqueta: "Tu correo" },
    { numero: 2, etiqueta: "Nueva clave" },
  ];

  return (
    <ol className="flex items-center justify-center gap-2" aria-label={`Paso ${activo} de 2`}>
      {pasos.map(({ numero, etiqueta }, indice) => {
        const cumplido = numero < activo;
        const esActivo = numero === activo;

        return (
          <li key={numero} className="flex items-center gap-2">
            {indice > 0 && (
              <span
                aria-hidden="true"
                className={`block h-0.5 w-6 rounded-full ${
                  cumplido || esActivo ? "bg-[var(--color-navy)]" : "bg-[var(--color-beige-alt)]"
                }`}
              />
            )}
            <span className="flex items-center gap-1.5">
              <span
                aria-hidden="true"
                className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                  esActivo
                    ? "bg-[var(--color-navy)] text-white"
                    : "border border-[var(--color-border)] bg-[var(--color-navy-lightest)] text-[var(--color-muted)]"
                }`}
              >
                {cumplido ? "✓" : numero}
              </span>
              <span
                className={`text-[11px] font-semibold ${
                  esActivo ? "text-[var(--color-navy)]" : "text-[var(--color-muted)]"
                }`}
              >
                {etiqueta}
              </span>
            </span>
          </li>
        );
      })}
    </ol>
  );
};

/**
 * Enlace de vuelta al login, identico en los dos pasos.
 *
 * `Link` y no `<a href>`: un ancla normal recarga la aplicacion entera y pierde el estado de
 * React, cuando basta con cambiar de ruta.
 */
export const VolverAlLogin = ({ texto }: { texto: string }) => (
  <p className="text-center text-xs sm:text-sm">
    <Link
      to="/"
      className="font-bold text-[var(--color-navy)] transition-colors hover:text-[var(--color-orange)]"
    >
      {texto}
    </Link>
  </p>
);
