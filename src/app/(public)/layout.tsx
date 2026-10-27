import { Dancing_Script } from "next/font/google";
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import WhatsAppButton from "@/components/public/WhatsAppButton";

// Letra manuscrita de los títulos de marca (US-68): se usa con la clase font-script
const dancingScript = Dancing_Script({
  variable: "--font-dancing-script",
  subsets: ["latin"],
  weight: ["600", "700"],
});

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    // Geist explícito: la fuente del tema (--font-sans) no resuelve y caía en la serif del navegador
    <div className={`${dancingScript.variable} flex flex-1 flex-col font-[family-name:var(--font-geist-sans)]`}>
      <Navbar />
      <main className="flex-1 bg-blush text-ink">{children}</main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
