"use client";

import Link from "next/link";
import { ShoppingCart, Menu, X, Palette } from "lucide-react";
import { useState } from "react";
import { useCartStore } from "@/stores/cartStore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [techOpen, setTechOpen] = useState(false);
  const totalItems = useCartStore((s) => s.totalItems());

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl" style={{ color: "var(--color-teal)" }}>
            <Palette className="h-6 w-6" />
            Arte Madisa
          </Link>

          <nav className="hidden lg:flex items-center gap-8">
            {mainLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm font-medium text-gray-600 hover:transition-colors hover:text-teal-600"
              >
                {l.label}
              </Link>
            ))}

            <div className="relative group">
              <button className="text-sm font-medium text-gray-600 py-2 flex items-center gap-1 group-hover:text-teal-600">
                Técnicas
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </button>
              <div className="absolute left-0 mt-0 w-48 bg-white rounded-lg shadow-lg hidden group-hover:block py-2 border border-gray-100">
                {techniqueLinks.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-teal-600"
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/carrito" className="relative">
              <Button
                variant="outline"
                size="icon"
                className="relative border-gray-300"
                style={{ color: "var(--color-teal)" }}
              >
                <ShoppingCart className="h-4 w-4" />
                {totalItems > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs text-white" style={{ backgroundColor: "var(--color-orange)" }}>
                    {totalItems}
                  </Badge>
                )}
              </Button>
            </Link>

            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setOpen(!open)}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t bg-white px-4 py-3 space-y-3">
          {mainLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block py-2 text-sm font-medium text-gray-700 hover:text-teal-600"
            >
              {l.label}
            </Link>
          ))}

          <div>
            <button
              onClick={() => setTechOpen(!techOpen)}
              className="w-full text-left py-2 text-sm font-medium text-gray-700 flex items-center justify-between hover:text-teal-600"
            >
              Técnicas
              <svg className={cn("w-4 h-4 transition-transform", techOpen && "rotate-180")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </button>
            {techOpen && (
              <div className="pl-4 space-y-2">
                {techniqueLinks.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="block py-2 text-sm text-gray-600 hover:text-teal-600"
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
