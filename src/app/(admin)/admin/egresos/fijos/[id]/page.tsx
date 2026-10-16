export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { getRecurringExpense } from "@/actions/recurring-expenses";
import RecurringExpenseForm from "@/components/admin/RecurringExpenseForm";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditarEgresoFijoPage({ params }: Props) {
  const { id } = await params;
  const recurring = await getRecurringExpense(id).catch(() => null);
  if (!recurring) notFound();

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Editar egreso fijo</h1>
        <p className="text-gray-500 text-sm mt-1">{recurring.description}</p>
      </div>
      <RecurringExpenseForm
        recurringExpenseId={recurring.id}
        initialData={{
          description: recurring.description,
          category: recurring.category,
          amount: recurring.amount,
          frequency: recurring.frequency,
          nextDueDate: recurring.nextDueDate.toISOString().slice(0, 10),
          isActive: recurring.isActive,
          notes: recurring.notes,
        }}
      />
    </div>
  );
}
