import Hero from "@/components/Hero";
import PropertyGrid from "@/components/PropertyGrid";
import AboutSection from "@/components/AboutSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import { getAllProperties } from "@/lib/queries";
import { Property } from "@/components/types";

export const dynamic = "force-dynamic";

export default async function Home() {
  let properties: Property[] = [];
  try {
    properties = (await getAllProperties()) as Property[];
  } catch {
    properties = [];
  }

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-[200] bg-[rgba(248,250,252,0.97)] backdrop-blur-[8px] border-b border-[rgba(37,99,235,0.12)] px-5 py-2 flex items-center justify-between">
        <a href="#" className="flex items-center no-underline" aria-label="Hospeda Temporada">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="Hospeda Temporada"
            className="h-14 sm:h-16 w-auto object-contain"
          />
        </a>
        <a
          href="#imoveis"
          className="bg-[#2563EB] text-white px-5 py-2.5 rounded text-[13px] font-semibold no-underline"
        >
          Ver imóveis
        </a>
      </nav>

      <Hero />

      <div id="imoveis">
        <PropertyGrid initialProperties={properties} />
      </div>

      <AboutSection />
      <ContactSection />
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
