/* ─────────────────────────────────────────────────────────────
   Banco de retos escritos a mano: categoría × nivel de esfuerzo × carta INCUP.

   Cómo se escribe cada reto (investigación: Goblin Tools, Tiimo, Finch, guías de
   inicio de tareas con TDAH y de comunicación para personas autistas; ver docs/comunicacion.md):
   - La carta dice SOLO la acción: una frase, verbo físico primero, objeto concreto.
     Sin entradillas («¡Plan nuevo!») ni coletillas pegadas con coma.
   - El tipo de carta cambia la ACCIÓN, no le añade una coletilla:
       Novedad  → otro sitio, otro orden u otra herramienta, sin dar por hecho lo que hay en casa
                  (nada de «otra puerta», «otra mesa» o «una pajita»).
       Desafío  → una meta pequeña que se puede contar («3 prendas»). Nunca «a la primera»
                  con algo que ya es fácil: eso no es un reto.
       Pasión   → junto a algo que te gusta.
       Interés  → con una persona o con un dato curioso.
       Urgencia → la acción más directa; la app le añade un plazo corto (PLAZO).
   - Nivel (ley del esfuerzo inverso):
       Pesado → contacto mínimo; la app añade «Solo…». Se puede hacer sin levantarse de la cama.
       Medio  → el primer movimiento físico.
       Ligero → un trozo pequeño con final claro.
   - Una sola acción (sin «y» ni «o»), sin «hacer», sin la palabra «tarea», sin juicios
     y sin género gramatical para la persona.
   Lo comprueba scripts/validar-retos.mts.
   ───────────────────────────────────────────────────────────── */

import type { TipoReto } from '../components/CartaReto/tipos'

export type Nivel = 'ligero' | 'medio' | 'pesado'
export type Cartas = Record<TipoReto, string>
export type Acciones = Record<Nivel, Cartas>

/** Orden de los argumentos: Novedad, Desafío, Pasión, Interés, Urgencia */
const c = (novedad: string, desafio: string, pasion: string, interes: string, urgencia: string): Cartas => ({
  novedad,
  desafio,
  pasion,
  interes,
  urgencia,
})
const a = (pesado: Cartas, medio: Cartas, ligero: Cartas): Acciones => ({ pesado, medio, ligero })

