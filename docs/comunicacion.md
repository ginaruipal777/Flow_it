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

- Sin preguntas que juzgan («¿a que no…?»). Una pregunta solo puede ser una invitación («¿Te apuntas?»).
- Sin rachas, castigos ni lenguaje de culpa.
- Dejar algo a medias es una opción normal y se dice así («Lo dejo aquí por hoy»).

## 5. Tono atrevido, pero solo en la entradilla

- El titular de cada carta empieza con una entradilla con energía, siempre la misma por tipo: Novedad «¡Plan nuevo!», Desafío «Reto rápido: … ¿Te apuntas?», Pasión «Modo disfrute:», Interés «Hazlo interesante:», Urgencia «¡Ya! …, antes de que te lo pienses».
- La acción sigue siendo literal y entera. Los pasos y el «Está hecho cuando…» del detalle no llevan entradilla.

## 6. Predecible

- Cada tipo de carta usa siempre la misma estructura alrededor de la acción. Lo que cambia es la acción, no la forma de decirla.
- Los botones dicen lo que pasa al pulsarlos («Reto conseguido», «Archivar reto»).

## 7. Sin género para la persona

- Frases que valen para cualquiera: «ya habrás empezado», no «estarás list@».

## Cómo se aplica a los retos

Los textos se generan en [src/datos/reglas.ts](../src/datos/reglas.ts) (`FRASES` y `tono`). Para «Responder el email de Carlos»:

| Carta | Titular de la carta | Está hecho cuando |
|---|---|---|
| Novedad | ¡Plan nuevo! Escribe el saludo del correo desde el móvil en vez del ordenador. | el saludo está escrito |
| Desafío | Reto rápido: escribe la respuesta en 3 frases como máximo. ¿Te apuntas? | el correo tiene 3 frases o menos |
| Pasión | Modo disfrute: pon una canción que te guste y escribe el saludo mientras suena. | el saludo está escrito |
| Interés | Hazlo interesante: escribe en una línea qué te pide esa persona. | tienes lo que te pide escrito en una línea |
| Urgencia | ¡Ya! Abre el correo y escribe solo el saludo, antes de que te lo pienses. | el saludo está escrito en el correo |

## Diseño de las tareas

| Principio | Cómo está en la app |
|---|---|
| Micropasos, de uno en uno | Cada reto se divide en pasos cortos; el detalle muestra solo el paso actual, en grande, y al marcarlo aparece el siguiente. |
| Criterio de éxito explícito | Cada reto dice «Está hecho cuando…» con algo que se puede ver o comprobar («el saludo está escrito en el correo»). Está en el campo `hecho` de cada regla. |
| Apoyo visual y escrito | Lista de verificación en el detalle, libreta de «Tus tareas» y contador de retos con mini cartas. |
| Lectura en voz alta | Botón «Escuchar» en el detalle: lee el reto, los pasos y el criterio de éxito (voz del sistema). |
| Control de tiempos y descansos | El modo enfoque ofrece «Sin límite», «10 min + 3 de descanso» o «25 min + 5 de descanso», con barra visual y aviso al cambiar de fase. Ningún reto tiene límite obligatorio. |
| Integración de intereses | Pendiente: la app aún no sabe qué le interesa a cada persona. |
| Recompensa (método RAN) | En el detalle se puede elegir un premio; «Reto conseguido» lo recuerda. |
| Más retos si no encaja ninguno | Al rechazar las 5 cartas llega un mazo nuevo con 5 retos distintos de la misma tarea (3 mazos, 15 retos). |
| Menos esfuerzo para arrancar | Si en Inicio se marca «Pesado», el reto se reduce al primer paso. |
| Menos distracciones | El modo enfoque recuerda silenciar notificaciones y cerrar lo que no se use. |

## Pendiente

Las pautas también piden ofrecer otros canales además del texto y respetar el ritmo de cada persona. Ideas para más adelante: preguntar los intereses en el onboarding y usarlos en los retos, una opción para reducir animaciones dentro de la app (ya se respeta el ajuste «reducir movimiento» del sistema).

## Fuentes

- GAM Medical, «Cómo motivarte con la parálisis TDAH» (revisión clínica de Aintzane García). Factores INCUP (Interés, Novedad, Competencia, Urgencia, Pasión): son las 5 cartas de la app, y «Competencia» es la carta Desafío. Método RAN (Recompensa, Responsabilidad, Novedad), micropasos, seguimiento del progreso y reducir distracciones.
- Isaac V., López V., Escobar M. J. (2024). «Arousal dysregulation and executive dysfunction in ADHD». *Frontiers in Psychiatry*, 14:1336040. https://pmc.ncbi.nlm.nih.gov/articles/PMC10827919/ — El rendimiento en TDAH varía mucho de un momento a otro y mejora cuando la tarea pide menos esfuerzo y cuando hay recompensa. Por eso los retos son mínimos, se reducen más si la tarea pesa y se puede elegir un premio.
- Sanitas, «Ocho pasos para lograr que los niños con TDAH hagan los deberes»: instrucciones de una en una, tareas divididas y descansos entre ellas.
- Carepatron, «Lista de tareas para el TDAH»: time-boxing y descansos programados.
