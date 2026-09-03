"use client";

import { Fragment, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  ChevronDown,
  ChevronRight,
  Menu,
  Search,
  TrendingDown,
  TrendingUp,
  UserPlus,
  Wallet,
} from "lucide-react";
import {
  AdminNavIcon,
  AdminSidebar,
  getAdminSectionMeta,
  type AdminSection,
} from "@/components/admin-sidebar";
import { BorderBeam } from "@/components/ui/border-beam";
import { useCryptoPrices } from "@/hooks/use-crypto-prices";
import {
  buildActivityFeed,
  computeAggregatedHoldings,
  computeAllClientMetrics,
  computeGlobalStats,
  formatCurrency,
  formatPercent,
  getAssetMetrics,
} from "@/lib/admin-metrics";
import { resolvePrice } from "@/lib/portfolio-metrics";
import { cn } from "@/lib/utils";
import type { ClientProfile } from "@/types/admin";

type AdminDashboardProps = {
  clients: ClientProfile[];
};

const ALLOCATION_COLORS = [
  "bg-violet-500",
  "bg-indigo-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-cyan-500",
];

const MARKET_COINS = [
  { name: "Bitcoin", symbol: "BTC", color: "#f7931a" },
  { name: "Ethereum", symbol: "ETH", color: "#627eea" },
  { name: "Solana", symbol: "SOL", color: "#14f195" },
  { name: "Ripple", symbol: "XRP", color: "#0085c3" },
  { name: "Dogecoin", symbol: "DOGE", color: "#c2a633" },
  { name: "Cardano", symbol: "ADA", color: "#0033ad" },
  { name: "Avalanche", symbol: "AVAX", color: "#e84142" },
  { name: "Chainlink", symbol: "LINK", color: "#2a5ada" },
];

const quantityFormatter = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 8 });

function KpiCard({
  label,
  value,
  sub,
  icon,
  trend,
  className,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border/60 bg-card/50 p-5 backdrop-blur-sm transition-colors hover:border-violet-500/20",
        className,
      )}
    >
      <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-violet-500/5 blur-2xl transition-all group-hover:bg-violet-500/10" />
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p
            className={cn(
              "mt-2 text-xl font-bold tracking-tight sm:text-2xl",
              trend === "up" && "text-emerald-400",
              trend === "down" && "text-red-400",
            )}
          >
            {value}
          </p>
          {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
        </div>
        <div className="rounded-xl bg-muted/50 p-2.5 text-muted-foreground">{icon}</div>
      </div>
    </div>
  );
}

function StatusPill({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-border/60 bg-muted/20 px-3 py-1.5 text-xs">
      <span
        className={cn(
          "h-2 w-2 rounded-full",
          ok ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" : "bg-red-400",
        )}
      />
      {label}
    </div>
  );
}

