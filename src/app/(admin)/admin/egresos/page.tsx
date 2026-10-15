export const dynamic = "force-dynamic";

import { UserRole } from "@prisma/client";
import { getExpenses } from "@/actions/expenses";
import { getRecurringExpenses } from "@/actions/recurring-expenses";
import { requireBusiness } from "@/lib/require-auth";
import EgresosContent from "./EgresosContent";
import RecurringExpensesSection from "./RecurringExpensesSection";

// Las fechas de pago son días calendario guardados a medianoche UTC
const dueDateFormat = new Intl.DateTimeFormat("es-PA", {
  year: "numeric",
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

export default async function EgresosPage() {
  const { role } = await requireBusiness();
  const [expenses, recurring] = await Promise.all([
    getExpenses(),
    getRecurringExpenses().catch(() => []),
  ]);
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
      recurringSection={
        <RecurringExpensesSection
          canManage={role === UserRole.ADMIN}
          rows={recurring.map((r) => ({
            id: r.id,
            description: r.description,
            category: r.category,
            amount: r.amount,
            frequency: r.frequency,
            nextDueISO: r.nextDueDate.toISOString().slice(0, 10),
            nextDueLabel: dueDateFormat.format(r.nextDueDate),
            isActive: r.isActive,
            isDue: r.isDue,
          }))}
        />
      }
    />
  );
}
