import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BarraNav } from '../../components/BarraNav/BarraNav'
import { Boton } from '../../components/Boton/Boton'
import { CartaReverso, IconoConAcentos } from '../../components/Cartas/Cartas'
import { Icono } from '../../components/Icono/Icono'
import { ICONOS_CATEGORIA, ICONOS_TIPO, ICONOS_UI, type Categoria } from '../../components/Icono/iconos'
import { BotonVolver, Pantalla } from '../../components/UI/UI'
import { NOMBRE_CATEGORIA } from '../../datos/modelo'
import { haceCuanto } from '../../datos/retos'
import { useFlow } from '../../estado/FlowEstado'
import { resumen } from '../../datos/aprendizaje'
import { TIPOS_RETO } from '../../components/CartaReto/tipos'
import './Perfil.css'

/* 12 · Perfil (mazos), 12b · Perfil · Retomar y 13 · Crear categoría
   (Figma 2385:16705, 2388:7976, 2108:8606). */

const GIROS = [-1, 2, -3, 3, -4]

function Cabecera({ claro }: { claro?: boolean }) {
  const { estado } = useFlow()
  const retos = estado.tareas.reduce((s, t) => s + t.retos, 0)
  const nivel = 1 + Math.floor(retos / 2)
  return (
    <header className="perfil__cabecera">
      <BotonVolver a="/inicio" className="perfil__volver" />
      <span className="perfil__avatar t-titular-l" data-claro={claro || undefined}>
        {estado.nombre ? estado.nombre.charAt(0) : <Icono svg={ICONOS_UI.usuario} tamano={40} />}
      </span>
      <h1 className="t-titular-l perfil__nombre">{estado.nombre || 'Tu perfil'}</h1>
      <div className="perfil__nivel">
        <p>
          Nivel {nivel}
          <br />
          Retos conseguidos
        </p>
        <strong>{retos}</strong>
      </div>
    </header>
  )
}

