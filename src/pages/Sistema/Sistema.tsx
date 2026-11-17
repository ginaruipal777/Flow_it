import { Boton, type EstiloBoton, type TamanoBoton } from '../../components/Boton/Boton'
import { CartaReto } from '../../components/CartaReto/CartaReto'
import { TIPOS_RETO, type TipoReto } from '../../components/CartaReto/tipos'
import { Icono } from '../../components/Icono/Icono'
import { ICONOS_CATEGORIA, type Categoria } from '../../components/Icono/iconos'
import './Sistema.css'

/* ── Datos de la página ───────────────────────────────── */

const COLORES: { grupo: string; tokens: [string, string][] }[] = [
  {
    grupo: 'Marca',
    tokens: [
      ['marca/tinta', '#1b1340'],
      ['marca/violeta', '#5b3fe0'],
      ['marca/violeta-oscuro', '#3a22a6'],
      ['marca/lima', '#d4ff3a'],
      ['marca/rosa', '#f7a3e0'],
      ['marca/lila', '#cfb2ff'],
    ],
  },
  {
    grupo: 'Superficie',
    tokens: [
      ['superficie/blanco', '#ffffff'],
      ['superficie/crema', '#efe6d8'],
      ['superficie/crema-clara', '#f8f3ea'],
      ['superficie/lienzo', '#faf8f5'],
      ['superficie/lila-suave', '#ebe6fa'],
      ['superficie/velo', '#0b1030'],
      ['superficie/negro', '#000000'],
    ],
  },
  {
    grupo: 'Texto',
    tokens: [
      ['texto/secundario', '#6b6580'],
      ['texto/apagado', '#706b8c'],
      ['texto/gris', '#626360'],
      ['texto/suave', '#4a4458'],
    ],
  },
  {
    grupo: 'Borde y gris',
    tokens: [
      ['borde/suave', '#ddd9e8'],
      ['borde/claro', '#e8e8e8'],
      ['gris/carta', '#b9b3c9'],
      ['gris/claro', '#d9d9d9'],
    ],
  },
]

const TOKENS_CARTA = [
  'fondo',
  'tinta',
  'linea',
  'mazo-1',
  'mazo-2',
  'mazo-3',
  'pegatina-fondo',
  'pegatina-tinta',
]

const TIPOGRAFIAS: { clase: string; nombre: string; detalle: string; muestra: string }[] = [
  { clase: 't-titular-display', nombre: 'Titulares/Display', detalle: 'Bricolage Grotesque ExtraBold · 78 / 92 % · −3 %', muestra: 'Flow it!' },
  { clase: 't-titular-l', nombre: 'Titulares/Título L', detalle: 'Bricolage Grotesque ExtraBold · 44 / 95 % · −2 %', muestra: 'Un paso pequeño' },
  { clase: 't-titular-m', nombre: 'Titulares/Título M', detalle: 'Bricolage Grotesque ExtraBold · 26 / 105 %', muestra: 'Elige tu reto de hoy' },
  { clase: 't-titular-boton', nombre: 'Titulares/Botón', detalle: 'Bricolage Grotesque Bold · 18 / auto', muestra: 'Acepto' },
  { clase: 't-titular-boton-s', nombre: 'Titulares/Botón S', detalle: 'Bricolage Grotesque Bold · 14 / auto', muestra: 'Acepto' },
  { clase: 't-texto-subtitulo', nombre: 'Texto/Subtítulo', detalle: 'Fustat Bold · 18 / 125 %', muestra: 'Responder el email de Carlos' },
  { clase: 't-texto-cuerpo', nombre: 'Texto/Cuerpo', detalle: 'Fustat Medium · 18 / 140 %', muestra: 'Divide la tarea hasta que el primer paso dé risa de lo fácil.' },
  { clase: 't-texto-cuerpo-s', nombre: 'Texto/Cuerpo S', detalle: 'Fustat Medium · 15 / 135 %', muestra: 'Divide la tarea hasta que el primer paso dé risa de lo fácil.' },
  { clase: 't-texto-control', nombre: 'Texto/Control', detalle: 'Fustat Bold · 15 / auto', muestra: 'Ligero · Medio · Pesado' },
  { clase: 't-texto-eyebrow', nombre: 'Texto/Eyebrow', detalle: 'Fustat ExtraBold · 13 / auto · 16 %', muestra: 'PASO 1 · FORMA 1 DE 5' },
  { clase: 't-texto-eyebrow-s', nombre: 'Texto/Eyebrow S', detalle: 'Fustat ExtraBold · 11 / auto · 16 %', muestra: 'PASO 1 · FORMA 1 DE 5' },
  { clase: 't-carta-reto', nombre: 'Carta/Reto', detalle: 'Fustat SemiBold · 27 / 135 % · 1 %', muestra: 'Abre el borrador y escribe solo el saludo.' },
  { clase: 't-carta-reto-s', nombre: 'Carta/Reto S', detalle: 'Fustat SemiBold · 19 / 130 % · 1 %', muestra: 'Abre el borrador y escribe solo el saludo.' },
  { clase: 't-carta-numero', nombre: 'Carta/Número', detalle: 'Fustat ExtraBold · 22 / auto · 2 %', muestra: '01' },
  { clase: 't-marca-logotipo', nombre: 'Marca/Logotipo', detalle: 'Pacifico Regular · 48 / 120 %', muestra: 'Flow it!' },
]

const ESTILOS_BOTON: EstiloBoton[] = ['primario', 'secundario', 'contorno', 'texto']
const TAMANOS_BOTON: TamanoBoton[] = ['grande', 'pequeno']

