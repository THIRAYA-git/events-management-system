interface AccountFields {
  full_name: string;
  email: string;
  phone?: string;
  password: string;
}

export interface CreateOrganizerPayload extends AccountFields {
  business_name: string;
  specialty: string;
  experience_years: number;
  price_range?: string;
  service_areas?: string;
  portfolio_url?: string;
  bio?: string;
}

export interface CreateSponsorPayload extends AccountFields {
  company_name: string;
  industry?: string;
  budget_range?: string;
  preferred_events?: string;
  website_url?: string;
  description?: string;
}