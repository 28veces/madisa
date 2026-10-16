<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Arte Madisa

App fullstack para un negocio de artesanías y personalización (sublimación, DTF, vDTF, pintura a mano, arreglos). Tiene un sitio público con catálogo y pedidos por carrito, y un panel de administración tipo ERP ligero: ventas, compras, inventario, proveedores, egresos, inversiones, socios y reparto de ganancias. Es multi-negocio: cada negocio ve solo sus datos, y un super administrador gestiona los negocios.

Este proyecto sigue la metodología **metodo28veces** (plugin de Claude Code `metodo28veces@metodo28veces`).
Flujo: `/metodo28veces:nueva-historia` → `/metodo28veces:implementar-historia US-NN` → `/metodo28veces:cerrar-historia US-NN` → `/metodo28veces:registrar-aprendizaje`.
Backlog: `docs/user-stories.md`. Decisiones técnicas: `docs/decisiones/`. Revisiones de seguridad: `docs/seguridad/`.

## Stack

- Next.js 16.2 (App Router) + React 19.2 + TypeScript. En Next 16 el middleware se llama `src/proxy.ts`.
- Prisma 6 sobre PostgreSQL: Neon en producción, contenedor Docker `artemadisa-db` (`docker-compose.yml`) en local.
- NextAuth v5 beta (Credentials + JWT), contraseñas con bcrypt.
- Tailwind v4, shadcn/ui, BaseUI, lucide-react, Recharts. Zustand solo para el carrito. React Hook Form + Zod.
- Imágenes en Vercel Blob (disco local si no hay `BLOB_READ_WRITE_TOKEN`).
- Hosting: Vercel.

Antes de usar la API de una librería, comprueba la versión instalada y su documentación local (`node_modules/<paquete>/…`) o la oficial: las versiones de este proyecto pueden ser más nuevas que tu conocimiento.

## Estructura

- `src/actions/*.ts` — toda la lógica de negocio como Server Actions. No hay API REST propia salvo el handler de NextAuth.
- `src/lib/require-auth.ts` — autorización: `requireBusiness(roles?)`, `requireSuperAdmin()`, `getActiveBusinessId()` (negocio del sitio público).
- `src/lib/stock.ts` — cálculo de disponibilidad y costo promedio de inventario.
- `src/lib/auth.ts` — NextAuth; los callbacks inyectan `role` y `businessId` en el token y la sesión.
- `src/proxy.ts` — protección de rutas por rol.
- `src/app/(public)` — sitio público; `src/app/(admin)/admin` — panel; `src/app/(admin)/admin/super` — super administración.
- `prisma/schema.prisma` — modelo de datos; `prisma/migrations/` — migraciones; `prisma/*.ts` — seeds y scripts de datos.

Roles: `SUPER_ADMIN` (gestiona negocios), `ADMIN` (dueño del negocio), `SECRETARY` (operación diaria), `ACCOUNTANT` (solo lectura financiera).

## Comandos

| Para qué | Comando |
|---|---|
| Base de datos local | `docker compose up -d` |
| Desarrollo | `npm run dev` |
| Lint | `npm run lint` |
| Build | `npm run build` (incluye `prisma generate` y chequeo de tipos) |
| Tests | No hay suite de tests todavía |
| Nueva migración | `npm run db:migrate` |
| Datos de prueba | `npm run db:seed` · `npm run db:seed:demo` · `npm run db:clean` (borra datos de operación) |

**Comandos de verificación** (se corren antes de cerrar cualquier historia): `npm run build` y `npm run lint`. El lint tiene 9 errores heredados (US-50): mientras no se resuelva, el criterio es **no agregar errores ni warnings nuevos** en los archivos tocados.

## Modo de ramas

`rama-por-historia`: rama `us-NN-descripcion-corta` y PR a `main`. Nadie hace commit directo a `main`, porque cada push a `main` despliega a producción.

## Despliegue

- Cómo se despliega: push/merge a `main` → Vercel despliega automáticamente. El script `vercel-build` corre `prisma migrate deploy` antes de `next build`, así que **las migraciones se aplican solas a la base de producción** (ver `docs/decisiones/0003-migraciones-automaticas-en-el-build.md`).
- Entornos: producción https://madisa-topaz.vercel.app · previews de Vercel por rama.
- Variables de entorno (valores en Vercel, nunca en el repo): `DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET`, `AUTH_URL`, `NEXT_PUBLIC_WHATSAPP_NUMBER`, `BLOB_READ_WRITE_TOKEN`.
- **Puerta de seguridad:** antes de desplegar a producción debe existir una revisión `Apto` en `docs/seguridad/` que cubra el último commit con código (`/metodo28veces:revision-seguridad`).

## Reglas duras

Romper una de estas reglas es un bug, aunque el código funcione. El agente `revisor` las verifica en cada cierre.

