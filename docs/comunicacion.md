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
- **La carta dice solo la acción**, en una frase. Sin entradillas ni coletillas pegadas con coma: la etiqueta de la carta (NOVEDAD, DESAFÍO…) ya dice su tipo.
- **El INCUP cambia la acción, no le añade una coletilla**, y sin fricción artificial («con la mano que no usas»). Cada reto está escrito a mano para su categoría, nivel y carta.

## 3. Tiempos reales, nunca vagos

- Nada de «luego», «cuando puedas» o «más tarde».
- Solo la carta **Urgencia** lleva un plazo, corto y concreto: Pesado «en los próximos 5 minutos», Medio «en los próximos 10 minutos», Ligero «antes de que pase una hora». Las demás cartas no llevan tiempos.
- Nunca prisas ni presión («rápido», «¡ya!»).
- Sin cronómetros obligatorios ni cuentas atrás que presionen.

## 4. Sin presión

- Sin preguntas que juzgan («¿a que no…?»). Una pregunta solo puede ser una invitación («¿Te apuntas?»).
- Sin imperativos agresivos («¡Hazlo ya!»): tono neutral y amable.
- Decide la persona: el reto está hecho cuando pulsa «Reto conseguido».
- Sin rachas, castigos ni lenguaje de culpa.
- Dejar algo a medias es una opción normal y se dice así («Lo dejo aquí por hoy»).

## 5. Una acción, un objeto, un permiso

- Cada carta muestra una sola acción con un objeto concreto: «Abre la app del test.» (Tiimo: una sola tarea en vez de una lista).
- El primer paso es más pequeño de lo que parece razonable y puede salir torpe (guías de inicio de tareas con TDAH).
- Debajo del reto, una frase de permiso del nivel: Pesado «Con eso ya cuenta.», Medio «No tiene que quedar perfecto.», Ligero «Si sale regular, también vale.».
- «Está hecho cuando…» sale de la propia acción: «Abre la app del test» → «has abierto la app del test».

## 5b. Lectura de la situación

Con la tarea y el esfuerzo, la app deduce qué puede estar frenando ([src/datos/situacion.ts](../src/datos/situacion.ts)), lo dice en una frase corta en la pantalla de las cartas y pone primero la carta que mejor encaja:

| Situación | Señales en la tarea | Frase | Primera carta |
|---|---|---|---|
| Plazo encima | hoy, mañana, urgente, plazo | Hay un plazo encima. Esa presión puede ayudar: la carta Urgencia va primero. | Urgencia |
| Hablar con otras personas | llamar, responder, jefe, cita, quedar | Hablar con otras personas puede dar respeto. Empiezas por lo que no exige hablar con nadie. | Novedad |
| Mal rato | médico, dentista, análisis, veterinario | Es normal posponer lo que da mal rato. Los primeros pasos no te comprometen a nada todavía. | Novedad |
| Miedo a hacerlo mal | escribir, informe, proyecto, examen | Puede que pese el miedo a que no quede bien. Aquí vale un primer borrador feo. | Novedad |
| Verlo enorme | limpiar, ordenar, estudiar, mudanza | Puede parecer enorme porque se ve entero. Solo hace falta un trozo que se pueda contar. | Desafío |
| Poca energía | gimnasio, correr, pasear | Con poca energía, el cuerpo arranca mejor con algo pequeño que te guste. | Pasión |
| Aburrimiento | papeleo, trámites, platos, lavadora | Es más aburrida que difícil. Juntarla con algo que te gusta ayuda a empezar. | Pasión |
| Cuidarse | ducharse, comer, dormir | Cuidarte cuesta más en los días malos. Con un paso pequeño ya cuenta. | Pasión |

Si no encaja ninguna, la frase sale del esfuerzo (Pesado: «Hoy cuesta mucho arrancar…»). Nunca diagnostica: dice «puede que» y la persona decide.

## 6. Ley del esfuerzo inverso

Cuanto más pesa la tarea, más pequeña es la acción (nivel elegido en «¿Cuánto te pesa?»):

| Nivel | Duración | Cómo es la acción | Ejemplo |
|---|---|---|---|
| Ligero | 1–3 min | Un trozo pequeño con final claro. | Escribe la respuesta en 3 frases |
| Medio | 30–60 s | El primer movimiento físico. | Pulsa «Responder» en el correo |
| Pesado | 5–10 s | Contacto mínimo, empieza por «Solo…». Se puede cumplir sin levantarse de la cama. | Solo abre la app de correo |

## 7. Predecible

- Todas las cartas tienen la misma estructura: acción en la carta, «Está hecho cuando…» y permiso en el detalle.
- Los botones dicen lo que pasa al pulsarlos («Reto conseguido», «Archivar reto»).

## 8. Sin género para la persona

- Frases que valen para cualquiera: «ya habrás empezado», no «estarás list@».

## Cómo se aplica a los retos

