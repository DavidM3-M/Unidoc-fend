# Escalafón docente v2 — qué implementar en el front

Contrato del backend tras el nuevo reglamento del escalafón. El backend está en
`UniDoc` rama `feat/evaluacion-docente-apoyo-profesoral`: migrado, con 188 tests en verde.

> Versión legible para compartir fuera del repo:
> <https://claude.ai/code/artifact/804ff745-98d9-41cb-aeb2-46f9023763d4>

---

## 1. Las cuatro reglas nuevas

Casi todos los campos nuevos se explican con esto. Vale la pena leerlo antes de tocar código,
porque la interfaz actual asume cosas que dejaron de ser ciertas.

1. **La antigüedad es por escalón, no acumulada.** Ya no son "X años en la Universidad", son años
   *en la categoría actual*: 4 como Auxiliar para Asistente, 10 como Asistente para Asociado, 18
   como Asociado para Titular. Al ascender, el contador vuelve a cero.

2. **La producción académica tampoco se acumula.** Solo puntúa la divulgada *y* subida mientras el
   docente estaba en su categoría actual. Un artículo de 2018 no sirve para quien entró a Auxiliar
   en 2019. Al ascender, el puntaje también arranca en cero, aunque sobrara.

3. **Hay fechas de cierre.** Apoyo Profesoral fija periodos de ascenso. Todos los requisitos se
   congelan en la `fecha_cierre`; lo que se sube después cuenta para el periodo siguiente. Los
   docentes **no se postulan** y suben documentos cuando quieran — no hay ventana de carga que
   abrir o cerrar en la UI.

4. **Ascender es un acto de una persona.** El sistema dice quién es *elegible*; Apoyo Profesoral
   ejecuta el ascenso. Cumplir los requisitos no cambia la categoría por sí solo, y rechazar un
   documento tampoco la baja: para eso hay que revertir el acto. La interfaz no debe sugerir en
   ningún lado que el docente asciende solo.

---

## 2. Lo que se rompe (archivos concretos)

Tres endpoints cambiaron de forma. Estos son los archivos de este repo que los tocan hoy.

### 2.1 `GET /constantes/escalones-docente` — campo renombrado

`meses_minimos` → **`meses_minimos_escalon_anterior`**. Mismo número, otro significado.

| Archivo | Qué hacer |
|---|---|
| `src/types/catalogos.ts:171` | Renombrar el campo en el tipo. |
| `src/componentes/formularios/CategoriasEscalafon.tsx:12,42-44` | Renombrar y **cambiar el texto**. |
| `src/protected/admin/escalafon/EscalafonDocente.tsx:37-39` | Renombrar y cambiar el texto. |
| `src/protected/admin/escalafon/EscalonDocenteModal.tsx:80,157,268-270` | Renombrar en `defaultValues`, en el payload y en el `<InputLabel>`. |
| `src/validaciones/admin/catalogosSchema.ts:193` | Renombrar la clave del schema de Zod. |

El texto importa tanto como el nombre del campo. Hoy dice:

```ts
// CategoriasEscalafon.tsx — INCORRECTO con el reglamento nuevo
requisitos.push(`${escalon.meses_minimos} meses (${anios} años) en la Universidad Autónoma`);
```

Tiene que decir **"48 meses (4 años) en el escalón anterior"**, o mejor, nombrando el escalón
concreto: *"4 años como Auxiliar"*. Es la diferencia entre un docente que entiende por qué no
asciende y uno que abre un ticket. En `EscalonDocenteModal.tsx` la etiqueta actual
("Meses mínimos en la Universidad Autónoma") le está mintiendo al Administrador.

> El modal de admin no solo lee: **envía** ese campo en el POST/PUT. Si solo se renombra en la
> lectura, el CRUD de escalones se rompe en silencio (el backend ignora la clave desconocida y
> guarda `null`).

### 2.2 `GET /docente/evaluar-puntaje` — respuesta nueva

Misma ruta, respuesta distinta. Antes este endpoint **le otorgaba la categoría al docente** en el
momento en que la consultaba. Ahora solo informa.

**Archivo:** `src/protected/index/InformacionPersonalDocente.tsx` (líneas ~48-66 y ~99-155).

Desaparecen: `categoria_lograda`, `categoria_protegida`, `categoria_vigente`,
`faltantes_por_categoria`, `valido`.

