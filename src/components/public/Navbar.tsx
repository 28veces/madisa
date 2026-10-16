"use client";

import Link from "next/link";
import { ShoppingCart, Menu, X, Palette, ChevronDown, Truck, Sparkles } from "lucide-react";
import { Suspense, useState, useSyncExternalStore } from "react";
import { useCartStore } from "@/stores/cartStore";
import { cn } from "@/lib/utils";
import SearchBar from "@/components/public/SearchBar";

const mainLinks = [
  { href: "/", label: "Inicio" },
  { href: "/catalogo", label: "Catálogo" },
];

const techniqueLinks = [
  { href: "/sublimacion", label: "Sublimación" },
  { href: "/pintura", label: "Pintura" },
  { href: "/dtf", label: "DTF" },
  { href: "/vdtf", label: "VDTF" },
  { href: "/arreglos", label: "Arreglos" },
];

// El carrito vive en localStorage: el servidor no lo conoce, así que el contador se
// muestra recién en el navegador para no provocar un error de hidratación.
const subscribeNoop = () => () => {};
function useIsClient() {
  return useSyncExternalStore(subscribeNoop, () => true, () => false);
}

function SearchFallback({ className }: { className?: string }) {
  return <div className={cn("h-11 rounded-full bg-lavender", className)} />;
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [techOpen, setTechOpen] = useState(false);
  const cartItems = useCartStore((s) => s.totalItems());
  const totalItems = useIsClient() ? cartItems : 0;

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Barra superior */}
      <div className="bg-ink text-white/90 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-9 flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 truncate">
            <Truck className="h-3.5 w-3.5 shrink-0 text-sun" />
            Envíos en todo Panamá
          </span>
          <span className="hidden sm:flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-sun" />
            Cada pieza personalizada a tu gusto
          </span>
        </div>
      </div>

      <div className="bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85 border-b border-lavender-deep">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4 lg:gap-8">
            <Link href="/" className="flex items-center gap-2 font-extrabold text-xl text-ink shrink-0">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet text-white">
                <Palette className="h-5 w-5" />
              </span>
              Arte Madisa
            </Link>

            <nav className="hidden lg:flex items-center gap-7">
              {mainLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="text-sm font-semibold text-ink/80 transition-colors hover:text-violet-deep"
                >
                  {l.label}
                </Link>
              ))}

              <div className="relative group">
                <button className="text-sm font-semibold text-ink/80 py-2 flex items-center gap-1 group-hover:text-violet-deep">
                  Técnicas
                  <ChevronDown className="h-4 w-4 transition-transform group-hover:rotate-180" />
                </button>
                <div className="absolute left-0 mt-0 w-52 bg-white rounded-2xl shadow-xl shadow-violet/10 hidden group-hover:block p-2 border border-lavender-deep">
                  {techniqueLinks.map((l) => (
                    <Link
                      key={l.href}
                      href={l.href}
                      className="block rounded-xl px-3 py-2 text-sm text-ink/80 hover:bg-lavender hover:text-violet-deep"
                    >
                      {l.label}
                    </Link>
                  ))}
                </div>
              </div>
            </nav>

            <Suspense fallback={<SearchFallback className="hidden md:block flex-1 max-w-md" />}>
              <SearchBar className="hidden md:block flex-1 max-w-md" />
            </Suspense>

            <div className="flex items-center gap-2">
              <Link
                href="/carrito"
                aria-label={`Mi carrito (${totalItems} artículos)`}
                className="relative flex items-center gap-2 rounded-full px-3 h-10 text-sm font-semibold text-ink hover:bg-lavender transition-colors"
              >
                <ShoppingCart className="h-5 w-5" />
                <span className="hidden sm:inline">Carrito</span>
                {totalItems > 0 && (
                  <span className="absolute -top-1 left-6 min-w-5 h-5 px-1 rounded-full bg-coral text-ink text-[11px] font-bold flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Link>

              <button
                className="lg:hidden flex h-10 w-10 items-center justify-center rounded-full text-ink hover:bg-lavender"
                onClick={() => setOpen(!open)}
                aria-label={open ? "Cerrar menú" : "Abrir menú"}
                aria-expanded={open}
              >
                {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Buscador en celular */}
          <div className="md:hidden pb-3">
            <Suspense fallback={<SearchFallback />}>
              <SearchBar />
            </Suspense>
          </div>
        </div>

        {open && (
          <div className="lg:hidden border-t border-lavender-deep bg-white px-4 py-3 space-y-1">
            {mainLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="block rounded-xl px-3 py-2 text-sm font-semibold text-ink hover:bg-lavender"
              >
                {l.label}
              </Link>
            ))}

            <div>
              <button
                onClick={() => setTechOpen(!techOpen)}
                className="w-full text-left rounded-xl px-3 py-2 text-sm font-semibold text-ink flex items-center justify-between hover:bg-lavender"
              >
                Técnicas
                <ChevronDown className={cn("h-4 w-4 transition-transform", techOpen && "rotate-180")} />
              </button>
              {techOpen && (
                <div className="pl-4 space-y-1">
                  {techniqueLinks.map((l) => (
                    <Link
                      key={l.href}
                      href={l.href}
                      onClick={() => setOpen(false)}
                      className="block rounded-xl px-3 py-2 text-sm text-ink/80 hover:bg-lavender hover:text-violet-deep"
                    >
                      {l.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
