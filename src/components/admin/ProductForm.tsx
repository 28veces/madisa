"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
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
import { createProduct, updateProduct } from "@/actions/products";

interface InventoryOption {
  id: string;
  code: string;
  description: string;
  availableStock: number;
}

interface FormValues {
  name: string;
  description: string;
  category: string;
  material: string;
  technique: string;
  basePrice: number;
  imageUrl: string;
  inventoryItemId: string;
  isActive: boolean;
}

interface Props {
  product?: Partial<FormValues> & { id?: string };
  redirectTo?: string;
  inventoryItems?: InventoryOption[];
}

const categories = [
  { value: "PLATOS", label: "Platos" },
  { value: "VASOS", label: "Vasos" },
  { value: "TAZAS", label: "Tazas" },
  { value: "SWEATERS", label: "Sweaters" },
  { value: "GORRAS", label: "Gorras" },
  { value: "PLACAS", label: "Placas" },
  { value: "LAPIDAS", label: "Lápidas" },
  { value: "OTROS", label: "Otros" },
];

const techniques = [
  { value: "SUBLIMACION", label: "Sublimación" },
  { value: "PINTADO_A_MANO", label: "Pintado a mano" },
  { value: "VINIL", label: "Vinil" },
  { value: "BORDADO", label: "Bordado" },
  { value: "GRABADO", label: "Grabado" },
  { value: "DTF", label: "DTF" },
  { value: "VDTF", label: "VDTF" },
  { value: "OTRO", label: "Otro" },
];

export default function ProductForm({ product, redirectTo = "/admin/catalogo", inventoryItems = [] }: Props) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      name: product?.name ?? "",
      description: product?.description ?? "",
      category: product?.category ?? "",
      material: product?.material ?? "",
      technique: product?.technique ?? "",
      basePrice: product?.basePrice ?? 0,
      imageUrl: product?.imageUrl ?? "",
      inventoryItemId: product?.inventoryItemId ?? "",
      isActive: product?.isActive ?? true,
    },
  });

  const validate = (values: FormValues) => {
    const errs: Partial<Record<keyof FormValues, { message: string }>> = {};
    if (!values.name.trim()) errs.name = { message: "Nombre requerido" };
    if (!values.category) errs.category = { message: "Categoría requerida" };
    if (!values.technique) errs.technique = { message: "Técnica requerida" };
    if (!values.material.trim()) errs.material = { message: "Material requerido" };
    if (values.basePrice < 0) errs.basePrice = { message: "Precio inválido" };
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

    const result = product?.id
      ? await updateProduct(product.id, fd)
      : await createProduct(fd);

    if (result.error) {
      toast.error("Error al guardar el producto");
      return;
    }
    toast.success(product?.id ? "Producto actualizado" : "Producto creado");
    router.push(redirectTo);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-w-xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <Label htmlFor="name">Nombre *</Label>
          <Input id="name" {...register("name")} className="mt-1" />
          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
        </div>

        <div className="sm:col-span-2">
          <Label htmlFor="description">Descripción</Label>
          <Input id="description" {...register("description")} className="mt-1" />
        </div>

        <div>
          <Label>Categoría *</Label>
          <Select
            value={watch("category")}
            onValueChange={(v) => v && setValue("category", v)}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Seleccionar..." />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category.message}</p>}
        </div>

        <div>
          <Label>Técnica *</Label>
          <Select
            value={watch("technique")}
            onValueChange={(v) => v && setValue("technique", v)}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Seleccionar..." />
            </SelectTrigger>
            <SelectContent>
              {techniques.map((t) => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.technique && <p className="text-xs text-red-500 mt-1">{errors.technique.message}</p>}
        </div>

        <div>
          <Label htmlFor="material">Material *</Label>
          <Input id="material" placeholder="Cerámica, tela, acrílico..." {...register("material")} className="mt-1" />
          {errors.material && <p className="text-xs text-red-500 mt-1">{errors.material.message}</p>}
        </div>

        <div>
          <Label htmlFor="basePrice">Precio base ($) *</Label>
          <Input
            id="basePrice"
            type="number"
            step="0.01"
            {...register("basePrice", { valueAsNumber: true })}
            className="mt-1"
          />
          {errors.basePrice && <p className="text-xs text-red-500 mt-1">{errors.basePrice.message}</p>}
        </div>

        <div className="sm:col-span-2">
          <Label htmlFor="imageUrl">URL de imagen</Label>
          <Input id="imageUrl" placeholder="https://..." {...register("imageUrl")} className="mt-1" />
        </div>

        {inventoryItems.length > 0 && (
          <div className="sm:col-span-2">
            <Label>Artículo de inventario</Label>
            <p className="text-xs text-gray-500 mb-1">
              Vincula este producto al artículo en inventario. Solo se mostrará en el catálogo si hay stock disponible.
            </p>
            <Select
              value={watch("inventoryItemId") ?? ""}
              onValueChange={(v) => setValue("inventoryItemId", v === "none" ? "" : (v ?? ""))}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Sin vincular (arreglos u otros)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sin vincular (arreglos u otros)</SelectItem>
                {inventoryItems.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.code} — {item.description} (stock: {item.availableStock})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="sm:col-span-2 flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="isActive"
            {...register("isActive")}
            className="h-4 w-4 rounded border-gray-300 text-teal-600"
          />
          <Label htmlFor="isActive" className="cursor-pointer">Visible en catálogo público</Label>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={isSubmitting} className="bg-teal-600 hover:bg-teal-700">
          {isSubmitting ? "Guardando..." : product?.id ? "Actualizar" : "Crear producto"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