- Toda Server Action que lea o escriba datos de un negocio llama primero a `requireBusiness([...roles])` (o `requireSuperAdmin()` si es de plataforma): el proxy no basta, porque las Server Actions se pueden invocar directamente.
- Toda query de Prisma sobre datos de negocio filtra por el `businessId` de la sesión, incluidas las agregaciones de dashboard y reportes.
- Una action que recibe el ID de un recurso existente verifica que pertenezca al negocio de la sesión antes de leerlo o modificarlo (`where: { id, businessId }` o cargar y comparar).
- Una page `[id]` obtiene el dato con la Server Action de lectura, nunca con Prisma directo: la action ya valida la pertenencia (evita IDOR).
- El negocio del sitio público se resuelve siempre con `getActiveBusinessId()`, nunca con una query propia.
- El stock no se guarda: se calcula con `src/lib/stock.ts` (compras − ventas − salidas). Nunca agregues un campo de stock.
- Toda operación que valida una condición (stock, saldo) y luego escribe lo hace dentro de `prisma.$transaction(...)`.
- Precios, totales y costos se calculan en el servidor; nunca se guardan tal como llegan del cliente.
- Todo input de una Server Action se valida con Zod.

## Definición de terminado

1. Cada criterio de aceptación de la historia se cumple, verificado uno por uno.
2. `npm run build` pasa y `npm run lint` no tiene errores ni warnings nuevos en los archivos tocados. No hay suite de tests: si la historia agrega lógica de negocio delicada (cálculos de dinero, stock, reparto), se explica cómo se verificó.
3. El flujo se probó en la app corriendo (camino feliz + al menos un caso de error), o se declara explícitamente que no se probó y por qué.
4. Se cumplen las reglas duras de este archivo.
5. La historia está actualizada en `docs/user-stories.md` (estado, archivos, criterios con fecha).
6. Si hay migración: se revisó que no borre ni corrompa datos existentes, porque se aplica sola en producción al desplegar.
7. Sin secretos, credenciales ni archivos sueltos de depuración en el commit.

## Convenciones

- Commits: `tipo: descripción en español en presente (US-NN)`. Tipos: `feat`, `fix`, `refactor`, `docs`, `test`, `build`, `chore`.
- Código (variables, funciones, modelos) en inglés; interfaz, mensajes al usuario, comentarios y documentación en español.

## Lecciones

- 2026-09-22 — `.env.local` todavía apunta a la base SQLite antigua (`file:…`) y Next le da prioridad sobre `.env`. Para probar en local contra Postgres, exporta `DATABASE_URL` y `DIRECT_URL` de `.env` en el proceso, o corrige tu `.env.local`.
- 2026-09-22 — Si en producción Inventario o el catálogo aparecen vacíos, revisa primero si falta aplicar una migración: las páginas atrapan el error de Prisma y muestran una lista vacía. Pasó con la migración de salidas de inventario.
- 2026-09-22 — El Build Command del proyecto en Vercel no debe sobrescribirse: si se cambia, se ignora `vercel-build` y las migraciones dejan de aplicarse.
- 2026-09-22 — `AUTH_URL` en Vercel debe ser `https://madisa-topaz.vercel.app`. Estuvo apuntando a `madisa.vercel.app`, que es un sitio ajeno.
- 2026-09-22 — Las fechas que se muestran en componentes cliente se formatean en el servidor: formatearlas en el cliente produjo un hydration mismatch en `/admin/perfil`.
- 2026-09-22 — Server Actions rechaza cuerpos de más de 1 MB por defecto; `next.config.ts` lo sube a 5 MB para igualar el límite de `src/lib/upload.ts`. Si cambias uno, cambia el otro.
- 2026-09-22 — Los productos del seed usan su nombre como `id`, así que el id llega codificado en la URL: decodifícalo antes de buscarlo (bug de US-14).
- 2026-09-26 — `.gitignore` ignora `.env*`, incluido `.env.example`: la plantilla de variables no está en el repo. La lista de variables está en la sección *Despliegue*.
- 2026-10-14 — Para probar un flujo de punta a punta usa Playwright, que ya está instalado con Chromium (`node_modules/playwright`): un script en el scratchpad con `require` a la ruta absoluta, entrando con el usuario ADMIN que crea `prisma/seed.ts` en la base local. Así se verificaron US-25, US-27, US-29, US-49, US-54 y US-55.
- 2026-10-14 — Las fechas de solo día (AAAA-MM-DD, como la próxima fecha de un egreso fijo) se guardan a medianoche UTC y se formatean con `timeZone: "UTC"`; formateadas en hora local, en Panamá (UTC−5) se ven un día antes. Para saber qué día es "hoy" en el negocio usa `todayISO()` de `src/lib/recurrence.ts`, no la fecha del servidor (Vercel corre en UTC).
- 2026-10-15 — Si producción se ve sin la paleta o con estilos viejos (texto blanco sobre blanco), revisa la hoja de estilos servida: en el despliegue de US-65 Vercel reutilizó el caché de compilación de Turbopack y publicó el CSS anterior. Se arregla con *Redeploy* desmarcando "Use existing Build Cache"; desde US-66 el caché de Turbopack para builds está apagado en `next.config.ts`, no lo vuelvas a activar.
