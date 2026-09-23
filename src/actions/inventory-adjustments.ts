"use server";

import { prisma } from "@/lib/prisma";
import { requireBusiness } from "@/lib/require-auth";
import { getAvailableStock } from "@/lib/stock";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { AdjustmentReason, UserRole } from "@prisma/client";

const adjustmentSchema = z.object({
  inventoryItemId: z.string().min(1, "Artículo requerido"),
  quantity: z.coerce.number().int().min(1, "La cantidad debe ser al menos 1"),
  reason: z.nativeEnum(AdjustmentReason),
  date: z.coerce.date(),
  note: z.string().optional(),
});

function revalidateStock() {
  revalidatePath("/admin/salidas");
  revalidatePath("/admin/inventario");
  revalidatePath("/admin/catalogo");
  revalidatePath("/catalogo");
}

export async function createAdjustment(data: z.infer<typeof adjustmentSchema>) {
  const { businessId, userId } = await requireBusiness([UserRole.ADMIN, UserRole.SECRETARY]);
  const parsed = adjustmentSchema.safeParse(data);
  if (!parsed.success) {
    return { error: Object.values(parsed.error.flatten().fieldErrors).flat()[0] ?? "Datos inválidos" };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const item = await tx.inventoryItem.findUnique({
        where: { id: parsed.data.inventoryItemId },
        select: { businessId: true, description: true },
      });
      if (!item || item.businessId !== businessId) throw new Error("Artículo no encontrado");

      const available = await getAvailableStock(tx, parsed.data.inventoryItemId);
      if (available < parsed.data.quantity) {
        throw new Error(`No hay suficiente stock de ${item.description} (disponible: ${available})`);
      }

      await tx.inventoryAdjustment.create({
        data: {
          ...parsed.data,
          note: parsed.data.note || null,
          createdById: userId,
          businessId,
        },
      });
    });
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : "Error al registrar la salida" };
  }

  revalidateStock();
  return { success: true };
}

export async function deleteAdjustment(id: string) {
  const { businessId } = await requireBusiness([UserRole.ADMIN]);
  const adjustment = await prisma.inventoryAdjustment.findUnique({ where: { id } });
  if (!adjustment || adjustment.businessId !== businessId) throw new Error("Sin permiso");

  await prisma.inventoryAdjustment.delete({ where: { id } });
  revalidateStock();
  return { success: true };
}

export async function getAdjustments() {
  const { businessId } = await requireBusiness([UserRole.ADMIN, UserRole.SECRETARY, UserRole.ACCOUNTANT]);
  return prisma.inventoryAdjustment.findMany({
    where: { businessId },
    include: { inventoryItem: { select: { code: true, description: true } } },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
  });
}