```jsonc
// GET /api/docente/evaluar-puntaje → { mensaje, resultado }
{
  "escalon_vigente":        "Auxiliar",     // null si no está en el escalafón
  "escalon_vigente_desde":  "2019-02-01",
  "escalon_objetivo":       "Asistente",    // null si ya es el más alto
  "elegible":               true,
  "via":                    "requisitos",   // "requisitos" | "excepcion" | null
  "razon":                  "Cumple todos los requisitos...",
  "faltantes":              [],             // array plano, ver §5
  "meses_en_escalon":            84,        // respaldados por documento aprobado
  "meses_en_escalon_declarados": 96,        // incluye lo aún sin aprobar
  "meses_requeridos":            48,        // null si el objetivo no exige antigüedad
  "estado_antiguedad":      "elegible",
  "puntaje_total":          25,             // solo la ventana del escalón actual
  "periodo_ascenso":        { "id_periodo_ascenso": 3, "nombre": "Ascensos 2026-II" },
  "fecha_corte":            "2026-12-31"
}
```

Cambios concretos en ese componente:

- `setCategoria(...categoria_lograda)` → `escalon_vigente`.
- Borrar `categoriaProtegida` y su estado: la no retroactividad ya no existe.
- `faltantesPuntaje` pasa de `Record<string, Faltante[]>` (agrupado por categoría) a un **array
  plano**. El `Object.entries(...)[0]` de la línea ~63 ya no aplica: ahora solo hay un objetivo.
- Añadir barra de avance de antigüedad: `meses_en_escalon` sobre `meses_requeridos`. Cuando
  `meses_en_escalon_declarados` es mayor, marcar la diferencia como *"pendiente de aprobación"* —
  le dice al docente que su certificado está en revisión, no perdido.
- Mostrar `fecha_corte` ("evaluado al 31 de diciembre de 2026"). Sin esto el docente no entiende
  por qué el documento que subió ayer no aparece.
- **Estado vacío real**: cuando `escalon_vigente` es `null` el docente aún no está en el
  escalafón y todos los contadores son cero. No es un error; `razon` ya trae el texto que explica
  que Apoyo Profesoral no ha registrado su categoría inicial.

### 2.3 `GET /apoyoProfesoral/listar-docentes-puntaje` — un campo menos, tres más

**Archivo:** `src/protected/apoyo-profesoral/documentos/ListarDocentesPuntaje.tsx`
(líneas 22-25, 209-229).

- Desaparece `categoria_protegida` (líneas 25 y 229): hay que quitar ese distintivo de la tabla.
- Se agregan `escalon_objetivo`, `elegible`, `estado_antiguedad`.
- `categoria_lograda` **conserva el nombre** pero ahora sale del historial, no de un cálculo.

Este listado se queda como vista general. La pantalla para *trabajar* los ascensos es la bandeja
nueva (§3.1) — conviene enlazar de una a otra en vez de duplicar acciones aquí.

---

## 3. Pantallas nuevas — rol Apoyo Profesoral

Todas cuelgan de `/api/apoyoProfesoral/escalafon` y exigen el rol `Apoyo Profesoral` (403 si no).
Encajan en `src/protected/apoyo-profesoral/`, con sus rutas en `src/main.tsx` y el enlace en
`src/protected/apoyo-profesoral/ApoyoProfesoral.tsx`.

### 3.1 Bandeja de ascensos

```
GET /apoyoProfesoral/escalafon/docentes?estado_antiguedad=&periodo_ascenso_id=
```

Cada fila trae `id`, `nombre_completo`, `email`, `numero_identificacion` más **todos** los campos
del bloque de §2.2.

El semáforo `estado_antiguedad` es el orden de trabajo. Filtro por defecto sugerido: `elegible`.

| Estado | Significa | Acción |
|---|---|---|
| `sin_experiencia_suficiente` | Ni contando lo pendiente llega a los meses | Nada todavía |
| `por_verificar_experiencia` | Declarando alcanza, faltan certificados por aprobar | **Revisar la experiencia primero** |
| `antiguedad_cumplida` | Los meses respaldados ya alcanzan | Revisar estudio, idioma, producción, evaluación |
| `elegible` | Cumple todo, o entra por excepción | Ejecutar el ascenso |

