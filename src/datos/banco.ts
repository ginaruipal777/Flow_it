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
    ['Abre el libro por la página del tema', 'Lee el título del tema', 'Mira el índice del libro'],
    ['Lee la primera línea del tema', 'Subraya una palabra del primer párrafo', 'Escribe el título del tema en una hoja'],
    ['Lee el primer párrafo en voz alta', 'Copia la primera definición del tema en una hoja', 'Escribe 3 palabras clave del primer párrafo'],
  ),
  Llamadas: a(
    ['Coge el móvil con la mano', 'Abre la agenda del móvil', 'Busca el número en la agenda'],
    ['Marca el número sin pulsar llamar', 'Pon el móvil delante de ti con el número en pantalla', 'Abre la web de citas de ese sitio'],
    ['Pulsa el botón de llamar', 'Pide la cita en la web', 'Envía un mensaje para pedir la cita'],
  ),
  Decisión: a(
    ['Coge un papel', 'Coge un bolígrafo', 'Abre la aplicación de notas'],
    ['Escribe arriba del papel lo que tienes que decidir', 'Escribe la primera opción en el papel', 'Dibuja una línea en medio del papel'],
    ['Escribe las 2 opciones en el papel', 'Escribe una ventaja de la primera opción', 'Lanza una moneda entre las 2 opciones'],
  ),
  Creativo: a(
    ['Abre el documento del proyecto', 'Coge el lápiz', 'Mira la última página que hiciste'],
    ['Escribe el título del proyecto', 'Escribe una palabra en el documento', 'Dibuja un garabato en una esquina de la hoja'],
    ['Escribe una frase en el documento', 'Dibuja en el cuaderno un boceto de tu idea', 'Escribe 3 ideas en una lista'],
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
    ['Escribe en la lista el producto que falta en la nevera', 'Abre la nevera', 'Coge las bolsas de la compra'],
    ['Escribe la lista con 5 cosas', 'Pulsa «Pedir» en la web del súper', 'Sal a la tienda con la lista'],
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
    ['Pon el capítulo', 'Busca la serie en la aplicación', 'Pon un cuenco de picoteo junto al sofá'],
    ['Mira un capítulo entero', 'Deja el móvil en otra habitación', 'Pon el siguiente capítulo'],
  ),
  'Ver película': a(
    ['Coge el mando', 'Abre la plataforma', 'Siéntate en el sofá'],
    ['Busca una película en la plataforma', 'Mira el tráiler de una película', 'Pon la primera película de tu lista'],
    ['Pon la película', 'Mira la película entera', 'Mete las palomitas en el microondas'],
  ),
  Lectura: a(
    ['Coge el libro', 'Abre el libro por el marcapáginas', 'Lee el título del capítulo'],
    ['Lee una página del libro', 'Lee el primer párrafo en voz alta', 'Subraya una frase que te guste'],
    ['Lee 5 páginas', 'Lee hasta el final del capítulo', 'Lee una página entera en voz alta'],
  ),
  Videojuego: a(
    ['Coge el mando', 'Enciende la consola', 'Abre el juego'],
    ['Carga tu última partida', 'Entra en el primer nivel', 'Juega una partida corta'],
    ['Supera un nivel', 'Juega una partida entera', 'Prueba un modo que no hayas usado'],
  ),
  Música: a(
    ['Coge los auriculares', 'Abre la aplicación de música', 'Pulsa el botón de play'],
    ['Pon una canción que te guste', 'Busca un disco que te guste', 'Sube el volumen'],
    ['Guarda 5 canciones en una lista nueva', 'Escucha un disco entero', 'Pon un artista que no conozcas'],
  ),
  Podcast: a(
    ['Ponte los auriculares', 'Abre la aplicación de podcasts', 'Pulsa play en el último episodio'],
    ['Pon el episodio', 'Busca el podcast', 'Escucha la presentación del episodio'],
    ['Escucha un episodio entero', 'Apunta una idea del episodio', 'Escucha el episodio paseando'],
  ),
  Vídeo: a(
    ['Abre la aplicación de vídeos', 'Ponte los auriculares', 'Coge el móvil'],
    ['Busca el vídeo', 'Pulsa play en el vídeo', 'Guarda el vídeo en tu lista'],
    ['Mira el vídeo entero', 'Copia en tu libreta el primer paso que enseña el vídeo', 'Apunta una cosa que aprendas del vídeo'],
  ),

  // ── Deporte y movimiento ──
  Gimnasio: a(
    ['Estira los brazos hacia arriba', 'Mira la mochila del gimnasio', 'Ponte una zapatilla'],
    ['Ponte la ropa de deporte', 'Baja 5 veces en sentadilla junto a una silla', 'Llena la botella de agua'],
    ['Coge las pesas para una serie de tu ejercicio favorito', 'Sal hacia el gimnasio', 'Completa 3 ejercicios de la tabla de tu rutina'],
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
    ['Extiende la esterilla', 'Ponte en la esterilla en la postura del niño', 'Pon un vídeo de yoga'],
    ['Sigue 3 posturas del vídeo de yoga', 'Sigue una clase de yoga en vídeo', 'Estira las piernas sobre la esterilla'],
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
    ['Envía «Hola» en su chat', 'Envía un audio corto', 'Envía un emoji'],
    ['Llama a esa persona', 'Escribe un mensaje de dos líneas', 'Pregúntale qué tal está'],
  ),
  Cumpleaños: a(
    ['Abre el chat de esa persona', 'Busca una foto en la que salgáis juntos', 'Escribe la palabra «Felicidades»'],
    ['Envía «¡Felicidades!» en su chat', 'Envía una foto en la que salgáis juntos', 'Envía un audio cantando «Cumpleaños feliz»'],
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
    ['Responde a 3 mensajes', 'Escribe una pregunta en el chat del grupo', 'Envía un audio al grupo'],
  ),

  // ── Hobbies y creatividad ──
  Dibujo: a(
    ['Coge un lápiz', 'Pon un papel en la mesa', 'Abre el cuaderno'],
    ['Dibuja un círculo', 'Dibuja una línea', 'Dibuja la taza que tengas en la mesa'],
    ['Dibuja en el cuaderno tu objeto favorito', 'Dibuja en el cuaderno la vista de tu ventana', 'Llena una página de garabatos'],
  ),
  Escritura: a(
    ['Abre el cuaderno', 'Coge el bolígrafo', 'Abre el documento'],
    ['Escribe la fecha', 'Escribe una palabra', 'Escribe el título'],
    ['Escribe una frase', 'Escribe un párrafo', 'Escribe en el cuaderno una cosa que te ha pasado hoy'],
  ),
  Fotografía: a(
    ['Coge la cámara', 'Abre la cámara del móvil', 'Mira por la ventana'],
    ['Pulsa el disparador de la cámara', 'Fotografía con el móvil un objeto rojo de tu casa', 'Limpia el objetivo'],
    ['Saca 5 fotos con la cámara', 'Edita una foto', 'Sal a la calle con la cámara colgada'],
  ),
  'Cocina creativa': a(
    ['Abre el libro de recetas', 'Coge un delantal', 'Mira la nevera'],
    ['Saca los ingredientes de la receta', 'Lava un ingrediente', 'Pesa un ingrediente'],
    ['Prepara la receta', 'Añade un ingrediente nuevo', 'Prepara el postre'],
  ),
  Manualidades: a(
    ['Coge el material', 'Abre la caja de material', 'Toca el material'],
    ['Pon el material sobre la mesa', 'Corta la primera pieza', 'Da la primera puntada'],
    ['Termina una fila de la pieza', 'Sigue un tutorial', 'Empieza una pieza nueva'],
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
    ['Escucha una meditación guiada en el móvil', 'Respira hondo 10 veces', 'Siéntate en un cojín con los ojos cerrados'],
  ),

  // ── Descanso y autocuidado ──
  Descanso: a(
    ['Deja el móvil en la mesilla', 'Apaga la luz grande', 'Tápate con la manta'],
    ['Pon el móvil a cargar lejos de la cama', 'Ponte el pijama', 'Lávate los dientes'],
    ['Métete en la cama', 'Lee una página en la cama', 'Apaga todas las pantallas'],
  ),
  Aseo: a(
    ['Mira la puerta del baño', 'Coge la toalla', 'Ponte las zapatillas de casa'],
    ['Lávate la cara', 'Lávate los dientes', 'Abre la ducha'],
    ['Abre el grifo de la ducha', 'Lávate el pelo', 'Prepara la ropa limpia'],
  ),
  Skincare: a(
    ['Coge un producto', 'Abre el bote de crema', 'Mírate en el espejo'],
    ['Lávate la cara', 'Ponte la crema hidratante', 'Ponte protector solar'],
    ['Ponte cada producto de tu rutina en la cara', 'Ponte una mascarilla', 'Pasa el desmaquillante por la cara'],
  ),
  Comida: a(
    ['Mira hacia la cocina', 'Coge un plato', 'Abre la nevera'],
    ['Saca de la nevera un yogur', 'Pon un plato en la mesa', 'Calienta la comida'],
    ['Prepara un bocadillo en un plato', 'Siéntate a comer', 'Come sin mirar el móvil'],
  ),
  Hidratación: a(
    ['Bebe un sorbo de agua', 'Coge un vaso', 'Coge la botella'],
    ['Llena un vaso de agua', 'Bebe un vaso de agua', 'Llena la botella'],
    ['Bebe un vaso de agua entero', 'Deja una botella llena en tu mesa', 'Bebe un vaso de agua con limón'],
  ),
  Desconexión: a(
    ['Deja el móvil boca abajo', 'Cierra los ojos', 'Respira hondo una vez'],
    ['Deja el móvil en otra habitación', 'Asómate a la ventana', 'Túmbate en el sofá'],
    ['Sal a dar un paseo sin móvil', 'Coge un libro de papel', 'Escucha una canción con los ojos cerrados'],
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
  Test: a(
    ['Abre la app del test', 'Coge el móvil con la app del test', 'Mira la primera pregunta del test'],
    ['Lee la primera pregunta del test', 'Marca la respuesta de la primera pregunta', 'Pon el test en pantalla completa'],
    ['Contesta 5 preguntas del test', 'Contesta un test completo en la app', 'Repasa en la app las preguntas falladas del último test'],
  ),
}

