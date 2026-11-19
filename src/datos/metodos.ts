import type { TipoReto } from '../components/CartaReto/tipos'
import type { Nivel } from './banco'
import type { Fuente } from './situacion'

/* ─────────────────────────────────────────────────────────────
   Métodos: formas distintas de abordar la tarea, sacadas de webs de consejos para TDAH
   («cómo conseguir que una persona con TDAH ordene su cuarto», «cómo estudiar con TDAH»…).

   Cada tipo de actividad tiene un método por carta INCUP, con su fuente:
   - Novedad  → hacerlo de otra forma (por categorías, empezar por el medio, otro canal…).
   - Desafío  → convertirlo en un juego que se puede contar (búsqueda del tesoro, tarjetas…).
   - Pasión   → con algo que gusta (música, moverse, tu sitio favorito…).
   - Interés  → con compañía o contándolo (body doubling, explicarlo en voz alta…).
   - Urgencia → lo mínimo para arrancar; la app le añade el plazo del nivel.
   La actividad sale de la categoría de la tarea: los métodos de higiene no se usan para comer, por ejemplo.
   Mismas reglas que banco.ts (verbo físico, una acción, objeto concreto, sin «hacer»…);
   las comprueba scripts/validar-retos.mts y `npm run fuentes` revisa los enlaces.
   ───────────────────────────────────────────────────────────── */

export type Actividad = 'orden' | 'estudio' | 'escritura' | 'llamadas' | 'papeleo' | 'ejercicio' | 'cuidado' | 'comida'

export type Metodo = { nombre: string; fuente: Fuente; retos: Record<Nivel, string> }

export const FUENTES_METODOS = {
  cincoCosas: { nombre: 'Inflow · Limpiar con TDAH (método de las 5 cosas)', url: 'https://getinflow.io/post/cleaning-tips-for-adhd-adults' },
  tesoro: { nombre: 'ADHD New Zealand · Home neat home (búsqueda del tesoro)', url: 'https://adhd.org.nz/home-neat-home.html' },
  cesto: { nombre: 'ADHD Women · El cesto de recoger', url: 'https://medium.com/adhd-women/adhd-tool-the-tidy-up-basket-600e79dee395' },
  estudio: { nombre: 'Life Skills Advocate · Consejos de estudio con TDAH', url: 'https://lifeskillsadvocate.com/blog/study-tips-for-adhd-students/' },
  estudioTalkspace: { nombre: 'Talkspace · Cómo estudiar con TDAH', url: 'https://www.talkspace.com/mental-health/conditions/articles/how-to-study-with-adhd/' },
  dictado: { nombre: 'Spokenly · Dictar para escribir con TDAH', url: 'https://spokenly.app/blog/dictation-for-adhd' },
  escritura: { nombre: 'Jane Friedman · Escribir con TDAH', url: 'https://janefriedman.com/why-adhd-writers-brains-are-like-lions-and-how-to-harness-their-power/' },
  llamadas: { nombre: 'Inflow · Ansiedad al teléfono y TDAH', url: 'https://www.getinflow.io/post/phone-anxiety-and-adhd' },
  papeleo: { nombre: 'ADDitude · Organizar el papeleo con TDAH', url: 'https://www.additudemag.com/how-to-organize-paperwork-adhd-adults/' },
  ejercicio: { nombre: 'ADDA · Ejercicio y TDAH', url: 'https://add.org/exercising-your-adhd/' },
  higiene: { nombre: 'Life Skills Advocate · Higiene con TDAH', url: 'https://lifeskillsadvocate.com/blog/adhd-hygiene/' },
  cuidado: { nombre: 'CHADD · TDAH y cuidado personal', url: 'https://chadd.org/adhd-news/adhd-news-adults/attention-adhd-and-personal-care/' },
  necesidades: { nombre: 'Inflow · El TDAH y las necesidades básicas (comer, beber)', url: 'https://www.getinflow.io/post/adhd-hyperfocus-forgetful-affects-basic-human-needs' },
} satisfies Record<string, Fuente>

const F = FUENTES_METODOS
const m = (nombre: string, fuente: Fuente, pesado: string, medio: string, ligero: string): Metodo => ({
  nombre,
  fuente,
  retos: { pesado, medio, ligero },
})

