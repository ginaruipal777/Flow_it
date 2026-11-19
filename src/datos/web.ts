import type { Esfuerzo, MicroPasoWeb } from './modelo'
import type { Categoria } from '../components/Icono/iconos'
import { catalogarConWeb } from './reglas'
import type { Filtro } from './filtros'

/* Llamada a la función api/micro_paso.py (Vercel): busca en internet cómo se hace la tarea.
   Con lo encontrado la app cataloga la tarea (si sus palabras no bastan) y, si la búsqueda
   encontró una herramienta concreta, la usa en los retos. Si falla o tarda más de 30 s,
   la app sigue con lo que sabe sin conexión. */

const LIMITE_MS = 30_000

type Respuesta =
  | {
      status: 'success'
      tarea_original: string
      contexto: string
      micro_paso: string
      categoria: string
      objeto: string
      tipo_objeto: 'digital' | 'fisico'
      origen: 'web' | 'oficial' | 'respaldo' | 'emergencia'
      enlace?: string | null
      resumen?: string
      estrategia?: string | null
      fuente_estrategia?: string | null
    }
  | Exclude<Filtro, { status: 'ok' }>

export type ResultadoWeb =
  | { status: 'success'; web: MicroPasoWeb; icono?: Categoria }
  | Exclude<Filtro, { status: 'ok' }>
  | { status: 'sin-conexion' }

/* Búsquedas guardadas en el móvil: repetir una tarea es instantáneo y no gasta búsquedas.
   Duran 7 días; se guardan como mucho las 60 últimas. */
const CLAVE_GUARDADAS = 'flowit:busquedas:v1'
const DURACION_MS = 7 * 24 * 3600_000
const MAXIMO_GUARDADAS = 60
type Guardada = { t: number; r: Extract<ResultadoWeb, { status: 'success' }> }

const claveDe = (tarea: string, esfuerzo: Esfuerzo) =>
  `${esfuerzo}|${tarea.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim()}`

function leerGuardadas(): Record<string, Guardada> {
  try {
    return JSON.parse(localStorage.getItem(CLAVE_GUARDADAS) ?? '{}') as Record<string, Guardada>
  } catch {
    return {}
  }
}

function guardar(clave: string, r: Guardada['r']) {
  try {
    const todas = Object.entries({ ...leerGuardadas(), [clave]: { t: Date.now(), r } })
      .filter(([, g]) => Date.now() - g.t < DURACION_MS)
      .sort(([, a], [, b]) => b.t - a.t)
      .slice(0, MAXIMO_GUARDADAS)
    localStorage.setItem(CLAVE_GUARDADAS, JSON.stringify(Object.fromEntries(todas)))
  } catch {
    /* sin almacenamiento: no pasa nada, se vuelve a buscar */
  }
}

/** Busca cómo se hace la tarea (o usa la búsqueda guardada si se hizo hace menos de 7 días) */
export async function buscarMicroPaso(tarea: string, esfuerzo: Esfuerzo, senal?: AbortSignal): Promise<ResultadoWeb> {
  const clave = claveDe(tarea, esfuerzo)
  const guardada = leerGuardadas()[clave]
  if (guardada && Date.now() - guardada.t < DURACION_MS) return guardada.r
  const resultado = await buscarEnServidor(tarea, esfuerzo, senal)
  if (resultado.status === 'success') guardar(clave, resultado)
  return resultado
}

async function buscarEnServidor(tarea: string, esfuerzo: Esfuerzo, senal?: AbortSignal): Promise<ResultadoWeb> {
  // Se cancela al pulsar «Saltar la búsqueda» o a los 30 s (AbortSignal.any no existe en móviles antiguos)
  const control = new AbortController()
  const reloj = setTimeout(() => control.abort(), LIMITE_MS)
  senal?.addEventListener('abort', () => control.abort())
  const cancelar = control.signal
  try {
    const r = await fetch(`${import.meta.env.BASE_URL}api/micro_paso`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tarea, esfuerzo }),
      signal: cancelar,
    })
    if (!r.ok || !(r.headers.get('content-type') ?? '').includes('json')) return { status: 'sin-conexion' }
    const datos = (await r.json()) as Respuesta
    if (datos.status !== 'success') return datos
    if (datos.origen === 'emergencia') return { status: 'sin-conexion' }
    const fiable = datos.origen === 'web' || datos.origen === 'oficial'
    const catalogo = catalogarConWeb(tarea, datos.resumen ?? '')
    if (!fiable && !catalogo) return { status: 'sin-conexion' }
    return {
      status: 'success',
      ...(catalogo && { icono: catalogo.icono }),
      web: {
        fiable,
        ...(catalogo && { categoria: catalogo.categoria }),
        contexto: datos.contexto,
        microPaso: datos.micro_paso.replace(/\.$/, ''),
        objeto: datos.objeto,
        tipo: datos.tipo_objeto,
        nivel: esfuerzo,
        ...(datos.estrategia && { estrategia: datos.estrategia }),
        ...(datos.fuente_estrategia && { fuenteEstrategia: datos.fuente_estrategia }),
        ...(datos.enlace && { enlace: datos.enlace }),
      },
    }
  } catch {
    return { status: 'sin-conexion' }
  } finally {
    clearTimeout(reloj)
  }
}
