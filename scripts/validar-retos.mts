/* Comprueba que todos los retos que puede generar la app cumplen la «ley del esfuerzo inverso».
   Uso: npm run validar */
import { BANCO, FAMILIA, type Nivel } from '../src/datos/banco.ts'
import { NUM_MAZOS, REGLAS, analizarTarea, retosDe } from '../src/datos/reglas.ts'

const NIVELES: Nivel[] = ['pesado', 'medio', 'ligero']

/* Verbos físicos con los que puede empezar una acción */
const VERBOS =
  /^(Solo )?(abre|añade|afina|aprende|arrastra|asómate|avanza|baila|barre|bebe|busca|calienta|calienta|cambia|carga|cepilla|cierra|cocina|coge|come|confirma|copia|corre|corta|crea|da|deja|desmaquíllate|dibuja|dobla|dúchate|edita|empieza|encien?de|enciende|entra|envía|escanea|escribe|escucha|estira|extiende|guarda|infla|intenta|juega|lanza|lava|lávate|lee|lleva|limpia|llama|llena|marca|medita|mete|mira|mueve|nada|pasa|pasea|pesa|pide|pon|ponle|ponte|pregúntale|prepara|prueba|pulsa|quita|recoge|rellena|repite|reserva|respira|responde|riega|saca|sal|sigue|siéntate|sube|subraya|supera|tápate|termina|tiende|tira|toca|túmbate|vacía|ve|vístete|acuéstate|apaga|camina|apunta|compra|propón|mírate|baja|completa|contesta|fotografía|métete|repasa)\b/i

const PROHIBIDO: [RegExp, string][] = [
  [/\sy\s/i, 'usa «y» (más de una acción)'],
  [/\so\s/i, 'usa «o» (da opciones)'],
  [/\b(luego|después|y luego)\b/i, 'encadena acciones'],
  [/\btareas?\b/i, 'usa la palabra «tarea»'],
  [/\b(minutos?|segundos?|horas?|rápido|deprisa|temporizador|cronómetro)\b/i, 'pone tiempos o prisa'],
  [/(¡hazlo ya!|ya mismo|sin excusas|venga ya)/i, 'imperativo agresivo'],
  [/\b(piensa|decide|organiza|planifica|elige)\b/i, 'pide pensar o decidir'],
  [/(^|\s)(haz|hazlo|hacer|hace|haga|hagas)(\s|$)/i, 'usa el verbo «hacer» (abstracto)'],
  [/(primera parte|una parte|la parte|lo primero|primer movimiento|(^|\s)algo(\s|$)|(^|\s)esto(\s|$))/i, 'no dice un objeto concreto'],
  [/(mano que no usas|mano izquierda|mano no dominante|de una forma distinta)/i, 'fricción artificial en vez de enfoque'],
]

const errores: string[] = []
const unicos = new Set<string>()

const revisar = (origen: string, accion: string) => {
  if (accion.replace(/^Solo /, '').split(/\s+/).length < 3) errores.push(`${origen}: sin objeto concreto (muy corta) → «${accion}»`)
  if (!VERBOS.test(accion)) errores.push(`${origen}: no empieza por verbo físico → «${accion}»`)
  for (const [re, motivo] of PROHIBIDO) if (re.test(accion)) errores.push(`${origen}: ${motivo} → «${accion}»`)
}

// 1. Banco: cada categoría con 3 acciones por nivel
for (const [categoria, acciones] of Object.entries(BANCO)) {
  for (const n of NIVELES) {
    if (acciones[n].length < 3) errores.push(`${categoria}/${n}: menos de 3 acciones`)
    acciones[n].forEach((a) => revisar(`${categoria}/${n}`, a))
  }
}
for (const regla of REGLAS) if (!BANCO[regla.categoria]) errores.push(`Sin banco: ${regla.categoria}`)
for (const c of Object.keys(BANCO)) if (!FAMILIA[c]) errores.push(`Sin familia de modificadores: ${c}`)

// 2. Retos generados: cada regla (y el respaldo) × nivel × mazo
const tareas = [...REGLAS.map((r) => r.palabras[0]), 'buscar piso', 'arreglar la persiana', 'Hacer la declaración trimestral']
for (const tarea of tareas) {
  for (const n of NIVELES) {
    const vistos = new Set<string>()
    for (let m = 0; m < NUM_MAZOS; m++) {
      for (const r of retosDe(tarea, n, m)) {
        const origen = `«${tarea}»/${n}/mazo ${m + 1}/${r.tipo}`
        r.pasos.forEach((p) => revisar(origen, p))
        if (/(^|\s)(haz|hazlo|hacer)(\s|$)/i.test(r.titulo)) errores.push(`${origen}: el titular usa «hacer» → «${r.titulo}»`)
        if (n === 'pesado' && !r.pasos[0].startsWith('Solo ')) errores.push(`${origen}: Pesado sin «Solo»`)
        if (vistos.has(r.titulo)) errores.push(`${origen}: reto repetido → «${r.titulo}»`)
        vistos.add(r.titulo)
        if (analizarTarea(tarea).regla) unicos.add(r.titulo)
      }
    }
  }
}

console.log(`Retos distintos generados (categorías × niveles × ${NUM_MAZOS} mazos × 5 cartas): ${unicos.size}`)
if (errores.length) {
  console.error(`\n${errores.length} problemas:\n` + errores.join('\n'))
  process.exit(1)
}
console.log('Todo cumple las reglas.')
