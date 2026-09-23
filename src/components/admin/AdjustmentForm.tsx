"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createAdjustment } from "@/actions/inventory-adjustments";
import { ADJUSTMENT_REASONS, AdjustmentReasonValue } from "@/lib/adjustment-reasons";

interface Item {
  id: string;
  code: string;
  description: string;
  category: string;
  availableStock: number;
}

interface Props {
  items: Item[];
  initialItemId?: string;
}

export default function AdjustmentForm({ items, initialItemId }: Props) {
  const router = useRouter();
  const initialItem = items.find((it) => it.id === initialItemId);

  const [selected, setSelected] = useState<Item | undefined>(initialItem);
  const [search, setSearch] = useState(initialItem ? `${initialItem.code} - ${initialItem.description}` : "");
  const [searchOpen, setSearchOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState<AdjustmentReasonValue>(
    initialItem?.category === "INSUMO" || !initialItem ? "CONSUMPTION" : "DAMAGE"
  );
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const q = search.toLowerCase();
  const filtered = items.filter(
    (it) => it.code.toLowerCase().includes(q) || it.description.toLowerCase().includes(q)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return toast.error("Selecciona de la lista el artículo");
    if (quantity > selected.availableStock) {
      return toast.error(`Solo hay ${selected.availableStock} disponibles de ${selected.description}`);
    }

    setLoading(true);
    const result = await createAdjustment({
      inventoryItemId: selected.id,
      quantity,
      reason,
      date: new Date(date),
      note: note || undefined,
    });
    setLoading(false);

    if (result?.error) return toast.error(result.error);
    toast.success("Salida registrada");
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
            onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
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
          {loading ? "Guardando..." : "Registrar salida"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
