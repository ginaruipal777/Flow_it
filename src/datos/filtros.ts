/* Filtros de seguridad y de comprensión que se aplican antes de crear retos.
   Son los mismos que usa la función api/micro_paso.py, pero aquí van al instante
   y sin conexión. Flow it! es un espacio seguro para tareas cotidianas. */

export const MENSAJE_INCOMPRENSIBLE =
  "No he entendido muy bien qué quieres empezar. ¿Puedes escribirlo de otra forma? Por ejemplo: 'Estudiar tema 3' o 'Limpiar la mesa'."
export const MENSAJE_BLOQUEO =
  'Lo siento, no puedo ayudarte con esa tarea. Flow It está diseñado para tareas cotidianas seguras y positivas.'
export const AYUDA_CRISIS =
  'Si estás pensando en hacerte daño, pide ayuda ahora: llama gratis al 024 (atención a la conducta suicida, 24 horas). Si es una emergencia, llama al 112.'

export type Filtro =
  | { status: 'ok' }
  | { status: 'incomprehensible'; mensaje: string }
  | { status: 'blocked'; mensaje: string; ayuda?: string }

const normalizar = (s: string) =>
  s
    .toLowerCase()
    .replace(/ñ/g, '\0')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\0/g, 'ñ')
    .replace(/[^a-z0-9ñ\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const AUTOLESION =
  /\b(suicid\w*|quitarme la vida|matarme|autolesi\w*|hacerme daño|cortarme las venas|ahorcarme|tirarme por la ventana|tirarme por un puente|sobredosis|no quiero vivir)\b/
const PROHIBIDAS = new RegExp(
  '\\b(' +
    // violencia y daño físico
    'matar(le|la|lo|les|los|las)?|asesin\\w*|apuñal\\w*|disparar a|pegar a|pegarle|golpear a|envenen\\w*|secuestr\\w*|tortur\\w*|bomba|explosivo\\w*|arma de fuego|hacer daño a|hacerle daño|' +
    // contenido sexual
    'sexo|sexual\\w*|porno\\w*|desnud\\w*|follar|violar|violacion|' +
    // actividades ilegales
    'robar|hackear|cocaina|heroina|vender droga\\w*|comprar droga\\w*|falsific\\w*|estafar|blanquear' +
    ')\\b',
)

const SECUENCIAS_TECLADO = ['qwert', 'werty', 'asdf', 'sdfg', 'dfgh', 'fghj', 'ghjk', 'hjkl', 'zxcv', 'xcvb', 'cvbn', 'vbnm', 'poiu', 'lkjh', 'ñlkj']
const VERBOS_CORTOS = new Set(['ir', 'ver', 'dar', 'oir', 'leer', 'ser', 'reir'])
const NO_VERBOS = new Set(['lugar', 'hogar', 'azucar', 'collar', 'altar', 'dolar', 'bar', 'par', 'mar', 'militar', 'popular', 'mujer', 'taller', 'placer', 'ayer', 'primer', 'tercer', 'alfiler', 'cancer', 'caracter', 'elixir', 'nadir'])
const VERBO = /^[a-zñ]{2,}(ar|er|ir)(me|te|se|lo|la|le|los|las|les|nos)?$/

export function tieneVerbo(texto: string) {
  return normalizar(texto)
    .split(' ')
    .some((p) => VERBOS_CORTOS.has(p) || (!NO_VERBOS.has(p) && VERBO.test(p)))
}

export function esGalimatias(texto: string) {
  const limpio = normalizar(texto)
  const letras = limpio.replace(/[^a-zñ]/g, '')
  if (letras.length < 3) return true
  if (SECUENCIAS_TECLADO.some((s) => letras.includes(s)) || /(.)\1{3,}/.test(letras)) return true
  const vocales = [...letras].filter((c) => 'aeiou'.includes(c)).length
  if (vocales / letras.length < 0.2) return true
  return limpio.split(' ').some((p) => p.length >= 6 && !/[aeiou]/.test(p))
}

/** Seguridad primero; después, si se entiende. `conCategoria`: la tarea ya encaja en una
    categoría de la app («dentista»), así que no hace falta que lleve verbo. */
export function filtrarTarea(texto: string, conCategoria: boolean): Filtro {
  const t = normalizar(texto)
  if (AUTOLESION.test(t)) return { status: 'blocked', mensaje: MENSAJE_BLOQUEO, ayuda: AYUDA_CRISIS }
  if (PROHIBIDAS.test(t)) return { status: 'blocked', mensaje: MENSAJE_BLOQUEO }
  if (esGalimatias(texto)) return { status: 'incomprehensible', mensaje: MENSAJE_INCOMPRENSIBLE }
  if (!conCategoria && !tieneVerbo(texto)) return { status: 'incomprehensible', mensaje: MENSAJE_INCOMPRENSIBLE }
  return { status: 'ok' }
}
