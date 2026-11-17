import type { Categoria } from '../components/Icono/iconos'
import type { TipoReto } from '../components/CartaReto/tipos'

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
}

export type Reto = {
  tipo: TipoReto
  numero: string
  titulo: string
  primerPaso: string
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
