export const dynamic = "force-dynamic";

import { UserRole } from "@prisma/client";
import { getPurchases } from "@/actions/purchases";
import { requireBusiness } from "@/lib/require-auth";
import ComprasContent from "./ComprasContent";

export default async function ComprasPage() {
  const { role } = await requireBusiness();
  const purchases = await getPurchases().catch(() => []);
  const totalGastado = purchases.reduce((s, p) => s + Number(p.totalAmount), 0);

  return (
    <ComprasContent
      purchases={purchases}
      totalGastado={totalGastado}
      canDelete={role === UserRole.ADMIN}
    />
  );
}
