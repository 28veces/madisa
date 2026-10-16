export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { getAdjustment } from "@/actions/inventory-adjustments";
import { getInventoryItemsForSale } from "@/actions/inventory-items";
import AdjustmentForm from "@/components/admin/AdjustmentForm";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditarSalidaPage({ params }: Props) {
  const { id } = await params;
  const [adjustment, items] = await Promise.all([
    getAdjustment(id).catch(() => null),
    getInventoryItemsForSale().catch(() => []),
  ]);

  if (!adjustment) notFound();

  // Si el artículo se desactivó, igual debe aparecer para poder editar su salida
  const options = items.some((it) => it.id === adjustment.inventoryItemId)
    ? items
    : [
        ...items,
        {
          id: adjustment.inventoryItemId,
          code: adjustment.inventoryItem.code,
          description: adjustment.inventoryItem.description,
          category: adjustment.inventoryItem.category as string,
          availableStock: 0,
          avgUnitCost: 0,
        },
      ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Editar salida de inventario</h1>
        <p className="text-gray-500 text-sm mt-1">Corrige los datos de esta salida</p>
      </div>
      <AdjustmentForm
        items={options}
        adjustmentId={adjustment.id}
        initialData={{
          inventoryItemId: adjustment.inventoryItemId,
          quantity: adjustment.quantity,
          reason: adjustment.reason,
          date: adjustment.date.toISOString().split("T")[0],
          note: adjustment.note,
        }}
      />
    </div>
  );
}
