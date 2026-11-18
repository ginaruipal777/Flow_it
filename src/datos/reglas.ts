import type { Categoria } from '../components/Icono/iconos'
import type { TipoReto } from '../components/CartaReto/tipos'

/* ─────────────────────────────────────────────────────────────
   Sistema de Retos Anti-Procrastinación (V2)
   Fuente: «Guía y Reglas Completas del Sistema de Retos V2» (PDF).

   1. Se busca la tarea en las 49 REGLAS (palabras clave → reto base).
   2. Si no hay regla, se usa una PLANTILLA genérica según el verbo.
   3. El reto base se dice con el tono de cada carta (FRASES, sistema propio:
      la matriz de tonos del PDF se sustituyó porque sonaba forzada).

   Las 5 cartas de la app (Figma) usan estos gatillos del PDF:
     Novedad → Novedad · Desafío → Desafío · Pasión → Motivación
     Interés → Directo · Urgencia → Urgencia
   El gatillo «Amable» se usa como «Primer paso» del reto.

   Protocolo de expansión (5.2 del PDF): para una tarea que cae en la
   plantilla genérica, añade aquí una regla con sus palabras clave,
   una categoría breve y la menor acción posible (sin tiempos).
   ───────────────────────────────────────────────────────────── */

export type Gatillo = 'motivacion' | 'novedad' | 'urgencia' | 'desafio' | 'directo' | 'amable'

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
}

const r = (palabras: string, categoria: string, icono: Categoria, base: string): Regla => ({
  palabras: palabras.split(',').map((p) => p.trim()),
  categoria,
  icono,
  base,
})

