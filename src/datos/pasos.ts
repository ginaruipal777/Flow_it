/* ─────────────────────────────────────────────────────────────
   Pasos reales de las guías de internet → acciones para los retos.

   El servidor (api/micro_paso.py, lineas_pasos) devuelve las líneas numeradas de las guías
   que encontró. Aquí se limpian para que sirvan de relleno a los conectores del motor:
     «2. Retirar las rejillas y otros accesorios»  → «Retira las rejillas»
     «**Hidratación previa:** Coloca las semillas…» → «Coloca las semillas»
     «Limpieza de las rejillas»                      → fuera (no empieza por un verbo)
   Reglas de la app: verbo de acción primero (en «tú»), una sola acción (se corta en «y», «o»,
   la coma…), sin tiempos, sin «hacer» ni verbos de decidir, y el filtro de seguridad.
   ───────────────────────────────────────────────────────────── */

import { filtrarTarea } from './filtros.ts'
import { conArticulo } from './articulos.ts'

export type LineaPaso = { doc: number; n: number; texto: string }
/** Elemento de una lista con viñetas de una web, con el título de su sección */
export type LineaLista = { doc: number; seccion: string; texto: string }

const PALABRAS_NO_VERBO = new Set([
  'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas', 'lo', 'al', 'del', 'de', 'en', 'con', 'por', 'para', 'que', 'como',
  'si', 'no', 'es', 'se', 'te', 'tu', 'tus', 'mi', 'mis', 'su', 'sus', 'este', 'esta', 'estos', 'estas', 'ese', 'esa',
  'todo', 'toda', 'todos', 'todas', 'cada', 'antes', 'despues', 'cuando', 'ademas', 'tambien', 'muy', 'mas', 'paso',
])
const NOMINAL = /(eza|ura|ncia|aje|cion|sion|miento|dad|tud|ismo|ista|ante|ente)$/
const NO_VERBOS = new Set(['lugar', 'hogar', 'azucar', 'collar', 'altar', 'mujer', 'taller', 'placer', 'primer', 'tercer', 'interior', 'exterior', 'anterior', 'posterior', 'mayor', 'menor', 'mejor', 'peor', 'color', 'calor', 'motor', 'vapor', 'olor', 'sabor'])

/* Imperativo de tú de los infinitivos irregulares más comunes en guías («verter» → «Vierte»). */
const IRREGULARES: Record<string, string> = {
  poner: 'Pon', tener: 'Ten', salir: 'Sal', venir: 'Ven', decir: 'Di', ir: 'Ve', verter: 'Vierte', encender: 'Enciende',
  cerrar: 'Cierra', calentar: 'Calienta', colgar: 'Cuelga', fregar: 'Friega', regar: 'Riega', probar: 'Prueba', mover: 'Mueve',
  remover: 'Remueve', volver: 'Vuelve', devolver: 'Devuelve', medir: 'Mide', repetir: 'Repite', servir: 'Sirve', hervir: 'Hierve',
  pedir: 'Pide', seguir: 'Sigue', empezar: 'Empieza', comenzar: 'Comienza', apretar: 'Aprieta', soltar: 'Suelta', contar: 'Cuenta',
  recordar: 'Recuerda', encontrar: 'Encuentra', mostrar: 'Muestra', torcer: 'Tuerce', extraer: 'Extrae', traer: 'Trae',
  construir: 'Construye', sustituir: 'Sustituye', distribuir: 'Distribuye', incluir: 'Incluye', vestir: 'Viste',
  despertar: 'Despierta', vaciar: 'Vacía', enviar: 'Envía', enfriar: 'Enfría', rociar: 'Rocía', ampliar: 'Amplía',
  reunir: 'Reúne', continuar: 'Continúa', actuar: 'Actúa', acostar: 'Acuesta', sentar: 'Sienta', fregotear: 'Friega',
  envolver: 'Envuelve', resolver: 'Resuelve', oler: 'Huele', jugar: 'Juega', atravesar: 'Atraviesa', tender: 'Tiende',
  extender: 'Extiende', entender: 'Entiende', defender: 'Defiende', perder: 'Pierde', descender: 'Desciende',
}
/* Guías que hablan de usted («Retire», «Coloque»): se pasa a tú, como habla la app. */
const DE_USTED: Record<string, string> = {
  retire: 'Retira', coloque: 'Coloca', llene: 'Llena', vacie: 'Vacía', limpie: 'Limpia', aplique: 'Aplica', deje: 'Deja',
  saque: 'Saca', quite: 'Quita', ponga: 'Pon', abra: 'Abre', cierre: 'Cierra', encienda: 'Enciende', apague: 'Apaga',
  enjuague: 'Enjuaga', seque: 'Seca', gire: 'Gira', tire: 'Tira', empuje: 'Empuja', desconecte: 'Desconecta',
  conecte: 'Conecta', desenchufe: 'Desenchufa', enchufe: 'Enchufa', mezcle: 'Mezcla', anada: 'Añade', vierta: 'Vierte',
  use: 'Usa', utilice: 'Utiliza', frote: 'Frota', lave: 'Lava', pase: 'Pasa', compruebe: 'Comprueba', revise: 'Revisa',
  extraiga: 'Extrae', introduzca: 'Introduce', pulse: 'Pulsa', presione: 'Presiona', seleccione: 'Selecciona',
  elimine: 'Elimina', rocie: 'Rocía', prepare: 'Prepara', monte: 'Monta', atornille: 'Atornilla', coja: 'Coge',
  mida: 'Mide', caliente: 'Calienta', sirva: 'Sirve', cubra: 'Cubre', recubra: 'Recubre', corte: 'Corta', pinte: 'Pinta',
  lije: 'Lija', proteja: 'Protege', cambie: 'Cambia', instale: 'Instala', descargue: 'Descarga', rellene: 'Rellena',
  acceda: 'Entra en', entre: 'Entra en', busque: 'Busca', escriba: 'Escribe', lea: 'Lee', marque: 'Marca', toque: 'Toca',
  desmonte: 'Desmonta', sujete: 'Sujeta', suelte: 'Suelta', apriete: 'Aprieta', afloje: 'Afloja', enrosque: 'Enrosca',
  desenrosque: 'Desenrosca', sustituya: 'Sustituye', vuelva: 'Vuelve', repita: 'Repite', agregue: 'Agrega',
}