export const BANCO: Record<string, Acciones> = {
  // ── Trabajo, administración y estudio ──
  Comunicación: a(
    c('Abre el correo en el móvil en vez del ordenador', 'Lee el correo entero sin saltar a otro', 'Abre el correo con tu canción favorita sonando', 'Mira quién te ha escrito el correo', 'Abre la app de correo'),
    c('Escribe el saludo del correo desde el móvil', 'Escribe un saludo de 5 palabras', 'Escribe el saludo con tu bebida favorita al lado', 'Copia en un pósit la pregunta del correo', 'Pulsa «Responder» en el correo'),
    c('Escribe la respuesta en una nota del móvil', 'Escribe la respuesta en 3 frases', 'Escribe la respuesta con tu música favorita de fondo', 'Lee el correo en voz alta a una persona de confianza', 'Escribe la primera frase de la respuesta'),
  ),
  Administrativo: a(
    c('Abre el documento en el móvil en vez del ordenador', 'Lee el título del documento', 'Abre el documento con tu canción favorita sonando', 'Mira la fecha límite del documento', 'Abre la web del trámite'),
    c('Lee los papeles del trámite en voz alta', 'Saca 3 papeles de la carpeta', 'Saca tu DNI con tu bebida favorita al lado', 'Envía una foto del papel a una persona de confianza', 'Escribe tu nombre en la primera casilla'),
    c('Rellena el formulario empezando por la última casilla', 'Rellena 5 casillas del formulario', 'Rellena el formulario con tu música favorita de fondo', 'Rellena el formulario con una persona de confianza al lado', 'Rellena la primera sección del formulario'),
  ),
  Académico: a(
    c('Abre los apuntes por la última página', 'Lee el título del tema', 'Abre el libro con tu bebida favorita al lado', 'Busca la palabra más rara del índice', 'Abre el libro por la página del tema'),
    c('Lee la primera línea del tema en voz alta', 'Subraya 3 palabras del primer párrafo', 'Lee la primera línea con tu música tranquila de fondo', 'Envía a alguien de clase el título del tema', 'Escribe el título del tema en una hoja'),
    c('Lee el primer párrafo empezando por la última frase', 'Escribe 3 palabras clave del primer párrafo', 'Lee el primer párrafo con tu bebida favorita al lado', 'Explica el primer párrafo a una persona de casa', 'Copia la primera definición del tema en una hoja'),
  ),
  Llamadas: a(
    c('Busca el número en el historial de llamadas', 'Apunta el número en un pósit', 'Coge el móvil con tu canción favorita sonando', 'Mira el horario de atención en su web', 'Coge el móvil'),
    c('Marca el número con el altavoz puesto', 'Marca el número sin pulsar llamar', 'Marca el número con tu bebida favorita al lado', 'Escribe en un pósit tu pregunta para la llamada', 'Abre la web de citas de ese sitio'),
    c('Pide la cita por la web en vez de llamar', 'Escribe 3 preguntas para la llamada', 'Pulsa el botón de llamar con tu bebida favorita al lado', 'Pulsa el botón de llamar con una persona de confianza al lado', 'Pulsa el botón de llamar'),
  ),
  Decisión: a(
    c('Abre una nota nueva en el móvil', 'Escribe una palabra sobre la decisión', 'Coge tu boli favorito', 'Escribe a una persona de confianza «Tengo que decidir»', 'Coge un papel'),
    c('Escribe las opciones en un pósit', 'Escribe 2 opciones en el papel', 'Escribe las opciones con tu boli favorito', 'Envía las opciones a una persona de confianza', 'Escribe arriba del papel lo que tienes que decidir'),
    c('Dibuja las opciones en 2 columnas', 'Escribe 3 ventajas de la primera opción', 'Escribe las opciones con tu música favorita de fondo', 'Pregunta a una persona de confianza qué opción ve mejor', 'Lanza una moneda entre las 2 opciones'),
  ),
  Creativo: a(
    c('Abre el proyecto en el móvil en vez del ordenador', 'Mira la última página del proyecto', 'Abre el proyecto con tu canción favorita sonando', 'Mira una imagen que te inspire', 'Abre el documento del proyecto'),
    c('Escribe una palabra en una hoja suelta', 'Escribe 3 palabras sobre el proyecto', 'Escribe el título con tu bebida favorita al lado', 'Envía a una persona de confianza una idea del proyecto', 'Escribe el título del proyecto'),
    c('Dibuja un boceto en una hoja de otro color', 'Escribe 3 ideas en una lista', 'Escribe una frase con tu música favorita de fondo', 'Enseña el boceto a una persona de confianza', 'Escribe una frase en el documento'),
  ),
  Digital: a(
    c('Abre la carpeta desde el móvil', 'Arrastra 1 archivo repetido a la papelera', 'Abre la carpeta con tu canción favorita sonando', 'Mira el archivo más antiguo de la carpeta', 'Abre la carpeta'),
    c('Ordena la carpeta por fecha', 'Arrastra 3 archivos a la papelera', 'Cambia el nombre de un archivo con tu música favorita de fondo', 'Busca el archivo más pesado de la carpeta', 'Abre el primer archivo de la carpeta'),
    c('Crea una carpeta nueva con un nombre claro', 'Mueve 5 archivos a su carpeta', 'Mueve archivos con tu música favorita de fondo', 'Enseña la carpeta ordenada a una persona de casa', 'Vacía la papelera del ordenador'),
  ),
  Test: a(
    c('Abre la app del test en modo oscuro', 'Lee la primera pregunta del test', 'Abre la app del test con tu canción favorita sonando', 'Mira cuántos tests llevas en la app', 'Abre la app del test'),
    c('Contesta la última pregunta del test', 'Contesta 3 preguntas del test', 'Contesta una pregunta con tu bebida favorita al lado', 'Envía a una persona de confianza una pregunta difícil del test', 'Contesta la primera pregunta del test'),
    c('Contesta un test empezando por el final', 'Contesta 10 preguntas del test', 'Contesta un test con tu música favorita de fondo', 'Repasa con una persona de confianza las preguntas falladas', 'Contesta un test completo en la app'),
  ),

  // ── Hogar y vida cotidiana ──
  Doméstico: a(
    c('Coge una bolsa para ir metiendo la basura', 'Tira un papel a la papelera', 'Pon tu canción favorita en el móvil', 'Busca el objeto que más tiempo lleva fuera de su sitio', 'Coge un trapo'),
    c('Recoge la mesa por colores', 'Recoge 5 cosas de la mesa', 'Recoge la mesa con tu música favorita de fondo', 'Recoge la mesa con una persona de casa', 'Recoge una cosa del suelo'),
    c('Recoge la habitación de arriba abajo', 'Recoge 10 cosas de la habitación', 'Pasa el trapo con tu música favorita de fondo', 'Pasa el trapo con una persona de casa', 'Pasa el trapo por la mesa entera'),
  ),
  Compra: a(
    c('Abre la app del súper en vez de la lista de papel', 'Escribe en la lista 2 cosas que faltan', 'Abre la nota de la compra con tu canción favorita sonando', 'Mira qué falta en la despensa', 'Abre la nota de la compra'),
    c('Escribe la lista empezando por la despensa', 'Escribe 3 productos en la lista', 'Escribe la lista con tu bebida favorita al lado', 'Pregunta a una persona de casa qué falta', 'Escribe en la lista el producto que más falta'),
    c('Pide la compra por la web del súper', 'Escribe una lista con 10 productos', 'Sal a la tienda con tu música favorita en los auriculares', 'Sal a la tienda con una persona de casa', 'Coge las bolsas de la compra'),
  ),
  Café: a(
    c('Coge una taza distinta a la de siempre', 'Busca en el móvil una receta de café en 3 pasos', 'Coge tu taza favorita', 'Pregunta a una persona de casa si quiere café', 'Coge la cafetera'),
    c('Busca en el móvil otra forma de preparar café', 'Prepara el café sin mirar el móvil', 'Prepara el café bailando tu canción favorita', 'Prepara un café para una persona de casa', 'Llena de agua la cafetera'),
    c('Prepara el café con un método que nunca has probado', 'Prepara el café sin derramar ni una gota', 'Tómate el café en tu sitio favorito de la casa', 'Tómate el café con una persona de casa', 'Pon la cafetera al fuego'),
  ),
  Cocina: a(
    c('Abre una receta nueva en el móvil', 'Mira 3 ingredientes de la nevera', 'Pon tu canción favorita en la cocina', 'Busca en el móvil una receta con lo que tienes', 'Abre la nevera'),
    c('Prepara los ingredientes en cuencos antes de cocinar', 'Saca 3 ingredientes de la nevera', 'Saca los ingredientes con tu música favorita de fondo', 'Pide ayuda a una persona de casa para picar', 'Pon una olla con agua al fuego'),
    c('Cocina una receta que no has probado', 'Corta 3 verduras', 'Cocina con tu música favorita de fondo', 'Cocina con una persona de casa', 'Prepara un plato sencillo'),
  ),
  Ropa: a(
    c('Separa una prenda oscura del cesto', 'Coge una prenda del suelo', 'Pon tu canción favorita en el móvil', 'Busca la prenda que más te gusta del cesto', 'Toca el cesto de la ropa'),
    c('Separa la ropa del cesto por colores', 'Mete 5 prendas en la lavadora', 'Dobla una camiseta con tu música favorita de fondo', 'Dobla la ropa con una persona de casa', 'Abre la puerta de la lavadora'),
    c('Dobla la ropa en rollo para el cajón', 'Tiende 10 prendas', 'Tiende la ropa con tu música favorita de fondo', 'Tiende la ropa con una persona de casa', 'Pon una lavadora'),
  ),

  // ── Ocio y entretenimiento ──
  'Ver serie': a(
    c('Busca la serie por su nombre en el buscador', 'Lee la sinopsis de 2 capítulos', 'Coge una manta para el sofá', 'Mira el tráiler del siguiente capítulo', 'Coge el mando'),
    c('Siéntate en un sitio distinto del sofá', 'Pon el capítulo sin mirar el móvil', 'Pon un cuenco de picoteo junto al sofá', 'Escribe a una persona de confianza para ver el capítulo a la vez', 'Pon el capítulo'),
    c('Mira el capítulo con la luz apagada', 'Mira un capítulo entero sin mirar el móvil', 'Mira el capítulo con tu manta favorita', 'Mira el capítulo con una persona de casa', 'Pon el siguiente capítulo'),
  ),
  'Ver película': a(
    c('Abre una plataforma que no sueles usar', 'Mira 3 carátulas de películas', 'Coge una manta para el sofá', 'Mira el tráiler de una película', 'Coge el mando'),
    c('Busca una película de otro país', 'Pon la primera película de tu lista', 'Mete las palomitas en el microondas', 'Pregunta a una persona de casa qué película le apetece', 'Pon la película'),
    c('Mira la película con la luz apagada', 'Mira la película entera sin mirar el móvil', 'Mira la película con tu manta favorita', 'Mira la película con una persona de casa', 'Pulsa play en la película'),
  ),
  Lectura: a(
    c('Abre el libro por una página al azar', 'Lee el título del capítulo', 'Coge el libro con tu bebida favorita al lado', 'Lee la última frase del capítulo', 'Coge el libro'),
    c('Lee una página en voz alta', 'Lee 2 páginas del libro', 'Lee una página con tu bebida favorita al lado', 'Lee una frase bonita a una persona de casa', 'Abre el libro por el marcapáginas'),
    c('Lee en un sitio de la casa distinto al de siempre', 'Lee 10 páginas del libro', 'Lee con tu manta favorita encima', 'Envía tu frase favorita del capítulo a una persona de confianza', 'Lee hasta el final del capítulo'),
  ),
  Videojuego: a(
    c('Enciende la consola desde el mando', 'Mira 2 logros que te faltan', 'Pon la banda sonora del juego', 'Mira el último logro que conseguiste', 'Coge el mando'),
    c('Prueba un modo de juego nuevo', 'Consigue 2 objetos en la partida', 'Juega con tu bebida favorita al lado', 'Juega una partida con una persona de casa', 'Carga tu última partida'),
    c('Juega con otro personaje', 'Supera 3 niveles', 'Juega con tu manta favorita encima', 'Juega en línea con una persona de confianza', 'Juega una partida entera'),
  ),
  Música: a(
    c('Abre una lista de música que no sueles escuchar', 'Pulsa el botón de play', 'Coge tus auriculares favoritos', 'Mira qué canción es la más escuchada esta semana', 'Coge los auriculares'),
    c('Pon un disco antiguo que tenías olvidado', 'Guarda 3 canciones en una lista nueva', 'Pon tu canción favorita a todo volumen', 'Envía una canción a una persona de confianza', 'Pon una canción'),
    c('Escucha un disco entero de un artista nuevo', 'Guarda 10 canciones en una lista nueva', 'Escucha tu disco favorito entero', 'Escucha un disco con una persona de casa', 'Escucha un disco entero'),
  ),
  Podcast: a(
    c('Busca un podcast nuevo del mismo tema', 'Lee el título del episodio', 'Coge tus auriculares favoritos', 'Lee la descripción del episodio', 'Ponte los auriculares'),
    c('Pon el episodio a otra velocidad', 'Escucha la presentación del episodio', 'Pon el episodio con tu bebida favorita al lado', 'Envía el episodio a una persona de confianza', 'Pulsa play en el episodio'),
    c('Escucha el episodio paseando por la calle', 'Apunta 3 ideas del episodio', 'Escucha el episodio con tu manta favorita encima', 'Escucha el episodio con una persona de casa', 'Escucha un episodio entero'),
  ),
  Vídeo: a(
    c('Activa los subtítulos del vídeo', 'Lee el título del vídeo', 'Coge tus auriculares favoritos', 'Lee los comentarios del vídeo', 'Coge el móvil'),
    c('Pon el vídeo a pantalla completa', 'Mira 2 vídeos cortos del mismo tema', 'Pon el vídeo con tu bebida favorita al lado', 'Envía el vídeo a una persona de confianza', 'Pulsa play en el vídeo'),
    c('Copia en tu libreta el primer paso que enseña el vídeo', 'Apunta 3 cosas que enseña el vídeo', 'Mira el vídeo con tu manta favorita encima', 'Mira el vídeo con una persona de casa', 'Mira el vídeo entero'),
  ),

  // ── Deporte y movimiento ──
  Gimnasio: a(
    c('Busca una clase del gimnasio que no has probado', 'Estira los brazos 10 veces', 'Pon tu canción de entrenar favorita', 'Mira el horario de clases del gimnasio', 'Ponte una zapatilla'),
    c('Prueba en casa un ejercicio nuevo de un vídeo', 'Baja 5 veces en sentadilla junto a una silla', 'Ponte tu ropa de deporte favorita', 'Escribe a una persona de confianza que vas al gimnasio', 'Llena la botella de agua'),
    c('Prueba una máquina que no has usado', 'Completa 3 ejercicios de tu rutina', 'Entrena con tu música favorita en los auriculares', 'Entrena con una persona de confianza', 'Sal hacia el gimnasio'),
  ),
  Correr: a(
    c('Mira una ruta nueva en el mapa', 'Estira cada pierna 5 veces', 'Pon tu canción de correr favorita', 'Mira cuántos kilómetros corriste la última vez', 'Ponte una zapatilla'),
    c('Busca en el mapa una ruta nueva para hoy', 'Da 20 saltos en el sitio', 'Ponte tu ropa de correr favorita', 'Escribe a una persona de confianza que sales a correr', 'Ponte las zapatillas'),
    c('Corre por una calle nueva', 'Corre hasta la tercera esquina', 'Corre con tu música favorita en los auriculares', 'Corre con una persona de confianza', 'Sal a correr por tu ruta de siempre'),
  ),
  Caminar: a(
    c('Mira en el mapa una calle que no conoces', 'Estira cada pierna 5 veces', 'Pon tu canción favorita', 'Busca en el mapa un parque cercano', 'Ponte un zapato'),
    c('Sal hacia el lado contrario de la calle', 'Camina hasta la puerta de la calle', 'Ponte tus zapatillas favoritas', 'Escribe a una persona de confianza para pasear contigo', 'Ponte los zapatos'),
    c('Camina por una calle nueva', 'Da una vuelta a 2 manzanas', 'Camina con tu música favorita en los auriculares', 'Camina con una persona de confianza', 'Da una vuelta a la manzana'),
  ),
  Yoga: a(
    c('Estira los brazos en la cama', 'Respira hondo 3 veces', 'Pon tu música tranquila favorita', 'Busca el nombre de una postura nueva', 'Coge la esterilla'),
    c('Extiende la esterilla en otra habitación', 'Aguanta 3 respiraciones en la postura del niño', 'Ponte en la esterilla con tu música tranquila favorita', 'Ponte en la esterilla con una persona de casa', 'Extiende la esterilla'),
    c('Sigue un vídeo de yoga nuevo', 'Sigue 3 posturas del vídeo de yoga', 'Sigue una clase con tu música tranquila favorita', 'Sigue una clase con una persona de casa', 'Sigue una clase de yoga en vídeo'),
  ),
  Bici: a(
    c('Mira una ruta nueva en el mapa', 'Lee 2 consejos de rutas en bici', 'Coge tus guantes favoritos', 'Mira cuántos kilómetros recorriste la última vez', 'Coge el casco'),
    c('Saca la bici con el casco ya puesto', 'Infla las 2 ruedas', 'Ponte tu ropa favorita para la bici', 'Escribe a una persona de confianza para salir en bici', 'Saca la bici a la calle'),
    c('Pedalea por una calle nueva', 'Pedalea hasta el tercer cruce', 'Pedalea con tu música favorita a bajo volumen', 'Pedalea con una persona de confianza', 'Da una vuelta a la manzana en bici'),
  ),
  Natación: a(
    c('Mira el horario de una piscina nueva', 'Lee 2 consejos de natación en el móvil', 'Coge tu toalla favorita', 'Mira cuántos largos nadaste la última vez', 'Coge el bañador'),
    c('Deja la mochila de nadar preparada junto a la puerta', 'Mete 3 cosas de nadar en la mochila', 'Mete tu toalla favorita en la mochila', 'Escribe a una persona de confianza para ir a nadar', 'Mete el bañador en la mochila'),
    c('Nada un largo en otro estilo', 'Nada 4 largos', 'Nada con tus gafas favoritas', 'Nada con una persona de confianza', 'Ve a la piscina'),
  ),
  Baile: a(
    c('Pon una canción de un estilo nuevo', 'Mueve los hombros 5 veces', 'Pon tu canción de bailar favorita', 'Busca un paso de baile nuevo en un vídeo', 'Pon una canción'),
    c('Baila el estribillo en otra habitación', 'Baila el estribillo entero', 'Baila tu canción favorita', 'Baila el estribillo con una persona de casa', 'Baila el estribillo de una canción'),
    c('Aprende un paso nuevo con un vídeo', 'Repite la coreografía 3 veces', 'Baila 3 canciones que te encanten', 'Baila con una persona de casa', 'Baila una canción entera'),
  ),
  Escalada: a(
    c('Mira el horario de un rocódromo nuevo', 'Estira los dedos de las manos 5 veces', 'Coge tu bolsa de magnesio favorita', 'Mira el vídeo de un bloque nuevo', 'Abre la mochila'),
    c('Busca en el móvil un rocódromo que no conoces', 'Mete 3 cosas de escalar en la mochila', 'Ponte tu ropa de escalar favorita', 'Escribe a una persona de confianza para ir a escalar', 'Mete los pies de gato en la mochila'),
    c('Intenta un bloque de otro color', 'Intenta el mismo bloque 3 veces', 'Sube tu bloque favorito', 'Escala con una persona de confianza', 'Sal hacia el rocódromo'),
  ),
  'Deporte en equipo': a(
    c('Busca un vídeo de una jugada nueva', 'Lee el último mensaje del chat del equipo', 'Coge tu camiseta del equipo favorita', 'Mira la clasificación de la liga', 'Coge la equipación'),
    c('Prepara la bolsa con una lista en el móvil', 'Mete 3 cosas del equipo en la bolsa', 'Ponte tu equipación favorita', 'Escribe en el chat del equipo que vas', 'Mete la equipación en la bolsa'),
    c('Juega en una posición distinta', 'Calienta 3 ejercicios con el equipo', 'Juega con tus botas favoritas', 'Calienta con una persona del equipo', 'Ve al entrenamiento'),
  ),

  // ── Vida social ──
  'Quedar con amigos': a(
    c('Busca la foto de vuestro último plan', 'Lee los 3 últimos mensajes del grupo', 'Abre el chat con tu canción favorita sonando', 'Mira la última foto que os hicisteis', 'Abre el chat del grupo'),
    c('Envía un audio al grupo en vez de un texto', 'Escribe «¿Quedamos esta semana?» en el chat', 'Envía una foto de un plan que te apetezca', 'Pregunta en el chat qué le apetece a cada persona', 'Envía «¿Quedamos?» al grupo'),
    c('Propón un plan que no habéis probado nunca', 'Envía un mensaje a 3 amistades', 'Propón un plan que te encante', 'Llama a una amistad para quedar', 'Escribe en el chat un día para quedar'),
  ),
  'Llamada social': a(
    c('Busca una foto que quieras enseñarle', 'Lee sus 3 últimos mensajes', 'Mira su foto de perfil favorita', 'Lee el último mensaje que te envió', 'Abre su chat'),
    c('Envía un audio en vez de un texto', 'Envía un mensaje de 3 palabras', 'Envía una canción que te recuerde a esa persona', 'Pregúntale qué tal le va', 'Envía «Hola» en su chat'),
    c('Llama con videollamada en vez de voz', 'Escribe un mensaje de 3 frases', 'Llama mientras paseas por tu sitio favorito', 'Llama para preguntar por su semana', 'Llama a esa persona'),
  ),
  Cumpleaños: a(
    c('Busca una foto antigua en la que salgáis', 'Escribe «Felicidades» en su chat sin enviarlo', 'Abre su chat con tu canción favorita sonando', 'Mira qué edad cumple', 'Abre su chat'),
    c('Envía un audio cantando «Cumpleaños feliz»', 'Envía «¡Felicidades!» con 3 emojis', 'Envía la foto en la que salís mejor', 'Pregúntale qué plan tiene para su cumpleaños', 'Envía «¡Felicidades!» en su chat'),
    c('Graba un vídeo corto de felicitación', 'Escribe una felicitación de 3 frases', 'Envía una canción que os guste', 'Llama para felicitar', 'Compra el regalo'),
  ),
  Fiesta: a(
    c('Busca en el armario una prenda para la fiesta', 'Lee la dirección de la fiesta', 'Abre el armario con tu canción favorita sonando', 'Mira quién más va a la fiesta', 'Abre la invitación'),
    c('Saca una prenda que no te pones nunca', 'Saca 3 opciones de ropa', 'Saca tu prenda favorita', 'Escribe a una persona de confianza para ir a la fiesta contigo', 'Confirma que vas'),
    c('Prueba un peinado distinto', 'Prepara 3 cosas para llevar', 'Vístete con tu ropa favorita', 'Sal hacia la fiesta con una persona de confianza', 'Vístete para la fiesta'),
  ),
  Familia: a(
    c('Busca una foto familiar para enviar', 'Lee el último mensaje del chat familiar', 'Busca tu foto familiar favorita', 'Mira la última foto que enviaron', 'Abre el chat de la familia'),
    c('Envía un audio en vez de un texto', 'Envía «¿Qué tal?» con 3 emojis', 'Envía tu foto familiar favorita', 'Pregunta cómo les ha ido la semana', 'Envía «¿Qué tal?» en el chat'),
    c('Propón una visita a un sitio nuevo', 'Escribe en el chat la fecha de la visita', 'Propón la comida favorita de la familia', 'Llama para preguntar por la familia', 'Llama para confirmar el plan'),
  ),
  Cita: a(
    c('Busca en el mapa un sitio nuevo para quedar', 'Lee su último mensaje', 'Abre su chat con tu canción favorita sonando', 'Mira su foto de perfil', 'Abre su chat'),
    c('Envía un audio en vez de un texto', 'Escribe 2 planes posibles en una nota', 'Envía una foto de tu sitio favorito', 'Pregúntale qué plan le apetece', 'Escribe «¿Te apetece quedar?»'),
    c('Propón un sitio que no conocéis', 'Envía la propuesta de un día para quedar', 'Propón tu sitio favorito', 'Llama para quedar', 'Reserva el sitio'),
  ),
  'Chat de grupo': a(
    c('Silencia los otros chats del móvil', 'Lee el último mensaje del chat', 'Abre el chat con tu canción favorita sonando', 'Mira las fotos del chat', 'Abre el chat del grupo'),
    c('Responde con un audio', 'Responde con un emoji', 'Envía una foto que te guste', 'Pregunta al grupo qué tal la semana', 'Responde a un mensaje'),
    c('Envía una foto de tu día', 'Responde a 3 mensajes', 'Envía una canción que te guste', 'Escribe una pregunta en el chat del grupo', 'Responde al mensaje más antiguo'),
  ),

  // ── Hobbies y creatividad ──
  Dibujo: a(
    c('Coge un rotulador en vez del lápiz', 'Dibuja 3 rayas en una hoja', 'Coge tu lápiz favorito', 'Mira un dibujo que te inspire', 'Abre el cuaderno'),
    c('Dibuja con un color que no usas', 'Dibuja 3 círculos', 'Dibuja tu objeto favorito', 'Dibuja la taza que tengas en la mesa', 'Dibuja una línea'),
    c('Dibuja la vista de tu ventana', 'Llena una página de garabatos', 'Dibuja en el cuaderno tu objeto favorito', 'Dibuja a una persona de casa', 'Dibuja en el cuaderno un boceto de tu idea'),
  ),
  Escritura: a(
    c('Abre una nota nueva en el móvil', 'Escribe 2 palabras en el móvil', 'Coge tu bolígrafo favorito', 'Lee la última frase que escribiste', 'Abre el cuaderno'),
    c('Escribe con un boli de otro color', 'Escribe 3 palabras', 'Escribe con tu bebida favorita al lado', 'Escribe una palabra que te guste', 'Escribe la fecha'),
    c('Escribe en una hoja suelta', 'Escribe un párrafo de 5 líneas', 'Escribe con tu música favorita de fondo', 'Escribe en el cuaderno una cosa que te ha pasado hoy', 'Escribe una frase'),
  ),
  Fotografía: a(
    c('Abre la cámara en modo monocromo', 'Mira 3 fotos de tu galería', 'Coge tu cámara favorita', 'Mira tu foto favorita de la galería', 'Abre la cámara del móvil'),
    c('Pulsa el disparador desde un ángulo nuevo', 'Saca 3 fotos de tu habitación', 'Fotografía tu objeto favorito', 'Fotografía con el móvil un objeto rojo de tu casa', 'Pulsa el disparador de la cámara'),
    c('Sal a la calle con la cámara colgada', 'Saca 10 fotos en la calle', 'Fotografía tu sitio favorito del barrio', 'Saca fotos con una persona de confianza', 'Saca 5 fotos con la cámara'),
  ),
  'Cocina creativa': a(
    c('Busca una receta de otro país', 'Lee los ingredientes de la receta', 'Abre tu libro de recetas favorito', 'Mira una foto de la receta', 'Abre el libro de recetas'),
    c('Saca los ingredientes empezando por las especias', 'Pesa 3 ingredientes', 'Ponte tu delantal favorito', 'Pide ayuda a una persona de casa para lavar los ingredientes', 'Saca los ingredientes de la receta'),
    c('Añade un ingrediente nuevo a la receta', 'Prepara la receta con 5 ingredientes', 'Prepara tu postre favorito', 'Cocina la receta con una persona de casa', 'Prepara la receta'),
  ),
  Manualidades: a(
    c('Busca en el móvil una idea nueva para la pieza', 'Mira 3 fotos de piezas que te gustan', 'Coge tu material favorito', 'Mira una foto de la pieza terminada', 'Abre la caja de material'),
    c('Pon el material en otro sitio de la casa', 'Corta 3 piezas', 'Corta la primera pieza con tu música favorita de fondo', 'Enseña el material a una persona de casa', 'Pon el material sobre la mesa'),
    c('Sigue un tutorial nuevo', 'Termina 3 filas de la pieza', 'Termina una fila con tu música favorita de fondo', 'Termina una fila con una persona de casa', 'Termina una fila de la pieza'),
  ),
  Instrumento: a(
    c('Escucha la canción en otra versión', 'Escucha 2 canciones que quieres tocar', 'Pon tu canción favorita para tocar', 'Escucha la canción que quieres aprender', 'Coge el instrumento'),
    c('Toca una nota que no usas nunca', 'Afina 3 cuerdas', 'Toca tu nota favorita', 'Toca una nota para una persona de casa', 'Toca una nota'),
    c('Toca la canción más despacio de lo normal', 'Toca la escala 3 veces', 'Toca tu canción favorita', 'Toca una canción para una persona de casa', 'Toca una canción'),
  ),
  Jardín: a(
    c('Busca en el móvil el nombre de una planta', 'Toca la tierra de una maceta', 'Coge tu regadera favorita', 'Busca una hoja nueva en una planta', 'Coge la regadera'),
    c('Riega las plantas empezando por la más pequeña', 'Quita 3 hojas secas', 'Riega una planta con tu música favorita de fondo', 'Riega una planta con una persona de casa', 'Llena la regadera'),
    c('Cambia una planta de sitio', 'Riega 5 plantas', 'Riega las plantas con tu música favorita de fondo', 'Riega las plantas con una persona de casa', 'Riega todas las plantas'),
  ),
  Meditación: a(
    c('Cierra los ojos en la cama', 'Respira hondo una vez', 'Pon tu música tranquila favorita', 'Escucha los sonidos de la habitación', 'Cierra los ojos'),
    c('Siéntate en otra habitación con la espalda recta', 'Respira hondo 5 veces', 'Respira con tu olor favorito cerca', 'Escucha una meditación guiada en el móvil', 'Siéntate con la espalda recta'),
    c('Escucha una meditación guiada nueva', 'Respira hondo 10 veces', 'Medita con tu música tranquila favorita', 'Medita con una persona de casa', 'Escucha una meditación guiada entera'),
  ),

  // ── Descanso y autocuidado ──
  Descanso: a(
    c('Deja el móvil en la mesilla boca abajo', 'Apaga la luz grande', 'Tápate con tu manta favorita', 'Escucha un sonido de lluvia en el móvil', 'Deja el móvil en la mesilla'),
    c('Pon el móvil a cargar fuera de la habitación', 'Apaga 3 pantallas', 'Ponte tu pijama favorito', 'Envía «Buenas noches» a una persona de confianza', 'Ponte el pijama'),
    c('Lee una página de un libro de papel en la cama', 'Apaga todas las pantallas de la casa', 'Métete en la cama con tu manta favorita', 'Escucha un cuento para dormir en el móvil', 'Métete en la cama'),
  ),
  Aseo: a(
    c('Coge una toalla distinta a la de siempre', 'Ponte las zapatillas sin mirar el móvil', 'Coge tu toalla favorita', 'Mira tu gel favorito en la estantería', 'Coge la toalla'),
    c('Lávate la cara con agua fría', 'Lávate los dientes contando hasta 30', 'Lávate la cara con tu jabón favorito', 'Escucha un pódcast curioso en el baño', 'Lávate la cara'),
    c('Dúchate con la luz baja', 'Lávate el pelo', 'Dúchate con tu música favorita', 'Prepara la ropa limpia con tu prenda favorita', 'Abre el grifo de la ducha'),
  ),
  Skincare: a(
    c('Mírate en el espejo con otra luz', 'Coge 2 productos de tu rutina', 'Coge tu crema favorita', 'Lee la etiqueta de tu crema', 'Abre el bote de crema'),
    c('Ponte la crema empezando por el cuello', 'Ponte 2 productos en la cara', 'Ponte tu crema favorita', 'Ponte la crema con una persona de casa', 'Lávate la cara'),
    c('Ponte una mascarilla nueva', 'Ponte 3 productos de tu rutina', 'Ponte una mascarilla con tu música favorita', 'Ponte una mascarilla con una persona de casa', 'Pasa el desmaquillante por la cara'),
  ),
  Comida: a(
    c('Busca en el móvil una receta de 3 ingredientes', 'Coge 2 cosas de picar', 'Coge tu plato favorito', 'Mira qué hay en la nevera', 'Abre la nevera'),
    c('Sirve la comida en tu plato favorito', 'Saca 2 alimentos de la nevera', 'Saca tu comida favorita de la nevera', 'Pregunta a una persona de casa qué le apetece', 'Calienta la comida'),
    c('Come en un sitio nuevo de la casa', 'Prepara un plato con 3 alimentos', 'Prepara tu bocadillo favorito', 'Come con una persona de casa', 'Prepara un bocadillo en un plato'),
  ),
  Hidratación: a(
    c('Bebe un sorbo de agua fría de la nevera', 'Bebe un sorbo de agua', 'Bebe un sorbo de tu bebida favorita sin azúcar', 'Mira cuánta agua queda en la botella', 'Coge la botella de agua'),
    c('Llena una botella para llevarla contigo', 'Bebe medio vaso de agua', 'Bebe un vaso de agua con limón', 'Llena un vaso de agua para una persona de casa', 'Llena un vaso de agua'),
    c('Deja una botella llena en un sitio nuevo de la casa', 'Bebe 2 vasos de agua', 'Bebe un vaso de agua en tu taza favorita', 'Bebe un vaso de agua con una persona de casa', 'Bebe un vaso de agua entero'),
  ),
  Desconexión: a(
    c('Deja el móvil en otra habitación', 'Deja el móvil boca abajo', 'Coge tu manta favorita', 'Escucha los sonidos de la calle', 'Cierra los ojos'),
    c('Asómate a la ventana de otra habitación', 'Respira hondo 5 veces', 'Túmbate en el sofá con tu manta favorita', 'Habla con una persona de casa sin pantallas', 'Túmbate en el sofá'),
    c('Sal a pasear sin el móvil', 'Camina 2 manzanas sin el móvil', 'Escucha tu disco favorito con los ojos cerrados', 'Pasea con una persona de confianza sin el móvil', 'Coge un libro de papel'),
  ),

  // ── Ampliación de la app ──
  'Pasear al perro': a(
    c('Mira una ruta nueva en el mapa', 'Llama 2 veces al perro por su nombre', 'Coge el juguete favorito del perro', 'Mira por la ventana el tiempo de fuera', 'Coge la correa'),
    c('Sal con el perro hacia el lado contrario de la calle', 'Mete 2 bolsas para el perro en el bolsillo', 'Ponte tu canción favorita en los auriculares', 'Escribe a una persona de confianza para pasear contigo', 'Ponle la correa al perro'),
    c('Pasea al perro por un parque nuevo', 'Da una vuelta a 2 manzanas con el perro', 'Lleva al perro a su parque favorito', 'Pasea al perro con una persona de confianza', 'Da una vuelta a la manzana con el perro'),
  ),
  Veterinario: a(
    c('Busca el teléfono del veterinario en su web', 'Apunta el teléfono del veterinario en un pósit', 'Coge la cartilla con tu mascota al lado', 'Mira la fecha de la última vacuna', 'Coge la cartilla de tu mascota'),
    c('Pide la cita por la web en vez de llamar', 'Marca el número sin pulsar llamar', 'Pon la cartilla en la mesa con tu mascota al lado', 'Escribe en un pósit la pregunta para el veterinario', 'Abre la web del veterinario'),
    c('Prepara el transportín con una manta nueva', 'Prepara 3 cosas para la visita', 'Mete el juguete favorito en el transportín', 'Lleva a tu mascota con una persona de confianza', 'Llama para pedir la cita'),
  ),
  Mascotas: a(
    c('Llama a tu mascota desde otra habitación', 'Llama 2 veces a tu mascota por su nombre', 'Coge el juguete favorito de tu mascota', 'Mira qué está tramando tu mascota', 'Coge el cuenco del agua'),
    c('Pon el cuenco en un sitio nuevo', 'Llena 2 cuencos', 'Juega con tu mascota con su juguete favorito', 'Juega con tu mascota con una persona de casa', 'Llena el cuenco de agua'),
    c('Juega con tu mascota con un juguete nuevo', 'Cepilla a tu mascota 10 veces', 'Cepilla a tu mascota con tu música favorita', 'Cepilla a tu mascota con una persona de casa', 'Limpia el arenero'),
  ),
  // Solo si la frase no trae verbo y objeto («bombilla»): si los trae, reglas.ts escribe los retos con ellos
  Mantenimiento: a(
    c('Busca en el móvil un vídeo con los pasos del arreglo', 'Apunta 2 cosas que vas a necesitar', 'Busca las instrucciones con tu canción favorita sonando', 'Cuéntale a alguien de casa lo que vas a arreglar', 'Busca las instrucciones en el móvil'),
    c('Lee en el móvil los pasos del arreglo', 'Junta 3 cosas que vas a necesitar', 'Saca las herramientas con tu música favorita de fondo', 'Envía un mensaje a alguien de confianza para contarle lo que vas a arreglar', 'Saca las herramientas'),
    c('Lee las instrucciones en voz alta', 'Completa 3 pasos de las instrucciones', 'Sigue las instrucciones con tu música favorita de fondo', 'Sigue las instrucciones con alguien de casa cerca', 'Completa el primer paso de las instrucciones'),
  ),
}

/** Frase de permiso por nivel: baja la exigencia sin juzgar (se ve en el detalle del reto). */
export const PERMISO: Record<Nivel, string> = {
  pesado: 'Con eso ya cuenta.',
  medio: 'No tiene que quedar perfecto.',
  ligero: 'Si sale regular, también vale.',
}

/** Plazo de la carta Urgencia: una pauta temporal corta y concreta, nunca «rápido». */
export const PLAZO: Record<Nivel, string> = {
  pesado: 'en los próximos 5 minutos',
  medio: 'en los próximos 10 minutos',
  ligero: 'antes de que pase una hora',
}
