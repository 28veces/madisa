import RecurringExpenseForm from "@/components/admin/RecurringExpenseForm";

export default function NuevoEgresoFijoPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Nuevo egreso fijo</h1>
        <p className="text-gray-500 text-sm mt-1">
          Un gasto que se repite. Cuando llegue la fecha, te avisamos para que confirmes el pago.
        </p>
      </div>
      <RecurringExpenseForm />
    </div>
  );
}
