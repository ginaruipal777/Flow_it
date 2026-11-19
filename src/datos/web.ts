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

export async function buscarMicroPaso(tarea: string, esfuerzo: Esfuerzo, senal?: AbortSignal): Promise<ResultadoWeb> {
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
