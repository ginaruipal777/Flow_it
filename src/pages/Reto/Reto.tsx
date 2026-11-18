import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import ilustracion from '../../assets/img/ilustracion-enfoque.png'
import { Boton } from '../../components/Boton/Boton'
import { CartaDetalle, CartaV3 } from '../../components/Cartas/Cartas'
import { ListaPasos } from '../../components/ListaPasos/ListaPasos'
import { Icono } from '../../components/Icono/Icono'
import { ICONOS_UI } from '../../components/Icono/iconos'
import { BotonVolver, Overlay, Pantalla } from '../../components/UI/UI'
import type { Reto, Tarea } from '../../datos/modelo'
import { generarRetos, nombreCategoriaReto, resumenTarea, tituloTarea } from '../../datos/retos'
import { useFlow } from '../../estado/FlowEstado'
import './Reto.css'

/* 08 · Detalle del reto, 09 · Enfoque, 10 · Reto conseguido y 91 · Archivar reto. */

function useRetoAceptado(): { tarea: Tarea; reto: Reto } | null {
  const { estado, tareaActual } = useFlow()
  if (!tareaActual || !estado.retoAceptado) return null
  const reto = generarRetos(tareaActual).find((r) => r.tipo === estado.retoAceptado)
  return reto ? { tarea: tareaActual, reto } : null
}

const etiquetaCarta = (t: Tarea) => `${nombreCategoriaReto(t)} · ${resumenTarea(t.texto)}`

/** Panel blanco arrastrable: hacia abajo (detalle → enfoque) o hacia arriba (enfoque → detalle). */
function Panel({
  sentido,
  onDeslizar,
  className,
  children,
}: {
  sentido: 'abajo' | 'arriba'
  onDeslizar: () => void
  className?: string
  children: ReactNode
}) {
  const [dy, setDy] = useState(0)
  const inicio = useRef<number | null>(null)
  const limitar = (v: number) => (sentido === 'abajo' ? Math.max(0, v) : Math.min(0, v))

  return (
    <section
      className={['panel-reto', className].filter(Boolean).join(' ')}
      data-arrastrando={dy !== 0 || undefined}
      style={{ transform: `translateY(${dy}px)` }}
    >
      <button
        type="button"
        className="panel-reto__asa"
        onClick={onDeslizar}
        onPointerDown={(e: PointerEvent) => {
          inicio.current = e.clientY
          e.currentTarget.setPointerCapture(e.pointerId)
        }}
        onPointerMove={(e) => inicio.current !== null && setDy(limitar(e.clientY - inicio.current))}
        onPointerUp={() => {
          inicio.current = null
          if (Math.abs(dy) > 70) onDeslizar()
          setDy(0)
        }}
      >
        <span className="panel-reto__barra" />
        <span className="panel-reto__pista">
          {sentido === 'abajo' ? 'Desliza hacia abajo o toca el botón' : 'Desliza hacia arriba para ver el reto'}
        </span>
      </button>
      {children}
    </section>
  )
}

function BotonesReto({ onArchivar }: { onArchivar: () => void }) {
  const navegar = useNavigate()
  const { despachar } = useFlow()
  return (
    <div className="botones-reto">
      <Boton
        conIcono={false}
        className="boton--ancho"
        onClick={() => {
          despachar({ tipo: 'reto-conseguido' })
          navegar('/reto/conseguido')
        }}
      >
        Reto conseguido
      </Boton>
      <Boton estilo="secundario" conIcono={false} className="boton--ancho" onClick={onArchivar}>
        Archivar reto
      </Boton>
    </div>
  )
}

/* ── 91 · Overlay · Archivar reto ──────────────────── */
function DialogoArchivar({ onCerrar }: { onCerrar: () => void }) {
  const navegar = useNavigate()
  const { despachar } = useFlow()
  return (
    <Overlay etiqueta="¿Archivar este reto?" onCerrar={onCerrar}>
      <div className="dialogo">
        <h2 className="t-texto-subtitulo">¿Archivar este reto?</h2>
        <p className="t-texto-cuerpo-s dialogo__gris">Se guarda en tu perfil, sin penalizaciones. Te proponemos otro.</p>
        <Boton
          conIcono={false}
          className="boton--ancho"
          onClick={() => {
            despachar({ tipo: 'siguiente-reto' })
            navegar('/reto', { replace: true })
          }}
        >
          Sí, archivar
        </Boton>
        <Boton estilo="secundario" conIcono={false} className="boton--ancho" onClick={onCerrar}>
          No, seguir con el reto
        </Boton>
      </div>
    </Overlay>
  )
}

