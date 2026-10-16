"use client";

import Link from "next/link";
import { ShoppingCart, ImageIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCartStore } from "@/stores/cartStore";
import CoverImage from "@/components/public/CoverImage";
import { getCategoryLabel, getTechniqueLabel } from "@/lib/whatsapp";
import { formatCurrency, parseNumberField, type NumberField, DEFAULT_BACKORDER_LIMIT, orderLimit } from "@/lib/utils";

interface ProductCardProps {
  id: string;
  name: string;
  description?: string | null;
  category: string;
  technique: string;
  material: string;
  basePrice: number;
  imageUrl?: string | null;
  availableStock?: number;
  allowBackorder?: boolean;
  backorderLimit?: number;
}

export default function ProductCard({
  id,
  name,
  description,
  category,
  technique,
  material,
  basePrice,
  imageUrl,
  availableStock,
  allowBackorder = false,
  backorderLimit = DEFAULT_BACKORDER_LIMIT,
}: ProductCardProps) {
  const [customization, setCustomization] = useState("");
  const [quantity, setQuantity] = useState<NumberField>(1);
  const addItem = useCartStore((s) => s.addItem);
  const cartItems = useCartStore((s) => s.items);

  const inCart = cartItems.find((i) => i.productId === id)?.quantity ?? 0;
  // Bajo pedido: el límite es el stock más el tope de unidades sin stock (US-64, US-67)
  const limit = orderLimit(availableStock, allowBackorder, backorderLimit);
  const remaining = limit != null ? limit - inCart : Infinity;
  const outOfStock = !allowBackorder && availableStock != null && availableStock <= 0;
  const atLimit = remaining <= 0;

  const handleAdd = () => {
    if (outOfStock || atLimit) return;
    const qty = quantity === "" ? 1 : quantity;
    const safeQty = limit != null ? Math.min(qty, remaining) : qty;
    addItem({
      productId: id,
      name,
      category,
      technique,
      material,
      unitPrice: basePrice,
      quantity: safeQty,
      customization,
      imageUrl: imageUrl ?? undefined,
      maxStock: limit,
      availableStock,
      allowBackorder,
      backorderLimit,
    });
    toast.success(`${name} agregado al carrito`);
    setCustomization("");
    setQuantity(1);
  };

  const detailHref = `/catalogo/${encodeURIComponent(id)}`;
  const disabled = outOfStock || atLimit;

  return (
    <div className="group flex flex-col rounded-3xl bg-white p-3 shadow-sm ring-1 ring-lavender-deep transition-shadow duration-300 hover:shadow-xl hover:shadow-violet/10">
      <Link href={detailHref} className="relative block aspect-square overflow-hidden rounded-2xl bg-lavender">
        {(() => {
          const placeholder = (
            <div className="flex items-center justify-center h-full text-violet/40">
              <ImageIcon className="h-16 w-16" />
            </div>
          );
          if (!imageUrl) return placeholder;
          return (
            <CoverImage
              src={imageUrl}
              alt={name}
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              fallback={placeholder}
            />
          );
        })()}
        <span className="absolute top-3 left-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-ink backdrop-blur">
          {getCategoryLabel(category)}
        </span>
        {allowBackorder && (
          <span className="absolute top-3 right-3 rounded-full bg-sun px-3 py-1 text-xs font-semibold text-ink">
            Bajo pedido
          </span>
        )}
      </Link>

      <div className="flex-1 space-y-3 px-1 pt-4">
        <div className="flex items-start justify-between gap-3">
          <Link href={detailHref} className="min-w-0">
            <h3 className="font-bold text-ink line-clamp-1 hover:text-violet-deep">{name}</h3>
          </Link>
          <p className="shrink-0 text-lg font-extrabold text-ink">{formatCurrency(basePrice)}</p>
        </div>
        {description && (
          <p className="text-xs text-ink/65 line-clamp-2 -mt-1">{description}</p>
        )}

        <div className="flex flex-wrap gap-1.5">
          <span className="rounded-full bg-lavender px-2.5 py-0.5 text-xs font-medium text-violet-deep">{getTechniqueLabel(technique)}</span>
          {material && <span className="rounded-full bg-lavender px-2.5 py-0.5 text-xs font-medium text-ink/70">{material}</span>}
        </div>

        <div className="space-y-2">
          <div>
            <Label className="text-xs text-ink/70">Personalización</Label>
            <Input
              placeholder="Nombre, texto, fecha..."
              value={customization}
              onChange={(e) => setCustomization(e.target.value)}
              className="h-9 text-sm mt-1 rounded-xl border-lavender-deep focus-visible:ring-violet/30"
            />
          </div>
          <div>
            <Label className="text-xs text-ink/70">
              Cantidad
              {availableStock != null && (
                <span className="ml-1 text-ink/70">
                  ({allowBackorder
                    ? availableStock > 0
                      ? `${availableStock} disponibles · hasta ${backorderLimit} más bajo pedido`
                      : `hasta ${backorderLimit} bajo pedido`
                    : remaining > 0
                      ? `${remaining} disponibles`
                      : "sin stock"})
                </span>
              )}
            </Label>
            <Input
              type="number"
              min={1}
              max={limit != null ? remaining : undefined}
              value={quantity}
              onChange={(e) => {
                const parsed = parseNumberField(e.target.value);
                // Vacío se permite mientras se escribe; al salir del campo vuelve a 1
                if (parsed === "") return setQuantity("");
                const val = Math.max(1, Math.floor(parsed));
                setQuantity(limit != null ? Math.min(val, remaining) : val);
              }}
              onBlur={() => setQuantity((q) => (q === "" ? 1 : q))}
              disabled={disabled}
              className="h-9 text-sm mt-1 w-24 rounded-xl border-lavender-deep focus-visible:ring-violet/30"
            />
          </div>
        </div>
      </div>

      <div className="px-1 pt-4 pb-1">
        <button
          type="button"
          onClick={handleAdd}
          disabled={disabled}
          className="flex h-10 w-full items-center justify-center gap-2 rounded-full border-2 border-ink text-sm font-bold text-ink transition-colors hover:bg-ink hover:text-white disabled:cursor-not-allowed disabled:border-ink/20 disabled:text-ink/40 disabled:hover:bg-transparent"
        >
          <ShoppingCart className="h-4 w-4" />
          {outOfStock ? "Sin stock" : atLimit ? "Límite alcanzado" : "Agregar al carrito"}
        </button>
      </div>
    </div>
  );
}
