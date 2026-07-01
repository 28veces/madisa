"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Plus, ChevronLeft, ChevronRight, Pencil, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import DeleteItemButton from "./DeleteItemButton";

interface Supplier {
  supplierId: string;
  supplier: { name: string };
}

interface Item {
  id: string;
  code: string;
  description: string;
  category: string;
  note: string | null;
  isActive: boolean;
  suppliers: Supplier[];
}

interface Props {
  items: Item[];
}

const PAGE_SIZE = 10;

export default function ArticulosContent({ items }: Props) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return items;
    return items.filter(
      (item) =>
        item.code.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.suppliers.some((s) => s.supplier.name.toLowerCase().includes(q))
    );
  }, [items, search]);

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
          <h1 className="text-2xl font-bold text-gray-900">Artículos de Compra</h1>
          <p className="text-gray-500 text-sm mt-1">
            {filtered.length === items.length
              ? `${items.length} artículos registrados`
              : `${filtered.length} de ${items.length} artículos`}
          </p>
        </div>
        <Link href="/admin/articulos/nuevo">
          <Button className="bg-rose-600 hover:bg-rose-700">
            <Plus className="h-4 w-4 mr-2" /> Nuevo artículo
          </Button>
        </Link>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Buscar por código, descripción o proveedor..."
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
                <th className="text-left py-3 px-4 font-medium text-gray-600">Código</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Descripción</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Categoría</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Proveedores</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">Estado</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-gray-400">
                    No hay artículos.{" "}
                    <Link href="/admin/articulos/nuevo" className="text-rose-600 hover:underline">
                      Agregar primero.
                    </Link>
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
                    {item.note && <p className="text-xs text-gray-500">{item.note}</p>}
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {item.category === "SUBLIMABLE" && "Sublimable"}
                    {item.category === "NO_SUBLIMABLE" && "No Sublimable"}
                    {item.category === "INSUMO" && "Insumo"}
                    {item.category === "OTROS" && "Otros"}
                  </td>
                  <td className="py-3 px-4 text-gray-600 text-xs">
                    {item.suppliers.length === 0 ? (
                      <span className="text-gray-400">Sin proveedores</span>
                    ) : (
                      <div className="space-y-1">
                        {item.suppliers.map((s) => (
                          <div key={s.supplierId}>{s.supplier.name}</div>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Badge
                      className={
                        item.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }
                    >
                      {item.isActive ? "Activo" : "Inactivo"}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin/articulos/${item.id}`}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-500 hover:text-gray-700"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                      <DeleteItemButton id={item.id} code={item.code} />
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
                  <span key={`ellipsis-${idx}`} className="px-2 text-gray-400 text-sm">
                    …
                  </span>
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