/* Verbos que no valen en un reto: abstractos o de decidir (reglas de redacción de la app) */
const VERBOS_PROHIBIDOS = /^(espera|esperar|haz|hacer|elige|elegir|escoge|escoger|decide|decidir|piensa|pensar|organiza|organizar|planifica|planificar|considera|considerar|evita|evitar|recuerda|recordar|ten|tener|asegurate|asegurarse|intenta|intentar|experimenta)$/
const PROHIBIDO = /\b(minutos?|segundos?|horas?|dias?|rapido|deprisa|tarea|algo|esto|primera parte|la parte|una parte|usted|pdf|pago|gratis|precio|compra|oferta|suscri\w*)\b/
const INGLES = new Set(['hammer', 'level', 'pencil', 'screwdriver', 'tape', 'drill', 'saw', 'brush', 'paper', 'pen', 'notebook', 'scissors', 'water', 'timer'])
const CORTE = /\s*(,|;|\(|\s[–—]\s|\s(y|o|e|u|pero|para|mientras|durante|hasta|antes|despues|después|luego|aproximadamente|si|cuando|porque|aunque|sin que)\s)/

const quitarTildes = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

/* Cosas comunes, no métodos concretos: cada persona tiene en casa lo suyo (una cafetera
   distinta, otras herramientas). Lo que nombra un aparato o un método que no todo el mundo
   tiene no se usa en los retos («Prensa francesa», «Muele los granos», «atornillador a batería»). */
const ESPECIFICO = new RegExp(
  '\\b(' +
    // café y cocina
    'prensa francesa|francesa|moka|italiana|aeropress|chemex|v60|espresso|expreso|capsulas?|nespresso|dolce gusto|goteo|' +
    'sifon|cold brew|portafiltro|molinillo|muele|moler|granos?|thermomix|airfryer|freidora|robot de cocina|olla express|' +
    'olla rapida|batidora|vaporera|horno de vapor|' +
    // herramientas y aparatos concretos
    'a bateria|bateria|laser|inalambric[oa]s?|electric[oa]s?|profesional(es)?|de precision|industrial(es)?|' +
    // marcas y apps concretas
    'ikea|amazon|notion|trello|evernote|google docs|word|excel|kindle' +
    ')\\b',
)

/** true si el texto depende de un aparato o método que no todo el mundo tiene */
export const esEspecifico = (texto: string) => ESPECIFICO.test(quitarTildes(texto))

/* ── Filtro de ubicuidad: 3 niveles de objetos ──────────────────
   Nivel 1 (universales, siempre vale): el móvil, las manos, la ropa, una silla, una mesa.
   Nivel 2 (contextuales, solo si la tarea es de esa zona): una taza, un plato, un cepillo, una
   toalla, la cama. Nivel 3 (específicos, solo si la propia tarea los nombra): un libro de texto
   concreto, unas zapatillas de un deporte. Lo que trae la web y es demasiado específico para
   cualquier nivel se traduce a algo universal en vez de descartarse sin más. */
export const OBJETOS_UNIVERSALES = ['el móvil', 'las manos', 'la ropa', 'una silla', 'una mesa']
export const OBJETOS_CONTEXTUALES = ['una taza', 'un plato', 'un cepillo', 'una toalla', 'la cama']

/** Adjetivos de marca o potencia que no cambian el objeto: se quitan en vez de descartar la línea entera */
const ADJETIVO_ESPECIFICO = /\b(a\s+bater[ií]a|inal[áa]mbric[oa]s?|el[ée]ctric[oa]s?|profesional(es)?|de precisi[oó]n|industrial(es)?|l[áa]ser)\b/gi

/** Producto o método muy concreto → su equivalente universal (nivel 1), en vez de descartarlo.
    Nombres sin artículo: conArticulo les pone el suyo más abajo. */
const TRADUCCION_UNIVERSAL: [RegExp, string][] = [
  [/limpiacristales|desengrasante|quitagrasas|abrillantador|antical\w*|limpiahogar/, 'papel de cocina'],
  [/estropajo (de acero|especial)|lana de acero/, 'estropajo'],
]

/** Simplifica un material: quita adjetivos de marca/potencia o lo traduce a algo universal. */
function simplificarMaterial(n: string): string {
  const sinAdjetivo = n.replace(ADJETIVO_ESPECIFICO, '').replace(/\s{2,}/g, ' ').trim()
  if (sinAdjetivo && sinAdjetivo !== n && !esEspecifico(sinAdjetivo)) return sinAdjetivo
  const universal = TRADUCCION_UNIVERSAL.find(([re]) => re.test(quitarTildes(n)))
  return universal ? universal[1] : n
}

/** «retirar» → «Retira»; undefined si no es un infinitivo que se pueda pasar a imperativo. */
function imperativo(infinitivo: string): string | undefined {
  const v = quitarTildes(infinitivo)
  if (IRREGULARES[v]) return IRREGULARES[v]
  if (!/^[a-zñ]{3,}(ar|er|ir)$/.test(v) || NO_VERBOS.has(v)) return undefined
  const base = infinitivo.toLowerCase().slice(0, -2)
  const fin = v.endsWith('ar') ? 'a' : 'e'
  return (base + fin).charAt(0).toUpperCase() + (base + fin).slice(1)
}

/** Primer verbo de la frase en imperativo de tú; undefined si no empieza por un verbo. */
function conVerbo(frase: string): string | undefined {
  const [primera, ...resto] = frase.split(/\s+/)
  if (!primera || !resto.length) return undefined
  const p = quitarTildes(primera)
  if (PALABRAS_NO_VERBO.has(p) || NOMINAL.test(p) || INGLES.has(p) || /\d/.test(p)) return undefined
  // «Capa 1 · cobertura», «Semana 2»: un nombre con número, no una acción
  if (/^\d/.test(resto[0]) || /[·|]/.test(frase)) return undefined
  // «Cafetera de filtro»: nombre + «de» sin artículo; los verbos que llevan «de» son pocos
  if (quitarTildes(resto[0]) === 'de' && !/^(cambia|deja|trata|acaba|termina|disfruta|aprovecha)$/.test(p)) return undefined
  let verbo: string | undefined
  if (DE_USTED[p]) verbo = DE_USTED[p]
  // De usted con cambio de letra: «-que» de -car, «-gue» de -gar, «-ice» de -izar («utilice» → «Utiliza»).
  // No «sigue» ni «distingue» (tú de -guir) ni «introduce» (tú de -ducir).
  else if (/[a-z]{2,}(que|gue|ice|ience)$/.test(p) && !/(igue|ingue)$/.test(p)) {
    const base = primera.toLowerCase().replace(/que$/, 'ca').replace(/gue$/, 'ga').replace(/ce$/, 'za')
    verbo = base.charAt(0).toUpperCase() + base.slice(1)
  } else if (/(ar|er|ir)$/.test(p)) verbo = imperativo(primera)
  else if (/[aeé]$/.test(p) && p.length >= 3) verbo = primera.charAt(0).toUpperCase() + primera.slice(1).toLowerCase()
  if (!verbo || VERBOS_PROHIBIDOS.test(quitarTildes(verbo))) return undefined
  // Minúsculas después del verbo, salvo siglas y modelos («E14», «GU10»)
  const cola = resto.map((w) => (w.length > 1 && w === w.toUpperCase() && /[A-Z0-9]/.test(w) ? w : w.toLowerCase()))
  return [verbo, ...cola].join(' ')
}

/** Una línea de la guía → una acción limpia, o undefined si no sirve para un reto. */
/** `conEspecificos`: también los pasos de un método concreto (para preguntar si la persona lo hace así). */
export function limpiarPaso(texto: string, conEspecificos = false): string | undefined {
  // Una línea que habla de un método concreto («Prensa francesa: vierte…») es de ese método: fuera entera
  if (/[¿?]/.test(texto) || (!conEspecificos && esEspecifico(texto))) return undefined
  const plano = texto
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[*_`#>]/g, '')
    .replace(/^\s*(paso\s*)?\d{1,2}\s*[.):\-–]\s*/i, '')
    .replace(/\s+/g, ' ')
    .trim()
  // «Etiqueta: acción» → se prueba la etiqueta y, si no es un paso, lo que va detrás
  const etiqueta = plano.match(/^([^:]{2,50}):\s+(.+)$/)
  const opciones = etiqueta ? [etiqueta[1], etiqueta[2]] : [plano]
  for (const opcion of opciones) {
    const frase = opcion.split(/[.!?](\s|$)/)[0].split(CORTE)[0].replace(/[\s,.:;]+$/, '').trim()
    const paso = conVerbo(frase)
    if (!paso) continue
    const palabras = paso.split(' ').length
    if (palabras < 2 || palabras > 9 || paso.length > 60) continue
    // Medidas («10-12 m² por litro») no son acciones; los modelos («E14») sí se quedan
    if (/(^|\s)\d/.test(paso)) continue
    if (PROHIBIDO.test(quitarTildes(paso)) || (!conEspecificos && esEspecifico(paso))) continue
    if (filtrarTarea(paso, true).status === 'blocked') continue
    return paso
  }
  return undefined
}

/** Los pasos de la mejor guía (la que tiene más pasos que sirven), en orden; como mucho 5. */
export function pasosDe(lineas: LineaPaso[] | undefined, conEspecificos = false): string[] {
  if (!lineas?.length) return []
  const porDoc = new Map<number, Map<number, string>>()
  for (const l of lineas) {
    const pasos = porDoc.get(l.doc) ?? new Map<number, string>()
    if (!pasos.has(l.n)) {
      const limpio = limpiarPaso(l.texto, conEspecificos)
      if (limpio) pasos.set(l.n, limpio)
    }
    porDoc.set(l.doc, pasos)
  }
  let mejor: string[] = []
  for (const pasos of porDoc.values()) {
    const enOrden = [...pasos.entries()].sort(([a], [b]) => a - b).map(([, p]) => p)
    const unicos = [...new Set(enOrden)]
    if (unicos.length > mejor.length) mejor = unicos
  }
  return mejor.length >= 2 ? mejor.slice(0, 5) : []
}

/* ── Materiales y técnicas de las listas de las webs ───────────
   «Equípate con lo básico: **Esterilla de yoga**: …»   → material «la esterilla de yoga»
   «Herramientas: Flexómetro y lápiz de carpintero.»     → «el flexómetro», «el lápiz de carpintero»
   «Consejos: **Repasa sin mirar tus notas.** …»         → técnica «Repasa sin mirar tus notas»
   Fuera: preguntas, enlaces, precios y menús, y las secciones de errores («Evita…»). */

const SECCION_MATERIAL = /(herramient|material|necesit|equip|lo basico|utensilio|ingrediente|que hace falta|kit|reune|reunion)/
const SECCION_RUIDO = /(error|evita|pregunta|faq|fuente|etiqueta|producto|precio|plan|pro$|ultra|feature|indice|tabla de contenido|relacionad|comentario|compart|categor|descarga|curso|ebook|guia completa|beneficio|ventaja|por que|mas entradas|formacion)/

const plano = (s: string) =>
  s
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[`#>]/g, '')
    .replace(/\s+/g, ' ')
    .trim()

/** «**Esterilla de yoga**: Una superficie…» → ['la esterilla de yoga'] */
function materialesDeLinea(texto: string, conEspecificos = false): string[] {
  if (/\?|https?:|\d{2,}|€|\$/.test(texto)) return []
  const t = plano(texto)
  const negrita = t.match(/^\*\*([^*]{2,40})\*\*/)
  // Solo lo básico del material: «Atornillador a batería con puntas…» → «Atornillador»
  const nombre = (negrita ? negrita[1] : t)
    .split(/\s*[:–—(.]|\s(con|para|que|si|a|de precisión|según|tipo)\s/)[0]
    .replace(/\*/g, '')
    .trim()
  return nombre
    .split(/\s+[yo]\s+|,\s*/)
    .map((n) => n.trim().replace(/[.:]+$/, ''))
    .map((n) => (conEspecificos ? n : simplificarMaterial(n)))
    .filter((n) => {
      const palabras = n.split(' ')
      const primera = quitarTildes(palabras[0] ?? '')
      return (
        palabras.length >= 1 && palabras.length <= 4 && n.length <= 35 &&
        !INGLES.has(primera) && !PALABRAS_NO_VERBO.has(primera) && !/(ar|er|ir)$/.test(primera) &&
        !/^(una?|unos|unas|algun\w*|varios|varias|cualquier)$/.test(primera) && (conEspecificos || !esEspecifico(n)) &&
        filtrarTarea(n, true).status !== 'blocked'
      )
    })
    .map((n) => (/^(el|la|los|las|un|una|unos|unas)\s/i.test(n) ? n.toLowerCase() : conArticulo(n.charAt(0).toLowerCase() + n.slice(1).toLowerCase())))
}

/** Materiales y herramientas que nombran las webs en sus listas («la esterilla de yoga»…); como mucho 4. */
export function materialesDe(listas: LineaLista[] | undefined, conEspecificos = false): string[] {
  const vistos = new Set<string>()
  for (const l of listas ?? []) {
    const s = quitarTildes(l.seccion)
    if (!SECCION_MATERIAL.test(s) || SECCION_RUIDO.test(s)) continue
    for (const m of materialesDeLinea(l.texto, conEspecificos)) vistos.add(m)
    if (vistos.size >= 4) break
  }
  return [...vistos].slice(0, 4)
}

/** Técnicas que recomiendan las webs: elementos de lista que empiezan por un verbo («Repasa sin mirar tus notas»). */
export function tecnicasDe(listas: LineaLista[] | undefined): string[] {
  const vistas = new Set<string>()
  for (const l of listas ?? []) {
    const s = quitarTildes(l.seccion)
    // Las listas de materiales son nombres, no técnicas («Esterilla de yoga»)
    if (SECCION_RUIDO.test(s) || SECCION_MATERIAL.test(s) || /\?|https?:/.test(l.texto)) continue
    const tecnica = limpiarPaso(l.texto)
    if (tecnica && tecnica.split(' ').length >= 3) vistas.add(tecnica)
    if (vistas.size >= 4) break
  }
  return [...vistas]
}

/* ── Métodos: las formas de hacer la tarea que comparan las guías ──
   «1. Cafetera de filtro o goteo · 2. Prensa francesa · 3. Cafetera italiana o moka»
   → ['Cafetera de filtro', 'Prensa francesa', 'Cafetera italiana']. Son nombres cortos (no acciones),
   al menos 2 en la misma página. Sirven para preguntar «¿Cómo lo haces?» (contexto.ts). */
const SECCION_METODO = /(metodo|tipo|forma|manera|opcion|elige|escoge|herramienta|utensilio|alternativa|sistema)/
const NO_METODO = /^(paso|consejo|truco|resumen|introduccion|conclusion|nota|importante|ventaja|inconveniente|beneficio|indice)/

function metodoDeLinea(texto: string): string | undefined {
  if (/[¿?]|https?:|€|\$/.test(texto)) return undefined
  const t = plano(texto).replace(/^\s*(paso\s*)?\d{1,2}\s*[.):\-–]\s*/i, '').replace(/\*/g, '')
  // Solo el nombre: antes de «:», «(», «–», «.» y de la alternativa «o …»
  const nombre = t.split(/\s*[:(–—.]|\s+o\s+|,/)[0].trim()
  const palabras = nombre.split(/\s+/)
  const primera = quitarTildes(palabras[0] ?? '')
  if (palabras.length > 4 || nombre.length < 3 || nombre.length > 30 || /\d/.test(nombre)) return undefined
  if (PALABRAS_NO_VERBO.has(primera) || NOMINAL.test(primera) || NO_METODO.test(primera) || INGLES.has(primera)) return undefined
  // Es una acción si tras la primera palabra va un artículo o preposición («Llena el depósito»),
  // no un adjetivo («Prensa francesa», «Cafetera italiana»)
  const segunda = quitarTildes(palabras[1] ?? '')
  const accion = conVerbo(nombre) && /^(el|la|los|las|un|una|unos|unas|tu|tus|a|al|con|en|del|por|sobre)$/.test(segunda)
  if (accion || /(ar|er|ir)$/.test(primera)) return undefined
  if (filtrarTarea(nombre, true).status === 'blocked') return undefined
  return nombre.charAt(0).toUpperCase() + nombre.slice(1).toLowerCase()
}

/** Métodos o formas de hacer la tarea que nombran las guías (como mucho 3). Solo listas que hablan
    de la tarea: alguno de sus nombres la menciona («Cafetera de filtro» para «hacer café»), así no
    entran las fases del cultivo del café ni las funciones de una app. */
export function metodosDe(pasos: LineaPaso[] | undefined, listas: LineaLista[] | undefined, tarea = ''): string[] {
  const raices = quitarTildes(tarea)
    .replace(/[^a-zñ\s]/g, ' ')
    .split(/\s+/)
    .filter((p) => p.length >= 4 && !/^(hacer|preparar|tengo|quiero|poner|para|como|cosas)$/.test(p) && !/(ar|er|ir)$/.test(p))
    .map((p) => p.slice(0, 4))
  const hablaDeLaTarea = (metodos: Set<string>) =>
    [...metodos].some((m) => raices.some((r) => quitarTildes(m).includes(r)))
  const porDoc = new Map<number, Set<string>>()
  const sumar = (doc: number, m?: string) => {
    if (!m) return
    porDoc.set(doc, (porDoc.get(doc) ?? new Set()).add(m))
  }
  // Líneas numeradas que son nombres (las guías que comparan métodos los numeran)
  for (const l of pasos ?? []) sumar(l.doc, metodoDeLinea(l.texto))
  // Listas de secciones como «Métodos», «Tipos», «Elige tu cafetera»
  for (const l of listas ?? []) {
    const s = quitarTildes(l.seccion)
    if (SECCION_METODO.test(s) && !SECCION_RUIDO.test(s) && !SECCION_MATERIAL.test(s)) sumar(100 + l.doc, metodoDeLinea(l.texto))
  }
  // La página que más alternativas compara y habla de la tarea; al menos 2
  const mejor = [...porDoc.values()].filter(hablaDeLaTarea).sort((a, b) => b.size - a.size)[0]
  return mejor && mejor.size >= 2 ? [...mejor].slice(0, 3) : []
}

const PARADA_OBJETO = new Set(['con', 'en', 'a', 'al', 'para', 'por', 'hasta', 'sin', 'sobre', 'desde', 'hacia', 'entre', 'que', 'y', 'o', 'dentro', 'fuera', 'encima', 'debajo', 'junto', 'cerca', 'justo', 'bien', 'siempre', 'primero', 'despues', 'antes', 'muy', 'si', 'segun'])
const ARTICULO = /^(el|la|los|las|un|una|tu|tus)$/

/** El objeto que nombra un paso («Retira las rejillas del horno» → «las rejillas del horno»). */
export function objetoDePaso(paso: string): string | undefined {
  const [, ...resto] = paso.split(' ')
  if (!resto.length || !ARTICULO.test(resto[0])) return undefined
  const objeto: string[] = []
  for (const w of resto) {
    const n = quitarTildes(w)
    if (objeto.length && (PARADA_OBJETO.has(n) || /(ando|iendo)$/.test(n))) break
    objeto.push(w)
    if (objeto.length >= 5) break
  }
  return objeto.length >= 2 ? objeto.join(' ') : undefined
}
