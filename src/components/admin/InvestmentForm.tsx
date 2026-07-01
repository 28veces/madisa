"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createInvestment, updateInvestment, InvestmentFormData, ContributionInput } from "@/actions/investments";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface Partner {
  id: string;
  name: string;
  percentage: number;
}

interface Investment {
  id: string;
  description: string;
  amount: number;
  category: "MAQUINARIA" | "MEJORA_LOCAL" | "EQUIPO" | "OTRO";
  purchaseDate: Date;
  notes: string | null;
  businessId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface InvestmentFormProps {
  investment?: Investment;
  partners?: Partner[];
  initialContributions?: ContributionInput[];
}

const categoryLabels: Record<string, string> = {
  MAQUINARIA: "Maquinaria",
  MEJORA_LOCAL: "Mejora del Local",
  EQUIPO: "Equipo",
  OTRO: "Otro",
};

export default function InvestmentForm({
  investment,
  partners = [],
  initialContributions = [],
}: InvestmentFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<InvestmentFormData>({
    description: investment?.description || "",
    amount: investment?.amount || 0,
    category: investment?.category || "MAQUINARIA",
    purchaseDate: investment?.purchaseDate?.toISOString().split("T")[0] || new Date().toISOString().split("T")[0],
    notes: investment?.notes || "",
  });
  const [contributions, setContributions] = useState<ContributionInput[]>(initialContributions);

  const totalContributed = contributions.reduce((s, c) => s + (c.amount || 0), 0);
  const remaining = formData.amount - totalContributed;

  const addContribution = () => {
    const availablePartner = partners.find((p) => !contributions.some((c) => c.partnerId === p.id));
    if (!availablePartner) return;
    setContributions([...contributions, { partnerId: availablePartner.id, amount: 0 }]);
  };

  const removeContribution = (i: number) => setContributions(contributions.filter((_, idx) => idx !== i));

  const updateContribution = (i: number, field: keyof ContributionInput, value: string | number) => {
    setContributions(contributions.map((c, idx) => (idx === i ? { ...c, [field]: value } : c)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (contributions.length > 0 && Math.abs(remaining) > 0.01) {
      toast.error(`Los aportes (${formatCurrency(totalContributed)}) no coinciden con el monto total (${formatCurrency(formData.amount)})`);
      return;
    }

    const validContributions = contributions.filter((c) => c.amount > 0);

    setIsSubmitting(true);
    try {
      const result = investment
        ? await updateInvestment(investment.id, formData, validContributions)
        : await createInvestment(formData, validContributions);

      if (result.success) {
        toast.success(investment ? "Inversión actualizada" : "Inversión creada");
        router.push("/admin/inversiones");
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Error al guardar la inversión");
    } finally {
      setIsSubmitting(false);
    }
  };

  const usedPartnerIds = contributions.map((c) => c.partnerId);
  const availableToAdd = partners.filter((p) => !usedPartnerIds.includes(p.id));

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
          <input
            type="text"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Ej: Máquina sublimadora"
            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Monto (USD)</label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
              placeholder="0.00"
              step="0.01"
              min="0"
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as never })}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              {Object.entries(categoryLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de compra</label>
          <input
            type="date"
            value={formData.purchaseDate}
            onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notas (opcional)</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Detalles adicionales..."
            rows={2}
            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>

        {/* Aportes por socio */}
        {partners.length > 0 && (
          <div className="border border-gray-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-gray-700">Aportes por socio</Label>
              {availableToAdd.length > 0 && (
                <Button type="button" variant="outline" size="sm" onClick={addContribution}>
                  <Plus className="h-3 w-3 mr-1" /> Agregar socio
                </Button>
              )}
            </div>

            {contributions.length === 0 ? (
              <p className="text-xs text-gray-400">
                Opcional — agrega socios si la inversión fue compartida.
              </p>
            ) : (
              <div className="space-y-2">
                {contributions.map((c, i) => {
                  const otherPartnerIds = contributions.filter((_, idx) => idx !== i).map((x) => x.partnerId);
                  const selectablePartners = partners.filter((p) => !otherPartnerIds.includes(p.id));
                  return (
                    <div key={i} className="flex items-center gap-2">
                      <select
                        value={c.partnerId}
                        onChange={(e) => updateContribution(i, "partnerId", e.target.value)}
                        className="flex-1 px-3 py-1.5 text-sm rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
                      >
                        {selectablePartners.map((p) => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                      <Input
                        type="number"
                        step="0.01"
                        min={0}
                        value={c.amount}
                        onChange={(e) => updateContribution(i, "amount", parseFloat(e.target.value) || 0)}
                        className="w-28 h-8 text-sm"
                        placeholder="0.00"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-400 hover:text-red-600"
                        onClick={() => removeContribution(i)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  );
                })}

                <div className={`flex justify-between text-xs pt-1 border-t ${Math.abs(remaining) > 0.01 ? "text-red-600" : "text-green-600"}`}>
                  <span>Total aportado: {formatCurrency(totalContributed)}</span>
                  <span>
                    {Math.abs(remaining) < 0.01
                      ? "✓ Cuadra con el monto total"
                      : remaining > 0
                      ? `Faltan ${formatCurrency(remaining)}`
                      : `Excede por ${formatCurrency(Math.abs(remaining))}`}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2 justify-end pt-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting} className="bg-rose-600 hover:bg-rose-700">
            {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {investment ? "Actualizar" : "Crear"} Inversión
          </Button>
        </div>
      </form>
    </Card>
  );
}
