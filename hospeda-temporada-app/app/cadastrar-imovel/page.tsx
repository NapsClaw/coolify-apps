'use client';

import { useRef, useState } from 'react';

const PROPERTY_TYPES = ['Sítio', 'Chácara', 'Casa de campo', 'Chalé', 'Apartamento Praia', 'Kitnet', 'Outro'];
const INTENTS = [
  { value: 'temporada', label: 'Locação por temporada' },
  { value: 'eventos', label: 'Eventos / Festas' },
  { value: 'venda', label: 'Venda' },
  { value: 'ambos', label: 'Temporada + Venda' },
];
const AMENITIES = [
  'Wi-Fi', 'Ar-condicionado', 'Piscina', 'Churrasqueira', 'Cozinha equipada', 'TV',
  'Lareira', 'Aquecimento', 'Estacionamento', 'Área gourmet', 'Salão de festas',
  'Jardim', 'Varanda', 'Sauna', 'Jacuzzi', 'Acessibilidade', 'Aceita pets',
  'Berço / Cadeirinha', 'Lavanderia', 'Segurança 24h',
];

interface FormState {
  // Seção 1
  name: string;
  phone: string;
  email: string;
  propertyName: string;
  propertyType: string;
  city: string;
  address: string;
  mapsLink: string;
  // Seção 2 — Detalhes
  guests: string;
  bedrooms: string;
  beds: string;
  bathrooms: string;
  area: string;
  // Seção 3 — Comodidades
  amenities: string[];
  // Seção 4 — Valores
  intent: string;
  priceLow: string;
  priceHigh: string;
  priceWeekend: string;
  minNights: string;
  checkin: string;
  checkout: string;
  // Seção 5 — Regras
  allowEvents: string;
  allowChildren: string;
  allowSmoking: string;
  allowPets: string;
  // Seção 6 — Descrição
  description: string;
}

const INITIAL: FormState = {
  name: '', phone: '', email: '',
  propertyName: '', propertyType: '', city: '', address: '', mapsLink: '',
  guests: '', bedrooms: '', beds: '', bathrooms: '', area: '',
  amenities: [],
  intent: 'temporada',
  priceLow: '', priceHigh: '', priceWeekend: '', minNights: '',
  checkin: '', checkout: '',
  allowEvents: '', allowChildren: '', allowSmoking: '', allowPets: '',
  description: '',
};

