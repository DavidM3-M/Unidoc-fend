/**
 * Resuelve rutas de archivos devueltas por Laravel en los dos modos soportados:
 * - Docker/producción: /api y /storage pasan por el mismo Nginx.
 * - Vite local: la API y sus archivos viven en el host absoluto de VITE_API_URL.
 */
export const resolverArchivoUrl = (url?: string | null): string | null => {
  if (!url) return null;

  let ruta = url;
  try {
    ruta = new URL(url, window.location.origin).pathname;
  } catch {
    // Si no es una URL absoluta válida, se trata como una ruta del servidor.
  }

  ruta = ruta.replace(/^\/api\/storage\//, "/storage/");
  const posicionStorage = ruta.indexOf("/storage/");
  if (posicionStorage >= 0) ruta = ruta.slice(posicionStorage);

  const apiUrl = import.meta.env.VITE_API_URL || "/api";
  if (/^https?:\/\//i.test(apiUrl)) {
    return `${new URL(apiUrl).origin}${ruta.startsWith("/") ? ruta : `/${ruta}`}`;
  }

  return ruta.startsWith("/") ? ruta : `/${ruta}`;
};
