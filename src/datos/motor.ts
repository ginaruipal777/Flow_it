/* ─────────────────────────────────────────────────────────────
   Motor de formulación universal: retos para CUALQUIER tarea, sin categorías.

   Reto = núcleo (fórmula base según el esfuerzo) + modificador INCUP (el sabor).
   Las piezas se rellenan con las variables de la tarea:
     - de la web (api/micro_paso.py): verbo de acción («Vacía»), objeto («la cafetera»), primer paso;
     - de la frase: acción en infinitivo («descalcificar la cafetera»);
     - unidad, según el objeto: preguntas de un test, párrafos de un libro, casillas de un formulario…
   Cada carta elige su núcleo y su modificador con una semilla (tarea + mazo): siempre la misma
   carta para el mismo mazo, pero tareas y mazos distintos suenan distinto.

   Las frases siguen las reglas de redacción (scripts/validar-retos.mts): una sola acción, verbo
   físico primero, objeto concreto, sin prisas ni juicios, sin «hacer». El plazo de Urgencia y el
   «Solo…» de Pesado los añade fraseReto (reglas.ts).
   ───────────────────────────────────────────────────────────── */

import type { TipoReto } from '../components/CartaReto/tipos'
import type { Acciones, Nivel } from './banco.ts'

export type Variables = {
  /** Objeto concreto con artículo («la app del test», «la cafetera») */
  objeto?: string
  tipo: 'digital' | 'fisico'
  /** Verbo del primer paso en imperativo («Vacía», «Abre») */
  verbo?: string
  /** Primer paso real encontrado en la web («Vacía la cafetera») */
  paso?: string
  /** Acción de la frase en infinitivo («descalcificar la cafetera») */
  accion?: string
  /** El objeto sale de la frase: solo se nombra solo si tiene unidad («el tema 3»), nunca «Toca a tu madre» */
  soloConUnidad?: boolean
}

type Unidad = {
  pesado: (o: string) => string
  uno: (o: string) => string
  varios: (o: string, k: number) => string
}

const quitarTildes = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

/** Unidad de avance según el objeto: así «completa un bloque» dice qué bloque. */
const UNIDADES: [RegExp, Unidad][] = [
  [/\b(responder|contestar)\b.*\b(correo|email|mail|mensaje|carta)\b/, { pesado: (o) => `Abre ${o}`, uno: (o) => `Escribe la primera frase de tu respuesta a ${o}`, varios: (o, k) => `Escribe ${k} frases de tu respuesta a ${o}` }],
  [/\b(test|tests|preguntas?|examen|cuestionario|autoescuela)\b/, { pesado: (o) => `Abre ${o}`, uno: (o) => `Contesta la primera pregunta de ${o}`, varios: (o, k) => `Contesta ${k} preguntas de ${o}` }],
  [/\b(libro|apuntes|temario|tema|novela|manual|lectura|estudiar|leer)\b/, { pesado: (o) => `Abre ${o}`, uno: (o) => `Lee el primer párrafo de ${o}`, varios: (o, k) => `Lee ${k} párrafos de ${o}` }],
  [/\b(formulario|solicitud|impreso|sede|cita previa|tramite|declaracion|renta)\b/, { pesado: (o) => `Abre ${o}`, uno: (o) => `Rellena la primera casilla de ${o}`, varios: (o, k) => `Rellena ${k} casillas de ${o}` }],
  [/\b(correo|email|mail|mensaje|carta)\b/, { pesado: (o) => `Abre ${o}`, uno: (o) => `Escribe la primera frase de ${o}`, varios: (o, k) => `Escribe ${k} frases de ${o}` }],
  [/\b(documento|pdf|informe|presentacion|trabajo|tfg|tfm)\b/, { pesado: (o) => `Abre ${o}`, uno: (o) => `Escribe la primera frase de ${o}`, varios: (o, k) => `Escribe ${k} frases de ${o}` }],
  [/\b(ropa|prendas?|colada|lavadora|tender|planchar|doblar)\b/, { pesado: () => 'Toca una prenda', uno: () => 'Dobla una prenda', varios: (_, k) => `Dobla ${k} prendas` }],
  [/\b(platos?|fregadero|lavavajillas|fregar)\b/, { pesado: () => 'Toca el primer plato del fregadero', uno: () => 'Friega un plato', varios: (_, k) => `Friega ${k} platos` }],
  [/\b(bayeta|trapo|fregona|escoba|aspiradora|desengrasante|limpi\w*|polvo)\b/, { pesado: (o) => `Toca ${o}`, uno: (o) => `Pasa ${o} por una superficie`, varios: (o, k) => `Pasa ${o} por ${k} superficies` }],
  [/\b(web|portal|plataforma|app|aplicacion)\b/, { pesado: (o) => `Abre ${o}`, uno: (o) => `Lee la primera pantalla de ${o}`, varios: (o, k) => `Lee ${k} pantallas de ${o}` }],
]

