import { useEffect, useRef, type ReactNode } from 'react'
import { Icono } from '../Icono/Icono'
import { FondoOrganico } from '../UI/UI'
import { ICONOS_TIPO } from '../Icono/iconos'
import type { TipoReto } from '../CartaReto/tipos'
import './Preparando.css'

/* Pantalla de carga mientras la app prepara los retos:
   1. busca en internet cómo se hace la tarea,
   2. la reconoce (categoría),
   3. mira cuánto le pesa a la persona,
   4. elige los retos.
   Se ve solo la baraja animada, «Preparando tus retos» y una barra pequeña de progreso;
   el paso en marcha se anuncia al lector de pantalla. */

/* Cartas que pasan rápido mientras se preparan los retos: una por factor INCUP */
const BARAJA: TipoReto[] = ['novedad', 'desafio', 'pasion', 'interes', 'urgencia']

export type PasoPreparando = { titulo: string; detalle?: string }

/** Pregunta en la pantalla de carga: las de contexto (con icono, «1 de 3») o «¿De qué tipo es?» */
export type PreguntaTipo = {
  enunciado: ReactNode
  /** «Pregunta 1 de 3» */
  contador?: string
  /** `icono`: SVG en línea (iconos-contexto.ts); con iconos, cada opción va en una fila */
  opciones: { texto: string; icono?: string }[]
  onElegir: (indice: number) => void
  onSaltar: () => void
  textoSaltar?: string
}

export function Preparando({
  tarea,
  pasos,
  actual,
  pregunta,
}: {
  tarea: string
  pasos: PasoPreparando[]
  /** Índice del paso en marcha (los anteriores están hechos) */
  actual: number
  pregunta?: PreguntaTipo
}) {
  const titulo = useRef<HTMLHeadingElement>(null)
  useEffect(() => titulo.current?.focus(), [])

  return (
    <div className="preparando" role="dialog" aria-modal="true" aria-labelledby="preparando-titulo" data-pregunta={pregunta ? '' : undefined}>
      {/* Mismo fondo que el inicio: violeta con las manchas orgánicas */}
      <FondoOrganico />
      <div className="preparando__caja">
        <div className="preparando__baraja" aria-hidden="true">
          {BARAJA.map((tipo, i) => (
            <span key={tipo} className="preparando__carta" data-tipo={tipo} style={{ animationDelay: `${i * 0.36}s` }}>
              <Icono svg={ICONOS_TIPO[tipo]} tamano={26} />
            </span>
          ))}
        </div>
        <h2 id="preparando-titulo" ref={titulo} tabIndex={-1} className="t-titular-m preparando__titulo">
          Preparando tus retos
        </h2>
        {/* Barra pequeña: avanza con cada paso (buscar, reconocer, esfuerzo, retos) */}
        <div
          className="preparando__barra"
          role="progressbar"
          aria-label="Progreso"
          aria-valuemin={0}
          aria-valuemax={pasos.length}
          aria-valuenow={Math.min(actual, pasos.length)}
          data-buscando={actual === 0 ? '' : undefined}
        >
          <span style={{ width: `${Math.max(8, (Math.min(actual, pasos.length) / pasos.length) * 100)}%` }} />
        </div>
        {/* El paso en marcha solo se anuncia al lector de pantalla */}
        <p className="preparando__oculto" aria-live="polite">
          {pasos[actual]?.titulo ?? 'Listo'} · {tarea}
        </p>

        {pregunta && (
          <div className="preparando__pregunta" role="group" aria-labelledby="preparando-pregunta">
            {pregunta.contador && <p className="preparando__contador t-texto-cuerpo-s">{pregunta.contador}</p>}
            <p id="preparando-pregunta" className="t-texto-cuerpo">
              {pregunta.enunciado}
            </p>
            <div className="preparando__opciones" data-lista={pregunta.opciones.some((o) => o.icono) || undefined}>
              {pregunta.opciones.map((o, i) => (
                <button key={o.texto} type="button" className="preparando__opcion t-texto-control" onClick={() => pregunta.onElegir(i)}>
                  {o.icono && <Icono svg={o.icono} tamano={24} />}
                  <span>{o.texto}</span>
                </button>
              ))}
            </div>
            <button type="button" className="preparando__saltar t-texto-control" onClick={pregunta.onSaltar}>
              {pregunta.textoSaltar ?? 'Ninguna de estas'}
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
