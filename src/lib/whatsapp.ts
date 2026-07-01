export interface CartItemForWhatsApp {
  name: string;
  quantity: number;
  technique: string;
  customization?: string;
  unitPrice: number;
}

export function buildWhatsAppUrl(items: CartItemForWhatsApp[]): string {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "50760000000";

  const lines = items.map(
    (item) =>
      `• ${item.quantity}x ${item.name} (${item.technique})` +
      (item.customization ? ` — "${item.customization}"` : "") +
      ` — $${(item.quantity * item.unitPrice).toFixed(2)}`
  );

  const total = items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);

  const message = [
    "Hola! Quiero solicitar una cotización para los siguientes artículos:",
    "",
    ...lines,
    "",
    `Total estimado: $${total.toFixed(2)}`,
    "",
    "¿Podrías confirmarme disponibilidad y tiempo de entrega? Gracias!",
  ].join("\n");

  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    PLATOS: "Platos",
    VASOS: "Vasos",
    TAZAS: "Tazas",
    SWEATERS: "Sweaters",
    PLACAS: "Placas",
    LAPIDAS: "Lápidas",
    OTROS: "Otros",
  };
  return labels[category] ?? category;
}

export function getTechniqueLabel(technique: string): string {
  const labels: Record<string, string> = {
    SUBLIMACION: "Sublimación",
    PINTADO_A_MANO: "Pintado a mano",
    VINIL: "Vinil",
    BORDADO: "Bordado",
    GRABADO: "Grabado",
    OTRO: "Otro",
  };
  return labels[technique] ?? technique;
}
