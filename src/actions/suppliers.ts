"use server";

import { prisma } from "@/lib/prisma";
import { requireBusiness } from "@/lib/require-auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { UserRole } from "@prisma/client";

const supplierSchema = z.object({
  name: z.string().min(1, "Nombre requerido"),
  phone: z.string().optional().or(z.literal("")),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  branch: z.string().optional().or(z.literal("")),
});

export async function createSupplier(formData: FormData) {
  const { businessId } = await requireBusiness([UserRole.ADMIN, UserRole.SECRETARY]);
  const parsed = supplierSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone") || undefined,
    email: formData.get("email") || undefined,
    address: formData.get("address") || undefined,
    branch: formData.get("branch") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  await prisma.supplier.create({
    data: {
      ...parsed.data,
      isActive: true,
      businessId,
    },
  });

  revalidatePath("/admin/proveedores");
  return { success: true };
}

export async function updateSupplier(id: string, formData: FormData) {
  const { businessId } = await requireBusiness([UserRole.ADMIN, UserRole.SECRETARY]);
  const supplier = await prisma.supplier.findUnique({ where: { id } });
  if (!supplier || supplier.businessId !== businessId) throw new Error("Sin permiso");

  const parsed = supplierSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone") || undefined,
    email: formData.get("email") || undefined,
    address: formData.get("address") || undefined,
    branch: formData.get("branch") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  await prisma.supplier.update({
    where: { id },
    data: parsed.data,
  });

  revalidatePath("/admin/proveedores");
  return { success: true };
}

export async function deleteSupplier(id: string) {
  const { businessId } = await requireBusiness([UserRole.ADMIN]);
  const supplier = await prisma.supplier.findUnique({ where: { id } });
  if (!supplier || supplier.businessId !== businessId) throw new Error("Sin permiso");

  await prisma.supplier.delete({ where: { id } });
  revalidatePath("/admin/proveedores");
  return { success: true };
}

export async function getSuppliers() {
  const { businessId } = await requireBusiness([UserRole.ADMIN, UserRole.SECRETARY, UserRole.ACCOUNTANT]);
  return prisma.supplier.findMany({
    where: { businessId, isActive: true },
    orderBy: { name: "asc" },
  });
}

export async function getAllSuppliers() {
  const { businessId } = await requireBusiness([UserRole.ADMIN, UserRole.SECRETARY, UserRole.ACCOUNTANT]);
  return prisma.supplier.findMany({
    where: { businessId },
    orderBy: { name: "asc" },
  });
}

export async function getSupplier(id: string) {
  const { businessId } = await requireBusiness([UserRole.ADMIN, UserRole.SECRETARY, UserRole.ACCOUNTANT]);
  const supplier = await prisma.supplier.findUnique({ where: { id } });
  if (!supplier || supplier.businessId !== businessId) throw new Error("Sin permiso");
  return supplier;
}
