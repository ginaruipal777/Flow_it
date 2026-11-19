// Genera docs/sistema-de-retos.html (y el PDF, con `npm run documento`) a partir del código real
// de src/datos/reglas.ts y src/datos/banco.ts, para que el documento siempre coincida con la app.
import { writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { BANCO, PERMISO, PLAZO, type Nivel } from '../src/datos/banco.ts'
import { analizarTarea, numMazos, REGLAS, RESPALDO, retosDe, type Regla } from '../src/datos/reglas.ts'
import { leerSituacion, POR_ESFUERZO_DOC, SITUACIONES_DOC } from '../src/datos/situacion.ts'
import { METODOS } from '../src/datos/metodos.ts'

type Tipo = 'novedad' | 'desafio' | 'pasion' | 'interes' | 'urgencia'

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const CARTAS: { tipo: Tipo; nombre: string; incup: string; fondo: string; tinta: string; busca: string }[] = [
  { tipo: 'novedad', nombre: 'Novedad', incup: 'Novedad', fondo: '#5b3fe0', tinta: '#ffffff', busca: 'Otro sitio, otro orden u otra herramienta.' },
  { tipo: 'desafio', nombre: 'Desafío', incup: 'Competencia (reto)', fondo: '#ee6b47', tinta: '#1b1340', busca: 'Una meta pequeña que se puede contar («3 prendas», «a la primera»).' },
  { tipo: 'pasion', nombre: 'Pasión', incup: 'Pasión', fondo: '#f7a3e0', tinta: '#1b1340', busca: 'Junto a algo que te gusta.' },
  { tipo: 'interes', nombre: 'Interés', incup: 'Interés', fondo: '#2fa4f0', tinta: '#1b1340', busca: 'Con una persona o con un dato curioso.' },
  { tipo: 'urgencia', nombre: 'Urgencia', incup: 'Urgencia', fondo: '#ffd23f', tinta: '#1b1340', busca: 'La acción más directa, con un plazo corto («en los próximos 5 minutos»).' },
]

const NIVELES: { id: Nivel; nombre: string; estado: string; duracion: string; regla: string }[] = [
  { id: 'ligero', nombre: 'Ligero', estado: 'Hay ganas, solo falta un empujón.', duracion: '1–3 minutos', regla: 'Un trozo pequeño con final claro.' },
  { id: 'medio', nombre: 'Medio', estado: 'Pereza o resistencia.', duracion: '30–60 segundos', regla: 'El primer movimiento físico.' },
  { id: 'pesado', nombre: 'Pesado', estado: 'Bloqueo total.', duracion: '5–10 segundos', regla: 'Contacto mínimo, empieza por «Solo…». Se puede cumplir sin levantarse de la cama.' },
]

const GRUPOS: { nombre: string; desde: number; hasta: number }[] = [
  { nombre: 'Trabajo, administración y estudio', desde: 0, hasta: 6 },
  { nombre: 'Hogar y vida cotidiana', desde: 7, hasta: 10 },
  { nombre: 'Ocio y entretenimiento', desde: 11, hasta: 17 },
  { nombre: 'Deporte y movimiento', desde: 18, hasta: 26 },
  { nombre: 'Vida social', desde: 27, hasta: 33 },
  { nombre: 'Hobbies y creatividad', desde: 34, hasta: 41 },
  { nombre: 'Descanso y autocuidado', desde: 42, hasta: 47 },
  { nombre: 'Ampliación de la app', desde: 48, hasta: REGLAS.length - 1 },
]

const NOMBRE_ICONO: Record<string, string> = {
  trabajo: 'Trabajo', estudios: 'Estudios', limpieza: 'Limpieza', deporte: 'Deporte', autocuidado: 'Autocuidado',
  llamadas: 'Llamadas', casa: 'Casa', alimentacion: 'Alimentación', mascotas: 'Mascotas', social: 'Social',
}

const minicarta = (c: (typeof CARTAS)[number], texto: string, hecho?: string) =>
  `<div class="mini" style="background:${c.fondo};color:${c.tinta}"><span class="mini__tipo">${c.nombre}</span><p>${esc(texto)}</p>${
    hecho ? `<p class="mini__hecho"><b>Hecho cuando</b> ${esc(hecho)}.</p>` : ''
  }</div>`

function ejemploCompleto(tarea: string, nivel: Nivel, mazo = 0) {
  const a = analizarTarea(tarea)
  const retos = retosDe(tarea, nivel, mazo)
  return `
  <div class="ejemplo">
    <p class="ejemplo__tarea">«${esc(tarea)}» · <strong>${esc(NIVELES.find((n) => n.id === nivel)!.nombre)}</strong>${mazo ? ` · mazo ${mazo + 1}` : ''}</p>
    <p class="ejemplo__meta">Regla: <strong>${esc(a.categoria)}</strong>${a.icono ? ` · icono ${esc(NOMBRE_ICONO[a.icono])}` : ''}</p>
    <div class="minis">${CARTAS.map((c, i) => minicarta(c, retos[i].titulo, retos[i].hecho)).join('')}</div>
  </div>`
}

const lista = (xs: string[]) => `<ol>${xs.map((x) => `<li>${esc(x)}</li>`).join('')}</ol>`

const bloqueRegla = (r: Regla) => {
  const b = BANCO[r.categoria]
  return `
  <div class="regla">
    <p class="regla__cab"><strong>${esc(r.categoria)}</strong> <span class="peq">· icono ${esc(NOMBRE_ICONO[r.icono])} · palabras clave: ${esc(r.palabras.join(', '))}</span></p>
    <table class="banco"><tr><th></th>${CARTAS.map((c) => `<th>${c.nombre}</th>`).join('')}</tr>
    ${NIVELES.map((n) => `<tr><td><strong>${n.nombre}</strong></td>${CARTAS.map((c) => `<td>${esc(b[n.id][c.tipo])}</td>`).join('')}</tr>`).join('')}</table>
  </div>`
}

/* Cuántos retos distintos salen de verdad (mismo cálculo que scripts/validar-retos.mts) */
const TOTAL = (() => {
  const vistos = new Set<string>()
  for (const r of REGLAS)
    for (const n of NIVELES) for (let m = 0; m < numMazos(r.palabras[0], n.id); m++) retosDe(r.palabras[0], n.id, m).forEach((x) => vistos.add(x.titulo))
  return vistos.size
})()

const ejemploPuntos = [
  'Responder el email de Carlos',
  'Dibujar un boceto',
  'Escuchar un podcast',
  'Llamar a un amigo',
  'Llamar al dentista',
  'Leer un libro',
]

const hoy = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })

const html = `<!doctype html>
<html lang="es"><head><meta charset="utf-8">
<title>Flow it! · Sistema de creación de retos</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=Fustat:wght@500;600;700;800&family=Pacifico&display=swap">
<style>
  @page { size: A4; margin: 18mm 16mm 18mm; }
  @page :first { margin: 0; }
  :root { --tinta:#1b1340; --violeta:#5b3fe0; --lima:#d4ff3a; --crema:#efe6d8; --lienzo:#faf8f5; --gris:#6b6580; --borde:#ddd9e8; }
  * { box-sizing: border-box; }
  body { margin:0; font-family: Fustat, system-ui, sans-serif; font-size: 10.5pt; line-height: 1.45; color: var(--tinta); -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  h1, h2, h3 { font-family: 'Bricolage Grotesque', sans-serif; font-weight: 800; margin: 0; line-height: 1.05; }
  h2 { font-size: 20pt; margin: 0 0 4mm; padding-top: 2mm; }
  h3 { font-size: 13pt; margin: 6mm 0 2mm; break-after: avoid; }
  p { margin: 0 0 2.5mm; }
  .salto { break-before: page; }
  .portada { height: 297mm; display: flex; flex-direction: column; justify-content: space-between; background: var(--violeta); color: var(--crema); padding: 26mm 22mm; }
  .portada .logo { font-family: Pacifico, cursive; font-size: 40pt; }
  .portada h1 { font-size: 46pt; color: #fff; }
  .portada h1 span { color: var(--lima); }
  .portada .sub { font-size: 13pt; max-width: 140mm; }
  .portada .pie { font-size: 10pt; opacity: .85; }
  .flujo { display: grid; gap: 2.5mm; margin: 4mm 0; }
  .paso { display: grid; grid-template-columns: 9mm 1fr; gap: 3mm; align-items: start; padding: 3mm 4mm; border-radius: 4mm; background: var(--lienzo); border: 1px solid var(--borde); break-inside: avoid; }
  .paso b.n { display:flex; align-items:center; justify-content:center; width: 8mm; height: 8mm; border-radius: 50%; background: var(--tinta); color: var(--lima); font-family: 'Bricolage Grotesque'; }
  .paso h4 { margin: 0 0 1mm; font-size: 11pt; font-family: 'Bricolage Grotesque'; }
  .paso p { margin: 0; }
  table { width: 100%; border-collapse: collapse; margin: 2mm 0 4mm; font-size: 9pt; }
  th { text-align: left; background: var(--tinta); color: #fff; font-weight: 700; padding: 2mm; }
  td { padding: 2mm; border-bottom: 1px solid var(--borde); vertical-align: top; }
  tr { break-inside: avoid; }
  td ol { margin: 0; padding-left: 4mm; }
  .peq { font-size: 8pt; color: var(--gris); }
  .formula { font-family: 'Bricolage Grotesque'; font-weight: 700; }
  .chip { display:inline-block; padding: .5mm 2.5mm; border-radius: 99px; font-weight: 800; font-size: 8.5pt; }
  .nota { padding: 3mm 4mm; border-radius: 3mm; background: var(--lima); margin: 3mm 0; break-inside: avoid; }
  .ejemplo { border: 1px solid var(--borde); border-radius: 4mm; padding: 4mm; margin: 0 0 4mm; break-inside: avoid; background: #fff; }
  .ejemplo__tarea { font-size: 11pt; margin-bottom: 1mm; }
  .ejemplo__meta { font-size: 9pt; color: var(--gris); }
  .minis { display: grid; grid-template-columns: repeat(5, 1fr); gap: 2mm; margin: 3mm 0; }
  .mini { border-radius: 3mm; padding: 2.5mm; min-height: 30mm; font-size: 8.3pt; line-height: 1.3; }
  .mini__tipo { display:block; font-weight: 800; font-size: 7pt; letter-spacing: .12em; text-transform: uppercase; margin-bottom: 1.5mm; opacity: .9; }
  .mini p { margin: 0; font-weight: 600; }
  .mini .mini__hecho { margin-top: 1.5mm; font-weight: 500; font-size: 7.3pt; opacity: .85; }
  .mini__hecho b { font-weight: 800; }
  .regla { break-inside: avoid; margin: 0 0 3mm; }
  .regla__cab { margin: 0 0 1mm; font-size: 10pt; }
  .regla .minis { margin: 0; }
  .regla .mini { min-height: 0; }
  table.banco { margin: 0 0 2mm; font-size: 8.3pt; }
  table.banco th { padding: 1mm 2mm; }
  table.banco td ol { padding-left: 4mm; }
  .ejemplo__detalle { display: grid; grid-template-columns: 1fr 1fr; gap: 3mm; font-size: 9pt; }
  .ejemplo__detalle ol { margin: 0; padding-left: 4.5mm; }
  .etq { display:block; font-weight: 800; font-size: 7.5pt; letter-spacing: .1em; text-transform: uppercase; color: var(--gris); margin-bottom: 1mm; }
  code { font-family: ui-monospace, Consolas, monospace; font-size: 8.5pt; background: var(--lienzo); padding: 0 1mm; border-radius: 1mm; }
  ul { margin: 0 0 3mm; padding-left: 5mm; }
</style></head><body>

<section class="portada">
  <div class="logo">flow it!</div>
  <div>
    <h1>Sistema de<br>creación de <span>retos</span></h1>
    <p class="sub" style="margin-top:8mm">Cómo convierte la app cualquier tarea en retos: la ley del esfuerzo inverso, el banco de acciones por categoría y la matriz de combinación con las 5 cartas INCUP.</p>
  </div>
  <p class="pie">Documento generado desde el código de la app (<code style="background:transparent;color:inherit">src/datos/reglas.ts</code> y <code style="background:transparent;color:inherit">banco.ts</code>) · ${esc(hoy)}</p>
</section>

<section class="salto">
  <h2>1. Cómo funciona, de principio a fin</h2>
  <p>La persona escribe una tarea («Responder el email de Carlos») y elige cuánto le pesa. La app hace esto:</p>
  <div class="flujo">
    <div class="paso"><b class="n">1</b><div><h4>Comprueba la tarea</h4><p>Si no es segura o no se entiende, lo dice con un mensaje amable y no crea retos.</p></div></div>
    <div class="paso"><b class="n">2</b><div><h4>Busca la categoría</h4><p>Compara la tarea con las palabras clave de las ${REGLAS.length} categorías. Si no encaja en ninguna, busca en internet el objeto con el que se hace (apartado 2).</p></div></div>
    <div class="paso"><b class="n">3</b><div><h4>El esfuerzo elige el tamaño (ley del esfuerzo inverso)</h4><p>Cuanto más pesa la tarea, más pequeña es la acción: Ligero, un trozo pequeño con final claro; Medio, el primer movimiento físico; Pesado, contacto mínimo que empieza por «Solo…». Apartado 3.</p></div></div>
    <div class="paso"><b class="n">4</b><div><h4>Reparte 5 cartas escritas a mano</h4><p>Una por factor INCUP. Cada carta cambia la acción (otro sitio, una meta pequeña, algo que te gusta, una persona, un plazo corto). La carta dice solo la acción, sin entradillas. Apartado 4.</p></div></div>
    <div class="paso"><b class="n">5</b><div><h4>Más mazos, siempre igual o más fáciles</h4><p>Si rechaza las 5, llega otro mazo de la misma tarea: primero el nivel elegido y después los niveles más ligeros. Apartado 5.</p></div></div>
    <div class="paso"><b class="n">6</b><div><h4>Detalle del reto aceptado</h4><p>La acción en la carta con su botón «Hecho», el criterio «Está hecho cuando…» sacado de la propia acción, una frase de permiso del nivel, «Escuchar» y un premio opcional.</p></div></div>
  </div>
  <div class="nota"><strong>${TOTAL.toLocaleString('es-ES')} retos distintos</strong> escritos a mano: ${REGLAS.length} categorías × 3 niveles × 5 cartas, más los retos genéricos con el nombre de la tarea. Un script (<code>npm run validar</code>) comprueba que todos cumplen las reglas.</div>
</section>

<section class="salto">
  <h2>2. Cómo se elige la categoría</h2>
  <p>Cada regla suma puntos por cada palabra clave que aparece en la tarea: tantos puntos como letras tiene la palabra clave. Gana la regla con más puntos; si empatan, la que va antes en la lista.</p>
  <p>Las palabras que salen en <strong>varias reglas</strong> («leer», «escribir», «dibujar», «escuchar», «llamar»…) solo cuentan <strong>la mitad</strong>, porque por sí solas no dicen de qué va la tarea. Así gana la palabra más concreta:</p>
  <table>
    <tr><th>Tarea</th><th>Categoría elegida</th><th>Por qué</th></tr>
    ${ejemploPuntos
      .map((t) => {
        const a = analizarTarea(t)
        const porque: Record<string, string> = {
          'Responder el email de Carlos': '«email» y «responder» solo están en Comunicación.',
          'Dibujar un boceto': '«dibujar» está en Creativo y en Dibujo (cuenta la mitad); «boceto» solo en Dibujo.',
          'Escuchar un podcast': '«escuchar» está en Música y Podcast (cuenta la mitad); «podcast» solo en Podcast.',
          'Llamar a un amigo': 'La frase entera «llamar a un amigo» es una palabra clave de Llamada social.',
          'Llamar al dentista': '«dentista» solo está en Llamadas.',
          'Leer un libro': '«leer» está en Académico y Lectura (la mitad); «libro» solo en Lectura.',
        }
        return `<tr><td>${esc(t)}</td><td><strong>${esc(a.categoria)}</strong></td><td>${esc(porque[t] ?? '')}</td></tr>`
      })
      .join('')}
  </table>
  <h3>Si ninguna categoría encaja</h3>
  <p>Se usa el respaldo con el texto de la tarea entre comillas. Ejemplo con «arreglar la persiana»:</p>
  <table>
    <tr><th>Pesado</th><th>Medio</th><th>Ligero</th></tr>
    <tr><td>${lista(Object.values(RESPALDO('arreglar la persiana').pesado))}</td><td>${lista(Object.values(RESPALDO('arreglar la persiana').medio))}</td><td>${lista(Object.values(RESPALDO('arreglar la persiana').ligero))}</td></tr>
  </table>
  <div class="nota"><strong>La categoría se puede cambiar.</strong> En la pantalla de selección, el botón con el lápiz deja elegir otra categoría si la detectada no es la correcta. Eso cambia el icono de las cartas.</div>
</section>

<section class="salto">
  <h2>3. Regla de oro: la ley del esfuerzo inverso</h2>
  <p>El nivel que elige la persona en «¿Cuánto te pesa?» decide el tamaño de la acción. Cuanta más resistencia, más pequeña la acción.</p>
  <table>
    <tr><th>Nivel</th><th>Estado</th><th>Cómo es la acción</th><th>Ejemplo (Comunicación, carta Urgencia)</th><th>Permiso</th></tr>
    ${NIVELES.map((n) => `<tr><td><strong>${n.nombre}</strong></td><td>${esc(n.estado)}</td><td>${esc(n.regla)}</td><td>${esc(retosDe('Responder el email', n.id)[4].titulo)}</td><td>${esc(PERMISO[n.id])}</td></tr>`).join('')}
  </table>
  <h3>Reglas de redacción de cada reto</h3>
  <ul>
    <li><strong>Solo la acción</strong>, en una frase. Sin entradillas («¡Plan nuevo!», «Mini reto…») ni coletillas pegadas con coma: la etiqueta de la carta ya dice su tipo.</li>
    <li><strong>Verbo físico al principio</strong> (Abre, Coge, Escribe, Ponte, Toca…) y <strong>objeto concreto</strong> (la app, el libro, la correa). Nunca «la primera parte».</li>
    <li><strong>Una sola acción</strong>: sin «y», «luego», «después», ni opciones con «o».</li>
    <li><strong>Sin el verbo «hacer»</strong>, sin la palabra «tarea», sin prisas («rápido») ni juicios, y sin género gramatical para la persona.</li>
    <li><strong>Tiempos solo en Urgencia</strong>, con un plazo corto y concreto: ${Object.entries(PLAZO).map(([n, p]) => `${n} → «${esc(p)}»`).join(' · ')}.</li>
    <li><strong>«Está hecho cuando…» concreto</strong>, sacado de la acción: «Abre la app del test» → «has abierto la app del test».</li>
    <li><strong>Decide la persona</strong>: el reto está hecho cuando pulsa «Hecho» en la carta y «Reto conseguido».</li>
  </ul>
</section>

<section class="salto">
  <h2>4. Las 5 cartas INCUP: cada una cambia la acción</h2>
  <p>INCUP son los 5 factores que más motivan con TDAH: <strong>I</strong>nterés, <strong>N</strong>ovedad, <strong>C</strong>ompetencia (reto), <strong>U</strong>rgencia y <strong>P</strong>asión. Cada carta tiene su propio reto, escrito a mano para la categoría y el nivel: el factor INCUP cambia <strong>la acción</strong>, no le añade una coletilla.</p>
  <table>
    <tr><th>Carta</th><th>Factor</th><th>Cómo cambia la acción</th><th>Ejemplo con «Pasear al perro» (Medio)</th></tr>
    ${CARTAS.map((c, i) => `<tr><td><span class="chip" style="background:${c.fondo};color:${c.tinta}">${c.nombre}</span></td><td>${c.incup}</td><td>${esc(c.busca)}</td><td>${esc(retosDe('Pasear al perro', 'medio')[i].titulo)}</td></tr>`).join('')}
  </table>
  <div class="nota"><strong>Por qué así.</strong> Antes la app pegaba «entradilla + acción + modificador» y salían frases sin sentido («¡Plan nuevo! Ponle la correa al perro, por una calle distinta.»). Las apps para TDAH que mejor funcionan muestran una sola acción clara (Tiimo), la hacen más pequeña de lo que parece razonable (guías de inicio de tareas) y no castigan ni juzgan (críticas a Habitica).</div>
  <h3>Ejemplos</h3>
  ${ejemploCompleto('Responder el email de Carlos', 'pesado')}
  ${ejemploCompleto('Pasear al perro', 'medio')}
  ${ejemploCompleto('Estudiar para el examen', 'ligero')}
</section>

<section class="salto">
  <h2>4b. Lectura de la situación</h2>
  <p>Con TDAH una tarea se evita por motivos distintos, y cada uno pide otro empujón. Con <strong>la tarea que escribe la persona y el esfuerzo que marca</strong>, la app deduce qué puede estar pasando, lo dice en una frase corta en la pantalla de las cartas y <strong>ordena las cartas</strong> para que salga primero la que mejor encaja. Nunca diagnostica: dice «puede que» y la persona decide.</p>
  <table>
    <tr><th>Situación</th><th>Lo que ve la persona</th><th>Primera carta</th><th>Fuente</th></tr>
    ${SITUACIONES_DOC.map((x) => `<tr><td><strong>${esc(x.nombre)}</strong></td><td>${esc(x.frase)}</td><td>${({ novedad: 'Novedad', desafio: 'Desafío', pasion: 'Pasión', interes: 'Interés', urgencia: 'Urgencia' } as Record<string, string>)[x.orden[0]]}</td><td class="peq">${esc(x.fuente.nombre)}</td></tr>`).join('')}
    ${Object.values(POR_ESFUERZO_DOC).map((x) => `<tr><td><strong>${esc(x.nombre)}</strong> <span class="peq">(si no encaja ninguna)</span></td><td>${esc(x.frase)}</td><td>${({ novedad: 'Novedad', desafio: 'Desafío', pasion: 'Pasión', interes: 'Interés', urgencia: 'Urgencia' } as Record<string, string>)[x.orden[0]]}</td><td class="peq">${esc(x.fuente.nombre)}</td></tr>`).join('')}
  </table>
  <h3>Ejemplos</h3>
  <table>
    <tr><th>Tarea</th><th>Esfuerzo</th><th>Lectura</th></tr>
    ${([['Llamar al dentista', 'pesado'], ['Limpiar la cocina', 'medio'], ['Hacer la declaración de la renta', 'ligero'], ['Entregar el informe mañana', 'medio']] as const).map(([t, n]) => `<tr><td>${esc(t)}</td><td>${n}</td><td>${esc(leerSituacion(t, n).frase)}</td></tr>`).join('')}
  </table>
  <h3>Cómo lee la tarea</h3>
  <p>Cada situación tiene señales con peso (una palabra muy clara pesa 3; una que solo apunta, 1 o 2). Se suman todas las señales de la tarea y gana la que más puntos tiene. Las reglas salen de webs de psicología y TDAH leídas una vez (columna «Fuente»), no de una búsqueda en cada tarea: así la lectura es instantánea y funciona sin conexión. <code>npm run fuentes</code> comprueba que los enlaces siguen abiertos.</p>
  <h3>Lo que te funciona: el algoritmo</h3>
  <p>La app apunta, solo en el móvil, qué tipo de carta se rechaza, se acepta, se consigue o se archiva, en total y por situación. Al empezar cada mazo ordena las cartas con una media con creencia inicial: parte del orden de la situación, aceptar suma, conseguir suma un poco más, rechazar o archivar resta, y lo aprendido en la misma situación pesa más que lo general. En el perfil, «Te funciona» enseña qué cartas le activan más y deja borrar lo aprendido.</p>
  <p class="peq">Las situaciones salen de las causas de evitación de tareas con TDAH que describen las guías de inicio de tareas (miedo a la respuesta, sensación de tamaño, aburrimiento, perfeccionismo, poca energía, malestar) y de los mensajes que prueba Tiimo según la energía de la persona.</p>
</section>

<section class="salto">
  <h2>4c. Métodos para TDAH</h2>
  <p>Además de los retos del banco, las cartas proponen <strong>formas distintas de abordar la tarea</strong>, sacadas de webs de consejos para TDAH. Cada tipo de actividad tiene un método por carta. En el primer mazo, Novedad y Desafío son métodos; en el segundo, Pasión, Interés y Urgencia. El detalle del reto dice qué método es y enlaza su fuente.</p>
  ${Object.entries(METODOS).map(([act, porTipo]) => `
  <h3>${({ orden: 'Ordenar y limpiar', estudio: 'Estudiar', escritura: 'Escribir', llamadas: 'Llamar', papeleo: 'Papeleo', ejercicio: 'Moverse', cuidado: 'Cuidarse' } as Record<string, string>)[act]}</h3>
  <table class="banco"><tr><th>Carta</th><th>Método</th><th>Pesado</th><th>Medio</th><th>Ligero</th></tr>
  ${CARTAS.map((c) => { const mt = porTipo[c.tipo]; return `<tr><td><span class="chip" style="background:${c.fondo};color:${c.tinta}">${c.nombre}</span></td><td><strong>${esc(mt.nombre)}</strong><br><span class="peq">${esc(mt.fuente.nombre)}</span></td><td>${esc(mt.retos.pesado)}</td><td>${esc(mt.retos.medio)}</td><td>${esc(mt.retos.ligero)}</td></tr>` }).join('')}
  </table>`).join('')}
</section>

<section class="salto">
  <h2>5. Cuando se acaba el mazo: más retos de la misma tarea</h2>
  <p>Si se rechazan las 5 cartas, la app reparte otro mazo de la <strong>misma tarea</strong>, siempre igual o más fácil:</p>
  <table>
    <tr><th>Esfuerzo elegido</th><th>Mazos</th></tr>
    <tr><td>Ligero</td><td>Ligero con métodos (2 mazos) → Medio → Pesado</td></tr>
    <tr><td>Medio</td><td>Medio con métodos (2 mazos) → Pesado → retos genéricos con el nombre de la tarea</td></tr>
    <tr><td>Pesado</td><td>Pesado con métodos (2 mazos) → retos genéricos con el nombre de la tarea</td></tr>
  </table>
  ${ejemploCompleto('Responder el email de Carlos', 'pesado', 1)}
  <div class="nota">Al terminar los mazos aparece «Has visto los N retos», con tres opciones: escribir la tarea de otra forma (más pequeña o más concreta), volver al primer mazo o ver otro mazo.</div>
</section>

<section class="salto">
  <h2>6. Banco completo de retos por categoría</h2>
  <p>Para cada categoría: las palabras clave que la activan y sus 15 retos (3 niveles × 5 cartas). En Pesado la app añade «Solo…» delante y en Urgencia el plazo del nivel.</p>
  ${GRUPOS.map(
    (g) => `
    <h3>${esc(g.nombre)}</h3>
    ${REGLAS.slice(g.desde, g.hasta + 1).map(bloqueRegla).join('')}`,
  ).join('')}
  <div class="nota"><strong>Cómo ampliar el sistema</strong>: cuando una tarea cae en el respaldo, se añade una regla en <code>src/datos/reglas.ts</code> con sus palabras clave y su icono, y en <code>src/datos/banco.ts</code> sus 15 retos. Después, <code>npm run validar</code> comprueba que cumplen las reglas.</div>
</section>

<section class="salto">
  <h2>7. Fuentes</h2>
  <ul>
    <li><strong>Guía y Reglas Completas del Sistema de Retos Anti-Procrastinación (V2)</strong>: las categorías y sus palabras clave, los gatillos motivacionales y el protocolo de expansión.</li>
    <li><strong>Regla de oro: la ley del esfuerzo inverso</strong> y <strong>Matriz de combinación</strong>: tamaño de la acción por nivel, reglas de redacción y modificadores INCUP.</li>
    <li><strong>Cómo redactan las tareas las apps para TDAH</strong>: Goblin Tools (pasos concretos según lo pequeños que se necesiten), Tiimo (una sola tarea, tono probado con usuarios neurodivergentes), Finch (metas mínimas sin juicio) y las críticas a Habitica (castigar genera vergüenza y abandono).</li>
    <li><strong>Guías de inicio de tareas</strong> (Brain.fm, Universidad de Minnesota): el primer paso más pequeño de lo que parece razonable, físico y con permiso para que salga torpe.</li>
    <li><strong>Pautas de comunicación para personas autistas</strong> (UK Home Office, Scope): lenguaje literal, frases cortas, pasos explícitos y estructura predecible.</li>
    <li><strong>GAM Medical</strong>, «Cómo motivarte con la parálisis TDAH»: factores INCUP, método RAN (Recompensa, Responsabilidad, Novedad), micropasos y reducir distracciones.</li>
    <li><strong>Isaac, López y Escobar (2024)</strong>, «Arousal dysregulation and executive dysfunction in ADHD», <em>Frontiers in Psychiatry</em> 14:1336040: el rendimiento mejora cuando la tarea pide menos esfuerzo y cuando hay recompensa.</li>
    <li><strong>Sanitas</strong>, «Ocho pasos para lograr que los niños con TDAH hagan los deberes»: dar las instrucciones de una en una, dividir las tareas e introducir descansos.</li>
    <li><strong>Carepatron</strong>, «Lista de tareas para el TDAH»: time-boxing (bloques de tiempo fijos) y descansos programados.</li>
    <li>Pautas de comunicación accesible para personas neurodivergentes y de diseño de tareas (micropasos, criterios de éxito explícitos, apoyo visual y escrito): <code>docs/comunicacion.md</code>.</li>
  </ul>
</section>
</body></html>`

const salida = fileURLToPath(new URL('../docs/sistema-de-retos.html', import.meta.url))
await writeFile(salida, html, 'utf8')
console.log('HTML generado:', salida)

// PDF con Chrome sin ventana (si está instalado en la ruta habitual de Windows)
import { existsSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
const chrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
if (existsSync(chrome)) {
  const pdf = salida.replace(/\.html$/, '.pdf')
  spawnSync(chrome, ['--headless=new', '--disable-gpu', '--no-pdf-header-footer', '--virtual-time-budget=8000', `--print-to-pdf=${pdf}`, new URL('../docs/sistema-de-retos.html', import.meta.url).href], { stdio: 'ignore' })
  console.log('PDF generado:', pdf)
} else {
  console.log('No se encontró Chrome: abre el HTML y guárdalo como PDF desde el navegador.')
}
