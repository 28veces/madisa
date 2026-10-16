// Frecuencias de los egresos fijos y cálculo de la próxima fecha de pago.

export const RECURRENCE_FREQUENCIES = [
  { value: "MONTHLY", label: "Mensual", months: 1 },
  { value: "QUARTERLY", label: "Cada 3 meses", months: 3 },
  { value: "SEMIANNUAL", label: "Cada 6 meses", months: 6 },
  { value: "ANNUAL", label: "Anual", months: 12 },
] as const;

export type RecurrenceFrequencyValue = (typeof RECURRENCE_FREQUENCIES)[number]["value"];

export function frequencyLabel(value: string) {
  return RECURRENCE_FREQUENCIES.find((f) => f.value === value)?.label ?? value;
}

// Las fechas de pago se guardan como medianoche UTC del día elegido (AAAA-MM-DD).
// Se avanza en meses calendario; si el día no existe (31 en febrero), se usa el último del mes.
export function advanceDueDate(date: Date, frequency: string) {
  const months = RECURRENCE_FREQUENCIES.find((f) => f.value === frequency)?.months ?? 1;
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth() + months;
  const lastDay = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  return new Date(Date.UTC(y, m, Math.min(date.getUTCDate(), lastDay)));
}

// "Hoy" en la zona del negocio (Panamá), como AAAA-MM-DD, para no avisar antes de tiempo
// cuando el servidor corre en UTC.
export function todayISO() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Panama" }).format(new Date());
}

export function isDue(nextDueDate: Date) {
  return nextDueDate.toISOString().slice(0, 10) <= todayISO();
}
