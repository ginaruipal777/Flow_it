/* ─────────────────────────────────────────────────────────────
   Banco de acciones por categoría y nivel de esfuerzo
   («Regla de oro: la ley del esfuerzo inverso»).

   - Ligero  (ganas, solo falta un empujón): 1–3 min, puede tener algo de sustancia.
   - Medio   (pereza o resistencia):         30–60 s, física, mecánica y acotada.
   - Pesado  (bloqueo total):                5–10 s, casi ridícula. Prueba: «¿se podría
                                             hacer tumbado en la cama sin levantarse?».

   Reglas de cada acción (las comprueba scripts/validar-retos.mts):
   1. Empieza por un verbo de acción física (Abre, Coge, Escribe, Ponte, Toca, Mira…).
   2. Cero carga cognitiva: no pide pensar, decidir, organizar ni planificar.
   3. Una sola acción: sin «y», «luego», «después» ni opciones con «o».
   4. Sin tiempos ni prisas («en 2 minutos», «rápido», «tómate 5 minutos»).
   5. Sin la palabra «tarea».
   ───────────────────────────────────────────────────────────── */

import type { TipoReto } from '../components/CartaReto/tipos'

export type Nivel = 'ligero' | 'medio' | 'pesado'
export type Acciones = Record<Nivel, string[]>

const a = (pesado: string[], medio: string[], ligero: string[]): Acciones => ({ pesado, medio, ligero })

