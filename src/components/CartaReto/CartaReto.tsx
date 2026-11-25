import { Icono } from '../Icono/Icono'
import { ICONOS_CATEGORIA, ICONOS_TIPO, ICONOS_UI, type Categoria } from '../Icono/iconos'
import { TIPOS_RETO, type TipoReto } from './tipos'
import './CartaReto.css'

/* Carta de reto · Selección — Figma 4208:2791
   Los colores salen de «Carta de reto · Tipo» vía data-tipo (ver tokens.css). */

type Props = {
  tipo: TipoReto
  reto: string
  categoria?: Categoria
  className?: string
}

export function CartaReto({ tipo, reto, categoria = 'trabajo', className }: Props) {
  const nombreTipo = TIPOS_RETO.find((t) => t.id === tipo)!.nombre
  return (
    <article className={['carta-reto', className].filter(Boolean).join(' ')} data-tipo={tipo}>
      <Icono svg={ICONOS_UI['acentos-carta']} className="carta-reto__acentos" />
      <Icono svg={ICONOS_CATEGORIA[categoria]} tamano={108.8} className="carta-reto__categoria" />
      <p className="carta-reto__reto t-carta-reto" data-largo={reto.length > 120 ? 2 : reto.length > 60 ? 1 : undefined}>
        {reto}
      </p>
      <div className="carta-reto__pie">
        <span className="carta-reto__pegatina t-texto-subtitulo">
          <Icono svg={ICONOS_TIPO[tipo]} tamano={18.133} />
          {nombreTipo}
        </span>
      </div>
    </article>
  )
}
