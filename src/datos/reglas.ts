import type { Categoria } from '../components/Icono/iconos'
import type { TipoReto } from '../components/CartaReto/tipos'
import { BANCO, PERMISO, PLAZO, type Acciones, type Nivel } from './banco.ts'
import { ACTIVIDAD_DE_CATEGORIA, ACTIVIDAD_DE_SITUACION, METODOS, type Actividad } from './metodos.ts'
import { leerSituacion, type Fuente } from './situacion.ts'

/* ─────────────────────────────────────────────────────────────
   Sistema de Retos Anti-Procrastinación
   Fuentes: «Sistema de Retos V2» (PDF), «Ley del esfuerzo inverso» y la investigación
   sobre cómo redactan tareas las apps para TDAH (docs/comunicacion.md).

   1. Se busca la tarea en las REGLAS (palabras clave → categoría).
   2. El nivel de esfuerzo elige las 5 cartas escritas a mano para esa categoría (banco.ts):
      cuanto más pesa la tarea, más pequeña es la acción.
   3. Cada carta INCUP cambia la acción (otro sitio, una meta, algo que gusta, una persona,
      un plazo corto). La carta dice solo la acción, sin entradillas.
   4. Si no hay regla, se usa el RESPALDO con el texto de la tarea (o lo que encontró la web).

   Protocolo de expansión: para una tarea que cae en el respaldo, añade aquí una regla con
   sus palabras clave y en banco.ts sus 15 retos (3 niveles × 5 cartas).
   ───────────────────────────────────────────────────────────── */

export type Gatillo = 'motivacion' | 'novedad' | 'urgencia' | 'desafio' | 'directo'

export const GATILLO_DE_CARTA: Record<TipoReto, Gatillo> = {
  novedad: 'novedad',
  desafio: 'desafio',
  pasion: 'motivacion',
  interes: 'directo',
  urgencia: 'urgencia',
}

export type Regla = {
  /** Palabras clave (sin tildes da igual: se normalizan). */
  palabras: string[]
  /** Categoría del PDF («Comunicación», «Ver serie»…), se ve en la carta. */
  categoria: string
  /** Icono de la app que se usa para esa categoría. */
  icono: Categoria
  /** Reto base: la mínima acción viable. */
  base: string
  /** Criterio de éxito explícito: se lee «Está hecho cuando …». Algo que se pueda ver o comprobar. */
  hecho: string
}

const r = (palabras: string, categoria: string, icono: Categoria, base: string, hecho: string): Regla => ({
  palabras: palabras.split(',').map((p) => p.trim()),
  categoria,
  icono,
  base,
  hecho,
})

