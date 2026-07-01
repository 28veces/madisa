export const dynamic = "force-dynamic";

import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { getAllSuppliers } from "@/actions/suppliers";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DeleteSupplierButton from "./DeleteSupplierButton";

export default async function ProveedoresPage() {
  const suppliers = await getAllSuppliers().catch(() => []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Proveedores</h1>
          <p className="text-gray-500 text-sm mt-1">{suppliers.length} proveedores registrados</p>
        </div>
        <Link href="/admin/proveedores/nuevo">
          <Button className="bg-rose-600 hover:bg-rose-700">
            <Plus className="h-4 w-4 mr-2" /> Nuevo proveedor
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left py-3 px-4 font-medium text-gray-600">Nombre</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Teléfono</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Email</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Sucursal</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">Estado</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {suppliers.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-gray-400">
                    No hay proveedores. <Link href="/admin/proveedores/nuevo" className="text-rose-600 hover:underline">Agregar primero.</Link>
                  </td>
                </tr>
              )}
              {suppliers.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-3 px-4">
                    <p className="font-medium text-gray-900">{s.name}</p>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{s.phone || "-"}</td>
                  <td className="py-3 px-4 text-gray-600 text-xs">{s.email || "-"}</td>
                  <td className="py-3 px-4 text-gray-600">{s.branch || "-"}</td>
                  <td className="py-3 px-4 text-center">
                    <Badge className={s.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}>
                      {s.isActive ? "Activo" : "Inactivo"}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin/proveedores/${s.id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-gray-700">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                      <DeleteSupplierButton id={s.id} name={s.name} />
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
