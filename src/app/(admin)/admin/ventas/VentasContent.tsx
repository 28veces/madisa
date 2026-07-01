"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Plus, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatCurrency, formatDate } from "@/lib/utils";
import UpdateSaleStatusButton from "./UpdateSaleStatusButton";

interface SaleItem {
  quantity: number;
  unitPrice: number;
  productionCost: number;
  inventoryItem: { description: string };
}

interface Sale {
  id: string;
  clientName: string;
  clientPhone: string | null;
  totalAmount: number;
  status: string;
  createdAt: string | Date;
  items: SaleItem[];
}

interface Props {
  sales: Sale[];
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING:     { label: "Pendiente",  color: "bg-yellow-100 text-yellow-700" },
  IN_PROGRESS: { label: "En proceso", color: "bg-blue-100 text-blue-700"   },
  COMPLETED:   { label: "Completado", color: "bg-green-100 text-green-700"  },
  CANCELLED:   { label: "Cancelado",  color: "bg-gray-100 text-gray-500"    },
};

const PAGE_SIZE = 10;

export default function VentasContent({ sales }: Props) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const pendingCount = sales.filter((s) => s.status === "PENDING").length;

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return sales;
    return sales.filter(
      (s) =>
        s.clientName.toLowerCase().includes(q) ||
        (s.clientPhone ?? "").includes(q) ||
        s.items.some((i) => i.inventoryItem.description.toLowerCase().includes(q))
    );
  }, [sales, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = useMemo(
    () => filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [filtered, currentPage]
  );

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">Ventas</h1>
            {pendingCount > 0 && (
              <Badge className="bg-yellow-100 text-yellow-700 text-base px-3 py-1">
                {pendingCount} pendiente{pendingCount > 1 ? "s" : ""}
              </Badge>
            )}
          </div>
          <p className="text-gray-500 text-sm mt-1">
            {filtered.length === sales.length
              ? `${sales.length} ventas registradas`
              : `${filtered.length} de ${sales.length} ventas`}
          </p>
        </div>
        <Link href="/admin/ventas/nueva">
          <Button className="bg-rose-600 hover:bg-rose-700">
            <Plus className="h-4 w-4 mr-2" /> Nueva venta
          </Button>
        </Link>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Buscar por cliente, teléfono o artículo..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left py-3 px-4 font-medium text-gray-600">Cliente</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Artículos</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">Total</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">Ganancia</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">Estado</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Fecha</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-gray-400">
                    Sin ventas registradas.
                  </td>
                </tr>
              )}
              {paginated.map((sale) => {
                const statusInfo = STATUS_LABELS[sale.status] ?? STATUS_LABELS.PENDING;
                const ganancia = sale.items.reduce(
                  (s, i) => s + i.quantity * Number(i.unitPrice) - Number(i.productionCost),
                  0
                );
                return (
                  <tr key={sale.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-medium text-gray-900">{sale.clientName}</p>
                      {sale.clientPhone && (
                        <p className="text-xs text-gray-400">{sale.clientPhone}</p>
                      )}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {sale.items.map((i) => `${i.inventoryItem.description} ×${i.quantity}`).join(", ")}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-gray-900">
                      {formatCurrency(Number(sale.totalAmount))}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold">
                      <span className={ganancia >= 0 ? "text-green-600" : "text-red-600"}>
                        {formatCurrency(ganancia)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
                    </td>
                    <td className="py-3 px-4 text-gray-500 text-xs">
                      {formatDate(sale.createdAt)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/admin/ventas/${sale.id}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500 hover:text-blue-700">
                            <Search className="h-4 w-4" />
                          </Button>
                        </Link>
                        <UpdateSaleStatusButton id={sale.id} currentStatus={sale.status} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          <p className="text-sm text-gray-500">
            Mostrando {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} de {filtered.length} ventas
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
              .reduce<(number | "…")[]>((acc, p, idx, arr) => {
                if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("…");
                acc.push(p);
                return acc;
              }, [])
              .map((p, idx) =>
                p === "…" ? (
                  <span key={`ellipsis-${idx}`} className="px-2 text-gray-400 text-sm">…</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p as number)}
                    className={`min-w-[32px] h-8 px-2 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === p ? "bg-rose-600 text-white" : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {p}
                  </button>
                )
              )}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
