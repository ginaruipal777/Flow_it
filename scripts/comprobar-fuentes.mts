/* Comprueba que las webs de psicología en las que se basa la lectura de la situación
   (src/datos/situacion.ts) y los métodos para TDAH (src/datos/metodos.ts) siguen abiertas. Uso: npm run fuentes */
import { FUENTES } from '../src/datos/situacion.ts'
import { FUENTES_METODOS } from '../src/datos/metodos.ts'

let fallos = 0
const todas = new Map([...Object.values(FUENTES), ...Object.values(FUENTES_METODOS)].map((f) => [f.url, f]))
for (const f of todas.values()) {
  try {
    const r = await fetch(f.url, { redirect: 'follow', headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36' } })
    // 403: la web bloquea a los programas que comprueban enlaces, pero abre bien en un navegador
    const estado = r.ok ? 'bien ' : r.status === 403 ? 'aviso' : 'FALLA'
    console.log(`${estado} ${r.status}  ${f.nombre}${r.status === 403 ? ' (bloquea comprobadores; ábrela en el navegador)' : ''}`)
    if (!r.ok && r.status !== 403) fallos++
  } catch (e) {
    console.log(`FALLA ---  ${f.nombre} (${(e as Error).message})`)
    fallos++
  }
}
if (fallos) {
  console.error(`\n${fallos} fuentes no responden: revísalas en src/datos/situacion.ts`)
  process.exit(1)
}
console.log('\nTodas las fuentes responden.')
