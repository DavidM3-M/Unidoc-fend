/**
 * Qué rol está mirando el escalafón.
 *
 * Las pantallas de esta carpeta las usan **dos** roles. Apoyo Profesoral las estrenó y el
 * Administrador llegó después con las mismas acciones —periodos, bandeja, ascenso, reversión—
 * más dos que solo tiene él: el ingreso manual y la corrección del historial.
 *
 * Es el mismo acto con las mismas reglas, así que duplicar las pantallas solo garantizaría que
 * las dos copias se separen en la primera corrección que se haga en una sola. En vez de eso,
 * cada montaje pasa su área: de ahí salen los endpoints, las rutas del navegador y lo que se
 * puede hacer. Es el mismo criterio que sigue el backend, donde `routes/admin.php` apunta al
 * controlador de Apoyo Profesoral en lugar de tener una copia.
 *
 * Lo que **no** se comparte es la carpeta de destino de cada rol: Apoyo Profesoral cuelga de
 * `/apoyo-profesoral/escalafon` y el Administrador de `/admin/escalafon`, con su propio layout y
 * su propia barra lateral.
 */
export type AreaEscalafon = {
  /** Prefijo de las rutas del navegador, sin barra final. */
  rutaBase: string;
  endpointDocentes: string;
  endpointHistorial: string;
  endpointPeriodos: string;
  /**
   * Solo el Administrador corrige el expediente: registrar un ingreso manual, editar un tramo y
   * leer la bitácora. Apoyo Profesoral aplica las reglas, no arregla los datos.
   *
   * Esconder los botones no es la barrera —esas rutas no existen bajo `/apoyoProfesoral` y el
   * backend responde 404— pero sí evita ofrecer algo que va a fallar.
   */
  puedeCorregir: boolean;
  /**
   * Si el rol puede abrir el panel de soportes documentales del docente.
   *
   * Va justo al revés que `puedeCorregir`, y no es una omisión: ese panel **no es solo lectura**.
   * Además de listar estudios, idiomas, experiencia y producción, aprueba y rechaza documentos y
   * borra certificados, contra endpoints que exigen `role:Apoyo Profesoral`. Dárselos al
   * Administrador no sería enseñarle el expediente: sería entregarle el trabajo de revisión
   * entero, y con él la trazabilidad de quién avaló qué, que está deliberadamente repartida entre
   * Apoyo Profesoral y el Evaluador de Producción.
   *
   * El Administrador no lo necesita para lo suyo: corrige escalones y fechas, y para eso ya tiene
   * la evaluación del motor —barras, faltantes y semáforo— que sale de esos mismos documentos.
   */
  puedeVerDocumentos: boolean;
};

/**
 * Los endpoints salen del `.env` como el resto del proyecto, pero con un valor por defecto
 * detrás: `.env` está en `.gitignore`, así que quien clone el repo sin las claves nuevas se
 * encontraría con peticiones a `undefined/docentes` en vez de una pantalla que funciona.
 */
const endpoint = (variable: string | undefined, porDefecto: string): string =>
  variable && variable.trim() !== "" ? variable : porDefecto;

export const AREA_APOYO_PROFESORAL: AreaEscalafon = {
  rutaBase: "/apoyo-profesoral/escalafon",
  endpointDocentes: endpoint(
    import.meta.env.VITE_ENDPOINT_AP_ESCALAFON_DOCENTES,
    "/apoyoProfesoral/escalafon/docentes"
  ),
  endpointHistorial: endpoint(
    import.meta.env.VITE_ENDPOINT_AP_ESCALAFON_HISTORIAL,
    "/apoyoProfesoral/escalafon/historial"
  ),
  endpointPeriodos: endpoint(
    import.meta.env.VITE_ENDPOINT_AP_ESCALAFON_PERIODOS,
    "/apoyoProfesoral/escalafon/periodos"
  ),
  puedeCorregir: false,
  puedeVerDocumentos: true,
};

export const AREA_ADMIN: AreaEscalafon = {
  rutaBase: "/admin/escalafon",
  endpointDocentes: endpoint(
    import.meta.env.VITE_ENDPOINT_ADMIN_ESCALAFON_DOCENTES,
    "/admin/escalafon/docentes"
  ),
  endpointHistorial: endpoint(
    import.meta.env.VITE_ENDPOINT_ADMIN_ESCALAFON_HISTORIAL,
    "/admin/escalafon/historial"
  ),
  endpointPeriodos: endpoint(
    import.meta.env.VITE_ENDPOINT_ADMIN_ESCALAFON_PERIODOS,
    "/admin/escalafon/periodos"
  ),
  puedeCorregir: true,
  puedeVerDocumentos: false,
};
