import type { Categoria } from '../components/Icono/iconos'
import type { TipoReto } from '../components/CartaReto/tipos'

/* ─────────────────────────────────────────────────────────────
   Sistema de Retos Anti-Procrastinación (V2)
   Fuente: «Guía y Reglas Completas del Sistema de Retos V2» (PDF).

   1. Se busca la tarea en las 49 REGLAS (palabras clave → reto base).
   2. Si no hay regla, se usa una PLANTILLA genérica según el verbo.
   3. El reto base se dice con el tono de cada carta (FRASES, sistema propio con
      pautas de comunicación accesible; ver docs/comunicacion.md).

   Las 5 cartas de la app (Figma) usan estos gatillos del PDF:
     Novedad → Novedad · Desafío → Desafío · Pasión → Motivación
     Interés → Directo · Urgencia → Urgencia
   El gatillo «Amable» se sustituye por los pasos numerados y el criterio de éxito («Está hecho cuando…»).

   Protocolo de expansión (5.2 del PDF): para una tarea que cae en la
   plantilla genérica, añade aquí una regla con sus palabras clave,
   una categoría breve y la menor acción posible (sin tiempos).
   ───────────────────────────────────────────────────────────── */

export type Gatillo = 'motivacion' | 'novedad' | 'urgencia' | 'desafio' | 'directo'

export const GATILLO_DE_CARTA: Record<TipoReto, Gatillo> = {
  novedad: 'novedad',
  desafio: 'desafio',
  pasion: 'motivacion',
  interes: 'directo',
  urgencia: 'urgencia',
}

export type Regla = {
  /** Palabras clave (sin tildes da igual: se normalizan). */
  palabras: string[]
  /** Categoría del PDF («Comunicación», «Ver serie»…), se ve en la carta. */
  categoria: string
  /** Icono de la app que se usa para esa categoría. */
  icono: Categoria
  /** Reto base: la mínima acción viable. */
  base: string
  /** Criterio de éxito explícito: se lee «Está hecho cuando …». Algo que se pueda ver o comprobar. */
  hecho: string
}

const r = (palabras: string, categoria: string, icono: Categoria, base: string, hecho: string): Regla => ({
  palabras: palabras.split(',').map((p) => p.trim()),
  categoria,
  icono,
  base,
  hecho,
})

