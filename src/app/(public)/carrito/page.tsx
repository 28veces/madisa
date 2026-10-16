"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Trash2, ShoppingBag, MessageCircle, ImageIcon, Plus, Minus, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cartStore";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { formatCurrency, cn, isOptimizableImage } from "@/lib/utils";
import { useState } from "react";
import { createPublicOrder } from "@/actions/public-orders";
import { toast } from "sonner";

export default function CarritoPage() {
  const { items, removeItem, updateQuantity, clearCart, totalPrice } = useCartStore();
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const router = useRouter();

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <span className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-white text-violet-deep ring-1 ring-lavender-deep mb-5">
          <ShoppingBag className="h-9 w-9" />
        </span>
        <h1 className="text-2xl font-extrabold text-ink mb-2">Tu carrito está vacío</h1>
        <p className="text-ink/65 mb-6">Explora el catálogo y agrega artículos para cotizar.</p>
        <Link href="/catalogo">
          <Button className="h-11 rounded-full bg-violet px-6 font-bold text-white hover:bg-violet-deep">Ir al catálogo</Button>
        </Link>
      </div>
    );
  }

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!clientName.trim()) {
      toast.error("Por favor ingresa tu nombre");
      return;
    }

    if (!clientPhone.trim()) {
      toast.error("Por favor ingresa tu teléfono");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createPublicOrder({
        clientName,
        clientPhone,
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          customization: item.customization || undefined,
        })),
        notes: "Pedido desde el sitio web",
      });

      if (result.success) {
        toast.success(result.message);
        // El total lo calcula el servidor con los precios actuales; el carrito guardado puede tener precios viejos.
        if (result.totalAmount !== undefined && Math.abs(result.totalAmount - totalPrice()) >= 0.01) {
          toast.info(`Los precios cambiaron desde que agregaste los artículos. Total del pedido: ${formatCurrency(result.totalAmount)}`);
        }
        clearCart();
        setClientName("");
        setClientPhone("");
        setShowForm(false);
        // Redirigir después de 2 segundos
        setTimeout(() => {
          router.push("/catalogo");
        }, 2000);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Error al enviar el pedido. Intenta nuevamente.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const whatsappUrl = buildWhatsAppUrl(
    items.map((i) => ({
      name: i.name,
      quantity: i.quantity,
      technique: i.technique,
      customization: i.customization,
      unitPrice: i.unitPrice,
    }))
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-extrabold text-ink">Mi carrito</h1>
        <button
          onClick={clearCart}
          className="text-sm font-semibold text-red-700 hover:text-red-800 transition-colors"
        >
          Vaciar carrito
        </button>
      </div>

      <div className="space-y-4 mb-8">
        {items.map((item) => (
          <div
            key={item.productId}
            className="flex gap-4 p-3 sm:p-4 bg-white rounded-3xl ring-1 ring-lavender-deep shadow-sm"
          >
            <div className="relative w-20 h-20 flex-shrink-0 bg-lavender rounded-2xl overflow-hidden">
              {item.imageUrl ? (
                <Image src={item.imageUrl} alt={item.name} fill unoptimized={!isOptimizableImage(item.imageUrl)} className="object-cover" />
              ) : (
                <div className="flex items-center justify-center h-full text-violet/40">
                  <ImageIcon className="h-8 w-8" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-ink truncate">{item.name}</h3>
              <p className="text-sm text-ink/65">{item.technique} · {item.material}</p>
              {item.customization && (
                <p className="text-xs text-violet-deep mt-0.5 italic">
                  &ldquo;{item.customization}&rdquo;
                </p>
              )}
              <p className="text-sm font-medium text-ink/80 mt-1">
                {formatCurrency(item.unitPrice)} c/u
              </p>
              {item.allowBackorder && item.availableStock != null && item.quantity > Math.max(item.availableStock, 0) && (
                <p className="text-xs text-amber-700 bg-amber-50 rounded-md px-2 py-1 mt-1">
                  {item.availableStock > 0
                    ? `Hay ${item.availableStock} disponibles; las otras ${item.quantity - item.availableStock} se consiguen bajo pedido y pueden tardar más.`
                    : `Este producto se consigue bajo pedido; puede tardar más.`}
                </p>
              )}
            </div>

            <div className="flex flex-col items-end gap-2">
              <button
                onClick={() => removeItem(item.productId)}
                aria-label={`Quitar ${item.name}`}
                className="text-ink/70 hover:text-red-600 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                  aria-label="Quitar uno"
                  className="w-7 h-7 rounded-full bg-lavender text-ink flex items-center justify-center hover:bg-lavender-deep transition-colors"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span className="text-sm font-bold text-ink w-6 text-center">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                  disabled={item.maxStock != null && item.quantity >= item.maxStock}
                  aria-label="Agregar uno"
                  className="w-7 h-7 rounded-full bg-lavender text-ink flex items-center justify-center hover:bg-lavender-deep transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
              <p className="text-sm font-extrabold text-ink">
                {formatCurrency(item.quantity * item.unitPrice)}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-3xl ring-1 ring-lavender-deep p-5 space-y-3">
        <div className="flex justify-between text-sm text-ink/70">
          <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} artículos)</span>
          <span>{formatCurrency(totalPrice())}</span>
        </div>
        <div className="flex justify-between font-bold text-ink border-t border-lavender-deep pt-3">
          <span>Total estimado</span>
          <span className="text-violet-deep text-xl font-extrabold">{formatCurrency(totalPrice())}</span>
        </div>
        <p className="text-xs text-ink/70">
          * El precio final puede variar según la complejidad del diseño.
        </p>
      </div>

      {!showForm ? (
        <div className="mt-6 space-y-3">
          <Button
            onClick={() => setShowForm(true)}
            size="lg"
            className="w-full h-12 rounded-full bg-violet hover:bg-violet-deep text-white text-base font-bold shadow-lg shadow-violet/20 flex items-center justify-center gap-2"
          >
            <Send className="h-5 w-5" />
            Enviar pedido
          </Button>
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="block">
            <Button
              size="lg"
              className={cn(
                "w-full h-12 rounded-full bg-green-700 hover:bg-green-800 text-white text-base font-bold",
                "flex items-center gap-2"
              )}
            >
              <MessageCircle className="h-5 w-5" />
              O cotizar por WhatsApp
            </Button>
          </a>
          <Link href="/catalogo">
            <Button variant="outline" size="lg" className="w-full h-12 rounded-full border-2 border-ink bg-transparent text-ink font-bold hover:bg-ink hover:text-white">
              Seguir comprando
            </Button>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmitOrder} className="mt-6 p-5 bg-white rounded-3xl ring-1 ring-lavender-deep space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-ink mb-1">
              Tu nombre
            </label>
            <input
              id="name"
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Ej: Juan Pérez"
              className="w-full h-11 px-4 rounded-full bg-lavender border border-transparent text-ink focus:outline-none focus:bg-white focus:ring-2 focus:ring-violet/40 focus:border-violet"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-semibold text-ink mb-1">
              Tu teléfono
            </label>
            <input
              id="phone"
              type="tel"
              value={clientPhone}
              onChange={(e) => setClientPhone(e.target.value)}
              placeholder="Ej: +507 6000-0000"
              className="w-full h-11 px-4 rounded-full bg-lavender border border-transparent text-ink focus:outline-none focus:bg-white focus:ring-2 focus:ring-violet/40 focus:border-violet"
            />
          </div>

          <div className="space-y-2">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 rounded-full bg-violet hover:bg-violet-deep text-white font-bold"
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Confirmar pedido
                </>
              )}
            </Button>
            <Button
              type="button"
              onClick={() => setShowForm(false)}
              variant="outline"
              className="w-full h-12 rounded-full border-2 border-ink bg-transparent text-ink font-bold hover:bg-ink hover:text-white"
              size="lg"
            >
              Cancelar
            </Button>
          </div>

          <p className="text-xs text-ink/70 text-center">
            Al enviar tu pedido, nuestro equipo lo revisará y se pondrá en contacto contigo.
          </p>
        </form>
      )}
    </div>
  );
}
