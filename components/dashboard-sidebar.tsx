"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  BarChart3,
  LayoutDashboard,
  LogOut,
  Newspaper,
  PanelLeftClose,
  PanelLeftOpen,
  Receipt,
  Sparkles,
  TrendingUp,
  Wallet,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { cn } from "@/lib/utils";

export type DashboardSection = "overview" | "portfolio" | "news" | "fiscal" | "live-studio";

type NavItem = {
  id: DashboardSection;
  label: string;
  description: string;
  icon: React.ReactNode;
  badge?: string;
  accent: string;
  glow: string;
};

const NAV_ITEMS: NavItem[] = [
  {
    id: "overview",
    label: "Tableau de bord",
    description: "Vue globale",
    icon: <LayoutDashboard className="h-[18px] w-[18px]" strokeWidth={1.75} />,
    accent: "from-emerald-500/20 to-teal-500/5",
    glow: "shadow-emerald-500/25",
  },
  {
    id: "portfolio",
    label: "Portefeuille",
    description: "Gérer vos actifs",
    icon: <Wallet className="h-[18px] w-[18px]" strokeWidth={1.75} />,
    accent: "from-indigo-500/20 to-blue-500/5",
    glow: "shadow-indigo-500/25",
  },
  {
    id: "news",
    label: "Actualités",
    description: "News crypto",
    icon: <Newspaper className="h-[18px] w-[18px]" strokeWidth={1.75} />,
    accent: "from-sky-500/20 to-blue-500/5",
    glow: "shadow-sky-500/25",
  },
  {
    id: "fiscal",
    label: "Fiscalité",
    description: "Timeline & dividendes",
    icon: <Receipt className="h-[18px] w-[18px]" strokeWidth={1.75} />,
    badge: "2024",
    accent: "from-orange-500/20 to-amber-500/5",
    glow: "shadow-orange-500/25",
  },
  {
    id: "live-studio",
    label: "Aperçu Live",
    description: "Graphiques live",
    icon: <Sparkles className="h-[18px] w-[18px]" strokeWidth={1.75} />,
    badge: "Live",
    accent: "from-violet-500/20 to-fuchsia-500/5",
    glow: "shadow-violet-500/30",
  },
];

type DashboardSidebarProps = {
  activeSection: DashboardSection;
  onSectionChange: (section: DashboardSection) => void;
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
      <LogOut className="h-4 w-4 shrink-0 transition-transform group-hover:-translate-x-0.5" />
      {!collapsed && <span>Déconnexion</span>}
    </button>
  );
}

