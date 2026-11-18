import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react'
import type { Categoria } from '../components/Icono/iconos'
import type { TipoReto } from '../components/CartaReto/tipos'
import { NOMBRE_CATEGORIA, type Esfuerzo, type Mazo, type Tarea } from '../datos/modelo'
import { detectarCategoria } from '../datos/retos'
import { NUM_MAZOS } from '../datos/reglas'

/* Estado de la app guardado en el navegador (localStorage).
   Más adelante se cambiará por una base de datos con cuentas. */

type Estado = {
  onboardingVisto: boolean
  nombre: string
  esfuerzo: Esfuerzo
  tareas: Tarea[]
  tareaActual: string | null
  /** Carta del mazo que se está mirando (0–4). */
  indiceReto: number
  /** Mazo de la misma tarea (0, 1, 2): al rechazar las 5 cartas se reparte otro con retos distintos. */
  mazo: number
  /** Tipo del reto aceptado. */
  retoAceptado: TipoReto | null
  /** Última tarea marcada como completada (resalta su fila en «Tus tareas»). */
  recienCompletada: string | null
  mazos: Mazo[]
}

type Accion =
  | { tipo: 'onboarding-visto' }
  | { tipo: 'esfuerzo'; esfuerzo: Esfuerzo }
  | { tipo: 'nueva-tarea'; texto: string }
  | { tipo: 'retomar'; id: string }
  | { tipo: 'cambiar-categoria'; categoria: Categoria }
  | { tipo: 'siguiente-reto' }
  | { tipo: 'reiniciar-mazo' }
  | { tipo: 'mazo-siguiente' }
  | { tipo: 'aceptar-reto'; reto: TipoReto }
  | { tipo: 'reto-conseguido' }
  | { tipo: 'completar-tarea' }
  | { tipo: 'dejar-a-medias' }
  | { tipo: 'nuevo-mazo'; categoria: Categoria; nombre: string }
  | { tipo: 'premio'; premio: string | undefined }

/* Versión de fábrica: la app arranca vacía, como recién descargada.
   Las reglas y el banco de retos están en src/datos; aquí solo se guarda lo que hace cada persona. */
const INICIAL: Estado = {
  onboardingVisto: false,
  nombre: '',
  esfuerzo: 'ligero',
  tareas: [],
  tareaActual: null,
  indiceReto: 0,
  mazo: 0,
  retoAceptado: null,
  recienCompletada: null,
  mazos: [],
}

function cambiarTarea(e: Estado, cambio: (t: Tarea) => Tarea): Estado {
  return { ...e, tareas: e.tareas.map((t) => (t.id === e.tareaActual ? { ...cambio(t), actualizada: Date.now() } : t)) }
}

function reductor(e: Estado, a: Accion): Estado {
  switch (a.tipo) {
    case 'onboarding-visto':
      return { ...e, onboardingVisto: true }
    case 'premio':
      return cambiarTarea(e, (t) => ({ ...t, premio: a.premio }))
    case 'esfuerzo':
      return { ...e, esfuerzo: a.esfuerzo }
    case 'nueva-tarea': {
      const t: Tarea = {
        id: crypto.randomUUID(),
        texto: a.texto.trim(),
        categoria: detectarCategoria(a.texto),
        esfuerzo: e.esfuerzo,
        retos: 0,
        estado: 'en-curso',
        ultimoTipo: 'novedad',
        actualizada: Date.now(),
      }
      return { ...e, tareas: [t, ...e.tareas], tareaActual: t.id, indiceReto: 0, mazo: 0, retoAceptado: null }
    }
    case 'retomar':
      return {
        ...e,
        tareaActual: a.id,
        indiceReto: 0,
        mazo: 0,
        retoAceptado: null,
        tareas: e.tareas.map((t) => (t.id === a.id ? { ...t, estado: 'en-curso' } : t)),
      }
    case 'cambiar-categoria':
      return cambiarTarea(e, (t) => ({ ...t, categoria: a.categoria }))
    case 'siguiente-reto':
      // Al pasar la última carta llega un mazo nuevo de la misma tarea; tras el último, «agotado» (5)
      if (e.indiceReto >= 4 && (e.mazo ?? 0) < NUM_MAZOS - 1) return { ...e, indiceReto: 0, mazo: (e.mazo ?? 0) + 1 }
      return { ...e, indiceReto: Math.min(e.indiceReto + 1, 5) }
    case 'reiniciar-mazo':
      return { ...e, indiceReto: 0, mazo: 0 }
    case 'mazo-siguiente':
      return { ...e, indiceReto: 0, mazo: ((e.mazo ?? 0) + 1) % NUM_MAZOS }
    case 'aceptar-reto':
      return { ...cambiarTarea(e, (t) => ({ ...t, ultimoTipo: a.reto })), retoAceptado: a.reto }
    case 'reto-conseguido': {
      const actual = e.tareas.find((t) => t.id === e.tareaActual)
      const reto = e.retoAceptado
      const conReto = cambiarTarea(e, (t) => ({ ...t, retos: t.retos + 1 }))
      if (!actual || !reto) return conReto
      const existe = e.mazos.some((m) => m.categoria === actual.categoria)
      const mazos = existe
        ? e.mazos.map((m) => (m.categoria === actual.categoria ? { ...m, cartas: [...m.cartas, reto] } : m))
        : [...e.mazos, { categoria: actual.categoria, nombre: NOMBRE_CATEGORIA[actual.categoria], cartas: [reto] }]
      return { ...conReto, mazos }
    }
    case 'completar-tarea':
      return {
        // tareaActual se mantiene: si se vaciara aquí, la pantalla 10 redirigiría a /inicio
        // antes de que llegue la navegación a /tareas.
        ...cambiarTarea(e, (t) => ({ ...t, estado: 'completada' })),
        recienCompletada: e.tareaActual,
      }
    case 'dejar-a-medias':
      return cambiarTarea(e, (t) => ({ ...t, estado: 'a-medias' }))
    case 'nuevo-mazo':
      if (e.mazos.some((m) => m.categoria === a.categoria)) return e
      return { ...e, mazos: [...e.mazos, { categoria: a.categoria, nombre: a.nombre, cartas: [] }] }
  }
}

/* v2: versión de fábrica. Se borran los datos de ejemplo que guardaba la v1. */
const CLAVE = 'flowit:estado:v2'
const CLAVES_VIEJAS = ['flowit:estado:v1']

function cargar(): Estado {
  try {
    CLAVES_VIEJAS.forEach((k) => localStorage.removeItem(k))
    const guardado = localStorage.getItem(CLAVE)
    if (guardado) return { ...INICIAL, ...JSON.parse(guardado) }
  } catch {
    /* sin almacenamiento: se usa el estado inicial */
  }
  return INICIAL
}

type Contexto = {
  estado: Estado
  despachar: (a: Accion) => void
  tareaActual: Tarea | null
}

const Ctx = createContext<Contexto | null>(null)

export function FlowEstado({ children }: { children: ReactNode }) {
  const [estado, despachar] = useReducer(reductor, undefined, cargar)

  useEffect(() => {
    try {
      localStorage.setItem(CLAVE, JSON.stringify(estado))
    } catch {
      /* ignorar */
    }
  }, [estado])

  const valor = useMemo(
    () => ({ estado, despachar, tareaActual: estado.tareas.find((t) => t.id === estado.tareaActual) ?? null }),
    [estado],
  )
  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useFlow() {
  const c = useContext(Ctx)
  if (!c) throw new Error('useFlow fuera de <FlowEstado>')
  return c
}
