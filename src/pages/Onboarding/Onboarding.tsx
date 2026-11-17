import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Boton } from '../../components/Boton/Boton'
import { CartaV3 } from '../../components/Cartas/Cartas'
import { Icono } from '../../components/Icono/Icono'
import { ICONOS_UI } from '../../components/Icono/iconos'
import { Libreta } from '../../components/Libreta/Libreta'
import { AccionesCarta, Logotipo, Pantalla, Pasos } from '../../components/UI/UI'
import type { TipoReto } from '../../components/CartaReto/tipos'
import './Onboarding.css'

/* 00 · Bienvenida → O1 · O2 · O3 (Figma 2108:8349, 4109:2088, 4109:2219, 4109:2555) */

export function Bienvenida() {
  const navegar = useNavigate()
  useEffect(() => {
    const t = setTimeout(() => navegar('/bienvenida/1', { replace: true }), 2200)
    return () => clearTimeout(t)
  }, [navegar])

  return (
    <Pantalla fondo="violeta" className="bienvenida">
      <button type="button" className="bienvenida__cuerpo" onClick={() => navegar('/bienvenida/1', { replace: true })}>
        <Logotipo tamano={104.7} className="bienvenida__logo" />
        <span className="t-texto-eyebrow">PRODUCTIVIDAD SIN PRESIÓN</span>
      </button>
    </Pantalla>
  )
}

/* ── Ilustraciones ───────────────────────────────────── */

const ETIQUETA = 'Trabajo · email de Carlos'

/* Abanico de O1: centro (x, y) y giro de cada carta de 150 × 200, como en Figma */
const ABANICO: { tipo: TipoReto; numero: string; reto: string; x: number; y: number; giro: number }[] = [
  { tipo: 'novedad', numero: '01', reto: 'Abre el borrador y escribe solo el saludo.', x: 122.7, y: 128.2, giro: -16 },
  { tipo: 'desafio', numero: '02', reto: 'Resume tu respuesta en tres frases.', x: 157.8, y: 135.1, giro: -8 },
  { tipo: 'interes', numero: '04', reto: 'Relee su email y busca la pregunta clave.', x: 222.5, y: 158.7, giro: 8 },
  { tipo: 'urgencia', numero: '05', reto: 'Contesta ahora, antes de abrir nada más.', x: 252.7, y: 175.1, giro: 16 },
  { tipo: 'pasion', numero: '03', reto: 'Empieza por lo que de verdad quieres decirle.', x: 191, y: 140, giro: 0 },
]

function IlustracionTareas() {
  return (
    <div className="ilus-tareas" aria-hidden="true">
      <p className="ilus-tareas__pill" data-color="lima" style={{ left: 0, top: 0, width: 261 }}>
        Tengo que responder
        <br />
        el email de Carlos
      </p>
      <p className="ilus-tareas__pill" data-color="blanco" style={{ left: 143, top: 72 }}>
        Tengo que estudiar
        <br />
        para el examen
      </p>
      <p className="ilus-tareas__pill" data-color="lima" style={{ left: 0, top: 144 }}>
        Tengo que ordenar
        <br />
        mi habitación
      </p>
      <div className="ilus-tareas__retos">
        {ABANICO.map((c, i) => (
          <div
            key={c.tipo}
            className="ilus-tareas__carta"
            style={{ left: c.x - 75, top: c.y - 100, ['--giro' as string]: `${c.giro}deg`, animationDelay: `${0.5 + i * 0.08}s` }}
          >
            <CartaV3 tipo={c.tipo} categoria="trabajo" etiqueta={ETIQUETA} reto={c.reto} numero={c.numero} escala={0.5} />
          </div>
        ))}
        <span className="ilus-tareas__flecha">
          <Icono svg={ICONOS_UI['flecha-onboarding']} />
        </span>
      </div>
    </div>
  )
}

function IlustracionDeslizar() {
  const [salida, setSalida] = useState<'izquierda' | 'derecha' | null>(null)
  const temporizador = useRef<number | undefined>(undefined)
  const lanzar = (lado: 'izquierda' | 'derecha') => {
    setSalida(lado)
    window.clearTimeout(temporizador.current)
    temporizador.current = window.setTimeout(() => setSalida(null), 700)
  }
  useEffect(() => () => window.clearTimeout(temporizador.current), [])

  return (
    <div className="ilus-deslizar">
      <div className="ilus-deslizar__carta" data-salida={salida ?? undefined} aria-hidden="true">
        <CartaV3
          tipo="pasion"
          categoria="trabajo"
          etiqueta={ETIQUETA}
          reto="Empieza por lo que de verdad quieres decirle."
          numero="03"
          escala={0.72}
        />
        <span className="ilus-deslizar__dedo" />
      </div>
      <AccionesCarta
        className="ilus-deslizar__acciones"
        onRechazar={() => lanzar('izquierda')}
        onAceptar={() => lanzar('derecha')}
      />
    </div>
  )
}