export const REGLAS: Regla[] = [
  // 2.1 Trabajo, Administración y Estudio
  r('email, correo, responder, escribir a, mail, contestar, responder mensaje, bandeja de entrada, newsletter, mandar un correo, enviar', 'Comunicación', 'trabajo', 'Abre el correo y escribe solo el saludo', 'el saludo está escrito en el correo'),
  r('declaración, impuestos, hacienda, papeleo, trámite, tramites, renta, impuesto, formulario, solicitud, factura, facturas, recibo, banco, seguro, multa, certificado, empadronamiento, pasaporte, dni, nie, sepe, paro, seguridad social', 'Administrativo', 'trabajo', 'Abre la web o el documento y mira la primera casilla', 'tienes el documento abierto y has leído la primera casilla'),
  r('estudiar, leer, apuntes, examen, estudio, temario, tema, deberes, trabajo de clase, tfg, tfm, asignatura, clase, universidad, instituto, repasar, resumen, esquema, apuntar, oposiciones, trabajo de fin de grado, trabajo final', 'Académico', 'estudios', 'Abre el libro o apunte y lee solo el primer párrafo', 'has leído el primer párrafo'),
  r('llamar, teléfono, cita, dentista, telefonear, médico, medico, pedir cita, cita previa, consulta, reclamar, atención al cliente, ambulatorio, centro de salud, fisio', 'Llamadas', 'llamadas', 'Busca el número y tenlo listo para marcar', 'tienes el número en la pantalla, listo para llamar'),
  r('decidir, elegir, escoger, decisión, decidirme, opciones, elegir entre, pensar si, comparar', 'Decisión', 'trabajo', 'Escribe las 2 opciones en un papel', 'las 2 opciones están escritas en el papel'),
  r('creativo, escribir, diseñar, dibujar, diseño, proyecto creativo, idea, ilustración, maqueta, presentación, portfolio', 'Creativo', 'estudios', 'Abre el documento y escribe una frase', 'hay una frase escrita en el documento'),
  r('ordenador, portátil, archivo, carpeta, móvil, fotos del móvil, escritorio del ordenador, descargas, backup, copia de seguridad, actualizar, contraseña, nube, drive', 'Digital', 'trabajo', 'Abre la carpeta y mira el primer archivo', 'has abierto el primer archivo de la carpeta'),

  // 2.2 Tareas del Hogar y Vida Cotidiana
  r('limpiar, ordenar, recoger, fregar, limpieza, cuarto, habitación, casa, piso, baño, polvo, aspirar, barrer, fregona, platos, lavavajillas, basura, armario, desorden, ordenar mi cuarto, hacer la cama, cambiar las sábanas, sábanas', 'Doméstico', 'limpieza', 'Recoge solo 3 cosas de la mesa', 'hay 3 cosas menos encima de la mesa'),
  r('comprar, tienda, supermercado, compra, super, súper, mercado, lista de la compra, hacer la compra, comprar comida, pedido online', 'Compra', 'alimentacion', 'Escribe la lista de 3 cosas que necesitas', 'la lista tiene 3 cosas apuntadas'),
  r('café, cafe, preparar café, preparar cafe, hacerme un café, cafetera, té, hacerme un té, infusión, cappuccino, café con leche, cola cao, colacao, chocolate caliente', 'Café', 'alimentacion', 'Coge la cafetera', 'has cogido la cafetera'),
  r('cocinar, comida, cena, receta, cocinar algo, almuerzo, guisar, hornear, preparar la comida, tupper, tuppers, batch cooking, cocina', 'Cocina', 'alimentacion', 'Abre la nevera y saca un ingrediente', 'hay un ingrediente fuera de la nevera'),
  r('ropa, lavar, tender, planchar, lavadora, colada, doblar, ropa sucia, secadora, ropa limpia, armario de ropa', 'Ropa', 'casa', 'Coge una prenda y llévala al sitio', 'una prenda está en su sitio'),

  // 2.3 Ocio y Entretenimiento
  r('serie, ver serie, netflix, capítulo, temporada, episodio, hbo, prime video, disney, ver un capítulo', 'Ver serie', 'autocuidado', 'Pon el capítulo y mira solo la intro', 'has visto la intro del capítulo'),
  r('película, cine, ver peli, film, peli, filme, ver una película', 'Ver película', 'autocuidado', 'Abre la plataforma y elige una peli', 'has elegido una película'),
  r('leer, libro, novela, kindle, leer un libro, lectura, cómic, comic, manga, audiolibro', 'Lectura', 'autocuidado', 'Abre el libro y lee solo una página', 'has leído una página'),
  r('jugar, videojuego, consola, partida, videojuegos, play, playstation, xbox, switch, nintendo, jugar a', 'Videojuego', 'autocuidado', 'Abre el juego y haz solo una partida corta', 'has jugado una partida corta'),
  r('música, escuchar, playlist, disco, canciones, spotify, escuchar música, álbum, concierto', 'Música', 'autocuidado', 'Pon una canción que te guste', 'está sonando una canción que te gusta'),
  r('podcast, escuchar podcast, pódcast, episodio de podcast', 'Podcast', 'autocuidado', 'Pon el podcast y escucha un poco', 'el podcast está sonando'),
  r('youtube, vídeo, tutorial, video, ver un vídeo, curso online, clase online', 'Vídeo', 'autocuidado', 'Busca el vídeo y dale al play', 'el vídeo se está reproduciendo'),

  // 2.4 Deporte y Movimiento
  r('ejercicio, entrenar, gimnasio, pesas, gym, deporte, entrenamiento, rutina de ejercicio, abdominales, sentadillas, crossfit, pilates, hacer ejercicio', 'Gimnasio', 'deporte', 'Ponte la ropa de deporte', 'llevas puesta la ropa de deporte'),
  r('correr, running, salir a correr, trotar, footing, jogging, carrera', 'Correr', 'deporte', 'Ponte las zapatillas y sal a la puerta', 'llevas las zapatillas puestas y estás en la puerta'),
  r('caminar, andar, paseo, pasear, dar un paseo, salir a caminar, andar un rato', 'Caminar', 'deporte', 'Ponte los zapatos y sal a la calle', 'llevas los zapatos puestos y estás en la calle'),
  r('yoga, estiramientos, flexibilidad, estirar, pilates suave, postura', 'Yoga', 'deporte', 'Extiende la esterilla y haz una postura', 'la esterilla está extendida y has hecho una postura'),
  r('bici, bicicleta, ciclismo, pedalear, spinning, rodar', 'Bici', 'deporte', 'Saca la bici y pon el casco', 'la bici está fuera y llevas el casco puesto'),
  r('nadar, piscina, natación, largos, nadar un rato, bañador', 'Natación', 'deporte', 'Prepara el bañador y la toalla', 'el bañador y la toalla están en la bolsa'),
  r('bailar, baile, coreografía, zumba, danza, clase de baile', 'Baile', 'deporte', 'Pon una canción y muévete', 'has bailado una canción'),
  r('escalada, boulder, rocódromo, escalar, búlder, pared de escalada', 'Escalada', 'deporte', 'Prepara el material y ve al rocódromo', 'el material está en la bolsa y sales hacia el rocódromo'),
  r('fútbol, baloncesto, deporte de equipo, pádel, padel, tenis, voleibol, balonmano, partido, entrenamiento de equipo, jugar al padel, jugar al pádel, jugar al tenis, jugar al fútbol, jugar al futbol', 'Deporte en equipo', 'deporte', 'Coge la equipación y confirma la hora', 'la equipación está preparada y sabes a qué hora es'),

  // 2.5 Vida Social
  r('quedar, quedar con amigos, plan, salir, amigos, amigas, quedada, salir con, tomar algo, cervezas, café con', 'Quedar con amigos', 'social', 'Escribe un mensaje y propón un día', 'has enviado un mensaje con un día propuesto'),
  r('llamar a un amigo, hablar con, llamada, llamar a mi madre, llamar a mi padre, videollamada, hablar por teléfono', 'Llamada social', 'social', 'Busca el contacto y mándale un mensaje', 'has enviado un mensaje a esa persona'),
  r('cumpleaños, felicitar, regalo, cumple, felicitación, regalo de cumpleaños, tarta', 'Cumpleaños', 'social', 'Escribe el mensaje de felicitación', 'el mensaje de felicitación está enviado'),
  r('fiesta, celebración, evento social, boda, bautizo, comunión, cena de empresa, despedida', 'Fiesta', 'social', 'Confirma asistencia o prepara lo que llevar', 'has confirmado que vas o tienes preparado lo que vas a llevar'),
  r('familia, visita, comida familiar, madre, padre, mamá, papá, abuela, abuelo, hermana, hermano, tía, tío, visitar a', 'Familia', 'social', 'Llama o escribe para confirmar el plan', 'has llamado o escrito para confirmar el plan'),
  r('cita, quedar con alguien, plan romántico, pareja, novio, novia, primera cita, ligar', 'Cita', 'social', 'Escribe un mensaje y propón hora y sitio', 'has enviado un mensaje con hora y sitio'),
  r('grupo, chat, whatsapp de amigos, mensajes, grupo de whatsapp, telegram, contestar al grupo', 'Chat de grupo', 'social', 'Lee los últimos mensajes y responde uno', 'has respondido a un mensaje del grupo'),

  // 2.6 Hobbies y Creatividad
  r('dibujar, pintar, ilustrar, boceto, acuarela, sketch, dibujo, colorear', 'Dibujo', 'autocuidado', 'Coge papel y lápiz y haz una línea', 'hay una línea dibujada en el papel'),
  r('escribir, escribir algo, relato, diario, escribir un texto, blog, poema, cuento, novela propia, carta', 'Escritura', 'autocuidado', 'Abre el documento y escribe una frase', 'hay una frase escrita en el documento'),
  r('fotografía, foto, cámara, editar fotos, fotos, hacer fotos, sacar fotos, revelar', 'Fotografía', 'autocuidado', 'Coge la cámara o el móvil y haz una foto', 'has hecho una foto'),
  r('cocinar, receta nueva, postre, repostería, bizcocho, galletas, tarta casera', 'Cocina creativa', 'alimentacion', 'Saca los ingredientes y prepara uno', 'un ingrediente está lavado, cortado o medido'),
  r('manualidades, coser, tejer, bricolaje, costura, ganchillo, punto, arreglar, montar un mueble, pintar la pared, mueble, montar, ikea, taladro', 'Manualidades', 'casa', 'Prepara el material y empieza una pieza', 'el material está en la mesa y has empezado una pieza'),
  r('tocar instrumento, guitarra, piano, practicar, tocar, ensayar, ukelele, violín, batería, bajo', 'Instrumento', 'autocuidado', 'Coge el instrumento y toca una escala', 'has tocado una escala'),
  r('jardín, plantas, huerto, regar, planta, macetas, regar las plantas, abonar, trasplantar', 'Jardín', 'casa', 'Riega una planta o retira una hoja seca', 'has regado una planta o quitado una hoja seca'),
  r('meditar, mindfulness, respirar, meditación, respiración, relajarme, calmarme', 'Meditación', 'autocuidado', 'Siéntate y respira', 'has hecho 3 respiraciones lentas'),

  // 2.7 Descanso y Autocuidado
  r('dormir, siesta, descansar, acostarme, irme a dormir, acostarse, sueño, cama, dormir pronto', 'Descanso', 'autocuidado', 'Prepara la cama y apaga pantallas', 'la cama está abierta y las pantallas apagadas'),
  r('ducha, baño, aseo, ducharme, duchar, lavarme, dientes, lavarme los dientes, bañarme, higiene, afeitarme, depilarme', 'Aseo', 'autocuidado', 'Ve al baño y abre el grifo', 'estás en el baño con el grifo abierto'),
  r('skincare, crema, rutina facial, cuidado de la piel, cara, mascarilla, protector solar', 'Skincare', 'autocuidado', 'Aplica un solo producto', 'te has puesto un producto'),
  r('desayuno, comer, cena, alimentarme, comer algo, desayunar, almorzar, merendar, cenar, merienda, almuerzo, picar algo, comer bien, dieta', 'Comida', 'alimentacion', 'Prepara algo simple y siéntate a comer', 'tienes algo de comer en la mesa y has empezado'),
  r('agua, beber, hidratarme, beber agua, vaso de agua, botella, hidratación', 'Hidratación', 'autocuidado', 'Bebe un vaso de agua', 'el vaso de agua está vacío'),
  r('desconectar, parar, no hacer nada, descanso de pantallas, sin móvil, apagar el móvil, relax', 'Desconexión', 'autocuidado', 'Siéntate y tómate un momento', 'has pasado un momento sin pantallas ni tareas'),

  // Ampliación (protocolo 5.2): la app tiene categoría «Mascotas»
  r('perro, pasear al perro, sacar al perro, paseo del perro, sacar a la perra, perra, sacar al perrito', 'Pasear al perro', 'mascotas', 'Coge la correa y acércate a la puerta', 'tienes la correa en la mano y estás en la puerta'),
  r('test, autoescuela, carnet de conducir, examen teórico, examen de conducir, tests, test de conducir, teórico, dgt', 'Test', 'estudios', 'Abre la app del test', 'has abierto la app del test'),
  r('veterinario, vacuna, revisión, vete, desparasitar, castrar, esterilizar', 'Veterinario', 'mascotas', 'Busca el teléfono del veterinario y tenlo listo', 'tienes el número en la pantalla, listo para llamar'),
  r('gato, mascota, cuidar a mi mascota, gata, gatito, arenero, pienso, acuario, hámster, conejo', 'Mascotas', 'mascotas', 'Llena el cuenco de agua de tu mascota', 'el cuenco de agua está lleno'),
]

