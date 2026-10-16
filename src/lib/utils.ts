import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("es-PA", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(num);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("es-PA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(d);
}

// Valor de un campo numérico de formulario: "" mientras el usuario lo deja vacío,
// para que pueda borrar el 0 o el 1 por defecto y escribir otro número.
export type NumberField = number | "";

export function parseNumberField(value: string): NumberField {
  if (value.trim() === "") return "";
  const n = Number(value);
  return Number.isFinite(n) ? n : "";
}

// Para totales en pantalla: un campo vacío cuenta como 0.
export function toNumber(value: NumberField): number {
  return value === "" ? 0 : value;
}

// El optimizador de imágenes solo acepta Vercel Blob y rutas locales (ver next.config.ts).
// Una imagen de otro host (URL escrita a mano en un producto) se muestra sin optimizar.
export function isOptimizableImage(src: string) {
  if (src.startsWith("/")) return true;
  try {
    return new URL(src).hostname.endsWith(".public.blob.vercel-storage.com");
  } catch {
    return false;
  }
}

// Tope de unidades por artículo en un pedido del sitio público (US-53); también es el
// límite del carrito para productos bajo pedido, que no se limitan al stock (US-64).
export const MAX_ORDER_QUANTITY = 100;
