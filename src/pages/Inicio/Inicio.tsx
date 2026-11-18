import { useRef, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { BarraNav } from '../../components/BarraNav/BarraNav'
import { Boton } from '../../components/Boton/Boton'
import { Icono } from '../../components/Icono/Icono'
import { ICONOS_CATEGORIA, ICONOS_UI } from '../../components/Icono/iconos'
import { ContadorRetos, Logotipo, Pantalla, SelectorEsfuerzo } from '../../components/UI/UI'
import { useFlow } from '../../estado/FlowEstado'
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

export default function Inicio() {
  const navegar = useNavigate()
  const { estado, despachar } = useFlow()
  const [texto, setTexto] = useState('')
  const [foco, setFoco] = useState(false)
  const [dictando, setDictando] = useState(false)
  const campo = useRef<HTMLInputElement>(null)

  const abierto = foco || texto.length > 0
  const historial = estado.tareas.filter((t) => t.estado === 'a-medias').slice(0, 3)

  const empezar = (e?: FormEvent) => {
    e?.preventDefault()
    if (!texto.trim()) {
      campo.current?.focus()
      return
    }
    despachar({ tipo: 'nueva-tarea', texto })
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
                onChange={(e) => setTexto(e.target.value)}
                onFocus={() => setFoco(true)}
                onBlur={() => setFoco(false)}
                placeholder="Escribe una tarea…"
                aria-label="Tarea"
                enterKeyHint="go"
              />
              <button
                type="button"
                className="formulario-tarea__dictar"
                data-activo={dictando || undefined}
                aria-label="Dictar la tarea"
                onClick={dictar}
              >
                <Icono svg={ICONOS_UI.microfono} tamano={18} />
              </button>
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

          <Boton type="submit" className="boton--ancho" onMouseDown={(e) => e.preventDefault()}>
            ¡Vamos!
          </Boton>
        </form>
      </main>
      <BarraNav />
    </Pantalla>
  )
}
