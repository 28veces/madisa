export const dynamic = "force-dynamic";

import { getGananciasByYear, getAvailableYears } from "@/actions/ganancias";
import { formatCurrency } from "@/lib/utils";
import { redirect } from "next/navigation";
import Link from "next/link";

const MONTHS_SHORT = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

interface Props {
  searchParams: Promise<{ year?: string }>;
}

export default async function GananciasPage({ searchParams }: Props) {
  const params = await searchParams;
  const years = await getAvailableYears();
  const currentYear = new Date().getFullYear();
  const selectedYear = parseInt(params.year ?? String(currentYear));

  const { byMonth, partners } = await getGananciasByYear(selectedYear).catch(() => ({
    byMonth: [],
    partners: [],
  }));

  const totales = byMonth.reduce(
    (acc, m) => ({
      ventasBrutas: acc.ventasBrutas + m.ventasBrutas,
      costoProduccion: acc.costoProduccion + m.costoProduccion,
      consumoInsumos: acc.consumoInsumos + m.consumoInsumos,
      egresos: acc.egresos + m.egresos,
      gananciaNeta: acc.gananciaNeta + m.gananciaNeta,
    }),
    { ventasBrutas: 0, costoProduccion: 0, consumoInsumos: 0, egresos: 0, gananciaNeta: 0 }
  );

  const pctAsignado = partners.reduce((s, p) => s + Number(p.percentage), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ganancias</h1>
          <p className="text-gray-500 text-sm mt-1">
            Utilidad neta = ventas − costo de lo vendido − consumo de insumos y mermas − egresos. Se reparte por socio.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {partners.length === 0 && (
            <Link href="/admin/configuracion" className="text-sm text-rose-600 hover:underline">
              Configura los socios primero →
            </Link>
          )}
          <div className="flex gap-1">
            {years.map((y) => (
              <Link
                key={y}
                href={`/admin/ganancias?year=${y}`}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  y === selectedYear
                    ? "bg-rose-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {y}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Resumen anual */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Ventas brutas {selectedYear}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(totales.ventasBrutas)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Costo de lo vendido</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(totales.costoProduccion)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Consumo y mermas</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(totales.consumoInsumos)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Egresos</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(totales.egresos)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Utilidad neta {selectedYear}</p>
          <p className={`text-2xl font-bold mt-1 ${totales.gananciaNeta >= 0 ? "text-green-600" : "text-red-600"}`}>
            {formatCurrency(totales.gananciaNeta)}
          </p>
        </div>
      </div>

      {/* Tabla mensual */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left py-3 px-4 font-medium text-gray-600">Mes</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">Ventas</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">Costo vendido</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">Consumo/mermas</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">Egresos</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600 border-l border-gray-200">Utilidad neta</th>
                {partners.map((p) => (
                  <th key={p.id} className="text-right py-3 px-4 font-medium text-gray-600">
                    {p.name} ({Number(p.percentage)}%)
                  </th>
                ))}
                {pctAsignado < 100 && (
                  <th className="text-right py-3 px-4 font-medium text-gray-400">
                    Sin asignar ({(100 - pctAsignado).toFixed(0)}%)
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {byMonth.map((m) => (
                <tr key={m.month} className={`hover:bg-gray-50/50 transition-colors ${m.numVentas === 0 && m.egresos === 0 && m.consumoInsumos === 0 ? "opacity-40" : ""}`}>
                  <td className="py-3 px-4 font-medium text-gray-900">{m.label}</td>
                  <td className="py-3 px-4 text-right text-gray-700">{formatCurrency(m.ventasBrutas)}</td>
                  <td className="py-3 px-4 text-right text-gray-500">{formatCurrency(m.costoProduccion)}</td>
                  <td className="py-3 px-4 text-right text-gray-500">{formatCurrency(m.consumoInsumos)}</td>
                  <td className="py-3 px-4 text-right text-gray-500">{formatCurrency(m.egresos)}</td>
                  <td className={`py-3 px-4 text-right font-semibold border-l border-gray-200 ${
                    m.gananciaNeta >= 0 ? "text-green-700" : "text-red-600"
                  }`}>
                    {formatCurrency(m.gananciaNeta)}
                  </td>
                  {m.distribucion.map((d) => (
                    <td key={d.id} className="py-3 px-4 text-right text-gray-700">
                      {formatCurrency(d.amount)}
                    </td>
                  ))}
                  {pctAsignado < 100 && (
                    <td className="py-3 px-4 text-right text-gray-400">{formatCurrency(m.sinAsignar)}</td>
                  )}
                </tr>
              ))}

              {/* Fila de totales */}
              <tr className="border-t-2 border-gray-300 bg-gray-50 font-semibold">
                <td className="py-3 px-4 text-gray-900">Total {selectedYear}</td>
                <td className="py-3 px-4 text-right text-gray-900">{formatCurrency(totales.ventasBrutas)}</td>
                <td className="py-3 px-4 text-right text-gray-700">{formatCurrency(totales.costoProduccion)}</td>
                <td className="py-3 px-4 text-right text-gray-700">{formatCurrency(totales.consumoInsumos)}</td>
                <td className="py-3 px-4 text-right text-gray-700">{formatCurrency(totales.egresos)}</td>
                <td className={`py-3 px-4 text-right border-l border-gray-200 ${
                  totales.gananciaNeta >= 0 ? "text-green-700" : "text-red-600"
                }`}>
                  {formatCurrency(totales.gananciaNeta)}
                </td>
                {partners.map((p) => (
                  <td key={p.id} className="py-3 px-4 text-right text-gray-700">
                    {formatCurrency(totales.gananciaNeta * (Number(p.percentage) / 100))}
                  </td>
                ))}
                {pctAsignado < 100 && (
                  <td className="py-3 px-4 text-right text-gray-400">
                    {formatCurrency(totales.gananciaNeta * ((100 - pctAsignado) / 100))}
                  </td>
                )}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
