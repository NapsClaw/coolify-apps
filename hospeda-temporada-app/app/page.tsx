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
      <nav className="fixed top-0 left-0 right-0 z-[200] bg-[rgba(247,242,235,0.97)] backdrop-blur-[8px] border-b border-[rgba(172,71,71,0.1)] px-5 py-3.5 flex items-center justify-between">
        <a href="#" className="font-serif text-xl font-bold text-[#1a1410] no-underline">
          Hospeda<span className="text-[#AC4747]">Temporada</span>
        </a>
        <a
          href="#imoveis"
          className="bg-[#AC4747] text-white px-5 py-2.5 rounded text-[13px] font-semibold no-underline"
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
