/* Integración con la Guía Maestra de Retos (Google Sheets vía Apps Script).
   1. Antes de buscar en internet, se mira si la tarea ya está en la hoja (GET ?tarea=…):
      si trae pasos u objetos reales, nos ahorramos la búsqueda y la pregunta sale con eso.
   2. Al terminar de preguntar, se guarda la fila completa (POST): la pantalla de retos
      espera a que termine, así la hoja y lo que ve la persona van siempre a la vez. */

import type { MicroPasoWeb } from './modelo.ts'
import { preguntasDe } from './contexto.ts'
import { retosDe, tipoDe, type RetoCarta } from './reglas.ts'

const URL_SHEET = 'https://script.google.com/macros/s/AKfycbytxPbRh349fLni8cgtIIrIUl4rgy26E2Ocli7pH_-gxyRav6DUzsseU-Jke_QuO_jDuQ/exec'

export type FilaSheet = {
  ID_Tarea: string
  Tarea: string
  Dominio: string
  Es_Digital: 'Verdadero' | 'Falso'
  Preg_1_Titulo: string
  Preg_1_Opciones: string
  Preg_2_Titulo: string
  Preg_2_Opciones: string
  Preg_3_Titulo: string
  Preg_3_Opciones: string
  Secuencia_Pasos_Reales: string
  Objetos_Ubicuos: string
  Hacks_Neurodivergentes_TDAH: string
  Acompanamiento_BodyDoubling_Musica: string
  Formula_Reto_Pesado_Chill: string
  Formula_Reto_Medio_Inicio: string
  Formula_Reto_Ligero_Bloque: string
  Modificador_INCUP_Novedad: string
  Modificador_INCUP_Desafio_Pasion: string
}

const NO_APLICA = 'No aplica'

function carta(retos: RetoCarta[], tipo: RetoCarta['tipo']): string {
  return retos.find((r) => r.tipo === tipo)?.titulo.replace(/\.$/, '') ?? ''
}

/** Construye la fila con lo que ya sabe la app de esta tarea (sin volver a buscar nada). */
export function filaDe(texto: string, dominio: string, web?: MicroPasoWeb): FilaSheet {
  const preguntas = preguntasDe(texto, { metodos: web?.metodos, materiales: web?.materiales, requiereLugar: web?.requiereLugar })
  const p = (i: number) => preguntas[i]
  const pesado = retosDe(texto, 'pesado', 0, web)
  const medio = retosDe(texto, 'medio', 0, web)
  const ligero = retosDe(texto, 'ligero', 0, web)
  return {
    ID_Tarea: '',
    Tarea: texto,
    Dominio: dominio,
    Es_Digital: tipoDe(texto, web) === 'digital' ? 'Verdadero' : 'Falso',
    Preg_1_Titulo: p(0)?.texto ?? NO_APLICA,
    Preg_1_Opciones: p(0)?.opciones.map((o) => o.texto).join(' | ') ?? '',
    Preg_2_Titulo: p(1)?.texto ?? NO_APLICA,
    Preg_2_Opciones: p(1)?.opciones.map((o) => o.texto).join(' | ') ?? '',
    Preg_3_Titulo: p(2)?.texto ?? NO_APLICA,
    Preg_3_Opciones: p(2)?.opciones.map((o) => o.texto).join(' | ') ?? '',
    Secuencia_Pasos_Reales: (web?.pasos ?? []).map((paso, i) => `${i + 1}. ${paso}`).join('; '),
    Objetos_Ubicuos: (web?.materiales ?? []).join('; '),
    Hacks_Neurodivergentes_TDAH: [web?.estrategia, ...(web?.tecnicas ?? [])].filter(Boolean).join('; '),
    Acompanamiento_BodyDoubling_Musica: [carta(medio, 'pasion'), carta(medio, 'interes')].filter(Boolean).join('; '),
    Formula_Reto_Pesado_Chill: carta(pesado, 'urgencia'),
    Formula_Reto_Medio_Inicio: carta(medio, 'urgencia'),
    Formula_Reto_Ligero_Bloque: carta(ligero, 'urgencia'),
    Modificador_INCUP_Novedad: carta(medio, 'novedad'),
    Modificador_INCUP_Desafio_Pasion: [carta(medio, 'desafio'), carta(medio, 'pasion')].join(' / '),
  }
}

/** Envía la fila a la hoja; la pantalla de retos espera esta respuesta antes de mostrarse.
    true si se guardó, false si falló (sin conexión, CORS, el script caído…). */
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
    viniera de la búsqueda en internet. undefined si no está, o si está pero vacía (una fila
    guardada sin búsqueda real: no sirve como caché). */
export async function buscarEnSheet(tarea: string): Promise<MicroPasoWeb | undefined> {
  try {
    const r = await fetch(`${URL_SHEET}?tarea=${encodeURIComponent(tarea)}`)
    if (!r.ok) return undefined
    const datos = (await r.json()) as { found?: boolean; data?: FilaSheet }
    const fila = datos.found ? datos.data : undefined
    if (!fila || (!fila.Secuencia_Pasos_Reales && !fila.Objetos_Ubicuos)) return undefined
    const quitarNumero = (p: string) => p.replace(/^\d+\.\s*/, '')
    const pasos = fila.Secuencia_Pasos_Reales ? fila.Secuencia_Pasos_Reales.split('; ').map(quitarNumero) : []
    const materiales = fila.Objetos_Ubicuos ? fila.Objetos_Ubicuos.split('; ') : []
    const tecnicas = fila.Hacks_Neurodivergentes_TDAH ? fila.Hacks_Neurodivergentes_TDAH.split('; ') : []
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
      ...(tecnicas.length && { tecnicas }),
    }
  } catch {
    return undefined
  }
}
