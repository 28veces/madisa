"use server";

import { prisma } from "@/lib/prisma";
import { requireBusiness } from "@/lib/require-auth";
import { UserRole } from "@prisma/client";
import { getAverageUnitCosts } from "@/lib/stock";

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

export async function getGananciasByYear(year: number) {
  const { businessId } = await requireBusiness([UserRole.ADMIN]);
  const start = new Date(year, 0, 1);
  const end = new Date(year + 1, 0, 1);

  // Fechas de solo-día (egresos, salidas) se guardan a medianoche UTC
  const startUtc = new Date(Date.UTC(year, 0, 1));
  const endUtc = new Date(Date.UTC(year + 1, 0, 1));

  const [sales, partners, adjustments, expenses] = await Promise.all([
    prisma.sale.findMany({
      where: {
        businessId,
        createdAt: { gte: start, lt: end },
        status: { not: "CANCELLED" },
      },
      include: { items: { select: { quantity: true, unitPrice: true, productionCost: true } } },
    }),
    prisma.partner.findMany({
      where: { businessId },
      orderBy: { order: "asc" },
    }),
    prisma.inventoryAdjustment.findMany({
      where: { businessId, date: { gte: startUtc, lt: endUtc } },
      select: { inventoryItemId: true, quantity: true, date: true },
    }),
    prisma.expense.findMany({
      where: { businessId, expenseDate: { gte: startUtc, lt: endUtc } },
      select: { amount: true, expenseDate: true },
    }),
  ]);

  // Las salidas (consumo de insumos, mermas) se valoran al costo promedio de compra
  const avgCosts = await getAverageUnitCosts(
    prisma,
    adjustments.map((a) => a.inventoryItemId)
  );

  const byMonth = Array.from({ length: 12 }, (_, m) => {
    const monthSales = sales.filter((s) => s.createdAt.getMonth() === m);
    const ventasBrutas = monthSales.reduce(
      (sum, s) => sum + s.items.reduce((si, i) => si + i.quantity * Number(i.unitPrice), 0),
      0
    );
    const costoProduccion = monthSales.reduce(
      (sum, s) => sum + s.items.reduce((si, i) => si + Number(i.productionCost), 0),
      0
    );
    const consumoInsumos = adjustments
      .filter((a) => a.date.getUTCMonth() === m)
      .reduce((sum, a) => sum + a.quantity * (avgCosts.get(a.inventoryItemId) ?? 0), 0);
    const egresos = expenses
      .filter((e) => e.expenseDate.getUTCMonth() === m)
      .reduce((sum, e) => sum + Number(e.amount), 0);
    // Utilidad neta a repartir: ventas − costo de lo vendido − consumo/mermas − egresos operativos.
    // Las inversiones de capital no se restan: se registran como aportes por socio.
    const gananciaNeta = ventasBrutas - costoProduccion - consumoInsumos - egresos;

    const distribucion = partners.map((p) => ({
      id: p.id,
      name: p.name,
      percentage: Number(p.percentage),
      amount: gananciaNeta * (Number(p.percentage) / 100),
    }));

    const pctAsignado = partners.reduce((s, p) => s + Number(p.percentage), 0);
    const sinAsignar = gananciaNeta * ((100 - pctAsignado) / 100);

    return {
      month: m,
      label: MONTHS[m],
      ventasBrutas,
      costoProduccion,
      consumoInsumos,
      egresos,
      gananciaNeta,
      distribucion,
      sinAsignar,
      numVentas: monthSales.length,
    };
  });

  return { byMonth, partners };
}

export async function getAvailableYears(): Promise<number[]> {
  const { businessId } = await requireBusiness([UserRole.ADMIN, UserRole.SECRETARY, UserRole.ACCOUNTANT]);
  const first = await prisma.sale.findFirst({
    where: { businessId },
    orderBy: { createdAt: "asc" },
    select: { createdAt: true },
  });
  const currentYear = new Date().getFullYear();
  const firstYear = first ? first.createdAt.getFullYear() : currentYear;
  const years: number[] = [];
  for (let y = firstYear; y <= currentYear; y++) years.push(y);
  return years;
}
