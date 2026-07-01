import { getProduct } from "@/actions/products";
import { getInventoryItemsForSale } from "@/actions/inventory-items";
import ProductForm from "@/components/admin/ProductForm";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditarProductoPage({ params }: Props) {
  const { id } = await params;
  const [product, inventoryItems] = await Promise.all([
    getProduct(id).catch(() => null),
    getInventoryItemsForSale().catch(() => []),
  ]);

  if (!product) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Editar producto</h1>
        <p className="text-gray-500 text-sm mt-1">{product.name}</p>
      </div>
      <ProductForm
        redirectTo="/admin/catalogo"
        inventoryItems={inventoryItems}
        product={{
          id: product.id,
          name: product.name,
          description: product.description ?? "",
          category: product.category,
          material: product.material,
          technique: product.technique,
          basePrice: product.basePrice,
          imageUrl: product.imageUrl ?? "",
          inventoryItemId: product.inventoryItemId ?? "",
          isActive: product.isActive,
        }}
      />
    </div>
  );
}
