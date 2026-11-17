import { useEffect, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import fondoOrganico from '../../assets/img/fondo-organico.png'
import { Icono } from '../Icono/Icono'
import { ICONOS_ESFUERZO, ICONOS_UI } from '../Icono/iconos'
import type { Esfuerzo } from '../../datos/modelo'
import './UI.css'

/* ── Pantalla ──────────────────────────────────────────
   Contenedor de cada pantalla (430 px de ancho como en Figma).
   fondo: violeta con el «fondo orgánico», lienzo (claro) o tinta (oscuro). */
export function Pantalla({
  fondo,
  children,
  className,
}: {
  /** «violeta-liso»: violeta sin las manchas orgánicas (detalle, enfoque, tus tareas). */
  fondo: 'violeta' | 'violeta-liso' | 'lienzo' | 'tinta'
  children: ReactNode
  className?: string
}) {
  return (
    <div className={['pantalla', className].filter(Boolean).join(' ')} data-fondo={fondo}>
      {fondo === 'violeta' && <FondoOrganico />}
      {children}
    </div>
  )
}

/** Manchas orgánicas: imagen gris + «tono claro» (multiplicar) + «tono oscuro» (aclarar). */
export function FondoOrganico() {
  return (
    <div className="fondo-organico" aria-hidden="true">
      <img src={fondoOrganico} alt="" className="fondo-organico__imagen" />
      <div className="fondo-organico__claro" />
      <div className="fondo-organico__oscuro" />
    </div>
  )
}

export function Logotipo({ tamano = 38.4, className }: { tamano?: number; className?: string }) {
  return (
    <p className={['logotipo', className].filter(Boolean).join(' ')} style={{ fontSize: tamano }}>
      flow it!
    </p>
  )
}

export function BotonVolver({
  a,
  color = 'var(--marca-tinta)',
  className,
}: {
  /** Ruta de destino; sin ella vuelve atrás en el historial. */
  a?: string
  color?: string
  className?: string
}) {
  const navegar = useNavigate()
  return (
    <button
      type="button"
      className={['boton-volver', className].filter(Boolean).join(' ')}
      style={{ color }}
      aria-label="Volver"
      onClick={() => (a ? navegar(a) : navegar(-1))}
    >
      <Icono svg={ICONOS_UI.volver} tamano={24} />
    </button>
  )
}

/* ── Contador / Retos hechos ─────────────────────────── */
export function ContadorRetos({ retos, tamano = 1 }: { retos: number; tamano?: number }) {
  const texto = retos === 0 ? 'Nueva' : retos >= 3 ? '3+ retos' : retos === 1 ? '1 reto' : `${retos} retos`
  return (
    <span className="contador" style={{ zoom: tamano }}>
      <span className="contador__cartas">
        {[0, 1, 2].map((i) => (
          <span key={i} className="contador__carta" data-llena={i < retos || undefined} />
        ))}
      </span>
      <span className="t-texto-control">{texto}</span>
    </span>
  )
}

/* ── Selector / Esfuerzo ─────────────────────────────── */
const ESFUERZOS: { id: Esfuerzo; nombre: string }[] = [
  { id: 'ligero', nombre: 'Ligero' },
  { id: 'medio', nombre: 'Medio' },
  { id: 'pesado', nombre: 'Pesado' },
]

export function SelectorEsfuerzo({ valor, onCambio }: { valor: Esfuerzo; onCambio: (e: Esfuerzo) => void }) {
  return (
    <div className="selector-esfuerzo" role="radiogroup" aria-label="¿Cuánto te pesa?">
      {ESFUERZOS.map((e) => (
        <button
          key={e.id}
          type="button"
          role="radio"
          aria-checked={valor === e.id}
          className="chip-esfuerzo"
          data-activo={valor === e.id || undefined}
          onClick={() => onCambio(e.id)}
        >
          <Icono svg={ICONOS_ESFUERZO[e.id]} tamano={20} />
          {e.nombre}
        </button>
      ))}
    </div>
  )
}

/* ── Acciones / Rechazar · Aceptar ──────────────────── */
export function AccionesCarta({
  onRechazar,
  onAceptar,
  className,
}: {
  onRechazar?: () => void
  onAceptar?: () => void
  className?: string
}) {
  return (
    <div className={['acciones-carta', className].filter(Boolean).join(' ')}>
      <button type="button" className="acciones-carta__boton" onClick={onRechazar}>
        <Icono svg={ICONOS_UI['accion-rechazar']} tamano={32} />
        Rechazar
      </button>
      <button type="button" className="acciones-carta__boton" onClick={onAceptar}>
        <Icono svg={ICONOS_UI['accion-aceptar']} tamano={32} />
        Aceptar
      </button>
    </div>
  )
}

/* ── Overlays ────────────────────────────────────────
   Velo de fondo (superficie/velo) que cierra al tocar fuera y con Escape. */
export function Overlay({
  onCerrar,
  children,
  posicion = 'centro',
  etiqueta,
}: {
  onCerrar: () => void
  children: ReactNode
  posicion?: 'centro' | 'abajo'
  etiqueta: string
}) {
  useEffect(() => {
    const tecla = (e: KeyboardEvent) => e.key === 'Escape' && onCerrar()
    window.addEventListener('keydown', tecla)
    return () => window.removeEventListener('keydown', tecla)
  }, [onCerrar])

  return (
    <div className="overlay" data-posicion={posicion} role="dialog" aria-modal="true" aria-label={etiqueta}>
      <button type="button" className="overlay__velo" aria-label="Cerrar" onClick={onCerrar} />
      <div className="overlay__contenido">{children}</div>
    </div>
  )
}

/** Indicador de pasos del onboarding. */
export function Pasos({ actual, total = 3 }: { actual: number; total?: number }) {
  return (
    <div className="pasos" aria-label={`Paso ${actual + 1} de ${total}`}>
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className="pasos__punto" data-actual={i === actual || undefined} />
      ))}
    </div>
  )
}
