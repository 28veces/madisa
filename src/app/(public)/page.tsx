export const dynamic = "force-dynamic";

import Link from "next/link";
import { ArrowRight, Paintbrush, Layers, Scissors, Package, Heart, Sparkles, ShoppingCart } from "lucide-react";
import { getPublicProducts } from "@/actions/products";
import { availableStock } from "@/lib/stock";
import ProductCard from "@/components/public/ProductCard";
import CoverImage from "@/components/public/CoverImage";
import { publicCategories } from "@/components/public/categories";

const techniques = [
  { icon: Layers, name: "Sublimación", href: "/sublimacion", desc: "Colores vivos y duraderos en cerámica, textiles y más." },
  { icon: Paintbrush, name: "Pintura", href: "/pintura", desc: "Arte único con cada pincelada, diseños exclusivos." },
  { icon: Scissors, name: "DTF/VDTF", href: "/dtf", desc: "Impresión de alta calidad con colores vibrantes." },
  { icon: Package, name: "Arreglos", href: "/arreglos", desc: "Bordado y grabado para piezas especiales." },
];

// Título de sección en cinta fucsia, como en el diseño de la marca (US-68)
function RibbonTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="inline-block -skew-x-6 rounded-r-full bg-fuchsia py-2 pl-5 pr-8 shadow-md shadow-fuchsia/30">
      <span className="block skew-x-6 font-script text-3xl sm:text-4xl font-bold text-white">{children}</span>
    </h2>
  );
}

