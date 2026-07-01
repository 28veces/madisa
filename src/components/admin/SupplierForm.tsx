"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createSupplier, updateSupplier } from "@/actions/suppliers";

interface FormValues {
  name: string;
  phone: string;
  email: string;
  address: string;
  branch: string;
}

interface Props {
  supplier?: Partial<FormValues> & { id?: string };
}

export default function SupplierForm({ supplier }: Props) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      name: supplier?.name ?? "",
      phone: supplier?.phone || "",
      email: supplier?.email || "",
      address: supplier?.address || "",
      branch: supplier?.branch || "",
    },
  });

  const validate = (values: FormValues) => {
    const errs: Partial<Record<keyof FormValues, { message: string }>> = {};
    if (!values.name.trim()) errs.name = { message: "Nombre requerido" };
    return errs;
  };

  const onSubmit = async (values: FormValues) => {
    const validationErrors = validate(values);
    if (Object.keys(validationErrors).length > 0) {
      toast.error("Completa los campos requeridos");
      return;
    }

    const fd = new FormData();
    Object.entries(values).forEach(([k, v]) => fd.append(k, String(v)));

    const result = supplier?.id
      ? await updateSupplier(supplier.id, fd)
      : await createSupplier(fd);

    if (result.error) {
      toast.error("Error al guardar el proveedor");
      return;
    }
    toast.success(supplier?.id ? "Proveedor actualizado" : "Proveedor creado");
    router.push("/admin/proveedores");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-w-xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <Label htmlFor="name">Nombre del proveedor *</Label>
          <Input id="name" {...register("name")} className="mt-1" />
          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <Label htmlFor="phone">Teléfono</Label>
          <Input
            id="phone"
            placeholder="+507 XXXX-XXXX"
            {...register("phone")}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="contacto@proveedor.com"
            {...register("email")}
            className="mt-1"
          />
        </div>

        <div className="sm:col-span-2">
          <Label htmlFor="address">Dirección</Label>
          <Input
            id="address"
            placeholder="Calle, número, ciudad..."
            {...register("address")}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="branch">Sucursal / Representante</Label>
          <Input
            id="branch"
            placeholder="Local, zona, área..."
            {...register("branch")}
            className="mt-1"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={isSubmitting} className="bg-rose-600 hover:bg-rose-700">
          {isSubmitting ? "Guardando..." : supplier?.id ? "Actualizar" : "Crear proveedor"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