export const BANCO: Record<string, Acciones> = {
  // ── Trabajo, administración y estudio ──
  Comunicación: a(
    ['Abre la aplicación de correo', 'Pon las manos sobre el teclado', 'Mira el asunto del correo que tienes que responder'],
    ['Pulsa «Responder» en ese correo', 'Escribe solo el saludo del correo', 'Escribe el nombre de la persona en el destinatario'],
    ['Escribe la primera frase de la respuesta', 'Lee entero el correo que te han enviado', 'Busca el archivo adjunto que tienes que enviar'],
  ),
  Administrativo: a(
    ['Abre la web del trámite', 'Coge la carpeta de los papeles', 'Mira la primera casilla del formulario'],
    ['Escribe tu nombre en la primera casilla', 'Saca tu DNI de la cartera', 'Pon el documento en pantalla completa'],
    ['Rellena la primera sección del formulario', 'Lee la primera página del documento', 'Escanea con el móvil el primer papel que necesitas'],
  ),
  Académico: a(
    ['Abre el libro por la página del tema', 'Coge el subrayador', 'Mira el título del tema'],
    ['Lee la primera línea del tema', 'Subraya una palabra del primer párrafo', 'Escribe el título del tema en una hoja'],
    ['Lee el primer párrafo en voz alta', 'Copia la primera definición del tema en una hoja', 'Escribe 3 palabras clave del primer párrafo'],
  ),
  Llamadas: a(
    ['Coge el móvil con la mano', 'Abre la agenda del móvil', 'Busca el número en la agenda'],
    ['Marca el número sin pulsar llamar', 'Pon el móvil delante de ti con el número en pantalla', 'Abre la web de citas de ese sitio'],
    ['Pulsa llamar', 'Pide la cita en la web', 'Envía un mensaje para pedir la cita'],
  ),
  Decisión: a(
    ['Coge un papel', 'Coge un bolígrafo', 'Abre la aplicación de notas'],
    ['Escribe arriba del papel lo que tienes que decidir', 'Escribe la primera opción en el papel', 'Dibuja una línea en medio del papel'],
    ['Escribe las 2 opciones en el papel', 'Escribe una ventaja de la primera opción', 'Lanza una moneda entre las 2 opciones'],
  ),
  Creativo: a(
    ['Abre el documento del proyecto', 'Coge el lápiz', 'Mira la última página que hiciste'],
    ['Escribe el título del proyecto', 'Escribe una palabra en el documento', 'Dibuja un garabato en una esquina de la hoja'],
    ['Escribe una frase en el documento', 'Haz un boceto de una idea', 'Escribe 3 ideas en una lista'],
  ),
  Digital: a(
    ['Abre la carpeta', 'Toca el ratón', 'Mira el primer archivo de la carpeta'],
    ['Abre el primer archivo de la carpeta', 'Arrastra un archivo a la papelera', 'Cambia el nombre de un archivo'],
    ['Mueve 5 archivos a su carpeta', 'Crea una carpeta nueva con un nombre claro', 'Vacía la papelera del ordenador'],
  ),

  // ── Hogar y vida cotidiana ──
  Doméstico: a(
    ['Tira un papel a la papelera', 'Coge un trapo', 'Recoge una sola cosa del suelo'],
    ['Recoge 5 cosas de la mesa', 'Limpia una esquina de la mesa', 'Vacía la papelera de la habitación'],
    ['Recoge toda la mesa', 'Pasa el trapo por la mesa entera', 'Barre el suelo de la habitación'],
  ),
  Compra: a(
    ['Abre la aplicación de notas', 'Coge un papel', 'Mira la puerta de la nevera'],
    ['Escribe en la lista lo primero que falta', 'Abre la nevera', 'Coge las bolsas de la compra'],
    ['Escribe la lista con 5 cosas', 'Haz el pedido en la web del súper', 'Sal a la tienda con la lista'],
  ),
  Cocina: a(
    ['Mira la nevera', 'Coge una sartén', 'Lávate las manos'],
    ['Saca un ingrediente de la nevera', 'Pon una olla con agua al fuego', 'Corta una verdura'],
    ['Prepara un plato sencillo', 'Pon la mesa', 'Cocina la receta que tenías pensada'],
  ),
  Ropa: a(
    ['Coge una prenda del suelo', 'Toca el cesto de la ropa', 'Abre la puerta de la lavadora'],
    ['Mete 5 prendas en la lavadora', 'Dobla una camiseta', 'Tiende 3 prendas'],
    ['Pon una lavadora', 'Tiende toda la colada', 'Guarda la ropa limpia en el armario'],
  ),

  // ── Ocio y entretenimiento ──
  'Ver serie': a(
    ['Coge el mando', 'Abre la aplicación de la serie', 'Siéntate en el sofá'],
    ['Pon el capítulo', 'Busca la serie en la aplicación', 'Prepara algo de picar'],
    ['Mira un capítulo entero', 'Deja el móvil en otra habitación', 'Pon el siguiente capítulo'],
  ),
  'Ver película': a(
    ['Coge el mando', 'Abre la plataforma', 'Siéntate en el sofá'],
    ['Busca una película en la plataforma', 'Mira el tráiler de una película', 'Pon la primera película de tu lista'],
    ['Pon la película', 'Mira la película entera', 'Prepara palomitas'],
  ),
  Lectura: a(
    ['Coge el libro', 'Abre el libro por el marcapáginas', 'Lee el título del capítulo'],
    ['Lee una página', 'Lee el primer párrafo en voz alta', 'Subraya una frase que te guste'],
    ['Lee 5 páginas', 'Lee hasta el final del capítulo', 'Lee una página entera en voz alta'],
  ),
  Videojuego: a(
    ['Coge el mando', 'Enciende la consola', 'Abre el juego'],
    ['Carga tu última partida', 'Entra en el primer nivel', 'Juega una partida corta'],
    ['Supera un nivel', 'Juega una partida entera', 'Prueba un modo que no hayas usado'],
  ),
  Música: a(
    ['Coge los auriculares', 'Abre la aplicación de música', 'Pulsa play'],
    ['Pon una canción que te guste', 'Busca un disco que te guste', 'Sube el volumen'],
    ['Haz una lista con 5 canciones', 'Escucha un disco entero', 'Pon un artista que no conozcas'],
  ),
  Podcast: a(
    ['Ponte los auriculares', 'Abre la aplicación de podcasts', 'Pulsa play en el último episodio'],
    ['Pon el episodio', 'Busca el podcast', 'Escucha la presentación del episodio'],
    ['Escucha un episodio entero', 'Apunta una idea del episodio', 'Escucha el episodio paseando'],
  ),
  Vídeo: a(
    ['Abre la aplicación de vídeos', 'Ponte los auriculares', 'Coge el móvil'],
    ['Busca el vídeo', 'Pulsa play en el vídeo', 'Guarda el vídeo en tu lista'],
    ['Mira el vídeo entero', 'Haz el primer paso que enseña el vídeo', 'Apunta una cosa que aprendas del vídeo'],
  ),

  // ── Deporte y movimiento ──
  Gimnasio: a(
    ['Estira los brazos hacia arriba', 'Mira la mochila del gimnasio', 'Ponte una zapatilla'],
    ['Ponte la ropa de deporte', 'Haz 5 sentadillas', 'Llena la botella de agua'],
    ['Haz una serie de tu ejercicio favorito', 'Sal hacia el gimnasio', 'Haz 3 ejercicios de tu rutina'],
  ),
  Correr: a(
    ['Ponte una zapatilla', 'Coge los auriculares', 'Estira las piernas'],
    ['Ponte las zapatillas', 'Ponte la ropa de correr', 'Sal a la puerta de casa'],
    ['Corre hasta la siguiente esquina', 'Sal a correr por tu ruta de siempre', 'Corre por una calle nueva'],
  ),
  Caminar: a(
    ['Mira por la ventana', 'Ponte un zapato', 'Estira las piernas'],
    ['Ponte los zapatos', 'Sal al portal', 'Camina hasta la puerta de la calle'],
    ['Camina hasta el final de la calle', 'Da una vuelta a la manzana', 'Camina por una calle nueva'],
  ),
  Yoga: a(
    ['Estira los brazos hacia arriba', 'Siéntate en el suelo', 'Coge la esterilla'],
    ['Extiende la esterilla', 'Haz una postura', 'Pon un vídeo de yoga'],
    ['Haz 3 posturas', 'Sigue una clase de yoga en vídeo', 'Haz tu rutina de estiramientos'],
  ),
  Bici: a(
    ['Coge el casco', 'Coge las llaves del candado', 'Mira la bici'],
    ['Saca la bici a la calle', 'Ponte el casco', 'Infla las ruedas'],
    ['Da una vuelta a la manzana en bici', 'Ve en bici a un sitio cercano', 'Sal a dar un paseo en bici'],
  ),
  Natación: a(
    ['Coge el bañador', 'Coge la toalla', 'Abre la mochila'],
    ['Mete el bañador en la mochila', 'Mete la toalla en la mochila', 'Busca el horario de la piscina'],
    ['Ve a la piscina', 'Nada 4 largos', 'Nada un largo en otro estilo'],
  ),
  Baile: a(
    ['Pon una canción', 'Mueve los hombros', 'Mueve los pies al ritmo'],
    ['Baila el estribillo de una canción', 'Pon tu canción favorita', 'Mueve los brazos al ritmo'],
    ['Baila una canción entera', 'Aprende un paso nuevo con un vídeo', 'Repite la coreografía una vez'],
  ),
  Escalada: a(
    ['Coge los pies de gato', 'Coge la bolsa de magnesio', 'Abre la mochila'],
    ['Mete el material en la mochila', 'Sal hacia el rocódromo', 'Estira los brazos'],
    ['Sube tu bloque favorito', 'Intenta un bloque nuevo', 'Intenta el mismo bloque 3 veces'],
  ),
  'Deporte en equipo': a(
    ['Coge la equipación', 'Abre el chat del equipo', 'Ponte una zapatilla'],
    ['Mete la equipación en la bolsa', 'Escribe en el chat que vas', 'Ponte la equipación'],
    ['Ve al entrenamiento', 'Juega el partido', 'Calienta con el equipo'],
  ),

  // ── Vida social ──
  'Quedar con amigos': a(
    ['Coge el móvil', 'Abre el chat del grupo', 'Busca el contacto de tu amigo'],
    ['Escribe «¿Quedamos esta semana?»', 'Envía un emoji al chat', 'Escribe un día que te venga bien'],
    ['Escribe en el chat un día para quedar','Llama a un amigo para quedar', 'Envía un mensaje a 3 amigos'],
  ),
  'Llamada social': a(
    ['Busca el contacto', 'Abre el chat de esa persona', 'Mira su foto de perfil'],
    ['Envía «Hola»', 'Envía un audio corto', 'Envía un emoji'],
    ['Llama a esa persona', 'Escribe un mensaje de dos líneas', 'Pregúntale qué tal está'],
  ),
  Cumpleaños: a(
    ['Abre el chat de esa persona', 'Busca una foto en la que salgáis juntos', 'Escribe la palabra «Felicidades»'],
    ['Envía «¡Felicidades!»', 'Envía una foto en la que salgáis juntos', 'Envía un audio cantando «Cumpleaños feliz»'],
    ['Escribe una felicitación de tres frases', 'Llama para felicitar', 'Compra el regalo'],
  ),
  Fiesta: a(
    ['Abre la invitación', 'Mira la dirección de la fiesta', 'Abre el armario'],
    ['Confirma que vas', 'Saca la ropa que te vas a poner', 'Escribe a alguien para ir juntos'],
    ['Prepara lo que vas a llevar', 'Vístete para la fiesta', 'Sal hacia la fiesta'],
  ),
  Familia: a(
    ['Coge el móvil', 'Abre el chat de la familia', 'Busca el contacto'],
    ['Envía «¿Qué tal?»', 'Escribe el día de la visita', 'Envía una foto'],
    ['Llama para confirmar el plan', 'Escribe en el chat la fecha de la visita','Prepara lo que vas a llevar'],
  ),
  Cita: a(
    ['Coge el móvil', 'Abre el chat de esa persona', 'Mira el último mensaje'],
    ['Escribe «¿Te apetece quedar?»', 'Escribe «¿Te viene bien este finde?»', 'Busca un sitio en el mapa'],
    ['Envía la propuesta de un día para quedar','Llama para quedar', 'Reserva el sitio'],
  ),
  'Chat de grupo': a(
    ['Abre el chat del grupo', 'Lee el último mensaje', 'Mira las fotos del chat'],
    ['Responde con un emoji', 'Responde a un mensaje', 'Envía una foto'],
    ['Responde a 3 mensajes', 'Haz una pregunta al grupo', 'Envía un audio al grupo'],
  ),

  // ── Hobbies y creatividad ──
  Dibujo: a(
    ['Coge un lápiz', 'Pon un papel en la mesa', 'Abre el cuaderno'],
    ['Dibuja un círculo', 'Dibuja una línea', 'Dibuja algo que tengas delante'],
    ['Haz un boceto de algo que te guste', 'Dibuja con la mano que no usas', 'Llena una página de garabatos'],
  ),
  Escritura: a(
    ['Abre el cuaderno', 'Coge el bolígrafo', 'Abre el documento'],
    ['Escribe la fecha', 'Escribe una palabra', 'Escribe el título'],
    ['Escribe una frase', 'Escribe un párrafo', 'Escribe sobre algo que te ha pasado hoy'],
  ),
  Fotografía: a(
    ['Coge la cámara', 'Abre la cámara del móvil', 'Mira por la ventana'],
    ['Haz una foto', 'Haz una foto de algo de un color', 'Limpia el objetivo'],
    ['Haz 5 fotos', 'Edita una foto', 'Sal a hacer fotos a la calle'],
  ),
  'Cocina creativa': a(
    ['Abre el libro de recetas', 'Coge un delantal', 'Mira la nevera'],
    ['Saca los ingredientes de la receta', 'Lava un ingrediente', 'Pesa un ingrediente'],
    ['Prepara la receta', 'Añade un ingrediente nuevo', 'Prepara el postre'],
  ),
  Manualidades: a(
    ['Coge el material', 'Abre la caja de material', 'Toca el material'],
    ['Pon el material sobre la mesa', 'Corta la primera pieza', 'Da la primera puntada'],
    ['Termina una parte de la pieza', 'Sigue un tutorial', 'Empieza una pieza nueva'],
  ),
  Instrumento: a(
    ['Mira el instrumento', 'Coge el instrumento', 'Abre la funda'],
    ['Toca una nota', 'Afina una cuerda', 'Toca una escala'],
    ['Toca una canción', 'Toca tu canción favorita', 'Repite el ejercicio de la última clase'],
  ),
  Jardín: a(
    ['Coge la regadera', 'Mira las plantas', 'Toca la tierra de una maceta'],
    ['Llena la regadera', 'Riega una planta', 'Quita una hoja seca'],
    ['Riega todas las plantas', 'Cambia una planta de maceta', 'Quita las hojas secas de todas las plantas'],
  ),
  Meditación: a(
    ['Cierra los ojos', 'Respira hondo una vez', 'Pon las manos sobre las rodillas'],
    ['Respira hondo 3 veces', 'Pon una meditación guiada', 'Siéntate con la espalda recta'],
    ['Haz una meditación guiada', 'Respira hondo 10 veces', 'Medita en un sitio tranquilo'],
  ),

  // ── Descanso y autocuidado ──
  Descanso: a(
    ['Deja el móvil en la mesilla', 'Apaga la luz grande', 'Tápate con la manta'],
    ['Pon el móvil a cargar lejos de la cama', 'Ponte el pijama', 'Lávate los dientes'],
    ['Acuéstate', 'Lee una página en la cama', 'Apaga todas las pantallas'],
  ),
  Aseo: a(
    ['Mira la puerta del baño', 'Coge la toalla', 'Ponte las zapatillas de casa'],
    ['Lávate la cara', 'Lávate los dientes', 'Abre la ducha'],
    ['Dúchate', 'Lávate el pelo', 'Prepara la ropa limpia'],
  ),
  Skincare: a(
    ['Coge un producto', 'Abre el bote de crema', 'Mírate en el espejo'],
    ['Lávate la cara', 'Ponte la crema hidratante', 'Ponte protector solar'],
    ['Haz tu rutina completa', 'Ponte una mascarilla', 'Desmaquíllate'],
  ),
  Comida: a(
    ['Mira hacia la cocina', 'Coge un plato', 'Abre la nevera'],
    ['Saca algo de la nevera', 'Pon un plato en la mesa', 'Calienta la comida'],
    ['Prepara algo sencillo', 'Siéntate a comer', 'Come sin mirar el móvil'],
  ),
  Hidratación: a(
    ['Bebe un sorbo de agua', 'Coge un vaso', 'Coge la botella'],
    ['Llena un vaso de agua', 'Bebe un vaso de agua', 'Llena la botella'],
    ['Bebe un vaso de agua entero', 'Deja una botella llena en tu mesa', 'Bebe un vaso de agua con limón'],
  ),
  Desconexión: a(
    ['Deja el móvil boca abajo', 'Cierra los ojos', 'Respira hondo una vez'],
    ['Deja el móvil en otra habitación', 'Asómate a la ventana', 'Túmbate'],
    ['Sal a dar un paseo sin móvil', 'Haz algo sin pantallas', 'Escucha una canción con los ojos cerrados'],
  ),

  // ── Ampliación de la app ──
  'Pasear al perro': a(
    ['Coge la correa', 'Llama al perro', 'Ponte un zapato'],
    ['Ponle la correa al perro', 'Ponte los zapatos', 'Sal al portal con el perro'],
    ['Da una vuelta a la manzana con el perro', 'Pasea al perro por un sitio nuevo', 'Lleva al perro al parque'],
  ),
  Veterinario: a(
    ['Busca el teléfono del veterinario', 'Coge la cartilla de tu mascota', 'Abre la web del veterinario'],
    ['Marca el número sin pulsar llamar', 'Pon la cartilla en la mesa', 'Pide la cita en la web'],
    ['Llama para pedir la cita', 'Prepara el transportín', 'Lleva a tu mascota al veterinario'],
  ),
  Mascotas: a(
    ['Coge el cuenco del agua', 'Llama a tu mascota', 'Coge un juguete'],
    ['Llena el cuenco de agua', 'Pon comida en el cuenco', 'Juega con tu mascota con un juguete'],
    ['Limpia el arenero', 'Cepilla a tu mascota', 'Juega con tu mascota con un juguete nuevo'],
  ),
}

