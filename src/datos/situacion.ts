import type { TipoReto } from '../components/CartaReto/tipos'
import type { Nivel } from './banco'

/* ─────────────────────────────────────────────────────────────
   Lectura de la situación: qué puede estar frenando a la persona, solo con
   la tarea que escribe y el esfuerzo que marca.

   Base de conocimiento sacada de webs de psicología y TDAH (FUENTES, abajo), no de una
   búsqueda en cada tarea: así la lectura es instantánea, funciona sin conexión y no
   depende de buscadores que bloquean. `npm run fuentes` comprueba que los enlaces siguen vivos.

   Cómo se lee la tarea: cada situación tiene señales con peso (una palabra muy clara
   pesa 3; una que solo apunta, 1). Se suman TODAS las señales de la tarea y gana la
   situación con más puntos; el esfuerzo suma un poco a las que más pesan con poca
   energía. Si dos situaciones encajan, la frase menciona la segunda.
   Nunca diagnostica: dice «puede que», y la persona decide.
   ───────────────────────────────────────────────────────────── */

export type Fuente = { nombre: string; url: string }

export type Situacion = {
  id: string
  /** Nombre corto para el perfil («Hablar con otras personas») */
  nombre: string
  /** Frase corta que se ve en la selección: qué puede estar pasando y qué hace la app. */
  frase: string
  /** Orden de partida de las cartas: primero las que mejor encajan con esta situación. */
  orden: TipoReto[]
  fuente: Fuente
  /** Segunda situación que también encaja (si la hay) */
  tambien?: string
}

type Señal = [RegExp, number]
type Regla = Situacion & { señales: Señal[]; extraPorEsfuerzo?: Partial<Record<Nivel, number>> }

export const FUENTES = {
  dodson: { nombre: 'Neurodivergent Insights · Sistema nervioso basado en el interés (Dodson)', url: 'https://neurodivergentinsights.com/interest-based-nervous-system/' },
  llamadas: { nombre: 'Inflow · Ansiedad al teléfono y TDAH', url: 'https://www.getinflow.io/post/phone-anxiety-and-adhd' },
  evitacion: { nombre: 'ADDA · Evitación de demandas', url: 'https://add.org/demand-avoidance/' },
  salud: { nombre: 'BPS · Más citas médicas perdidas con TDAH', url: 'https://bps.org.uk/research-digest/high-rates-missed-gp-visits-found-among-patients-adhd' },
  perfeccionismo: { nombre: 'ADDitude · Perfeccionismo y TDAH', url: 'https://additudemag.com/perfectionism-adhd-not-good-enough-anxiety/' },
  paralisis: { nombre: 'Child Mind Institute · ¿Qué es la parálisis por TDAH?', url: 'https://childmind.org/es/articulo/que-es-la-paralisis-por-tdah/' },
  ejercicio: { nombre: 'ADDA · Ejercicio y TDAH', url: 'https://add.org/exercising-your-adhd/' },
  aburrimiento: { nombre: 'Psychology Today · Por qué el aburrimiento es insoportable con TDAH', url: 'https://www.psychologytoday.com/pr/blog/por-que-el-aburrimiento-es-insoportable-para-personas-con-tdah' },
  cuidado: { nombre: 'CHADD · TDAH y cuidado personal', url: 'https://chadd.org/adhd-news/adhd-news-adults/attention-adhd-and-personal-care/' },
} satisfies Record<string, Fuente>

