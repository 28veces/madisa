export const dynamic = "force-dynamic";

import { getInventoryItemsForSale } from "@/actions/inventory-items";
import AdjustmentForm from "@/components/admin/AdjustmentForm";

interface Props {
  searchParams: Promise<{ articulo?: string }>;
}

export default async function NuevaSalidaPage({ searchParams }: Props) {
  const { articulo } = await searchParams;
  const items = await getInventoryItemsForSale().catch(() => []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Nueva salida de inventario</h1>
        <p className="text-gray-500 text-sm mt-1">
          Descuenta stock por consumo de insumos, mermas o ajustes de conteo
        </p>
      </div>
      <AdjustmentForm items={items} initialItemId={articulo} />
    </div>
  );
}
