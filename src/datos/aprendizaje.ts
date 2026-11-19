import type { TipoReto } from '../components/CartaReto/tipos'

/* ─────────────────────────────────────────────────────────────
   Aprendizaje: qué cartas le funcionan a esta persona.

   La app apunta, solo en este dispositivo, qué tipo de carta INCUP se rechaza, se acepta,
   se consigue o se archiva, en total y por situación (situacion.ts). Con eso reordena las
   cartas del siguiente mazo: primero las que más le activan.

   El algoritmo es una media con «creencia inicial» (bayesiana sencilla):
   - Se parte del orden que propone la situación (la primera carta empieza con más puntos).
   - Cada carta aceptada suma, cada carta conseguida suma un poco más, cada rechazo o archivo resta.
   - Pocas respuestas cambian poco el orden; muchas respuestas mandan sobre la creencia inicial.
   - Lo aprendido en la misma situación pesa más que lo aprendido en general.
   No se envía a ningún sitio y se puede borrar desde el perfil.
   ───────────────────────────────────────────────────────────── */

export type Contador = { vistas: number; aceptadas: number; conseguidas: number; archivadas: number }
type PorTipo = Partial<Record<TipoReto, Contador>>
export type Aprendizaje = { tipos: PorTipo; situaciones: Record<string, PorTipo> }

export type Evento = 'rechazada' | 'aceptada' | 'conseguida' | 'archivada'

export const APRENDIZAJE_VACIO: Aprendizaje = { tipos: {}, situaciones: {} }

const cero = (): Contador => ({ vistas: 0, aceptadas: 0, conseguidas: 0, archivadas: 0 })

function sumar(c: Contador | undefined, evento: Evento): Contador {
  const n = { ...cero(), ...c }
  if (evento === 'rechazada') n.vistas++
  if (evento === 'aceptada') {
    n.vistas++
    n.aceptadas++
  }
  if (evento === 'conseguida') n.conseguidas++
  if (evento === 'archivada') n.archivadas++
  return n
}

/** Apunta lo que ha pasado con una carta (en total y en su situación). */
export function registrar(ap: Aprendizaje | undefined, situacion: string, tipo: TipoReto, evento: Evento): Aprendizaje {
  const a = ap ?? APRENDIZAJE_VACIO
  const enSituacion = a.situaciones[situacion] ?? {}
  return {
    tipos: { ...a.tipos, [tipo]: sumar(a.tipos[tipo], evento) },
    situaciones: { ...a.situaciones, [situacion]: { ...enSituacion, [tipo]: sumar(enSituacion[tipo], evento) } },
  }
}

/** «Éxitos» de una carta: aceptar cuenta 1, conseguir 0,5 más, archivar resta 0,5 */
const exitos = (c: Contador) => Math.max(0, c.aceptadas + 0.5 * c.conseguidas - 0.5 * c.archivadas)

const FUERZA_INICIAL = 4 // la creencia inicial vale como 4 respuestas
const FUERZA_GENERAL = 3 // lo aprendido en general vale como 3 respuestas frente a la situación

/** Probabilidad estimada de que esta persona acepte cada tipo de carta. */
export function estimar(base: TipoReto[], ap: Aprendizaje | undefined, situacion: string): Record<TipoReto, number> {
  const a = ap ?? APRENDIZAJE_VACIO
  const r = {} as Record<TipoReto, number>
  base.forEach((tipo, i) => {
    const inicial = 0.7 - i * 0.05 // 0,70 la primera carta de la situación … 0,50 la última
    const g = a.tipos[tipo]
    const general = g ? (inicial * FUERZA_INICIAL + exitos(g)) / (FUERZA_INICIAL + g.vistas) : inicial
    const s = a.situaciones[situacion]?.[tipo]
    r[tipo] = s ? (general * FUERZA_GENERAL + exitos(s)) / (FUERZA_GENERAL + s.vistas) : general
  })
  return r
}

/** Orden de las cartas para el próximo mazo: primero las que más le activan. */
export function ordenar(base: TipoReto[], ap: Aprendizaje | undefined, situacion: string): TipoReto[] {
  const p = estimar(base, ap, situacion)
  return [...base].sort((x, y) => p[y] - p[x] || base.indexOf(x) - base.indexOf(y))
}

/** Resumen para el perfil: cada tipo de carta con sus números. */
export function resumen(ap: Aprendizaje | undefined) {
  const a = ap ?? APRENDIZAJE_VACIO
  const tipos = (Object.entries(a.tipos) as [TipoReto, Contador][]).map(([tipo, c]) => ({
    tipo,
    ...c,
    porcentaje: c.vistas ? Math.round((c.aceptadas / c.vistas) * 100) : 0,
  }))
  const total = tipos.reduce((s, t) => s + t.vistas, 0)
  const conDatos = tipos.filter((t) => t.vistas >= 2).sort((x, y) => y.porcentaje - x.porcentaje || y.conseguidas - x.conseguidas)
  return { tipos, total, mejor: conDatos[0], peor: conDatos.length > 1 ? conDatos[conDatos.length - 1] : undefined }
}
