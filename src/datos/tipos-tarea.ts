import type { Categoria } from '../components/Icono/iconos'

/* Cuando la app no reconoce la tarea ni encuentra en internet cómo se hace, pregunta de qué
   tipo es en vez de dar retos genéricos. Cada respuesta lleva a una categoría del banco
   (banco.ts) y al icono de la app. Frases cortas y literales, de cosas que se hacen. */

export type TipoTarea = { texto: string; categoria: string; icono: Categoria }

export const TIPOS_TAREA: TipoTarea[] = [
  { texto: 'Arreglar o montar algo', categoria: 'Manualidades', icono: 'casa' },
  { texto: 'Limpiar u ordenar', categoria: 'Doméstico', icono: 'limpieza' },
  { texto: 'Papeleo o un trámite', categoria: 'Administrativo', icono: 'trabajo' },
  { texto: 'Con el móvil o el ordenador', categoria: 'Digital', icono: 'trabajo' },
  { texto: 'Escribir un mensaje o un correo', categoria: 'Comunicación', icono: 'trabajo' },
  { texto: 'Llamar a alguien', categoria: 'Llamadas', icono: 'llamadas' },
  { texto: 'Quedar con alguien', categoria: 'Quedar con amigos', icono: 'social' },
  { texto: 'Comprar algo', categoria: 'Compra', icono: 'alimentacion' },
  { texto: 'Cocinar o comer', categoria: 'Cocina', icono: 'alimentacion' },
  { texto: 'Estudiar o leer', categoria: 'Académico', icono: 'estudios' },
  { texto: 'Moverte o salir a la calle', categoria: 'Caminar', icono: 'deporte' },
  { texto: 'Cuidarte', categoria: 'Aseo', icono: 'higiene' },
]
