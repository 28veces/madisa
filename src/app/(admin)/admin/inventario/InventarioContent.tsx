"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Plus, Search, ChevronLeft, ChevronRight, Pencil, PackageMinus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

interface InventoryItem {
  id: string;
  code: string;
  description: string;
  category: string;
  note: string | null;
  isActive: boolean;
  totalQuantityPurchased: number;
  totalQuantitySold: number;
  totalQuantityAdjusted: number;
  availableStock: number;
  avgUnitCost: number;
}

interface Props {
  items: InventoryItem[];
}

const CATEGORIES = [
  { value: "SUBLIMABLE", label: "Sublimable" },
  { value: "NO_SUBLIMABLE", label: "No Sublimable" },
  { value: "INSUMO", label: "Insumo" },
  { value: "OTROS", label: "Otros" },
];

const PAGE_SIZE = 10;

export default function InventarioContent({ items }: Props) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const getCategoryLabel = (category: string) => {
    return CATEGORIES.find(c => c.value === category)?.label || category;
  };

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        item.code.toLowerCase().includes(search.toLowerCase()) ||
        item.description.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = !selectedCategory || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [items, search, selectedCategory]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleFilterChange = (category: string | null) => {
    setSelectedCategory(category);
    setPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventario de Materiales</h1>
          <p className="text-gray-500 text-sm mt-1">{filtered.length} de {items.length} artículos</p>
        </div>
        <Link href="/admin/articulos/nuevo">
          <Button className="bg-rose-600 hover:bg-rose-700">
            <Plus className="h-4 w-4 mr-2" /> Nuevo artículo
          </Button>
        </Link>
      </div>

      <div className="space-y-4">
        {/* Búsqueda */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por código o descripción..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filtros por categoría */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleFilterChange(null)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === null
                ? "bg-rose-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Todas
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => handleFilterChange(cat.value)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === cat.value
                  ? "bg-rose-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left py-3 px-4 font-medium text-gray-600">Código</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Descripción</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Categoría</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">Comprado</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">Vendido</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">Salidas</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">Stock</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600" title="Costo promedio ponderado por unidad según tus compras">Costo prom.</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Nota</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={10} className="text-center py-10 text-gray-400">
                    No hay artículos. <Link href="/admin/articulos/nuevo" className="text-rose-600 hover:underline">Crear primero.</Link>
                  </td>
                </tr>
              )}
              {paginated.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-mono font-medium text-gray-900">{item.code}</span>
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-medium text-gray-900">{item.description}</p>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant="outline" className="text-xs">
                      {getCategoryLabel(item.category)}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right text-gray-600">
                    {item.totalQuantityPurchased}
                  </td>
                  <td className="py-3 px-4 text-right text-gray-600">
                    {item.totalQuantitySold}
                  </td>
                  <td className="py-3 px-4 text-right text-gray-600">
                    {item.totalQuantityAdjusted}
                  </td>
                  <td className="py-3 px-4 text-right font-semibold">
                    <span className={item.availableStock <= 0 ? "text-red-600" : item.availableStock <= 3 ? "text-amber-600" : "text-gray-900"}>
                      {item.availableStock}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right text-gray-600">
                    {item.avgUnitCost > 0 ? formatCurrency(item.avgUnitCost) : "—"}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {item.note || "—"}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {item.availableStock > 0 && (
                        <Link href={`/admin/salidas/nueva?articulo=${item.id}`} title="Registrar salida">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-gray-700">
                            <PackageMinus className="h-4 w-4" />
                          </Button>
                        </Link>
                      )}
                      <Link href={`/admin/articulos/${item.id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-gray-700">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          <p className="text-sm text-gray-500">
            Mostrando {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} de {filtered.length} artículos
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
                      currentPage === p
                        ? "bg-rose-600 text-white"
                        : "text-gray-600 hover:bg-gray-100"
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
