import InvestmentForm from "@/components/admin/InvestmentForm";
import { getPartners } from "@/actions/partners";

export default async function NuevaInversionPage() {
  const partners = await getPartners().catch(() => []);

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Nueva Inversión</h1>
      <InvestmentForm partners={partners} />
    </div>
  );
}
