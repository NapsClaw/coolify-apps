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
}

export interface BlockedDateRange {
  id: number;
  property_id: string;
  date_start: string;
  date_end: string;
  status: string;
  type: string;
}
