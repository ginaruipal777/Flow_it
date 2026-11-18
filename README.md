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

Siguen la «Guía y Reglas Completas del Sistema de Retos V2» y están en [src/datos/reglas.ts](src/datos/reglas.ts):

1. La tarea se busca en las **48 reglas del PDF + 1 de la app** (palabras clave → categoría → reto base, la mínima acción viable).
2. Si no hay regla, se usa una **plantilla genérica** según el verbo («Buscar piso» → «Busca piso y tenlo delante»).
3. El reto base se adapta a cada **gatillo motivacional**. Cada carta usa uno:
   Novedad → Novedad · Desafío → Desafío · Pasión → Motivación · Interés → Directo · Urgencia → Urgencia.
   El gatillo **Amable** es el «Primer paso» del detalle.

Para ampliar el sistema (protocolo 5.2), añade una línea `r('palabras, clave', 'Categoría', 'icono', 'Reto base')` a `REGLAS`.
