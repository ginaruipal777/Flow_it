/* Comprueba que todos los retos que puede generar la app cumplen las reglas de redacción
   (ley del esfuerzo inverso + investigación de docs/comunicacion.md).
   Uso: npm run validar */
import { BANCO, PLAZO, type Acciones, type Nivel } from '../src/datos/banco.ts'
import { ORDEN, PARTICIPIOS, REGLAS, RESPALDO, accionesWeb, hechoDe, numMazos, retosDe } from '../src/datos/reglas.ts'
import { METODOS } from '../src/datos/metodos.ts'
import { descartarReto, opcionesDe, type RetosFallidos } from '../src/datos/descartes.ts'
import { limpiarPaso, materialesDe } from '../src/datos/pasos.ts'

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
    for (let s = 0; s < 12; s++) {
      revisarAcciones(`Web «${w.objeto}» (${n}, semilla ${s})`, accionesWeb(web, '', s * 7777))
      revisarAcciones(`Web «${w.objeto}» + frase (${n}, semilla ${s})`, accionesWeb(web, 'descalcificar cafetera', s * 7777))
    }
  }

// 2c. Retos con pasos reales de guías (respuestas guardadas de api/micro_paso.py, limpiadas con pasos.ts)
const GUIAS: [string, string[]][] = [
  ['limpiar el horno', ['Retira las rejillas', 'Aplica la solución limpiadora', 'Deja reposar la solución limpiadora', 'Limpia el interior del horno']],
  ['cambiar la bombilla', ['Desconecta la corriente eléctrica', 'Retira la pantalla', 'Extrae la bombilla antigua']],
  ['café', ['Llena el depósito de tu cafetera con agua filtrada', 'Coloca el filtro dentro de la canasta portafiltro', 'Enciende la cafetera']],
]
// Materiales y técnicas sacados de las listas de las webs (materialesDe / tecnicasDe)
const LISTAS: [string, { materiales?: string[]; tecnicas?: string[]; pasos?: string[] }][] = [
  ['hacer yoga', { materiales: ['la ropa adecuada', 'la esterilla', 'la almohada de meditación'], tecnicas: ['Inhala profundamente por la nariz', 'Establece un horario fijo'] }],
  ['estudiar para el examen', { tecnicas: ['Identifica dónde pierdes más aciertos', 'Repasa sin mirar tus notas', 'Reserva un horario fijo'] }],
  ['montar la estantería', { materiales: ['el atornillador a batería', 'el destornillador manual', 'el nivel de burbuja'], tecnicas: ['Encaja el lateral haciendo coincidir las espigas guía', 'Gira el herraje con el destornillador manual'] }],
  ['pintar la habitación', { pasos: ['Calcula la superficie', 'Limpia las paredes', 'Pinta primero el techo'], materiales: ['la pintura plástica', 'el rodillo de pelo corto'], tecnicas: ['Pinta con buena luz', 'Trabaja siempre con el borde húmedo'] }],
  ['escribir', { materiales: ['la libreta', 'el lápiz'] }],
]
for (const [tarea, datos] of [...GUIAS.map(([t, pasos]) => [t, { pasos }] as const), ...LISTAS])
  for (const esfuerzo of NIVELES)
    for (let m = 0; m < 6; m++) {
      const web = { microPaso: '', objeto: '', tipo: 'fisico' as const, nivel: esfuerzo, fiable: true, ...datos }
      for (const r of retosDe(tarea, esfuerzo, m, web)) {
        const origen = `Guía «${tarea}»/${esfuerzo}/mazo ${m}/${r.tipo}`
        for (const [re, motivo] of PROHIBIDO) if (re.test(r.titulo)) errores.push(`${origen}: ${motivo} → «${r.titulo}»`)
        if (r.titulo.length > 110) errores.push(`${origen}: demasiado largo (${r.titulo.length}) → «${r.titulo}»`)
        if (r.hecho.startsWith('lo has conseguido')) errores.push(`${origen}: sin «Está hecho cuando» → «${r.titulo}»`)
        titulos.add(r.titulo)
      }
    }

