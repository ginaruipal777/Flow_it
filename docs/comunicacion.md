# Cómo habla Flow it!

Pautas para todos los textos de la app (retos, botones, avisos). Están pensadas para personas neurodivergentes (TDAH, autismo, dislexia, dispraxia), que son buena parte de quienes usan la app, y hacen los textos más fáciles para todo el mundo.

## 1. Claro y literal

- Di exactamente qué hay que hacer. Nada se da por sobreentendido.
- Sin metáforas, ironías ni frases hechas («cambia el chip», «tranqui», «a tope»): se pueden leer al pie de la letra.
- Sin emojis dentro de las instrucciones.
- Tuteo y palabras de todos los días.

## 2. Instrucciones concretas

- La acción va primero y empieza por un verbo físico: «Abre la aplicación de correo».
- Una sola acción por reto: sin «y», «luego», «después», ni opciones con «o».
- Cero carga cognitiva: el reto no pide pensar, decidir, organizar ni planificar.
- Una acción concreta y observable, nunca una actitud («concéntrate», «hazlo bien»).
- En los retos no se usa la palabra «tarea»: se dice «reto» o «paso».
- **Objeto concreto obligatorio**: el reto nombra un objeto físico o digital (la app, el libro, la pantalla, la libreta, el boli). Prohibido «la primera parte» o «lo primero».
- **Sin el verbo «hacer»**: «Hacer un test» es abstracto. Se reformula con un verbo físico: «Abre la app del test», «Lee la primera pregunta», «Marca la respuesta».
- **El INCUP cambia el enfoque, no la mecánica**: sin fricción artificial («con la mano que no usas»). Si es leer, la Novedad es «empezando por la última línea» o «usando una regla para no perderte»; el Desafío pone un número («contando las palabras que no conoces»).

## 3. Tiempos reales, nunca vagos

- Nada de «luego», «cuando puedas» o «más tarde».
- Los retos no llevan tiempos ni prisas («en 2 minutos», «rápido», «tómate 5 minutos»). La urgencia se da con un micro-límite sin reloj: «antes de que se enfríe tu café», «mientras suena una canción».
- Sin cronómetros obligatorios ni cuentas atrás que presionen.

## 4. Sin presión

- Sin preguntas que juzgan («¿a que no…?»). Una pregunta solo puede ser una invitación («¿Te apuntas?»).
- Sin imperativos agresivos («¡Hazlo ya!»): tono neutral y amable.
- Decide la persona: el reto está hecho cuando pulsa «Reto conseguido».
- Sin rachas, castigos ni lenguaje de culpa.
- Dejar algo a medias es una opción normal y se dice así («Lo dejo aquí por hoy»).

## 5. Tono atrevido, pero solo en la entradilla

- El titular de cada carta empieza con una entradilla con energía, siempre la misma por tipo: Novedad «¡Plan nuevo!», Desafío «Mini reto: … ¿Te apuntas?», Pasión «Modo disfrute:», Interés «Ponle interés:», Urgencia «Ahora:».
- La acción sigue siendo literal y entera. Los pasos y el «Está hecho cuando…» del detalle no llevan entradilla.

## 6. Ley del esfuerzo inverso

Cuanto más pesa la tarea, más pequeña es la acción (nivel elegido en «¿Cuánto te pesa?»):

| Nivel | Duración | Cómo es la acción | Ejemplo |
|---|---|---|---|
| Ligero | 1–3 min | Puede tener algo de sustancia. | Escribe la primera frase de la respuesta |
| Medio | 30–60 s | Física, mecánica y acotada. | Pulsa «Responder» en ese correo |
| Pesado | 5–10 s | Casi ridícula, empieza por «Solo…». Prueba: ¿se podría hacer tumbado en la cama? | Solo abre la aplicación de correo |

## 7. Predecible

- Cada tipo de carta usa siempre la misma estructura alrededor de la acción. Lo que cambia es la acción, no la forma de decirla.
- Los botones dicen lo que pasa al pulsarlos («Reto conseguido», «Archivar reto»).

## 8. Sin género para la persona

- Frases que valen para cualquiera: «ya habrás empezado», no «estarás list@».

## Cómo se aplica a los retos

Los retos salen de una matriz de combinación: **acción del banco** ([src/datos/banco.ts](../src/datos/banco.ts), 3 por nivel y categoría) + **modificador INCUP** de cada carta + entradilla ([src/datos/reglas.ts](../src/datos/reglas.ts)). `npm run validar` comprueba que todos cumplen las pautas. Para «Responder el email de Carlos» con nivel Pesado:

