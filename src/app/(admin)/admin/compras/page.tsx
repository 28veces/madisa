export const dynamic = "force-dynamic";

import { getPurchases } from "@/actions/purchases";
import ComprasContent from "./ComprasContent";

export default async function ComprasPage() {
  const purchases = await getPurchases().catch(() => []);
  const totalGastado = purchases.reduce((s, p) => s + Number(p.totalAmount), 0);

  return <ComprasContent purchases={purchases} totalGastado={totalGastado} />;
}
