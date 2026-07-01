import { notFound } from "next/navigation";
import SupplierForm from "@/components/admin/SupplierForm";
import { getSupplier } from "@/actions/suppliers";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditSupplierPage({ params }: Props) {
  const { id } = await params;
  const supplier = await getSupplier(id);

  if (!supplier) {
    notFound();
  }

  const supplierData = {
    ...supplier,
    phone: supplier.phone || undefined,
    email: supplier.email || undefined,
    address: supplier.address || undefined,
    branch: supplier.branch || undefined,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Editar proveedor</h1>
        <p className="text-gray-500 text-sm mt-1">Actualiza la información del proveedor</p>
      </div>
      <SupplierForm supplier={supplierData} />
    </div>
  );
}