| Carta | Titular de la carta | Está hecho cuando |
|---|---|---|
| Novedad | ¡Plan nuevo! Solo abre la aplicación de correo, con la pantalla en modo oscuro. | lo has hecho una vez. Con eso basta |
| Desafío | Mini reto: solo pon las manos sobre el teclado, a la primera. ¿Te apuntas? | lo has hecho una vez. Con eso basta |
| Pasión | Modo disfrute: solo mira el asunto del correo que tienes que responder, con tu música favorita de fondo. | lo has hecho una vez. Con eso basta |
| Interés | Ponle interés: solo abre la aplicación de correo, fijándote en un detalle que no habías visto. | lo has hecho una vez. Con eso basta |
| Urgencia | Ahora: solo pon las manos sobre el teclado, antes de mirar las notificaciones. | lo has hecho una vez. Con eso basta |

Los modificadores de cada carta dependen de la familia de la actividad (pantalla, mensajes, lectura, escritura, creativo, ritmo, casa, movimiento, calma): están en `MODIFICADORES` y `FAMILIA` de [src/datos/banco.ts](../src/datos/banco.ts).

## Diseño de las tareas

| Principio | Cómo está en la app |
|---|---|
| Micropasos, de uno en uno | Cada reto es una sola acción física; el detalle la muestra en grande. |
| Criterio de éxito explícito | Cada reto dice «Está hecho cuando…»: en Pesado y Medio «lo has hecho una vez. Con eso basta»; en Ligero, cuando tú lo des por hecho. |
| Apoyo visual y escrito | Lista de verificación en el detalle, libreta de «Tus tareas» y contador de retos con mini cartas. |
| Lectura en voz alta | Botón «Escuchar» en el detalle: lee el reto, los pasos y el criterio de éxito (voz del sistema). |
| Control de tiempos y descansos | El modo enfoque ofrece «Sin límite», «10 min + 3 de descanso» o «25 min + 5 de descanso», con barra visual y aviso al cambiar de fase. Ningún reto tiene límite obligatorio. |
| Integración de intereses | Pendiente: la app aún no sabe qué le interesa a cada persona. |
| Recompensa (método RAN) | En el detalle se puede elegir un premio; «Reto conseguido» lo recuerda. |
| Más retos si no encaja ninguno | Al rechazar las 5 cartas llega un mazo nuevo con 5 retos distintos de la misma tarea (6 mazos, 30 retos), sin repetir ninguna combinación de acción y modificador. |
| Menos esfuerzo para arrancar | El nivel de esfuerzo elige el tamaño de la acción: Ligero 1–3 min, Medio 30–60 s, Pesado 5–10 s. |
| Menos distracciones | El modo enfoque recuerda silenciar notificaciones y cerrar lo que no se use. |

## Pendiente

Las pautas también piden ofrecer otros canales además del texto y respetar el ritmo de cada persona. Ideas para más adelante: preguntar los intereses en el onboarding y usarlos en los retos, una opción para reducir animaciones dentro de la app (ya se respeta el ajuste «reducir movimiento» del sistema).

## Fuentes

- «Regla de oro: la ley del esfuerzo inverso» y «Matriz de combinación»: tamaño de la acción por nivel, reglas de redacción y modificadores INCUP.
- GAM Medical, «Cómo motivarte con la parálisis TDAH» (revisión clínica de Aintzane García). Factores INCUP (Interés, Novedad, Competencia, Urgencia, Pasión): son las 5 cartas de la app, y «Competencia» es la carta Desafío. Método RAN (Recompensa, Responsabilidad, Novedad), micropasos, seguimiento del progreso y reducir distracciones.
- Isaac V., López V., Escobar M. J. (2024). «Arousal dysregulation and executive dysfunction in ADHD». *Frontiers in Psychiatry*, 14:1336040. https://pmc.ncbi.nlm.nih.gov/articles/PMC10827919/ — El rendimiento en TDAH varía mucho de un momento a otro y mejora cuando la tarea pide menos esfuerzo y cuando hay recompensa. Por eso los retos son mínimos, se reducen más si la tarea pesa y se puede elegir un premio.
- Sanitas, «Ocho pasos para lograr que los niños con TDAH hagan los deberes»: instrucciones de una en una, tareas divididas y descansos entre ellas.
- Carepatron, «Lista de tareas para el TDAH»: time-boxing y descansos programados.
