"use client";

import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cartStore";
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
}

export default function AddToCartButton({
  productId,
  productName,
  price,
  category = "OTRO",
  technique = "OTRO",
  material = "",
  availableStock,
}: AddToCartButtonProps) {
  const addItem = useCartStore((s) => s.addItem);
  const cartItems = useCartStore((s) => s.items);
  const [loading, setLoading] = useState(false);

  const inCart = cartItems.find((i) => i.productId === productId)?.quantity ?? 0;
  const outOfStock = availableStock != null && availableStock <= 0;
  const atLimit = availableStock != null && inCart >= availableStock;

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
        maxStock: availableStock,
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
