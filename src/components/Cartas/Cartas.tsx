import type { CSSProperties } from 'react'
import { Icono } from '../Icono/Icono'
import { ICONOS_CATEGORIA, ICONOS_TIPO, ICONOS_UI, type Categoria } from '../Icono/iconos'
import { TIPOS_RETO, type TipoReto } from '../CartaReto/tipos'
import './Cartas.css'

/* Variantes de carta de Figma (Sistema de diseño):
   - CartaV3      «Carta de reto · Flow it! v3 (icono)»   300 × 400
   - CartaDetalle «Carta de reto · Flow it! detalle»      382 × 214
   - CartaReverso «Carta de reto · Flow it! reverso»      300 × 400
   Todas cambian de color con data-tipo («Carta de reto · Tipo»).
   `escala` reduce la carta entera (CSS zoom), como las instancias escaladas de Figma. */

const nombreTipo = (t: TipoReto) => TIPOS_RETO.find((x) => x.id === t)!.nombre

/** Icono de categoría con los acentos dibujados alrededor (misma proporción en todas las cartas). */
export function IconoConAcentos({ categoria, tamano }: { categoria: Categoria; tamano: number }) {
  return (
    <span className="icono-acentos" style={{ width: tamano, height: tamano }}>
      <Icono svg={ICONOS_CATEGORIA[categoria]} tamano={tamano} />
      <span className="icono-acentos__trazos" dangerouslySetInnerHTML={{ __html: ACENTOS }} />
    </span>
  )
}

/* Los 4 trazos de «acentos», recortados a su caja (viewBox) para colocarlos relativos al icono */
const ACENTOS = ICONOS_UI['acentos-carta'].replace(
  /width="340" height="182" viewBox="0 0 340 182"/,
  'viewBox="95.2 41.4 153.6 102.9" preserveAspectRatio="none" overflow="visible"',
)

type BaseProps = {
  tipo: TipoReto
  categoria: Categoria
  escala?: number
  className?: string
  style?: CSSProperties
}

type ConTextos = BaseProps & {
  /** «Trabajo · email de Carlos» */
  etiqueta: string
  reto: string
  numero: string
}

export function CartaV3({ tipo, categoria, etiqueta, reto, numero, escala = 1, className, style }: ConTextos) {
  return (
    <article
      className={['carta-v3', className].filter(Boolean).join(' ')}
      data-tipo={tipo}
      style={{ zoom: escala, ...style }}
    >
      <span className="carta-v3__icono">
        <IconoConAcentos categoria={categoria} tamano={96} />
      </span>
      <p className="carta-v3__etiqueta">{etiqueta}</p>
      <p className="carta-v3__reto" data-largo={reto.length > 52 || undefined}>
        {reto}
      </p>
      <div className="carta-v3__pie">
        <span className="carta-v3__numero">{numero}</span>
        <span className="carta-v3__pegatina">
          <Icono svg={ICONOS_TIPO[tipo]} tamano={16} />
          {nombreTipo(tipo).toUpperCase()}
        </span>
      </div>
    </article>
  )
}

export function CartaDetalle({ tipo, categoria, etiqueta, reto, numero, className, style }: ConTextos) {
  return (
    <article className={['carta-detalle', className].filter(Boolean).join(' ')} data-tipo={tipo} style={style}>
      <span className="carta-detalle__icono">
        <IconoConAcentos categoria={categoria} tamano={112} />
      </span>
      <div className="carta-detalle__contenido">
        <p className="carta-detalle__etiqueta">{etiqueta}</p>
        <p className="carta-detalle__reto t-carta-reto-s" data-largo={reto.length > 48 || undefined}>
          {reto}
        </p>
      </div>
      <div className="carta-detalle__pie">
        <span className="carta-detalle__numero">{numero}</span>
        <span className="carta-detalle__pegatina">
          <Icono svg={ICONOS_TIPO[tipo]} tamano={12.8} />
          {nombreTipo(tipo).toUpperCase()}
        </span>
      </div>
    </article>
  )
}

export function CartaReverso({ tipo, categoria, escala = 1, className, style }: BaseProps) {
  return (
    <div
      className={['carta-reverso', className].filter(Boolean).join(' ')}
      data-tipo={tipo}
      style={{ zoom: escala, ...style }}
      aria-hidden="true"
    >
      <span className="carta-reverso__icono">
        <IconoConAcentos categoria={categoria} tamano={186} />
      </span>
    </div>
  )
}
