"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  createRecurringExpense,
  updateRecurringExpense,
  type RecurringExpenseFormData,
} from "@/actions/recurring-expenses";
import { RECURRENCE_FREQUENCIES, todayISO, type RecurrenceFrequencyValue } from "@/lib/recurrence";
import { parseNumberField, type NumberField } from "@/lib/utils";

interface InitialData {
  description: string;
  category: string;
  amount: number;
  frequency: RecurrenceFrequencyValue;
  nextDueDate: string; // AAAA-MM-DD
  isActive: boolean;
  notes: string | null;
}

interface Props {
  recurringExpenseId?: string;
  initialData?: InitialData;
}

const inputClass =
  "w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-500";

export default function RecurringExpenseForm({ recurringExpenseId, initialData }: Props) {
  const router = useRouter();
  const isEditing = !!recurringExpenseId;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [category, setCategory] = useState(initialData?.category ?? "");
  const [amount, setAmount] = useState<NumberField>(initialData?.amount ?? "");
  const [frequency, setFrequency] = useState<RecurrenceFrequencyValue>(initialData?.frequency ?? "MONTHLY");
  const [nextDueDate, setNextDueDate] = useState(initialData?.nextDueDate ?? todayISO());
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);
  const [notes, setNotes] = useState(initialData?.notes ?? "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount === "" || amount <= 0) return toast.error("Escribe el monto estimado");

    const data: RecurringExpenseFormData = {
      description,
      category,
      amount,
      frequency,
      nextDueDate,
      isActive,
      notes: notes || undefined,
    };

    setIsSubmitting(true);
    try {
      const result = isEditing
        ? await updateRecurringExpense(recurringExpenseId, data)
        : await createRecurringExpense(data);
      if (result.error) return toast.error(result.error);
      toast.success(isEditing ? "Egreso fijo actualizado" : "Egreso fijo creado");
      router.push("/admin/egresos");
    } catch {
      toast.error("Error al guardar el egreso fijo");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
          <input
            id="description"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ej: Fumigación del local"
            className={inputClass}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">Monto estimado (USD)</label>
            <input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(parseNumberField(e.target.value))}
              placeholder="0.00"
              step="0.01"
              min="0"
              className={inputClass}
              required
            />
            <p className="text-xs text-gray-400 mt-1">Al confirmar cada pago puedes poner el monto real</p>
          </div>
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
            <input
              id="category"
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Ej: Servicios, Permisos"
              className={inputClass}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 mb-1">Se repite</label>
            <select
              id="frequency"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as RecurrenceFrequencyValue)}
              className={inputClass}
            >
              {RECURRENCE_FREQUENCIES.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="nextDueDate" className="block text-sm font-medium text-gray-700 mb-1">Próximo pago</label>
            <input
              id="nextDueDate"
              type="date"
              value={nextDueDate}
              onChange={(e) => setNextDueDate(e.target.value)}
              className={inputClass}
              required
            />
          </div>
        </div>

        {isEditing && (
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="rounded border-gray-300 text-rose-600 focus:ring-rose-500"
            />
            <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
              Activo (si lo desactivas, deja de avisar)
            </label>
          </div>
        )}

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Notas (opcional)</label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className={inputClass}
          />
        </div>

        <div className="flex gap-2 justify-end pt-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting} className="bg-rose-600 hover:bg-rose-700">
            {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {isEditing ? "Guardar cambios" : "Crear egreso fijo"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