const FILAS_EJEMPLO = [
  { id: 'a', texto: 'Responder email de Carlos', retos: 1, hecha: true },
  { id: 'b', texto: 'Ordenar el escritorio', retos: 3, hecha: true },
  { id: 'c', texto: 'Terminar el informe', retos: 2, hecha: true },
  { id: 'd', texto: 'Llamar al dentista', retos: 1, hecha: false },
]

function IlustracionLibreta() {
  return (
    <div className="ilus-libreta" aria-hidden="true">
      <Libreta filas={FILAS_EJEMPLO} resaltada="a" escala={0.76} />
      <span className="ilus-libreta__pegatina">
        <strong>+1</strong>
        reto
      </span>
    </div>
  )
}

/* ── Pasos del onboarding ────────────────────────────── */

export function Onboarding() {
  const navegar = useNavigate()
  const paso = Math.min(Math.max(Number(useParams().paso ?? 1), 1), 3) - 1
  const siguiente = () => navegar(paso < 2 ? `/bienvenida/${paso + 2}` : '/entrar')
  const inicioToque = useRef<number | null>(null)

  return (
    <Pantalla fondo="violeta" className="onboarding">
      <div
        className="onboarding__contenido"
        key={paso}
        onPointerDown={(e) => (inicioToque.current = e.clientX)}
        onPointerUp={(e) => {
          if (inicioToque.current === null) return
          const dx = e.clientX - inicioToque.current
          inicioToque.current = null
          if (dx < -60 && paso < 2) siguiente()
          if (dx > 60 && paso > 0) navegar(`/bienvenida/${paso}`)
        }}
      >
        <header className="onboarding__cabecera">
          <Logotipo />
          {paso < 2 && (
            <Boton estilo="texto" tamano="pequeno" conIcono={false} onClick={() => navegar('/entrar')}>
              Saltar
            </Boton>
          )}
        </header>

        {paso === 0 && (
          <main className="onboarding__cuerpo">
            <IlustracionTareas />
            <h1 className="t-titular-l onboarding__titulo">
              <span className="onboarding__claro">Descompone</span>
              <br />
              <span className="onboarding__claro">tus tareas, en</span>
              <br />
              <span className="onboarding__lima">retos que te activen</span>
            </h1>
          </main>
        )}

        {paso === 1 && (
          <main className="onboarding__cuerpo">
            <IlustracionDeslizar />
            <div className="onboarding__textos">
              <h1 className="t-titular-l onboarding__titulo">
                <span className="onboarding__blanco">Desliza y </span>
                <span className="onboarding__lima">elige</span>
              </h1>
              <p className="t-texto-cuerpo onboarding__texto">Derecha para aceptar, izquierda para pasar.</p>
            </div>
          </main>
        )}

        {paso === 2 && (
          <main className="onboarding__cuerpo onboarding__cuerpo--o3">
            <IlustracionLibreta />
            <div className="onboarding__textos">
              <p className="t-texto-eyebrow onboarding__lima">SIN RACHAS NI PRESIÓN</p>
              <h1 className="t-titular-l onboarding__titulo">
                <span className="onboarding__blanco">Cada reto </span>
                <span className="onboarding__lima">cuenta</span>
              </h1>
              <p className="t-texto-cuerpo onboarding__texto">Marca la tarea al acabar y mira lo que has logrado.</p>
            </div>
          </main>
        )}

        {paso < 2 ? (
          <footer className="onboarding__pie">
            <Pasos actual={paso} />
            <Boton conIcono={false} onClick={siguiente}>
              Siguiente
            </Boton>
          </footer>
        ) : (
          <footer className="onboarding__pie onboarding__pie--final">
            <Pasos actual={2} />
            <Boton conIcono={false} className="boton--ancho" onClick={() => navegar('/entrar')}>
              Crear cuenta
            </Boton>
            <Boton estilo="texto" conIcono={false} className="boton--ancho" onClick={() => navegar('/entrar')}>
              Ya tengo cuenta
            </Boton>
          </footer>
        )}
      </div>
    </Pantalla>
  )
}
