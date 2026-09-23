export const ADJUSTMENT_REASONS = [
  { value: "CONSUMPTION", label: "Consumo en producción" },
  { value: "DAMAGE", label: "Merma / daño" },
  { value: "COUNT_ADJUSTMENT", label: "Ajuste por conteo físico" },
] as const;

export type AdjustmentReasonValue = (typeof ADJUSTMENT_REASONS)[number]["value"];

export function adjustmentReasonLabel(value: string) {
  return ADJUSTMENT_REASONS.find((r) => r.value === value)?.label ?? value;
}
