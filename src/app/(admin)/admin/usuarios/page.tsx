export const dynamic = "force-dynamic";

import { getBusinessUsers } from "@/actions/users";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import Link from "next/link";
import UserManagementForm from "@/components/admin/UserManagementForm";

const roleLabels: Record<string, { label: string; color: string }> = {
  SECRETARY: { label: "Secretario/a", color: "bg-blue-100 text-blue-700" },
  ACCOUNTANT: { label: "Contador/a", color: "bg-purple-100 text-purple-700" },
  ADMIN: { label: "Administrador", color: "bg-red-100 text-red-700" },
};

export default async function UsuariosPage() {
  const users = await getBusinessUsers().catch(() => []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Usuarios</h1>
          <p className="text-gray-500 text-sm mt-1">Gestiona los usuarios de tu negocio</p>
        </div>
      </div>

      {/* Formulario de creación */}
      <UserManagementForm />

      {/* Lista de usuarios */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left py-3 px-4 font-medium text-gray-600">Nombre</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Email</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">Rol</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Estado</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-gray-400">
                    Sin usuarios creados
                  </td>
                </tr>
              )}
              {users.map((user) => {
                const roleInfo = roleLabels[user.role] || roleLabels.SECRETARY;
                const isActive = user.passwordHash !== "";

                return (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-medium text-gray-900">{user.name}</p>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{user.email}</td>
                    <td className="py-3 px-4 text-center">
                      <Badge className={roleInfo.color}>{roleInfo.label}</Badge>
                    </td>
                    <td className="py-3 px-4">
                      {isActive ? (
                        <Badge className="bg-green-100 text-green-700">Activo</Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-500">Inactivo</Badge>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {isActive && user.role !== "ADMIN" && (
                        <UserDeactivateButton userId={user.id} />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function UserDeactivateButton({ userId }: { userId: string }) {
  return (
    <form action={async () => {
      "use server";
      const { deactivateUser } = await import("@/actions/users");
      await deactivateUser(userId);
    }}>
      <Button type="submit" variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
        Desactivar
      </Button>
    </form>
  );
}
