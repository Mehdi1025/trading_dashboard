import type { PortfolioItem } from "@/types/portfolio";

export type ClientProfile = {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at?: string;
  portfolio_items: PortfolioItem[];
};
