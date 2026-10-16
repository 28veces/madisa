import ProductForm from "@/components/admin/ProductForm";
import { getInventoryItemsForSale } from "@/actions/inventory-items";
import { auth } from "@/lib/auth";

export default async function NuevoProductoCatalogoPage() {
  const [inventoryItems, session] = await Promise.all([getInventoryItemsForSale().catch(() => []), auth()]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Nuevo producto</h1>
        <p className="text-gray-500 text-sm mt-1">Agrega un producto al catálogo público</p>
      </div>
      <ProductForm
        redirectTo="/admin/catalogo"
        inventoryItems={inventoryItems}
        canSetBackorder={session?.user?.role === "ADMIN"}
      />
    </div>
  );
}
