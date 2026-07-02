"use server";

import { prisma } from "@/lib/prisma";
import { requireBusiness } from "@/lib/require-auth";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const expenseSchema = z.object({
  description: z.string().min(1, "La descripción es requerida"),
  amount: z.number().positive("El monto debe ser mayor a 0"),
  category: z.string().min(1, "La categoría es requerida"),
  isRecurring: z.boolean().default(false),
  expenseDate: z.string().min(1, "La fecha es requerida"),
  notes: z.string().optional(),
});

export type ExpenseFormData = z.infer<typeof expenseSchema>;

export async function createExpense(formData: ExpenseFormData) {
  const { businessId } = await requireBusiness(["ADMIN"]);

  try {
    const parsed = expenseSchema.parse(formData);

    const expense = await prisma.expense.create({
      data: {
        ...parsed,
        businessId,
        expenseDate: new Date(parsed.expenseDate),
      },
    });

    revalidatePath("/admin/egresos");
    return { success: true, expense };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Error al crear el egreso";
    return { success: false, message };
  }
}

export async function updateExpense(
  id: string,
  formData: ExpenseFormData
) {
  const { businessId } = await requireBusiness(["ADMIN"]);

  try {
    const parsed = expenseSchema.parse(formData);

    // Verificar que el egreso pertenece al negocio
    const expense = await prisma.expense.findFirst({
      where: { id, businessId },
    });

    if (!expense) {
      return { success: false, message: "Egreso no encontrado" };
    }

    const updated = await prisma.expense.update({
      where: { id },
      data: {
        ...parsed,
        expenseDate: new Date(parsed.expenseDate),
      },
    });

    revalidatePath("/admin/egresos");
    return { success: true, expense: updated };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Error al actualizar el egreso";
    return { success: false, message };
  }
}

export async function deleteExpense(id: string) {
  const { businessId } = await requireBusiness(["ADMIN"]);

  try {
    // Verificar que el egreso pertenece al negocio
    const expense = await prisma.expense.findFirst({
      where: { id, businessId },
    });

    if (!expense) {
      return { success: false, message: "Egreso no encontrado" };
    }

    await prisma.expense.delete({ where: { id } });

    revalidatePath("/admin/egresos");
    return { success: true };
  } catch (error) {
    return { success: false, message: "Error al eliminar el egreso" };
  }
}

export async function getExpenses() {
  const { businessId } = await requireBusiness(["ADMIN", "ACCOUNTANT"]);

  try {
    const expenses = await prisma.expense.findMany({
      where: { businessId },
      orderBy: { expenseDate: "desc" },
    });

    return expenses;
  } catch (error) {
    return [];
  }
}

export async function getExpense(id: string) {
  const { businessId } = await requireBusiness(["ADMIN", "ACCOUNTANT"]);

  try {
    const expense = await prisma.expense.findFirst({
      where: { id, businessId },
    });

    return expense;
  } catch (error) {
    return null;
  }
}

export async function getTotalExpenses(month?: Date, year?: number) {
  const { businessId } = await requireBusiness();

  try {
    const expenses = await prisma.expense.findMany({
      where: {
        businessId,
        ...(month && {
          expenseDate: {
            gte: new Date(month.getFullYear(), month.getMonth(), 1),
            lte: new Date(month.getFullYear(), month.getMonth() + 1, 0),
          },
        }),
        ...(year && !month && {
          expenseDate: {
            gte: new Date(`${year}-01-01`),
            lte: new Date(`${year}-12-31`),
          },
        }),
      },
    });

    return expenses.reduce((sum, exp) => sum + exp.amount, 0);
  } catch (error) {
    return 0;
  }
}

export async function getExpensesByMonth(year: number) {
  const { businessId } = await requireBusiness();

  try {
    const expenses = await prisma.expense.findMany({
      where: {
        businessId,
        expenseDate: {
          gte: new Date(`${year}-01-01`),
          lte: new Date(`${year}-12-31`),
        },
      },
      orderBy: { expenseDate: "asc" },
    });

    // Agrupar por mes
    const byMonth: Record<number, number> = {};
    expenses.forEach((exp) => {
      const month = exp.expenseDate.getMonth();
      byMonth[month] = (byMonth[month] || 0) + exp.amount;
    });

    return byMonth;
  } catch (error) {
    return {};
  }
}
