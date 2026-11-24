# Flow it! — Contexto completo del proyecto

Documento de orientación para que cualquier modelo (Opus u otro) entienda de golpe qué es esta app, cómo está construido el motor de retos y en qué estado se encuentra, sin tener que releer todo el código ni repetir investigación ya hecha.

## Qué es la app

PWA (React 19 + Vite + TypeScript) anti-procrastinación pensada para TDAH. Repo: `ginaruipal777/Flow_it` (privado), auto-desplegado en Vercel: https://flow-it-jet.vercel.app/

La persona escribe una tarea («descalcificar la cafetera», «ducharse», «responder el email de Carlos») y la app le da **15 micro-retos** (3 niveles de esfuerzo × 5 «cartas INCUP»), para que elija el más pequeño que le sirva de primer paso. Principio central: **cuanto más pesa la tarea, más pequeña es la acción** — Pesado es el contacto mínimo, Ligero ya es un bloque de avance real.

Las 5 cartas por nivel son los 5 factores INCUP (motivación psicológica):
- **Novedad** — cambiar algo de cómo se hace siempre.
- **Desafío** — una micro-meta contable.
- **Pasión** — con algo que gusta (música, bebida favorita…).
- **Interés** — con otra persona o curiosidad.
- **Urgencia** — la acción directa con un plazo corto.

Las reglas de redacción (nunca «hacer», nunca prisa, nunca entradillas tipo «¡plan nuevo!», siempre un objeto concreto, nunca dos acciones con «y»…) vienen de investigación real sobre apps para TDAH (`docs/comunicacion.md`) y están **impuestas por un validador automático** (ver más abajo). No son estilo, son restricciones duras.

## Flujo completo al escribir una tarea

Archivo que lo orquesta todo: `src/pages/Inicio/Inicio.tsx`, función `empezar()`.

1. **Filtro de seguridad** (`src/datos/filtros.ts`, `filtrarTarea`) — bloquea texto peligroso o sin sentido.
2. **Búsqueda de datos de la tarea** (`src/datos/web.ts`, `buscarMicroPaso`), en este orden:
   - Caché local del móvil (`localStorage`, 7 días) — si ya se buscó esta tarea+esfuerzo, instantáneo.
   - Si no, **en paralelo**: `buscarEnSheet` (GET a tu Google Sheet, ver más abajo) y `buscarEnServidor` (POST a `api/micro_paso.py`, búsqueda real en internet con `webless`). Si el Sheet ya trae datos reales, se usa sin esperar a internet (que sigue en segundo plano para refrescar la caché local).
3. **Limpieza de lo encontrado** (`src/datos/pasos.ts`) — extrae pasos, materiales y técnicas reales, aplica el «filtro de ubicuidad» (traduce objetos raros a objetos universales: «limpiacristales» → «papel de cocina»).
4. **Preguntas de contexto** (`src/datos/contexto.ts`, `preguntasDe`) — como mucho 3, siempre relacionadas con la tarea concreta:
   - P1: «¿Cómo lo haces?» (métodos reales) o «¿Qué tienes más cerca ahora mismo?» / «¿Desde dónde vas a abrirlo?» (materiales reales, con wording distinto si la tarea es digital).
   - P2: si la tarea requiere un lugar físico → «¿Dónde te cuesta menos empezar?» (sitios reales del Sheet, o los 3 genéricos cama/mesa/de pie). Si NO requiere lugar → **siempre** «¿Qué te acompaña mejor ahora?» (Situaciones reales del Sheet, o 3 genéricas de música/bebida/rincón favoritos).
   - P3: «¿Qué parte te da más pereza o freno ahora?» (Bloqueos reales del Sheet si hay exactamente 3, si no los genéricos Pereza/Cansancio/Me agobia).
   - Se pintan en la pantalla de carga (`Preparando.tsx`), una a una; «Saltar» corta el resto.
5. **Reconocimiento de categoría** (`src/datos/reglas.ts`, `analizarTarea`) — 52 reglas por palabras clave locales, o lo que trajo la web/Sheet si no hay regla.
6. **Motor de generación de retos** — ver sección siguiente.
7. **Guardado en el Sheet** (`src/datos/sheet.ts`, `guardarEnSheet`) — en segundo plano, fire-and-forget: si falla no bloquea nada.
8. Navega a `/reto` y pinta las cartas.

## El motor de retos (lo más importante para entender)

Dos piezas: `src/datos/reglas.ts` (capa de reglas/orquestación) y `src/datos/motor.ts` (el motor universal). `src/datos/banco.ts` son las 15 cartas escritas a mano por categoría (52 categorías), usadas **solo como último respaldo**.

### Orden de prioridad para elegir el «núcleo» (la acción base) de cada nivel

