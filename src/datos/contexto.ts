/* ─────────────────────────────────────────────────────────────
   Preguntas de contexto: como mucho 3, DESPUÉS de buscar y sacadas de lo que se encontró
   sobre esa tarea, para que siempre tengan que ver con ella:
     1. ¿Cómo lo haces?   → los métodos que comparan las guías («Cafetera de filtro», «Prensa
                             francesa»…) o, si no hay, ¿Qué tienes a mano? con sus materiales.
                             Siempre hay «De otra forma»: cada persona lo hace con lo que tiene.
     2. ¿Lo has hecho antes? → «Nunca» suma retos de buscar o leer cómo se hace; «Muchas veces», solo acción.
     3. ¿Qué te frena?     → ordena las cartas INCUP.
   ───────────────────────────────────────────────────────────── */

import type { TipoReto } from '../components/CartaReto/tipos'
import { conArticulo } from './articulos.ts'
import { OBJETOS_UNIVERSALES } from './pasos.ts'

export type OpcionContexto = {
  id: string
  texto: string
  icono: string
  /** Un objeto («la prensa francesa») y su verbo de contacto mínimo («Coge») */
  objeto?: string
  verbo?: string
  /** Un estilo o forma, no un objeto («hatha yoga») */
  metodo?: string
  experiencia?: 'mucha' | 'alguna' | 'nunca'
  /** Qué le frena: pereza, cansancio, agobio */
  bloqueo?: string
  /** Dónde está ahora («cama», «mesa», «de-pie»): solo se pregunta si la tarea requiere un lugar */
  lugar?: string
  /** Ambiente elegido cuando la tarea NO depende de un lugar físico («con música de fondo»):
      el motor lo fija como modificador en Pasión e Interés, en vez de uno al azar */
  situacion?: string
}

export type PreguntaContexto = { id: string; texto: string; opciones: OpcionContexto[] }

/** Lo elegido, junto, listo para el motor de retos */
export type Eleccion = Pick<OpcionContexto, 'objeto' | 'verbo' | 'metodo' | 'experiencia' | 'bloqueo' | 'lugar' | 'situacion'>

const quitarTildes = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

function iconoDe(nombre: string): string {
  const n = quitarTildes(nombre)
  if (/(cafe|taza|te\b|infusion|leche|cacao)/.test(n)) return 'taza'
  if (/(destornillador|martillo|taladro|llave|herramienta|nivel|metro|alicate|atornillador)/.test(n)) return 'herramienta'
  if (/(libro|apuntes|cuaderno|libreta)/.test(n)) return 'libro'
  if (/(movil|app|telefono)/.test(n)) return 'movil'
  if (/(ordenador|portatil|web|online)/.test(n)) return 'ordenador'
  if (/(trapo|bayeta|esponja|estropajo)/.test(n)) return 'trapo'
  if (/(escoba|fregona|aspiradora)/.test(n)) return 'escoba'
  return 'metodo'
}

/** Las preguntas para esta tarea con lo que encontró la búsqueda (como mucho 3).
    `requiereLugar`: solo entonces se pregunta dónde está la persona (independencia del lugar:
    api/micro_paso.py, requiere_lugar_tarea). Tareas como estudiar o llamar no lo necesitan. */
