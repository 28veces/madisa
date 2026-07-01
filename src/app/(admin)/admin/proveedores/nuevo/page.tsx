import SupplierForm from "@/components/admin/SupplierForm";

export default function NewSupplierPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Nuevo proveedor</h1>
        <p className="text-gray-500 text-sm mt-1">Registra un nuevo proveedor en el sistema</p>
      </div>
      <SupplierForm />
    </div>
  );
}
