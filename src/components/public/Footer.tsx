import Image from "next/image";
import Link from "next/link";
import { MessageCircle, AtSign, Truck, ShieldCheck, Heart, Sparkles } from "lucide-react";
import { publicCategories } from "@/components/public/categories";

const benefits = [
  { icon: Truck, title: "Envíos a toda Panamá", text: "Rápidos y seguros" },
  { icon: ShieldCheck, title: "Productos de calidad", text: "Con mucho amor" },
  { icon: Heart, title: "Atención personalizada", text: "Siempre para ti" },
  { icon: Sparkles, title: "Tu idea, nuestro arte", text: "¡Hacemos realidad tus sueños!" },
];

export default function Footer() {
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "50760000000";

  return (
    <footer className="mt-auto">
      {/* Franja de beneficios (US-68) */}
      <div className="bg-fuchsia-deep text-white">
        <ul className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {benefits.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/15 ring-2 ring-white/40">
                <Icon className="h-5 w-5" />
              </span>
              <span>
                <span className="block text-sm font-bold">{title}</span>
                <span className="block text-xs text-white/90">{text}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-ink text-white/75 pt-14 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            <div className="space-y-3">
              <Link href="/" className="flex items-center gap-2 text-white">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white">
                  <Image src="/images/logo.png" alt="" width={36} height={36} className="h-9 w-9" />
                </span>
                <span className="font-script text-3xl font-bold">Arte Madisa</span>
              </Link>
              <p className="text-sm leading-relaxed">
                Artesanías únicas y artículos personalizados hechos con dedicación y amor en Panamá.
              </p>
            </div>

            <div>
              <h3 className="text-white font-bold mb-4">Navegación</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/" className="hover:text-gold transition-colors">Inicio</Link></li>
                <li><Link href="/catalogo" className="hover:text-gold transition-colors">Catálogo</Link></li>
                <li><Link href="/carrito" className="hover:text-gold transition-colors">Mi carrito</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-bold mb-4">Categorías</h3>
              <ul className="grid grid-cols-2 gap-2 text-sm">
                {publicCategories.map((c) => (
                  <li key={c.value}>
                    <Link href={`/catalogo?categoria=${c.value}`} className="hover:text-gold transition-colors">
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
                    className="inline-flex items-center gap-2 hover:text-gold transition-colors"
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
      </div>
    </footer>
  );
}
