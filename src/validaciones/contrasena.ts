import { z } from "zod";

/**
 * La única definición de qué es una contraseña válida en UniDoc.
 *
 * Existe porque las tres pantallas que piden una contraseña —registro, recuperación y cambio desde
 * configuración— llegaron a tener tres reglas distintas, y solo la de registro coincidía con el
 * servidor. Las otras dos prohibían los símbolos y no exigían mayúscula ni número, así que
 * `Clave!2024` se rechazaba en pantalla aunque el backend la aceptara, y `contrasena` pasaba la
 * validación local para que el servidor la devolviera con un 422 sin explicación.
 *
 * El backend aplica en registro y en recuperación exactamente la misma regla:
 *
 *     Password::min(8)->mixedCase()->numbers()
 *
 * Es decir: ocho caracteres, una minúscula, una mayúscula y un número. **Los símbolos están
 * permitidos** —hacen falta para cualquier contraseña generada por un gestor— y por eso aquí no
 * aparece `regexSinEmojis`, que sigue siendo correcto para nombres y textos libres pero nunca
 * debió aplicarse a una contraseña.
 *
 * Si el backend cambia su política, este archivo es el único sitio que hay que tocar.
 */

/** Cada requisito sabe comprobarse a sí mismo, para que la pantalla no reimplemente la regla. */
export const REQUISITOS_CONTRASENA = [
  { texto: "Al menos 8 caracteres", cumple: (v: string) => v.length >= 8 },
  { texto: "Una letra minúscula", cumple: (v: string) => /[a-z]/.test(v) },
  { texto: "Una letra mayúscula", cumple: (v: string) => /[A-Z]/.test(v) },
  { texto: "Un número", cumple: (v: string) => /[0-9]/.test(v) },
] as const;

export const contrasenaSchema = z
  .string()
  .min(8, { message: "La contraseña debe tener al menos 8 caracteres" })
  .regex(/[a-z]/, { message: "La contraseña debe contener al menos una minúscula" })
  .regex(/[A-Z]/, { message: "La contraseña debe contener al menos una mayúscula" })
  .regex(/[0-9]/, { message: "La contraseña debe contener al menos un número" });

/**
 * La confirmación solo tiene que estar presente.
 *
 * Repetir aquí las reglas de arriba haría que un error de tecleo en la confirmación se reportara
 * como «falta una mayúscula» en vez de «no coinciden», que es lo que de verdad pasó. La comparación
 * entre ambas la hace el `refine` de cada formulario.
 */
export const confirmacionContrasenaSchema = z
  .string()
  .min(1, { message: "La confirmación de contraseña es requerida" });
