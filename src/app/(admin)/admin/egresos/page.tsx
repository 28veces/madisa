export const dynamic = "force-dynamic";

import { getExpenses } from "@/actions/expenses";
import EgresosContent from "./EgresosContent";

export default async function EgresosPage() {
  const expenses = await getExpenses();
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const now = new Date();
  const monthlyExpenses = expenses
    .filter(
      (exp) =>
        exp.expenseDate.getMonth() === now.getMonth() &&
        exp.expenseDate.getFullYear() === now.getFullYear()
    )
    .reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <EgresosContent
      expenses={expenses}
      totalExpenses={totalExpenses}
      monthlyExpenses={monthlyExpenses}
    />
  );
}
