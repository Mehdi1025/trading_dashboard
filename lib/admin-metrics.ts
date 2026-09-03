import { formatCurrency, formatPercent, resolvePrice } from "@/lib/portfolio-metrics";
import type { ClientProfile } from "@/types/admin";
import type { PortfolioItem } from "@/types/portfolio";

export type ClientMetrics = {
  client: ClientProfile;
  initialCapital: number;
  currentValue: number;
  hasLiveData: boolean;
  pnlDollar: number | null;
  pnlPercent: number | null;
  positionCount: number;
};

export type AggregatedHolding = {
  symbol: string;
  totalQuantity: number;
  totalValue: number;
  clientCount: number;
  livePrice: number | undefined;
};

export type ActivityEvent = {
  id: string;
  type: "signup" | "position";
  label: string;
  detail: string;
  date: string;
  timestamp: number;
};

function computeInitialCapital(items: PortfolioItem[]) {
  return items.reduce((sum, item) => sum + item.quantity * item.purchase_price, 0);
}

function computeCurrentValue(items: PortfolioItem[], prices: Record<string, number>) {
  return items.reduce((sum, item) => {
    const price = resolvePrice(prices, item.symbol.replace(/USDT|USD|USDC$/i, ""));
    if (price === undefined) return sum;
    return sum + item.quantity * price;
  }, 0);
}

export function computeClientMetrics(
  client: ClientProfile,
  prices: Record<string, number>,
): ClientMetrics {
  const initialCapital = computeInitialCapital(client.portfolio_items);
  const currentValue = computeCurrentValue(client.portfolio_items, prices);
  const hasLiveData = client.portfolio_items.some((item) => {
    const base = item.symbol.replace(/USDT|USD|USDC$/i, "");
    return resolvePrice(prices, base) !== undefined;
  });
  const pnlDollar = hasLiveData ? currentValue - initialCapital : null;
  const pnlPercent =
    pnlDollar !== null && initialCapital > 0 ? (pnlDollar / initialCapital) * 100 : null;

  return {
    client,
    initialCapital,
    currentValue,
    hasLiveData,
    pnlDollar,
    pnlPercent,
    positionCount: client.portfolio_items.length,
  };
}

export function computeAllClientMetrics(clients: ClientProfile[], prices: Record<string, number>) {
  return clients.map((client) => computeClientMetrics(client, prices));
}

export function computeGlobalStats(rows: ClientMetrics[]) {
  const totalAum = rows.reduce((sum, row) => sum + (row.hasLiveData ? row.currentValue : 0), 0);
  const totalInitialCapital = rows.reduce((sum, row) => sum + row.initialCapital, 0);
  const globalPnl = totalAum - totalInitialCapital;
  const globalPnlPercent =
    totalInitialCapital > 0 ? (globalPnl / totalInitialCapital) * 100 : 0;
  const totalPositions = rows.reduce((sum, row) => sum + row.positionCount, 0);
  const activeClients = rows.filter((row) => row.positionCount > 0).length;

  return {
    totalAum,
    totalInitialCapital,
    globalPnl,
    globalPnlPercent,
    totalPositions,
    activeClients,
    clientCount: rows.length,
  };
}

export function computeAggregatedHoldings(
  clients: ClientProfile[],
  prices: Record<string, number>,
): AggregatedHolding[] {
  const map = new Map<string, AggregatedHolding>();

  for (const client of clients) {
    for (const item of client.portfolio_items) {
      const base = item.symbol.replace(/USDT|USD|USDC$/i, "").toUpperCase();
      const livePrice = resolvePrice(prices, base);
      const existing = map.get(base) ?? {
        symbol: base,
        totalQuantity: 0,
        totalValue: 0,
        clientCount: 0,
        livePrice,
      };

      existing.totalQuantity += item.quantity;
      if (livePrice !== undefined) {
        existing.totalValue += item.quantity * livePrice;
        existing.livePrice = livePrice;
      }

      map.set(base, existing);
    }
  }

  const clientSets = new Map<string, Set<string>>();
  for (const client of clients) {
    for (const item of client.portfolio_items) {
      const base = item.symbol.replace(/USDT|USD|USDC$/i, "").toUpperCase();
      if (!clientSets.has(base)) clientSets.set(base, new Set());
      clientSets.get(base)!.add(client.id);
    }
  }

  return [...map.values()]
    .map((holding) => ({
      ...holding,
      clientCount: clientSets.get(holding.symbol)?.size ?? 0,
    }))
    .sort((a, b) => b.totalValue - a.totalValue);
}

export function buildActivityFeed(clients: ClientProfile[]): ActivityEvent[] {
  const events: ActivityEvent[] = [];

  for (const client of clients) {
    if (client.created_at) {
      events.push({
        id: `signup-${client.id}`,
        type: "signup",
        label: "Nouveau client",
        detail: `${client.name} (${client.email})`,
        date: client.created_at,
        timestamp: new Date(client.created_at).getTime(),
      });
    }

    for (const item of client.portfolio_items) {
      if (item.created_at) {
        events.push({
          id: `pos-${item.id}`,
          type: "position",
          label: "Position ajoutée",
          detail: `${client.name} — ${item.symbol}`,
          date: item.created_at,
          timestamp: new Date(item.created_at).getTime(),
        });
      }
    }
  }

  return events.sort((a, b) => b.timestamp - a.timestamp).slice(0, 20);
}

export function getAssetMetrics(item: PortfolioItem, prices: Record<string, number>) {
  const base = item.symbol.replace(/USDT|USD|USDC$/i, "");
  const currentPrice = resolvePrice(prices, base);
  const costBasis = item.quantity * item.purchase_price;
  const currentValue = currentPrice !== undefined ? item.quantity * currentPrice : null;
  const pnlDollar = currentValue !== null ? currentValue - costBasis : null;
  const pnlPercent = pnlDollar !== null && costBasis > 0 ? (pnlDollar / costBasis) * 100 : null;

  return { currentPrice, costBasis, currentValue, pnlDollar, pnlPercent };
}

export { formatCurrency, formatPercent };
