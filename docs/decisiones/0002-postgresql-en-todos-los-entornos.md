# 0002 — PostgreSQL en todos los entornos

- **Fecha:** 2026-09-21
- **Estado:** Aceptada
- **Historias relacionadas:** US-46

## Contexto

El proyecto nació con SQLite en desarrollo y el `provider` escrito a mano en `prisma/schema.prisma`. Prisma no permite cambiar de proveedor en tiempo de ejecución, y las migraciones generadas para SQLite no sirven para PostgreSQL. Con el despliegue en Neon (`0001`), producción tenía que ser PostgreSQL.

## Opciones consideradas

1. **Mantener SQLite en desarrollo y PostgreSQL en producción**: arranque local sin instalar nada / dos historiales de migraciones y diferencias de comportamiento entre motores.
2. **PostgreSQL en todos los entornos**: un solo historial de migraciones y el mismo motor en local y producción / requiere Docker para desarrollar.

## Decisión

Opción 2. El schema usa `provider = "postgresql"` con `directUrl`, las migraciones se regeneraron desde cero (`init_postgres`), y en local se usa el contenedor `artemadisa-db` de `docker-compose.yml`.

## Consecuencias

- Para desarrollar hay que levantar la base con `docker compose up -d`.
- `README.md` y `SETUP.md` todavía describen el flujo con SQLite (`dev.db`, `db:push`) y están desactualizados.
- Los `.env.local` antiguos pueden seguir apuntando a SQLite y le ganan a `.env` (ver *Lecciones* en `AGENTS.md`).
