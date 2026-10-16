export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { getProducts } from "@/actions/products";
import ProductCard from "@/components/public/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="space-y-3 rounded-3xl bg-white p-3">
          <Skeleton className="aspect-square rounded-2xl bg-lavender-deep" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  );
}

async function ProductGrid() {
  const allProducts = await getProducts(undefined, true).catch(() => []);
  const products = allProducts.filter(p => p.technique === "SUBLIMACION");

  if (products.length === 0) {
    return (
      <div className="text-center py-16 px-4 rounded-3xl bg-white ring-1 ring-lavender-deep text-ink/65">
        <p className="text-4xl mb-4">🖼️</p>
        <p className="font-bold text-ink">No hay artículos de sublimación disponibles.</p>
        <p className="text-sm mt-1">Pronto habrá nuevos productos disponibles.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((p) => (
        <ProductCard
          key={p.id}
          id={p.id}
          name={p.name}
          description={p.description}
          category={p.category}
          technique={p.technique}
          material={p.material}
          basePrice={Number(p.basePrice)}
          imageUrl={p.imageUrl ?? p.inventoryItem?.imageUrl}
        />
      ))}
    </div>
  );
}

export default function SublimacionPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-violet-deep hover:underline mb-4">
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Link>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-ink">
          Sublimación
        </h1>
        <p className="text-ink/70 mt-2">
          Personaliza tus artículos con nuestro servicio de sublimación de alta calidad
        </p>
      </div>

      <Suspense fallback={<ProductGridSkeleton />}>
        <ProductGrid />
      </Suspense>
    </div>
  );
}