// 3. Retos tal como se ven en la app: todos los mazos de cada tarea
const tareas = [
  ...REGLAS.map((r) => r.palabras[0]),
  'buscar piso', 'arreglar la persiana', 'descalcificar cafetera', 'limpiar el horno', 'cambiar la bombilla',
  'purgar los radiadores', 'regar mis plantas', 'estudiar el tema 3', 'responder el email de Carlos',
  'llamar a mi madre', 'hacer el test de autoescuela', 'rellenar el formulario de la beca', 'fregar los platos',
  'doblar la ropa', 'pintar la habitación', 'preparar la presentación', 'leer un libro', 'montar la estantería',
]
for (const tarea of tareas) {
  for (const esfuerzo of NIVELES) {
    const vistos = new Set<string>()
    for (let m = 0; m < numMazos(tarea, esfuerzo) * 3; m++) {
      for (const r of retosDe(tarea, esfuerzo, m)) {
        const origen = `«${tarea}»/${esfuerzo}/mazo ${m + 1}/${r.tipo}`
        if (m < numMazos(tarea, esfuerzo) && vistos.has(r.titulo)) errores.push(`${origen}: reto repetido en la misma tarea → «${r.titulo}»`)
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

// 4. «No encaja»: tras cada descarte el mazo nuevo cumple las reglas y no repite la plantilla descartada
for (const tarea of tareas) {
  for (const esfuerzo of NIVELES) {
    let registro: RetosFallidos = {}
    for (let ronda = 0; ronda < 6; ronda++) {
      const op = opcionesDe(registro, tarea)
      const retos = retosDe(tarea, esfuerzo, ronda, undefined, op)
      for (const r of retos) {
        const origen = `No encaja «${tarea}»/${esfuerzo}/ronda ${ronda}/${r.tipo}`
        // El respaldo (una palabra sin verbo ni conexión, «café») no tiene alternativas: puede repetirse
        if (op?.descartadas.has(r.plantilla) && !r.plantilla.startsWith('respaldo:')) errores.push(`${origen}: repite una plantilla descartada → ${r.plantilla}`)
        if (r.titulo.length > 110) errores.push(`${origen}: demasiado largo (${r.titulo.length}) → «${r.titulo}»`)
        for (const [re, motivo] of PROHIBIDO) if (re.test(r.titulo)) errores.push(`${origen}: ${motivo} → «${r.titulo}»`)
        titulos.add(r.titulo)
      }
      registro = descartarReto(registro, tarea, retos[ronda % 5])
    }
  }
}

// 4b. Con las respuestas de las preguntas de contexto (contexto.ts): objeto/método elegido,
// experiencia y bloqueo. Las preguntas salen de lo que encontró la búsqueda sobre esa tarea.
const RESPUESTAS: [string, object[]][] = [
  ['hacer café', [{ id: 'metodo:Cafetera de filtro', texto: 'Cafetera de filtro', icono: 'taza', objeto: 'la cafetera de filtro', verbo: 'Coge' }, { id: 'nunca', texto: 'Nunca', icono: 'nose', experiencia: 'nunca' }, { id: 'pereza', texto: 'Pereza', icono: 'pereza', bloqueo: 'pereza' }]],
  ['hacer café', [{ id: 'metodo:Prensa francesa', texto: 'Prensa francesa', icono: 'taza', objeto: 'la prensa francesa', verbo: 'Coge' }, { id: 'mucha', texto: 'Muchas veces', icono: 'repasar', experiencia: 'mucha' }, { id: 'cansancio', texto: 'Cansancio', icono: 'cansancio', bloqueo: 'cansancio' }]],
  ['hacer yoga', [{ id: 'metodo:Hatha yoga', texto: 'Hatha yoga', icono: 'metodo', metodo: 'hatha yoga' }, { id: 'alguna', texto: 'Alguna vez', icono: 'ideas', experiencia: 'alguna' }, { id: 'agobio', texto: 'Me agobia', icono: 'ansiedad', bloqueo: 'agobio' }]],
  ['limpiar la cocina', [{ id: 'material:el trapo', texto: 'Trapo', icono: 'trapo', objeto: 'el trapo', verbo: 'Coge' }, { id: 'nunca', texto: 'Nunca', icono: 'nose', experiencia: 'nunca' }]],
  ['escribir informe', [{ id: 'nunca', texto: 'Nunca', icono: 'nose', experiencia: 'nunca' }, { id: 'pereza', texto: 'Pereza', icono: 'pereza', bloqueo: 'pereza' }]],
  ['pintar la habitación', [{ id: 'mucha', texto: 'Muchas veces', icono: 'repasar', experiencia: 'mucha' }]],
  // Independencia del lugar: solo las tareas dependientes preguntan dónde está la persona
  ['limpiar la cocina', [{ id: 'material:el trapo', texto: 'Trapo', icono: 'trapo', objeto: 'el trapo', verbo: 'Coge' }, { id: 'cama', texto: 'En la cama', icono: 'cama', lugar: 'cama' }]],
  ['hacer ejercicio', [{ id: 'cama', texto: 'En la cama', icono: 'cama', lugar: 'cama' }, { id: 'pereza', texto: 'Pereza', icono: 'pereza', bloqueo: 'pereza' }]],
]
for (const [tarea, eleccion] of RESPUESTAS)
  for (const esfuerzo of NIVELES)
    for (let m = 0; m < 4; m++) {
      const web = { microPaso: '', objeto: '', tipo: 'fisico' as const, nivel: esfuerzo, fiable: false, eleccion } as never
      for (const r of retosDe(tarea, esfuerzo, m, web)) {
        const origen = `Contexto «${tarea}»/${esfuerzo}/mazo ${m}/${r.tipo}`
        for (const [re, motivo] of PROHIBIDO) if (re.test(r.titulo)) errores.push(`${origen}: ${motivo} → «${r.titulo}»`)
        if (r.titulo.length > 110) errores.push(`${origen}: demasiado largo (${r.titulo.length}) → «${r.titulo}»`)
        if (r.hecho.startsWith('lo has conseguido')) errores.push(`${origen}: sin «Está hecho cuando» → «${r.titulo}»`)
        titulos.add(r.titulo)
      }
    }

// 5. Cosas comunes, no métodos concretos: lo que no todo el mundo tiene se queda fuera
const ESPECIFICOS: [string, string | undefined][] = [
  ['2. Prensa francesa: vierte el agua caliente', undefined],
  ['Muele los granos de café justo antes de prepararlo', undefined],
  ['Introduce la cápsula en la cafetera', undefined],
  ['Llena el depósito de la cafetera', 'Llena el depósito de la cafetera'],
]
for (const [linea, esperado] of ESPECIFICOS) {
  const limpio = limpiarPaso(linea)
  if (limpio !== esperado) errores.push(`Método concreto: «${linea}» → «${limpio}» (se esperaba «${esperado}»)`)
}
const mats = materialesDe([{ doc: 0, seccion: 'Herramientas necesarias', texto: 'Atornillador a batería con puntas adecuadas' }, { doc: 0, seccion: 'Herramientas', texto: 'Prensa francesa' }])
if (mats.join('|') !== 'el atornillador') errores.push(`Materiales comunes: ${JSON.stringify(mats)} (se esperaba solo «el atornillador»)`)

console.log(`Retos distintos que puede mostrar la app: ${titulos.size}`)
if (errores.length) {
  console.error(`\n${errores.length} problemas:\n` + errores.join('\n'))
  process.exit(1)
}
console.log('Todo cumple las reglas.')
