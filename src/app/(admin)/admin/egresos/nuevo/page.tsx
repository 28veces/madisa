import ExpenseForm from "@/components/admin/ExpenseForm";

export default function NuevoEgresoPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Nuevo Egreso</h1>
      <ExpenseForm />
    </div>
  );
}
