"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Bitcoin, Plus, Trash2, TrendingDown, TrendingUp } from "lucide-react";
import { addAsset, deleteAsset, type PortfolioActionState } from "@/app/actions/portfolio";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { PortfolioItem } from "@/types/portfolio";

type PriceFlash = "up" | "down";

type SortKey = "symbol" | "value" | "pnl" | "allocation";

type PortfolioManagerProps = {
  initialAssets: PortfolioItem[];
  prices?: Record<string, number>;
  search?: string;
  sortBy?: SortKey;
  totalPortfolioValue?: number;
};

const POPULAR_SYMBOLS = ["BTC", "ETH", "SOL", "XRP", "DOGE", "ADA"];

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const quantityFormatter = new Intl.NumberFormat("fr-FR", {
  maximumFractionDigits: 8,
});

const initialAddState: PortfolioActionState = {};

const SYMBOL_COLORS: Record<string, string> = {
  BTC: "#f7931a",
  ETH: "#627eea",
  SOL: "#14f195",
  XRP: "#0085c3",
  DOGE: "#c2a633",
  ADA: "#0033ad",
  AVAX: "#e84142",
  LINK: "#2a5ada",
};

function formatCurrency(value: number) {
  return currencyFormatter.format(value);
}

function formatPercent(value: number) {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

function resolvePrice(prices: Record<string, number>, symbol: string) {
  return prices[symbol] ?? prices[`${symbol}USDT`] ?? prices[`${symbol}USD`];
}

function getSymbolColor(symbol: string) {
  const base = symbol.replace(/USDT|USD|USDC$/i, "").toUpperCase();
  return SYMBOL_COLORS[base] ?? "#64748b";
}

function AssetBadge({ symbol }: { symbol: string }) {
  const base = symbol.replace(/USDT|USD|USDC$/i, "").toUpperCase().slice(0, 3);
  const color = getSymbolColor(symbol);

  return (
    <div className="flex items-center gap-3">
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold text-white"
        style={{ backgroundColor: color }}
      >
        {base}
      </div>
      <span className="font-semibold">{symbol}</span>
    </div>
  );
}

export function PortfolioManager({
  initialAssets,
  prices: externalPrices,
  search = "",
  sortBy = "value",
  totalPortfolioValue = 0,
}: PortfolioManagerProps) {
  const router = useRouter();
  const [assets, setAssets] = useState(initialAssets);
  const [internalPrices, setInternalPrices] = useState<Record<string, number>>({});
  const [priceFlash, setPriceFlash] = useState<Record<string, PriceFlash>>({});
  const [showForm, setShowForm] = useState(false);
  const [prefillSymbol, setPrefillSymbol] = useState("");
  const [addState, addAction, isAdding] = useActionState(addAsset, initialAddState);
  const [isDeleting, startDeleteTransition] = useTransition();
  const flashTimeouts = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const previousPricesRef = useRef<Record<string, number>>({});

  const prices = externalPrices ?? internalPrices;
  const usesExternalPrices = externalPrices !== undefined;

  useEffect(() => {
    setAssets(initialAssets);
  }, [initialAssets]);

  useEffect(() => {
    if (usesExternalPrices) return;

    let cancelled = false;

    async function poll() {
      try {
        const response = await fetch("/api/crypto/prices", { cache: "no-store" });
        if (!response.ok || cancelled) return;

        const incoming = (await response.json()) as Record<string, number>;

        setInternalPrices((previous) => {
          const flashes: Record<string, PriceFlash> = {};

          for (const [symbol, price] of Object.entries(incoming)) {
            const previousPrice = previous[symbol];
            if (previousPrice !== undefined && price !== previousPrice) {
              flashes[symbol] = price > previousPrice ? "up" : "down";
            }
          }

          if (Object.keys(flashes).length > 0) {
            setPriceFlash((current) => ({ ...current, ...flashes }));

            for (const [symbol] of Object.entries(flashes)) {
              if (flashTimeouts.current[symbol]) {
                clearTimeout(flashTimeouts.current[symbol]);
              }

              flashTimeouts.current[symbol] = setTimeout(() => {
                setPriceFlash((current) => {
                  const next = { ...current };
                  delete next[symbol];
                  return next;
                });
              }, 700);
            }
          }

          return incoming;
        });
      } catch {
        // Ignore transient fetch errors.
      }
    }

    void poll();
    const intervalId = setInterval(poll, 3000);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
      Object.values(flashTimeouts.current).forEach(clearTimeout);
    };
  }, [usesExternalPrices]);

  useEffect(() => {
    if (!usesExternalPrices || !externalPrices) return;

    const flashes: Record<string, PriceFlash> = {};

    for (const asset of assets) {
      const symbol = asset.symbol;
      const price = resolvePrice(externalPrices, symbol);
      const previousPrice = resolvePrice(previousPricesRef.current, symbol);

      if (price !== undefined && previousPrice !== undefined && price !== previousPrice) {
        flashes[symbol] = price > previousPrice ? "up" : "down";
      }
    }

    previousPricesRef.current = externalPrices;

    if (Object.keys(flashes).length === 0) return;

    setPriceFlash((current) => ({ ...current, ...flashes }));

    for (const [symbol] of Object.entries(flashes)) {
      if (flashTimeouts.current[symbol]) {
        clearTimeout(flashTimeouts.current[symbol]);
      }

      flashTimeouts.current[symbol] = setTimeout(() => {
        setPriceFlash((current) => {
          const next = { ...current };
          delete next[symbol];
          return next;
        });
      }, 700);
    }
  }, [externalPrices, usesExternalPrices, assets]);

  useEffect(() => {
    if (addState.success) {
      setShowForm(false);
      setPrefillSymbol("");
      router.refresh();
    }
  }, [addState.success, router]);

  function handleDelete(id: string) {
    startDeleteTransition(async () => {
      await deleteAsset(id);
      router.refresh();
    });
  }

  function openFormWithSymbol(symbol: string) {
    setPrefillSymbol(symbol);
    setShowForm(true);
  }

  const portfolioRows = assets
    .map((asset) => {
      const currentPrice = resolvePrice(prices, asset.symbol);
      const hasLivePrice = currentPrice !== undefined;
      const totalValue = hasLivePrice ? asset.quantity * currentPrice : null;
      const costBasis = asset.quantity * asset.purchase_price;
      const pnlDollar = totalValue !== null ? totalValue - costBasis : null;
      const pnlPercent =
        pnlDollar !== null && costBasis > 0 ? (pnlDollar / costBasis) * 100 : null;
      const allocation =
        totalValue !== null && totalPortfolioValue > 0
          ? (totalValue / totalPortfolioValue) * 100
          : null;

      return {
        asset,
        currentPrice,
        hasLivePrice,
        totalValue,
        pnlDollar,
        pnlPercent,
        allocation,
      };
    })
    .filter((row) => {
      const q = search.trim().toLowerCase();
      if (!q) return true;
      return row.asset.symbol.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "symbol":
          return a.asset.symbol.localeCompare(b.asset.symbol);
        case "pnl":
          return (b.pnlPercent ?? -Infinity) - (a.pnlPercent ?? -Infinity);
        case "allocation":
          return (b.allocation ?? -Infinity) - (a.allocation ?? -Infinity);
        case "value":
        default:
          return (b.totalValue ?? -Infinity) - (a.totalValue ?? -Infinity);
      }
    });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Gérez vos positions crypto avec prix live Binance
        </p>
        <Button onClick={() => setShowForm((open) => !open)} className="gap-2">
          <Plus className="h-4 w-4" />
          {showForm ? "Fermer" : "Ajouter un actif"}
        </Button>
      </div>

      {showForm && (
        <form
          action={addAction}
          className="rounded-2xl border border-border/60 bg-muted/20 p-6"
        >
          <div className="mb-4 flex items-center gap-2">
            <Bitcoin className="h-5 w-5 text-emerald-400" />
            <h2 className="text-lg font-semibold">Nouvel actif</h2>
          </div>

          {addState.error && (
            <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-red-400">
              {addState.error}
            </div>
          )}

          <div className="mb-4">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Populaires
            </p>
            <div className="flex flex-wrap gap-2">
              {POPULAR_SYMBOLS.map((symbol) => (
                <button
                  key={symbol}
                  type="button"
                  onClick={() => openFormWithSymbol(symbol)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                    prefillSymbol === symbol
                      ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400"
                      : "border-border/60 bg-background/50 text-muted-foreground hover:border-border hover:text-foreground",
                  )}
                >
                  {symbol}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="symbol">Symbole</Label>
              <Input
                id="symbol"
                name="symbol"
                type="text"
                required
                key={prefillSymbol}
                defaultValue={prefillSymbol}
                placeholder="BTC ou BTCUSDT"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantité</Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                step="any"
                min="0"
                required
                placeholder="0.5"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="purchase_price">Prix d&apos;achat ($)</Label>
              <Input
                id="purchase_price"
                name="purchase_price"
                type="number"
                step="any"
                min="0"
                required
                placeholder="65000"
              />
            </div>
          </div>

          <Button type="submit" disabled={isAdding} className="mt-4">
            {isAdding ? "Ajout en cours..." : "Ajouter au portefeuille"}
          </Button>
        </form>
      )}

      {portfolioRows.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-muted/10 px-6 py-16 text-center">
          <Bitcoin className="mb-4 h-12 w-12 text-muted-foreground/50" />
          <p className="text-lg font-medium">
            {search ? "Aucun actif ne correspond au filtre" : "Portefeuille vide"}
          </p>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            {search
              ? "Essayez un autre symbole ou effacez le filtre."
              : "Ajoutez votre première position crypto pour commencer le suivi live."}
          </p>
          {!search && (
            <Button className="mt-6" onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4" />
              Ajouter un actif
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-xl border border-border/60 md:block">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/20 text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-5 py-3.5 font-medium">Actif</th>
                    <th className="px-5 py-3.5 font-medium">Quantité</th>
                    <th className="px-5 py-3.5 font-medium">Prix achat</th>
                    <th className="px-5 py-3.5 font-medium">Prix live</th>
                    <th className="px-5 py-3.5 font-medium">Valeur</th>
                    <th className="px-5 py-3.5 font-medium">Allocation</th>
                    <th className="px-5 py-3.5 font-medium">PnL</th>
                    <th className="px-5 py-3.5 font-medium">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {portfolioRows.map(
                    ({
                      asset,
                      currentPrice,
                      hasLivePrice,
                      totalValue,
                      pnlDollar,
                      pnlPercent,
                      allocation,
                    }) => (
                      <tr
                        key={asset.id}
                        className="text-sm transition-colors hover:bg-muted/20"
                      >
                        <td className="px-5 py-4">
                          <AssetBadge symbol={asset.symbol} />
                        </td>
                        <td className="px-5 py-4 tabular-nums">
                          {quantityFormatter.format(asset.quantity)}
                        </td>
                        <td className="px-5 py-4 tabular-nums">
                          {formatCurrency(asset.purchase_price)}
                        </td>
                        <td
                          className={cn(
                            "px-5 py-4 font-medium tabular-nums transition-colors duration-300",
                            priceFlash[asset.symbol] === "up" && "bg-emerald-500/15 text-emerald-400",
                            priceFlash[asset.symbol] === "down" && "bg-red-500/15 text-red-400",
                          )}
                        >
                          {hasLivePrice ? formatCurrency(currentPrice!) : "—"}
                        </td>
                        <td className="px-5 py-4 font-medium tabular-nums">
                          {totalValue !== null ? formatCurrency(totalValue) : "—"}
                        </td>
                        <td className="px-5 py-4">
                          {allocation !== null ? (
                            <div className="flex items-center gap-2">
                              <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                                <div
                                  className="h-full rounded-full bg-emerald-500"
                                  style={{ width: `${Math.min(allocation, 100)}%` }}
                                />
                              </div>
                              <span className="text-xs text-muted-foreground tabular-nums">
                                {allocation.toFixed(1)}%
                              </span>
                            </div>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="px-5 py-4">
                          {pnlDollar !== null && pnlPercent !== null ? (
                            <div
                              className={cn(
                                "flex items-center gap-1.5",
                                pnlDollar >= 0 ? "text-emerald-400" : "text-red-400",
                              )}
                            >
                              {pnlDollar >= 0 ? (
                                <TrendingUp className="h-3.5 w-3.5" />
                              ) : (
                                <TrendingDown className="h-3.5 w-3.5" />
                              )}
                              <div>
                                <p className="font-medium tabular-nums">
                                  {formatCurrency(pnlDollar)}
                                </p>
                                <p className="text-xs tabular-nums">{formatPercent(pnlPercent)}</p>
                              </div>
                            </div>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(asset.id)}
                            disabled={isDeleting}
                            aria-label={`Supprimer ${asset.symbol}`}
                            className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-3 md:hidden">
            {portfolioRows.map(
              ({
                asset,
                currentPrice,
                hasLivePrice,
                totalValue,
                pnlDollar,
                pnlPercent,
                allocation,
              }) => (
                <div
                  key={asset.id}
                  className="rounded-xl border border-border/60 bg-muted/20 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <AssetBadge symbol={asset.symbol} />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(asset.id)}
                      disabled={isDeleting}
                      className="shrink-0 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Valeur</p>
                      <p className="font-semibold tabular-nums">
                        {totalValue !== null ? formatCurrency(totalValue) : "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">PnL</p>
                      <p
                        className={cn(
                          "font-semibold tabular-nums",
                          (pnlDollar ?? 0) >= 0 ? "text-emerald-400" : "text-red-400",
                        )}
                      >
                        {pnlPercent !== null ? formatPercent(pnlPercent) : "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Prix live</p>
                      <p className="font-medium tabular-nums">
                        {hasLivePrice ? formatCurrency(currentPrice!) : "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Allocation</p>
                      <p className="font-medium tabular-nums">
                        {allocation !== null ? `${allocation.toFixed(1)}%` : "—"}
                      </p>
                    </div>
                  </div>
                </div>
              ),
            )}
          </div>
        </>
      )}
    </div>
  );
}
