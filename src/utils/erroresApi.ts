import axios from "axios";

/**
 * Traduce un error de axios al mensaje que se le muestra al usuario.
 *
 * Cubre las tres formas en que responde la API:
 * - 422 de los FormRequest, que traen `errors` con un arreglo de mensajes por campo.
 * - 409 y demás errores de negocio, que explican el motivo en `message` (por ejemplo, que un
 *   catálogo no se puede borrar porque hay registros que lo usan).
 * - Fallos de red o timeout, donde no hay respuesta que leer.
 *
 * @param error Error capturado, normalmente de axios.
 * @param fallback Mensaje a usar cuando el servidor no dice nada aprovechable.
 */
export const mensajeDeErrorApi = (
  error: unknown,
  fallback = "Ocurrió un error inesperado."
): string => {
  if (axios.isAxiosError(error)) {
    if (error.code === "ECONNABORTED") {
      return "Tiempo de espera agotado. Intenta de nuevo.";
    }

    if (error.response) {
      const errores = error.response.data?.errors;
      if (errores && typeof errores === "object") {
        return `Errores: ${Object.values(errores).flat().join(", ")}`;
      }
      return error.response.data?.message || fallback;
    }

    if (error.request) {
      return "No se recibió respuesta del servidor.";
    }
  }

  return fallback;
};
