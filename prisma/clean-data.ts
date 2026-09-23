/**
 * Borra todos los datos de operación para empezar pruebas desde cero.
 * Conserva únicamente los usuarios y los negocios (cada usuario depende de su negocio).
 *
 * Borra: ventas, compras, salidas, egresos, inversiones y aportes, productos del
 * catálogo, artículos de inventario, proveedores y socios.
 * No borra las fotos subidas a Vercel Blob (se pueden limpiar desde Vercel → Storage).
 *
 * Por defecto solo muestra cuántos registros borraría. Para borrar de verdad:
 *   npm run db:clean -- --apply
 *
 * IRREVERSIBLE: crea antes un branch de respaldo en Neon.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const apply = process.argv.includes("--apply");

// Orden: primero las tablas hijas, para no violar llaves foráneas.
const tables = [
  ["Aportes a inversiones", "investmentContribution"],
  ["Inversiones", "investment"],
  ["Egresos", "expense"],
  ["Líneas de venta", "saleItem"],
  ["Ventas", "sale"],
  ["Líneas de compra", "purchaseItem"],
  ["Compras", "purchase"],
  ["Salidas de inventario", "inventoryAdjustment"],
  ["Proveedores por artículo", "inventoryItemSupplier"],
  ["Productos del catálogo", "product"],
  ["Artículos de inventario", "inventoryItem"],
  ["Proveedores", "supplier"],
  ["Socios", "partner"],
] as const;

type Deletable = { count: () => Promise<number>; deleteMany: () => Promise<{ count: number }> };
type Client = Pick<PrismaClient, (typeof tables)[number][1]>;
const model = (db: Client, name: (typeof tables)[number][1]) => db[name] as unknown as Deletable;

async function main() {
  const url = new URL(process.env.DATABASE_URL ?? "");
  console.log(`Base de datos: ${url.hostname}${url.pathname}\n`);

  for (const [label, name] of tables) {
    console.log(`${label.padEnd(26)} ${await model(prisma, name).count()}`);
  }
  const [users, businesses] = await Promise.all([prisma.user.count(), prisma.business.count()]);
  console.log(`\nSe conservan: ${users} usuarios y ${businesses} negocio(s).`);

  if (!apply) {
    console.log("\nModo prueba: no se borró nada. Agrega --apply para borrar.");
    return;
  }

  // Todo o nada: si algo falla, no se borra ninguna tabla.
  await prisma.$transaction(
    async (tx) => {
      for (const [, name] of tables) await model(tx, name).deleteMany();
    },
    { timeout: 60_000 }
  );

  console.log("\nListo: datos de operación borrados.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
