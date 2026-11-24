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
  /** Materiales y herramientas que nombran las webs («la esterilla», «el rodillo de pelo corto») */
  materiales?: string[]
  /** Técnicas que recomiendan las webs («Repasa sin mirar tus notas») */
  tecnicas?: string[]
  /** La tarea cuando es solo un nombre, sin verbo («el café») */
  tema?: string
  /** Frases de ambiente ya escritas para esta tarea en la Guía Maestra (Sheet): se suman a los
      modificadores INCUP genéricos como candidatas más específicas. */
  situaciones?: string[]
  /** Núcleos ya escritos en la Guía Maestra para cada nivel: si están, el motor los usa tal
      cual en vez de construir el núcleo a partir de pasos/materiales o de reglas genéricas. */
  nucleosPesado?: string[]
  nucleosMedio?: string[]
  nucleosLigero?: string[]
  /** Lo que contestó la persona en las preguntas de contexto (contexto.ts) */
  eleccion?: {
    /** Un método u objeto concreto que sí tiene («la prensa francesa») */
    objeto?: string
    verbo?: string
    /** Un estilo o forma, no un objeto («hatha yoga») */
    metodo?: string
    experiencia?: 'mucha' | 'alguna' | 'nunca'
    bloqueo?: string
    /** Dónde está ahora («cama», «mesa», «de-pie»); solo si la tarea requiere un lugar físico */
    lugar?: string
    /** Ambiente elegido cuando no hay lugar físico: se fija en Pasión e Interés */
    situacion?: string
  }
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
  // Solo si el objeto ES la herramienta de limpieza (viene de la web): «limpi\w*» NO va aquí,
  // porque dispara con el verbo «limpiar» de la frase aunque el objeto sea la zona («la cocina»,
  // no un trapo), y entonces «Pasa la cocina por 5 superficies» no tiene ningún sentido.
  [/\b(bayeta|trapo|fregona|escoba|aspiradora|desengrasante)\b/, { pesado: (o) => `Toca ${o}`, uno: (o) => `Pasa ${o} por una superficie`, varios: (o, k) => `Pasa ${o} por ${k} superficies` }],
  [/\b(web|portal|plataforma|app|aplicacion)\b/, { pesado: (o) => `Abre ${o}`, uno: (o) => `Lee la primera pantalla de ${o}`, varios: (o, k) => `Lee ${k} pantallas de ${o}` }],
]

function unidadDe(texto: string): Unidad | undefined {
  const t = quitarTildes(texto)
  return UNIDADES.find(([re]) => re.test(t))?.[1]
}

/* Cada pieza lleva un id (para «No encaja»: retos fallidos) y una estrategia (descartes.ts). */
type Pieza = { id: string; texto: string; estrategia: Estrategia; pasos?: string[] }

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

// Si está en la cama o el sofá (eleccion.lugar), un núcleo que ya dé por hecho estar de pie en
// otro sitio concreto (el grifo, la encimera…) no tiene sentido todavía: se descarta.
const FIJO_SITIO = /\b(grifo|encimera|fregadero|horno|lavadora|microondas)\b/i

/** Las Acciones_[Nivel] de la Guía Maestra que no nombran OTRO objeto distinto del elegido
    (filtro de ubicuidad: solo lo que la persona dijo que tiene). */
function sinOtrosObjetos(nucleos: string[], materiales: string[] | undefined, elegido: string): string[] {
  const otros = (materiales ?? [])
    .filter((mat) => quitarTildes(mat) !== quitarTildes(elegido))
    .map((mat) => quitarTildes(mat.replace(/^(el|la|los|las)\s+/, '')))
    .filter((o) => o.length > 2)
  return nucleos.filter((texto) => !otros.some((o) => quitarTildes(texto).includes(o)))
}

