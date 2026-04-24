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
  checkin_time?: string | null;
  checkout_time?: string | null;
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

  const [activeTab, setActiveTab] = useState<'reservas' | 'calendario' | 'imoveis' | 'precos' | 'cadastros'>('reservas');

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
    sort_order: 0, active: true, checkin_time: '', checkout_time: '',
  });

  const [actionLoading, setActionLoading] = useState<number | string | null>(null);
  const [uploadingImages, setUploadingImages] = useState(false);

  // Cadastros tab
  interface Submission {
    id: number;
    name: string;
    phone: string;
    email: string | null;
    address: string;
    intent: string;
    description: string | null;
    images: string[] | string;
    details: Record<string, unknown> | string;
    status: string;
    admin_notes: string | null;
    created_at: string;
    updated_at: string;
  }
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [submissionFilter, setSubmissionFilter] = useState<string>('pending');
  const [expandedSubmission, setExpandedSubmission] = useState<number | null>(null);

  // Toast
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = useCallback((msg: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(msg);
    toastTimer.current = setTimeout(() => setToast(null), 1800);
  }, []);

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
    min_nights: number | null;
    cleaning_fee: number | null;
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

  const loadSubmissions = useCallback(async (status?: string) => {
    try {
      const q = status && status !== 'all' ? `?status=${status}` : '';
      const res = await fetchApi(`/api/submissions${q}`);
      if (res.ok) {
        const data = await res.json();
        setSubmissions(Array.isArray(data) ? data : []);
      }
    } catch (err) { console.error('Failed to load submissions:', err); }
  }, [fetchApi]);

  useEffect(() => {
    if (!authenticated) return;
    if (activeTab === 'cadastros') loadSubmissions(submissionFilter);
  }, [authenticated, activeTab, submissionFilter, loadSubmissions]);

  const updateSubmission = useCallback(async (id: number, status: string) => {
    setActionLoading(`sub-${id}`);
    try {
      const res = await fetchApi('/api/submissions', {
        method: 'PATCH',
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        setSubmissions(prev => prev.map(s => s.id === id ? { ...s, status } : s)
          .filter(s => submissionFilter === 'all' || s.status === submissionFilter));
        showToast(status === 'approved' ? 'Aprovado' : status === 'rejected' ? 'Rejeitado' : 'Atualizado');
      }
    } catch (err) { console.error(err); }
    finally { setActionLoading(null); }
  }, [fetchApi, submissionFilter, showToast]);

  const deleteSubmission = useCallback(async (id: number) => {
    if (!confirm('Excluir este cadastro? Essa ação é permanente.')) return;
    setActionLoading(`sub-${id}`);
    try {
      const res = await fetchApi('/api/submissions', {
        method: 'DELETE',
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setSubmissions(prev => prev.filter(s => s.id !== id));
        showToast('Removido');
      }
    } catch (err) { console.error(err); }
    finally { setActionLoading(null); }
  }, [fetchApi, showToast]);

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
    try {
      if (data.id) {
        // PUT: optimistic local update first, then reconcile with server response
        setPricingRules(prev => prev.map(r =>
          r.id === data.id ? { ...r, ...(data as Partial<PricingRuleLocal>) } : r
        ));
        const res = await fetchApi('/api/pricing', { method: 'PUT', body: JSON.stringify(data) });
        if (res.ok) {
          const saved = await res.json();
          setPricingRules(prev => prev.map(r => r.id === saved.id ? saved : r));
          showToast('Atualizado');
        }
      } else {
        // POST: wait for server to get the new id, then append
        const res = await fetchApi('/api/pricing', {
          method: 'POST',
          body: JSON.stringify({ ...data, property_id: pricingProperty }),
        });
        if (res.ok) {
          const created = await res.json();
          setPricingRules(prev => [...prev, created]);
          showToast('Criado');
        }
      }
    } catch (err) { console.error(err); }
  }, [fetchApi, pricingProperty, showToast]);

  // Reset local prices only when switching properties — not on every rule change.
  // This prevents overwriting fields the user is actively typing into.
  useEffect(() => {
    setLocalPrices({});
  }, [pricingProperty]);

  // Seed local prices from server rules for keys not yet touched by the user.
  useEffect(() => {
    const seed: Record<string, string> = {};
    const base = pricingRules.find(r => r.rule_type === 'base');
    if (base?.price_per_night != null) seed['base'] = String(base.price_per_night);
    if (base?.min_nights != null) seed['base_min_nights'] = String(base.min_nights);
    if (base?.cleaning_fee != null) seed['base_cleaning'] = String(base.cleaning_fee);
    const weekend = pricingRules.find(r => r.rule_type === 'weekend');
    if (weekend?.price_per_night != null) seed['weekend'] = String(weekend.price_per_night);
    if (weekend?.min_nights != null) seed['weekend_min_nights'] = String(weekend.min_nights);
    const surcharge = pricingRules.find(r => r.rule_type === 'guest_surcharge');
    if (surcharge?.min_guests != null) seed['min_guests'] = String(surcharge.min_guests);
    if (surcharge?.price_per_extra_guest != null) seed['price_extra'] = String(surcharge.price_per_extra_guest);
    pricingRules.filter(r => r.rule_type === 'seasonal').forEach(r => {
      if (r.price_per_night != null) seed[`seasonal_${r.id}`] = String(r.price_per_night);
      if (r.label != null) seed[`seasonal_label_${r.id}`] = r.label;
      if (r.season_start_day != null) seed[`seasonal_start_day_${r.id}`] = String(r.season_start_day);
      if (r.season_end_day != null) seed[`seasonal_end_day_${r.id}`] = String(r.season_end_day);
      if (r.min_nights != null) seed[`seasonal_min_nights_${r.id}`] = String(r.min_nights);
      if (r.min_guests != null) seed[`seasonal_min_guests_${r.id}`] = String(r.min_guests);
      if (r.price_per_extra_guest != null) seed[`seasonal_extra_${r.id}`] = String(r.price_per_extra_guest);
      if (r.cleaning_fee != null) seed[`seasonal_cleaning_${r.id}`] = String(r.cleaning_fee);
    });
    pricingRules.filter(r => r.rule_type === 'custom').forEach(r => {
      if (r.price_per_night != null) seed[`custom_${r.id}`] = String(r.price_per_night);
      if (r.label != null) seed[`custom_label_${r.id}`] = r.label;
      if (r.min_nights != null) seed[`custom_min_nights_${r.id}`] = String(r.min_nights);
      if (r.min_guests != null) seed[`custom_min_guests_${r.id}`] = String(r.min_guests);
      if (r.price_per_extra_guest != null) seed[`custom_extra_${r.id}`] = String(r.price_per_extra_guest);
      if (r.cleaning_fee != null) seed[`custom_cleaning_${r.id}`] = String(r.cleaning_fee);
    });
    setLocalPrices(prev => {
      const next = { ...prev };
      let changed = false;
      for (const [k, v] of Object.entries(seed)) {
        if (next[k] === undefined) { next[k] = v; changed = true; }
      }
      return changed ? next : prev;
    });
  }, [pricingRules]);

  const debouncedSavePricingRule = useCallback((key: string, data: Record<string, unknown>) => {
    if (priceTimers.current[key]) clearTimeout(priceTimers.current[key]);
    priceTimers.current[key] = setTimeout(() => {
      savePricingRule(data);
    }, 800);
  }, [savePricingRule]);

  const deletePricingRuleHandler = async (id: number) => {
    const snapshot = pricingRules;
    setPricingRules(prev => prev.filter(r => r.id !== id));
    try {
      const res = await fetchApi('/api/pricing', { method: 'DELETE', body: JSON.stringify({ id }) });
      if (!res.ok) setPricingRules(snapshot);
      else showToast('Removido');
    } catch (err) {
      console.error(err);
      setPricingRules(snapshot);
    }
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
      sort_order: 0, active: true, checkin_time: '', checkout_time: '',
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
      checkin_time: p.checkin_time || '',
      checkout_time: p.checkout_time || '',
    });
    setShowPropertyForm(true);
  };

  const handleSaveProperty = async () => {
    setActionLoading('property');
    const payload = {
      ...propertyForm,
      features: propertyForm.features.split('\n').map(f => f.trim()).filter(Boolean),
      images: propertyForm.images.split('\n').map(u => u.trim()).filter(Boolean),
      checkin_time: propertyForm.checkin_time.trim() || null,
      checkout_time: propertyForm.checkout_time.trim() || null,
    };

    try {
      if (editingProperty) {
        const res = await fetchApi('/api/properties', {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const updated = await res.json();
          setProperties(prev => prev.map(p =>
            p.id === (updated?.id ?? editingProperty.id)
              ? { ...p, ...(updated?.id ? updated : payload) }
              : p
          ));
          showToast('Atualizado');
        }
      } else {
        const res = await fetchApi('/api/properties', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        await loadProperties();
        if (res.ok) showToast('Criado');
      }
      setShowPropertyForm(false);
      setEditingProperty(null);
    } catch (err) { console.error(err); }
    finally { setActionLoading(null); }
  };

  const handleDeleteProperty = async () => {
    if (!editingProperty) return;
    if (!confirm(`Desativar "${editingProperty.name}"?`)) return;
    setActionLoading('property-delete');
    const deletedId = editingProperty.id;
    try {
      const res = await fetchApi('/api/properties', {
        method: 'DELETE',
        body: JSON.stringify({ id: deletedId }),
      });
      if (res.ok) {
        setProperties(prev => prev.map(p =>
          p.id === deletedId ? { ...p, active: false } : p
        ));
      }
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
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm">
          <div className="text-center mb-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="Hospeda Temporada"
              className="h-24 w-auto mx-auto object-contain"
            />
            <p className="text-[#4B5563] text-sm mt-1">Painel Administrativo</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#4B5563] mb-1">Senha</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-[#BFDBFE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 focus:border-[#2563EB] bg-[#F8FAFC]/50"
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
              className="w-full py-3 bg-[#2563EB] text-white rounded-lg font-semibold hover:bg-[#1D4ED8] transition-colors disabled:opacity-50"
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
        <div key={`h-${d}`} className="text-center text-xs font-semibold text-[#4B5563] py-1">
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
      let textClass = 'text-[#111827]';

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
        bgClass = 'bg-[#2563EB] cursor-pointer';
        textClass = 'text-white';
      } else if (isInSelection) {
        bgClass = 'bg-[#2563EB]/20 cursor-pointer';
        textClass = 'text-[#2563EB]';
      }

      cells.push(
        <button
          key={`d-${day}`}
          onClick={() => !isPast && handleCalendarDayClick(dateStr)}
          disabled={isPast}
          aria-label={dateStr}
          className={`relative aspect-square flex items-center justify-center rounded-lg text-sm font-medium border transition-colors ${bgClass} ${textClass} ${isToday ? 'ring-2 ring-[#2563EB]' : ''} ${isPast ? 'opacity-40 cursor-not-allowed' : ''}`}
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
        <h3 className="text-center font-serif font-semibold text-lg text-[#111827] mb-3">
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
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <header className="bg-white border-b border-[#BFDBFE] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="Hospeda Temporada"
              className="h-12 sm:h-14 w-auto object-contain"
            />
            <span className="hidden sm:inline text-xs bg-[#2563EB]/10 text-[#2563EB] px-2 py-0.5 rounded-full font-medium">
              Admin
            </span>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem('admin_password');
              setAuthenticated(false);
            }}
            className="text-sm text-[#4B5563] hover:text-[#2563EB] transition-colors"
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
              { key: 'cadastros' as const, label: 'Cadastros', icon: '📨' },
            ]).map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-[#2563EB] text-[#2563EB]'
                    : 'border-transparent text-[#4B5563] hover:text-[#111827]'
                }`}
              >
                <span className="mr-1.5">{tab.icon}</span>
                {tab.label}
                {tab.key === 'reservas' && pendingReservations.length > 0 && (
                  <span className="ml-1.5 bg-amber-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                    {pendingReservations.length}
                  </span>
                )}
                {tab.key === 'cadastros' && submissions.filter(s => s.status === 'pending').length > 0 && (
                  <span className="ml-1.5 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                    {submissions.filter(s => s.status === 'pending').length}
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
            <div className="animate-spin w-8 h-8 border-4 border-[#2563EB] border-t-transparent rounded-full" />
          </div>
        )}

        {/* ─── TAB: RESERVAS ─── */}
        {!loading && activeTab === 'reservas' && (
          <div className="space-y-8">
            {/* Pending Section */}
            <section className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="font-serif text-xl font-bold text-[#111827]">
                  Solicitações pendentes
                </h2>
                <span className="bg-amber-500 text-white text-sm font-bold px-2.5 py-0.5 rounded-full">
                  {pendingReservations.length}
                </span>
              </div>

              {pendingReservations.length === 0 ? (
                <p className="text-[#4B5563] text-sm py-4 text-center">
                  Nenhuma solicitação pendente
                </p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {pendingReservations.map(r => (
                    <div key={r.id} className="bg-white rounded-xl border border-amber-200 p-4 shadow-sm">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-semibold text-[#111827] text-sm">
                            {getPropertyName(r.property_id)}
                          </p>
                          <p className="text-xs text-[#4B5563]">{relativeTime(r.created_at)}</p>
                        </div>
                        <span className="bg-amber-100 text-amber-700 text-xs font-medium px-2 py-0.5 rounded-full">
                          Pendente
                        </span>
                      </div>
                      <div className="space-y-1.5 text-sm mb-4">
                        {r.guest_name && (
                          <p className="text-[#111827]">
                            <span className="text-[#4B5563]">Hóspede:</span> {r.guest_name}
                          </p>
                        )}
                        {r.guest_phone && (
                          <p className="text-[#111827]">
                            <span className="text-[#4B5563]">Telefone:</span> {r.guest_phone}
                          </p>
                        )}
                        {r.occasion && (
                          <p className="text-[#111827]">
                            <span className="text-[#4B5563]">Ocasião:</span> {r.occasion}
                          </p>
                        )}
                        {r.guest_count && (
                          <p className="text-[#111827]">
                            <span className="text-[#4B5563]">Hóspedes:</span> {r.guest_count}
                          </p>
                        )}
                        <p className="text-[#111827]">
                          <span className="text-[#4B5563]">Datas:</span>{' '}
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
                className="px-3 py-2 bg-white border border-[#BFDBFE] rounded-lg text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40"
              >
                <option value="">Todos os imóveis</option>
                {properties.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="px-3 py-2 bg-white border border-[#BFDBFE] rounded-lg text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40"
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
              <h2 className="font-serif text-xl font-bold text-[#111827] mb-4">
                {filterStatus ? `Reservas — ${filterStatus}` : 'Reservas aprovadas'}
              </h2>
              {(filterStatus ? allFilteredNonPending : approvedReservations).length === 0 ? (
                <p className="text-[#4B5563] text-sm py-4 text-center bg-white rounded-xl border border-[#BFDBFE]">
                  Nenhuma reserva encontrada
                </p>
              ) : (
                <div className="bg-white rounded-xl border border-[#BFDBFE] overflow-hidden">
                  {/* Desktop table header */}
                  <div className="hidden md:grid md:grid-cols-[1.5fr_1.5fr_1fr_1fr_0.8fr_1fr] gap-3 px-5 py-3 bg-[#F8FAFC] border-b border-[#BFDBFE] text-xs font-semibold text-[#4B5563] uppercase tracking-wide">
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
                      className="grid md:grid-cols-[1.5fr_1.5fr_1fr_1fr_0.8fr_1fr] gap-3 px-5 py-4 border-b border-[#BFDBFE]/50 items-center last:border-b-0"
                    >
                      <div>
                        <p className="font-medium text-sm text-[#111827]">{getPropertyName(r.property_id)}</p>
                        <p className="text-xs text-[#4B5563] md:hidden">
                          {r.type === 'manual' ? 'Bloqueio manual' : 'Reserva'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-[#111827]">{r.guest_name || r.reason || '—'}</p>
                        {r.guest_phone && (
                          <p className="text-xs text-[#4B5563]">{r.guest_phone}</p>
                        )}
                      </div>
                      <div className="text-sm text-[#111827]">
                        <span className="md:hidden text-xs text-[#4B5563]">Check-in: </span>
                        {formatDate(r.date_start)}
                      </div>
                      <div className="text-sm text-[#111827]">
                        <span className="md:hidden text-xs text-[#4B5563]">Check-out: </span>
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
                className="px-4 py-2.5 bg-white border border-[#BFDBFE] rounded-lg text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 min-w-[220px]"
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
                    className="p-2 bg-white border border-[#BFDBFE] rounded-lg hover:bg-[#F8FAFC] transition-colors"
                  >
                    ←
                  </button>
                  <button
                    onClick={() => navigateMonth(1)}
                    className="p-2 bg-white border border-[#BFDBFE] rounded-lg hover:bg-[#F8FAFC] transition-colors"
                  >
                    →
                  </button>
                </div>
              )}
            </div>

            {!calendarProperty ? (
              <div className="text-center py-16 text-[#4B5563]">
                <p className="text-lg">Selecione um imóvel para ver o calendário</p>
              </div>
            ) : (
              <>
                {/* Two-month calendar */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl border border-[#BFDBFE] p-5">
                    {renderMonth(calendarYear, calendarMonth)}
                  </div>
                  <div className="bg-white rounded-xl border border-[#BFDBFE] p-5">
                    {renderMonth(getSecondMonth().year, getSecondMonth().month)}
                  </div>
                </div>

                {/* Selection hint */}
                {blockStart && !blockEnd && (
                  <div className="bg-[#2563EB]/10 border border-[#2563EB]/30 rounded-lg px-4 py-3 text-sm text-[#2563EB]">
                    Início selecionado: <strong>{formatDate(blockStart)}</strong>. Clique em outro dia para definir o fim do bloqueio.
                  </div>
                )}

                {/* Legend */}
                <div className="flex flex-wrap gap-4 text-xs text-[#4B5563] bg-white rounded-xl border border-[#BFDBFE] p-4">
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded bg-white border border-[#BFDBFE]" />
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
                    <span className="w-4 h-4 rounded bg-[#2563EB]" />
                    Selecionado
                  </div>
                </div>
              </>
            )}

            {/* Block Creation Modal */}
            {showBlockModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                  <h3 className="font-serif text-lg font-bold text-[#111827] mb-4">
                    Criar bloqueio manual
                  </h3>
                  <div className="space-y-4">
                    <div className="bg-[#F8FAFC] rounded-lg p-3 text-sm">
                      <p className="text-[#4B5563]">
                        <span className="font-medium text-[#111827]">{getPropertyName(calendarProperty)}</span>
                      </p>
                      <p className="text-[#4B5563]">
                        {blockStart && formatDate(blockStart)} → {blockEnd && formatDate(blockEnd)}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#4B5563] mb-1">Motivo</label>
                      <select
                        value={blockReason}
                        onChange={e => setBlockReason(e.target.value)}
                        className="w-full px-3 py-2.5 border border-[#BFDBFE] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40"
                      >
                        {BLOCK_REASONS.map(r => (
                          <option key={r.value} value={r.value}>{r.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#4B5563] mb-1">
                        Observações <span className="text-[#BFDBFE]">(opcional)</span>
                      </label>
                      <textarea
                        value={blockNotes}
                        onChange={e => setBlockNotes(e.target.value)}
                        className="w-full px-3 py-2.5 border border-[#BFDBFE] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 resize-none"
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
                        className="flex-1 py-2.5 bg-gray-100 text-[#4B5563] rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleCreateBlock}
                        disabled={actionLoading === 'block'}
                        className="flex-1 py-2.5 bg-[#2563EB] text-white rounded-lg text-sm font-medium hover:bg-[#1D4ED8] transition-colors disabled:opacity-50"
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
                  <h3 className="font-serif text-lg font-bold text-[#111827] mb-4">
                    Detalhes do bloqueio
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="bg-[#F8FAFC] rounded-lg p-3">
                      <p className="text-[#4B5563]">
                        <span className="font-medium text-[#111827]">{getPropertyName(showDayDetail.property_id)}</span>
                      </p>
                      <p className="text-[#4B5563]">
                        {formatDate(showDayDetail.date_start)} → {formatDate(showDayDetail.date_end)}
                      </p>
                    </div>
                    <p>
                      <span className="text-[#4B5563]">Tipo:</span>{' '}
                      {showDayDetail.type === 'manual' ? 'Bloqueio manual' : 'Reserva de hóspede'}
                    </p>
                    <p>
                      <span className="text-[#4B5563]">Status:</span>{' '}
                      <span className={`font-medium ${
                        showDayDetail.status === 'approved' ? 'text-emerald-600' :
                        showDayDetail.status === 'pending' ? 'text-amber-600' : 'text-gray-600'
                      }`}>
                        {showDayDetail.status === 'approved' ? 'Aprovada' :
                         showDayDetail.status === 'pending' ? 'Pendente' : showDayDetail.status}
                      </span>
                    </p>
                    {showDayDetail.guest_name && (
                      <p><span className="text-[#4B5563]">Hóspede:</span> {showDayDetail.guest_name}</p>
                    )}
                    {showDayDetail.guest_phone && (
                      <p><span className="text-[#4B5563]">Telefone:</span> {showDayDetail.guest_phone}</p>
                    )}
                    {showDayDetail.reason && (
                      <p><span className="text-[#4B5563]">Motivo:</span> {showDayDetail.reason}</p>
                    )}
                    {showDayDetail.admin_notes && (
                      <p><span className="text-[#4B5563]">Obs:</span> {showDayDetail.admin_notes}</p>
                    )}
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => setShowDayDetail(null)}
                      className="flex-1 py-2.5 bg-gray-100 text-[#4B5563] rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
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
            <h2 className="font-serif text-xl font-bold text-[#111827]">Gestão de Preços</h2>

            {/* Property selector */}
            <select
              value={pricingProperty}
              onChange={e => setPricingProperty(e.target.value)}
              className="w-full sm:w-64 px-3 py-2.5 border border-[#BFDBFE] rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40"
            >
              <option value="">Selecione um imóvel</option>
              {properties.filter(p => p.active).map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>

            {pricingProperty && pricingLoading && (
              <div className="text-center py-8 text-[#4B5563]">Carregando...</div>
            )}

            {pricingProperty && !pricingLoading && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left column: Rules */}
                <div className="space-y-4">
                  {/* Base price */}
                  <div className="bg-white border border-[#BFDBFE] rounded-xl p-4">
                    <h3 className="font-serif text-base font-bold text-[#111827] mb-3">Preço base</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-[#4B5563]">R$</span>
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
                        className="w-32 px-3 py-2 border border-[#BFDBFE] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40"
                      />
                      <span className="text-sm text-[#4B5563]">/ noite</span>
                    </div>
                    <div className="mt-3 pt-3 border-t border-[#BFDBFE]/50">
                      <label className="block text-sm text-[#4B5563] mb-1">Mínimo global de noites</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={1}
                          value={localPrices['base_min_nights'] ?? ''}
                          onChange={e => {
                            setLocalPrices(prev => ({ ...prev, base_min_nights: e.target.value }));
                            const raw = e.target.value.trim();
                            const val = raw === '' ? null : Math.max(1, parseInt(raw) || 1);
                            const existing = pricingRules.find(r => r.rule_type === 'base');
                            debouncedSavePricingRule('base_min_nights', { id: existing?.id, rule_type: 'base', min_nights: val });
                          }}
                          placeholder="sem mínimo"
                          className="w-32 px-3 py-2 border border-[#BFDBFE] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40"
                        />
                        <span className="text-xs text-[#4B5563]">noites</span>
                      </div>
                      <p className="text-xs text-[#9CA3AF] mt-1">Aplica em qualquer reserva. Deixe vazio para sem mínimo.</p>
                    </div>
                    <div className="mt-3 pt-3 border-t border-[#BFDBFE]/50">
                      <label className="block text-sm text-[#4B5563] mb-1">Taxa de limpeza</label>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-[#4B5563]">R$</span>
                        <input
                          type="number"
                          min={0}
                          value={localPrices['base_cleaning'] ?? ''}
                          onChange={e => {
                            setLocalPrices(prev => ({ ...prev, base_cleaning: e.target.value }));
                            const raw = e.target.value.trim();
                            const val = raw === '' ? null : Math.max(0, parseInt(raw) || 0);
                            const existing = pricingRules.find(r => r.rule_type === 'base');
                            debouncedSavePricingRule('base_cleaning', { id: existing?.id, rule_type: 'base', cleaning_fee: val });
                          }}
                          placeholder="sem taxa"
                          className="w-32 px-3 py-2 border border-[#BFDBFE] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40"
                        />
                        <span className="text-xs text-[#4B5563]">por reserva</span>
                      </div>
                      <p className="text-xs text-[#9CA3AF] mt-1">Cobrada uma vez na reserva. Temporadas/datas podem sobrescrever.</p>
                    </div>
                  </div>

                  {/* Weekend price */}
                  <div className="bg-white border border-[#BFDBFE] rounded-xl p-4">
                    <h3 className="font-serif text-base font-bold text-[#111827] mb-3">Fim de semana</h3>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-sm text-[#4B5563]">R$</span>
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
                        className="w-32 px-3 py-2 border border-[#BFDBFE] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40"
                      />
                      <span className="text-sm text-[#4B5563]">/ noite</span>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((d, i) => {
                        const weekendRule = pricingRules.find(r => r.rule_type === 'weekend');
                        const days = weekendRule?.weekend_days || [5, 6];
                        const checked = days.includes(i);
                        return (
                          <label key={i} className="flex items-center gap-1 text-xs text-[#4B5563]">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => {
                                const newDays = checked ? days.filter((x: number) => x !== i) : [...days, i];
                                if (weekendRule) {
                                  savePricingRule({ id: weekendRule.id, rule_type: 'weekend', price_per_night: weekendRule.price_per_night, weekend_days: newDays });
                                }
                              }}
                              className="rounded border-[#BFDBFE]"
                            />
                            {d}
                          </label>
                        );
                      })}
                    </div>
                    <div className="mt-3 pt-3 border-t border-[#BFDBFE]/50">
                      <label className="block text-sm text-[#4B5563] mb-1">Mínimo de noites neste período</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={1}
                          value={localPrices['weekend_min_nights'] ?? ''}
                          onChange={e => {
                            setLocalPrices(prev => ({ ...prev, weekend_min_nights: e.target.value }));
                            const raw = e.target.value.trim();
                            const val = raw === '' ? null : Math.max(1, parseInt(raw) || 1);
                            const existing = pricingRules.find(r => r.rule_type === 'weekend');
                            debouncedSavePricingRule('weekend_min_nights', { id: existing?.id, rule_type: 'weekend', min_nights: val, weekend_days: existing?.weekend_days || [5, 6] });
                          }}
                          placeholder="sem mínimo"
                          className="w-32 px-3 py-2 border border-[#BFDBFE] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40"
                        />
                        <span className="text-xs text-[#4B5563]">noites</span>
                      </div>
                      <p className="text-xs text-[#9CA3AF] mt-1">Conta apenas noites dentro do fim de semana. Hóspede não pode diluir pegando dias fora.</p>
                    </div>
                  </div>

                  {/* Guest surcharge */}
                  <div className="bg-white border border-[#BFDBFE] rounded-xl p-4">
                    <h3 className="font-serif text-base font-bold text-[#111827] mb-3">Extra por hóspede</h3>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm text-[#4B5563]">A partir de</span>
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
                        className="w-20 px-2 py-2 border border-[#BFDBFE] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40"
                      />
                      <span className="text-sm text-[#4B5563]">pessoas, + R$</span>
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
                        className="w-20 px-2 py-2 border border-[#BFDBFE] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40"
                      />
                      <span className="text-sm text-[#4B5563]">/ pessoa / noite</span>
                    </div>
                  </div>

                  {/* Seasonal rules */}
                  <div className="bg-white border border-[#BFDBFE] rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-serif text-base font-bold text-[#111827]">Temporadas</h3>
                      <button
                        onClick={() => savePricingRule({ rule_type: 'seasonal', price_per_night: 0, season_start_month: 12, season_start_day: 15, season_end_month: 1, season_end_day: 31, label: 'Nova temporada' })}
                        className="text-xs px-3 py-1.5 bg-[#2563EB] text-white rounded-lg hover:bg-[#1D4ED8] transition-colors"
                      >
                        + Adicionar
                      </button>
                    </div>
                    {pricingRules.filter(r => r.rule_type === 'seasonal').map(rule => (
                      <div key={rule.id} className="border border-[#BFDBFE]/50 rounded-lg p-3 mb-2 space-y-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={localPrices[`seasonal_label_${rule.id}`] ?? ''}
                            onChange={e => {
                              setLocalPrices(prev => ({ ...prev, [`seasonal_label_${rule.id}`]: e.target.value }));
                              debouncedSavePricingRule(`seasonal_label_${rule.id}`, { id: rule.id, rule_type: 'seasonal', label: e.target.value });
                            }}
                            placeholder="Nome da temporada"
                            className="flex-1 px-2 py-1.5 border border-[#BFDBFE] rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40"
                          />
                          <button onClick={() => deletePricingRuleHandler(rule.id)} className="text-red-500 text-sm hover:text-red-700">✕</button>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-sm text-[#4B5563]">
                          <span>De</span>
                          <select value={rule.season_start_month || 1} onChange={e => savePricingRule({ id: rule.id, rule_type: 'seasonal', season_start_month: parseInt(e.target.value) })} className="px-2 py-1 border border-[#BFDBFE] rounded text-sm">
                            {MONTHS_PT.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                          </select>
                          <input type="number" min={1} max={31} value={localPrices[`seasonal_start_day_${rule.id}`] ?? rule.season_start_day ?? 1} onChange={e => {
                            setLocalPrices(prev => ({ ...prev, [`seasonal_start_day_${rule.id}`]: e.target.value }));
                            debouncedSavePricingRule(`seasonal_start_day_${rule.id}`, { id: rule.id, rule_type: 'seasonal', season_start_day: parseInt(e.target.value) });
                          }} className="w-14 px-2 py-1 border border-[#BFDBFE] rounded text-sm" />
                          <span>até</span>
                          <select value={rule.season_end_month || 1} onChange={e => savePricingRule({ id: rule.id, rule_type: 'seasonal', season_end_month: parseInt(e.target.value) })} className="px-2 py-1 border border-[#BFDBFE] rounded text-sm">
                            {MONTHS_PT.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                          </select>
                          <input type="number" min={1} max={31} value={localPrices[`seasonal_end_day_${rule.id}`] ?? rule.season_end_day ?? 31} onChange={e => {
                            setLocalPrices(prev => ({ ...prev, [`seasonal_end_day_${rule.id}`]: e.target.value }));
                            debouncedSavePricingRule(`seasonal_end_day_${rule.id}`, { id: rule.id, rule_type: 'seasonal', season_end_day: parseInt(e.target.value) });
                          }} className="w-14 px-2 py-1 border border-[#BFDBFE] rounded text-sm" />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-[#4B5563]">R$</span>
                          <input type="number" value={localPrices[`seasonal_${rule.id}`] ?? ''} onChange={e => {
                            setLocalPrices(prev => ({ ...prev, [`seasonal_${rule.id}`]: e.target.value }));
                            debouncedSavePricingRule(`seasonal_${rule.id}`, { id: rule.id, rule_type: 'seasonal', price_per_night: parseInt(e.target.value) || 0 });
                          }} placeholder="0" className="w-28 px-2 py-1.5 border border-[#BFDBFE] rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40" />
                          <span className="text-sm text-[#4B5563]">/ noite</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm text-[#4B5563]">Mínimo</span>
                          <input
                            type="number"
                            min={1}
                            value={localPrices[`seasonal_min_nights_${rule.id}`] ?? ''}
                            onChange={e => {
                              setLocalPrices(prev => ({ ...prev, [`seasonal_min_nights_${rule.id}`]: e.target.value }));
                              const raw = e.target.value.trim();
                              const val = raw === '' ? null : Math.max(1, parseInt(raw) || 1);
                              debouncedSavePricingRule(`seasonal_min_nights_${rule.id}`, { id: rule.id, rule_type: 'seasonal', min_nights: val });
                            }}
                            placeholder="sem mínimo"
                            className="w-28 px-2 py-1.5 border border-[#BFDBFE] rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40"
                          />
                          <span className="text-sm text-[#4B5563]">noites dentro do período</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm text-[#4B5563]">A partir de</span>
                          <input
                            type="number"
                            min={0}
                            value={localPrices[`seasonal_min_guests_${rule.id}`] ?? ''}
                            onChange={e => {
                              setLocalPrices(prev => ({ ...prev, [`seasonal_min_guests_${rule.id}`]: e.target.value }));
                              const raw = e.target.value.trim();
                              const val = raw === '' ? null : Math.max(0, parseInt(raw) || 0);
                              debouncedSavePricingRule(`seasonal_min_guests_${rule.id}`, { id: rule.id, rule_type: 'seasonal', min_guests: val });
                            }}
                            placeholder="usa geral"
                            className="w-20 px-2 py-1.5 border border-[#BFDBFE] rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40"
                          />
                          <span className="text-sm text-[#4B5563]">pessoas, + R$</span>
                          <input
                            type="number"
                            min={0}
                            value={localPrices[`seasonal_extra_${rule.id}`] ?? ''}
                            onChange={e => {
                              setLocalPrices(prev => ({ ...prev, [`seasonal_extra_${rule.id}`]: e.target.value }));
                              const raw = e.target.value.trim();
                              const val = raw === '' ? null : Math.max(0, parseInt(raw) || 0);
                              debouncedSavePricingRule(`seasonal_extra_${rule.id}`, { id: rule.id, rule_type: 'seasonal', price_per_extra_guest: val });
                            }}
                            placeholder="usa geral"
                            className="w-20 px-2 py-1.5 border border-[#BFDBFE] rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40"
                          />
                          <span className="text-sm text-[#4B5563]">/ pessoa / noite</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm text-[#4B5563]">Limpeza R$</span>
                          <input
                            type="number"
                            min={0}
                            value={localPrices[`seasonal_cleaning_${rule.id}`] ?? ''}
                            onChange={e => {
                              setLocalPrices(prev => ({ ...prev, [`seasonal_cleaning_${rule.id}`]: e.target.value }));
                              const raw = e.target.value.trim();
                              const val = raw === '' ? null : Math.max(0, parseInt(raw) || 0);
                              debouncedSavePricingRule(`seasonal_cleaning_${rule.id}`, { id: rule.id, rule_type: 'seasonal', cleaning_fee: val });
                            }}
                            placeholder="usa geral"
                            className="w-28 px-2 py-1.5 border border-[#BFDBFE] rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40"
                          />
                          <span className="text-sm text-[#4B5563]">por reserva</span>
                        </div>
                      </div>
                    ))}
                    {pricingRules.filter(r => r.rule_type === 'seasonal').length === 0 && (
                      <p className="text-sm text-[#BFDBFE]">Nenhuma temporada configurada</p>
                    )}
                  </div>

                  {/* Custom date overrides */}
                  <div className="bg-white border border-[#BFDBFE] rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-serif text-base font-bold text-[#111827]">Datas customizadas</h3>
                      <button
                        onClick={() => savePricingRule({ rule_type: 'custom', price_per_night: 0, date_start: toISODate(pricingYear, pricingMonth, 1), date_end: toISODate(pricingYear, pricingMonth, 7), label: 'Evento especial', priority: 10 })}
                        className="text-xs px-3 py-1.5 bg-[#2563EB] text-white rounded-lg hover:bg-[#1D4ED8] transition-colors"
                      >
                        + Adicionar
                      </button>
                    </div>
                    {pricingRules.filter(r => r.rule_type === 'custom').map(rule => (
                      <div key={rule.id} className="border border-[#BFDBFE]/50 rounded-lg p-3 mb-2 space-y-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={localPrices[`custom_label_${rule.id}`] ?? ''}
                            onChange={e => {
                              setLocalPrices(prev => ({ ...prev, [`custom_label_${rule.id}`]: e.target.value }));
                              debouncedSavePricingRule(`custom_label_${rule.id}`, { id: rule.id, rule_type: 'custom', label: e.target.value });
                            }}
                            placeholder="Nome (ex: Réveillon)"
                            className="flex-1 px-2 py-1.5 border border-[#BFDBFE] rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40"
                          />
                          <button onClick={() => deletePricingRuleHandler(rule.id)} className="text-red-500 text-sm hover:text-red-700">✕</button>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-sm text-[#4B5563]">
                          <span>De</span>
                          <input type="date" value={rule.date_start || ''} onChange={e => savePricingRule({ id: rule.id, rule_type: 'custom', date_start: e.target.value })} className="px-2 py-1 border border-[#BFDBFE] rounded text-sm" />
                          <span>até</span>
                          <input type="date" value={rule.date_end || ''} onChange={e => savePricingRule({ id: rule.id, rule_type: 'custom', date_end: e.target.value })} className="px-2 py-1 border border-[#BFDBFE] rounded text-sm" />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-[#4B5563]">R$</span>
                          <input type="number" value={localPrices[`custom_${rule.id}`] ?? ''} onChange={e => {
                            setLocalPrices(prev => ({ ...prev, [`custom_${rule.id}`]: e.target.value }));
                            debouncedSavePricingRule(`custom_${rule.id}`, { id: rule.id, rule_type: 'custom', price_per_night: parseInt(e.target.value) || 0 });
                          }} placeholder="0" className="w-28 px-2 py-1.5 border border-[#BFDBFE] rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40" />
                          <span className="text-sm text-[#4B5563]">/ noite</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm text-[#4B5563]">Mínimo</span>
                          <input
                            type="number"
                            min={1}
                            value={localPrices[`custom_min_nights_${rule.id}`] ?? ''}
                            onChange={e => {
                              setLocalPrices(prev => ({ ...prev, [`custom_min_nights_${rule.id}`]: e.target.value }));
                              const raw = e.target.value.trim();
                              const val = raw === '' ? null : Math.max(1, parseInt(raw) || 1);
                              debouncedSavePricingRule(`custom_min_nights_${rule.id}`, { id: rule.id, rule_type: 'custom', min_nights: val });
                            }}
                            placeholder="sem mínimo"
                            className="w-28 px-2 py-1.5 border border-[#BFDBFE] rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40"
                          />
                          <span className="text-sm text-[#4B5563]">noites dentro do período</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm text-[#4B5563]">A partir de</span>
                          <input
                            type="number"
                            min={0}
                            value={localPrices[`custom_min_guests_${rule.id}`] ?? ''}
                            onChange={e => {
                              setLocalPrices(prev => ({ ...prev, [`custom_min_guests_${rule.id}`]: e.target.value }));
                              const raw = e.target.value.trim();
                              const val = raw === '' ? null : Math.max(0, parseInt(raw) || 0);
                              debouncedSavePricingRule(`custom_min_guests_${rule.id}`, { id: rule.id, rule_type: 'custom', min_guests: val });
                            }}
                            placeholder="usa geral"
                            className="w-20 px-2 py-1.5 border border-[#BFDBFE] rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40"
                          />
                          <span className="text-sm text-[#4B5563]">pessoas, + R$</span>
                          <input
                            type="number"
                            min={0}
                            value={localPrices[`custom_extra_${rule.id}`] ?? ''}
                            onChange={e => {
                              setLocalPrices(prev => ({ ...prev, [`custom_extra_${rule.id}`]: e.target.value }));
                              const raw = e.target.value.trim();
                              const val = raw === '' ? null : Math.max(0, parseInt(raw) || 0);
                              debouncedSavePricingRule(`custom_extra_${rule.id}`, { id: rule.id, rule_type: 'custom', price_per_extra_guest: val });
                            }}
                            placeholder="usa geral"
                            className="w-20 px-2 py-1.5 border border-[#BFDBFE] rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40"
                          />
                          <span className="text-sm text-[#4B5563]">/ pessoa / noite</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm text-[#4B5563]">Limpeza R$</span>
                          <input
                            type="number"
                            min={0}
                            value={localPrices[`custom_cleaning_${rule.id}`] ?? ''}
                            onChange={e => {
                              setLocalPrices(prev => ({ ...prev, [`custom_cleaning_${rule.id}`]: e.target.value }));
                              const raw = e.target.value.trim();
                              const val = raw === '' ? null : Math.max(0, parseInt(raw) || 0);
                              debouncedSavePricingRule(`custom_cleaning_${rule.id}`, { id: rule.id, rule_type: 'custom', cleaning_fee: val });
                            }}
                            placeholder="usa geral"
                            className="w-28 px-2 py-1.5 border border-[#BFDBFE] rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40"
                          />
                          <span className="text-sm text-[#4B5563]">por reserva</span>
                        </div>
                      </div>
                    ))}
                    {pricingRules.filter(r => r.rule_type === 'custom').length === 0 && (
                      <p className="text-sm text-[#BFDBFE]">Nenhuma data customizada</p>
                    )}
                  </div>
                </div>

                {/* Right column: Pricing calendar preview */}
                <div className="bg-white border border-[#BFDBFE] rounded-xl p-4">
                  <h3 className="font-serif text-base font-bold text-[#111827] mb-3">Calendário de preços</h3>

                  {/* Month navigation */}
                  <div className="flex items-center justify-between mb-3">
                    <button
                      onClick={() => { if (pricingMonth === 0) { setPricingMonth(11); setPricingYear(y => y - 1); } else setPricingMonth(m => m - 1); }}
                      className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#F8FAFC] text-[#4B5563]"
                    >←</button>
                    <span className="font-serif text-base text-[#111827]">{MONTHS_PT[pricingMonth]} {pricingYear}</span>
                    <button
                      onClick={() => { if (pricingMonth === 11) { setPricingMonth(0); setPricingYear(y => y + 1); } else setPricingMonth(m => m + 1); }}
                      className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#F8FAFC] text-[#4B5563]"
                    >→</button>
                  </div>

                  {/* Day labels */}
                  <div className="grid grid-cols-7 gap-0.5 mb-1">
                    {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
                      <div key={i} className="text-center text-xs font-semibold text-[#4B5563] py-1">{d}</div>
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
                            <span className="font-medium text-[#111827]">{day}</span>
                            {priceInfo && (
                              <span className="text-[10px] text-[#4B5563] leading-none mt-0.5">
                                {priceInfo.price}
                              </span>
                            )}
                          </div>
                        );
                      });
                    })()}
                  </div>

                  {/* Legend */}
                  <div className="flex flex-wrap gap-3 mt-4 text-xs text-[#4B5563]">
                    <div className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-white border border-[#BFDBFE]" /> Base</div>
                    <div className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-50 border border-blue-200" /> Fim de semana</div>
                    <div className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-50 border border-green-200" /> Temporada</div>
                    <div className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-purple-50 border border-purple-200" /> Customizado</div>
                  </div>
                </div>
              </div>
            )}

            {!pricingProperty && (
              <div className="text-center py-16 text-[#BFDBFE]">
                <p className="font-serif text-lg">Selecione um imóvel para gerenciar preços</p>
              </div>
            )}
          </div>
        )}

        {/* ─── TAB: IMOVEIS ─── */}
        {!loading && activeTab === 'imoveis' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-xl font-bold text-[#111827]">Imóveis</h2>
              <button
                onClick={openNewProperty}
                className="px-4 py-2.5 bg-[#2563EB] text-white rounded-lg text-sm font-medium hover:bg-[#1D4ED8] transition-colors"
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
                    className="bg-white rounded-xl border border-[#BFDBFE] overflow-hidden cursor-pointer hover:shadow-lg transition-shadow group"
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
                      <div className="h-40 bg-[#F8FAFC] flex items-center justify-center text-[#BFDBFE]">
                        <span className="text-4xl">🏠</span>
                      </div>
                    )}
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-[#111827] text-sm">{p.name}</h3>
                          <p className="text-xs text-[#4B5563]">{p.location}</p>
                        </div>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          p.active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {p.active ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-[#2563EB]/10 text-[#2563EB] px-2 py-0.5 rounded-full">
                          {p.type}
                        </span>
                        {p.price && (
                          <span className="text-sm font-semibold text-[#111827]">
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
                    <h3 className="font-serif text-xl font-bold text-[#111827]">
                      {editingProperty ? 'Editar imóvel' : 'Novo imóvel'}
                    </h3>
                    <button
                      onClick={() => { setShowPropertyForm(false); setEditingProperty(null); }}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-[#4B5563]"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {/* ID / Slug */}
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-[#4B5563] mb-1">
                        ID (slug)
                      </label>
                      <input
                        type="text"
                        value={propertyForm.id}
                        onChange={e => setPropertyForm(f => ({ ...f, id: e.target.value }))}
                        disabled={!!editingProperty}
                        placeholder="meu-imovel"
                        className="w-full px-3 py-2.5 border border-[#BFDBFE] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 disabled:bg-gray-50 disabled:text-gray-400"
                      />
                    </div>

                    {/* Name */}
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-[#4B5563] mb-1">Nome</label>
                      <input
                        type="text"
                        value={propertyForm.name}
                        onChange={e => setPropertyForm(f => ({ ...f, name: e.target.value }))}
                        className="w-full px-3 py-2.5 border border-[#BFDBFE] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40"
                      />
                    </div>

                    {/* Location */}
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-[#4B5563] mb-1">Localização</label>
                      <input
                        type="text"
                        value={propertyForm.location}
                        onChange={e => setPropertyForm(f => ({ ...f, location: e.target.value }))}
                        className="w-full px-3 py-2.5 border border-[#BFDBFE] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40"
                      />
                    </div>

                    {/* Type */}
                    <div>
                      <label className="block text-sm font-medium text-[#4B5563] mb-1">Tipo</label>
                      <select
                        value={propertyForm.type}
                        onChange={e => setPropertyForm(f => ({ ...f, type: e.target.value }))}
                        className="w-full px-3 py-2.5 border border-[#BFDBFE] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40"
                      >
                        {PROPERTY_TYPES.map(t => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Badge */}
                    <div>
                      <label className="block text-sm font-medium text-[#4B5563] mb-1">Badge</label>
                      <input
                        type="text"
                        value={propertyForm.badge}
                        onChange={e => setPropertyForm(f => ({ ...f, badge: e.target.value }))}
                        placeholder="Ex: Mais vendido"
                        className="w-full px-3 py-2.5 border border-[#BFDBFE] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40"
                      />
                    </div>

                    {/* Price */}
                    <div>
                      <label className="block text-sm font-medium text-[#4B5563] mb-1">Preço</label>
                      <input
                        type="text"
                        value={propertyForm.price}
                        onChange={e => setPropertyForm(f => ({ ...f, price: e.target.value }))}
                        placeholder="1.500"
                        className="w-full px-3 py-2.5 border border-[#BFDBFE] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40"
                      />
                    </div>

                    {/* Price unit */}
                    <div>
                      <label className="block text-sm font-medium text-[#4B5563] mb-1">Unidade de preço</label>
                      <input
                        type="text"
                        value={propertyForm.price_unit}
                        onChange={e => setPropertyForm(f => ({ ...f, price_unit: e.target.value }))}
                        placeholder="diária, noite, mês"
                        className="w-full px-3 py-2.5 border border-[#BFDBFE] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40"
                      />
                    </div>

                    {/* Guests */}
                    <div>
                      <label className="block text-sm font-medium text-[#4B5563] mb-1">Hóspedes</label>
                      <input
                        type="text"
                        value={propertyForm.guests}
                        onChange={e => setPropertyForm(f => ({ ...f, guests: e.target.value }))}
                        placeholder="Até 20 pessoas"
                        className="w-full px-3 py-2.5 border border-[#BFDBFE] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40"
                      />
                    </div>

                    {/* Sort order */}
                    <div>
                      <label className="block text-sm font-medium text-[#4B5563] mb-1">Ordem</label>
                      <input
                        type="number"
                        value={propertyForm.sort_order}
                        onChange={e => setPropertyForm(f => ({ ...f, sort_order: parseInt(e.target.value) || 0 }))}
                        className="w-full px-3 py-2.5 border border-[#BFDBFE] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40"
                      />
                    </div>

                    {/* Check-in time */}
                    <div>
                      <label className="block text-sm font-medium text-[#4B5563] mb-1">
                        Horário check-in <span className="text-[#BFDBFE] font-normal">(opcional)</span>
                      </label>
                      <input
                        type="time"
                        value={propertyForm.checkin_time}
                        onChange={e => setPropertyForm(f => ({ ...f, checkin_time: e.target.value }))}
                        className="w-full px-3 py-2.5 border border-[#BFDBFE] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40"
                      />
                    </div>

                    {/* Check-out time */}
                    <div>
                      <label className="block text-sm font-medium text-[#4B5563] mb-1">
                        Horário check-out <span className="text-[#BFDBFE] font-normal">(opcional)</span>
                      </label>
                      <input
                        type="time"
                        value={propertyForm.checkout_time}
                        onChange={e => setPropertyForm(f => ({ ...f, checkout_time: e.target.value }))}
                        className="w-full px-3 py-2.5 border border-[#BFDBFE] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40"
                      />
                    </div>

                    {/* Description */}
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-[#4B5563] mb-1">Descrição</label>
                      <textarea
                        value={propertyForm.description}
                        onChange={e => setPropertyForm(f => ({ ...f, description: e.target.value }))}
                        rows={3}
                        className="w-full px-3 py-2.5 border border-[#BFDBFE] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 resize-none"
                      />
                    </div>

                    {/* Features */}
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-[#4B5563] mb-1">
                        Características <span className="text-[#BFDBFE] font-normal">(uma por linha)</span>
                      </label>
                      <textarea
                        value={propertyForm.features}
                        onChange={e => setPropertyForm(f => ({ ...f, features: e.target.value }))}
                        rows={4}
                        placeholder={"Piscina aquecida\nChurrasqueira\nWi-Fi"}
                        className="w-full px-3 py-2.5 border border-[#BFDBFE] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 resize-none font-mono"
                      />
                    </div>

                    {/* Images — Upload + URLs */}
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-[#4B5563] mb-1">
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
                          className="px-4 py-2 bg-[#2563EB] text-white rounded-lg text-sm font-medium hover:bg-[#1D4ED8] transition-colors disabled:opacity-50 flex items-center gap-2"
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
                            <div key={i} className={`relative group aspect-square rounded-lg overflow-hidden border-2 ${i === 0 ? 'border-[#2563EB] ring-2 ring-[#2563EB]/30' : 'border-[#BFDBFE]'}`}>
                              <img src={url} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                              {i === 0 && (
                                <span className="absolute top-1 left-1 bg-[#2563EB] text-white text-[10px] font-sans font-semibold px-1.5 py-0.5 rounded">
                                  CAPA
                                </span>
                              )}
                              {i !== 0 && (
                                <button
                                  type="button"
                                  title="Definir como foto de capa"
                                  onClick={() => {
                                    const imgs = propertyForm.images.split('\n').map(u => u.trim()).filter(Boolean);
                                    const [moved] = imgs.splice(i, 1);
                                    imgs.unshift(moved);
                                    setPropertyForm(f => ({ ...f, images: imgs.join('\n') }));
                                  }}
                                  className="absolute bottom-1 left-1 w-6 h-6 bg-[#2563EB]/80 hover:bg-[#2563EB] text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  ★
                                </button>
                              )}
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
                        className="w-full px-3 py-2.5 border border-[#BFDBFE] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 resize-none font-mono text-[#4B5563]"
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
                      <span className="text-sm text-[#4B5563]">
                        {propertyForm.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 mt-8 pt-4 border-t border-[#BFDBFE]">
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
                      className="px-4 py-2.5 bg-gray-100 text-[#4B5563] rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSaveProperty}
                      disabled={actionLoading === 'property' || !propertyForm.id || !propertyForm.name}
                      className="px-6 py-2.5 bg-[#2563EB] text-white rounded-lg text-sm font-medium hover:bg-[#1D4ED8] transition-colors disabled:opacity-50"
                    >
                      {actionLoading === 'property' ? 'Salvando...' : 'Salvar'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* CADASTROS TAB */}
        {!loading && activeTab === 'cadastros' && (
          <div className="max-w-5xl mx-auto space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              {(['pending', 'approved', 'rejected', 'all'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setSubmissionFilter(f)}
                  className={`px-3 py-1.5 text-sm rounded-lg border transition ${
                    submissionFilter === f
                      ? 'border-[#2563EB] bg-[#EFF6FF] text-[#1E40AF] font-semibold'
                      : 'border-[#D1D5DB] text-[#4B5563]'
                  }`}
                >
                  {f === 'pending' ? 'Pendentes' : f === 'approved' ? 'Aprovados' : f === 'rejected' ? 'Rejeitados' : 'Todos'}
                </button>
              ))}
              <button
                onClick={() => loadSubmissions(submissionFilter)}
                className="ml-auto text-sm text-[#2563EB] font-semibold"
              >
                ↻ Atualizar
              </button>
            </div>

            {submissions.length === 0 && (
              <div className="bg-white rounded-xl border border-[#E5E7EB] p-10 text-center text-[#6B7280]">
                Nenhum cadastro {submissionFilter === 'pending' ? 'pendente' : submissionFilter === 'approved' ? 'aprovado' : submissionFilter === 'rejected' ? 'rejeitado' : ''}.
              </div>
            )}

            {submissions.map(s => {
              const images = typeof s.images === 'string' ? (() => { try { return JSON.parse(s.images); } catch { return []; } })() : (s.images || []);
              const details = typeof s.details === 'string' ? (() => { try { return JSON.parse(s.details); } catch { return {}; } })() : (s.details || {});
              const d = details as Record<string, unknown>;
              const cap = (d.capacity || {}) as Record<string, string>;
              const pricing = (d.pricing || {}) as Record<string, string>;
              const rules = (d.rules || {}) as Record<string, string>;
              const amenities = (d.amenities || []) as string[];
              const busy = actionLoading === `sub-${s.id}`;
              const expanded = expandedSubmission === s.id;
              const statusColor = s.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : s.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200'
                : 'bg-amber-50 text-amber-700 border-amber-200';
              const statusLabel = s.status === 'approved' ? 'Aprovado' : s.status === 'rejected' ? 'Rejeitado' : 'Pendente';
              return (
                <div key={s.id} className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
                  <div className="p-4 sm:p-5">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="text-lg font-bold text-[#111827]">
                            {(d.propertyName as string) || s.name}
                          </h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${statusColor}`}>{statusLabel}</span>
                          {d.propertyType ? <span className="text-xs text-[#6B7280] bg-[#F3F4F6] px-2 py-0.5 rounded">{String(d.propertyType)}</span> : null}
                          <span className="text-xs text-[#6B7280] bg-[#F3F4F6] px-2 py-0.5 rounded">{s.intent}</span>
                        </div>
                        <p className="text-sm text-[#4B5563]">
                          <strong>{s.name}</strong> · {s.phone}{s.email ? ` · ${s.email}` : ''}
                        </p>
                        <p className="text-sm text-[#6B7280] mt-0.5">{s.address}</p>
                        <p className="text-xs text-[#9CA3AF] mt-1">Enviado {relativeTime(s.created_at)}</p>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {s.status !== 'approved' && (
                          <button disabled={busy} onClick={() => updateSubmission(s.id, 'approved')}
                            className="px-3 py-1.5 text-sm rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50">
                            Aprovar
                          </button>
                        )}
                        {s.status !== 'rejected' && (
                          <button disabled={busy} onClick={() => updateSubmission(s.id, 'rejected')}
                            className="px-3 py-1.5 text-sm rounded-lg border border-[#D1D5DB] text-[#4B5563] hover:bg-gray-50 disabled:opacity-50">
                            Rejeitar
                          </button>
                        )}
                        <button disabled={busy} onClick={() => deleteSubmission(s.id)}
                          className="px-3 py-1.5 text-sm rounded-lg bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50">
                          Excluir
                        </button>
                      </div>
                    </div>

                    {images.length > 0 && (
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-4">
                        {(images as string[]).slice(0, expanded ? images.length : 6).map((src, i) => (
                          // eslint-disable-next-line @next/next/no-img-element
                          <a key={i} href={src} target="_blank" rel="noreferrer" className="block aspect-square rounded-lg overflow-hidden border border-[#E5E7EB]">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={src} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform" />
                          </a>
                        ))}
                      </div>
                    )}

                    <button
                      onClick={() => setExpandedSubmission(expanded ? null : s.id)}
                      className="mt-3 text-sm text-[#2563EB] font-semibold"
                    >
                      {expanded ? '− Ocultar detalhes' : '+ Ver detalhes'}
                    </button>

                    {expanded && (
                      <div className="mt-4 pt-4 border-t border-[#E5E7EB] space-y-3 text-sm">
                        {d.mapsLink ? (
                          <div><strong>Google Maps:</strong> <a href={String(d.mapsLink)} target="_blank" rel="noreferrer" className="text-[#2563EB] underline break-all">{String(d.mapsLink)}</a></div>
                        ) : null}
                        {(cap.guests || cap.bedrooms || cap.beds || cap.bathrooms || cap.area) && (
                          <div className="flex flex-wrap gap-4 text-[#4B5563]">
                            {cap.guests && <span>👥 {cap.guests} hóspedes</span>}
                            {cap.bedrooms && <span>🛏️ {cap.bedrooms} quartos</span>}
                            {cap.beds && <span>🛌 {cap.beds} camas</span>}
                            {cap.bathrooms && <span>🚿 {cap.bathrooms} banheiros</span>}
                            {cap.area && <span>📐 {cap.area} m²</span>}
                          </div>
                        )}
                        {amenities.length > 0 && (
                          <div>
                            <strong className="block mb-1">Comodidades:</strong>
                            <div className="flex flex-wrap gap-1.5">
                              {amenities.map(a => <span key={a} className="text-xs bg-[#EFF6FF] text-[#1E40AF] px-2 py-0.5 rounded">{a}</span>)}
                            </div>
                          </div>
                        )}
                        {(pricing.priceLow || pricing.priceHigh || pricing.priceWeekend) && (
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            {pricing.priceLow && <div className="bg-[#F9FAFB] rounded-lg p-2"><div className="text-xs text-[#6B7280]">Baixa temp.</div><div className="font-semibold">{pricing.priceLow}</div></div>}
                            {pricing.priceHigh && <div className="bg-[#F9FAFB] rounded-lg p-2"><div className="text-xs text-[#6B7280]">Alta temp.</div><div className="font-semibold">{pricing.priceHigh}</div></div>}
                            {pricing.priceWeekend && <div className="bg-[#F9FAFB] rounded-lg p-2"><div className="text-xs text-[#6B7280]">Fim de semana</div><div className="font-semibold">{pricing.priceWeekend}</div></div>}
                          </div>
                        )}
                        {(pricing.minNights || pricing.checkin || pricing.checkout) && (
                          <div className="flex flex-wrap gap-4 text-[#4B5563]">
                            {pricing.minNights && <span>Estadia mínima: {pricing.minNights}</span>}
                            {pricing.checkin && <span>Check-in: {pricing.checkin}</span>}
                            {pricing.checkout && <span>Check-out: {pricing.checkout}</span>}
                          </div>
                        )}
                        {(rules.allowEvents || rules.allowChildren || rules.allowSmoking || rules.allowPets) && (
                          <div className="flex flex-wrap gap-4 text-[#4B5563]">
                            {rules.allowEvents && <span>Eventos: {rules.allowEvents}</span>}
                            {rules.allowChildren && <span>Crianças: {rules.allowChildren}</span>}
                            {rules.allowSmoking && <span>Fumar: {rules.allowSmoking}</span>}
                            {rules.allowPets && <span>Pets: {rules.allowPets}</span>}
                          </div>
                        )}
                        {s.description && (
                          <div>
                            <strong className="block mb-1">Descrição:</strong>
                            <p className="whitespace-pre-wrap text-[#4B5563]">{s.description}</p>
                          </div>
                        )}
                        <div className="flex gap-2 pt-2">
                          <a href={`https://wa.me/${s.phone.replace(/\D/g, '')}?text=${encodeURIComponent('Olá ' + s.name + '! Recebemos seu cadastro do imóvel no Hospeda Temporada.')}`}
                            target="_blank" rel="noreferrer"
                            className="px-3 py-1.5 text-sm rounded-lg bg-[#25D366] text-white hover:bg-[#128C7E]">
                            💬 WhatsApp
                          </a>
                          {s.email && (
                            <a href={`mailto:${s.email}`} className="px-3 py-1.5 text-sm rounded-lg border border-[#D1D5DB] text-[#4B5563]">
                              ✉️ Email
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-4 right-4 z-[200] bg-[#111827] text-white text-sm font-medium px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2 animate-[toast-in_0.2s_ease-out]"
          style={{ animation: 'toast-in 0.2s ease-out' }}
        >
          <svg className="w-4 h-4 text-[#22c55e]" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          {toast}
        </div>
      )}
      <style jsx>{`
        @keyframes toast-in {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
