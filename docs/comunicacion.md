# Cómo habla Flow it!

Pautas para todos los textos de la app (retos, botones, avisos). Están pensadas para personas neurodivergentes (TDAH, autismo, dislexia, dispraxia), que son buena parte de quienes usan la app, y hacen los textos más fáciles para todo el mundo.

## 1. Claro y literal

- Di exactamente qué hay que hacer. Nada se da por sobreentendido.
- Sin metáforas, ironías ni frases hechas («cambia el chip», «tranqui», «a tope»): se pueden leer al pie de la letra.
- Sin emojis dentro de las instrucciones.
- Tuteo y palabras de todos los días.

## 2. Instrucciones concretas

- La acción va primero y entera: «Abre el correo y escribe solo el saludo».
- Si una acción tiene varias partes, se dividen en pasos numerados que se pueden marcar.
- Una acción concreta y observable, nunca una actitud («concéntrate», «hazlo bien»).

## 3. Tiempos reales, nunca vagos

- Nada de «luego», «cuando puedas» o «más tarde». Si hay un momento, se dice: «ahora, antes de empezar otra cosa».
- Sin cronómetros obligatorios ni cuentas atrás que presionen.

## 4. Sin presión

- Sin preguntas que retan o juzgan («¿te atreves?», «¿a que no…?»).
- Sin rachas, castigos ni lenguaje de culpa.
- Dejar algo a medias es una opción normal y se dice así («Lo dejo aquí por hoy»).

## 5. Predecible

- Cada tipo de carta usa siempre la misma estructura alrededor de la acción. Lo que cambia es la acción, no la forma de decirla.
- Los botones dicen lo que pasa al pulsarlos («Reto conseguido», «Archivar reto»).

## 6. Sin género para la persona

- Frases que valen para cualquiera: «ya habrás empezado», no «estarás list@».

## Cómo se aplica a los retos

Los textos se generan en [src/datos/reglas.ts](../src/datos/reglas.ts) (`FRASES` y `tono`). Para «Responder el email de Carlos»:

| Carta | Texto |
|---|---|
| Novedad | Abre el correo y escribe solo el saludo. Puedes hacerlo en un sitio distinto al de siempre. |
| Desafío | Objetivo: abre el correo y escribe solo el saludo. |
| Pasión | Abre el correo y escribe solo el saludo. Al hacerlo, ya habrás empezado la tarea. |
| Interés | Abre el correo y escribe solo el saludo. |
| Urgencia | Abre el correo y escribe solo el saludo. Hazlo ahora, antes de empezar otra cosa. |
| Pasos (detalle) | ☐ 1. Abre el correo.<br>☐ 2. Escribe solo el saludo.<br>**Está hecho cuando** el saludo está escrito en el correo. |

## Diseño de las tareas

| Principio | Cómo está en la app |
|---|---|
| Micropasos | Cada reto se divide en pasos cortos y en orden; en el detalle se marcan uno a uno. |
| Criterio de éxito explícito | Cada reto dice «Está hecho cuando…» con algo que se puede ver o comprobar («el saludo está escrito en el correo»). Está en el campo `hecho` de cada regla. |
| Apoyo visual y escrito | Lista de verificación en el detalle, libreta de «Tus tareas» y contador de retos con mini cartas. |
| Lectura en voz alta | Botón «Escuchar» en el detalle: lee el reto, los pasos y el criterio de éxito (voz del sistema). |
| Control de tiempos | El cronómetro del modo enfoque es opcional; ningún reto tiene límite de tiempo. |
| Integración de intereses | Pendiente: la app aún no sabe qué le interesa a cada persona. |

## Pendiente

Las pautas también piden ofrecer otros canales además del texto y respetar el ritmo de cada persona. Ideas para más adelante: preguntar los intereses en el onboarding y usarlos en los retos, pausas programadas en el modo enfoque y una opción para reducir animaciones dentro de la app (ya se respeta el ajuste «reducir movimiento» del sistema).
