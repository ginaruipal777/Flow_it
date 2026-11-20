/* Artículos para los nombres que salen de la frase o de internet («cafetera» → «la cafetera»). */

const ARTICULO = /^(el|la|los|las|un|una|unos|unas|mi|mis|tu|tus|su|sus)\s/i
const PREPOSICION = /^(a|al|con|en|de|del|para|por|sobre|hasta)\s/i
const FEMENINAS = new Set(['llave', 'leche', 'calle', 'noche', 'carne', 'fuente', 'frase', 'clase', 'nube', 'piel', 'sal', 'red', 'luz', 'flor', 'sarten', 'sartén', 'nariz', 'mano', 'foto', 'moto', 'radio', 'tele', 'web', 'app', 'cama', 'torre'])
const MASCULINAS_EN_A = new Set(['dia', 'día', 'mapa', 'sofa', 'sofá', 'problema', 'sistema', 'programa', 'agua', 'tema', 'planeta', 'idioma', 'clima', 'pijama'])

/** Artículo que le toca a un nombre sin artículo («cafetera» → «la cafetera»); «mi» pasa a «tu». */
export function conArticulo(nombre: string): string {
  const n = nombre.replace(/(^|\s)mi(s?)\s/gi, '$1tu$2 ')
  if (ARTICULO.test(`${n} `) || PREPOSICION.test(`${n} `)) return n
  const primera = n.split(' ')[0].toLowerCase()
  const plural = /s$/.test(primera) && primera.length > 3 && !/(is|us)$/.test(primera)
  const fem = FEMENINAS.has(primera) || (/(a|ión|ion|dad|tad|tud|umbre)s?$/.test(primera) && !MASCULINAS_EN_A.has(primera))
  return `${plural ? (fem ? 'las' : 'los') : fem ? 'la' : 'el'} ${n}`
}
