export const dynamic = "force-dynamic";

import { getPublicProduct } from "@/actions/products";
import { availableStock } from "@/lib/stock";
import { useCartStore } from "@/stores/cartStore";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import AddToCartButton from "@/components/public/AddToCartButton";

const techniqueLabels: Record<string, string> = {
  SUBLIMACION: "Sublimación",
  PINTADO_A_MANO: "Pintura a mano",
  VINIL: "Vinil",
  BORDADO: "Bordado",
  GRABADO: "Grabado",
  DTF: "DTF",
  VDTF: "VDTF",
  OTRO: "Otro",
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;
  const product = await getPublicProduct(id).catch(() => null);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link href="/catalogo" className="inline-flex items-center gap-2 text-sm mb-4" style={{ color: "var(--color-teal)" }}>
          <ArrowLeft className="h-4 w-4" />
          Volver al catálogo
        </Link>
        <div className="text-center py-16">
          <p className="text-gray-500">Producto no encontrado</p>
        </div>
      </div>
    );
  }

  const displayImageUrl = product.imageUrl ?? product.inventoryItem?.imageUrl;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/catalogo" className="inline-flex items-center gap-2 text-sm mb-8" style={{ color: "var(--color-teal)" }}>
        <ArrowLeft className="h-4 w-4" />
        Volver al catálogo
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Imagen */}
        <div className="flex items-center justify-center bg-gray-100 rounded-2xl aspect-square">
          {displayImageUrl ? (
            <img
              src={displayImageUrl}
              alt={product.name}
              className="w-full h-full object-cover rounded-2xl"
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-gray-400">
              <div className="text-6xl">📦</div>
              <p className="text-sm">Sin imagen</p>
            </div>
          )}
        </div>

        {/* Información */}
        <div className="space-y-6">
          <div>
            <Badge style={{ background: "rgba(13, 148, 136, 0.1)", color: "var(--color-teal)" }}>
              {techniqueLabels[product.technique] || product.technique}
            </Badge>
            <h1 className="text-3xl font-bold mt-3" style={{ color: "var(--color-dark)" }}>
              {product.name}
            </h1>
            {product.description && (
              <p className="text-gray-600 mt-2">{product.description}</p>
            )}
          </div>

          {/* Precio */}
          <div className="border-t border-b py-4">
            <p className="text-sm text-gray-500 mb-1">Precio base</p>
            <p className="text-4xl font-bold" style={{ color: "var(--color-teal)" }}>
              {formatCurrency(Number(product.basePrice))}
            </p>
          </div>

          {/* Detalles */}
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Categoría:</span>
              <span className="font-medium text-gray-900">{product.category}</span>
            </div>
            {product.material && (
              <div className="flex justify-between">
                <span className="text-gray-600">Material:</span>
                <span className="font-medium text-gray-900">{product.material}</span>
              </div>
            )}
            {product.inventoryItem && (() => {
              const stock = availableStock(product.inventoryItem);
              return (
                <div className="flex justify-between">
                  <span className="text-gray-600">Disponibilidad:</span>
                  <span className={`font-medium ${stock > 0 ? "text-green-600" : "text-red-600"}`}>
                    {stock > 0 ? "Disponible" : "Sin stock"}
                  </span>
                </div>
              );
            })()}
          </div>

          {/* CTA */}
          <div className="space-y-3 pt-4">
            <AddToCartButton
              productId={product.id}
              productName={product.name}
              price={Number(product.basePrice)}
              category={product.category}
              technique={product.technique}
              material={product.material || ""}
              availableStock={
                product.inventoryItem
                  ? availableStock(product.inventoryItem)
                  : undefined
              }
            />
            <a
              href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "50760000000"}?text=${encodeURIComponent(`Hola! Quiero hacer un pedido de: ${product.name}`)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" className="w-full border-gray-300">
                Consultar por WhatsApp
              </Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
