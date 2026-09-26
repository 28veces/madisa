# 0001 — Hosting en Vercel, base en Neon e imágenes en Vercel Blob

- **Fecha:** 2026-09-21
- **Estado:** Aceptada
- **Historias relacionadas:** US-46, US-48

## Contexto

La app corría solo en local, con SQLite y las imágenes subidas guardadas en `public/uploads/`. Para operar el negocio hacía falta un despliegue en internet. El repositorio se movió de GitLab a GitHub (`28veces/madisa`) para integrarlo con el hosting.

## Opciones consideradas

Registradas en su momento solo para el almacenamiento de imágenes (US-48): **S3**, **Cloudinary** o **Vercel Blob**. Para hosting y base de datos no quedaron alternativas documentadas: el proveedor lo eligió el dueño del proyecto.

## Decisión

- **Vercel** como hosting, desplegando automáticamente desde `main` en GitHub.
- **Neon** (PostgreSQL serverless) como base de producción, con `DATABASE_URL` (conexión con pool) y `DIRECT_URL` (conexión directa para migraciones).
- **Vercel Blob** para imágenes: el disco de Vercel es efímero y lo que se guarda en `public/uploads/` se pierde. `src/lib/upload.ts` usa Blob si existe `BLOB_READ_WRITE_TOKEN` y cae a disco local en desarrollo.

## Consecuencias

- Todo queda en un mismo proveedor para el despliegue y el almacenamiento, con poca configuración.
- El plan Hobby de Vercel prohíbe el uso comercial: antes de operar como negocio real hay que pasar a Pro.
- Sin `BLOB_READ_WRITE_TOKEN` configurado en Vercel, las imágenes subidas en producción se pierden: el store de Blob tiene que existir y estar conectado al proyecto.
- Ver también `0002` (PostgreSQL en todos los entornos) y `0003` (migraciones en el build).