Función `nucleos()` en `motor.ts`, por orden (la primera que tenga algo gana):

1. **Elección de la persona** (lo que contestó en las preguntas de contexto) — reemplaza el núcleo con 2-3 variantes propias por nivel. Si además eligió un objeto concreto, se **enriquece** (no sustituye) añadiendo detrás las `Acciones_[Nivel]` de la fila del Sheet que no mencionen otro objeto distinto del elegido (filtro de ubicuidad).
2. **Guía Maestra (Google Sheet)** — si la tarea viene de una fila del Sheet, usa sus `Acciones_Pesado/Medio/Ligero` tal cual (filtrando las que ya dan por hecho estar en otro sitio fijo —grifo, encimera— si la persona dijo que está en reposo, cama o sofá).
3. **Datos reales de internet** (pasos/materiales/técnicas de `webless`) — construye frases con eso.
4. **Heurísticas genéricas** según el objeto/verbo de la frase (unidades: páginas, preguntas, casillas…).
5. **`RESPALDO`/`BANCO`** — último recurso, cartas escritas a mano por categoría.

### Modificadores INCUP (el «sabor» de cada carta)

`MODIFICADORES` en `motor.ts`: lista fija de coletillas por tipo INCUP («con tu música favorita de fondo», «sin mirar el móvil ni una vez»…). Se combinan con el núcleo (`núcleo + modificador`). Si la tarea trae `Situaciones` reales del Sheet, se suman como candidatas extra. Si la persona contestó la pregunta de «ambiente», esa situación se fija como modificador único de Pasión e Interés (con fallback a los genéricos si no encaja gramaticalmente con ningún núcleo del mazo — esto evitaba un crash real, ver «Bugs corregidos»).

### Selección final, carta por carta

Cada tarea tiene una **semilla aleatoria real** (`Math.random()` al crearse, guardada con ella — no determinista por hash, así la misma tarea escrita dos veces no repite las mismas frases). Se deriva una sub-semilla por carta y nivel, se baraja (Fisher-Yates determinista) núcleos y modificadores, y se elige la primera combinación que: quepa en la carta (límites de longitud, calculados exactamente según el conector real que le toque, no un margen fijo), no se haya repetido ya en el mazo, y si es posible no repita el mismo núcleo que otra carta del mismo mazo.

**Pesado** añade además un conector de mínimo esfuerzo delante («Solo», «Tan solo», «Nada más», «Únicamente», «Apenas», «Simplemente»), elegido por un hash del propio texto (no al azar puro, pero varía).

**Urgencia** no lleva modificador: núcleo + plazo del nivel (`PLAZO` en `banco.ts`).

**«No encaja»** (`src/datos/descartes.ts`): si la persona rechaza una carta, se evita su núcleo completo (no solo esa combinación) mientras haya alternativa, y se prioriza la estrategia contraria (mecánica/emocional/social/informativa).

### Dato importante: contrato «verbo primero»

Todo valor de `acciones[nivel][tipo]` (lo que devuelve `accionesMotor`/`accionesWeb`) **tiene que empezar siempre por un verbo físico conocido** (lista `PARTICIPIOS` en `reglas.ts`). Esto no es solo estético: de ahí sale «Está hecho cuando…» (`hechoDe`), y `accionesWeb()` se usa fuera de las cartas. Se intentó una vez poner el modificador delante del núcleo («Con música…, coge…») para más variedad estructural y se revirtió explícitamente porque rompía este contrato en todas partes, no solo en el título.

## Integración con Google Sheets («Guía Maestra de Retos»)

La hoja (`Guia Maestra de Retos - Flow It (Plantilla Oficial)`, pestaña única donde viven las 20 filas guía escritas a mano Y las tareas nuevas que guarda la app) actúa como **motor combinatorio**, no solo caché. Backend: un Google Apps Script (`doGet`/`doPost`), llamado desde `src/datos/sheet.ts`.

### Columnas reales (13, "Mapa Mental V2")

`ID_Tarea, Tarea, Dominio, Palabras_Clave, Es_Digital, Lugares, Objetos, Situaciones, Tiempos, Acciones_Pesado, Acciones_Medio, Acciones_Ligero, Bloqueos` — los valores de listas van separados por ` | `.

### Lectura (`buscarEnSheet`, GET `?tarea=...`)

El Apps Script busca primero coincidencia exacta en `Tarea` (sin tildes), y si no hay, por solapamiento de ≥2 palabras con `Palabras_Clave` (antes era ≥1, causaba falsos positivos — ver bugs). Si encuentra fila con `Objetos` no vacío, `sheet.ts` la reconstruye como si viniera de una búsqueda web real (pasos, materiales, técnicas, lugares, bloqueos, núcleos por nivel, situaciones).

