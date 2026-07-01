"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { Supplier, InventoryItem, PurchaseCategory } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createPurchase, updatePurchase } from "@/actions/purchases";
import { formatCurrency } from "@/lib/utils";

interface PurchaseLineItem {
  inventoryItemId: string;
  description: string;
  quantity: number;
  unitCost: number;
}

interface InitialData {
  description: string;
  supplierId: string | null;
  category: PurchaseCategory;
  purchaseDate: Date;
  notes: string | null;
  items: Array<{
    inventoryItemId: string | null;
    description: string;
    quantity: number;
    unitCost: number;
  }>;
}

interface Props {
  suppliers?: Supplier[];
  inventoryItems?: (InventoryItem & { suppliers: Array<{ supplier: Supplier }> })[];
  purchaseId?: string;
  initialData?: InitialData;
}

export default function PurchaseForm({ suppliers = [], inventoryItems = [], purchaseId, initialData }: Props) {
  const router = useRouter();
  const isEditing = !!purchaseId;

  const [purchaseDate, setPurchaseDate] = useState(
    initialData
      ? new Date(initialData.purchaseDate).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0]
  );
  const [notes, setNotes] = useState(initialData?.notes ?? "");
  const [items, setItems] = useState<PurchaseLineItem[]>(
    initialData?.items.length
      ? initialData.items.map((item) => ({
          inventoryItemId: item.inventoryItemId ?? "",
          description: item.description,
          quantity: item.quantity,
          unitCost: item.unitCost,
        }))
      : [{ inventoryItemId: "", description: "", quantity: 1, unitCost: 0 }]
  );
  const [loading, setLoading] = useState(false);
  const [itemSearchOpen, setItemSearchOpen] = useState<{ [key: number]: boolean }>({});
  const searchInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});

  const filteredItems = (searchText: string) =>
    inventoryItems.filter(
      (item) =>
        item.description.toLowerCase().includes(searchText.toLowerCase()) ||
        item.code.toLowerCase().includes(searchText.toLowerCase())
    );

  const addLine = () =>
    setItems([...items, { inventoryItemId: "", description: "", quantity: 1, unitCost: 0 }]);

  const removeLine = (i: number) => setItems(items.filter((_, idx) => idx !== i));

  const updateItem = (i: number, field: keyof PurchaseLineItem, value: string | number) => {
    setItems(items.map((item, idx) => (idx === i ? { ...item, [field]: value } : item)));
  };

  const selectInventoryItem = (
    i: number,
    invItem: InventoryItem & { suppliers: Array<{ supplier: Supplier }> }
  ) => {
    setItems(
      items.map((item, idx) =>
        idx === i
          ? { ...item, inventoryItemId: invItem.id, description: invItem.description }
          : item
      )
    );
    setItemSearchOpen({ ...itemSearchOpen, [i]: false });
  };

  const total = items.reduce((sum, item) => sum + item.quantity * item.unitCost, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.some((i) => !i.description.trim())) {
      return toast.error("Completa la descripción de cada item");
    }

    const itemsWithIds = items.map((item) => {
      if (item.inventoryItemId) return item;
      const found = inventoryItems.find(
        (it) => it.description.toLowerCase() === item.description.toLowerCase()
      );
      return found ? { ...item, inventoryItemId: found.id } : item;
    });

    if (itemsWithIds.some((i) => !i.inventoryItemId)) {
      return toast.error("Selecciona un artículo del inventario para cada item");
    }

    const firstInvItem = inventoryItems.find((it) => it.id === itemsWithIds[0].inventoryItemId);
    const category = firstInvItem?.category ?? "SUBLIMABLE";

    const payload = {
      description: "Compra de materiales",
      supplierId: undefined as string | undefined,
      category: category as PurchaseCategory,
      purchaseDate: new Date(purchaseDate),
      notes: notes || undefined,
      items: itemsWithIds.map((item) => ({
        inventoryItemId: item.inventoryItemId,
        description: item.description,
        quantity: item.quantity,
        unitCost: item.unitCost,
      })),
    };

    setLoading(true);
    const result = isEditing
      ? await updatePurchase(purchaseId, payload)
      : await createPurchase(payload);
    setLoading(false);

    if (result?.error) {
      toast.error(isEditing ? "Error al actualizar la compra" : "Error al registrar la compra");
      return;
    }
    toast.success(isEditing ? "Compra actualizada" : "Compra registrada");
    router.push("/admin/compras");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div>
        <Label htmlFor="purchaseDate">Fecha de compra *</Label>
        <Input
          id="purchaseDate"
          type="date"
          value={purchaseDate}
          onChange={(e) => setPurchaseDate(e.target.value)}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="notes">Notas</Label>
        <Input
          id="notes"
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Opcional"
          className="mt-1"
        />
      </div>

      <div>
        <Label>Items comprados *</Label>

        <div className="space-y-3 mt-3">
          {items.map((item, i) => {
            const selectedInvItem = item.inventoryItemId
              ? inventoryItems.find((it) => it.id === item.inventoryItemId)
              : inventoryItems.find(
                  (it) => it.description.toLowerCase() === item.description.toLowerCase()
                );

            const categoryLabel =
              selectedInvItem?.category === "SUBLIMABLE"
                ? "Sublimable"
                : selectedInvItem?.category === "NO_SUBLIMABLE"
                ? "No Sublimable"
                : "—";

            return (
              <div key={i} className="space-y-2 p-3 border border-gray-200 rounded-lg">
                <div className="relative">
                  <Label className="text-xs">Artículo *</Label>
                  <div className="relative mt-1">
                    <Input
                      ref={(ref) => {
                        if (ref) searchInputRefs.current[i] = ref;
                      }}
                      type="text"
                      value={item.description}
                      onChange={(e) => {
                        updateItem(i, "description", e.target.value);
                        setItemSearchOpen({ ...itemSearchOpen, [i]: true });
                      }}
                      placeholder="Buscar artículo..."
                      className="h-9 text-sm"
                      autoComplete="off"
                    />
                    {itemSearchOpen[i] && item.description && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-50 max-h-40 overflow-y-auto">
                        {filteredItems(item.description).length === 0 ? (
                          <div className="p-2 text-sm text-gray-500">Sin resultados</div>
                        ) : (
                          filteredItems(item.description).map((invItem) => (
                            <button
                              key={invItem.id}
                              type="button"
                              onClick={() => selectInventoryItem(i, invItem)}
                              className="w-full text-left p-2 hover:bg-gray-100 text-sm border-b last:border-b-0"
                            >
                              <div className="font-medium">
                                {invItem.code} - {invItem.description}
                              </div>
                              <div className="text-xs text-gray-500">
                                Categoría:{" "}
                                {invItem.category === "SUBLIMABLE"
                                  ? "Sublimable"
                                  : invItem.category === "NO_SUBLIMABLE"
                                  ? "No Sublimable"
                                  : invItem.category}
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <Label className="text-xs">Categoría</Label>
                    <div className="mt-1 h-9 text-sm flex items-center text-gray-600 bg-gray-50 rounded px-2">
                      {categoryLabel}
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">Cant.</Label>
                    <Input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => updateItem(i, "quantity", parseInt(e.target.value) || 1)}
                      className="mt-1 h-9 text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Costo unitario</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={item.unitCost}
                      onChange={(e) =>
                        updateItem(i, "unitCost", parseFloat(e.target.value) || 0)
                      }
                      className="mt-1 h-9 text-sm"
                    />
                  </div>
                  <div>
                    {items.length > 1 && (
                      <div className="flex justify-end h-9 items-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 text-red-500 hover:text-red-700"
                          onClick={() => removeLine(i)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <Button type="button" variant="outline" size="sm" onClick={addLine} className="mt-3">
          <Plus className="h-4 w-4 mr-1" /> Agregar item
        </Button>

        <div className="text-right mt-4">
          <p className="text-lg font-bold text-gray-900">
            Total: <span className="text-rose-600">{formatCurrency(total)}</span>
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={loading} className="bg-rose-600 hover:bg-rose-700">
          {loading ? "Guardando..." : isEditing ? "Guardar cambios" : "Registrar compra"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
