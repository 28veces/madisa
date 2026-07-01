export const dynamic = "force-dynamic";

import { getInvestments } from "@/actions/investments";
import InversionesContent from "./InversionesContent";

export default async function InversionesPage() {
  const investments = await getInvestments();
  const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);

  return <InversionesContent investments={investments} totalInvested={totalInvested} />;
}
