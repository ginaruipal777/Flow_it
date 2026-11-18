import type { Categoria } from '../components/Icono/iconos'
import type { TipoReto } from '../components/CartaReto/tipos'
import { BANCO, HECHO_POR_NIVEL, MODIFICADORES, type Acciones, type Nivel } from './banco.ts'

/* ─────────────────────────────────────────────────────────────
   Sistema de Retos Anti-Procrastinación
   Fuentes: «Guía y Reglas Completas del Sistema de Retos V2» (PDF) +
   «Regla de oro: la ley del esfuerzo inverso» + «Matriz de combinación».

   1. Se busca la tarea en las REGLAS (palabras clave → categoría).
   2. El nivel de esfuerzo elige la acción del BANCO de esa categoría (banco.ts):
      cuanto más pesa la tarea, más pequeña es la acción.
   3. Cada carta INCUP añade su modificador (MODIFICADORES) y su entradilla.
   4. Si no hay regla, se usa el RESPALDO con el texto de la tarea.

   Protocolo de expansión: para una tarea que cae en el respaldo, añade aquí una
   regla con sus palabras clave y en banco.ts sus 3 acciones por nivel.
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
  r('perro, pasear al perro, sacar al perro', 'Pasear al perro', 'mascotas', 'Coge la correa y acércate a la puerta', 'tienes la correa en la mano y estás en la puerta'),
  r('veterinario, vacuna, revisión', 'Veterinario', 'mascotas', 'Busca el teléfono del veterinario y tenlo listo', 'tienes el número en la pantalla, listo para llamar'),
  r('gato, mascota, cuidar a mi mascota', 'Mascotas', 'mascotas', 'Llena el cuenco de agua de tu mascota', 'el cuenco de agua está lleno'),
]

/* ── 3. Respaldo: tareas sin regla ──────────────────────────────
   Si ninguna palabra clave encaja, los retos usan el texto de la tarea entre comillas.
   Mismas reglas que el banco: verbo físico primero, una sola acción, sin tiempos. */

export const RESPALDO = (t: string): Acciones => ({
  pesado: [`Escribe «${t}» en un papel`, `Lee en voz alta «${t}»`, `Toca lo primero que vas a usar para «${t}»`],
  medio: [`Pon en la mesa lo que vas a usar para «${t}»`, `Abre lo que vas a usar para «${t}»`, `Haz el primer movimiento de «${t}»`],
  ligero: [`Haz la primera parte de «${t}»`, `Avanza un poco en «${t}»`, `Haz la parte más pequeña de «${t}»`],
})

/* ── 4. Cómo se dice cada reto ───────────────────────────────────
   Pautas para personas neurodivergentes (docs/comunicacion.md) + «Ley del esfuerzo inverso»:
   - La acción va primero, empieza por un verbo físico y es UNA sola (sin «y», «o», «luego»).
   - Sin tiempos ni prisas, sin la palabra «tarea», sin imperativos agresivos.
   - El tono atrevido va SOLO en la entradilla de la carta («¡Plan nuevo!», «Mini reto»…).
   - Si hay pregunta, es una invitación («¿Te apuntas?»), nunca un juicio.
   - Nivel Pesado: la acción empieza por «Solo…». */

const minuscula = (s: string) => s.charAt(0).toLowerCase() + s.slice(1)
const mayuscula = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
const sinPunto = (s: string) => s.trim().replace(/[.!?]+$/, '')

export const ENTRADILLA: Record<TipoReto, (accion: string) => string> = {
  novedad: (A) => `¡Plan nuevo! ${A}.`,
  desafio: (A) => `Mini reto: ${minuscula(A)}. ¿Te apuntas?`,
  pasion: (A) => `Modo disfrute: ${minuscula(A)}.`,
  interes: (A) => `Hazlo interesante: ${minuscula(A)}.`,
  urgencia: (A) => `Ahora: ${minuscula(A)}.`,
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
  /** Acciones de la categoría por nivel (o el respaldo con el texto de la tarea) */
  acciones: Acciones
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
  if (mejor) {
    const { regla } = mejor
    return { regla, categoria: regla.categoria, icono: regla.icono, acciones: BANCO[regla.categoria] }
  }
  return { regla: null, categoria: 'Tarea', icono: null, acciones: RESPALDO(minuscula(sinPunto(tarea)) || 'esto') }
}

/* ── 6. Matriz de combinación ──────────────────────────────────
   Reto = acción del banco (según el nivel de esfuerzo) + modificador INCUP de la carta.
   - El NIVEL decide la acción: Ligero (1–3 min), Medio (30–60 s), Pesado (5–10 s, «Solo…»).
   - La CARTA decide el modificador: Novedad cambia el método, Desafío pone un reto sin reloj,
     Pasión añade algo que gusta, Interés añade a alguien o un detalle, Urgencia un micro-límite.
   - Cada mazo rota acciones y modificadores, así ninguna combinación se repite en la misma tarea.
   - Si el modificador repite una palabra de la acción («Coge el móvil, sin mirar el móvil»),
     se salta al siguiente. */

export type RetoCarta = { tipo: TipoReto; titulo: string; pasos: string[]; hecho: string }

export const ORDEN: TipoReto[] = ['novedad', 'desafio', 'pasion', 'interes', 'urgencia']

/** Mazos de 5 cartas que se pueden repartir para la misma tarea sin repetir combinación */
export const NUM_MAZOS = 6

const raices = (s: string) =>
  new Set(
    normalizar(s)
      .split(' ')
      .filter((p) => p.length > 4),
  )

/** Modificador de la carta para este mazo, saltando los que chocan con la acción */
export function modificadorDe(tipo: TipoReto, mazo: number, accion: string, nivel: Nivel): string {
  const enAccion = raices(accion)
  const todos = MODIFICADORES[nivel === 'pesado' ? 'pesado' : 'normal'][tipo]
  const validos = todos.filter((mod) => ![...raices(mod)].some((p) => enAccion.has(p)))
  const lista = validos.length > 1 ? validos : todos
  // Cada 3 mazos la acción vuelve a salir: el modificador avanza uno más para no repetir pareja
  return lista[((mazo % 3) + Math.floor(mazo / 3)) % lista.length]
}

/** Frase completa de la acción con su modificador: «Solo abre el correo, en silencio» */
export function accionConModificador(accion: string, mod: string, nivel: Nivel) {
  const A = sinPunto(accion)
  return `${nivel === 'pesado' ? `Solo ${minuscula(A)}` : mayuscula(A)}, ${mod}`
}

export function retosDe(tarea: string, esfuerzo: Nivel = 'medio', mazo = 0): RetoCarta[] {
  const { acciones } = analizarTarea(tarea)
  const lista = acciones[esfuerzo]
  return ORDEN.map((tipo, k) => {
    const accion = lista[(mazo + k) % lista.length]
    const mod = modificadorDe(tipo, mazo, accion, esfuerzo)
    const frase = accionConModificador(accion, mod, esfuerzo)
    return { tipo, titulo: ENTRADILLA[tipo](frase), pasos: [frase], hecho: HECHO_POR_NIVEL[esfuerzo] }
  })
}
