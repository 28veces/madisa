import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

// Límite de intentos por clave (IP, teléfono, email) en una ventana de tiempo.
// Se guarda en la base porque en Vercel cada request puede caer en una instancia distinta.

// Registra un intento para cada clave y devuelve false si alguna pasó el límite.
// Se inserta antes de contar para que peticiones simultáneas se vean entre sí; si se pasa
// el límite, el intento se deshace, así que el bloqueo dura lo que tarde en salir de la ventana.
export async function consumeRateLimit(keys: string[], limit: number, windowMs: number) {
  const since = new Date(Date.now() - windowMs);

  const hits = await prisma.$transaction(keys.map((key) => prisma.rateLimitHit.create({ data: { key } })));

  const counts = await Promise.all(
    keys.map((key) => prisma.rateLimitHit.count({ where: { key, createdAt: { gte: since } } }))
  );
  if (counts.some((count) => count > limit)) {
    await prisma.rateLimitHit.deleteMany({ where: { id: { in: hits.map((hit) => hit.id) } } });
    return false;
  }

  // Limpieza de registros viejos para que la tabla no crezca sin fin.
  await prisma.rateLimitHit.deleteMany({
    where: { createdAt: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
  });

  return true;
}

// Para límites que cuentan solo algunos intentos (los fallidos): consultar, registrar y limpiar por separado.
export async function isRateLimited(key: string, limit: number, windowMs: number) {
  const count = await prisma.rateLimitHit.count({
    where: { key, createdAt: { gte: new Date(Date.now() - windowMs) } },
  });
  return count >= limit;
}

export async function recordRateLimitHit(key: string) {
  await prisma.rateLimitHit.create({ data: { key } });
}

export async function clearRateLimit(key: string) {
  await prisma.rateLimitHit.deleteMany({ where: { key } });
}

// IP del visitante. En Vercel `x-forwarded-for` lo escribe la plataforma, no el cliente.
export async function getClientIp() {
  const headerList = await headers();
  const forwarded = headerList.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || headerList.get("x-real-ip") || "desconocida";
}
