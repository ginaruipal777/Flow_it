import type { Categoria } from '../components/Icono/iconos'
import { ORDEN_TIPOS, type Reto, type Tarea } from './modelo'

/* Sin servidor todavía: los retos se generan aquí.
   Para la tarea de ejemplo del prototipo se usan los textos de la colección
   «Reto · Datos» de Figma; para el resto, plantillas por tipo (sistema INCUP). */

const RETOS_EJEMPLO: Omit<Reto, 'tipo' | 'numero'>[] = [
  { titulo: 'Abre el borrador y escribe solo el saludo.', primerPaso: 'Escribe «Hola, Carlos» y para ahí.' },
  { titulo: 'Resume tu respuesta en tres frases. Ni una más.', primerPaso: 'Escribe solo la primera frase.' },
  { titulo: 'Empieza por lo que de verdad quieres decirle.', primerPaso: 'Anota esa idea en una línea, sin pulir.' },
  { titulo: 'Relee su email y busca la pregunta clave.', primerPaso: 'Copia esa pregunta en el borrador.' },
  { titulo: 'Contesta ahora, antes de abrir nada más.', primerPaso: 'Pulsa «Responder» y escribe la primera palabra.' },
]

const PLANTILLAS: Omit<Reto, 'tipo' | 'numero'>[] = [
  { titulo: 'Haz solo el primer gesto. Nada más.', primerPaso: 'Prepara lo que necesitas y déjalo a la vista.' },
  { titulo: 'Pon 5 minutos y para cuando suene.', primerPaso: 'Activa el temporizador y empieza ya.' },
  { titulo: 'Empieza por la parte que más te apetece.', primerPaso: 'Elige esa parte y escríbela en una línea.' },
  { titulo: 'Busca una cosa de esta tarea que no sepas.', primerPaso: 'Apunta la pregunta y busca la respuesta.' },
  { titulo: 'Hazlo ahora, antes de abrir nada más.', primerPaso: 'Deja el móvil boca abajo y empieza.' },
]

export function esEjemplo(texto: string) {
  return /email de carlos/i.test(texto)
}

export function generarRetos(tarea: Pick<Tarea, 'texto'>): Reto[] {
  const base = esEjemplo(tarea.texto) ? RETOS_EJEMPLO : PLANTILLAS
  return ORDEN_TIPOS.map((tipo, i) => ({ tipo, numero: String(i + 1).padStart(2, '0'), ...base[i] }))
}

const PALABRAS: [RegExp, Categoria][] = [
  [/email|correo|informe|reuni|jefe|cliente|proyecto|trabajo|oficina/i, 'trabajo'],
  [/estudi|examen|apuntes|clase|deberes|leer|tesis|tfg/i, 'estudios'],
  [/llama|tel[eé]fono|dentista|cita|m[eé]dico/i, 'llamadas'],
  [/perro|gato|mascota|veterin/i, 'mascotas'],
  [/compra|cocina|comida|cena|comer|receta/i, 'alimentacion'],
  [/correr|gimnasio|gym|deporte|entrenar|yoga|andar/i, 'deporte'],
  [/limpi|ordenar|escritorio|barrer|fregar|aspirar/i, 'limpieza'],
  [/ropa|lavadora|casa|piso|cama|plantas/i, 'casa'],
  [/amig|quedar|fiesta|cumple|mensaje|familia/i, 'social'],
  [/ducha|dormir|descansar|meditar|autocuidado|crema/i, 'autocuidado'],
]

/** Detección automática de categoría (se puede cambiar en la pantalla de selección). */
export function detectarCategoria(texto: string): Categoria {
  return PALABRAS.find(([re]) => re.test(texto))?.[1] ?? 'trabajo'
}

/** «responder el email de Carlos» -> partes para el título partido en dos líneas. */
export function tituloTarea(texto: string) {
  const limpio = texto.trim().replace(/\.$/, '')
  return limpio.charAt(0).toLowerCase() + limpio.slice(1)
}

const ARTICULOS = /^(el|la|los|las|un|una|unos|unas|al|del|a|mi|mis|tu|tus)$/i

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
