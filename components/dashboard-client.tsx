"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowUpRight,
  History,
  LayoutGrid,
  Menu,
  PieChart,
  Radio,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { PortfolioSection } from "@/components/portfolio-section";
import { PortfolioKpiGrid } from "@/components/portfolio-kpi-grid";
import {
  computePortfolioMetrics,
  formatCurrency,
  resolvePrice,
} from "@/lib/portfolio-metrics";
import {
  DashboardSidebar,
  type DashboardSection,
} from "@/components/dashboard-sidebar";
import { NewsFeed } from "@/components/news-feed";
import { NewsSection } from "@/components/news-section";
import { FiscalTimeline } from "@/components/ui/fiscal-timeline";
import { Hero195 } from "@/components/ui/hero-195";
import { LiveCryptoChart } from "@/components/ui/live-crypto-chart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { PortfolioItem } from "@/types/portfolio";

type DashboardClientProps = {
  initialAssets: PortfolioItem[];
};

const ALLOCATION_COLORS = [
  "bg-emerald-500",
  "bg-indigo-500",
  "bg-violet-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-cyan-500",
];

const SECTION_TITLES: Record<DashboardSection, { title: string; subtitle: string }> = {
  overview: {
    title: "Tableau de bord",
    subtitle: "Vue globale de votre portefeuille crypto",
  },
  portfolio: {
    title: "Portefeuille",
    subtitle: "Gérez vos positions et suivez les prix live",
  },
  news: {
    title: "Actualités",
    subtitle: "Toutes les news crypto du marché",
  },
  fiscal: {
    title: "Timeline Fiscale",
    subtitle: "Historique des transactions & impact fiscal",
  },
  "live-studio": {
    title: "Aperçu Live",
    subtitle: "",
  },
};

