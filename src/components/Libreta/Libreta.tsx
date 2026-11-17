import { Icono } from '../Icono/Icono'
import { ICONOS_UI } from '../Icono/iconos'
import { ContadorRetos } from '../UI/UI'
import './Libreta.css'

/* «libreta» de 11 · Tus tareas (382 × 448). En el onboarding O3 se usa reducida. */

export type FilaLibreta = { id: string; texto: string; retos: number; hecha: boolean }

export function Libreta({
  filas,
  resaltada,
  escala = 1,
}: {
  filas: FilaLibreta[]
  /** Fila recién marcada: fondo blanco, entra con animación y se marca el tick. */
  resaltada?: string | null
  escala?: number
}) {
  const retos = filas.reduce((s, f) => s + f.retos, 0)
  return (
    <section className="libreta" style={{ zoom: escala }} aria-label="Total de hoy">
      <div className="libreta__cabecera">
        <div>
          <p className="t-texto-control">Total de hoy</p>
          <p className="t-titular-m">
            {filas.length} {filas.length === 1 ? 'tarea' : 'tareas'} · {retos} {retos === 1 ? 'reto' : 'retos'}
          </p>
        </div>
        <span className="libreta__insignia">
          <Icono svg={ICONOS_UI.estrella} tamano={48} />
        </span>
      </div>
      <hr className="libreta__separador" />
      <ul className="libreta__filas">
        {filas.map((f) => (
          <li key={f.id} className="libreta__fila" data-nueva={f.id === resaltada || undefined}>
            <div className="libreta__texto">
              <p className="t-texto-cuerpo">{f.texto}</p>
              <ContadorRetos retos={f.retos} />
            </div>
            <span className="libreta__casilla" data-hecha={f.hecha || undefined} aria-label={f.hecha ? 'Hecha' : 'Pendiente'}>
              {f.hecha && <Icono svg={ICONOS_UI['tick-grande']} tamano={28} />}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