export default function CadastrarImovelPage() {
  const [f, setF] = useState<FormState>(INITIAL);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setF(prev => ({ ...prev, [key]: value }));
  }

  function toggleAmenity(a: string) {
    setF(prev => ({
      ...prev,
      amenities: prev.amenities.includes(a)
        ? prev.amenities.filter(x => x !== a)
        : [...prev.amenities, a],
    }));
  }

  function onPickFiles(list: FileList | null) {
    if (!list) return;
    const picked = Array.from(list).slice(0, 15 - files.length);
    const next = [...files, ...picked].slice(0, 15);
    setFiles(next);
    setPreviews(next.map(f => URL.createObjectURL(f)));
  }

  function removeFile(idx: number) {
    const next = files.filter((_, i) => i !== idx);
    setFiles(next);
    setPreviews(next.map(f => URL.createObjectURL(f)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!f.name.trim()) return setError('Informe o nome do responsável');
    if (!f.phone.trim()) return setError('Informe o telefone / WhatsApp');
    if (!f.address.trim() && !f.city.trim()) return setError('Informe o endereço ou cidade');

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('name', f.name);
      fd.append('phone', f.phone);
      if (f.email) fd.append('email', f.email);
      fd.append('address', [f.address, f.city].filter(Boolean).join(' — ') || f.address || f.city);
      fd.append('intent', f.intent);
      if (f.description) fd.append('description', f.description);

      const details = {
        propertyName: f.propertyName || null,
        propertyType: f.propertyType || null,
        city: f.city || null,
        mapsLink: f.mapsLink || null,
        capacity: { guests: f.guests, bedrooms: f.bedrooms, beds: f.beds, bathrooms: f.bathrooms, area: f.area },
        amenities: f.amenities,
        pricing: {
          priceLow: f.priceLow,
          priceHigh: f.priceHigh,
          priceWeekend: f.priceWeekend,
          minNights: f.minNights,
          checkin: f.checkin,
          checkout: f.checkout,
        },
        rules: {
          allowEvents: f.allowEvents,
          allowChildren: f.allowChildren,
          allowSmoking: f.allowSmoking,
          allowPets: f.allowPets,
        },
      };
      fd.append('details', JSON.stringify(details));
      for (const file of files) fd.append('images', file);

      const res = await fetch('/api/submissions', { method: 'POST', body: fd });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || 'Erro ao enviar');
      setDone(true);
      setF(INITIAL);
      setFiles([]);
      setPreviews([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar cadastro');
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-5 py-20">
        <div className="bg-white rounded-2xl shadow-xl max-w-xl w-full p-8 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-[#ECFDF5] flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-[#22c55e]" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          </div>
          <h1 className="text-2xl font-bold text-[#111827] mb-2">Cadastro enviado!</h1>
          <p className="text-[#4B5563] mb-6">Recebemos os dados do seu imóvel. Em breve entraremos em contato pelo WhatsApp para validar as informações e publicar.</p>
          <div className="flex gap-3 justify-center">
            <a href="/" className="bg-[#2563EB] text-white px-5 py-2.5 rounded-lg font-semibold text-sm">Voltar ao site</a>
            <button onClick={() => setDone(false)} className="border border-[#D1D5DB] text-[#111827] px-5 py-2.5 rounded-lg font-semibold text-sm">Enviar outro imóvel</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <nav className="bg-white border-b border-[#E5E7EB] px-5 py-3 flex items-center justify-between sticky top-0 z-50">
        <a href="/" className="flex items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Hospeda Temporada" className="h-12 sm:h-14 w-auto object-contain" />
        </a>
        <a href="/" className="text-sm text-[#2563EB] font-semibold">← Voltar</a>
      </nav>

      <div className="max-w-3xl mx-auto px-5 py-8 sm:py-12">
        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#111827] mb-2">🏡 Cadastre seu imóvel</h1>
          <p className="text-[#4B5563] text-base">Sítio, chácara, casa de campo, chalé, apartamento na praia ou kitnet — preencha os dados e nossa equipe entra em contato.</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Seção 1 — Informações Básicas */}
          <Section title="📍 1. Informações básicas">
            <Field label="Nome do imóvel">
              <input className={inputClass} value={f.propertyName} onChange={e => set('propertyName', e.target.value)} placeholder="Ex: Sítio Recanto das Pedras" />
            </Field>
            <Field label="Tipo">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {PROPERTY_TYPES.map(t => (
                  <button key={t} type="button"
                    onClick={() => set('propertyType', t)}
                    className={`text-sm py-2 px-3 rounded-lg border transition ${f.propertyType === t ? 'border-[#2563EB] bg-[#EFF6FF] text-[#1E40AF] font-semibold' : 'border-[#D1D5DB] text-[#4B5563]'}`}>
                    {t}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Cidade / Região">
              <input className={inputClass} value={f.city} onChange={e => set('city', e.target.value)} placeholder="Ex: Atibaia / SP" />
            </Field>
            <Field label="Endereço completo">
              <input className={inputClass} value={f.address} onChange={e => set('address', e.target.value)} placeholder="Rua, número, bairro, CEP" />
            </Field>
            <Field label="Link Google Maps (opcional)">
              <input className={inputClass} type="url" value={f.mapsLink} onChange={e => set('mapsLink', e.target.value)} placeholder="https://maps.google.com/..." />
            </Field>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Nome do responsável *" required>
                <input className={inputClass} required value={f.name} onChange={e => set('name', e.target.value)} />
              </Field>
              <Field label="Telefone / WhatsApp *" required>
                <input className={inputClass} required type="tel" value={f.phone} onChange={e => set('phone', e.target.value)} placeholder="(11) 99999-9999" />
              </Field>
            </div>
            <Field label="Email (opcional)">
              <input className={inputClass} type="email" value={f.email} onChange={e => set('email', e.target.value)} />
            </Field>
          </Section>

          {/* Seção 2 — Detalhes */}
          <Section title="🏠 2. Detalhes do imóvel">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <Field label="Hóspedes"><input className={inputClass} type="number" min="0" value={f.guests} onChange={e => set('guests', e.target.value)} /></Field>
              <Field label="Quartos"><input className={inputClass} type="number" min="0" value={f.bedrooms} onChange={e => set('bedrooms', e.target.value)} /></Field>
              <Field label="Camas"><input className={inputClass} type="number" min="0" value={f.beds} onChange={e => set('beds', e.target.value)} /></Field>
              <Field label="Banheiros"><input className={inputClass} type="number" min="0" value={f.bathrooms} onChange={e => set('bathrooms', e.target.value)} /></Field>
              <Field label="Área (m²)"><input className={inputClass} type="number" min="0" value={f.area} onChange={e => set('area', e.target.value)} /></Field>
            </div>
          </Section>

          {/* Seção 3 — Comodidades */}
          <Section title="✨ 3. Comodidades">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {AMENITIES.map(a => {
                const checked = f.amenities.includes(a);
                return (
                  <button key={a} type="button" onClick={() => toggleAmenity(a)}
                    className={`text-left text-sm py-2 px-3 rounded-lg border transition flex items-center gap-2 ${checked ? 'border-[#2563EB] bg-[#EFF6FF] text-[#1E40AF] font-semibold' : 'border-[#D1D5DB] text-[#4B5563]'}`}>
                    <span className={`w-4 h-4 rounded border flex items-center justify-center ${checked ? 'bg-[#2563EB] border-[#2563EB]' : 'border-[#9CA3AF]'}`}>
                      {checked && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                    </span>
                    {a}
                  </button>
                );
              })}
            </div>
          </Section>

          {/* Seção 4 — Valores */}
          <Section title="💰 4. Finalidade e valores">
            <Field label="Finalidade">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {INTENTS.map(i => (
                  <button key={i.value} type="button"
                    onClick={() => set('intent', i.value)}
                    className={`text-sm py-2 px-3 rounded-lg border transition ${f.intent === i.value ? 'border-[#2563EB] bg-[#EFF6FF] text-[#1E40AF] font-semibold' : 'border-[#D1D5DB] text-[#4B5563]'}`}>
                    {i.label}
                  </button>
                ))}
              </div>
            </Field>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Field label="Diária — baixa temporada">
                <input className={inputClass} value={f.priceLow} onChange={e => set('priceLow', e.target.value)} placeholder="R$ 350" />
              </Field>
              <Field label="Diária — alta temporada">
                <input className={inputClass} value={f.priceHigh} onChange={e => set('priceHigh', e.target.value)} placeholder="R$ 700" />
              </Field>
              <Field label="Diária — fim de semana">
                <input className={inputClass} value={f.priceWeekend} onChange={e => set('priceWeekend', e.target.value)} placeholder="R$ 500" />
              </Field>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Field label="Estadia mínima">
                <input className={inputClass} value={f.minNights} onChange={e => set('minNights', e.target.value)} placeholder="Ex: 2 noites" />
              </Field>
              <Field label="Check-in"><input className={inputClass} type="time" value={f.checkin} onChange={e => set('checkin', e.target.value)} /></Field>
              <Field label="Check-out"><input className={inputClass} type="time" value={f.checkout} onChange={e => set('checkout', e.target.value)} /></Field>
            </div>
          </Section>

          {/* Seção 5 — Regras */}
          <Section title="📋 5. Regras da casa">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <YesNo label="Permite eventos/festas?" value={f.allowEvents} onChange={v => set('allowEvents', v)} />
              <YesNo label="Permite crianças?" value={f.allowChildren} onChange={v => set('allowChildren', v)} />
              <YesNo label="Permite fumar?" value={f.allowSmoking} onChange={v => set('allowSmoking', v)} />
              <YesNo label="Aceita pets?" value={f.allowPets} onChange={v => set('allowPets', v)} />
            </div>
          </Section>

          {/* Seção 6 — Descrição */}
          <Section title="📝 6. Descrição e diferenciais">
            <Field label="Descreva o imóvel (opcional)">
              <textarea className={`${inputClass} min-h-[120px]`} rows={5} value={f.description} onChange={e => set('description', e.target.value)} placeholder="Conte o que torna seu imóvel especial..." />
            </Field>
          </Section>

          {/* Seção 7 — Fotos */}
          <Section title="📸 7. Fotos do imóvel (até 15)">
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={e => onPickFiles(e.target.files)} />
            <button type="button" onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-[#D1D5DB] rounded-xl p-8 text-center hover:border-[#2563EB] transition">
              <div className="text-3xl mb-2">📷</div>
              <div className="text-sm font-semibold text-[#111827]">Clique para enviar fotos</div>
              <div className="text-xs text-[#6B7280] mt-1">JPG, PNG ou WebP • até 8MB cada • {files.length}/15</div>
            </button>
            {previews.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mt-3">
                {previews.map((src, i) => (
                  <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-[#E5E7EB]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeFile(i)}
                      className="absolute top-1 right-1 bg-black/70 text-white w-6 h-6 rounded-full text-xs">×</button>
                  </div>
                ))}
              </div>
            )}
          </Section>

          {error && (
            <div className="bg-[#FEF2F2] border border-[#FECACA] text-[#B91C1C] px-4 py-3 rounded-lg text-sm">{error}</div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button type="submit" disabled={submitting}
              className="flex-1 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:bg-[#9CA3AF] text-white py-3.5 rounded-lg font-semibold text-base transition">
              {submitting ? 'Enviando...' : 'Enviar cadastro'}
            </button>
            <a href="/" className="sm:w-auto text-center border border-[#D1D5DB] text-[#111827] py-3.5 px-6 rounded-lg font-semibold text-base">
              Cancelar
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Subcomponents ───

const inputClass = 'w-full border border-[#D1D5DB] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] p-5 sm:p-6 space-y-4">
      <h2 className="text-lg font-bold text-[#111827]">{title}</h2>
      {children}
    </section>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-[#374151] mb-1.5">
        {label} {required && <span className="text-[#DC2626]">*</span>}
      </span>
      {children}
    </label>
  );
}

function YesNo({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <div className="text-sm font-medium text-[#374151] mb-1.5">{label}</div>
      <div className="flex gap-2">
        {['Sim', 'Não'].map(opt => (
          <button key={opt} type="button" onClick={() => onChange(value === opt ? '' : opt)}
            className={`flex-1 text-sm py-2 px-3 rounded-lg border transition ${value === opt ? 'border-[#2563EB] bg-[#EFF6FF] text-[#1E40AF] font-semibold' : 'border-[#D1D5DB] text-[#4B5563]'}`}>
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
