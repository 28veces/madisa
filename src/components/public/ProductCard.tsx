"use client";

import Image from "next/image";
import { ShoppingCart, ImageIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCartStore } from "@/stores/cartStore";
import { getCategoryLabel, getTechniqueLabel } from "@/lib/whatsapp";
import { formatCurrency } from "@/lib/utils";

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
}: ProductCardProps) {
  const [customization, setCustomization] = useState("");
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((s) => s.addItem);
  const cartItems = useCartStore((s) => s.items);

  const inCart = cartItems.find((i) => i.productId === id)?.quantity ?? 0;
  const remaining = availableStock != null ? availableStock - inCart : Infinity;
  const outOfStock = availableStock != null && availableStock <= 0;
  const atLimit = remaining <= 0;

  const handleAdd = () => {
    if (outOfStock || atLimit) return;
    const safeQty = availableStock != null ? Math.min(quantity, remaining) : quantity;
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
      maxStock: availableStock,
    });
    toast.success(`${name} agregado al carrito`);
    setCustomization("");
    setQuantity(1);
  };

  return (
    <Card className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow duration-300 group">
      <div className="relative aspect-square bg-gray-100 overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-300">
            <ImageIcon className="h-16 w-16" />
          </div>
        )}
        <Badge className="absolute top-2 right-2 bg-rose-600 text-white text-xs">
          {getCategoryLabel(category)}
        </Badge>
      </div>

      <CardContent className="p-4 flex-1 space-y-3">
        <div>
          <h3 className="font-semibold text-gray-900 line-clamp-1">{name}</h3>
          {description && (
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{description}</p>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5">
          <Badge variant="outline" className="text-xs">{getTechniqueLabel(technique)}</Badge>
          <Badge variant="outline" className="text-xs text-gray-500">{material}</Badge>
        </div>

        <p className="text-lg font-bold text-rose-600">{formatCurrency(basePrice)}</p>

        <div className="space-y-2">
          <div>
            <Label className="text-xs text-gray-600">Personalización</Label>
            <Input
              placeholder="Nombre, texto, fecha..."
              value={customization}
              onChange={(e) => setCustomization(e.target.value)}
              className="h-8 text-sm mt-1"
            />
          </div>
          <div>
            <Label className="text-xs text-gray-600">
              Cantidad
              {availableStock != null && (
                <span className="ml-1 text-gray-400">
                  ({remaining > 0 ? `${remaining} disponibles` : "sin stock"})
                </span>
              )}
            </Label>
            <Input
              type="number"
              min={1}
              max={availableStock != null ? remaining : undefined}
              value={quantity}
              onChange={(e) => {
                const val = Math.max(1, parseInt(e.target.value) || 1);
                setQuantity(availableStock != null ? Math.min(val, remaining) : val);
              }}
              disabled={outOfStock || atLimit}
              className="h-8 text-sm mt-1 w-24"
            />
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button
          onClick={handleAdd}
          disabled={outOfStock || atLimit}
          className="w-full text-white"
          style={{ background: outOfStock || atLimit ? "#ccc" : "var(--color-teal)" }}
          size="sm"
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          {outOfStock ? "Sin stock" : atLimit ? "Límite alcanzado" : "Agregar al carrito"}
        </Button>
      </CardFooter>
    </Card>
  );
}