Nada de esto **bloquea**: cualquier documento se sigue pudiendo revisar en cualquier momento. El
semáforo prioriza, no impide.

### 3.2 Detalle del docente

```
GET /apoyoProfesoral/escalafon/docentes/{userId}
```

```jsonc
{ "data": {
    "id": 42, "nombre_completo": "Ana Ruiz",
    "evaluacion": { /* mismo bloque de §2.2 */ },
    "historial": [{
      "id_historial_escalon": 7,
      "escalon": "Auxiliar",
      "desde": "2019-02-01",
      "hasta": null,                 // null = vigente
      "via": "ingreso",
      "motivo": "Vinculación inicial",
      "otorgado_por": "apoyo@uniautonoma.edu.co",
      "revertido_en": null,
      "revertido_por": null,
      "motivo_reversion": null
    }]
} }
```

El historial incluye los tramos **revertidos** y tienen que verse: un ascenso que se otorgó y se
deshizo es parte del expediente. Muéstralos tachados o atenuados, con quién lo revirtió y por qué.
No los filtres.

### 3.3 Los tres actos

Los tres devuelven **409** con un `message` ya redactado en español cuando el acto no procede.
Mostrarlo tal cual; no hace falta traducir códigos.

```jsonc
// POST /apoyoProfesoral/escalafon/docentes/{userId}/ingreso  → 201
{ "escalon_id": 1,
  "desde": "2019-02-01",              // obligatoria, no puede ser futura
  "motivo": "Vinculación inicial" }   // opcional
```

`desde` merece una advertencia en el formulario: de esa fecha cuelgan tanto la antigüedad como la
ventana de producción del docente. No es "cuándo lo cargamos al sistema", es **cuándo entró a esa
categoría**.

```jsonc
// POST /apoyoProfesoral/escalafon/docentes/{userId}/ascender  → 201
{ "periodo_ascenso_id": 3,             // obligatorio, el periodo debe estar CERRADO
  "motivo": "Resolución 118 de 2026" } // opcional
```

Solo se puede ascender contra un periodo **ya cerrado**. Mientras sigue abierto la bandeja muestra
una proyección ("así quedaría el expediente al cierre"), útil para mirar, no para ejecutar: el
botón debe estar deshabilitado hasta entonces, con esa explicación.

El backend **revalida** la elegibilidad al recibir la petición; no confía en lo que mostró la
bandeja. Si otro funcionario rechazó un documento mientras tanto, responde 409 — refresca la fila
con ese mensaje en vez de asumir que el ascenso ocurrió.

```jsonc
// POST /apoyoProfesoral/escalafon/historial/{id}/revertir  → 200
{ "motivo": "Certificado de inglés rechazado" }   // OBLIGATORIO
```

El `{id}` es el `id_historial_escalon`, **no** el del docente. Pide confirmación: le quita una
categoría a alguien que ya la tenía. El motivo le llega al docente por correo, así que el
formulario debe dejar claro que lo va a leer una persona.

### 3.4 Periodos de ascenso

CRUD pequeño. Un periodo solo tiene nombre y fecha de cierre — deliberadamente **no hay fecha de
apertura**, porque los docentes suben documentos cuando quieran.

| Método | Ruta | Notas |
|---|---|---|
| `GET` | `/escalafon/periodos` | Cada fila trae `cerrado`, ya resuelto como booleano |
| `POST` | `/escalafon/periodos` | `nombre` + `fecha_cierre`. Futura y posterior a la del último periodo |
| `PUT` | `/escalafon/periodos/{id}` | **409** si ya cerró: su fecha es el corte con el que se evaluaron ascensos reales |
| `POST` | `/escalafon/periodos/{id}/cerrar` | Cierre anticipado. No mueve `fecha_cierre` |

---

## 4. Endpoint nuevo para el docente

```
GET /constantes/periodo-ascenso-vigente
```

```jsonc
{ "periodo_ascenso": { "id_periodo_ascenso": 3,
                       "nombre": "Ascensos 2026-II",
                       "fecha_cierre": "2026-12-31" } }
```

Devuelve `null` entre un periodo y el siguiente. Es normal, no un fallo: el docente sigue subiendo
documentos igual, solo que aún no hay una fecha de corte anunciada.

---

## 5. Vocabularios

### `faltantes[]`

Array ordenado. Cada elemento trae `campo`, `mensaje` (ya redactado en español, para mostrar tal
cual), `requerido` y `actual`.

