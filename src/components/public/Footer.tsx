import Link from "next/link";
import { Palette, ExternalLink } from "lucide-react";

export default function Footer() {
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "50760000000";

  return (
    <footer className="bg-gray-900 text-gray-300 py-10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <Link href="/" className="flex items-center gap-2 text-white font-bold text-lg mb-3">
              <Palette className="h-5 w-5 text-rose-400" />
              Arte Madisa
            </Link>
            <p className="text-sm leading-relaxed">
              Artesanías únicas y artículos personalizados hechos con dedicación y amor.
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-3">Navegación</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-rose-400 transition-colors">Inicio</Link></li>
              <li><Link href="/catalogo" className="hover:text-rose-400 transition-colors">Catálogo</Link></li>
              <li><Link href="/carrito" className="hover:text-rose-400 transition-colors">Mi carrito</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-3">Contáctame</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href={`https://wa.me/${whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-rose-400 transition-colors"
                >
                  WhatsApp
                </a>
              </li>
              <li className="flex items-center gap-1">
                <ExternalLink className="h-4 w-4" />
                <span>@artemadisa</span>
              </li>
              <li className="flex items-center gap-1">
                <ExternalLink className="h-4 w-4" />
                <span>Arte Madisa</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} Arte Madisa. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
