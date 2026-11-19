import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import ilustracion from '../../assets/img/ilustracion-enfoque.png'
import { Boton } from '../../components/Boton/Boton'
import { CartaDetalle, CartaV3 } from '../../components/Cartas/Cartas'
import { ListaPasos } from '../../components/ListaPasos/ListaPasos'
import { ElegirPremio } from '../../components/Premio/Premio'
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
  const reto = generarRetos(tareaActual, estado.mazo ?? 0).find((r) => r.tipo === estado.retoAceptado)
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
  const { despachar } = useFlow()
  const datos = useRetoAceptado()
  const [archivar, setArchivar] = useState(false)
  // «Hecho» se marca en la propia carta; se guarda el tipo para que otro reto empiece sin marcar
  const [hechoEn, setHechoEn] = useState<string | null>(null)
  if (!datos) return <Navigate to="/inicio" replace />
  const { tarea, reto } = datos
  const abrirEnfoque = () => navegar('/reto/enfoque', { replace: true })
  const marcado = hechoEn === reto.tipo

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
          hecho={{ marcado, onCambiar: () => setHechoEn(marcado ? null : reto.tipo) }}
        />
        <ListaPasos key={reto.tipo} titulo={reto.titulo} pasos={reto.pasos} hecho={reto.hecho} marcado={marcado} />
        {tarea.web?.enlace && (
          <a className="detalle__enlace t-texto-control" href={tarea.web.enlace} target="_blank" rel="noopener noreferrer">
            Abrir la web oficial: {tarea.web.contexto}
          </a>
        )}
        {tarea.web?.estrategia && (
          <p className="detalle__consejo t-texto-cuerpo">
            <strong>Una idea para arrancar:</strong> {tarea.web.estrategia}
            {tarea.web.fuenteEstrategia && (
              <>
                {' '}
                <a href={tarea.web.fuenteEstrategia} target="_blank" rel="noopener noreferrer">
                  Fuente: Understood
                </a>
              </>
            )}
          </p>
        )}
        <ElegirPremio premio={tarea.premio} onCambio={(premio) => despachar({ tipo: 'premio', premio })} />
        <BotonesReto onArchivar={() => setArchivar(true)} />
      </Panel>

      {archivar && <DialogoArchivar onCerrar={() => setArchivar(false)} />}
    </Pantalla>
  )
}

/* ── 09 · Enfoque ──────────────────────────────────── */
const formato = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

/* Bloques de trabajo con descanso programado (time-boxing; Carepatron y Sanitas).
   Al acabar cada fase, el temporizador se para, suena un aviso corto y dice qué viene después. */
type Modo = { id: string; nombre: string; trabajo?: number; descanso?: number }
const MODOS: Modo[] = [
  { id: 'libre', nombre: 'Sin límite' },
  { id: 'corto', nombre: '10 min + 3 de descanso', trabajo: 10 * 60, descanso: 3 * 60 },
  { id: 'largo', nombre: '25 min + 5 de descanso', trabajo: 25 * 60, descanso: 5 * 60 },
]

function avisar() {
  try {
    navigator.vibrate?.(200)
    const ctx = new AudioContext()
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.frequency.value = 660
    g.gain.value = 0.08
    o.connect(g).connect(ctx.destination)
    o.start()
    o.stop(ctx.currentTime + 0.25)
  } catch {
    /* sin sonido: el texto en pantalla ya avisa */
  }
}

type Reloj = { fase: 'trabajo' | 'descanso'; bloque: number; segundos: number; enMarcha: boolean; aviso: string }
const RELOJ_INICIAL: Reloj = { fase: 'trabajo', bloque: 1, segundos: 0, enMarcha: false, aviso: '' }

function avanzar(r: Reloj, modo: Modo): Reloj {
  const segundos = r.segundos + 1
  if (!modo.trabajo) return { ...r, segundos }
  const limite = r.fase === 'trabajo' ? modo.trabajo : modo.descanso!
  if (segundos < limite) return { ...r, segundos }
  return r.fase === 'trabajo'
    ? {
        ...r,
        fase: 'descanso',
        segundos: 0,
        enMarcha: false,
        aviso: `Bloque terminado. Pulsa el botón de iniciar para empezar el descanso de ${Math.round(modo.descanso! / 60)} minutos.`,
      }
    : {
        ...r,
        fase: 'trabajo',
        bloque: r.bloque + 1,
        segundos: 0,
        enMarcha: false,
        aviso: 'Descanso terminado. Pulsa el botón de iniciar para empezar el siguiente bloque.',
      }
}