### Escritura (`guardarEnSheet`, POST)

Añade una fila nueva **debajo de las 20 guía, en la misma pestaña** (el usuario lo pidió así explícitamente, no en una pestaña aparte). El script comprueba duplicados por `Tarea` normalizada antes de insertar. Mapea por **nombre de columna**, nunca por posición (un bug de desplazamiento de columnas ya ocurrió y se corrigió).

La caché del Sheet **no se guarda** en el `localStorage` de 7 días: cada intento vuelve a leer la Guía Maestra por si cambió.

### Código del Apps Script actual (fuera del repo, vive solo en Google)

```javascript
const COLUMNAS = [
  'ID_Tarea', 'Tarea', 'Dominio', 'Palabras_Clave', 'Es_Digital',
  'Lugares', 'Objetos', 'Situaciones', 'Tiempos',
  'Acciones_Pesado', 'Acciones_Medio', 'Acciones_Ligero', 'Bloqueos',
]

function normalizar_(texto) {
  return String(texto || '').trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
}

function hojaPrincipal_() {
  return SpreadsheetApp.getActiveSpreadsheet().getSheets()[0]
}

function filaComo_(cabeceras, fila) {
  const obj = {}
  cabeceras.forEach((c, i) => (obj[c] = fila[i] ?? ''))
  return obj
}

function doGet(e) {
  const query = normalizar_(e.parameter.tarea)
  if (!query) return ContentService.createTextOutput(JSON.stringify({ found: false })).setMimeType(ContentService.MimeType.JSON)
  const hoja = hojaPrincipal_()
  const datos = hoja.getDataRange().getValues()
  const cabeceras = datos[0]
  const iTarea = cabeceras.indexOf('Tarea')
  const iKeys = cabeceras.indexOf('Palabras_Clave')
  const palabrasQuery = query.split(/\s+/).filter((p) => p.length > 2)

  for (let f = 1; f < datos.length; f++) {
    if (normalizar_(datos[f][iTarea]) === query) {
      return ContentService.createTextOutput(JSON.stringify({ found: true, origen: hoja.getName(), data: filaComo_(cabeceras, datos[f]) })).setMimeType(ContentService.MimeType.JSON)
    }
  }
  for (let f = 1; f < datos.length; f++) {
    const textoFila = normalizar_(datos[f][iTarea] + ' ' + (iKeys >= 0 ? datos[f][iKeys] : ''))
    const tagsFila = textoFila.split(/[,\s|]+/).filter((t) => t.length > 2)
    if (palabrasQuery.filter((pq) => tagsFila.includes(pq)).length >= 2) {
      return ContentService.createTextOutput(JSON.stringify({ found: true, origen: hoja.getName(), data: filaComo_(cabeceras, datos[f]) })).setMimeType(ContentService.MimeType.JSON)
    }
  }
  return ContentService.createTextOutput(JSON.stringify({ found: false })).setMimeType(ContentService.MimeType.JSON)
}

function doPost(e) {
  const fila = JSON.parse(e.postData.contents)
  const hoja = hojaPrincipal_()
  const cabeceras = hoja.getRange(1, 1, 1, hoja.getLastColumn()).getValues()[0]
  const iTarea = cabeceras.indexOf('Tarea')
  const iId = cabeceras.indexOf('ID_Tarea')
  const datos = hoja.getDataRange().getValues()
  const query = normalizar_(fila.Tarea)
  for (let f = 1; f < datos.length; f++) {
    if (normalizar_(datos[f][iTarea]) === query) {
      return ContentService.createTextOutput(JSON.stringify({ status: 'ya existia', id: datos[f][iId], tarea: fila.Tarea })).setMimeType(ContentService.MimeType.JSON)
    }
  }
  const n = hoja.getLastRow()
  const id = 'TSK-' + String(n).padStart(3, '0')
  const valores = cabeceras.map((c) => (c === 'ID_Tarea' ? id : (fila[c] ?? '')))
  hoja.appendRow(valores)
  return ContentService.createTextOutput(JSON.stringify({ status: 'saved', id, tarea: fila.Tarea })).setMimeType(ContentService.MimeType.JSON)
}
```

## Validador de redacción

`scripts/validar-retos.mts` (`npm run validar`) genera **miles de combinaciones reales** (categorías de `banco.ts`, respaldo, tareas de ejemplo con web simulada, con preguntas de contexto simuladas, con «No encaja» simulado) y comprueba que ninguna viole las reglas (`PROHIBIDO`): nada de «y»/«o», nada de «después»/«luego», nada de «hacer» abstracto, nada de prisa («rápido», «ya mismo»), nada de pedir pensar/decidir, siempre objeto concreto, nada de género gramatical para la persona, nada de entradillas motivacionales, Urgencia siempre con plazo y solo Urgencia, límite de longitud de carta, «Está hecho cuando» siempre calculable, Pesado siempre con uno de los 6 conectores. **Es la referencia de verdad**: si algo no pasa `npm run validar`, no se considera terminado. Hoy pasa limpio (`Todo cumple las reglas`).