function unidadDe(texto: string): Unidad | undefined {
  const t = quitarTildes(texto)
  return UNIDADES.find(([re]) => re.test(t))?.[1]
}

/* ── Modificadores INCUP: van detrás del núcleo ─────────────────
   Sin «mano no dominante» ni «de forma distinta» (fricción artificial), sin prisas («ya»,
   «sin pensarlo») y sin juicios («te lo mereces»): lo pide la investigación de la app. */
type Modificador = { texto: string; solo?: 'fisico' | 'digital' | 'unidad'; niveles?: Nivel[] }

const MODIFICADORES: Record<Exclude<TipoReto, 'urgencia'>, Modificador[]> = {
  novedad: [
    { texto: 'desde otro sitio de la casa' },
    { texto: 'en un sitio de la casa donde casi nunca estás' },
    { texto: 'empezando por el final', solo: 'unidad', niveles: ['medio', 'ligero'] },
    { texto: 'con la pantalla en modo oscuro', solo: 'digital' },
    { texto: 'junto a una ventana' },
  ],
  desafio: [
    { texto: 'contando cada paso en voz alta', niveles: ['medio', 'ligero'] },
    { texto: 'sin moverte de donde estás', niveles: ['pesado'] },
    { texto: 'con el móvil boca abajo', solo: 'fisico' },
    { texto: 'sin mirar el móvil ni una vez', solo: 'fisico' },
    { texto: 'con las notificaciones silenciadas', solo: 'digital' },
    { texto: 'sin levantarte hasta terminar', niveles: ['medio', 'ligero'] },
  ],
  pasion: [
    { texto: 'con tu música favorita de fondo' },
    { texto: 'con tu bebida favorita al lado' },
    { texto: 'con tu canción favorita sonando' },
    { texto: 'en tu rincón favorito de la casa' },
  ],
  interes: [
    { texto: 'con alguien de casa cerca' },
    { texto: 'con una persona de confianza al lado' },
    { texto: 'en una videollamada con alguien de confianza', niveles: ['medio', 'ligero'] },
  ],
}

/* ── Núcleos (fórmulas base) por esfuerzo ───────────────────────
   Pesado: contacto mínimo. Medio: el primer movimiento (una unidad). Ligero: un bloque con final. */
/* Tareas cotidianas: nadie busca «cómo llamar a tu madre». Las demás (descalcificar, pintar,
   montar…) sí se aprenden, y ahí «busca un vídeo» o «lee los pasos» es un primer paso real. */
const COTIDIANOS = /^(llamar|responder|contestar|escribir|leer|estudiar|comer|cenar|desayunar|almorzar|merendar|duchar\w*|banar\w*|ir|salir|comprar|hablar|quedar|enviar|mandar|ver|jugar|dormir|descansar|pasear|caminar|correr|recoger|ordenar|visitar|felicitar|pedir|repasar|tender|doblar|fregar|regar|sacar|beber|tomar)\b/

function nucleos(v: Variables, nivel: Nivel, unidad: Unidad | undefined): string[] {
  const o = v.objeto
  const a = v.accion
  // El objeto de la frase sin web puede ser abstracto («el tema 3»): no se toca ni se mira, se abre
  const tocable = o && !v.soloConUnidad
  const aprende = a && !COTIDIANOS.test(quitarTildes(a))
  const lista: (string | undefined)[] = []
  if (nivel === 'pesado') {
    if (tocable) lista.push(v.tipo === 'digital' ? `Abre ${o}` : `Toca ${o}`, v.tipo === 'digital' ? `Busca ${o} en el móvil` : `Mira ${o}`)
    if (unidad && o) lista.push(unidad.pesado(o))
    if (aprende) lista.push(`Busca en el móvil cómo ${a}`, `Busca en el móvil un vídeo sobre cómo ${a}`)
    if (a && !lista.length) lista.push(`Escribe en un pósit «${a}»`, `Apunta en tu libreta «${a}»`)
  } else if (nivel === 'medio') {
    if (unidad && o) lista.push(unidad.uno(o))
    if (v.paso) lista.push(v.paso)
    else if (tocable && v.verbo) lista.push(`${v.verbo} ${o}`)
    if (a) lista.push(`Coge lo que necesitas para ${a}`, aprende ? `Lee en el móvil los pasos para ${a}` : `Ve al sitio donde vas a ${a}`)
  } else {
    if (unidad && o) lista.push(unidad.varios(o, 3), unidad.varios(o, 5))
    if (a) lista.push(aprende ? `Completa 3 pasos para ${a}` : `Dedica un rato a ${a}`, `Empieza a ${a}`)
    else if (tocable && !unidad) lista.push(`Usa ${o} hasta terminar el primer paso`)
  }
  return [...new Set(lista.filter((x): x is string => Boolean(x)))]
}

