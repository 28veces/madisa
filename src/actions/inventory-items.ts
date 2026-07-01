"use server";

import { prisma } from "@/lib/prisma";
import { requireBusiness } from "@/lib/require-auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { PurchaseCategory, UserRole } from "@prisma/client";

const inventoryItemSchema = z.object({
  description: z.string().min(1, "Descripción requerida"),
  category: z.nativeEnum(PurchaseCategory),
  note: z.string().optional(),
  supplierIds: z.array(z.string()).default([]),
});

async function generateCode(): Promise<string> {
  const last = await prisma.inventoryItem.findFirst({
    orderBy: { code: "desc" },
    select: { code: true },
  });
  if (!last) return "ART-001";
  const num = parseInt(last.code.replace("ART-", ""), 10) + 1;
  return `ART-${String(num).padStart(3, "0")}`;
}

export async function createInventoryItem(formData: FormData) {
  const { businessId } = await requireBusiness([UserRole.ADMIN, UserRole.SECRETARY]);
  const supplierIdsRaw = formData.getAll("supplierIds");
  const data = {
    description: formData.get("description"),
    category: formData.get("category"),
    note: formData.get("note") || undefined,
    supplierIds: supplierIdsRaw,
  };

  const parsed = inventoryItemSchema.safeParse(data);

  if (!parsed.success) {
    console.error("Validation error:", parsed.error.flatten().fieldErrors);
    console.error("Data received:", data);
    return { error: parsed.error.flatten().fieldErrors };
  }

  const code = await generateCode();

  const item = await prisma.inventoryItem.create({
    data: {
      code,
      description: parsed.data.description,
      category: parsed.data.category,
      note: parsed.data.note,
      isActive: true,
      businessId,
    },
  });

  if (parsed.data.supplierIds.length > 0) {
    await prisma.inventoryItemSupplier.createMany({
      data: parsed.data.supplierIds.map((supplierId) => ({
        inventoryItemId: item.id,
        supplierId,
      })),
    });
  }

  revalidatePath("/admin/articulos");
  return { success: true };
}

export async function updateInventoryItem(id: string, formData: FormData) {
  const { businessId } = await requireBusiness([UserRole.ADMIN, UserRole.SECRETARY]);
  const item = await prisma.inventoryItem.findUnique({ where: { id } });
  if (!item || item.businessId !== businessId) throw new Error("Sin permiso");

  const supplierIdsRaw = formData.getAll("supplierIds");
  const data = {
    description: formData.get("description"),
    category: formData.get("category"),
    note: formData.get("note") || undefined,
    supplierIds: supplierIdsRaw,
  };

  const parsed = inventoryItemSchema.safeParse(data);

  if (!parsed.success) {
    console.error("Validation error:", parsed.error.flatten().fieldErrors);
    console.error("Data received:", data);
    return { error: parsed.error.flatten().fieldErrors };
  }

  await prisma.inventoryItem.update({
    where: { id },
    data: {
      description: parsed.data.description,
      category: parsed.data.category,
      note: parsed.data.note,
    },
  });

  await prisma.inventoryItemSupplier.deleteMany({
    where: { inventoryItemId: id },
  });

  if (parsed.data.supplierIds.length > 0) {
    await prisma.inventoryItemSupplier.createMany({
      data: parsed.data.supplierIds.map((supplierId) => ({
        inventoryItemId: id,
        supplierId,
      })),
    });
  }

  revalidatePath("/admin/articulos");
  return { success: true };
}

export async function deleteInventoryItem(id: string) {
  const { businessId } = await requireBusiness([UserRole.ADMIN]);
  const item = await prisma.inventoryItem.findUnique({ where: { id } });
  if (!item || item.businessId !== businessId) throw new Error("Sin permiso");

  await prisma.inventoryItem.delete({ where: { id } });
  revalidatePath("/admin/articulos");
  return { success: true };
}

export async function getInventoryItems() {
  const { businessId } = await requireBusiness([UserRole.ADMIN, UserRole.SECRETARY, UserRole.ACCOUNTANT]);
  return prisma.inventoryItem.findMany({
    where: { businessId, isActive: true },
    include: { suppliers: { include: { supplier: true } } },
    orderBy: { code: "asc" },
  });
}

export async function getAllInventoryItems() {
  const { businessId } = await requireBusiness([UserRole.ADMIN, UserRole.SECRETARY, UserRole.ACCOUNTANT]);
  return prisma.inventoryItem.findMany({
    where: { businessId },
    include: { suppliers: { include: { supplier: true } } },
    orderBy: { code: "asc" },
  });
}

export async function getInventoryItem(id: string) {
  const { businessId } = await requireBusiness([UserRole.ADMIN, UserRole.SECRETARY, UserRole.ACCOUNTANT]);
  const item = await prisma.inventoryItem.findUnique({
    where: { id },
    include: { suppliers: { include: { supplier: true } } },
  });
  if (!item || item.businessId !== businessId) throw new Error("Sin permiso");
  return item;
}

export async function getInventoryItemsForSale() {
  const { businessId } = await requireBusiness([UserRole.ADMIN, UserRole.SECRETARY, UserRole.ACCOUNTANT]);
  const items = await prisma.inventoryItem.findMany({
    where: {
      businessId,
      isActive: true,
    },
    include: {
      purchaseItems: { select: { quantity: true } },
      saleItems: { select: { quantity: true } },
    },
    orderBy: { code: "asc" },
  });

  return items.map((item) => ({
    id: item.id,
    code: item.code,
    description: item.description,
    category: item.category as string,
    availableStock:
      item.purchaseItems.reduce((s, i) => s + i.quantity, 0) -
      item.saleItems.reduce((s, i) => s + i.quantity, 0),
  }));
}

export async function getInventoryItemsWithPurchaseQty() {
  const { businessId } = await requireBusiness([UserRole.ADMIN, UserRole.SECRETARY, UserRole.ACCOUNTANT]);
  const items = await prisma.inventoryItem.findMany({
    where: { businessId },
    include: {
      suppliers: { include: { supplier: true } },
      purchaseItems: { select: { quantity: true } },
      saleItems: { select: { quantity: true } },
    },
    orderBy: { code: "asc" },
  });

  return items.map((item) => ({
    id: item.id,
    code: item.code,
    description: item.description,
    category: item.category,
    note: item.note,
    isActive: item.isActive,
    totalQuantityPurchased: item.purchaseItems.reduce((sum, pi) => sum + pi.quantity, 0),
    totalQuantitySold: item.saleItems.reduce((sum, si) => sum + si.quantity, 0),
    availableStock:
      item.purchaseItems.reduce((sum, pi) => sum + pi.quantity, 0) -
      item.saleItems.reduce((sum, si) => sum + si.quantity, 0),
  }));
}
