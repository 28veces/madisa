export const dynamic = "force-dynamic";

import { getInventoryItemsForSale } from "@/actions/inventory-items";
import SaleForm from "@/components/admin/SaleForm";

export default async function NuevaVentaPage() {
  const items = await getInventoryItemsForSale().catch(() => []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Nueva venta</h1>
        <p className="text-gray-500 text-sm mt-1">Registra un pedido de cliente</p>
      </div>
      <SaleForm items={items} />
    </div>
  );
}
