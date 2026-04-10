export default function AboutSection() {
  return (
    <section className="bg-[#F7F2EB] py-20 px-6">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-10 items-center">
        {/* Image */}
        <div className="w-full md:w-1/2 flex-shrink-0">
          <img
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80"
            alt="Imóveis de temporada"
            className="w-full h-[360px] object-cover rounded-2xl shadow-lg"
            loading="lazy"
          />
        </div>

        {/* Text */}
        <div className="w-full md:w-1/2 flex flex-col gap-5">
          <span className="inline-block bg-[#AC4747]/10 text-[#AC4747] text-sm font-sans font-semibold px-4 py-1.5 rounded-full w-fit">
            Sobre
          </span>

          <h2 className="font-serif text-3xl sm:text-4xl text-[#1a1410] leading-tight">
            Arlei — proprietário direto
          </h2>

          <p className="text-[#5a4f45] font-sans text-base leading-relaxed">
            Cuido pessoalmente de cada imóvel do portfólio. Sem intermediários,
            sem taxas ocultas. Você fala direto comigo pelo WhatsApp, escolhe as
            datas no calendário em tempo real e garante sua reserva em minutos.
          </p>

          {/* Chips */}
          <div className="flex flex-wrap gap-2 mt-2">
            {[
              "✅ Reserva 100% online",
              "📅 Calendário em tempo real",
              "🚫 Sem double booking",
              "🏠 9+ imóveis",
              "🎉 Eventos & festas",
              "🇧🇷 SP · PE",
            ].map((chip) => (
              <span
                key={chip}
                className="bg-white text-[#1a1410] font-sans text-sm px-3 py-2 rounded-full shadow-sm"
              >
                {chip}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
