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

export type LineaPaso = { doc: number; n: number; texto: string }

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
const PROHIBIDO = /\b(minutos?|segundos?|horas?|dias?|rapido|deprisa|tarea|algo|esto|primera parte|la parte|una parte|usted)\b/
const CORTE = /\s*(,|;|\(|\s(y|o|e|u|pero|para|mientras|durante|hasta|antes|despues|luego|aproximadamente|si|cuando|porque|sin que)\s)/

const quitarTildes = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

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
  if (PALABRAS_NO_VERBO.has(p) || NOMINAL.test(p) || /\d/.test(p)) return undefined
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
export function limpiarPaso(texto: string): string | undefined {
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
    if (PROHIBIDO.test(quitarTildes(paso))) continue
    if (filtrarTarea(paso, true).status === 'blocked') continue
    return paso
  }
  return undefined
}

/** Los pasos de la mejor guía (la que tiene más pasos que sirven), en orden; como mucho 5. */
export function pasosDe(lineas: LineaPaso[] | undefined): string[] {
  if (!lineas?.length) return []
  const porDoc = new Map<number, Map<number, string>>()
  for (const l of lineas) {
    const pasos = porDoc.get(l.doc) ?? new Map<number, string>()
    if (!pasos.has(l.n)) {
      const limpio = limpiarPaso(l.texto)
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

const PARADA_OBJETO = new Set(['con', 'en', 'a', 'al', 'para', 'por', 'hasta', 'sin', 'sobre', 'desde', 'hacia', 'entre', 'que', 'y', 'o', 'dentro', 'fuera', 'encima', 'debajo', 'junto', 'cerca'])
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
