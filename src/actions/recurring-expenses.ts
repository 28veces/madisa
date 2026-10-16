"use server";

import { prisma } from "@/lib/prisma";
import { requireBusiness } from "@/lib/require-auth";
import { advanceDueDate, isDue, todayISO } from "@/lib/recurrence";
import { Prisma, RecurrenceFrequency, UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// AAAA-MM-DD de un día que exista (rechaza 2026-02-31 o 2026-13-01)
const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida")
  .refine((s) => {
    const d = new Date(s);
    return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
  }, "Fecha inválida");

const recurringExpenseSchema = z.object({
  description: z.string().trim().min(1, "La descripción es requerida").max(200),
  category: z.string().trim().min(1, "La categoría es requerida").max(100),
  amount: z.number().positive("El monto debe ser mayor a 0"),
  frequency: z.nativeEnum(RecurrenceFrequency),
  nextDueDate: isoDate,
  isActive: z.boolean().default(true),
  notes: z.string().max(1000).optional(),
});

export type RecurringExpenseFormData = z.infer<typeof recurringExpenseSchema>;

const paymentSchema = z.object({
  amount: z.number().positive("El monto debe ser mayor a 0"),
  date: isoDate,
  // Fecha del periodo que se confirma, tal como la vio el usuario
  dueDate: isoDate,
});

const idSchema = z.string().min(1);

function firstError(error: z.ZodError): string {
  const messages = Object.values(error.flatten().fieldErrors).flat() as string[];
  return messages[0] ?? "Datos inválidos";
}

function revalidate() {
  revalidatePath("/admin/egresos");
  revalidatePath("/admin");
  revalidatePath("/admin/ganancias");
}

export async function getRecurringExpenses() {
  const { businessId } = await requireBusiness([UserRole.ADMIN, UserRole.ACCOUNTANT]);
  const rows = await prisma.recurringExpense.findMany({
    where: { businessId },
    orderBy: [{ isActive: "desc" }, { nextDueDate: "asc" }],
  });
  return rows.map((r) => ({ ...r, isDue: r.isActive && isDue(r.nextDueDate) }));
}

export async function getRecurringExpense(id: string) {
  const { businessId } = await requireBusiness([UserRole.ADMIN, UserRole.ACCOUNTANT]);
  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) return null;
  return prisma.recurringExpense.findFirst({ where: { id: parsedId.data, businessId } });
}

// Cantidad de egresos fijos activos cuya fecha ya llegó, para el aviso del dashboard.
export async function countDueRecurringExpenses() {
  const { businessId, role } = await requireBusiness();
  if (role !== UserRole.ADMIN && role !== UserRole.ACCOUNTANT) return 0;
  return prisma.recurringExpense.count({
    where: { businessId, isActive: true, nextDueDate: { lte: new Date(todayISO()) } },
  });
}

export async function createRecurringExpense(data: RecurringExpenseFormData) {
  const { businessId } = await requireBusiness([UserRole.ADMIN]);
  const parsed = recurringExpenseSchema.safeParse(data);
  if (!parsed.success) return { error: firstError(parsed.error) };

  try {
    await prisma.recurringExpense.create({
      data: {
        ...parsed.data,
        nextDueDate: new Date(parsed.data.nextDueDate),
        notes: parsed.data.notes || null,
        businessId,
      },
    });
  } catch {
    return { error: "Error al crear el egreso fijo" };
  }
  revalidate();
  return { success: true };
}

export async function updateRecurringExpense(id: string, data: RecurringExpenseFormData) {
  const { businessId } = await requireBusiness([UserRole.ADMIN]);
  const parsedId = idSchema.safeParse(id);
  const parsed = recurringExpenseSchema.safeParse(data);
  if (!parsedId.success) return { error: "Egreso fijo no encontrado" };
  if (!parsed.success) return { error: firstError(parsed.error) };

  let count = 0;
  try {
    ({ count } = await prisma.recurringExpense.updateMany({
      where: { id: parsedId.data, businessId },
      data: {
        ...parsed.data,
        nextDueDate: new Date(parsed.data.nextDueDate),
        notes: parsed.data.notes || null,
      },
    }));
  } catch {
    return { error: "Error al actualizar el egreso fijo" };
  }
  if (count === 0) return { error: "Egreso fijo no encontrado" };
  revalidate();
  return { success: true };
}

// Avanza la próxima fecha solo si sigue siendo la del periodo que el usuario vio.
// Si se confirma dos veces (dos pestañas, doble envío), la segunda falla en vez de
// registrar otro pago o adelantar un periodo que todavía no toca.
async function advanceOnce(
  tx: Prisma.TransactionClient,
  recurring: { id: string; nextDueDate: Date; frequency: RecurrenceFrequency },
  dueDate: string
) {
  if (recurring.nextDueDate.toISOString().slice(0, 10) !== dueDate) {
    throw new Error("Este pago ya se registró u omitió; recarga la página");
  }
  const { count } = await tx.recurringExpense.updateMany({
    where: { id: recurring.id, nextDueDate: recurring.nextDueDate },
    data: { nextDueDate: advanceDueDate(recurring.nextDueDate, recurring.frequency) },
  });
  if (count === 0) throw new Error("Este pago ya se registró u omitió; recarga la página");
}

// Registra el pago como un egreso real y mueve la próxima fecha según la frecuencia.
export async function confirmRecurringPayment(id: string, data: z.infer<typeof paymentSchema>) {
  const { businessId } = await requireBusiness([UserRole.ADMIN]);
  const parsedId = idSchema.safeParse(id);
  const parsed = paymentSchema.safeParse(data);
  if (!parsedId.success) return { error: "Egreso fijo no encontrado" };
  if (!parsed.success) return { error: firstError(parsed.error) };

  try {
    await prisma.$transaction(async (tx) => {
      const recurring = await tx.recurringExpense.findFirst({
        where: { id: parsedId.data, businessId, isActive: true },
      });
      if (!recurring) throw new Error("Egreso fijo no encontrado o inactivo");

      await advanceOnce(tx, recurring, parsed.data.dueDate);
      await tx.expense.create({
        data: {
          description: recurring.description,
          category: recurring.category,
          amount: parsed.data.amount,
          isRecurring: true,
          expenseDate: new Date(parsed.data.date),
          notes: recurring.notes,
          businessId,
          recurringExpenseId: recurring.id,
        },
      });
    });
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : "Error al registrar el pago" };
  }

  revalidate();
  return { success: true };
}

// Omite el pago de este periodo: no crea egreso, solo mueve la próxima fecha.
export async function skipRecurringPayment(id: string, dueDate: string) {
  const { businessId } = await requireBusiness([UserRole.ADMIN]);
  const parsedId = idSchema.safeParse(id);
  const parsedDue = isoDate.safeParse(dueDate);
  if (!parsedId.success || !parsedDue.success) return { error: "Egreso fijo no encontrado" };

  try {
    await prisma.$transaction(async (tx) => {
      const recurring = await tx.recurringExpense.findFirst({
        where: { id: parsedId.data, businessId, isActive: true },
      });
      if (!recurring) throw new Error("Egreso fijo no encontrado o inactivo");
      await advanceOnce(tx, recurring, parsedDue.data);
    });
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : "Error al omitir el pago" };
  }

  revalidate();
  return { success: true };
}
