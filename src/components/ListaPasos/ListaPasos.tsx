import { useEffect, useState } from 'react'
import { Icono } from '../Icono/Icono'
import { ICONOS_UI } from '../Icono/iconos'
import './ListaPasos.css'

/* Micropasos del reto con casillas para marcar, criterio de éxito explícito
   y lectura en voz alta (pautas de docs/comunicacion.md). */

const puedeHablar = () => typeof window !== 'undefined' && 'speechSynthesis' in window

export function ListaPasos({
  titulo,
  pasos,
  hecho,
}: {
  /** Texto de la carta: se lee antes de los pasos. */
  titulo: string
  pasos: string[]
  /** «Está hecho cuando …» (sin la parte inicial). */
  hecho: string
}) {
  const [marcados, setMarcados] = useState<boolean[]>(() => pasos.map(() => false))
  const [leyendo, setLeyendo] = useState(false)
  const todos = marcados.every(Boolean)

  // Si se sale de la pantalla mientras lee, se para.
  useEffect(() => () => void (puedeHablar() && window.speechSynthesis.cancel()), [])

  const escuchar = () => {
    if (!puedeHablar()) return
    const voz = window.speechSynthesis
    if (leyendo) {
      voz.cancel()
      setLeyendo(false)
      return
    }
    const texto = [
      titulo,
      ...pasos.map((p, i) => `Paso ${i + 1}: ${p}.`),
      `Está hecho cuando ${hecho}.`,
    ].join(' ')
    const frase = new SpeechSynthesisUtterance(texto)
    frase.lang = 'es-ES'
    frase.rate = 0.95
    frase.onend = () => setLeyendo(false)
    frase.onerror = () => setLeyendo(false)
    voz.cancel()
    voz.speak(frase)
    setLeyendo(true)
  }

  return (
    <section className="lista-pasos" aria-label="Pasos del reto">
      <div className="lista-pasos__cabecera">
        <p className="lista-pasos__etiqueta">{pasos.length > 1 ? `PASOS (${pasos.length})` : 'PASO'}</p>
        {puedeHablar() && (
          <button type="button" className="lista-pasos__escuchar t-texto-control" onClick={escuchar} aria-pressed={leyendo}>
            <Icono svg={ICONOS_UI.altavoz} tamano={20} />
            {leyendo ? 'Parar' : 'Escuchar'}
          </button>
        )}
      </div>

      <ol className="lista-pasos__lista">
        {pasos.map((paso, i) => (
          <li key={i}>
            <button
              type="button"
              className="paso"
              role="checkbox"
              aria-checked={marcados[i]}
              onClick={() => setMarcados((m) => m.map((v, j) => (j === i ? !v : v)))}
            >
              <span className="paso__casilla" data-marcada={marcados[i] || undefined}>
                {marcados[i] && <Icono svg={ICONOS_UI['tick-grande']} tamano={28} />}
              </span>
              <span className="paso__texto">
                {pasos.length > 1 && <span className="paso__numero">{i + 1}.</span>} {paso}.
              </span>
            </button>
          </li>
        ))}
      </ol>

      <p className="lista-pasos__hecho">
        <strong>Está hecho cuando</strong> {hecho}.
      </p>

      <p className="lista-pasos__aviso" aria-live="polite">
        {todos ? 'Ya has hecho todos los pasos. Pulsa «Reto conseguido».' : ''}
      </p>
    </section>
  )
}