/* ── 3. Respaldo: tareas sin regla ──────────────────────────────
   Si ninguna palabra clave encaja, los retos nombran la tarea entre comillas
   y usan objetos concretos (libreta, móvil, mesa). Mismas reglas que el banco. */

/* Verbos abstractos al principio de la tarea («hacer», «tener que»…): se quitan para quedarse
   con el objeto («Hacer el test de autoescuela» → «el test de autoescuela»). */
const ABSTRACTOS = /^(tengo que |hay que |debo |quiero )?(hacer|realizar|terminar|acabar|empezar|completar|ponerme con|ponerse con)\s+/i

export const objetoDe = (tarea: string) => tarea.trim().replace(/[.!?]+$/, '').replace(ABSTRACTOS, '')

export const RESPALDO = (t: string): Acciones => ({
  pesado: {
    novedad: `Escribe «${t}» en un pósit`,
    desafio: `Escribe «${t}» en tu libreta con 3 palabras`,
    pasion: `Abre la nota de «${t}» con tu canción favorita sonando`,
    interes: `Escribe «${t}» en un mensaje para una persona de confianza`,
    urgencia: `Coge el móvil para buscar «${t}»`,
  },
  medio: {
    novedad: `Busca «${t}» en el móvil desde otro sitio de la casa`,
    desafio: `Pon sobre la mesa 3 cosas que necesitas para «${t}»`,
    pasion: `Pon sobre la mesa el material de «${t}» con tu música favorita de fondo`,
    interes: `Envía un mensaje a una persona de confianza para contarle que empiezas «${t}»`,
    urgencia: `Pon sobre la mesa el material de «${t}»`,
  },
  ligero: {
    novedad: `Lee la información de «${t}» en otro sitio de la casa`,
    desafio: `Completa la primera página de «${t}»`,
    pasion: `Lee la información de «${t}» con tu bebida favorita al lado`,
    interes: `Busca en el móvil un dato curioso sobre «${t}»`,
    urgencia: `Escribe en tu libreta el primer paso de «${t}»`,
  },
})

