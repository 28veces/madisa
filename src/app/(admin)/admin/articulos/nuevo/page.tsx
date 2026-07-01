import InventoryItemForm from "@/components/admin/InventoryItemForm";
import { getSuppliers } from "@/actions/suppliers";

export default async function NewArticuloPage() {
  const suppliers = await getSuppliers().catch(() => []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Nuevo artículo de compra</h1>
        <p className="text-gray-500 text-sm mt-1">Registra un nuevo artículo para compras</p>
      </div>
      <InventoryItemForm suppliers={suppliers} />
    </div>
  );
}