export const REGLAS: Regla[] = [
  // 2.1 Trabajo, Administración y Estudio
  r('email, correo, responder, escribir a', 'Comunicación', 'trabajo', 'Abre el correo y escribe solo el saludo'),
  r('declaración, impuestos, hacienda, papeleo', 'Administrativo', 'trabajo', 'Abre la web o el documento y mira la primera casilla'),
  r('estudiar, leer, apuntes, examen', 'Académico', 'estudios', 'Abre el libro o apunte y lee solo el primer párrafo'),
  r('llamar, teléfono, cita, dentista', 'Llamadas', 'llamadas', 'Busca el número y tenlo listo para marcar'),
  r('decidir, elegir, escoger', 'Decisión', 'trabajo', 'Escribe las 2 opciones en un papel'),
  r('creativo, escribir, diseñar, dibujar', 'Creativo', 'estudios', 'Abre el documento y escribe una frase'),
  r('ordenador, portátil, archivo, carpeta', 'Digital', 'trabajo', 'Abre la carpeta y mira el primer archivo'),

  // 2.2 Tareas del Hogar y Vida Cotidiana
  r('limpiar, ordenar, recoger, fregar', 'Doméstico', 'limpieza', 'Recoge solo 3 cosas de la mesa'),
  r('comprar, tienda, supermercado, compra', 'Compra', 'alimentacion', 'Escribe la lista de 3 cosas que necesitas'),
  r('cocinar, comida, cena, receta', 'Cocina', 'alimentacion', 'Abre la nevera y saca un ingrediente'),
  r('ropa, lavar, tender, planchar', 'Ropa', 'casa', 'Coge una prenda y llévala al sitio'),

  // 2.3 Ocio y Entretenimiento
  r('serie, ver serie, netflix, capítulo, temporada', 'Ver serie', 'autocuidado', 'Pon el capítulo y mira solo la intro'),
  r('película, cine, ver peli, film', 'Ver película', 'autocuidado', 'Abre la plataforma y elige una peli'),
  r('leer, libro, novela, kindle', 'Lectura', 'autocuidado', 'Abre el libro y lee solo una página'),
  r('jugar, videojuego, consola, partida', 'Videojuego', 'autocuidado', 'Abre el juego y haz solo una partida corta'),
  r('música, escuchar, playlist, disco', 'Música', 'autocuidado', 'Pon una canción que te guste'),
  r('podcast, escuchar podcast', 'Podcast', 'autocuidado', 'Pon el podcast y escucha un poco'),
  r('youtube, vídeo, tutorial', 'Vídeo', 'autocuidado', 'Busca el vídeo y dale al play'),

  // 2.4 Deporte y Movimiento
  r('ejercicio, entrenar, gimnasio, pesas', 'Gimnasio', 'deporte', 'Ponte la ropa de deporte'),
  r('correr, running, salir a correr', 'Correr', 'deporte', 'Ponte las zapatillas y sal a la puerta'),
  r('caminar, andar, paseo', 'Caminar', 'deporte', 'Ponte los zapatos y sal a la calle'),
  r('yoga, estiramientos, flexibilidad', 'Yoga', 'deporte', 'Extiende la esterilla y haz una postura'),
  r('bici, bicicleta, ciclismo', 'Bici', 'deporte', 'Saca la bici y pon el casco'),
  r('nadar, piscina, natación', 'Natación', 'deporte', 'Prepara el bañador y la toalla'),
  r('bailar, baile, coreografía', 'Baile', 'deporte', 'Pon una canción y muévete'),
  r('escalada, boulder, rocódromo', 'Escalada', 'deporte', 'Prepara el material y ve al rocódromo'),
  r('fútbol, baloncesto, deporte de equipo', 'Deporte en equipo', 'deporte', 'Coge la equipación y confirma la hora'),

  // 2.5 Vida Social
  r('quedar, quedar con amigos, plan, salir', 'Quedar con amigos', 'social', 'Escribe un mensaje y propón un día'),
  r('llamar a un amigo, hablar con, llamada', 'Llamada social', 'social', 'Busca el contacto y mándale un mensaje'),
  r('cumpleaños, felicitar, regalo', 'Cumpleaños', 'social', 'Escribe el mensaje de felicitación'),
  r('fiesta, celebración, evento social', 'Fiesta', 'social', 'Confirma asistencia o prepara lo que llevar'),
  r('familia, visita, comida familiar', 'Familia', 'social', 'Llama o escribe para confirmar el plan'),
  r('cita, quedar con alguien, plan romántico', 'Cita', 'social', 'Escribe un mensaje y propón hora y sitio'),
  r('grupo, chat, whatsapp de amigos', 'Chat de grupo', 'social', 'Lee los últimos mensajes y responde uno'),

  // 2.6 Hobbies y Creatividad
  r('dibujar, pintar, ilustrar, boceto', 'Dibujo', 'autocuidado', 'Coge papel y lápiz y haz una línea'),
  r('escribir, escribir algo, relato, diario', 'Escritura', 'autocuidado', 'Abre el documento y escribe una frase'),
  r('fotografía, foto, cámara, editar fotos', 'Fotografía', 'autocuidado', 'Coge la cámara o el móvil y haz una foto'),
  r('cocinar, receta nueva, postre', 'Cocina creativa', 'alimentacion', 'Saca los ingredientes y prepara uno'),
  r('manualidades, coser, tejer, bricolaje', 'Manualidades', 'casa', 'Prepara el material y empieza una pieza'),
  r('tocar instrumento, guitarra, piano, practicar', 'Instrumento', 'autocuidado', 'Coge el instrumento y toca una escala'),
  r('jardín, plantas, huerto, regar', 'Jardín', 'casa', 'Riega una planta o retira una hoja seca'),
  r('meditar, mindfulness, respirar', 'Meditación', 'autocuidado', 'Siéntate y respira'),

  // 2.7 Descanso y Autocuidado
  r('dormir, siesta, descansar, acostarme', 'Descanso', 'autocuidado', 'Prepara la cama y apaga pantallas'),
  r('ducha, baño, aseo', 'Aseo', 'autocuidado', 'Ve al baño y abre el grifo'),
  r('skincare, crema, rutina facial', 'Skincare', 'autocuidado', 'Aplica un solo producto'),
  r('desayuno, comer, cena, alimentarme', 'Comida', 'alimentacion', 'Prepara algo simple y siéntate a comer'),
  r('agua, beber, hidratarme', 'Hidratación', 'autocuidado', 'Bebe un vaso de agua'),
  r('desconectar, parar, no hacer nada', 'Desconexión', 'autocuidado', 'Siéntate y tómate un momento'),

  // Ampliación (protocolo 5.2): la app tiene categoría «Mascotas»
  r('perro, gato, mascota, veterinario, pasear al perro, sacar al perro', 'Mascotas', 'mascotas', 'Coge la correa y acércate a la puerta'),
]

/* ── 3. Plantillas de acción genéricas (respaldo) ───────────── */

type Plantilla = { verbos: string[]; plantilla: (objeto: string) => string }

const PLANTILLAS: Plantilla[] = [
  { verbos: ['abrir'], plantilla: (o) => `Abre ${o} y mira lo primero que veas` },
  { verbos: ['escribir', 'redactar'], plantilla: (o) => `Escribe solo la primera frase de ${o}` },
  { verbos: ['buscar', 'encontrar'], plantilla: (o) => `Busca ${o} y tenlo delante` },
  { verbos: ['elegir', 'decidir', 'escoger'], plantilla: (o) => `Escribe 2 opciones de ${o}` },
  { verbos: ['preparar', 'organizar', 'planificar'], plantilla: (o) => `Prepara lo mínimo para ${o}` },
  { verbos: ['mover', 'llevar', 'colocar', 'cambiar'], plantilla: (o) => `Mueve una cosa relacionada con ${o}` },
  { verbos: ['llamar', 'telefonear'], plantilla: () => 'Busca el número y prepárate para llamar' },
  { verbos: ['leer', 'revisar', 'repasar'], plantilla: (o) => `Lee solo el primer párrafo de ${o}` },
]

