export const dynamic = "force-dynamic";

import { getInventoryItemsWithPurchaseQty } from "@/actions/inventory-items";
import InventarioContent from "./InventarioContent";

export default async function InventarioPage() {
  const items = await getInventoryItemsWithPurchaseQty().catch(() => []);

  return <InventarioContent items={items} />;
}
