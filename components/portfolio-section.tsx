"use client";

import { useMemo, useState } from "react";
import {
  ArrowDownRight,
  Calendar,
  Layers,
  PieChart as PieChartIcon,
  Scale,
  Search,
  Shield,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PortfolioManager } from "@/components/PortfolioManager";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  computePortfolioMetrics,
  formatCurrency,
  formatPercent,
} from "@/lib/portfolio-metrics";
import type { PortfolioItem } from "@/types/portfolio";

type PortfolioSectionProps = {
  initialAssets: PortfolioItem[];
  prices: Record<string, number>;
};

type SortKey = "symbol" | "value" | "pnl" | "allocation";

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

export function PortfolioSection({ initialAssets, prices }: PortfolioSectionProps) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("value");

  const metrics = useMemo(
    () => computePortfolioMetrics(initialAssets, prices),
    [initialAssets, prices],
  );

  const {
    rows,
    totals,
    allocationData,
    performers,
    pnlChartData,
    diversificationScore,
    recentAssets,
    hasLiveData,
  } = metrics;

  const filteredCount = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return initialAssets.length;
    return initialAssets.filter((a) => a.symbol.toLowerCase().includes(q)).length;
  }, [initialAssets, search]);

  const diversificationLabel =
    diversificationScore >= 75
      ? "Bien diversifié"
      : diversificationScore >= 45
        ? "Modéré"
        : "Concentré";

  return (
    <div className="w-full max-w-7xl space-y-4 sm:space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-400">
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
          {hasLiveData ? `${totals.liveCount} actifs en live` : "En attente des prix"}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Layers className="h-4 w-4" />
          {initialAssets.length} position{initialAssets.length !== 1 ? "s" : ""} ·{" "}
          {allocationData.length} allouée{allocationData.length !== 1 ? "s" : ""}
        </div>
      </div>

      <Card className="border-border/60 bg-card/50 shadow-none backdrop-blur-sm">
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-xl">Mes actifs</CardTitle>
              <CardDescription>
                {filteredCount} position{filteredCount !== 1 ? "s" : ""}
                {search ? ` · « ${search} »` : ""}
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative min-w-[200px] flex-1 md:w-64 md:flex-none">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Filtrer par symbole..."
                  className="pl-9"
                />
              </div>
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value as SortKey)}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="value">Trier par valeur</option>
                <option value="pnl">Trier par PnL</option>
                <option value="allocation">Trier par allocation</option>
                <option value="symbol">Trier par symbole</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <PortfolioManager
            initialAssets={initialAssets}
            prices={prices}
            search={search}
            sortBy={sortBy}
            totalPortfolioValue={totals.totalValue}
          />
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-12">
        <Card className="border-border/60 bg-card/50 shadow-none backdrop-blur-sm lg:col-span-4">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-emerald-400" />
              <CardTitle className="text-lg">Score diversification</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-6">
              <div className="relative flex h-28 w-28 shrink-0 items-center justify-center">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="hsl(240 3.7% 15.9%)"
                    strokeWidth="8"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="#34d399"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${diversificationScore * 2.64} 264`}
                  />
                </svg>
                <span className="absolute text-2xl font-bold">{diversificationScore}</span>
              </div>
              <div>
                <p className="font-semibold text-emerald-400">{diversificationLabel}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Basé sur le nombre d&apos;actifs et la concentration du portefeuille.
                </p>
                {allocationData[0] && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Top actif : {allocationData[0].name} ({allocationData[0].percent.toFixed(1)}%)
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/50 shadow-none backdrop-blur-sm lg:col-span-8">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg">PnL par actif</CardTitle>
            </div>
            <CardDescription>Gain ou perte non réalisé par position</CardDescription>
          </CardHeader>
          <CardContent>
            {pnlChartData.length === 0 ? (
              <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-border/60 bg-muted/20">
                <p className="text-sm text-muted-foreground">Données PnL indisponibles</p>
              </div>
            ) : (
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={pnlChartData} layout="vertical" margin={{ left: 8, right: 16 }}>
                    <CartesianGrid
                      stroke="hsl(240 3.7% 15.9%)"
                      strokeDasharray="3 3"
                      horizontal={false}
                    />
                    <XAxis
                      type="number"
                      tick={{ fill: "hsl(240 5% 64.9%)", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v: number) => `$${Math.abs(v) >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}`}
                    />
                    <YAxis
                      type="category"
                      dataKey="symbol"
                      tick={{ fill: "hsl(240 5% 64.9%)", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      width={56}
                    />
                    <RechartsTooltip
                      formatter={(value) =>
                        typeof value === "number" ? formatCurrency(value) : String(value ?? "")
                      }
                      contentStyle={{
                        background: "hsl(240 10% 6%)",
                        border: "1px solid hsl(240 3.7% 15.9%)",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                    <Bar dataKey="pnl" radius={[0, 4, 4, 0]}>
                      {pnlChartData.map((entry) => (
                        <Cell key={entry.symbol} fill={entry.pnl >= 0 ? "#34d399" : "#f87171"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <Card className="border-border/60 bg-card/50 shadow-none backdrop-blur-sm lg:col-span-5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg">Allocation</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {allocationData.length === 0 ? (
              <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-border/60 bg-muted/20">
                <p className="text-sm text-muted-foreground">Aucune allocation disponible</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={allocationData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={72}
                        paddingAngle={3}
                        stroke="transparent"
                      >
                        {allocationData.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        formatter={(value) =>
                          typeof value === "number" ? formatCurrency(value) : String(value ?? "")
                        }
                        contentStyle={{
                          background: "hsl(240 10% 6%)",
                          border: "1px solid hsl(240 3.7% 15.9%)",
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2">
                  {allocationData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="font-medium">{item.name}</span>
                      </div>
                      <span className="text-muted-foreground">{item.percent.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/50 shadow-none backdrop-blur-sm lg:col-span-7">
          <CardHeader>
            <CardTitle className="text-lg">Écart prix achat / live</CardTitle>
            <CardDescription>Comparez votre prix d&apos;entrée au marché actuel</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {rows.length === 0 ? (
              <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-border/60 bg-muted/20">
                <p className="text-sm text-muted-foreground">Aucune position</p>
              </div>
            ) : (
              rows.map((row) => {
                const spreadPct =
                  row.livePrice !== undefined && row.asset.purchase_price > 0
                    ? ((row.livePrice - row.asset.purchase_price) / row.asset.purchase_price) *
                      100
                    : null;

                return (
                  <div
                    key={row.asset.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/60 bg-muted/20 px-4 py-3"
                  >
                    <div>
                      <p className="font-semibold">{row.asset.symbol}</p>
                      <p className="text-xs text-muted-foreground">
                        Achat {formatCurrency(row.asset.purchase_price)} → Live{" "}
                        {row.livePrice !== undefined ? formatCurrency(row.livePrice) : "—"}
                      </p>
                    </div>
                    <div className="text-right">
                      {spreadPct !== null ? (
                        <p
                          className={cn(
                            "flex items-center justify-end gap-1 font-bold",
                            spreadPct >= 0 ? "text-emerald-400" : "text-red-400",
                          )}
                        >
                          {spreadPct >= 0 ? (
                            <TrendingUp className="h-4 w-4" />
                          ) : (
                            <TrendingDown className="h-4 w-4" />
                          )}
                          {formatPercent(spreadPct)}
                        </p>
                      ) : (
                        <p className="text-muted-foreground">—</p>
                      )}
                      {row.pnl !== null && (
                        <p className="text-xs text-muted-foreground">{formatCurrency(row.pnl)}</p>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <Card className="border-border/60 bg-card/50 shadow-none backdrop-blur-sm lg:col-span-5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg">Activité récente</CardTitle>
            </div>
            <CardDescription>Dernières positions ajoutées</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentAssets.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucune activité</p>
            ) : (
              recentAssets.map((asset) => (
                <div
                  key={asset.id}
                  className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/20 px-4 py-3"
                >
                  <div>
                    <p className="font-medium">{asset.symbol}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(asset.created_at)}</p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="font-medium">{asset.quantity} unités</p>
                    <p className="text-xs text-muted-foreground">
                      @ {formatCurrency(asset.purchase_price)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/50 shadow-none backdrop-blur-sm lg:col-span-7">
          <CardHeader>
            <CardTitle className="text-lg">Top & Flop</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {performers.best && performers.worst ? (
              <>
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="h-5 w-5 text-emerald-400" />
                      <div>
                        <p className="text-xs text-muted-foreground">Meilleure</p>
                        <p className="font-semibold">{performers.best.asset.symbol}</p>
                      </div>
                    </div>
                    <p className="font-bold text-emerald-400">
                      {formatPercent(performers.best.pnlPct ?? 0)}
                    </p>
                  </div>
                </div>
                <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <TrendingDown className="h-5 w-5 text-red-400" />
                      <div>
                        <p className="text-xs text-muted-foreground">Moins bonne</p>
                        <p className="font-semibold">{performers.worst.asset.symbol}</p>
                      </div>
                    </div>
                    <p
                      className={cn(
                        "font-bold",
                        (performers.worst.pnlPct ?? 0) >= 0 ? "text-emerald-400" : "text-red-400",
                      )}
                    >
                      {formatPercent(performers.worst.pnlPct ?? 0)}
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-border/60 bg-muted/20">
                <ArrowDownRight className="mr-2 h-5 w-5 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Performance en attente</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
