"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const categories = [
  { value: "", label: "Todos" },
  { value: "PLATOS", label: "Platos" },
  { value: "VASOS", label: "Vasos" },
  { value: "TAZAS", label: "Tazas" },
  { value: "SWEATERS", label: "Sweaters" },
  { value: "PLACAS", label: "Placas" },
  { value: "LAPIDAS", label: "Lápidas" },
  { value: "OTROS", label: "Otros" },
];

export default function CategoryFilter({ active }: { active?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleSelect = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("categoria", value);
    } else {
      params.delete("categoria");
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((cat) => (
        <button
          key={cat.value}
          onClick={() => handleSelect(cat.value)}
          className="focus:outline-none focus:ring-2 focus:ring-rose-400 focus:ring-offset-1 rounded-full"
        >
          <Badge
            variant={active === cat.value || (!active && cat.value === "") ? "default" : "outline"}
            className={cn(
              "cursor-pointer px-3 py-1 text-sm transition-colors",
              active === cat.value || (!active && cat.value === "")
                ? "bg-rose-600 text-white hover:bg-rose-700"
                : "hover:bg-rose-50 hover:border-rose-300"
            )}
          >
            {cat.label}
          </Badge>
        </button>
      ))}
    </div>
  );
}
