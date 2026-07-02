"use server";

import { prisma } from "@/lib/prisma";
import { requireBusiness } from "@/lib/require-auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";

const businessUserSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  name: z.string().min(1, "Nombre requerido"),
  role: z.enum(["ADMIN", "SECRETARY", "ACCOUNTANT"]),
});

export async function getBusinessUsers() {
  const { businessId } = await requireBusiness([UserRole.ADMIN]);
  return prisma.user.findMany({
    where: {
      businessId,
      role: { in: ["ADMIN", "SECRETARY", "ACCOUNTANT"] },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function createBusinessUser(data: z.infer<typeof businessUserSchema>) {
  const { businessId } = await requireBusiness([UserRole.ADMIN]);
  const parsed = businessUserSchema.safeParse(data);

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });

  if (existingUser) {
    return { error: { email: ["Este email ya está registrado"] } };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);

  await prisma.user.create({
    data: {
      email: parsed.data.email,
      name: parsed.data.name,
      passwordHash,
      role: parsed.data.role,
      businessId,
    },
  });

  revalidatePath("/admin/usuarios");
  return { success: true };
}

export async function resetUserPassword(id: string, newPassword: string) {
  const { businessId } = await requireBusiness([UserRole.ADMIN]);

  const parsed = z.string().min(6, "La contraseña debe tener al menos 6 caracteres").safeParse(newPassword);
  if (!parsed.success) {
    return { error: parsed.error.flatten().formErrors[0] };
  }

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user || user.businessId !== businessId) {
    return { error: "Sin permiso" };
  }

  const passwordHash = await bcrypt.hash(parsed.data, 10);
  await prisma.user.update({
    where: { id },
    data: { passwordHash },
  });

  revalidatePath("/admin/usuarios");
  return { success: true };
}

export async function deactivateUser(id: string) {
  const { businessId } = await requireBusiness([UserRole.ADMIN]);
  const user = await prisma.user.findUnique({ where: { id } });

  if (!user || user.businessId !== businessId) {
    return { error: "Sin permiso" };
  }

  if (user.role === "ADMIN") {
    return { error: "No puedes desactivar un administrador" };
  }

  await prisma.user.update({
    where: { id },
    data: { passwordHash: "" },
  });

  revalidatePath("/admin/usuarios");
  return { success: true };
}