| `campo` | Requisito | `actual` |
|---|---|---|
| `formacion` | Nivel de estudio con documento aprobado | `null` |
| `idioma` | Nivel MCER certificado | `"B1"` \| `null` |
| `puntaje` | Puntos de producción en la ventana | `25` |
| `antiguedad` | Meses en el escalón actual | `47` |
| `evaluacion` | Promedio de evaluación docente | `4.3` |
| `produccion_academica` | Al menos un producto avalado | `null` |

En `formacion` y `produccion_academica`, `actual` viene `null` a propósito: no hay un número que
enseñar.

### `via`

| Valor | Significa |
|---|---|
| `"requisitos"` | Cumplió todo lo que exige el escalón siguiente |
| `"excepcion"` | Entra por regla de excepción — hoy, tener Doctorado aprobado. Salta **todos** los requisitos, antigüedad incluida, y puede saltarse escalones |
| `null` | No es elegible |

`via: "excepcion"` vale la pena distinguirlo visualmente: `faltantes` viene vacío y
`meses_en_escalon` puede ser 0.

### Códigos

| Código | Cuándo | Qué hacer |
|---|---|---|
| 200 / 201 | Éxito | — |
| 403 | El rol no es Apoyo Profesoral | Ocultar la sección del menú |
| 404 | Docente, periodo o tramo inexistente | — |
| 409 | El acto no procede por el estado del expediente | **Mostrar `message` tal cual** |
| 422 | Error de formulario | Pintar `errors` por campo, como en el resto del sistema |

Las respuestas de Apoyo Profesoral usan `{ status, data | message }`, igual que el resto de ese
rol. La del docente usa `{ mensaje, resultado }`, como antes.

---

## 6. Datos de prueba

La tabla del escalafón nace vacía: sin sembrar nada, todas las pantallas nuevas salen en blanco.

```bash
# en el repo UniDoc
php artisan migrate
php artisan db:seed --class=DemoTrayectoriaDocenteSeeder
```

Deja a `docente@universidad.com` así:

| Qué | Valor |
|---|---|
| Tramo cerrado | Auxiliar, 2015-01-15 → 2020-01-15 |
| Tramo vigente | Asistente, desde 2020-01-15 |
| Periodo cerrado | hace ~2 meses — contra este se **ejecuta** el ascenso |
| Periodo vigente | en ~4 meses — contra este se **proyecta** la bandeja |
| Resultado | `elegible` a Asociado, `via: "excepcion"` |

**Prueba de humo de la ventana de producción:** ese docente tiene 5 productos avalados por 31
puntos, pero `puntaje_total` devuelve **21**. El artículo de 2019 queda fuera porque se divulgó
cuando todavía era Auxiliar. Si ves 31, la ventana no se está aplicando.

Para ver `faltantes` poblado, rechaza el documento del Doctorado desde Apoyo Profesoral: se cae la
excepción y el docente pasa a medirse por requisitos.

---

## 7. Orden sugerido

Por dependencia real, no por tamaño: sin los pasos 2 y 3 nadie está en el escalafón y el resto de
pantallas se ven vacías.

1. **Arreglar lo que rompe** (§2). Es lo único que hace fallar algo que hoy funciona.
2. **Periodos de ascenso** (§3.4). Sin al menos un periodo no se puede ascender a nadie.
3. **Ingreso al escalafón** (§3.3). Llena la tabla y desbloquea todo lo demás.
4. **Bandeja con el semáforo** (§3.1). La pantalla de trabajo diaria.
5. **Ascender y revertir** (§3.3). Con confirmación en ambos y manejo del 409.
6. **Historial en el detalle** (§3.2), incluyendo los tramos revertidos.

---

## 8. Escalafón del Administrador (implementado)

El Administrador ya tenía el catálogo —qué escalones hay y qué pide cada uno— pero no podía
asomarse a la mitad que lo aplica. Ahora tiene las mismas acciones que Apoyo Profesoral más dos
que solo tiene él.

### 8.1 Las pantallas son las mismas, no una copia

`src/protected/apoyo-profesoral/escalafon/` pasó a `src/protected/escalafon/`: desde que la usan
dos roles, la carpeta ya no es de uno. Cada montaje pasa su **área**
(`src/protected/escalafon/area.ts`), de donde salen los endpoints, las rutas del navegador y lo que
se puede hacer:

