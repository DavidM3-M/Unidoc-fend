import { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosConfig";
import type { EscalonDocente } from "../types/catalogos";

const ENDPOINT =
  import.meta.env.VITE_ENDPOINT_ADMIN_ESCALONES_DOCENTE || "/admin/escalones-docente";

/**
 * Catálogo completo de escalones, **incluidos los inactivos**.
 *
 * Deliberadamente no reutiliza `/constantes/escalones-docente`, que filtra por `activo`: el
 * Administrador necesita ver también los retirados, porque un escalón inactivo sigue siendo un
 * destino legítimo para un tramo **histórico** —por eso la llave foránea del historial es
 * `restrictOnDelete` en vez de borrar en cascada—. Lo que el backend no acepta es asignarlo al
 * tramo vigente, y eso lo responde con un 409.
 *
 * Solo lo usan las pantallas del Administrador: el endpoint exige `role:Administrador` y a
 * cualquier otro rol le respondería 403.
 */
export const useEscalonesAdmin = (activo = true) => {
  const [escalones, setEscalones] = useState<EscalonDocente[]>([]);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (!activo) return;

    // La petición puede resolverse después de que el modal se cierre; sin la bandera, React
    // avisaría de un `setState` sobre un componente desmontado.
    let vigente = true;
    setCargando(true);

    axiosInstance
      .get(ENDPOINT)
      .then((respuesta) => {
        if (vigente) setEscalones(respuesta.data?.data ?? []);
      })
      .catch((error) => {
        console.error("Error al obtener el catálogo de escalones:", error);
      })
      .finally(() => {
        if (vigente) setCargando(false);
      });

    return () => {
      vigente = false;
    };
  }, [activo]);

  return { escalones, cargando };
};
