export interface Sponsor {
  sponsor_id: number;
  user_id: number;
  company_name: string;
  industry: string;
  website_url: string | null;
  logo_url: string | null;
  budget_range: string | null;
  preferred_events: string | null;
  description: string | null;
  status: "active" | "inactive" | string;
}