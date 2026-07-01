import { getBusinesses } from "@/actions/super-admin";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function SuperAdminDashboard() {
  const businesses = await getBusinesses();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Panel de Control</h1>
        <p className="text-gray-500 mt-2">Gestiona todos los negocios del sistema</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-blue-600">{businesses.length}</div>
          <div className="text-gray-600 text-sm mt-1">Negocios activos</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-green-600">
            {businesses.reduce((sum, b) => sum + b.users.length, 0)}
          </div>
          <div className="text-gray-600 text-sm mt-1">Administradores</div>
        </div>
        <Link href="/admin/super/negocios/nuevo" className="bg-blue-600 hover:bg-blue-700 rounded-lg shadow p-6 text-white cursor-pointer">
          <div className="text-lg font-semibold">+ Nuevo negocio</div>
          <div className="text-sm mt-1 text-blue-100">Crear un nuevo negocio</div>
        </Link>
      </div>

      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Negocios recientes</h2>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Nombre</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Admin</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Estado</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {businesses.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    No hay negocios. <Link href="/admin/super/negocios/nuevo" className="text-blue-600 hover:underline">Crear uno</Link>
                  </td>
                </tr>
              ) : (
                businesses.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{b.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {b.users[0]?.email || "—"}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${b.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                        {b.isActive ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm">
                      <Link href={`/admin/super/negocios/${b.id}`} className="text-blue-600 hover:underline">
                        Ver
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
