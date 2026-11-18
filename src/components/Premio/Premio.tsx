import { useState } from 'react'
import './Premio.css'

/* Recompensa elegida antes de empezar (método RAN: Recompensa, Responsabilidad, Novedad).
   Se elige en el detalle del reto y se recuerda en «Reto conseguido». */

const IDEAS = ['Un café o un té', 'Un capítulo de tu serie', '10 minutos de descanso', 'Una canción que te guste']

export function ElegirPremio({ premio, onCambio }: { premio?: string; onCambio: (p: string | undefined) => void }) {
  const propio = premio !== undefined && !IDEAS.includes(premio)
  const [escribiendo, setEscribiendo] = useState(propio)
  const [texto, setTexto] = useState(propio ? premio : '')

  return (
    <section className="premio" aria-label="Premio al terminar">
      <p className="premio__etiqueta">TU PREMIO AL TERMINAR (OPCIONAL)</p>
      <div className="premio__opciones">
        {IDEAS.map((idea) => (
          <button
            key={idea}
            type="button"
            className="premio__chip t-texto-control"
            aria-pressed={premio === idea}
            onClick={() => {
              setEscribiendo(false)
              onCambio(premio === idea ? undefined : idea)
            }}
          >
            {idea}
          </button>
        ))}
        <button
          type="button"
          className="premio__chip t-texto-control"
          aria-pressed={escribiendo}
          onClick={() => {
            setEscribiendo((v) => !v)
            if (escribiendo) onCambio(undefined)
          }}
        >
          Otro
        </button>
      </div>
      {escribiendo && (
        <input
          className="premio__campo t-texto-cuerpo-s"
          value={texto}
          placeholder="Escribe tu premio"
          aria-label="Tu premio"
          onChange={(e) => {
            setTexto(e.target.value)
            onCambio(e.target.value.trim() || undefined)
          }}
        />
      )}
    </section>
  )
}
