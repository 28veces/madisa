import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";

export async function requireBusiness(allowedRoles?: UserRole[]) {
  const session = await auth();
  if (!session?.user) throw new Error("No autenticado");

  const { role, businessId } = session.user;

  if (allowedRoles && !allowedRoles.includes(role)) {
    throw new Error("Sin permiso");
  }

  if (!businessId) throw new Error("Sin negocio asignado");

  return { userId: session.user.id, role, businessId };
}

export async function requireSuperAdmin() {
  const session = await auth();
  if (session?.user?.role !== "SUPER_ADMIN") throw new Error("Sin permiso");
  return { userId: session.user.id };
}

export async function getActiveBusinessId() {
  const business = await prisma.business.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  return business?.id ?? null;
}