```ts
<BandejaAscensos area={AREA_ADMIN} />          // /admin/escalafon
<BandejaAscensos area={AREA_APOYO_PROFESORAL} /> // /apoyo-profesoral/escalafon
```

Es el mismo criterio del backend, donde `routes/admin.php` apunta al controlador de Apoyo
Profesoral en vez de tener una copia. Duplicar las pantallas solo garantizaría que las dos se
separen en la primera corrección que se haga en una sola.

`area.puedeCorregir` es lo único que las distingue. Esconder botones no es la barrera de
seguridad —las rutas de corrección no existen bajo `/apoyoProfesoral` y el backend responde 404—
pero evita ofrecer algo que va a fallar.

### 8.2 Lo que solo tiene el Administrador

| Pantalla | Archivo | Endpoint |
|---|---|---|
| Ingreso manual | `IngresoManualModal.tsx` | `POST /admin/escalafon/docentes/{id}/ingreso-manual` |
| Corrección de un tramo | `CorregirTramoModal.tsx` | `PUT /admin/escalafon/historial/{id}` |
| Bitácora del docente | `BitacoraEscalafonPanel.tsx` | `GET /admin/escalafon/docentes/{id}/bitacora` |

**Ingreso manual.** Aparece en el estado vacío del expediente, que para Apoyo Profesoral sigue
siendo solo una explicación. Cubre al docente que llega con una categoría ya reconocida, al que
reingresa tras una reversión y a los expedientes anteriores al sistema. **Sigue exigiendo
contratación de planta vigente**: cuando lo que está mal es una fecha que el ingreso automático ya
escribió, la herramienta es la corrección, no esta.

**Corrección.** Un botón por tramo no revertido. Solo se editan escalón y fechas; `user_id`,
`periodo_ascenso_id`, `via` y las firmas no están en el formulario a propósito. Dos detalles que
no son cosméticos:

- **Reabrir es una casilla, no un campo de fecha vacío.** Vaciar «Hasta» sería ambiguo —¿no lo
  toco, o lo dejo vigente?— y son dos peticiones distintas: la clave `hasta` viaja como `null` o
  no viaja. En un tramo que ya está vigente la casilla queda fija, porque cerrarlo desde aquí
  sacaría al docente del escalafón sin dejar rastro y para eso está revertir.
- **Tras guardar se muestra qué se movió** (`impacto`) en vez de cerrar sin más. Adelantar `desde`
  descarta producción que hasta entonces puntuaba, y retrasarlo puede **no dar ni un mes** de
  antigüedad, porque el motor intersecta el historial con la experiencia uniautónoma documentada.
  Sin verlo, se repite la corrección a ciegas.

**Bitácora.** Va por docente, no por tramo: la pregunta de quien audita es «¿qué se ha tocado a
mano aquí?». Solo salen el ingreso manual y las correcciones; los ascensos y reversiones ya van
firmados en el propio tramo. Un tramo corregido se marca además con la píldora «Corregido» en el
historial, y eso **se ve también desde Apoyo Profesoral**: quien evalúa el expediente es justo
quien necesita saber que ya no es lo que produjo el acto original.

### 8.3 Menú y variables de entorno

Dos entradas separadas en la barra lateral del Admin: «Escalafón docente» administra las reglas y
«Ascensos» las aplica. `.env` gana tres claves (`VITE_ENDPOINT_ADMIN_ESCALAFON_*`), y como está en
`.gitignore`, `area.ts` lleva el valor por defecto detrás de cada una: sin eso, quien clone el
repo sin las claves nuevas pediría `undefined/docentes`.

---

## Nota sobre `src/utils/experienciaMeses.ts`

Su docblock cita `MotorEscalafonDocenteService::calcularMesesUniautonoma`, que **ya no existe**:
lo reemplazó `mesesEnEscalon()`, que cruza el historial de escalón con las experiencias
UniAutónoma aprobadas. El cálculo del helper sigue siendo correcto para lo suyo (prellenar
`meses_trabajados` en el formulario de experiencia); solo hay que corregir el comentario para que
no mande a nadie a buscar un método que ya no está.

`meses_trabajados` sigue **sin usarse** en el escalafón — el motor calcula por fechas. Eso no
cambió.
