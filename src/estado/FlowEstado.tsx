import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react'
import type { Categoria } from '../components/Icono/iconos'
import type { TipoReto } from '../components/CartaReto/tipos'
import { NOMBRE_CATEGORIA, type Esfuerzo, type Mazo, type MicroPasoWeb, type Tarea } from '../datos/modelo'
import { detectarCategoria } from '../datos/retos'
import { numMazos } from '../datos/reglas'
import { leerSituacion } from '../datos/situacion'
import { APRENDIZAJE_VACIO, ordenar, registrar, type Aprendizaje, type Evento } from '../datos/aprendizaje'

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
  /** Lo que ha aprendido la app sobre qué cartas le funcionan (aprendizaje.ts) */
  aprendizaje: Aprendizaje
  /** Orden de las cartas del mazo actual; se calcula al empezar cada mazo y no cambia dentro de él */
  ordenCartas: TipoReto[] | null
  /** Cartas rechazadas seguidas en esta tarea: cada RECHAZOS_PARA_AVISO se abre el aviso */
  rechazosSeguidos: number
  /** Aviso «¿Se te atasca esta tarea?» abierto */
  avisoRechazos: boolean
}

type Accion =
  | { tipo: 'onboarding-visto' }
  | { tipo: 'esfuerzo'; esfuerzo: Esfuerzo }
  | { tipo: 'nueva-tarea'; texto: string; web?: MicroPasoWeb; icono?: Categoria }
  | { tipo: 'retomar'; id: string }
  | { tipo: 'cambiar-categoria'; categoria: Categoria }
  /** `reto`: la carta que se deja (para aprender); `motivo: 'archivo'` si se archiva un reto ya aceptado */
  | { tipo: 'siguiente-reto'; reto?: TipoReto; motivo?: 'rechazo' | 'archivo' }
  | { tipo: 'reiniciar-mazo' }
  | { tipo: 'mazo-siguiente' }
  | { tipo: 'aceptar-reto'; reto: TipoReto }
  | { tipo: 'reto-conseguido' }
  | { tipo: 'completar-tarea' }
  | { tipo: 'dejar-a-medias' }
  | { tipo: 'nuevo-mazo'; categoria: Categoria; nombre: string }
  | { tipo: 'premio'; premio: string | undefined }
  | { tipo: 'borrar-aprendizaje' }
  | { tipo: 'cerrar-aviso' }

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
  aprendizaje: APRENDIZAJE_VACIO,
  ordenCartas: null,
  rechazosSeguidos: 0,
  avisoRechazos: false,
}

/** El aviso «¿Se te atasca esta tarea?» se abre cada 9 cartas rechazadas seguidas */
export const RECHAZOS_PARA_AVISO = 9

/** Mazos distintos de la tarea actual (dependen del esfuerzo y de si tiene categoría) */
function mazosDeTarea(e: Estado) {
  const t = e.tareas.find((x) => x.id === e.tareaActual)
  return t ? numMazos(t.texto, t.esfuerzo, t.web) : 1
}

/** Situación de la tarea actual (situacion.ts) */
function situacionActual(e: Estado) {
  const t = e.tareas.find((x) => x.id === e.tareaActual)
  return t ? leerSituacion(t.texto, t.esfuerzo) : null
}

/** Calcula el orden de cartas del próximo mazo con lo aprendido hasta ahora */
function conOrden(e: Estado): Estado {
  const s = situacionActual(e)
  return { ...e, ordenCartas: s ? ordenar(s.orden, e.aprendizaje, s.id) : null }
}

/** Apunta lo que ha pasado con una carta */
function aprender(e: Estado, tipo: TipoReto | null | undefined, evento: Evento): Estado {
  const s = situacionActual(e)
  if (!tipo || !s) return e
  return { ...e, aprendizaje: registrar(e.aprendizaje, s.id, tipo, evento) }
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
        categoria: a.icono ?? detectarCategoria(a.texto),
        esfuerzo: e.esfuerzo,
        retos: 0,
        estado: 'en-curso',
        ultimoTipo: 'novedad',
        actualizada: Date.now(),
        ...(a.web && { web: a.web }),
      }
      return conOrden({ ...e, tareas: [t, ...e.tareas], tareaActual: t.id, indiceReto: 0, mazo: 0, retoAceptado: null, rechazosSeguidos: 0, avisoRechazos: false })
    }
    case 'retomar':
      return conOrden({
        ...e,
        tareaActual: a.id,
        indiceReto: 0,
        mazo: 0,
        retoAceptado: null,
        rechazosSeguidos: 0,
        avisoRechazos: false,
        tareas: e.tareas.map((t) => (t.id === a.id ? { ...t, estado: 'en-curso' } : t)),
      })
    case 'cambiar-categoria':
      return cambiarTarea(e, (t) => ({ ...t, categoria: a.categoria }))
    case 'siguiente-reto': {
      const n = a.motivo === 'archivo' ? aprender(e, e.retoAceptado, 'archivada') : aprender(e, a.reto, 'rechazada')
      // Cada 9 rechazos seguidos se abre el aviso; los mazos no se acaban: tras el último vuelve el primero
      const rechazos = a.motivo === 'rechazo' ? (n.rechazosSeguidos ?? 0) + 1 : (n.rechazosSeguidos ?? 0)
      const conAviso = { ...n, rechazosSeguidos: rechazos, avisoRechazos: a.motivo === 'rechazo' && rechazos % RECHAZOS_PARA_AVISO === 0 }
      // Al pasar la última carta llega otro mazo de la misma tarea, ya ordenado con lo aprendido
      if (n.indiceReto >= 4) return conOrden({ ...conAviso, indiceReto: 0, mazo: ((n.mazo ?? 0) + 1) % mazosDeTarea(n) })
      return { ...conAviso, indiceReto: n.indiceReto + 1 }
    }
    case 'reiniciar-mazo':
      return conOrden({ ...e, indiceReto: 0, mazo: 0, avisoRechazos: false })
    case 'mazo-siguiente':
      return conOrden({ ...e, indiceReto: 0, mazo: ((e.mazo ?? 0) + 1) % mazosDeTarea(e), avisoRechazos: false })
    case 'cerrar-aviso':
      return { ...e, avisoRechazos: false }
    case 'aceptar-reto':
      return aprender({ ...cambiarTarea(e, (t) => ({ ...t, ultimoTipo: a.reto })), retoAceptado: a.reto, rechazosSeguidos: 0 }, a.reto, 'aceptada')
    case 'reto-conseguido': {
      const actual = e.tareas.find((t) => t.id === e.tareaActual)
      const reto = e.retoAceptado
      const conReto = aprender(cambiarTarea(e, (t) => ({ ...t, retos: t.retos + 1 })), reto, 'conseguida')
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
    case 'borrar-aprendizaje':
      return { ...e, aprendizaje: APRENDIZAJE_VACIO }
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
