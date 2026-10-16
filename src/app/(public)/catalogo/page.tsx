export const dynamic = "force-dynamic";

import { Suspense } from "react";
import Link from "next/link";
import { SearchX, X } from "lucide-react";
import { getPublicProducts } from "@/actions/products";
import { availableStock } from "@/lib/stock";
import { Category } from "@prisma/client";
import ProductCard from "@/components/public/ProductCard";
import CategoryFilter from "@/components/public/CategoryFilter";
import { publicCategories } from "@/components/public/categories";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  searchParams: Promise<{ categoria?: string; q?: string }>;
}

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="space-y-3 rounded-3xl bg-white p-3">
          <Skeleton className="aspect-square rounded-2xl bg-lavender-deep" />
          <Skeleton className="h-4 w-3/4 bg-lavender-deep" />
          <Skeleton className="h-4 w-1/2 bg-lavender-deep" />
        </div>
      ))}
    </div>
  );
}

async function ProductGrid({ category, search }: { category?: string; search?: string }) {
  const products = await getPublicProducts(category as Category | undefined, search).catch(() => []);

  if (products.length === 0 && search) {
    return (
      <div className="text-center py-16 px-4 rounded-3xl bg-white ring-1 ring-lavender-deep">
        <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-lavender text-violet-deep mb-4">
          <SearchX className="h-8 w-8" />
        </span>
        <p className="font-bold text-lg text-ink break-words">No encontramos productos para «{search}»</p>
        <p className="text-sm text-ink/65 mt-1">Prueba con otra palabra o revisa todo lo que tenemos.</p>
        <Link
          href="/catalogo"
          className="inline-flex mt-6 h-11 items-center rounded-full bg-violet px-6 text-sm font-bold text-white hover:bg-violet-deep transition-colors"
        >
          Ver todo el catálogo
        </Link>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-16 px-4 rounded-3xl bg-white ring-1 ring-lavender-deep">
        <p className="text-4xl mb-4">🎨</p>
        <p className="font-bold text-ink">No hay artículos en esta categoría aún.</p>
        <p className="text-sm text-ink/65 mt-1">Pronto habrá nuevos productos disponibles.</p>
      </div>
    );
  }

  return (
    <>
      <p className="text-sm text-ink/65 mb-4">
        {products.length} {products.length === 1 ? "producto" : "productos"}
      </p>
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
              allowBackorder={p.allowBackorder}
            />
          );
        })}
      </div>
    </>
  );
}

export default async function CatalogoPage({ searchParams }: Props) {
  const params = await searchParams;
  const categoria = params.categoria;
  const search = params.q?.trim() || undefined;
  const categoryLabel = publicCategories.find((c) => c.value === categoria)?.label;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="relative overflow-hidden rounded-3xl bg-ink px-6 py-8 sm:px-10 sm:py-10 mb-8">
        <div className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full bg-violet/60 blur-2xl" />
        <div className="pointer-events-none absolute right-24 -bottom-20 h-40 w-40 rounded-full bg-coral/50 blur-2xl" />
        <div className="relative">
          <p className="text-sm font-semibold text-sun">Catálogo</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mt-1">
            {categoryLabel ? `${categoryLabel} para personalizar` : "Encuentra tu próximo regalo"}
          </h1>
          <p className="text-white/75 mt-2 max-w-xl">
            Explora los artículos disponibles y cuéntanos cómo quieres personalizarlos.
          </p>
        </div>
      </div>

      <div className="mb-6">
        <Suspense>
          <CategoryFilter active={categoria} />
        </Suspense>
      </div>

      {search && (
        <div className="mb-4 flex flex-wrap items-center gap-2 text-sm">
          <span className="text-ink/70">Resultados para</span>
          <span className="inline-flex max-w-full items-center gap-1 rounded-full bg-white pl-3 pr-1 py-1 font-semibold text-ink ring-1 ring-lavender-deep">
            <span className="truncate">«{search}»</span>
            <Link
              href={categoria ? `/catalogo?categoria=${encodeURIComponent(categoria)}` : "/catalogo"}
              aria-label="Quitar búsqueda"
              className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-lavender"
            >
              <X className="h-3.5 w-3.5" />
            </Link>
          </span>
        </div>
      )}

      <Suspense key={`${categoria ?? ""}|${search ?? ""}`} fallback={<ProductGridSkeleton />}>
        <ProductGrid category={categoria} search={search} />
      </Suspense>
    </div>
  );
}
