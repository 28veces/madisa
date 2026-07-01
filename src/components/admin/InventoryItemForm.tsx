"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Supplier } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createInventoryItem, updateInventoryItem } from "@/actions/inventory-items";

interface FormValues {
  description: string;
  category: string;
  note: string;
}

interface Props {
  item?: {
    id?: string;
    code?: string;
    description?: string;
    category?: string;
    note?: string;
    suppliers?: Array<{ supplier: Supplier }>;
  };
  suppliers: Supplier[];
}

export default function InventoryItemForm({ item, suppliers }: Props) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      description: item?.description ?? "",
      category: item?.category ?? "",
      note: item?.note ?? "",
    },
  });

  const selectedSuppliers = new Set(item?.suppliers?.map((s) => s.supplier.id) ?? []);

  const validate = (values: FormValues) => {
    const errs: Partial<Record<keyof FormValues, { message: string }>> = {};
    if (!values.description.trim()) errs.description = { message: "Descripción requerida" };
    if (!values.category) errs.category = { message: "Categoría requerida" };
    return errs;
  };

  const onSubmit = async (values: FormValues) => {
    const validationErrors = validate(values);
    if (Object.keys(validationErrors).length > 0) {
      toast.error("Completa los campos requeridos");
      return;
    }

    const fd = new FormData();
    fd.append("description", values.description);
    fd.append("category", values.category);
    fd.append("note", values.note);

    const checkedSuppliers = Array.from(
      document.querySelectorAll('input[name="supplier"]:checked')
    ).map((el: any) => el.value);

    checkedSuppliers.forEach((supplierId) => {
      fd.append("supplierIds", supplierId);
    });

    const result = item?.id
      ? await updateInventoryItem(item.id, fd)
      : await createInventoryItem(fd);

    if (result.error) {
      toast.error("Error al guardar");
      return;
    }
    toast.success(item?.id ? "Artículo actualizado" : "Artículo creado");
    router.push("/admin/articulos");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-w-2xl">
      <div className="grid grid-cols-1 gap-4">
        {item?.code && (
          <div>
            <Label>Código</Label>
            <Input value={item.code} disabled className="mt-1 bg-gray-100" />
          </div>
        )}

        <div>
          <Label htmlFor="description">Descripción *</Label>
          <Input id="description" {...register("description")} className="mt-1" />
          {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>}
        </div>

        <div>
          <Label>Categoría *</Label>
          <Select value={watch("category")} onValueChange={(v) => v && setValue("category", v)}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Seleccionar..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="SUBLIMABLE">Sublimable</SelectItem>
              <SelectItem value="NO_SUBLIMABLE">No Sublimable</SelectItem>
              <SelectItem value="INSUMO">Insumo</SelectItem>
              <SelectItem value="OTROS">Otros</SelectItem>
            </SelectContent>
          </Select>
          {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category.message}</p>}
        </div>

        <div>
          <Label htmlFor="note">Nota</Label>
          <Input id="note" {...register("note")} className="mt-1" />
        </div>

        <div>
          <Label>Proveedores</Label>
          <div className="mt-2 space-y-2 border rounded-lg p-3 bg-gray-50">
            {suppliers.length === 0 ? (
              <p className="text-sm text-gray-500">No hay proveedores disponibles</p>
            ) : (
              suppliers.map((supplier) => (
                <div key={supplier.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`supplier-${supplier.id}`}
                    name="supplier"
                    value={supplier.id}
                    defaultChecked={selectedSuppliers.has(supplier.id)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <label
                    htmlFor={`supplier-${supplier.id}`}
                    className="text-sm cursor-pointer"
                  >
                    {supplier.name}
                  </label>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={isSubmitting} className="bg-rose-600 hover:bg-rose-700">
          {isSubmitting ? "Guardando..." : item?.id ? "Actualizar" : "Crear artículo"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
