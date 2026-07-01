"use client";

import Link from "next/link";
import Image from "next/image";
import { Trash2, ShoppingBag, MessageCircle, ImageIcon, Plus, Minus, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cartStore";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { formatCurrency, cn } from "@/lib/utils";
import { useState } from "react";
import { createPublicOrder } from "@/actions/public-orders";
import { toast } from "sonner";

export default function CarritoPage() {
  const { items, removeItem, updateQuantity, clearCart, totalPrice } = useCartStore();
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Tu carrito está vacío</h1>
        <p className="text-gray-500 mb-6">Explora el catálogo y agrega artículos para cotizar.</p>
        <Link href="/catalogo">
          <Button className="bg-rose-600 hover:bg-rose-700">Ir al catálogo</Button>
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
          unitPrice: item.unitPrice,
          customization: item.customization,
        })),
        totalAmount: totalPrice(),
        notes: "Pedido desde el sitio web",
      });

      if (result.success) {
        toast.success(result.message);
        clearCart();
        setClientName("");
        setClientPhone("");
        setShowForm(false);
        // Redirigir después de 2 segundos
        setTimeout(() => {
          window.location.href = "/catalogo";
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
        <h1 className="text-2xl font-bold text-gray-900">Mi carrito</h1>
        <button
          onClick={clearCart}
          className="text-sm text-red-500 hover:text-red-700 transition-colors"
        >
          Vaciar carrito
        </button>
      </div>

      <div className="space-y-4 mb-8">
        {items.map((item) => (
          <div
            key={item.productId}
            className="flex gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm"
          >
            <div className="relative w-20 h-20 flex-shrink-0 bg-gray-50 rounded-xl overflow-hidden">
              {item.imageUrl ? (
                <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-300">
                  <ImageIcon className="h-8 w-8" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">{item.name}</h3>
              <p className="text-sm text-gray-500">{item.technique} · {item.material}</p>
              {item.customization && (
                <p className="text-xs text-rose-600 mt-0.5 italic">
                  &ldquo;{item.customization}&rdquo;
                </p>
              )}
              <p className="text-sm font-medium text-gray-700 mt-1">
                {formatCurrency(item.unitPrice)} c/u
              </p>
            </div>

            <div className="flex flex-col items-end gap-2">
              <button
                onClick={() => removeItem(item.productId)}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                  className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                  disabled={item.maxStock != null && item.quantity >= item.maxStock}
                  className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
              <p className="text-sm font-bold text-gray-900">
                {formatCurrency(item.quantity * item.unitPrice)}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gray-50 rounded-2xl p-5 space-y-3">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} artículos)</span>
          <span>{formatCurrency(totalPrice())}</span>
        </div>
        <div className="flex justify-between font-bold text-gray-900 border-t pt-3">
          <span>Total estimado</span>
          <span className="text-rose-600 text-lg">{formatCurrency(totalPrice())}</span>
        </div>
        <p className="text-xs text-gray-400">
          * El precio final puede variar según la complejidad del diseño.
        </p>
      </div>

      {!showForm ? (
        <div className="mt-6 space-y-3">
          <Button
            onClick={() => setShowForm(true)}
            size="lg"
            className="w-full bg-rose-600 hover:bg-rose-700 text-white text-base font-semibold shadow-lg flex items-center justify-center gap-2"
          >
            <Send className="h-5 w-5" />
            Enviar pedido
          </Button>
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="block">
            <Button
              size="lg"
              className={cn(
                "w-full bg-green-500 hover:bg-green-600 text-white text-base font-semibold shadow-lg",
                "flex items-center gap-2"
              )}
            >
              <MessageCircle className="h-5 w-5" />
              O cotizar por WhatsApp
            </Button>
          </a>
          <Link href="/catalogo">
            <Button variant="outline" size="lg" className="w-full">
              Seguir comprando
            </Button>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmitOrder} className="mt-6 p-5 bg-white rounded-2xl border border-gray-100 space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Tu nombre
            </label>
            <input
              id="name"
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Ej: Juan Pérez"
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Tu teléfono
            </label>
            <input
              id="phone"
              type="tel"
              value={clientPhone}
              onChange={(e) => setClientPhone(e.target.value)}
              placeholder="Ej: +507 6000-0000"
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            />
          </div>

          <div className="space-y-2">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-rose-600 hover:bg-rose-700 text-white font-semibold"
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
              className="w-full"
              size="lg"
            >
              Cancelar
            </Button>
          </div>

          <p className="text-xs text-gray-400 text-center">
            Al enviar tu pedido, nuestro equipo lo revisará y se pondrá en contacto contigo.
          </p>
        </form>
      )}
    </div>
  );
}
