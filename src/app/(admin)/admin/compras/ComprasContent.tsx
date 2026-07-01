"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Plus, Search, ChevronLeft, ChevronRight, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatCurrency, formatDate } from "@/lib/utils";

interface Purchase {
  id: string;
  description: string;
  notes: string | null;
  totalAmount: number;
  category: string;
  purchaseDate: string | Date;
  supplier: { name: string } | null;
}

interface Props {
  purchases: Purchase[];
  totalGastado: number;
}

const CATEGORY_LABELS: Record<string, string> = {
  SUBLIMABLE:    "Sublimable",
  NO_SUBLIMABLE: "No Sublimable",
  INSUMO:        "Insumo",
  OTROS:         "Otros",
};

const PAGE_SIZE = 10;

export default function ComprasContent({ purchases, totalGastado }: Props) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return purchases;
    return purchases.filter(
      (p) =>
        p.description.toLowerCase().includes(q) ||
        (p.supplier?.name ?? "").toLowerCase().includes(q) ||
        (p.notes ?? "").toLowerCase().includes(q)
    );
  }, [purchases, search]);

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

  const filteredTotal = filtered.reduce((s, p) => s + Number(p.totalAmount), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Compras / Gastos</h1>
          <p className="text-gray-500 text-sm mt-1">
            {filtered.length === purchases.length
              ? `${purchases.length} registros · Total gastado: ${formatCurrency(totalGastado)}`
              : `${filtered.length} de ${purchases.length} registros · Total: ${formatCurrency(filteredTotal)}`}
          </p>
        </div>
        <Link href="/admin/compras/nueva">
          <Button className="bg-rose-600 hover:bg-rose-700">
            <Plus className="h-4 w-4 mr-2" /> Nueva compra
          </Button>
        </Link>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Buscar por descripción, proveedor o notas..."
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
                <th className="text-left py-3 px-4 font-medium text-gray-600">Descripción</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Proveedor</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">Categoría</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">Total</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Fecha</th>
                <th className="py-3 px-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-gray-400">
                    Sin compras registradas.
                  </td>
                </tr>
              )}
              {paginated.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-3 px-4">
                    <p className="font-medium text-gray-900">{p.description}</p>
                    {p.notes && <p className="text-xs text-gray-400">{p.notes}</p>}
                  </td>
                  <td className="py-3 px-4 text-gray-500">{p.supplier?.name ?? "—"}</td>
                  <td className="py-3 px-4 text-center">
                    <Badge variant="outline" className="text-xs">
                      {CATEGORY_LABELS[p.category] ?? p.category}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-gray-900">
                    {formatCurrency(Number(p.totalAmount))}
                  </td>
                  <td className="py-3 px-4 text-gray-500 text-xs">
                    {formatDate(p.purchaseDate)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link href={`/admin/compras/${p.id}`}>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-700">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          <p className="text-sm text-gray-500">
            Mostrando {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} de {filtered.length} compras
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
