export default function Footer() {
  return (
    <footer className="bg-[#111827] py-12 px-6">
      <div className="max-w-5xl mx-auto flex flex-col items-center gap-8">
        {/* Logo */}
        <div className="font-serif text-2xl text-white">
          Hospeda{" "}
          <span className="text-[#2563EB]">Temporada</span>
        </div>

        {/* Links */}
        <nav className="flex flex-wrap justify-center gap-6 font-sans text-sm text-white/60">
          <a href="#imoveis" className="hover:text-white transition-colors">
            Imóveis
          </a>
          <a href="#contato" className="hover:text-white transition-colors">
            Contato
          </a>
          <a
            href="https://instagram.com/sitioiluminadotemporada"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors"
          >
            Instagram
          </a>
          <a
            href="https://wa.me/5511941942210"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors"
          >
            WhatsApp
          </a>
        </nav>

        {/* Divider */}
        <div className="w-full max-w-xs h-px bg-white/10" />

        {/* Copyright */}
        <p className="font-sans text-xs text-white/40 text-center">
          &copy; 2026 Hospeda Temporada — Arlei Proprietário Direto
        </p>
      </div>
    </footer>
  );
}
