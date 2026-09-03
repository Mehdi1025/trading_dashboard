import { redirect } from "next/navigation";
import { AdminDashboard } from "@/components/AdminDashboard";
import { createClient } from "@/utils/supabase/server";
import type { ClientProfile } from "@/types/admin";
import type { PortfolioItem } from "@/types/portfolio";

export default async function AdminPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: role } = await supabase.rpc("get_my_role");

  if (role !== "admin") {
    redirect("/dashboard");
  }

  const { data: clients, error } = await supabase.rpc("get_investor_clients");

  if (error) {
    throw new Error(error.message);
  }

  const normalizedClients: ClientProfile[] = ((clients ?? []) as ClientProfile[]).map(
    (client) => ({
      id: client.id,
      name: client.name,
      email: client.email,
      role: client.role,
      created_at: client.created_at,
      portfolio_items: (client.portfolio_items ?? []) as PortfolioItem[],
    }),
  );

  return <AdminDashboard clients={normalizedClients} />;
}
