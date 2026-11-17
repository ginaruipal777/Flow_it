import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { CartaReto } from '../../components/CartaReto/CartaReto'
import { Icono } from '../../components/Icono/Icono'
import { ICONOS_CATEGORIA, ICONOS_UI, type Categoria } from '../../components/Icono/iconos'
import { AccionesCarta, BotonVolver, Overlay, Pantalla } from '../../components/UI/UI'
import { NOMBRE_CATEGORIA } from '../../datos/modelo'
import { generarRetos, tituloTarea } from '../../datos/retos'
import { useFlow } from '../../estado/FlowEstado'
import './Seleccion.css'

/* 03–07 · Selección · Reto 1–5, estados puente (r/d/b), 07c, y overlays 90 y 92.
   Las pantallas «puente» de Figma son aquí la animación de la carta al salir. */

const UMBRAL = 100

/** Parte el título en dos líneas por la mitad, para subrayar la segunda como en Figma. */
function partirTitulo(texto: string): [string, string] {
  const palabras = tituloTarea(texto).split(/\s+/)
  if (palabras.length < 2) return ['', palabras.join(' ')]
  const corte = Math.floor(palabras.length / 2)
  return [palabras.slice(0, corte).join(' '), palabras.slice(corte).join(' ')]
}

export default function Seleccion() {
  const navegar = useNavigate()
  const { estado, despachar, tareaActual } = useFlow()
  const [arrastre, setArrastre] = useState(0)
  const [salida, setSalida] = useState<'izquierda' | 'derecha' | null>(null)
  const [verCategorias, setVerCategorias] = useState(false)
  const [arrastrando, setArrastrando] = useState(false)
  const inicio = useRef<number | null>(null)

  const retos = useMemo(() => (tareaActual ? generarRetos(tareaActual) : []), [tareaActual])
  const indice = Math.min(estado.indiceReto, 4)
  const agotado = estado.indiceReto >= 5

  const decidir = useCallback(
    (lado: 'izquierda' | 'derecha') => {
      if (salida || agotado) return
      setSalida(lado)
      window.setTimeout(() => {
        if (lado === 'derecha') {
          despachar({ tipo: 'aceptar-reto', reto: retos[indice].tipo })
          navegar('/reto/detalle')
        } else {
          despachar({ tipo: 'siguiente-reto' })
        }
        setSalida(null)
        setArrastre(0)
      }, 320)
    },
    [salida, agotado, despachar, retos, indice, navegar],
  )

  useEffect(() => {
    const teclas = (e: KeyboardEvent) => {
      if (verCategorias || agotado) return
      if (e.key === 'ArrowRight') decidir('derecha')
      if (e.key === 'ArrowLeft') decidir('izquierda')
    }
    window.addEventListener('keydown', teclas)
    return () => window.removeEventListener('keydown', teclas)
  }, [decidir, verCategorias, agotado])

  if (!tareaActual) return <Navigate to="/inicio" replace />

  const [linea1, linea2] = partirTitulo(tareaActual.texto)
  const actual = retos[indice]
  const siguiente = retos[indice + 1]

  const soltar = (e: PointerEvent) => {
    if (inicio.current === null) return
    const dx = e.clientX - inicio.current
    inicio.current = null
    setArrastrando(false)
    if (dx > UMBRAL) decidir('derecha')
    else if (dx < -UMBRAL) decidir('izquierda')
    else setArrastre(0)
  }

  const transformar = salida
    ? `translateX(${salida === 'derecha' ? 520 : -520}px) rotate(${salida === 'derecha' ? 24 : -24}deg)`
    : `translateX(${arrastre}px) rotate(${arrastre / 18}deg)`

  return (
    <Pantalla fondo="lienzo" className="seleccion">
      <header className="seleccion__cabecera">
        <BotonVolver a="/inicio" color="var(--superficie-negro)" className="seleccion__volver" />
        <p className="t-texto-eyebrow seleccion__antetitulo">Tu tarea</p>
        <h1 className="t-titular-l seleccion__tarea">
          {linea1 && (
            <>
              {linea1}
              <br />
            </>
          )}
          <span className="seleccion__resalto">{linea2}</span>
        </h1>
        <div className="seleccion__categoria">
          <button type="button" className="chip-categoria" onClick={() => setVerCategorias(true)}>
            <span className="t-texto-subtitulo">{NOMBRE_CATEGORIA[tareaActual.categoria]}</span>
            <span className="chip-categoria__editar">
              <Icono svg={ICONOS_UI.lapiz} tamano={20} />
            </span>
          </button>
        </div>
        <div className="progreso-mazo">
          <p className="t-texto-cuerpo-s">
            Paso 1 · {Math.min(indice + 1, 5)} de 5
          </p>
          <div className="progreso-mazo__pista">
            <span style={{ width: `${(Math.min(indice + 1, 5)) * 15}%` }} />
          </div>
        </div>
      </header>

      <main className="seleccion__cuerpo">
        <div className="mazo">
          {siguiente && !agotado && (
            <CartaReto
              key={siguiente.tipo + '-detras'}
              className="mazo__detras"
              tipo={siguiente.tipo}
              reto={siguiente.titulo}
              categoria={tareaActual.categoria}
            />
          )}
          <div
            key={actual.tipo}
            className="mazo__delante"
            data-arrastrando={arrastrando || undefined}
            data-saliendo={salida ?? undefined}
            style={{ transform: transformar }}
            onPointerDown={(e) => {
              if (salida) return
              inicio.current = e.clientX
              setArrastrando(true)
              ;(e.target as Element).setPointerCapture?.(e.pointerId)
            }}
            onPointerMove={(e) => inicio.current !== null && setArrastre(e.clientX - inicio.current)}
            onPointerUp={soltar}
            onPointerCancel={() => {
              inicio.current = null
              setArrastrando(false)
              setArrastre(0)
            }}
          >
            <CartaReto tipo={actual.tipo} reto={actual.titulo} categoria={tareaActual.categoria} />
            <span className="mazo__sello" data-lado="aceptar" style={{ opacity: Math.max(0, arrastre / UMBRAL) }}>
              Aceptar
            </span>
            <span className="mazo__sello" data-lado="rechazar" style={{ opacity: Math.max(0, -arrastre / UMBRAL) }}>
              Otra
            </span>
          </div>
        </div>
        <AccionesCarta onRechazar={() => decidir('izquierda')} onAceptar={() => decidir('derecha')} />
      </main>

      {verCategorias && (
        <HojaCategorias
          actual={tareaActual.categoria}
          onElegir={(c) => {
            despachar({ tipo: 'cambiar-categoria', categoria: c })
            setVerCategorias(false)
          }}
          onCerrar={() => setVerCategorias(false)}
        />
      )}

      {agotado && (
        <DialogoAgotado
          onNuevaTarea={(texto) => despachar({ tipo: 'nueva-tarea', texto })}
          onSeguir={() => despachar({ tipo: 'reiniciar-mazo' })}
        />
      )}
    </Pantalla>
  )
}