/* ── Modificadores INCUP: dan sabor sin añadir otra acción ni tiempos ──
   Novedad cambia el método · Desafío pone un reto sin reloj · Pasión añade algo que gusta ·
   Interés añade a alguien o un detalle · Urgencia pone un micro-límite sin cronómetro.
   En Pesado solo valen los que se pueden hacer sin levantarse ni organizar nada. */
export const MODIFICADORES: Record<'normal' | 'pesado', Record<TipoReto, string[]>> = {
  normal: {
    novedad: ['con la mano que no usas', 'en silencio', 'en un sitio distinto al de siempre', 'de una forma distinta a la de siempre'],
    desafio: ['sin mirar el móvil', 'a la primera', 'sin hacer nada más a la vez'],
    pasion: ['con tu música favorita de fondo', 'con tu bebida favorita al lado', 'con algo que te guste cerca'],
    interes: ['con alguien cerca', 'con una persona en videollamada', 'fijándote en un detalle que no habías visto'],
    urgencia: ['antes de mirar el móvil', 'antes de que se enfríe tu café', 'antes de cambiar de pestaña', 'mientras suena una canción'],
  },
  pesado: {
    novedad: ['en silencio', 'con la mano que no usas', 'de una forma distinta a la de siempre'],
    desafio: ['sin mirar el móvil', 'a la primera', 'sin hacer nada más a la vez'],
    pasion: ['con tu música favorita de fondo', 'con algo que te guste cerca', 'con tu bebida favorita al lado'],
    interes: ['fijándote en un detalle que no habías visto', 'con alguien cerca'],
    urgencia: ['antes de mirar el móvil', 'mientras suena una canción', 'antes de que se enfríe tu café'],
  },
}

/* «Está hecho cuando…» según el nivel: decide la persona al pulsar «Reto conseguido» */
export const HECHO_POR_NIVEL: Record<Nivel, string> = {
  pesado: 'lo has hecho una vez. Con eso basta',
  medio: 'lo has hecho una vez. Con eso basta',
  ligero: 'tú lo des por hecho',
}