function nucleos(v: Variables, nivel: Nivel, unidad: Unidad | undefined): Pieza[] {
  const o = v.objeto
  const a = v.accion
  // El objeto de la frase sin web puede ser abstracto («el tema 3»): no se toca ni se mira, se abre
  const tocable = o && !v.soloConUnidad
  const aprende = a && !COTIDIANOS.test(quitarTildes(a))
  const lista: (Pieza | false | undefined)[] = []
  const m = (id: string, texto: string): Pieza => ({ id, texto, estrategia: 'mecanica' })
  const i = (id: string, texto: string): Pieza => ({ id, texto, estrategia: 'informativa' })
  // Lo que contestó la persona manda (filtro de ubicuidad: solo lo que ha dicho que tiene o hace).
  const e = v.eleccion
  const reposo = Boolean(e?.lugar && /cama|sofa/.test(e.lugar))
  const sinSitioFijo = (lista: string[]) => (reposo ? lista.filter((t) => !FIJO_SITIO.test(t)) : lista)
  if (e) {
    const propios: Pieza[] = []
    // Sin una frase con verbo («café»), se completa con el tema («el café»): «Usa X para el café»
    const complemento = a ? `para empezar a ${a}` : v.tema ? `para ${v.tema}` : undefined
    const nombrar = a ?? v.tema
    // Varias formulaciones por nivel (no solo una): así las 5 cartas no comparten el mismo núcleo
    // y solo cambian de coletilla; el barajado (mezclar) reparte una distinta a cada tipo INCUP.
    if (nivel === 'pesado') {
      if (e.objeto && e.verbo) {
        propios.push(m('c-herr', `${e.verbo} ${e.objeto}`), m('c-vista', `Pon ${e.objeto} a la vista`), m('c-acerca', `Acércate a ${e.objeto}`))
      } else if (e.metodo) {
        propios.push(i('c-metodo-p', `Busca en el móvil información sobre ${e.metodo}`), i('c-metodo-p2', `Lee en el móvil sobre ${e.metodo}`))
      }
      if (!propios.length && nombrar) propios.push(m('c-posit', `Escribe en un pósit «${nombrar}»`))
      // Si la tarea necesita un sitio y la persona está en la cama, el contacto mínimo es levantarse
      if (e.lugar?.includes('cama')) propios.push(m('c-ponte', 'Ponte de pie'))
    } else if (nivel === 'medio') {
      if (e.objeto) {
        propios.push(
          m('c-usa', complemento ? `Usa ${e.objeto} ${complemento}` : `Coge ${e.objeto}`),
          m('c-coge', complemento ? `Coge ${e.objeto} ${complemento}` : `Prepara ${e.objeto}`),
          m('c-prepara', complemento ? `Prepara ${e.objeto} ${complemento}` : `Mira ${e.objeto}`),
        )
      } else if (e.metodo) {
        propios.push(m('c-metodo-m', `Prueba el estilo ${e.metodo}`), m('c-metodo-m2', `Dedica un rato al estilo ${e.metodo}`))
      }
    } else {
      if (e.objeto) {
        propios.push(
          m('c-usa-l', complemento ? `Usa ${e.objeto} hasta completar 3 pasos ${complemento}` : `Usa ${e.objeto} hasta terminar`),
          m('c-prueba-l', complemento ? `Prueba ${e.objeto} hasta completar 3 pasos ${complemento}` : `Prueba ${e.objeto} hasta terminar`),
          m('c-dedica-l', complemento ? `Dedica un rato a ${e.objeto} ${complemento}` : `Dedica un rato a ${e.objeto}`),
        )
      } else if (e.metodo) {
        propios.push(m('c-metodo-l', `Prueba el estilo ${e.metodo} un rato más`), m('c-metodo-l2', `Dedica un rato más al estilo ${e.metodo}`))
      }
    }
    // Buscar o leer cómo se hace, solo si nunca lo ha hecho
    if (e.experiencia === 'nunca') {
      const sobre = a ? `cómo ${a}` : v.tema ? `información sobre ${v.tema}` : undefined
      if (sobre) propios.push(nivel === 'pesado' ? i('p-como', `Busca en el móvil ${sobre}`) : i('m-pasos', `Lee en el móvil ${sobre}`))
    }
    // Enriquece sin sustituir: detrás del núcleo con el objeto elegido, se suman (filtradas) las
    // Acciones_[Nivel] del Sheet, para que las otras 4 cartas INCUP sigan siendo variadas.
    if (propios.length && e.objeto) {
      const guia = nivel === 'pesado' ? v.nucleosPesado : nivel === 'medio' ? v.nucleosMedio : v.nucleosLigero
      if (guia?.length) {
        const filtradas = sinSitioFijo(sinOtrosObjetos(guia, v.materiales, e.objeto))
        propios.push(...filtradas.map((texto, n) => m(`sheet-${nivel[0]}${n}-e`, texto)))
      }
    }
    if (propios.length) return propios
  }
  // Núcleos ya escritos para esta tarea en la Guía Maestra (Sheet): más naturales que construirlos,
  // se usan tal cual en vez de los conectores genéricos de abajo.
  const nucleosGuia = nivel === 'pesado' ? v.nucleosPesado : nivel === 'medio' ? v.nucleosMedio : v.nucleosLigero
  if (nucleosGuia?.length) {
    const filtrados = sinSitioFijo(nucleosGuia)
    if (filtrados.length) return filtrados.map((texto, n) => m(`sheet-${nivel[0]}${n}`, texto))
  }
  // Con lo que trae internet, los conectores se rellenan con datos reales:
  // pasos de la guía, materiales que nombran las webs y técnicas que recomiendan
  const pasos = v.pasos ?? []
  const mats = v.materiales ?? []
  const tecs = v.tecnicas ?? []
  if (pasos.length || mats.length || tecs.length) {
    const minus = (s: string) => s.charAt(0).toLowerCase() + s.slice(1)
    if (nivel === 'pesado') {
      mats.slice(0, 2).forEach((mat, n) => lista.push(m(`h-coge${n}`, `Coge ${mat}`)))
      if (mats[0]) lista.push(m('h-vista', `Pon ${mats[0]} a la vista`))
      if (pasos.length && o) lista.push(m('g-acercate', `Acércate a ${o}`))
      if (pasos.length) lista.push(i('g-lee1', `Lee el primer paso: «${minus(pasos[0])}»`))
      if (tecs[0]) lista.push(i('t-lee', `Lee la técnica «${minus(tecs[0])}»`), m('t-posit', `Apunta en un pósit «${minus(tecs[0])}»`))
      if (tecs[1]) lista.push(i('t-lee2', `Lee la técnica «${minus(tecs[1])}»`))
    } else if (nivel === 'medio') {
      if (pasos[0]) {
        lista.push(m('g-paso1', pasos[0]))
        // Con un único paso, no todas las cartas pueden repetir la misma frase: variantes con el
        // objeto de ese paso (objetoDePaso, reglas.ts), con otro verbo y otra estructura
        if (o) lista.push(m('g-coge-o', `Coge ${o}`), m('g-prepara-o', `Prepara ${o}`))
      }
      if (tecs[0]) lista.push(m('t-1', tecs[0]))
      if (mats[0]) lista.push(m('h-prepara', `Prepara ${mats[0]}`), m('h-mesa', `Pon ${mats[0]} sobre la mesa`))
      if (mats[1]) lista.push(m('h-coge1m', `Coge ${mats[1]}`))
      if (aprende) lista.push(i('m-pasos', `Lee en el móvil los pasos para ${a}`))
    } else {
      if (pasos.length) {
        const k = Math.min(3, pasos.length)
        const ultimo = minus(pasos[k - 1])
        // Los pasos se ven en el detalle del reto (RetoCarta.pasos)
        lista.push(
          { ...m('g-hasta', `Sigue los pasos hasta «${ultimo}»`), pasos: pasos.slice(0, k) },
          { ...m('g-completa', k === 1 ? 'Completa el primer paso' : `Completa los ${k} primeros pasos`), pasos: pasos.slice(0, k) },
        )
      }
      if (tecs[1]) lista.push(m('t-2', tecs[1]))
      if (mats.length >= 2) lista.push(m('h-junta', `Prepara estas ${Math.min(3, mats.length)} cosas (${mats.slice(0, 3).join(', ')})`))
      if (tecs[0] && !pasos.length) lista.push(m('t-prueba', `Prueba la técnica «${minus(tecs[0])}»`))
    }
    const vistos = new Set<string>()
    const conDatos = lista.filter((p): p is Pieza => Boolean(p) && !vistos.has((p as Pieza).texto) && Boolean(vistos.add((p as Pieza).texto)))
    if (conDatos.length) return conDatos
    lista.length = 0
  }
  if (nivel === 'pesado') {
    if (tocable)
      lista.push(
        v.tipo === 'digital' ? m('p-abre', `Abre ${o}`) : m('p-toca', `Toca ${o}`),
        v.tipo === 'digital' ? m('p-busca', `Busca ${o} en el móvil`) : m('p-mira', `Mira ${o}`),
        v.tipo === 'fisico' && m('p-acerca', `Acércate a ${o}`),
      )
    if (unidad && o) lista.push(m('p-unidad', unidad.pesado(o)), m('p-vista-o', `Pon ${o} a la vista`), i('p-info', `Busca en el móvil información sobre ${o}`))
    if (aprende) lista.push(i('p-como', `Busca en el móvil cómo ${a}`), i('p-video', `Busca en el móvil un vídeo sobre cómo ${a}`))
    if (a) lista.push(m('p-vista', `Pon a la vista una cosa que necesitas para ${a}`), m('p-posit', `Escribe en un pósit «${a}»`), !lista.length && m('p-libreta', `Apunta en tu libreta «${a}»`))
    // Modo inercia: romper la inercia física con el cuerpo, sin depender de ningún objeto de la tarea
    lista.push(m('p-inercia1', 'Estira los brazos'), m('p-inercia2', 'Respira muy hondo'))
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
  const { objeto: o, accion: a, tema } = v
  const social = (id: string, texto: string): Pieza => ({ id, texto, estrategia: 'social' })
  const mec = (id: string, texto: string): Pieza => ({ id, texto, estrategia: 'mecanica' })
  const info = (id: string, texto: string): Pieza => ({ id, texto, estrategia: 'informativa' })
  // Novedad con cambios comunes, sin imponer un método: cada persona lo hace con lo que tiene
  if (tipo === 'novedad') {
    if (a) {
      if (nivel === 'pesado') return [info('e-otra', `Busca en el móvil otra manera de ${a}`)]
      if (nivel === 'medio') return [mec('e-cambia', `Cambia una sola cosa de cómo sueles ${a}`)]
      return [mec('e-manera', `Prueba a ${a} de una manera que no sueles`)]
    }
    if (tema) {
      if (nivel === 'pesado') return [info('e-idea', `Busca en el móvil una idea nueva para ${tema}`)]
      if (nivel === 'medio') return [mec('e-cambia-t', `Cambia una sola cosa de lo de siempre con ${tema}`)]
      return [mec('e-toque', `Prueba ${tema} con un toque distinto al de siempre`)]
    }
  }
  if (tipo === 'interes') {
    if (nivel === 'pesado' && a) return [social('e-cuentale', `Cuéntale a alguien de casa que vas a ${a}`)]
    if (nivel === 'medio' && a) return [social('e-mensaje', `Envía un mensaje a alguien de confianza para contarle que vas a ${a}`)]
    if (nivel === 'medio' && o && v.tipo === 'fisico' && !v.soloConUnidad) return [social('e-foto', `Envía una foto de ${o} a una persona de confianza`)]
  }
  if (tipo === 'desafio' && nivel === 'pesado' && a) return [mec('e-apunta2', `Apunta 2 cosas que necesitas para ${a}`)]
  if (tipo === 'desafio' && nivel === 'medio' && a) return [mec('e-junta3', `Junta 3 cosas que necesitas para ${a}`)]
  return []
}

/* ── Semilla ──────────────────────────────────────────────────
   Cada tarea nueva tira una semilla al azar de verdad (Math.random(), al crearla en
   FlowEstado), no una derivada de su texto: la misma tarea escrita dos veces no repite
   las mismas frases. Esa semilla se MEZCLA con el número de mazo (mezclarMazo) para que,
   dentro de la misma tarea, cada mazo siga sonando distinto, y se GUARDA con la tarea para
   que, mientras la estás mirando, la carta no te cambie de frase sola al re-renderizar.
   Donde no hay una tarea con semilla propia (scripts, pruebas, retosDe suelto) se cae a un
   hash del texto: ahí interesa que sea reproducible, no al azar. */
export function semillaDe(texto: string, mazo = 0): number {
  let h = 2166136261
  for (const c of quitarTildes(texto)) h = Math.imul(h ^ c.charCodeAt(0), 16777619)
  return mezclarMazo(h, mazo)
}

export function mezclarMazo(base: number, mazo = 0): number {
  return (base ^ Math.imul(mazo + 1, 2654435761)) >>> 0
}

/** Barajado estable (mulberry32): la misma semilla da siempre el mismo orden */
function mezclar<T>(lista: T[], semilla: number): T[] {
  const r = [...lista]
  let s = semilla >>> 0
  const azar = () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(azar() * (i + 1))
    ;[r[i], r[j]] = [r[j], r[i]]
  }
  return r
}

