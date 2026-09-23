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