export const METODOS: Record<Actividad, Record<TipoReto, Metodo>> = {
  orden: {
    novedad: m('Por categorías', F.cincoCosas, 'Mira el suelo buscando solo ropa', 'Recoge solo la basura que veas', 'Recoge la habitación por categorías empezando por la basura'),
    desafio: m('Búsqueda del tesoro', F.tesoro, 'Busca con la mirada 3 cosas fuera de su sitio', 'Busca 5 cosas que van en otra habitación', 'Busca 10 cosas que van en otra habitación'),
    pasion: m('Con tu música', F.cincoCosas, 'Pon la canción que más te anima', 'Recoge la ropa con tu canción más movida', 'Recoge la habitación con tu lista de música favorita'),
    interes: m('En compañía (body doubling)', F.cincoCosas, 'Escribe a una persona de confianza que vas a ordenar', 'Recoge la ropa con una persona de confianza en videollamada', 'Ordena la habitación con una persona de casa al lado'),
    urgencia: m('La bolsa de ida y vuelta', F.cesto, 'Coge una bolsa vacía', 'Mete en una bolsa 5 cosas que van en otra habitación', 'Vacía la bolsa de cosas en su sitio'),
  },
  estudio: {
    novedad: m('Explicarlo en voz alta', F.estudio, 'Lee en voz alta el título del tema', 'Explica en voz alta la primera idea del tema', 'Explica el tema a un peluche en voz alta'),
    desafio: m('Tarjetas de repaso', F.estudio, 'Escribe una pregunta del tema en un pósit', 'Escribe 3 tarjetas de pregunta del tema', 'Contesta 10 tarjetas de repaso'),
    pasion: m('Estudiar en movimiento', F.estudio, 'Lee la primera pregunta de pie', 'Repasa 3 tarjetas caminando por la casa', 'Repasa el tema caminando por la habitación'),
    interes: m('Estudiar en compañía', F.estudioTalkspace, 'Escribe a alguien de clase para estudiar', 'Abre una videollamada de estudio con alguien de clase', 'Estudia con alguien de clase en videollamada'),
    urgencia: m('Un bloque corto', F.estudioTalkspace, 'Abre los apuntes por el tema de hoy', 'Lee una página de los apuntes', 'Repasa 2 páginas de los apuntes'),
  },
  escritura: {
    novedad: m('Empezar por el medio', F.escritura, 'Escribe una frase suelta del medio del texto', 'Escribe primero el párrafo del medio', 'Escribe el texto empezando por el final'),
    desafio: m('Borrador feo a propósito', F.escritura, 'Escribe arriba «Borrador feo, vale todo»', 'Escribe 3 frases feas a propósito', 'Escribe un párrafo feo sin borrar nada'),
    pasion: m('Dictar en voz alta', F.dictado, 'Pulsa el micrófono del teclado del móvil', 'Dicta en voz alta la primera frase', 'Dicta en voz alta el primer párrafo'),
    interes: m('Contárselo a alguien', F.dictado, 'Escribe a una persona de confianza el tema del texto', 'Cuenta en un audio de qué va el texto', 'Explica el texto a una persona de casa'),
    urgencia: m('Escribir sin parar', F.dictado, 'Abre el documento del texto', 'Escribe sin borrar hasta llenar 5 líneas', 'Escribe sin borrar hasta llenar una página'),
  },
  llamadas: {
    novedad: m('Otro canal', F.llamadas, 'Busca si se puede pedir por la web', 'Escribe el mensaje en vez de llamar', 'Envía la consulta por correo en vez de llamar'),
    desafio: m('Un guion', F.llamadas, 'Escribe la primera frase que vas a decir', 'Escribe un guion de 3 frases', 'Lee el guion en voz alta 2 veces'),
    pasion: m('Desde tu sitio favorito', F.llamadas, 'Coge el móvil en tu sitio favorito de la casa', 'Marca el número desde tu sitio favorito', 'Llama desde tu sitio favorito de la casa'),
    interes: m('Escalera de llamadas', F.llamadas, 'Escribe a una persona de confianza que vas a llamar', 'Llama antes a una persona de confianza para calentar', 'Llama con una persona de confianza escuchando a tu lado'),
    urgencia: m('Llamar antes de darle vueltas', F.llamadas, 'Busca el número en el móvil', 'Marca el número en el móvil', 'Pulsa el botón de llamar del móvil'),
  },
  papeleo: {
    novedad: m('Partirlo en pasos', F.papeleo, 'Escribe el nombre del trámite en un pósit', 'Escribe en un pósit el primer paso del trámite', 'Escribe en una hoja los 3 pasos del trámite'),
    desafio: m('Un lote de papeles', F.papeleo, 'Coge 2 papeles del montón', 'Separa 5 papeles del montón', 'Archiva 10 papeles en su carpeta'),
    pasion: m('Con premio al lado', F.papeleo, 'Pon tu bebida favorita junto a los papeles', 'Abre los papeles con tu música favorita de fondo', 'Rellena el formulario con tu bebida favorita al lado'),
    interes: m('Papeleo en compañía', F.papeleo, 'Escribe a una persona de confianza que vas con el papeleo', 'Abre una videollamada con una persona de confianza', 'Rellena el formulario con una persona de confianza en videollamada'),
    urgencia: m('Solo el primer paso', F.papeleo, 'Abre la web del trámite en el móvil', 'Busca el formulario del trámite', 'Rellena la primera casilla del formulario del trámite'),
  },
  ejercicio: {
    novedad: m('Otra forma de moverte', F.ejercicio, 'Busca un vídeo de un ejercicio nuevo', 'Prueba un ejercicio nuevo de un vídeo', 'Sigue una clase de un deporte nuevo en vídeo'),
    desafio: m('Solo vestirte', F.ejercicio, 'Ponte un calcetín de deporte', 'Ponte la ropa de deporte completa', 'Completa 10 repeticiones de tu ejercicio favorito'),
    pasion: m('Música que te anima', F.ejercicio, 'Busca tu lista de música para moverte', 'Baila tu canción más movida', 'Muévete con tu lista de música favorita'),
    interes: m('Moverte en compañía', F.ejercicio, 'Escribe a una persona de confianza para moverte en compañía', 'Queda con una persona de confianza para caminar', 'Camina con una persona de confianza al lado'),
    urgencia: m('Lo mínimo para arrancar', F.ejercicio, 'Ponte de pie junto a la cama', 'Sal a la puerta de casa con ropa cómoda', 'Camina hasta la tercera esquina'),
  },
  cuidado: {
    novedad: m('La versión mínima', F.higiene, 'Pasa una toallita por la cara', 'Lávate solo la cara con agua', 'Dúchate sin lavarte el pelo'),
    desafio: m('Por pasos contados', F.higiene, 'Coge el cepillo de dientes', 'Lávate los dientes contando 20 cepilladas', 'Completa 3 pasos de tu rutina de aseo'),
    pasion: m('Con algo agradable', F.higiene, 'Huele tu gel favorito', 'Pon tu canción favorita en el baño', 'Dúchate con tu lista de música favorita'),
    interes: m('Con alguien que te acompañe', F.cuidado, 'Escribe a una persona de confianza que vas a cuidarte', 'Pide a una persona de casa que te avise para cenar', 'Prepara la cena con una persona de casa'),
    urgencia: m('Lo mínimo para cuidarte', F.cuidado, 'Bebe un trago de agua', 'Llena una taza de agua', 'Prepara un plato sencillo para ti'),
  },
  comida: {
    novedad: m('Comer sin cocinar', F.necesidades, 'Abre la nevera buscando comida ya lista', 'Saca de la nevera comida ya lista', 'Prepara un plato frío con lo que tengas'),
    desafio: m('Tres ingredientes', F.necesidades, 'Busca con la mirada 3 ingredientes en la despensa', 'Saca 3 ingredientes para un plato', 'Prepara un plato con 3 ingredientes'),
    pasion: m('Tu comida favorita fácil', F.necesidades, 'Busca la foto de tu comida favorita', 'Saca lo que necesitas para tu comida favorita', 'Prepara tu comida favorita fácil'),
    interes: m('Comer en compañía', F.necesidades, 'Escribe a una persona de casa para comer en compañía', 'Pon 2 platos en la mesa', 'Comparte la comida con una persona de casa'),
    urgencia: m('Lo mínimo para comer', F.necesidades, 'Coge una pieza de fruta', 'Pela una pieza de fruta', 'Prepara un bocadillo sencillo'),
  },
}