const NUCLEO_UNIDAD = /^(Lee|Contesta|Escribe|Rellena) \d/
const CON_OBJETO = /^(p-toca|p-mira|p-abre|p-busca|p-unidad|m-unidad|m-paso|m-verbo|l-unidad|l-usa|g-acercate|g-paso1|h-coge|h-vista|h-prepara)/

// (^|\s) en vez de \b: \b no ve letra con tilde como letra, así que «Vacía el» contraía a «Vacíal»
const contraer = (s: string) => s.replace(/(^|\s)(a|de) el(?=\s|$)/g, (_, pre: string, p: string) => `${pre}${p === 'a' ? 'al' : 'del'}`)
const MAXIMO = 100 // la carta admite ~110 con «Solo…»
const MAXIMO_URGENCIA = 75 // Urgencia lleva además el plazo («antes de que pase una hora»)
const LIMITE_CARTA = 110

/* Pesado baja la exigencia con un adverbio antes del verbo (nunca cambia el modo imperativo:
   «Tan solo suelta…», no «Basta con suelta…», que pediría infinitivo). Cuál le toca a cada
   carta sale de su propio texto (hash), así no se repite siempre el mismo; reglas.ts usa esta
   misma lista para escribirlo, y aquí se usa para saber cuánto margen le queda a la frase. */
