"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { Property } from "@/components/types";
import SearchBar from "@/components/SearchBar";
import PropertyCard from "@/components/PropertyCard";
import PropertyModal from "@/components/PropertyModal";

interface PropertyGridProps {
  initialProperties: Property[];
}

const QUERY_PARAM = "imovel";

export default function PropertyGrid({ initialProperties: properties }: PropertyGridProps) {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null
  );

  const openProperty = useCallback(
    (property: Property | null) => {
      setSelectedProperty(property);
      if (typeof window === "undefined") return;
      const url = new URL(window.location.href);
      if (property) {
        url.searchParams.set(QUERY_PARAM, property.id);
      } else {
        url.searchParams.delete(QUERY_PARAM);
      }
      window.history.replaceState({}, "", url.toString());
    },
    []
  );

  // Open modal from URL on mount + react to back/forward
  useEffect(() => {
    if (typeof window === "undefined") return;
    const sync = () => {
      const id = new URL(window.location.href).searchParams.get(QUERY_PARAM);
      const found = id ? properties.find((p) => p.id === id) ?? null : null;
      setSelectedProperty(found);
    };
    sync();
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, [properties]);

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
                onOpen={() => openProperty(property)}
              />
            ))}
          </div>
        )}
      </div>

      <PropertyModal
        property={selectedProperty}
        onClose={() => openProperty(null)}
      />
    </section>
  );
}
