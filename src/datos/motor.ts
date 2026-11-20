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
import type { Estrategia, OpcionesMotor } from './descartes.ts'

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
  /** Pasos reales de la guía encontrada en internet («Retira las rejillas», «Aplica la solución…») */
  pasos?: string[]
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

/* Cada pieza lleva un id (para «No encaja»: retos fallidos) y una estrategia (descartes.ts). */
type Pieza = { id: string; texto: string; estrategia: Estrategia }

/* ── Modificadores INCUP: van detrás del núcleo ─────────────────
   Sin «mano no dominante» ni «de forma distinta» (fricción artificial), sin prisas («ya»,
   «sin pensarlo») y sin juicios («te lo mereces»): lo pide la investigación de la app. */
type Modificador = Pieza & { solo?: 'fisico' | 'digital' | 'unidad'; niveles?: Nivel[] }

const MODIFICADORES: Record<Exclude<TipoReto, 'urgencia'>, Modificador[]> = {
  novedad: [
    { id: 'n-sitio', texto: 'desde otro sitio de la casa', estrategia: 'mecanica' },
    { id: 'n-rincon', texto: 'en un sitio de la casa donde casi nunca estás', estrategia: 'mecanica' },
    { id: 'n-final', texto: 'empezando por el final', estrategia: 'mecanica', solo: 'unidad', niveles: ['medio', 'ligero'] },
    { id: 'n-oscuro', texto: 'con la pantalla en modo oscuro', estrategia: 'mecanica', solo: 'digital' },
    { id: 'n-ventana', texto: 'junto a una ventana', estrategia: 'mecanica' },
  ],
  desafio: [
    { id: 'd-voz', texto: 'contando cada paso en voz alta', estrategia: 'mecanica', niveles: ['medio', 'ligero'] },
    { id: 'd-quieto', texto: 'sin moverte de donde estás', estrategia: 'mecanica', niveles: ['pesado'] },
    { id: 'd-movil', texto: 'con el móvil boca abajo', estrategia: 'mecanica', solo: 'fisico' },
    { id: 'd-sinmovil', texto: 'sin mirar el móvil ni una vez', estrategia: 'mecanica', solo: 'fisico' },
    { id: 'd-avisos', texto: 'con las notificaciones silenciadas', estrategia: 'mecanica', solo: 'digital' },
    { id: 'd-hasta', texto: 'sin levantarte hasta terminar', estrategia: 'mecanica', niveles: ['medio', 'ligero'] },
  ],
  pasion: [
    { id: 'p-musica', texto: 'con tu música favorita de fondo', estrategia: 'emocional' },
    { id: 'p-bebida', texto: 'con tu bebida favorita al lado', estrategia: 'emocional' },
    { id: 'p-cancion', texto: 'con tu canción favorita sonando', estrategia: 'emocional' },
    { id: 'p-rincon', texto: 'en tu rincón favorito de la casa', estrategia: 'emocional' },
    // Pasión como juego (mecánica): sale primero cuando lo emocional no encajó
    { id: 'p-puntos', texto: 'sumando un punto por cada movimiento', estrategia: 'mecanica' },
    { id: 'p-juego', texto: 'como en un juego de contar movimientos', estrategia: 'mecanica' },
  ],
  interes: [
    { id: 'i-casa', texto: 'con alguien de casa cerca', estrategia: 'social' },
    { id: 'i-confianza', texto: 'con una persona de confianza al lado', estrategia: 'social' },
    { id: 'i-video', texto: 'en una videollamada con alguien de confianza', estrategia: 'social', niveles: ['medio', 'ligero'] },
    // Interés sin persona (curiosidad por el objeto): sale primero cuando lo social no encajó
    { id: 'i-detalle', texto: 'fijándote en un detalle que no habías visto', estrategia: 'mecanica' },
  ],
}

/* ── Núcleos (fórmulas base) por esfuerzo ───────────────────────
   Pesado: contacto mínimo. Medio: el primer movimiento (una unidad). Ligero: un bloque con final. */
/* Tareas cotidianas: nadie busca «cómo llamar a tu madre». Las demás (descalcificar, pintar,
   montar…) sí se aprenden, y ahí «busca un vídeo» o «lee los pasos» es un primer paso real. */
const COTIDIANOS = /^(llamar|responder|contestar|escribir|leer|estudiar|comer|cenar|desayunar|almorzar|merendar|duchar\w*|banar\w*|ir|salir|comprar|hablar|quedar|enviar|mandar|ver|jugar|dormir|descansar|pasear|caminar|correr|recoger|ordenar|visitar|felicitar|pedir|repasar|tender|doblar|fregar|regar|sacar|beber|tomar)\b/

