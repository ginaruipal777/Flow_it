import { ICONOS_TIPO } from '../Icono/iconos'

export type TipoReto = keyof typeof ICONOS_TIPO

export const TIPOS_RETO: { id: TipoReto; nombre: string }[] = [
  { id: 'novedad', nombre: 'Novedad' },
  { id: 'desafio', nombre: 'Desafío' },
  { id: 'pasion', nombre: 'Pasión' },
  { id: 'interes', nombre: 'Interés' },
  { id: 'urgencia', nombre: 'Urgencia' },
]
