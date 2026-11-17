import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Icono } from '../Icono/Icono'
import { ICONOS_UI } from '../Icono/iconos'
import './Boton.css'

/* Botón v3 — Figma 2032:1123
   Estilo: Primario · Secundario · Contorno · Texto
   Tamaño: Grande (56 px) · Pequeño (40 px)
   Estado: Reposo · Pulsado (:active) · Desactivado (disabled, 40 %) */

export type EstiloBoton = 'primario' | 'secundario' | 'contorno' | 'texto'
export type TamanoBoton = 'grande' | 'pequeno'

type Props = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
  estilo?: EstiloBoton
  tamano?: TamanoBoton
  /** Texto del botón (propiedad «Etiqueta» en Figma). */
  children: ReactNode
  /** «Con icono» en Figma. */
  conIcono?: boolean
  /** Intercambio de icono; por defecto la flecha derecha. */
  icono?: string
  /** Fuerza el aspecto «Pulsado» (solo para documentar el sistema). */
  forzarPulsado?: boolean
}

export function Boton({
  estilo = 'primario',
  tamano = 'grande',
  children,
  conIcono = true,
  icono = ICONOS_UI['flecha-derecha'],
  forzarPulsado = false,
  className,
  type = 'button',
  ...resto
}: Props) {
  return (
    <button
      type={type}
      className={['boton', className].filter(Boolean).join(' ')}
      data-estilo={estilo}
      data-tamano={tamano}
      data-pulsado={forzarPulsado || undefined}
      {...resto}
    >
      <span className="boton__etiqueta">{children}</span>
      {conIcono && <Icono svg={icono} tamano={tamano === 'grande' ? 20 : 16} />}
    </button>
  )
}
