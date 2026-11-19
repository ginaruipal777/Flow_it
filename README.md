# Flow it!

App web (PWA) a partir del prototipo de Figma `4wN8n9bV4Wj67Mevi3zBlW`. React + Vite + TypeScript.

## Arrancar

```bash
npm install
npm run dev
```

Abre `http://localhost:5173/`. La primera vez sale la bienvenida y el onboarding; después entra directo en Inicio.
Para volver a ver el onboarding, borra los datos del sitio (o `localStorage`) en el navegador.

## Pantallas (Figma «prot final»)

| Ruta | Pantalla |
|---|---|
| `/` | 00 Bienvenida |
| `/bienvenida/1-3` | O1–O3 Onboarding |
| `/entrar` | L4 Inicio de sesión (sin cuentas todavía) |
| `/inicio` | 01–02 Inicio |
| `/reto` | 03–07 Selección, 90 Cambiar categoría, 92 Mazo agotado |
| `/reto/detalle` | 08 Detalle del reto, 91 Archivar reto |
| `/reto/enfoque` | 09 Enfoque |
| `/reto/conseguido` | 10 Reto conseguido |
| `/tareas` | 11 Tus tareas |
| `/perfil` | 12 Perfil · 12b Retomar |
| `/perfil/nueva-categoria` | 13 Crear categoría |
| `/sistema` | Sistema de diseño |

Los datos se guardan en el navegador (`localStorage`) y la app arranca con tareas de ejemplo.

## Estructura

- `src/styles/tokens.css`: colores de «Flow it! · Color», colores de carta de «Carta de reto · Tipo» (por `data-tipo`) y estilos de texto (`.t-*`).
- `src/components/Boton`: Botón v3 (Figma 2032:1123).
- `src/components/CartaReto`: Carta de reto · Selección (Figma 4208:2791), 5 tipos.
- `src/components/Icono`: iconos SVG exportados de Figma con `currentColor`.
- `src/assets/iconos/categoria`: los 10 iconos de categoría.
- `src/pages/Sistema`: página `/sistema` con colores, tipografías, botones y cartas.

## Estado

Flujo completo de «prot final», instalable como PWA y publicado en https://flow-it-jet.vercel.app/ (Vercel la despliega sola con cada push a `main`). Aún sin cuentas ni base de datos: los datos se guardan en cada navegador.

## Cómo se crean los retos

Siguen la «Regla de oro: la ley del esfuerzo inverso» y la «Matriz de combinación» ([src/datos/reglas.ts](src/datos/reglas.ts) y [src/datos/banco.ts](src/datos/banco.ts)):

1. La tarea se busca en las **52 categorías** (palabras clave del «Sistema de Retos V2» + ampliaciones de la app).
2. El **nivel de esfuerzo** elige el tamaño: Ligero (un trozo pequeño), Medio (el primer movimiento) o Pesado (contacto mínimo, empieza por «Solo…»).
3. Cada **carta INCUP** tiene su propio reto escrito a mano para la categoría y el nivel: Novedad (otro sitio u orden), Desafío (una meta que se puede contar), Pasión (algo que te gusta), Interés (una persona o un dato curioso) y Urgencia (la acción más directa con un plazo corto, por ejemplo «en los próximos 5 minutos»).
4. Si no hay categoría, se usa un respaldo con el texto de la tarea.
5. La **lectura de la situación** ([src/datos/situacion.ts](src/datos/situacion.ts)) deduce qué puede estar frenando (plazo, hablar con otras personas, miedo a hacerlo mal…) a partir de la tarea y el esfuerzo, con reglas sacadas de webs de psicología (`npm run fuentes` comprueba los enlaces).
6. El **aprendizaje** ([src/datos/aprendizaje.ts](src/datos/aprendizaje.ts)) apunta qué cartas se aceptan, rechazan y consiguen, y ordena los mazos siguientes. Se ve en Perfil → «Te funciona».

La carta dice solo la acción, sin entradillas: verbo físico primero (nunca «hacer»), un objeto concreto, una sola acción (sin «y» ni «o») y sin la palabra «tarea». El detalle añade «Está hecho cuando…» sacado de la acción y una frase de permiso del nivel. El prompt para un futuro generador con IA está en [docs/prompt-generador-ia.md](docs/prompt-generador-ia.md). Compruébalo con `npm run validar`. El PDF explicativo se genera con `npm run documento` (docs/sistema-de-retos.pdf).

Para ampliar el sistema, añade una regla a `REGLAS` y sus 15 retos (3 niveles × 5 cartas) a `BANCO`.
