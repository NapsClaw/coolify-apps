export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-[#111827] overflow-hidden">
      {/* Background image overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1920&q=80')",
        }}
      />

      <div className="relative z-10 max-w-3xl mx-auto px-6 text-center flex flex-col items-center gap-6">
        {/* Tag */}
        <span className="inline-block bg-white/10 backdrop-blur-sm text-white/90 text-sm font-sans px-4 py-2 rounded-full tracking-wide">
          🏠 Temporada · Eventos · Festas · Formaturas
        </span>

        {/* Heading */}
        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-white leading-tight">
          Reserve online,{" "}
          <em className="text-[#2563EB] not-italic italic">sem complicação</em>
        </h1>

        {/* Subtitle */}
        <p className="text-white/70 font-sans text-base sm:text-lg max-w-xl leading-relaxed">
          Calendário de reservas em tempo real — datas bloqueadas
          automaticamente. Escolha o imóvel, selecione as datas e envie sua
          solicitação direto pelo WhatsApp.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-2 w-full sm:w-auto">
          <a
            href="#imoveis"
            className="inline-flex items-center justify-center bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-sans font-semibold px-8 py-4 rounded-full text-base transition-colors"
          >
            Ver imóveis disponíveis
          </a>
          <a
            href="https://wa.me/5511941942210"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center border-2 border-white/30 hover:border-white/60 text-white font-sans font-semibold px-8 py-4 rounded-full text-base transition-colors"
          >
            Falar no WhatsApp
          </a>
        </div>
      </div>

      {/* Stats bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/40 backdrop-blur-sm border-t border-white/10">
        <div className="max-w-4xl mx-auto flex items-center justify-around py-5 px-6 text-white font-sans text-sm sm:text-base">
          <div className="flex flex-col items-center gap-1">
            <span className="font-bold text-lg sm:text-xl">9+</span>
            <span className="text-white/60 text-xs sm:text-sm">Imóveis</span>
          </div>
          <div className="w-px h-8 bg-white/20" />
          <div className="flex flex-col items-center gap-1">
            <span className="font-bold text-lg sm:text-xl">SP · PE</span>
            <span className="text-white/60 text-xs sm:text-sm">Regiões</span>
          </div>
          <div className="w-px h-8 bg-white/20" />
          <div className="flex flex-col items-center gap-1">
            <span className="font-bold text-lg sm:text-xl">Online</span>
            <span className="text-white/60 text-xs sm:text-sm">Reserva</span>
          </div>
        </div>
      </div>
    </section>
  );
}