/* Acciones completas que no llevan modificador (más variedad para Interés y Desafío). */
function enteras(v: Variables, nivel: Nivel, tipo: TipoReto): string[] {
  const { objeto: o, accion: a } = v
  if (o && v.soloConUnidad && tipo === 'interes' && nivel === 'medio') return a ? [`Envía un mensaje a alguien de confianza para contarle que vas a ${a}`] : []
  if (tipo === 'interes') {
    if (nivel === 'pesado' && a) return [`Cuéntale a alguien de casa que vas a ${a}`]
    if (nivel === 'medio' && a) return [`Envía un mensaje a alguien de confianza para contarle que vas a ${a}`]
    if (nivel === 'medio' && o && v.tipo === 'fisico') return [`Envía una foto de ${o} a una persona de confianza`]
  }
  if (tipo === 'desafio' && nivel === 'pesado' && a) return [`Apunta 2 cosas que necesitas para ${a}`]
  if (tipo === 'desafio' && nivel === 'medio' && a) return [`Junta 3 cosas que necesitas para ${a}`]
  return []
}

/* ── Semilla: misma tarea + mismo mazo → mismas cartas ───────── */
export function semillaDe(texto: string, mazo = 0): number {
  let h = 2166136261
  for (const c of quitarTildes(texto)) h = Math.imul(h ^ c.charCodeAt(0), 16777619)
  return (h ^ Math.imul(mazo + 1, 2654435761)) >>> 0
}

function mezclar<T>(lista: T[], semilla: number): T[] {
  const r = [...lista]
  let s = semilla || 1
  for (let i = r.length - 1; i > 0; i--) {
    s = Math.imul(s ^ (s >>> 15), 2246822507) >>> 0
    s = (s ^ (s >>> 13)) >>> 0
    const j = s % (i + 1)
    ;[r[i], r[j]] = [r[j], r[i]]
  }
  return r
}

const NUCLEO_UNIDAD = /^(Lee|Contesta|Escribe|Rellena) \d/

const contraer = (s: string) => s.replace(/\b(a|de) el\b/g, (_, p: string) => (p === 'a' ? 'al' : 'del'))
const MAXIMO = 100 // la carta admite ~110 con «Solo…»

const NIVELES: Nivel[] = ['pesado', 'medio', 'ligero']
const TIPOS: TipoReto[] = ['novedad', 'desafio', 'pasion', 'interes', 'urgencia']

/** 15 retos (3 niveles × 5 cartas INCUP) montados con las variables de la tarea; undefined si no hay piezas. */
export function accionesMotor(variables: Variables, texto: string, semilla: number): Acciones | undefined {
  const unidad = unidadDe(`${variables.objeto ?? ''} ${texto}`)
  const v = variables.soloConUnidad && !unidad ? { ...variables, objeto: undefined } : variables
  const acciones = {} as Acciones
  for (const nivel of NIVELES) {
    const base = nucleos(v, nivel, unidad)
    if (!base.length) return undefined
    const usadas = new Set<string>()
    const cartas = {} as Acciones[Nivel]
    TIPOS.forEach((tipo, i) => {
      const s = semilla + i * 7919 + NIVELES.indexOf(nivel) * 104729
      let elegida: string | undefined
      if (tipo === 'urgencia') {
        elegida = mezclar(base, s).find((n) => !usadas.has(n))
      } else {
        const mods = MODIFICADORES[tipo].filter(
          (m) => (!m.niveles || m.niveles.includes(nivel)) && (!m.solo || m.solo === 'unidad' || m.solo === v.tipo),
        )
        // «empezando por el final» solo con núcleos de unidades («Lee 5 párrafos…»)
        const encaja = (n: string, m: Modificador) => m.solo !== 'unidad' || NUCLEO_UNIDAD.test(n)
        const candidatas = [
          ...enteras(v, nivel, tipo),
          ...mezclar(base, s).flatMap((n) => mezclar(mods, s >>> 3).filter((m) => encaja(n, m)).map((m) => `${n} ${m.texto}`)),
        ]
        // Las frases enteras salen a veces, no siempre: así cambian de un mazo a otro
        const orden = s % 3 === 0 ? candidatas : [...candidatas.slice(enteras(v, nivel, tipo).length), ...enteras(v, nivel, tipo)]
        elegida = orden.map(contraer).find((c) => c.length <= MAXIMO && !usadas.has(c))
      }
      elegida = contraer(elegida ?? base[0])
      usadas.add(elegida)
      cartas[tipo] = elegida
    })
    acciones[nivel] = cartas
  }
  return acciones
}