/* ── 08 · Detalle del reto ─────────────────────────── */
export function Detalle() {
  const navegar = useNavigate()
  const datos = useRetoAceptado()
  const [archivar, setArchivar] = useState(false)
  if (!datos) return <Navigate to="/inicio" replace />
  const { tarea, reto } = datos
  const abrirEnfoque = () => navegar('/reto/enfoque', { replace: true })

  return (
    <Pantalla fondo="violeta-liso" className="detalle">
      <BotonVolver a="/reto" color="var(--superficie-blanco)" className="reto__volver" />
      <img src={ilustracion} alt="" className="detalle__ilustracion" />

      <Panel sentido="abajo" onDeslizar={abrirEnfoque} className="detalle__panel">
        <button type="button" className="boton-enfoque t-titular-boton" data-tipo={reto.tipo} onClick={abrirEnfoque}>
          Abrir Modo enfoque
        </button>
        <CartaDetalle
          tipo={reto.tipo}
          categoria={tarea.categoria}
          etiqueta={etiquetaCarta(tarea).toUpperCase()}
          reto={reto.titulo}
          numero={reto.numero}
        />
        <ListaPasos key={reto.tipo} titulo={reto.titulo} pasos={reto.pasos} hecho={reto.hecho} />
        <BotonesReto onArchivar={() => setArchivar(true)} />
      </Panel>

      {archivar && <DialogoArchivar onCerrar={() => setArchivar(false)} />}
    </Pantalla>
  )
}

/* ── 09 · Enfoque ──────────────────────────────────── */
const formato = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

export function Enfoque() {
  const navegar = useNavigate()
  const datos = useRetoAceptado()
  const [segundos, setSegundos] = useState(0)
  const [enMarcha, setEnMarcha] = useState(false)
  const [archivar, setArchivar] = useState(false)

  useEffect(() => {
    if (!enMarcha) return
    const t = window.setInterval(() => setSegundos((s) => s + 1), 1000)
    return () => window.clearInterval(t)
  }, [enMarcha])

  if (!datos) return <Navigate to="/inicio" replace />
  const verReto = () => navegar('/reto/detalle', { replace: true })

  return (
    <Pantalla fondo="violeta-liso" className="enfoque">
      <BotonVolver a="/reto/detalle" color="var(--superficie-blanco)" className="reto__volver" />
      <p className="enfoque__etiqueta">Modo enfoque</p>
      <img src={ilustracion} alt="" className="enfoque__ilustracion" data-activa={enMarcha || undefined} />

      <p className="enfoque__crono" aria-live="polite" aria-label={`Tiempo: ${formato(segundos)}`}>
        {formato(segundos)}
      </p>
      <div className="enfoque__controles">
        <button
          type="button"
          className="enfoque__reiniciar"
          aria-label="Reiniciar"
          disabled={segundos === 0}
          onClick={() => {
            setEnMarcha(false)
            setSegundos(0)
          }}
        >
          <Icono svg={ICONOS_UI.reiniciar} tamano={24} />
        </button>
        <button
          type="button"
          className="enfoque__iniciar"
          aria-label={enMarcha ? 'Pausar' : 'Iniciar'}
          onClick={() => setEnMarcha((v) => !v)}
        >
          <Icono svg={enMarcha ? ICONOS_UI.pausa : ICONOS_UI.play} />
        </button>
        <span className="enfoque__hueco" />
      </div>

      <Panel sentido="arriba" onDeslizar={verReto} className="enfoque__panel">
        <BotonesReto onArchivar={() => setArchivar(true)} />
      </Panel>

      {archivar && <DialogoArchivar onCerrar={() => setArchivar(false)} />}
    </Pantalla>
  )
}

/* ── 10 · Reto conseguido ──────────────────────────── */
export function Conseguido() {
  const navegar = useNavigate()
  const { despachar } = useFlow()
  const datos = useRetoAceptado()
  if (!datos) return <Navigate to="/inicio" replace />
  const { tarea, reto } = datos

  return (
    <Pantalla fondo="lienzo" className="conseguido">
      <h1 className="t-titular-l conseguido__titulo">
        ¡Reto
        <br />
        conseguido!
      </h1>
      <div className="conseguido__carta">
        <CartaV3
          tipo={reto.tipo}
          categoria={tarea.categoria}
          etiqueta={etiquetaCarta(tarea)}
          reto={reto.titulo}
          numero={reto.numero}
          escala={0.985}
        />
      </div>
      <div className="conseguido__bloque">
        <h2 className="t-titular-m">¿Has completado «{tituloTarea(tarea.texto)}»?</h2>
        <Boton
          conIcono={false}
          className="boton--ancho"
          onClick={() => {
            despachar({ tipo: 'completar-tarea' })
            navegar('/tareas', { replace: true })
          }}
        >
          Sí, tarea completada ✓
        </Boton>
        <Boton
          estilo="secundario"
          conIcono={false}
          className="boton--ancho"
          onClick={() => {
            despachar({ tipo: 'reiniciar-mazo' })
            navegar('/reto', { replace: true })
          }}
        >
          Aún no, dame más retos
        </Boton>
        <button
          type="button"
          className="t-texto-subtitulo conseguido__dejar"
          onClick={() => {
            despachar({ tipo: 'dejar-a-medias' })
            navegar('/inicio', { replace: true })
          }}
        >
          Lo dejo aquí por hoy
        </button>
      </div>
    </Pantalla>
  )
}
