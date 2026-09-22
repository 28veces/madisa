export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { requireBusiness } from "@/lib/require-auth";
import MetricCard from "@/components/admin/MetricCard";
import SalesChart from "@/components/admin/SalesChart";
import BusinessLineChart from "@/components/admin/BusinessLineChart";
import YearlySummaryChart from "@/components/admin/YearlySummaryChart";
import { DollarSign, ShoppingBag, TrendingDown, Package, AlertTriangle } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

async function getMonthlyData(businessId: string, year: number) {
  const months = [];
  const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

  for (let i = 0; i < 12; i++) {
    const start = new Date(Date.UTC(year, i, 1));
    const end = new Date(Date.UTC(year, i + 1, 0, 23, 59, 59, 999));

    const [salesAgg, expensesAgg, purchasesAgg] = await Promise.all([
      prisma.sale.aggregate({
        where: { businessId, createdAt: { gte: start, lte: end }, status: { not: "CANCELLED" } },
        _sum: { totalAmount: true },
      }),
      prisma.expense.aggregate({
        where: { businessId, expenseDate: { gte: start, lte: end } },
        _sum: { amount: true },
      }),
      prisma.purchase.aggregate({
        where: { businessId, purchaseDate: { gte: start, lte: end } },
        _sum: { totalAmount: true },
      }),
    ]);

    months.push({
      month: monthNames[i],
      sales: Number(salesAgg._sum.totalAmount ?? 0),
      expenses: Number(expensesAgg._sum.amount ?? 0) + Number(purchasesAgg._sum.totalAmount ?? 0),
    });
  }

  return months;
}

async function getBusinessLineDistribution(businessId: string) {
  const sales = await prisma.sale.findMany({
    where: { businessId, status: { not: "CANCELLED" } },
    select: { businessLine: true, totalAmount: true },
  });

  const distribution: Record<string, number> = {
    PERSONALIZACION: 0,
    ARREGLOS: 0,
    IMPRESIONES: 0,
    OTRO: 0,
  };

  sales.forEach((sale) => {
    const line = sale.businessLine || "OTRO";
    distribution[line] = (distribution[line] || 0) + Number(sale.totalAmount || 0);
  });

  return Object.entries(distribution)
    .filter(([, value]) => value > 0)
    .map(([name, value]) => ({ name, value }));
}

async function getYearlySummaryData(businessId: string, year: number) {
  const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  const yearStart = new Date(Date.UTC(year, 0, 1));
  const yearEnd = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999));

  const [sales, expenses, purchases, investments] = await Promise.all([
    prisma.sale.findMany({
      where: { businessId, createdAt: { gte: yearStart, lte: yearEnd }, status: { not: "CANCELLED" } },
      select: { createdAt: true, totalAmount: true },
    }),
    prisma.expense.findMany({
      where: { businessId, expenseDate: { gte: yearStart, lte: yearEnd } },
      select: { expenseDate: true, amount: true },
    }),
    prisma.purchase.findMany({
      where: { businessId, purchaseDate: { gte: yearStart, lte: yearEnd } },
      select: { purchaseDate: true, totalAmount: true },
    }),
    prisma.investment.findMany({
      where: { businessId, purchaseDate: { gte: yearStart, lte: yearEnd } },
      select: { purchaseDate: true, amount: true },
    }),
  ]);

  return monthNames.map((month, i) => {
    const income = sales
      .filter((s) => new Date(s.createdAt).getUTCMonth() === i)
      .reduce((sum, s) => sum + Number(s.totalAmount), 0);

    const expensesTotal = expenses
      .filter((e) => new Date(e.expenseDate).getUTCMonth() === i)
      .reduce((sum, e) => sum + Number(e.amount), 0);

    const purchasesTotal = purchases
      .filter((p) => new Date(p.purchaseDate).getUTCMonth() === i)
      .reduce((sum, p) => sum + Number(p.totalAmount), 0);

    const investmentsTotal = investments
      .filter((inv) => new Date(inv.purchaseDate).getUTCMonth() === i)
      .reduce((sum, inv) => sum + Number(inv.amount), 0);

    return {
      month,
      income,
      expenses: expensesTotal + purchasesTotal,
      investments: investmentsTotal,
    };
  });
}

