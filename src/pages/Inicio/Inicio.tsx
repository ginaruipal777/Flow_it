import { useRef, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { BarraNav } from '../../components/BarraNav/BarraNav'
import { Icono } from '../../components/Icono/Icono'
import { ICONOS_CATEGORIA, ICONOS_UI } from '../../components/Icono/iconos'
import { ContadorRetos, Logotipo, Pantalla, SelectorEsfuerzo } from '../../components/UI/UI'
import { useFlow } from '../../estado/FlowEstado'
import { filtrarTarea, type Filtro } from '../../datos/filtros'
import { analizarTarea, partesDe } from '../../datos/reglas'
import { buscarMicroPaso } from '../../datos/web'
import { preguntasDe, type OpcionContexto } from '../../datos/contexto'
import { ICONOS_CONTEXTO } from '../../components/Icono/iconos-contexto'
import { Preparando, type PasoPreparando, type PreguntaTipo } from '../../components/Preparando/Preparando'
import { TIPOS_TAREA } from '../../datos/tipos-tarea'
import type { Categoria } from '../../components/Icono/iconos'
import type { MicroPasoWeb } from '../../datos/modelo'
import { leerSituacion } from '../../datos/situacion'
import { NOMBRE_CATEGORIA } from '../../datos/modelo'
import { filaDe, guardarEnSheet } from '../../datos/sheet'
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
  /** Preparación de los retos en curso (pantalla de carga): paso actual, lo encontrado y cómo cancelar la búsqueda */
  const [preparando, setPreparando] = useState<{
    actual: number
    pasos: PasoPreparando[]
    control: AbortController
    pregunta?: PreguntaTipo
  } | null>(null)
  const buscando = preparando
  const campo = useRef<HTMLInputElement>(null)

  const abierto = foco || texto.length > 0
  const hayTexto = texto.trim().length > 0
  const historial = estado.tareas.filter((t) => t.estado === 'a-medias').slice(0, 3)

  const empezar = async (e?: FormEvent) => {
    e?.preventDefault()
    if (preparando) return
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

    // Antes de los retos: 1) buscar cómo se hace, 2) reconocer la tarea, 3) ver cuánto pesa, 4) elegir retos.
    // Puede tardar unos segundos; el resultado es mejor y la persona ve qué está pasando.
    const pasos: PasoPreparando[] = [
      { titulo: 'Buscando cómo se hace' },
      { titulo: 'Reconociendo la tarea' },
      { titulo: 'Viendo cuánto te pesa' },
      { titulo: 'Eligiendo tus retos' },
    ]
    const control = new AbortController()
    const paso = (actual: number) => setPreparando({ actual, pasos: [...pasos], control })
    const pausa = (ms: number) => new Promise((ok) => setTimeout(ok, ms))
    paso(0)

    // 1. Buscar en internet (máximo 30 s, se puede saltar)
    const resultado = await buscarMicroPaso(texto, estado.esfuerzo, control.signal)
    if (resultado.status === 'blocked' || resultado.status === 'incomprehensible') {
      setPreparando(null)
      setAviso(resultado)
      return
    }
    const web = resultado.status === 'success' ? resultado.web : undefined
    pasos[0].detalle =
      resultado.status === 'success'
        ? web?.fiable
          ? `Encontrado: ${web.contexto}`
          : 'Encontrado en internet'
        : control.signal.aborted
          ? 'Búsqueda saltada'
          : 'Sin conexión: uso lo que ya sé'
    paso(1)
    await pausa(300)

    // 1b. Preguntas de contexto (como mucho 3, con iconos): salen de lo que encontró la búsqueda
    // sobre ESTA tarea («¿Cómo lo haces?» con los métodos reales), así siempre tienen sentido.
    // Sin resultados no hay preguntas. «Saltar» deja de preguntar.
    const preguntas = web
      ? preguntasDe(texto, { metodos: web.metodos, materiales: web.materiales, requiereLugar: web.requiereLugar, lugares: web.lugares, bloqueos: web.bloqueos })
      : []
    const elegidas: OpcionContexto[] = []
    for (const [i, p] of preguntas.entries()) {
      const indice = await new Promise<number | null>((responder) =>
        setPreparando({
          actual: 1,
          pasos: [...pasos],
          control,
          pregunta: {
            contador: `Pregunta ${i + 1} de ${preguntas.length}`,
            enunciado: <strong>{p.texto}</strong>,
            opciones: p.opciones.map((o) => ({ texto: o.texto, icono: ICONOS_CONTEXTO[o.icono] })),
            onElegir: (n) => responder(n),
            onSaltar: () => responder(null),
            textoSaltar: 'Saltar las preguntas',
          },
        }),
      )
      if (indice === null) break
      elegidas.push(p.opciones[indice])
    }
    paso(1)

    // 2. Reconocer la tarea (por sus palabras o por lo que encontró la búsqueda).
    //    Si no hay forma de saber cómo se hace, se pregunta de qué tipo es: nada de retos genéricos.
    let web2: MicroPasoWeb | undefined = web
    let icono: Categoria | undefined = resultado.status === 'success' ? resultado.icono : undefined
    let categoria = regla?.categoria ?? web?.categoria
    // Con verbo y objeto en la frase, el motor ya escribe retos de esa tarea: no hace falta preguntar
    if (!categoria && !web?.fiable && !partesDe(texto) && !elegidas.length) {
      const elegido = await new Promise<number | null>((responder) =>
        setPreparando({
          actual: 1,
          pasos: [...pasos],
          control,
          pregunta: {
            enunciado: (
              <>
                No he encontrado cómo se hace. <strong>¿De qué tipo es esta tarea?</strong>
              </>
            ),
            opciones: TIPOS_TAREA,
            onElegir: (i) => responder(i),
            onSaltar: () => responder(null),
          },
        }),
      )
      if (elegido !== null) {
        const tipo = TIPOS_TAREA[elegido]
        categoria = tipo.categoria
        icono = tipo.icono
        web2 = { ...(web ?? { contexto: texto, microPaso: '', objeto: '', tipo: 'fisico', nivel: estado.esfuerzo }), categoria, fiable: false }
      }
    }
    // Lo contestado viaja con la tarea: el motor usa el método u objeto elegido, la experiencia y el bloqueo
    if (elegidas.length && web2) web2 = { ...web2, eleccion: elegidas }
    pasos[1].detalle = categoria
      ? `${categoria}${!regla && web?.categoria ? ' (según lo encontrado)' : !regla ? ' (lo has elegido tú)' : ''}`
      : web2?.fiable
        ? web2.objeto
          ? `Tarea nueva: con ${web2.objeto}`
          : web2.pasos?.length
            ? `Tarea nueva: ${web2.pasos.length} pasos de una guía`
            : `Tarea nueva: ${web2.materiales?.length ? `con ${web2.materiales[0]}` : 'con técnicas de internet'}`
        : 'Tarea nueva'
    paso(2)
    await pausa(500)

    // 3. Esfuerzo y situación probable
    const nombreEsfuerzo = { ligero: 'Ligero', medio: 'Medio', pesado: 'Pesado' }[estado.esfuerzo]
    pasos[2].detalle = `${nombreEsfuerzo} · ${leerSituacion(texto, estado.esfuerzo).nombre}`
    paso(3)
    await pausa(450)

    // 4. Retos
    const iconoFinal = icono ?? regla?.icono
    pasos[3].detalle = iconoFinal ? `Mazo de ${NOMBRE_CATEGORIA[iconoFinal]}` : undefined
    paso(4)
    await pausa(300)
    // En segundo plano: si falla (sin conexión, Apps Script caído…) no bloquea los retos
    guardarEnSheet(filaDe(texto, categoria ?? (iconoFinal && NOMBRE_CATEGORIA[iconoFinal]) ?? 'General', web2)).catch(() => {})
    despachar({ tipo: 'nueva-tarea', texto, web: web2, ...(icono && { icono }) })
    setPreparando(null)
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

        </form>
      </main>
      <BarraNav />
      {preparando && (
        <Preparando
          tarea={texto.trim()}
          pasos={preparando.pasos}
          actual={preparando.actual}
          pregunta={preparando.pregunta}
        />
      )}
    </Pantalla>
  )
}
