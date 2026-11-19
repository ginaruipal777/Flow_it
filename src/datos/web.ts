import type { Esfuerzo, MicroPasoWeb } from './modelo'
import type { Filtro } from './filtros'

/* Llamada a la función api/micro_paso.py (Vercel): busca en internet cómo se empieza
   la tarea y devuelve solo el primer paso físico. Solo se usa cuando la tarea no encaja
   en ninguna categoría de la app. Si falla o tarda más de 30 s, la app sigue sin ella. */

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
      origen: 'web' | 'respaldo' | 'emergencia'
      estrategia?: string | null
      fuente_estrategia?: string | null
    }
  | Exclude<Filtro, { status: 'ok' }>

export type ResultadoWeb = { status: 'success'; web: MicroPasoWeb } | Exclude<Filtro, { status: 'ok' }> | { status: 'sin-conexion' }

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
    // Solo sirve si la web aportó algo: el respaldo del servidor ya lo tiene la app
    if (datos.origen !== 'web') return { status: 'sin-conexion' }
    return {
      status: 'success',
      web: {
        contexto: datos.contexto,
        microPaso: datos.micro_paso.replace(/\.$/, ''),
        objeto: datos.objeto,
        tipo: datos.tipo_objeto,
        nivel: esfuerzo,
        ...(datos.estrategia && { estrategia: datos.estrategia }),
        ...(datos.fuente_estrategia && { fuenteEstrategia: datos.fuente_estrategia }),
      },
    }
  } catch {
    return { status: 'sin-conexion' }
  } finally {
    clearTimeout(reloj)
  }
}
