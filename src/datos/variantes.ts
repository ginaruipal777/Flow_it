import type { TipoReto } from '../components/CartaReto/tipos'

/* ─────────────────────────────────────────────────────────────
   Un reto DISTINTO por carta INCUP para cada categoría de reglas.ts
   (antes las 5 cartas repetían la misma acción con otra frase alrededor).

   Qué busca cada carta:
   - Novedad   → hacerlo de otra forma o en otro sitio.
   - Desafío   → una meta pequeña y que se pueda contar o comprobar.
   - Pasión    → unirlo a algo que te gusta.
   - Interés   → hacerlo con otra persona o descubrir algo.
   - Urgencia  → no está aquí: usa el reto base de la regla (la acción mínima, ahora).

   Cada entrada es [reto, criterio de éxito]. El criterio se lee «Está hecho cuando …».
   Pautas de escritura: docs/comunicacion.md (literal, concreto, sin presión, sin género).
   ───────────────────────────────────────────────────────────── */

export type Variante = [reto: string, hecho: string]
export type Variantes = Record<Exclude<TipoReto, 'urgencia'>, Variante>

export const VARIANTES: Record<string, Variantes> = {
  // ── Trabajo, administración y estudio ──
  Comunicación: {
    novedad: ['Escribe el saludo del correo desde el móvil en vez del ordenador', 'el saludo está escrito'],
    desafio: ['Escribe la respuesta en 3 frases como máximo', 'el correo tiene 3 frases o menos'],
    pasion: ['Pon una canción que te guste y escribe el saludo mientras suena', 'el saludo está escrito'],
    interes: ['Escribe en una línea qué te pide esa persona', 'tienes lo que te pide escrito en una línea'],
  },
  Administrativo: {
    novedad: ['Imprime el documento y marca la primera casilla con un rotulador de color', 'la primera casilla está marcada'],
    desafio: ['Rellena 3 casillas del formulario', '3 casillas están rellenas'],
    pasion: ['Prepárate tu bebida favorita y abre el documento', 'tienes la bebida al lado y el documento abierto'],
    interes: ['Pide a alguien que se siente a tu lado mientras abres el documento', 'tienes el documento abierto y a alguien al lado'],
  },
  Académico: {
    novedad: ['Ve a estudiar a un sitio distinto al de siempre y lee el primer párrafo', 'has leído el primer párrafo en otro sitio'],
    desafio: ['Lee una página y escribe 3 palabras clave', 'tienes 3 palabras clave escritas'],
    pasion: ['Elige el tema que más te guste y lee su primer párrafo', 'has leído el primer párrafo de ese tema'],
    interes: ['Escribe una pregunta que podría salir en el examen', 'tienes una pregunta escrita'],
  },
  Llamadas: {
    novedad: ['Escribe en un papel las 2 cosas que vas a decir en la llamada', 'tienes las 2 cosas escritas'],
    desafio: ['Haz la llamada y cuelga en cuanto tengas la respuesta que necesitas', 'has hecho la llamada'],
    pasion: ['Siéntate en tu sitio favorito de casa y busca el número', 'tienes el número en la pantalla'],
    interes: ['Pide a alguien que esté a tu lado mientras llamas', 'has llamado con alguien al lado'],
  },
  Decisión: {
    novedad: ['Lanza una moneda entre las 2 opciones y fíjate en cuál querías que saliera', 'sabes qué opción preferías'],
    desafio: ['Escribe 1 ventaja y 1 inconveniente de cada opción', 'tienes 4 cosas escritas'],
    pasion: ['Escribe cuál de las 2 opciones te ilusiona más', 'tienes escrita la opción que más te ilusiona'],
    interes: ['Cuéntale las 2 opciones a alguien en un mensaje', 'has enviado el mensaje'],
  },
  Creativo: {
    novedad: ['Escribe la primera frase a mano, en un papel', 'hay una frase escrita en el papel'],
    desafio: ['Escribe 3 ideas en una lista, sin pararte a corregir', 'tienes 3 ideas escritas'],
    pasion: ['Pon la música que te inspira y abre el documento', 'la música suena y el documento está abierto'],
    interes: ['Busca una imagen o referencia que te guste para el proyecto', 'tienes una referencia guardada'],
  },
  Digital: {
    novedad: ['Cambia el nombre de un archivo para que diga lo que es', 'un archivo tiene un nombre nuevo'],
    desafio: ['Borra o mueve 5 archivos que no necesites', '5 archivos están borrados o movidos'],
    pasion: ['Pon una canción que te guste y ordena archivos mientras suena', 'la canción ha terminado y has movido algún archivo'],
    interes: ['Crea una carpeta nueva con un nombre claro', 'la carpeta nueva existe'],
  },

  // ── Hogar y vida cotidiana ──
  Doméstico: {
    novedad: ['Recoge solo las cosas de un color', 'no queda nada de ese color fuera de su sitio'],
    desafio: ['Recoge 10 cosas y cuéntalas en voz alta', 'has recogido 10 cosas'],
    pasion: ['Pon tu canción favorita y recoge mientras suena', 'la canción ha terminado'],
    interes: ['Haz una videollamada con alguien mientras recoges', 'has recogido algo mientras hablabais'],
  },
  Compra: {
    novedad: ['Busca en el móvil una tienda cercana a la que no sueles ir', 'tienes una tienda nueva elegida'],
    desafio: ['Escribe la lista de la compra ordenada por pasillos', 'la lista está ordenada por pasillos'],
    pasion: ['Apunta en la lista un capricho que te apetezca', 'el capricho está en la lista'],
    interes: ['Pregunta a alguien de casa qué hace falta comprar', 'tienes su respuesta'],
  },
  Cocina: {
    novedad: ['Busca una receta nueva con lo que ya tienes en la nevera', 'tienes una receta elegida'],
    desafio: ['Prepara un plato con 3 ingredientes como máximo', 'el plato está hecho'],
    pasion: ['Elige tu plato favorito y saca sus ingredientes', 'los ingredientes están en la encimera'],
    interes: ['Cocina con alguien, en persona o en videollamada', 'estáis cocinando'],
  },
  Ropa: {
    novedad: ['Separa la ropa en montones por colores', 'la ropa está en montones por colores'],
    desafio: ['Guarda 10 prendas y cuéntalas', 'has guardado 10 prendas'],
    pasion: ['Pon un podcast que te guste y dobla ropa mientras suena', 'has doblado algo de ropa'],
    interes: ['Pide a alguien de casa que tienda la ropa contigo', 'estáis tendiendo la ropa'],
  },

  // ── Ocio y entretenimiento ──
  'Ver serie': {
    novedad: ['Mira el capítulo en otro sitio de casa', 'el capítulo ha empezado'],
    desafio: ['Mira un capítulo entero sin coger el móvil', 'has visto el capítulo sin el móvil'],
    pasion: ['Prepara tu merienda favorita y pon el capítulo', 'la merienda está lista y el capítulo ha empezado'],
    interes: ['Escribe a alguien para ver el capítulo juntos', 'has enviado el mensaje'],
  },
  'Ver película': {
    novedad: ['Elige una película de un género que no sueles ver', 'has elegido la película'],
    desafio: ['Elige la película entre 3 opciones como máximo', 'la película está elegida'],
    pasion: ['Prepara algo de picar que te guste y elige la película', 'tienes algo de picar y la película elegida'],
    interes: ['Pide a alguien que te recomiende una película', 'tienes una recomendación'],
  },
  Lectura: {
    novedad: ['Lee una página en un sitio de casa donde no leas nunca', 'has leído una página allí'],
    desafio: ['Lee 5 páginas', 'has leído 5 páginas'],
    pasion: ['Prepara tu bebida favorita y lee una página', 'has leído una página'],
    interes: ['Subraya una frase que te guste y mándasela a alguien', 'has enviado la frase'],
  },
  Videojuego: {
    novedad: ['Prueba un modo o personaje que no hayas usado', 'has jugado con él'],
    desafio: ['Supera un nivel o una misión', 'has superado un nivel o una misión'],
    pasion: ['Juega una partida a tu juego favorito', 'has jugado una partida'],
    interes: ['Escribe a alguien para jugar juntos', 'has enviado el mensaje'],
  },
  Música: {
    novedad: ['Pon una canción de un artista que no conozcas', 'está sonando la canción'],
    desafio: ['Haz una lista de 5 canciones', 'la lista tiene 5 canciones'],
    pasion: ['Pon tu canción favorita', 'está sonando tu canción favorita'],
    interes: ['Mándale a alguien una canción que te guste', 'has enviado la canción'],
  },
  Podcast: {
    novedad: ['Pon un episodio de un podcast que no hayas escuchado nunca', 'el episodio está sonando'],
    desafio: ['Escucha un episodio entero', 'has terminado el episodio'],
    pasion: ['Pon el podcast y sal a dar un paseo mientras lo escuchas', 'estás paseando con el podcast puesto'],
    interes: ['Apunta una idea del podcast que te parezca interesante', 'tienes la idea apuntada'],
  },
  Vídeo: {
    novedad: ['Busca lo mismo en otro formato, como un artículo con fotos', 'lo tienes abierto'],
    desafio: ['Mira el vídeo y haz el primer paso que enseña', 'has hecho ese paso'],
    pasion: ['Busca el vídeo en un canal que te guste', 'el vídeo se está reproduciendo'],
    interes: ['Apunta una cosa que hayas aprendido del vídeo', 'tienes una cosa apuntada'],
  },

  // ── Deporte y movimiento ──
  Gimnasio: {
    novedad: ['Haz un ejercicio que no hayas probado nunca', 'has hecho ese ejercicio'],
    desafio: ['Haz 10 repeticiones de un ejercicio', 'has hecho 10 repeticiones'],
    pasion: ['Pon tu música para entrenar y ponte la ropa de deporte', 'suena la música y llevas la ropa de deporte'],
    interes: ['Escribe a alguien para entrenar juntos', 'has enviado el mensaje'],
  },
  Correr: {
    novedad: ['Sal a correr por una ruta distinta a la de siempre', 'has empezado la ruta nueva'],
    desafio: ['Corre hasta la siguiente esquina y vuelve andando', 'has llegado a la esquina corriendo'],
    pasion: ['Pon tu música favorita y sal a correr', 'estás corriendo con tu música'],
    interes: ['Escribe a alguien para salir a correr juntos', 'has enviado el mensaje'],
  },
  Caminar: {
    novedad: ['Camina por una calle por la que no hayas pasado nunca', 'has pasado por esa calle'],
    desafio: ['Camina hasta el final de tu calle y vuelve', 'has llegado al final de la calle'],
    pasion: ['Pon un podcast o música que te guste y sal a caminar', 'estás caminando con el audio puesto'],
    interes: ['Llama a alguien para caminar juntos', 'habéis quedado para caminar'],
  },
  Yoga: {
    novedad: ['Busca un vídeo de una postura que no hayas hecho y hazla', 'has hecho la postura nueva'],
    desafio: ['Haz 3 posturas seguidas', 'has hecho 3 posturas'],
    pasion: ['Pon música tranquila que te guste y extiende la esterilla', 'suena la música y la esterilla está extendida'],
    interes: ['Haz yoga con alguien o con una clase en vídeo', 'has empezado con alguien o con la clase'],
  },
  Bici: {
    novedad: ['Ve en bici a un sitio al que normalmente vas andando', 'has llegado en bici'],
    desafio: ['Da una vuelta a la manzana en bici', 'has dado la vuelta a la manzana'],
    pasion: ['Elige una ruta que pase por un sitio que te guste y saca la bici', 'la bici está fuera y tienes la ruta'],
    interes: ['Escribe a alguien para salir en bici juntos', 'has enviado el mensaje'],
  },
  Natación: {
    novedad: ['Nada un largo en un estilo que no sueles usar', 'has nadado ese largo'],
    desafio: ['Nada 4 largos', 'has nadado 4 largos'],
    pasion: ['Mete en la bolsa algo que te guste para después, como tu merienda favorita', 'está en la bolsa con el bañador'],
    interes: ['Escribe a alguien para ir a nadar juntos', 'has enviado el mensaje'],
  },
  Baile: {
    novedad: ['Aprende un paso nuevo con un vídeo', 'has hecho el paso nuevo'],
    desafio: ['Baila una canción entera sin parar', 'ha terminado la canción'],
    pasion: ['Pon tu canción favorita y baila', 'has bailado tu canción favorita'],
    interes: ['Baila con alguien, en persona o en videollamada', 'habéis bailado una canción'],
  },
  Escalada: {
    novedad: ['Prueba un bloque o vía que no hayas intentado nunca', 'lo has intentado'],
    desafio: ['Intenta el mismo bloque 3 veces', 'lo has intentado 3 veces'],
    pasion: ['Empieza por el bloque que más te gusta', 'has subido ese bloque'],
    interes: ['Escribe a alguien para escalar juntos', 'has enviado el mensaje'],
  },
  'Deporte en equipo': {
    novedad: ['Pide jugar en una posición distinta a la de siempre', 'has jugado en esa posición'],
    desafio: ['Haz 3 pases buenos en el partido', 'has hecho 3 pases buenos'],
    pasion: ['Ponte tu camiseta favorita y prepara la equipación', 'llevas la camiseta y la equipación está lista'],
    interes: ['Escribe al grupo para confirmar que vas', 'has enviado el mensaje'],
  },

  // ── Vida social ──
  'Quedar con amigos': {
    novedad: ['Propón un plan que no hayáis hecho nunca', 'has propuesto el plan'],
    desafio: ['Escribe a 3 amigos y propón un día', 'has escrito a 3 personas'],
    pasion: ['Propón un plan alrededor de algo que te encanta', 'has propuesto el plan'],
    interes: ['Pregunta a un amigo qué le apetece hacer', 'has enviado la pregunta'],
  },
  'Llamada social': {
    novedad: ['Mándale un audio en vez de un mensaje escrito', 'has enviado el audio'],
    desafio: ['Llámale y hablad 5 minutos', 'habéis hablado 5 minutos'],
    pasion: ['Mándale una foto o canción que te recuerde a esa persona', 'la has enviado'],
    interes: ['Pregúntale por algo que te contó la última vez', 'has enviado la pregunta'],
  },
  Cumpleaños: {
    novedad: ['Felicítale con un audio o un vídeo corto', 'lo has enviado'],
    desafio: ['Escribe la felicitación con 3 cosas que te gustan de esa persona', 'el mensaje tiene 3 cosas'],
    pasion: ['Busca una foto en la que salgáis juntos y envíala con la felicitación', 'has enviado la foto'],
    interes: ['Pregunta a alguien cercano qué regalo le haría ilusión', 'tienes una idea de regalo'],
  },
  Fiesta: {
    novedad: ['Lleva algo distinto, como una receta que no hayas hecho', 'tienes elegido qué llevar'],
    desafio: ['Deja preparada la ropa y lo que vas a llevar', 'la ropa y lo que llevas están preparados'],
    pasion: ['Elige la ropa con la que te sientas mejor', 'la ropa está elegida'],
    interes: ['Escribe a alguien para ir juntos a la fiesta', 'has enviado el mensaje'],
  },
  Familia: {
    novedad: ['Propón un plan distinto para la visita, como un paseo', 'has propuesto el plan'],
    desafio: ['Confirma día, hora y sitio en un solo mensaje', 'el mensaje tiene día, hora y sitio'],
    pasion: ['Apunta algo que te apetezca contarles', 'lo tienes apuntado'],
    interes: ['Pregunta qué tal están antes de confirmar el plan', 'has enviado la pregunta'],
  },
  Cita: {
    novedad: ['Propón un sitio al que ninguna de las dos personas haya ido', 'has propuesto el sitio'],
    desafio: ['Propón 2 opciones de día y hora', 'has enviado 2 opciones'],
    pasion: ['Propón un plan alrededor de algo que te guste', 'has propuesto el plan'],
    interes: ['Pregunta a esa persona qué le apetece hacer', 'has enviado la pregunta'],
  },
  'Chat de grupo': {
    novedad: ['Responde con una foto o un audio', 'lo has enviado'],
    desafio: ['Lee los mensajes y responde a 2 personas', 'has respondido a 2 personas'],
    pasion: ['Comparte algo que te haya gustado hoy', 'lo has compartido'],
    interes: ['Haz una pregunta al grupo', 'has enviado la pregunta'],
  },

  // ── Hobbies y creatividad ──
  Dibujo: {
    novedad: ['Dibuja algo con la mano que no usas', 'hay un dibujo hecho con esa mano'],
    desafio: ['Haz 5 dibujos rápidos de cosas que tengas delante', 'hay 5 dibujos'],
    pasion: ['Dibuja algo que te encante', 'hay un dibujo empezado'],
    interes: ['Copia un dibujo o una foto que te guste', 'has empezado la copia'],
  },
  Escritura: {
    novedad: ['Escribe una frase en un sitio distinto al de siempre', 'hay una frase escrita'],
    desafio: ['Escribe 50 palabras sin borrar', 'hay 50 palabras escritas'],
    pasion: ['Escribe sobre algo que te haya gustado hoy', 'hay una frase escrita'],
    interes: ['Escribe una pregunta y contéstala', 'la pregunta tiene respuesta'],
  },
  Fotografía: {
    novedad: ['Haz una foto desde un ángulo que no uses nunca', 'has hecho la foto'],
    desafio: ['Haz 5 fotos de cosas de un mismo color', 'tienes 5 fotos'],
    pasion: ['Haz una foto de algo que te guste mucho', 'has hecho la foto'],
    interes: ['Edita una foto y mándasela a alguien', 'la has enviado'],
  },
  'Cocina creativa': {
    novedad: ['Añade a la receta un ingrediente que no hayas usado nunca', 'el ingrediente está en la receta'],
    desafio: ['Prepara la receta con 5 ingredientes como máximo', 'la receta está hecha'],
    pasion: ['Prepara el plato o postre que más te apetece', 'has empezado a prepararlo'],
    interes: ['Cocina con alguien o mándale una foto del resultado', 'habéis cocinado o has enviado la foto'],
  },
  Manualidades: {
    novedad: ['Usa un material que no hayas probado', 'has empezado con ese material'],
    desafio: ['Termina una parte pequeña de la pieza', 'esa parte está terminada'],
    pasion: ['Pon un podcast o música y empieza la pieza', 'has empezado la pieza'],
    interes: ['Busca una idea o tutorial y guárdalo', 'tienes una idea guardada'],
  },
  Instrumento: {
    novedad: ['Toca el principio de una canción que no hayas tocado nunca', 'has tocado el principio'],
    desafio: ['Toca la misma escala 3 veces seguidas', 'la has tocado 3 veces'],
    pasion: ['Toca tu canción favorita', 'la has tocado'],
    interes: ['Grábate tocando y mándaselo a alguien', 'has enviado la grabación'],
  },
  Jardín: {
    novedad: ['Cambia una planta de sitio para que le dé más luz', 'la planta está en su sitio nuevo'],
    desafio: ['Riega todas las plantas de una habitación', 'las plantas de esa habitación están regadas'],
    pasion: ['Riega la planta que más te gusta', 'está regada'],
    interes: ['Busca cómo se cuida una de tus plantas', 'sabes cómo cuidarla'],
  },
  Meditación: {
    novedad: ['Siéntate cerca de una ventana y haz 3 respiraciones lentas', 'has hecho 3 respiraciones allí'],
    desafio: ['Haz 10 respiraciones lentas y cuéntalas', 'has contado 10 respiraciones'],
    pasion: ['Pon un sonido que te relaje y respira despacio', 'has respirado con el sonido puesto'],
    interes: ['Pon una meditación guiada', 'la meditación ha empezado'],
  },

  // ── Descanso y autocuidado ──
  Descanso: {
    novedad: ['Lee un libro en papel en vez de mirar el móvil antes de dormir', 'el móvil está fuera de la cama'],
    desafio: ['Deja el móvil cargando lejos de la cama', 'el móvil está lejos de la cama'],
    pasion: ['Prepárate una infusión que te guste y ve a la cama', 'estás en la cama'],
    interes: ['Pon una alarma para ir a dormir a la misma hora mañana', 'la alarma está puesta'],
  },
  Aseo: {
    novedad: ['Pon música en la ducha', 'la música suena y estás en la ducha'],
    desafio: ['Dúchate en lo que dura una canción', 'la canción ha terminado y has salido de la ducha'],
    pasion: ['Usa tu gel o jabón favorito', 'estás en la ducha'],
    interes: ['Prepara la ropa que te vas a poner después', 'la ropa está preparada'],
  },
  Skincare: {
    novedad: ['Prueba un producto que tengas sin usar', 'te lo has puesto'],
    desafio: ['Hazte la rutina en 3 pasos: limpiar, hidratar, protector', 'has hecho los 3 pasos'],
    pasion: ['Pon música que te guste y aplícate un producto', 'te has puesto un producto'],
    interes: ['Busca para qué sirve uno de tus productos', 'sabes para qué sirve'],
  },
  Comida: {
    novedad: ['Come en un sitio distinto, como cerca de una ventana', 'estás comiendo allí'],
    desafio: ['Prepara un plato con fruta o verdura y algo de proteína', 'el plato tiene las 2 cosas'],
    pasion: ['Prepara algo sencillo que te encante', 'lo tienes en la mesa'],
    interes: ['Come con alguien, en persona o en videollamada', 'estáis comiendo juntos'],
  },
  Hidratación: {
    novedad: ['Bebe un vaso de agua con limón o con hielo', 'el vaso está vacío'],
    desafio: ['Llena una botella de agua, déjala en tu mesa y bebe la mitad', 'la botella está a la mitad'],
    pasion: ['Bebe agua en tu taza o vaso favorito', 'el vaso está vacío'],
    interes: ['Pon un recordatorio en el móvil para beber agua', 'el recordatorio está puesto'],
  },
  Desconexión: {
    novedad: ['Asómate a la ventana o sal a la calle y mira el cielo', 'has mirado fuera un momento'],
    desafio: ['Deja el móvil en otra habitación', 'el móvil está en otra habitación'],
    pasion: ['Haz algo que te guste sin pantallas, como dibujar o tumbarte', 'lo has hecho'],
    interes: ['Pasa un rato con alguien sin móviles', 'habéis estado un rato sin móviles'],
  },

  // ── Ampliación de la app ──
  Veterinario: {
    novedad: ['Pide la cita por la web o por mensaje en vez de llamar', 'has pedido la cita'],
    desafio: ['Apunta 3 cosas que quieres preguntar en la consulta', 'tienes 3 preguntas apuntadas'],
    pasion: ['Prepara el premio favorito de tu mascota para después de la visita', 'el premio está preparado'],
    interes: ['Pregunta a alguien si te puede acompañar al veterinario', 'has enviado la pregunta'],
  },
  Mascotas: {
    novedad: ['Prepara un juguete o un juego nuevo para tu mascota', 'tu mascota tiene el juego nuevo'],
    desafio: ['Juega 5 minutos con tu mascota', 'habéis jugado 5 minutos'],
    pasion: ['Haz una foto bonita de tu mascota', 'tienes la foto'],
    interes: ['Busca un dato curioso sobre su raza o especie', 'sabes un dato nuevo sobre tu mascota'],
  },
  'Pasear al perro': {
    novedad: ['Pasea al perro por un sitio distinto al de siempre', 'habéis pasado por un sitio nuevo'],
    desafio: ['Da un paseo corto: hasta la esquina y vuelta', 'habéis llegado a la esquina'],
    pasion: ['Ponte tu música o podcast favorito y sal con el perro', 'estáis en la calle con el audio puesto'],
    interes: ['Llama a un amigo para dar el paseo juntos', 'habéis quedado para pasear'],
  },
}
