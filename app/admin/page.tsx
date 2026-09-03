import Link from "next/link";
import { redirect } from "next/navigation";
import { TrendingUp } from "lucide-react";
import { AdminDashboard } from "@/components/AdminDashboard";
import { SignOutButton } from "@/components/SignOutButton";
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

  return (
    <div className="relative flex min-h-full flex-1 flex-col">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-violet-500/10 blur-3xl" />
        <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
      </div>

      <header className="relative z-10 border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-emerald-400" />
            <span className="text-lg font-semibold">Trdng</span>
            <span className="rounded-full bg-violet-500/20 px-2 py-0.5 text-xs font-medium text-violet-300">
              Admin
            </span>
          </Link>
          <SignOutButton />
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-7xl flex-1 px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Tableau de bord administrateur</h1>
          <p className="mt-2 text-slate-400">
            Vue consolidée des portefeuilles investisseurs en temps réel
          </p>
        </div>

        <AdminDashboard clients={normalizedClients} />
      </main>
    </div>
  );
}