export function DashboardSidebar({
  activeSection,
  onSectionChange,
  collapsed,
  onToggleCollapse,
  mobileOpen = false,
  onMobileClose,
}: DashboardSidebarProps) {
  const handleNavClick = (section: DashboardSection) => {
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
      {/* Background layers */}
      <div className="pointer-events-none absolute inset-0 bg-[#0a0a0f]/80 backdrop-blur-2xl" />
      <div className="pointer-events-none absolute -left-20 top-0 h-64 w-64 rounded-full bg-emerald-500/[0.07] blur-3xl" />
      <div className="pointer-events-none absolute -left-10 bottom-32 h-48 w-48 rounded-full bg-violet-500/[0.06] blur-3xl" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* Header / Brand */}
      <div className="relative flex h-[72px] items-center border-b border-white/[0.06] px-4">
        <Link
          href="/"
          className={cn(
            "flex min-w-0 flex-1 items-center gap-3 transition-opacity hover:opacity-90",
            collapsed && "justify-center",
          )}
        >
          <div className="relative shrink-0">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-400 to-indigo-500 opacity-40 blur-md" />
            <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 via-emerald-500 to-indigo-600 shadow-lg shadow-emerald-500/30">
              <TrendingUp className="h-[18px] w-[18px] text-white" strokeWidth={2.5} />
            </div>
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate bg-gradient-to-r from-white to-white/70 bg-clip-text text-[15px] font-semibold tracking-tight text-transparent">
                Trdng
              </p>
              <p className="truncate text-[11px] font-medium tracking-wide text-white/35">
                Portfolio Crypto
              </p>
            </div>
          )}
        </Link>

        {!collapsed && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="ml-1 shrink-0 rounded-xl p-2 text-white/30 transition-all hover:bg-white/[0.06] hover:text-white/70"
            aria-label="Réduire la sidebar"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        )}
      </div>

      {collapsed && (
        <button
          type="button"
          onClick={onToggleCollapse}
          className="relative mx-auto mt-3 rounded-xl p-2.5 text-white/30 transition-all hover:bg-white/[0.06] hover:text-white/70"
          aria-label="Agrandir la sidebar"
        >
          <PanelLeftOpen className="h-4 w-4" />
        </button>
      )}

      {/* Live pulse strip */}
      {!collapsed && (
        <div className="relative mx-3 mt-4 flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] px-3 py-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          <span className="text-[11px] font-medium tracking-wide text-emerald-400/90">
            Marchés live
          </span>
          <Zap className="ml-auto h-3 w-3 text-emerald-400/60" />
        </div>
      )}

      {/* Navigation */}
      <nav className="relative flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {!collapsed && (
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/25">
            Menu
          </p>
        )}

        {NAV_ITEMS.map((item) => {
          const isActive = activeSection === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNavClick(item.id)}
              title={collapsed ? item.label : undefined}
              className={cn(
                "group relative flex w-full items-center gap-3 rounded-2xl px-2.5 py-2.5 text-left outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-emerald-500/40",
                collapsed ? "justify-center px-2" : "px-3",
                !isActive && "hover:bg-white/[0.04]",
              )}
            >
              {isActive && (
                <motion.span
                  layoutId="sidebar-active"
                  className={cn(
                    "absolute inset-0 rounded-2xl bg-gradient-to-r shadow-lg ring-1 ring-white/[0.08]",
                    item.accent,
                    item.glow,
                  )}
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}

              <span
                className={cn(
                  "relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all duration-200",
                  isActive
                    ? "bg-white/10 text-white shadow-inner"
                    : "bg-white/[0.04] text-white/40 group-hover:bg-white/[0.07] group-hover:text-white/70",
                )}
              >
                {item.icon}
              </span>

              {!collapsed && (
                <span className="relative min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span
                      className={cn(
                        "block truncate text-[13px] font-medium tracking-tight transition-colors",
                        isActive ? "text-white" : "text-white/55 group-hover:text-white/85",
                      )}
                    >
                      {item.label}
                    </span>
                    {item.badge && (
                      <span className="shrink-0 rounded-md bg-gradient-to-r from-violet-500 to-fuchsia-500 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white shadow-sm shadow-violet-500/40">
                        {item.badge}
                      </span>
                    )}
                  </span>
                  <span
                    className={cn(
                      "block truncate text-[11px] transition-colors",
                      isActive ? "text-white/45" : "text-white/25 group-hover:text-white/40",
                    )}
                  >
                    {item.description}
                  </span>
                </span>
              )}

              {isActive && !collapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="relative h-1.5 w-1.5 shrink-0 rounded-full bg-white/80 shadow-[0_0_8px_rgba(255,255,255,0.6)]"
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="relative border-t border-white/[0.06] p-3">
        {!collapsed && (
          <div className="mb-3 overflow-hidden rounded-2xl border border-white/[0.07] bg-gradient-to-br from-white/[0.05] to-transparent p-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute -inset-0.5 rounded-full bg-gradient-to-br from-emerald-400 to-violet-500 opacity-60 blur-sm" />
                <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[#12121a] ring-1 ring-white/10">
                  <BarChart3 className="h-4 w-4 text-emerald-400" />
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium text-white/90">Investisseur</p>
                <p className="truncate text-[11px] text-white/35">Compte actif · Pro</p>
              </div>
            </div>
          </div>
        )}

        {collapsed && (
          <div className="mb-3 flex justify-center">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500/20 to-violet-500/20 ring-1 ring-white/10">
              <BarChart3 className="h-4 w-4 text-emerald-400" />
            </div>
          </div>
        )}

        <SidebarSignOut collapsed={collapsed} />
      </div>
    </aside>
    </>
  );
}
