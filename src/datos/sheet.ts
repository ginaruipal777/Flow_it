/* Integración con la Guía Maestra de Retos (Google Sheets vía Apps Script).
   1. Antes de buscar en internet, se mira si la tarea ya está en la hoja (GET ?tarea=…):
      si trae objetos reales, nos ahorramos la búsqueda y la pregunta sale con eso.
   2. Al terminar de preguntar, se guarda la fila (POST) en segundo plano, en una pestaña
      aparte de las 20 filas guía: si falla, no afecta a la app. */

import type { MicroPasoWeb } from './modelo.ts'
import { PLAZO } from './banco.ts'
import { analizarTarea, retosDe, tipoDe, type RetoCarta } from './reglas.ts'

const URL_SHEET = 'https://script.google.com/macros/s/AKfycbytxPbRh349fLni8cgtIIrIUl4rgy26E2Ocli7pH_-gxyRav6DUzsseU-Jke_QuO_jDuQ/exec'

/* Columnas reales de la Guía Maestra (Mapa Mental V2): cada fila guía combina Lugares,
   Objetos, Situaciones y Tiempos con sus Acciones por nivel y lo que bloquea a la persona. */
export type FilaSheet = {
  ID_Tarea: string
  Tarea: string
  Dominio: string
  Palabras_Clave: string
  Es_Digital: 'Verdadero' | 'Falso'
  Lugares: string
  Objetos: string
  Situaciones: string
  Tiempos: string
  Acciones_Pesado: string
  Acciones_Medio: string
  Acciones_Ligero: string
  Bloqueos: string
}

function carta(retos: RetoCarta[], tipo: RetoCarta['tipo']): string {
  return retos.find((r) => r.tipo === tipo)?.titulo.replace(/\.$/, '') ?? ''
}

/** 2 o 3 variantes de reto de ese nivel, separadas por «|» (mismo formato que las filas guía). */
function accionesDe(retos: RetoCarta[]): string {
  return (['urgencia', 'novedad', 'desafio'] as const).map((t) => carta(retos, t)).filter(Boolean).join(' | ')
}

/** Construye la fila con lo que ya sabe la app de esta tarea (sin volver a buscar nada). */
export function filaDe(texto: string, dominio: string, web?: MicroPasoWeb): FilaSheet {
  const regla = analizarTarea(texto).regla
  const pesado = retosDe(texto, 'pesado', 0, web)
  const medio = retosDe(texto, 'medio', 0, web)
  const ligero = retosDe(texto, 'ligero', 0, web)
  return {
    ID_Tarea: '',
    Tarea: texto,
    Dominio: dominio,
    Palabras_Clave: regla?.palabras.join(', ') ?? '',
    Es_Digital: tipoDe(texto, web) === 'digital' ? 'Verdadero' : 'Falso',
    Lugares: web?.lugarProbable ?? '',
    Objetos: (web?.materiales ?? []).join(' | '),
    Situaciones: (['pasion', 'interes', 'novedad'] as const).map((t) => carta(medio, t)).filter(Boolean).join(' | '),
    Tiempos: `${PLAZO.pesado} | ${PLAZO.medio} | ${PLAZO.ligero}`,
    Acciones_Pesado: accionesDe(pesado),
    Acciones_Medio: accionesDe(medio),
    Acciones_Ligero: accionesDe(ligero),
    Bloqueos: 'Pereza | Cansancio | Me agobia',
  }
}

/** Envía la fila a la hoja, en segundo plano: si falla (sin conexión, Apps Script caído…)
    no afecta a la app ni bloquea los retos. true si se guardó. */
export async function guardarEnSheet(fila: FilaSheet): Promise<boolean> {
  try {
    const r = await fetch(URL_SHEET, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // evita el preflight CORS en Apps Script
      body: JSON.stringify(fila),
    })
    return r.ok
  } catch {
    return false
  }
}

/** Lo que ya sabe la hoja de esta tarea (caché entre dispositivos), reconstruido como si
    viniera de la búsqueda en internet. undefined si no está, o si está pero sin Objetos
    (una fila guardada sin búsqueda real: no sirve como caché). */
export async function buscarEnSheet(tarea: string): Promise<MicroPasoWeb | undefined> {
  try {
    const r = await fetch(`${URL_SHEET}?tarea=${encodeURIComponent(tarea)}`)
    if (!r.ok) return undefined
    const datos = (await r.json()) as { found?: boolean; data?: FilaSheet }
    const fila = datos.found ? datos.data : undefined
    if (!fila?.Objetos) return undefined
    const partir = (s?: string) => (s ? s.split(' | ').filter(Boolean) : [])
    const materiales = partir(fila.Objetos)
    const pasos = partir(fila.Acciones_Medio)
    const tecnicas = partir(fila.Situaciones)
    const lugares = partir(fila.Lugares)
    const bloqueos = partir(fila.Bloqueos)
    const nucleosPesado = partir(fila.Acciones_Pesado)
    const nucleosLigero = partir(fila.Acciones_Ligero)
    return {
      contexto: fila.Tarea,
      microPaso: pasos[0] ?? materiales[0] ?? '',
      objeto: materiales[0] ?? '',
      tipo: fila.Es_Digital === 'Verdadero' ? 'digital' : 'fisico',
      nivel: 'medio',
      fiable: true,
      categoria: fila.Dominio || undefined,
      ...(pasos.length && { pasos }),
      ...(materiales.length && { materiales }),
      ...(tecnicas.length && { tecnicas, situaciones: tecnicas }),
      ...(lugares.length && { requiereLugar: true, lugarProbable: lugares[0], lugares }),
      ...(bloqueos.length && { bloqueos }),
      ...(nucleosPesado.length && { nucleosPesado }),
      ...(pasos.length && { nucleosMedio: pasos }),
      ...(nucleosLigero.length && { nucleosLigero }),
    }
  } catch {
    return undefined
  }
}