function nucleos(v: Variables, nivel: Nivel, unidad: Unidad | undefined): Pieza[] {
  const o = v.objeto
  const a = v.accion
  // El objeto de la frase sin web puede ser abstracto («el tema 3»): no se toca ni se mira, se abre
  const tocable = o && !v.soloConUnidad
  const aprende = a && !COTIDIANOS.test(quitarTildes(a))
  const lista: (Pieza | false | undefined)[] = []
  const m = (id: string, texto: string): Pieza => ({ id, texto, estrategia: 'mecanica' })
  const i = (id: string, texto: string): Pieza => ({ id, texto, estrategia: 'informativa' })
  // Con la guía de internet, los conectores se rellenan con sus pasos reales
  const pasos = v.pasos ?? []
  if (pasos.length) {
    const minus = (s: string) => s.charAt(0).toLowerCase() + s.slice(1)
    if (nivel === 'pesado') {
      if (o) lista.push(m('g-acercate', `Acércate a ${o}`))
      lista.push(i('g-lee1', `Lee el primer paso de la guía: «${minus(pasos[0])}»`))
    } else if (nivel === 'medio') {
      lista.push(m('g-paso1', pasos[0]))
      if (aprende) lista.push(i('m-pasos', `Lee en el móvil los pasos para ${a}`))
    } else {
      const k = Math.min(3, pasos.length)
      lista.push(m('g-hasta', `Sigue la guía hasta «${minus(pasos[k - 1])}»`), m('g-completa', `Completa los ${k} primeros pasos de la guía`))
    }
    return lista.filter((p): p is Pieza => Boolean(p))
  }
  if (nivel === 'pesado') {
    if (tocable) lista.push(v.tipo === 'digital' ? m('p-abre', `Abre ${o}`) : m('p-toca', `Toca ${o}`), v.tipo === 'digital' ? m('p-busca', `Busca ${o} en el móvil`) : m('p-mira', `Mira ${o}`))
    if (unidad && o) lista.push(m('p-unidad', unidad.pesado(o)), m('p-vista-o', `Pon ${o} a la vista`), i('p-info', `Busca en el móvil información sobre ${o}`))
    if (aprende) lista.push(i('p-como', `Busca en el móvil cómo ${a}`), i('p-video', `Busca en el móvil un vídeo sobre cómo ${a}`))
    if (a) lista.push(m('p-vista', `Pon a la vista una cosa que necesitas para ${a}`), m('p-posit', `Escribe en un pósit «${a}»`), !lista.length && m('p-libreta', `Apunta en tu libreta «${a}»`))
  } else if (nivel === 'medio') {
    if (unidad && o) lista.push(m('m-unidad', unidad.uno(o)))
    if (v.paso) lista.push(m('m-paso', v.paso))
    else if (tocable && v.verbo) lista.push(m('m-verbo', `${v.verbo} ${o}`))
    if (a) lista.push(m('m-coge', `Coge lo que necesitas para ${a}`), aprende ? i('m-pasos', `Lee en el móvil los pasos para ${a}`) : m('m-sitio', `Ve al sitio donde vas a ${a}`))
  } else {
    if (unidad && o) lista.push(m('l-unidad3', unidad.varios(o, 3)), m('l-unidad5', unidad.varios(o, 5)))
    if (a) lista.push(aprende ? m('l-pasos', `Completa 3 pasos para ${a}`) : m('l-rato', `Dedica un rato a ${a}`), m('l-empieza', `Empieza a ${a}`))
    else if (tocable && !unidad) lista.push(m('l-usa', `Usa ${o} hasta terminar el primer paso`))
  }
  const vistos = new Set<string>()
  return lista.filter((p): p is Pieza => Boolean(p) && !vistos.has((p as Pieza).texto) && Boolean(vistos.add((p as Pieza).texto)))
}

