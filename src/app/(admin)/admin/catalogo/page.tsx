export const dynamic = "force-dynamic";

import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { getProducts } from "@/actions/products";
import { availableStock } from "@/lib/stock";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DeleteProductButton from "./DeleteProductButton";

const categoryLabels: Record<string, string> = {
  PLATOS: "Platos", VASOS: "Vasos", TAZAS: "Tazas", SWEATERS: "Sweaters",
  GORRAS: "Gorras", PLACAS: "Placas", LAPIDAS: "Lápidas", OTROS: "Otros",
};

const techniqueLabels: Record<string, string> = {
  SUBLIMACION: "Sublimación", PINTADO_A_MANO: "Pintado a mano", VINIL: "Vinil",
  BORDADO: "Bordado", GRABADO: "Grabado", DTF: "DTF", VDTF: "VDTF", OTRO: "Otro",
};

export default async function CatalogoAdminPage() {
  const products = await getProducts().catch(() => []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Catálogo público</h1>
          <p className="text-gray-500 text-sm mt-1">{products.length} productos registrados</p>
        </div>
        <Link href="/admin/catalogo/nuevo">
          <Button className="bg-teal-600 hover:bg-teal-700">
            <Plus className="h-4 w-4 mr-2" /> Nuevo producto
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left py-3 px-4 font-medium text-gray-600">Nombre</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Categoría</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Técnica</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">Precio</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">Stock</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">Estado</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-gray-400">
                    No hay productos.{" "}
                    <Link href="/admin/catalogo/nuevo" className="text-teal-600 hover:underline">
                      Agregar primero.
                    </Link>
                  </td>
                </tr>
              )}
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-3 px-4">
                    <p className="font-medium text-gray-900">{p.name}</p>
                    {p.description && <p className="text-xs text-gray-500 truncate max-w-xs">{p.description}</p>}
                  </td>
                  <td className="py-3 px-4 text-gray-600">{categoryLabels[p.category] ?? p.category}</td>
                  <td className="py-3 px-4 text-gray-600">{techniqueLabels[p.technique] ?? p.technique}</td>
                  <td className="py-3 px-4 text-right font-medium text-gray-900">${p.basePrice.toFixed(2)}</td>
                  <td className="py-3 px-4 text-center text-gray-600">
                    {p.inventoryItem
                      ? (() => {
                          const stock = availableStock(p.inventoryItem);
                          return <span className={stock <= 0 ? "text-red-500 font-medium" : ""}>{stock}</span>;
                        })()
                      : <span className="text-gray-400 text-xs">sin vincular</span>
                    }
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Badge className={p.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}>
                      {p.isActive ? "Visible" : "Oculto"}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin/catalogo/${p.id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-gray-700">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                      <DeleteProductButton id={p.id} name={p.name} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
