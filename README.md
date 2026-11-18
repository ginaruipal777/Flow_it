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
2. El **nivel de esfuerzo** elige una de las 3 acciones del banco de esa categoría: Ligero (1–3 min), Medio (30–60 s) o Pesado (5–10 s, empieza por «Solo…»).
3. Cada **carta INCUP** añade su modificador («con la mano que no usas», «sin mirar el móvil», «antes de que se enfríe tu café»…) y su entradilla.
4. Si no hay categoría, se usa un respaldo con el texto de la tarea.

Cada acción empieza por un verbo físico (nunca «hacer»), nombra un objeto concreto, es una sola (sin «y» ni «o»), sin tiempos y sin la palabra «tarea». Los modificadores INCUP cambian el enfoque según el tipo de actividad, sin fricción artificial. El prompt para un futuro generador con IA está en [docs/prompt-generador-ia.md](docs/prompt-generador-ia.md). Compruébalo con `npm run validar`. El PDF explicativo se genera con `npm run documento` (docs/sistema-de-retos.pdf).

Para ampliar el sistema, añade una regla a `REGLAS` y sus 3 acciones por nivel a `BANCO`.
