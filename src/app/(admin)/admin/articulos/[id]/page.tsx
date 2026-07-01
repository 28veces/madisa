import { notFound } from "next/navigation";
import InventoryItemForm from "@/components/admin/InventoryItemForm";
import { getInventoryItem } from "@/actions/inventory-items";
import { getSuppliers } from "@/actions/suppliers";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditArticuloPage({ params }: Props) {
  const { id } = await params;
  const [item, suppliers] = await Promise.all([
    getInventoryItem(id),
    getSuppliers(),
  ]);

  if (!item) {
    notFound();
  }

  const itemData = {
    ...item,
    note: item.note || undefined,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Editar artículo</h1>
        <p className="text-gray-500 text-sm mt-1">Actualiza la información del artículo</p>
      </div>
      <InventoryItemForm item={itemData} suppliers={suppliers} />
    </div>
  );
}
