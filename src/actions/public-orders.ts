"use server";

import { z } from "zod";
import { BusinessLine } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getActiveBusinessId } from "@/lib/require-auth";
import { consumeRateLimit, getClientIp } from "@/lib/rate-limit";
import { getAvailableStock, getAverageUnitCosts, lineCost } from "@/lib/stock";
import { MAX_ORDER_QUANTITY } from "@/lib/utils";

// El precio y el total no se reciben: se calculan en el servidor con los precios del catálogo.
const publicOrderSchema = z.object({
  clientName: z.string().trim().min(1, "Ingresa tu nombre").max(100, "El nombre es demasiado largo"),
  clientPhone: z
    .string()
    .trim()
    .regex(/^[0-9+()\-\s]{7,20}$/, "Ingresa un teléfono válido"),
  items: z
    .array(
      z.object({
        productId: z.string().min(1).max(100),
        quantity: z
          .number()
          .int("La cantidad debe ser un número entero")
          .min(1, "La cantidad debe ser al menos 1")
          .max(MAX_ORDER_QUANTITY, `La cantidad máxima por artículo es ${MAX_ORDER_QUANTITY}`),
        customization: z.string().trim().max(500, "La personalización es demasiado larga").optional(),
      })
    )
    .min(1, "El carrito está vacío")
    .max(50, "El pedido tiene demasiados artículos"),
  businessLine: z.nativeEnum(BusinessLine).optional(),
  notes: z.string().trim().max(500, "La nota es demasiado larga").optional(),
});

export type PublicOrderData = z.input<typeof publicOrderSchema>;

const MAX_ORDERS = 5;
const ORDER_WINDOW_MS = 10 * 60 * 1000;

// Error con un mensaje apto para el visitante; cualquier otro error se reemplaza por uno genérico.
class PublicOrderError extends Error {}

export async function createPublicOrder(data: PublicOrderData) {
  const parsed = publicOrderSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "Datos del pedido inválidos" };
  }
  const order = parsed.data;

  try {
    const businessId = await getActiveBusinessId();
    if (!businessId) throw new PublicOrderError("La tienda no está disponible en este momento");

    const phoneDigits = order.clientPhone.replace(/\D/g, "");
    const allowed = await consumeRateLimit(
      [`order:ip:${await getClientIp()}`, `order:phone:${phoneDigits}`],
      MAX_ORDERS,
      ORDER_WINDOW_MS
    );
    if (!allowed) {
      throw new PublicOrderError("Recibimos varios pedidos seguidos. Espera unos minutos e intenta de nuevo");
    }

    const sale = await prisma.$transaction(async (tx) => {
      const productIds = [...new Set(order.items.map((item) => item.productId))];
      const products = await tx.product.findMany({
        where: { id: { in: productIds }, businessId, isActive: true },
      });
      const productById = new Map(products.map((p) => [p.id, p]));

      const lines = order.items.map((item) => {
        const product = productById.get(item.productId);
        if (!product) throw new PublicOrderError("Uno de los productos ya no está disponible. Revisa tu carrito");
        return { ...item, product, unitPrice: product.basePrice };
      });

      // El stock se verifica por artículo con todas las líneas que lo usan, para que repetir
      // un producto no permita superar lo disponible. Lo disponible se asigna primero a los
      // productos sin bajo pedido, que deben caber completos; lo que falte en los productos
      // bajo pedido queda registrado en backorderQuantity (US-64).
      const linesByItem = new Map<string, typeof lines>();
      for (const line of lines) {
        const inventoryItemId = line.product.inventoryItemId;
        if (!inventoryItemId) continue;
        linesByItem.set(inventoryItemId, [...(linesByItem.get(inventoryItemId) ?? []), line]);
      }
      const backorderByLine = new Map<(typeof lines)[number], number>();
      for (const [inventoryItemId, itemLines] of linesByItem) {
        let remaining = Math.max(await getAvailableStock(tx, inventoryItemId), 0);
        const ordered = [...itemLines].sort((a, b) => Number(a.product.allowBackorder) - Number(b.product.allowBackorder));
        for (const line of ordered) {
          const fromStock = Math.min(line.quantity, remaining);
          remaining -= fromStock;
          if (fromStock === line.quantity) continue;
          if (!line.product.allowBackorder) {
            const available = fromStock + remaining;
            throw new PublicOrderError(`Stock insuficiente de "${line.product.name}". Disponible: ${available}`);
          }
          backorderByLine.set(line, line.quantity - fromStock);
        }
      }

      // Cada producto acepta por pedido como máximo su tope de unidades sin stock, sumando
      // todas sus líneas, para que un pedido no deje el inventario muy en negativo (US-67).
      const backorderByProduct = new Map<string, number>();
      for (const [line, units] of backorderByLine) {
        backorderByProduct.set(line.product.id, (backorderByProduct.get(line.product.id) ?? 0) + units);
      }
      for (const [productId, units] of backorderByProduct) {
        const product = productById.get(productId)!;
        if (units > product.backorderLimit) {
          throw new PublicOrderError(
            `Solo se pueden pedir ${product.backorderLimit} unidades bajo pedido de "${product.name}". Revisa tu carrito`
          );
        }
      }

      // El costo se calcula en el servidor (costo promedio de compra), nunca desde el cliente
      const avgCosts = await getAverageUnitCosts(tx, [...linesByItem.keys()]);
      const totalAmount =
        Math.round(lines.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0) * 100) / 100;

      const created = await tx.sale.create({
        data: {
          clientName: order.clientName,
          clientPhone: order.clientPhone,
          notes: order.notes,
          totalAmount,
          businessLine: order.businessLine,
          status: "PENDING",
          businessId,
          items: {
            create: lines
              .filter((line) => line.product.inventoryItemId !== null)
              .map((line) => ({
                inventoryItemId: line.product.inventoryItemId!,
                quantity: line.quantity,
                unitPrice: line.unitPrice,
                productionCost: lineCost(avgCosts.get(line.product.inventoryItemId!) ?? 0, line.quantity),
                backorderQuantity: backorderByLine.get(line) ?? 0,
                customization: line.customization,
              })),
          },
        },
      });
      const backorderUnits = [...backorderByLine.values()].reduce((sum, units) => sum + units, 0);
      return { ...created, backorderUnits };
    });

    return {
      success: true,
      saleId: sale.id,
      totalAmount: sale.totalAmount,
      message:
        sale.backorderUnits > 0
          ? `Pedido creado exitosamente. ${sale.backorderUnits} unidades se consiguen bajo pedido y pueden tardar más. El administrador lo revisará pronto.`
          : "Pedido creado exitosamente. El administrador lo revisará pronto.",
    };
  } catch (error) {
    if (error instanceof PublicOrderError) return { success: false, message: error.message };
    console.error("Error en createPublicOrder:", error);
    return { success: false, message: "No pudimos registrar tu pedido. Intenta nuevamente" };
  }
}
