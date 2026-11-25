/* Etiquetas semánticas: qué exige o implica cada núcleo o modificador, para que el motor
   descarte combinaciones que no tienen sentido aunque encajen por texto («Lavarse el pelo
   con una persona de confianza al lado», «Friega un plato desde otro sitio de la casa»).
   Ver docs/spec-etiquetas.md para el porqué completo. */

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
  // estructura (ya existían como casos especiales en motor.ts)
  | 'unidad' | 'con-objeto'
  // exclusivas de modificadores
  | 'cambia-sitio' | 'quieto' | 'sin-movil' | 'social' | 'bebida'

/* Diccionario de raíces: usa infinitivo e imperativo a la vez (lava/lavar, frieg/fregar…)
   porque el Sheet escribe sus Acciones_* en infinitivo y el resto del motor en imperativo;
   ambos tienen que etiquetarse igual. */
const REGLAS_ETIQUETA: [RegExp, Etiqueta[]][] = [
  [/\b(grifo|agua|ducha\w*|duchar\w*|enjuag\w+|moja\w+|lava\w*|frieg\w+|fregar|aclara\w*|bañ\w+)\b/, ['agua']],
  [/\b(basura|grasa|mancha\w*|polvo|suciedad|arenero|cacharro\w*|estropajo)\b/, ['sucio']],
  [/\b(grifo|fregadero|encimera|horno|nevera|lavadora|microondas|ducha|bañera|lavabo|tendedero|armario|dep[oó]sito)\b/, ['anclado']],
  [/\b(barr\w+|aspir\w+|tiend\w+|tender|cocin\w+|camin\w+|pase\w+|sube|baja|^sal\b|ve a|ac[eé]rcate)\b/, ['de-pie']],
  [/\b(calle|portal|parque|manzana|acera|supermercado|tienda|gimnasio|roc[oó]dromo)\b/, ['fuera', 'de-pie']],
  [/\b(coge|toca|sujeta|agarra|prepara|junta|saca|llena|vac[ií]a|dobla|monta|enrosca|aprieta)\b/, ['manos']],
  [/\b(en voz alta|llama|telefon\w+|pregunta|cu[eé]ntale|habla)\b/, ['voz']],
  [/\b(m[oó]vil|app|pantalla|web|ordenador|port[aá]til|correo|email|documento|pdf|online|enlace|bandeja)\b/, ['digital']],
  [/\bm[oó]vil\b/, ['movil']],
  [/\b(llama|llamada|tel[eé]fono|examen|test|estudi\w+|^lee\b|^leer\b|concentr\w+|grab\w+)\b/, ['silencio']],
  [/\b(m[uú]sica|canci[oó]n|podcast|v[ií]deo|altavoz|televisi[oó]n|playlist)\b/, ['ruido']],
  [/\b(ducha\w*|duchar\w*|bañar\w*|desnud\w*|pelo|cuerpo|dientes|afeit\w+|depil\w+|baño|aseo|pijama|toalla)\b/, ['intimo']],
]

const quitarTildes = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

/** Las etiquetas que se deducen del propio texto de un núcleo (dinámico: Sheet, webless, banco). */
export function etiquetasDe(texto: string): Etiqueta[] {
  const t = quitarTildes(texto)
  const vistas = new Set<Etiqueta>()
  for (const [re, etiquetas] of REGLAS_ETIQUETA) if (re.test(t)) etiquetas.forEach((e) => vistas.add(e))
  return [...vistas]
}

/** [etiqueta del núcleo, etiqueta del modificador] que NO pueden ir juntas en la misma carta. */
export const INCOMPATIBLES: [Etiqueta, Etiqueta][] = [
  ['intimo', 'social'], // «Lavarse el pelo con una persona de confianza al lado»
  ['anclado', 'cambia-sitio'], // «Friega un plato desde otro sitio de la casa»
  ['digital', 'sin-movil'], // «Busca en el móvil… sin mirar el móvil ni una vez»
  ['movil', 'sin-movil'],
  ['fuera', 'cambia-sitio'], // «Camina hasta la esquina junto a una ventana»
  ['fuera', 'social'], // «con alguien de casa cerca» no pega en la calle
  ['silencio', 'ruido'], // «Llama al dentista con tu música favorita de fondo»
  ['silencio', 'voz'],
  ['agua', 'bebida'], // «Métete bajo el agua con tu bebida favorita al lado»
  ['de-pie', 'quieto'], // «Barre la cocina sin moverte de donde estás»
  ['anclado', 'quieto'],
]

