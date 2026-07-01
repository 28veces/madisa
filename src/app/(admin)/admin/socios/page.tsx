export const dynamic = "force-dynamic";

import { getPartners } from "@/actions/partners";
import { getPartnerInvestmentSummary } from "@/actions/investments";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import SociosClient from "./SociosClient";

const categoryLabels: Record<string, string> = {
  MAQUINARIA: "Maquinaria",
  MEJORA_LOCAL: "Mejora del Local",
  EQUIPO: "Equipo",
  OTRO: "Otro",
};

export default async function SociosPage() {
  const [partners, partnerSummary] = await Promise.all([
    getPartners().catch(() => []),
    getPartnerInvestmentSummary().catch(() => []),
  ]);

  const partnersData = partners.map((p) => ({
    ...p,
    percentage: Number(p.percentage),
  }));
  const totalPct = partnersData.reduce((s, p) => s + p.percentage, 0);
  const totalContributed = partnerSummary.reduce((s, p) => s + p.totalContributed, 0);

  return (
    <div className="space-y-8">
      {/* Gestión de socios */}
      <div className="space-y-4 max-w-2xl">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Socios</h1>
          <p className="text-gray-500 text-sm mt-1">Gestiona los socios y su distribución de ganancias</p>
        </div>
        <SociosClient partners={partnersData} totalPct={totalPct} />
      </div>

      {/* Resumen de inversiones por socio */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Inversiones por socio</h2>
          <p className="text-gray-500 text-sm mt-1">Aportes de cada socio al negocio</p>
        </div>

        {partnerSummary.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-gray-400 text-sm">
              Aún no hay aportes registrados. Al crear una inversión podrás asignarla a uno o varios socios.
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Tarjetas resumen */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {partnerSummary.map((p) => (
                <Card key={p.id} className="bg-blue-50 border-blue-200">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">{p.name}</CardTitle>
                    <Users className="h-4 w-4 text-blue-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-700">{formatCurrency(p.totalContributed)}</div>
                    <p className="text-xs text-gray-500 mt-1">
                      {p.contributions.length} inversión{p.contributions.length !== 1 ? "es" : ""}
                      {totalContributed > 0 && (
                        <span className="ml-1 font-medium">
                          · {((p.totalContributed / totalContributed) * 100).toFixed(1)}% del total
                        </span>
                      )}
                    </p>
                  </CardContent>
                </Card>
              ))}
              <Card className="bg-gray-50 border-gray-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total general</CardTitle>
                  <Users className="h-4 w-4 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-700">{formatCurrency(totalContributed)}</div>
                  <p className="text-xs text-gray-500 mt-1">Suma de todos los socios</p>
                </CardContent>
              </Card>
            </div>

            {/* Detalle por socio */}
            <div className="space-y-4">
              {partnerSummary.map((p) => (
                <Card key={p.id}>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center justify-between">
                      <span>{p.name}</span>
                      <span className="text-blue-600 font-bold">{formatCurrency(p.totalContributed)}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {p.contributions.length === 0 ? (
                      <p className="text-sm text-gray-400">Sin inversiones registradas aún.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b bg-gray-50">
                              <th className="text-left py-2 px-3 font-medium text-gray-600">Inversión</th>
                              <th className="text-center py-2 px-3 font-medium text-gray-600">Categoría</th>
                              <th className="text-left py-2 px-3 font-medium text-gray-600">Fecha</th>
                              <th className="text-right py-2 px-3 font-medium text-gray-600">Total inv.</th>
                              <th className="text-right py-2 px-3 font-medium text-gray-600">Aporte</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                            {p.contributions.map((c, i) => (
                              <tr key={i} className="hover:bg-gray-50/50">
                                <td className="py-2 px-3 font-medium text-gray-900">{c.investmentDescription}</td>
                                <td className="py-2 px-3 text-center">
                                  <Badge variant="outline" className="text-xs">
                                    {categoryLabels[c.investmentCategory] ?? c.investmentCategory}
                                  </Badge>
                                </td>
                                <td className="py-2 px-3 text-gray-500 text-xs">{formatDate(c.investmentDate)}</td>
                                <td className="py-2 px-3 text-right text-gray-500">{formatCurrency(c.investmentTotal)}</td>
                                <td className="py-2 px-3 text-right font-bold text-blue-700">{formatCurrency(c.amount)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
