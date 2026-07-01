import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";

config({ path: ".env.local" });
config({ path: ".env" });

const prisma = new PrismaClient();

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randFloat(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

function utcDate(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month - 1, day));
}

const CLIENT_NAMES = [
  "María García", "Juan Pérez", "Ana Rodríguez", "Carlos López",
  "Patricia Martínez", "Roberto Sánchez", "Linda Herrera", "Miguel Torres",
  "Carmen Flores", "Eduardo Castro", "Sofía Vargas", "Diego Morales",
  "Isabella Jiménez", "Fernando Reyes", "Valentina Cruz", "Andrés Moreno",
  "Gabriela Romero", "Sebastián Ruiz", "Natalia Gutiérrez", "Ricardo Díaz",
];

const BUSINESS_LINES = ["PERSONALIZACION", "ARREGLOS", "IMPRESIONES", "OTRO"] as const;

const EXPENSE_DATA = [
  { description: "Alquiler del local junio",         category: "Alquiler",    amount: 450,  isRecurring: true  },
  { description: "Electricidad junio",               category: "Servicios",   amount: 85,   isRecurring: true  },
  { description: "Internet junio",                   category: "Servicios",   amount: 45,   isRecurring: true  },
  { description: "Mantenimiento plancha térmica",    category: "Equipo",      amount: 60,   isRecurring: false },
  { description: "Transporte y entrega de pedidos",  category: "Logística",   amount: 35,   isRecurring: false },
  { description: "Material de empaque (cajas)",      category: "Insumos",     amount: 40,   isRecurring: false },
  { description: "Publicidad redes sociales",        category: "Marketing",   amount: 80,   isRecurring: true  },
  { description: "Agua purificada para el local",    category: "Servicios",   amount: 12,   isRecurring: true  },
  { description: "Limpieza del local",               category: "Servicios",   amount: 30,   isRecurring: true  },
  { description: "Papel bond para diseños",          category: "Insumos",     amount: 18,   isRecurring: false },
  { description: "Tinta impresora de diseños",       category: "Insumos",     amount: 55,   isRecurring: false },
  { description: "Bolsas de regalo surtidas",        category: "Insumos",     amount: 22,   isRecurring: false },
  { description: "Teléfono local mensualidad",       category: "Servicios",   amount: 25,   isRecurring: true  },
  { description: "Gastos bancarios cuenta empresa",  category: "Bancario",    amount: 15,   isRecurring: true  },
  { description: "Combustible para entregas",        category: "Logística",   amount: 48,   isRecurring: false },
  { description: "Cinta adhesiva y embalaje",        category: "Insumos",     amount: 14,   isRecurring: false },
  { description: "Cuota plataforma diseño online",   category: "Software",    amount: 20,   isRecurring: true  },
  { description: "Snacks y café para el local",      category: "Varios",      amount: 25,   isRecurring: false },
  { description: "Reparación estantería",            category: "Varios",      amount: 45,   isRecurring: false },
  { description: "Impresión de tarjetas de negocio", category: "Marketing",   amount: 38,   isRecurring: false },
];

async function main() {
  const business = await prisma.business.findUnique({ where: { slug: "artemadisa" } });
  if (!business) throw new Error("Negocio no encontrado");

  // ── Stock disponible de ítems sublimables ─────────────────────────────────
  const allItems = await prisma.inventoryItem.findMany({
    where: { businessId: business.id, category: "SUBLIMABLE" },
    include: { purchaseItems: true, saleItems: true },
  });

  // Precios de venta aproximados por rango de precio de compra
  const sellPrice = (buyPrice: number) => {
    if (buyPrice <= 3) return { min: 12, max: 18 };
    if (buyPrice <= 6) return { min: 18, max: 28 };
    if (buyPrice <= 10) return { min: 28, max: 40 };
    return { min: 38, max: 55 };
  };

  const stockItems = allItems
    .map((item) => {
      const purchased = item.purchaseItems.reduce((s, x) => s + x.quantity, 0);
      const sold = item.saleItems.reduce((s, x) => s + x.quantity, 0);
      return { id: item.id, stock: purchased - sold };
    })
    .filter((i) => i.stock > 0);

  console.log(`Items con stock disponible: ${stockItems.length}`);

  // Mapa id -> buyPrice para calcular ganancia
  const buyPriceMap: Record<string, number> = {};
  for (const item of allItems) {
    const lastPurchaseItem = item.purchaseItems[item.purchaseItems.length - 1];
    buyPriceMap[item.id] = lastPurchaseItem?.unitCost ?? 3;
  }

  // ── 50 VENTAS junio 2026 ──────────────────────────────────────────────────
  let saleCount = 0;
  const stock = Object.fromEntries(stockItems.map((i) => [i.id, i.stock]));

  for (let s = 0; s < 50; s++) {
    const day = rand(1, 4); // hasta hoy (4 de junio)
    const saleDate = utcDate(2026, 6, day);
    const clientName = pick(CLIENT_NAMES);
    const businessLine = pick([...BUSINESS_LINES]);
    const status = s < 45 ? "COMPLETED" : "IN_PROGRESS";
    const deliveredAt = status === "COMPLETED" ? utcDate(2026, 6, Math.min(day + 1, 4)) : null;

    const available = Object.entries(stock).filter(([, qty]) => qty > 0);
    if (available.length === 0) break;

    const numItems = Math.min(rand(1, 3), available.length);
    const picked = [...available].sort(() => Math.random() - 0.5).slice(0, numItems);

    let totalAmount = 0;
    const saleItems = picked.map(([id]) => {
      const maxQty = Math.min(5, stock[id]);
      const qty = rand(1, maxQty);
      stock[id] -= qty;
      const buyPrice = buyPriceMap[id] ?? 3;
      const { min, max } = sellPrice(buyPrice);
      const unitPrice = randFloat(min, max);
      const productionCost = randFloat(buyPrice, buyPrice * 1.3);
      totalAmount += qty * unitPrice;
      return { inventoryItemId: id, quantity: qty, unitPrice, productionCost };
    });

    await prisma.sale.create({
      data: {
        clientName,
        totalAmount: Math.round(totalAmount * 100) / 100,
        status,
        businessLine,
        deliveredAt,
        businessId: business.id,
        createdAt: saleDate,
        items: { create: saleItems },
      },
    });
    saleCount++;
  }
  console.log(`✅ ${saleCount} ventas de junio 2026 creadas`);

  // ── 20 GASTOS junio 2026 ──────────────────────────────────────────────────
  for (let i = 0; i < EXPENSE_DATA.length; i++) {
    const exp = EXPENSE_DATA[i];
    const day = rand(1, 4);
    await prisma.expense.create({
      data: {
        description: exp.description,
        category: exp.category,
        amount: exp.amount,
        isRecurring: exp.isRecurring,
        expenseDate: utcDate(2026, 6, day),
        businessId: business.id,
      },
    });
  }
  console.log(`✅ ${EXPENSE_DATA.length} egresos de junio 2026 creados`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
