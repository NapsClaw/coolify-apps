"use client";

import { Property } from "@/components/types";

interface PropertyCardProps {
  property: Property;
  onOpen: () => void;
}

export default function PropertyCard({ property, onOpen }: PropertyCardProps) {
  const whatsappUrl = `https://wa.me/5511941942210?text=${encodeURIComponent(
    `Olá! Tenho interesse no imóvel: ${property.name} (${property.location}). Poderia me passar mais informações?`
  )}`;

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col">
      {/* Image */}
      <div className="relative h-[220px] overflow-hidden">
        <img
          src={
            property.images?.[0] ||
            "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&q=80"
          }
          alt={property.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />

        {/* Badge */}
        {property.badge && (
          <span className="absolute top-3 left-3 bg-[#AC4747] text-white text-xs font-sans font-semibold px-3 py-1.5 rounded-full">
            {property.badge}
          </span>
        )}

        {/* Availability */}
        <span className="absolute top-3 right-3 bg-[#22c55e] text-white text-xs font-sans font-semibold px-3 py-1.5 rounded-full flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
          Disponível
        </span>
      </div>

      {/* Body */}
      <div className="p-5 flex flex-col flex-1 gap-3">
        <h3 className="font-serif text-xl text-[#1a1410] leading-snug">
          {property.name}
        </h3>

        <p className="text-[#5a4f45] font-sans text-sm flex items-center gap-1.5">
          <svg
            className="w-4 h-4 text-[#AC4747]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          {property.location}
        </p>

        {/* Features */}
        <div className="flex flex-wrap gap-1.5">
          {(property.features || []).slice(0, 3).map((feature, i) => (
            <span
              key={i}
              className="bg-[#F7F2EB] text-[#5a4f45] text-xs font-sans px-2.5 py-1 rounded-full"
            >
              {feature}
            </span>
          ))}
        </div>

        {/* Price */}
        <div className="mt-auto pt-3 border-t border-[#d4c9b8]/40">
          {property.base_price ? (
            <>
              <span className="text-[#5a4f45] font-sans text-xs">a partir de </span>
              <span className="font-serif text-xl text-[#AC4747] font-bold">
                R$ {property.base_price.toLocaleString('pt-BR')}
              </span>
              <span className="text-[#5a4f45] font-sans text-sm ml-1">/noite</span>
            </>
          ) : (
            <>
              <span className="font-serif text-xl text-[#AC4747] font-bold">
                {property.price}
              </span>
              {property.price_unit && (
                <span className="text-[#5a4f45] font-sans text-sm ml-1">
                  {property.price_unit}
                </span>
              )}
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-1">
          <button
            onClick={onOpen}
            className="flex-1 bg-[#AC4747] hover:bg-[#8a3636] text-white font-sans font-semibold text-sm py-3 rounded-xl transition-colors"
          >
            Ver calendário
          </button>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#25D366] hover:bg-[#1da851] text-white font-sans font-semibold text-sm py-3 px-4 rounded-xl transition-colors flex items-center"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
