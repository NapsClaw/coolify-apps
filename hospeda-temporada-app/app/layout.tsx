import type { Metadata } from "next";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Hospeda Temporada — Reserve seu imóvel com calendário online",
  description:
    "9 imóveis para temporada, eventos, festas e formaturas. Calendário de reservas online. Sítio Iluminado e mais — Biritiba Mirim, Mogi das Cruzes, SP.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${playfair.variable} ${jakarta.variable}`}>
      <body className="font-sans bg-[#F8FAFC] text-[#111827] overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