const normalizar = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9ñ\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const SITUACIONES: Regla[] = [
  {
    id: 'plazo',
    nombre: 'Plazo encima',
    señales: [
      [/\b(urgente|plazo|fecha limite|ultimo dia|vence|caduca|antes del|antes de las)\b/, 3],
      [/\b(hoy|manana|esta tarde|esta noche)\b/, 2],
      [/\b(entregar|presentar|pagar)\b/, 1],
    ],
    frase: 'Hay un plazo encima. Esa presión puede ayudar: la carta Urgencia va primero.',
    orden: ['urgencia', 'desafio', 'novedad', 'pasion', 'interes'],
    fuente: FUENTES.dodson,
  },
  {
    id: 'social',
    nombre: 'Hablar con otras personas',
    señales: [
      [/\b(llamar|llamada|telefono|telefonear|reclamar|disculpa|perdon|entrevista)\b/, 3],
      [/\b(responder|contestar|escribir a|mensaje|whatsapp|correo|email|mail|jefe|jefa|profesor|profesora|cliente|casero|casera)\b/, 2],
      [/\b(pedir|preguntar|quedar|cita|cumpleanos|felicitar|reunion|presentacion|decir|hablar)\b/, 1],
    ],
    frase: 'Hablar con otras personas puede dar respeto. Empiezas por lo que no exige hablar con nadie.',
    orden: ['novedad', 'desafio', 'pasion', 'urgencia', 'interes'],
    fuente: FUENTES.llamadas,
  },
  {
    id: 'mal-rato',
    nombre: 'Algo que da mal rato',
    señales: [
      [/\b(medico|medica|dentista|analisis|hospital|urgencias|ginecolog\w*|psicolog\w*|psiquiatra|fisio\w*)\b/, 3],
      [/\b(vacuna|revision|receta|veterinario|tratamiento|pruebas)\b/, 2],
    ],
    frase: 'Es normal posponer lo que da mal rato. Los primeros pasos no te comprometen a nada todavía.',
    orden: ['novedad', 'pasion', 'interes', 'desafio', 'urgencia'],
    fuente: FUENTES.salud,
  },
  {
    id: 'perfeccionismo',
    nombre: 'Miedo a que no quede bien',
    señales: [
      [/\b(tfg|tfm|ensayo|portfolio|curriculum|cv|memoria|articulo|presentacion)\b/, 3],
      [/\b(escribir|redactar|informe|proyecto|disenar|crear|examen|entrega)\b/, 2],
      [/\b(dibujar|trabajo|propuesta)\b/, 1],
    ],
    frase: 'Puede que pese el miedo a que no quede bien. Aquí vale un primer borrador feo.',
    orden: ['novedad', 'pasion', 'desafio', 'interes', 'urgencia'],
    fuente: FUENTES.perfeccionismo,
  },
  {
    id: 'enorme',
    nombre: 'Verlo enorme',
    señales: [
      [/\b(mudanza|temario|trastero|garaje|todo|todos|toda|todas|entera|entero)\b/, 3],
      [/\b(limpiar|ordenar|recoger|estudiar|armario|habitacion|casa|cocina|bano)\b/, 2],
    ],
    frase: 'Puede parecer enorme porque se ve entero. Solo hace falta un trozo que se pueda contar.',
    orden: ['desafio', 'novedad', 'pasion', 'interes', 'urgencia'],
    fuente: FUENTES.paralisis,
  },
  {
    id: 'energia',
    nombre: 'Poca energía',
    señales: [
      [/\b(gimnasio|gym|entrenar|correr|deporte|ejercicio|yoga|nadar|bici)\b/, 3],
      [/\b(caminar|pasear|andar|sacar al perro|estirar)\b/, 2],
    ],
    extraPorEsfuerzo: { pesado: 1 },
    frase: 'Con poca energía, el cuerpo arranca mejor con algo pequeño que te guste.',
    orden: ['pasion', 'novedad', 'desafio', 'interes', 'urgencia'],
    fuente: FUENTES.ejercicio,
  },
  {
    id: 'aburrimiento',
    nombre: 'Aburrimiento',
    señales: [
      [/\b(papeleo|tramite\w*|hacienda|renta|factura\w*|formulario|archivar|declaracion)\b/, 3],
      [/\b(lavar|platos|lavadora|tender|planchar|compra|ordenar papeles|repasar)\b/, 2],
    ],
    frase: 'Es más aburrida que difícil. Juntarla con algo que te gusta ayuda a empezar.',
    orden: ['pasion', 'desafio', 'novedad', 'interes', 'urgencia'],
    fuente: FUENTES.aburrimiento,
  },
  {
    id: 'cuidarse',
    nombre: 'Cuidarse',
    señales: [
      [/\b(ducha\w*|duchar\w*|dientes|lavarme|crema|aseo|higiene)\b/, 3],
      [/\b(comer|cenar|desayunar|desayuno|almuerzo|almorzar|merienda|merendar|cena|beber|agua|dormir|descansar|acostarme|cuidarme)\b/, 2],
    ],
    extraPorEsfuerzo: { pesado: 1 },
    frase: 'Cuidarte cuesta más en los días malos. Con un paso pequeño ya cuenta.',
    orden: ['pasion', 'novedad', 'interes', 'desafio', 'urgencia'],
    fuente: FUENTES.cuidado,
  },
]

