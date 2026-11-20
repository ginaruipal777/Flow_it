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
  marcado,
  permiso,
}: {
  /** Texto de la carta: se lee antes de los pasos. */
  titulo: string
  pasos: string[]
  /** «Está hecho cuando …» (sin la parte inicial). */
  hecho: string
  /** Si llega, el botón «Hecho» está en la carta: aquí solo quedan Escuchar y el criterio de éxito. */
  marcado?: boolean
  /** Frase de permiso del nivel («No tiene que quedar perfecto.») */
  permiso?: string
}) {
  // Un paso cada vez (Sanitas: dar las instrucciones de una en una): solo se ve el paso actual.
  const [hechos, setHechos] = useState(0)
  const [leyendo, setLeyendo] = useState(false)
  const enCarta = marcado !== undefined
  const todos = enCarta ? marcado : hechos >= pasos.length

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
      permiso ?? '',
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
        <p className="lista-pasos__etiqueta">{enCarta ? '' : pasos.length > 1 ? `PASOS (${pasos.length})` : 'PASO'}</p>
        {puedeHablar() && (
          <button type="button" className="lista-pasos__escuchar t-texto-control" onClick={escuchar} aria-pressed={leyendo}>
            <Icono svg={ICONOS_UI.altavoz} tamano={20} />
            {leyendo ? 'Parar' : 'Escuchar'}
          </button>
        )}
      </div>

      {/* En la carta («Sigue los pasos hasta…»): los pasos de la guía, para tenerlos delante */}
      {enCarta && pasos.length > 1 && (
        <ol className="lista-pasos__guia t-texto-cuerpo">
          {pasos.map((paso, i) => (
            <li key={i}>{paso}.</li>
          ))}
        </ol>
      )}

      {!enCarta && hechos > 0 && (
        <ol className="lista-pasos__hechos" aria-label="Pasos hechos">
          {pasos.slice(0, hechos).map((paso, i) => (
            <li key={i}>
              <button
                type="button"
                className="paso paso--hecho"
                role="checkbox"
                aria-checked="true"
                aria-label={`Paso ${i + 1} hecho: ${paso}. Tocar para desmarcar`}
                onClick={() => setHechos(i)}
              >
                <span className="paso__casilla" data-marcada>
                  <Icono svg={ICONOS_UI['tick-grande']} tamano={28} />
                </span>
                <span className="paso__texto">{paso}.</span>
              </button>
            </li>
          ))}
        </ol>
      )}

      {!enCarta && !todos && (
        <div className="paso-actual" aria-live="polite">
          {pasos.length > 1 && (
            <p className="paso-actual__contador">
              Paso {hechos + 1} de {pasos.length}
            </p>
          )}
          <p className="paso-actual__texto">{pasos[hechos]}.</p>
          <button type="button" className="paso-actual__boton t-texto-control" onClick={() => setHechos((h) => h + 1)}>
            <span className="paso__casilla" />
            {hechos + 1 < pasos.length ? 'Hecho. Ver el siguiente paso' : 'Hecho'}
          </button>
        </div>
      )}

      <p className="lista-pasos__hecho">
        <strong>Está hecho cuando</strong> {hecho}.{permiso && <span className="lista-pasos__permiso">{permiso}</span>}
      </p>

      <p className="lista-pasos__aviso" aria-live="polite">
        {todos ? (enCarta ? 'Ya lo has hecho. Pulsa «Reto conseguido».' : 'Ya has hecho todos los pasos. Pulsa «Reto conseguido».') : ''}
      </p>
    </section>
  )
}