/* ── 90 · Overlay · Cambiar categoría ──────────────── */
const CATEGORIAS = Object.keys(ICONOS_CATEGORIA) as Categoria[]

function HojaCategorias({
  actual,
  onElegir,
  onCerrar,
}: {
  actual: Categoria
  onElegir: (c: Categoria) => void
  onCerrar: () => void
}) {
  return (
    <Overlay posicion="abajo" etiqueta="Cambiar categoría" onCerrar={onCerrar}>
      <div className="hoja">
        <span className="hoja__asa" />
        <div className="hoja__cabecera">
          <div>
            <h2 className="t-titular-m">Cambiar categoría</h2>
            <p className="t-texto-cuerpo-s hoja__detalle">Detectada automáticamente: {NOMBRE_CATEGORIA[actual]}</p>
          </div>
          <button type="button" className="hoja__cerrar" aria-label="Cerrar" onClick={onCerrar}>
            <Icono svg={ICONOS_UI.cerrar} tamano={16} />
          </button>
        </div>
        <ul className="hoja__opciones">
          {CATEGORIAS.map((c) => (
            <li key={c}>
              <button
                type="button"
                className="opcion-categoria"
                data-elegida={c === actual || undefined}
                onClick={() => onElegir(c)}
              >
                <Icono svg={ICONOS_CATEGORIA[c]} tamano={40} />
                <span className="t-texto-subtitulo">{NOMBRE_CATEGORIA[c]}</span>
                {c === actual && (
                  <span className="opcion-categoria__check">
                    <Icono svg={ICONOS_UI.check} tamano={16} />
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </Overlay>
  )
}

/* ── 92 · Overlay · Retos agotados (07c) ───────────── */
function DialogoAgotado({ onNuevaTarea, onSeguir }: { onNuevaTarea: (t: string) => void; onSeguir: () => void }) {
  const [texto, setTexto] = useState('')
  return (
    <Overlay etiqueta="Se acabó el mazo" onCerrar={onSeguir}>
      <form
        className="dialogo dialogo--lienzo"
        onSubmit={(e) => {
          e.preventDefault()
          if (texto.trim()) onNuevaTarea(texto)
        }}
      >
        <p className="t-texto-eyebrow dialogo__eyebrow">Se acabó el mazo</p>
        <h2 className="t-titular-m">¿Se te atasca esta tarea?</h2>
        <p className="t-texto-cuerpo dialogo__suave">Escribe otra y te preparamos cartas nuevas.</p>
        <div className="campo-pildora">
          <input
            className="t-texto-cuerpo"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Escribe otra tarea…"
            aria-label="Otra tarea"
            autoFocus
          />
          <button type="submit" className="campo-pildora__enviar" aria-label="Enviar">
            <Icono svg={ICONOS_UI.enviar} tamano={18} />
          </button>
        </div>
        <button type="button" className="t-texto-subtitulo dialogo__enlace" onClick={onSeguir}>
          Seguir intentando el reto
        </button>
      </form>
    </Overlay>
  )
}
