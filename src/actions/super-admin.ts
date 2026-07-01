"use server";

import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/require-auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import bcrypt from "bcryptjs";

const businessSchema = z.object({
  name: z.string().min(1, "Nombre del negocio requerido"),
});

const adminUserSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  name: z.string().min(1, "Nombre requerido"),
  businessId: z.string().min(1, "Negocio requerido"),
});

export async function getBusinesses() {
  await requireSuperAdmin();
  return prisma.business.findMany({
    include: {
      users: { where: { role: "ADMIN" }, select: { id: true, email: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function createBusiness(formData: FormData) {
  await requireSuperAdmin();
  const parsed = businessSchema.safeParse({
    name: formData.get("name"),
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const slug = parsed.data.name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "");

  await prisma.business.create({
    data: {
      name: parsed.data.name,
      slug,
    },
  });

  revalidatePath("/admin/super/negocios");
  return { success: true };
}

export async function toggleBusinessActive(id: string, isActive: boolean) {
  await requireSuperAdmin();
  await prisma.business.update({
    where: { id },
    data: { isActive },
  });
  revalidatePath("/admin/super/negocios");
  return { success: true };
}

export async function getBusinessDetail(id: string) {
  await requireSuperAdmin();
  return prisma.business.findUnique({
    where: { id },
    include: {
      users: true,
    },
  });
}

export async function createAdminUser(data: z.infer<typeof adminUserSchema>) {
  await requireSuperAdmin();
  const parsed = adminUserSchema.safeParse(data);

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
      role: "ADMIN",
      businessId: parsed.data.businessId,
    },
  });

  revalidatePath("/admin/super/usuarios");
  return { success: true };
}

export async function getAdminUsers() {
  await requireSuperAdmin();
  return prisma.user.findMany({
    where: { role: "ADMIN" },
    include: { business: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
  });
}
