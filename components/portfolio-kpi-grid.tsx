"use client";

import { ArrowUpRight, BarChart3, TrendingUp, Wallet } from "lucide-react";
import {
  formatCurrency,
  formatPercent,
  type PortfolioTotals,
  type PortfolioRow,
} from "@/lib/portfolio-metrics";
import { cn } from "@/lib/utils";

function StatCard({
  label,
  value,
  sub,
  icon,
  trend,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  trend?: "up" | "down" | "neutral";
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card/50 p-5 backdrop-blur-sm transition-colors hover:border-emerald-500/20">
      <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-emerald-500/5 blur-2xl transition-all group-hover:bg-emerald-500/10" />
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

type PortfolioKpiGridProps = {
  totals: PortfolioTotals;
  performers: { best: PortfolioRow | null; worst: PortfolioRow | null };
  assetCount: number;
  hasLiveData: boolean;
};

export function PortfolioKpiGrid({
  totals,
  performers,
  assetCount,
  hasLiveData,
}: PortfolioKpiGridProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
      <StatCard
        label="Valeur totale"
        value={hasLiveData ? formatCurrency(totals.totalValue) : "—"}
        sub={`${assetCount} position${assetCount !== 1 ? "s" : ""}`}
        icon={<Wallet className="h-5 w-5" />}
      />
      <StatCard
        label="Capital investi"
        value={formatCurrency(totals.totalCost)}
        sub="Coût d'acquisition total"
        icon={<BarChart3 className="h-5 w-5" />}
      />
      <StatCard
        label="PnL global"
        value={totals.totalPnl !== null ? formatCurrency(totals.totalPnl) : "—"}
        sub={
          totals.totalPnlPct !== null
            ? `${formatPercent(totals.totalPnlPct)} de rendement`
            : undefined
        }
        icon={<TrendingUp className="h-5 w-5" />}
        trend={
          totals.totalPnl !== null
            ? totals.totalPnl >= 0
              ? "up"
              : "down"
            : "neutral"
        }
      />
      <StatCard
        label="Meilleure position"
        value={performers.best ? performers.best.asset.symbol : "—"}
        sub={
          performers.best?.pnlPct !== null && performers.best?.pnlPct !== undefined
            ? formatPercent(performers.best.pnlPct)
            : "Ajoutez des actifs"
        }
        icon={<ArrowUpRight className="h-5 w-5" />}
        trend={
          performers.best?.pnlPct !== null && performers.best?.pnlPct !== undefined
            ? performers.best.pnlPct >= 0
              ? "up"
              : "down"
            : "neutral"
        }
      />
    </div>
  );
}
