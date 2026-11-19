import type { Categoria } from '../components/Icono/iconos'
import { NOMBRE_CATEGORIA, type Reto, type Tarea } from './modelo'
import { analizarTarea, retosDe } from './reglas'
import { leerSituacion } from './situacion'

/* Los retos salen del banco escrito a mano (banco.ts y reglas.ts). El orden de las cartas
   depende de la situación probable de la persona (situacion.ts): primero las que mejor encajan. */

export function generarRetos(tarea: Pick<Tarea, 'texto'> & Partial<Pick<Tarea, 'esfuerzo' | 'web'>>, mazo = 0): Reto[] {
  // Un reto distinto por carta INCUP (ver retosDe en reglas.ts).
  // Cada mazo nuevo de la misma tarea sigue la numeración: 01–05, 06–10…
  const { orden } = leerSituacion(tarea.texto, tarea.esfuerzo)
  const retos = retosDe(tarea.texto, tarea.esfuerzo, mazo, tarea.web)
  return orden
    .map((tipo) => retos.find((r) => r.tipo === tipo)!)
    .map((r, i) => ({
    ...r,
    numero: String(mazo * 5 + i + 1).padStart(2, '0'),
  }))
}

/** Detección automática de categoría (se puede cambiar en la pantalla de selección). */
export function detectarCategoria(texto: string): Categoria {
  return analizarTarea(texto).icono ?? 'trabajo'
}

/** Nombre que se ve en la carta: la categoría de la regla del PDF («Comunicación», «Ver serie»…).
    Si la persona cambió la categoría a mano, o no hay regla, se usa la de la app. */
export function nombreCategoriaReto(tarea: Pick<Tarea, 'texto' | 'categoria'>) {
  const { regla } = analizarTarea(tarea.texto)
  return regla && regla.icono === tarea.categoria ? regla.categoria : NOMBRE_CATEGORIA[tarea.categoria]
}

/** «responder el email de Carlos» -> partes para el título partido en dos líneas. */
export function tituloTarea(texto: string) {
  const limpio = texto.trim().replace(/\.$/, '')
  return limpio.charAt(0).toLowerCase() + limpio.slice(1)
}

const ARTICULOS = /^(el|la|los|las|un|una|unos|unas|al|del|a|mi|mis|tu|tus|para)$/i

/** Versión corta para las cartas: «responder el email de Carlos» -> «email de Carlos». */
export function resumenTarea(texto: string) {
  let palabras = tituloTarea(texto).split(/\s+/)
  if (palabras.length > 3) {
    palabras = palabras.slice(1)
    while (palabras.length > 2 && ARTICULOS.test(palabras[0])) palabras = palabras.slice(1)
  }
  const corto = palabras.join(' ')
  return corto.length > 24 ? corto.slice(0, 23).trimEnd() + '…' : corto
}

export function haceCuanto(ms: number) {
  const min = Math.round((Date.now() - ms) / 60000)
  if (min < 60) return min <= 1 ? 'ahora' : `hace ${min} min`
  const h = Math.round(min / 60)
  if (h < 24) return `hace ${h} h`
  const d = Math.round(h / 24)
  return d === 1 ? 'ayer' : `hace ${d} días`
}
