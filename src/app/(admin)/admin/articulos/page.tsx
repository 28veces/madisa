export const dynamic = "force-dynamic";

import { getAllInventoryItems } from "@/actions/inventory-items";
import ArticulosContent from "./ArticulosContent";

export default async function ArticulosPage() {
  const items = await getAllInventoryItems().catch(() => []);

  return <ArticulosContent items={items} />;
}
