import { getBusinessDetail } from "@/actions/super-admin";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function BusinessDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const business = await getBusinessDetail(id);

  if (!business) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900">Negocio no encontrado</h1>
        <Link href="/admin/super/negocios" className="text-blue-600 hover:underline mt-4 inline-block">
          Volver a negocios
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{business.name}</h1>
          <p className="text-gray-500 text-sm mt-1">Slug: {business.slug}</p>
        </div>
        <Link href="/admin/super/negocios" className="text-blue-600 hover:underline">
          Volver
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-gray-600 text-sm">Estado</div>
          <div className="text-2xl font-bold mt-2">
            {business.isActive ? (
              <span className="text-green-600">Activo</span>
            ) : (
              <span className="text-gray-500">Inactivo</span>
            )}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-gray-600 text-sm">Usuarios</div>
          <div className="text-2xl font-bold mt-2">{business.users.length}</div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">Usuarios del negocio</h2>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Nombre</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Rol</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {business.users.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                  No hay usuarios asignados a este negocio
                </td>
              </tr>
            ) : (
              business.users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{u.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{u.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{u.role}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