export function AdminDashboard({ clients }: AdminDashboardProps) {
  const { prices, connected } = useCryptoPrices();
  const [activeSection, setActiveSection] = useState<AdminSection>("overview");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [expandedClientId, setExpandedClientId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const clientRows = useMemo(
    () => computeAllClientMetrics(clients, prices),
    [clients, prices],
  );

  const stats = useMemo(() => computeGlobalStats(clientRows), [clientRows]);
  const holdings = useMemo(
    () => computeAggregatedHoldings(clients, prices),
    [clients, prices],
  );
  const activity = useMemo(() => buildActivityFeed(clients), [clients]);

  const leaderboard = useMemo(
    () =>
      [...clientRows]
        .filter((row) => row.pnlPercent !== null)
        .sort((a, b) => (b.pnlPercent ?? 0) - (a.pnlPercent ?? 0))
        .slice(0, 5),
    [clientRows],
  );

  const filteredClients = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return clientRows;
    return clientRows.filter(
      ({ client }) =>
        client.name.toLowerCase().includes(q) || client.email.toLowerCase().includes(q),
    );
  }, [clientRows, searchQuery]);

  const allocationTotal = holdings.reduce((sum, h) => sum + h.totalValue, 0);
  const sectionMeta = getAdminSectionMeta(activeSection);

  function toggleClient(clientId: string) {
    setExpandedClientId((current) => (current === clientId ? null : clientId));
  }

  const overviewSection = (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/10 via-card/40 to-indigo-500/5 p-6 md:p-8">
        <BorderBeam size={200} duration={12} colorFrom="#8b5cf6" colorTo="#34d399" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium text-violet-300/80">Assets Under Management</p>
            <p className="mt-2 text-4xl font-bold tracking-tight md:text-5xl">
              {stats.totalAum > 0 ? formatCurrency(stats.totalAum) : "—"}
            </p>
            <p
              className={cn(
                "mt-2 flex items-center gap-1.5 text-sm font-medium",
                stats.globalPnl >= 0 ? "text-emerald-400" : "text-red-400",
              )}
            >
              {stats.totalAum > 0 ? (
                <>
                  {stats.globalPnl >= 0 ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  {formatCurrency(stats.globalPnl)} ({formatPercent(stats.globalPnlPercent)})
                </>
              ) : (
                "En attente des cours live"
              )}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <StatusPill ok={connected} label="Flux Binance" />
            <StatusPill ok={clients.length > 0} label={`${stats.clientCount} clients`} />
            <StatusPill ok={stats.totalPositions > 0} label={`${stats.totalPositions} positions`} />
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Capital investi"
          value={formatCurrency(stats.totalInitialCapital)}
          sub="Coût d'acquisition total"
          icon={<Wallet className="h-5 w-5" />}
        />
        <KpiCard
          label="PnL global"
          value={stats.totalAum > 0 ? formatCurrency(stats.globalPnl) : "—"}
          sub={stats.totalAum > 0 ? formatPercent(stats.globalPnlPercent) : "—"}
          icon={<TrendingUp className="h-5 w-5" />}
          trend={stats.globalPnl >= 0 ? "up" : "down"}
        />
        <KpiCard
          label="Clients actifs"
          value={String(stats.activeClients)}
          sub={`${stats.clientCount} inscrit${stats.clientCount !== 1 ? "s" : ""} au total`}
          icon={<UserPlus className="h-5 w-5" />}
        />
        <KpiCard
          label="Actifs suivis"
          value={String(holdings.length)}
          sub="Symboles uniques en portefeuille"
          icon={<ArrowUpRight className="h-5 w-5" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border/60 bg-card/40 p-6">
          <h3 className="text-sm font-semibold">Top performance clients</h3>
          <p className="mt-1 text-xs text-muted-foreground">Classement par P&amp;L %</p>
          <div className="mt-5 space-y-3">
            {leaderboard.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucune donnée disponible.</p>
            ) : (
              leaderboard.map(({ client, pnlDollar, pnlPercent }, index) => (
                <div
                  key={client.id}
                  className="flex items-center justify-between rounded-xl border border-border/40 bg-muted/20 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/15 text-xs font-bold text-violet-300">
                      {index + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium">{client.name}</p>
                      <p className="text-xs text-muted-foreground">{client.email}</p>
                    </div>
                  </div>
                  {pnlDollar !== null && pnlPercent !== null && (
                    <div className={pnlDollar >= 0 ? "text-emerald-400" : "text-red-400"}>
                      <p className="text-sm font-semibold">{formatCurrency(pnlDollar)}</p>
                      <p className="text-xs">{formatPercent(pnlPercent)}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card/40 p-6">
          <h3 className="text-sm font-semibold">Répartition AUM</h3>
          <p className="mt-1 text-xs text-muted-foreground">Par actif — tous clients confondus</p>
          <div className="mt-5 space-y-4">
            {holdings.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucun actif en portefeuille.</p>
            ) : (
              holdings.slice(0, 6).map((holding, index) => {
                const pct =
                  allocationTotal > 0 ? (holding.totalValue / allocationTotal) * 100 : 0;
                return (
                  <div key={holding.symbol}>
                    <div className="mb-1.5 flex justify-between text-sm">
                      <span className="font-medium">{holding.symbol}</span>
                      <span className="text-muted-foreground">
                        {pct.toFixed(1)}% · {holding.clientCount} client
                        {holding.clientCount !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn("h-full rounded-full", ALLOCATION_COLORS[index % ALLOCATION_COLORS.length])}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const clientsSection = (
    <div className="space-y-4">
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Rechercher un client..."
          className="w-full rounded-xl border border-border/60 bg-card/50 py-2.5 pl-10 pr-4 text-sm outline-none transition-colors focus:border-violet-500/40 focus:ring-1 focus:ring-violet-500/30"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-border/60 bg-card/40">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border/60">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-6 py-4 font-medium" />
                <th className="px-6 py-4 font-medium">Client</th>
                <th className="px-6 py-4 font-medium">Email</th>
                <th className="px-6 py-4 font-medium">Positions</th>
                <th className="px-6 py-4 font-medium">Capital</th>
                <th className="px-6 py-4 font-medium">Valorisation</th>
                <th className="px-6 py-4 font-medium">PnL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                    Aucun client trouvé.
                  </td>
                </tr>
              ) : (
                filteredClients.map(
                  ({
                    client,
                    initialCapital,
                    currentValue,
                    hasLiveData,
                    pnlDollar,
                    pnlPercent,
                    positionCount,
                  }) => {
                    const isExpanded = expandedClientId === client.id;
                    return (
                      <Fragment key={client.id}>
                        <tr
                          onClick={() => toggleClient(client.id)}
                          className="cursor-pointer text-sm transition-colors hover:bg-muted/30"
                        >
                          <td className="px-6 py-4 text-muted-foreground">
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </td>
                          <td className="px-6 py-4 font-semibold">{client.name}</td>
                          <td className="px-6 py-4 text-muted-foreground">{client.email}</td>
                          <td className="px-6 py-4">{positionCount}</td>
                          <td className="px-6 py-4">{formatCurrency(initialCapital)}</td>
                          <td className="px-6 py-4">
                            {hasLiveData ? formatCurrency(currentValue) : "—"}
                          </td>
                          <td className="px-6 py-4">
                            {pnlDollar !== null && pnlPercent !== null ? (
                              <div className={pnlDollar >= 0 ? "text-emerald-400" : "text-red-400"}>
                                <p className="font-medium">{formatCurrency(pnlDollar)}</p>
                                <p className="text-xs">{formatPercent(pnlPercent)}</p>
                              </div>
                            ) : (
                              "—"
                            )}
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr className="bg-muted/10">
                            <td colSpan={7} className="px-6 py-4">
                              <PortfolioDetail client={client} prices={prices} />
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  },
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const portfoliosSection = (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-card/40">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border/60">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-6 py-4 font-medium">Actif</th>
              <th className="px-6 py-4 font-medium">Quantité totale</th>
              <th className="px-6 py-4 font-medium">Prix live</th>
              <th className="px-6 py-4 font-medium">Valeur AUM</th>
              <th className="px-6 py-4 font-medium">Part AUM</th>
              <th className="px-6 py-4 font-medium">Clients</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {holdings.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                  Aucun actif consolidé.
                </td>
              </tr>
            ) : (
              holdings.map((holding) => {
                const pct =
                  allocationTotal > 0 ? (holding.totalValue / allocationTotal) * 100 : 0;
                return (
                  <tr key={holding.symbol} className="text-sm">
                    <td className="px-6 py-4 font-semibold">{holding.symbol}</td>
                    <td className="px-6 py-4">{quantityFormatter.format(holding.totalQuantity)}</td>
                    <td className="px-6 py-4">
                      {holding.livePrice !== undefined
                        ? formatCurrency(holding.livePrice)
                        : "—"}
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {holding.totalValue > 0 ? formatCurrency(holding.totalValue) : "—"}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{pct.toFixed(1)}%</td>
                    <td className="px-6 py-4">{holding.clientCount}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const marketSection = (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {MARKET_COINS.map((coin) => {
        const price = resolvePrice(prices, coin.symbol);
        return (
          <motion.div
            key={coin.symbol}
            whileHover={{ y: -2 }}
            className="flex items-center justify-between rounded-2xl border border-border/60 bg-card/40 px-4 py-4 transition-colors hover:border-violet-500/20"
          >
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl text-xs font-bold text-white"
                style={{ backgroundColor: coin.color }}
              >
                {coin.symbol.slice(0, 3)}
              </div>
              <div>
                <p className="font-medium">{coin.name}</p>
                <p className="text-xs text-muted-foreground">{coin.symbol}/USDT</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold tabular-nums">
                {price !== undefined ? formatCurrency(price) : "—"}
              </p>
              <p className={cn("text-[10px]", connected ? "text-emerald-400" : "text-muted-foreground")}>
                {connected ? "Live" : "Hors ligne"}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );

  const activitySection = (
    <div className="rounded-2xl border border-border/60 bg-card/40 p-6">
      <div className="space-y-4">
        {activity.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucune activité récente.</p>
        ) : (
          activity.map((event, index) => (
            <div
              key={event.id}
              className="flex gap-4 border-b border-border/40 pb-4 last:border-0 last:pb-0"
            >
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full",
                    event.type === "signup" ? "bg-violet-500/15 text-violet-300" : "bg-emerald-500/15 text-emerald-300",
                  )}
                >
                  {event.type === "signup" ? (
                    <UserPlus className="h-4 w-4" />
                  ) : (
                    <Wallet className="h-4 w-4" />
                  )}
                </div>
                {index < activity.length - 1 && (
                  <div className="mt-2 w-px flex-1 bg-border/60" />
                )}
              </div>
              <div className="min-w-0 flex-1 pt-0.5">
                <p className="text-sm font-medium">{event.label}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">{event.detail}</p>
                <p className="mt-1 text-xs text-muted-foreground/70">
                  {new Date(event.date).toLocaleString("fr-FR")}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="relative flex min-h-dvh w-full overflow-x-hidden bg-background">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -left-40 top-0 h-[32rem] w-[32rem] rounded-full bg-violet-500/8 blur-3xl" />
        <div className="absolute -right-40 top-1/3 h-[28rem] w-[28rem] rounded-full bg-indigo-500/8 blur-3xl" />
      </div>

      <AdminSidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      <div className="relative flex min-h-dvh min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 border-b border-border/60 bg-background/80 backdrop-blur-xl">
          <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-4 md:px-8">
            <div className="flex min-w-0 items-start gap-3 sm:items-center">
              <button
                type="button"
                aria-label="Ouvrir le menu"
                onClick={() => setMobileSidebarOpen(true)}
                className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-card/60 lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <AdminNavIcon section={activeSection} />
                  <h1 className="truncate text-xl font-semibold tracking-tight sm:text-2xl">
                    {sectionMeta.title}
                  </h1>
                </div>
                <p className="mt-0.5 text-sm text-muted-foreground">{sectionMeta.subtitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <StatusPill ok={connected} label={connected ? "Marché connecté" : "Marché hors ligne"} />
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 md:px-8 md:py-8">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            {activeSection === "overview" && overviewSection}
            {activeSection === "clients" && clientsSection}
            {activeSection === "portfolios" && portfoliosSection}
            {activeSection === "market" && marketSection}
            {activeSection === "activity" && activitySection}
          </motion.div>
        </main>
      </div>
    </div>
  );
}

function PortfolioDetail({
  client,
  prices,
}: {
  client: ClientProfile;
  prices: Record<string, number>;
}) {
  if (client.portfolio_items.length === 0) {
    return <p className="text-sm text-muted-foreground">Aucun actif dans ce portefeuille.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border/60 bg-card/60 p-4">
      <h3 className="mb-4 text-sm font-semibold">Détail — {client.name}</h3>
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
            <th className="pb-3 pr-4 font-medium">Symbole</th>
            <th className="pb-3 pr-4 font-medium">Quantité</th>
            <th className="pb-3 pr-4 font-medium">Prix d&apos;achat</th>
            <th className="pb-3 pr-4 font-medium">Prix actuel</th>
            <th className="pb-3 pr-4 font-medium">Valeur</th>
            <th className="pb-3 font-medium">PnL</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/40">
          {client.portfolio_items.map((item) => {
            const { currentPrice, currentValue, pnlDollar, pnlPercent } = getAssetMetrics(
              item,
              prices,
            );
            return (
              <tr key={item.id}>
                <td className="py-3 pr-4 font-medium">{item.symbol}</td>
                <td className="py-3 pr-4">{quantityFormatter.format(item.quantity)}</td>
                <td className="py-3 pr-4">{formatCurrency(item.purchase_price)}</td>
                <td className="py-3 pr-4">
                  {currentPrice !== undefined ? formatCurrency(currentPrice) : "—"}
                </td>
                <td className="py-3 pr-4">
                  {currentValue !== null ? formatCurrency(currentValue) : "—"}
                </td>
                <td className="py-3">
                  {pnlDollar !== null && pnlPercent !== null ? (
                    <div className={pnlDollar >= 0 ? "text-emerald-400" : "text-red-400"}>
                      <p>{formatCurrency(pnlDollar)}</p>
                      <p className="text-xs">{formatPercent(pnlPercent)}</p>
                    </div>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