/* Textos de ejemplo de la colección «Reto · Datos» (datos de prueba, no tokens) */
const RETOS_EJEMPLO: Record<TipoReto, string> = {
  novedad: 'Abre el borrador y escribe solo el saludo.',
  desafio: 'Resume tu respuesta en tres frases. Ni una más.',
  pasion: 'Empieza por lo que de verdad quieres decirle.',
  interes: 'Relee su email y busca la pregunta clave.',
  urgencia: 'Contesta ahora, antes de abrir nada más.',
}

/* ── Página ───────────────────────────────────────────── */

export default function Sistema() {
  return (
    <main className="sistema">
      <header className="sistema__cabecera">
        <p className="t-marca-logotipo sistema__logo">Flow it!</p>
        <h1 className="t-titular-l">Sistema de diseño</h1>
        <p className="t-texto-cuerpo sistema__intro">
          Fundamentos y componentes traducidos desde Figma. Fase 1: colores, tipografías, Botón v3 y Carta de reto ·
          Selección.
        </p>
      </header>

      <section className="sistema__seccion">
        <p className="t-texto-eyebrow sistema__eyebrow">0 · FUNDAMENTOS</p>
        <h2 className="t-titular-m">Color · Flow it! · Color</h2>
        {COLORES.map(({ grupo, tokens }) => (
          <div key={grupo} className="sistema__grupo">
            <h3 className="t-texto-subtitulo">{grupo}</h3>
            <ul className="muestras">
              {tokens.map(([nombre, hex]) => (
                <li key={nombre} className="muestra">
                  <span className="muestra__color" style={{ background: `var(--${nombre.replace('/', '-')})` }} />
                  <span className="t-texto-control">{nombre}</span>
                  <code className="muestra__hex">{hex}</code>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section className="sistema__seccion">
        <h2 className="t-titular-m">Color · Carta de reto · Tipo</h2>
        <p className="t-texto-cuerpo-s sistema__nota">
          Cada carta lleva <code>data-tipo</code>; el atributo cambia los 8 tokens <code>--carta-*</code>.
        </p>
        <div className="tabla-carta" role="table">
          <div role="row" className="tabla-carta__fila">
            <span role="columnheader" />
            {TIPOS_RETO.map((t) => (
              <span key={t.id} role="columnheader" className="t-texto-control">
                {t.nombre}
              </span>
            ))}
          </div>
          {TOKENS_CARTA.map((token) => (
            <div key={token} role="row" className="tabla-carta__fila">
              <code role="rowheader">carta/{token}</code>
              {TIPOS_RETO.map((t) => (
                <span
                  key={t.id}
                  role="cell"
                  data-tipo={t.id}
                  className="tabla-carta__celda"
                  style={{ background: `var(--carta-${token})` }}
                />
              ))}
            </div>
          ))}
        </div>
      </section>

      <section className="sistema__seccion">
        <h2 className="t-titular-m">Tipografía</h2>
        <ul className="tipos">
          {TIPOGRAFIAS.map((t) => (
            <li key={t.clase} className="tipo">
              <div className="tipo__meta">
                <span className="t-texto-control">{t.nombre}</span>
                <span className="t-texto-cuerpo-s sistema__nota">{t.detalle}</span>
              </div>
              <p className={t.clase}>{t.muestra}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="sistema__seccion">
        <p className="t-texto-eyebrow sistema__eyebrow">1 · ÁTOMOS</p>
        <h2 className="t-titular-m">Botón v3</h2>
        <div className="botones">
          <span />
          <span className="t-texto-eyebrow-s botones__cabecera">REPOSO</span>
          <span className="t-texto-eyebrow-s botones__cabecera">PULSADO</span>
          <span className="t-texto-eyebrow-s botones__cabecera">DESACTIVADO</span>
          {ESTILOS_BOTON.flatMap((estilo) =>
            TAMANOS_BOTON.map((tamano) => (
              <div key={estilo + tamano} className="botones__fila">
                <span className="t-texto-eyebrow-s botones__cabecera">
                  {estilo.toUpperCase()} · {tamano === 'grande' ? 'G' : 'P'}
                </span>
                <div>
                  <Boton estilo={estilo} tamano={tamano}>
                    Acepto
                  </Boton>
                </div>
                <div>
                  <Boton estilo={estilo} tamano={tamano} forzarPulsado>
                    Acepto
                  </Boton>
                </div>
                <div>
                  <Boton estilo={estilo} tamano={tamano} disabled>
                    Acepto
                  </Boton>
                </div>
              </div>
            )),
          )}
        </div>
      </section>

      <section className="sistema__seccion">
        <h2 className="t-titular-m">Iconos de categoría</h2>
        <ul className="iconos">
          {(Object.keys(ICONOS_CATEGORIA) as Categoria[]).map((c) => (
            <li key={c} className="iconos__item">
              <Icono svg={ICONOS_CATEGORIA[c]} tamano={64} />
              <span className="t-texto-control">{c}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="sistema__seccion">
        <p className="t-texto-eyebrow sistema__eyebrow">2 · MOLÉCULAS</p>
        <h2 className="t-titular-m">Carta de reto · Selección</h2>
        <div className="cartas">
          {TIPOS_RETO.map((t) => (
            <CartaReto key={t.id} tipo={t.id} reto={RETOS_EJEMPLO[t.id]} />
          ))}
        </div>
      </section>
    </main>
  )
}
