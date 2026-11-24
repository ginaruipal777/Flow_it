import flechaDerecha from '../../assets/iconos/ui/flecha-derecha.svg?raw'
import acentosCarta from '../../assets/iconos/ui/acentos-carta.svg?raw'
import flechaOnboarding from '../../assets/iconos/ui/flecha-onboarding.svg?raw'
import accionAceptar from '../../assets/iconos/ui/accion-aceptar.svg?raw'
import accionRechazar from '../../assets/iconos/ui/accion-rechazar.svg?raw'
import microfono from '../../assets/iconos/ui/microfono.svg?raw'
import usuario from '../../assets/iconos/ui/usuario.svg?raw'
import volver from '../../assets/iconos/ui/volver.svg?raw'
import lapiz from '../../assets/iconos/ui/lapiz.svg?raw'
import cerrar from '../../assets/iconos/ui/cerrar.svg?raw'
import check from '../../assets/iconos/ui/check.svg?raw'
import enviar from '../../assets/iconos/ui/enviar.svg?raw'
import play from '../../assets/iconos/ui/play.svg?raw'
import pausa from '../../assets/iconos/ui/pausa.svg?raw'
import seguir from '../../assets/iconos/ui/seguir.svg?raw'
import tick from '../../assets/iconos/ui/tick.svg?raw'
import tickGrande from '../../assets/iconos/ui/tick-grande.svg?raw'
import estrella from '../../assets/iconos/ui/estrella.svg?raw'
import reiniciar from '../../assets/iconos/ui/reiniciar.svg?raw'
import altavoz from '../../assets/iconos/ui/altavoz.svg?raw'

import ligero from '../../assets/iconos/esfuerzo/ligero.svg?raw'
import medio from '../../assets/iconos/esfuerzo/medio.svg?raw'
import pesado from '../../assets/iconos/esfuerzo/pesado.svg?raw'

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
import higiene from '../../assets/iconos/categoria/higiene.svg?raw'

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
  higiene,
} as const

export const ICONOS_TIPO = { novedad, desafio, pasion, interes, urgencia } as const

export const ICONOS_ESFUERZO = { ligero, medio, pesado } as const

export const ICONOS_UI = {
  'flecha-derecha': flechaDerecha,
  'acentos-carta': acentosCarta,
  'flecha-onboarding': flechaOnboarding,
  'accion-aceptar': accionAceptar,
  'accion-rechazar': accionRechazar,
  microfono,
  usuario,
  volver,
  lapiz,
  cerrar,
  check,
  enviar,
  play,
  pausa,
  seguir,
  tick,
  'tick-grande': tickGrande,
  estrella,
  reiniciar,
  altavoz,
} as const

export type Categoria = keyof typeof ICONOS_CATEGORIA
