import ProductForm from "@/components/admin/ProductForm";

export default function NuevoProductoPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Nuevo producto</h1>
        <p className="text-gray-500 text-sm mt-1">Agrega un nuevo artículo al catálogo</p>
      </div>
      <ProductForm />
    </div>
  );
}
