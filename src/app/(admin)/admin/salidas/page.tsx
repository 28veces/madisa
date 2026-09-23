export const dynamic = "force-dynamic";

import { UserRole } from "@prisma/client";
import { getAdjustments } from "@/actions/inventory-adjustments";
import { requireBusiness } from "@/lib/require-auth";
import SalidasContent from "./SalidasContent";

export default async function SalidasPage() {
  const { role } = await requireBusiness();
  const adjustments = await getAdjustments().catch(() => []);

  return (
    <SalidasContent
      adjustments={adjustments.map((a) => ({
        id: a.id,
        code: a.inventoryItem.code,
        description: a.inventoryItem.description,
        quantity: a.quantity,
        reason: a.reason,
        date: a.date,
        note: a.note,
      }))}
      canDelete={role === UserRole.ADMIN}
      canCreate={role === UserRole.ADMIN || role === UserRole.SECRETARY}
    />
  );
}
