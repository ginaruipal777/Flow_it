/* ─────────────────────────────────────────────────────────────
   Retos fallidos: el botón «No encaja».

   Cada reto del motor (motor.ts) sale de una plantilla (núcleo + modificador INCUP) con una
   estrategia: mecánica (mover el cuerpo, tocar, contar), informativa (buscar o leer cómo se hace),
   emocional (música, bebida, sitio favorito) o social (una persona cerca, un mensaje).

   Al pulsar «No encaja», descartarReto apunta para ESA tarea la plantilla y su estrategia.
   Los mazos siguientes de la tarea: 1) no repiten esa plantilla; 2) evitan la estrategia
   descartada y fuerzan la opuesta; 3) dan prioridad a la acción mecánica.
   Se guarda solo en este dispositivo, dentro del estado de la app.
   ───────────────────────────────────────────────────────────── */

export type Estrategia = 'mecanica' | 'informativa' | 'emocional' | 'social'

/** Estrategia opuesta a la que no encajó: las «blandas» pasan a acción física pura. */
export const OPUESTA: Record<Estrategia, Estrategia> = {
  emocional: 'mecanica',
  social: 'mecanica',
  informativa: 'mecanica',
  mecanica: 'informativa',
}

export type Fallido = {
  /** Plantillas descartadas («p-toca+pasion-musica», «banco:Café:medio:pasion»…) */
  plantillas: string[]
  /** Estrategias descartadas, la última al final */
  estrategias: Estrategia[]
  categoria?: string
  t: number
}
export type RetosFallidos = Record<string, Fallido>

/** Lo que necesita el motor para no repetir lo que falló */
export type OpcionesMotor = {
  descartadas: Set<string>
  /** Última estrategia descartada (la que no se usa) */
  estrategiaDescartada?: Estrategia
  /** Estrategia que se fuerza: la opuesta a la descartada */
  preferida?: Estrategia
  /** Veces que se ha pulsado «No encaja» en esta tarea: cambia la semilla del mazo */
  vuelta: number
}

const MAX_TAREAS = 60
const MAX_PLANTILLAS = 60

export const claveTarea = (tarea: string) =>
  tarea.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9ñ\s]/g, ' ').replace(/\s+/g, ' ').trim()

/** Guarda el reto rechazado en «retos fallidos» de su tarea (devuelve el registro nuevo). */
export function descartarReto(
  registro: RetosFallidos | undefined,
  tarea: string,
  reto: { plantilla?: string; estrategia?: Estrategia },
  categoria?: string,
): RetosFallidos {
  const clave = claveTarea(tarea)
  const antes = registro?.[clave]
  const fallido: Fallido = {
    plantillas: [...(antes?.plantillas ?? []), ...(reto.plantilla ? [reto.plantilla] : [])].slice(-MAX_PLANTILLAS),
    estrategias: [...(antes?.estrategias ?? []), ...(reto.estrategia ? [reto.estrategia] : [])].slice(-MAX_PLANTILLAS),
    ...((categoria ?? antes?.categoria) && { categoria: categoria ?? antes?.categoria }),
    t: Date.now(),
  }
  const todos = Object.entries({ ...registro, [clave]: fallido })
    .sort(([, a], [, b]) => b.t - a.t)
    .slice(0, MAX_TAREAS)
  return Object.fromEntries(todos)
}

/** Opciones para generar los retos de una tarea con lo que ya falló. */
export function opcionesDe(registro: RetosFallidos | undefined, tarea: string): OpcionesMotor | undefined {
  const f = registro?.[claveTarea(tarea)]
  if (!f) return undefined
  const ultima = f.estrategias[f.estrategias.length - 1]
  return {
    descartadas: new Set(f.plantillas),
    ...(ultima && { estrategiaDescartada: ultima, preferida: OPUESTA[ultima] }),
    vuelta: f.plantillas.length,
  }
}