Cada categoría tiene 15 retos escritos a mano (3 niveles × 5 cartas) en [src/datos/banco.ts](../src/datos/banco.ts); la app añade «Solo…» en Pesado y el plazo en Urgencia ([src/datos/reglas.ts](../src/datos/reglas.ts)). `npm run validar` comprueba que todos cumplen las pautas. Para «Pasear al perro» con nivel Medio:

| Carta | Reto | Está hecho cuando |
|---|---|---|
| Novedad | Sal con el perro por otra puerta. | has salido con el perro por otra puerta |
| Desafío | Ponle la correa al perro a la primera. | le has puesto la correa al perro a la primera |
| Pasión | Ponte tu canción favorita en los auriculares. | te has puesto tu canción favorita en los auriculares |
| Interés | Escribe a una persona de confianza para pasear contigo. | has escrito a una persona de confianza para pasear contigo |
| Urgencia | Ponle la correa al perro en los próximos 10 minutos. | le has puesto la correa al perro |

Antes la app pegaba «entradilla + acción + modificador» y salían frases sin sentido, como «¡Plan nuevo! Ponle la correa al perro, por una calle distinta.».

## Diseño de las tareas

| Principio | Cómo está en la app |
|---|---|
| Micropasos, de uno en uno | Cada reto es una sola acción física; el detalle la muestra en grande. |
| Criterio de éxito explícito | Cada reto dice «Está hecho cuando…» con lo que se puede comprobar («has abierto la app del test»), más una frase de permiso del nivel. |
| Apoyo visual y escrito | Lista de verificación en el detalle, libreta de «Tus tareas» y contador de retos con mini cartas. |
| Lectura en voz alta | Botón «Escuchar» en el detalle: lee el reto, los pasos y el criterio de éxito (voz del sistema). |
| Control de tiempos y descansos | El modo enfoque ofrece «Sin límite», «10 min + 3 de descanso» o «25 min + 5 de descanso», con barra visual y aviso al cambiar de fase. Solo la carta Urgencia propone un plazo corto. |
| Integración de intereses | Pendiente: la app aún no sabe qué le interesa a cada persona. |
| Recompensa (método RAN) | En el detalle se puede elegir un premio; «Reto conseguido» lo recuerda. |
| Más retos si no encaja ninguno | Al rechazar las 5 cartas llega otro mazo de la misma tarea, igual o más fácil: el nivel elegido, los niveles más ligeros y retos genéricos con el nombre de la tarea. |
| Menos esfuerzo para arrancar | El nivel de esfuerzo elige el tamaño de la acción: Ligero 1–3 min, Medio 30–60 s, Pesado 5–10 s. |
| Menos distracciones | El modo enfoque recuerda silenciar notificaciones y cerrar lo que no se use. |

## Pendiente

Las pautas también piden ofrecer otros canales además del texto y respetar el ritmo de cada persona. Ideas para más adelante: preguntar los intereses en el onboarding y usarlos en los retos, una opción para reducir animaciones dentro de la app (ya se respeta el ajuste «reducir movimiento» del sistema).

## Fuentes

- «Regla de oro: la ley del esfuerzo inverso»: tamaño de la acción por nivel y reglas de redacción.
- Cómo redactan tareas las apps para TDAH: Goblin Tools (pasos concretos según lo pequeños que se necesiten), Tiimo (una sola tarea, tono probado con usuarios neurodivergentes: «la frase equivocada puede bloquear»), Finch (metas mínimas sin juicio) y las críticas a Habitica (castigar genera vergüenza y abandono).
- Guías de inicio de tareas con TDAH (Brain.fm, Universidad de Minnesota): el primer paso más pequeño de lo que parece razonable, una acción física y permiso para que salga torpe.
- Pautas para escribir para personas autistas (UK Home Office, Scope): lenguaje literal, frases cortas, pasos explícitos y estructura predecible.
- GAM Medical, «Cómo motivarte con la parálisis TDAH» (revisión clínica de Aintzane García). Factores INCUP (Interés, Novedad, Competencia, Urgencia, Pasión): son las 5 cartas de la app, y «Competencia» es la carta Desafío. Método RAN (Recompensa, Responsabilidad, Novedad), micropasos, seguimiento del progreso y reducir distracciones.
- Isaac V., López V., Escobar M. J. (2024). «Arousal dysregulation and executive dysfunction in ADHD». *Frontiers in Psychiatry*, 14:1336040. https://pmc.ncbi.nlm.nih.gov/articles/PMC10827919/ — El rendimiento en TDAH varía mucho de un momento a otro y mejora cuando la tarea pide menos esfuerzo y cuando hay recompensa. Por eso los retos son mínimos, se reducen más si la tarea pesa y se puede elegir un premio.
- Sanitas, «Ocho pasos para lograr que los niños con TDAH hagan los deberes»: instrucciones de una en una, tareas divididas y descansos entre ellas.
- Carepatron, «Lista de tareas para el TDAH»: time-boxing y descansos programados.