export const CONECTORES_PESADO = ['Solo', 'Tan solo', 'Nada más', 'Únicamente', 'Apenas', 'Simplemente']
export function conectorPesado(texto: string): string {
  let h = 0
  for (const c of texto) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return CONECTORES_PESADO[h % CONECTORES_PESADO.length]
}

const NIVELES: Nivel[] = ['pesado', 'medio', 'ligero']
const TIPOS: TipoReto[] = ['novedad', 'desafio', 'pasion', 'interes', 'urgencia']

/** De dónde sale cada carta: plantilla (para «No encaja»), estrategia y el núcleo a solas
    (verbo primero, sin el modificador): «Está hecho cuando…» sale de ahí, nunca de la frase
    completa, porque con el modificador delante («Con música…, coge…») la primera palabra ya
    no es el verbo. */
export type Origen = { plantilla: string; estrategia: Estrategia; pasos?: string[]; nucleoTexto: string }
export type ResultadoMotor = { acciones: Acciones; origen: Record<Nivel, Record<TipoReto, Origen>> }

type Candidata = { texto: string; plantilla: string; estrategia: Estrategia; nucleo: Estrategia; pasos?: string[]; nucleoTexto: string }

/** Orden con lo que falló: fuera las plantillas descartadas; la estrategia descartada al final;
    con descartes, primero la estrategia opuesta (casi siempre la acción mecánica). */
