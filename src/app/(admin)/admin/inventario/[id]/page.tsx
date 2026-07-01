export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { getProduct } from "@/actions/products";
import ProductForm from "@/components/admin/ProductForm";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditarProductoPage({ params }: Props) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Editar producto</h1>
        <p className="text-gray-500 text-sm mt-1">{product.name}</p>
      </div>
      <ProductForm
        product={{
          id: product.id,
          name: product.name,
          description: product.description ?? undefined,
          category: product.category,
          material: product.material,
          technique: product.technique,
          basePrice: Number(product.basePrice),
          imageUrl: product.imageUrl ?? undefined,
          isActive: product.isActive,
        }}
      />
    </div>
  );
}
