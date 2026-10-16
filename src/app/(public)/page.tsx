export const dynamic = "force-dynamic";

import Link from "next/link";
import { ArrowRight, Star, Paintbrush, Layers, Scissors, Package, Truck, Heart, Sparkles } from "lucide-react";
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

const perks = [
  { icon: Truck, text: "Envíos en Panamá" },
  { icon: Star, text: "Materiales de calidad" },
  { icon: Heart, text: "Diseño personalizado" },
];

// Fondos que rotan en las tarjetas de categoría sin foto
const fallbackTones = ["bg-violet text-white", "bg-coral text-ink", "bg-sun text-ink", "bg-ink text-white"];

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
        <div className="relative max-w-7xl mx-auto overflow-hidden rounded-[2rem] bg-ink">
          <div className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-violet/50 blur-3xl" />
          <div className="pointer-events-none absolute -right-16 bottom-0 h-72 w-72 rounded-full bg-coral/40 blur-3xl" />

          <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-10 items-center px-6 py-12 sm:px-12 sm:py-16">
            <div className="space-y-6">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-sun px-4 py-1.5 text-sm font-bold text-ink">
                <Sparkles className="h-4 w-4" />
                Hecho a mano en Panamá
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.05] text-white">
                Personaliza tus <span className="text-sun">recuerdos</span> con{" "}
                <span className="text-coral">amor</span>
              </h1>
              <p className="text-lg text-white/80 max-w-xl leading-relaxed">
                Tazas, gorras, sweaters, placas y más con tu nombre, tu foto o tu frase favorita.
                Cada pieza cuenta tu historia.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/catalogo"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-coral px-8 text-base font-bold text-ink shadow-lg shadow-coral/30 transition-colors hover:bg-coral-deep"
                >
                  Ver catálogo <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="#sobre-mi"
                  className="inline-flex h-12 items-center justify-center rounded-full border-2 border-white/30 px-8 text-base font-bold text-white transition-colors hover:border-white hover:bg-white/10"
                >
                  Conocerme
                </Link>
              </div>
              <ul className="flex flex-wrap gap-x-6 gap-y-2 pt-2 text-sm text-white/80">
                {perks.map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-center gap-1.5">
                    <Icon className="h-4 w-4 text-sun" /> {text}
                  </li>
                ))}
              </ul>
            </div>

            {/* Collage con fotos del catálogo; sin fotos, mosaico de colores */}
            <div className="hidden sm:grid grid-cols-2 grid-rows-2 gap-4 h-80 lg:h-[26rem]">
              {[0, 1, 2].map((i) => {
                const url = heroImages[i];
                const tile = i === 0 ? "row-span-2" : "";
                const tone = ["bg-violet", "bg-sun", "bg-coral"][i];
                const placeholder = (
                  <div className={`flex h-full items-center justify-center text-6xl ${tone}`}>
                    {["🎨", "☕", "🧢"][i]}
                  </div>
                );
                return (
                  <div key={i} className={`relative overflow-hidden rounded-3xl ${tone} ${tile}`}>
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
      <section className="px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between gap-4 mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-ink">Compra por categoría</h2>
            <Link href="/catalogo" className="hidden sm:inline-flex items-center gap-1 text-sm font-bold text-violet-deep hover:underline">
              Ver todo <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {categoryCards.map((cat, i) => (
              <Link
                key={cat.value}
                href={`/catalogo?categoria=${cat.value}`}
                className="group relative aspect-[4/5] overflow-hidden rounded-3xl"
              >
                {(() => {
                  const placeholder = (
                    <div className={`flex h-full flex-col items-center justify-center gap-3 ${fallbackTones[i % fallbackTones.length]}`}>
                      <span aria-hidden className="text-6xl transition-transform duration-300 group-hover:scale-110">{cat.emoji}</span>
                      <span className="text-lg font-extrabold">{cat.label}</span>
                    </div>
                  );
                  if (!cat.imageUrl) return placeholder;
                  return (
                    <CoverImage
                      src={cat.imageUrl}
                      alt=""
                      sizes="(min-width: 640px) 25vw, 50vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      fallback={placeholder}
                    >
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/20 to-transparent" />
                      <span className="absolute bottom-4 left-4 right-4 text-lg font-extrabold text-white">{cat.label}</span>
                    </CoverImage>
                  );
                })()}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Lo más nuevo */}
      {latest.length > 0 && (
        <section className="px-4 sm:px-6 lg:px-8 pb-16">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between gap-4 mb-8">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-ink">Lo más nuevo</h2>
              <Link href="/catalogo" className="inline-flex items-center gap-1 text-sm font-bold text-violet-deep hover:underline">
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
          <h2 className="text-2xl sm:text-3xl font-extrabold text-ink mb-2">Técnicas de personalización</h2>
          <p className="text-ink/65 mb-8">Cada técnica ofrece un resultado único para tu artículo.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {techniques.map(({ icon: Icon, name, href, desc }) => (
              <Link
                key={name}
                href={href}
                className="group rounded-3xl bg-lavender p-6 transition-colors hover:bg-violet"
              >
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-violet-deep mb-5">
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
            <span className="inline-flex rounded-full bg-violet/10 px-3 py-1 text-sm font-bold text-violet-deep">Sobre mí</span>
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
              className="inline-flex h-11 items-center gap-2 rounded-full bg-violet px-6 text-sm font-bold text-white transition-colors hover:bg-violet-deep"
            >
              Ver mi trabajo <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="rounded-[2rem] bg-white p-6 sm:p-8 shadow-sm ring-1 ring-lavender-deep">
            <div className="flex items-center justify-center h-48 rounded-3xl bg-gradient-to-br from-violet to-coral text-7xl mb-4">
              🎨
            </div>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="rounded-2xl bg-lavender p-4">
                <p className="text-3xl font-extrabold text-violet-deep">100+</p>
                <p className="text-xs font-medium text-ink/70">Clientes felices</p>
              </div>
              <div className="rounded-2xl bg-sun p-4">
                <p className="text-3xl font-extrabold text-ink">5</p>
                <p className="text-xs font-medium text-ink/80">Técnicas</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA / Contacto */}
      <section id="contacto" className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="relative max-w-7xl mx-auto overflow-hidden rounded-[2rem] bg-violet px-6 py-14 text-center">
          <div className="pointer-events-none absolute -left-10 -bottom-16 h-56 w-56 rounded-full bg-sun/40 blur-3xl" />
          <div className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full bg-coral/50 blur-3xl" />
          <div className="relative max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">¿Lista para tu pedido?</h2>
            <p className="text-white">
              Contáctame por WhatsApp y creamos juntas tu artículo personalizado.
            </p>
            <a
              href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "50760000000"}?text=${encodeURIComponent("Hola! Quiero hacer un pedido personalizado.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center rounded-full bg-white px-8 text-base font-bold text-violet-deep mt-2 transition-colors hover:bg-sun hover:text-ink"
            >
              Escribir por WhatsApp
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
