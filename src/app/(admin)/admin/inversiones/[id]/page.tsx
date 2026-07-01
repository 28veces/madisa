import InvestmentForm from "@/components/admin/InvestmentForm";
import { getInvestmentWithContributions } from "@/actions/investments";
import { getPartners } from "@/actions/partners";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function InversionPage({ params }: Props) {
  const { id } = await params;
  const [investment, partners] = await Promise.all([
    getInvestmentWithContributions(id).catch(() => null),
    getPartners().catch(() => []),
  ]);

  if (!investment) notFound();

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Editar Inversión</h1>
      <InvestmentForm
        investment={{ ...investment, purchaseDate: new Date(investment.purchaseDate) }}
        partners={partners}
        initialContributions={investment.contributions.map((c) => ({
          partnerId: c.partnerId,
          amount: c.amount,
        }))}
      />
    </div>
  );
}
