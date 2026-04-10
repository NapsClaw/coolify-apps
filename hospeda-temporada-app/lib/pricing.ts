import { PricingRule, PriceBreakdown } from '@/components/types';

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

export function getPriceForDate(dateStr: string, rules: PricingRule[]): { price: number; label: string } | null {
  const baseRule = rules.find(r => r.rule_type === 'base');
  if (!baseRule?.price_per_night) return null;

  const date = new Date(dateStr + 'T12:00:00');
  const dayOfWeek = date.getDay(); // 0=Sun, 6=Sat

  // 1. Custom override (highest priority)
  const customRules = rules
    .filter(r => r.rule_type === 'custom' && r.date_start && r.date_end)
    .sort((a, b) => (b.priority || 0) - (a.priority || 0));

  for (const rule of customRules) {
    if (isDateInRange(dateStr, rule.date_start!, rule.date_end!)) {
      return { price: rule.price_per_night!, label: rule.label || 'Preço especial' };
    }
  }

  // 2. Seasonal
  const seasonalRules = rules
    .filter(r => r.rule_type === 'seasonal' && r.season_start_month != null)
    .sort((a, b) => (b.priority || 0) - (a.priority || 0));

  for (const rule of seasonalRules) {
    if (isDateInSeason(dateStr, rule.season_start_month!, rule.season_start_day || 1, rule.season_end_month!, rule.season_end_day || 31)) {
      // Check if weekend within season
      const weekendRule = rules.find(r => r.rule_type === 'weekend');
      if (weekendRule?.price_per_night && (weekendRule.weekend_days || [5, 6]).includes(dayOfWeek)) {
        // Use the higher of seasonal or weekend price
        const seasonPrice = rule.price_per_night || baseRule.price_per_night;
        const weekendPrice = weekendRule.price_per_night;
        if (weekendPrice > seasonPrice) {
          return { price: weekendPrice, label: `${rule.label || 'Temporada'} (fim de semana)` };
        }
      }
      return { price: rule.price_per_night || baseRule.price_per_night, label: rule.label || 'Temporada' };
    }
  }

  // 3. Weekend
  const weekendRule = rules.find(r => r.rule_type === 'weekend');
  if (weekendRule?.price_per_night && (weekendRule.weekend_days || [5, 6]).includes(dayOfWeek)) {
    return { price: weekendRule.price_per_night, label: 'Fim de semana' };
  }

  // 4. Base
  return { price: baseRule.price_per_night, label: 'Diária base' };
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

  const breakdown = nights.map(date => {
    const result = getPriceForDate(date, rules)!;
    return { date, label: result.label, price: result.price };
  });

  const subtotal = breakdown.reduce((sum, b) => sum + b.price, 0);

  // Guest surcharge
  const surchargeRule = rules.find(r => r.rule_type === 'guest_surcharge');
  let guestSurcharge: PriceBreakdown['guest_surcharge'] = null;

  if (surchargeRule?.min_guests && surchargeRule.price_per_extra_guest && guests > surchargeRule.min_guests) {
    const extraGuests = guests - surchargeRule.min_guests;
    const surchargeTotal = extraGuests * surchargeRule.price_per_extra_guest * nights.length;
    guestSurcharge = {
      extra_guests: extraGuests,
      per_night: surchargeRule.price_per_extra_guest,
      total: surchargeTotal,
    };
  }

  const total = subtotal + (guestSurcharge?.total || 0);

  return {
    has_dynamic_pricing: true,
    nights: nights.length,
    breakdown,
    subtotal,
    guest_surcharge: guestSurcharge,
    total,
  };
}
// rebuild 1775857559
