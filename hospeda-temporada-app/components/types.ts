export interface Property {
  id: string;
  name: string;
  location: string;
  type: string;
  badge: string;
  price: string;
  price_unit: string;
  guests: string;
  features: string[];
  description: string;
  images: string[];
  sort_order: number;
  active: boolean;
  base_price?: number | null;
  checkin_time?: string | null;
  checkout_time?: string | null;
}

export interface BlockedDateRange {
  id: number;
  property_id: string;
  date_start: string;
  date_end: string;
  status: string;
  type: string;
}

export interface PricingRule {
  id: number;
  property_id: string;
  rule_type: 'base' | 'weekend' | 'seasonal' | 'custom' | 'guest_surcharge';
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
  label: string | null;
  priority: number;
  active: boolean;
}

export interface MinNightsViolation {
  scope: 'global' | 'custom' | 'seasonal' | 'weekend';
  required: number;
  nights_in_scope: number;
  rule_label: string;
}

export interface PriceBreakdown {
  has_dynamic_pricing: boolean;
  nights?: number;
  breakdown?: { date: string; label: string; price: number }[];
  subtotal?: number;
  guest_surcharge?: { extra_guests: number; per_night: number; total: number } | null;
  total?: number;
  min_nights_violations?: MinNightsViolation[];
}
