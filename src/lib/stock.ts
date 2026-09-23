import { Prisma } from "@prisma/client";

// Disponibilidad de un artículo = compras − ventas − salidas (consumo, mermas, ajustes).
// No existe un campo de stock: siempre se calcula a partir de los movimientos.

export const stockInclude = {
  purchaseItems: { select: { quantity: true } },
  saleItems: { select: { quantity: true } },
  adjustments: { select: { quantity: true } },
} satisfies Prisma.InventoryItemInclude;

type Movements = {
  purchaseItems: { quantity: number }[];
  saleItems: { quantity: number }[];
  adjustments: { quantity: number }[];
};

const sum = (rows: { quantity: number }[]) => rows.reduce((s, r) => s + r.quantity, 0);

export function stockTotals(item: Movements) {
  const purchased = sum(item.purchaseItems);
  const sold = sum(item.saleItems);
  const adjusted = sum(item.adjustments);
  return { purchased, sold, adjusted, available: purchased - sold - adjusted };
}

export function availableStock(item: Movements) {
  return stockTotals(item).available;
}

export async function getAvailableStock(
  tx: Prisma.TransactionClient,
  inventoryItemId: string
) {
  const where = { inventoryItemId };
  const [purchased, sold, adjusted] = await Promise.all([
    tx.purchaseItem.aggregate({ where, _sum: { quantity: true } }),
    tx.saleItem.aggregate({ where, _sum: { quantity: true } }),
    tx.inventoryAdjustment.aggregate({ where, _sum: { quantity: true } }),
  ]);
  return (
    (purchased._sum.quantity ?? 0) - (sold._sum.quantity ?? 0) - (adjusted._sum.quantity ?? 0)
  );
}

// Costo promedio ponderado por unidad de cada artículo según sus compras:
// Σ(cantidad × costo unitario) / Σ cantidad. Artículos sin compras no aparecen (costo 0).
export async function getAverageUnitCosts(
  tx: Prisma.TransactionClient,
  inventoryItemIds: string[]
): Promise<Map<string, number>> {
  if (inventoryItemIds.length === 0) return new Map();
  const rows = await tx.purchaseItem.findMany({
    where: { inventoryItemId: { in: [...new Set(inventoryItemIds)] } },
    select: { inventoryItemId: true, quantity: true, unitCost: true },
  });
  const acc = new Map<string, { qty: number; cost: number }>();
  for (const r of rows) {
    if (!r.inventoryItemId) continue;
    const a = acc.get(r.inventoryItemId) ?? { qty: 0, cost: 0 };
    a.qty += r.quantity;
    a.cost += r.quantity * r.unitCost;
    acc.set(r.inventoryItemId, a);
  }
  return new Map([...acc].map(([id, a]) => [id, a.qty > 0 ? a.cost / a.qty : 0]));
}

// Costo de producción de una línea de venta: cantidad × costo promedio, redondeado a centavos.
export function lineCost(avgUnitCost: number, quantity: number) {
  return Math.round(avgUnitCost * quantity * 100) / 100;
}