/* Retos con lo que encontró la búsqueda web (api/micro_paso.py): el objeto concreto
   («la app de test autoescuela») sustituye al texto de la tarea, y el micro-paso de la web
   es la carta Urgencia de su nivel. */
export type DatosWeb = { microPaso: string; objeto: string; tipo: 'digital' | 'fisico'; nivel: Nivel; fiable?: boolean; categoria?: string }

export function accionesWeb(w: DatosWeb): Acciones {
  const o = w.objeto
  const base: Acciones =
    w.tipo === 'digital'
      ? {
          pesado: { novedad: `Abre ${o} con la pantalla en modo oscuro`, desafio: `Mira 2 pantallas de ${o}`, pasion: `Abre ${o} con tu canción favorita sonando`, interes: `Mira el menú de ${o}`, urgencia: `Abre ${o}` },
          medio: { novedad: `Entra en ${o} desde el ordenador`, desafio: `Pulsa el primer botón de ${o}`, pasion: `Entra en ${o} con tu bebida favorita al lado`, interes: `Lee el título de ${o}`, urgencia: `Entra en ${o}` },
          ligero: { novedad: `Lee la primera pantalla de ${o} desde el ordenador`, desafio: `Rellena la primera casilla de ${o}`, pasion: `Lee la primera pantalla de ${o} con tu música favorita de fondo`, interes: `Apunta en tu libreta lo que pide ${o}`, urgencia: `Lee la primera pantalla de ${o}` },
        }
      : {
          pesado: { novedad: `Mira ${o} desde otro sitio de la habitación`, desafio: `Toca ${o} 2 veces`, pasion: `Toca ${o} con tu canción favorita sonando`, interes: `Señala ${o} a una persona de casa`, urgencia: `Toca ${o}` },
          medio: { novedad: `Pon ${o} en un sitio distinto de la mesa`, desafio: `Pon ${o} junto a 2 cosas que vas a usar`, pasion: `Coge ${o} con tu música favorita de fondo`, interes: `Enséñale ${o} a una persona de casa`, urgencia: `Coge ${o}` },
          ligero: { novedad: `Usa ${o} empezando por el lado contrario`, desafio: `Usa ${o} 3 veces`, pasion: `Usa ${o} con tu música favorita de fondo`, interes: `Usa ${o} con una persona de casa cerca`, urgencia: `Usa ${o} una vez` },
        }
  const propia = w.microPaso.replace(/^Solo /, '').replace(/[.]$/, '')
  return { ...base, [w.nivel]: { ...base[w.nivel], urgencia: propia.charAt(0).toUpperCase() + propia.slice(1) } }
}

