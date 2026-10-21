"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createExpense, updateExpense, ExpenseFormData } from "@/actions/expenses";
import { RECURRENCE_FREQUENCIES, todayISO, type RecurrenceFrequencyValue } from "@/lib/recurrence";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { parseNumberField, type NumberField } from "@/lib/utils";

interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  isRecurring: boolean;
  expenseDate: Date;
  notes: string | null;
  businessId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ExpenseFormProps {
  expense?: Expense;
}

export default function ExpenseForm({ expense }: ExpenseFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  // El monto puede quedar vacío mientras se escribe
  const [formData, setFormData] = useState<Omit<ExpenseFormData, "amount"> & { amount: NumberField }>({
    description: expense?.description || "",
    amount: expense ? expense.amount : "",
    category: expense?.category || "",
    isRecurring: expense?.isRecurring || false,
    expenseDate: expense?.expenseDate?.toISOString().split("T")[0] || todayISO(),
    notes: expense?.notes || "",
  });
  // Solo al crear: si se repite, también se crea el egreso fijo (US-70)
  const [frequency, setFrequency] = useState<RecurrenceFrequencyValue | "">("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.amount === "" || formData.amount <= 0) {
      toast.error("Escribe el monto del egreso");
      return;
    }
    const data: ExpenseFormData = { ...formData, amount: formData.amount };
    setIsSubmitting(true);

    try {
      const result = expense
        ? await updateExpense(expense.id, data)
        : await createExpense({ ...data, frequency: frequency || null });

      if (result.success) {
        toast.success(
          expense
            ? "Egreso actualizado"
            : frequency
              ? "Egreso creado; te avisaremos del próximo pago en Egresos fijos"
              : "Egreso creado"
        );
        router.push("/admin/egresos");
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Error al guardar el egreso");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descripción
          </label>
          <input
            type="text"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="Ej: Alquiler del local"
            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monto (USD)
            </label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: parseNumberField(e.target.value) })
              }
              placeholder="0.00"
              step="0.01"
              min="0"
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoría
            </label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              placeholder="Ej: Alquiler, Servicios, Personal"
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha del egreso
          </label>
          <input
            type="date"
            value={formData.expenseDate}
            onChange={(e) =>
              setFormData({ ...formData, expenseDate: e.target.value })
            }
            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
            required
          />
        </div>

        {!expense && (
          <div>
            <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 mb-1">
              ¿Se repite?
            </label>
            <select
              id="frequency"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as RecurrenceFrequencyValue | "")}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              <option value="">No</option>
              {RECURRENCE_FREQUENCIES.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
            {frequency && (
              <p className="mt-1 text-xs text-gray-500">
                También se agregará a Egresos fijos y te avisaremos cuando toque el próximo pago.
              </p>
            )}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notas (opcional)
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
            placeholder="Detalles adicionales..."
            rows={3}
            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>

        <div className="flex gap-2 justify-end pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-rose-600 hover:bg-rose-700"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {expense ? "Actualizar" : "Crear"} Egreso
          </Button>
        </div>
      </form>
    </Card>
  );
}
