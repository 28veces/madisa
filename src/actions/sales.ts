"use server";

import { prisma } from "@/lib/prisma";
import { requireBusiness } from "@/lib/require-auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { SaleStatus, UserRole, BusinessLine } from "@prisma/client";
import { stockInclude, availableStock } from "@/lib/stock";

const saleItemSchema = z.object({
  inventoryItemId: z.string().min(1),
  quantity: z.coerce.number().int().min(1),
  unitPrice: z.coerce.number().min(0),
  productionCost: z.coerce.number().min(0).default(0),
  customization: z.string().optional(),
});

const saleSchema = z.object({
  clientName: z.string().min(1, "Nombre del cliente requerido"),
  clientPhone: z.string().optional(),
  notes: z.string().optional(),
  status: z.nativeEnum(SaleStatus).default(SaleStatus.PENDING),
  businessLine: z.nativeEnum(BusinessLine).optional(),
  items: z.array(saleItemSchema).min(1, "Al menos un artículo requerido"),
});

export async function createSale(data: z.infer<typeof saleSchema>) {
  const { businessId } = await requireBusiness([UserRole.ADMIN, UserRole.SECRETARY]);
  const parsed = saleSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  try {
    await prisma.$transaction(async (tx) => {
      for (const item of parsed.data.items) {
        const invItem = await tx.inventoryItem.findUnique({
          where: { id: item.inventoryItemId },
          include: stockInclude,
        });

        if (!invItem || invItem.businessId !== businessId) throw new Error("Artículo no encontrado");

        const available = availableStock(invItem);

        if (available < item.quantity) {
          throw new Error(
            `No hay inventario: ${invItem.description} (disponible: ${available})`
          );
        }
      }

      const totalAmount = parsed.data.items.reduce(
        (sum, item) => sum + item.quantity * item.unitPrice,
        0
      );

      await tx.sale.create({
        data: {
          clientName: parsed.data.clientName,
          clientPhone: parsed.data.clientPhone,
          notes: parsed.data.notes,
          status: parsed.data.status,
          businessLine: parsed.data.businessLine,
          totalAmount,
          businessId,
          items: { create: parsed.data.items },
        },
      });
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error al registrar la venta";
    return { error: msg };
  }

  revalidatePath("/admin/ventas");
  revalidatePath("/admin");
  return { success: true };
}

export async function updateSaleStatus(id: string, status: SaleStatus) {
  const { businessId } = await requireBusiness([UserRole.ADMIN, UserRole.SECRETARY]);
  const sale = await prisma.sale.findUnique({ where: { id } });
  if (!sale || sale.businessId !== businessId) throw new Error("Sin permiso");

  await prisma.sale.update({
    where: { id },
    data: {
      status,
      ...(status === SaleStatus.COMPLETED ? { deliveredAt: new Date() } : {}),
    },
  });
  revalidatePath("/admin/ventas");
  return { success: true };
}

export async function deleteSale(id: string) {
  const { businessId } = await requireBusiness([UserRole.ADMIN]);
  const sale = await prisma.sale.findUnique({ where: { id } });
  if (!sale || sale.businessId !== businessId) throw new Error("Sin permiso");

  await prisma.sale.delete({ where: { id } });
  revalidatePath("/admin/ventas");
  revalidatePath("/admin");
  return { success: true };
}

export async function getSales() {
  const { businessId } = await requireBusiness([UserRole.ADMIN, UserRole.SECRETARY, UserRole.ACCOUNTANT]);
  return prisma.sale.findMany({
    where: { businessId },
    include: { items: { include: { inventoryItem: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getSale(id: string) {
  const { businessId } = await requireBusiness([UserRole.ADMIN, UserRole.SECRETARY, UserRole.ACCOUNTANT]);
  const sale = await prisma.sale.findUnique({
    where: { id },
    include: { items: { include: { inventoryItem: true } } },
  });
  if (!sale || sale.businessId !== businessId) throw new Error("Sin permiso");
  return sale;
}
