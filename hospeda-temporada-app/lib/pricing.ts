import { PricingRule, PriceBreakdown, MinNightsViolation } from '@/components/types';

function isDateInSeason(
  dateStr: string,
  startMonth: number, startDay: number,
  endMonth: number, endDay: number
): boolean {
  const month = parseInt(dateStr.slice(5, 7));
  const day = parseInt(dateStr.slice(8, 10));

  if (startMonth <= endMonth) {
    // Same year: e.g., Jun 1 → Aug 31
    if (month < startMonth || month > endMonth) return false;
    if (month === startMonth && day < startDay) return false;
    if (month === endMonth && day > endDay) return false;
    return true;
  } else {
    // Cross-year: e.g., Dec 15 → Jan 31
    if (month > startMonth || (month === startMonth && day >= startDay)) return true;
    if (month < endMonth || (month === endMonth && day <= endDay)) return true;
    return false;
  }
}

function isDateInRange(dateStr: string, start: string, end: string): boolean {
  return dateStr >= start && dateStr <= end;
}

function eachNight(dateStart: string, dateEnd: string): string[] {
  const nights: string[] = [];
  const current = new Date(dateStart + 'T12:00:00');
  const last = new Date(dateEnd + 'T12:00:00');
  // Each night = check-in day up to (but not including) check-out day
  while (current < last) {
    nights.push(current.toISOString().slice(0, 10));
    current.setDate(current.getDate() + 1);
  }
  return nights;
}

// Returns the PricingRule applied to a given date and the resolved price/label.
// The returned `rule` is the RULE whose period the date falls under (custom/seasonal/base),
// which may differ from the rule whose `price_per_night` wins (e.g., weekend premium inside a season).
export function getRuleForDate(
  dateStr: string,
  rules: PricingRule[]
): { price: number; label: string; rule: PricingRule } | null {
  const baseRule = rules.find(r => r.rule_type === 'base');
  if (!baseRule?.price_per_night) return null;

  const date = new Date(dateStr + 'T12:00:00');
  const dayOfWeek = date.getDay();

  const customRules = rules
    .filter(r => r.rule_type === 'custom' && r.date_start && r.date_end)
    .sort((a, b) => (b.priority || 0) - (a.priority || 0));
  for (const rule of customRules) {
    if (isDateInRange(dateStr, rule.date_start!, rule.date_end!)) {
      return { price: rule.price_per_night!, label: rule.label || 'Preço especial', rule };
    }
  }

  const seasonalRules = rules
    .filter(r => r.rule_type === 'seasonal' && r.season_start_month != null)
    .sort((a, b) => (b.priority || 0) - (a.priority || 0));
  for (const rule of seasonalRules) {
    if (isDateInSeason(dateStr, rule.season_start_month!, rule.season_start_day || 1, rule.season_end_month!, rule.season_end_day || 31)) {
      const weekendRule = rules.find(r => r.rule_type === 'weekend');
      if (weekendRule?.price_per_night && (weekendRule.weekend_days || [5, 6]).includes(dayOfWeek)) {
        const seasonPrice = rule.price_per_night || baseRule.price_per_night;
        if (weekendRule.price_per_night > seasonPrice) {
          return { price: weekendRule.price_per_night, label: `${rule.label || 'Temporada'} (fim de semana)`, rule };
        }
      }
      return { price: rule.price_per_night || baseRule.price_per_night, label: rule.label || 'Temporada', rule };
    }
  }

  const weekendRule = rules.find(r => r.rule_type === 'weekend');
  if (weekendRule?.price_per_night && (weekendRule.weekend_days || [5, 6]).includes(dayOfWeek)) {
    // Weekend-only stay: attribute to base for fee resolution.
    return { price: weekendRule.price_per_night, label: 'Fim de semana', rule: baseRule };
  }

  return { price: baseRule.price_per_night, label: 'Diária base', rule: baseRule };
}

export function getPriceForDate(dateStr: string, rules: PricingRule[]): { price: number; label: string } | null {
  const r = getRuleForDate(dateStr, rules);
  return r ? { price: r.price, label: r.label } : null;
}