/* ── Modificadores INCUP: cambian el ENFOQUE, no la mecánica ──
   El INCUP no añade fricción artificial (nada de «con la mano que no usas»): da otro enfoque
   que encaja con el tipo de actividad. Si la tarea es leer, la Novedad es «empezando por la
   última línea» o «usando una regla para no perderte»; si es salir a andar, «por una calle distinta».
   - Novedad: otro orden, otra herramienta u otro sitio.
   - Desafío: un número o una meta pequeña, sin reloj.
   - Pasión: algo que te gusta alrededor.
   - Interés: alguien cerca o fijarse en algo nuevo.
   - Urgencia: un micro-límite sin cronómetro.
   Cada familia tiene su lista normal y, en Pesado, solo modificadores que se pueden cumplir
   sin levantarse de la cama. */

export type Familia = 'general' | 'pantalla' | 'mensajes' | 'lectura' | 'escritura' | 'creativo' | 'ritmo' | 'casa' | 'movimiento' | 'calma'
type Lista = Record<TipoReto, string[]>
export type Modificadores = { normal: Lista; pesado: Lista }

const URGENCIA = ['antes de mirar las notificaciones', 'antes de que se enfríe tu café', 'mientras suena una canción']
const PASION = ['con tu música favorita de fondo', 'con tu bebida favorita al lado', 'con una manta encima']
const INTERES = ['fijándote en un detalle que no habías visto', 'con alguien cerca', 'como si se lo enseñaras a alguien']
const DESAFIO = ['a la primera', 'sin mirar las notificaciones', 'sin parar a mitad']