export const REGLAS: Regla[] = [
  // 2.1 Trabajo, Administración y Estudio
  r('email, correo, responder, escribir a', 'Comunicación', 'trabajo', 'Abre el correo y escribe solo el saludo', 'el saludo está escrito en el correo'),
  r('declaración, impuestos, hacienda, papeleo', 'Administrativo', 'trabajo', 'Abre la web o el documento y mira la primera casilla', 'tienes el documento abierto y has leído la primera casilla'),
  r('estudiar, leer, apuntes, examen', 'Académico', 'estudios', 'Abre el libro o apunte y lee solo el primer párrafo', 'has leído el primer párrafo'),
  r('llamar, teléfono, cita, dentista', 'Llamadas', 'llamadas', 'Busca el número y tenlo listo para marcar', 'tienes el número en la pantalla, listo para llamar'),
  r('decidir, elegir, escoger', 'Decisión', 'trabajo', 'Escribe las 2 opciones en un papel', 'las 2 opciones están escritas en el papel'),
  r('creativo, escribir, diseñar, dibujar', 'Creativo', 'estudios', 'Abre el documento y escribe una frase', 'hay una frase escrita en el documento'),
  r('ordenador, portátil, archivo, carpeta', 'Digital', 'trabajo', 'Abre la carpeta y mira el primer archivo', 'has abierto el primer archivo de la carpeta'),

  // 2.2 Tareas del Hogar y Vida Cotidiana
  r('limpiar, ordenar, recoger, fregar', 'Doméstico', 'limpieza', 'Recoge solo 3 cosas de la mesa', 'hay 3 cosas menos encima de la mesa'),
  r('comprar, tienda, supermercado, compra', 'Compra', 'alimentacion', 'Escribe la lista de 3 cosas que necesitas', 'la lista tiene 3 cosas apuntadas'),
  r('cocinar, comida, cena, receta', 'Cocina', 'alimentacion', 'Abre la nevera y saca un ingrediente', 'hay un ingrediente fuera de la nevera'),
  r('ropa, lavar, tender, planchar', 'Ropa', 'casa', 'Coge una prenda y llévala al sitio', 'una prenda está en su sitio'),

  // 2.3 Ocio y Entretenimiento
  r('serie, ver serie, netflix, capítulo, temporada', 'Ver serie', 'autocuidado', 'Pon el capítulo y mira solo la intro', 'has visto la intro del capítulo'),
  r('película, cine, ver peli, film', 'Ver película', 'autocuidado', 'Abre la plataforma y elige una peli', 'has elegido una película'),
  r('leer, libro, novela, kindle', 'Lectura', 'autocuidado', 'Abre el libro y lee solo una página', 'has leído una página'),
  r('jugar, videojuego, consola, partida', 'Videojuego', 'autocuidado', 'Abre el juego y haz solo una partida corta', 'has jugado una partida corta'),
  r('música, escuchar, playlist, disco', 'Música', 'autocuidado', 'Pon una canción que te guste', 'está sonando una canción que te gusta'),
  r('podcast, escuchar podcast', 'Podcast', 'autocuidado', 'Pon el podcast y escucha un poco', 'el podcast está sonando'),
  r('youtube, vídeo, tutorial', 'Vídeo', 'autocuidado', 'Busca el vídeo y dale al play', 'el vídeo se está reproduciendo'),

  // 2.4 Deporte y Movimiento
  r('ejercicio, entrenar, gimnasio, pesas', 'Gimnasio', 'deporte', 'Ponte la ropa de deporte', 'llevas puesta la ropa de deporte'),
  r('correr, running, salir a correr', 'Correr', 'deporte', 'Ponte las zapatillas y sal a la puerta', 'llevas las zapatillas puestas y estás en la puerta'),
  r('caminar, andar, paseo', 'Caminar', 'deporte', 'Ponte los zapatos y sal a la calle', 'llevas los zapatos puestos y estás en la calle'),
  r('yoga, estiramientos, flexibilidad', 'Yoga', 'deporte', 'Extiende la esterilla y haz una postura', 'la esterilla está extendida y has hecho una postura'),
  r('bici, bicicleta, ciclismo', 'Bici', 'deporte', 'Saca la bici y pon el casco', 'la bici está fuera y llevas el casco puesto'),
  r('nadar, piscina, natación', 'Natación', 'deporte', 'Prepara el bañador y la toalla', 'el bañador y la toalla están en la bolsa'),
  r('bailar, baile, coreografía', 'Baile', 'deporte', 'Pon una canción y muévete', 'has bailado una canción'),
  r('escalada, boulder, rocódromo', 'Escalada', 'deporte', 'Prepara el material y ve al rocódromo', 'el material está en la bolsa y sales hacia el rocódromo'),
  r('fútbol, baloncesto, deporte de equipo', 'Deporte en equipo', 'deporte', 'Coge la equipación y confirma la hora', 'la equipación está preparada y sabes a qué hora es'),

  // 2.5 Vida Social
  r('quedar, quedar con amigos, plan, salir', 'Quedar con amigos', 'social', 'Escribe un mensaje y propón un día', 'has enviado un mensaje con un día propuesto'),
  r('llamar a un amigo, hablar con, llamada', 'Llamada social', 'social', 'Busca el contacto y mándale un mensaje', 'has enviado un mensaje a esa persona'),
  r('cumpleaños, felicitar, regalo', 'Cumpleaños', 'social', 'Escribe el mensaje de felicitación', 'el mensaje de felicitación está enviado'),
  r('fiesta, celebración, evento social', 'Fiesta', 'social', 'Confirma asistencia o prepara lo que llevar', 'has confirmado que vas o tienes preparado lo que vas a llevar'),
  r('familia, visita, comida familiar', 'Familia', 'social', 'Llama o escribe para confirmar el plan', 'has llamado o escrito para confirmar el plan'),
  r('cita, quedar con alguien, plan romántico', 'Cita', 'social', 'Escribe un mensaje y propón hora y sitio', 'has enviado un mensaje con hora y sitio'),
  r('grupo, chat, whatsapp de amigos', 'Chat de grupo', 'social', 'Lee los últimos mensajes y responde uno', 'has respondido a un mensaje del grupo'),

  // 2.6 Hobbies y Creatividad
  r('dibujar, pintar, ilustrar, boceto', 'Dibujo', 'autocuidado', 'Coge papel y lápiz y haz una línea', 'hay una línea dibujada en el papel'),
  r('escribir, escribir algo, relato, diario', 'Escritura', 'autocuidado', 'Abre el documento y escribe una frase', 'hay una frase escrita en el documento'),
  r('fotografía, foto, cámara, editar fotos', 'Fotografía', 'autocuidado', 'Coge la cámara o el móvil y haz una foto', 'has hecho una foto'),
  r('cocinar, receta nueva, postre', 'Cocina creativa', 'alimentacion', 'Saca los ingredientes y prepara uno', 'un ingrediente está lavado, cortado o medido'),
  r('manualidades, coser, tejer, bricolaje', 'Manualidades', 'casa', 'Prepara el material y empieza una pieza', 'el material está en la mesa y has empezado una pieza'),
  r('tocar instrumento, guitarra, piano, practicar', 'Instrumento', 'autocuidado', 'Coge el instrumento y toca una escala', 'has tocado una escala'),
  r('jardín, plantas, huerto, regar', 'Jardín', 'casa', 'Riega una planta o retira una hoja seca', 'has regado una planta o quitado una hoja seca'),
  r('meditar, mindfulness, respirar', 'Meditación', 'autocuidado', 'Siéntate y respira', 'has hecho 3 respiraciones lentas'),

  // 2.7 Descanso y Autocuidado
  r('dormir, siesta, descansar, acostarme', 'Descanso', 'autocuidado', 'Prepara la cama y apaga pantallas', 'la cama está abierta y las pantallas apagadas'),
  r('ducha, baño, aseo', 'Aseo', 'autocuidado', 'Ve al baño y abre el grifo', 'estás en el baño con el grifo abierto'),
  r('skincare, crema, rutina facial', 'Skincare', 'autocuidado', 'Aplica un solo producto', 'te has puesto un producto'),
  r('desayuno, comer, cena, alimentarme', 'Comida', 'alimentacion', 'Prepara algo simple y siéntate a comer', 'tienes algo de comer en la mesa y has empezado'),
  r('agua, beber, hidratarme', 'Hidratación', 'autocuidado', 'Bebe un vaso de agua', 'el vaso de agua está vacío'),
  r('desconectar, parar, no hacer nada', 'Desconexión', 'autocuidado', 'Siéntate y tómate un momento', 'has pasado un momento sin pantallas ni tareas'),

  // Ampliación (protocolo 5.2): la app tiene categoría «Mascotas»
  r('perro, gato, mascota, veterinario, pasear al perro, sacar al perro', 'Mascotas', 'mascotas', 'Coge la correa y acércate a la puerta', 'tienes la correa en la mano y estás en la puerta'),
]

