import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ProfileHeader from "@/components/admin/ProfileHeader";
import LogoutButton from "@/components/admin/LogoutButton";

const roleLabels: Record<string, { label: string; color: string }> = {
  SUPER_ADMIN: { label: "Super Admin", color: "bg-gray-800 text-white" },
  ADMIN: { label: "Administrador", color: "bg-rose-100 text-rose-700" },
  SECRETARY: { label: "Secretario/a", color: "bg-blue-100 text-blue-700" },
  ACCOUNTANT: { label: "Contador/a", color: "bg-purple-100 text-purple-700" },
};

export default async function PerfilPage() {
  const session = await auth();
  if (!session?.user) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, imageUrl: true, role: true, createdAt: true },
  });
  if (!user) return null;

  const roleInfo = roleLabels[user.role];
  // Formateado aquí (Server Component, corre una sola vez) y no en ProfileHeader
  // ("use client", corre en servidor y navegador) para evitar un mismatch de
  // hidratación si el runtime de Vercel y el navegador del usuario tienen zonas
  // horarias distintas (ver error React #418).
  const memberSinceLabel = new Intl.DateTimeFormat("es-PA", {
    dateStyle: "long",
    timeZone: "America/Panama",
  }).format(user.createdAt);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <ProfileHeader
        name={user.name ?? ""}
        email={user.email}
        imageUrl={user.imageUrl}
        roleLabel={roleInfo?.label ?? user.role}
        roleColor={roleInfo?.color ?? "bg-gray-100 text-gray-700"}
        memberSinceLabel={memberSinceLabel}
      />

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center justify-between">
        <div>
          <p className="font-medium text-gray-900">Sesión activa</p>
          <p className="text-sm text-gray-500">Cierra sesión para entrar con otro usuario</p>
        </div>
        <LogoutButton />
      </div>
    </div>
  );
}
