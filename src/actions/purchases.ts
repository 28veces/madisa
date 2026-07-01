"use server";

import { prisma } from "@/lib/prisma";
import { requireBusiness } from "@/lib/require-auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { PurchaseCategory, UserRole } from "@prisma/client";

const purchaseItemSchema = z.object({
  inventoryItemId: z.string().min(1),
  productId: z.string().optional(),
  description: z.string().min(1),
  quantity: z.coerce.number().int().min(1),
  unitCost: z.coerce.number().min(0),
});

const purchaseSchema = z.object({
  description: z.string().min(1, "Descripción requerida"),
  supplierId: z.string().optional(),
  category: z.nativeEnum(PurchaseCategory),
  receiptUrl: z.string().url().optional().or(z.literal("")),
  purchaseDate: z.coerce.date(),
  notes: z.string().optional(),
  items: z.array(purchaseItemSchema).min(1, "Al menos un item requerido"),
});

export async function createPurchase(data: z.infer<typeof purchaseSchema>) {
  const { businessId } = await requireBusiness([UserRole.ADMIN, UserRole.SECRETARY]);
  const parsed = purchaseSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const totalAmount = parsed.data.items.reduce(
    (sum, item) => sum + item.quantity * item.unitCost,
    0
  );

  await prisma.purchase.create({
    data: {
      description: parsed.data.description,
      supplierId: parsed.data.supplierId || null,
      category: parsed.data.category,
      receiptUrl: parsed.data.receiptUrl || null,
      purchaseDate: parsed.data.purchaseDate,
      notes: parsed.data.notes,
      totalAmount,
      businessId,
      items: { create: parsed.data.items },
    },
  });

  revalidatePath("/admin/compras");
  revalidatePath("/admin");
  return { success: true };
}

export async function deletePurchase(id: string) {
  const { businessId } = await requireBusiness([UserRole.ADMIN]);
  const purchase = await prisma.purchase.findUnique({ where: { id } });
  if (!purchase || purchase.businessId !== businessId) throw new Error("Sin permiso");

  await prisma.purchase.delete({ where: { id } });
  revalidatePath("/admin/compras");
  revalidatePath("/admin");
  return { success: true };
}

export async function getPurchases() {
  const { businessId } = await requireBusiness([UserRole.ADMIN, UserRole.SECRETARY, UserRole.ACCOUNTANT]);
  return prisma.purchase.findMany({
    where: { businessId },
    include: { items: true, supplier: true },
    orderBy: { purchaseDate: "desc" },
  });
}

export async function getPurchaseById(id: string) {
  const { businessId } = await requireBusiness([UserRole.ADMIN, UserRole.SECRETARY, UserRole.ACCOUNTANT]);
  const purchase = await prisma.purchase.findUnique({
    where: { id },
    include: { items: true, supplier: true },
  });
  if (!purchase || purchase.businessId !== businessId) return null;
  return purchase;
}

export async function updatePurchase(id: string, data: z.infer<typeof purchaseSchema>) {
  const { businessId } = await requireBusiness([UserRole.ADMIN, UserRole.SECRETARY]);
  const purchase = await prisma.purchase.findUnique({ where: { id } });
  if (!purchase || purchase.businessId !== businessId) throw new Error("Sin permiso");

  const parsed = purchaseSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const totalAmount = parsed.data.items.reduce(
    (sum, item) => sum + item.quantity * item.unitCost,
    0
  );

  await prisma.$transaction([
    prisma.purchaseItem.deleteMany({ where: { purchaseId: id } }),
    prisma.purchase.update({
      where: { id },
      data: {
        description: parsed.data.description,
        supplierId: parsed.data.supplierId || null,
        category: parsed.data.category,
        receiptUrl: parsed.data.receiptUrl || null,
        purchaseDate: parsed.data.purchaseDate,
        notes: parsed.data.notes,
        totalAmount,
        items: { create: parsed.data.items },
      },
    }),
  ]);

  revalidatePath("/admin/compras");
  revalidatePath("/admin");
  return { success: true };
}
