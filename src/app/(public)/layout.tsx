import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import WhatsAppButton from "@/components/public/WhatsAppButton";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    // Geist explícito: la fuente del tema (--font-sans) no resuelve y caía en la serif del navegador
    <div className="flex flex-1 flex-col font-[family-name:var(--font-geist-sans)]">
      <Navbar />
      <main className="flex-1 bg-lavender text-ink">{children}</main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
