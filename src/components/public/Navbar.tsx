"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart, Menu, X, ChevronDown, Truck, Sparkles } from "lucide-react";
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
  return <div className={cn("h-11 rounded-full bg-blush", className)} />;
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [techOpen, setTechOpen] = useState(false);
  const pathname = usePathname();
  const cartItems = useCartStore((s) => s.totalItems());
  const totalItems = useIsClient() ? cartItems : 0;

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Barra superior */}
      <div className="bg-fuchsia-deep text-white text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-9 flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 truncate">
            <Truck className="h-3.5 w-3.5 shrink-0" />
            Envíos en todo Panamá
          </span>
          <span className="hidden sm:flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            Cada pieza personalizada a tu gusto
          </span>
        </div>
      </div>

      <div className="bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85 border-b border-blush-deep">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4 lg:gap-8">
            <Link href="/" className="flex items-center gap-1.5 shrink-0">
              <Image src="/images/logo.png" alt="" width={44} height={44} priority className="h-11 w-11" />
              <span className="font-script text-3xl font-bold leading-none text-fuchsia-deep">Arte Madisa</span>
            </Link>

            <nav className="hidden lg:flex items-center gap-3">
              {mainLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  aria-current={pathname === l.href ? "page" : undefined}
                  className={cn(
                    "rounded-full px-4 py-1.5 text-sm font-semibold transition-colors",
                    pathname === l.href ? "bg-fuchsia-deep text-white" : "text-ink/80 hover:text-fuchsia-deep"
                  )}
                >
                  {l.label}
                </Link>
              ))}

              <div className="relative group">
                <button className="px-4 text-sm font-semibold text-ink/80 py-2 flex items-center gap-1 group-hover:text-fuchsia-deep">
                  Técnicas
                  <ChevronDown className="h-4 w-4 transition-transform group-hover:rotate-180" />
                </button>
                <div className="absolute left-0 mt-0 w-52 bg-white rounded-2xl shadow-xl shadow-fuchsia/15 hidden group-hover:block p-2 border border-blush-deep">
                  {techniqueLinks.map((l) => (
                    <Link
                      key={l.href}
                      href={l.href}
                      className="block rounded-xl px-3 py-2 text-sm text-ink/80 hover:bg-blush hover:text-fuchsia-deep"
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
                className="relative flex items-center gap-2 rounded-full px-3 h-10 text-sm font-semibold text-ink hover:bg-blush transition-colors"
              >
                <ShoppingCart className="h-5 w-5" />
                <span className="hidden sm:inline">Carrito</span>
                {totalItems > 0 && (
                  <span className="absolute -top-1 left-6 min-w-5 h-5 px-1 rounded-full bg-fuchsia-deep text-white text-[11px] font-bold flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Link>

              <button
                className="lg:hidden flex h-10 w-10 items-center justify-center rounded-full text-ink hover:bg-blush"
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
          <div className="lg:hidden border-t border-blush-deep bg-white px-4 py-3 space-y-1">
            {mainLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="block rounded-xl px-3 py-2 text-sm font-semibold text-ink hover:bg-blush"
              >
                {l.label}
              </Link>
            ))}

            <div>
              <button
                onClick={() => setTechOpen(!techOpen)}
                className="w-full text-left rounded-xl px-3 py-2 text-sm font-semibold text-ink flex items-center justify-between hover:bg-blush"
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
                      className="block rounded-xl px-3 py-2 text-sm text-ink/80 hover:bg-blush hover:text-fuchsia-deep"
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
