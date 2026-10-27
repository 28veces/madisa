"use server";

import { prisma } from "@/lib/prisma";
import { requireBusiness } from "@/lib/require-auth";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { RecurrenceFrequency } from "@prisma/client";
import { advanceDueDate } from "@/lib/recurrence";

const expenseSchema = z.object({
  description: z.string().min(1, "La descripción es requerida"),
  amount: z.number().positive("El monto debe ser mayor a 0"),
  category: z.string().min(1, "La categoría es requerida"),
  isRecurring: z.boolean().default(false),
  expenseDate: z.string().min(1, "La fecha es requerida"),
  notes: z.string().optional(),
});

export type ExpenseFormData = z.infer<typeof expenseSchema>;

// Sin esta validación, un id vacío hacía que findFirst({ id: undefined, businessId })
// devolviera el primer egreso del negocio (bug de US-63)
const idSchema = z.string().min(1);

// Al crear se puede indicar si el egreso se repite: entonces también se crea el egreso fijo,
// así que los campos llevan los mismos límites que en recurring-expenses.ts
const createExpenseSchema = expenseSchema.extend({
  description: z.string().trim().min(1, "La descripción es requerida").max(200),
  category: z.string().trim().min(1, "La categoría es requerida").max(100),
  notes: z.string().max(1000).optional(),
  // AAAA-MM-DD de un día que exista: de ahí se calcula el próximo pago
  expenseDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida")
    .refine((s) => {
      const d = new Date(s);
      return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
    }, "Fecha inválida"),
  frequency: z
    .nativeEnum(RecurrenceFrequency, { message: "Frecuencia inválida" })
    .nullable()
    .default(null),
});

export type CreateExpenseFormData = z.input<typeof createExpenseSchema>;

export async function createExpense(formData: CreateExpenseFormData) {
  const { businessId } = await requireBusiness(["ADMIN"]);

  try {
    const result = createExpenseSchema.safeParse(formData);
    if (!result.success) {
      return { success: false, message: result.error.issues[0]?.message ?? "Datos inválidos" };
    }
    const { frequency, ...parsed } = result.data;
    const expenseDate = new Date(parsed.expenseDate);

    const expense = await prisma.$transaction(async (tx) => {
      // El próximo pago es la fecha de este egreso avanzada según la frecuencia
      const recurring = frequency
        ? await tx.recurringExpense.create({
            data: {
              description: parsed.description,
              category: parsed.category,
              amount: parsed.amount,
              frequency,
              nextDueDate: advanceDueDate(expenseDate, frequency),
              notes: parsed.notes || null,
              businessId,
            },
          })
        : null;

      return tx.expense.create({
        data: {
          ...parsed,
          isRecurring: recurring ? true : parsed.isRecurring,
          recurringExpenseId: recurring?.id,
          businessId,
          expenseDate,
        },
      });
    });

    revalidatePath("/admin/egresos");
    if (frequency) revalidatePath("/admin");
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
  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) return { success: false, message: "Egreso no encontrado" };
  id = parsedId.data;

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
  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) return { success: false, message: "Egreso no encontrado" };
  id = parsedId.data;

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
  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) return null;
  id = parsedId.data;

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
