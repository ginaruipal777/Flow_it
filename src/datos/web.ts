import type { Esfuerzo, MicroPasoWeb } from './modelo'
import type { Categoria } from '../components/Icono/iconos'
import { catalogarConWeb } from './reglas'
import { filtrarTarea, type Filtro } from './filtros'
import { materialesDe, metodosDe, pasosDe, tecnicasDe, type LineaLista, type LineaPaso } from './pasos'

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
      verbo_tarea?: string | null
      verbo_accion?: string | null
      lineas_pasos?: LineaPaso[]
      lineas_listas?: LineaLista[]
      requiere_lugar?: boolean
      lugar_probable?: string
    }
  | Exclude<Filtro, { status: 'ok' }>

export type ResultadoWeb =
  | { status: 'success'; web: MicroPasoWeb; icono?: Categoria }
  | Exclude<Filtro, { status: 'ok' }>
  | { status: 'sin-conexion' }

/* Búsquedas guardadas en el móvil: repetir una tarea es instantáneo y no gasta búsquedas.
   Duran 7 días; se guardan como mucho las 60 últimas. */
// v2: búsquedas con las reglas de relevancia y los pasos, materiales y técnicas (las de v1 no los tienen)
const CLAVE_GUARDADAS = 'flowit:busquedas:v2'
try {
  localStorage.removeItem('flowit:busquedas:v1')
} catch {
  /* sin almacenamiento */
}
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

/* Vocabulario acumulado: aprende de búsquedas anteriores y mejora los retos con el tiempo.
   Indexado por tarea normalizada y por verbo (descalcificar, limpiar…). 30 días, 200 entradas. */
const CLAVE_VOC = 'flowit:vocabulario:v1'
const DURACION_VOC_MS = 30 * 24 * 3600_000
const MAX_VOC = 200
type EntradaVoc = { t: number; objeto: string; microPaso: string; tipo: 'digital' | 'fisico'; verboTarea?: string }

function guardarVocabulario(tarea: string, web: MicroPasoWeb): void {
  if (!web.fiable) return
  try {
    const store = JSON.parse(localStorage.getItem(CLAVE_VOC) ?? '{}') as Record<string, EntradaVoc>
    const entrada: EntradaVoc = { t: Date.now(), objeto: web.objeto, microPaso: web.microPaso, tipo: web.tipo, ...(web.verboTarea && { verboTarea: web.verboTarea }) }
    store[`t:${claveDe(tarea, web.nivel)}`] = entrada
    if (web.verboTarea) {
      const cv = `v:${web.verboTarea.toLowerCase()}`
      if (!store[cv] || entrada.t > store[cv].t) store[cv] = entrada
    }
    const limpio = Object.entries(store)
      .filter(([, v]) => Date.now() - v.t < DURACION_VOC_MS)
      .sort(([, a], [, b]) => b.t - a.t)
      .slice(0, MAX_VOC)
    localStorage.setItem(CLAVE_VOC, JSON.stringify(Object.fromEntries(limpio)))
  } catch {}
}

/** Busca cómo se hace la tarea (o usa la búsqueda guardada si se hizo hace menos de 7 días).
    Con el resultado, la app saca las 3 preguntas de contexto (contexto.ts, preguntasDe): siempre
    tienen que ver con ESTA tarea, porque salen de lo que encontró la búsqueda. */
export async function buscarMicroPaso(tarea: string, esfuerzo: Esfuerzo, senal?: AbortSignal): Promise<ResultadoWeb> {
  const clave = claveDe(tarea, esfuerzo)
  const guardada = leerGuardadas()[clave]
  if (guardada && Date.now() - guardada.t < DURACION_MS) return guardada.r
  const resultado = await buscarEnServidor(tarea, esfuerzo, senal)
  if (resultado.status === 'success') {
    guardar(clave, resultado)
    guardarVocabulario(tarea, resultado.web)
  }
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
    // Lo que llega de internet pasa el mismo filtro de seguridad que la tarea
    if (filtrarTarea(datos.objeto, true).status === 'blocked') return { status: 'sin-conexion' }
    // Pasos reales de la guía encontrada (pasos.ts). Con 2 o más, la búsqueda ya es fiable:
    // los retos se montan con ellos aunque no se reconociera ninguna herramienta.
    const pasos = pasosDe(datos.lineas_pasos)
    // Y lo que recomiendan sus listas: materiales («la esterilla») y técnicas («Repasa sin mirar tus notas»)
    const materiales = materialesDe(datos.lineas_listas)
    const tecnicas = tecnicasDe(datos.lineas_listas)
    // Métodos que comparan las guías («Cafetera de filtro», «Prensa francesa»): para preguntar «¿Cómo lo haces?»
    const metodos = metodosDe(datos.lineas_pasos, datos.lineas_listas, tarea)
    const conHerramienta = datos.origen === 'web' || datos.origen === 'oficial'
    const fiable = conHerramienta || pasos.length >= 2 || materiales.length >= 2 || tecnicas.length >= 2
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
        // Sin herramienta reconocida, el objeto del servidor es un comodín («la web de…»): no vale
        objeto: conHerramienta ? datos.objeto : '',
        tipo: conHerramienta ? datos.tipo_objeto : 'fisico',
        ...(pasos.length && { pasos }),
        ...(materiales.length && { materiales }),
        ...(tecnicas.length && { tecnicas }),
        ...(metodos.length >= 2 && { metodos }),
        nivel: esfuerzo,
        ...(datos.verbo_tarea && { verboTarea: datos.verbo_tarea }),
        ...(datos.verbo_accion && { verboAccion: datos.verbo_accion }),
        ...(datos.requiere_lugar !== undefined && { requiereLugar: datos.requiere_lugar }),
        ...(datos.lugar_probable && { lugarProbable: datos.lugar_probable }),
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
