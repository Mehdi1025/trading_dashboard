"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Activity,
  BarChart3,
  LayoutDashboard,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Radio,
  Shield,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { cn } from "@/lib/utils";

export type AdminSection = "overview" | "clients" | "portfolios" | "market" | "activity";

type NavItem = {
  id: AdminSection;
  label: string;
  description: string;
  icon: React.ReactNode;
  badge?: string;
  accent: string;
};

const NAV_ITEMS: NavItem[] = [
  {
    id: "overview",
    label: "Vue d'ensemble",
    description: "KPIs & performance",
    icon: <LayoutDashboard className="h-[18px] w-[18px]" strokeWidth={1.75} />,
    accent: "from-violet-500/20 to-indigo-500/5",
  },
  {
    id: "clients",
    label: "Clients",
    description: "Investisseurs suivis",
    icon: <Users className="h-[18px] w-[18px]" strokeWidth={1.75} />,
    accent: "from-indigo-500/20 to-blue-500/5",
  },
  {
    id: "portfolios",
    label: "Portefeuilles",
    description: "Consolidation actifs",
    icon: <Wallet className="h-[18px] w-[18px]" strokeWidth={1.75} />,
    accent: "from-emerald-500/20 to-teal-500/5",
  },
  {
    id: "market",
    label: "Marché live",
    description: "Cours en direct",
    icon: <Radio className="h-[18px] w-[18px]" strokeWidth={1.75} />,
    badge: "Live",
    accent: "from-amber-500/20 to-orange-500/5",
  },
  {
    id: "activity",
    label: "Activité",
    description: "Journal & événements",
    icon: <Activity className="h-[18px] w-[18px]" strokeWidth={1.75} />,
    accent: "from-sky-500/20 to-cyan-500/5",
  },
];

const SECTION_TITLES: Record<AdminSection, { title: string; subtitle: string }> = {
  overview: {
    title: "Centre de contrôle",
    subtitle: "Vue consolidée de tous les portefeuilles investisseurs",
  },
  clients: {
    title: "Gestion clients",
    subtitle: "Performance, capital et détail par investisseur",
  },
  portfolios: {
    title: "Portefeuilles consolidés",
    subtitle: "Exposition agrégée par actif sur l'ensemble des clients",
  },
  market: {
    title: "Marché live",
    subtitle: "Flux Binance — cours en temps réel",
  },
  activity: {
    title: "Activité récente",
    subtitle: "Inscriptions et mouvements de portefeuille",
  },
};

type AdminSidebarProps = {
  activeSection: AdminSection;
  onSectionChange: (section: AdminSection) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
};

function SidebarSignOut({ collapsed }: { collapsed: boolean }) {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      title={collapsed ? "Déconnexion" : undefined}
      className={cn(
        "group flex w-full items-center gap-2.5 rounded-xl border border-border/50 bg-background/40 px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400",
        collapsed && "justify-center px-2",
      )}
    >
      <LogOut className="h-4 w-4 shrink-0" />
      {!collapsed && <span>Déconnexion</span>}
    </button>
  );
}

export function AdminSidebar({
  activeSection,
  onSectionChange,
  collapsed,
  onToggleCollapse,
  mobileOpen = false,
  onMobileClose,
}: AdminSidebarProps) {
  const handleNavClick = (section: AdminSection) => {
    onSectionChange(section);
    onMobileClose?.();
  };

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Fermer le menu"
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex h-dvh w-[min(288px,88vw)] shrink-0 flex-col overflow-hidden border-r border-white/[0.06] transition-transform duration-300 ease-out lg:static lg:z-20 lg:h-full lg:translate-x-0 lg:transition-[width]",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          collapsed ? "lg:w-[76px]" : "lg:w-[288px]",
        )}
      >
        <div className="pointer-events-none absolute inset-0 bg-[#0a0a0f]/80 backdrop-blur-2xl" />
        <div className="pointer-events-none absolute -left-20 top-0 h-64 w-64 rounded-full bg-violet-500/[0.08] blur-3xl" />
        <div className="pointer-events-none absolute -left-10 bottom-32 h-48 w-48 rounded-full bg-indigo-500/[0.06] blur-3xl" />

        <div className="relative flex h-[72px] items-center border-b border-white/[0.06] px-4">
          <Link
            href="/admin"
            className={cn(
              "flex min-w-0 flex-1 items-center gap-3",
              collapsed && "justify-center",
            )}
          >
            <div className="relative shrink-0">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-400 to-indigo-500 opacity-40 blur-md" />
              <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 via-indigo-500 to-indigo-700 shadow-lg shadow-violet-500/30">
                <Shield className="h-[18px] w-[18px] text-white" strokeWidth={2.5} />
              </div>
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="truncate text-[15px] font-semibold tracking-tight">Trdng Admin</p>
                <p className="truncate text-[11px] text-muted-foreground">Console de gestion</p>
              </div>
            )}
          </Link>
        </div>

        <nav className="relative flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {!collapsed && (
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/70">
              Navigation
            </p>
          )}
          {NAV_ITEMS.map((item) => {
            const active = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                title={collapsed ? item.label : undefined}
                className={cn(
                  "group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all",
                  active
                    ? "bg-white/[0.06] text-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-white/[0.03] hover:text-foreground",
                  collapsed && "justify-center px-2",
                )}
              >
                {active && (
                  <motion.div
                    layoutId="admin-nav-active"
                    className={cn(
                      "absolute inset-0 rounded-xl bg-gradient-to-br opacity-100",
                      item.accent,
                    )}
                    transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                  />
                )}
                <span className="relative shrink-0">{item.icon}</span>
                {!collapsed && (
                  <span className="relative min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="block truncate text-sm font-medium">{item.label}</span>
                      {item.badge && (
                        <span className="rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-emerald-400">
                          {item.badge}
                        </span>
                      )}
                    </span>
                    <span className="block truncate text-[11px] text-muted-foreground">
                      {item.description}
                    </span>
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="relative space-y-2 border-t border-white/[0.06] p-3">
          <button
            type="button"
            onClick={onToggleCollapse}
            className={cn(
              "hidden w-full items-center gap-2 rounded-xl border border-border/50 px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted/50 lg:flex",
              collapsed && "justify-center px-2",
            )}
          >
            {collapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <>
                <PanelLeftClose className="h-4 w-4" />
                <span>Réduire</span>
              </>
            )}
          </button>
          <SidebarSignOut collapsed={collapsed} />
        </div>
      </aside>
    </>
  );
}

export function getAdminSectionMeta(section: AdminSection) {
  return SECTION_TITLES[section];
}

export function AdminNavIcon({ section }: { section: AdminSection }) {
  const item = NAV_ITEMS.find((i) => i.id === section);
  return item?.icon ?? <BarChart3 className="h-5 w-5" />;
}
