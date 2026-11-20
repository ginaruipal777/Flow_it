/* Integración con la Guía Maestra de Retos (Google Sheets vía Apps Script).
   Cada tarea nueva envía una fila con las 19 columnas de la hoja, para ir construyendo
   una base de datos de tareas y retos reales. Si falla (sin conexión, CORS…) no bloquea
   nada: es «fire and forget», igual que el resto de llamadas a la web. */

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

/** Envía la fila a la hoja. No bloquea ni avisa si falla: solo va construyendo la base de datos. */
export function guardarEnSheet(fila: FilaSheet): void {
  try {
    fetch(URL_SHEET, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // evita el preflight CORS en Apps Script
      body: JSON.stringify(fila),
    }).catch(() => {})
  } catch {
    /* sin conexión o bloqueado: no pasa nada, es solo un registro adicional */
  }
}