/* ── 3. Plantillas de acción genéricas (respaldo) ───────────── */

type Plantilla = { verbos: string[]; base: (objeto: string) => string; hecho: (objeto: string) => string }

const PLANTILLAS: Plantilla[] = [
  { verbos: ['abrir'], base: (o) => `Abre ${o} y mira lo primero que veas`, hecho: (o) => `has abierto ${o}` },
  { verbos: ['escribir', 'redactar'], base: (o) => `Escribe solo la primera frase de ${o}`, hecho: () => 'la primera frase está escrita' },
  { verbos: ['buscar', 'encontrar'], base: (o) => `Busca ${o} y tenlo delante`, hecho: (o) => `has encontrado ${o}` },
  { verbos: ['elegir', 'decidir', 'escoger'], base: (o) => `Escribe 2 opciones de ${o}`, hecho: () => 'tienes 2 opciones escritas' },
  { verbos: ['preparar', 'organizar', 'planificar'], base: (o) => `Prepara lo mínimo para ${o}`, hecho: () => 'tienes lo mínimo preparado' },
  { verbos: ['mover', 'llevar', 'colocar', 'cambiar'], base: (o) => `Mueve una cosa relacionada con ${o}`, hecho: () => 'has movido una cosa' },
  { verbos: ['llamar', 'telefonear'], base: () => 'Busca el número y prepárate para llamar', hecho: () => 'tienes el número en la pantalla, listo para llamar' },
  { verbos: ['leer', 'revisar', 'repasar'], base: (o) => `Lee solo el primer párrafo de ${o}`, hecho: () => 'has leído el primer párrafo' },
]

export const RETO_GENERICO = 'Haz la parte más pequeña de esta tarea'
const HECHO_GENERICO = 'has hecho una parte de la tarea, aunque sea pequeña'

/* ── 4. Cómo se dice cada reto (sistema de comunicación propio) ──
   Sustituye a la matriz de tonos del PDF. Sigue las pautas de comunicación
   para personas neurodivergentes (ver docs/comunicacion.md):
   - Lenguaje claro y literal: sin metáforas, ironías ni frases hechas.
   - Instrucciones concretas: la acción va siempre primero y entera.
   - El «Primer paso» se divide en pasos numerados.
   - Sin tiempos vagos («luego», «cuando puedas») ni preguntas que presionen.
   - Misma estructura en todas las tareas: cada carta dice siempre lo mismo
     alrededor de la acción, para que sea predecible.
   - Sin emojis y sin género gramatical para la persona. */

const minuscula = (s: string) => s.charAt(0).toLowerCase() + s.slice(1)
const mayuscula = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
const sinPunto = (s: string) => s.trim().replace(/[.!?]+$/, '')

