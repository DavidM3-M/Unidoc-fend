/**
 * Patrón para los campos de texto libre que guardan nombres propios: instituciones, cargos,
 * títulos de publicaciones, medios de divulgación, aptitudes.
 *
 * Bloquea lo que no queremos —emojis y caracteres de control— en vez de listar lo permitido.
 * Antes cada esquema definía su propia constante llamada `regexSinEmojis` que en realidad era
 * una lista blanca de letras, números, espacios y guiones, y con eso rechazaba datos reales:
 * "Análisis de datos: un enfoque práctico (2024)", "Revista Ing. y Ciencia" o "I.E. Normal
 * Superior" no pasaban, y el mensaje de error hablaba de emojis que no existían.
 *
 * Es el espejo exacto de `App\Constants\TextoLibre::SIN_EMOJIS` en el backend. Si cambia uno,
 * tiene que cambiar el otro.
 *
 * Categorías bloqueadas: `Cc` control, `Cf` formato (ZWJ y similares), `Co` uso privado,
 * `Cs` sustitutos, `So` símbolos varios — que es donde viven los emojis.
 */
export const TEXTO_LIBRE = /^[^\p{Cc}\p{Cf}\p{Co}\p{Cs}\p{So}]+$/u;

/** Mensaje único, para que los cinco formularios digan lo mismo. */
export const MENSAJE_TEXTO_LIBRE = "No se permiten emojis ni caracteres de control";
