import { NavLink } from 'react-router-dom'
import './BarraNav.css'

/* Barra de navegación inferior de cristal: Empezar · Tareas · Perfil.
   La pestaña activa se abre en una píldora lima con el icono en un círculo tinta;
   las otras se quedan solo con el icono de línea. */

const trazo = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' } as const

const ICONOS = {
  casa: (activo: boolean) => (
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
      <path d="M4 10.5 12 4l8 6.5V19a1.5 1.5 0 0 1-1.5 1.5H15v-5.5H9v5.5H5.5A1.5 1.5 0 0 1 4 19z" {...trazo} fill={activo ? 'currentColor' : 'none'} />
    </svg>
  ),
  tareas: (activo: boolean) => (
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
      <rect x="5" y="3.5" width="14" height="17" rx="2.5" {...trazo} fill={activo ? 'currentColor' : 'none'} />
      <path d="M9 8.5h6M9 12h6M9 15.5h3.5" {...trazo} stroke={activo ? 'var(--marca-tinta)' : 'currentColor'} />
    </svg>
  ),
  perfil: (activo: boolean) => (
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
      <circle cx="12" cy="8" r="3.8" {...trazo} fill={activo ? 'currentColor' : 'none'} />
      <path d="M4.5 20c.8-3.6 3.8-5.8 7.5-5.8s6.7 2.2 7.5 5.8z" {...trazo} fill={activo ? 'currentColor' : 'none'} />
    </svg>
  ),
}

const PESTANAS = [
  { a: '/inicio', texto: 'Empezar', icono: ICONOS.casa },
  { a: '/tareas', texto: 'Tareas', icono: ICONOS.tareas },
  { a: '/perfil', texto: 'Perfil', icono: ICONOS.perfil },
] as const

export function BarraNav() {
  return (
    <nav className="barra-nav" aria-label="Navegación principal">
      {PESTANAS.map((p) => (
        <NavLink key={p.a} to={p.a} end className="barra-nav__pestana" aria-label={p.texto}>
          {({ isActive }) => (
            <>
              <span className="barra-nav__icono">{p.icono(isActive)}</span>
              {isActive && <span className="barra-nav__texto">{p.texto}</span>}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