/** Si un núcleo (por su texto) y un modificador (por sus etiquetas) encajan de verdad. */
export function compatible(nucleoTexto: string, etiquetasModificador: Etiqueta[] | undefined): boolean {
  if (!etiquetasModificador?.length) return true
  const etiquetasNucleo = etiquetasDe(nucleoTexto)
  return !INCOMPATIBLES.some(([en, em]) => etiquetasNucleo.includes(en) && etiquetasModificador.includes(em))
}

/** Si la persona dijo dónde está, qué etiquetas de núcleo quedan descartadas (sustituye al
    antiguo FIJO_SITIO + reposo de motor.ts, que solo miraba palabras de cocina). */
export const INCOMPATIBLES_LUGAR: Record<string, Etiqueta[]> = {
  cama: ['de-pie', 'anclado', 'fuera'],
  sofa: ['de-pie', 'anclado', 'fuera'],
}

/** Núcleos (por texto) que no chocan con el lugar elegido; si ninguno queda, se devuelven todos
    (mejor un núcleo algo forzado que una lista vacía que reviente el mazo). */
export function sinEtiquetasDeLugar(nucleos: string[], lugar: string | undefined): string[] {
  const clave = lugar && Object.keys(INCOMPATIBLES_LUGAR).find((k) => lugar.includes(k))
  if (!clave) return nucleos
  const prohibidas = INCOMPATIBLES_LUGAR[clave]
  const filtrados = nucleos.filter((n) => !etiquetasDe(n).some((e) => prohibidas.includes(e)))
  return filtrados.length ? filtrados : nucleos
}

/* ── Ámbito: de qué «zona» va la tarea, para no confundir tareas que comparten una palabra
   («lavarme los dientes» y «ducharse» comparten «lavarme» pero son ámbitos distintos). ─── */
export type Ambito =
  | 'boca' | 'cuerpo' | 'pelo' | 'deporte' | 'cocina' | 'ropa' | 'casa'
  | 'pantalla' | 'papeleo' | 'calle' | 'compra' | 'mascota' | 'estudio'
  | 'creativo' | 'ocio' | 'descanso'

const REGLAS_AMBITO: [RegExp, Ambito][] = [
  [/\b(diente|dientes|cepillo de dientes|pasta de dientes|muela|encía)\b/, 'boca'],
  [/\b(pelo|cabello|champ[uú]|peinar|secador)\b/, 'pelo'],
  [/\b(ducha\w*|duchar\w*|bañar\w*|aseo|higiene|afeit\w+|depil\w+|cuerpo|piel)\b/, 'cuerpo'],
  [/\b(ejercicio|entrena\w+|gimnasio|yoga|correr|estira\w+|pesas|deporte)\b/, 'deporte'],
  [/\b(cocina\w*|fregar|platos|cafetera|sart[eé]n|horno|nevera|comida|cenar|desayun\w+|almuerzo)\b/, 'cocina'],
  [/\b(ropa|lavadora|colada|tender|planchar|doblar|armario de ropa)\b/, 'ropa'],
  [/\b(habitaci[oó]n|cuarto|casa|orden\w*|recoger|limpiar(?! la boca)|polvo)\b/, 'casa'],
  [/\b(m[oó]vil|ordenador|email|correo|app|web|online|pantalla)\b/, 'pantalla'],
  [/\b(cita|tr[aá]mite|papeleo|formulario|declaraci[oó]n|dni|documento oficial)\b/, 'papeleo'],
  [/\b(calle|paseo|pasear|caminar|salir a)\b/, 'calle'],
  [/\b(comprar|compra|supermercado|lista de la compra)\b/, 'compra'],
  [/\b(perro|gato|mascota|veterinari\w+)\b/, 'mascota'],
  [/\b(estudi\w+|examen|test|leer|lectura|apuntes|libro)\b/, 'estudio'],
  [/\b(escribir|dibuj\w+|pintar|proyecto|instrumento|guitarra|piano|manualidad\w*)\b/, 'creativo'],
  [/\b(serie|pel[ií]cula|netflix|ver un|jugar|videojuego)\b/, 'ocio'],
  [/\b(descansar|dormir|siesta|desconectar|hidratarme|beber agua)\b/, 'descanso'],
]

/** Ámbito de una tarea escrita (heurístico, puede no acertar: se usa como filtro adicional,
    nunca como único criterio de búsqueda). */
export function ambitoDe(texto: string): Ambito | undefined {
  const t = quitarTildes(texto)
  return REGLAS_AMBITO.find(([re]) => re.test(t))?.[1]
}
