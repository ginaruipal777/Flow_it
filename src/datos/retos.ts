import type { Categoria } from '../components/Icono/iconos'
import { NOMBRE_CATEGORIA, ORDEN_TIPOS, type Reto, type Tarea } from './modelo'
import { analizarTarea, GATILLO_DE_CARTA, pasosDe, tono } from './reglas'

/* Los retos salen de las reglas del «Sistema de Retos V2» y del sistema de frases propio (ver reglas.ts):
   regla o plantilla → reto base → un tono por carta, más sus micropasos y el criterio de éxito. */

export function generarRetos(tarea: Pick<Tarea, 'texto'> & Partial<Pick<Tarea, 'esfuerzo'>>): Reto[] {
  const analisis = analizarTarea(tarea.texto)
  let { base, hecho } = analisis
  let pasos = pasosDe(base)

  /* Si la tarea pesa mucho, el reto es solo el primer paso: con menos esfuerzo
     cuesta menos arrancar (teoría de regulación del estado, Isaac et al., 2024). */
  if (tarea.esfuerzo === 'pesado' && pasos.length > 1) {
    base = pasos[0]
    pasos = [pasos[0]]
    hecho = 'has hecho este paso'
  }

  return ORDEN_TIPOS.map((tipo, i) => ({
    tipo,
    numero: String(i + 1).padStart(2, '0'),
    titulo: tono(base, GATILLO_DE_CARTA[tipo]),
    pasos,
    hecho,
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