const nucleoDePlantilla = (plantilla: string) => plantilla.split('+')[0]

function conDescartes(lista: Candidata[], op?: OpcionesMotor): Candidata[] {
  if (!op) return lista
  // Primero se evita hasta el NÚCLEO de lo que ya rechazaste (no solo esa combinación exacta
  // con ese modificador): si dijiste que no a «Pon X a la vista con música», no vuelve a
  // ofrecerte «Pon X a la vista» con otro modificador mientras haya alternativa.
  const nucleosDescartados = new Set([...op.descartadas].map(nucleoDePlantilla))
  const sinNucleo = lista.filter((c) => !nucleosDescartados.has(nucleoDePlantilla(c.plantilla)))
  const libres = (sinNucleo.length ? sinNucleo : lista).filter((c) => !op.descartadas.has(c.plantilla))
  const pool = libres.length ? libres : sinNucleo.length ? sinNucleo : lista
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
    // Que no se repita el mismo núcleo (antes de empezar la frase) en dos cartas del mismo mazo
    // mientras queden otros sin usar: con pocas variantes, el barajado por carta podía elegir el
    // mismo núcleo 3-4 veces y solo cambiar la coletilla final.
    const usadosNucleos = new Set<string>()
    const cartas = {} as Acciones[Nivel]
    const origenes = {} as Record<TipoReto, Origen>
    TIPOS.forEach((tipo, i) => {
      const s = (sem + i * 7919 + NIVELES.indexOf(nivel) * 104729) >>> 0
      let candidatas: Candidata[]
      if (tipo === 'urgencia') {
        candidatas = mezclar(base, s).map((n) => ({ texto: n.texto, plantilla: `${n.id}`, estrategia: n.estrategia, nucleo: n.estrategia, pasos: n.pasos, nucleoTexto: n.texto }))
      } else {
        // Con un objeto o método elegido, el reto ya tiene sitio propio: no se cambia de sitio
        const fijo = Boolean(v.eleccion?.objeto || v.eleccion?.metodo)
        // «empezando por el final» solo con núcleos de unidades («Lee 5 párrafos…»)
        // «fijándote en un detalle» solo con núcleos que tienen un objeto delante
        // y nada de «sin mirar el móvil» cuando el núcleo se hace con el móvil o con la guía
        const encaja = (n: Pieza, m: Modificador) =>
          (m.solo !== 'unidad' || NUCLEO_UNIDAD.test(n.texto)) &&
          (m.id !== 'i-detalle' || CON_OBJETO.test(n.id)) &&
          !(/móvil/.test(m.texto) && /móvil|guía|app|web/.test(n.texto))
        const modsGenericos = MODIFICADORES[tipo].filter(
          (m) =>
            (!m.niveles || m.niveles.includes(nivel)) &&
            (!m.solo || m.solo === 'unidad' || m.solo === v.tipo) &&
            !(fijo && /^(n-sitio|n-rincon|n-ventana|p-rincon)$/.test(m.id)),
        )
        // El ambiente que eligió la persona (pregunta «¿Qué te acompaña mejor?», sin lugar físico)
        // es EL modificador de Pasión e Interés, no uno más entre los genéricos — pero solo si
        // encaja con algún núcleo del mazo; si no, se cae a los genéricos (nunca una lista vacía).
        const situacionElegida = v.eleccion?.situacion
        const forzado: Modificador | undefined =
          situacionElegida && (tipo === 'pasion' || tipo === 'interes')
            ? { id: 'eleccion-situacion', texto: situacionElegida, estrategia: tipo === 'pasion' ? 'emocional' : 'social' }
            : undefined
        const mods = forzado && base.some((n) => encaja(n, forzado)) ? [forzado] : modsGenericos
        // Frases de ambiente ya escritas para esta tarea (Sheet): candidatas de más, además
        // de las genéricas, para cualquier carta (no son de un tipo INCUP en concreto)
        if (mods === modsGenericos && !forzado && v.situaciones?.length)
          mods.push(...v.situaciones.map((texto, n): Modificador => ({ id: `sheet-sit-${n}`, texto, estrategia: 'emocional' })))
        // Núcleo modificador. (siempre el núcleo primero: «acciones[nivel][tipo]» tiene que
        // seguir empezando por un verbo físico en TODA la app, no solo en la carta — accionesWeb()
        // se usa fuera de aquí y revisarAccion lo comprueba en todas partes, no solo en el título)
        const combinadas = mezclar(base, s).flatMap((n) =>
          mezclar(mods, s >>> 3)
            .filter((m) => encaja(n, m))
            .map((m) => ({
              texto: `${n.texto} ${m.texto}`,
              plantilla: `${n.id}+${m.id}`,
              estrategia: m.estrategia === 'mecanica' ? n.estrategia : m.estrategia,
              nucleo: n.estrategia,
              pasos: n.pasos,
              nucleoTexto: n.texto,
            })),
        )
        const sueltas = enteras(v, nivel, tipo).map((e) => ({ texto: e.texto, plantilla: e.id, estrategia: e.estrategia, nucleo: e.estrategia, nucleoTexto: e.texto }))
        // Las frases enteras salen a veces, no siempre: así cambian de un mazo a otro.
        // En Novedad, los cambios comunes («cambia una sola cosa…») salen la mitad de las veces
        const primero = tipo === 'novedad' ? s % 2 === 0 : s % 3 === 0
        candidatas = primero ? [...sueltas, ...combinadas] : [...combinadas, ...sueltas]
      }
      const listas = conDescartes(candidatas, opciones).map((c) => ({ ...c, texto: contraer(c.texto) }))
      const cabe = (c: (typeof listas)[number]) => {
        if (usadas.has(c.texto)) return false
        if (tipo === 'urgencia') return c.texto.length <= MAXIMO_URGENCIA
        // +1 el espacio del conector, +1 el punto final que le pone retosDe al título
        if (nivel === 'pesado') return c.texto.length + 1 + conectorPesado(c.texto).length + 1 <= LIMITE_CARTA
        return c.texto.length <= MAXIMO
      }
      // Defensivo: candidatas no debería quedar vacía nunca (base siempre tiene algo), pero si
      // algún filtro la dejara así, un núcleo en bruto es mejor que explotar sin mostrar nada.
      const base0 = candidatas[0] ?? { texto: base[0]?.texto ?? texto, plantilla: `${base[0]?.id ?? 'respaldo'}`, estrategia: 'mecanica' as const, nucleo: 'mecanica' as const, nucleoTexto: base[0]?.texto ?? texto }
      const elegida =
        listas.find((c) => cabe(c) && !usadosNucleos.has(nucleoDePlantilla(c.plantilla))) ??
        listas.find((c) => cabe(c)) ?? { ...base0, texto: contraer(base0.texto) }
      usadas.add(elegida.texto)
      usadosNucleos.add(nucleoDePlantilla(elegida.plantilla))
      cartas[tipo] = elegida.texto
      origenes[tipo] = { plantilla: elegida.plantilla, estrategia: elegida.estrategia, nucleoTexto: elegida.nucleoTexto, ...(elegida.pasos && { pasos: elegida.pasos }) }
    })
    acciones[nivel] = cartas
    origen[nivel] = origenes
  }
  return { acciones, origen }
}
