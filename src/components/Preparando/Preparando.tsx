import { useEffect, useRef } from 'react'
import './Preparando.css'

/* Pantalla de carga mientras la app prepara los retos:
   1. busca en internet cómo se hace la tarea,
   2. la reconoce (categoría),
   3. mira cuánto le pesa a la persona,
   4. elige los retos.
   Cada paso enseña lo que ha encontrado. Mientras busca, se puede saltar la búsqueda. */

export type PasoPreparando = { titulo: string; detalle?: string }

/** Pregunta cuando no se encuentra cómo se hace la tarea: «¿De qué tipo es?» */
export type PreguntaTipo = { opciones: { texto: string }[]; onElegir: (indice: number) => void; onSaltar: () => void }

export function Preparando({
  tarea,
  pasos,
  actual,
  onSaltar,
  pregunta,
}: {
  tarea: string
  pasos: PasoPreparando[]
  /** Índice del paso en marcha (los anteriores están hechos) */
  actual: number
  /** Solo durante la búsqueda */
  onSaltar?: () => void
  pregunta?: PreguntaTipo
}) {
  const titulo = useRef<HTMLHeadingElement>(null)
  useEffect(() => titulo.current?.focus(), [])

  return (
    <div className="preparando" role="dialog" aria-modal="true" aria-labelledby="preparando-titulo" data-pregunta={pregunta ? '' : undefined}>
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

        {pregunta && (
          <div className="preparando__pregunta" role="group" aria-labelledby="preparando-pregunta">
            <p id="preparando-pregunta" className="t-texto-cuerpo">
              No he encontrado cómo se hace. <strong>¿De qué tipo es esta tarea?</strong>
            </p>
            <div className="preparando__opciones">
              {pregunta.opciones.map((o, i) => (
                <button key={o.texto} type="button" className="preparando__opcion t-texto-control" onClick={() => pregunta.onElegir(i)}>
                  {o.texto}
                </button>
              ))}
            </div>
            <button type="button" className="preparando__saltar t-texto-control" onClick={pregunta.onSaltar}>
              Ninguna de estas
            </button>
          </div>
        )}

        {onSaltar && (
          <button type="button" className="preparando__saltar t-texto-control" onClick={onSaltar}>
            Saltar la búsqueda
          </button>
        )}
      </div>
    </div>
  )
}
