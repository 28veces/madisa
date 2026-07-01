"use server";

import { prisma } from "@/lib/prisma";
import { requireBusiness } from "@/lib/require-auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { UserRole } from "@prisma/client";

const partnerSchema = z.object({
  name: z.string().min(1, "Nombre requerido"),
  percentage: z.coerce.number().min(0).max(100),
  order: z.coerce.number().int().default(0),
});

export async function getPartners() {
  const { businessId } = await requireBusiness([UserRole.ADMIN, UserRole.SECRETARY, UserRole.ACCOUNTANT]);
  return prisma.partner.findMany({
    where: { businessId },
    orderBy: { order: "asc" },
  });
}

export async function createPartner(formData: FormData) {
  const { businessId } = await requireBusiness([UserRole.ADMIN]);
  const parsed = partnerSchema.safeParse({
    name: formData.get("name"),
    percentage: formData.get("percentage"),
    order: formData.get("order") ?? 0,
  });
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const partners = await prisma.partner.findMany({ where: { businessId } });
  const totalPct = partners.reduce((s, p) => s + Number(p.percentage), 0);
  if (totalPct + parsed.data.percentage > 100) {
    return { error: { percentage: ["La suma de porcentajes no puede superar 100%"] } };
  }

  await prisma.partner.create({ data: { ...parsed.data, businessId } });
  revalidatePath("/admin/socios");
  revalidatePath("/admin/ganancias");
  return { success: true };
}

export async function updatePartner(id: string, formData: FormData) {
  const { businessId } = await requireBusiness([UserRole.ADMIN]);
  const partner = await prisma.partner.findUnique({ where: { id } });
  if (!partner || partner.businessId !== businessId) throw new Error("Sin permiso");

  const parsed = partnerSchema.safeParse({
    name: formData.get("name"),
    percentage: formData.get("percentage"),
    order: formData.get("order") ?? 0,
  });
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const others = await prisma.partner.findMany({ where: { businessId, id: { not: id } } });
  const totalPct = others.reduce((s, p) => s + Number(p.percentage), 0);
  if (totalPct + parsed.data.percentage > 100) {
    return { error: { percentage: ["La suma de porcentajes no puede superar 100%"] } };
  }

  await prisma.partner.update({ where: { id }, data: parsed.data });
  revalidatePath("/admin/socios");
  revalidatePath("/admin/ganancias");
  return { success: true };
}

export async function deletePartner(id: string) {
  const { businessId } = await requireBusiness([UserRole.ADMIN]);
  const partner = await prisma.partner.findUnique({ where: { id } });
  if (!partner || partner.businessId !== businessId) throw new Error("Sin permiso");

  await prisma.partner.delete({ where: { id } });
  revalidatePath("/admin/socios");
  revalidatePath("/admin/ganancias");
  return { success: true };
}
