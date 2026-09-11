/**
 * La notificación tal como la devuelve `GET /notificaciones`.
 *
 * `titulo`, `tipo` y `enlace` son nulos en las filas anteriores a la campana: durante meses el
 * backend guardó solo `mensaje` porque ninguna pantalla leía este endpoint. La interfaz las trata
 * como genéricas en vez de asumir que siempre vienen.
 */
export type TipoNotificacion =
  | "general"
  | "exito"
  | "rechazo"
  | "plazo"
  | "accion";

export type Notificacion = {
  id: string;
  titulo: string | null;
  mensaje: string | null;
  tipo: TipoNotificacion | null;
  enlace: string | null;
  leida: boolean;
  created_at: string;
};

export type RespuestaNotificaciones = {
  notificaciones: Notificacion[];
  no_leidas: number;
  total: number;
  pagina: number;
  paginas: number;
};
