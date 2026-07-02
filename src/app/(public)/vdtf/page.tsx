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
        <div key={i} className="space-y-3">
          <Skeleton className="aspect-square rounded-xl" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  );
}

async function ProductGrid() {
  const allProducts = await getProducts(undefined, true).catch(() => []);
  const products = allProducts.filter(p => p.technique === "VDTF");

  if (products.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500">
        <p className="text-4xl mb-4">🥤</p>
        <p className="font-medium">No hay artículos VDTF disponibles.</p>
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

export default function VDTFPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center gap-2 text-sm mb-4" style={{ color: "var(--color-teal)" }}>
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Link>
        <h1 className="text-3xl font-bold" style={{ color: "var(--color-dark)" }}>
          VDTF
        </h1>
        <p className="text-gray-500 mt-2">
          Impresión versátil en tazas, vasos y más con detalle y durabilidad
        </p>
      </div>

      <Suspense fallback={<ProductGridSkeleton />}>
        <ProductGrid />
      </Suspense>
    </div>
  );
}
