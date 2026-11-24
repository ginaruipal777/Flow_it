# Spec: sistema de etiquetas semánticas para el motor de retos

Documento de ejecución. Describe **qué etiquetas existen, qué reglas las usan y qué archivo toca cada cosa**. Leer antes `CONTEXTO_PROYECTO.md` (raíz) para el contexto general del motor.

## Por qué

Hoy la compatibilidad entre un núcleo («Lávate el pelo») y un modificador INCUP («con una persona de confianza al lado») se decide con regex sueltos repartidos por `motor.ts` (`encaja()`, `FIJO_SITIO`, `sinOtrosObjetos`). Eso deja pasar combinaciones incoherentes que ya salen hoy en producción, por ejemplo:

- `Lavarse el pelo con una persona de confianza al lado.` (ducharse + modificador social)
- `Friega un plato desde otro sitio de la casa.` (acción anclada al fregadero + modificador de cambio de sitio)
- `Llama al dentista con tu música favorita de fondo.` (llamada + ruido)

Todas son el mismo fallo: las piezas se emparejan por texto, no por lo que significan. La solución es declarar **qué exige o implica cada pieza** y prohibir las combinaciones que chocan.

## 1. Las etiquetas

Tipo nuevo en `src/datos/etiquetas.ts`:

```ts
export type Etiqueta =
  // postura y sitio
  | 'de-pie' | 'anclado' | 'fuera'
  // cuerpo
  | 'manos' | 'voz'
  // pantalla
  | 'digital' | 'movil'
  // sensorial
  | 'agua' | 'sucio' | 'ruido' | 'silencio'
  // privacidad
  | 'intimo'
  // estructura (ya existían como casos especiales)
  | 'unidad' | 'con-objeto'
```

| Etiqueta | Significa | Ejemplo de frase que la lleva |
|---|---|---|
| `de-pie` | Hay que estar levantado y moviéndose | «Barre la cocina», «Tiende la ropa» |
| `anclado` | Solo se puede hacer en un sitio fijo concreto | «Abre el grifo», «Mira la encimera» |
| `fuera` | Pasa en la calle, fuera de casa | «Camina hasta la esquina» |
| `manos` | Necesita manipular con las manos | «Coge la taza», «Dobla una prenda» |
| `voz` | Hay que hablar o leer en voz alta | «Lee la primera pregunta en voz alta» |
| `digital` | Se hace con pantalla | «Abre la app del test», «Escribe el correo» |
| `movil` | Específicamente con el móvil | «Busca en el móvil cómo…» |
| `agua` | Implica agua o mojarse | «Enjuaga el depósito», «Métete bajo el agua» |
| `sucio` | Implica grasa, basura o suciedad | «Saca 3 paladas del arenero» |
| `ruido` | Produce o necesita sonido | «Pon el podcast» |
| `silencio` | Necesita silencio o escuchar bien | «Llama al centro de salud», «Contesta el test» |
| `intimo` | Cuerpo, desnudez, higiene personal | «Métete bajo el agua», «Lávate los dientes» |
| `unidad` | La frase cuenta unidades | «Lee 3 párrafos» |
| `con-objeto` | Nombra un objeto concreto delante | «Toca la cafetera» |

## 2. De dónde salen las etiquetas

Dos vías, a propósito distintas:

**Modificadores INCUP → etiquetas explícitas.** Son una lista fija de 21, escritas a mano: se etiquetan a mano, una vez, en la propia tabla `MODIFICADORES` de `motor.ts`.

**Núcleos → etiquetas derivadas del texto.** Son dinámicos (vienen del Sheet, de `webless`, de `banco.ts` o construidos al vuelo), así que se deducen con un diccionario central. Importante: usa **raíces**, no palabras completas, porque las `Acciones_*` del Sheet están en infinitivo («lavarse») y el resto del motor en imperativo («lávate»); ambos deben etiquetarse igual.