const familia = (novedad: string[], novedadPesado: string[], otros: Partial<Lista> = {}, pesado: Partial<Lista> = {}): Modificadores => {
  const normal: Lista = { novedad, desafio: DESAFIO, pasion: PASION, interes: INTERES, urgencia: URGENCIA, ...otros }
  return { normal, pesado: { ...normal, novedad: novedadPesado, ...pesado } }
}

export const MODIFICADORES: Record<Familia, Modificadores> = {
  // Tareas sin categoría (respaldo)
  general: familia(
    ['en un sitio de la casa distinto al de siempre', 'con otra luz en la habitación', 'con la libreta abierta delante'],
    ['con otra luz en la habitación', 'con la libreta abierta delante', 'con una manta encima'],
  ),
  pantalla: familia(
    ['desde el ordenador en vez del móvil', 'con la pantalla en modo oscuro', 'en un sitio de la casa distinto al de siempre'],
    ['con la pantalla en modo oscuro', 'con el brillo de la pantalla bajo', 'con el móvil en horizontal'],
  ),
  mensajes: familia(
    ['con un audio en vez de texto', 'con una foto en vez de texto', 'con un emoji al final'],
    ['con un emoji al final', 'con un audio en vez de texto', 'con una foto en vez de texto'],
    {
      desafio: ['en una sola frase', 'a la primera', 'sin borrar nada'],
      interes: ['con una pregunta para esa persona', 'recordando un plan que compartisteis', 'fijándote en su última foto'],
    },
  ),
  lectura: familia(
    ['empezando por la última línea', 'usando una regla para no perderte', 'señalando cada línea con el dedo'],
    ['empezando por la última línea', 'señalando la línea con el dedo', 'usando una regla para no perderte'],
    { desafio: ['contando las palabras que no conoces', 'sin pasar de página', 'buscando 2 palabras clave'] },
    { desafio: ['sin pasar de página', 'a la primera', 'sin mirar las notificaciones'] },
  ),
  escritura: familia(
    ['con un boli de otro color', 'en una hoja suelta', 'en mayúsculas'],
    ['con un boli de otro color', 'en mayúsculas', 'en una hoja suelta'],
    { desafio: ['en una sola línea', 'sin borrar nada', 'con 10 palabras como máximo'] },
    { desafio: ['en una sola línea', 'sin borrar nada', 'a la primera'] },
  ),
  creativo: familia(
    ['con un material que no sueles usar', 'empezando por el borde de la hoja', 'desde un ángulo distinto al de siempre'],
    ['con un material que no sueles usar', 'desde un ángulo distinto al de siempre', 'empezando por el borde de la hoja'],
    { desafio: ['sin borrar nada', 'a la primera', 'con 3 colores como máximo'] },
    { desafio: ['sin borrar nada', 'a la primera', 'sin mirar las notificaciones'] },
  ),
  ritmo: familia(
    ['más despacio que de costumbre', 'con una canción que no conoces', 'empezando por el final'],
    ['más despacio que de costumbre', 'con una canción que no conoces', 'empezando por el final'],
  ),
  casa: familia(
    ['empezando por el lado contrario', 'en un orden distinto al de siempre', 'con una lista de reproducción nueva'],
    ['empezando por el lado contrario', 'en un orden distinto al de siempre', 'con una lista de reproducción nueva'],
    { desafio: ['contando cada cosa en voz alta', 'a la primera', 'sin parar a mitad'] },
  ),
  movimiento: familia(
    ['por una calle distinta', 'con una canción nueva en los auriculares', 'en un orden distinto al de siempre'],
    ['con una canción nueva en los auriculares', 'mirando por la ventana', 'con tu ropa más cómoda'],
    {
      desafio: ['contando los pasos', 'a la primera', 'sin parar a mitad'],
      pasion: ['con tu música favorita en los auriculares', 'con tu ropa de deporte favorita', 'con tu bebida favorita preparada'],
      interes: ['con alguien que te acompañe', 'fijándote en un detalle que no habías visto', 'con alguien cerca'],
    },
    {
      desafio: ['a la primera', 'sin mirar las notificaciones', 'sin parar a mitad'],
      interes: ['fijándote en un detalle que no habías visto', 'con alguien cerca', 'como si se lo enseñaras a alguien'],
    },
  ),
  calma: familia(
    ['con una luz más suave', 'en un sitio de la casa distinto al de siempre', 'con una música tranquila nueva'],
    ['con una luz más suave', 'con una música tranquila nueva', 'con una manta encima'],
    { pasion: ['con tu música favorita de fondo', 'con tu olor favorito cerca', 'con tu bebida caliente favorita'] },
  ),
}