/* ── 4. Cómo se dice cada reto ───────────────────────────────────
   Investigación (docs/comunicacion.md): Goblin Tools, Tiimo, Finch y guías de inicio de tareas.
   - La carta dice SOLO la acción, en una frase y con un objeto concreto. Sin entradillas.
   - Pesado empieza por «Solo…». Urgencia lleva un plazo corto y concreto (PLAZO).
   - «Está hecho cuando…» sale de la propia acción («Abre la app» → «has abierto la app»).
   - Una frase de permiso por nivel (PERMISO) baja la exigencia sin juzgar. */

const minuscula = (s: string) => s.charAt(0).toLowerCase() + s.slice(1)
const mayuscula = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
const sinPunto = (s: string) => s.trim().replace(/[.!?]+$/, '')

/** Participio de cada verbo de acción, para escribir el criterio de éxito («has abierto…»).
    `pron`: pronombre que va delante («te has puesto», «le has escrito»). */
export const PARTICIPIOS: Record<string, { part: string; pron?: string }> = {
  abre: { part: 'abierto' }, añade: { part: 'añadido' }, afina: { part: 'afinado' }, aguanta: { part: 'aguantado' }, consigue: { part: 'conseguido' }, archiva: { part: 'archivado' }, comparte: { part: 'compartido' }, pela: { part: 'pelado' }, activa: { part: 'activado' }, silencia: { part: 'silenciado' }, sirve: { part: 'servido' }, echa: { part: 'echado' }, tómate: { part: 'tomado', pron: 'te' },
  cuenta: { part: 'contado' }, dicta: { part: 'dictado' }, estudia: { part: 'estudiado' }, huele: { part: 'olido' },
  muévete: { part: 'movido', pron: 'te' }, queda: { part: 'quedado' }, separa: { part: 'separado' }, apaga: { part: 'apagado' },
  aprende: { part: 'aprendido' }, apunta: { part: 'apuntado' }, arrastra: { part: 'arrastrado' }, asómate: { part: 'asomado', pron: 'te' },
  baila: { part: 'bailado' }, baja: { part: 'bajado' }, bebe: { part: 'bebido' }, busca: { part: 'buscado' },
  calienta: { part: 'calentado' }, camina: { part: 'caminado' }, cambia: { part: 'cambiado' },
  carga: { part: 'cargado' }, cepilla: { part: 'cepillado' }, cierra: { part: 'cerrado' }, cocina: { part: 'cocinado' },
  coge: { part: 'cogido' }, come: { part: 'comido' }, completa: { part: 'completado' }, compra: { part: 'comprado' },
  confirma: { part: 'confirmado' }, contesta: { part: 'contestado' }, copia: { part: 'copiado' }, corre: { part: 'corrido' },
  corta: { part: 'cortado' }, crea: { part: 'creado' }, da: { part: 'dado' }, deja: { part: 'dejado' },
  dibuja: { part: 'dibujado' }, dobla: { part: 'doblado' }, dúchate: { part: 'duchado', pron: 'te' }, enciende: { part: 'encendido' },
  enseña: { part: 'enseñado' }, enséñale: { part: 'enseñado', pron: 'le' }, entra: { part: 'entrado' }, entrena: { part: 'entrenado' },
  envía: { part: 'enviado' }, escala: { part: 'escalado' }, escribe: { part: 'escrito' }, escucha: { part: 'escuchado' },
  estira: { part: 'estirado' }, explica: { part: 'explicado' }, extiende: { part: 'extendido' }, fotografía: { part: 'fotografiado' },
  graba: { part: 'grabado' }, guarda: { part: 'guardado' }, habla: { part: 'hablado' }, infla: { part: 'inflado' },
  intenta: { part: 'intentado' }, juega: { part: 'jugado' }, lanza: { part: 'lanzado' }, lava: { part: 'lavado' },
  lávate: { part: 'lavado', pron: 'te' }, lee: { part: 'leído' }, limpia: { part: 'limpiado' }, llama: { part: 'llamado' },
  llena: { part: 'llenado' }, lleva: { part: 'llevado' }, marca: { part: 'marcado' }, medita: { part: 'meditado' },
  mete: { part: 'metido' }, métete: { part: 'metido', pron: 'te' }, mira: { part: 'mirado' }, mírate: { part: 'mirado', pron: 'te' },
  mueve: { part: 'movido' }, nada: { part: 'nadado' }, ordena: { part: 'ordenado' }, pasa: { part: 'pasado' },
  pasea: { part: 'paseado' }, pedalea: { part: 'pedaleado' }, pesa: { part: 'pesado' }, pide: { part: 'pedido' },
  pon: { part: 'puesto' }, ponle: { part: 'puesto', pron: 'le' }, ponte: { part: 'puesto', pron: 'te' }, pregunta: { part: 'preguntado' },
  pregúntale: { part: 'preguntado', pron: 'le' }, prepara: { part: 'preparado' }, propón: { part: 'propuesto' }, prueba: { part: 'probado' },
  pulsa: { part: 'pulsado' }, quita: { part: 'quitado' }, recoge: { part: 'recogido' }, rellena: { part: 'rellenado' },
  repasa: { part: 'repasado' }, repite: { part: 'repetido' }, reserva: { part: 'reservado' }, respira: { part: 'respirado' },
  responde: { part: 'respondido' }, riega: { part: 'regado' }, saca: { part: 'sacado' }, sal: { part: 'salido' },
  señala: { part: 'señalado' }, siéntate: { part: 'sentado', pron: 'te' }, sigue: { part: 'seguido' }, sube: { part: 'subido' },
  subraya: { part: 'subrayado' }, supera: { part: 'superado' }, tápate: { part: 'tapado', pron: 'te' }, termina: { part: 'terminado' },
  tiende: { part: 'tendido' }, tira: { part: 'tirado' }, toca: { part: 'tocado' }, túmbate: { part: 'tumbado', pron: 'te' },
  usa: { part: 'usado' }, vacía: { part: 'vaciado' }, ve: { part: 'ido' }, vístete: { part: 'vestido', pron: 'te' },
}

