export const dynamic = "force-dynamic";

import { getPublicProduct } from "@/actions/products";
import { availableStock } from "@/lib/stock";
import Link from "next/link";
import { ArrowLeft, ImageIcon, MessageCircle, Truck, Sparkles } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { getCategoryLabel, getTechniqueLabel } from "@/lib/whatsapp";
import AddToCartButton from "@/components/public/AddToCartButton";
import CoverImage from "@/components/public/CoverImage";

interface Props {
  params: Promise<{ id: string }>;
}

function BackLink() {
  return (
    <Link href="/catalogo" className="inline-flex items-center gap-2 text-sm font-bold text-violet-deep hover:underline mb-6">
      <ArrowLeft className="h-4 w-4" />
      Volver al catálogo
    </Link>
  );
}

export default async function ProductDetailPage({ params }: Props) {
  // Los productos del seed usan el nombre como id (con espacios/acentos) y el
  // segmento llega codificado; decodificarlo no afecta a los ids normales (cuid).
  const id = decodeURIComponent((await params).id);
  const product = await getPublicProduct(id).catch(() => null);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <BackLink />
        <div className="text-center py-16 rounded-3xl bg-white ring-1 ring-lavender-deep">
          <p className="text-4xl mb-3">🔎</p>
          <p className="font-bold text-ink">Producto no encontrado</p>
        </div>
      </div>
    );
  }

  const displayImageUrl = product.imageUrl ?? product.inventoryItem?.imageUrl;
  const stock = product.inventoryItem ? availableStock(product.inventoryItem) : undefined;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <BackLink />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-14 rounded-[2rem] bg-white p-4 sm:p-8 ring-1 ring-lavender-deep">
        {/* Imagen */}
        <div className="relative flex items-center justify-center overflow-hidden rounded-3xl bg-lavender aspect-square">
          {(() => {
            const placeholder = (
              <div className="flex flex-col items-center gap-2 text-violet/50">
                <ImageIcon className="h-20 w-20" />
                <p className="text-sm font-medium text-ink/70">Sin imagen</p>
              </div>
            );
            if (!displayImageUrl) return placeholder;
            return (
              <CoverImage
                src={displayImageUrl}
                alt={product.name}
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover"
                fallback={placeholder}
              />
            );
          })()}
        </div>

        {/* Información */}
        <div className="flex flex-col gap-6 md:py-4">
          <div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-lavender px-3 py-1 text-xs font-bold text-violet-deep">
                {getTechniqueLabel(product.technique)}
              </span>
              <span className="rounded-full bg-lavender px-3 py-1 text-xs font-bold text-ink/75">
                {getCategoryLabel(product.category)}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-ink mt-4">{product.name}</h1>
            {product.description && (
              <p className="text-ink/70 mt-3 leading-relaxed">{product.description}</p>
            )}
          </div>

          <div className="border-y border-lavender-deep py-5">
            <p className="text-sm text-ink/70 mb-1">Precio base</p>
            <p className="text-4xl font-extrabold text-ink">{formatCurrency(Number(product.basePrice))}</p>
          </div>

          <dl className="space-y-3 text-sm">
            {product.material && (
              <div className="flex justify-between gap-4">
                <dt className="text-ink/65">Material</dt>
                <dd className="font-semibold text-ink text-right">{product.material}</dd>
              </div>
            )}
            {stock != null && (
              <div className="flex justify-between gap-4">
                <dt className="text-ink/65">Disponibilidad</dt>
                <dd className={`font-semibold text-right ${stock > 0 ? "text-green-700" : product.allowBackorder ? "text-amber-700" : "text-red-700"}`}>
                  {stock > 0
                    ? product.allowBackorder ? `${stock} disponibles · hasta ${product.backorderLimit} más bajo pedido` : "Disponible"
                    : product.allowBackorder ? `Bajo pedido (hasta ${product.backorderLimit})` : "Sin stock"}
                </dd>
              </div>
            )}
          </dl>

          <div className="space-y-3">
            <AddToCartButton
              productId={product.id}
              productName={product.name}
              price={Number(product.basePrice)}
              category={product.category}
              technique={product.technique}
              material={product.material || ""}
              availableStock={stock}
              allowBackorder={product.allowBackorder}
              backorderLimit={product.backorderLimit}
            />
            <a
              href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "50760000000"}?text=${encodeURIComponent(`Hola! Quiero hacer un pedido de: ${product.name}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-12 w-full items-center justify-center gap-2 rounded-full border-2 border-ink text-base font-bold text-ink transition-colors hover:bg-ink hover:text-white"
            >
              <MessageCircle className="h-5 w-5" />
              Consultar por WhatsApp
            </a>
          </div>

          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <li className="flex items-center gap-2 rounded-2xl bg-lavender p-3 text-ink/80">
              <Truck className="h-5 w-5 shrink-0 text-violet-deep" /> Envíos en todo Panamá
            </li>
            <li className="flex items-center gap-2 rounded-2xl bg-lavender p-3 text-ink/80">
              <Sparkles className="h-5 w-5 shrink-0 text-violet-deep" /> Personalizado a tu gusto
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
