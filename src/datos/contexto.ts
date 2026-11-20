/* ─────────────────────────────────────────────────────────────
   Preguntas de contexto: 3 preguntas con 3 opciones antes de buscar (api/micro_paso.py,
   generar_preguntas_contexto). Las respuestas:
   - afinan la búsqueda (sus palabras se añaden a la consulta),
   - fijan el objeto de los retos: solo el que la persona ha dicho que tiene (ubicuidad),
   - dan la fase («hacer un test» → «Contesta la primera pregunta…») o la zona,
   - el lugar donde está («desde la cama»),
   - y el bloqueo, que ordena las cartas INCUP (miedo → Urgencia y Pasión primero).
   ───────────────────────────────────────────────────────────── */

import type { TipoReto } from '../components/CartaReto/tipos'

export type OpcionContexto = {
  id: string
  texto: string
  icono: string
  busqueda?: string
  /** Herramienta elegida («la app del móvil») y su verbo de contacto mínimo («Abre») */
  objeto?: string
  verbo?: string
  tipo?: 'digital' | 'fisico'
  /** Núcleos por nivel con {objeto}, {tema} o {zona} («Contesta la primera pregunta de {objeto}») */
  fase?: { medio?: string; ligero?: string }
  /** Dónde está la persona («desde la cama») */
  lugar?: string
  /** Zona de la casa («el fregadero») */
  zona?: string
  /** Qué le frena: miedo, aburrimiento, nose, cansancio, agobio, pereza, ansiedad, verguenza */
  bloqueo?: string
}

export type PreguntaContexto = { id: string; texto: string; opciones: OpcionContexto[] }

/** Lo elegido, junto, listo para el motor de retos */
export type Eleccion = Omit<OpcionContexto, 'id' | 'texto' | 'icono' | 'busqueda'>

export function eleccionDe(opciones: OpcionContexto[] | undefined): Eleccion | undefined {
  if (!opciones?.length) return undefined
  const e: Eleccion = {}
  for (const o of opciones) {
    if (o.objeto) Object.assign(e, { objeto: o.objeto, verbo: o.verbo, tipo: o.tipo })
    else if (o.tipo && !e.tipo) e.tipo = o.tipo
    if (o.fase) e.fase = o.fase
    if (o.lugar) e.lugar = o.lugar
    if (o.zona) e.zona = o.zona
    if (o.bloqueo) e.bloqueo = o.bloqueo
  }
  return e
}

/** Orden de las cartas según lo que frena a la persona */
export const ORDEN_BLOQUEO: Record<string, TipoReto[]> = {
  miedo: ['urgencia', 'pasion', 'desafio', 'interes', 'novedad'],
  aburrimiento: ['novedad', 'pasion', 'desafio', 'interes', 'urgencia'],
  nose: ['desafio', 'interes', 'novedad', 'pasion', 'urgencia'],
  cansancio: ['pasion', 'interes', 'urgencia', 'novedad', 'desafio'],
  agobio: ['desafio', 'urgencia', 'pasion', 'interes', 'novedad'],
  pereza: ['urgencia', 'desafio', 'pasion', 'novedad', 'interes'],
  ansiedad: ['pasion', 'interes', 'novedad', 'desafio', 'urgencia'],
  verguenza: ['interes', 'pasion', 'desafio', 'novedad', 'urgencia'],
}