/** «Abre la app del test» → «has abierto la app del test»; «Ponte los zapatos» → «te has puesto los zapatos». */
export function hechoDe(accion: string): string {
  const [verbo, ...resto] = sinPunto(accion).replace(/^Solo /i, '').split(' ')
  const p = PARTICIPIOS[verbo.toLowerCase()]
  if (!p) return 'lo has conseguido una vez'
  return `${p.pron ? `${p.pron} ` : ''}has ${p.part}${resto.length ? ` ${resto.join(' ')}` : ''}`
}

/** Texto de la carta: la acción sola, con «Solo…» en Pesado y el plazo en Urgencia. */
export function fraseReto(accion: string, nivel: Nivel, tipo: TipoReto): string {
  let A = sinPunto(accion)
  if (tipo === 'urgencia') A = `${A} ${PLAZO[nivel]}`
  return nivel === 'pesado' ? `Solo ${minuscula(A)}` : mayuscula(A)
}

/* ── 5. Lógica de ejecución ─────────────────────────────────── */

const normalizar = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9ñ\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const contiene = (texto: string, palabra: string) => ` ${texto} `.includes(` ${palabra}`)

export type Resultado = {
  regla: Regla | null
  categoria: string
  icono: Categoria | null
  /** Acciones de la categoría por nivel (o el respaldo con el texto de la tarea) */
  acciones: Acciones
}

