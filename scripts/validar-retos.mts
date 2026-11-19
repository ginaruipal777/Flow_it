/* Comprueba que todos los retos que puede generar la app cumplen las reglas de redacción
   (ley del esfuerzo inverso + investigación de docs/comunicacion.md).
   Uso: npm run validar */
import { BANCO, PLAZO, type Acciones, type Nivel } from '../src/datos/banco.ts'
import { ORDEN, PARTICIPIOS, REGLAS, RESPALDO, accionesWeb, hechoDe, numMazos, retosDe } from '../src/datos/reglas.ts'
import { METODOS } from '../src/datos/metodos.ts'

const NIVELES: Nivel[] = ['pesado', 'medio', 'ligero']

const PROHIBIDO: [RegExp, string][] = [
  [/\sy\s/i, 'usa «y» (más de una acción)'],
  [/\so\s/i, 'usa «o» (da opciones)'],
  [/\b(luego|después)\b/i, 'encadena acciones'],
  [/\btareas?\b/i, 'usa la palabra «tarea»'],
  [/(^|\s)(haz|hazlo|hacer|hace|haga|hagas)(\s|$)/i, 'usa el verbo «hacer» (abstracto)'],
  [/\b(rápido|deprisa|ya mismo|sin excusas)\b|¡hazlo ya!/i, 'mete prisa o presiona'],
  [/\b(piensa|decide|organiza|planifica|elige)\b/i, 'pide pensar o decidir'],
  [/(primera parte|una parte|la parte|lo primero|primer movimiento|(^|\s)algo(\s|$)|(^|\s)esto(\s|$))/i, 'no dice un objeto concreto'],
  [/(mano que no usas|mano izquierda|mano no dominante|de una forma distinta)/i, 'fricción artificial'],
  [/(^|\s)a la primera(\s|$)/i, '«a la primera» no es un reto (usa una meta que se pueda contar)'],
  [/(otra puerta|puerta de atrás|otra mesa|otra pantalla|otro dispositivo|una pajita|con hielo|un cojín)/i, 'da por hecho algo que quizá no hay en casa'],
  [/\b(tumbad[oa]|sentad[oa]|junt[oa]s|cansad[oa]|solit[oa])\b/i, 'tiene género gramatical para la persona'],
  [/(¡plan nuevo!|mini reto|modo disfrute|ponle interés|hazlo interesante|¿te apuntas\?)/i, 'lleva entradilla'],
]
const TIEMPO = /\b(minutos?|segundos?|horas?|temporizador|cronómetro)\b/i

const errores: string[] = []
const titulos = new Set<string>()

/** Una acción del banco (antes de añadir «Solo» o el plazo) */
function revisarAccion(origen: string, accion: string) {
  const verbo = accion.split(' ')[0].toLowerCase()
  if (!PARTICIPIOS[verbo]) errores.push(`${origen}: el verbo «${verbo}» no está en la lista de verbos físicos → «${accion}»`)
  if (accion.split(/\s+/).length < 3) errores.push(`${origen}: sin objeto concreto (muy corta) → «${accion}»`)
  if (TIEMPO.test(accion)) errores.push(`${origen}: pone tiempos (solo la carta Urgencia lleva plazo) → «${accion}»`)
  for (const [re, motivo] of PROHIBIDO) if (re.test(accion)) errores.push(`${origen}: ${motivo} → «${accion}»`)
  if (hechoDe(accion).startsWith('lo has conseguido')) errores.push(`${origen}: no se puede escribir su «Está hecho cuando» → «${accion}»`)
}