export const RETO_GENERICO = 'Haz la parte más pequeña de esta tarea'

/* ── 4. Cómo se dice cada reto (sistema de comunicación propio) ──
   Sustituye a la matriz de tonos del PDF, que sonaba forzada.
   Reglas de estilo:
   - Tuteo, frases cortas y lenguaje de todos los días.
   - La acción (reto base) siempre se lee entera y clara.
   - Sin emojis, sin «misiones» ni «niveles», sin presión ni culpa.
   - Sin género gramatical para la persona («vas a notar», no «te sentirás ligero/a»).
   Cada gatillo tiene varias frases; se elige una según la tarea para no repetir siempre la misma. */

const minuscula = (s: string) => s.charAt(0).toLowerCase() + s.slice(1)
const sinPunto = (s: string) => s.trim().replace(/[.!?]+$/, '')

type Frase = (accion: string, Accion: string) => string

const FRASES: Record<Gatillo, Frase[]> = {
  // Pasión → Motivación: por qué merece la pena
  motivacion: [
    (_a, A) => `${A}. Luego vas a notar el alivio.`,
    (_a, A) => `${A}. Lo más difícil es empezar, y ya lo tienes.`,
    (_a, A) => `${A}. Con esto ya has arrancado.`,
  ],
  // Novedad: hacerlo distinto
  novedad: [
    (a) => `Hoy, a tu manera: ${a}.`,
    (a) => `Hazlo distinto a lo normal: ${a}.`,
    (a) => `Cambia el chip: ${a}, pero en otro sitio o de otra forma.`,
  ],
  // Urgencia: ahora, sin darle vueltas
  urgencia: [
    (a) => `Ya, sin pensarlo: ${a}.`,
    (a) => `Antes de mirar el móvil: ${a}.`,
    (a) => `Ahora, mientras lees esto: ${a}.`,
  ],
  // Desafío: un reto pequeño y con gracia
  desafio: [
    (a) => `Mini reto: ${a}. ¿Hecho?`,
    (a) => `A ver si puedes: ${a}.`,
    (a) => `Reto rápido: ${a}. ¿Te atreves?`,
  ],
  // Interés → Directo: solo la acción
  directo: [(_a, A) => `${A}. Y listo.`, (_a, A) => `${A}. Ya está.`],
  // Amable: el «Primer paso» del detalle
  amable: [
    (a) => `Tranqui: ${a}. Con eso ya vale.`,
    (a) => `Sin presión: ${a}. Si te apetece seguir, genial.`,
  ],
}

/** Número estable a partir del texto de la tarea, para elegir siempre la misma frase para la misma tarea. */
function semillaDe(texto: string) {
  let h = 0
  for (const c of texto) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return h
}

export function tono(base: string, gatillo: Gatillo, tarea = '') {
  const A = sinPunto(base)
  const opciones = FRASES[gatillo]
  return opciones[semillaDe(tarea + gatillo) % opciones.length](minuscula(A), A)
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
}

/** Busca la regla cuya palabra clave coincide con más letras (la más específica). */
export function analizarTarea(tarea: string): Resultado {
  const texto = normalizar(tarea)
  let mejor: { regla: Regla; largo: number } | null = null
  for (const regla of REGLAS) {
    for (const p of regla.palabras) {
      const clave = normalizar(p)
      if (clave && contiene(texto, clave) && (!mejor || clave.length > mejor.largo)) mejor = { regla, largo: clave.length }
    }
  }
  if (mejor) return { regla: mejor.regla, categoria: mejor.regla.categoria, icono: mejor.regla.icono, base: mejor.regla.base }

  // Sin regla: plantilla genérica según el verbo inicial («buscar piso» → «Busca piso y tenlo delante»)
  const [verbo, ...resto] = tarea.trim().split(/\s+/)
  const objeto = minuscula(resto.join(' ').replace(/\.$/, '')) || 'la tarea'
  const plantilla = PLANTILLAS.find((p) => p.verbos.includes(normalizar(verbo ?? '')))
  return {
    regla: null,
    categoria: 'Tarea',
    icono: null,
    base: plantilla ? plantilla.plantilla(objeto) : RETO_GENERICO,
  }
}