export default function Perfil() {
  const navegar = useNavigate()
  const { estado, despachar } = useFlow()
  const [pestana, setPestana] = useState<'mazos' | 'retomar' | 'funciona'>('mazos')
  const aMedias = estado.tareas.filter((t) => t.estado === 'a-medias')

  return (
    <Pantalla fondo="lienzo" className="perfil">
      <Cabecera claro={pestana === 'retomar'} />

      <nav className="pestanas" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={pestana === 'mazos'}
          className="t-texto-control"
          onClick={() => setPestana('mazos')}
        >
          Mazos
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={pestana === 'retomar'}
          className="t-texto-control"
          onClick={() => setPestana('retomar')}
        >
          Retomar · {aMedias.length}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={pestana === 'funciona'}
          className="t-texto-control"
          onClick={() => setPestana('funciona')}
        >
          Te funciona
        </button>
      </nav>

      {pestana === 'funciona' ? (
        <LoQueTeFunciona />
      ) : pestana === 'mazos' ? (
        <ul className="mazos" role="tabpanel">
          {estado.mazos.map((m) => (
            <li key={m.categoria} className="mazos__item">
              <span className="mazos__pila">
                {(m.cartas.length ? m.cartas.slice(-5) : (['novedad'] as const)).map((tipo, i) => (
                  <CartaReverso
                    key={i}
                    tipo={tipo}
                    categoria={m.categoria}
                    escala={0.223}
                    style={{ transform: `rotate(${GIROS[i % GIROS.length]}deg) translate(${i % 2 ? 18 : 0}px, ${-18 * i}px)` }}
                    className={m.cartas.length ? undefined : 'mazos__vacia'}
                  />
                ))}
              </span>
              <span className="t-titular-boton">{m.nombre}</span>
              <span className="t-texto-cuerpo-s mazos__cuenta">
                {m.cartas.length} {m.cartas.length === 1 ? 'carta' : 'cartas'}
              </span>
            </li>
          ))}
          <li className="mazos__item">
            <button type="button" className="mazos__nuevo" onClick={() => navegar('/perfil/nueva-categoria')}>
              <span className="mazos__hueco t-titular-m">+</span>
              <span className="t-titular-boton">Nueva categoría</span>
            </button>
          </li>
        </ul>
      ) : (
        <ul className="retomar" role="tabpanel">
          {aMedias.length === 0 && <li className="t-texto-cuerpo retomar__vacio">No tienes retos a medias.</li>}
          {aMedias.map((t) => (
            <li key={t.id}>
              <button
                type="button"
                className="reto-a-medias"
                data-tipo={t.ultimoTipo}
                onClick={() => {
                  despachar({ tipo: 'retomar', id: t.id })
                  navegar('/reto')
                }}
              >
                <Icono svg={ICONOS_CATEGORIA[t.categoria]} tamano={32} />
                <span className="reto-a-medias__textos">
                  <span className="t-texto-control">
                    {NOMBRE_CATEGORIA[t.categoria]} · {haceCuanto(t.actualizada)}
                  </span>
                  <span className="t-texto-cuerpo">{t.texto}</span>
                </span>
                <span className="reto-a-medias__seguir t-texto-control">
                  Seguir
                  <Icono svg={ICONOS_UI.seguir} tamano={12} />
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <BarraNav />
    </Pantalla>
  )
}

/* ── Lo que te funciona: resumen de lo aprendido (aprendizaje.ts) ── */

const QUE_HACE: Record<string, string> = {
  novedad: 'cambiar de sitio, de orden o de herramienta',
  desafio: 'una meta pequeña que se puede contar',
  pasion: 'juntarlo con algo que te gusta',
  interes: 'hacerlo con alguien o con un dato curioso',
  urgencia: 'un plazo corto',
}

function LoQueTeFunciona() {
  const { estado, despachar } = useFlow()
  const r = resumen(estado.aprendizaje)
  const nombre = (t: string) => TIPOS_RETO.find((x) => x.id === t)?.nombre ?? t

  if (r.total < 3)
    return (
      <div className="funciona" role="tabpanel">
        <p className="t-texto-cuerpo funciona__vacio">
          Cuando aceptes o rechaces unas cuantas cartas, aquí verás qué tipo de reto te activa más. La app usa eso para
          poner primero las cartas que mejor te funcionan.
        </p>
      </div>
    )

  return (
    <div className="funciona" role="tabpanel">
      {r.mejor && (
        <p className="t-texto-cuerpo funciona__titular">
          Te activan más las cartas de <strong>{nombre(r.mejor.tipo)}</strong>: {QUE_HACE[r.mejor.tipo]}. Aceptas el{' '}
          {r.mejor.porcentaje} %.
        </p>
      )}
      <ul className="funciona__lista">
        {TIPOS_RETO.map((t) => {
          const datos = r.tipos.find((x) => x.tipo === t.id)
          return (
            <li key={t.id} className="funciona__fila" data-tipo={t.id}>
              <span className="funciona__nombre t-texto-control">{t.nombre}</span>
              <span className="funciona__barra" aria-hidden="true">
                <span style={{ width: `${datos?.porcentaje ?? 0}%` }} />
              </span>
              <span className="funciona__dato t-texto-cuerpo-s">
                {datos ? `${datos.aceptadas} de ${datos.vistas}` : 'sin datos'}
                {datos?.conseguidas ? ` · ${datos.conseguidas} ✓` : ''}
              </span>
            </li>
          )
        })}
      </ul>
      <p className="t-texto-cuerpo-s funciona__nota">
        Basado en {r.total} cartas. Las cartas que más aceptas y consigues salen antes en los mazos siguientes. Solo se
        guarda en este móvil.
      </p>
      <button type="button" className="t-texto-control funciona__borrar" onClick={() => despachar({ tipo: 'borrar-aprendizaje' })}>
        Borrar lo aprendido
      </button>
    </div>
  )
}

/* ── 13 · Crear categoría ──────────────────────────── */
const SIMBOLOS: Categoria[] = ['trabajo', 'estudios', 'limpieza', 'deporte', 'autocuidado']

export function NuevaCategoria() {
  const navegar = useNavigate()
  const { despachar } = useFlow()
  const [nombre, setNombre] = useState('')
  const [simbolo, setSimbolo] = useState<Categoria>('deporte')

  return (
    <Pantalla fondo="lienzo" className="nueva-categoria">
      <header>
        <BotonVolver a="/perfil" className="perfil__volver" />
        <h1 className="t-titular-l nueva-categoria__titulo">
          nueva
          <br />
          categoría
        </h1>
      </header>

      <form
        className="nueva-categoria__cuerpo"
        onSubmit={(e) => {
          e.preventDefault()
          despachar({ tipo: 'nuevo-mazo', categoria: simbolo, nombre: nombre.trim() || NOMBRE_CATEGORIA[simbolo] })
          navegar('/perfil', { replace: true })
        }}
      >
        <label className="nueva-categoria__grupo">
          <span className="t-texto-subtitulo">¿Cómo la llamas?</span>
          <input
            className="nueva-categoria__campo t-titular-boton"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder={NOMBRE_CATEGORIA[simbolo]}
          />
        </label>

        <fieldset className="nueva-categoria__grupo">
          <legend className="t-texto-subtitulo">Elige un símbolo</legend>
          <div className="simbolos">
            {SIMBOLOS.map((c) => (
              <button
                key={c}
                type="button"
                className="simbolo"
                aria-label={NOMBRE_CATEGORIA[c]}
                aria-pressed={simbolo === c}
                onClick={() => setSimbolo(c)}
              >
                <Icono svg={ICONOS_CATEGORIA[c]} tamano={32} />
              </button>
            ))}
          </div>
        </fieldset>

        <div className="nueva-categoria__grupo">
          <span className="t-texto-subtitulo">Así se verá tu mazo</span>
          <div className="vista-mazo" aria-hidden="true">
            <CartaReverso tipo="desafio" categoria={simbolo} escala={0.5} className="vista-mazo__fondo" style={{ rotate: '8deg' }} />
            <CartaReverso tipo="urgencia" categoria={simbolo} escala={0.5} className="vista-mazo__fondo" style={{ rotate: '-8deg' }} />
            <div className="vista-mazo__delante" data-tipo="novedad">
              <IconoConAcentos categoria={simbolo} tamano={48} />
              <p className="t-texto-cuerpo-s">Ponte las zapatillas. Nada más.</p>
              <span className="t-texto-control">
                <Icono svg={ICONOS_TIPO.novedad} tamano={8} />
                Novedad
              </span>
            </div>
          </div>
        </div>

        <p className="t-texto-cuerpo nueva-categoria__nota">
          Los retos se irán apilando aquí, cada uno con el color de su tono.
        </p>

        <Boton type="submit" icono={ICONOS_UI.check} className="nueva-categoria__crear">
          Crear mazo
        </Boton>
      </form>
    </Pantalla>
  )
}