Comandos de verificación que siempre se corren tras tocar el motor: `npx tsc -b`, `npm run lint` (oxlint), `npm run validar`.

## Pendiente, conocido, sin arreglar todavía

1. **Las columnas `Acciones_Pesado/Medio/Ligero` del Sheet están escritas en infinitivo** («tocar la toalla», «soltar los hombros») en vez de imperativo («Toca la toalla», «Suelta los hombros»). Esto rompe de verdad `hechoDe()` («Está hecho cuando…» cae a un genérico «lo has conseguido una vez») para casi todas las cartas que usan núcleos del Sheet. No se puede arreglar de forma fiable por código (conjugación irregular: poner→pon, no "pone"); hay que reescribir las 20 filas guía en imperativo a mano en el Sheet.
2. La fila `TSK-025` («lavarme los dientes») quedó guardada con los datos de «ducharse» (por el bug de fuzzy-match de 1 palabra, ya corregido en el script) — conviene borrarla a mano para que no se repita a sí misma.
3. Con el máximo de 3 preguntas, las tareas sin lugar físico ya no preguntan nunca «¿lo has hecho antes?» (se quitó a propósito por decisión del usuario, 2026-11, porque apenas cambiaba nada salvo la opción «nunca»); si se echa en falta ese matiz, habría que añadir un cuarto hueco o fusionarlo en otra pregunta.

## Bugs reales corregidos esta sesión (para no repetirlos)

- Contracción `a el → al` rompía verbos con tilde («Vacía el» → «Vacíal») por usar `\b`, que no ve una tilde como letra. Arreglado exigiendo espacio/inicio de cadena.
- Límite de longitud de carta no contaba el conector real de Pesado (podía pasarse de 110 caracteres).
- `hechoDe()` se rompía si el texto no empezaba por el verbo (motivo por el que se revirtió el experimento de modificador-delante).
- Crash real (`candidatas[0]` undefined) si la situación elegida por la persona no encajaba con ningún núcleo del mazo (filtro `encaja()` la descartaba para todo). Arreglado con fallback a modificadores genéricos + guarda defensiva general.
- Fuzzy-match del Sheet con 1 sola palabra en común confundía tareas distintas (dientes↔ducha); ahora exige ≥2.
- `doPost` guardaba por posición de columna, no por nombre: al añadir columnas nuevas al Sheet, los valores se desplazaban una celda. Arreglado mapeando por cabecera.

## Mapa de archivos clave

| Archivo | Qué hace |
|---|---|
| `src/pages/Inicio/Inicio.tsx` | Orquesta todo el flujo al escribir una tarea |
| `src/datos/filtros.ts` | Filtro de seguridad/sentido del texto |
| `src/datos/web.ts` | Búsqueda (caché local 7d, Sheet, `api/micro_paso.py`) |
| `src/datos/sheet.ts` | Lectura/escritura de la Guía Maestra (Google Sheet) |
| `src/datos/pasos.ts` | Limpieza de pasos/materiales/técnicas, filtro de ubicuidad |
| `src/datos/contexto.ts` | Las 3 preguntas de contexto |
| `src/datos/articulos.ts` | Artículo correcto para un nombre («la cafetera») |
| `src/datos/reglas.ts` | 52 reglas por categoría, `variablesDe`, `fraseReto`, `hechoDe`, `retosDe` |
| `src/datos/motor.ts` | El motor universal: núcleos, modificadores, semilla, selección |
| `src/datos/banco.ts` | Las 15 cartas escritas a mano por categoría (respaldo final) |
| `src/datos/descartes.ts` | Lógica de «No encaja» |
| `src/datos/situacion.ts` | Orden de cartas según la situación probable |
| `src/datos/retos.ts` | `generarRetos` (junta todo para una tarea+mazo) |
| `src/datos/modelo.ts` | Tipos (`Tarea`, `MicroPasoWeb`, `Reto`, categorías) |
| `src/estado/FlowEstado.tsx` | Estado global (`localStorage`), crea la semilla de cada tarea |
| `api/micro_paso.py` | Serverless (Vercel) que busca en internet (`webless`) |
| `scripts/validar-retos.mts` | Validador de redacción, referencia de corrección |
| `docs/comunicacion.md` | Investigación original de redacción (Goblin Tools, Tiimo, Finch…) |
