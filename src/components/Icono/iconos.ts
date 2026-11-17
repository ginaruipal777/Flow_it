import flechaDerecha from '../../assets/iconos/ui/flecha-derecha.svg?raw'
import acentosCarta from '../../assets/iconos/ui/acentos-carta.svg?raw'

import trabajo from '../../assets/iconos/categoria/trabajo.svg?raw'
import estudios from '../../assets/iconos/categoria/estudios.svg?raw'
import limpieza from '../../assets/iconos/categoria/limpieza.svg?raw'
import deporte from '../../assets/iconos/categoria/deporte.svg?raw'
import autocuidado from '../../assets/iconos/categoria/autocuidado.svg?raw'
import llamadas from '../../assets/iconos/categoria/llamadas.svg?raw'
import casa from '../../assets/iconos/categoria/casa.svg?raw'
import alimentacion from '../../assets/iconos/categoria/alimentacion.svg?raw'
import mascotas from '../../assets/iconos/categoria/mascotas.svg?raw'
import social from '../../assets/iconos/categoria/social.svg?raw'

import novedad from '../../assets/iconos/tipo/novedad.svg?raw'
import desafio from '../../assets/iconos/tipo/desafio.svg?raw'
import pasion from '../../assets/iconos/tipo/pasion.svg?raw'
import interes from '../../assets/iconos/tipo/interes.svg?raw'
import urgencia from '../../assets/iconos/tipo/urgencia.svg?raw'

/* Los SVG se exportaron de Figma con el color cambiado a currentColor:
   el icono toma el `color` de su contenedor (p. ej. var(--carta-linea)). */

export const ICONOS_CATEGORIA = {
  trabajo,
  estudios,
  limpieza,
  deporte,
  autocuidado,
  llamadas,
  casa,
  alimentacion,
  mascotas,
  social,
} as const

export const ICONOS_TIPO = { novedad, desafio, pasion, interes, urgencia } as const

export const ICONOS_UI = { 'flecha-derecha': flechaDerecha, 'acentos-carta': acentosCarta } as const

export type Categoria = keyof typeof ICONOS_CATEGORIA