export function Enfoque() {
  const navegar = useNavigate()
  const datos = useRetoAceptado()
  const [modo, setModo] = useState<Modo>(MODOS[0])
  const [reloj, setReloj] = useState(RELOJ_INICIAL)
  const [archivar, setArchivar] = useState(false)
  const { fase, bloque, segundos, enMarcha, aviso } = reloj

  const limite = modo.trabajo ? (fase === 'trabajo' ? modo.trabajo : modo.descanso!) : undefined

  // Cada segundo avanza el reloj; al acabar una fase se para, cambia a la siguiente y explica qué hacer
  useEffect(() => {
    if (!enMarcha) return
    const t = window.setInterval(() => setReloj((r) => avanzar(r, modo)), 1000)
    return () => window.clearInterval(t)
  }, [enMarcha, modo])

  // Aviso con sonido y vibración al cambiar de fase (sistema externo, no estado)
  const faseAnterior = useRef(fase)
  useEffect(() => {
    if (faseAnterior.current !== fase) avisar()
    faseAnterior.current = fase
  }, [fase])

  if (!datos) return <Navigate to="/inicio" replace />
  const verReto = () => navegar('/reto/detalle', { replace: true })
  const reiniciar = () => setReloj(RELOJ_INICIAL)
  const setEnMarcha = (f: (v: boolean) => boolean) => setReloj((r) => ({ ...r, enMarcha: f(r.enMarcha) }))
  const setAviso = (aviso: string) => setReloj((r) => ({ ...r, aviso }))
  const mostrado = limite ? limite - segundos : segundos

  return (
    <Pantalla fondo="violeta-liso" className="enfoque">
      <BotonVolver a="/reto/detalle" color="var(--superficie-blanco)" className="reto__volver" />
      <p className="enfoque__etiqueta">Modo enfoque</p>
      <p className="enfoque__consejo">Antes de empezar: silencia las notificaciones del móvil y cierra lo que no vayas a usar.</p>
      <img src={ilustracion} alt="" className="enfoque__ilustracion" data-activa={enMarcha || undefined} />

      <div className="enfoque__modos" role="radiogroup" aria-label="Tipo de temporizador">
        {MODOS.map((m) => (
          <button
            key={m.id}
            type="button"
            role="radio"
            aria-checked={modo.id === m.id}
            className="enfoque__modo t-texto-control"
            disabled={enMarcha}
            onClick={() => {
              setModo(m)
              reiniciar()
            }}
          >
            {m.nombre}
          </button>
        ))}
      </div>

      {limite !== undefined && (
        <p className="enfoque__fase" data-fase={fase}>
          {fase === 'trabajo' ? `Trabajo · bloque ${bloque}` : 'Descanso: levántate, bebe agua o estírate'}
        </p>
      )}
      <p className="enfoque__crono" aria-label={`${limite ? 'Quedan' : 'Tiempo'}: ${formato(mostrado)}`}>
        {formato(mostrado)}
      </p>
      {limite !== undefined && (
        <div className="enfoque__barra" aria-hidden="true">
          <span style={{ width: `${(segundos / limite) * 100}%` }} data-fase={fase} />
        </div>
      )}
      <p className="enfoque__aviso" aria-live="assertive">
        {aviso}
      </p>
      <div className="enfoque__controles">
        <button
          type="button"
          className="enfoque__reiniciar"
          aria-label="Reiniciar"
          disabled={segundos === 0 && bloque === 1 && fase === 'trabajo'}
          onClick={reiniciar}
        >
          <Icono svg={ICONOS_UI.reiniciar} tamano={24} />
        </button>
        <button
          type="button"
          className="enfoque__iniciar"
          aria-label={enMarcha ? 'Pausar' : 'Iniciar'}
          onClick={() => {
            setAviso('')
            setEnMarcha((v) => !v)
          }}
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
      {tarea.premio && (
        <p className="conseguido__premio t-texto-cuerpo">
          <strong>Tu premio:</strong> {tarea.premio}. Puedes tomarlo ahora.
        </p>
      )}
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
            despachar({ tipo: 'mazo-siguiente' })
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
