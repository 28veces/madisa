import Link from "next/link";
import { Palette, MessageCircle, AtSign } from "lucide-react";
import { publicCategories } from "@/components/public/categories";

export default function Footer() {
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "50760000000";

  return (
    <footer className="bg-ink text-white/75 pt-14 pb-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="space-y-3">
            <Link href="/" className="flex items-center gap-2 text-white font-extrabold text-lg">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet">
                <Palette className="h-5 w-5" />
              </span>
              Arte Madisa
            </Link>
            <p className="text-sm leading-relaxed">
              Artesanías únicas y artículos personalizados hechos con dedicación y amor en Panamá.
            </p>
          </div>

          <div>
            <h3 className="text-white font-bold mb-4">Navegación</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-sun transition-colors">Inicio</Link></li>
              <li><Link href="/catalogo" className="hover:text-sun transition-colors">Catálogo</Link></li>
              <li><Link href="/carrito" className="hover:text-sun transition-colors">Mi carrito</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold mb-4">Categorías</h3>
            <ul className="grid grid-cols-2 gap-2 text-sm">
              {publicCategories.map((c) => (
                <li key={c.value}>
                  <Link href={`/catalogo?categoria=${c.value}`} className="hover:text-sun transition-colors">
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold mb-4">Contáctame</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href={`https://wa.me/${whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 hover:text-sun transition-colors"
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </a>
              </li>
              <li className="flex items-center gap-2">
                <AtSign className="h-4 w-4" />
                <span>artemadisa</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 text-center text-xs text-white/60">
          © {new Date().getFullYear()} Arte Madisa. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
