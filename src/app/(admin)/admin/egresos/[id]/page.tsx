import ExpenseForm from "@/components/admin/ExpenseForm";
import { getExpense } from "@/actions/expenses";
import { notFound } from "next/navigation";

interface EgresoPageProps {
  params: Promise<{ id: string }>;
}

export default async function EgresoPage({ params }: EgresoPageProps) {
  const { id } = await params;
  const expense = await getExpense(id);
  if (!expense) notFound();
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Editar Egreso</h1>
      <ExpenseForm expense={{ ...expense, expenseDate: new Date(expense.expenseDate) }} />
    </div>
  );
}
