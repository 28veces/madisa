"use server";

import { prisma } from "@/lib/prisma";
import { requireBusiness } from "@/lib/require-auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { PurchaseCategory, UserRole } from "@prisma/client";
import { getAvailableStock } from "@/lib/stock";

const purchaseItemSchema = z.object({
  inventoryItemId: z.string().min(1),
  productId: z.string().optional(),
  description: z.string().min(1),
  quantity: z.coerce.number().int().min(1),
  unitCost: z.coerce.number().min(0),
});

const purchaseSchema = z.object({
  // La descripción la arma el servidor con los artículos comprados
  description: z.string().optional(),
  supplierId: z.string().optional(),
  category: z.nativeEnum(PurchaseCategory),
  receiptUrl: z.string().url().optional().or(z.literal("")),
  purchaseDate: z.coerce.date(),
  notes: z.string().optional(),
  items: z.array(purchaseItemSchema).min(1, "Al menos un item requerido"),
});

// Verifica que los artículos pertenezcan al negocio y usa su descripción real,
// para que la compra siempre refleje el artículo cuyo stock va a aumentar.
async function resolveItems(
  businessId: string,
  items: z.infer<typeof purchaseItemSchema>[]
) {
  const ids = [...new Set(items.map((i) => i.inventoryItemId))];
  const found = await prisma.inventoryItem.findMany({
    where: { id: { in: ids }, businessId },
    select: { id: true, description: true },
  });
  if (found.length !== ids.length) return null;
  const byId = new Map(found.map((f) => [f.id, f.description]));
  return items.map((i) => ({ ...i, description: byId.get(i.inventoryItemId)! }));
}

// Resumen legible de lo comprado, ej. "Taza 11oz ×3, Gorra ×2, Plato ×1 y 2 más"
function describeItems(items: { description: string; quantity: number }[]) {
  const shown = items.slice(0, 3).map((i) => `${i.description} ×${i.quantity}`).join(", ");
  const rest = items.length - 3;
  return rest > 0 ? `${shown} y ${rest} más` : shown;
}

// El proveedor es opcional; si viene, debe ser del negocio de la sesión.
async function isValidSupplier(businessId: string, supplierId: string | undefined) {
  if (!supplierId) return true;
  const supplier = await prisma.supplier.findFirst({
    where: { id: supplierId, businessId },
    select: { id: true },
  });
  return !!supplier;
}

function revalidateStock() {
  revalidatePath("/admin/compras");
  revalidatePath("/admin/inventario");
  revalidatePath("/admin/catalogo");
  revalidatePath("/catalogo");
  revalidatePath("/admin");
}

export async function createPurchase(data: z.infer<typeof purchaseSchema>) {
  const { businessId } = await requireBusiness([UserRole.ADMIN, UserRole.SECRETARY]);
  const parsed = purchaseSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const items = await resolveItems(businessId, parsed.data.items);
  if (!items) return { error: { items: ["Artículo de inventario inválido"] } };
  if (!(await isValidSupplier(businessId, parsed.data.supplierId))) {
    return { error: { supplierId: ["Proveedor inválido"] } };
  }

  const totalAmount = items.reduce((sum, item) => sum + item.quantity * item.unitCost, 0);

  await prisma.purchase.create({
    data: {
      description: describeItems(items),
      supplierId: parsed.data.supplierId || null,
      category: parsed.data.category,
      receiptUrl: parsed.data.receiptUrl || null,
      purchaseDate: parsed.data.purchaseDate,
      notes: parsed.data.notes,
      totalAmount,
      businessId,
      items: { create: items },
    },
  });

  revalidateStock();
  return { success: true };
}

export async function deletePurchase(id: string) {
  const { businessId } = await requireBusiness([UserRole.ADMIN]);
  const parsedId = z.string().min(1).safeParse(id);
  if (!parsedId.success) return { error: "Compra no encontrada" };

  try {
    await prisma.$transaction(async (tx) => {
      const purchase = await tx.purchase.findFirst({
        where: { id: parsedId.data, businessId },
        include: { items: { include: { inventoryItem: { select: { description: true } } } } },
      });
      if (!purchase) throw new Error("Compra no encontrada");

      await tx.purchase.delete({ where: { id: purchase.id } });

      // Si lo comprado ya se vendió o se sacó, borrar la compra dejaría stock negativo
      for (const item of purchase.items) {
        if (!item.inventoryItemId) continue;
        const available = await getAvailableStock(tx, item.inventoryItemId);
        if (available < 0) {
          const name = item.inventoryItem?.description ?? item.description;
          throw new Error(
            `No se puede eliminar: de ${name} ya se vendieron o sacaron unidades de esta compra (el stock quedaría en ${available})`
          );
        }
      }
    });
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : "Error al eliminar la compra" };
  }

  revalidateStock();
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

  const items = await resolveItems(businessId, parsed.data.items);
  if (!items) return { error: { items: ["Artículo de inventario inválido"] } };
  if (!(await isValidSupplier(businessId, parsed.data.supplierId))) {
    return { error: { supplierId: ["Proveedor inválido"] } };
  }

  const totalAmount = items.reduce((sum, item) => sum + item.quantity * item.unitCost, 0);

  await prisma.$transaction([
    prisma.purchaseItem.deleteMany({ where: { purchaseId: id } }),
    prisma.purchase.update({
      where: { id },
      data: {
        description: describeItems(items),
        supplierId: parsed.data.supplierId || null,
        category: parsed.data.category,
        receiptUrl: parsed.data.receiptUrl || null,
        purchaseDate: parsed.data.purchaseDate,
        notes: parsed.data.notes,
        totalAmount,
        items: { create: items },
      },
    }),
  ]);

  revalidateStock();
  return { success: true };
}
