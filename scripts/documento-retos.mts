// Genera docs/sistema-de-retos.html (y el PDF, con `npm run documento`) a partir del código real
// de src/datos/reglas.ts, para que el documento siempre coincida con lo que hace la app.
import { writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import {
  analizarTarea,
  GATILLO_DE_CARTA,
  HECHO_GENERICO,
  pasosDe,
  PLANTILLAS,
  REGLAS,
  RETO_GENERICO,
  retosDe,
  tono,
  type Regla,
} from '../src/datos/reglas.ts'
import { VARIANTES } from '../src/datos/variantes.ts'

type Tipo = 'novedad' | 'desafio' | 'pasion' | 'interes' | 'urgencia'

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const CARTAS: { tipo: Tipo; nombre: string; incup: string; fondo: string; tinta: string; busca: string; ejemplo: string; formula: string; entradilla: string }[] = [
  { tipo: 'novedad', nombre: 'Novedad', incup: 'Novedad', fondo: '#5b3fe0', tinta: '#ffffff', busca: 'Hacerlo de otra forma o en otro sitio.', ejemplo: 'Pasea al perro por un sitio distinto al de siempre.', formula: '¡Plan nuevo! [Acción], en un sitio distinto al de siempre.', entradilla: '¡Plan nuevo! [Acción].' },
  { tipo: 'desafio', nombre: 'Desafío', incup: 'Competencia (reto)', fondo: '#ee6b47', tinta: '#1b1340', busca: 'Una meta pequeña que se pueda contar o comprobar.', ejemplo: 'Da un paseo corto: hasta la esquina y vuelta.', formula: 'Reto rápido: [acción]. ¿Te apuntas?', entradilla: 'Reto rápido: [acción]. ¿Te apuntas?' },
  { tipo: 'pasion', nombre: 'Pasión', incup: 'Pasión', fondo: '#f7a3e0', tinta: '#1b1340', busca: 'Unirlo a algo que te gusta.', ejemplo: 'Ponte tu música o podcast favorito y sal con el perro.', formula: 'Modo disfrute: [acción].', entradilla: 'Modo disfrute: [acción].' },
  { tipo: 'interes', nombre: 'Interés', incup: 'Interés', fondo: '#2fa4f0', tinta: '#1b1340', busca: 'Hacerlo con otra persona o descubrir algo.', ejemplo: 'Llama a un amigo para dar el paseo juntos.', formula: 'Hazlo interesante: [acción].', entradilla: 'Hazlo interesante: [acción].' },
  { tipo: 'urgencia', nombre: 'Urgencia', incup: 'Urgencia', fondo: '#ffd23f', tinta: '#1b1340', busca: 'La acción mínima, ahora (el reto base de la regla).', ejemplo: 'Coge la correa y acércate a la puerta. Hazlo ahora, antes de empezar otra cosa.', formula: '¡Ya! [Acción], antes de que te lo pienses.', entradilla: '¡Ya! [Acción], antes de que te lo pienses.' },
]

const GRUPOS: { nombre: string; desde: number; hasta: number; ejemplo: string }[] = [
  { nombre: 'Trabajo, administración y estudio', desde: 0, hasta: 6, ejemplo: 'Responder el email de Carlos' },
  { nombre: 'Hogar y vida cotidiana', desde: 7, hasta: 10, ejemplo: 'Ordenar el escritorio' },
  { nombre: 'Ocio y entretenimiento', desde: 11, hasta: 17, ejemplo: 'Ver la nueva temporada de la serie' },
  { nombre: 'Deporte y movimiento', desde: 18, hasta: 26, ejemplo: 'Salir a correr' },
  { nombre: 'Vida social', desde: 27, hasta: 33, ejemplo: 'Felicitar a Lucía por su cumpleaños' },
  { nombre: 'Hobbies y creatividad', desde: 34, hasta: 41, ejemplo: 'Dibujar un boceto' },
  { nombre: 'Descanso y autocuidado', desde: 42, hasta: 47, ejemplo: 'Beber más agua' },
  { nombre: 'Ampliación de la app', desde: 48, hasta: REGLAS.length - 1, ejemplo: 'Sacar al perro' },
]

const NOMBRE_ICONO: Record<string, string> = {
  trabajo: 'Trabajo', estudios: 'Estudios', limpieza: 'Limpieza', deporte: 'Deporte', autocuidado: 'Autocuidado',
  llamadas: 'Llamadas', casa: 'Casa', alimentacion: 'Alimentación', mascotas: 'Mascotas', social: 'Social',
}

const listaPasos = (base: string) => {
  const p = pasosDe(base)
  return p.length > 1 ? `<ol>${p.map((x) => `<li>${esc(x)}.</li>`).join('')}</ol>` : `${esc(p[0])}.`
}

const minicarta = (c: (typeof CARTAS)[number], texto: string, hecho?: string) =>
  `<div class="mini" style="background:${c.fondo};color:${c.tinta}"><span class="mini__tipo">${c.nombre}</span><p>${esc(texto)}</p>${
    hecho ? `<p class="mini__hecho"><b>Hecho cuando</b> ${esc(hecho)}.</p>` : ''
  }</div>`

function ejemploCompleto(tarea: string) {
  const a = analizarTarea(tarea)
  const retos = retosDe(tarea)
  return `
  <div class="ejemplo">
    <p class="ejemplo__tarea">Tarea escrita: <strong>«${esc(tarea)}»</strong></p>
    <p class="ejemplo__meta">Regla: <strong>${esc(a.categoria)}</strong> · icono ${esc(NOMBRE_ICONO[a.icono ?? 'trabajo'])}</p>
    <div class="minis">${CARTAS.map((c, i) => minicarta(c, retos[i].titulo, retos[i].hecho)).join('')}</div>
  </div>`
}

/* Los 5 retos de una regla, sin depender de una tarea concreta */
function retosDeRegla(r: Regla) {
  const v = VARIANTES[r.categoria]
  return CARTAS.map((c) =>
    c.tipo === 'urgencia' || !v
      ? { texto: tono(r.base, GATILLO_DE_CARTA[c.tipo]), hecho: r.hecho }
      : { texto: `${v[c.tipo][0]}.`, hecho: v[c.tipo][1] },
  )
}

const bloqueRegla = (r: Regla) => {
  const retos = retosDeRegla(r)
  return `
  <div class="regla">
    <p class="regla__cab"><strong>${esc(r.categoria)}</strong> <span class="peq">· icono ${esc(NOMBRE_ICONO[r.icono])} · palabras clave: ${esc(r.palabras.join(', '))}</span></p>
    <div class="minis">${CARTAS.map((c, i) => minicarta(c, retos[i].texto, retos[i].hecho)).join('')}</div>
  </div>`
}

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
    <p class="sub" style="margin-top:8mm">Cómo convierte la app cualquier tarea en 5 retos: qué regla elige, cómo se escribe cada carta INCUP, cómo se dividen los pasos y cuándo un reto está hecho.</p>
  </div>
  <p class="pie">Documento generado desde el código de la app (<code style="background:transparent;color:inherit">src/datos/reglas.ts</code>) · ${esc(hoy)}</p>
</section>

<section class="salto">
  <h2>1. Cómo funciona, de principio a fin</h2>
  <p>La persona escribe una tarea («Responder el email de Carlos») y elige cuánto le pesa. La app hace esto:</p>
  <div class="flujo">
    <div class="paso"><b class="n">1</b><div><h4>Limpia el texto</h4><p>Pasa la tarea a minúsculas y quita tildes y signos, para comparar sin errores («Declaración» = «declaracion»).</p></div></div>
    <div class="paso"><b class="n">2</b><div><h4>Busca la regla que mejor encaja</h4><p>Compara la tarea con las ${REGLAS.length} reglas (${REGLAS.length - 1} de las tablas del «Sistema de Retos V2» + 1 de la app). Cada regla tiene palabras clave, una categoría, un icono, un <strong>reto base</strong> (la mínima acción posible) y un <strong>criterio de éxito</strong>. Cómo se puntúa: apartado 2.</p></div></div>
    <div class="paso"><b class="n">3</b><div><h4>Si no hay regla, usa una plantilla</h4><p>Mira el verbo con el que empieza la tarea («Buscar piso» → «Busca piso y tenlo delante»). Si tampoco hay plantilla para ese verbo: «${esc(RETO_GENERICO)}». Apartado 5.</p></div></div>
    <div class="paso"><b class="n">4</b><div><h4>Ajusta al esfuerzo</h4><p>Si la tarea se marcó como <strong>Pesado</strong> y el reto base tiene varios pasos, el reto se reduce al primer paso y el criterio pasa a ser «has hecho este paso». Con menos esfuerzo cuesta menos arrancar.</p></div></div>
    <div class="paso"><b class="n">5</b><div><h4>Crea 5 retos distintos, uno por carta INCUP</h4><p>Cada carta es un reto diferente según su factor de motivación: Novedad (de otra forma), Desafío (una meta pequeña), Pasión (con algo que te gusta), Interés (con alguien o descubriendo algo) y Urgencia (lo mínimo, ahora). Apartado 3.</p></div></div>
    <div class="paso"><b class="n">6</b><div><h4>Muestra el mazo</h4><p>La persona desliza: derecha para aceptar, izquierda para ver la siguiente. Si rechaza las 5, la app le propone escribir otra tarea.</p></div></div>
    <div class="paso"><b class="n">7</b><div><h4>Detalle del reto aceptado</h4><p>Muestra los <strong>micropasos</strong> con casillas para marcar, el criterio <strong>«Está hecho cuando…»</strong>, un botón para <strong>escucharlo</strong> en voz alta y un <strong>premio</strong> opcional para cuando lo consiga. Apartado 4.</p></div></div>
  </div>
</section>

<section class="salto">
  <h2>2. Cómo se elige la regla</h2>
  <p>Cada regla suma puntos por cada palabra clave que aparece en la tarea: tantos puntos como letras tiene la palabra clave. Gana la regla con más puntos; si empatan, la que va antes en la lista.</p>
  <p>Las palabras que salen en <strong>varias reglas</strong> («leer», «escribir», «dibujar», «escuchar», «llamar»…) solo cuentan <strong>la mitad</strong>, porque por sí solas no dicen de qué va la tarea. Así gana la palabra más concreta:</p>
  <table>
    <tr><th>Tarea</th><th>Regla elegida</th><th>Por qué</th></tr>
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
  <div class="nota"><strong>La categoría se puede cambiar.</strong> En la pantalla de selección, el botón con el lápiz deja elegir otra categoría si la detectada no es la correcta. Eso cambia el icono de las cartas.</div>
</section>

<section class="salto">
  <h2>3. Las 5 cartas INCUP: un reto distinto en cada una</h2>
  <p>INCUP son los 5 factores que más motivan con TDAH: <strong>I</strong>nterés, <strong>N</strong>ovedad, <strong>C</strong>ompetencia (reto), <strong>U</strong>rgencia y <strong>P</strong>asión. Cada carta usa uno y propone <strong>un reto diferente</strong> para la misma tarea, así la persona elige el que le encaje en ese momento.</p>
  <table>
    <tr><th>Carta</th><th>Factor INCUP</th><th>Qué busca</th><th>Entradilla</th><th>Ejemplo con «Pasear al perro»</th></tr>
    ${CARTAS.map((c) => `<tr><td><span class="chip" style="background:${c.fondo};color:${c.tinta}">${c.nombre}</span></td><td>${c.incup}</td><td>${esc(c.busca)}</td><td class="formula">${esc(c.entradilla)}</td><td>${esc(retosDe('Pasear al perro')[CARTAS.indexOf(c)].titulo)}</td></tr>`).join('')}
  </table>
  <p>Cada categoría tiene escritos sus 4 retos propios (Novedad, Desafío, Pasión e Interés) con su criterio de éxito, en <code>src/datos/variantes.ts</code>. La carta Urgencia usa el reto base de la regla. El catálogo completo está en el apartado 6.</p>
  <h3>Cuando la tarea no tiene regla</h3>
  <p>Si la tarea cae en una plantilla genérica (apartado 5), no hay retos propios: las 5 cartas dicen la misma acción con la entradilla de cada una. La Novedad añade además el cambio concreto de sitio.</p>
  <table>
    <tr><th>Carta</th><th>Fórmula (solo para plantillas)</th></tr>
    ${CARTAS.map((c) => `<tr><td><span class="chip" style="background:${c.fondo};color:${c.tinta}">${c.nombre}</span></td><td class="formula">${esc(c.formula)}</td></tr>`).join('')}
  </table>
  <p class="peq">El PDF V2 tiene un sexto gatillo, «Amable». En la app no tiene carta propia: su papel lo cumplen los pasos marcables y el criterio de éxito del detalle.</p>

  <h3>Reglas de escritura (comunicación accesible)</h3>
  <ul>
    <li>Lenguaje claro y literal: sin metáforas, ironías ni frases hechas («cambia el chip», «tranqui»).</li>
    <li>La acción va siempre primero y entera.</li>
    <li>Sin tiempos vagos («luego», «cuando puedas»). Las preguntas son invitaciones («¿Te apuntas?»), nunca juicios («¿a que no puedes?»).</li>
    <li><strong>Tono atrevido solo en la entradilla</strong> del titular de la carta («¡Plan nuevo!», «Reto rápido», «Modo disfrute», «Hazlo interesante», «¡Ya!»). La acción, los pasos y el «Está hecho cuando…» siguen siendo literales.</li>
    <li>Sin emojis y sin género gramatical para la persona («ya habrás empezado», no «estarás list@»).</li>
  </ul>
  <h3>Ejemplo</h3>
  ${ejemploCompleto('Responder el email de Carlos')}
</section>

<section class="salto">
  <h2>3b. Cuando se acaba el mazo: más retos de la misma tarea</h2>
  <p>Si se rechazan las 5 cartas, la app reparte un <strong>mazo nuevo con 5 retos distintos para la misma tarea</strong> y avisa: «Mazo nuevo: 5 retos distintos para la misma tarea (2 de 3)». Hay <strong>3 mazos</strong> (15 retos) y la numeración sigue: 01–05, 06–10, 11–15. «Aún no, dame más retos» en «Reto conseguido» también pasa al mazo siguiente.</p>
  <p>El mazo 1 usa los retos de la categoría. Los mazos 2 y 3 usan estrategias que sirven para cualquier tarea y meten el nombre de la tarea o su reto base:</p>
  <table>
    <tr><th>Carta</th><th>Mazo 2</th><th>Mazo 3</th></tr>
    ${CARTAS.map((c, i) => `<tr><td><span class="chip" style="background:${c.fondo};color:${c.tinta}">${c.nombre}</span></td><td>${esc(retosDe('Responder el email de Carlos', 'ligero', 1)[i].titulo)}<br><span class="peq">Hecho cuando ${esc(retosDe('Responder el email de Carlos', 'ligero', 1)[i].hecho)}.</span></td><td>${esc(retosDe('Responder el email de Carlos', 'ligero', 2)[i].titulo)}<br><span class="peq">Hecho cuando ${esc(retosDe('Responder el email de Carlos', 'ligero', 2)[i].hecho)}.</span></td></tr>`).join('')}
  </table>
  <p class="peq">Ejemplo con «Responder el email de Carlos».</p>
  <div class="nota">Tras los 15 retos aparece «Has visto los 15 retos», con tres opciones: escribir la tarea de otra forma (más pequeña o más concreta), volver al primer mazo o ver otro mazo.</div>
</section>

<section class="salto">
  <h2>4. Pasos, criterio de éxito, esfuerzo y premio</h2>
  <h3>Micropasos</h3>
  <p>El reto base se divide en pasos cuando tiene una «y» seguida de un verbo de acción («Abre el correo <strong>y escribe</strong> solo el saludo» → 2 pasos). Si la «y» no va seguida de un verbo («papel <strong>y</strong> lápiz»), se queda en el mismo paso. En el detalle se muestra <strong>un paso cada vez</strong>, en grande, con el contador «Paso 1 de 2» y el botón «Hecho. Ver el siguiente paso». Los pasos hechos quedan arriba, tachados, y se pueden desmarcar. Al terminar el último aparece «Ya has hecho todos los pasos. Pulsa «Reto conseguido»».</p>
  <h3>Criterio de éxito</h3>
  <p>Cada regla tiene un «Está hecho cuando…» con algo que se puede <strong>ver o comprobar</strong>: «el saludo está escrito en el correo», «hay 3 cosas menos encima de la mesa», «el vaso de agua está vacío». Así no hay que adivinar cuándo se ha terminado.</p>
  <h3>Esfuerzo («¿Cuánto te pesa?»)</h3>
  <table>
    <tr><th>Elección</th><th>Qué pasa con el reto</th><th>Carta Urgencia de «Estudiar para el examen»</th></tr>
    <tr><td>Ligero</td><td>Retos completos.</td><td>${listaPasos(analizarTarea('Estudiar para el examen').base)}</td></tr>
    <tr><td>Medio</td><td>Retos completos.</td><td>Igual que Ligero.</td></tr>
    <tr><td>Pesado</td><td>El reto base (carta Urgencia y plantillas) se queda solo en su primer paso, con el criterio «has hecho este paso». Los retos propios de las otras cartas ya son pequeños y no cambian.</td><td>${esc(pasosDe(analizarTarea('Estudiar para el examen').base)[0])}.</td></tr>
  </table>
  <h3>Modo enfoque: bloques con descanso</h3>
  <p>El temporizador del modo enfoque tiene 3 opciones: «Sin límite» (cronómetro), «10 min + 3 de descanso» y «25 min + 5 de descanso». En los bloques se ve el tiempo que queda y una barra que se llena. Al acabar cada fase el temporizador se para, suena un aviso corto y dice qué viene después («Bloque terminado. Pulsa el botón de iniciar para empezar el descanso de 3 minutos.»).</p>
  <h3>Escuchar</h3>
  <p>El botón «Escuchar» lee en voz alta, con la voz del dispositivo: el texto de la carta, «Paso 1: …», «Paso 2: …» y «Está hecho cuando …».</p>
  <h3>Premio (método RAN)</h3>
  <p>En el detalle se puede elegir un premio opcional: «Un café o un té», «Un capítulo de tu serie», «10 minutos de descanso», «Una canción que te guste» u otro escrito a mano. Al pulsar «Reto conseguido» la app lo recuerda: «Tu premio: … Puedes tomarlo ahora.».</p>
</section>

<section class="salto">
  <h2>5. Plantillas genéricas (cuando no hay regla)</h2>
  <p>Se mira el primer verbo de la tarea. <strong>[objeto]</strong> es el resto del texto («Buscar <em>piso</em>» → objeto = «piso»).</p>
  <table>
    <tr><th>Verbos</th><th>Reto base</th><th>Está hecho cuando</th></tr>
    ${PLANTILLAS.map((p) => `<tr><td>${esc(p.verbos.join(', '))}</td><td>${esc(p.base('[objeto]'))}</td><td>${esc(p.hecho('[objeto]'))}</td></tr>`).join('')}
    <tr><td><em>Cualquier otro</em></td><td>${esc(RETO_GENERICO)}</td><td>${esc(HECHO_GENERICO)}</td></tr>
  </table>
  <div class="nota"><strong>Cómo ampliar el sistema</strong> (protocolo 5.2 del PDF V2): cuando una tarea cae en una plantilla, se añade una regla nueva en <code>src/datos/reglas.ts</code> con sus palabras clave, una categoría breve, el icono, la mínima acción posible y su criterio de éxito.</div>
</section>

<section class="salto">
  <h2>6. Catálogo completo de reglas por categoría</h2>
  <p>Para cada regla: las palabras clave que la activan y los 5 retos que propone, uno por carta, con su criterio de éxito («Hecho cuando…»). Si un reto tiene una «y» seguida de un verbo, en el detalle se divide en pasos.</p>
  ${GRUPOS.map(
    (g) => `
    <h3>${esc(g.nombre)}</h3>
    ${REGLAS.slice(g.desde, g.hasta + 1).map(bloqueRegla).join('')}`,
  ).join('')}
</section>

<section class="salto">
  <h2>7. Fuentes</h2>
  <ul>
    <li><strong>Guía y Reglas Completas del Sistema de Retos Anti-Procrastinación (V2)</strong>: las 49 reglas, las plantillas genéricas, los gatillos motivacionales y el protocolo de expansión.</li>
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