/** Actividad de cada categoría del banco (las de ocio no llevan métodos) */
export const ACTIVIDAD_DE_CATEGORIA: Record<string, Actividad> = {
  Doméstico: 'orden', Ropa: 'orden', Digital: 'orden',
  Académico: 'estudio', Test: 'estudio',
  Creativo: 'escritura', Escritura: 'escritura', Comunicación: 'escritura',
  Llamadas: 'llamadas', 'Llamada social': 'llamadas', Veterinario: 'llamadas', Cita: 'llamadas', Familia: 'llamadas',
  Administrativo: 'papeleo', Decisión: 'papeleo',
  Gimnasio: 'ejercicio', Correr: 'ejercicio', Caminar: 'ejercicio', Yoga: 'ejercicio', Bici: 'ejercicio', Natación: 'ejercicio',
  Baile: 'ejercicio', Escalada: 'ejercicio', 'Deporte en equipo': 'ejercicio', 'Pasear al perro': 'ejercicio',
  Aseo: 'cuidado', Skincare: 'cuidado', Descanso: 'cuidado',
  Comida: 'comida', Hidratación: 'comida', Cocina: 'comida',
}

/** Para tareas sin categoría: la actividad sale de la situación (situacion.ts) */
export const ACTIVIDAD_DE_SITUACION: Record<string, Actividad> = {
  enorme: 'orden',
  perfeccionismo: 'escritura',
  social: 'llamadas',
  aburrimiento: 'papeleo',
  energia: 'ejercicio',
  cuidarse: 'cuidado',
}
