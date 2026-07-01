export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ArrowLeft, Download } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const statusLabels: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Pendiente", color: "bg-yellow-100 text-yellow-700" },
  IN_PROGRESS: { label: "En proceso", color: "bg-blue-100 text-blue-700" },
  COMPLETED: { label: "Completado", color: "bg-green-100 text-green-700" },
  CANCELLED: { label: "Cancelado", color: "bg-gray-100 text-gray-500" },
};

const businessLineLabels: Record<string, string> = {
  PERSONALIZACION: "Personalización",
  ARREGLOS: "Arreglos",
  IMPRESIONES: "Impresiones",
  OTRO: "Otro",
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function SaleDetailPage({ params }: Props) {
  const { id } = await params;

  const sale = await prisma.sale.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          inventoryItem: true,
        },
      },
    },
  }).catch(() => null);

  if (!sale) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link href="/admin/ventas" className="inline-flex items-center gap-2 text-sm mb-4 text-gray-600 hover:text-gray-900">
          <ArrowLeft className="h-4 w-4" />
          Volver a ventas
        </Link>
        <div className="text-center py-16">
          <p className="text-gray-500">Venta no encontrada</p>
        </div>
      </div>
    );
  }

  const statusInfo = statusLabels[sale.status] || statusLabels.PENDING;
  const totalGanancia = sale.items.reduce(
    (sum, item) => sum + (item.quantity * item.unitPrice - item.productionCost),
    0
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/admin/ventas" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
          <ArrowLeft className="h-4 w-4" />
          Volver a ventas
        </Link>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Descargar
        </Button>
      </div>

      {/* Encabezado */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-gray-900">Venta #{sale.id.slice(0, 8)}</h1>
              <p className="text-sm text-gray-500">{formatDate(sale.createdAt)}</p>
            </div>
            <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-gray-500 uppercase">Cliente</p>
              <p className="font-medium text-gray-900">{sale.clientName}</p>
              {sale.clientPhone && (
                <p className="text-sm text-gray-600">{sale.clientPhone}</p>
              )}
            </div>
            {sale.businessLine && (
              <div>
                <p className="text-xs text-gray-500 uppercase">Rama</p>
                <p className="font-medium text-gray-900">{businessLineLabels[sale.businessLine]}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-gray-500 uppercase">Estado</p>
              <p className="font-medium text-gray-900">{statusInfo.label}</p>
            </div>
          </div>
          {sale.notes && (
            <div className="border-t pt-4">
              <p className="text-xs text-gray-500 uppercase mb-2">Notas</p>
              <p className="text-gray-700">{sale.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Items */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Artículos</CardTitle>
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
                {sale.items.map((item) => {
                  const subtotal = item.quantity * item.unitPrice;
                  const ganancia = subtotal - item.productionCost;
                  return (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="py-3 px-2">
                        <div>
                          <p className="font-medium text-gray-900">{item.inventoryItem.description}</p>
                          {item.customization && (
                            <p className="text-xs text-gray-500">Personalización: {item.customization}</p>
                          )}
                        </div>
                      </td>
                      <td className="text-right py-3 px-2">{item.quantity}</td>
                      <td className="text-right py-3 px-2">{formatCurrency(Number(item.unitPrice))}</td>
                      <td className="text-right py-3 px-2">{formatCurrency(Number(item.productionCost))}</td>
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
        </CardContent>
      </Card>

      {/* Resumen financiero */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Resumen Financiero</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Total de venta:</span>
              <span className="font-semibold text-gray-900">{formatCurrency(Number(sale.totalAmount))}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Costo producción:</span>
              <span className="font-semibold text-gray-900">
                {formatCurrency(sale.items.reduce((sum, item) => sum + item.productionCost, 0))}
              </span>
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
    </div>
  );
}
