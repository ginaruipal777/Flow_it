import { useEffect, useRef } from 'react'
import './Preparando.css'

/* Pantalla de carga mientras la app prepara los retos:
   1. busca en internet cómo se hace la tarea,
   2. la reconoce (categoría),
   3. mira cuánto le pesa a la persona,
   4. elige los retos.
   Cada paso enseña lo que ha encontrado. Mientras busca, se puede saltar la búsqueda. */

export type PasoPreparando = { titulo: string; detalle?: string }

export function Preparando({
  tarea,
  pasos,
  actual,
  onSaltar,
}: {
  tarea: string
  pasos: PasoPreparando[]
  /** Índice del paso en marcha (los anteriores están hechos) */
  actual: number
  /** Solo durante la búsqueda */
  onSaltar?: () => void
}) {
  const titulo = useRef<HTMLHeadingElement>(null)
  useEffect(() => titulo.current?.focus(), [])

  return (
    <div className="preparando" role="dialog" aria-modal="true" aria-labelledby="preparando-titulo">
      <div className="preparando__caja">
        <span className="preparando__girando" aria-hidden="true" />
        <h2 id="preparando-titulo" ref={titulo} tabIndex={-1} className="t-titular-m preparando__titulo">
          Preparando tus retos
        </h2>
        <p className="t-texto-cuerpo preparando__tarea">«{tarea}»</p>

        <ol className="preparando__pasos" aria-live="polite">
          {pasos.map((p, i) => {
            const estado = i < actual ? 'hecho' : i === actual ? 'ahora' : 'luego'
            return (
              <li key={p.titulo} className="preparando__paso" data-estado={estado}>
                <span className="preparando__marca" aria-hidden="true">
                  {estado === 'hecho' ? '✓' : i + 1}
                </span>
                <span>
                  <span className="t-texto-control">{p.titulo}</span>
                  {estado === 'hecho' && p.detalle && <span className="t-texto-cuerpo-s preparando__detalle">{p.detalle}</span>}
                </span>
              </li>
            )
          })}
        </ol>

        {onSaltar && (
          <button type="button" className="preparando__saltar t-texto-control" onClick={onSaltar}>
            Saltar la búsqueda
          </button>
        )}
      </div>
    </div>
  )
}
