import type { CSSProperties } from 'react'
import './Icono.css'

type Props = {
  svg: string
  /** Lado en px. Sin él, el SVG usa su tamaño nativo de Figma. */
  tamano?: number
  className?: string
  style?: CSSProperties
}

export function Icono({ svg, tamano, className, style }: Props) {
  const escalado = tamano !== undefined
  return (
    <span
      aria-hidden="true"
      className={['icono', escalado && 'icono--escalado', className].filter(Boolean).join(' ')}
      style={escalado ? { width: tamano, height: tamano, ...style } : style}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}
