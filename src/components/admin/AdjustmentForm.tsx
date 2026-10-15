"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createAdjustment, updateAdjustment } from "@/actions/inventory-adjustments";
import { parseNumberField, type NumberField } from "@/lib/utils";
import { ADJUSTMENT_REASONS, AdjustmentReasonValue } from "@/lib/adjustment-reasons";

interface Item {
  id: string;
  code: string;
  description: string;
  category: string;
  availableStock: number;
}

interface InitialData {
  inventoryItemId: string;
  quantity: number;
  reason: AdjustmentReasonValue;
  date: string; // AAAA-MM-DD
  note: string | null;
}

interface Props {
  items: Item[];
  initialItemId?: string;
  // Si viene, el formulario edita esa salida en vez de crear una nueva
  adjustmentId?: string;
  initialData?: InitialData;
}

export default function AdjustmentForm({ items: rawItems, initialItemId, adjustmentId, initialData }: Props) {
  const router = useRouter();
  const isEditing = !!adjustmentId;
  // Al editar, las unidades de esta misma salida vuelven a estar disponibles para su artículo
  const items = initialData
    ? rawItems.map((it) =>
        it.id === initialData.inventoryItemId
          ? { ...it, availableStock: it.availableStock + initialData.quantity }
          : it
      )
    : rawItems;
  const initialItem = items.find((it) => it.id === (initialData?.inventoryItemId ?? initialItemId));

  const [selected, setSelected] = useState<Item | undefined>(initialItem);
  const [search, setSearch] = useState(initialItem ? `${initialItem.code} - ${initialItem.description}` : "");
  const [searchOpen, setSearchOpen] = useState(false);
  const [quantity, setQuantity] = useState<NumberField>(initialData?.quantity ?? 1);
  const [reason, setReason] = useState<AdjustmentReasonValue>(
    initialData?.reason ??
      (initialItem?.category === "INSUMO" || !initialItem ? "CONSUMPTION" : "DAMAGE")
  );
  const [date, setDate] = useState(initialData?.date ?? new Date().toISOString().split("T")[0]);
  const [note, setNote] = useState(initialData?.note ?? "");
  const [loading, setLoading] = useState(false);

  const q = search.toLowerCase();
  const filtered = items.filter(
    (it) => it.code.toLowerCase().includes(q) || it.description.toLowerCase().includes(q)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return toast.error("Selecciona de la lista el artículo");
    if (quantity === "" || quantity < 1 || !Number.isInteger(quantity)) {
      return toast.error("La cantidad debe ser un número entero mayor que 0");
    }
    if (quantity > selected.availableStock) {
      return toast.error(`Solo hay ${selected.availableStock} disponibles de ${selected.description}`);
    }

    setLoading(true);
    const payload = {
      inventoryItemId: selected.id,
      quantity,
      reason,
      date: new Date(date),
      note: note || undefined,
    };
    let result: { error?: string; success?: boolean };
    try {
      result = isEditing
        ? await updateAdjustment(adjustmentId, payload)
        : await createAdjustment(payload);
    } catch {
      result = { error: "No tienes permiso para guardar salidas" };
    } finally {
      setLoading(false);
    }

    if (result?.error) return toast.error(result.error);
    toast.success(isEditing ? "Salida actualizada" : "Salida registrada");
    router.push("/admin/salidas");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div className="relative">
        <Label>Artículo *</Label>
        <Input
          type="text"
          value={search}
          onChange={(e) => {
            // Editar el texto suelta el artículo elegido, igual que en compras
            setSearch(e.target.value);
            setSelected(undefined);
            setSearchOpen(true);
          }}
          onFocus={() => setSearchOpen(true)}
          placeholder="Buscar por código o descripción..."
          className="mt-1"
          autoComplete="off"
        />
        {searchOpen && !selected && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="p-2 text-sm text-gray-500">Sin resultados</div>
            ) : (
              filtered.map((it) => (
                <button
                  key={it.id}
                  type="button"
                  disabled={it.availableStock <= 0}
                  onClick={() => {
                    setSelected(it);
                    setSearch(`${it.code} - ${it.description}`);
                    setSearchOpen(false);
                    if (it.category === "INSUMO") setReason("CONSUMPTION");
                  }}
                  className="w-full text-left p-2 hover:bg-gray-100 text-sm border-b last:border-b-0 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <div className="font-medium">
                    {it.code} - {it.description}
                  </div>
                  <div className="text-xs text-gray-500">Disponible: {it.availableStock}</div>
                </button>
              ))
            )}
          </div>
        )}
        {selected && (
          <p className="text-xs text-gray-500 mt-1">Disponible: {selected.availableStock}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="quantity">Cantidad *</Label>
          <Input
            id="quantity"
            type="number"
            min={1}
            max={selected?.availableStock}
            value={quantity}
            onChange={(e) => setQuantity(parseNumberField(e.target.value))}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="date">Fecha *</Label>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1"
          />
        </div>
      </div>

      <div>
        <Label>Motivo *</Label>
        <div className="flex flex-wrap gap-2 mt-2">
          {ADJUSTMENT_REASONS.map((r) => (
            <button
              key={r.value}
              type="button"
              onClick={() => setReason(r.value)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                reason === r.value
                  ? "bg-rose-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="note">Nota</Label>
        <Input
          id="note"
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Opcional, ej: pedido de 20 tazas para boda"
          className="mt-1"
        />
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={loading} className="bg-rose-600 hover:bg-rose-700">
          {loading ? "Guardando..." : isEditing ? "Guardar cambios" : "Registrar salida"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
