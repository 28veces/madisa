"use client";

import { useRef, useState } from "react";
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
import { ImageIcon, Upload, X } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface InventoryOption {
  id: string;
  code: string;
  description: string;
  availableStock: number;
  avgUnitCost?: number;
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

  const itemLabel = (item: InventoryOption) => `${item.code} - ${item.description}`;
  const linkedItem = inventoryItems.find((it) => it.id === watch("inventoryItemId"));
  const [itemSearch, setItemSearch] = useState(linkedItem ? itemLabel(linkedItem) : "");
  const [itemSearchOpen, setItemSearchOpen] = useState(false);
  const q = itemSearch.trim().toLowerCase();
  const filteredInventory = linkedItem
    ? inventoryItems
    : inventoryItems.filter(
        (it) => it.code.toLowerCase().includes(q) || it.description.toLowerCase().includes(q)
      );

  const selectInventoryItem = (item: InventoryOption | null) => {
    setValue("inventoryItemId", item?.id ?? "");
    setItemSearch(item ? itemLabel(item) : "");
    setItemSearchOpen(false);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(product?.imageUrl || null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPreview(URL.createObjectURL(file));
  };

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
    if (photoFile) fd.append("photo", photoFile);

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
          <Label>Foto del producto</Label>
          <div className="flex items-center gap-4 mt-1">
            <div className="h-24 w-24 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0">
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview} alt="" className="h-full w-full object-cover" />
              ) : (
                <ImageIcon className="h-8 w-8 text-gray-300" />
              )}
            </div>
            <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
              <Upload className="h-4 w-4 mr-2" />
              {preview ? "Cambiar foto" : "Subir foto"}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handlePhotoChange}
            />
          </div>
        </div>

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
          <Label htmlFor="imageUrl">URL de imagen (alternativa)</Label>
          <Input id="imageUrl" placeholder="https://..." {...register("imageUrl")} className="mt-1" />
          <p className="text-xs text-gray-500 mt-1">
            Si subes una foto arriba, esa foto tiene prioridad. Si no hay foto ni URL aquí y el producto está vinculado a un artículo de inventario con foto, se usará esa en su lugar.
          </p>
        </div>

        {inventoryItems.length > 0 && (
          <div className="sm:col-span-2">
            <Label>Artículo de inventario</Label>
            <p className="text-xs text-gray-500 mb-1">
              Vincula este producto al artículo en inventario. Solo se mostrará en el catálogo si hay stock disponible.
            </p>
            <div className="relative mt-1">
              <Input
                type="text"
                value={itemSearch}
                onChange={(e) => {
                  // Editar el texto suelta el artículo vinculado hasta que se elija otro de la lista
                  setItemSearch(e.target.value);
                  setValue("inventoryItemId", "");
                  setItemSearchOpen(true);
                }}
                onFocus={() => setItemSearchOpen(true)}
                onBlur={() => setTimeout(() => setItemSearchOpen(false), 150)}
                placeholder="Buscar por código o descripción, ej: taza"
                className="pr-9"
                autoComplete="off"
              />
              {itemSearch && (
                <button
                  type="button"
                  onClick={() => selectInventoryItem(null)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                  aria-label="Quitar artículo vinculado"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              {itemSearchOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
                  <button
                    type="button"
                    onClick={() => selectInventoryItem(null)}
                    className="w-full text-left p-2 hover:bg-gray-100 text-sm border-b text-gray-500"
                  >
                    Sin vincular (arreglos u otros)
                  </button>
                  {filteredInventory.length === 0 ? (
                    <div className="p-2 text-sm text-gray-500">Sin resultados</div>
                  ) : (
                    filteredInventory.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => selectInventoryItem(item)}
                        className="w-full text-left p-2 hover:bg-gray-100 text-sm border-b last:border-b-0"
                      >
                        <div className="font-medium">{itemLabel(item)}</div>
                        <div className={`text-xs ${item.availableStock > 0 ? "text-gray-500" : "text-red-500"}`}>
                          Stock: {item.availableStock}
                          {item.availableStock <= 0 && " (no se mostrará en el catálogo)"}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {linkedItem
                ? `Vinculado · stock ${linkedItem.availableStock}${
                    linkedItem.avgUnitCost ? ` · costo prom. ${formatCurrency(linkedItem.avgUnitCost)} c/u` : ""
                  }`
                : watch("inventoryItemId")
                  ? "Vinculado a un artículo inactivo"
                  : itemSearch
                    ? "Elige un artículo de la lista para vincularlo"
                  : "Sin vincular (arreglos u otros)"}
            </p>
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
