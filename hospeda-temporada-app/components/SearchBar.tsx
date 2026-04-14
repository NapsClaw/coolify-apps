"use client";

import { useState } from "react";

interface SearchBarProps {
  onFilter: (query: string, type: string) => void;
}

export default function SearchBar({ onFilter }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onFilter(query, type);
  }

  function handleQueryChange(value: string) {
    setQuery(value);
    onFilter(value, type);
  }

  function handleTypeChange(value: string) {
    setType(value);
    onFilter(query, value);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 flex flex-col gap-5"
    >
      <h2 className="font-serif text-2xl sm:text-3xl text-[#111827]">
        Encontre seu imóvel ideal
      </h2>

      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search input */}
        <input
          type="text"
          placeholder="Buscar por nome ou cidade..."
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          className="flex-1 border border-[#BFDBFE] rounded-xl px-4 py-3 font-sans text-[#111827] placeholder:text-[#4B5563]/50 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] transition-colors"
        />

        {/* Type select */}
        <select
          value={type}
          onChange={(e) => handleTypeChange(e.target.value)}
          className="border border-[#BFDBFE] rounded-xl px-4 py-3 font-sans text-[#111827] bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] transition-colors sm:w-52"
        >
          <option value="">Todos</option>
          <option value="temporada">🏖️ Temporada</option>
          <option value="festa">🎉 Festa/Evento</option>
          <option value="formatura">🎓 Formatura</option>
          <option value="venda">🏷️ Venda</option>
        </select>

        {/* Search button */}
        <button
          type="submit"
          className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-sans font-semibold px-6 py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          Buscar
        </button>
      </div>
    </form>
  );
}
