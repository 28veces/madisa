"use client";

import Form from "next/form";
import { usePathname, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { useId } from "react";
import { cn } from "@/lib/utils";

// Buscador de la cabecera: lleva a /catalogo?q=… y conserva la categoría elegida (US-65)
export default function SearchBar({ className }: { className?: string }) {
  const inputId = useId();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const onCatalog = pathname === "/catalogo";
  const category = onCatalog ? searchParams.get("categoria") : null;

  return (
    <Form action="/catalogo" role="search" className={cn("relative", className)}>
      <label htmlFor={inputId} className="sr-only">Buscar productos</label>
      <input
        id={inputId}
        // Al cambiar de búsqueda desde la URL, el campo se reinicia con el texto actual
        key={onCatalog ? searchParams.get("q") ?? "" : ""}
        name="q"
        type="search"
        maxLength={100}
        defaultValue={onCatalog ? searchParams.get("q") ?? "" : ""}
        placeholder="Buscar tazas, gorras, placas..."
        className="h-11 w-full rounded-full border border-transparent bg-lavender pl-5 pr-12 text-sm text-ink placeholder:text-ink/65 outline-none transition focus:border-violet focus:bg-white focus:ring-2 focus:ring-violet/30"
      />
      {category && <input type="hidden" name="categoria" value={category} />}
      <button
        type="submit"
        aria-label="Buscar"
        className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-violet text-white transition hover:bg-violet-deep"
      >
        <Search className="h-4 w-4" />
      </button>
    </Form>
  );
}