export function DashboardClient({ initialAssets }: DashboardClientProps) {
  const [assets] = useState(initialAssets);
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [activeSection, setActiveSection] = useState<DashboardSection>("overview");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [heroTab, setHeroTab] = useState("live-chart");

  useEffect(() => {
    const eventSource = new EventSource("/api/crypto/stream");

    eventSource.onmessage = (event) => {
      try {
        const incoming = JSON.parse(event.data) as Record<string, number>;
        setPrices(incoming);
      } catch {
        // Ignore malformed payloads.
      }
    };

    return () => eventSource.close();
  }, []);

  const metrics = useMemo(
    () => computePortfolioMetrics(assets, prices),
    [assets, prices],
  );

  const {
    totals,
    performers,
    hasLiveData,
    allocationData,
  } = metrics;

  const totalValue = totals.totalValue;
  const totalCost = totals.totalCost;
  const totalPnl = totals.totalPnl ?? 0;
  const pnlPercent = totals.totalPnlPct ?? 0;

  const allocations = useMemo(() => {
    return allocationData.map((item, index) => ({
      symbol: item.name,
      value: item.value,
      percentage: item.percent,
      color: ALLOCATION_COLORS[index % ALLOCATION_COLORS.length],
    }));
  }, [allocationData]);

  const heroLiveChartContent = (
    <LiveCryptoChart binancePrices={prices} embedded />
  );

  const heroPerformanceContent = (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-xl border border-border/60 bg-muted/20 p-4 lg:col-span-2">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Valeur totale</p>
        <p className="mt-2 text-4xl font-bold tracking-tighter">
          {hasLiveData ? formatCurrency(totalValue) : "—"}
        </p>
        <p
          className={cn(
            "mt-2 flex items-center gap-1 text-sm font-medium",
            totalPnl >= 0 ? "text-emerald-400" : "text-red-400",
          )}
        >
          {hasLiveData ? (
            <>
              {totalPnl >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              {formatCurrency(totalPnl)} ({pnlPercent >= 0 ? "+" : ""}
              {pnlPercent.toFixed(2)}%)
            </>
          ) : (
            "—"
          )}
        </p>
      </div>
      <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
        <p className="text-xs text-muted-foreground">Capital investi</p>
        <p className="mt-1 text-2xl font-bold">{formatCurrency(totalCost)}</p>
      </div>
      <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
        <p className="text-xs text-muted-foreground">Actifs</p>
        <p className="mt-1 text-2xl font-bold">{assets.length}</p>
      </div>
      <div className="rounded-xl border border-border/60 bg-muted/20 p-4 sm:col-span-2 lg:col-span-4">
        <p className="mb-3 text-sm font-medium">Allocation</p>
        {allocations.length === 0 ? (
          <p className="text-sm text-muted-foreground">—</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-3">
            {allocations.slice(0, 3).map((item) => (
              <div key={item.symbol}>
                <div className="mb-1 flex justify-between text-sm">
                  <span>{item.symbol}</span>
                  <span className="text-muted-foreground">{item.percentage.toFixed(1)}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn("h-full rounded-full", item.color)}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const heroMarketContent = (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {[
        { name: "Bitcoin", symbol: "BTC", color: "#f7931a" },
        { name: "Ethereum", symbol: "ETH", color: "#627eea" },
        { name: "Solana", symbol: "SOL", color: "#14f195" },
        { name: "Ripple", symbol: "XRP", color: "#0085c3" },
        { name: "Dogecoin", symbol: "DOGE", color: "#c2a633" },
        { name: "Cardano", symbol: "ADA", color: "#0033ad" },
      ].map((coin) => {
        const price = resolvePrice(prices, coin.symbol);
        return (
          <div
            key={coin.symbol}
            className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/20 px-4 py-3 transition-colors hover:border-border"
          >
            <div className="flex items-center gap-3">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-lg text-xs font-bold text-white"
                style={{ backgroundColor: coin.color }}
              >
                {coin.symbol.slice(0, 3)}
              </div>
              <div>
                <p className="font-medium">{coin.name}</p>
                <p className="text-xs text-muted-foreground">{coin.symbol}/USDT</p>
              </div>
            </div>
            <p className="font-bold tabular-nums">
              {price !== undefined ? formatCurrency(price) : "—"}
            </p>
          </div>
        );
      })}
    </div>
  );

  const sectionMeta = SECTION_TITLES[activeSection];

  return (
    <div className="relative flex min-h-dvh w-full overflow-x-hidden bg-background">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -left-40 top-0 h-[32rem] w-[32rem] rounded-full bg-emerald-500/8 blur-3xl" />
        <div className="absolute -right-40 top-1/3 h-[28rem] w-[28rem] rounded-full bg-indigo-500/8 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-[24rem] w-[24rem] -translate-x-1/2 rounded-full bg-violet-500/5 blur-3xl" />
      </div>

      <DashboardSidebar
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
                className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-card/60 text-foreground transition-colors hover:bg-muted lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="min-w-0">
                <h1 className="truncate text-lg font-semibold tracking-tight sm:text-xl md:text-2xl">
                  {sectionMeta.title}
                </h1>
                {sectionMeta.subtitle ? (
                  <p className="line-clamp-2 text-xs text-muted-foreground sm:line-clamp-1 sm:text-sm">
                    {sectionMeta.subtitle}
                  </p>
                ) : null}
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2 self-end sm:gap-3 sm:self-auto">
              <div className="hidden items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400 md:flex">
                <Radio className="h-3 w-3 animate-pulse" />
                Prix live Binance
              </div>
              {hasLiveData && (
                <div className="rounded-xl border border-border/60 bg-card/60 px-3 py-1.5 text-right sm:px-4 sm:py-2">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Solde
                  </p>
                  <p className="text-xs font-bold sm:text-sm">{formatCurrency(totalValue)}</p>
                </div>
              )}
            </div>
          </div>
        </header>

        <main
          className={cn(
            "min-w-0 flex-1 overflow-x-hidden overflow-y-auto",
            activeSection === "live-studio"
              ? "px-3 py-3 sm:px-4 sm:py-4 md:px-6"
              : "px-4 py-4 sm:px-6 sm:py-6 md:px-8 md:py-8",
          )}
        >
          {activeSection === "overview" && (
            <div className="mx-auto w-full max-w-7xl space-y-6 sm:space-y-8 animate-fade-in">
              <PortfolioKpiGrid
                totals={totals}
                performers={performers}
                assetCount={assets.length}
                hasLiveData={hasLiveData}
              />

              <div className="grid gap-4 sm:gap-6 lg:grid-cols-12">
                <Card className="border-border/60 bg-card/50 shadow-none backdrop-blur-sm lg:col-span-8">
                  <CardHeader>
                    <CardTitle className="text-xl">Performance du portefeuille</CardTitle>
                    <CardDescription>Synthèse en temps réel de vos positions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                          Rendement
                        </p>
                        <p
                          className={cn(
                            "mt-2 text-2xl font-bold",
                            totalPnl >= 0 ? "text-emerald-400" : "text-red-400",
                          )}
                        >
                          {hasLiveData ? `${pnlPercent >= 0 ? "+" : ""}${pnlPercent.toFixed(2)}%` : "—"}
                        </p>
                      </div>
                      <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                          Positions
                        </p>
                        <p className="mt-2 text-2xl font-bold">{assets.length}</p>
                      </div>
                      <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                          Statut
                        </p>
                        <p className="mt-2 flex items-center gap-2 text-lg font-semibold text-emerald-400">
                          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                          Live
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/60 bg-card/50 shadow-none backdrop-blur-sm lg:col-span-4">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <PieChart className="h-5 w-5 text-muted-foreground" />
                      <CardTitle className="text-xl">Allocation</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {allocations.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        Ajoutez des actifs dans Portefeuille.
                      </p>
                    ) : (
                      allocations.map((item) => (
                        <div key={item.symbol} className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium">{item.symbol}</span>
                            <span className="text-muted-foreground">
                              {item.percentage.toFixed(1)}%
                            </span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-muted">
                            <div
                              className={cn(
                                "h-full rounded-full transition-all duration-500",
                                item.color,
                              )}
                              style={{ width: `${item.percentage}%` }}
                            />
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>

                <div className="lg:col-span-7">
                  <NewsFeed
                    compact
                    limit={4}
                    onViewAll={() => setActiveSection("news")}
                  />
                </div>

                <Card className="border-border/60 bg-card/50 shadow-none backdrop-blur-sm lg:col-span-5">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl">Aperçu rapide</CardTitle>
                        <CardDescription>Top positions</CardDescription>
                      </div>
                      <ArrowUpRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {assets.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        Aucun actif pour le moment.
                      </p>
                    ) : (
                      assets.slice(0, 5).map((asset) => {
                        const price = resolvePrice(prices, asset.symbol);
                        const value = price !== undefined ? asset.quantity * price : null;

                        return (
                          <div
                            key={asset.id}
                            className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/20 px-4 py-3"
                          >
                            <div>
                              <p className="font-medium">{asset.symbol}</p>
                              <p className="text-xs text-muted-foreground">
                                {asset.quantity} unités
                              </p>
                            </div>
                            <p className="font-semibold">
                              {value !== null ? formatCurrency(value) : "—"}
                            </p>
                          </div>
                        );
                      })
                    )}
                  </CardContent>
                </Card>
              </div>

              <button
                type="button"
                onClick={() => setActiveSection("live-studio")}
                className="group flex w-full flex-col items-start justify-between gap-4 rounded-2xl border border-dashed border-violet-500/40 bg-gradient-to-r from-violet-500/10 via-transparent to-emerald-500/10 p-4 text-left transition-all hover:border-violet-500/60 hover:shadow-lg hover:shadow-violet-500/10 sm:flex-row sm:items-center sm:p-6"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-violet-300">Découvrir Hero195</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Ouvrir la section Aperçu Live avec effet Border Beam
                  </p>
                </div>
                <span className="shrink-0 rounded-xl bg-violet-500/20 px-4 py-2 text-sm font-medium text-violet-300 transition-colors group-hover:bg-violet-500/30">
                  Voir la section →
                </span>
              </button>
            </div>
          )}

          {activeSection === "portfolio" && (
            <div className="mx-auto w-full max-w-7xl">
              <PortfolioSection initialAssets={initialAssets} prices={prices} />
            </div>
          )}

          {activeSection === "news" && (
            <div className="mx-auto w-full max-w-7xl">
              <NewsSection />
            </div>
          )}

          {activeSection === "fiscal" && (
            <div className="mx-auto w-full max-w-7xl animate-fade-in">
              <FiscalTimeline />
            </div>
          )}

          {activeSection === "live-studio" && (
            <div className="mx-auto w-full max-w-7xl animate-fade-in">
              <Hero195
                variant="studio"
                value={heroTab}
                onValueChange={setHeroTab}
                tabs={[
                  {
                    title: "Graphique",
                    value: "live-chart",
                    icon: <Activity className="h-4 w-4" />,
                    content: heroLiveChartContent,
                  },
                  {
                    title: "Performance",
                    value: "performance",
                    icon: <LayoutGrid className="h-4 w-4" />,
                    content: heroPerformanceContent,
                  },
                  {
                    title: "Marché",
                    value: "market",
                    icon: <History className="h-4 w-4" />,
                    content: heroMarketContent,
                  },
                ]}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
