"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { updateSaleItemCosts } from "@/actions/sales";

interface Item {
  id: string;
  description: string;
  customization: string | null;
  quantity: number;
  unitPrice: number;
  productionCost: number;
}

interface Props {
  saleId: string;
  totalAmount: number;
  items: Item[];
  canEdit: boolean;
}

export default function SaleItemsEditor({ saleId, totalAmount, items, canEdit }: Props) {
  const router = useRouter();
  const [costs, setCosts] = useState<Record<string, number>>(
    Object.fromEntries(items.map((i) => [i.id, i.productionCost]))
  );
  const [saving, setSaving] = useState(false);

  const dirty = items.some((i) => costs[i.id] !== i.productionCost);
  const totalCosto = items.reduce((sum, i) => sum + costs[i.id], 0);
  const totalGanancia = items.reduce((sum, i) => sum + i.quantity * i.unitPrice - costs[i.id], 0);

  const handleSave = async () => {
    setSaving(true);
    const result = await updateSaleItemCosts(
      saleId,
      items.map((i) => ({ id: i.id, productionCost: costs[i.id] }))
    );
    setSaving(false);
    if (result.error) return toast.error(result.error);
    toast.success("Costos actualizados");
    router.refresh();
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Artículos</CardTitle>
            {canEdit && dirty && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCosts(Object.fromEntries(items.map((i) => [i.id, i.productionCost])))}
                >
                  Descartar
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-rose-600 hover:bg-rose-700"
                >
                  {saving ? "Guardando..." : "Guardar costos"}
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2 font-medium text-gray-600">Producto</th>
                  <th className="text-right py-2 px-2 font-medium text-gray-600">Cantidad</th>
                  <th className="text-right py-2 px-2 font-medium text-gray-600">Precio Unit.</th>
                  <th className="text-right py-2 px-2 font-medium text-gray-600">Costo Prod.</th>
                  <th className="text-right py-2 px-2 font-medium text-gray-600">Subtotal</th>
                  <th className="text-right py-2 px-2 font-medium text-gray-600">Ganancia</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {items.map((item) => {
                  const subtotal = item.quantity * item.unitPrice;
                  const ganancia = subtotal - costs[item.id];
                  return (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="py-3 px-2">
                        <p className="font-medium text-gray-900">{item.description}</p>
                        {item.customization && (
                          <p className="text-xs text-gray-500">Personalización: {item.customization}</p>
                        )}
                      </td>
                      <td className="text-right py-3 px-2">{item.quantity}</td>
                      <td className="text-right py-3 px-2">{formatCurrency(item.unitPrice)}</td>
                      <td className="text-right py-3 px-2">
                        {canEdit ? (
                          <Input
                            type="number"
                            step="0.01"
                            min={0}
                            value={costs[item.id]}
                            onChange={(e) =>
                              setCosts({ ...costs, [item.id]: parseFloat(e.target.value) || 0 })
                            }
                            className="h-8 w-24 text-sm text-right ml-auto"
                            aria-label={`Costo de producción de ${item.description}`}
                          />
                        ) : (
                          formatCurrency(costs[item.id])
                        )}
                      </td>
                      <td className="text-right py-3 px-2 font-medium">{formatCurrency(subtotal)}</td>
                      <td className={`text-right py-3 px-2 font-medium ${ganancia >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {formatCurrency(ganancia)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {canEdit && (
            <p className="text-xs text-gray-400 mt-3">
              El costo es el total de la línea (cantidad × costo unitario). Se sugiere con el costo promedio de compra y puedes ajustarlo.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Resumen Financiero</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Total de venta:</span>
              <span className="font-semibold text-gray-900">{formatCurrency(totalAmount)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Costo producción:</span>
              <span className="font-semibold text-gray-900">{formatCurrency(totalCosto)}</span>
            </div>
            <div className="flex justify-between items-center py-3 bg-green-50 px-3 rounded-lg">
              <span className="font-semibold text-gray-900">Ganancia neta:</span>
              <span className={`text-lg font-bold ${totalGanancia >= 0 ? "text-green-600" : "text-red-600"}`}>
                {formatCurrency(totalGanancia)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
