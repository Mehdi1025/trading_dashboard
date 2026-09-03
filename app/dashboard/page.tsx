import { redirect } from "next/navigation";
import { DashboardClient } from "@/components/dashboard-client";
import { createClient } from "@/utils/supabase/server";
import type { PortfolioItem } from "@/types/portfolio";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: assets, error } = await supabase.rpc("get_my_portfolio_items");

  if (error) {
    throw new Error(error.message);
  }

  return <DashboardClient initialAssets={(assets ?? []) as PortfolioItem[]} />;
}