function computeMinNightsViolations(
  rules: PricingRule[],
  nights: string[]
): MinNightsViolation[] {
  const violations: MinNightsViolation[] = [];
  if (nights.length === 0) return violations;

  const baseRule = rules.find(r => r.rule_type === 'base');
  if (baseRule?.min_nights && nights.length < baseRule.min_nights) {
    violations.push({
      scope: 'global',
      required: baseRule.min_nights,
      nights_in_scope: nights.length,
      rule_label: 'Mínimo geral',
    });
  }

  const countIn = (predicate: (d: string) => boolean) =>
    nights.reduce((n, d) => n + (predicate(d) ? 1 : 0), 0);

  for (const rule of rules) {
    if (!rule.active || !rule.min_nights) continue;

    if (rule.rule_type === 'custom' && rule.date_start && rule.date_end) {
      const start = rule.date_start;
      const end = rule.date_end;
      const inside = countIn(d => isDateInRange(d, start, end));
      if (inside > 0 && inside < rule.min_nights) {
        violations.push({
          scope: 'custom',
          required: rule.min_nights,
          nights_in_scope: inside,
          rule_label: rule.label || 'Período especial',
        });
      }
    } else if (rule.rule_type === 'seasonal' && rule.season_start_month != null && rule.season_end_month != null) {
      const sm = rule.season_start_month;
      const sd = rule.season_start_day || 1;
      const em = rule.season_end_month;
      const ed = rule.season_end_day || 31;
      const inside = countIn(d => isDateInSeason(d, sm, sd, em, ed));
      if (inside > 0 && inside < rule.min_nights) {
        violations.push({
          scope: 'seasonal',
          required: rule.min_nights,
          nights_in_scope: inside,
          rule_label: rule.label || 'Temporada',
        });
      }
    } else if (rule.rule_type === 'weekend') {
      const weekendDays = rule.weekend_days || [5, 6];
      const inside = countIn(d => {
        const dow = new Date(d + 'T12:00:00').getDay();
        return weekendDays.includes(dow);
      });
      if (inside > 0 && inside < rule.min_nights) {
        violations.push({
          scope: 'weekend',
          required: rule.min_nights,
          nights_in_scope: inside,
          rule_label: rule.label || 'Fim de semana',
        });
      }
    }
  }

  return violations;
}

export function calculateStayPrice(
  rules: PricingRule[],
  dateStart: string,
  dateEnd: string,
  guests: number
): PriceBreakdown {
  const baseRule = rules.find(r => r.rule_type === 'base');
  if (!baseRule?.price_per_night) {
    return { has_dynamic_pricing: false };
  }

  const nights = eachNight(dateStart, dateEnd);
  if (nights.length === 0) {
    return { has_dynamic_pricing: true, nights: 0, breakdown: [], subtotal: 0, total: 0 };
  }

  const nightlyRules = nights.map(date => ({ date, ...getRuleForDate(date, rules)! }));
  const breakdown = nightlyRules.map(n => ({ date: n.date, label: n.label, price: n.price }));
  const subtotal = breakdown.reduce((sum, b) => sum + b.price, 0);

  // Guest surcharge: per-night threshold and rate come from the applied rule when set,
  // falling back to the global guest_surcharge rule.
  const globalSurcharge = rules.find(r => r.rule_type === 'guest_surcharge');
  const globalThreshold = globalSurcharge?.min_guests ?? 0;
  const globalRate = globalSurcharge?.price_per_extra_guest ?? 0;
  let guestSurcharge: PriceBreakdown['guest_surcharge'] = null;

  let surchargeTotal = 0;
  let maxExtras = 0;
  for (const n of nightlyRules) {
    const threshold = n.rule.min_guests ?? globalThreshold;
    if (!threshold || guests <= threshold) continue;
    const extras = guests - threshold;
    const rate = n.rule.price_per_extra_guest ?? globalRate;
    surchargeTotal += extras * rate;
    if (extras > maxExtras) maxExtras = extras;
  }
  if (surchargeTotal > 0) {
    guestSurcharge = { extra_guests: maxExtras, total: surchargeTotal };
  }

  // Cleaning fee: one-time per stay. Priority: custom > seasonal > base.
  // Pick the highest-priority rule hit by any night that has a non-null cleaning_fee.
  let cleaningFee: PriceBreakdown['cleaning_fee'] = null;
  const hitCustom = nightlyRules
    .filter(n => n.rule.rule_type === 'custom')
    .map(n => n.rule)
    .sort((a, b) => (b.priority || 0) - (a.priority || 0));
  const hitSeasonal = nightlyRules
    .filter(n => n.rule.rule_type === 'seasonal')
    .map(n => n.rule)
    .sort((a, b) => (b.priority || 0) - (a.priority || 0));
  const candidates = [...hitCustom, ...hitSeasonal, baseRule];
  const seen = new Set<number>();
  for (const r of candidates) {
    if (seen.has(r.id)) continue;
    seen.add(r.id);
    if (r.cleaning_fee && r.cleaning_fee > 0) {
      const label = r.rule_type === 'base'
        ? 'Taxa de limpeza'
        : `Taxa de limpeza · ${r.label || (r.rule_type === 'custom' ? 'Período especial' : 'Temporada')}`;
      cleaningFee = { amount: r.cleaning_fee, label };
      break;
    }
  }

  const total = subtotal + (guestSurcharge?.total || 0) + (cleaningFee?.amount || 0);
  const min_nights_violations = computeMinNightsViolations(rules, nights);

  return {
    has_dynamic_pricing: true,
    nights: nights.length,
    breakdown,
    subtotal,
    guest_surcharge: guestSurcharge,
    cleaning_fee: cleaningFee,
    total,
    min_nights_violations,
  };
}