/* Palabras que salen en más de una regla («escuchar», «dibujar», «leer»…): cuentan la mitad,
   porque por sí solas no dicen de qué tarea se trata. */
const COMPARTIDAS = (() => {
  const reglasPorPalabra = new Map<string, Set<number>>()
  REGLAS.forEach((regla, i) =>
    regla.palabras.forEach((p) =>
      normalizar(p)
        .split(' ')
        .forEach((palabra) => reglasPorPalabra.set(palabra, (reglasPorPalabra.get(palabra) ?? new Set()).add(i))),
    ),
  )
  return new Set([...reglasPorPalabra].filter(([, reglas]) => reglas.size > 1).map(([palabra]) => palabra))
})()

/** Busca la regla más específica: la que suma más letras de palabras clave encontradas
    («dibujar un boceto» → Dibujo, porque coincide con «dibujar» y «boceto»).
    Si empatan, gana la que va antes en la lista. */
export function analizarTarea(tarea: string): Resultado {
  const texto = normalizar(tarea)
  let mejor: { regla: Regla; largo: number } | null = null
  for (const regla of REGLAS) {
    const largo = regla.palabras
      .map(normalizar)
      .filter((clave) => clave && contiene(texto, clave))
      .reduce((suma, clave) => suma + (COMPARTIDAS.has(clave) ? clave.length / 2 : clave.length), 0)
    if (largo > 0 && (!mejor || largo > mejor.largo)) mejor = { regla, largo }
  }
  if (mejor) {
    const { regla } = mejor
    return { regla, categoria: regla.categoria, icono: regla.icono, acciones: BANCO[regla.categoria] }
  }
  return { regla: null, categoria: 'Tarea', icono: null, acciones: RESPALDO(minuscula(objetoDe(tarea)) || 'esto') }
}

/* ── 6. Los retos de una tarea y sus mazos ─────────────────────
   Una carta por factor INCUP, escrita a mano para la categoría y el nivel (banco.ts),
   mezclada con MÉTODOS sacados de webs de consejos para TDAH (metodos.ts):
   - Mazo 1 (nivel elegido): Novedad y Desafío son métodos («Por categorías», «Búsqueda
     del tesoro»…); Pasión, Interés y Urgencia, retos del banco.
   - Mazo 2 (nivel elegido): al revés, para que se vean todos.
   - Después, siempre igual o más fácil (ley del esfuerzo inverso): los niveles más ligeros
     y, al final, retos genéricos con el nombre de la tarea.
   Las actividades sin métodos (ocio, hobbies) se quedan con un mazo por nivel. */

export type RetoCarta = {
  tipo: TipoReto
  titulo: string
  pasos: string[]
  hecho: string
  permiso: string
  /** Si el reto es un método para TDAH: su nombre y la web de la que sale */
  metodo?: { nombre: string; fuente: Fuente }
}

export const ORDEN: TipoReto[] = ['novedad', 'desafio', 'pasion', 'interes', 'urgencia']

