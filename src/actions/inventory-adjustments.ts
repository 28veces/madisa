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

export async function getAdjustment(id: string) {
  const { businessId } = await requireBusiness([UserRole.ADMIN, UserRole.SECRETARY, UserRole.ACCOUNTANT]);
  return prisma.inventoryAdjustment.findFirst({
    where: { id, businessId },
    include: { inventoryItem: { select: { code: true, description: true, category: true } } },
  });
}

export async function updateAdjustment(id: string, data: z.infer<typeof adjustmentSchema>) {
  const { businessId } = await requireBusiness([UserRole.ADMIN, UserRole.SECRETARY]);
  const parsed = adjustmentSchema.safeParse(data);
  if (!parsed.success) {
    return { error: Object.values(parsed.error.flatten().fieldErrors).flat()[0] ?? "Datos inválidos" };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const adjustment = await tx.inventoryAdjustment.findFirst({ where: { id, businessId } });
      if (!adjustment) throw new Error("Salida no encontrada");

      const item = await tx.inventoryItem.findFirst({
        where: { id: parsed.data.inventoryItemId, businessId },
        select: { description: true },
      });
      if (!item) throw new Error("Artículo no encontrado");

      await tx.inventoryAdjustment.update({
        where: { id },
        data: { ...parsed.data, note: parsed.data.note || null },
      });

      // Con la salida ya actualizada, el stock del artículo no puede quedar negativo.
      // Lo disponible para esta salida es lo que queda más su propia cantidad.
      // Si el artículo ya estaba en negativo por pedidos bajo pedido (US-64), se permite
      // editar la salida mientras no saque más unidades que antes del mismo artículo.
      const remaining = await getAvailableStock(tx, parsed.data.inventoryItemId);
      const takesMore =
        parsed.data.inventoryItemId !== adjustment.inventoryItemId || parsed.data.quantity > adjustment.quantity;
      if (remaining < 0 && takesMore) {
        throw new Error(
          `No hay suficiente stock de ${item.description} (disponible: ${Math.max(remaining + parsed.data.quantity, 0)})`
        );
      }
    });
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : "Error al actualizar la salida" };
  }

  revalidateStock();
  return { success: true };
}
