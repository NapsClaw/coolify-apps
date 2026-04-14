"use client";

import { useState, useMemo } from "react";
import { Property } from "@/components/types";
import SearchBar from "@/components/SearchBar";
import PropertyCard from "@/components/PropertyCard";
import PropertyModal from "@/components/PropertyModal";

interface PropertyGridProps {
  initialProperties: Property[];
}

export default function PropertyGrid({ initialProperties: properties }: PropertyGridProps) {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null
  );

  function handleFilter(q: string, t: string) {
    setQuery(q);
    setTypeFilter(t);
  }

  const filtered = useMemo(() => {
    return properties.filter((p) => {
      // Text search
      if (query) {
        const q = query.toLowerCase();
        const matchesText =
          p.name.toLowerCase().includes(q) ||
          p.location.toLowerCase().includes(q);
        if (!matchesText) return false;
      }

      // Type filter
      if (typeFilter) {
        const t = typeFilter.toLowerCase();
        if (!p.type.toLowerCase().includes(t)) return false;
      }

      return true;
    });
  }, [properties, query, typeFilter]);

  return (
    <section id="imoveis" className="bg-[#F8FAFC] py-16 px-6">
      <div className="max-w-6xl mx-auto flex flex-col gap-8">
        <SearchBar onFilter={handleFilter} />

        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="font-sans text-[#4B5563] text-lg">
              Nenhum imóvel encontrado para sua busca.
            </p>
            <button
              onClick={() => handleFilter("", "")}
              className="mt-4 text-[#2563EB] font-sans font-semibold hover:underline"
            >
              Limpar filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 min-[640px]:grid-cols-2 min-[960px]:grid-cols-3 gap-6">
            {filtered.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                onOpen={() => setSelectedProperty(property)}
              />
            ))}
          </div>
        )}
      </div>

      <PropertyModal
        property={selectedProperty}
        onClose={() => setSelectedProperty(null)}
      />
    </section>
  );
}