/* Acciones completas que no llevan modificador (más variedad para Interés y Desafío). */
function enteras(v: Variables, nivel: Nivel, tipo: TipoReto): Pieza[] {
  const { objeto: o, accion: a } = v
  const social = (id: string, texto: string): Pieza => ({ id, texto, estrategia: 'social' })
  const mec = (id: string, texto: string): Pieza => ({ id, texto, estrategia: 'mecanica' })
  if (tipo === 'interes') {
    if (nivel === 'pesado' && a) return [social('e-cuentale', `Cuéntale a alguien de casa que vas a ${a}`)]
    if (nivel === 'medio' && a) return [social('e-mensaje', `Envía un mensaje a alguien de confianza para contarle que vas a ${a}`)]
    if (nivel === 'medio' && o && v.tipo === 'fisico' && !v.soloConUnidad) return [social('e-foto', `Envía una foto de ${o} a una persona de confianza`)]
  }
  if (tipo === 'desafio' && nivel === 'pesado' && a) return [mec('e-apunta2', `Apunta 2 cosas que necesitas para ${a}`)]
  if (tipo === 'desafio' && nivel === 'medio' && a) return [mec('e-junta3', `Junta 3 cosas que necesitas para ${a}`)]
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
const CON_OBJETO = /^(p-toca|p-mira|p-abre|p-busca|p-unidad|m-unidad|m-paso|m-verbo|l-unidad|l-usa|g-acercate|g-paso1)/

const contraer = (s: string) => s.replace(/\b(a|de) el\b/g, (_, p: string) => (p === 'a' ? 'al' : 'del'))
const MAXIMO = 100 // la carta admite ~110 con «Solo…»
const MAXIMO_URGENCIA = 75 // Urgencia lleva además el plazo («antes de que pase una hora»)

const NIVELES: Nivel[] = ['pesado', 'medio', 'ligero']
const TIPOS: TipoReto[] = ['novedad', 'desafio', 'pasion', 'interes', 'urgencia']

/** De dónde sale cada carta: plantilla (para «No encaja») y estrategia */
export type Origen = { plantilla: string; estrategia: Estrategia }
export type ResultadoMotor = { acciones: Acciones; origen: Record<Nivel, Record<TipoReto, Origen>> }

type Candidata = { texto: string; plantilla: string; estrategia: Estrategia; nucleo: Estrategia }

/** Orden con lo que falló: fuera las plantillas descartadas; la estrategia descartada al final;
    con descartes, primero la estrategia opuesta (casi siempre la acción mecánica). */
function conDescartes(lista: Candidata[], op?: OpcionesMotor): Candidata[] {
  if (!op) return lista
  const libres = lista.filter((c) => !op.descartadas.has(c.plantilla))
  const pool = libres.length ? libres : lista
  const puntos = (c: Candidata) =>
    (c.estrategia === op.estrategiaDescartada || c.nucleo === op.estrategiaDescartada ? 2 : 0) +
    (c.nucleo === (op.preferida ?? 'mecanica') ? 0 : 1)
  return pool.map((c, i) => ({ c, i })).sort((x, y) => puntos(x.c) - puntos(y.c) || x.i - y.i).map((x) => x.c)
}

/** 15 retos (3 niveles × 5 cartas INCUP) montados con las variables de la tarea; undefined si no hay piezas.
    `opciones`: lo que falló en esta tarea («No encaja», descartes.ts). */
export function accionesMotor(variables: Variables, texto: string, semilla: number, opciones?: OpcionesMotor): ResultadoMotor | undefined {
  const unidad = unidadDe(`${variables.objeto ?? ''} ${texto}`)
  const v = variables.soloConUnidad && !unidad ? { ...variables, objeto: undefined } : variables
  const acciones = {} as Acciones
  const origen = {} as ResultadoMotor['origen']
  const sem = semilla + (opciones?.vuelta ?? 0) * 15485863
  for (const nivel of NIVELES) {
    const base = nucleos(v, nivel, unidad)
    if (!base.length) return undefined
    const usadas = new Set<string>()
    const cartas = {} as Acciones[Nivel]
    const origenes = {} as Record<TipoReto, Origen>
    TIPOS.forEach((tipo, i) => {
      const s = (sem + i * 7919 + NIVELES.indexOf(nivel) * 104729) >>> 0
      let candidatas: Candidata[]
      if (tipo === 'urgencia') {
        candidatas = mezclar(base, s).map((n) => ({ texto: n.texto, plantilla: `${n.id}`, estrategia: n.estrategia, nucleo: n.estrategia }))
      } else {
        const mods = MODIFICADORES[tipo].filter(
          (m) => (!m.niveles || m.niveles.includes(nivel)) && (!m.solo || m.solo === 'unidad' || m.solo === v.tipo),
        )
        // «empezando por el final» solo con núcleos de unidades («Lee 5 párrafos…»)
        // «fijándote en un detalle» solo con núcleos que tienen un objeto delante
        // y nada de «sin mirar el móvil» cuando el núcleo se hace con el móvil o con la guía
        const encaja = (n: Pieza, m: Modificador) =>
          (m.solo !== 'unidad' || NUCLEO_UNIDAD.test(n.texto)) &&
          (m.id !== 'i-detalle' || CON_OBJETO.test(n.id)) &&
          !(/móvil/.test(m.texto) && /móvil|guía|app|web/.test(n.texto))
        const combinadas = mezclar(base, s).flatMap((n) =>
          mezclar(mods, s >>> 3)
            .filter((m) => encaja(n, m))
            .map((m) => ({ texto: `${n.texto} ${m.texto}`, plantilla: `${n.id}+${m.id}`, estrategia: m.estrategia === 'mecanica' ? n.estrategia : m.estrategia, nucleo: n.estrategia })),
        )
        const sueltas = enteras(v, nivel, tipo).map((e) => ({ texto: e.texto, plantilla: e.id, estrategia: e.estrategia, nucleo: e.estrategia }))
        // Las frases enteras salen a veces, no siempre: así cambian de un mazo a otro
        candidatas = s % 3 === 0 ? [...sueltas, ...combinadas] : [...combinadas, ...sueltas]
      }
      const elegida =
        conDescartes(candidatas, opciones)
          .map((c) => ({ ...c, texto: contraer(c.texto) }))
          .find((c) => c.texto.length <= (tipo === 'urgencia' ? MAXIMO_URGENCIA : MAXIMO) && !usadas.has(c.texto)) ?? {
          ...candidatas[0],
          texto: contraer(candidatas[0].texto),
        }
      usadas.add(elegida.texto)
      cartas[tipo] = elegida.texto
      origenes[tipo] = { plantilla: elegida.plantilla, estrategia: elegida.estrategia }
    })
    acciones[nivel] = cartas
    origen[nivel] = origenes
  }
  return { acciones, origen }
}