/* Familia de cada categoría: decide qué modificadores INCUP le encajan */
export const FAMILIA: Record<string, Familia> = {
  Comunicación: 'pantalla', Administrativo: 'pantalla', Académico: 'lectura', Llamadas: 'pantalla',
  Decisión: 'escritura', Creativo: 'escritura', Digital: 'pantalla', Test: 'pantalla',
  Doméstico: 'casa', Compra: 'casa', Cocina: 'casa', Ropa: 'casa',
  'Ver serie': 'pantalla', 'Ver película': 'pantalla', Lectura: 'lectura', Videojuego: 'pantalla',
  Música: 'ritmo', Podcast: 'pantalla', Vídeo: 'pantalla',
  Gimnasio: 'movimiento', Correr: 'movimiento', Caminar: 'movimiento', Yoga: 'movimiento', Bici: 'movimiento',
  Natación: 'movimiento', Baile: 'ritmo', Escalada: 'movimiento', 'Deporte en equipo': 'movimiento',
  'Quedar con amigos': 'mensajes', 'Llamada social': 'mensajes', Cumpleaños: 'mensajes', Fiesta: 'mensajes',
  Familia: 'mensajes', Cita: 'mensajes', 'Chat de grupo': 'mensajes',
  Dibujo: 'creativo', Escritura: 'escritura', Fotografía: 'creativo', 'Cocina creativa': 'casa',
  Manualidades: 'creativo', Instrumento: 'ritmo', Jardín: 'casa', Meditación: 'calma',
  Descanso: 'calma', Aseo: 'calma', Skincare: 'calma', Comida: 'casa', Hidratación: 'casa', Desconexión: 'calma',
  'Pasear al perro': 'movimiento', Veterinario: 'pantalla', Mascotas: 'casa',
}

/* «Está hecho cuando…» según el nivel: decide la persona al pulsar «Reto conseguido» */
export const HECHO_POR_NIVEL: Record<Nivel, string> = {
  pesado: 'lo has hecho una vez. Con eso basta',
  medio: 'lo has hecho una vez. Con eso basta',
  ligero: 'tú lo des por hecho',
}
