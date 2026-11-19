import type { TipoReto } from '../components/CartaReto/tipos'
import type { Nivel } from './banco'

/* ─────────────────────────────────────────────────────────────
   Lectura de la situación: qué puede estar frenando a la persona, solo con
   la tarea que escribe y el esfuerzo que marca.

   Con TDAH una tarea se evita por motivos distintos, y cada uno pide otro empujón
   (investigación en docs/comunicacion.md, apartado «Lectura de la situación»):
   - Hablar con otras personas    → miedo a la respuesta: primero lo que no exige hablar.
   - Verlo enorme                 → abruma el tamaño: una meta que se puede contar.
   - Aburrimiento                 → poca recompensa: juntarla con algo que gusta.
   - Miedo a hacerlo mal          → perfeccionismo: permiso para un borrador feo.
   - Poca energía                 → el cuerpo arranca mejor con algo diminuto y agradable.
   - Mal rato (salud, citas)      → se pospone lo desagradable: compañía y pasos que no comprometen.
   - Plazo encima                 → la presión externa ayuda: la carta Urgencia va primero.
   - Cuidarse                     → cuesta más en días malos: tono amable, sin exigir.
   Nunca diagnostica ni afirma: dice «puede que», y la persona decide.
   La frase sigue las pautas de comunicación (literal, corta, sin juicios, sin género).
   ───────────────────────────────────────────────────────────── */

export type Situacion = {
  id: string
  /** Frase corta que se ve en la selección: qué puede estar pasando y qué hace la app. */
  frase: string
  /** Orden de las cartas: primero las que mejor encajan con esta situación. */
  orden: TipoReto[]
}

type Regla = Situacion & { palabras: RegExp; soloCon?: Nivel[] }

const normalizar = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9ñ\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

/* El orden de la lista importa: gana la primera que encaja. */
const SITUACIONES: Regla[] = [
  {
    id: 'plazo',
    palabras: /\b(hoy|manana|urgente|plazo|fecha limite|antes del|antes de las|ultimo dia|vence|caduca)\b/,
    frase: 'Hay un plazo encima. Esa presión puede ayudar: la carta Urgencia va primero.',
    orden: ['urgencia', 'desafio', 'novedad', 'pasion', 'interes'],
  },
  {
    id: 'social',
    palabras:
      /\b(llamar|llamada|telefono|responder|contestar|escribir a|mensaje|correo|email|mail|jefe|jefa|profesor|profesora|cliente|reclamar|pedir|preguntar|quedar|cita|cumpleanos|felicitar|disculpa|perdon|entrevista|presentacion|reunion)\b/,
    frase: 'Hablar con otras personas puede dar respeto. Empiezas por lo que no exige hablar con nadie.',
    orden: ['novedad', 'desafio', 'pasion', 'urgencia', 'interes'],
  },
  {
    id: 'mal-rato',
    palabras: /\b(medico|medica|dentista|analisis|vacuna|hospital|urgencias|veterinario|ginecolog\w*|psicolog\w*|revision)\b/,
    frase: 'Es normal posponer lo que da mal rato. Los primeros pasos no te comprometen a nada todavía.',
    orden: ['novedad', 'pasion', 'interes', 'desafio', 'urgencia'],
  },
  {
    id: 'perfeccionismo',
    palabras: /\b(escribir|redactar|trabajo de|tfg|tfm|ensayo|informe|proyecto|disenar|dibujar|crear|presentacion|portfolio|curriculum|cv|examen)\b/,
    frase: 'Puede que pese el miedo a que no quede bien. Aquí vale un primer borrador feo.',
    orden: ['novedad', 'pasion', 'desafio', 'interes', 'urgencia'],
  },
  {
    id: 'enorme',
    palabras: /\b(limpiar|ordenar|recoger|mudanza|estudiar|temario|armario|garaje|trastero|habitacion|casa|cocina|todo|todos|toda|todas)\b/,
    frase: 'Puede parecer enorme porque se ve entero. Solo hace falta un trozo que se pueda contar.',
    orden: ['desafio', 'novedad', 'pasion', 'interes', 'urgencia'],
  },
  {
    id: 'energia',
    palabras: /\b(gimnasio|gym|correr|entrenar|deporte|caminar|pasear|andar|bici|nadar|yoga|ejercicio|sacar al perro)\b/,
    frase: 'Con poca energía, el cuerpo arranca mejor con algo pequeño que te guste.',
    orden: ['pasion', 'novedad', 'desafio', 'interes', 'urgencia'],
  },
  {
    id: 'aburrimiento',
    palabras: /\b(papeleo|tramite\w*|declaracion|hacienda|renta|factura\w*|formulario|lavar|platos|lavadora|tender|planchar|compra|archivar|ordenar papeles)\b/,
    frase: 'Es más aburrida que difícil. Juntarla con algo que te gusta ayuda a empezar.',
    orden: ['pasion', 'desafio', 'novedad', 'interes', 'urgencia'],
  },
  {
    id: 'cuidarse',
    palabras: /\b(ducha\w*|duchar\w*|comer|cenar|desayunar|beber|agua|dormir|descansar|acostarme|lavarme|dientes|cuidarme|crema)\b/,
    frase: 'Cuidarte cuesta más en los días malos. Con un paso pequeño ya cuenta.',
    orden: ['pasion', 'novedad', 'interes', 'desafio', 'urgencia'],
  },
]

/** Frase según el esfuerzo cuando ninguna situación encaja con la tarea */
const POR_ESFUERZO: Record<Nivel, Situacion> = {
  pesado: {
    id: 'bloqueo',
    frase: 'Hoy cuesta mucho arrancar. Los retos son tan pequeños que casi no cuentan, y eso está bien.',
    orden: ['pasion', 'novedad', 'desafio', 'interes', 'urgencia'],
  },
  medio: {
    id: 'resistencia',
    frase: 'Hay algo de resistencia. Un primer movimiento físico suele desbloquear el resto.',
    orden: ['novedad', 'desafio', 'pasion', 'interes', 'urgencia'],
  },
  ligero: {
    id: 'empujon',
    frase: 'Hay ganas, solo falta un empujón. Elige la carta que más te apetezca.',
    orden: ['novedad', 'desafio', 'pasion', 'interes', 'urgencia'],
  },
}

/** Lee la situación probable a partir de la tarea y el esfuerzo. */
export function leerSituacion(tarea: string, esfuerzo: Nivel = 'medio'): Situacion {
  const texto = normalizar(tarea)
  const regla = SITUACIONES.find((s) => s.palabras.test(texto) && (!s.soloCon || s.soloCon.includes(esfuerzo)))
  if (!regla) return POR_ESFUERZO[esfuerzo]
  return { id: regla.id, frase: regla.frase, orden: regla.orden }
}

export const SITUACIONES_DOC = SITUACIONES.map(({ id, frase, orden }) => ({ id, frase, orden }))
export const POR_ESFUERZO_DOC = POR_ESFUERZO
