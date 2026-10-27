"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { publicCategories } from "@/components/public/categories";

const categories = [{ value: "", label: "Todos", emoji: "✨" }, ...publicCategories];

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
    <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap sm:overflow-visible">
      {categories.map((cat) => {
        const selected = active === cat.value || (!active && cat.value === "");
        return (
          <button
            key={cat.value}
            onClick={() => handleSelect(cat.value)}
            aria-pressed={selected}
            className={cn(
              "shrink-0 inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia focus-visible:ring-offset-2",
              selected
                ? "bg-fuchsia-deep border-fuchsia-deep text-white"
                : "bg-white border-blush-deep text-ink hover:border-fuchsia hover:text-fuchsia-deep"
            )}
          >
            <span aria-hidden>{cat.emoji}</span>
            {cat.label}
          </button>
        );
      })}
    </div>
  );
}
