"use client";

import { useState, useEffect, useCallback } from "react";
import { Property, BlockedDateRange, MinNightsViolation } from "@/components/types";
import Calendar from "@/components/Calendar";

interface PropertyModalProps {
  property: Property | null;
  onClose: () => void;
}

function toDateOnly(d: string): string {
  return d.slice(0, 10);
}

function formatBRDate(dateStr: string | null): string {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T12:00:00");
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
}

function eachDayInRange(start: string | null, end: string | null): string[] {
  if (!start || !end) return [];
  const s = toDateOnly(start);
  const e = toDateOnly(end);
  const days: string[] = [];
  const current = new Date(s + "T00:00:00");
  const last = new Date(e + "T00:00:00");
  if (isNaN(current.getTime()) || isNaN(last.getTime())) return [];
  while (current <= last) {
    days.push(current.toISOString().split("T")[0]);
    current.setDate(current.getDate() + 1);
  }
  return days;
}

export default function PropertyModal({ property, onClose }: PropertyModalProps) {
  const [mainImage, setMainImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [blockedDates, setBlockedDates] = useState<Set<string>>(new Set());
  const [pendingDates, setPendingDates] = useState<Set<string>>(new Set());
  const [selectedStart, setSelectedStart] = useState<string | null>(null);
  const [selectedEnd, setSelectedEnd] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nome: "",
    whatsapp: "",
    pessoas: "",
    ocasiao: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Pricing
  const [priceBreakdown, setPriceBreakdown] = useState<{
    has_dynamic_pricing: boolean;
    nights?: number;
    breakdown?: { date: string; label: string; price: number }[];
    subtotal?: number;
    guest_surcharge?: { extra_guests: number; per_night: number; total: number } | null;
    total?: number;
    min_nights_violations?: MinNightsViolation[];
  } | null>(null);
  const [priceLoading, setPriceLoading] = useState(false);

  // Fetch blocked dates
  useEffect(() => {
    if (!property) return;
    setMainImage(0);
    setLightboxOpen(false);
    setSelectedStart(null);
    setSelectedEnd(null);
    setShowSuccess(false);
    setFormData({ nome: "", whatsapp: "", pessoas: "", ocasiao: "" });

    fetch(`/api/reservations?propertyId=${property.id}`)
      .then((r) => r.json())
      .then((data: BlockedDateRange[]) => {
        const blocked = new Set<string>();
        const pending = new Set<string>();
        (data || []).forEach((range) => {
          const days = eachDayInRange(range.date_start, range.date_end);
          days.forEach((d) => {
            if (range.status === "pending") {
              pending.add(d);
            } else {
              blocked.add(d);
            }
          });
        });
        setBlockedDates(blocked);
        setPendingDates(pending);
      })
      .catch(() => {
        setBlockedDates(new Set());
        setPendingDates(new Set());
      });
  }, [property]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!lightboxOpen || !property) return;
    const imgCount = property.images?.length || 1;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false);
      else if (e.key === "ArrowLeft") setMainImage((i) => (i - 1 + imgCount) % imgCount);
      else if (e.key === "ArrowRight") setMainImage((i) => (i + 1) % imgCount);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxOpen, property]);

  const handleSelectDay = useCallback(
    (dateStr: string) => {
      if (!selectedStart || (selectedStart && selectedEnd)) {
        setSelectedStart(dateStr);
        setSelectedEnd(null);
      } else {
        if (dateStr < selectedStart) {
          setSelectedStart(dateStr);
        } else {
          setSelectedEnd(dateStr);
        }
      }
    },
    [selectedStart, selectedEnd]
  );

  // Fetch price only when dates + exact guest count are selected
  useEffect(() => {
    if (!property || !selectedStart || !selectedEnd || !formData.pessoas) {
      setPriceBreakdown(null);
      return;
    }
    const guestCount = parseInt(formData.pessoas, 10);
    if (!Number.isFinite(guestCount) || guestCount < 1) {
      setPriceBreakdown(null);
      return;
    }

    const timer = setTimeout(async () => {
      setPriceLoading(true);
      try {
        const params = new URLSearchParams({
          propertyId: property.id,
          dateStart: selectedStart,
          dateEnd: selectedEnd,
          guests: String(guestCount),
        });
        const res = await fetch(`/api/pricing/calculate?${params}`);
        if (res.ok) {
          setPriceBreakdown(await res.json());
        }
      } catch {
        setPriceBreakdown(null);
      } finally {
        setPriceLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [property, selectedStart, selectedEnd, formData.pessoas]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!property || !selectedStart || !selectedEnd || !formData.pessoas) return;

    setSubmitting(true);

    try {
      await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          property_id: property.id,
          date_start: selectedStart,
          date_end: selectedEnd,
          guest_name: formData.nome,
          guest_phone: formData.whatsapp,
          guest_count: formData.pessoas,
          occasion: formData.ocasiao,
        }),
      });
    } catch {
      // continue to WhatsApp even if API fails
    }

    // Build WhatsApp message
    const msg = [
      `Olá Arlei! Gostaria de reservar:`,
      ``,
      `*Imóvel:* ${property.name}`,
      `*Local:* ${property.location}`,
      `*Check-in:* ${selectedStart}`,
      `*Check-out:* ${selectedEnd}`,
      `*Nome:* ${formData.nome}`,
      `*WhatsApp:* ${formData.whatsapp}`,
      `*Nº pessoas:* ${formData.pessoas}`,
      `*Ocasião:* ${formData.ocasiao}`,
      ``,
      `Aguardo confirmação!`,
    ].join("\n");

    window.open(
      `https://wa.me/5511941942210?text=${encodeURIComponent(msg)}`,
      "_blank"
    );

    setShowSuccess(true);
    setSubmitting(false);
  }

  const violations = priceBreakdown?.min_nights_violations || [];
  const hasViolations = violations.length > 0;

  if (!property) return null;

  const images = property.images?.length
    ? property.images
    : ["https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80"];

  return (
    <div
      className="fixed inset-0 z-[200] flex items-start justify-center overflow-y-auto"
      onClick={onClose}
    >
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/75" />

      {/* Modal */}
      <div
        className="relative z-10 bg-white w-full max-w-[580px] mx-4 my-8 rounded-2xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors"
          aria-label="Fechar"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Success banner */}
        {showSuccess && (
          <div className="bg-[#22c55e] text-white font-sans font-semibold text-center py-3 px-4 text-sm">
            Solicitação enviada com sucesso! Arlei responderá em breve pelo WhatsApp.
          </div>
        )}

        {/* Gallery */}
        <div className="relative group">
          <img
            src={images[mainImage]}
            alt={property.name}
            onClick={() => setLightboxOpen(true)}
            className="w-full h-[280px] sm:h-[320px] object-cover cursor-zoom-in"
          />
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setMainImage((i) => (i - 1 + images.length) % images.length);
                }}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors"
                aria-label="Foto anterior"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setMainImage((i) => (i + 1) % images.length);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors"
                aria-label="Próxima foto"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs font-sans px-2.5 py-1 rounded-full">
                {mainImage + 1} / {images.length}
              </div>
            </>
          )}
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex gap-2 px-5 py-3 overflow-x-auto">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setMainImage(i)}
                className={`flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-colors ${
                  i === mainImage
                    ? "border-[#2563EB]"
                    : "border-transparent hover:border-[#BFDBFE]"
                }`}
              >
                <img
                  src={img}
                  alt={`${property.name} ${i + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}

        {/* Property details */}
        <div className="px-5 py-4 flex flex-col gap-3 border-b border-[#BFDBFE]/30">
          <h2 className="font-serif text-2xl text-[#111827]">{property.name}</h2>

          <p className="text-[#4B5563] font-sans text-sm flex items-center gap-1.5">
            <svg className="w-4 h-4 text-[#2563EB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {property.location}
          </p>

          {/* Features chips */}
          <div className="flex flex-wrap gap-1.5">
            {(property.features || []).map((feature, i) => (
              <span
                key={i}
                className="bg-[#F8FAFC] text-[#4B5563] text-xs font-sans px-2.5 py-1 rounded-full"
              >
                {feature}
              </span>
            ))}
          </div>

          {/* Description */}
          {property.description && (
            <p className="text-[#4B5563] font-sans text-sm leading-relaxed whitespace-pre-line">
              {property.description}
            </p>
          )}

          {/* Price */}
          <div>
            <span className="font-serif text-xl text-[#2563EB] font-bold">
              {property.price}
            </span>
            {property.price_unit && (
              <span className="text-[#4B5563] font-sans text-sm ml-1">
                {property.price_unit}
              </span>
            )}
          </div>
        </div>

        {/* Calendar section */}
        <div className="px-5 py-4 border-b border-[#BFDBFE]/30">
          <h3 className="font-serif text-lg text-[#111827] mb-3">
            Calendário de disponibilidade
          </h3>
          <Calendar
            blockedDates={blockedDates}
            pendingDates={pendingDates}
            selectedStart={selectedStart}
            selectedEnd={selectedEnd}
            onSelectDay={handleSelectDay}
            mode="select"
          />

          {/* Guest selector — above pricing so user sees price update */}
          <div className="mt-4">
            <input
              type="number"
              min="1"
              step="1"
              inputMode="numeric"
              placeholder="Nº de pessoas"
              value={formData.pessoas}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "");
                setFormData({ ...formData, pessoas: value });
              }}
              className="w-full border border-[#BFDBFE] rounded-xl px-4 py-3 font-sans text-[#111827] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB]"
            />
          </div>

          {/* Dynamic price breakdown */}
          {priceLoading && (
            <div className="bg-[#F8FAFC] rounded-xl p-4 mt-4 animate-pulse">
              <div className="h-4 bg-[#BFDBFE]/40 rounded w-1/2 mb-2" />
              <div className="h-6 bg-[#BFDBFE]/40 rounded w-1/3" />
            </div>
          )}
          {!priceLoading && hasViolations && selectedStart && selectedEnd && (
            <div className="bg-red-50 border border-red-300 rounded-xl p-4 mt-4 space-y-2">
              <div className="font-sans font-semibold text-red-700 text-sm">
                Reserva não permitida
              </div>
              <div className="text-xs text-red-700/80">
                Check-in: <strong>{formatBRDate(selectedStart)}</strong> · Check-out: <strong>{formatBRDate(selectedEnd)}</strong> ({priceBreakdown?.nights} {priceBreakdown?.nights === 1 ? 'noite' : 'noites'})
              </div>
              <ul className="text-xs text-red-700 space-y-1 list-disc pl-4">
                {violations.map((v, i) => (
                  <li key={i}>
                    {v.scope === 'global' ? (
                      <><strong>Mínimo geral</strong> exige {v.required} {v.required === 1 ? 'noite' : 'noites'} — você selecionou {v.nights_in_scope}.</>
                    ) : (
                      <><strong>{v.rule_label}</strong> exige {v.required} {v.required === 1 ? 'noite' : 'noites'} dentro do período — você selecionou {v.nights_in_scope}.</>
                    )}
                  </li>
                ))}
              </ul>
              <p className="text-xs text-red-700/70 pt-1">Ajuste o check-out para atender o mínimo.</p>
            </div>
          )}
          {!priceLoading && !hasViolations && priceBreakdown?.has_dynamic_pricing && priceBreakdown.total != null && (
            <div className="bg-[#F8FAFC] rounded-xl p-4 mt-4 space-y-2">
              <div className="text-xs text-[#4B5563]">
                Check-in: <strong className="text-[#111827]">{formatBRDate(selectedStart)}</strong> · Check-out: <strong className="text-[#111827]">{formatBRDate(selectedEnd)}</strong>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-sans text-sm text-[#4B5563]">
                  {priceBreakdown.nights} {priceBreakdown.nights === 1 ? 'noite' : 'noites'}
                </span>
                <span className="font-sans text-sm text-[#111827]">
                  R$ {priceBreakdown.subtotal?.toLocaleString('pt-BR')}
                </span>
              </div>
              {priceBreakdown.guest_surcharge && priceBreakdown.guest_surcharge.total > 0 && (
                <div className="flex justify-between items-center">
                  <span className="font-sans text-sm text-[#4B5563]">
                    +{priceBreakdown.guest_surcharge.extra_guests} hóspedes extras
                  </span>
                  <span className="font-sans text-sm text-[#111827]">
                    R$ {priceBreakdown.guest_surcharge.total.toLocaleString('pt-BR')}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center pt-2 border-t border-[#BFDBFE]/40">
                <span className="font-serif text-base font-bold text-[#111827]">Total</span>
                <span className="font-serif text-xl font-bold text-[#2563EB]">
                  R$ {priceBreakdown.total.toLocaleString('pt-BR')}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Reservation form */}
        <form onSubmit={handleSubmit} className="px-5 py-5 flex flex-col gap-4">
          <h3 className="font-serif text-lg text-[#111827]">
            Solicitar reserva
          </h3>

          {/* Check-in / Check-out display */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#F8FAFC] rounded-xl px-4 py-3">
              <span className="text-xs font-sans text-[#4B5563] block">Check-in</span>
              <span className="font-sans font-semibold text-[#111827] text-sm">
                {selectedStart ? formatBRDate(selectedStart) : "Selecione no calendário"}
              </span>
              {property.checkin_time && (
                <span className="block text-xs text-[#2563EB] font-sans mt-0.5">a partir das {property.checkin_time}</span>
              )}
            </div>
            <div className="bg-[#F8FAFC] rounded-xl px-4 py-3">
              <span className="text-xs font-sans text-[#4B5563] block">Check-out</span>
              <span className="font-sans font-semibold text-[#111827] text-sm">
                {selectedEnd ? formatBRDate(selectedEnd) : "Selecione no calendário"}
              </span>
              {property.checkout_time && (
                <span className="block text-xs text-[#2563EB] font-sans mt-0.5">até às {property.checkout_time}</span>
              )}
            </div>
          </div>

          {/* Name */}
          <input
            type="text"
            placeholder="Seu nome"
            required
            value={formData.nome}
            onChange={(e) =>
              setFormData({ ...formData, nome: e.target.value })
            }
            className="border border-[#BFDBFE] rounded-xl px-4 py-3 font-sans text-[#111827] text-sm placeholder:text-[#4B5563]/50 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB]"
          />

          {/* WhatsApp */}
          <input
            type="tel"
            placeholder="WhatsApp (com DDD)"
            required
            value={formData.whatsapp}
            onChange={(e) =>
              setFormData({ ...formData, whatsapp: e.target.value })
            }
            className="border border-[#BFDBFE] rounded-xl px-4 py-3 font-sans text-[#111827] text-sm placeholder:text-[#4B5563]/50 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB]"
          />

          {/* Occasion */}
          <select
            required
            value={formData.ocasiao}
            onChange={(e) =>
              setFormData({ ...formData, ocasiao: e.target.value })
            }
            className="border border-[#BFDBFE] rounded-xl px-4 py-3 font-sans text-[#111827] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB]"
          >
            <option value="">Ocasião</option>
            <option value="Temporada/Férias">Temporada/Férias</option>
            <option value="Festa/Evento">Festa/Evento</option>
            <option value="Formatura">Formatura</option>
            <option value="Aniversário">Aniversário</option>
            <option value="Casamento">Casamento</option>
            <option value="Corporativo">Corporativo</option>
            <option value="Outro">Outro</option>
          </select>

          {/* Submit */}
          <button
            type="submit"
            disabled={!selectedStart || !selectedEnd || !formData.pessoas || submitting || hasViolations}
            className="bg-[#2563EB] hover:bg-[#1D4ED8] disabled:bg-[#BFDBFE] disabled:cursor-not-allowed text-white font-sans font-semibold py-4 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
          >
            {submitting ? (
              "Enviando..."
            ) : (
              <>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Enviar solicitação via WhatsApp
              </>
            )}
          </button>
        </form>

        {/* Direct WhatsApp */}
        <div className="px-5 pb-5">
          <a
            href={`https://wa.me/5511941942210?text=${encodeURIComponent(
              `Olá! Tenho interesse no imóvel: ${property.name} (${property.location})`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center bg-[#25D366] hover:bg-[#1da851] text-white font-sans font-semibold py-3 rounded-xl transition-colors text-sm"
          >
            Ou fale direto no WhatsApp
          </a>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[300] bg-black/95 flex items-center justify-center"
          onClick={(e) => {
            e.stopPropagation();
            setLightboxOpen(false);
          }}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxOpen(false);
            }}
            className="absolute top-4 right-4 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            aria-label="Fechar"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <img
            src={images[mainImage]}
            alt={property.name}
            onClick={(e) => e.stopPropagation()}
            className="max-w-[94vw] max-h-[88vh] object-contain select-none"
          />

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setMainImage((i) => (i - 1 + images.length) % images.length);
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                aria-label="Foto anterior"
              >
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setMainImage((i) => (i + 1) % images.length);
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                aria-label="Próxima foto"
              >
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/10 text-white text-sm font-sans px-3 py-1.5 rounded-full">
                {mainImage + 1} / {images.length}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
