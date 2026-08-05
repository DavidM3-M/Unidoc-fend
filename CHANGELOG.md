# Changelog

Todos los cambios relevantes del proyecto UniDoc frontend están documentados en este archivo.

El formato se basa en [Keep a Changelog](https://keepachangelog.com/es/1.1.0/).

---

## [Sin liberar] - 2026-03-08

### Añadido

- **i18n – Mensajes de operación por entidad** (`src/context/LanguageContext.tsx`):
  Nuevas claves de traducción (ES/EN) con retroalimentación específica para cada entidad:
  - Aptitudes: `messages.aptitude.adding / added / addError / updating / updated / updateError`
  - Estudios: `messages.study.*`
  - Experiencias: `messages.experience.*`
  - Idiomas: `messages.language.*`
  - Producción académica: `messages.production.*`
  - Evaluaciones: `messages.evaluation.*`

- **VerConvocatoria – Filtro por estado** (`src/protected/talento-humano/convocatoria/VerConvocatoria.tsx`):
  Nuevo estado `filtroEstado` (`all | Abierta | Cerrada`) para filtrar la lista de convocatorias.
  Contadores de estadísticas (`totalAbiertas`, `totalCerradas`) implementados con `useMemo`.
  Nuevos íconos de Lucide: `ClipboardList`, `PlusCircle`, `Users`, `XCircle`, `LayoutGrid`.

### Modificado

- **Formularios – Mensajes toast granulares** (todos los `Agregar*` y `Editar*`):
  Los componentes de agregar y editar aptitudes, estudios, experiencias, idiomas,
  producción académica y evaluaciones ahora usan claves de traducción específicas
  en lugar de las genéricas `messages.sending / success / error`.

- **Headers – Manejo seguro de sesión sin token** (`src/componentes/header.tsx` y variantes):
  Cuando no existe un JWT válido en las cookies, en lugar de lanzar una excepción
  no capturada (`throw new Error`), se redirige automáticamente a `/` (login) con
  `window.location.replace("/")` y se retorna `null`. Afecta a:
  `header.tsx`, `headerAdmin.tsx`, `headerApoyoProfesoral.tsx`,
  `headerCoordinador.tsx`, `headerRectoria.tsx`,
  `headerTalentoHumano.tsx`, `headerVicerrectoria.tsx`.

- **AvalesVicerrectoria – Rediseño de interfaz** (`src/protected/vicerrectoría/AvalesVicerrectoria.tsx`):
  Nuevo diseño con tema violeta (`violet`), gradientes y sombras mejoradas.
  Tarjetas de estadísticas rediseñadas con tipografía y espaciado actualizados.
  Ícono `User` reemplazado por `Users` (plural) para mayor precisión semántica.

- **VerConvocatoria – Refactorización de helpers** (`src/protected/talento-humano/convocatoria/VerConvocatoria.tsx`):
  Las funciones `isConvocatoriaVencida` y `getEstadoActual` fueron movidas fuera
  del componente al ámbito del módulo, eliminando su recreación en cada render.

- **constantesService – Rutas de API corregidas** (`src/services/talentoHumano/constantesService.ts`):
  Se eliminó el prefijo `/talentoHumano` de los endpoints de constantes:
  - `/talentoHumano/constantes/tipos-experiencia` → `/constantes/tipos-experiencia`
  - `/talentoHumano/constantes/niveles-idioma` → `/constantes/niveles-idioma`
  - `/talentoHumano/constantes/perfiles-profesionales` → `/constantes/perfiles-profesionales`
  - `/talentoHumano/constantes/tipos-requisitos-adicionales` → `/constantes/tipos-requisitos-adicionales`

### Eliminado / Limpieza

- **ProtectedRoute** (`src/componentes/ProtectedRoute.tsx`):
  Eliminado `console.log("Rol del usuario:", role)` de depuración.

- **ButtonTable** quitado de `VerConvocatoria.tsx` (ya no era utilizado en la vista de tarjetas).

---

## Versiones anteriores

Para el historial previo consultar los mensajes de commit en el repositorio Git.