/** Cuando ninguna situación encaja con la tarea, la frase sale del esfuerzo */
const POR_ESFUERZO: Record<Nivel, Situacion> = {
  pesado: {
    id: 'bloqueo',
    nombre: 'Bloqueo',
    frase: 'Hoy cuesta mucho arrancar. Los retos son tan pequeños que casi no cuentan, y eso está bien.',
    orden: ['pasion', 'novedad', 'desafio', 'interes', 'urgencia'],
    fuente: FUENTES.paralisis,
  },
  medio: {
    id: 'resistencia',
    nombre: 'Algo de resistencia',
    frase: 'Hay algo de resistencia. Un primer movimiento físico suele desbloquear el resto.',
    orden: ['novedad', 'desafio', 'pasion', 'interes', 'urgencia'],
    fuente: FUENTES.evitacion,
  },
  ligero: {
    id: 'empujon',
    nombre: 'Solo falta un empujón',
    frase: 'Hay ganas, solo falta un empujón. Elige la carta que más te apetezca.',
    orden: ['novedad', 'desafio', 'pasion', 'interes', 'urgencia'],
    fuente: FUENTES.dodson,
  },
}

/** Puntos de cada situación para una tarea (todas las señales, con su peso). */
export function puntuarSituaciones(tarea: string, esfuerzo: Nivel = 'medio') {
  const texto = ` ${normalizar(tarea)} `
  return SITUACIONES.map((s) => {
    let puntos = 0
    for (const [re, peso] of s.señales) puntos += (texto.match(new RegExp(re.source, 'g')) ?? []).length * peso
    if (puntos > 0) puntos += s.extraPorEsfuerzo?.[esfuerzo] ?? 0
    return { situacion: s, puntos }
  })
    .filter((x) => x.puntos > 0)
    .sort((a, b) => b.puntos - a.puntos) // estable: si empatan, la que va antes en la lista
}

/** Lee la situación probable a partir de la tarea y el esfuerzo. */
export function leerSituacion(tarea: string, esfuerzo: Nivel = 'medio'): Situacion {
  const [primera, segunda] = puntuarSituaciones(tarea, esfuerzo)
  if (!primera) return POR_ESFUERZO[esfuerzo]
  const { id, nombre, frase, orden, fuente } = primera.situacion
  return { id, nombre, frase, orden, fuente, ...(segunda && segunda.puntos >= 2 && { tambien: segunda.situacion.nombre }) }
}

export const SITUACIONES_DOC: Situacion[] = SITUACIONES.map(({ id, nombre, frase, orden, fuente }) => ({ id, nombre, frase, orden, fuente }))
export const POR_ESFUERZO_DOC = POR_ESFUERZO
export const NOMBRE_SITUACION: Record<string, string> = Object.fromEntries(
  [...SITUACIONES, ...Object.values(POR_ESFUERZO)].map((s) => [s.id, s.nombre]),
)
