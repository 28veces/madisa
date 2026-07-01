import Link from "next/link";
import { ArrowRight, Star, Paintbrush, Layers, Scissors, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const techniques = [
  { icon: Layers, name: "Sublimación", href: "/sublimacion", desc: "Colores vivos y duraderos en cerámica, textiles y más." },
  { icon: Paintbrush, name: "Pintura", href: "/pintura", desc: "Arte único con cada pincelada, diseños exclusivos." },
  { icon: Scissors, name: "DTF/VDTF", href: "/dtf", desc: "Impresión de alta calidad con colores vibrantes." },
  { icon: Package, name: "Arreglos", href: "/arreglos", desc: "Bordado y grabado para piezas especiales." },
];

const categories = [
  { name: "Tazas", emoji: "☕", href: "/catalogo?categoria=TAZAS" },
  { name: "Platos", emoji: "🍽️", href: "/catalogo?categoria=PLATOS" },
  { name: "Vasos", emoji: "🥤", href: "/catalogo?categoria=VASOS" },
  { name: "Sweaters", emoji: "👕", href: "/catalogo?categoria=SWEATERS" },
  { name: "Placas", emoji: "🪧", href: "/catalogo?categoria=PLACAS" },
  { name: "Gorras", emoji: "🧢", href: "/catalogo?categoria=GORRAS" },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative py-20 px-4 overflow-hidden" style={{ background: "linear-gradient(to bottom right, rgb(13 148 136 / 0.05), white, rgb(249 115 22 / 0.05))" }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 left-10 w-72 h-72 rounded-full blur-3xl" style={{ background: "rgba(13, 148, 136, 0.1)" }} />
          <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full blur-3xl" style={{ background: "rgba(249, 115, 22, 0.1)" }} />
        </div>
        <div className="relative max-w-4xl mx-auto text-center space-y-6">
          <Badge className="text-sm px-4 py-1.5 rounded-full font-medium border" style={{ background: "rgba(13, 148, 136, 0.1)", color: "var(--color-teal)", borderColor: "rgba(13, 148, 136, 0.3)" }}>
            ✨ Artesanías únicas para momentos especiales
          </Badge>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight" style={{ color: "var(--color-dark)" }}>
            Personaliza tus{" "}
            <span className="relative" style={{ color: "var(--color-teal)" }}>
              recuerdos
              <svg className="absolute -bottom-1 left-0 w-full" height="6" viewBox="0 0 200 6">
                <path d="M0 5 Q50 0 100 4 Q150 8 200 3" stroke="var(--color-teal)" strokeWidth="3" fill="none" strokeLinecap="round" />
              </svg>
            </span>{" "}
            con amor
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Artículos personalizados hechos a mano en Panamá. Sublimación, pintado, DTF y más.
            Cada pieza cuenta tu historia.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/catalogo">
              <Button size="lg" className="text-white px-8 shadow-lg" style={{ background: "var(--color-teal)" }}>
                Ver catálogo <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="#sobre-mi">
              <Button size="lg" variant="outline" className="border-gray-300">
                Conocerme
              </Button>
            </Link>
          </div>
          <div className="flex items-center justify-center gap-6 text-sm text-gray-500 pt-2">
            {["Envíos en Panamá", "Materiales de calidad", "Diseño personalizado"].map((t) => (
              <span key={t} className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-current" style={{ color: "var(--color-orange)" }} /> {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Categorías rápidas */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-10" style={{ color: "var(--color-dark)" }}>
            ¿Qué quieres personalizar?
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                href={cat.href}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-gray-100 transition-all duration-200 group hover:border-teal-600"
              >
                <span className="text-3xl group-hover:scale-110 transition-transform duration-200">
                  {cat.emoji}
                </span>
                <span className="text-xs font-medium text-gray-700 text-center">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Sobre mí */}
      <section id="sobre-mi" className="py-20 px-4" style={{ background: "linear-gradient(to bottom right, rgb(13 148 136 / 0.05), rgb(249 115 22 / 0.05))" }}>
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-5">
            <Badge style={{ background: "rgba(13, 148, 136, 0.1)", color: "var(--color-teal)", borderColor: "rgba(13, 148, 136, 0.3)" }}>Sobre mí</Badge>
            <h2 className="text-3xl font-bold" style={{ color: "var(--color-dark)" }}>
              Creando arte con pasión desde el corazón de Panamá
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Soy Madisa, artesana apasionada por transformar objetos cotidianos en piezas únicas
              llenas de significado. Cada artículo que creo lleva mi dedicación, mi amor por el
              arte y el deseo de hacer especial cada momento de tu vida.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Trabajo con técnicas como sublimación, pintado a mano, DTF, VDTF y bordado para
              personalizar tazas, platos, sweaters, placas y mucho más. Tu idea, mi arte.
            </p>
            <Link href="/catalogo">
              <Button className="mt-2 text-white" style={{ background: "var(--color-teal)" }}>
                Ver mi trabajo <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <div className="flex items-center justify-center h-48 rounded-2xl text-6xl mb-4" style={{ background: "linear-gradient(to bottom right, rgba(13, 148, 136, 0.1), rgba(249, 115, 22, 0.1))" }}>
              🎨
            </div>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="rounded-xl p-3" style={{ background: "rgba(13, 148, 136, 0.1)" }}>
                <p className="text-2xl font-bold" style={{ color: "var(--color-teal)" }}>100+</p>
                <p className="text-xs text-gray-500">Clientes felices</p>
              </div>
              <div className="rounded-xl p-3" style={{ background: "rgba(249, 115, 22, 0.1)" }}>
                <p className="text-2xl font-bold" style={{ color: "var(--color-orange)" }}>5</p>
                <p className="text-xs text-gray-500">Técnicas</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Técnicas */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-3" style={{ color: "var(--color-dark)" }}>
            Técnicas de personalización
          </h2>
          <p className="text-center text-gray-500 mb-10 text-sm">
            Cada técnica ofrece un resultado único para tu artículo
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {techniques.map(({ icon: Icon, name, href, desc }) => (
              <Link key={name} href={href}>
                <div
                  className="text-center p-6 rounded-2xl border border-gray-100 hover:shadow-md hover:border-teal-600 transition-all duration-200 cursor-pointer"
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4" style={{ background: "rgba(13, 148, 136, 0.1)" }}>
                    <Icon className="h-6 w-6" style={{ color: "var(--color-teal)" }} />
                  </div>
                  <h3 className="font-semibold mb-2" style={{ color: "var(--color-dark)" }}>{name}</h3>
                  <p className="text-sm text-gray-500">{desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA / Contacto */}
      <section id="contacto" className="py-16 px-4 text-white text-center" style={{ background: "var(--color-teal)" }}>
        <div className="max-w-2xl mx-auto space-y-4">
          <h2 className="text-3xl font-bold">¿Lista para tu pedido?</h2>
          <p style={{ color: "rgba(255, 255, 255, 0.8)" }}>
            Contáctame por WhatsApp y creamos juntas tu artículo personalizado.
          </p>
          <a
            href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "50760000000"}?text=${encodeURIComponent("Hola! Quiero hacer un pedido personalizado.")}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button size="lg" className="bg-white text-white font-semibold mt-2" style={{ background: "white", color: "var(--color-teal)" }}>
              Escribir por WhatsApp
            </Button>
          </a>
        </div>
      </section>
    </>
  );
}
