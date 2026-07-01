"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createSale } from "@/actions/sales";
import { formatCurrency } from "@/lib/utils";

interface ItemForSale {
  id: string;
  code: string;
  description: string;
  category: string;
  availableStock: number;
}

interface SaleLineItem {
  inventoryItemId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  productionCost: number;
  customization: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  SUBLIMABLE: "Sublimable",
  NO_SUBLIMABLE: "No Sublimable",
  OTROS: "Otros",
};

export default function SaleForm({ items: allItems }: { items: ItemForSale[] }) {
  const router = useRouter();
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("PENDING");
  const [businessLine, setBusinessLine] = useState("PERSONALIZACION");
  const [lines, setLines] = useState<SaleLineItem[]>([
    { inventoryItemId: "", description: "", quantity: 1, unitPrice: 0, productionCost: 0, customization: "" },
  ]);
  const [searchOpen, setSearchOpen] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(false);
  const searchRefs = useRef<Record<number, HTMLInputElement | null>>({});

  const filteredItems = (text: string) => {
    if (!text.trim()) return allItems;
    return allItems.filter(
      (item) =>
        item.description.toLowerCase().includes(text.toLowerCase()) ||
        item.code.toLowerCase().includes(text.toLowerCase())
    );
  };

  const addLine = () =>
    setLines([...lines, { inventoryItemId: "", description: "", quantity: 1, unitPrice: 0, productionCost: 0, customization: "" }]);

  const removeLine = (i: number) => setLines(lines.filter((_, idx) => idx !== i));

  const updateLine = (i: number, field: keyof SaleLineItem, value: string | number) => {
    setLines(lines.map((line, idx) => (idx === i ? { ...line, [field]: value } : line)));
  };

  const selectItem = (i: number, item: ItemForSale) => {
    setLines(
      lines.map((line, idx) =>
        idx === i
          ? { ...line, inventoryItemId: item.id, description: item.description }
          : line
      )
    );
    setSearchOpen({ ...searchOpen, [i]: false });
  };

  const getSelectedItem = (line: SaleLineItem) =>
    allItems.find((item) => item.id === line.inventoryItemId);

  const total = lines.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0);
  const totalCosto = lines.reduce((sum, line) => sum + line.productionCost, 0);
  const gananciaNeta = total - totalCosto;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) return toast.error("Nombre del cliente requerido");
    if (lines.some((l) => !l.inventoryItemId)) return toast.error("Selecciona un producto en cada línea");

    for (const line of lines) {
      const item = getSelectedItem(line);
      if (item && item.availableStock < line.quantity) {
        return toast.error(`No hay inventario: ${item.description} (disponible: ${item.availableStock})`);
      }
    }

    setLoading(true);
    const result = await createSale({
      clientName,
      clientPhone,
      notes,
      status: status as never,
      businessLine: businessLine as never,
      items: lines.map(({ inventoryItemId, quantity, unitPrice, productionCost, customization }) => ({
        inventoryItemId,
        quantity,
        unitPrice,
        productionCost,
        customization,
      })),
    });
    setLoading(false);

    if (result.error) {
      const msg = typeof result.error === "string" ? result.error : "Error al registrar la venta";
      return toast.error(msg);
    }
    toast.success("Venta registrada");
    router.push("/admin/ventas");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="clientName">Nombre del cliente *</Label>
          <Input
            id="clientName"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="clientPhone">Teléfono / WhatsApp</Label>
          <Input
            id="clientPhone"
            value={clientPhone}
            onChange={(e) => setClientPhone(e.target.value)}
            className="mt-1"
            placeholder="+507..."
          />
        </div>
        <div>
          <Label>Estado</Label>
          <Select value={status} onValueChange={(v) => v && setStatus(v)}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PENDING">Pendiente</SelectItem>
              <SelectItem value="IN_PROGRESS">En proceso</SelectItem>
              <SelectItem value="COMPLETED">Completado</SelectItem>
              <SelectItem value="CANCELLED">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Rama del negocio</Label>
          <Select value={businessLine} onValueChange={(v) => v && setBusinessLine(v)}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PERSONALIZACION">Personalización</SelectItem>
              <SelectItem value="ARREGLOS">Arreglos</SelectItem>
              <SelectItem value="IMPRESIONES">Impresiones</SelectItem>
              <SelectItem value="OTRO">Otro</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="notes">Notas</Label>
          <Input
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="mt-1"
            placeholder="Instrucciones especiales..."
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <Label>Artículos *</Label>
          <Button type="button" variant="outline" size="sm" onClick={addLine}>
            <Plus className="h-4 w-4 mr-1" /> Agregar línea
          </Button>
        </div>

        <div className="space-y-3">
          {lines.map((line, i) => {
            const selected = getSelectedItem(line);
            const noStock = selected && selected.availableStock <= 0;

            return (
              <div key={i} className="space-y-2 p-3 border border-gray-200 rounded-lg">
                <div className="relative">
                  <Label className="text-xs">Producto *</Label>
                  <div className="relative mt-1">
                    <Input
                      ref={(ref) => { searchRefs.current[i] = ref; }}
                      type="text"
                      value={line.description}
                      onChange={(e) => {
                        const val = e.target.value;
                        setLines((prev) =>
                          prev.map((line, idx) =>
                            idx === i ? { ...line, description: val, inventoryItemId: "" } : line
                          )
                        );
                        setSearchOpen((s) => ({ ...s, [i]: true }));
                      }}
                      onFocus={() => setSearchOpen({ ...searchOpen, [i]: true })}
                      onBlur={() => setTimeout(() => setSearchOpen((s) => ({ ...s, [i]: false })), 150)}
                      placeholder="Buscar producto..."
                      className="h-9 text-sm"
                      autoComplete="off"
                    />
                    {searchOpen[i] && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-50 max-h-48 overflow-y-auto">
                        {filteredItems(line.description).length === 0 ? (
                          <div className="p-2 text-sm text-gray-500">Sin resultados</div>
                        ) : (
                          filteredItems(line.description).map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              disabled={item.availableStock <= 0}
                              onClick={() => selectItem(i, item)}
                              className="w-full text-left p-2 hover:bg-gray-100 text-sm border-b last:border-b-0 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <div className="font-medium flex items-center justify-between">
                                <span>{item.code} - {item.description}</span>
                                {item.availableStock <= 0 && (
                                  <span className="text-xs text-red-500 font-semibold">Sin stock</span>
                                )}
                              </div>
                              <div className="text-xs text-gray-500 flex justify-between">
                                <span>{CATEGORY_LABELS[item.category] ?? item.category}</span>
                                <span>Stock: {item.availableStock}</span>
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                  {noStock && (
                    <p className="text-xs text-red-500 mt-1">No hay inventario para este producto</p>
                  )}
                </div>

                <div className="grid grid-cols-5 gap-2">
                  <div>
                    <Label className="text-xs">Cant.</Label>
                    <Input
                      type="number"
                      min={1}
                      max={selected?.availableStock ?? undefined}
                      value={line.quantity}
                      onChange={(e) => updateLine(i, "quantity", parseInt(e.target.value) || 1)}
                      className="mt-1 h-9 text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Precio unit.</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min={0}
                      value={line.unitPrice}
                      onChange={(e) => updateLine(i, "unitPrice", parseFloat(e.target.value) || 0)}
                      className="mt-1 h-9 text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Costo prod.</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min={0}
                      value={line.productionCost}
                      onChange={(e) => updateLine(i, "productionCost", parseFloat(e.target.value) || 0)}
                      className="mt-1 h-9 text-sm"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Ganancia</Label>
                    <div className={`mt-1 h-9 text-sm flex items-center font-medium rounded px-2 ${
                      line.quantity * line.unitPrice - line.productionCost >= 0
                        ? "text-green-700 bg-green-50"
                        : "text-red-700 bg-red-50"
                    }`}>
                      {formatCurrency(line.quantity * line.unitPrice - line.productionCost)}
                    </div>
                  </div>
                  <div>
                    {lines.length > 1 && (
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

                <div>
                  <Label className="text-xs">Personalización</Label>
                  <Input
                    value={line.customization}
                    onChange={(e) => updateLine(i, "customization", e.target.value)}
                    className="mt-1 h-8 text-sm"
                    placeholder="Texto, nombre, etc..."
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-3 flex flex-col items-end gap-1 text-sm">
          <p className="text-gray-600">Venta total: <span className="font-semibold text-gray-900">{formatCurrency(total)}</span></p>
          <p className="text-gray-600">Costo producción: <span className="font-semibold text-gray-900">{formatCurrency(totalCosto)}</span></p>
          <p className="text-base font-bold">
            Ganancia estimada:{" "}
            <span className={gananciaNeta >= 0 ? "text-green-600" : "text-red-600"}>
              {formatCurrency(gananciaNeta)}
            </span>
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={loading} className="bg-rose-600 hover:bg-rose-700">
          {loading ? "Guardando..." : "Registrar venta"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
