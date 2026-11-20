import type { Categoria } from '../components/Icono/iconos'
import type { TipoReto } from '../components/CartaReto/tipos'
import type { Estrategia } from './descartes'
import type { OpcionContexto } from './contexto'

export type Esfuerzo = 'ligero' | 'medio' | 'pesado'

export type EstadoTarea = 'en-curso' | 'a-medias' | 'completada'

export type Tarea = {
  id: string
  texto: string
  categoria: Categoria
  esfuerzo: Esfuerzo
  /** Retos conseguidos en esta tarea. */
  retos: number
  estado: EstadoTarea
  /** Tipo del último reto aceptado (da color a la tarjeta de «Retomar»). */
  ultimoTipo: TipoReto
  actualizada: number
  /** Premio que la persona elige para cuando consiga el reto (método RAN: Recompensa). */
  premio?: string
  /** Primer paso encontrado en internet (solo tareas sin categoría; ver api/micro_paso.py). */
  web?: MicroPasoWeb
}

export type MicroPasoWeb = {
  /** «Examen teórico de la DGT» */
  contexto: string
  /** «Solo abre la app de test autoescuela» (sin punto final) */
  microPaso: string
  /** «la app de test autoescuela» */
  objeto: string
  tipo: 'digital' | 'fisico'
  /** Nivel de esfuerzo para el que se calculó el micro-paso */
  nivel: Esfuerzo
  /** Consejo para arrancar sacado de understood.org (redactado por la app) */
  estrategia?: string
  fuenteEstrategia?: string
  /** Web oficial del trámite (lista fija de api/micro_paso.py) */
  enlace?: string
  /** true si la búsqueda encontró una herramienta concreta (la app del test, la web oficial…) */
  fiable?: boolean
  /** Categoría de la app reconocida con lo que encontró la búsqueda («Cocina») */
  categoria?: string
  /** Verbo principal de la tarea («descalcificar», «limpiar», «estudiar»…) */
  verboTarea?: string
  /** Verbo del primer paso en imperativo («Abre», «Vacía», «Coge»…) para el motor de retos */
  verboAccion?: string
  /** Pasos reales de la guía encontrada, ya limpios («Retira las rejillas»…): ver pasos.ts */
  pasos?: string[]
  /** Materiales y herramientas que nombran las webs («la esterilla», «el rodillo») */
  materiales?: string[]
  /** Técnicas que recomiendan las webs («Repasa sin mirar tus notas») */
  tecnicas?: string[]
  /** Lo que contestó la persona en las preguntas de contexto (contexto.ts) */
  eleccion?: OpcionContexto[]
}

export type Reto = {
  tipo: TipoReto
  numero: string
  titulo: string
  /** Micropasos del reto (se marcan en el detalle). */
  pasos: string[]
  /** Criterio de éxito: «Está hecho cuando …». */
  hecho: string
  /** Frase de permiso del nivel («Con eso ya cuenta.») */
  permiso?: string
  /** Si el reto es un método para TDAH: su nombre y la web de la que sale */
  metodo?: { nombre: string; fuente: { nombre: string; url: string } }
  /** Plantilla del motor de la que sale (para «No encaja», descartes.ts) */
  plantilla?: string
  /** Estrategia del reto: mecánica, informativa, emocional o social */
  estrategia?: Estrategia
}

export type Mazo = {
  categoria: Categoria
  nombre: string
  cartas: TipoReto[]
}

export const NOMBRE_CATEGORIA: Record<Categoria, string> = {
  trabajo: 'Trabajo',
  estudios: 'Estudios',
  limpieza: 'Limpieza',
  deporte: 'Deporte',
  autocuidado: 'Autocuidado',
  llamadas: 'Llamadas',
  casa: 'Casa',
  alimentacion: 'Alimentación',
  mascotas: 'Mascotas',
  social: 'Social',
}

export const ORDEN_TIPOS: TipoReto[] = ['novedad', 'desafio', 'pasion', 'interes', 'urgencia']