```ts
// src/datos/etiquetas.ts
const REGLAS_ETIQUETA: [RegExp, Etiqueta[]][] = [
  [/\b(grifo|agua|ducha\w*|duchar\w*|enjuag\w+|moja\w+|lava\w*|frieg\w+|fregar|aclara\w*|bañ\w+)\b/, ['agua']],
  [/\b(basura|grasa|mancha\w*|polvo|suciedad|arenero|cacharro\w*|estropajo)\b/, ['sucio']],
  [/\b(grifo|fregadero|encimera|horno|nevera|lavadora|microondas|ducha|bañera|lavabo|tendedero|armario|depósito)\b/, ['anclado']],
  [/\b(barr\w+|aspir\w+|tiend\w+|tender|cocin\w+|camin\w+|pase\w+|sube|baja|sal|ve a|acércate)\b/, ['de-pie']],
  [/\b(calle|portal|parque|manzana|acera|supermercado|tienda|gimnasio|rocódromo)\b/, ['fuera', 'de-pie']],
  [/\b(coge|toca|sujeta|agarra|prepara|junta|saca|llena|vacía|dobla|monta|enrosca|aprieta)\b/, ['manos']],
  [/\b(en voz alta|llama|telefon\w+|pregunta|cuéntale|habla)\b/, ['voz']],
  [/\b(móvil|app|pantalla|web|ordenador|portátil|correo|email|documento|pdf|online|enlace|bandeja)\b/, ['digital']],
  [/\b(móvil|app del|en el móvil)\b/, ['movil']],
  [/\b(llama|llamada|teléfono|examen|test|estudi\w+|lee|leer|concentr\w+|grab\w+)\b/, ['silencio']],
  [/\b(música|canción|podcast|vídeo|altavoz|televisión|playlist)\b/, ['ruido']],
  [/\b(ducha\w*|duchar\w*|bañar\w*|desnud\w*|pelo|cuerpo|dientes|afeit\w+|depil\w+|baño|aseo|pijama|toalla)\b/, ['intimo']],
]

export function etiquetasDe(texto: string): Etiqueta[]
```

`unidad` y `con-objeto` se siguen deduciendo como hoy (`NUCLEO_UNIDAD` por texto, `CON_OBJETO` por id de pieza): se mantienen tal cual, solo se exponen como etiquetas para unificar la comprobación.

### Etiquetas de los 21 modificadores (escribir a mano en `MODIFICADORES`)

| id | texto | etiquetas |
|---|---|---|
| `n-sitio` | desde otro sitio de la casa | `cambia-sitio` |
| `n-rincon` | en un sitio de la casa donde casi nunca estás | `cambia-sitio` |
| `n-final` | empezando por el final | (estructural: `solo: 'unidad'`) |
| `n-oscuro` | con la pantalla en modo oscuro | `digital` |
| `n-ventana` | junto a una ventana | `cambia-sitio` |
| `d-voz` | contando cada paso en voz alta | `ruido`, `voz` |
| `d-quieto` | sin moverte de donde estás | `quieto` |
| `d-movil` | con el móvil boca abajo | `sin-movil` |
| `d-sinmovil` | sin mirar el móvil ni una vez | `sin-movil` |
| `d-avisos` | con las notificaciones silenciadas | `digital` |
| `d-hasta` | sin levantarte hasta terminar | `quieto` |
| `p-musica` | con tu música favorita de fondo | `ruido` |
| `p-bebida` | con tu bebida favorita al lado | `bebida` |
| `p-cancion` | con tu canción favorita sonando | `ruido` |
| `p-rincon` | en tu rincón favorito de la casa | `cambia-sitio` |
| `p-puntos` | sumando un punto por cada movimiento | — |
| `p-juego` | como en un juego de contar movimientos | — |
| `i-casa` | con alguien de casa cerca | `social` |
| `i-confianza` | con una persona de confianza al lado | `social` |
| `i-video` | en una videollamada con alguien de confianza | `social`, `digital` |
| `i-detalle` | fijándote en un detalle que no habías visto | (estructural: solo con `con-objeto`) |

Los modificadores usan 5 etiquetas propias que un núcleo nunca lleva (`cambia-sitio`, `quieto`, `sin-movil`, `social`, `bebida`). Añadirlas al tipo `Etiqueta`.

## 3. Las reglas de incompatibilidad

Declarativas, en `src/datos/etiquetas.ts`:

```ts
/** [etiqueta del núcleo, etiqueta del modificador] que NO pueden ir juntas */
export const INCOMPATIBLES: [Etiqueta, Etiqueta][] = [
  ['intimo', 'social'],      // R1
  ['anclado', 'cambia-sitio'], // R2
  ['digital', 'sin-movil'],  // R3
  ['movil', 'sin-movil'],    // R3
  ['fuera', 'cambia-sitio'], // R4
  ['fuera', 'social'],       // R4b: «con alguien de casa cerca» no pega en la calle
  ['silencio', 'ruido'],     // R5
  ['silencio', 'voz'],       // R5b
  ['agua', 'bebida'],        // R6
  ['de-pie', 'quieto'],      // R7
  ['anclado', 'quieto'],     // R7b
]
```

| Regla | Prohíbe | Ejemplo que mata |
|---|---|---|
| R1 | Acción íntima + compañía | «Lavarse el pelo con una persona de confianza al lado» |
| R2 | Acción anclada + cambiar de sitio | «Friega un plato desde otro sitio de la casa» |
| R3 | Acción con pantalla + prohibición de móvil | «Busca en el móvil… sin mirar el móvil ni una vez» |
| R4 | Acción en la calle + modificador de casa | «Camina hasta la esquina junto a una ventana» |
| R5 | Acción que necesita oír + ruido o voz alta | «Llama al dentista con tu música favorita de fondo» |
| R6 | Acción con agua + bebida al lado | «Métete bajo el agua con tu bebida favorita al lado» |
| R7 | Acción que exige moverse + «sin moverte» | «Barre la cocina sin moverte de donde estás» |

Se mantienen además las **dos reglas estructurales que ya existen** (no son semánticas, son de forma): `n-final` solo con núcleos `unidad`; `i-detalle` solo con núcleos `con-objeto`.

### Reglas que dependen de lo que contestó la persona

```ts
/** Si la persona dijo dónde está, qué etiquetas de núcleo quedan descartadas */
export const INCOMPATIBLES_LUGAR: Record<string, Etiqueta[]> = {
  cama: ['de-pie', 'anclado', 'fuera'],
  sofa: ['de-pie', 'anclado', 'fuera'],
}
```

Esto **sustituye** al actual `FIJO_SITIO` + `reposo` de `motor.ts` (que solo miraba 6 palabras de cocina), generalizándolo.

### Regla blanda: el bloqueo despriorizà, no prohíbe

Si la persona eligió un bloqueo sensorial (los `Bloqueos` del Sheet, p. ej. «textura del agua o grasa»), se etiqueta ese texto con `etiquetasDe()` y los núcleos que compartan esa etiqueta (`agua`, `sucio`) **bajan al final de la lista de candidatos**, no se eliminan. Importante que sea despriorización y no filtro: si se elimina y no queda nada, la lista se vacía y el mazo revienta (ya pasó una vez, ver `CONTEXTO_PROYECTO.md` → bugs corregidos).

Se implementa en la función `conDescartes()` de `motor.ts`, que ya ordena candidatas por puntos: sumar un punto extra a las que choquen con el bloqueo.

## 4. El ámbito (etiqueta de fila, para el Sheet)

Problema aparte: emparejar la tarea escrita con la fila correcta de la Guía Maestra. Hoy basta con 2 palabras en común, y por eso «lavarme los dientes» cogió la fila de «ducharse» (comparten «lavarme»).

**Columna nueva en el Sheet: `Ambito`**, un solo valor por fila, de una lista cerrada:

```ts
export type Ambito =
  | 'boca' | 'cuerpo' | 'pelo' | 'deporte' | 'cocina' | 'ropa' | 'casa'
  | 'pantalla' | 'papeleo' | 'calle' | 'compra' | 'mascota' | 'estudio'
  | 'creativo' | 'ocio' | 'descanso'
```

Valores para las 20 filas guía actuales (rellenar a mano en el Sheet):

