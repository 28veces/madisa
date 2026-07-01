export const dynamic = "force-dynamic";

import { getPartners, createPartner, updatePartner, deletePartner } from "@/actions/partners";
import { formatCurrency } from "@/lib/utils";
import ConfiguracionClient from "./ConfiguracionClient";

export default async function ConfiguracionPage() {
  const partners = await getPartners().catch(() => []);
  const partnersData = partners.map(p => ({
    ...p,
    percentage: Number(p.percentage),
  }));
  const totalPct = partnersData.reduce((s, p) => s + p.percentage, 0);

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
        <p className="text-gray-500 text-sm mt-1">Gestiona los socios y su distribución de ganancias</p>
      </div>

      <ConfiguracionClient partners={partnersData} totalPct={totalPct} />
    </div>
  );
}
