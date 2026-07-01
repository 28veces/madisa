"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  TrendingDown,
  Truck,
  Box,
  Palette,
  LogOut,
  TrendingUp,
  Zap,
  DollarSign,
  Users,
  Store,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";

const navItems = [
  { href: "/admin/usuarios", label: "Usuarios", icon: Users },
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/proveedores", label: "Proveedores", icon: Truck },
  { href: "/admin/inventario", label: "Inventario", icon: Package },
  { href: "/admin/articulos", label: "Artículos de Compra", icon: Box },
  { href: "/admin/ventas", label: "Ventas", icon: ShoppingBag },
  { href: "/admin/compras", label: "Compras", icon: TrendingDown },
  { href: "/admin/socios", label: "Socios", icon: Users },
  { href: "/admin/inversiones", label: "Inversiones", icon: Zap },
  { href: "/admin/egresos", label: "Egresos", icon: DollarSign },
  { href: "/admin/ganancias", label: "Ganancias", icon: TrendingUp },
  { href: "/admin/catalogo", label: "Catálogo público", icon: Store },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 flex flex-col">
      <div className="flex items-center gap-2 px-6 py-5 border-b border-gray-700">
        <Palette className="h-6 w-6 text-rose-400" />
        <div>
          <p className="font-bold text-white text-sm">Arte Madisa</p>
          <p className="text-xs text-gray-400">{session?.user?.name || "Cargando..."}</p>
        </div>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-rose-600 text-white"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              )}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-gray-700">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-colors mb-1"
        >
          <Palette className="h-4 w-4" />
          Ver sitio
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-red-400 hover:bg-gray-800 transition-colors w-full text-left"
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