| Fila | Ambito | Fila | Ambito |
|---|---|---|---|
| TSK-001 leer | `estudio` | TSK-011 poner lavadora | `ropa` |
| TSK-002 limpiar cocina | `cocina` | TSK-012 pedir cita | `papeleo` |
| TSK-003 hacer cafe | `cocina` | TSK-013 hacer ejercicio | `deporte` |
| TSK-004 ducharse | `cuerpo` | TSK-014 descalcificar cafetera | `cocina` |
| TSK-005 fregar platos | `cocina` | TSK-015 escribir proyecto | `creativo` |
| TSK-006 preparar cena | `cocina` | TSK-016 hacer la compra | `compra` |
| TSK-007 responder emails | `pantalla` | TSK-017 ver serie o pelicula | `ocio` |
| TSK-008 test autoescuela | `estudio` | TSK-018 cuidar mascotas | `mascota` |
| TSK-009 dar un paseo | `calle` | TSK-019 hidratarse y descansar | `descanso` |
| TSK-010 ordenar habitacion | `casa` | TSK-020 tocar instrumento o dibujar | `creativo` |

**Cómo se usa:** la app deduce el ámbito de la tarea escrita con un diccionario (`ambitoDe(texto)`, mismo archivo) y lo manda como parámetro:

```
GET ...exec?tarea=lavarme%20los%20dientes&ambito=boca
```

En el Apps Script, la **segunda pasada** (la de `Palabras_Clave`) descarta cualquier fila cuyo `Ambito` esté relleno y sea distinto del recibido. La primera pasada (coincidencia exacta del nombre de la tarea) no cambia: si el nombre es idéntico, es esa tarea, punto.

Así «lavarme los dientes» (`boca`) deja de emparejar con «ducharse» (`cuerpo`) aunque compartan «lavarme».

`filaDe()` rellena también la columna `Ambito` al guardar tareas nuevas, para que la base siga siendo consistente.

## 5. Qué toca cada archivo

| Archivo | Cambio |
|---|---|
| `src/datos/etiquetas.ts` | **Nuevo.** `Etiqueta`, `REGLAS_ETIQUETA`, `etiquetasDe()`, `INCOMPATIBLES`, `INCOMPATIBLES_LUGAR`, `compatible()`, `Ambito`, `ambitoDe()` |
| `src/datos/motor.ts` | `Pieza`/`Modificador` ganan `etiquetas?: Etiqueta[]`; etiquetar a mano los 21 `MODIFICADORES`; `encaja()` pasa a usar `compatible()` + las 2 reglas estructurales; borrar `FIJO_SITIO`/`reposo` y usar `INCOMPATIBLES_LUGAR`; despriorizar por bloqueo en `conDescartes()` |
| `src/datos/sheet.ts` | `FilaSheet` gana `Ambito`; `buscarEnSheet()` manda `&ambito=`; `filaDe()` rellena la columna |
| Apps Script (fuera del repo) | `COLUMNAS` gana `'Ambito'`; `doGet` lee `e.parameter.ambito` y filtra la segunda pasada |
| Google Sheet | Columna `Ambito` nueva + los 20 valores de la tabla de arriba |
| `scripts/validar-retos.mts` | Barrido nuevo con las 20 filas reales (fixture en el repo) comprobando que ninguna carta generada viola `INCOMPATIBLES` |

## 6. Cómo se comprueba que ha servido

El validador actual (`npm run validar`) solo recorre `banco.ts` y el respaldo: **no prueba nada de lo que viene del Sheet**, que es justo donde han aparecido todos los fallos reales. Parte del trabajo es cerrar ese agujero:

1. Guardar las 20 filas de la Guía Maestra como fixture JSON en el repo (`src/datos/__fixtures__/guia-maestra.json`), para que el test sea offline y determinista.
2. Generar los 15 retos de cada fila, en los 3 niveles, con varias semillas y con cada posible elección de contexto.
3. Fallar si alguna carta combina un par de `INCOMPATIBLES`.
4. Fallar si alguna carta sigue incumpliendo las reglas de `PROHIBIDO` de siempre.

Criterio de hecho: `npx tsc -b`, `npm run lint` y `npm run validar` limpios, y las 3 frases de ejemplo del principio de este documento ya no se pueden generar.

## 7. Lo que esto NO arregla

- **El infinitivo del Sheet.** Las `Acciones_*` siguen escritas en infinitivo y eso rompe «Está hecho cuando…» (`hechoDe()`). Las etiquetas no lo tocan; sigue pendiente reescribir las 20 filas en imperativo.
- **La rareza sutil.** Las etiquetas pillan los choques obvios (quizá el 80-90% de lo que se ve mal). Una frase que es rara aunque técnicamente encaje sigue necesitando criterio humano o un modelo de lenguaje.