export default async function HomePage() {
  const products = await getPublicProducts().catch(() => []);
  const imageOf = (p: (typeof products)[number]) => p.imageUrl ?? p.inventoryItem?.imageUrl ?? null;

  // Imagen de cada categoría: el producto activo más reciente de esa categoría que tenga foto
  const categoryCards = publicCategories.map((c) => {
    const withImage = products.find((p) => p.category === c.value && imageOf(p));
    return { ...c, imageUrl: withImage ? imageOf(withImage) : null };
  });

  const heroImages = products.map(imageOf).filter((url): url is string => !!url).slice(0, 3);
  const latest = products.slice(0, 4);

  return (
    <>
      {/* Banner principal */}
      <section className="px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        <div className="relative max-w-7xl mx-auto overflow-hidden rounded-[2rem] bg-gradient-to-br from-white via-blush to-blush-deep ring-1 ring-blush-deep">
          <div className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-fuchsia/25 blur-3xl" />
          <div className="pointer-events-none absolute right-1/3 -bottom-24 h-64 w-64 rounded-full bg-turquoise/20 blur-3xl" />
          <div className="pointer-events-none absolute -right-16 -top-10 h-72 w-72 rounded-full bg-gold/25 blur-3xl" />

          <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-10 items-center px-6 py-12 sm:px-12 sm:py-16">
            <div className="space-y-6 text-center lg:text-left">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gold px-4 py-1.5 text-sm font-bold text-ink">
                <Sparkles className="h-4 w-4" />
                Hecho a mano en Panamá
              </span>
              <h1 className="font-script text-6xl sm:text-7xl lg:text-8xl font-bold leading-none text-fuchsia-deep drop-shadow-sm">
                Arte Madisa
              </h1>
              <p className="text-2xl sm:text-3xl font-extrabold leading-snug text-ink">
                “Transformando tus <span className="font-script text-4xl sm:text-5xl text-fuchsia-deep">ideas en arte</span>”
              </p>
              <p className="text-lg text-ink/75 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Tazas, gorras, sweaters, placas y más con tu nombre, tu foto o tu frase favorita.
                Cada pieza cuenta tu historia.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Link
                  href="/catalogo"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-fuchsia-deep px-8 text-base font-bold text-white shadow-lg shadow-fuchsia/30 transition-colors hover:bg-fuchsia-dark"
                >
                  Ver productos <ShoppingCart className="h-4 w-4" />
                </Link>
                <Link
                  href="#sobre-mi"
                  className="inline-flex h-12 items-center justify-center rounded-full border-2 border-fuchsia-deep bg-white/60 px-8 text-base font-bold text-fuchsia-deep transition-colors hover:bg-white"
                >
                  Conocerme
                </Link>
              </div>
            </div>

            {/* Collage con fotos del catálogo; sin fotos, mosaico de colores */}
            <div className="hidden sm:grid grid-cols-2 grid-rows-2 gap-4 h-80 lg:h-[26rem]">
              {[0, 1, 2].map((i) => {
                const url = heroImages[i];
                const tile = ["row-span-2 -rotate-2", "rotate-2", "-rotate-1"][i];
                const tone = ["bg-fuchsia", "bg-gold", "bg-turquoise"][i];
                const placeholder = (
                  <div className={`flex h-full items-center justify-center text-6xl ${tone}`}>
                    {["🎨", "☕", "🧢"][i]}
                  </div>
                );
                return (
                  <div key={i} className={`relative overflow-hidden rounded-3xl border-4 border-white shadow-xl shadow-fuchsia/20 ${tone} ${tile}`}>
                    {url ? (
                      <CoverImage src={url} alt="" sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover" fallback={placeholder} />
                    ) : (
                      placeholder
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Compra por categoría */}
      <section className="px-4 sm:px-6 lg:px-8 pt-14 pb-16">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between gap-4 mb-8">
            <RibbonTitle>Compra por categoría</RibbonTitle>
            <Link href="/catalogo" className="hidden sm:inline-flex items-center gap-1 rounded-full border-2 border-fuchsia-deep bg-white px-4 py-1.5 text-sm font-bold text-fuchsia-deep hover:bg-blush">
              Ver todo <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-4 lg:grid-cols-8 gap-x-3 gap-y-6">
            {categoryCards.map((cat) => {
              const placeholder = (
                <div className="flex h-full items-center justify-center bg-white">
                  <span aria-hidden className="text-3xl sm:text-4xl transition-transform duration-300 group-hover:scale-110">{cat.emoji}</span>
                </div>
              );
              return (
                <Link key={cat.value} href={`/catalogo?categoria=${cat.value}`} className="group flex flex-col items-center gap-2 text-center">
                  {/* Círculo con anillo dorado (US-68) */}
                  <span className="relative block aspect-square w-full max-w-28 overflow-hidden rounded-full border-4 border-white bg-white ring-4 ring-gold shadow-md shadow-gold/30 transition-transform duration-300 group-hover:-translate-y-1">
                    {cat.imageUrl ? (
                      <CoverImage
                        src={cat.imageUrl}
                        alt=""
                        sizes="112px"
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        fallback={placeholder}
                      />
                    ) : (
                      placeholder
                    )}
                  </span>
                  <span className="flex items-center gap-1 text-sm sm:text-base font-bold text-ink group-hover:text-fuchsia-deep">
                    <Heart aria-hidden className="hidden sm:block h-3.5 w-3.5 shrink-0 fill-fuchsia text-fuchsia" />
                    {cat.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Lo más nuevo */}
      {latest.length > 0 && (
        <section className="px-4 sm:px-6 lg:px-8 pb-16">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between gap-4 mb-8">
              <RibbonTitle>Productos destacados</RibbonTitle>
              <Link href="/catalogo" className="hidden sm:inline-flex items-center gap-1 rounded-full border-2 border-fuchsia-deep bg-white px-4 py-1.5 text-sm font-bold text-fuchsia-deep hover:bg-blush">
                Ver catálogo <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {latest.map((p) => (
                <ProductCard
                  key={p.id}
                  id={p.id}
                  name={p.name}
                  description={p.description}
                  category={p.category}
                  technique={p.technique}
                  material={p.material}
                  basePrice={Number(p.basePrice)}
                  imageUrl={imageOf(p)}
                  availableStock={p.inventoryItem ? availableStock(p.inventoryItem) : undefined}
                  allowBackorder={p.allowBackorder}
                  backorderLimit={p.backorderLimit}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Técnicas */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-ink mb-2">Técnicas de <span className="font-script text-4xl text-fuchsia-deep">personalización</span></h2>
          <p className="text-ink/65 mb-8">Cada técnica ofrece un resultado único para tu artículo.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {techniques.map(({ icon: Icon, name, href, desc }) => (
              <Link
                key={name}
                href={href}
                className="group rounded-3xl bg-blush p-6 ring-1 ring-blush-deep transition-colors hover:bg-fuchsia-deep"
              >
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-fuchsia-deep ring-2 ring-gold mb-5">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="font-extrabold text-ink group-hover:text-white mb-1.5">{name}</h3>
                <p className="text-sm text-ink/70 group-hover:text-white/85">{desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Sobre mí */}
      <section id="sobre-mi" className="px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-5">
            <span className="inline-flex rounded-full bg-fuchsia/10 px-3 py-1 text-sm font-bold text-fuchsia-deep">Sobre mí</span>
            <h2 className="text-3xl font-extrabold text-ink">
              Creando arte con pasión desde el corazón de Panamá
            </h2>
            <p className="text-ink/70 leading-relaxed">
              Soy Madisa, artesana apasionada por transformar objetos cotidianos en piezas únicas
              llenas de significado. Cada artículo que creo lleva mi dedicación, mi amor por el
              arte y el deseo de hacer especial cada momento de tu vida.
            </p>
            <p className="text-ink/70 leading-relaxed">
              Trabajo con técnicas como sublimación, pintado a mano, DTF, VDTF y bordado para
              personalizar tazas, platos, sweaters, placas y mucho más. Tu idea, mi arte.
            </p>
            <Link
              href="/catalogo"
              className="inline-flex h-11 items-center gap-2 rounded-full bg-fuchsia-deep px-6 text-sm font-bold text-white transition-colors hover:bg-fuchsia-dark"
            >
              Ver mi trabajo <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="rounded-[2rem] bg-white p-6 sm:p-8 shadow-sm ring-1 ring-blush-deep">
            <div className="flex items-center justify-center h-48 rounded-3xl bg-gradient-to-br from-fuchsia via-fuchsia-deep to-gold text-7xl mb-4">
              🎨
            </div>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="rounded-2xl bg-blush p-4">
                <p className="text-3xl font-extrabold text-fuchsia-deep">100+</p>
                <p className="text-xs font-medium text-ink/70">Clientes felices</p>
              </div>
              <div className="rounded-2xl bg-gold p-4">
                <p className="text-3xl font-extrabold text-ink">5</p>
                <p className="text-xs font-medium text-ink/80">Técnicas</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA / Contacto */}
      <section id="contacto" className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="relative max-w-7xl mx-auto overflow-hidden rounded-[2rem] bg-fuchsia-deep px-6 py-14 text-center">
          <div className="pointer-events-none absolute -left-10 -bottom-16 h-56 w-56 rounded-full bg-gold/30 blur-3xl" />
          <div className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full bg-fuchsia/60 blur-3xl" />
          <div className="relative max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">¿Lista para tu pedido?</h2>
            <p className="text-white">
              Contáctame por WhatsApp y creamos juntas tu artículo personalizado.
            </p>
            <a
              href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "50760000000"}?text=${encodeURIComponent("Hola! Quiero hacer un pedido personalizado.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center rounded-full bg-white px-8 text-base font-bold text-fuchsia-deep mt-2 transition-colors hover:bg-gold hover:text-ink"
            >
              Escribir por WhatsApp
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
