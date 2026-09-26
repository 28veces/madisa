# 0003 — Migraciones de Prisma automáticas en cada despliegue

- **Fecha:** 2026-09-22
- **Estado:** Aceptada
- **Historias relacionadas:** US-49

## Contexto

Las migraciones se aplicaban a Neon a mano. Al desplegar las salidas de inventario (US-49), la migración no se aplicó: Inventario y el catálogo quedaron vacíos en producción, porque las páginas atrapan el error de Prisma y muestran una lista vacía en vez de fallar.

## Opciones consideradas

1. **Aplicar las migraciones a mano** antes o después de cada despliegue: control total / depende de que alguien se acuerde, y ya falló una vez.
2. **Aplicarlas en el build de Vercel**: nunca se olvida y el código desplegado siempre coincide con el schema / una migración destructiva llega a producción sin un paso manual que la frene.

## Decisión

Opción 2. `package.json` tiene un script `vercel-build` (`prisma generate && prisma migrate deploy && next build`), que Vercel usa en lugar de `build`. Las migraciones se aplican vía `DIRECT_URL`. El `build` local no cambia y no toca ninguna base.

## Consecuencias

- El Build Command del proyecto en Vercel no debe sobrescribirse: si se cambia, se ignora `vercel-build`.
- Una migración que borra o transforma datos se ejecuta sola al hacer merge a `main`. Por eso la definición de terminado de `AGENTS.md` exige revisar toda migración antes de cerrar la historia.
- Si una migración falla, el build falla y Vercel mantiene el despliegue anterior. El código viejo queda corriendo contra una base que pudo haberse migrado a medias, así que las migraciones deben ser pequeñas y, cuando se pueda, compatibles con el código anterior.
