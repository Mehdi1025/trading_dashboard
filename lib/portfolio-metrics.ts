import type { PortfolioItem } from "@/types/portfolio";

export const ALLOCATION_HEX = [
  "#34d399",
  "#818cf8",
  "#a78bfa",
  "#fbbf24",
  "#fb7185",
  "#22d3ee",
  "#f472b6",
  "#94a3b8",
];

export const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatCurrency(value: number) {
  return currencyFormatter.format(value);
}

export function formatPercent(value: number) {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

export function resolvePrice(prices: Record<string, number>, symbol: string) {
  return prices[symbol] ?? prices[`${symbol}USDT`] ?? prices[`${symbol}USD`];
}

export type PortfolioRow = {
  asset: PortfolioItem;
  livePrice: number | undefined;
  hasLive: boolean;
  cost: number;
  value: number | null;
  pnl: number | null;
  pnlPct: number | null;
  allocation: number | null;
};

export type PortfolioTotals = {
  totalValue: number;
  totalCost: number;
  totalPnl: number | null;
  totalPnlPct: number | null;
  liveCount: number;
};

export type AllocationSlice = {
  name: string;
  value: number;
  color: string;
  percent: number;
};

export function computePortfolioMetrics(
  assets: PortfolioItem[],
  prices: Record<string, number>,
) {
  let totalValue = 0;
  let totalCost = 0;
  let liveCount = 0;

  const rows: PortfolioRow[] = assets.map((asset) => {
    const livePrice = resolvePrice(prices, asset.symbol);
    const hasLive = livePrice !== undefined;
    const cost = asset.quantity * asset.purchase_price;
    const value = hasLive ? asset.quantity * livePrice : null;
    const pnl = value !== null ? value - cost : null;
    const pnlPct = pnl !== null && cost > 0 ? (pnl / cost) * 100 : null;

    totalCost += cost;
    if (value !== null) {
      totalValue += value;
      liveCount += 1;
    }

    return {
      asset,
      livePrice,
      hasLive,
      cost,
      value,
      pnl,
      pnlPct,
      allocation: null,
    };
  });

  const totals: PortfolioTotals = {
    totalValue,
    totalCost,
    totalPnl: liveCount > 0 ? totalValue - totalCost : null,
    totalPnlPct:
      liveCount > 0 && totalCost > 0
        ? ((totalValue - totalCost) / totalCost) * 100
        : null,
    liveCount,
  };

  const rowsWithAllocation = rows.map((row) => ({
    ...row,
    allocation:
      row.value !== null && totals.totalValue > 0
        ? (row.value / totals.totalValue) * 100
        : null,
  }));

  const allocationData: AllocationSlice[] =
    totals.totalValue <= 0
      ? []
      : rowsWithAllocation
          .filter((row) => row.value !== null && row.value > 0)
          .map((row, index) => ({
            name: row.asset.symbol,
            value: row.value as number,
            color: ALLOCATION_HEX[index % ALLOCATION_HEX.length],
            percent: ((row.value as number) / totals.totalValue) * 100,
          }))
          .sort((a, b) => b.value - a.value);

  const withPnl = rowsWithAllocation.filter((row) => row.pnlPct !== null);
  const sortedByPnl = [...withPnl].sort((a, b) => (b.pnlPct ?? 0) - (a.pnlPct ?? 0));

  const performers = {
    best: sortedByPnl[0] ?? null,
    worst: sortedByPnl[sortedByPnl.length - 1] ?? null,
  };

  const pnlChartData = rowsWithAllocation
    .filter((row) => row.pnl !== null)
    .map((row) => ({
      symbol: row.asset.symbol,
      pnl: row.pnl as number,
      pnlPct: row.pnlPct as number,
    }))
    .sort((a, b) => b.pnl - a.pnl);

  const topConcentration = allocationData[0]?.percent ?? 0;
  const diversificationScore = Math.round(
    Math.min(
      100,
      assets.length * 15 +
        (100 - topConcentration) * 0.5 +
        (allocationData.length >= 3 ? 20 : 0),
    ),
  );

  const recentAssets = [...assets]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
    .slice(0, 5);

  return {
    rows: rowsWithAllocation,
    totals,
    allocationData,
    performers,
    pnlChartData,
    diversificationScore,
    recentAssets,
    hasLiveData: liveCount > 0,
  };
}
