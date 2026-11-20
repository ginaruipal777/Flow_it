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
}

export type PreguntaContexto = { id: string; texto: string; opciones: OpcionContexto[] }

/** Lo elegido, junto, listo para el motor de retos */
export type Eleccion = Pick<OpcionContexto, 'objeto' | 'verbo' | 'metodo' | 'experiencia' | 'bloqueo'>

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

/** Las preguntas para esta tarea con lo que encontró la búsqueda (como mucho 3). */
export function preguntasDe(tarea: string, datos: { metodos?: string[]; materiales?: string[] }): PreguntaContexto[] {
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
        { id: 'otra', texto: 'De otra forma', icono: 'nose' },
      ],
    })
  } else if (materiales.length >= 2) {
    preguntas.push({
      id: 'a-mano',
      texto: '¿Qué tienes a mano?',
      opciones: [
        ...materiales.slice(0, 3).map((m): OpcionContexto => ({
          id: `material:${m}`,
          texto: m.replace(/^(el|la|los|las)\s/, '').replace(/^./, (c) => c.toUpperCase()),
          icono: iconoDe(m),
          objeto: m,
          verbo: 'Coge',
        })),
        { id: 'nada', texto: 'Nada de esto', icono: 'nose' },
      ],
    })
  }
  preguntas.push(
    {
      id: 'antes',
      texto: '¿Lo has hecho antes?',
      opciones: [
        { id: 'mucha', texto: 'Muchas veces', icono: 'repasar', experiencia: 'mucha' },
        { id: 'alguna', texto: 'Alguna vez', icono: 'ideas', experiencia: 'alguna' },
        { id: 'nunca', texto: 'Nunca', icono: 'nose', experiencia: 'nunca' },
      ],
    },
    {
      id: 'bloqueo',
      texto: '¿Qué te frena?',
      opciones: [
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
  }
  return e
}

/** Orden de las cartas según lo que frena a la persona */
export const ORDEN_BLOQUEO: Record<string, TipoReto[]> = {
  pereza: ['urgencia', 'desafio', 'pasion', 'novedad', 'interes'],
  cansancio: ['pasion', 'interes', 'urgencia', 'novedad', 'desafio'],
  agobio: ['desafio', 'interes', 'pasion', 'urgencia', 'novedad'],
}
