'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

// ─── Types ───

interface Property {
  id: string;
  name: string;
  location: string;
  type: string;
  badge: string;
  price: string;
  price_unit: string;
  guests: string;
  features: string[] | string;
  description: string;
  images: string[] | string;
  sort_order: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

interface Reservation {
  id: number;
  property_id: string;
  date_start: string | Date;
  date_end: string | Date;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  type: 'guest' | 'manual';
  guest_name: string | null;
  guest_phone: string | null;
  guest_count: string | null;
  occasion: string | null;
  reason: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Constants ───

const MONTHS_PT = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

const DAYS_PT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const PROPERTY_TYPES = [
  { value: 'temporada', label: 'Temporada' },
  { value: 'festa', label: 'Festa' },
  { value: 'venda', label: 'Venda' },
];

const BLOCK_REASONS = [
  { value: 'Reservado', label: 'Reservado' },
  { value: 'Manutenção', label: 'Manutenção' },
  { value: 'Uso pessoal', label: 'Uso pessoal' },
  { value: 'Outro', label: 'Outro' },
];

const WHATSAPP = '5511941942210';

// ─── Helpers ───

function relativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'agora mesmo';
  if (diffMin < 60) return `há ${diffMin} minuto${diffMin > 1 ? 's' : ''}`;
  if (diffHour < 24) return `há ${diffHour} hora${diffHour > 1 ? 's' : ''}`;
  if (diffDay < 30) return `há ${diffDay} dia${diffDay > 1 ? 's' : ''}`;
  const diffMonth = Math.floor(diffDay / 30);
  return `há ${diffMonth} ${diffMonth > 1 ? 'meses' : 'mês'}`;
}

function toDateStr(d: string | Date): string {
  if (typeof d === 'string') return d.slice(0, 10);
  return (d as Date).toISOString().slice(0, 10);
}

function formatDate(dateStr: string | Date): string {
  const str = toDateStr(dateStr);
  const d = new Date(str + 'T12:00:00');
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function toISODate(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function parseImages(images: string[] | string | undefined): string[] {
  if (!images) return [];
  if (Array.isArray(images)) return images;
  try { return JSON.parse(images); } catch { return []; }
}

function parseFeatures(features: string[] | string | undefined): string[] {
  if (!features) return [];
  if (Array.isArray(features)) return features;
  try { return JSON.parse(features); } catch { return []; }
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

function isDateInRange(dateStr: string, start: string | Date, end: string | Date): boolean {
  const startStr = toDateStr(start);
  const endStr = toDateStr(end);
  return dateStr >= startStr && dateStr <= endStr;
}

// ─── Main Component ───

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<'reservas' | 'calendario' | 'imoveis' | 'precos'>('reservas');

  const [properties, setProperties] = useState<Property[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [pendingReservations, setPendingReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(false);

  // Reservas tab filters
  const [filterProperty, setFilterProperty] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Calendar tab
  const [calendarProperty, setCalendarProperty] = useState('');
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [calendarReservations, setCalendarReservations] = useState<Reservation[]>([]);
  const [blockStart, setBlockStart] = useState<string | null>(null);
  const [blockEnd, setBlockEnd] = useState<string | null>(null);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [blockReason, setBlockReason] = useState('Reservado');
  const [blockNotes, setBlockNotes] = useState('');
  const [showDayDetail, setShowDayDetail] = useState<Reservation | null>(null);

  // Imoveis tab
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [showPropertyForm, setShowPropertyForm] = useState(false);
  const [propertyForm, setPropertyForm] = useState({
    id: '', name: '', location: '', type: 'temporada', badge: '', price: '',
    price_unit: '', guests: '', description: '', features: '', images: '',
    sort_order: 0, active: true,
  });

  const [actionLoading, setActionLoading] = useState<number | string | null>(null);
  const [uploadingImages, setUploadingImages] = useState(false);

  // Precos tab
  interface PricingRuleLocal {
    id: number;
    property_id: string;
    rule_type: string;
    price_per_night: number | null;
    weekend_days: number[];
    season_start_month: number | null;
    season_start_day: number | null;
    season_end_month: number | null;
    season_end_day: number | null;
    date_start: string | null;
    date_end: string | null;
    min_guests: number | null;
    price_per_extra_guest: number | null;
    label: string | null;
    priority: number;
    active: boolean;
  }
  const [pricingProperty, setPricingProperty] = useState('');
  const [pricingRules, setPricingRules] = useState<PricingRuleLocal[]>([]);
  const [pricingLoading, setPricingLoading] = useState(false);
  const [pricingMonth, setPricingMonth] = useState(new Date().getMonth());
  const [pricingYear, setPricingYear] = useState(new Date().getFullYear());
  const [localPrices, setLocalPrices] = useState<Record<string, string>>({});
  const priceTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  // ─── Auth ───

  const getStoredPassword = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('admin_password') || '';
    }
    return '';
  };

  const fetchApi = useCallback(async (url: string, options: RequestInit & { raw?: boolean } = {}) => {
    const storedPw = getStoredPassword();
    const { raw, ...fetchOptions } = options;
    const headers: Record<string, string> = {
      'x-admin-password': storedPw,
    };
    if (!raw) {
      headers['Content-Type'] = 'application/json';
    }
    const res = await fetch(url, {
      ...fetchOptions,
      headers: {
        ...headers,
        ...(fetchOptions.headers as Record<string, string> || {}),
      },
    });
    if (res.status === 401) {
      setAuthenticated(false);
      localStorage.removeItem('admin_password');
      throw new Error('Unauthorized');
    }
    return res;
  }, []);

  // Check stored password on mount
  useEffect(() => {
    const stored = getStoredPassword();
    if (stored) {
      setPassword(stored);
      fetch('/api/reservations?pending=true', {
        headers: { 'x-admin-password': stored },
      }).then(res => {
        if (res.ok) setAuthenticated(true);
        else localStorage.removeItem('admin_password');
      }).catch(() => {});
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');
    try {
      const res = await fetch('/api/reservations?pending=true', {
        headers: { 'x-admin-password': password },
      });
      if (res.ok) {
        localStorage.setItem('admin_password', password);
        setAuthenticated(true);
      } else {
        setLoginError('Senha incorreta');
      }
    } catch {
      setLoginError('Erro de conexão');
    } finally {
      setLoginLoading(false);
    }
  };

  // ─── Data Loading ───

  const loadProperties = useCallback(async () => {
    try {
      const res = await fetch('/api/properties');
      if (res.ok) {
        const data = await res.json();
        setProperties(data);
      }
    } catch (err) {
      console.error('Failed to load properties:', err);
    }
  }, []);

  const loadAllReservations = useCallback(async () => {
    try {
      const res = await fetchApi('/api/reservations?all=true');
      if (res.ok) {
        const data = await res.json();
        setReservations(data);
      }
    } catch (err) {
      console.error('Failed to load reservations:', err);
    }
  }, [fetchApi]);

  const loadPendingReservations = useCallback(async () => {
    try {
      const res = await fetchApi('/api/reservations?pending=true');
      if (res.ok) {
        const data = await res.json();
        setPendingReservations(data);
      }
    } catch (err) {
      console.error('Failed to load pending:', err);
    }
  }, [fetchApi]);

  const loadCalendarReservations = useCallback(async (propId: string) => {
    if (!propId) { setCalendarReservations([]); return; }
    try {
      const res = await fetchApi(`/api/reservations?all=true`);
      if (res.ok) {
        const data: Reservation[] = await res.json();
        setCalendarReservations(data.filter(r => r.property_id === propId));
      }
    } catch (err) {
      console.error('Failed to load calendar reservations:', err);
    }
  }, [fetchApi]);

  useEffect(() => {
    if (!authenticated) return;
    setLoading(true);
    Promise.all([loadProperties(), loadPendingReservations(), loadAllReservations()])
      .finally(() => setLoading(false));
  }, [authenticated, loadProperties, loadPendingReservations, loadAllReservations]);

  useEffect(() => {
    if (!authenticated) return;
    if (activeTab === 'calendario' && calendarProperty) {
      loadCalendarReservations(calendarProperty);
    }
  }, [authenticated, activeTab, calendarProperty, loadCalendarReservations]);

  const loadPricingRules = useCallback(async (propId: string) => {
    if (!propId) { setPricingRules([]); return; }
    setPricingLoading(true);
    try {
      const res = await fetchApi(`/api/pricing?propertyId=${propId}`);
      if (res.ok) setPricingRules(await res.json());
    } catch (err) { console.error(err); }
    finally { setPricingLoading(false); }
  }, [fetchApi]);

  useEffect(() => {
    if (!authenticated) return;
    if (activeTab === 'precos' && pricingProperty) {
      loadPricingRules(pricingProperty);
    }
  }, [authenticated, activeTab, pricingProperty, loadPricingRules]);

  const savePricingRule = useCallback(async (data: Record<string, unknown>) => {
    setActionLoading('pricing');
    try {
      if (data.id) {
        await fetchApi('/api/pricing', { method: 'PUT', body: JSON.stringify(data) });
      } else {
        await fetchApi('/api/pricing', { method: 'POST', body: JSON.stringify({ ...data, property_id: pricingProperty }) });
      }
      await loadPricingRules(pricingProperty);
    } catch (err) { console.error(err); }
    finally { setActionLoading(null); }
  }, [fetchApi, pricingProperty, loadPricingRules]);

  // Sync local prices when rules load from API
  useEffect(() => {
    const prices: Record<string, string> = {};
    const base = pricingRules.find(r => r.rule_type === 'base');
    if (base?.price_per_night) prices['base'] = String(base.price_per_night);
    const weekend = pricingRules.find(r => r.rule_type === 'weekend');
    if (weekend?.price_per_night) prices['weekend'] = String(weekend.price_per_night);
    const surcharge = pricingRules.find(r => r.rule_type === 'guest_surcharge');
    if (surcharge?.min_guests) prices['min_guests'] = String(surcharge.min_guests);
    if (surcharge?.price_per_extra_guest) prices['price_extra'] = String(surcharge.price_per_extra_guest);
    pricingRules.filter(r => r.rule_type === 'seasonal').forEach(r => {
      if (r.price_per_night) prices[`seasonal_${r.id}`] = String(r.price_per_night);
      if (r.label) prices[`seasonal_label_${r.id}`] = r.label;
      if (r.season_start_day) prices[`seasonal_start_day_${r.id}`] = String(r.season_start_day);
      if (r.season_end_day) prices[`seasonal_end_day_${r.id}`] = String(r.season_end_day);
    });
    pricingRules.filter(r => r.rule_type === 'custom').forEach(r => {
      if (r.price_per_night) prices[`custom_${r.id}`] = String(r.price_per_night);
      if (r.label) prices[`custom_label_${r.id}`] = r.label;
    });
    setLocalPrices(prices);
  }, [pricingRules]);

  const debouncedSavePricingRule = useCallback((key: string, data: Record<string, unknown>) => {
    if (priceTimers.current[key]) clearTimeout(priceTimers.current[key]);
    priceTimers.current[key] = setTimeout(() => {
      savePricingRule(data);
    }, 800);
  }, [savePricingRule]);

  const deletePricingRuleHandler = async (id: number) => {
    setActionLoading('pricing');
    try {
      await fetchApi('/api/pricing', { method: 'DELETE', body: JSON.stringify({ id }) });
      await loadPricingRules(pricingProperty);
    } catch (err) { console.error(err); }
    finally { setActionLoading(null); }
  };

  // Pricing calendar helper
  const getPriceForDateLocal = (dateStr: string): { price: number; label: string; type: string } | null => {
    const baseRule = pricingRules.find(r => r.rule_type === 'base');
    if (!baseRule?.price_per_night) return null;

    const date = new Date(dateStr + 'T12:00:00');
    const dayOfWeek = date.getDay();
    const month = parseInt(dateStr.slice(5, 7));
    const day = parseInt(dateStr.slice(8, 10));

    // Custom override
    for (const rule of pricingRules.filter(r => r.rule_type === 'custom' && r.date_start && r.date_end).sort((a, b) => b.priority - a.priority)) {
      if (dateStr >= rule.date_start! && dateStr <= rule.date_end!) {
        return { price: rule.price_per_night!, label: rule.label || 'Especial', type: 'custom' };
      }
    }

    // Seasonal
    for (const rule of pricingRules.filter(r => r.rule_type === 'seasonal' && r.season_start_month != null).sort((a, b) => b.priority - a.priority)) {
      const sm = rule.season_start_month!, sd = rule.season_start_day || 1;
      const em = rule.season_end_month!, ed = rule.season_end_day || 31;
      let inSeason = false;
      if (sm <= em) {
        inSeason = (month > sm || (month === sm && day >= sd)) && (month < em || (month === em && day <= ed));
      } else {
        inSeason = (month > sm || (month === sm && day >= sd)) || (month < em || (month === em && day <= ed));
      }
      if (inSeason) {
        return { price: rule.price_per_night || baseRule.price_per_night, label: rule.label || 'Temporada', type: 'seasonal' };
      }
    }

    // Weekend
    const weekendRule = pricingRules.find(r => r.rule_type === 'weekend');
    if (weekendRule?.price_per_night && (weekendRule.weekend_days || [5, 6]).includes(dayOfWeek)) {
      return { price: weekendRule.price_per_night, label: 'Fim de semana', type: 'weekend' };
    }

    return { price: baseRule.price_per_night, label: 'Base', type: 'base' };
  };

  // ─── Actions ───

  const handleApprove = async (id: number) => {
    setActionLoading(id);
    try {
      await fetchApi('/api/reservations/manage', {
        method: 'PUT',
        body: JSON.stringify({ id, status: 'approved' }),
      });
      await Promise.all([loadPendingReservations(), loadAllReservations()]);
    } catch (err) { console.error(err); }
    finally { setActionLoading(null); }
  };

  const handleReject = async (id: number) => {
    setActionLoading(id);
    try {
      await fetchApi('/api/reservations/manage', {
        method: 'PUT',
        body: JSON.stringify({ id, status: 'rejected' }),
      });
      await Promise.all([loadPendingReservations(), loadAllReservations()]);
    } catch (err) { console.error(err); }
    finally { setActionLoading(null); }
  };

  const handleCancel = async (id: number) => {
    if (!confirm('Cancelar esta reserva?')) return;
    setActionLoading(id);
    try {
      await fetchApi('/api/reservations/manage', {
        method: 'PUT',
        body: JSON.stringify({ id, status: 'cancelled' }),
      });
      await Promise.all([loadPendingReservations(), loadAllReservations()]);
    } catch (err) { console.error(err); }
    finally { setActionLoading(null); }
  };

  const handleDeleteReservation = async (id: number) => {
    if (!confirm('Excluir permanentemente esta reserva/bloqueio?')) return;
    setActionLoading(id);
    try {
      await fetchApi('/api/reservations/manage', {
        method: 'DELETE',
        body: JSON.stringify({ id }),
      });
      await Promise.all([loadPendingReservations(), loadAllReservations(), loadCalendarReservations(calendarProperty)]);
      setShowDayDetail(null);
    } catch (err) { console.error(err); }
    finally { setActionLoading(null); }
  };

  const handleCreateBlock = async () => {
    if (!calendarProperty || !blockStart || !blockEnd) return;
    setActionLoading('block');
    try {
      await fetchApi('/api/reservations/manage', {
        method: 'POST',
        body: JSON.stringify({
          property_id: calendarProperty,
          date_start: blockStart,
          date_end: blockEnd,
          reason: blockReason,
          admin_notes: blockNotes || undefined,
        }),
      });
      await loadCalendarReservations(calendarProperty);
      await loadAllReservations();
      setShowBlockModal(false);
      setBlockStart(null);
      setBlockEnd(null);
      setBlockReason('Reservado');
      setBlockNotes('');
    } catch (err) { console.error(err); }
    finally { setActionLoading(null); }
  };

  // ─── Property CRUD ───

  const openNewProperty = () => {
    setEditingProperty(null);
    setPropertyForm({
      id: '', name: '', location: '', type: 'temporada', badge: '', price: '',
      price_unit: '', guests: '', description: '', features: '', images: '',
      sort_order: 0, active: true,
    });
    setShowPropertyForm(true);
  };

  const openEditProperty = (p: Property) => {
    setEditingProperty(p);
    const imgs = parseImages(p.images);
    const feats = parseFeatures(p.features);
    setPropertyForm({
      id: p.id,
      name: p.name || '',
      location: p.location || '',
      type: p.type || 'temporada',
      badge: p.badge || '',
      price: p.price || '',
      price_unit: p.price_unit || '',
      guests: p.guests || '',
      description: p.description || '',
      features: feats.join('\n'),
      images: imgs.join('\n'),
      sort_order: p.sort_order ?? 0,
      active: p.active ?? true,
    });
    setShowPropertyForm(true);
  };

  const handleSaveProperty = async () => {
    setActionLoading('property');
    const payload = {
      ...propertyForm,
      features: propertyForm.features.split('\n').map(f => f.trim()).filter(Boolean),
      images: propertyForm.images.split('\n').map(u => u.trim()).filter(Boolean),
    };

    try {
      if (editingProperty) {
        await fetchApi('/api/properties', {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        await fetchApi('/api/properties', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }
      await loadProperties();
      setShowPropertyForm(false);
      setEditingProperty(null);
    } catch (err) { console.error(err); }
    finally { setActionLoading(null); }
  };

  const handleDeleteProperty = async () => {
    if (!editingProperty) return;
    if (!confirm(`Desativar "${editingProperty.name}"?`)) return;
    setActionLoading('property-delete');
    try {
      await fetchApi('/api/properties', {
        method: 'DELETE',
        body: JSON.stringify({ id: editingProperty.id }),
      });
      await loadProperties();
      setShowPropertyForm(false);
      setEditingProperty(null);
    } catch (err) { console.error(err); }
    finally { setActionLoading(null); }
  };

  const getPropertyName = (propertyId: string): string => {
    const p = properties.find(p => p.id === propertyId);
    return p?.name || propertyId;
  };

  // ─── Calendar Logic ───

  const handleCalendarDayClick = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const clickedDate = new Date(dateStr + 'T12:00:00');
    if (clickedDate < today) return;

    // Check if this day has an existing reservation
    const existing = calendarReservations.find(r =>
      isDateInRange(dateStr, r.date_start, r.date_end) &&
      r.status !== 'rejected' && r.status !== 'cancelled'
    );

    if (existing) {
      setShowDayDetail(existing);
      return;
    }

    // Selection logic
    if (!blockStart || (blockStart && blockEnd)) {
      setBlockStart(dateStr);
      setBlockEnd(null);
    } else if (blockStart && !blockEnd) {
      if (dateStr < blockStart) {
        setBlockEnd(blockStart);
        setBlockStart(dateStr);
      } else {
        setBlockEnd(dateStr);
      }
      setShowBlockModal(true);
    }
  };

  const navigateMonth = (delta: number) => {
    let newMonth = calendarMonth + delta;
    let newYear = calendarYear;
    if (newMonth > 11) { newMonth = 0; newYear++; }
    if (newMonth < 0) { newMonth = 11; newYear--; }
    setCalendarMonth(newMonth);
    setCalendarYear(newYear);
  };

  const getSecondMonth = () => {
    let m = calendarMonth + 1;
    let y = calendarYear;
    if (m > 11) { m = 0; y++; }
    return { month: m, year: y };
  };

  // ─── Filtered Reservations ───

  const filteredReservations = reservations.filter(r => {
    if (filterProperty && r.property_id !== filterProperty) return false;
    if (filterStatus && r.status !== filterStatus) return false;
    return true;
  });

  const approvedReservations = filteredReservations.filter(r => r.status === 'approved');
  const allFilteredNonPending = filteredReservations.filter(r => r.status !== 'pending');

  // ─── LOGIN SCREEN ───

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-[#F7F2EB] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="font-serif text-3xl font-bold text-[#AC4747] mb-1">
              HospedaTemporada
            </h1>
            <p className="text-[#5a4f45] text-sm">Painel Administrativo</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#5a4f45] mb-1">Senha</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-[#d4c9b8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#AC4747]/40 focus:border-[#AC4747] bg-[#F7F2EB]/50"
                placeholder="Digite a senha do admin"
                autoFocus
              />
            </div>
            {loginError && (
              <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{loginError}</p>
            )}
            <button
              type="submit"
              disabled={loginLoading || !password}
              className="w-full py-3 bg-[#AC4747] text-white rounded-lg font-semibold hover:bg-[#8a3636] transition-colors disabled:opacity-50"
            >
              {loginLoading ? 'Verificando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ─── Calendar Renderer ───

  const renderMonth = (year: number, month: number) => {
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfWeek(year, month);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = toISODate(today.getFullYear(), today.getMonth(), today.getDate());

    const cells: React.ReactNode[] = [];

    // Day headers
    for (const d of DAYS_PT) {
      cells.push(
        <div key={`h-${d}`} className="text-center text-xs font-semibold text-[#5a4f45] py-1">
          {d}
        </div>
      );
    }

    // Empty cells
    for (let i = 0; i < firstDay; i++) {
      cells.push(<div key={`e-${i}`} />);
    }

    // Day cells
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = toISODate(year, month, day);
      const isPast = dateStr < todayStr;
      const isToday = dateStr === todayStr;

      // Find reservation for this day
      const reservation = calendarReservations.find(r =>
        isDateInRange(dateStr, r.date_start, r.date_end) &&
        r.status !== 'rejected' && r.status !== 'cancelled'
      );

      const isPending = reservation?.status === 'pending';
      const isBlocked = reservation && !isPending;
      const isSelected = (blockStart && dateStr === blockStart) || (blockEnd && dateStr === blockEnd);
      const isInSelection = blockStart && blockEnd && dateStr >= blockStart && dateStr <= blockEnd;

      let bgClass = 'bg-white hover:bg-emerald-50 cursor-pointer';
      let textClass = 'text-[#1a1410]';

      if (isPast) {
        bgClass = 'bg-gray-100 cursor-default';
        textClass = 'text-gray-400';
      } else if (isBlocked) {
        bgClass = 'bg-red-100 hover:bg-red-200 cursor-pointer border-red-300';
        textClass = 'text-red-800';
      } else if (isPending) {
        bgClass = 'bg-amber-100 hover:bg-amber-200 cursor-pointer border-amber-300';
        textClass = 'text-amber-800';
      } else if (isSelected) {
        bgClass = 'bg-[#AC4747] cursor-pointer';
        textClass = 'text-white';
      } else if (isInSelection) {
        bgClass = 'bg-[#AC4747]/20 cursor-pointer';
        textClass = 'text-[#AC4747]';
      }

      cells.push(
        <button
          key={`d-${day}`}
          onClick={() => !isPast && handleCalendarDayClick(dateStr)}
          disabled={isPast}
          aria-label={dateStr}
          className={`relative aspect-square flex items-center justify-center rounded-lg text-sm font-medium border transition-colors ${bgClass} ${textClass} ${isToday ? 'ring-2 ring-[#AC4747]' : ''} ${isPast ? 'opacity-40 cursor-not-allowed' : ''}`}
        >
          {day}
          {isPending && (
            <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-amber-500" />
          )}
          {isBlocked && (
            <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-red-500" />
          )}
        </button>
      );
    }

    return (
      <div>
        <h3 className="text-center font-serif font-semibold text-lg text-[#1a1410] mb-3">
          {MONTHS_PT[month]} {year}
        </h3>
        <div className="grid grid-cols-7 gap-1">
          {cells}
        </div>
      </div>
    );
  };

  // ─── ADMIN PANEL ───

  return (
    <div className="min-h-screen bg-[#F7F2EB]">
      {/* Header */}
      <header className="bg-white border-b border-[#d4c9b8] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-xl sm:text-2xl font-bold text-[#AC4747]">
              HospedaTemporada
            </h1>
            <span className="hidden sm:inline text-xs bg-[#AC4747]/10 text-[#AC4747] px-2 py-0.5 rounded-full font-medium">
              Admin
            </span>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem('admin_password');
              setAuthenticated(false);
            }}
            className="text-sm text-[#5a4f45] hover:text-[#AC4747] transition-colors"
          >
            Sair
          </button>
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex gap-1">
            {([
              { key: 'reservas' as const, label: 'Reservas', icon: '📋' },
              { key: 'calendario' as const, label: 'Calendário', icon: '📅' },
              { key: 'precos' as const, label: 'Preços', icon: '💰' },
              { key: 'imoveis' as const, label: 'Imóveis', icon: '🏠' },
            ]).map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-[#AC4747] text-[#AC4747]'
                    : 'border-transparent text-[#5a4f45] hover:text-[#1a1410]'
                }`}
              >
                <span className="mr-1.5">{tab.icon}</span>
                {tab.label}
                {tab.key === 'reservas' && pendingReservations.length > 0 && (
                  <span className="ml-1.5 bg-amber-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                    {pendingReservations.length}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {loading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-[#AC4747] border-t-transparent rounded-full" />
          </div>
        )}

        {/* ─── TAB: RESERVAS ─── */}
        {!loading && activeTab === 'reservas' && (
          <div className="space-y-8">
            {/* Pending Section */}
            <section className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="font-serif text-xl font-bold text-[#1a1410]">
                  Solicitações pendentes
                </h2>
                <span className="bg-amber-500 text-white text-sm font-bold px-2.5 py-0.5 rounded-full">
                  {pendingReservations.length}
                </span>
              </div>

              {pendingReservations.length === 0 ? (
                <p className="text-[#5a4f45] text-sm py-4 text-center">
                  Nenhuma solicitação pendente
                </p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {pendingReservations.map(r => (
                    <div key={r.id} className="bg-white rounded-xl border border-amber-200 p-4 shadow-sm">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-semibold text-[#1a1410] text-sm">
                            {getPropertyName(r.property_id)}
                          </p>
                          <p className="text-xs text-[#5a4f45]">{relativeTime(r.created_at)}</p>
                        </div>
                        <span className="bg-amber-100 text-amber-700 text-xs font-medium px-2 py-0.5 rounded-full">
                          Pendente
                        </span>
                      </div>
                      <div className="space-y-1.5 text-sm mb-4">
                        {r.guest_name && (
                          <p className="text-[#1a1410]">
                            <span className="text-[#5a4f45]">Hóspede:</span> {r.guest_name}
                          </p>
                        )}
                        {r.guest_phone && (
                          <p className="text-[#1a1410]">
                            <span className="text-[#5a4f45]">Telefone:</span> {r.guest_phone}
                          </p>
                        )}
                        {r.occasion && (
                          <p className="text-[#1a1410]">
                            <span className="text-[#5a4f45]">Ocasião:</span> {r.occasion}
                          </p>
                        )}
                        {r.guest_count && (
                          <p className="text-[#1a1410]">
                            <span className="text-[#5a4f45]">Hóspedes:</span> {r.guest_count}
                          </p>
                        )}
                        <p className="text-[#1a1410]">
                          <span className="text-[#5a4f45]">Datas:</span>{' '}
                          {formatDate(r.date_start)} → {formatDate(r.date_end)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(r.id)}
                          disabled={actionLoading === r.id}
                          className="flex-1 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors disabled:opacity-50"
                        >
                          ✅ Aprovar
                        </button>
                        <button
                          onClick={() => handleReject(r.id)}
                          disabled={actionLoading === r.id}
                          className="flex-1 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
                        >
                          ❌ Rejeitar
                        </button>
                        {r.guest_phone && (
                          <a
                            href={`https://wa.me/${r.guest_phone.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="py-2 px-3 bg-[#25D366] text-white rounded-lg text-sm font-medium hover:bg-[#1ea952] transition-colors"
                          >
                            📱
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-center">
              <select
                value={filterProperty}
                onChange={e => setFilterProperty(e.target.value)}
                className="px-3 py-2 bg-white border border-[#d4c9b8] rounded-lg text-sm text-[#1a1410] focus:outline-none focus:ring-2 focus:ring-[#AC4747]/40"
              >
                <option value="">Todos os imóveis</option>
                {properties.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="px-3 py-2 bg-white border border-[#d4c9b8] rounded-lg text-sm text-[#1a1410] focus:outline-none focus:ring-2 focus:ring-[#AC4747]/40"
              >
                <option value="">Todos os status</option>
                <option value="pending">Pendente</option>
                <option value="approved">Aprovada</option>
                <option value="rejected">Rejeitada</option>
                <option value="cancelled">Cancelada</option>
              </select>
            </div>

            {/* Approved section */}
            <section>
              <h2 className="font-serif text-xl font-bold text-[#1a1410] mb-4">
                {filterStatus ? `Reservas — ${filterStatus}` : 'Reservas aprovadas'}
              </h2>
              {(filterStatus ? allFilteredNonPending : approvedReservations).length === 0 ? (
                <p className="text-[#5a4f45] text-sm py-4 text-center bg-white rounded-xl border border-[#d4c9b8]">
                  Nenhuma reserva encontrada
                </p>
              ) : (
                <div className="bg-white rounded-xl border border-[#d4c9b8] overflow-hidden">
                  {/* Desktop table header */}
                  <div className="hidden md:grid md:grid-cols-[1.5fr_1.5fr_1fr_1fr_0.8fr_1fr] gap-3 px-5 py-3 bg-[#F7F2EB] border-b border-[#d4c9b8] text-xs font-semibold text-[#5a4f45] uppercase tracking-wide">
                    <div>Imóvel</div>
                    <div>Hóspede</div>
                    <div>Check-in</div>
                    <div>Check-out</div>
                    <div>Status</div>
                    <div>Ações</div>
                  </div>
                  {(filterStatus ? allFilteredNonPending : approvedReservations).map(r => (
                    <div
                      key={r.id}
                      className="grid md:grid-cols-[1.5fr_1.5fr_1fr_1fr_0.8fr_1fr] gap-3 px-5 py-4 border-b border-[#d4c9b8]/50 items-center last:border-b-0"
                    >
                      <div>
                        <p className="font-medium text-sm text-[#1a1410]">{getPropertyName(r.property_id)}</p>
                        <p className="text-xs text-[#5a4f45] md:hidden">
                          {r.type === 'manual' ? 'Bloqueio manual' : 'Reserva'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-[#1a1410]">{r.guest_name || r.reason || '—'}</p>
                        {r.guest_phone && (
                          <p className="text-xs text-[#5a4f45]">{r.guest_phone}</p>
                        )}
                      </div>
                      <div className="text-sm text-[#1a1410]">
                        <span className="md:hidden text-xs text-[#5a4f45]">Check-in: </span>
                        {formatDate(r.date_start)}
                      </div>
                      <div className="text-sm text-[#1a1410]">
                        <span className="md:hidden text-xs text-[#5a4f45]">Check-out: </span>
                        {formatDate(r.date_end)}
                      </div>
                      <div>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          r.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                          r.status === 'rejected' ? 'bg-red-100 text-red-700' :
                          r.status === 'cancelled' ? 'bg-gray-100 text-gray-600' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {r.status === 'approved' ? 'Aprovada' :
                           r.status === 'rejected' ? 'Rejeitada' :
                           r.status === 'cancelled' ? 'Cancelada' : 'Pendente'}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        {r.status === 'approved' && (
                          <button
                            onClick={() => handleCancel(r.id)}
                            disabled={actionLoading === r.id}
                            className="text-xs px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
                          >
                            Cancelar
                          </button>
                        )}
                        {r.guest_phone && (
                          <a
                            href={`https://wa.me/${r.guest_phone.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs px-3 py-1.5 bg-[#25D366]/10 text-[#25D366] rounded-lg hover:bg-[#25D366]/20 transition-colors"
                          >
                            WhatsApp
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {/* ─── TAB: CALENDARIO ─── */}
        {!loading && activeTab === 'calendario' && (
          <div className="space-y-6">
            {/* Property selector */}
            <div className="flex flex-wrap items-center gap-4">
              <select
                value={calendarProperty}
                onChange={e => {
                  setCalendarProperty(e.target.value);
                  setBlockStart(null);
                  setBlockEnd(null);
                }}
                className="px-4 py-2.5 bg-white border border-[#d4c9b8] rounded-lg text-sm text-[#1a1410] focus:outline-none focus:ring-2 focus:ring-[#AC4747]/40 min-w-[220px]"
              >
                <option value="">Selecione um imóvel</option>
                {properties.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              {calendarProperty && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigateMonth(-1)}
                    className="p-2 bg-white border border-[#d4c9b8] rounded-lg hover:bg-[#F7F2EB] transition-colors"
                  >
                    ←
                  </button>
                  <button
                    onClick={() => navigateMonth(1)}
                    className="p-2 bg-white border border-[#d4c9b8] rounded-lg hover:bg-[#F7F2EB] transition-colors"
                  >
                    →
                  </button>
                </div>
              )}
            </div>

            {!calendarProperty ? (
              <div className="text-center py-16 text-[#5a4f45]">
                <p className="text-lg">Selecione um imóvel para ver o calendário</p>
              </div>
            ) : (
              <>
                {/* Two-month calendar */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl border border-[#d4c9b8] p-5">
                    {renderMonth(calendarYear, calendarMonth)}
                  </div>
                  <div className="bg-white rounded-xl border border-[#d4c9b8] p-5">
                    {renderMonth(getSecondMonth().year, getSecondMonth().month)}
                  </div>
                </div>

                {/* Selection hint */}
                {blockStart && !blockEnd && (
                  <div className="bg-[#AC4747]/10 border border-[#AC4747]/30 rounded-lg px-4 py-3 text-sm text-[#AC4747]">
                    Início selecionado: <strong>{formatDate(blockStart)}</strong>. Clique em outro dia para definir o fim do bloqueio.
                  </div>
                )}

                {/* Legend */}
                <div className="flex flex-wrap gap-4 text-xs text-[#5a4f45] bg-white rounded-xl border border-[#d4c9b8] p-4">
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded bg-white border border-[#d4c9b8]" />
                    Disponível
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded bg-red-100 border border-red-300" />
                    Bloqueado / Reservado
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded bg-amber-100 border border-amber-300" />
                    Pendente
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded bg-gray-100 border border-gray-300" />
                    Passado
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded bg-[#AC4747]" />
                    Selecionado
                  </div>
                </div>
              </>
            )}

            {/* Block Creation Modal */}
            {showBlockModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                  <h3 className="font-serif text-lg font-bold text-[#1a1410] mb-4">
                    Criar bloqueio manual
                  </h3>
                  <div className="space-y-4">
                    <div className="bg-[#F7F2EB] rounded-lg p-3 text-sm">
                      <p className="text-[#5a4f45]">
                        <span className="font-medium text-[#1a1410]">{getPropertyName(calendarProperty)}</span>
                      </p>
                      <p className="text-[#5a4f45]">
                        {blockStart && formatDate(blockStart)} → {blockEnd && formatDate(blockEnd)}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#5a4f45] mb-1">Motivo</label>
                      <select
                        value={blockReason}
                        onChange={e => setBlockReason(e.target.value)}
                        className="w-full px-3 py-2.5 border border-[#d4c9b8] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#AC4747]/40"
                      >
                        {BLOCK_REASONS.map(r => (
                          <option key={r.value} value={r.value}>{r.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#5a4f45] mb-1">
                        Observações <span className="text-[#d4c9b8]">(opcional)</span>
                      </label>
                      <textarea
                        value={blockNotes}
                        onChange={e => setBlockNotes(e.target.value)}
                        className="w-full px-3 py-2.5 border border-[#d4c9b8] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#AC4747]/40 resize-none"
                        rows={2}
                      />
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={() => {
                          setShowBlockModal(false);
                          setBlockStart(null);
                          setBlockEnd(null);
                        }}
                        className="flex-1 py-2.5 bg-gray-100 text-[#5a4f45] rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleCreateBlock}
                        disabled={actionLoading === 'block'}
                        className="flex-1 py-2.5 bg-[#AC4747] text-white rounded-lg text-sm font-medium hover:bg-[#8a3636] transition-colors disabled:opacity-50"
                      >
                        {actionLoading === 'block' ? 'Salvando...' : 'Confirmar bloqueio'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Day Detail Modal */}
            {showDayDetail && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                  <h3 className="font-serif text-lg font-bold text-[#1a1410] mb-4">
                    Detalhes do bloqueio
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="bg-[#F7F2EB] rounded-lg p-3">
                      <p className="text-[#5a4f45]">
                        <span className="font-medium text-[#1a1410]">{getPropertyName(showDayDetail.property_id)}</span>
                      </p>
                      <p className="text-[#5a4f45]">
                        {formatDate(showDayDetail.date_start)} → {formatDate(showDayDetail.date_end)}
                      </p>
                    </div>
                    <p>
                      <span className="text-[#5a4f45]">Tipo:</span>{' '}
                      {showDayDetail.type === 'manual' ? 'Bloqueio manual' : 'Reserva de hóspede'}
                    </p>
                    <p>
                      <span className="text-[#5a4f45]">Status:</span>{' '}
                      <span className={`font-medium ${
                        showDayDetail.status === 'approved' ? 'text-emerald-600' :
                        showDayDetail.status === 'pending' ? 'text-amber-600' : 'text-gray-600'
                      }`}>
                        {showDayDetail.status === 'approved' ? 'Aprovada' :
                         showDayDetail.status === 'pending' ? 'Pendente' : showDayDetail.status}
                      </span>
                    </p>
                    {showDayDetail.guest_name && (
                      <p><span className="text-[#5a4f45]">Hóspede:</span> {showDayDetail.guest_name}</p>
                    )}
                    {showDayDetail.guest_phone && (
                      <p><span className="text-[#5a4f45]">Telefone:</span> {showDayDetail.guest_phone}</p>
                    )}
                    {showDayDetail.reason && (
                      <p><span className="text-[#5a4f45]">Motivo:</span> {showDayDetail.reason}</p>
                    )}
                    {showDayDetail.admin_notes && (
                      <p><span className="text-[#5a4f45]">Obs:</span> {showDayDetail.admin_notes}</p>
                    )}
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => setShowDayDetail(null)}
                      className="flex-1 py-2.5 bg-gray-100 text-[#5a4f45] rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                    >
                      Fechar
                    </button>
                    {showDayDetail.status === 'approved' && (
                      <button
                        onClick={() => handleCancel(showDayDetail.id)}
                        disabled={actionLoading === showDayDetail.id}
                        className="flex-1 py-2.5 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors disabled:opacity-50"
                      >
                        Cancelar reserva
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteReservation(showDayDetail.id)}
                      disabled={actionLoading === showDayDetail.id}
                      className="flex-1 py-2.5 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── TAB: PRECOS ─── */}
        {!loading && activeTab === 'precos' && (
          <div className="space-y-6">
            <h2 className="font-serif text-xl font-bold text-[#1a1410]">Gestão de Preços</h2>

            {/* Property selector */}
            <select
              value={pricingProperty}
              onChange={e => setPricingProperty(e.target.value)}
              className="w-full sm:w-64 px-3 py-2.5 border border-[#d4c9b8] rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#AC4747]/40"
            >
              <option value="">Selecione um imóvel</option>
              {properties.filter(p => p.active).map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>

            {pricingProperty && pricingLoading && (
              <div className="text-center py-8 text-[#5a4f45]">Carregando...</div>
            )}

            {pricingProperty && !pricingLoading && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left column: Rules */}
                <div className="space-y-4">
                  {/* Base price */}
                  <div className="bg-white border border-[#d4c9b8] rounded-xl p-4">
                    <h3 className="font-serif text-base font-bold text-[#1a1410] mb-3">Preço base</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-[#5a4f45]">R$</span>
                      <input
                        type="number"
                        value={localPrices['base'] ?? ''}
                        onChange={e => {
                          setLocalPrices(prev => ({ ...prev, base: e.target.value }));
                          const val = parseInt(e.target.value) || 0;
                          const existing = pricingRules.find(r => r.rule_type === 'base');
                          debouncedSavePricingRule('base', { id: existing?.id, rule_type: 'base', price_per_night: val });
                        }}
                        placeholder="0"
                        className="w-32 px-3 py-2 border border-[#d4c9b8] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#AC4747]/40"
                      />
                      <span className="text-sm text-[#5a4f45]">/ noite</span>
                    </div>
                  </div>

                  {/* Weekend price */}
                  <div className="bg-white border border-[#d4c9b8] rounded-xl p-4">
                    <h3 className="font-serif text-base font-bold text-[#1a1410] mb-3">Fim de semana</h3>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-sm text-[#5a4f45]">R$</span>
                      <input
                        type="number"
                        value={localPrices['weekend'] ?? ''}
                        onChange={e => {
                          setLocalPrices(prev => ({ ...prev, weekend: e.target.value }));
                          const val = parseInt(e.target.value) || 0;
                          const existing = pricingRules.find(r => r.rule_type === 'weekend');
                          debouncedSavePricingRule('weekend', { id: existing?.id, rule_type: 'weekend', price_per_night: val, weekend_days: existing?.weekend_days || [5, 6] });
                        }}
                        placeholder="0"
                        className="w-32 px-3 py-2 border border-[#d4c9b8] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#AC4747]/40"
                      />
                      <span className="text-sm text-[#5a4f45]">/ noite</span>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((d, i) => {
                        const weekendRule = pricingRules.find(r => r.rule_type === 'weekend');
                        const days = weekendRule?.weekend_days || [5, 6];
                        const checked = days.includes(i);
                        return (
                          <label key={i} className="flex items-center gap-1 text-xs text-[#5a4f45]">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => {
                                const newDays = checked ? days.filter((x: number) => x !== i) : [...days, i];
                                if (weekendRule) {
                                  savePricingRule({ id: weekendRule.id, rule_type: 'weekend', price_per_night: weekendRule.price_per_night, weekend_days: newDays });
                                }
                              }}
                              className="rounded border-[#d4c9b8]"
                            />
                            {d}
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Guest surcharge */}
                  <div className="bg-white border border-[#d4c9b8] rounded-xl p-4">
                    <h3 className="font-serif text-base font-bold text-[#1a1410] mb-3">Extra por hóspede</h3>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm text-[#5a4f45]">A partir de</span>
                      <input
                        type="number"
                        value={localPrices['min_guests'] ?? ''}
                        onChange={e => {
                          setLocalPrices(prev => ({ ...prev, min_guests: e.target.value }));
                          const val = parseInt(e.target.value) || 0;
                          const existing = pricingRules.find(r => r.rule_type === 'guest_surcharge');
                          debouncedSavePricingRule('min_guests', {
                            id: existing?.id, rule_type: 'guest_surcharge',
                            min_guests: val,
                            price_per_extra_guest: existing?.price_per_extra_guest || 0,
                          });
                        }}
                        placeholder="0"
                        className="w-20 px-2 py-2 border border-[#d4c9b8] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#AC4747]/40"
                      />
                      <span className="text-sm text-[#5a4f45]">pessoas, + R$</span>
                      <input
                        type="number"
                        value={localPrices['price_extra'] ?? ''}
                        onChange={e => {
                          setLocalPrices(prev => ({ ...prev, price_extra: e.target.value }));
                          const val = parseInt(e.target.value) || 0;
                          const existing = pricingRules.find(r => r.rule_type === 'guest_surcharge');
                          debouncedSavePricingRule('price_extra', {
                            id: existing?.id, rule_type: 'guest_surcharge',
                            min_guests: existing?.min_guests || 0,
                            price_per_extra_guest: val,
                          });
                        }}
                        placeholder="0"
                        className="w-20 px-2 py-2 border border-[#d4c9b8] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#AC4747]/40"
                      />
                      <span className="text-sm text-[#5a4f45]">/ pessoa / noite</span>
                    </div>
                  </div>

                  {/* Seasonal rules */}
                  <div className="bg-white border border-[#d4c9b8] rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-serif text-base font-bold text-[#1a1410]">Temporadas</h3>
                      <button
                        onClick={() => savePricingRule({ rule_type: 'seasonal', price_per_night: 0, season_start_month: 12, season_start_day: 15, season_end_month: 1, season_end_day: 31, label: 'Nova temporada' })}
                        className="text-xs px-3 py-1.5 bg-[#AC4747] text-white rounded-lg hover:bg-[#8a3636] transition-colors"
                      >
                        + Adicionar
                      </button>
                    </div>
                    {pricingRules.filter(r => r.rule_type === 'seasonal').map(rule => (
                      <div key={rule.id} className="border border-[#d4c9b8]/50 rounded-lg p-3 mb-2 space-y-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={localPrices[`seasonal_label_${rule.id}`] ?? ''}
                            onChange={e => {
                              setLocalPrices(prev => ({ ...prev, [`seasonal_label_${rule.id}`]: e.target.value }));
                              debouncedSavePricingRule(`seasonal_label_${rule.id}`, { id: rule.id, rule_type: 'seasonal', label: e.target.value });
                            }}
                            placeholder="Nome da temporada"
                            className="flex-1 px-2 py-1.5 border border-[#d4c9b8] rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#AC4747]/40"
                          />
                          <button onClick={() => deletePricingRuleHandler(rule.id)} className="text-red-500 text-sm hover:text-red-700">✕</button>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-sm text-[#5a4f45]">
                          <span>De</span>
                          <select value={rule.season_start_month || 1} onChange={e => savePricingRule({ id: rule.id, rule_type: 'seasonal', season_start_month: parseInt(e.target.value) })} className="px-2 py-1 border border-[#d4c9b8] rounded text-sm">
                            {MONTHS_PT.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                          </select>
                          <input type="number" min={1} max={31} value={localPrices[`seasonal_start_day_${rule.id}`] ?? rule.season_start_day ?? 1} onChange={e => {
                            setLocalPrices(prev => ({ ...prev, [`seasonal_start_day_${rule.id}`]: e.target.value }));
                            debouncedSavePricingRule(`seasonal_start_day_${rule.id}`, { id: rule.id, rule_type: 'seasonal', season_start_day: parseInt(e.target.value) });
                          }} className="w-14 px-2 py-1 border border-[#d4c9b8] rounded text-sm" />
                          <span>até</span>
                          <select value={rule.season_end_month || 1} onChange={e => savePricingRule({ id: rule.id, rule_type: 'seasonal', season_end_month: parseInt(e.target.value) })} className="px-2 py-1 border border-[#d4c9b8] rounded text-sm">
                            {MONTHS_PT.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                          </select>
                          <input type="number" min={1} max={31} value={localPrices[`seasonal_end_day_${rule.id}`] ?? rule.season_end_day ?? 31} onChange={e => {
                            setLocalPrices(prev => ({ ...prev, [`seasonal_end_day_${rule.id}`]: e.target.value }));
                            debouncedSavePricingRule(`seasonal_end_day_${rule.id}`, { id: rule.id, rule_type: 'seasonal', season_end_day: parseInt(e.target.value) });
                          }} className="w-14 px-2 py-1 border border-[#d4c9b8] rounded text-sm" />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-[#5a4f45]">R$</span>
                          <input type="number" value={localPrices[`seasonal_${rule.id}`] ?? ''} onChange={e => {
                            setLocalPrices(prev => ({ ...prev, [`seasonal_${rule.id}`]: e.target.value }));
                            debouncedSavePricingRule(`seasonal_${rule.id}`, { id: rule.id, rule_type: 'seasonal', price_per_night: parseInt(e.target.value) || 0 });
                          }} placeholder="0" className="w-28 px-2 py-1.5 border border-[#d4c9b8] rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#AC4747]/40" />
                          <span className="text-sm text-[#5a4f45]">/ noite</span>
                        </div>
                      </div>
                    ))}
                    {pricingRules.filter(r => r.rule_type === 'seasonal').length === 0 && (
                      <p className="text-sm text-[#d4c9b8]">Nenhuma temporada configurada</p>
                    )}
                  </div>

                  {/* Custom date overrides */}
                  <div className="bg-white border border-[#d4c9b8] rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-serif text-base font-bold text-[#1a1410]">Datas customizadas</h3>
                      <button
                        onClick={() => savePricingRule({ rule_type: 'custom', price_per_night: 0, date_start: toISODate(pricingYear, pricingMonth, 1), date_end: toISODate(pricingYear, pricingMonth, 7), label: 'Evento especial', priority: 10 })}
                        className="text-xs px-3 py-1.5 bg-[#AC4747] text-white rounded-lg hover:bg-[#8a3636] transition-colors"
                      >
                        + Adicionar
                      </button>
                    </div>
                    {pricingRules.filter(r => r.rule_type === 'custom').map(rule => (
                      <div key={rule.id} className="border border-[#d4c9b8]/50 rounded-lg p-3 mb-2 space-y-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={localPrices[`custom_label_${rule.id}`] ?? ''}
                            onChange={e => {
                              setLocalPrices(prev => ({ ...prev, [`custom_label_${rule.id}`]: e.target.value }));
                              debouncedSavePricingRule(`custom_label_${rule.id}`, { id: rule.id, rule_type: 'custom', label: e.target.value });
                            }}
                            placeholder="Nome (ex: Réveillon)"
                            className="flex-1 px-2 py-1.5 border border-[#d4c9b8] rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#AC4747]/40"
                          />
                          <button onClick={() => deletePricingRuleHandler(rule.id)} className="text-red-500 text-sm hover:text-red-700">✕</button>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-sm text-[#5a4f45]">
                          <span>De</span>
                          <input type="date" value={rule.date_start || ''} onChange={e => savePricingRule({ id: rule.id, rule_type: 'custom', date_start: e.target.value })} className="px-2 py-1 border border-[#d4c9b8] rounded text-sm" />
                          <span>até</span>
                          <input type="date" value={rule.date_end || ''} onChange={e => savePricingRule({ id: rule.id, rule_type: 'custom', date_end: e.target.value })} className="px-2 py-1 border border-[#d4c9b8] rounded text-sm" />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-[#5a4f45]">R$</span>
                          <input type="number" value={localPrices[`custom_${rule.id}`] ?? ''} onChange={e => {
                            setLocalPrices(prev => ({ ...prev, [`custom_${rule.id}`]: e.target.value }));
                            debouncedSavePricingRule(`custom_${rule.id}`, { id: rule.id, rule_type: 'custom', price_per_night: parseInt(e.target.value) || 0 });
                          }} placeholder="0" className="w-28 px-2 py-1.5 border border-[#d4c9b8] rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#AC4747]/40" />
                          <span className="text-sm text-[#5a4f45]">/ noite</span>
                        </div>
                      </div>
                    ))}
                    {pricingRules.filter(r => r.rule_type === 'custom').length === 0 && (
                      <p className="text-sm text-[#d4c9b8]">Nenhuma data customizada</p>
                    )}
                  </div>
                </div>

                {/* Right column: Pricing calendar preview */}
                <div className="bg-white border border-[#d4c9b8] rounded-xl p-4">
                  <h3 className="font-serif text-base font-bold text-[#1a1410] mb-3">Calendário de preços</h3>

                  {/* Month navigation */}
                  <div className="flex items-center justify-between mb-3">
                    <button
                      onClick={() => { if (pricingMonth === 0) { setPricingMonth(11); setPricingYear(y => y - 1); } else setPricingMonth(m => m - 1); }}
                      className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#F7F2EB] text-[#5a4f45]"
                    >←</button>
                    <span className="font-serif text-base text-[#1a1410]">{MONTHS_PT[pricingMonth]} {pricingYear}</span>
                    <button
                      onClick={() => { if (pricingMonth === 11) { setPricingMonth(0); setPricingYear(y => y + 1); } else setPricingMonth(m => m + 1); }}
                      className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#F7F2EB] text-[#5a4f45]"
                    >→</button>
                  </div>

                  {/* Day labels */}
                  <div className="grid grid-cols-7 gap-0.5 mb-1">
                    {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
                      <div key={i} className="text-center text-xs font-semibold text-[#5a4f45] py-1">{d}</div>
                    ))}
                  </div>

                  {/* Calendar grid */}
                  <div className="grid grid-cols-7 gap-0.5">
                    {(() => {
                      const firstDay = new Date(pricingYear, pricingMonth, 1).getDay();
                      const daysInMonth = new Date(pricingYear, pricingMonth + 1, 0).getDate();
                      const cells: (number | null)[] = [];
                      for (let i = 0; i < firstDay; i++) cells.push(null);
                      for (let d = 1; d <= daysInMonth; d++) cells.push(d);
                      return cells.map((day, i) => {
                        if (day === null) return <div key={`e-${i}`} />;
                        const dateStr = toISODate(pricingYear, pricingMonth, day);
                        const priceInfo = getPriceForDateLocal(dateStr);
                        const bgColor = !priceInfo ? 'bg-gray-50' :
                          priceInfo.type === 'custom' ? 'bg-purple-50 border-purple-200' :
                          priceInfo.type === 'seasonal' ? 'bg-green-50 border-green-200' :
                          priceInfo.type === 'weekend' ? 'bg-blue-50 border-blue-200' :
                          'bg-white';
                        return (
                          <div
                            key={day}
                            className={`aspect-square flex flex-col items-center justify-center rounded-lg border text-xs ${bgColor} transition-colors`}
                            title={priceInfo ? `${priceInfo.label}: R$${priceInfo.price}` : 'Sem preço configurado'}
                          >
                            <span className="font-medium text-[#1a1410]">{day}</span>
                            {priceInfo && (
                              <span className="text-[10px] text-[#5a4f45] leading-none mt-0.5">
                                {priceInfo.price}
                              </span>
                            )}
                          </div>
                        );
                      });
                    })()}
                  </div>

                  {/* Legend */}
                  <div className="flex flex-wrap gap-3 mt-4 text-xs text-[#5a4f45]">
                    <div className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-white border border-[#d4c9b8]" /> Base</div>
                    <div className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-50 border border-blue-200" /> Fim de semana</div>
                    <div className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-50 border border-green-200" /> Temporada</div>
                    <div className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-purple-50 border border-purple-200" /> Customizado</div>
                  </div>
                </div>
              </div>
            )}

            {!pricingProperty && (
              <div className="text-center py-16 text-[#d4c9b8]">
                <p className="font-serif text-lg">Selecione um imóvel para gerenciar preços</p>
              </div>
            )}
          </div>
        )}

        {/* ─── TAB: IMOVEIS ─── */}
        {!loading && activeTab === 'imoveis' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-xl font-bold text-[#1a1410]">Imóveis</h2>
              <button
                onClick={openNewProperty}
                className="px-4 py-2.5 bg-[#AC4747] text-white rounded-lg text-sm font-medium hover:bg-[#8a3636] transition-colors"
              >
                + Adicionar imóvel
              </button>
            </div>

            {/* Properties list */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {properties.map(p => {
                const imgs = parseImages(p.images);
                return (
                  <div
                    key={p.id}
                    onClick={() => openEditProperty(p)}
                    className="bg-white rounded-xl border border-[#d4c9b8] overflow-hidden cursor-pointer hover:shadow-lg transition-shadow group"
                  >
                    {imgs[0] ? (
                      <div className="h-40 overflow-hidden">
                        <img
                          src={imgs[0]}
                          alt={p.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ) : (
                      <div className="h-40 bg-[#F7F2EB] flex items-center justify-center text-[#d4c9b8]">
                        <span className="text-4xl">🏠</span>
                      </div>
                    )}
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-[#1a1410] text-sm">{p.name}</h3>
                          <p className="text-xs text-[#5a4f45]">{p.location}</p>
                        </div>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          p.active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {p.active ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-[#AC4747]/10 text-[#AC4747] px-2 py-0.5 rounded-full">
                          {p.type}
                        </span>
                        {p.price && (
                          <span className="text-sm font-semibold text-[#1a1410]">
                            R$ {p.price}{p.price_unit ? `/${p.price_unit}` : ''}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Property Form Modal */}
            {showPropertyForm && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 overflow-y-auto">
                <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 my-8 max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-serif text-xl font-bold text-[#1a1410]">
                      {editingProperty ? 'Editar imóvel' : 'Novo imóvel'}
                    </h3>
                    <button
                      onClick={() => { setShowPropertyForm(false); setEditingProperty(null); }}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-[#5a4f45]"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {/* ID / Slug */}
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-[#5a4f45] mb-1">
                        ID (slug)
                      </label>
                      <input
                        type="text"
                        value={propertyForm.id}
                        onChange={e => setPropertyForm(f => ({ ...f, id: e.target.value }))}
                        disabled={!!editingProperty}
                        placeholder="meu-imovel"
                        className="w-full px-3 py-2.5 border border-[#d4c9b8] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#AC4747]/40 disabled:bg-gray-50 disabled:text-gray-400"
                      />
                    </div>

                    {/* Name */}
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-[#5a4f45] mb-1">Nome</label>
                      <input
                        type="text"
                        value={propertyForm.name}
                        onChange={e => setPropertyForm(f => ({ ...f, name: e.target.value }))}
                        className="w-full px-3 py-2.5 border border-[#d4c9b8] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#AC4747]/40"
                      />
                    </div>

                    {/* Location */}
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-[#5a4f45] mb-1">Localização</label>
                      <input
                        type="text"
                        value={propertyForm.location}
                        onChange={e => setPropertyForm(f => ({ ...f, location: e.target.value }))}
                        className="w-full px-3 py-2.5 border border-[#d4c9b8] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#AC4747]/40"
                      />
                    </div>

                    {/* Type */}
                    <div>
                      <label className="block text-sm font-medium text-[#5a4f45] mb-1">Tipo</label>
                      <select
                        value={propertyForm.type}
                        onChange={e => setPropertyForm(f => ({ ...f, type: e.target.value }))}
                        className="w-full px-3 py-2.5 border border-[#d4c9b8] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#AC4747]/40"
                      >
                        {PROPERTY_TYPES.map(t => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Badge */}
                    <div>
                      <label className="block text-sm font-medium text-[#5a4f45] mb-1">Badge</label>
                      <input
                        type="text"
                        value={propertyForm.badge}
                        onChange={e => setPropertyForm(f => ({ ...f, badge: e.target.value }))}
                        placeholder="Ex: Mais vendido"
                        className="w-full px-3 py-2.5 border border-[#d4c9b8] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#AC4747]/40"
                      />
                    </div>

                    {/* Price */}
                    <div>
                      <label className="block text-sm font-medium text-[#5a4f45] mb-1">Preço</label>
                      <input
                        type="text"
                        value={propertyForm.price}
                        onChange={e => setPropertyForm(f => ({ ...f, price: e.target.value }))}
                        placeholder="1.500"
                        className="w-full px-3 py-2.5 border border-[#d4c9b8] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#AC4747]/40"
                      />
                    </div>

                    {/* Price unit */}
                    <div>
                      <label className="block text-sm font-medium text-[#5a4f45] mb-1">Unidade de preço</label>
                      <input
                        type="text"
                        value={propertyForm.price_unit}
                        onChange={e => setPropertyForm(f => ({ ...f, price_unit: e.target.value }))}
                        placeholder="diária, noite, mês"
                        className="w-full px-3 py-2.5 border border-[#d4c9b8] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#AC4747]/40"
                      />
                    </div>

                    {/* Guests */}
                    <div>
                      <label className="block text-sm font-medium text-[#5a4f45] mb-1">Hóspedes</label>
                      <input
                        type="text"
                        value={propertyForm.guests}
                        onChange={e => setPropertyForm(f => ({ ...f, guests: e.target.value }))}
                        placeholder="Até 20 pessoas"
                        className="w-full px-3 py-2.5 border border-[#d4c9b8] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#AC4747]/40"
                      />
                    </div>

                    {/* Sort order */}
                    <div>
                      <label className="block text-sm font-medium text-[#5a4f45] mb-1">Ordem</label>
                      <input
                        type="number"
                        value={propertyForm.sort_order}
                        onChange={e => setPropertyForm(f => ({ ...f, sort_order: parseInt(e.target.value) || 0 }))}
                        className="w-full px-3 py-2.5 border border-[#d4c9b8] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#AC4747]/40"
                      />
                    </div>

                    {/* Description */}
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-[#5a4f45] mb-1">Descrição</label>
                      <textarea
                        value={propertyForm.description}
                        onChange={e => setPropertyForm(f => ({ ...f, description: e.target.value }))}
                        rows={3}
                        className="w-full px-3 py-2.5 border border-[#d4c9b8] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#AC4747]/40 resize-none"
                      />
                    </div>

                    {/* Features */}
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-[#5a4f45] mb-1">
                        Características <span className="text-[#d4c9b8] font-normal">(uma por linha)</span>
                      </label>
                      <textarea
                        value={propertyForm.features}
                        onChange={e => setPropertyForm(f => ({ ...f, features: e.target.value }))}
                        rows={4}
                        placeholder={"Piscina aquecida\nChurrasqueira\nWi-Fi"}
                        className="w-full px-3 py-2.5 border border-[#d4c9b8] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#AC4747]/40 resize-none font-mono"
                      />
                    </div>

                    {/* Images — Upload + URLs */}
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-[#5a4f45] mb-1">
                        Imagens
                      </label>

                      {/* Upload button */}
                      <div className="mb-3">
                        <input
                          type="file"
                          id="image-upload"
                          accept="image/jpeg,image/png,image/webp"
                          multiple
                          className="hidden"
                          onChange={async (e) => {
                            const files = e.target.files;
                            if (!files?.length) return;
                            setUploadingImages(true);
                            try {
                              const fd = new FormData();
                              for (const f of Array.from(files)) fd.append('files', f);
                              fd.append('propertyId', propertyForm.id || 'novo');
                              const res = await fetchApi('/api/upload', { method: 'POST', body: fd, raw: true });
                              const data = await res.json();
                              if (data.urls) {
                                const current = propertyForm.images.trim();
                                const newUrls = data.urls.join('\n');
                                setPropertyForm(f => ({
                                  ...f,
                                  images: current ? current + '\n' + newUrls : newUrls,
                                }));
                              }
                            } catch (err) { console.error('Upload error:', err); }
                            finally {
                              setUploadingImages(false);
                              e.target.value = '';
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => document.getElementById('image-upload')?.click()}
                          disabled={uploadingImages}
                          className="px-4 py-2 bg-[#AC4747] text-white rounded-lg text-sm font-medium hover:bg-[#8a3636] transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                          {uploadingImages ? (
                            <>
                              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                              Enviando...
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                              Enviar fotos
                            </>
                          )}
                        </button>
                      </div>

                      {/* Preview grid */}
                      {propertyForm.images.trim() && (
                        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mb-3">
                          {propertyForm.images.split('\n').map(u => u.trim()).filter(Boolean).map((url, i) => (
                            <div key={i} className="relative group aspect-square rounded-lg overflow-hidden border border-[#d4c9b8]">
                              <img src={url} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => {
                                  const imgs = propertyForm.images.split('\n').map(u => u.trim()).filter(Boolean);
                                  imgs.splice(i, 1);
                                  setPropertyForm(f => ({ ...f, images: imgs.join('\n') }));
                                }}
                                className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* URL textarea */}
                      <textarea
                        value={propertyForm.images}
                        onChange={e => setPropertyForm(f => ({ ...f, images: e.target.value }))}
                        rows={3}
                        placeholder="Ou cole URLs de imagens (uma por linha)"
                        className="w-full px-3 py-2.5 border border-[#d4c9b8] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#AC4747]/40 resize-none font-mono text-[#5a4f45]"
                      />
                    </div>

                    {/* Active toggle */}
                    <div className="sm:col-span-2 flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setPropertyForm(f => ({ ...f, active: !f.active }))}
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          propertyForm.active ? 'bg-emerald-500' : 'bg-gray-300'
                        }`}
                      >
                        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                          propertyForm.active ? 'translate-x-6' : ''
                        }`} />
                      </button>
                      <span className="text-sm text-[#5a4f45]">
                        {propertyForm.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 mt-8 pt-4 border-t border-[#d4c9b8]">
                    {editingProperty && (
                      <button
                        onClick={handleDeleteProperty}
                        disabled={actionLoading === 'property-delete'}
                        className="px-4 py-2.5 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors disabled:opacity-50"
                      >
                        Desativar
                      </button>
                    )}
                    <div className="flex-1" />
                    <button
                      onClick={() => { setShowPropertyForm(false); setEditingProperty(null); }}
                      className="px-4 py-2.5 bg-gray-100 text-[#5a4f45] rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSaveProperty}
                      disabled={actionLoading === 'property' || !propertyForm.id || !propertyForm.name}
                      className="px-6 py-2.5 bg-[#AC4747] text-white rounded-lg text-sm font-medium hover:bg-[#8a3636] transition-colors disabled:opacity-50"
                    >
                      {actionLoading === 'property' ? 'Salvando...' : 'Salvar'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
