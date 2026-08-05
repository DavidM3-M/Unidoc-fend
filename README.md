# UniDoc — Frontend

Sistema de gestión documental universitaria desarrollado con **React 19 + TypeScript + Vite**.  
Permite a distintos roles (aspirante, docente, coordinador, talento humano, vicerrectoría, rectoría, admin) gestionar hojas de vida, convocatorias, postulaciones, contrataciones, avales y normativas.

---

## Tecnologías principales

| Categoría | Librería / Herramienta |
|---|---|
| UI Framework | React 19 + TypeScript |
| Build tool | Vite 6 |
| Estilos | Tailwind CSS 4, MUI 7, Emotion |
| Routing | React Router 7 |
| Formularios | React Hook Form 7 + Zod 3 |
| Tablas | TanStack Table 8 |
| HTTP | Axios 1.9 |
| Autenticación | JWT (`jwt-decode`) + cookies (`js-cookie`) |
| Notificaciones | React Toastify 11 |
| Íconos | Lucide React |
| Internacionalización | contexto propio `LanguageContext` (ES / EN) |
| Fechas | date-fns 4 |

---

## Roles y módulos

| Rol | Módulos disponibles |
|---|---|
| **Aspirante / Docente** | Datos personales, hoja de vida (estudios, aptitudes, experiencias, idiomas, producción académica, evaluaciones), convocatorias públicas, postulaciones, configuración |
| **Talento Humano** | Gestión de convocatorias (crear / editar / ver), postulaciones, contrataciones, aspirantes aprobados |
| **Coordinador** | Vista de aspirantes, avales |
| **Vicerrectoría** | Gestión de avales con filtros y estadísticas |
| **Rectoría** | Gestión de avales |
| **Apoyo Profesoral** | Módulo de apoyo |
| **Admin** | Dashboard, normativas, usuarios |

---

## Estructura del proyecto

```
src/
├── assets/          # Íconos e imágenes
├── auth/            # Login, registro, restablecer contraseña
├── componentes/     # Componentes reutilizables (headers, modales, formularios, tablas)
│   ├── formularios/
│   ├── modales/
│   ├── tablas/
│   └── datos-personales/
├── context/         # LanguageContext (i18n ES/EN)
├── datosPersona/    # Tarjetas de sección de hoja de vida (ARL, EPS, RUT, etc.)
├── hooks/           # Hooks personalizados
├── layouts/         # Layouts por rol
├── protected/       # Páginas protegidas por rol
│   ├── admin/
│   ├── agregar/
│   ├── apoyo-profesoral/
│   ├── configuracion/
│   ├── convocatorias/
│   ├── coordinador/
│   ├── datos-personales/
│   ├── editar/
│   ├── index/
│   ├── normativas/
│   ├── postulaciones/
│   ├── publico/
│   ├── rectoria/
│   ├── talento-humano/
│   │   ├── contratacion/
│   │   ├── convocatoria/
│   │   └── postulaciones/
│   ├── traer-roles/
│   ├── ver/
│   └── vicerrectoría/
├── services/        # Llamadas a la API (constantesService, etc.)
├── types/           # Tipos TypeScript compartidos
├── utils/           # axiosConfig, buildConvocatoriaPayload
└── validaciones/    # Esquemas Zod por entidad
```

---

## Instalación y desarrollo

```bash
# Clonar el repositorio
git clone <url-del-repo>
cd unidoc-vite

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

### Variables de entorno

Crea un archivo `.env` en la raíz con:

```env
VITE_API_URL=http://localhost:<puerto>/api
```

### Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo con HMR |
| `npm run build` | Compilación de producción (`tsc -b && vite build`) |
| `npm run preview` | Vista previa del build de producción |
| `npm run lint` | Análisis estático con ESLint |

---

## Autenticación y rutas protegidas

- El JWT se almacena en cookies mediante `js-cookie`.  
- `ProtectedRoute` decodifica el token y verifica el rol antes de renderizar la ruta.  
- Si no existe token válido, todos los headers redirigen automáticamente a `/` (login) sin lanzar excepciones.

---

## Internacionalización (i18n)

El contexto `LanguageContext` cubre ES/EN con claves tipadas. Las claves de feedback de formularios siguen el patrón:

```
messages.<entidad>.<accion>
# Ejemplos:
messages.aptitude.adding   → "Guardando aptitud..."
messages.study.updated     → "Estudio actualizado con éxito"
messages.evaluation.sendError → "Error al enviar la evaluación"
```

Entidades cubiertas: `aptitude`, `study`, `experience`, `language`, `production`, `evaluation`.

---

## Changelog

Ver [CHANGELOG.md](CHANGELOG.md) para el historial detallado de cambios.
