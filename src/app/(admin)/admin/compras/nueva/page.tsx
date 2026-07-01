import PurchaseForm from "@/components/admin/PurchaseForm";
import { getAllSuppliers } from "@/actions/suppliers";
import { getAllInventoryItems } from "@/actions/inventory-items";

export default async function NuevaCompraPage() {
  const [suppliers, inventoryItems] = await Promise.all([
    getAllSuppliers().catch(() => []),
    getAllInventoryItems().catch(() => []),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Nueva compra</h1>
        <p className="text-gray-500 text-sm mt-1">Registra un gasto o compra de materiales</p>
      </div>
      <PurchaseForm suppliers={suppliers} inventoryItems={inventoryItems} />
    </div>
  );
}
