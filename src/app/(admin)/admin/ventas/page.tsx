export const dynamic = "force-dynamic";

import { getSales } from "@/actions/sales";
import VentasContent from "./VentasContent";

export default async function VentasPage() {
  const sales = await getSales().catch(() => []);

  return <VentasContent sales={sales} />;
}
