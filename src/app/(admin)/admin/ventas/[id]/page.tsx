export const dynamic = "force-dynamic";

import { getSale } from "@/actions/sales";
import { formatDate } from "@/lib/utils";
import { ArrowLeft, Download } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { UserRole } from "@prisma/client";
import { requireBusiness } from "@/lib/require-auth";
import SaleItemsEditor from "./SaleItemsEditor";

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

  const { role } = await requireBusiness();
  const sale = await getSale(id).catch(() => null);

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

      <SaleItemsEditor
        saleId={sale.id}
        totalAmount={Number(sale.totalAmount)}
        canEdit={role === UserRole.ADMIN || role === UserRole.SECRETARY}
        items={sale.items.map((item) => ({
          id: item.id,
          description: item.inventoryItem.description,
          customization: item.customization,
          quantity: item.quantity,
          unitPrice: Number(item.unitPrice),
          productionCost: Number(item.productionCost),
        }))}
      />
    </div>
  );
}
