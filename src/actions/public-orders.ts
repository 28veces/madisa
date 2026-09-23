"use server";

import { prisma } from "@/lib/prisma";
import { getAvailableStock, getAverageUnitCosts, lineCost } from "@/lib/stock";

export interface PublicOrderData {
  clientName: string;
  clientPhone: string;
  items: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
    customization?: string;
  }>;
  totalAmount: number;
  businessLine?: string;
  notes?: string;
}

export async function createPublicOrder(data: PublicOrderData) {
  try {
    const sale = await prisma.$transaction(async (tx) => {
      const business = await tx.business.findFirst({
        where: { isActive: true },
        orderBy: { createdAt: "asc" },
      });

      if (!business) throw new Error("No hay negocio activo configurado");

      // Resolver productId → inventoryItemId y verificar stock
      const resolvedItems = await Promise.all(
        data.items.map(async (item) => {
          const product = await tx.product.findUnique({
            where: { id: item.productId, businessId: business.id },
          });

          if (!product) throw new Error(`Producto ${item.productId} no encontrado`);

          // Si el producto tiene inventario vinculado, verificar stock
          if (product.inventoryItemId) {
            const available = await getAvailableStock(tx, product.inventoryItemId);

            if (available < item.quantity) {
              throw new Error(
                `Stock insuficiente de "${product.name}". Disponible: ${available}`
              );
            }
          }

          return { ...item, inventoryItemId: product.inventoryItemId };
        })
      );

      // El costo se calcula en el servidor (costo promedio de compra), nunca desde el cliente
      const avgCosts = await getAverageUnitCosts(
        tx,
        resolvedItems.flatMap((i) => (i.inventoryItemId ? [i.inventoryItemId] : []))
      );

      const newSale = await tx.sale.create({
        data: {
          clientName: data.clientName,
          clientPhone: data.clientPhone,
          notes: data.notes,
          totalAmount: data.totalAmount,
          businessLine: data.businessLine as any,
          status: "PENDING",
          businessId: business.id,
          items: {
            create: resolvedItems
              .filter((item) => item.inventoryItemId !== null)
              .map((item) => ({
                inventoryItemId: item.inventoryItemId!,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                productionCost: lineCost(avgCosts.get(item.inventoryItemId!) ?? 0, item.quantity),
                customization: item.customization,
              })),
          },
        },
      });

      return newSale;
    });

    return {
      success: true,
      saleId: sale.id,
      message: "Pedido creado exitosamente. El administrador lo revisará pronto.",
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al crear el pedido";
    console.error("Error en createPublicOrder:", error);
    return { success: false, message };
  }
}
