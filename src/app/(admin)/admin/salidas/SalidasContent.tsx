"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Plus, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/utils";
import { ADJUSTMENT_REASONS, adjustmentReasonLabel } from "@/lib/adjustment-reasons";
import DeleteAdjustmentButton from "./DeleteAdjustmentButton";

interface Adjustment {
  id: string;
  code: string;
  description: string;
  quantity: number;
  reason: string;
  date: string | Date;
  note: string | null;
}

interface Props {
  adjustments: Adjustment[];
  canDelete: boolean;
  canCreate: boolean;
}

const PAGE_SIZE = 10;

const reasonColors: Record<string, string> = {
  CONSUMPTION: "bg-blue-100 text-blue-700",
  DAMAGE: "bg-red-100 text-red-700",
  COUNT_ADJUSTMENT: "bg-amber-100 text-amber-700",
};

export default function SalidasContent({ adjustments, canDelete, canCreate }: Props) {
  const [search, setSearch] = useState("");
  const [reason, setReason] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return adjustments.filter(
      (a) =>
        (!reason || a.reason === reason) &&
        (!q ||
          a.code.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          (a.note ?? "").toLowerCase().includes(q))
    );
  }, [adjustments, search, reason]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Salidas de inventario</h1>
          <p className="text-gray-500 text-sm mt-1">
            Consumo de insumos, mermas y ajustes. Descuentan stock sin contar como venta ni egreso.
          </p>
        </div>
        {canCreate && (
          <Link href="/admin/salidas/nueva">
            <Button className="bg-rose-600 hover:bg-rose-700">
              <Plus className="h-4 w-4 mr-2" /> Nueva salida
            </Button>
          </Link>
        )}
      </div>

      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por código, artículo o nota..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-10"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {[{ value: null, label: "Todas" }, ...ADJUSTMENT_REASONS].map((r) => (
            <button
              key={r.value ?? "all"}
              onClick={() => {
                setReason(r.value);
                setPage(1);
              }}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
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

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left py-3 px-4 font-medium text-gray-600">Fecha</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Artículo</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">Cantidad</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Motivo</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Nota</th>
                {canDelete && (
                  <th className="text-right py-3 px-4 font-medium text-gray-600">Acciones</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={canDelete ? 6 : 5} className="text-center py-10 text-gray-400">
                    Sin salidas registradas.
                  </td>
                </tr>
              )}
              {paginated.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-3 px-4 text-gray-500 text-xs">{formatDate(a.date)}</td>
                  <td className="py-3 px-4">
                    <span className="font-mono text-gray-500 mr-2">{a.code}</span>
                    <span className="font-medium text-gray-900">{a.description}</span>
                  </td>
                  <td className="py-3 px-4 text-right font-semibold text-gray-900">−{a.quantity}</td>
                  <td className="py-3 px-4">
                    <Badge className={reasonColors[a.reason]}>{adjustmentReasonLabel(a.reason)}</Badge>
                  </td>
                  <td className="py-3 px-4 text-gray-600 text-xs">{a.note || "—"}</td>
                  {canDelete && (
                    <td className="py-3 px-4 text-right">
                      <DeleteAdjustmentButton id={a.id} label={`${a.quantity} × ${a.description}`} />
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          <p className="text-sm text-gray-500">
            Mostrando {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} de {filtered.length} salidas
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm text-gray-600 px-2">
              {currentPage} / {totalPages}
            </span>
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