async function getDashboardData(businessId: string) {
  const now = new Date();
  const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const year = now.getUTCFullYear();

  const [salesThisMonth, totalSales, purchasesThisMonth, expensesThisMonth, lowStockProducts, recentSales, monthlyData, businessLineData, yearlySummaryData] =
    await Promise.all([
      prisma.sale.aggregate({
        where: { businessId, createdAt: { gte: startOfMonth }, status: { not: "CANCELLED" } },
        _sum: { totalAmount: true },
        _count: true,
      }),
      prisma.sale.aggregate({
        where: { businessId, status: { not: "CANCELLED" } },
        _sum: { totalAmount: true },
        _count: true,
      }),
      prisma.purchase.aggregate({
        where: { businessId, purchaseDate: { gte: startOfMonth } },
        _sum: { totalAmount: true },
        _count: true,
      }),
      prisma.expense.aggregate({
        where: { businessId, expenseDate: { gte: startOfMonth } },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.product.findMany({
        where: { businessId, isActive: true },
        take: 5,
      }),
      prisma.sale.findMany({
        where: { businessId },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      getMonthlyData(businessId, year),
      getBusinessLineDistribution(businessId),
      getYearlySummaryData(businessId, year).catch(() => []),
    ]);

  return { salesThisMonth, totalSales, purchasesThisMonth, expensesThisMonth, lowStockProducts, recentSales, monthlyData, businessLineData, yearlySummaryData };
}

const statusLabels: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Pendiente", color: "bg-yellow-100 text-yellow-700" },
  IN_PROGRESS: { label: "En proceso", color: "bg-blue-100 text-blue-700" },
  COMPLETED: { label: "Completado", color: "bg-green-100 text-green-700" },
  CANCELLED: { label: "Cancelado", color: "bg-gray-100 text-gray-500" },
};

const emptyData = {
  salesThisMonth: { _sum: { totalAmount: null }, _count: 0 },
  totalSales: { _sum: { totalAmount: null }, _count: 0 },
  purchasesThisMonth: { _sum: { totalAmount: null }, _count: 0 },
  expensesThisMonth: { _sum: { amount: null }, _count: 0 },
  lowStockProducts: [],
  recentSales: [],
  monthlyData: [],
  businessLineData: [],
  yearlySummaryData: [],
};

export default async function DashboardPage() {
  const { businessId } = await requireBusiness();
  const data = await getDashboardData(businessId).catch(() => emptyData);
  const salesAmount = Number(data.salesThisMonth._sum.totalAmount ?? 0);
  const purchasesAmount = Number(data.purchasesThisMonth._sum.totalAmount ?? 0);
  const expensesAmount = Number(data.expensesThisMonth._sum.amount ?? 0);
  const gastosAmount = purchasesAmount + expensesAmount;
  const gastosCount = data.purchasesThisMonth._count + data.expensesThisMonth._count;
  const margin = salesAmount - gastosAmount;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Resumen del negocio este mes</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricCard
          title="Ventas este mes"
          value={formatCurrency(salesAmount)}
          subtitle={`${data.salesThisMonth._count} pedidos`}
          icon={DollarSign}
          color="green"
          trend="up"
        />
        <MetricCard
          title="Total ventas"
          value={formatCurrency(Number(data.totalSales._sum.totalAmount ?? 0))}
          subtitle={`${data.totalSales._count} pedidos en total`}
          icon={ShoppingBag}
          color="cyan"
        />
        <MetricCard
          title="Gastos este mes"
          value={formatCurrency(gastosAmount)}
          subtitle={`${gastosCount} registros`}
          icon={TrendingDown}
          color="yellow"
          trend="down"
        />
        <MetricCard
          title="Margen este mes"
          value={formatCurrency(margin)}
          subtitle={margin >= 0 ? "Ganancia" : "Pérdida"}
          icon={Package}
          color={margin >= 0 ? "green" : "red"}
          trend={margin >= 0 ? "up" : "down"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SalesChart data={data.monthlyData} />
        <BusinessLineChart data={data.businessLineData} />
      </div>

      <YearlySummaryChart data={data.yearlySummaryData} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ventas recientes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ventas recientes</CardTitle>
          </CardHeader>
          <CardContent>
            {data.recentSales.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">Sin ventas registradas</p>
            ) : (
              <div className="space-y-3">
                {data.recentSales.map((sale) => {
                  const statusInfo = statusLabels[sale.status] ?? statusLabels.PENDING;
                  return (
                    <div key={sale.id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{sale.clientName}</p>
                        <p className="text-xs text-gray-400">{formatDate(sale.createdAt)}</p>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="text-sm font-bold text-gray-900">
                          {formatCurrency(Number(sale.totalAmount))}
                        </p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stock bajo */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Productos con stock bajo
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.lowStockProducts.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">
                Todo el inventario está bien
              </p>
            ) : (
              <div className="space-y-2">
                {data.lowStockProducts.map((p) => (
                  <div key={p.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <p className="text-sm font-medium text-gray-900">{p.name}</p>
                    <Badge variant="outline" className="text-amber-600 border-amber-200">
                      Ver en catálogo
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
