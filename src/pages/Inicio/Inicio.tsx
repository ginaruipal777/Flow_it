import { useRef, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { BarraNav } from '../../components/BarraNav/BarraNav'
import { Icono } from '../../components/Icono/Icono'
import { ICONOS_CATEGORIA, ICONOS_UI } from '../../components/Icono/iconos'
import { ContadorRetos, Logotipo, Pantalla, SelectorEsfuerzo } from '../../components/UI/UI'
import { useFlow } from '../../estado/FlowEstado'
import { filtrarTarea, type Filtro } from '../../datos/filtros'
import { analizarTarea } from '../../datos/reglas'
import { buscarMicroPaso } from '../../datos/web'
import './Inicio.css'

/* 01 · Inicio y 02 · Inicio · escribiendo (Figma 2108:7545 y 2250:3782).
   Al tocar el campo, la tarjeta se abre y muestra el historial (02). */

type Reconocimiento = {
  lang: string
  interimResults: boolean
  onresult: (e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void
  onend: () => void
  start: () => void
}

function crearDictado(): Reconocimiento | null {
  const w = window as unknown as Record<string, (new () => Reconocimiento) | undefined>
  const Clase = w.SpeechRecognition ?? w.webkitSpeechRecognition
  return Clase ? new Clase() : null
}

/* Enviar (avión de papel), como el componente «dictar» de Figma */
const ICONO_ENVIAR =
  '<svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><path d="M4.2 4.4 20.6 11.3a.75.75 0 0 1 0 1.4L4.2 19.6a.6.6 0 0 1-.8-.75L5.9 12 3.4 5.15a.6.6 0 0 1 .8-.75Z" fill="currentColor"/><path d="M6 12h6.5" stroke="var(--marca-tinta)" stroke-width="2" stroke-linecap="round"/></svg>'

export default function Inicio() {
  const navegar = useNavigate()
  const { estado, despachar } = useFlow()
  const [texto, setTexto] = useState('')
  const [foco, setFoco] = useState(false)
  const [dictando, setDictando] = useState(false)
  /** Aviso de seguridad o de texto que no se entiende */
  const [aviso, setAviso] = useState<Exclude<Filtro, { status: 'ok' }> | null>(null)
  /** Búsqueda web en curso (solo tareas sin categoría): se puede saltar */
  const [buscando, setBuscando] = useState<AbortController | null>(null)
  const campo = useRef<HTMLInputElement>(null)

  const abierto = foco || texto.length > 0
  const hayTexto = texto.trim().length > 0
  const historial = estado.tareas.filter((t) => t.estado === 'a-medias').slice(0, 3)

  const empezar = async (e?: FormEvent) => {
    e?.preventDefault()
    if (buscando) return
    if (!texto.trim()) {
      campo.current?.focus()
      return
    }
    const { regla } = analizarTarea(texto)
    const filtro = filtrarTarea(texto, Boolean(regla))
    if (filtro.status !== 'ok') {
      setAviso(filtro)
      return
    }
    if (regla) {
      despachar({ tipo: 'nueva-tarea', texto })
      navegar('/reto')
      return
    }
    // Sin categoría: se busca en internet el primer paso (máximo 30 s, se puede saltar)
    const control = new AbortController()
    setBuscando(control)
    const resultado = await buscarMicroPaso(texto, estado.esfuerzo, control.signal)
    setBuscando(null)
    if (resultado.status === 'blocked' || resultado.status === 'incomprehensible') {
      setAviso(resultado)
      return
    }
    despachar({ tipo: 'nueva-tarea', texto, web: resultado.status === 'success' ? resultado.web : undefined })
    navegar('/reto')
  }

  const dictar = () => {
    const r = crearDictado()
    if (!r) {
      campo.current?.focus()
      return
    }
    r.lang = 'es-ES'
    r.interimResults = false
    r.onresult = (e) => setTexto(e.results[0][0].transcript)
    r.onend = () => setDictando(false)
    setDictando(true)
    r.start()
  }

  return (
    <Pantalla fondo="violeta" className="inicio">
      <header className="inicio__cabecera">
        <Logotipo tamano={37.986} />
      </header>

      <main className="inicio__cuerpo" data-abierto={abierto || undefined}>
        <h1 className="t-titular-display inicio__titulo">
          el reto
          <br />
          de <span className="inicio__lima">hoy</span>
          <br />
          es…
        </h1>

        <form className="inicio__tarea" onSubmit={empezar}>
          <div className="formulario-tarea" data-abierto={abierto || undefined}>
            <div className="formulario-tarea__campo">
              <input
                ref={campo}
                className="t-texto-cuerpo"
                value={texto}
                onChange={(e) => {
                  setTexto(e.target.value)
                  setAviso(null)
                }}
                onFocus={() => setFoco(true)}
                onBlur={() => setFoco(false)}
                placeholder="Escribe una tarea…"
                aria-label="Tarea"
                enterKeyHint="go"
              />
              {/* Como en las apps de mensajería: micrófono con el campo vacío, enviar cuando hay texto */}
              {hayTexto ? (
                <button
                  type="submit"
                  className="formulario-tarea__accion"
                  data-modo="enviar"
                  aria-label={buscando ? 'Buscando el primer paso' : 'Enviar la tarea'}
                  disabled={Boolean(buscando)}
                  onMouseDown={(e) => e.preventDefault()}
                >
                  <span className="formulario-tarea__icono" key="enviar" dangerouslySetInnerHTML={{ __html: ICONO_ENVIAR }} />
                </button>
              ) : (
                <button
                  type="button"
                  className="formulario-tarea__accion"
                  data-modo="dictar"
                  data-activo={dictando || undefined}
                  aria-label="Dictar la tarea"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={dictar}
                >
                  <span className="formulario-tarea__icono" key="dictar">
                    <Icono svg={ICONOS_UI.microfono} tamano={22} />
                  </span>
                </button>
              )}
            </div>

            {abierto && historial.length > 0 && (
              <div className="formulario-tarea__historial">
                <hr />
                <p className="t-texto-control formulario-tarea__gris">Historial</p>
                <ul>
                  {historial.map((t) => (
                    <li key={t.id}>
                      <button
                        type="button"
                        className="sugerencia"
                        // mousedown para que el clic llegue antes de perder el foco
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          despachar({ tipo: 'retomar', id: t.id })
                          navegar('/reto')
                        }}
                      >
                        <Icono svg={ICONOS_CATEGORIA[t.categoria]} tamano={26} />
                        <span className="t-texto-cuerpo-s sugerencia__texto">{t.texto}</span>
                        <ContadorRetos retos={t.retos} />
                      </button>
                    </li>
                  ))}
                </ul>
                <hr />
              </div>
            )}

            <p className="t-texto-eyebrow-s formulario-tarea__gris">¿CUÁNTO TE PESA?</p>
            <SelectorEsfuerzo valor={estado.esfuerzo} onCambio={(e) => despachar({ tipo: 'esfuerzo', esfuerzo: e })} />
          </div>

          {aviso && (
            <div className="inicio__aviso" role="alert" data-tipo={aviso.status}>
              <p className="t-texto-cuerpo">{aviso.mensaje}</p>
              {aviso.status === 'blocked' && aviso.ayuda && <p className="t-texto-cuerpo inicio__ayuda">{aviso.ayuda}</p>}
            </div>
          )}

          {buscando && (
            <p className="inicio__buscando t-texto-cuerpo-s" aria-live="polite">
              Buscando el primer paso en internet.{' '}
              <button type="button" className="inicio__saltar" onClick={() => buscando.abort()}>
                Saltar la búsqueda
              </button>
            </p>
          )}
        </form>
      </main>
      <BarraNav />
    </Pantalla>
  )
}
