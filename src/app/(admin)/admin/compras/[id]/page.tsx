import { notFound } from "next/navigation";
import { getPurchaseById } from "@/actions/purchases";
import { getAllSuppliers } from "@/actions/suppliers";
import { getAllInventoryItems } from "@/actions/inventory-items";
import PurchaseForm from "@/components/admin/PurchaseForm";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditarCompraPage({ params }: Props) {
  const { id } = await params;

  const [purchase, suppliers, inventoryItems] = await Promise.all([
    getPurchaseById(id).catch(() => null),
    getAllSuppliers().catch(() => []),
    getAllInventoryItems().catch(() => []),
  ]);

  if (!purchase) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Editar compra</h1>
        <p className="text-gray-500 text-sm mt-1">Modifica los datos de esta compra</p>
      </div>
      <PurchaseForm
        suppliers={suppliers}
        inventoryItems={inventoryItems}
        purchaseId={purchase.id}
        initialData={{
          description: purchase.description,
          supplierId: purchase.supplierId,
          category: purchase.category,
          purchaseDate: purchase.purchaseDate,
          notes: purchase.notes,
          items: purchase.items.map((item) => ({
            inventoryItemId: item.inventoryItemId,
            description: item.description,
            quantity: item.quantity,
            unitCost: item.unitCost,
          })),
        }}
      />
    </div>
  );
}
