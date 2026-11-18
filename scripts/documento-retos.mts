// Genera docs/sistema-de-retos.html (y el PDF, con `npm run documento`) a partir del código real
// de src/datos/reglas.ts y src/datos/banco.ts, para que el documento siempre coincida con la app.
import { writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { BANCO, HECHO_POR_NIVEL, MODIFICADORES, type Nivel } from '../src/datos/banco.ts'
import { analizarTarea, NUM_MAZOS, REGLAS, RESPALDO, retosDe, type Regla } from '../src/datos/reglas.ts'

type Tipo = 'novedad' | 'desafio' | 'pasion' | 'interes' | 'urgencia'

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const CARTAS: { tipo: Tipo; nombre: string; incup: string; fondo: string; tinta: string; busca: string; entradilla: string }[] = [
  { tipo: 'novedad', nombre: 'Novedad', incup: 'Novedad', fondo: '#5b3fe0', tinta: '#ffffff', busca: 'Cambia el método o el sitio.', entradilla: '¡Plan nuevo! [Acción], [modificador].' },
  { tipo: 'desafio', nombre: 'Desafío', incup: 'Competencia (reto)', fondo: '#ee6b47', tinta: '#1b1340', busca: 'Un reto pequeño, sin reloj.', entradilla: 'Mini reto: [acción], [modificador]. ¿Te apuntas?' },
  { tipo: 'pasion', nombre: 'Pasión', incup: 'Pasión', fondo: '#f7a3e0', tinta: '#1b1340', busca: 'Añade algo que te gusta.', entradilla: 'Modo disfrute: [acción], [modificador].' },
  { tipo: 'interes', nombre: 'Interés', incup: 'Interés', fondo: '#2fa4f0', tinta: '#1b1340', busca: 'Con alguien o fijándote en algo nuevo.', entradilla: 'Hazlo interesante: [acción], [modificador].' },
  { tipo: 'urgencia', nombre: 'Urgencia', incup: 'Urgencia', fondo: '#ffd23f', tinta: '#1b1340', busca: 'Un micro-límite sin cronómetro.', entradilla: 'Ahora: [acción], [modificador].' },
]

const NIVELES: { id: Nivel; nombre: string; estado: string; duracion: string; regla: string }[] = [
  { id: 'ligero', nombre: 'Ligero', estado: 'Hay ganas, solo falta un empujón.', duracion: '1–3 minutos', regla: 'Puede tener algo de sustancia: avanzar de verdad.' },
  { id: 'medio', nombre: 'Medio', estado: 'Pereza o resistencia.', duracion: '30–60 segundos', regla: 'Física, mecánica y acotada: romper la inercia.' },
  { id: 'pesado', nombre: 'Pesado', estado: 'Bloqueo total.', duracion: '5–10 segundos', regla: 'Casi ridícula. Empieza por «Solo…». Prueba: ¿se podría hacer tumbado en la cama?' },
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
    <table class="banco"><tr><th>Pesado</th><th>Medio</th><th>Ligero</th></tr>
    <tr><td>${lista(b.pesado)}</td><td>${lista(b.medio)}</td><td>${lista(b.ligero)}</td></tr></table>
  </div>`
}

/* Cuántos retos distintos salen de verdad (mismo cálculo que scripts/validar-retos.mts) */
const TOTAL = (() => {
  const vistos = new Set<string>()
  for (const r of REGLAS)
    for (const n of NIVELES) for (let m = 0; m < NUM_MAZOS; m++) retosDe(r.palabras[0], n.id, m).forEach((x) => vistos.add(x.titulo))
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
    <div class="paso"><b class="n">1</b><div><h4>Limpia el texto</h4><p>Pasa la tarea a minúsculas y quita tildes y signos, para comparar sin errores («Declaración» = «declaracion»).</p></div></div>
    <div class="paso"><b class="n">2</b><div><h4>Busca la categoría</h4><p>Compara la tarea con las palabras clave de las ${REGLAS.length} categorías. Apartado 2.</p></div></div>
    <div class="paso"><b class="n">3</b><div><h4>El esfuerzo elige la acción (ley del esfuerzo inverso)</h4><p>Cada categoría tiene 3 acciones por nivel en un banco. <strong>Cuanto más pesa la tarea, más pequeña es la acción</strong>: Ligero 1–3 minutos, Medio 30–60 segundos, Pesado 5–10 segundos. Apartado 3.</p></div></div>
    <div class="paso"><b class="n">4</b><div><h4>Cada carta INCUP añade su modificador</h4><p>La misma acción cambia de sabor según la carta: «con la mano que no usas» (Novedad), «sin mirar el móvil» (Desafío), «con tu música favorita de fondo» (Pasión)… Apartado 4.</p></div></div>
    <div class="paso"><b class="n">5</b><div><h4>Reparte el mazo</h4><p>5 cartas, una por factor INCUP. La persona desliza: derecha para aceptar, izquierda para ver la siguiente. Si rechaza las 5, llega otro mazo con combinaciones distintas (hasta ${NUM_MAZOS} mazos, ${NUM_MAZOS * 5} retos por tarea). Apartado 5.</p></div></div>
    <div class="paso"><b class="n">6</b><div><h4>Detalle del reto aceptado</h4><p>Una sola acción, el criterio «Está hecho cuando…», un botón para escucharlo y un premio opcional. Decide la persona: pulsa «Reto conseguido» cuando lo da por hecho.</p></div></div>
  </div>
  <div class="nota"><strong>${TOTAL.toLocaleString('es-ES')} retos distintos</strong> salen de combinar ${REGLAS.length} categorías × 3 niveles × 3 acciones × los modificadores de las 5 cartas. Un script (<code>npm run validar</code>) comprueba que todos cumplen las reglas de oro.</div>
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
    <tr><td>${lista(RESPALDO('arreglar la persiana').pesado)}</td><td>${lista(RESPALDO('arreglar la persiana').medio)}</td><td>${lista(RESPALDO('arreglar la persiana').ligero)}</td></tr>
  </table>
  <div class="nota"><strong>La categoría se puede cambiar.</strong> En la pantalla de selección, el botón con el lápiz deja elegir otra categoría si la detectada no es la correcta. Eso cambia el icono de las cartas.</div>
</section>

<section class="salto">
  <h2>3. Regla de oro: la ley del esfuerzo inverso</h2>
  <p>El nivel que elige la persona en «¿Cuánto te pesa?» decide el tamaño de la acción. Cuanta más resistencia, más pequeña la acción.</p>
  <table>
    <tr><th>Nivel</th><th>Estado</th><th>Duración</th><th>Cómo es la acción</th><th>Ejemplo (Comunicación)</th><th>Está hecho cuando</th></tr>
    ${NIVELES.map((n) => `<tr><td><strong>${n.nombre}</strong></td><td>${esc(n.estado)}</td><td>${n.duracion}</td><td>${esc(n.regla)}</td><td>${esc((n.id === 'pesado' ? 'Solo ' + BANCO['Comunicación'][n.id][0].charAt(0).toLowerCase() + BANCO['Comunicación'][n.id][0].slice(1) : BANCO['Comunicación'][n.id][0]))}</td><td>${esc(HECHO_POR_NIVEL[n.id])}.</td></tr>`).join('')}
  </table>
  <h3>Reglas de redacción de cada acción</h3>
  <ul>
    <li><strong>Verbo físico al principio</strong>: Abre, Coge, Escribe, Ponte, Toca, Mira…</li>
    <li><strong>Cero carga cognitiva</strong>: no pide pensar, decidir, organizar ni planificar.</li>
    <li><strong>Una sola acción</strong>: sin «y», «luego», «después», ni opciones con «o».</li>
    <li><strong>Sin límites de tiempo</strong>: nada de «en 2 minutos», «rápido» o «tómate 5 minutos».</li>
    <li><strong>Sin la palabra «tarea»</strong> y <strong>sin imperativos agresivos</strong> («¡Hazlo ya!»): tono neutral y amable.</li>
    <li><strong>Decide la persona</strong>: el reto está hecho cuando pulsa «Reto conseguido».</li>
  </ul>
  <p>Además siguen las pautas de comunicación accesible (<code>docs/comunicacion.md</code>): lenguaje literal, sin metáforas, sin emojis y sin género gramatical para la persona.</p>
</section>

<section class="salto">
  <h2>4. Matriz de combinación: las 5 cartas INCUP</h2>
  <p>INCUP son los 5 factores que más motivan con TDAH: <strong>I</strong>nterés, <strong>N</strong>ovedad, <strong>C</strong>ompetencia (reto), <strong>U</strong>rgencia y <strong>P</strong>asión. Cada carta toma una acción del banco y le añade <strong>su modificador</strong>. El modificador da sabor sin añadir otra acción ni tiempos.</p>
  <p class="formula">Reto = entradilla de la carta + acción del banco (según nivel) + modificador INCUP</p>
  <table>
    <tr><th>Carta</th><th>Factor</th><th>Qué hace</th><th>Entradilla</th><th>Modificadores</th></tr>
    ${CARTAS.map((c) => `<tr><td><span class="chip" style="background:${c.fondo};color:${c.tinta}">${c.nombre}</span></td><td>${c.incup}</td><td>${esc(c.busca)}</td><td class="formula">${esc(c.entradilla)}</td><td>${esc(MODIFICADORES.normal[c.tipo].join(' · '))}<br><span class="peq">Pesado: ${esc(MODIFICADORES.pesado[c.tipo].join(' · '))}</span></td></tr>`).join('')}
  </table>
  <ul>
    <li>En <strong>Pesado</strong> solo se usan modificadores que se pueden cumplir sin levantarse ni organizar nada, y la acción empieza por «Solo…».</li>
    <li>Si el modificador repite una palabra de la acción («Coge el móvil, sin mirar el móvil»), se usa otro.</li>
    <li>El tono atrevido va <strong>solo en la entradilla</strong>. Si hay pregunta, es una invitación («¿Te apuntas?»), nunca un juicio.</li>
  </ul>
  <h3>Ejemplos</h3>
  ${ejemploCompleto('Responder el email de Carlos', 'pesado')}
  ${ejemploCompleto('Pasear al perro', 'medio')}
  ${ejemploCompleto('Estudiar para el examen', 'ligero')}
</section>

<section class="salto">
  <h2>5. Cuando se acaba el mazo: más retos de la misma tarea</h2>
  <p>Si se rechazan las 5 cartas, la app reparte un <strong>mazo nuevo con 5 retos distintos para la misma tarea</strong> y lo avisa. Hay <strong>${NUM_MAZOS} mazos</strong> (${NUM_MAZOS * 5} retos) y la numeración sigue: 01–05, 06–10… «Aún no, dame más retos» en «Reto conseguido» también pasa al mazo siguiente.</p>
  <p>Cada mazo rota las acciones del banco y los modificadores, así <strong>ninguna combinación se repite</strong> en la misma tarea:</p>
  ${ejemploCompleto('Responder el email de Carlos', 'pesado', 1)}
  ${ejemploCompleto('Responder el email de Carlos', 'pesado', 2)}
  <div class="nota">Tras los ${NUM_MAZOS * 5} retos aparece «Has visto los ${NUM_MAZOS * 5} retos», con tres opciones: escribir la tarea de otra forma (más pequeña o más concreta), volver al primer mazo o ver otro mazo.</div>

  <h3>Detalle, escuchar, enfoque y premio</h3>
  <p>El detalle muestra la acción en grande, el criterio «Está hecho cuando…» y el botón «Escuchar», que lo lee en voz alta con la voz del dispositivo. El modo enfoque tiene 3 opciones: «Sin límite», «10 min + 3 de descanso» y «25 min + 5 de descanso». Se puede elegir un premio opcional (método RAN), que la app recuerda al pulsar «Reto conseguido».</p>
</section>

<section class="salto">
  <h2>6. Banco completo de acciones por categoría</h2>
  <p>Para cada categoría: las palabras clave que la activan y sus 3 acciones por nivel. Todas cumplen las reglas del apartado 3. En Pesado la app añade «Solo…» delante.</p>
  ${GRUPOS.map(
    (g) => `
    <h3>${esc(g.nombre)}</h3>
    ${REGLAS.slice(g.desde, g.hasta + 1).map(bloqueRegla).join('')}`,
  ).join('')}
  <div class="nota"><strong>Cómo ampliar el sistema</strong>: cuando una tarea cae en el respaldo, se añade una regla en <code>src/datos/reglas.ts</code> con sus palabras clave y su icono, y en <code>src/datos/banco.ts</code> sus 3 acciones por nivel. Después, <code>npm run validar</code> comprueba que cumplen las reglas.</div>
</section>

<section class="salto">
  <h2>7. Fuentes</h2>
  <ul>
    <li><strong>Guía y Reglas Completas del Sistema de Retos Anti-Procrastinación (V2)</strong>: las categorías y sus palabras clave, los gatillos motivacionales y el protocolo de expansión.</li>
    <li><strong>Regla de oro: la ley del esfuerzo inverso</strong> y <strong>Matriz de combinación</strong>: tamaño de la acción por nivel, reglas de redacción y modificadores INCUP.</li>
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