const FRASES: Record<Gatillo, (accion: string) => string> = {
  // Novedad: una forma distinta, dicha de forma concreta
  novedad: (A) => `${A}. Puedes hacerlo en un sitio distinto al de siempre.`,
  // Desafío: un objetivo claro
  desafio: (A) => `Objetivo: ${minuscula(A)}.`,
  // Pasión → Motivación: qué consigues, sin promesas vagas
  motivacion: (A) => `${A}. Al hacerlo, ya habrás empezado la tarea.`,
  // Interés → Directo: solo la acción
  directo: (A) => `${A}.`,
  // Urgencia: cuándo, en concreto
  urgencia: (A) => `${A}. Hazlo ahora, antes de empezar otra cosa.`,
}

/* Verbos con los que empieza un paso dentro de un reto base («Abre el correo y escribe…»). */
const VERBOS_PASO =
  /^(abre|escribe|lee|busca|tenlo|tenla|recoge|saca|coge|ll[eé]vala|ll[eé]valo|pon|ponte|mira|elige|haz|sal|extiende|prepara|ve|confirma|prop[oó]n|m[aá]ndale|responde|toca|riega|retira|si[eé]ntate|respira|apaga|aplica|bebe|llama|dale|mu[eé]vete|empieza|ac[eé]rcate|t[oó]mate|prep[aá]rate)\b/i

/** «Abre el correo y escribe solo el saludo» → ["Abre el correo", "Escribe solo el saludo"]. */
export function pasosDe(base: string): string[] {
  const partes = sinPunto(base).split(/\s+y\s+/)
  const pasos: string[] = []
  for (const parte of partes) {
    if (pasos.length && VERBOS_PASO.test(parte)) pasos.push(mayuscula(parte))
    else if (pasos.length) pasos[pasos.length - 1] += ` y ${parte}`
    else pasos.push(mayuscula(parte))
  }
  return pasos
}

export function tono(base: string, gatillo: Gatillo) {
  return FRASES[gatillo](mayuscula(sinPunto(base)))
}

/* ── 5. Lógica de ejecución ─────────────────────────────────── */

const normalizar = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9ñ\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const contiene = (texto: string, palabra: string) => ` ${texto} `.includes(` ${palabra}`)

export type Resultado = {
  regla: Regla | null
  categoria: string
  icono: Categoria | null
  base: string
  /** Criterio de éxito: «Está hecho cuando …» */
  hecho: string
}

/* Palabras que salen en más de una regla («escuchar», «dibujar», «leer»…): cuentan la mitad,
   porque por sí solas no dicen de qué tarea se trata. */
const COMPARTIDAS = (() => {
  const reglasPorPalabra = new Map<string, Set<number>>()
  REGLAS.forEach((regla, i) =>
    regla.palabras.forEach((p) =>
      normalizar(p)
        .split(' ')
        .forEach((palabra) => reglasPorPalabra.set(palabra, (reglasPorPalabra.get(palabra) ?? new Set()).add(i))),
    ),
  )
  return new Set([...reglasPorPalabra].filter(([, reglas]) => reglas.size > 1).map(([palabra]) => palabra))
})()

/** Busca la regla más específica: la que suma más letras de palabras clave encontradas
    («dibujar un boceto» → Dibujo, porque coincide con «dibujar» y «boceto»).
    Si empatan, gana la que va antes en la lista. */
export function analizarTarea(tarea: string): Resultado {
  const texto = normalizar(tarea)
  let mejor: { regla: Regla; largo: number } | null = null
  for (const regla of REGLAS) {
    const largo = regla.palabras
      .map(normalizar)
      .filter((clave) => clave && contiene(texto, clave))
      .reduce((suma, clave) => suma + (COMPARTIDAS.has(clave) ? clave.length / 2 : clave.length), 0)
    if (largo > 0 && (!mejor || largo > mejor.largo)) mejor = { regla, largo }
  }
  if (mejor) return { regla: mejor.regla, categoria: mejor.regla.categoria, icono: mejor.regla.icono, base: mejor.regla.base, hecho: mejor.regla.hecho }

  // Sin regla: plantilla genérica según el verbo inicial («buscar piso» → «Busca piso y tenlo delante»)
  const [verbo, ...resto] = tarea.trim().split(/\s+/)
  const objeto = minuscula(resto.join(' ').replace(/\.$/, '')) || 'la tarea'
  const plantilla = PLANTILLAS.find((p) => p.verbos.includes(normalizar(verbo ?? '')))
  return {
    regla: null,
    categoria: 'Tarea',
    icono: null,
    base: plantilla ? plantilla.base(objeto) : RETO_GENERICO,
    hecho: plantilla ? plantilla.hecho(objeto) : HECHO_GENERICO,
  }
}
