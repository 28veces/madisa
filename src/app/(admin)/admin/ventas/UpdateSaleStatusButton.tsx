"use client";

import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateSaleStatus } from "@/actions/sales";
import { SaleStatus } from "@prisma/client";

const statusOptions = [
  { value: "PENDING", label: "Pendiente" },
  { value: "IN_PROGRESS", label: "En proceso" },
  { value: "COMPLETED", label: "Completado" },
  { value: "CANCELLED", label: "Cancelado" },
];

export default function UpdateSaleStatusButton({
  id,
  currentStatus,
}: {
  id: string;
  currentStatus: string;
}) {
  const handleChange = async (status: string | null) => {
    if (!status || status === currentStatus) return;
    const result = await updateSaleStatus(id, status as SaleStatus);
    if ("error" in result) {
      toast.error(result.error);
      return;
    }
    toast.success(status === "CANCELLED" ? "Venta cancelada; sus unidades volvieron al inventario" : "Estado actualizado");
  };

  return (
    <Select value={currentStatus} onValueChange={handleChange}>
      <SelectTrigger className="h-8 w-36 text-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {statusOptions.map((opt) => (
          <SelectItem key={opt.value} value={opt.value} className="text-xs">
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
