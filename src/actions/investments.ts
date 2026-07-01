"use server";

import { prisma } from "@/lib/prisma";
import { requireBusiness } from "@/lib/require-auth";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const investmentSchema = z.object({
  description: z.string().min(1, "La descripción es requerida"),
  amount: z.number().positive("El monto debe ser mayor a 0"),
  category: z.enum(["MAQUINARIA", "MEJORA_LOCAL", "EQUIPO", "OTRO"]),
  purchaseDate: z.string().min(1, "La fecha es requerida"),
  notes: z.string().optional(),
});

export type InvestmentFormData = z.infer<typeof investmentSchema>;

const contributionSchema = z.object({
  partnerId: z.string().min(1),
  amount: z.number().positive(),
});

export type ContributionInput = z.infer<typeof contributionSchema>;

export async function createInvestment(
  formData: InvestmentFormData,
  contributions: ContributionInput[] = []
) {
  const { businessId } = await requireBusiness(["ADMIN"]);

  try {
    const parsed = investmentSchema.parse(formData);

    const investment = await prisma.investment.create({
      data: {
        ...parsed,
        businessId,
        purchaseDate: new Date(parsed.purchaseDate),
        contributions: contributions.length
          ? { create: contributions.map((c) => ({ partnerId: c.partnerId, amount: c.amount })) }
          : undefined,
      },
    });

    revalidatePath("/admin/inversiones");
    revalidatePath("/admin/socios");
    return { success: true, investment };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al crear la inversión";
    return { success: false, message };
  }
}

export async function updateInvestment(
  id: string,
  formData: InvestmentFormData,
  contributions: ContributionInput[] = []
) {
  const { businessId } = await requireBusiness(["ADMIN"]);

  try {
    const parsed = investmentSchema.parse(formData);

    const investment = await prisma.investment.findFirst({ where: { id, businessId } });
    if (!investment) return { success: false, message: "Inversión no encontrada" };

    const updated = await prisma.$transaction([
      prisma.investmentContribution.deleteMany({ where: { investmentId: id } }),
      prisma.investment.update({
        where: { id },
        data: {
          ...parsed,
          purchaseDate: new Date(parsed.purchaseDate),
          contributions: contributions.length
            ? { create: contributions.map((c) => ({ partnerId: c.partnerId, amount: c.amount })) }
            : undefined,
        },
      }),
    ]);

    revalidatePath("/admin/inversiones");
    revalidatePath("/admin/socios");
    return { success: true, investment: updated[1] };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al actualizar la inversión";
    return { success: false, message };
  }
}

export async function deleteInvestment(id: string) {
  const { businessId } = await requireBusiness(["ADMIN"]);

  try {
    // Verificar que la inversión pertenece al negocio
    const investment = await prisma.investment.findFirst({
      where: { id, businessId },
    });

    if (!investment) {
      return { success: false, message: "Inversión no encontrada" };
    }

    await prisma.investment.delete({ where: { id } });

    revalidatePath("/admin/inversiones");
    return { success: true };
  } catch (error) {
    return { success: false, message: "Error al eliminar la inversión" };
  }
}

export async function getInvestments() {
  const { businessId } = await requireBusiness(["ADMIN", "ACCOUNTANT"]);

  try {
    const investments = await prisma.investment.findMany({
      where: { businessId },
      orderBy: { purchaseDate: "desc" },
    });

    return investments;
  } catch (error) {
    return [];
  }
}

export async function getInvestment(id: string) {
  const { businessId } = await requireBusiness(["ADMIN", "ACCOUNTANT"]);

  try {
    const investment = await prisma.investment.findFirst({
      where: { id, businessId },
    });

    return investment;
  } catch (error) {
    return null;
  }
}

export async function getTotalInvestments(year?: number) {
  const { businessId } = await requireBusiness();

  try {
    const investments = await prisma.investment.findMany({
      where: {
        businessId,
        ...(year && {
          purchaseDate: {
            gte: new Date(`${year}-01-01`),
            lte: new Date(`${year}-12-31`),
          },
        }),
      },
    });

    return investments.reduce((sum, inv) => sum + inv.amount, 0);
  } catch (error) {
    return 0;
  }
}

export async function getPartnerInvestmentSummary() {
  const { businessId } = await requireBusiness(["ADMIN", "ACCOUNTANT"]);

  const partners = await prisma.partner.findMany({
    where: { businessId },
    include: {
      contributions: {
        include: {
          investment: {
            select: { description: true, purchaseDate: true, category: true, amount: true },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { order: "asc" },
  });

  return partners.map((p) => ({
    id: p.id,
    name: p.name,
    percentage: p.percentage,
    totalContributed: p.contributions.reduce((s, c) => s + c.amount, 0),
    contributions: p.contributions.map((c) => ({
      amount: c.amount,
      investmentDescription: c.investment.description,
      investmentCategory: c.investment.category,
      investmentDate: c.investment.purchaseDate,
      investmentTotal: c.investment.amount,
    })),
  }));
}

export async function getInvestmentWithContributions(id: string) {
  const { businessId } = await requireBusiness(["ADMIN", "ACCOUNTANT"]);
  const investment = await prisma.investment.findFirst({
    where: { id, businessId },
    include: { contributions: { include: { partner: true } } },
  });
  return investment;
}
