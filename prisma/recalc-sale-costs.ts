/**
 * Recalcula el costo de producción de las líneas de venta que quedaron en 0
 * (ventas registradas antes de que el costo se llenara automáticamente).
 *
 * Costo = cantidad × costo promedio ponderado de compra del artículo.
 * Las líneas cuyo artículo no tiene compras registradas se quedan en 0 y se listan.
 *
 * Por defecto solo muestra lo que haría. Para aplicar los cambios:
 *   npm run db:recalc-costs -- --apply
 */
import { PrismaClient } from "@prisma/client";
import { getAverageUnitCosts, lineCost } from "../src/lib/stock";

const prisma = new PrismaClient();
const apply = process.argv.includes("--apply");

async function main() {
  const lines = await prisma.saleItem.findMany({
    where: { productionCost: 0, sale: { status: { not: "CANCELLED" } } },
    select: {
      id: true,
      quantity: true,
      inventoryItemId: true,
      inventoryItem: { select: { code: true, description: true } },
      sale: { select: { clientName: true, createdAt: true } },
    },
  });

  if (lines.length === 0) {
    console.log("No hay líneas de venta con costo 0.");
    return;
  }

  // Mismo cálculo que usa la app al registrar ventas nuevas
  const avg = await getAverageUnitCosts(prisma, lines.map((l) => l.inventoryItemId));

  let updated = 0;
  let total = 0;
  const withoutCost: string[] = [];

  for (const line of lines) {
    const unit = avg.get(line.inventoryItemId) ?? 0;
    const label = `${line.sale.createdAt.toISOString().slice(0, 10)} ${line.sale.clientName} · ${line.quantity} × ${line.inventoryItem.code} ${line.inventoryItem.description}`;
    if (unit <= 0) {
      withoutCost.push(label);
      continue;
    }
    const cost = lineCost(unit, line.quantity);
    console.log(`${label} → $${cost.toFixed(2)}`);
    if (apply) await prisma.saleItem.update({ where: { id: line.id }, data: { productionCost: cost } });
    updated++;
    total += cost;
  }

  console.log(
    `\n${apply ? "Actualizadas" : "Se actualizarían"} ${updated} líneas, costo total $${total.toFixed(2)}.`
  );
  if (withoutCost.length) {
    console.log(`\n${withoutCost.length} líneas sin compras registradas (se quedan en 0, corrígelas a mano):`);
    withoutCost.forEach((l) => console.log(`  ${l}`));
  }
  if (!apply) console.log("\nModo prueba: no se cambió nada. Agrega --apply para guardar.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