function revisarAcciones(origen: string, acciones: Acciones) {
  for (const n of NIVELES) {
    const vistas = new Set<string>()
    for (const tipo of ORDEN) {
      const accion = acciones[n][tipo]
      if (!accion) {
        errores.push(`${origen}/${n}/${tipo}: falta el reto`)
        continue
      }
      revisarAccion(`${origen}/${n}/${tipo}`, accion)
      if (n === 'pesado' && /(^|\s)sol[oa](\s|$)/i.test(accion)) errores.push(`${origen}/${n}/${tipo}: repite «solo» (la app ya añade «Solo…») → «${accion}»`)
      if (vistas.has(accion)) errores.push(`${origen}/${n}: reto repetido en el mismo nivel → «${accion}»`)
      vistas.add(accion)
    }
  }
}

// 1. Banco: cada categoría con sus 15 retos (3 niveles × 5 cartas)
for (const [categoria, acciones] of Object.entries(BANCO)) revisarAcciones(categoria, acciones)
for (const regla of REGLAS) if (!BANCO[regla.categoria]) errores.push(`Sin banco: ${regla.categoria}`)

// 2b. Métodos para TDAH (metodos.ts)
for (const [actividad, porTipo] of Object.entries(METODOS))
  for (const [tipo, metodo] of Object.entries(porTipo))
    for (const n of NIVELES) {
      revisarAccion(`Método ${actividad}/${tipo}/${n} («${metodo.nombre}»)`, metodo.retos[n])
      if (n === 'pesado' && /(^|s)sol[oa](s|$)/i.test(metodo.retos[n])) errores.push(`Método ${actividad}/${tipo}: repite «solo» → «${metodo.retos[n]}»`)
    }

// 2. Respaldo y retos con datos de la web
revisarAcciones('Respaldo', RESPALDO('arreglar la persiana'))
const WEB = [
  { objeto: 'la app de test autoescuela', tipo: 'digital' as const },
  { objeto: 'la web de cita previa del SEPE', tipo: 'digital' as const },
  { objeto: 'el desengrasante', tipo: 'fisico' as const },
]
for (const w of WEB)
  for (const n of NIVELES) {
    const web = { ...w, microPaso: n === 'pesado' ? `Solo abre ${w.objeto}` : `Coge ${w.objeto}`, nivel: n }
    revisarAcciones(`Web «${w.objeto}» (${n})`, accionesWeb(web))
  }

// 3. Retos tal como se ven en la app: todos los mazos de cada tarea
const tareas = [...REGLAS.map((r) => r.palabras[0]), 'buscar piso', 'arreglar la persiana']
for (const tarea of tareas) {
  for (const esfuerzo of NIVELES) {
    const vistos = new Set<string>()
    for (let m = 0; m < numMazos(tarea, esfuerzo); m++) {
      for (const r of retosDe(tarea, esfuerzo, m)) {
        const origen = `«${tarea}»/${esfuerzo}/mazo ${m + 1}/${r.tipo}`
        if (vistos.has(r.titulo)) errores.push(`${origen}: reto repetido en la misma tarea → «${r.titulo}»`)
        vistos.add(r.titulo)
        titulos.add(r.titulo)
        const plazo = Object.values(PLAZO).find((p) => r.titulo.includes(p))
        if (r.tipo === 'urgencia' && !plazo) errores.push(`${origen}: Urgencia sin plazo → «${r.titulo}»`)
        if (r.tipo !== 'urgencia' && TIEMPO.test(r.titulo)) errores.push(`${origen}: tiempo fuera de Urgencia → «${r.titulo}»`)
        if (r.titulo.startsWith('Solo ') !== r.permiso.startsWith('Con eso'))
          errores.push(`${origen}: «Solo…» solo en el nivel Pesado → «${r.titulo}»`)
        if (r.titulo.length > 110) errores.push(`${origen}: demasiado largo para la carta (${r.titulo.length}) → «${r.titulo}»`)
      }
    }
  }
}

console.log(`Retos distintos que puede mostrar la app: ${titulos.size}`)
if (errores.length) {
  console.error(`\n${errores.length} problemas:\n` + errores.join('\n'))
  process.exit(1)
}
console.log('Todo cumple las reglas.')