export function preguntasDe(
  tarea: string,
  datos: {
    metodos?: string[]
    materiales?: string[]
    requiereLugar?: boolean
    lugares?: string[]
    bloqueos?: string[]
    /** Frases de ambiente de la Guía Maestra («con música de fondo»…): para la pregunta de
        entorno cuando la tarea no depende de un lugar físico */
    situaciones?: string[]
    esDigital?: boolean
  },
): PreguntaContexto[] {
  const palabrasTarea = new Set(quitarTildes(tarea).split(/[^a-zñ]+/).filter((p) => p.length >= 4))
  const preguntas: PreguntaContexto[] = []
  const metodos = datos.metodos ?? []
  const materiales = datos.materiales ?? []
  if (metodos.length >= 2) {
    preguntas.push({
      id: 'como',
      texto: '¿Cómo lo haces?',
      opciones: [
        ...metodos.slice(0, 3).map((m): OpcionContexto => {
          // «Hatha yoga» lleva la palabra de la tarea: es un estilo. «Cafetera de filtro» es un objeto.
          const estilo = quitarTildes(m).split(/\s+/).some((p) => palabrasTarea.has(p))
          return estilo
            ? { id: `metodo:${m}`, texto: m, icono: iconoDe(m), metodo: m.toLowerCase() }
            : { id: `metodo:${m}`, texto: m, icono: iconoDe(m), objeto: conArticulo(m.toLowerCase()), verbo: 'Coge' }
        }),
        // Nivel 1 (filtro de ubicuidad): sin un método propio, un objeto universal es mejor
        // que no tener ninguno («Escribe en un pósit…» para todo).
        { id: 'otra', texto: 'De otra forma', icono: 'manos', objeto: OBJETOS_UNIVERSALES[1], verbo: 'Usa' },
      ],
    })
  } else if (materiales.length >= 2) {
    preguntas.push({
      // «Punto de contacto»: qué tiene a mano ahora mismo (físico) o desde dónde lo abre (digital)
      id: 'a-mano',
      texto: datos.esDigital ? '¿Desde dónde vas a abrirlo?' : '¿Qué tienes más cerca ahora mismo?',
      opciones: [
        ...materiales.slice(0, 3).map((m): OpcionContexto => ({
          id: `material:${m}`,
          texto: m.replace(/^(el|la|los|las)\s/, '').replace(/^./, (c) => c.toUpperCase()),
          icono: iconoDe(m),
          objeto: m,
          verbo: 'Coge',
        })),
        { id: 'nada', texto: 'Nada de esto', icono: 'manos', objeto: OBJETOS_UNIVERSALES[1], verbo: 'Usa' },
      ],
    })
  } else if (datos.esDigital) {
    // Sin materiales reales pero digital: al menos saber el canal (móvil u ordenador)
    preguntas.push({
      id: 'canal',
      texto: '¿Desde dónde vas a abrirlo?',
      opciones: [
        { id: 'canal:movil', texto: 'Desde el móvil', icono: 'movil', objeto: 'el móvil', verbo: 'Coge' },
        { id: 'canal:ordenador', texto: 'En el ordenador', icono: 'ordenador', objeto: 'el ordenador', verbo: 'Abre' },
      ],
    })
  }
  // Lugar según la Guía Maestra (Sheet): sitios concretos de ESTA tarea («el baño», «el sofá»),
  // no los 3 genéricos. Si alguno es la cama, el reto más pesado es simplemente ponerse de pie.
  const iconoLugar = (l: string) => (/cama/.test(quitarTildes(l)) ? 'cama' : /mesa|escritorio|ordenador/.test(quitarTildes(l)) ? 'mesa' : 'de-pie')
  const lugarEspecifico = datos.lugares?.length
    ? {
        id: 'lugar',
        texto: '¿Dónde te cuesta menos empezar?',
        opciones: datos.lugares.slice(0, 3).map((l): OpcionContexto => ({ id: `lugar:${l}`, texto: l.replace(/^./, (c) => c.toUpperCase()), icono: iconoLugar(l), lugar: quitarTildes(l) })),
      }
    : undefined
  // Sin lugar físico (escribir, pedir cita…): el anclaje es el ambiente, no el sitio. Siempre se
  // pregunta (con lo real del Sheet si lo hay, si no con las 3 formas de acompañamiento genéricas);
  // se fija como modificador en Pasión e Interés (accionesMotor), no uno al azar entre los genéricos.
  const AMBIENTE_GENERICO = ['con tu música favorita de fondo', 'con tu bebida favorita al lado', 'en tu rincón favorito de la casa']
  const entorno: PreguntaContexto = {
    id: 'entorno',
    texto: '¿Qué te acompaña mejor ahora?',
    opciones: (datos.situaciones?.length ? datos.situaciones.slice(0, 3) : AMBIENTE_GENERICO).map(
      (s): OpcionContexto => ({ id: `situacion:${s}`, texto: s.replace(/^./, (c) => c.toUpperCase()), icono: 'metodo', situacion: s }),
    ),
  }
  // Solo si la tarea depende de un sitio físico concreto (limpiar, hacer ejercicio…) se pregunta
  // dónde está la persona: así, si dice «en la cama», el reto más pesado es simplemente ponerse de pie.
  preguntas.push(
    datos.requiereLugar
      ? (lugarEspecifico ?? {
          id: 'lugar',
          texto: '¿Dónde estás ahora?',
          opciones: [
            { id: 'cama', texto: 'En la cama', icono: 'cama', lugar: 'cama' },
            { id: 'mesa', texto: 'En una mesa', icono: 'mesa', lugar: 'mesa' },
            { id: 'de-pie', texto: 'De pie', icono: 'de-pie', lugar: 'de-pie' },
          ],
        })
      : entorno,
    // Bloqueo según la Guía Maestra si la tarea trae los suyos (más concretos que los genéricos);
    // el valor interno (pereza/cansancio/agobio) se mantiene por posición para ORDEN_BLOQUEO.
    {
      id: 'bloqueo',
      texto: '¿Qué parte te da más pereza o freno ahora?',
      opciones:
        datos.bloqueos?.length === 3
          ? datos.bloqueos.map((b, i): OpcionContexto => ({
              id: `bloqueo:${b}`,
              texto: b.replace(/^./, (c) => c.toUpperCase()),
              icono: ['pereza', 'cansancio', 'ansiedad'][i],
              bloqueo: ['pereza', 'cansancio', 'agobio'][i],
            }))
          : [
              { id: 'pereza', texto: 'Pereza', icono: 'pereza', bloqueo: 'pereza' },
              { id: 'cansancio', texto: 'Cansancio', icono: 'cansancio', bloqueo: 'cansancio' },
              { id: 'agobio', texto: 'Me agobia', icono: 'ansiedad', bloqueo: 'agobio' },
            ],
    },
  )
  return preguntas.slice(0, 3)
}

export function eleccionDe(opciones: OpcionContexto[] | undefined): Eleccion | undefined {
  if (!opciones?.length) return undefined
  const e: Eleccion = {}
  for (const o of opciones) {
    if (o.objeto) Object.assign(e, { objeto: o.objeto, verbo: o.verbo })
    if (o.metodo) e.metodo = o.metodo
    if (o.experiencia) e.experiencia = o.experiencia
    if (o.bloqueo) e.bloqueo = o.bloqueo
    if (o.lugar) e.lugar = o.lugar
    if (o.situacion) e.situacion = o.situacion
  }
  return e
}

/** Orden de las cartas según lo que frena a la persona */
export const ORDEN_BLOQUEO: Record<string, TipoReto[]> = {
  pereza: ['urgencia', 'desafio', 'pasion', 'novedad', 'interes'],
  cansancio: ['pasion', 'interes', 'urgencia', 'novedad', 'desafio'],
  agobio: ['desafio', 'interes', 'pasion', 'urgencia', 'novedad'],
}
