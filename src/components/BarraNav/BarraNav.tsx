import { NavLink } from 'react-router-dom'
import './BarraNav.css'

/* Barra de navegación inferior: Empezar · Tareas · Perfil.
   Píldora tinta; la pestaña activa es una píldora lima con icono y nombre en tinta;
   las otras son solo el icono relleno en lima. */

const ICONOS = {
  casa: (
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
      <path d="M3.5 10.6 12 3.8l8.5 6.8v8.6a1.3 1.3 0 0 1-1.3 1.3H14.8v-5.6H9.2v5.6H4.8a1.3 1.3 0 0 1-1.3-1.3z" fill="currentColor" />
    </svg>
  ),
  tareas: (
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
      <path d="M7.5 3h9A2.5 2.5 0 0 1 19 5.5v13a2.5 2.5 0 0 1-2.5 2.5h-9A2.5 2.5 0 0 1 5 18.5v-13A2.5 2.5 0 0 1 7.5 3Z" fill="currentColor" />
      <path d="M8.8 8.5h6.4M8.8 12h6.4M8.8 15.5h3.6" stroke="var(--barra-fondo-icono)" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),
  perfil: (
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
      <circle cx="12" cy="7.8" r="4.3" fill="currentColor" />
      <path d="M3.8 20.4c.7-4 4-6.6 8.2-6.6s7.5 2.6 8.2 6.6a.8.8 0 0 1-.8.9H4.6a.8.8 0 0 1-.8-.9Z" fill="currentColor" />
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
              <span className="barra-nav__icono">{p.icono}</span>
              {isActive && <span className="barra-nav__texto">{p.texto}</span>}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
