export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { getPublicProducts } from "@/actions/products";
import { availableStock } from "@/lib/stock";
import { Category } from "@prisma/client";
import ProductCard from "@/components/public/ProductCard";
import CategoryFilter from "@/components/public/CategoryFilter";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  searchParams: Promise<{ categoria?: string }>;
}

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="aspect-square rounded-xl" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  );
}

async function ProductGrid({ category }: { category?: string }) {
  const products = await getPublicProducts(category as Category | undefined).catch(() => []);

  if (products.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500">
        <p className="text-4xl mb-4">🎨</p>
        <p className="font-medium">No hay artículos en esta categoría aún.</p>
        <p className="text-sm mt-1">Pronto habrá nuevos productos disponibles.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((p) => {
        const stock = p.inventoryItem
          ? availableStock(p.inventoryItem)
          : undefined;
        return (
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
            availableStock={stock}
          />
        );
      })}
    </div>
  );
}

export default async function CatalogoPage({ searchParams }: Props) {
  const params = await searchParams;
  const categoria = params.categoria;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Catálogo</h1>
        <p className="text-gray-500 mt-2">
          Explora todos los artículos disponibles para personalizar
        </p>
      </div>

      <div className="mb-8">
        <Suspense>
          <CategoryFilter active={categoria} />
        </Suspense>
      </div>

      <Suspense fallback={<ProductGridSkeleton />}>
        <ProductGrid category={categoria} />
      </Suspense>
    </div>
  );
}
