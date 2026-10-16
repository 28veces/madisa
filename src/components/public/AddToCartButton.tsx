"use client";

import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cartStore";
import { MAX_ORDER_QUANTITY } from "@/lib/utils";
import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

interface AddToCartButtonProps {
  productId: string;
  productName: string;
  price: number;
  category?: string;
  technique?: string;
  material?: string;
  availableStock?: number;
  allowBackorder?: boolean;
}

export default function AddToCartButton({
  productId,
  productName,
  price,
  category = "OTRO",
  technique = "OTRO",
  material = "",
  availableStock,
  allowBackorder = false,
}: AddToCartButtonProps) {
  const addItem = useCartStore((s) => s.addItem);
  const cartItems = useCartStore((s) => s.items);
  const [loading, setLoading] = useState(false);

  const inCart = cartItems.find((i) => i.productId === productId)?.quantity ?? 0;
  // Bajo pedido: el límite es el tope por artículo, no el stock (US-64)
  const limit = availableStock == null ? undefined : allowBackorder ? MAX_ORDER_QUANTITY : availableStock;
  const outOfStock = !allowBackorder && availableStock != null && availableStock <= 0;
  const atLimit = limit != null && inCart >= limit;

  const handleAddToCart = async () => {
    if (outOfStock || atLimit) {
      toast.error(outOfStock ? "Este producto no tiene stock" : "Ya tienes el máximo disponible en tu carrito");
      return;
    }

    setLoading(true);
    try {
      addItem({
        productId,
        name: productName,
        unitPrice: price,
        category,
        technique,
        material,
        customization: "",
        quantity: 1,
        imageUrl: "",
        maxStock: limit,
        availableStock,
        allowBackorder,
      });
      toast.success("Producto agregado al carrito");
    } catch {
      toast.error("Error al agregar al carrito");
    } finally {
      setLoading(false);
    }
  };

  const isDisabled = loading || outOfStock || atLimit;

  return (
    <Button
      onClick={handleAddToCart}
      disabled={isDisabled}
      className="w-full text-white"
      style={{ background: isDisabled ? "#ccc" : "var(--color-teal)" }}
    >
      <ShoppingCart className="h-4 w-4 mr-2" />
      {outOfStock ? "Sin stock" : atLimit ? "Límite alcanzado" : "Agregar al carrito"}
    </Button>
  );
}
