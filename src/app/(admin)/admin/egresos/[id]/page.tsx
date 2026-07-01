import ExpenseForm from "@/components/admin/ExpenseForm";
import { getExpense } from "@/actions/expenses";
import { notFound } from "next/navigation";

interface EgresoPageProps {
  params: { id: string };
}

export default async function EgresoPage({ params }: EgresoPageProps) {
  const expense = await getExpense(params.id);
  if (!expense) notFound();
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Editar Egreso</h1>
      <ExpenseForm expense={{ ...expense, expenseDate: new Date(expense.expenseDate) }} />
    </div>
  );
}