type FuenteMazo = { nivel: Nivel; generico?: boolean; metodos?: TipoReto[] }

const METODOS_MAZO_1: TipoReto[] = ['novedad', 'desafio']
const METODOS_MAZO_2: TipoReto[] = ['pasion', 'interes', 'urgencia']

export function mazosDe(esfuerzo: Nivel, conCategoria: boolean, conMetodos = false): FuenteMazo[] {
  const elegido: FuenteMazo[] = conMetodos
    ? [
        { nivel: esfuerzo, metodos: METODOS_MAZO_1 },
        { nivel: esfuerzo, metodos: METODOS_MAZO_2 },
      ]
    : [{ nivel: esfuerzo }]
  // Sin mazos genéricos con el nombre de la tarea: siempre retos de su categoría o sus métodos.
  // Con el aviso cada 9 rechazos los mazos vuelven a empezar, así que no hacen falta más.
  void conCategoria
  if (esfuerzo === 'pesado') return elegido
  if (esfuerzo === 'medio') return [...elegido, { nivel: 'pesado' }]
  return [...elegido, { nivel: 'medio' }, { nivel: 'pesado' }]
}

/** Categoría de la tarea: por sus palabras o, si no, por lo que encontró la búsqueda web */
export function categoriaDe(tarea: string, web?: DatosWeb): string | undefined {
  return analizarTarea(tarea).regla?.categoria ?? (web?.categoria && BANCO[web.categoria] ? web.categoria : undefined)
}

/** Cataloga la tarea con lo que encontró la búsqueda (títulos y resúmenes de las webs) */
export function catalogarConWeb(tarea: string, resumen: string): { categoria: string; icono: Categoria } | undefined {
  const propia = analizarTarea(tarea)
  if (propia.regla) return { categoria: propia.regla.categoria, icono: propia.regla.icono }
  const conWeb = analizarTarea(`${tarea} ${resumen}`)
  return conWeb.regla ? { categoria: conWeb.regla.categoria, icono: conWeb.regla.icono } : undefined
}

export function actividadDe(tarea: string, esfuerzo: Nivel = 'medio', web?: DatosWeb): Actividad | undefined {
  const categoria = categoriaDe(tarea, web)
  if (categoria) return ACTIVIDAD_DE_CATEGORIA[categoria]
  return ACTIVIDAD_DE_SITUACION[leerSituacion(tarea, esfuerzo).id]
}

function mazosDeTarea(tarea: string, esfuerzo: Nivel, web?: DatosWeb) {
  const conCategoria = Boolean(categoriaDe(tarea, web)) || Boolean(web?.fiable)
  return mazosDe(esfuerzo, conCategoria, Boolean(actividadDe(tarea, esfuerzo, web)))
}

/** Número de mazos distintos que tiene una tarea (depende del esfuerzo, de la categoría y de si tiene métodos). */
export function numMazos(tarea: string, esfuerzo: Nivel = 'medio', web?: DatosWeb): number {
  return mazosDeTarea(tarea, esfuerzo, web).length
}

export function retosDe(tarea: string, esfuerzo: Nivel = 'medio', mazo = 0, web?: DatosWeb): RetoCarta[] {
  const analisis = analizarTarea(tarea)
  const categoria = categoriaDe(tarea, web)
  // 1) categoría por sus palabras; 2) categoría por lo que encontró la web; 3) herramienta concreta de la web; 4) respaldo
  const propias = analisis.regla
    ? analisis.acciones
    : categoria
      ? BANCO[categoria]
      : web?.fiable
        ? accionesWeb(web)
        : analisis.acciones
  const mazos = mazosDeTarea(tarea, esfuerzo, web)
  const fuente = mazos[mazo % mazos.length]
  const acciones = fuente.generico ? RESPALDO(minuscula(objetoDe(tarea)) || 'esto') : propias
  const actividad = actividadDe(tarea, esfuerzo, web)
  return ORDEN.map((tipo) => {
    const metodo = actividad && fuente.metodos?.includes(tipo) ? METODOS[actividad][tipo] : undefined
    const accion = metodo ? metodo.retos[fuente.nivel] : acciones[fuente.nivel][tipo]
    const frase = fraseReto(accion, fuente.nivel, tipo)
    return {
      tipo,
      titulo: `${frase}.`,
      pasos: [frase],
      hecho: hechoDe(accion),
      permiso: PERMISO[fuente.nivel],
      ...(metodo && { metodo: { nombre: metodo.nombre, fuente: metodo.fuente } }),
    }
  })
}
