"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createExpense, updateExpense, ExpenseFormData } from "@/actions/expenses";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

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
  const [formData, setFormData] = useState<ExpenseFormData>({
    description: expense?.description || "",
    amount: expense?.amount || 0,
    category: expense?.category || "",
    isRecurring: expense?.isRecurring || false,
    expenseDate: expense?.expenseDate?.toISOString().split("T")[0] || new Date().toISOString().split("T")[0],
    notes: expense?.notes || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = expense
        ? await updateExpense(expense.id, formData)
        : await createExpense(formData);

      if (result.success) {
        toast.success(expense ? "Egreso actualizado" : "Egreso creado");
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
                setFormData({ ...formData, amount: parseFloat(e.target.value) })
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

        <div className="flex items-center">
          <input
            type="checkbox"
            id="recurring"
            checked={formData.isRecurring}
            onChange={(e) =>
              setFormData({ ...formData, isRecurring: e.target.checked })
            }
            className="rounded border-gray-300 text-rose-600 focus:ring-rose-500"
          />
          <label htmlFor="recurring" className="ml-2 text-sm text-gray-700">
            ¿Es un egreso recurrente? (mensual)
          </label>
        </div>

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
